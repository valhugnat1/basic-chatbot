<template>
  <div class="feedback-container">
    <AppHeader :is-streaming-enabled="false" />
    <main class="content-area">
      <h1 class="page-title">User Feedback Analysis</h1>

      <div v-if="isLoading" class="status-indicator">
        <div class="typing-indicator"></div>
        <span>Fetching and analyzing feedback...</span>
      </div>
      <div v-else-if="error" class="status-indicator error-message">
        <p><strong>Error:</strong> {{ error }}</p>
        <p>Please check your API key and network connection.</p>
      </div>

      <div v-else class="feedback-list">
        <div
          v-for="item in processedFeedback"
          :key="item.id"
          class="feedback-card"
        >
          <div class="card-header">
            <h2 class="conversation-title">{{ item.title }}</h2>
            <span class="feedback-date">{{ item.date }}</span>
          </div>

          <div class="rating-section">
            <span
              :class="[
                'rating',
                item.rating > 0 ? 'rating-good' : 'rating-bad',
              ]"
            >
              Rating: {{ item.rating }}
            </span>
            <span v-if="item.comment" class="comment">
              <strong>Comment:</strong> {{ item.comment }}
            </span>
            <span v-else class="comment-none"> No comment provided. </span>
          </div>

          <div class="context-section">
            <h3>Conversation Context</h3>

            <div class="message-context">
              <label>[User Prompt]</label>
              <pre
                :class="{ truncated: !item.isUserPromptExpanded }"
              ><code>{{ item.userPrompt }}</code></pre>
              <div
                v-if="isTruncatable(item.userPrompt)"
                class="toggle-view-container"
              >
                <button
                  v-if="!item.isUserPromptExpanded"
                  class="btn-toggle"
                  @click="item.isUserPromptExpanded = true"
                >
                  See more
                </button>
                <button
                  v-else
                  class="btn-toggle"
                  @click="item.isUserPromptExpanded = false"
                >
                  Hide message
                </button>
              </div>
            </div>

            <div class="message-context">
              <label>[Assistant Response (Rated)]</label>
              <pre
                :class="{ truncated: !item.isAssistantResponseExpanded }"
              ><code>{{ item.assistantResponse }}</code></pre>
              <div
                v-if="isTruncatable(item.assistantResponse)"
                class="toggle-view-container"
              >
                <button
                  v-if="!item.isAssistantResponseExpanded"
                  class="btn-toggle"
                  @click="item.isAssistantResponseExpanded = true"
                >
                  See more
                </button>
                <button
                  v-else
                  class="btn-toggle"
                  @click="item.isAssistantResponseExpanded = false"
                >
                  Hide message
                </button>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button
              class="btn btn-secondary"
              @click="viewFullConversation(item.raw)"
            >
              View Full Conversation
            </button>
          </div>
        </div>
      </div>
    </main>

    <FullConversationModal
      v-if="selectedConversationMessages"
      :messages="selectedConversationMessages"
      @close="closeConversationModal"
    />
  </div>
</template>

<script>
// The <script> section from the previous answer remains exactly the same.
// No changes are needed there.
import AppHeader from "../components/AppHeader.vue";
import FullConversationModal from "../components/FullConversationModal.vue";
import { getAllFeedback } from "../services/promptApi";

