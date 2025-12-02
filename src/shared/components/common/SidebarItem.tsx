import { NavItem } from "@/shared/config/navigation.config"
import { useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/shared/lib/utils"

interface SidebarItemProps {
  item: NavItem
}

export default function SidebarItem({ item }: SidebarItemProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = location.pathname === item.path

  const handleClick = () => {
    if (item.path.startsWith("http://") || item.path.startsWith("https://")) {
      window.open(item.path, "_blank")
      return
    }

    if (!isActive) navigate(item.path)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {item.icon && <item.icon className="h-4 w-4" />}
      <span>{item.label}</span>
    </button>
  )
}
