
import { ReactNode } from "react"
import { useAuth } from "@/shared/hooks/use-auth"
import DashboardLayout from "./DashboardLayout"
import { CONSULTANT_NAV, LEADER_NAV, SUPERUSER_NAV } from "@/shared/config/navigation.config"

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  // Selecciona el navigation según el rol del usuario
  let navigation
  switch (user.role) {
    case "Talent":
      navigation = CONSULTANT_NAV
      break
    case "Leader":
      navigation = LEADER_NAV
      break
    case "superuser":
      navigation = SUPERUSER_NAV
      break
    default:
      navigation = CONSULTANT_NAV
  }

  return (
    <DashboardLayout navigation={navigation} onLogout={logout}>
      {children}
    </DashboardLayout>
  )
}