
import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import AuthenticatedLayout from "../components/common/AuthenticatedLayout"
import CoursesDashboard from "../components/common/CoursesDashboard"

// Shared pages (accessible by all authenticated users)
const Support = () => <div>Support Page</div>
const Settings = () => <div>Settings Page</div>

/**
 * Shared Routes
 * Routes accessible by all authenticated users regardless of role
 */
export const sharedRoutes = (
  <>
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <CoursesDashboard />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/support"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Support />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Settings />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
  </>
)