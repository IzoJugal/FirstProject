import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../authContext/Auth";
import { Bell, CheckCheck, Trash2, View } from "lucide-react";
import { useNotification } from "../authContext/useNotification";
import { socket } from "../authContext/useSocket";
import { useNavigate } from "react-router-dom";
import { requestFCMToken } from "../Firebase/fcm";

const API = import.meta.env.VITE_BACK_URL as string;

// 🔹 Notification type
interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const { authorizationToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { setUnreadCount } = useNotification();
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // 🔹 Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notifications/notifications`, {
        headers: { Authorization: authorizationToken || "" },
      });
      const data = await res.json();
      const list: Notification[] = Array.isArray(data.notifications)
        ? data.notifications
        : [];
      setNotifications(list);

      // Update unread count
      const unread = list.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [authorizationToken, setUnreadCount]);

  // 🔹 Save FCM Token
  const saveFCMToken = useCallback(async () => {
    if (!authorizationToken) return;
    const token = await requestFCMToken(authorizationToken); // pass auth
    if (!token) return;
  }, [authorizationToken]);

  useEffect(() => {
    saveFCMToken();
  }, [saveFCMToken]);

  useEffect(() => {
    fetchNotifications();
    saveFCMToken();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    // 🔹 Socket listener
    socket.on(
      "newNotification",
      ({
        message,
        notificationId,
        link,
      }: {
        message: string;
        notificationId: string;
        link?: string;
      }) => {
        setNotifications((prev) => [
          {
            _id: notificationId,
            message,
            isRead: false,
            link: link || "",
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
      }
    );

    return () => {
      clearInterval(interval);
      socket.off("newNotification");
    };
  }, [fetchNotifications, setUnreadCount, saveFCMToken]);

  // 🔹 Mark as read
  const markAsRead = async (id: string) => {
    setLoading((prev) => new Set(prev).add(id));
    await fetch(`${API}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: authorizationToken || "" },
    });
    try {
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // 🔹 Clear all
  const clearAll = async () => {
    await fetch(`${API}/notifications/clear`, {
      method: "DELETE",
      headers: { Authorization: authorizationToken || "" },
    });
    setNotifications([]);
    setUnreadCount(0);
  };

  // 🔹 Pagination
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [notifications]);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Bell className="w-7 h-7 text-blue-600" /> Notifications
        </h1>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-600 flex items-center gap-1 hover:underline transition"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-sm">
          No notifications available.
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications
            .slice(
              (currentPage - 1) * ITEMS_PER_PAGE,
              currentPage * ITEMS_PER_PAGE
            )
            .map((n) => (
              <li
                key={n._id}
                className={`group border rounded-xl p-4 transition shadow-sm hover:shadow-md ${
                  n.isRead ? "bg-white" : "bg-yellow-50 border-yellow-300"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm">
                      {!n.isRead && (
                        <span className="text-blue-600 text-lg">●</span>
                      )}
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(n.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={async () => {
                        try {
                          setLoading((prev) => new Set(prev).add(n._id));
                          await markAsRead(n._id);
                          setLoading((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(n._id);
                            return newSet;
                          });
                        } catch (err) {
                          console.error("Error marking as read:", err);
                        }
                      }}
                      className="text-green-600 hover:text-green-800 transition"
                      title="Mark as Read"
                    >
                      {loading.has(n._id) ? (
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full" />
                      ) : (
                        <CheckCheck className="w-5 h-5" />
                      )}
                    </button>
                  )}

                  {n.link && (
                    <button
                      onClick={() => navigate(n.link!)}
                      className="text-blue-600 hover:text-blue-800 transition ml-2"
                      title="View Notification"
                    >
                      <View />
                    </button>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
