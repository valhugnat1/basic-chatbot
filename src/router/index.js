import { createRouter, createWebHistory } from "vue-router";
import ChatView from "../views/ChatView.vue";
import PromptSystemView from "../views/PromptSystemView.vue";
import ConversationsView from "../views/ConversationsView.vue";
import FeedbackView from "../views/FeedbackView.vue";

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
  {
    path: "/feedback",
    name: "Feedback",
    component: FeedbackView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
