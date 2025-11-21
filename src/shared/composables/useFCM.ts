import { initializeApp } from "firebase/app";
import {
  getMessaging,
  onMessage,
  getToken,
  deleteToken,
} from "firebase/messaging";
import { ref, computed, onScopeDispose } from "vue";
import type { FCMEventMap } from "@src/shared/types/fcm-events";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useDocumentVisibility, useWindowFocus } from "@vueuse/core";
import { useEventBus } from "@vueuse/core";
import router from "@src/router";

const logoutEvent = useEventBus("auth:logout");

const firebaseConfig = {
  apiKey: "AIzaSyDjULRs4Uf6uLjEIDs2H2Vml-nKC_kh1hw",
  authDomain: "billboards-chat-notification.firebaseapp.com",
  projectId: "billboards-chat-notification",
  storageBucket: "billboards-chat-notification.firebasestorage.app",
  messagingSenderId: "943488006003",
  appId: "1:943488006003:web:0cec1f7e3e6339061bf706",
  appName: "billboards-chat-notification",
  measurementId: "G-WTQDLEBWCE",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const VAPID_KEY =
  "BEYolQQFgZGFc1tqJxfVT8Eu0Ytp9Ff6vvS-efe74SPwCYm47ikE2Knap84nR1qm6Wn67CWfUsB3_yzcfkizfFg";

type EventHandler<E extends keyof FCMEventMap = keyof FCMEventMap> = (
  payload: FCMEventMap[E],
) => void;
const eventHandlers = new Map<keyof FCMEventMap, Set<EventHandler>>();
let messageUnsubscribe: (() => void) | null = null;

export function useFCM() {
  const authStore = useAuthStore();
  const documentVisibility = useDocumentVisibility();
  const windowFocused = useWindowFocus();

  const token = ref<string | null>(authStore.fcmToken);

  const isPageTrulyVisible = computed(() => {
    return documentVisibility.value === "visible" && windowFocused.value;
  });

  const ensureToken = async () => {
    if (token.value) return token.value;

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.log("FCM: Notification permission not granted");
        return null;
      }

      const newToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (newToken) {
        token.value = newToken;
        authStore.fcmToken = newToken;
      }
      return newToken;
    } catch (err) {
      const error = err as { code?: string };
      if (error.code !== "messaging/permission-blocked") {
        console.error("FCM token error:", err);
      }
      return null;
    }
  };

  const clearToken = async () => {
    if (!token.value) return;

    try {
      await deleteToken(messaging);
      token.value = null;
      authStore.fcmToken = "";
      console.log("✅ [FCM] Token cleared");
    } catch (err) {
      console.error("❌ [FCM] Delete token error:", err);
    }
  };

  const initMessageListener = () => {
    if (messageUnsubscribe) return;

    // Listen for navigation messages from Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("📨 [FCM] Service Worker message:", event.data);

        if (event.data?.type === "NOTIFICATION_CLICK" && event.data?.url) {
          const url = new URL(event.data.url);
          const path = url.pathname + url.search + url.hash;

          console.log("🔔 [FCM] Navigating to:", path);

          router.push(path).catch((err) => {
            console.error("❌ [FCM] Navigation error:", err);
          });
        }
      });
    }

    messageUnsubscribe = onMessage(messaging, (payload) => {
      console.log("📩 [FCM] Foreground message received:", payload);

      const event = payload.data?.event as keyof FCMEventMap;
      if (!event || !payload.data) {
        console.warn("⚠️ [FCM] No event or data in payload");
        return;
      }

      if (payload.data?.from_manager === "true") {
        console.log("🔕 [FCM] Message from manager, skipping");
        return;
      }

      console.log("🔔 [FCM] Processing event:", event);

      // Parse FCM data payload (all values are strings from Firebase)
      const parsedData = {
        ...payload.data,
        user_id: Number(payload.data.user_id),
      } as unknown as FCMEventMap[typeof event];

      // Fire event handlers for data processing
      eventHandlers.get(event)?.forEach((handler) => {
        try {
          handler(parsedData);
        } catch (err) {
          console.error(`❌ [FCM] Event "${event}" error:`, err);
        }
      });

      // Show notification only if page is not truly visible (tab open but window inactive)
      if (!isPageTrulyVisible.value && documentVisibility.value === "visible") {
        console.log("🔔 [FCM] Showing notification (window inactive)");

        const entityTypeMap = {
          lead: "Лід: ",
          client: "Клієнт: ",
          supplier: "Постачальник: ",
        };

        const entityType =
          entityTypeMap[
            payload.data.contragent_type as keyof typeof entityTypeMap
          ] || "";
        const notificationTitle = entityType
          ? `${entityType}: #${payload.data?.entity_title || "Невідомий"}`
          : `#${payload.data?.entity_title || "Невідомий"}`;

        const notificationOptions = {
          body: payload.data?.entity_name || "Нове повідомлення",
          data: payload.data,
          tag: payload.data?.contragent_contact_id || "default",
          icon: "/vectors/logo.svg",
          requireInteraction: false,
        };

        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification(
            notificationTitle,
            notificationOptions,
          );

          notification.onclick = () => {
            window.focus();
            notification.close();

            if (!payload.data) return;

            const contragentTypeMap = {
              supplier: "suppliers",
              client: "clients",
              lead: "leads",
            };

            const entityPath =
              contragentTypeMap[
                payload.data.contragent_type as keyof typeof contragentTypeMap
              ] || payload.data.contragent_type;
            const path = `/chat/${entityPath}/${payload.data.contragent_id}/contact/${payload.data.contragent_contact_id}/`;

            console.log("🔔 [FCM] Notification clicked, navigating to:", path);

            router.push(path).catch((err) => {
              console.error("❌ [FCM] Navigation error:", err);
            });
          };

          setTimeout(() => notification.close(), 5000);
        }
      } else if (isPageTrulyVisible.value) {
        console.log("🔕 [FCM] Page is visible and focused, no notification");
      } else {
        console.log(
          "🔕 [FCM] Page not visible, Service Worker should handle notification",
        );
      }
    });
  };

  const on = <E extends keyof FCMEventMap>(
    event: E,
    handler: (payload: FCMEventMap[E]) => void,
  ) => {
    if (!eventHandlers.has(event)) {
      eventHandlers.set(event, new Set());
    }
    eventHandlers.get(event)!.add(handler);

    initMessageListener();

    onScopeDispose(() => off(event, handler));
  };

  const off = <E extends keyof FCMEventMap>(
    event: E,
    handler?: (payload: FCMEventMap[E]) => void,
  ) => {
    const handlers = eventHandlers.get(event);
    if (!handlers) return;

    if (handler) {
      handlers.delete(handler);
      if (handlers.size === 0) eventHandlers.delete(event);
    } else {
      eventHandlers.delete(event);
    }
  };

  ensureToken();
  initMessageListener();

  logoutEvent.on(() => {
    clearToken();
  });

  return {
    token,
    ensureToken,
    clearToken,
    on,
    off,
  };
}
