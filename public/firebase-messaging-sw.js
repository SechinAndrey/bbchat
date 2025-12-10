importScripts(
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDjULRs4Uf6uLjEIDs2H2Vml-nKC_kh1hw",
  authDomain: "billboards-chat-notification.firebaseapp.com",
  projectId: "billboards-chat-notification",
  storageBucket: "billboards-chat-notification.firebasestorage.app",
  messagingSenderId: "943488006003",
  appId: "1:943488006003:web:0cec1f7e3e6339061bf706",
  appName: "billboards-chat-notification",
  measurementId: "G-WTQDLEBWCE",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("----- FCM onBackgroundMessage ------");
  console.log(payload);
  console.log("------------------------------------");

  const entityTypeMap = {
    lead: "Лід: ",
    client: "Клієнт: ",
    supplier: "Постачальник: ",
  };

  const notificationTitle =
    entityTypeMap[payload.data?.contragent_type] + payload.data?.entity_title ||
    "Невідомий";
  const notificationOptions = {
    body: payload.data?.entity_name || "Нове повідомлення",
    data: payload.data,
    tag: payload.data?.contragent_contact_id || "default",
    icon: "/vectors/logo.svg",
    requireInteraction: false,
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data;

  let targetUrl = null;

  if (
    data?.contragent_type &&
    data?.contragent_id &&
    data?.contragent_contact_id
  ) {
    const contragentTypeMap = {
      supplier: "suppliers",
      client: "clients",
      lead: "leads",
    };

    const entityType =
      contragentTypeMap[data.contragent_type] || data.contragent_type;
    targetUrl = `${self.location.origin}/chat/${entityType}/${data.contragent_id}/contact/${data.contragent_contact_id}/`;
  }

  if (!targetUrl) {
    console.warn("[SW] No valid URL found in notification data");
    targetUrl = self.location.origin;
  }

  // Open or focus window with the target URL
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Try to find existing window with same origin
        for (const client of clientList) {
          if (
            client.url.startsWith(self.location.origin) &&
            "focus" in client
          ) {
            return client.focus().then(() => {
              // Post message to client to navigate
              client.postMessage({
                type: "NOTIFICATION_CLICK",
                url: targetUrl,
              });
              return client;
            });
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
