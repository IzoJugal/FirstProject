// firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getMessaging, Messaging } from "firebase/messaging";

// 🔹 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAfrfjMI-nZgsFls7TpDaYWeAdKeX4mVck",
  authDomain: "gauabhayaranyam.firebaseapp.com",
  projectId: "gauabhayaranyam",
  storageBucket: "gauabhayaranyam.firebasestorage.app",
  messagingSenderId: "187661610205",
  appId: "1:187661610205:web:d99f8161afcdd405ac7f34",
  measurementId: "G-EZJR20Z3YC",
};

// 🔹 Initialize Firebase App
export const app: FirebaseApp = initializeApp(firebaseConfig);

// 🔹 Auth
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 🔹 Analytics (only if supported, prevents SSR crash)
export let analytics: Analytics | null = null;
isAnalyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// 🔹 Messaging
export const messaging: Messaging = getMessaging(app);
