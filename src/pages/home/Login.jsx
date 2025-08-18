import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock, Loader2, Eye, EyeOff, UserRoundPlus, LoaderPinwheel, LucideLoaderPinwheel } from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../Firebase/firebase";
// import axios from "axios";


const Login = () => {
  const navigate = useNavigate();
  const { storeToken, logout } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Minimum 6 characters required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      const { token, user } = data;

      // Check if roles exist
      const roles = user.roles;
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        toast.error("Roles not valid");
        return;
      }
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        toast.error("Roles not valid");
        return;
      }

      storeToken(token, user, roles);

      setSuccessLoading(true);

      setTimeout(() => {
        if (roles.length === 1 && roles.includes("admin")) {
          navigate("/admin-dashboard");
          toast.success("Admin logged in successfully");
        } else if (roles.length === 1 && roles.includes("volunteer")) {
          navigate("/volunteer-dashboard");
          toast.success("Logged in successfully");
        } else if ((roles.length === 1 && roles.includes("user"))) {
          navigate("/user-dashboard");
          toast.success("Logged in successfully");
        } else if (
          (roles.length === 2 && roles.includes("user") && roles.includes("volunteer"))
        ) {
          navigate("/volunteer-dashboard");
          toast.success("Logged in successfully");
        } else if (roles.length === 1 && roles.includes("dealer")) {
          navigate("/dealer-dashboard");
          toast.success("Logged in successfully");
        } else if (roles.length === 1 && roles.includes("recycler")) {
          navigate("/greensorts-dashboard");
          toast.success("Logged in successfully");
        } else {
          toast.error("You are not authorized to access this dashboard.");
          logout();
        }
      }, 3000);


    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  let isSigningIn = false;


  async function handleGoogleLogin() {
    if (isSigningIn) return;
    isSigningIn = true;
    setGoogleLoading(true); // 🔹 Start loader

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google User:", user);

      const idToken = await user.getIdToken(true);
      console.log("Firebase ID Token:", idToken);

      const res = await fetch("http://localhost:5000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await res.json();
      console.log("Backend Response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Google login failed");
      }

      if (data.redirect) {
        toast.info("Please complete your profile");
        navigate(`/complete-profile/${data.userId}`);
        return;
      }

      const { token, user: backendUser } = data;
      if (!backendUser) throw new Error("User data missing from backend");

      const roles = backendUser.roles || [];
      if (!roles.length) {
        toast.error("No roles assigned. Please contact support.");
        return;
      }

      storeToken(token, backendUser, roles);

      const roleRoutes = {
        admin: { path: "/admin-dashboard", msg: "Admin logged in successfully" },
        volunteer: { path: "/volunteer-dashboard", msg: "Volunteer logged in successfully" },
        user: { path: "/user-dashboard", msg: "User logged in successfully" },
        dealer: { path: "/dealer-dashboard", msg: "Dealer logged in successfully" },
        recycler: { path: "/greensorts-dashboard", msg: "Recycler logged in successfully" },
      };

      const userRole = roles.find((r) => roleRoutes[r]);
      if (userRole) {
        toast.success(roleRoutes[userRole].msg);
        navigate(roleRoutes[userRole].path);
      } else {
        toast.error("Unauthorized access.");
        logout();
      }

    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.message || "Google login failed");
    } finally {
      setGoogleLoading(false); // 🔹 Stop loader
      isSigningIn = false;
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md space-y-6">

        {/* Logo + Welcome */}
        <div className="text-center">
          <img src="/logo.png" alt="Gauabhayaranyam Logo" className="w-16 mx-auto mb-3" />
          <h1 className="text-xl font-medium text-gray-700">Welcome Back to</h1>
          <h2 className="text-2xl font-bold text-green-600">Gauabhayaranyam</h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${errors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 text-sm rounded-xl border ${errors.password ? "border-red-500" : "border-gray-300"
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

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center gap-2">
            </label>
            <Link to="/forgot-password" className="text-green-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Social Divider */}
          <div className="flex items-center gap-2 text-gray-400 text-sm my-1">
            <hr className="flex-grow border-gray-300" />
            or Login with
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-6 mt-3">
            {[
              {
                src: '/google.png',
                alt: 'Google',
                size: 'w-6',
                hoverBg: 'hover:bg-red-100',
                onClick: () => handleGoogleLogin()
              }
            ].map(({ src, alt, size, hoverBg, onClick }) => (
              <div
                key={alt}
                onClick={onClick}
                className={`p-2 rounded-full transition duration-200 cursor-pointer ${hoverBg}`}
                title={`Continue with ${alt}`}
              >
                <img src={src} alt={alt} className={`${size}`} />
              </div>
            ))}
          </div>

        </form>

        {/* Signup */}
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">Don’t have an account?</p>
          <Link
            to="/signup"
            className="mt-2 inline-block border border-green-600 text-green-600 px-46 py-2 rounded-full text-sm font-semibold hover:bg-green-50"
          >
            Sign Up
          </Link>
        </div>

        {/* Redirecting Spinner */}
        {successLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur">
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <LucideLoaderPinwheel className="w-8 h-8 text-green-600 animate-spin" />
              <p className="text-green-700 text-sm font-medium">Redirecting...</p>
            </div>
          </div>
        )}

        {/* Google Login */}

        {googleLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur">
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <LucideLoaderPinwheel className="w-8 h-8 text-green-600 animate-spin" />
              <p className="text-green-700 text-sm font-medium">Signing in with Google...</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
