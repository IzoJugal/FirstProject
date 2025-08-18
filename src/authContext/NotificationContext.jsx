import { createContext, useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { toast } from "react-toastify";
import { useSocket } from "./useSocket";
import { requestFCMToken, onForegroundMessage } from "../Firebase/fcm";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { userId, authorizationToken } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications
  const fetchUnread = useCallback(async () => {
    if (!authorizationToken) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/notifications/notifications`, {
        headers: { Authorization: authorizationToken },
      });
      const data = await res.json();
      const unread = (data.notifications || []).filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [authorizationToken]);

  // Initial fetch
  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnread();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // 🔥 Real-time socket push
  useEffect(() => {
    if (!socket || !userId) return;

    const handleNewNotification = (data) => {
      toast.info(`📢 New Notification: ${data.message}`);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, [socket, userId]);

  // 🔥 Firebase Push Notifications
  useEffect(() => {
    if (!authorizationToken) return;

    (async () => {
      const token = await requestFCMToken();
      if (token) {
        // send token to backend for this user
        await fetch(`${import.meta.env.VITE_BACK_URL}/auth/save-fcm-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationToken,
          },
          body: JSON.stringify({ token }),
        });
      }
    })();

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("📲 Firebase Push:", payload);
      toast.info(`🔔 ${payload.notification?.title || "New Notification"}: ${payload.notification?.body}`);
      setUnreadCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, [authorizationToken]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
