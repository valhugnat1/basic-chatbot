import { createRouter, createWebHistory } from "vue-router";
import ChatView from "../views/ChatView.vue";
import PromptSystemView from "../views/PromptSystemView.vue"; // Import the new view

const routes = [
  {
    path: "/",
    name: "Chat",
    component: ChatView,
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
