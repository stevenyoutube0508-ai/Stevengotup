import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

/**
 * role puede ser un string ("admin") o un array (["admin","staff"]).
 * Si el usuario no tiene ninguno de esos roles, redirige a "/".
 */
export function RoleGuard({ role }){
  const user = useAuthStore(s => s.user);

  if(!user) return <Navigate to="/login" replace />;
  const allowed = Array.isArray(role) ? role : [role];
  if(!allowed.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
