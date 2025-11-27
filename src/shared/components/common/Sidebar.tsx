
import { NavSection } from "@/shared/config/navigation.config"
import SidebarItem from "./SidebarItem"
import { useTheme } from "@/shared/hooks/useTheme"

interface SidebarProps {
  navigation: NavSection[]
  onLogout: () => void
}

export default function Sidebar({ navigation, onLogout }: SidebarProps) {
  const { theme } = useTheme()

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <figure>
          <img
              src={theme === "dark" ? "/ofi-original-white.svg" : "/ofi-original.svg"}
              alt="OFI logo"
              className="h-12 w-12"
            />
          </figure>
          <h1 className="text-xl font-bold">Academy</h1>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto">
        {navigation.map((section, idx) => (
          <div key={idx} className="p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item, itemIdx) => (
                <SidebarItem key={itemIdx} item={item} />
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-auto p-4 border-t border-border">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}