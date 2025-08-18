import { getMessaging, getToken,onMessage  } from "firebase/messaging";
import { app } from "./firebase";
import { messaging } from "./firebase";
export async function getFCMToken(authorizationToken: string) {
  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: "BJ-aXD5P86O3DJ-HjblMhrcZuie4FNvJd1j8ydRGE0xMSrUWIt_-kv3GBj--JxRJXM8bXcxEjxmpwWbRJbzdtM8",
    });

    if (token) {
      console.log("FCM Token:", token);

      // ✅ Save to backend
      await fetch("http://localhost:5000/auth/save-fcm-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({ fcmToken: token }),
      });
    } else {
      console.log("No registration token available.");
    }

    return token;
  } catch (err) {
    console.error("Error getting FCM token:", err);
    return null;
  }
}

export const requestFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = getMessaging(app);
     const token = await getToken(messaging, {
      vapidKey: "BJ-aXD5P86O3DJ-HjblMhrcZuie4FNvJd1j8ydRGE0xMSrUWIt_-kv3GBj--JxRJXM8bXcxEjxmpwWbRJbzdtM8",
    });
    return token;
  } catch (error) {
    console.error("FCM Token error:", error);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  return onMessage(messaging, callback);
};