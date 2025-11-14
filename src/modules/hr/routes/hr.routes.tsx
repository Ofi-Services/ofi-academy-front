import { Route } from "react-router-dom";
import RoleRoute from "@/core/routes/RoleRoute";
import LeaderDashboard from "@/modules/leader/pages/LeaderPage";
import TrainingCalendar from "@/shared/components/common/calendar/CalendarSummary";

const role = ["HR"];

const hrPages = [
  { path: "/hr/dashboard", element: <LeaderDashboard /> },
  { path: "/hr/reports", element: <div>Leader Reports Page</div> },
  { path: "/hr/plans", element: < TrainingCalendar /> },
  { path: "/hr/certificates", element: <div>Leader Certificates Page</div> },
  { path: "/hr/messages", element: <div>Leader Messages Page</div> },
  { path: "/hr/resources", element: <div>Leader Resources Page</div> },
];

export const hrRoutes = hrPages.map(({ path, element }) => (
  <Route key={path} path={path} element={<RoleRoute allowedRoles={role}>{element}</RoleRoute>} />
));
