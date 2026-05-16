import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { PageLoader } from "../../shared/components/PageLoader";

export function RootRedirect(){
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const authChecked = useAuthStore(s => s.authChecked);
  const initAuth = useAuthStore(s => s.initAuth);

  useEffect(() => { initAuth(); }, [initAuth]);

  if(location.search.includes("menu")) return <Navigate to={`/menu${location.search}`} replace />;
  if(!authChecked) return <PageLoader label="Cargando Picku…" />;
  if(!user) return <Navigate to="/login" replace />;
  if(user.role === "ceo") return <Navigate to="/ceo/dashboard" replace />;
  if(user.role === "admin") return <Navigate to="/admin/home" replace />;
  return <Navigate to="/login" replace />;
}
