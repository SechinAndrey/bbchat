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

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  if (
    !payload?.data ||
    !payload?.data?.event ||
    payload?.data?.from_manager === "true"
  )
    return;

  const entety2Text = {
    lead: "Лід -",
    client: "Клієнт -",
    supplier: "Постачальник -",
  };

  let entetyText;
  entetyText = entety2Text[payload.data?.contragent_type] || "";

  const notificationTitle = entetyText + " " + payload.data?.entity_title;
  const notificationBody = payload.data?.entity_name || "Нове повідомлення";

  const notificationOptions = {
    icon: "/vectors/logo.svg",
    body: notificationBody,
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
