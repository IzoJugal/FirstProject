import { createContext, useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { toast } from "react-toastify";
import { useSocket } from "./useSocket";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { userId, authorizationToken } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnread();
    }, 30000); // 30,000ms = 30s

    return () => clearInterval(interval); // cleanup
  }, [fetchUnread]);

  // Real-time push
  useEffect(() => {
    if (!socket || !userId) return;

    const handleNewNotification = (data) => {
toast.info(`📢 New Notification: ${data.message}`);
     
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, [socket, userId]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
