import { useEffect, useState } from "react";
import { FaUser, FaPhone, FaEnvelope, FaEye, FaEyeSlash, FaMobileAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Define interfaces for type safety
interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const VolunteerSignup: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState<boolean>(false);
  const [canResendOtp, setCanResendOtp] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(120); // 2 minutes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Send OTP to phone only
      const res = await axios.post<{ success: boolean; message?: string }>(
        `${import.meta.env.VITE_BACK_URL}/auth/send-otp`,
        {
          phone: formData.phone,
          method: "phone",
        }
      );

      if (res.data.success) {
        toast.success("OTP sent to your phone");
        setOtpSent(true);
        setShowOtpModal(true);
      } else {
        toast.error(res.data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault(); // Prevent default button behavior
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        otp,
        method: "phone",
      };

      const res = await axios.post<{ token?: string; message?: string }>(
        `${import.meta.env.VITE_BACK_URL}/auth/volunteer`,
        payload
      );

      if (res.data.token) {
        toast.success("Signup successful! You've successfully signed up as a volunteer.", {
          autoClose: 3000,
        });

        // Clear form fields
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
          navigate("/login");
        }, 3000);
      } else {
        toast.error(res.data.message || "Signup failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    if (!formData.phone) {
      toast.error("Phone number is missing");
      return;
    }

    try {
      setLoading(true);
      setTimer(120);
      setCanResendOtp(false);
      setOtp("");

      const res = await axios.post<{ success: boolean; message?: string }>(
        `${import.meta.env.VITE_BACK_URL}/auth/send-otp`,
        {
          phone: formData.phone,
          method: "phone",
        }
      );

      if (res.data.success) {
        toast.success("OTP resent successfully");
        setOtp("");
        setTimer(120);
        setCanResendOtp(false);
      } else {
        toast.error(res.data.message || "Failed to resend OTP");
        setTimer(0);
        setCanResendOtp(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Resend OTP failed");
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

  const formatTimer = (): string => {
    const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
    const seconds = String(timer % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-lg m-3 bg-white rounded-3xl shadow-xl px-8 py-10 space-y-6 border border-gray-100">
        {/* Header */}
        <div className="text-center">
          <img src="/logo.png" alt="Gauabhayaranyam Logo" className="mx-auto w-14 mb-2" />
          <h2 className="text-2xl font-bold text-green-700">Join Gauabhayaranyam</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create your Gau Samarthan account and start making a difference in your community.
          </p>
        </div>

        {/* Input Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "firstName", placeholder: "First Name", icon: <FaUser /> },
            { name: "lastName", placeholder: "Last Name", icon: <FaUser /> },
            { name: "phone", placeholder: "Phone", icon: <FaPhone /> },
            { name: "email", placeholder: "Email", icon: <FaEnvelope /> },
          ].map(({ name, placeholder, icon }) => (
            <div key={name} className="relative">
              <input
                type={name === "phone" ? "tel" : name === "email" ? "email" : "text"}
                name={name}
                placeholder={placeholder}
                value={formData[name as keyof FormData]}
                onChange={handleChange}
                className={`w-full py-3 pl-4 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm ${
                  errors[name as keyof Errors] ? "border-red-500 ring-red-300" : "border-gray-300"
                }`}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600">
                {icon}
              </span>
              {errors[name as keyof Errors] && (
                <p className="text-red-500 text-xs mt-1">{errors[name as keyof Errors]}</p>
              )}
            </div>
          ))}

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full py-3 pl-4 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm ${
                errors.password ? "border-red-500 ring-red-300" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full py-3 pl-4 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm ${
                errors.confirmPassword ? "border-red-500 ring-red-300" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:bg-gray-400"
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value.replace(/\D/, "");
                      if (!val) return;
                      const newOtp = otp.split("");
                      newOtp[i] = val;
                      setOtp(newOtp.join(""));
                      const nextSibling = e.target.nextSibling as HTMLInputElement | null;
                      if (nextSibling) nextSibling.focus();
                    }}
                    className="w-12 h-12 border border-gray-300 rounded-md text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className={`w-full py-2 rounded-lg text-sm font-semibold ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
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
                <img
                  src="/success-check.png"
                  alt="Success"
                  className="w-16 h-16 rounded-full bg-white shadow-md"
                />
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
                  navigate("/login");
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
          <span className="text-green-600 font-semibold">
            You may proceed using the website or switch to the mobile app anytime.
          </span>
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

          {/* Already have an account */}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-green-700 font-semibold cursor-pointer hover:underline"
            >
              Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerSignup;