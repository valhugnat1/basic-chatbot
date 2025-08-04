import { createRouter, createWebHistory } from "vue-router";
import ChatView from "../views/ChatView.vue";
import PromptSystemView from "../views/PromptSystemView.vue";
// Import the new view
import ConversationsView from "../views/ConversationsView.vue";

const routes = [
  {
    path: "/",
    name: "Chat",
    component: ChatView,
  },
  {
    path: "/history",
    name: "Conversations",
    component: ConversationsView,
  },
  {
    path: "/prompts",
    name: "PromptSystem",
    component: PromptSystemView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
