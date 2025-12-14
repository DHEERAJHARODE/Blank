importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA8TAY2N6YNmFhKWwNA67B35V00oyXAIjE",
  authDomain: "rental-room-app-445c9.firebaseapp.com",
  projectId: "rental-room-app-445c9",
  storageBucket: "rental-room-app-445c9.firebasestorage.app",
  messagingSenderId: "105181345328",
  appId: "105181345328:web:327f6159f3e2cc667f9ff5",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("🔥 Background Notification:", payload);

  self.registration.showNotification(
    payload.notification?.title || "New Notification",
    {
      body: payload.notification?.body || "",
      icon: "/vite.svg",
    }
  );
});
