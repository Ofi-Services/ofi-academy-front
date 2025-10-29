import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

type UserRole = "consultant" | "leader" | "superuser";

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
      const response = await fetch("https://5796fe4b3787.ngrok-free.app/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error("[AuthProvider] Login failed:", response.statusText);
        setIsLoading(false);
        return false;
      }

      const data = await response.json();

      // Espera que el backend devuelva algo como:
      // { user: { id, name, email, role, avatar }, token: "..." }
      const userData: User = data.user;
      setUser(userData);
      localStorage.setItem("ofi_user", JSON.stringify(userData));
      localStorage.setItem("ofi_token", data.token);

      // Redirección según el rol
      if (userData.role === "consultant") {
        navigate("/dashboard");
      } else if (userData.role === "leader") {
        navigate("/leader/dashboard");
      } else if (userData.role === "superuser") {
        navigate("/superuser/dashboard");
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
