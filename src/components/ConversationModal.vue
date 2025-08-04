<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="$emit('close')">&times;</button>
      <h3>Conversation Details</h3>
      <div v-if="isLoading" class="loading-indicator">Loading messages...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else class="messages-container">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message-row', `message-${message.role}`]"
        >
          <div class="message-body">
            <div
              class="avatar"
              :style="{
                backgroundColor:
                  message.role === 'user' ? '#19C37D' : '#7A5AF8',
              }"
            >
              {{ message.role === "user" ? "U" : "AI" }}
            </div>
            <div class="text-content">{{ message.content }}</div>
          </div>
          <div class="message-timestamp">
            {{ formatTimestamp(message.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getConversationMessages } from "../services/promptApi";

export default {
  name: "ConversationModal",
  props: {
    conversationId: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  data() {
    return {
      messages: [],
      isLoading: false,
      error: null,
    };
  },
  watch: {
    conversationId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchMessages();
        }
      },
    },
  },
  methods: {
    async fetchMessages() {
      this.isLoading = true;
      this.error = null;
      this.messages = [];
      try {
        this.messages = await getConversationMessages(this.conversationId);
      } catch (e) {
        this.error = e.message;
        console.error("Failed to fetch messages:", e);
      } finally {
        this.isLoading = false;
      }
    },
    formatTimestamp(isoDate) {
      if (!isoDate) return "";
      return new Date(isoDate).toLocaleString();
    },
  },
};
</script>

<style scoped>
/* Modal styles copied & adapted from PromptSystemView */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #444654;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #5a5a64;
  position: relative;
}
.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: #a9a9a9;
  font-size: 2rem;
  cursor: pointer;
}
.close-button:hover {
  color: white;
}

/* Message Display Styles adapted from ChatView */
.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 1rem;
}
.message-row {
  padding: 15px;
  border-bottom: 1px solid #5a5a64;
}
.message-row:last-child {
  border-bottom: none;
}
.message-body {
  display: flex;
  align-items: flex-start;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 20px;
  flex-shrink: 0;
}
.text-content {
  color: #ececf1;
  line-height: 1.5;
  white-space: pre-wrap; /* Preserve whitespace and newlines */
  word-wrap: break-word;
}
.message-timestamp {
  font-size: 0.75rem;
  color: #a9a9a9;
  text-align: right;
  margin-top: 8px;
}
.loading-indicator,
.error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}
.error-message {
  color: #d9534f;
}
</style>
