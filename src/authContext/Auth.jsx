/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthContext export for useAuth hook
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    try {
      const userData = sessionStorage.getItem("userData");
      return userData && userData !== "undefined" ? JSON.parse(userData) : null;
    } catch {
      sessionStorage.removeItem("userData"); // Clear invalid data
      return null;
    }
  });
  const [role, setRole] = useState(() => sessionStorage.getItem("role") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.roles?.includes("admin") ?? false;
  const isVolunteer = user?.roles?.includes("volunteer") ?? false;
  const isUser = user?.roles?.includes("user") ?? false;

  const authorizationToken = useMemo(() => (token ? `Bearer ${token}` : null), [token]);

  const storeToken = useCallback((newToken, userData, userRoles) => {
    if (!newToken || !userData || !userRoles) {
      toast.error("Invalid authentication data provided.");
      return;
    }

    const fullUser = {
      ...userData,
      _id: userData.id || userData._id || userData.userId, // Handle different ID formats
      roles: userData.roles || userRoles, // Ensure roles array is populated
    };

    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("userData", JSON.stringify(fullUser));
    sessionStorage.setItem("roles", userRoles);

    setToken(newToken);
    setUser(fullUser);
    setRole(userRoles);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    // toast.info("Logged out successfully.");
  }, []);

  const authenticateUser = useCallback(async () => {
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/auth/auth`, {
        headers: { Authorization: authorizationToken },
      });

      const userData = res.data?.user || res.data;
      if (!userData?.roles) {
        throw new Error("Invalid user data received.");
      }

      // Update user and role in state and sessionStorage
      setUser(userData);
      setRole(userData.role);
      setIsAuthenticated(true);

      sessionStorage.setItem("userData", JSON.stringify(userData));
      sessionStorage.setItem("role", userData.role);
    } catch (error) {
      console.error("Authentication error:", error);
      logout();
      const status = error.response?.status;
      let message = "Session expired. Please log in again.";
      if (status === 404) message = "User not found.";
      else if (error.response?.data?.message) message = error.response.data.message;

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token, authorizationToken, logout]);

  useEffect(() => {
    authenticateUser();
  }, [authenticateUser]);

  useEffect(() => {
    if (!token) return;

    const checkExpiry = () => {
      try {
        if (!token.includes(".")) {
          throw new Error("Invalid token format.");
        }
        const { exp } = JSON.parse(atob(token.split(".")[1]));
        const expiry = exp * 1000;
        if (Date.now() >= expiry - 60000) {
          logout();
          toast.error("Session expired. Please log in again.");
        }
      } catch (error) {
        logout();
        toast.error(error.message || "Invalid token. Please log in again.");
      }
    };

    const interval = setInterval(checkExpiry, 30000);
    return () => clearInterval(interval);
  }, [token, logout]);

  const value = useMemo(
    () => ({
      token,
      user: user || {},
      userId: user?._id || null,
      roles: user?.roles || [],
      role, // Optional: for legacy compatibility
      isAuthenticated,
      loading,
      storeToken,
      logout,
      authorizationToken,
      isRole: (expected) => user?.roles?.includes(expected) ?? false,
      isAdmin,
      isVolunteer,
      isUser,
    }),
    [token, user, role, isAdmin, isVolunteer, isUser, isAuthenticated, loading, storeToken, logout, authorizationToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};