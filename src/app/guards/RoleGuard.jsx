import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

export function RoleGuard({ role }){
  const user = useAuthStore(s => s.user);

  if(!user) return <Navigate to="/login" replace />;
  if(user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
