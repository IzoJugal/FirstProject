import { createContext, useCallback, useEffect, useState, useRef, ReactNode } from 'react';
import { useAuth } from './Auth';
import { useSocket } from './useSocket';
import { requestFCMToken, onForegroundMessage } from '../Firebase/fcm';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Define types for context and props
export interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

export interface NotificationProviderProps {
  children: ReactNode;
}

// Define types for notification data
export interface Notification {
  isRead: boolean;
}

export interface WebSocketNotification {
  userId: string;
  notificationId: string;
  message?: string;
  link?: string;
}

export interface FCMPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    userId?: string;
    notificationId?: string;
    link?: string;
  };
  messageId?: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Utility to debounce toast notifications
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, authorizationToken } = useAuth();
  const userId = user?.id;
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [prevUnreadCount, setPrevUnreadCount] = useState<number>(0);
  const navigate = useNavigate();
  const fcmHandledNotifications = useRef<Set<string>>(new Set());
  const fcmSubscriptionRef = useRef<(() => void) | null>(null);
const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


  // Consolidated auth check
  const isAuthenticated = userId && authorizationToken;

  // Fetch unread notifications count with retry
  const fetchUnread = useCallback(
    async (retryCount: number = 3, delay: number = 1000) => {
      if (!isAuthenticated) return;

      const attemptFetch = async (retries: number) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACK_URL}/notifications/notifications`, {
            headers: { Authorization: authorizationToken! },
          });
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          const data: { notifications: Notification[] } = await res.json();
          const unread = (data.notifications || []).filter((n) => !n.isRead).length;

          if (unread > prevUnreadCount) {
            const newNotifications = unread - prevUnreadCount;
            toast.info(
              `You have ${newNotifications} new notification${newNotifications > 1 ? 's' : ''}!`,
              {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                toastId: `unread-${Date.now()}`,
                onClick: () => navigate('/notifications'),
              }
            );
          }
          setUnreadCount(unread);
          setPrevUnreadCount(unread);
        } catch (error: unknown) {
          if (retries > 0) {
            setTimeout(() => attemptFetch(retries - 1), delay);
          } else {
            console.error('Fetch unread error:', error);
            toast.error('Failed to fetch notifications');
          }
        }
      };

      await attemptFetch(retryCount);
    },
    [authorizationToken, prevUnreadCount, navigate, isAuthenticated]
  );

  // Polling with dynamic interval
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnread();
    pollingIntervalRef.current = setInterval(() => {
      fetchUnread();
    }, 60000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [fetchUnread, isAuthenticated]);

  // WebSocket notifications
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNewNotification = (data: WebSocketNotification) => {
      if (data.userId !== userId || !data.notificationId) {
        return;
      }

      if (fcmHandledNotifications.current.has(data.notificationId)) {
        return;
      }

      const debouncedToast = debounce(() => {
        toast.info(
          <div>
            📢 You have a new notification: {data.message || 'New update'}
            {data.link && (
              <button
                onClick={() => navigate(data.link!)}
                style={{ marginLeft: 10, padding: '5px 10px' }}
              >
                View
              </button>
            )}
          </div>,
          {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            toastId: data.notificationId,
          }
        );
      }, 500);

      debouncedToast();
      setUnreadCount((count) => count + 1);
      setPrevUnreadCount((count) => count + 1);
      fcmHandledNotifications.current.add(data.notificationId);
    };

    socket.on('connect', () => console.info('WebSocket connected'));
    socket.on('newNotification', handleNewNotification);
    socket.on('disconnect', () => console.warn('WebSocket disconnected'));
    socket.on('connect_error', (error: Error) => console.error('WebSocket error:', error));

    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [socket, userId, navigate, isAuthenticated]);

  // FCM notifications
  useEffect(() => {
    let isMounted = true;

    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.warn('Please enable notifications in your browser');
          return;
        }

        const token = await requestFCMToken();
        if (!token || !isMounted || !isAuthenticated) {
          console.warn('FCM setup skipped: Token or auth missing');
          return;
        }
      } catch (error: unknown) {
        console.error('FCM setup error:', error);
        toast.error('Failed to set up push notifications');
      }
    };

    if (isAuthenticated) {
      setupFCM();
    }

    if (fcmSubscriptionRef.current) {
      fcmSubscriptionRef.current();
      fcmSubscriptionRef.current = null;
    }

    const unsubscribe = onForegroundMessage((payload: FCMPayload) => {
      if (!isAuthenticated || !payload?.notification || payload?.data?.userId !== userId) {
        return;
      }

      const notificationId = payload.data?.notificationId || payload.messageId;
      if (!notificationId || fcmHandledNotifications.current.has(notificationId)) {
        return;
      }

      const { title = 'Notification', body = '' } = payload.notification;

      const debouncedToast = debounce(() => {
        toast.info(
          <div>
            🔔 {title}: {body}
            {payload.data?.link && (
              <button
                onClick={() => navigate(payload.data!.link!)}
                style={{ marginLeft: 10, padding: '5px 10px' }}
              >
                View
              </button>
            )}
          </div>,
          {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            toastId: notificationId,
          }
        );
      }, 500);

      debouncedToast();
      setUnreadCount((count) => count + 1);
      setPrevUnreadCount((count) => count + 1);
      fcmHandledNotifications.current.add(notificationId);
    });

    fcmSubscriptionRef.current = unsubscribe;

    return () => {
      isMounted = false;
      if (fcmSubscriptionRef.current) {
        fcmSubscriptionRef.current();
        fcmSubscriptionRef.current = null;
      }
    };
  }, [isAuthenticated, userId, authorizationToken, navigate]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;