export default {
  // ... (all script content is identical to the previous step)
  name: "FeedbackView",
  components: {
    AppHeader,
    FullConversationModal,
  },
  data() {
    return {
      processedFeedback: [],
      isLoading: false,
      error: null,
      selectedConversationMessages: null,
    };
  },
  async created() {
    await this.fetchAndProcessFeedback();
  },
  methods: {
    async fetchAndProcessFeedback() {
      this.isLoading = true;
      this.error = null;
      try {
        const rawData = await getAllFeedback();
        this.processedFeedback = this.parseFeedbackData(rawData);
      } catch (e) {
        this.error = e.message;
        console.error("Error fetching or processing feedback:", e);
      } finally {
        this.isLoading = false;
      }
    },
    parseFeedbackData(rawData) {
      if (!Array.isArray(rawData)) {
        console.error("Expected an array of feedback, but received:", rawData);
        this.error = "Received invalid data format from the server.";
        return [];
      }
      return rawData
        .map((feedback) => {
          try {
            const messagesHistory =
              feedback.snapshot?.chat?.chat?.history?.messages || {};
            const ratedMessageId = feedback.meta?.message_id;
            const ratedMessage = messagesHistory[ratedMessageId] || {};
            const parentId = ratedMessage.parentId;
            const previousMessage = messagesHistory[parentId] || {};

            return {
              id: feedback.id,
              title: feedback.snapshot?.chat?.title || "N/A",
              date: new Date(feedback.created_at * 1000).toLocaleString(
                "fr-FR"
              ),
              rating: feedback.data?.rating ?? "N/A",
              comment: feedback.data?.comment || null,
              userPrompt:
                previousMessage.content || "Previous message not found.",
              assistantResponse:
                ratedMessage.content || "Rated message content not available.",
              raw: feedback,
              isUserPromptExpanded: false,
              isAssistantResponseExpanded: false,
            };
          } catch (e) {
            console.warn("Could not process a feedback entry:", e, feedback);
            return null;
          }
        })
        .filter((item) => item !== null);
    },
    reconstructConversation(messagesObject) {
      if (!messagesObject || Object.keys(messagesObject).length === 0) {
        return [];
      }
      const messagesMap = new Map(Object.entries(messagesObject));
      let rootMessage = null;

      for (const message of messagesMap.values()) {
        if (message.parentId === null) {
          rootMessage = message;
          break;
        }
      }

      if (!rootMessage)
        return Object.values(messagesObject).sort(
          (a, b) => a.timestamp - b.timestamp
        );

      const conversation = [];
      let currentMessage = rootMessage;

      while (currentMessage) {
        conversation.push(currentMessage);
        const childId = currentMessage.childrenIds?.[0];
        currentMessage = childId ? messagesMap.get(childId) : null;
      }

      return conversation;
    },
    viewFullConversation(rawFeedbackItem) {
      const messagesObject =
        rawFeedbackItem.snapshot?.chat?.chat?.history?.messages;
      this.selectedConversationMessages =
        this.reconstructConversation(messagesObject);
    },
    closeConversationModal() {
      this.selectedConversationMessages = null;
    },
    isTruncatable(text) {
      if (!text) return false;
      return text.split("\n").length > 3;
    },
  },
};
</script>

<style scoped>
.feedback-container {
  background-color: #343541;
  min-height: 100vh;
  color: #ececf1;
}
.content-area {
  padding: 100px 40px 40px;
  max-width: 900px;
  margin: 0 auto;
}
.page-title {
  margin-bottom: 2rem;
  border-bottom: 1px solid #4a4a54;
  padding-bottom: 1rem;
}
.status-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 40px;
  background-color: #444654;
  border-radius: 12px;
  font-size: 1.2rem;
}
.error-message {
  color: #d9534f;
  text-align: center;
}
.typing-indicator {
  width: 24px;
  height: 24px;
  border: 3px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.feedback-card {
  background-color: #444654;
  border: 1px solid #5a5a64;
  border-radius: 12px;
  padding: 1.5rem;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid #5a5a64;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.conversation-title {
  margin: 0;
  font-size: 1.25rem;
}
.feedback-date {
  font-size: 0.9rem;
  color: #a9a9a9;
}
.rating-section {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.rating {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  align-self: flex-start;
}
.rating-good {
  background-color: #19c37d;
  color: #fff;
}
.rating-bad {
  background-color: #d9534f;
  color: #fff;
}
.comment {
  font-style: italic;
  color: #dcdcdc;
}
.comment-none {
  font-style: italic;
  color: #888;
}
.context-section h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #a9a9a9;
}
.message-context {
  margin-bottom: 1rem;
}
.message-context label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
  color: #dcdcdc;
}
.message-context pre {
  background-color: #202123;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #3a3a44;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #f1f1f1;
}
.message-context pre code {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.95rem;
}

.card-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #5a5a64;
  text-align: right;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s;
}
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.btn-secondary {
  background-color: #5a5a64;
  color: white;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #6a6a74;
}

.truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* NEW: Container for the "See more" buttons */
.toggle-view-container {
  text-align: right;
  margin-top: -10px; /* Adjust to pull the button closer to the text block */
  margin-bottom: 10px;
}

/* NEW: Style for the small toggle button */
.btn-toggle {
  background: none;
  border: none;
  color: #19c37d; /* A nice highlight color from your theme */
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  padding: 4px;
}

.btn-toggle:hover {
  text-decoration: underline;
}
</style>
