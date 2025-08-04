<template>
  <div class="conversations-container">
    <AppHeader :is-streaming-enabled="false" />
    <main class="content-area">
      <h1 class="page-title">Conversation History</h1>

      <div v-if="isLoading" class="loading-indicator">Loading...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>

      <div v-else class="table-card">
        <table class="conversations-table">
          <thead>
            <tr>
              <th>Started At</th>
              <th>User ID</th>
              <th>First Message</th>
              <th>Msg Count</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="convo in conversations"
              :key="convo.id"
              @click="viewConversation(convo.id)"
            >
              <td>{{ formatTimestamp(convo.started_at) }}</td>
              <td>{{ convo.anonymous_id }}</td>
              <td class="first-message">{{ convo.first_message_content }}</td>
              <td>{{ convo.message_count }}</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination-controls">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="btn btn-secondary"
          >
            Previous
          </button>
          <span>Page {{ currentPage }}</span>
          <button
            @click="nextPage"
            :disabled="!hasMorePages"
            class="btn btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </main>

    <ConversationModal
      v-if="selectedConversationId"
      :conversation-id="selectedConversationId"
      @close="closeModal"
    />
  </div>
</template>

<script>
import AppHeader from "../components/AppHeader.vue";
import ConversationModal from "../components/ConversationModal.vue";
import { getAllConversations } from "../services/promptApi";

export default {
  name: "ConversationsView",
  components: {
    AppHeader,
    ConversationModal,
  },
  data() {
    return {
      conversations: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      limit: 100,
      selectedConversationId: null,
    };
  },
  computed: {
    hasMorePages() {
      // The API doesn't give a total count, so we infer.
      // If we got back a full page of results, assume there might be more.
      return this.conversations.length === this.limit;
    },
  },
  created() {
    this.fetchConversations();
  },
  methods: {
    async fetchConversations() {
      this.isLoading = true;
      this.error = null;
      try {
        const skip = (this.currentPage - 1) * this.limit;
        this.conversations = await getAllConversations(this.limit, skip);
      } catch (e) {
        this.error = e.message;
        console.error("Failed to fetch conversations:", e);
      } finally {
        this.isLoading = false;
      }
    },
    formatTimestamp(isoDate) {
      if (!isoDate) return "N/A";
      return new Date(isoDate).toLocaleString();
    },
    nextPage() {
      if (this.hasMorePages) {
        this.currentPage++;
        this.fetchConversations();
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchConversations();
      }
    },
    viewConversation(id) {
      this.selectedConversationId = id;
    },
    closeModal() {
      this.selectedConversationId = null;
    },
  },
};
</script>

<style scoped>
/* Using styles from PromptSystemView for consistency */
.conversations-container {
  background-color: #343541;
  min-height: 100vh;
  color: #ececf1;
}
.content-area {
  padding: 100px 40px 40px;
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  margin-bottom: 2rem;
  border-bottom: 1px solid #4a4a54;
  padding-bottom: 1rem;
}
.table-card {
  background-color: #444654;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #5a5a64;
}
.conversations-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.conversations-table th,
.conversations-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #5a5a64;
}
.conversations-table thead th {
  background-color: #40414f;
  font-weight: bold;
}
.conversations-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}
.conversations-table tbody tr:hover {
  background-color: #5a5a64;
}
.conversations-table tbody tr:last-child td {
  border-bottom: none;
}
.first-message {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Pagination and helpers */
.pagination-controls {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
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
.loading-indicator,
.error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  background-color: #444654;
  border-radius: 12px;
}
.error-message {
  color: #d9534f;
}
</style>
