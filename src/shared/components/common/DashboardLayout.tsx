
import { ReactNode } from "react"
import Sidebar from "./Sidebar"
import { NavSection } from "@/shared/config/navigation.config"
import Header from "./Header"

interface DashboardLayoutProps {
  children: ReactNode
  navigation: NavSection[]
  onLogout: () => void
}

export default function DashboardLayout({ children, navigation, onLogout }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background/96 text-foreground">
      <Sidebar navigation={navigation} onLogout={onLogout} />
      <div className="flex-1 flex flex-col">
        <Header navigation={navigation} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}