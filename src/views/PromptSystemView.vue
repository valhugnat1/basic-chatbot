<template>
  <div class="prompt-system-container">
    <AppHeader :is-streaming-enabled="false" @stream-toggle="() => {}" />
    <main class="content-area">
      <h1 class="page-title">System Prompt Management</h1>

      <div class="prompt-card">
        <h2>Current System Prompt</h2>
        <p>
          This is the prompt currently used by the AI. Modify it below and click
          "Save".
        </p>
        <textarea
          v-model="editablePrompt"
          class="prompt-textarea"
          rows="10"
        ></textarea>
        <div class="card-actions">
          <button
            @click="saveCurrentPrompt"
            :disabled="isLoading || editablePrompt === currentPrompt"
            class="btn btn-primary"
          >
            {{ isLoading ? "Saving..." : "Save Prompt" }}
          </button>
        </div>
      </div>

      <div class="prompt-card">
        <h2>Version History</h2>
        <p>
          Review previous versions of the prompt. You can view any version or
          restore it as the main prompt.
        </p>
        <ul v-if="versions.length" class="version-list">
          <li v-for="version in versions" :key="version" class="version-item">
            <span class="version-date">{{ formatVersionName(version) }}</span>
            <div class="version-actions">
              <button @click="viewVersion(version)" class="btn btn-secondary">
                View
              </button>
              <button
                @click="rollbackToVersion(version)"
                class="btn btn-danger"
              >
                Set as Main
              </button>
            </div>
          </li>
        </ul>
        <p v-else>No previous versions found.</p>
      </div>

      <div
        v-if="showVersionModal"
        class="modal-overlay"
        @click="showVersionModal = false"
      >
        <div class="modal-content" @click.stop>
          <h3>Version from {{ formatVersionName(selectedVersionName) }}</h3>
          <textarea
            :value="selectedVersionContent"
            class="prompt-textarea"
            readonly
            rows="15"
          ></textarea>
          <div class="modal-actions">
            <button @click="showVersionModal = false" class="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from "../components/AppHeader.vue";
import {
  getSystemPrompt,
  updateSystemPrompt,
  listPromptVersions,
  getSpecificPromptVersion,
  rollbackPrompt,
} from "../services/promptApi";

export default {
  name: "PromptSystemView",
  components: { AppHeader },
  data() {
    return {
      currentPrompt: "",
      editablePrompt: "",
      versions: [],
      selectedVersionContent: "",
      selectedVersionName: "",
      isLoading: false,
      showVersionModal: false,
    };
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    /**
     * Formats the raw prompt filename into a human-readable date and time.
     * e.g., "prompt_20250616_172421_808652" -> "June 16, 2025, 17:24:21"
     * @param {string} version - The raw version name.
     * @returns {string} A formatted date string.
     */
    formatVersionName(version) {
      if (!version || !version.startsWith("prompt_")) {
        return version; // Return original if format is unexpected
      }
      try {
        const parts = version.split("_");
        const datePart = parts[1]; // "20250616"
        const timePart = parts[2]; // "172421"

        const year = parseInt(datePart.substring(0, 4), 10);
        const month = parseInt(datePart.substring(4, 6), 10) - 1; // Month is 0-indexed in JS
        const day = parseInt(datePart.substring(6, 8), 10);

        const hour = parseInt(timePart.substring(0, 2), 10);
        const minute = parseInt(timePart.substring(2, 4), 10);
        const second = parseInt(timePart.substring(4, 6), 10);

        const date = new Date(year, month, day, hour, minute, second);

        // Format it nicely for an English locale
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      } catch (e) {
        console.error("Could not parse date from version:", version, e);
        return version; // Return original on parsing error
      }
    },
    async fetchData() {
      this.isLoading = true;
      try {
        const [prompt, versions] = await Promise.all([
          getSystemPrompt(),
          listPromptVersions(),
        ]);
        this.currentPrompt = prompt;
        this.editablePrompt = prompt;
        // Sort versions by date, descending (most recent first)
        this.versions = versions.sort((a, b) => b.localeCompare(a));
      } catch (error) {
        console.error("Error fetching initial data:", error);
        alert(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async saveCurrentPrompt() {
      if (this.editablePrompt === this.currentPrompt) return;
      this.isLoading = true;
      try {
        await updateSystemPrompt(this.editablePrompt);
        alert("Prompt updated successfully!");
        await this.fetchData();
      } catch (error) {
        console.error("Error updating prompt:", error);
        alert(`Failed to update prompt: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    },
    async viewVersion(versionName) {
      this.isLoading = true;
      try {
        this.selectedVersionContent = await getSpecificPromptVersion(
          versionName
        );
        this.selectedVersionName = versionName;
        this.showVersionModal = true;
      } catch (error) {
        console.error("Error viewing version:", error);
        alert(`Failed to view version: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    },
    async rollbackToVersion(versionName) {
      if (
        !confirm(
          `Are you sure you want to restore the version from ${this.formatVersionName(
            versionName
          )}? The current prompt will be saved.`
        )
      ) {
        return;
      }
      this.isLoading = true;
      try {
        await rollbackPrompt(versionName);
        alert("Restoration completed successfully!");
        await this.fetchData();
      } catch (error) {
        console.error("Error restoring:", error);
        alert(`Restoration failed: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.prompt-system-container {
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
.prompt-card {
  background-color: #444654;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #5a5a64;
}
.prompt-card h2 {
  margin-top: 0;
}
.prompt-textarea {
  width: 100%;
  box-sizing: border-box;
  background-color: #40414f;
  color: #ececf1;
  border: 1px solid #6a6a74;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
}
.prompt-textarea:focus {
  outline: none;
  border-color: #19c37d;
}
.card-actions {
  margin-top: 1rem;
  text-align: right;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s;
}
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.btn-primary {
  background-color: #19c37d;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background-color: #15a86a;
}
.btn-secondary {
  background-color: #5a5a64;
  color: white;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #6a6a74;
}
.btn-danger {
  background-color: #d9534f;
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background-color: #c9302c;
}
.version-list {
  list-style: none;
  padding: 0;
}
.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #5a5a64;
  gap: 1rem;
}
.version-item:last-child {
  border-bottom: none;
}
.version-date {
  font-family: monospace;
  font-size: 1.1rem;
  color: #a9a9a9;
}
.version-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
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
  max-width: 700px;
  border: 1px solid #5a5a64;
}
.modal-actions {
  text-align: right;
  margin-top: 1rem;
}
</style>
