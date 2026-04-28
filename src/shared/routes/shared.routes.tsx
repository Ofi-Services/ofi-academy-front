
import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import AuthenticatedLayout from "../components/common/AuthenticatedLayout"
import TrainingTracksDashboard from "../components/common/CoursesDashboard"
import WorkInProgress from "../components/common/WorkInProgressPage"
import CatalogPage from "@/modules/consultant/pages/CatalogPage"

// Shared pages (accessible by all authenticated users)
const Support = () => <WorkInProgress />
const Settings = () => <WorkInProgress />

/**
 * Shared Routes
 * Routes accessible by all authenticated users regardless of role
 */
export const sharedRoutes = (
  <>
    <Route
      path="/courses"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <TrainingTracksDashboard />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/catalog"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <CatalogPage />
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