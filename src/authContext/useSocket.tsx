import { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

// Socket type
export type SocketType = Socket;

// Create a socket instance (optional, can be used outside provider if needed)
export const socket: SocketType = io(import.meta.env.VITE_BACK_URL, {
  transports: ["websocket"],
  reconnection: true,
});

// Create context
export const SocketContext = createContext<SocketType | null>(null);

// Custom hook
export const useSocket = (): SocketType => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
