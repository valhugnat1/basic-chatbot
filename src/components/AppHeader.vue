<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="header-title">Ask AI</h1>
        <nav class="navigation">
          <router-link to="/" class="nav-link">Conversation</router-link>
          <router-link to="/history" class="nav-link">History</router-link>
          <router-link to="/prompts" class="nav-link"
            >Prompt System</router-link
          >
        </nav>
      </div>
      <div class="header-controls">
        <button @click="onNewConversation" class="new-convo-button">
          + New Conversation
        </button>
        <div class="stream-switch">
          <label class="switch">
            <input
              type="checkbox"
              :checked="isStreamingEnabled"
              @change="onStreamToggle"
            />
            <span class="slider round"></span>
          </label>
          <span class="stream-label">Stream</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "AppHeader",
  props: {
    isStreamingEnabled: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["new-conversation", "stream-toggle"],
  methods: {
    onNewConversation() {
      this.$emit("new-conversation");
    },
    onStreamToggle(event) {
      this.$emit("stream-toggle", event.target.checked);
    },
  },
};
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #202123;
  padding: 10px 20px;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.header-title {
  color: white;
  margin: 0;
  font-size: 1.5rem;
}

.navigation {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #a9a9a9;
  text-decoration: none;
  font-size: 1rem;
  padding: 5px 10px;
  border-radius: 6px;
  transition: background-color 0.3s, color 0.3s;
}

.nav-link:hover {
  color: #ffffff;
  background-color: #343541;
}

.nav-link.router-link-exact-active {
  color: #ffffff;
  background-color: #4a4a54;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.new-convo-button {
  background-color: #4a4a54;
  color: white;
  border: 1px solid #6a6a74;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.new-convo-button:hover {
  background-color: #5a5a64;
}

.stream-switch {
  display: flex;
  align-items: center;
  color: white;
}

.stream-label {
  margin-left: 10px;
  font-size: 14px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #19c37d;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
