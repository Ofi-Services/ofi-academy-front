import { Route } from "react-router-dom";
import RoleRoute from "@/core/routes/RoleRoute";
import LeaderDashboard from "../pages/LeaderPage";
import TrainingCalendar from "@/shared/components/common/calendar/CalendarSummary";

const role = ["Leader"];

const leaderPages = [
  { path: "/leader/dashboard", element: <LeaderDashboard /> },
  { path: "/leader/reports", element: <div>Leader Reports Page</div> },
  { path: "/leader/plans", element: < TrainingCalendar /> },
  { path: "/leader/certificates", element: <div>Leader Certificates Page</div> },
  { path: "/leader/messages", element: <div>Leader Messages Page</div> },
  { path: "/leader/resources", element: <div>Leader Resources Page</div> },
];

export const leaderRoutes = leaderPages.map(({ path, element }) => (
  <Route key={path} path={path} element={<RoleRoute allowedRoles={role}>{element}</RoleRoute>} />
));
