import { useEffect, useState } from "react";
import { FaUser, FaPhone, FaEnvelope, FaEye, FaEyeSlash, FaMobileAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const GreenSortsSignup = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        roles: ["recycler"],
    });


    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [canResendOtp, setCanResendOtp] = useState(false);
    const [timer, setTimer] = useState(120);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First name required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name required";
        if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter valid 10-digit phone";
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Enter valid email";
        if (formData.password.length < 6) newErrors.password = "Min 6 characters required";
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otpSent && !validate()) return;

        setLoading(true);
        try {
            if (!otpSent) {
                // Send OTP to phone only
                const res = await axios.post(`${import.meta.env.VITE_BACK_URL}/auth/send-otp`, {
                    phone: formData.phone,
                    method: "phone",
                });

                if (res.data.success) {
                    toast.success("OTP sent to your phone");
                    setOtpSent(true);
                    setShowOtpModal(true);
                } else {
                    toast.error(res.data.message || "Failed to send OTP");
                }
            } else {
                if (!otp.trim()) return toast.error("Please enter OTP");

                const payload = {
                    ...formData,
                    otp,
                    method: "phone",
                    "roles": ["recycler"]

                };

                const res = await axios.post(`${import.meta.env.VITE_BACK_URL}/auth/signup`, payload);

                if (res.data.token) {
                    toast.success("Signup successful! You've successfully signed up as a GreenSorts.", { autoClose: 3000 });

                    // ✅ Clear form fields
                    setFormData({
                        firstName: "",
                        lastName: "",
                        phone: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                    });
                    setOtp("");
                    setOtpSent(false);

                    setShowOtpModal(false);
                    setShowSuccessScreen(true);

                    setTimeout(() => {
                        setShowSuccessScreen(false);
                        navigate("/login")
                    }, 3000)
                }
                else {
                    toast.error(res.data.message || "Signup failed");
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!formData.phone) return toast.error("Phone number is missing");

        try {
            setLoading(true);
            setTimer(120);          // Reset timer here
            setCanResendOtp(false); // Disable resend button immediately
            setOtp("");

            const res = await axios.post(`${import.meta.env.VITE_BACK_URL}/auth/send-otp`, {
                phone: formData.phone,
                method: "phone",
            });

            if (res.data.success) {
                toast.success("OTP resent successfully");
                setOtp(""); // Clear previous OTP
                setTimer(120); // Reset timer
                setCanResendOtp(false);
            } else {
                toast.error(res.data.message || "Failed to resend OTP");
                setTimer(0);           // Allow resend again on failure
                setCanResendOtp(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Resend OTP failed");
            setTimer(0);
            setCanResendOtp(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showOtpModal) return;

        if (timer === 0) {
            setCanResendOtp(true);
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [showOtpModal, timer]);

    const formatTimer = () => {
        const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
        const seconds = String(timer % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 to-white px-4 py-6">
            <div className="bg-white w-full max-w-lg m-3 rounded-2xl shadow-lg p-6 md:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <img src="/logo.png" alt="GreenSorts Logo" className="w-14 h-14 mx-auto mb-2" />
                    <h1 className="text-xl font-bold text-green-700">GreenSorts</h1>
                    <p className="text-sm text-gray-500 -mt-1">Donate Scrap. Share Kindness</p>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* First & Last Name */}
                    <div className="flex gap-4">
                        {["firstName", "lastName"].map((field) => (
                            <div className="relative w-1/2" key={field}>
                                <input
                                    type="text"
                                    name={field}
                                    placeholder={field === "firstName" ? "First Name" : "Last Name"}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[field] ? "border-red-500 ring-red-300" : "border-gray-300"
                                        }`}
                                />
                                <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
                                {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Phone */}
                    <div className="relative">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone"
                            value={formData.phone}
                            maxLength={10}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.phone ? "border-red-500 ring-red-300" : "border-gray-300"
                                }`}
                        />
                        <FaPhone className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? "border-red-500 ring-red-300" : "border-gray-300"
                                }`}
                        />
                        <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? "border-red-500 ring-red-300" : "border-gray-300"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.confirmPassword ? "border-red-500 ring-red-300" : "border-gray-300"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition duration-200"
                    >
                        {loading ? "Processing..." : "Sign Up"}
                    </button>
                </form>
                {/* OTP Modal */}
                {showOtpModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-6 shadow-xl">

                            {/* Logo + Title */}
                            <div className="text-center space-y-1">
                                <img src="/logo.png" alt="Gauabhayaranyam Logo" className="w-12 h-12 mx-auto" />
                                <h1 className="text-xl font-bold text-gray-900">OTP Verification</h1>
                                <p className="text-sm text-gray-600">
                                    Enter 4 digit code sent to <br />
                                    <span className="text-green-600 font-semibold">+91 {formData.phone}</span>
                                </p>
                            </div>

                            {/* OTP Inputs */}
                            <div className="flex justify-center gap-4">
                                {[0, 1, 2, 3].map((i) => (
                                    <input
                                        key={i}
                                        maxLength={1}
                                        inputMode="numeric"
                                        value={otp[i] || ""}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/, "");
                                            if (!val) return;
                                            const newOtp = otp.split("");
                                            newOtp[i] = val;
                                            setOtp(newOtp.join(""));
                                            if (e.target.nextSibling) e.target.nextSibling.focus();
                                        }}
                                        className="w-12 h-12 border border-gray-300 rounded-md text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                ))}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`w-full py-2 rounded-lg text-sm font-semibold 
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} 
                                text-white`}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>


                            {/* Resend Section */}
                            <div className="text-center text-sm text-gray-600">
                                {canResendOtp ? (
                                    <button
                                        onClick={handleResendOtp}
                                        className="text-green-600 font-semibold hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                ) : (
                                    <>
                                        Request new OTP in:{" "}
                                        <span className="text-green-600 font-semibold">{formatTimer()}</span>
                                    </>
                                )}
                            </div>


                            {/* Consent Notice */}
                            <p className="text-[10px] text-gray-400 text-center leading-snug mt-2">
                                By proceeding, you consent to receive calls or SMS/RCS messages, including automated ones, from A-Z and its affiliates to the number provided.
                            </p>
                        </div>
                    </div>
                )}


                {/* Success Modal */}
                {showSuccessScreen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
                        <div className="relative bg-white rounded-xl p-6 w-full max-w-xs text-center space-y-3 shadow-lg">

                            {/* Green Check Icon - Positioned at the top center */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/4">
                                <img src="/success-check.png" alt="Success" className="w-16 h-16 rounded-full bg-white shadow-md" />
                            </div>

                            <div className="mt-10">
                                <h3 className="text-green-600 font-semibold text-lg">OTP Verified successfully</h3>
                                <p className="text-gray-600 text-sm">
                                    Your mobile number is now linked to your account.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowSuccessScreen(false);
                                    navigate("/login"); // or desired redirect
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium mt-4"
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                )}



                <p className="text-sm m-2 text-gray-700 text-center leading-relaxed">
                    <strong>You can continue here</strong>, but for the full experience, we recommend using the mobile app.
                    <br />
                    <span className="text-green-600 font-semibold">You may proceed using the website or switch to the mobile app anytime.</span>
                </p>

                <div className="mt-4 flex flex-col items-center gap-4">
                    {/* Download Mobile App Button */}
                    <a
                        href="/download-section"
                        className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-full shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                        <FaMobileAlt className="text-xl" />
                        Download Mobile App
                    </a>

                    <p className="text-sm text-center mt-6">
                        Don’t have an account?{" "}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-green-600 font-semibold hover:underline"
                        >
                            Log In
                        </button>
                    </p>

                </div>

            </div>

        </div>
    );
};

export default GreenSortsSignup;
