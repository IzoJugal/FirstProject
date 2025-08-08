import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './authContext/Auth.jsx';
import { SocketProvider } from "./authContext/SocketProvider.jsx"
import { NotificationProvider } from './authContext/NotificationContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SocketProvider>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </SocketProvider>
    <ToastContainer transition={Slide} autoClose={3000} />
  </BrowserRouter>
)
