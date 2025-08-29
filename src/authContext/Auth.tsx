import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "react-toastify";

// Define interfaces for types
interface User {
  _id?: string;
  id?: string;
  userId?: string;
  roles?: string[];
  [key: string]: any; // For additional user properties
}

interface AuthContextType {
  token: string | null;
  user: User;
  userId: string | null;
  roles: string[];
  role: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  storeToken: (newToken: string, userData: User, userRoles: string[]) => void;
  logout: () => void;
  authorizationToken: string | null;
  isRole: (expected: string) => boolean;
  isAdmin: boolean;
  isVolunteer: boolean;
  isUser: boolean;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthContext export for useAuth hook
export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem("token") || null
  );
  const [user, setUser] = useState<User | null>(() => {
    try {
      const userData = sessionStorage.getItem("userData");
      return userData && userData !== "undefined" ? JSON.parse(userData) : null;
    } catch {
      sessionStorage.removeItem("userData"); // Clear invalid data
      return null;
    }
  });
  const [role, setRole] = useState<string | null>(
    () => sessionStorage.getItem("role") || null
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin = user?.roles?.includes("admin") ?? false;
  const isVolunteer = user?.roles?.includes("volunteer") ?? false;
  const isUser = user?.roles?.includes("user") ?? false;

  const authorizationToken = useMemo(
    () => (token ? `Bearer ${token}` : null),
    [token]
  );

  const storeToken = useCallback(
    (newToken: string, userData: User, userRoles: string[]) => {
      if (!newToken || !userData || !userRoles) {
        toast.error("Invalid authentication data provided.");
        return;
      }

      const fullUser: User = {
        ...userData,
        _id: userData.id || userData._id || userData.userId, // Handle different ID formats
        roles: userData.roles || userRoles, // Ensure roles array is populated
      };

      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("userData", JSON.stringify(fullUser));
      sessionStorage.setItem("roles", JSON.stringify(userRoles));

      setToken(newToken);
      setUser(fullUser);
      setRole(userRoles.join(",")); // Assuming roles is stored as a comma-separated string
      setIsAuthenticated(true);
    },
    []
  );

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
      const res = await axios.get<{ user: User }>(
        `http://localhost:5000/auth/auth`,
        {
          headers: { Authorization: authorizationToken },
        }
      );

      const userData = res.data?.user || res.data;
      if (!userData?.roles) {
        throw new Error("Invalid user data received.");
      }

      // Update user and role in state and sessionStorage
      setUser(userData);
      setRole(userData.roles.join(",")); // Assuming roles is stored as a comma-separated string
      setIsAuthenticated(true);

      sessionStorage.setItem("userData", JSON.stringify(userData));
      sessionStorage.setItem("role", userData.roles.join(","));
    } catch (error: any) {
      console.error("Authentication error:", error);
      logout();
      const status = error.response?.status;
      let message = "Session expired. Please log in again.";
      if (status === 404) message = "User not found.";
      else if (error.response?.data?.message)
        message = error.response.data.message;

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
      } catch (error: any) {
        logout();
        toast.error(error.message || "Invalid token. Please log in again.");
      }
    };

    const interval = setInterval(checkExpiry, 30000);
    return () => clearInterval(interval);
  }, [token, logout]);

  const value = useMemo<AuthContextType>(
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
      isRole: (expected: string) => user?.roles?.includes(expected) ?? false,
      isAdmin,
      isVolunteer,
      isUser,
    }),
    [
      token,
      user,
      role,
      isAdmin,
      isVolunteer,
      isUser,
      isAuthenticated,
      loading,
      storeToken,
      logout,
      authorizationToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
