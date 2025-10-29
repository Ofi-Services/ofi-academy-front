
import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import AuthenticatedLayout from "@/shared/components/common/AuthenticatedLayout"

// Leader components
import LeaderDashboard from "../pages/LeaderPage"

// Leader pages
const LeaderReports = () => <div>Leader Reports Page</div>
const LeaderPlans = () => <div>Leader Training Plans Page</div>
const LeaderCertificates = () => <div>Leader Certificates Page</div>
const LeaderMessages = () => <div>Leader Messages Page</div>
const LeaderResources = () => <div>Leader Resources Page</div>

/**
 * Leader Routes
 * All routes that leader users can access
 */
export const leaderRoutes = (
  <>
    <Route
      path="/leader/dashboard"
      element={
        <ProtectedRoute allowedRoles={["leader"]}>
          <AuthenticatedLayout>
            <LeaderDashboard />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/leader/reports"
      element={
        <ProtectedRoute allowedRoles={["leader"]}>
          <AuthenticatedLayout>
            <LeaderReports />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/leader/plans"
      element={
        <ProtectedRoute allowedRoles={["leader"]}>
          <AuthenticatedLayout>
            <LeaderPlans />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/leader/certificates"
      element={
        <ProtectedRoute allowedRoles={["leader"]}>
          <AuthenticatedLayout>
            <LeaderCertificates />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/leader/messages"
      element={
        <ProtectedRoute allowedRoles={["leader"]}>
          <AuthenticatedLayout>
            <LeaderMessages />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/leader/resources"
      element={
        <ProtectedRoute allowedRoles={["leader"]}>
          <AuthenticatedLayout>
            <LeaderResources />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
  </>
)