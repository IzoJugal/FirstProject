import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from "firebase/messaging";
import { app } from "./firebase";

const VAPID_KEY =
  "BJ-aXD5P86O3DJ-HjblMhrcZuie4FNvJd1j8ydRGE0xMSrUWIt_-kv3GBj--JxRJXM8bXcxEjxmpwWbRJbzdtM8";

// 🔹 Get the current FCM token
export const requestFCMToken = async (authorizationToken?: string): Promise<string | null> => {
  try {
    const messaging: Messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return token || null;
  } catch (error) {
    console.error("❌ FCM Token error:", error);
    return null;
  }
};

// 🔹 Handle foreground notifications
export const onForegroundMessage = (
  callback: (payload: MessagePayload) => void
) => {
  const messaging: Messaging = getMessaging(app);
  return onMessage(messaging, callback);
};
