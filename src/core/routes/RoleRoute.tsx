import ProtectedRoute from "./ProtectedRoute";
import AuthenticatedLayout from "@/shared/components/common/AuthenticatedLayout";

interface RoleRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleRoute = ({ allowedRoles, children }: RoleRouteProps) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <AuthenticatedLayout>{children}</AuthenticatedLayout>
  </ProtectedRoute>
);

export default RoleRoute;
