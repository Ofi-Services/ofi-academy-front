import { useAuth } from "@/shared/hooks/use-auth";
import { useLocation } from "react-router-dom";
import { NavSection } from "@/shared/config/navigation.config";
import { useTheme } from "@/shared/hooks/useTheme";

interface HeaderProps {
  navigation: NavSection[];
}

export function Header({ navigation }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Find the active navigation item based on current path
  const getActivePageTitle = (): string | null => {
    // First try exact match
    for (const section of navigation) {
      const exactMatch = section.items.find(
        (item) => item.path === location.pathname
      );
      if (exactMatch) return exactMatch.label;
    }

    // If no exact match, try partial match (for nested routes)
    // e.g., /leader/dashboard/123 should match /leader/dashboard
    for (const section of navigation) {
      const partialMatch = section.items.find((item) =>
        location.pathname.startsWith(item.path + "/") ||
        (item.path !== "/" && location.pathname.startsWith(item.path))
      );
      if (partialMatch) return partialMatch.label;
    }

    return null;
  };

  const activePageTitle = getActivePageTitle();

  if (!user) return null;

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/60 backdrop-blur px-6 py-4 w-full">
      {/* Active Page Title - Left Side */}
      {activePageTitle && (
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-semibold text-foreground">
            {activePageTitle}
          </h2>
        </div>
      )}

      {/* User Info - Right Side */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="toggle-btn"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          data-theme={theme === "dark" ? "dark" : "light"}
        >
          <div className="sun-rays" />
          <div className="main-circle" />
        </button>

        <div className="text-right">
          <div className="text-sm font-semibold">{user.name}</div>
          <div className="text-xs text-muted-foreground">
            {user.title && <span>{user.title}</span>}
            {user.title && user.region && <span className="mx-1">•</span>}
            {user.region && <span>{user.region}</span>}
          </div>
        </div>

        <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold uppercase">
          {user.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("") || "OF"}
        </div>
      </div>
    </header>
  );
}

export default Header;


