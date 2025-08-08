import { createContext, useContext } from "react";
import { io } from "socket.io-client";

// Create the socket instance
export const socket = io(import.meta.env.VITE_SOCKET_URL); // or your hardcoded URL

// Create and export the context with the socket
export const SocketContext = createContext(socket);

// Custom hook to access the socket context
export const useSocket = () => useContext(SocketContext);
