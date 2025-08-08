// src/authContext/SocketProvider.jsx
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./Auth";
import { SocketContext } from "./ScoketContext";

export const SocketProvider = ({ children }) => {
  const auth = useAuth();
  const userId = auth?.user?._id || auth?.userId;
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${import.meta.env.VITE_BACK_URL}`); 
    }

    if (userId) {
      socketRef.current.emit("register", userId);
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
