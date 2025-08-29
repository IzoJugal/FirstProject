import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./authContext/Auth";
import { SocketProvider } from "./authContext/SocketProvider";
import { NotificationProvider } from "./authContext/NotificationContext";

// Ensure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create and render to the root
createRoot(rootElement).render(
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <App />
          <ToastContainer
            transition={Slide}
            autoClose={5000}
            newestOnTop={true}
            position="top-right"
            pauseOnHover
            closeOnClick
            draggable
          />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);
