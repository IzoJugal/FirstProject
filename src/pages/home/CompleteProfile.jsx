import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Phone, Loader2, User2 } from "lucide-react";
import { useAuth } from "../../authContext/Auth";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const { storeToken } = useAuth();

  const [formData, setFormData] = useState({
    provider: "",
    providerId: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    roles: ["user"],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // for submit
  const [initialLoading, setInitialLoading] = useState(true); // for fetch

  const availableRoles = ["user", "dealer", "recycler", "volunteer"];

  // ✅ Fetch existing user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/auth/user/${userId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch user");

        setFormData((prev) => ({
          ...prev,
          provider: data.provider,
          providerId: data.providerId,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data?.user.email || "",
          phone: data.phone || "",
          roles: data.roles && data.roles.length > 0 ? data.roles : ["user"],
        }));
      } catch (err) {
        toast.error(err.message);
        navigate("/login");
      } finally {
        setInitialLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId, navigate]);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone) newErrors.phone = "Phone is required";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Must be 10 digits";

    if (!formData.roles || formData.roles.length === 0)
      newErrors.roles = "Select at least one role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "roles") {
      setFormData((prev) => ({
        ...prev,
        roles: checked
          ? [...prev.roles, value]
          : prev.roles.filter((r) => r !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/auth/complete-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Profile completion failed");

      const { token, user } = data;
      storeToken(token, user, user.roles);

      toast.success("Profile completed & Login Success.");

      setTimeout(() => {
        if (user.roles.includes("admin")) navigate("/admin-dashboard");
        else if (user.roles.includes("volunteer"))
          navigate("/volunteer-dashboard");
        else if (user.roles.includes("dealer")) navigate("/dealer-dashboard");
        else if (user.roles.includes("recycler"))
          navigate("/greensorts-dashboard");
        else navigate("/user-dashboard");
      }, 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loader while fetching user
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-gray-600 text-sm">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 px-4 py-10">
      <div className="w-full sm:max-w-lg lg:max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <img src="/logo.png" alt="Logo" className="w-20 mx-auto mb-3 drop-shadow-md" />
          <h1 className="text-xl font-semibold text-gray-700">Complete Your Profile</h1>
          <h2 className="text-3xl font-bold text-green-700 tracking-wide">Gauabhayaranyam</h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6"
        >
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
            <div className="relative">
              <User2 className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={`w-full px-4 py-3 pl-10 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
            <div className="relative">
              <User2 className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={`w-full px-4 py-3 pl-10 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
              <input
                type="email"
                name="email"
                disabled
                value={formData.email}
                className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                placeholder="10-digit phone number"
                className={`w-full px-4 py-3 pl-10 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Select Role</label>
            <div className="flex flex-wrap gap-3">
              {availableRoles.map((role) => (
                <label
                  key={role}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm cursor-pointer transition
          ${
            formData.roles.includes(role)
              ? "bg-green-600 text-white border-green-600 shadow"
              : "border-gray-300 hover:bg-green-50"
          }`}
                >
                  <input
                    type="radio"
                    name="roles"
                    value={role}
                    checked={formData.roles[0] === role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, roles: [e.target.value] }))
                    }
                    className="hidden"
                  />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </label>
              ))}
            </div>
            {errors.roles && <p className="text-xs text-red-500 mt-1">{errors.roles}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-[1.02] transition disabled:opacity-70"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {loading ? "Submitting..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
