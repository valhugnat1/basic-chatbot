<template>
  <div class="chat-wrapper">
    <AppHeader
      :is-streaming-enabled="isStreamingEnabled"
      @new-conversation="resetConversation"
      @stream-toggle="handleStreamToggle"
    />
    <div class="messages-container" ref="messagesContainer">
      <!-- ... (message rendering remains the same) ... -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message-row', `message-${message.role}`]"
      >
        <div class="message-content">
          <div
            class="avatar"
            :style="{
              backgroundColor: message.role === 'user' ? '#19C37D' : '#7A5AF8',
            }"
          >
            {{ message.role === "user" ? "U" : "AI" }}
          </div>
          <div
            class="text-content markdown-body"
            v-html="renderMarkdown(message.content)"
          ></div>
        </div>
      </div>
    </div>
    <div class="input-area">
      <!-- ... (input area remains the same) ... -->
      <div class="input-wrapper">
        <textarea
          ref="input"
          v-model="newMessage"
          @keydown.enter.prevent="handleEnter"
          placeholder="Ask me anything..."
          class="chat-input"
        ></textarea>
        <button @click="sendMessage" class="send-button" :disabled="isSending">
          <svg
            v-if="!isSending"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
          <div v-else class="typing-indicator"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getChatStream, getChatCompletion, resetToken } from "../services/api";
import { marked } from "marked";
import AppHeader from "../components/AppHeader.vue"; // Import the new header

export default {
  components: {
    AppHeader, // Register the header component
  },
  data() {
    return {
      messages: [],
      newMessage: "",
      isSending: false,
      isStreamingEnabled: true,
    };
  },
  methods: {
    renderMarkdown(content) {
      return marked(content, { sanitize: true });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    async sendMessage() {
      if (!this.newMessage.trim() || this.isSending) return;

      this.isSending = true;
      const userMessage = { role: "user", content: this.newMessage };
      this.messages.push(userMessage);
      this.newMessage = "";
      this.scrollToBottom();

      this.messages.push({ role: "assistant", content: "" });

      const apiMessages = this.messages
        .slice(0, -1)
        .map(({ role, content }) => ({ role, content }));

      try {
        if (this.isStreamingEnabled) {
          await getChatStream(apiMessages, ({ done, data }) => {
            if (done) {
              this.isSending = false;
              return;
            }
            const delta = data?.choices?.[0]?.delta?.content;
            if (delta) {
              let lastMessage = this.messages[this.messages.length - 1];
              lastMessage.content += delta;
              this.scrollToBottom();
            }
          });
        } else {
          const response = await getChatCompletion(apiMessages);
          const messageContent = response.choices[0].message.content;
          let lastMessage = this.messages[this.messages.length - 1];
          lastMessage.content = messageContent;
          this.scrollToBottom();
          this.isSending = false;
        }
      } catch (error) {
        let lastMessage = this.messages[this.messages.length - 1];
        lastMessage.content += "\n\n*(Sorry, a critical error occurred.)*";
        this.isSending = false;
      }
    },
    handleEnter(event) {
      if (!event.shiftKey) {
        this.sendMessage();
      }
    },
    resetConversation() {
      this.messages = [];
      resetToken();
    },
    handleStreamToggle(newValue) {
      this.isStreamingEnabled = newValue;
    },
  },
  mounted() {
    this.resetConversation();
  },
};
</script>

<style scoped>
/* Remove the old header styles */

.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #343541;
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 80px 0 120px; /* Adjust top padding for the fixed header */
}

/* ... all other styles remain the same ... */

.message-row {
  display: flex;
  justify-content: center;
  padding: 20px 10px;
}

.message-row.message-assistant {
  background-color: #444654;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.message-content {
  display: flex;
  max-width: 800px;
  width: 100%;
  font-size: 1rem;
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
  padding-top: 2px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 0;
  background: linear-gradient(180deg, rgba(52, 53, 65, 0), #343541 58.85%);
}

.input-wrapper {
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.chat-input {
  width: 100%;
  min-height: 24px;
  max-height: 200px;
  padding: 12px 50px 12px 15px;
  border-radius: 12px;
  background-color: #40414f;
  color: #ececf1;
  border: 1px solid #5a5a64;
  font-size: 1rem;
  resize: none;
  box-sizing: border-box;
  line-height: 1.5;
}
.chat-input:focus {
  outline: none;
  border-color: #8a8a94;
}

.send-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  background-color: #19c37d;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.send-button:disabled {
  background-color: #4a4a54;
  cursor: not-allowed;
}
.send-button svg {
  fill: #ffffff;
}

.typing-indicator {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
