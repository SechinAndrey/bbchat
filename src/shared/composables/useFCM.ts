import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";
import { ref, computed, onScopeDispose } from "vue";
import type { FCMEventMap } from "@src/shared/types/fcm-events";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useDocumentVisibility, useWindowFocus } from "@vueuse/core";

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
      const newToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (newToken) {
        token.value = newToken;
        authStore.fcmToken = newToken;
      }
      return newToken;
    } catch (err) {
      console.error("FCM token error:", err);
      return null;
    }
  };

  const initMessageListener = () => {
    if (messageUnsubscribe) return;

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "NEW_MESSAGE") {
        console.log(event);
      }
    });

    messageUnsubscribe = onMessage(messaging, (payload) => {
      const event = payload.data?.event as keyof FCMEventMap;
      if (!event || !payload.data || payload.data?.from_manager === "true")
        return;

      console.log("isPageTrulyVisible - onMessage");

      eventHandlers.get(event)?.forEach((handler) => {
        try {
          handler(payload.data as FCMEventMap[typeof event]);
        } catch (err) {
          console.error(`FCM event "${event}" error:`, err);
        }
      });

      if (!isPageTrulyVisible.value) {
        console.log("push - onMessage");
        const entety2Text = {
          lead: "Лід -",
          client: "Клієнт -",
          supplier: "Постачальник -",
        };

        let entetyText;

        if (payload.data.contragent_type in entety2Text) {
          entetyText =
            entety2Text[
              payload.data.contragent_type as keyof typeof entety2Text
            ];
        } else {
          entetyText = "";
        }

        const notificationTitle = `${entetyText} #${payload.data?.entity_title}`;
        const notificationOptions = {
          icon: "/vectors/logo.svg",
          body: payload.data?.entity_name || "Нове повідомлення",
        };

        if ("Notification" in window && Notification.permission === "granted") {
          const n = new Notification(notificationTitle, notificationOptions);

          setTimeout(() => n.close(), 5000);
        } else {
          Notification.requestPermission();
        }
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

  return {
    token,
    ensureToken,
    on,
    off,
  };
}
