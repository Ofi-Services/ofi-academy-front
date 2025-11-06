
import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import AuthenticatedLayout from "@/shared/components/common/AuthenticatedLayout"
import TrainingCalendar from "@/shared/components/common/calendar/CalendarSummary"
import TrainingResources from "../pages/TrainingResoursesPage"
import WorkInProgress from "@/shared/components/common/WorkInProgressPage"


// Consultant pages
const Schedule = () => <TrainingCalendar />
const Resources = () =><TrainingResources />
const Forums = () => <WorkInProgress />

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