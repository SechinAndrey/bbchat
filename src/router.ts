import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from "vue-router";
import { authService } from "@src/features/auth/services/auth-service";
import AccessView from "@src/pages/access/AccessView.vue";
import HomeView from "@src/pages/home/HomeView.vue";
import PasswordResetView from "@src/pages/password-reset/PasswordResetView.vue";
import UIKitView from "@src/pages/ui-kit/UIKitView.vue";
import Chat from "@src/features/chat/components/Chat.vue";

const routes = [
  {
    path: "/chat/",
    name: "Home",
    alias: "/",
    component: HomeView,
    meta: { requiresAuth: true },
    children: [
      {
        path: "/chat/",
        alias: "/",
        name: "No-Chat",
        component: Chat,
        meta: { requiresAuth: true },
      },
      {
        path: "/chat/:entity/:id/",
        name: "Chat",
        component: Chat,
        meta: { requiresAuth: true },
        props: (route: RouteLocationNormalized) => ({
          entity: route.params.entity,
          id: Number(route.params.id),
        }),
      },
    ],
  },
  {
    path: "/access/:method/",
    name: "Access",
    component: AccessView,
  },
  {
    path: "/reset/",
    name: "Password Reset",
    component: PasswordResetView,
  },
  {
    path: "/ui-kit/",
    name: "UI Kit",
    component: UIKitView,
  },
];

// create the router
const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !authService.isAuthenticated()) {
    next({ path: "/access/sign-in/", query: { redirect: to.fullPath } });
  } else {
    if (
      from.name === "Chat" &&
      to.name === "Chat" &&
      window.innerWidth <= 967
    ) {
      next({ name: "No-Chat" });
    } else {
      next();
    }
  }
});

export default router;
