
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
    <div className="h-screen flex bg-background/96 text-foreground overflow-hidden">
      <Sidebar navigation={navigation} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header navigation={navigation} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}