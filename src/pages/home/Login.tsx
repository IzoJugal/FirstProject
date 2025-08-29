import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, Loader2, Eye, EyeOff, LucideLoaderPinwheel, User2 } from 'lucide-react';
import { useAuth } from '../../authContext/Auth';
import { GoogleAuthProvider, signInWithPopup, User as FirebaseUser, UserCredential } from 'firebase/auth';
import { auth } from '../../Firebase/firebase';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';
import { v4 as uuidv4 } from 'uuid';

// ----- Types -----
interface FormData {
  identifier: string;
  password: string;
  fcmToken: string;
  deviceId: string;
}

interface Errors {
  identifier?: string;
  password?: string;
}

interface BackendUser {
  _id: string;
  roles: string[];
  [key: string]: any; // Allow additional properties
}

interface SignInResponse {
  token: string;
  user: BackendUser;
}

interface GoogleSignInResponse {
  token?: string;
  userId?: string;
  user?: BackendUser;
  redirect?: boolean;
  message?: string;
}

interface ApiErrorResponse {
  message: string;
}

interface AuthContextType {
  storeToken: (token: string, user: BackendUser, roles: string[]) => void;
  logout: () => void;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { storeToken, logout } = useAuth() as AuthContextType;

  const [formData, setFormData] = useState<FormData>({
    identifier: '',
    password: '',
    fcmToken: '',
    deviceId: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [successLoading, setSuccessLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const isSigningIn = useRef<boolean>(false);

  const requestFCMToken = async (): Promise<string> => {
    try {
      const messaging: Messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return '';
    }
  };

  const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  useEffect(() => {
    const initializeTokens = async () => {
      const fcmToken = await requestFCMToken();
      const deviceId = getDeviceId();
      setFormData((prev) => ({
        ...prev,
        fcmToken,
        deviceId,
      }));
    };
    initializeTokens();
  }, []);

  const validate = (): boolean => {
    const newErrors: Errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!formData.identifier) {
      newErrors.identifier = 'Email or Mobile number is required';
    } else if (!emailRegex.test(formData.identifier) && !mobileRegex.test(formData.identifier)) {
      newErrors.identifier = 'Enter a valid email or 10-digit mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 characters required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data: SignInResponse | ApiErrorResponse = await res.json();
      if (!res.ok) {
        throw new Error((data as ApiErrorResponse).message || 'Login failed');
      }

      const { token, user } = data as SignInResponse;
      const roles = user.roles;
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        toast.error('Roles not valid');
        return;
      }

      storeToken(token, user, roles);
      setSuccessLoading(true);

      setTimeout(() => {
        if (roles.length === 1 && roles.includes('admin')) {
          navigate('/admin-dashboard');
          toast.success('Admin logged in successfully');
        } else if (roles.length === 1 && roles.includes('volunteer')) {
          navigate('/volunteer-dashboard');
          toast.success('Logged in successfully');
        } else if (roles.length === 1 && roles.includes('user')) {
          navigate('/user-dashboard');
          toast.success('Logged in successfully');
        } else if (roles.length === 2 && roles.includes('user') && roles.includes('volunteer')) {
          navigate('/volunteer-dashboard');
          toast.success('Logged in successfully');
        } else if (roles.length === 1 && roles.includes('dealer')) {
          navigate('/dealer-dashboard');
          toast.success('Logged in successfully');
        } else if (roles.length === 1 && roles.includes('recycler')) {
          navigate('/greensorts-dashboard');
          toast.success('Logged in successfully');
        } else {
          toast.error('You are not authorized to access this dashboard.');
          logout();
        }
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSigningIn.current) return;
    isSigningIn.current = true;
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result: UserCredential = await signInWithPopup(auth, provider);
      const firebaseUser: FirebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken(true);
      const fcmToken = await requestFCMToken();
      const deviceId = getDeviceId();

      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken, fcmToken, deviceId }),
      });

      const data: GoogleSignInResponse | ApiErrorResponse = await res.json();
      if (!res.ok) {
        throw new Error((data as ApiErrorResponse).message || 'Google login failed');
      }

      const { redirect, userId, token, user: backendUser } = data as GoogleSignInResponse;

      // Redirect user to complete profile if required
      if (redirect && userId) {
        toast.info('Please complete your profile');
        navigate(`/complete-profile/${userId}`);
        return;
      }

      if (!backendUser || !token) {
        throw new Error('Login successful but user data or token missing');
      }

      const roles = backendUser.roles || [];
      if (!Array.isArray(roles) || roles.length === 0) {
        toast.error('No roles assigned. Please contact support.');
        return;
      }

      // Store token and user
      storeToken(token, backendUser, roles);

      // Define valid role routes
      const roleRoutes: { [key: string]: { path: string; msg: string } } = {
        admin: { path: '/admin-dashboard', msg: 'Admin logged in successfully' },
        volunteer: { path: '/volunteer-dashboard', msg: 'Volunteer logged in successfully' },
        user: { path: '/user-dashboard', msg: 'User logged in successfully' },
        dealer: { path: '/dealer-dashboard', msg: 'Dealer logged in successfully' },
        recycler: { path: '/greensorts-dashboard', msg: 'Recycler logged in successfully' },
      };

      // Determine best role for redirection
      let destinationRole: string | null = null;

      if (roles.length === 1) {
        destinationRole = roles[0];
      } else if (roles.includes('volunteer')) {
        destinationRole = 'volunteer';
      } else if (roles.includes('user')) {
        destinationRole = 'user';
      }

      if (destinationRole && roleRoutes[destinationRole]) {
        toast.success(roleRoutes[destinationRole].msg);
        navigate(roleRoutes[destinationRole].path);
      } else {
        toast.error('You are not authorized to access any dashboard.');
        logout();
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
      isSigningIn.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src="/logo.png" alt="Gauabhayaranyam Logo" className="w-16 mx-auto mb-3" />
          <h1 className="text-xl font-medium text-gray-700">Welcome Back to</h1>
          <h2 className="text-2xl font-bold text-green-600">Gauabhayaranyam</h2>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">
          <div className="relative">
            <User2 className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
            <input
              type="text"
              name="identifier"
              placeholder="Enter Email or Mobile Number"
              value={formData.identifier}
              onChange={handleChange}
              inputMode="email"
              className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${
                errors.identifier ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier}</p>}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 text-sm rounded-xl border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center gap-2"></label>
            <Link to="/forgot-password" className="text-green-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          <div className="flex items-center gap-2 text-gray-400 text-sm my-1">
            <hr className="flex-grow border-gray-300" />
            or Login with
            <hr className="flex-grow border-gray-300" />
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <div
              onClick={handleGoogleLogin}
              className="p-2 rounded-full transition duration-200 cursor-pointer hover:bg-red-100"
              title="Continue with Google"
            >
              <img src="/google.png" alt="Google" className="w-6" />
            </div>
          </div>
        </form>
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">Don’t have an account?</p>
          <Link
            to="/signup"
            className="mt-2 inline-block border border-green-600 text-green-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-50"
          >
            Sign Up
          </Link>
        </div>
        {successLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur">
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <LucideLoaderPinwheel className="w-8 h-8 text-green-600 animate-spin" />
              <p className="text-green-700 text-sm font-medium">Redirecting...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;