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
          v-for="(item, index) in processedFeedback"
          :key="index"
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
              <pre><code>{{ item.userPrompt }}</code></pre>
            </div>
            <div class="message-context">
              <label>[Assistant Response (Rated)]</label>
              <pre><code>{{ item.assistantResponse }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from "../components/AppHeader.vue";
import { getAllFeedback } from "../services/promptApi";

export default {
  name: "FeedbackView",
  components: { AppHeader },
  data() {
    return {
      processedFeedback: [],
      isLoading: false,
      error: null,
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
            };
          } catch (e) {
            console.warn("Could not process a feedback entry:", e, feedback);
            return null; // This entry will be filtered out later
          }
        })
        .filter((item) => item !== null); // Remove any entries that failed to parse
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
</style>
