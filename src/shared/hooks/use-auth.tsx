import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // ← IMPORTAR
import { baseApi } from "@/core/api/baseApi"; // ← IMPORTAR
import { coursesApi } from "@/shared/store/coursesApi"; // ← IMPORTAR
import { leaderApi } from "@/modules/leader/store/leaderApi";

type UserRole = "Talent" | "Leader" | "HR";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
  const dispatch = useDispatch(); // ← AGREGAR

  useEffect(() => {
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
  }, []);

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