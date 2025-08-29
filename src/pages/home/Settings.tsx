import { useState, useEffect, useCallback } from "react";
import { FaUser, FaBell, FaKey, FaTrash, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext/Auth";
import { CameraIcon, Eye, EyeOff, Loader, Mail, Phone, User } from 'lucide-react';
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

// ----- Types -----
interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  profileImage?: string;
  notificationsEnabled?: boolean;
  role?: string;
  roles?: string[];
  [key: string]: any; // Allow additional properties
}

interface ProfileResponse {
  user: User;
  message?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message?: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

interface DeleteAccountResponse {
  success: boolean;
  message?: string;
}

interface ApiErrorResponse {
  message: string;
}

interface AuthContextType {
  authorizationToken: string;
  logout: () => void;
}

const Settings: React.FC = () => {
  const { authorizationToken, logout } = useAuth() as AuthContextType;
  const [notificationsOn, setNotificationsOn] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [newFirstName, setNewFirstName] = useState<string>("");
  const [newLastName, setNewLastName] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [newImage, setNewImage] = useState<File | string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/profile`, {
        headers: {
          Authorization: authorizationToken,
        },
      });
      const data: ProfileResponse | ApiErrorResponse = await res.json();
      if (res.ok && "user" in data) {
        setUser(data.user);
        setNewFirstName(data.user.firstName || data.user.name || "");
        setNewLastName(data.user.lastName || "");
        setNewPhone(data.user.phone || data.user.phoneNumber || "");
        setNewEmail(data.user.email || "");
        setNewImage(data.user.profileImage || "");
        setNotificationsOn(data.user.notificationsEnabled !== false); // Default to true if not specified
      } else {
        toast.error((data as ApiErrorResponse).message || "Error loading profile");
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      toast.error("Server error");
    }
  }, [authorizationToken]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleNotificationToggle = async () => {
    const newValue = !notificationsOn;
    setNotificationsOn(newValue);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationsEnabled: newValue }),
      });
      const data: UpdateProfileResponse | ApiErrorResponse = await res.json();
      if (!res.ok || !("success" in data && data.success)) {
        setNotificationsOn(!newValue); // Revert on failure
        toast.error((data as ApiErrorResponse).message || "Failed to update notification settings");
      } else {
        toast.success("Notification settings updated");
      }
    } catch (err) {
      console.error("Notification toggle error:", err);
      setNotificationsOn(!newValue); // Revert on error
      toast.error("Server error");
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("firstName", newFirstName);
      formData.append("lastName", newLastName);
      formData.append("email", newEmail);
      formData.append("phone", newPhone);
      if (newImage instanceof File) {
        formData.append("profileImage", newImage);
      } else if (typeof newImage === "string") {
        formData.append("profileImage", newImage);
      }

      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          Authorization: authorizationToken,
        },
        body: formData,
      });

      const data: UpdateProfileResponse | ApiErrorResponse = await res.json();
      if (res.ok && "success" in data && data.success) {
        toast.success("Profile updated!");
        setShowProfileModal(false);
        fetchProfile();
      } else {
        toast.error((data as ApiErrorResponse).message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Server error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data: ChangePasswordResponse | ApiErrorResponse = await res.json();
      if (res.ok && "success" in data && data.success) {
        toast.success("Password changed successfully");
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error((data as ApiErrorResponse).message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password change error:", err);
      toast.error("Server error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) {
      toast.error("User ID not found");
      return;
    }

    try {
      const isAdmin = user.role === "admin";
      const userIdToDelete = user._id;

      const url = isAdmin
        ? `${import.meta.env.VITE_BACK_URL}/auth/delete/${userIdToDelete}`
        : `${import.meta.env.VITE_BACK_URL}/auth/delete-account`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: authorizationToken,
        },
      });

      const data: DeleteAccountResponse | ApiErrorResponse = await res.json();
      if (res.ok && "success" in data && data.success) {
        toast.success("Account deleted successfully");
        logout();
        navigate("/");
      } else {
        toast.error((data as ApiErrorResponse).message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Server error");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACK_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: authorizationToken },
        }
      );
      if (response.status === 200) {
        toast.success("Logged out successfully");
      }
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      console.error("Logout error:", err);
      toast.error(err.response?.data?.message || "Failed to logout");
    }

    logout();
    navigate("/");
  };

  const formatRole = (role: string): string => {
    const map: { [key: string]: string } = {
      user: "Donor",
      volunteer: "Volunteer",
      admin: "Admin",
      dealer: "Dealer",
      recycler: "Recycler",
    };
    return map[role.toLowerCase()] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatRolesDisplay = (roles?: string[]): string => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return "No Role";
    }

    const formattedRoles = roles.map(formatRole);

    // Special case: if both Donor and Volunteer present, join with " || "
    if (formattedRoles.includes("Donor") && formattedRoles.includes("Volunteer") && formattedRoles.length === 2) {
      return "Donor || Volunteer";
    }

    return formattedRoles.join(", ");
  };

  return (
    <div className="w-full max-w-md md:max-w-lg mx-auto p-6">
      {/* Profile Header */}
      <div className="flex flex-col border-green-500 items-center mb-6 space-y-3">
        <img
          src={
            previewImage
              ? previewImage
              : user?.profileImage
              ? user.profileImage.startsWith("http")
                ? user.profileImage
                : `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${user.profileImage}`
              : "/img/profile-img.webp"
          }
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover shadow-md"
        />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">
            {user?.firstName || user?.name || "Unknown User"} {user?.lastName || ""}
          </p>
          <p className="text-sm text-violet-500 capitalize">
            {user?.roles && (
              <span className="text-sm font-medium text-center mt-5 block">
                {formatRolesDisplay(user.roles)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-3">
        <div
          onClick={() => setShowProfileModal(true)}
          className="flex items-center justify-between p-3 bg-white rounded-xl shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FaUser className="text-green-600" />
            <span className="text-sm font-medium">Profile Details</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow">
          <div className="flex items-center gap-3">
            <FaBell className="text-green-600" />
            <span className="text-sm font-medium">Notifications</span>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={notificationsOn}
              onChange={handleNotificationToggle}
            />
            <div className="relative w-12 h-6 bg-red-300 peer-checked:bg-green-300 rounded-full transition-colors duration-300">
              <div
                className="absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: notificationsOn ? '#15803d' : '#dc2626',
                  transform: notificationsOn ? 'translateX(1.25rem)' : 'translateX(0)',
                }}
              ></div>
            </div>
          </label>
        </div>

        <div
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center justify-between p-3 bg-white rounded-xl shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FaKey className="text-green-600" />
            <span className="text-sm font-medium">Change Password</span>
          </div>
        </div>

        <div
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center justify-between p-3 bg-white rounded-xl shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FaTrash className="text-green-600" />
            <span className="text-sm font-medium">Delete Account</span>
          </div>
        </div>

        <div
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center justify-between p-3 bg-white rounded-xl shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FaSignOutAlt className="text-green-600" />
            <span className="text-sm font-medium">Logout</span>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-[90%] max-w-sm shadow-2xl relative transition-all duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-4 text-2xl font-semibold text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ×
            </button>

            {/* Profile Image Upload */}
            <div className="flex flex-col border-green-500 items-center mt-2 relative">
              <img
                src={
                  previewImage
                    ? previewImage
                    : user?.profileImage
                    ? user.profileImage.startsWith("http")
                      ? user.profileImage
                      : `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${user.profileImage}`
                    : "/img/profile-img.webp"
                }
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover shadow-md"
              />
              <label
                htmlFor="profile-upload"
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/4 bg-green-600 p-1.5 rounded-full cursor-pointer hover:bg-green-700 transition"
              >
                <CameraIcon className="h-5 w-5 text-white" />
              </label>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Role Label */}
            <span className="text-sm font-medium text-green-700 text-center mt-5 block">
              {formatRolesDisplay(user?.roles)}
            </span>

            {/* Form Inputs */}
            <div className="mt-6 space-y-4">
              {/* First Name */}
              <div className="relative">
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full bg-gray-100 p-3 pl-10 text-sm rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
                <User className="absolute left-3 top-3.5 text-green-600" />
              </div>

              {/* Last Name */}
              <div className="relative">
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full bg-gray-100 p-3 pl-10 text-sm rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
                <User className="absolute left-3 top-3.5 text-green-600" />
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full bg-gray-100 p-3 pl-10 text-sm rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
                <Phone className="absolute left-3 top-3.5 text-green-600" />
              </div>

              {/* Email (read-only) */}
              <div className="relative">
                <input
                  type="email"
                  value={newEmail}
                  readOnly
                  disabled
                  placeholder="Email"
                  className="w-full bg-gray-100 p-3 pl-10 text-sm rounded-xl text-gray-500 cursor-not-allowed"
                />
                <Mail className="absolute left-3 top-3.5 text-green-600" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="mt-6 w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProfile ? (
                <Loader className="h-5 w-5 animate-spin text-white mx-auto" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-[90%] max-w-sm shadow-2xl relative transition-all duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-3 right-4 text-2xl font-semibold text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ×
            </button>

            {/* Heading */}
            <div className="text-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Change Password</h2>
              <p className="text-xs text-gray-500 mt-1">Keep your account secure by updating your password regularly.</p>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              {/* Old Password */}
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Old Password"
                  value={currentPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-100 p-3 pl-4 pr-10 text-sm rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-green-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-100 p-3 pl-4 pr-10 text-sm rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-green-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-100 p-3 pl-4 pr-10 text-sm rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-green-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleChangePassword}
              disabled={
                isChangingPassword ||
                !currentPassword.trim() ||
                !newPassword.trim() ||
                !confirmPassword.trim()
              }
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? (
                <Loader className="h-5 w-5 animate-spin text-white mx-auto" />
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl w-[420px] max-w-[95%] shadow-xl relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-2 right-4 text-2xl text-gray-400"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold text-red-600 text-center mb-4">
              Delete Account?
            </h2>

            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to permanently delete your account? This action cannot be undone.
            </p>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl w-[420px] max-w-[95%] shadow-xl relative">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-2 right-4 text-2xl text-gray-400"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold text-green-700 text-center mb-4">
              Logout?
            </h2>

            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to logout from your account?
            </p>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-lg bg-green-600 text-white font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;