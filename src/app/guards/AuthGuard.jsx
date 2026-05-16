import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { PageLoader } from "../../shared/components/PageLoader";

export function AuthGuard(){
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const authChecked = useAuthStore(s => s.authChecked);
  const initAuth = useAuthStore(s => s.initAuth);

  useEffect(() => { initAuth(); }, [initAuth]);

  if(!authChecked) return <PageLoader label="Verificando sesión…" />;
  if(!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
