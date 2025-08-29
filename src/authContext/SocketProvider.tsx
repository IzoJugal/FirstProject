import { ReactNode, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./Auth";
import { SocketContext } from "./useSocket";

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { user } = useAuth();
  const userId = user?._id;

  // Initialize socket immediately
  const socketRef = useRef<Socket>(
    io(import.meta.env.VITE_BACK_URL, {
      transports: ["websocket"],
      reconnection: true,
    })
  );

  // Register user whenever userId changes
  useEffect(() => {
    if (userId) {
      socketRef.current.emit("register", {
        userId: userId.toString(),
        notificationsEnabled: true,
      });
    }
  }, [userId]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
