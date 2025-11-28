import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from "vue-router";
import { authService } from "@src/features/auth/services/auth-service";
import AppLayout from "@src/layouts/AppLayout.vue";
import AccessView from "@src/pages/access/AccessView.vue";
import PasswordResetView from "@src/pages/password-reset/PasswordResetView.vue";
import UIKitView from "@src/pages/ui-kit/UIKitView.vue";
import Chat from "@src/features/chat/components/Chat.vue";
import ProfileSettings from "@src/pages/settings/Profile.vue";
import MessagesTemplates from "@src/pages/settings/MessagesTemplates.vue";

import Widget from "@src/pages/widget/index.vue";

const routes = [
  {
    path: "/chat/",
    name: "Home",
    alias: "/",
    component: AppLayout,
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
  {
    path: "/settings",
    name: "Settings",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "profile",
        name: "SettingsProfile",
        component: ProfileSettings,
        meta: { requiresAuth: true },
      },
      {
        path: "messages-templates",
        name: "SettingsMessagesTemplates",
        component: MessagesTemplates,
        meta: { requiresAuth: true },
      },
    ],
  },

  // Iframe routes
  {
    path: "/widget/",
    name: "Widget",
    component: Widget,
    meta: { requiresAuth: true, widget: true },

    children: [
      {
        path: "/widget/:entity/:id",
        name: "Widget-EntityChat",
        component: Chat,
        meta: { requiresAuth: true, widget: true },
        props: (route: RouteLocationNormalized) => ({
          entity: route.params.entity,
          id: Number(route.params.id),
        }),
      },
      {
        path: "/widget/:entity/:id/contact/:contactId",
        name: "Widget-Chat",
        component: Chat,
        meta: { requiresAuth: true, widget: true },
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
  const isWidgetPage = to.matched.some((record) => record.meta.widget);
  const isAuthenticated = authService.isAuthenticated();

  if (requiresAuth && !isAuthenticated) {
    if (isWidgetPage) {
      next({ path: "/access/widget-auth", query: { redirect: to.fullPath } });
    } else {
      next({ path: "/access/sign-in/", query: { redirect: to.fullPath } });
    }
  } else {
    const entity = to.params.entity as string | undefined;

    if (authService.getRoleId() === 7 && entity && entity !== "leads") {
      next({ path: "/chat/leads" });
    } else {
      next();
    }
  }
});

export default router;
