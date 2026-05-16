import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Login } from "./LoginPage";
import { useAuthStore } from "../stores/useAuthStore";
import { PageLoader } from "../shared/components/PageLoader";

function routeForRole(user){
  if(user?.role === "ceo") return "/ceo/dashboard";
  if(user?.role === "admin") return "/admin/home";
  return "/";
}

export default function LoginRoute(){
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const authChecked = useAuthStore(s => s.authChecked);
  const initAuth = useAuthStore(s => s.initAuth);
  const setUser = useAuthStore(s => s.setUser);

  useEffect(() => { initAuth(); }, [initAuth]);

  if(!authChecked) return <PageLoader label="Verificando sesión…" />;
  if(user) return <Navigate to={routeForRole(user)} replace />;

  return <Login onLogin={loggedUser => {
    setUser(loggedUser);
    const target = location.state?.from?.pathname || routeForRole(loggedUser);
    navigate(target, { replace: true });
  }} />;
}
