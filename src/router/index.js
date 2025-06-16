import { createRouter, createWebHistory } from "vue-router";
import ChatView from "../views/ChatView.vue";

const routes = [
  {
    path: "/",
    name: "Chat",
    component: ChatView,
  },
  // {
  //   path: '/config',
  //   name: 'Config',
  //   // This is a placeholder for your future prompt configuration page
  //   component: () => import('../views/PromptConfigView.vue')
  // }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
