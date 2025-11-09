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

// That's it! FCM handles everything when notification + webpush.fcm_options.link is set
// No need for custom notification show or click handlers
