import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { baseApi } from "@/core/api/baseApi";
import { coursesApi } from "@/shared/store/coursesApi";
import { leaderApi } from "@/modules/leader/store/leaderApi";

type UserRole = "Talent" | "Leader" | "HR";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region?: string;
  title?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSamlCallback = useCallback(async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    try {
      console.log("[AuthProvider] Processing SAML callback with tokens");
      
      // Store tokens
      localStorage.setItem("ofi_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("ofi_refresh_token", refreshToken);
      }

      // Fetch user data from backend profile endpoint
      const response = await fetch(
        "https://ofiacademy.api.sofiatechnology.ai/api/auth/profile/",
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[AuthProvider] Profile fetch failed:", response.status, errorText);
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data = await response.json();
      console.log("[AuthProvider] User data received:", data);

      // Handle role mapping - backend returns role name, frontend expects specific role types
      let userRole: UserRole = "Talent";
      if (data.role) {
        const roleLower = data.role.toLowerCase();
        if (roleLower.includes("leader") || roleLower.includes("lead")) {
          userRole = "Leader";
        } else if (roleLower.includes("hr") || roleLower.includes("human resources")) {
          userRole = "HR";
        } else {
          userRole = "Talent";
        }
      }

      const userData: User = {
        id: String(data.id),
        name:
          data.first_name || data.last_name
            ? `${data.first_name || ""} ${data.last_name || ""}`.trim()
            : data.username || data.email || "User",
        email: data.email || data.username || "",
        role: userRole,
        region: data.region,
        title: data.title,
        avatar: "/default-avatar.png",
      };

      console.log("[AuthProvider] Processed user data:", userData);

      setUser(userData);
      localStorage.setItem("ofi_user", JSON.stringify(userData));

      // Remove tokens from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Navigate based on role
      if (userData.role === "Talent") {
        navigate("/courses");
      } else if (userData.role === "Leader") {
        navigate("/leader/dashboard");
      } else if (userData.role === "HR") {
        navigate("/hr/dashboard");
      } else {
        navigate("/courses");
      }
    } catch (error) {
      console.error("[AuthProvider] SAML callback error:", error);
      // Clear tokens on error
      localStorage.removeItem("ofi_token");
      localStorage.removeItem("ofi_refresh_token");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check for SAML callback tokens in URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access");
    const refreshToken = urlParams.get("refresh");

    if (accessToken && refreshToken) {
      console.log("[AuthProvider] SAML tokens detected in URL");
      // Handle SAML callback
      handleSamlCallback(accessToken, refreshToken);
      return;
    }

    // Check for stored user
    const storedUser = localStorage.getItem("ofi_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("[AuthProvider] Error parsing stored user:", error);
        localStorage.removeItem("ofi_user");
      }
    }
    setIsLoading(false);
  }, [handleSamlCallback]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://ofiacademy.api.sofiatechnology.ai/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        console.error("[AuthProvider] Login failed:", response.statusText);
        setIsLoading(false);
        return false;
      }

      const data = await response.json();

      const userData: User = {
        id: String(data.user.id),
        name:
          data.user.first_name || data.user.last_name
            ? `${data.user.first_name} ${data.user.last_name}`.trim()
            : data.user.username,
        email: data.user.email || data.user.username,
        role: data.user.role,
        avatar: "/default-avatar.png",
      };

      setUser(userData);
      localStorage.setItem("ofi_user", JSON.stringify(userData));
      localStorage.setItem("ofi_token", data.access);

      if (userData.role === "Talent") {
        navigate("/courses");
      } else if (userData.role === "Leader") {
        navigate("/leader/dashboard");
      } else if (userData.role === "HR") {
        navigate("/hr/dashboard");
      }

      return true;
    } catch (error) {
      console.error("[AuthProvider] Network or parsing error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ofi_user");
    localStorage.removeItem("ofi_token");
    
    dispatch(baseApi.util.resetApiState());
    dispatch(coursesApi.util.resetApiState());
    dispatch(leaderApi.util.resetApiState());
    
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}