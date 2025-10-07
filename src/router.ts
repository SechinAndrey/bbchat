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

import Widget from "@src/pages/widget/index.vue";

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
        path: "/chat/:entity",
        name: "EntityChat",
        component: Chat,
        meta: { requiresAuth: true },
        props: (route: RouteLocationNormalized) => ({
          entity: route.params.entity,
        }),
      },
      {
        path: "/chat/:entity/:id/contact/:contactId",
        name: "Chat",
        component: Chat,
        meta: { requiresAuth: true },
        props: (route: RouteLocationNormalized) => ({
          entity: route.params.entity,
          id: Number(route.params.id),
          contactId: Number(route.params.contactId),
        }),
      },
    ],
  },

  // Iframe routes
  {
    path: "/widget/",
    name: "Widget",
    component: Widget,
    meta: { requiresAuth: true },

    children: [
      {
        path: "/widget/:entity/:id",
        name: "Widget-EntityChat",
        component: Chat,
        meta: { requiresAuth: true },
        props: (route: RouteLocationNormalized) => ({
          entity: route.params.entity,
          id: Number(route.params.id),
        }),
      },
      {
        path: "/widget/:entity/:id/contact/:contactId",
        name: "Widget-Chat",
        component: Chat,
        meta: { requiresAuth: true },
        props: (route: RouteLocationNormalized) => ({
          entity: route.params.entity,
          id: Number(route.params.id),
          contactId: Number(route.params.contactId),
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
