<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="$emit('close')">&times;</button>
      <h3>Full Conversation History</h3>
      <div class="messages-container markdown-body">
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
            <div
              class="text-content"
              v-html="renderMarkdown(message.content)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // A good default theme for dark mode

export default {
  name: "FullConversationModal",
  props: {
    messages: {
      type: Array,
      required: true,
    },
  },
  emits: ["close"],
  methods: {
    renderMarkdown(content) {
      const rawMarkup = marked(content, {
        highlight: (code, lang) => {
          const language = hljs.getLanguage(lang) ? lang : "plaintext";
          return hljs.highlight(code, { language }).value;
        },
        gfm: true,
        breaks: true,
      });
      return DOMPurify.sanitize(rawMarkup);
    },
  },
};
</script>

<style scoped>
/* Reusing styles from ConversationModal and ChatView for consistency */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
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
  height: 85vh;
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
  line-height: 1;
}
.close-button:hover {
  color: white;
}
h3 {
  margin-top: 0;
}
.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 1rem;
  background-color: #343541;
  padding: 10px;
  border-radius: 8px;
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
  line-height: 1.6;
  padding-top: 2px;
  word-wrap: break-word;
}

/* Markdown styles, you can also import a global CSS file if you have one */
::v-deep(pre) {
  background-color: #202123;
  padding: 1rem;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
::v-deep(code) {
  font-family: "Courier New", Courier, monospace;
}
</style>
