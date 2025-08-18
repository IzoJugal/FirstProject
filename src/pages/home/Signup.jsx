import { useEffect, useState } from "react";
import { FaUser, FaPhone, FaEnvelope, FaEye, FaEyeSlash, FaMobileAlt, FaPhoneAlt, FaLock } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// const API = import.meta.env.VITE_BACK_URL

const API = "http://localhost:5000"


const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: "",
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
    if (!formData.roles) newErrors.roles = "Please select a roles";
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
        const res = await axios.post(`${API}/auth/send-otp`, {
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
        };

        const res = await axios.post(`${API}/auth/signup`, payload);

        if (res.data.token) {
          toast.success("Signup successful! You've successfully signed up as a User.", { autoClose: 3000 });

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

      const res = await axios.post(`${API}/auth/send-otp`, {
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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg m-3 bg-green-50 rounded-2xl shadow-xl p-6 space-y-6">

        {/* Logo + Headings */}
        <div className="text-center">
          <img src="/logo.png" alt="Gauabhayaranyam" className="mx-auto w-14 h-14 mb-2" />
          <h1 className="text-xl font-bold text-gray-800">Join Gauabhayaranyam</h1>
          <p className="text-sm text-gray-500">Create your account and start donating scrap</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* First Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>

          {/* Phone */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              maxLength={10}
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* roles Selection */}
          <div className="relative">
            <select
              name="roles"
              value={formData.roles}
              onChange={handleChange}
              className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select roles</option>
              <option value="user">User</option>
              <option value="dealer">Dealer</option>
            </select>
            {errors.roles && <p className="text-xs text-red-500 mt-1">{errors.roles}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition"
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
                className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
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


        {/* Info Text */}
        <p className="text-sm text-gray-600 text-center mt-6">
          For the best experience, use the mobile app.
          <br />
          <span className="text-green-600 font-medium">You can switch anytime.</span>
        </p>

        {/* Footer Buttons */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <a
            href="/download-section"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            <FaMobileAlt />
            Download Mobile App
          </a>
          <p className="text-sm text-center text-gray-600">
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

export default Signup;
