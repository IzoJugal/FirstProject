import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail } from "lucide-react"; // optional, or use an img if you have one

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e) => {
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

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || "Email not found or request failed.");
                toast.error(data.message || "Email not found.");
            } else {
                toast.success("Reset password link sent to your email.");
                setMsg(data.message || "Check your email for reset instructions.");
                setTimeout(() => navigate("/login"), 4000);
            }
        } catch (err) {
            setError("Something went wrong. Please try again later.",err);
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
                            onChange={(e) => setEmail(e.target.value)}
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
