import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { T, STYLES } from "../../constants/theme";
import { fmtCOP } from "../../utils/format";
import { LogOut } from "lucide-react";
import { Btn, Toast } from "../../shared/components";
import { LogoFull } from "../../shared/components/Logo";
import { CEOSidebar } from "../../shared/layout/CEOSidebar";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";
import { useCEOStore } from "../../stores/useCEOStore";

const ROUTE_BY_ID = {
  ceo_dash: "/ceo/dashboard",
  ceo_restaurantes: "/ceo/restaurantes",
  ceo_onboarding: "/ceo/onboarding",
  ceo_pagos: "/ceo/pagos",
  ceo_soporte: "/ceo/soporte",
  ceo_plataforma: "/ceo/plataforma",
};

const ID_BY_ROUTE = Object.fromEntries(Object.entries(ROUTE_BY_ID).map(([id, path]) => [path, id]));

export default function CEOLayout(){
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const toast = useAdminStore(s => s.toast);
  const restaurants = useCEOStore(s => s.restaurants);
  const tickets = useCEOStore(s => s.tickets);
  const paymentRequests = useCEOStore(s => s.paymentRequests);
  const loadCEOData = useCEOStore(s => s.loadCEOData);

  useEffect(() => {
    if(user?.role === "ceo") loadCEOData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const active = ID_BY_ROUTE[location.pathname] || "ceo_dash";
  const pendingPayments = paymentRequests.filter(r => r.status === "pending").length;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return <>
    <style>{STYLES}</style>
    {toast && <Toast msg={toast.msg} type={toast.type}/>}
    <div style={{display:"flex",minHeight:"100vh",background:T.bg}}>
      <CEOSidebar
        active={active}
        onSelect={id => navigate(ROUTE_BY_ID[id] || "/ceo/dashboard")}
        restaurants={restaurants}
        tickets={tickets}
        onLogout={handleLogout}
        user={user}
        pendingPayments={pendingPayments}
      />
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"11px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40,boxShadow:T.sh}}>
          <div style={{display:"flex",alignItems:"center",gap:10, flexDirection:"column"}}>
            <LogoFull height={26}/>
            <div style={{display:"flex",alignItems:"center",gap:5,background:T.greenL,borderRadius:20,padding:"3px 10px"}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:T.green,display:"inline-block",animation:"pulse2 2s infinite"}}/>
              <span style={{fontSize:10,fontWeight:700,color:T.green}}>Sistema operativo</span>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:12,color:T.mid}}>
              {restaurants.filter(r => r.status === "active").length} restaurantes activos · MRR: {fmtCOP(restaurants.filter(r => r.status === "active").reduce((s,r)=>s+r.mrr,0))}
            </span>
            <Btn sm v="danger" icon={LogOut} onClick={handleLogout}>Cerrar sesión</Btn>
          </div>
        </div>
        <main style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
          <Outlet />
        </main>
      </div>
    </div>
  </>;
}
