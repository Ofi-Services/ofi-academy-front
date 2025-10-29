
import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import AuthenticatedLayout from "@/shared/components/common/AuthenticatedLayout"


// Consultant pages
const Schedule = () => <div>Schedule Page</div>
const Resources = () => <div>Resources Page</div>
const Forums = () => <div>Forums Page</div>

/**
 * Consultant Routes
 * All routes that consultant users can access
 */
export const consultantRoutes = (
  <>
    
    <Route
      path="/schedule"
      element={
        <ProtectedRoute allowedRoles={["consultant"]}>
          <AuthenticatedLayout>
            <Schedule />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
    
    <Route
      path="/resources"
      element={
        <ProtectedRoute allowedRoles={["consultant"]}>
          <AuthenticatedLayout>
            <Resources />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
    
    <Route
      path="/forums"
      element={
        <ProtectedRoute allowedRoles={["consultant"]}>
          <AuthenticatedLayout>
            <Forums />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
  </>
)