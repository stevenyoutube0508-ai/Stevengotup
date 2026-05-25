import { useState } from "react";
import {
  Home, Store, Utensils, FolderOpen, Package, Paintbrush, Target,
  Bike, BarChart3, Bot, CreditCard, LogOut, Users, CalendarDays, KeyRound,
  Shirt, Wrench, Gamepad2, Sparkles, Smartphone, ShoppingCart, PawPrint, Briefcase,
} from "lucide-react";

/** Icono del catálogo según el tipo de negocio */
const CATALOG_ICON = {
  restaurant: Utensils,
  fashion:    Shirt,
  hardware:   Wrench,
  toys:       Gamepad2,
  beauty:     Sparkles,
  tech:       Smartphone,
  grocery:    ShoppingCart,
  pets:       PawPrint,
  services:   Briefcase,
};
import { LogoFull } from "../components/Logo";
import { T, CM, STYLES } from "../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../constants/seed";
import { VERTICALS, getVertical } from "../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../utils/format";
import { pointInPoly } from "../../utils/geo";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput, ChangePasswordModal } from "../../shared/components";

const strip = s => s?.replace(/^[^\wÀ-ɏ(]+/u, "").trim() ?? s;

export const getAdminNav = (vl, verticalId = "restaurant") => {
  const catalogIcon = CATALOG_ICON[verticalId] || Utensils;
  return [
    {id:"home",        label:"Home",                                        icon:Home},
    {id:"sucursales",  label:"Sucursales",                                  icon:Store},
    {id:"productos",   label:"Productos",                                   icon:catalogIcon},
    {id:"categorias",  label:"Categorías",                                  icon:FolderOpen},
    {id:"stock",       label:strip(vl.nav_stock)||"Fuera de stock",         icon:Package},
    {id:"diseno",      label:strip(vl.nav_design)||"Diseño",                icon:Paintbrush},
    {id:"banners",     label:"Banners",                                     icon:Target},
    {id:"delivery",    label:strip(vl.nav_delivery)||"Pedidos",             icon:Bike},
    {id:"reservas",    label:"Reservas",                                    icon:CalendarDays},
    {id:"informes",    label:"Informes",                                    icon:BarChart3},
    {id:"ai",          label:"Asistente IA",                                icon:Bot},
    {id:"facturacion", label:"Facturación",                                 icon:CreditCard},
    {id:"equipo",      label:"Equipo",                                      icon:Users},
  ];
};

export function AdminSidebar({active,onSelect,billing,newOrders,user,onLogout,isOpen,onClose,vertical,enabledServices}){
  const [showPwModal, setShowPwModal] = useState(false);
  const plan=billing?.plan||"pro";
  const planColor={starter:T.blue,pro:T.violet,business:T.pink}[plan]||T.coral;
  const vl = vertical?.labels || VERTICALS.restaurant.labels;
  const nav = getAdminNav(vl, vertical?.id || "restaurant");

  // Filter nav items based on CEO-activated services and billing plan
  const filteredNav = nav.filter(item => {
    // IA: only for pro / business plans
    if (item.id === "ai") return plan === "pro" || plan === "business";
    // If no branches yet (enabledServices=null) → show everything
    if (!enabledServices) return true;
    // Delivery/Pedidos: needs domicilios, pickup, or pedidoMesa
    if (item.id === "delivery") {
      return enabledServices.has("domicilios") || enabledServices.has("pickup") || enabledServices.has("pedidoMesa");
    }
    // Reservas: needs reservas service
    if (item.id === "reservas") return enabledServices.has("reservas");
    return true;
  });

  return <>
    {/* Overlay mobile */}
    {isOpen&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:98,display:"none"}} className="mob-overlay"/>}
    <nav className={`admin-sidebar${isOpen?" open":""}`} style={{width:220,flexShrink:0,background:T.white,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflowY:"auto"}}>
    <div style={{padding:"20px 16px 14px",borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:"flex",alignItems:"center",flexDirection:"column",justifyContent:"space-between"}}>
        <LogoFull height={48}/>
        <div style={{background:planColor+"18",color:planColor,borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:800,textTransform:"uppercase",flexShrink:0}}>Plan {plan}</div>
      </div>
    </div>
    <div style={{flex:1,padding:"12px 8px",overflowY:"auto"}}>
      {vertical&&<div style={{margin:"0 8px 10px",padding:"7px 10px",borderRadius:10,background:T.bg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:7}}>
        <span style={{fontSize:16}}>{vertical.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:T.text,fontSize:10,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{vertical.name}</div>
          <div style={{color:T.light,fontSize:9}}>{vl.catalog}</div>
        </div>
      </div>}
      {filteredNav.map(item=>{
        const badge=item.id==="delivery"&&newOrders>0?newOrders:0;
        const isActive=active===item.id;
        return <div key={item.id} onClick={()=>onSelect(item.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,cursor:"pointer",background:isActive?T.coralL:"transparent",marginBottom:2,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=isActive?T.coralL:T.bg} onMouseLeave={e=>e.currentTarget.style.background=isActive?T.coralL:"transparent"}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {item.icon&&<item.icon size={14} color={isActive?T.coralD:T.mid}/>}
            <span style={{fontSize:13,fontWeight:isActive?700:500,color:isActive?T.coralD:T.mid}}>{item.label}</span>
          </div>
          {badge>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:T.amber,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{badge}</span>}
        </div>;
      })}
    </div>
    <div style={{padding:"14px 16px",borderTop:`1px solid ${T.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <div
          onClick={()=>onSelect("perfil")}
          title="Ver mi perfil"
          style={{display:"flex",alignItems:"center",gap:9,flex:1,minWidth:0,cursor:"pointer",borderRadius:10,padding:"4px 6px",marginLeft:-6,transition:"background .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=T.bg}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
        >
          <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${T.coral},${T.coralD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{user.avatar}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:T.text,fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{color:T.light,fontSize:9}}>{user.title}</div>
          </div>
        </div>
        <button onClick={()=>setShowPwModal(true)} title="Cambiar contraseña" style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,color:T.mid,padding:"5px 7px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><KeyRound size={13}/></button>
        <button onClick={onLogout} style={{background:T.redL,border:"none",borderRadius:7,color:T.red,padding:"5px 7px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><LogOut size={13}/></button>
      </div>
    </div>
    {showPwModal&&<ChangePasswordModal onClose={()=>setShowPwModal(false)}/>}
    <button onClick={onClose} className="mob-close-btn" style={{display:"none",position:"absolute",top:12,right:12,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.mid,fontSize:18,width:32,height:32,cursor:"pointer",alignItems:"center",justifyContent:"center"}}>×</button>
  </nav>
  </>;
}

/* ─── ADMIN: HOME ─────────────────────────────────────────── */
