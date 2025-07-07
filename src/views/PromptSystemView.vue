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
          <li
            v-for="version in versions"
            :key="version.id"
            class="version-item"
          >
            <span class="version-date">{{
              formatVersionName(version.created_at)
            }}</span>
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
          <h3>Version from {{ modalVersionName }}</h3>
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
      versions: [], // This will hold objects: { id, created_at, ... }
      selectedVersionContent: "",
      selectedVersionForModal: null, // Store the whole selected version object
      isLoading: false,
      showVersionModal: false,
    };
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    formatVersionName(isoDateString) {
      if (!isoDateString || typeof isoDateString !== "string") {
        return "Invalid Date";
      }
      try {
        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date value");
        }
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
        console.error("Could not parse date from string:", isoDateString, e);
        return isoDateString;
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

        this.versions = versions.sort((a, b) => {
          const dateA = a.created_at;
          const dateB = b.created_at;

          // Ensure both values are strings before comparing
          if (typeof dateA === "string" && typeof dateB === "string") {
            return dateB.localeCompare(dateA); // Sort descending
          }
          // Fallback for null, undefined, or non-string values
          if (dateB) return 1;
          if (dateA) return -1;
          return 0;
        });
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
    async viewVersion(version) {
      this.isLoading = true;
      try {
        this.selectedVersionContent = await getSpecificPromptVersion(
          version.id
        );
        this.selectedVersionForModal = version;
        this.showVersionModal = true;
      } catch (error) {
        console.error("Error viewing version:", error);
        alert(`Failed to view version: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    },
    async rollbackToVersion(version) {
      if (
        !confirm(
          `Are you sure you want to restore the version from ${this.formatVersionName(
            version.created_at
          )}? The current prompt will be saved as a new version.`
        )
      ) {
        return;
      }
      this.isLoading = true;
      try {
        await rollbackPrompt(version.id);
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
  computed: {
    modalVersionName() {
      if (this.selectedVersionForModal) {
        return this.formatVersionName(this.selectedVersionForModal.created_at);
      }
      return "";
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
