// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAfrfjMI-nZgsFls7TpDaYWeAdKeX4mVck",
  authDomain: "gauabhayaranyam.firebaseapp.com",
  projectId: "gauabhayaranyam",
  storageBucket: "gauabhayaranyam.firebasestorage.app",
  messagingSenderId: "187661610205",
  appId: "1:187661610205:web:d99f8161afcdd405ac7f34",
  measurementId: "G-EZJR20Z3YC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// ✅ Properly get auth & analytics
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export const messaging = getMessaging(app);