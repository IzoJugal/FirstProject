import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";

// ----- Types -----
interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}

interface ApiErrorResponse {
  message: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: ForgotPasswordResponse | ApiErrorResponse = await res.json();

      if (!res.ok || !("success" in data && data.success)) {
        const errorMessage = (data as ApiErrorResponse).message || "Email not found or request failed.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const successMessage = (data as ForgotPasswordResponse).message || "Check your email for reset instructions.";
        toast.success("Reset password link sent to your email.");
        setMsg(successMessage);
        setTimeout(() => navigate("/login"), 4000);
      }
    } catch (err: any) {
      const errorMessage = "Something went wrong. Please try again later.";
      setError(errorMessage);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo and Tagline */}
        <div className="text-center">
          <img src="/logo.png" alt="Gauabhayaranyam" className="mx-auto w-28 h-28" />
          <h1 className="text-xl font-bold text-gray-800 mt-2">
            <span className="text-green-600">Gauabhayaranyam</span>
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-center text-xl font-bold text-gray-800">Forget Password</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <Mail className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <p className="text-sm text-gray-500">
            We’ll send a recovery link to your email to reset your password
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>

        {/* Success Message */}
        {msg && (
          <div className="text-center mt-2">
            <p className="text-sm text-green-600 font-medium">{msg}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;