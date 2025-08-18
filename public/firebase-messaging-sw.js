/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
apiKey: "AIzaSyAfrfjMI-nZgsFls7TpDaYWeAdKeX4mVck",
  authDomain: "gauabhayaranyam.firebaseapp.com",
  projectId: "gauabhayaranyam",
  storageBucket: "gauabhayaranyam.firebasestorage.app",
  messagingSenderId: "187661610205",
  appId: "1:187661610205:web:d99f8161afcdd405ac7f34",
  measurementId: "G-EZJR20Z3YC",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification?.title || "Background Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/firebase-logo.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
