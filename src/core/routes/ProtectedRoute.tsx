import { useAuth } from "@/shared/hooks/use-auth"
import { Navigate, useLocation } from "react-router-dom"
import { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si no se especifican roles, la ruta es accesible para todos los usuarios autenticados
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>
  }

  // Si se especifican roles, verificar que el usuario tenga uno de ellos
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate page based on user role
    const redirectPaths: Record<string, string> = {
      consultant: "/courses",
      leader: "/dashboard",
      superuser: "/superuser/dashboard",
    }
    
    return <Navigate to={redirectPaths[user.role] || "/courses"} replace />
  }

  return <>{children}</>
}