import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { T, CM, STYLES } from "../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../constants/seed";
import { VERTICALS, getVertical } from "../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../utils/format";
import { pointInPoly } from "../../utils/geo";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../shared/components";

export const getAdminNav = (vl) => [
  {id:"home",   label:"🏠 Home"},
  {id:"sucursales", label:`${vl.nav_branches||"🏪 Sucursales"}`},
  {id:"productos",  label:vl.nav_products||"🍽️ Productos"},
  {id:"categorias", label:`🗂️ ${vl.categoryPlural||vl.category||"Categorías"}`},
  {id:"stock",      label:vl.nav_stock||"📦 Fuera de stock"},
  {id:"diseno",     label:vl.nav_design||"🎨 Diseño"},
  {id:"banners",    label:"🎯 Banners"},
  {id:"delivery",   label:vl.nav_delivery||"🛵 Pedidos"},
  {id:"informes",   label:"📊 Informes"},
  {id:"ai",         label:"🤖 Asistente IA"},
  {id:"facturacion",label:"💳 Facturación"},
];

export function AdminSidebar({active,onSelect,billing,newOrders,user,onLogout,isOpen,onClose,vertical}){
  const plan=billing?.plan||"pro";
  const planColor={starter:T.blue,pro:T.violet,business:T.pink}[plan]||T.coral;
  const vl = vertical?.labels || VERTICALS.restaurant.labels;
  const nav = getAdminNav(vl);
  return <>
    {/* Overlay mobile */}
    {isOpen&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:98,display:"none"}} className="mob-overlay"/>}
    <nav className={`admin-sidebar${isOpen?" open":""}`} style={{width:220,flexShrink:0,background:T.white,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflowY:"auto"}}>
    <div style={{padding:"20px 16px 14px",borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:12,background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="22" height="22" viewBox="0 0 38 38" fill="none">
            <rect x="7" y="6" width="10" height="26" rx="5" fill="white"/>
            <rect x="21" y="6" width="10" height="14" rx="5" fill={T.coral}/>
            <rect x="21" y="24" width="10" height="8" rx="4" fill={T.coral} opacity=".6"/>
          </svg>
        </div>
        <div>
          <div style={{color:T.navy,fontWeight:900,fontSize:16,letterSpacing:"-.2px"}}>Pick<span style={{color:T.coral}}>u</span></div>
          <div style={{background:planColor+"18",color:planColor,borderRadius:20,padding:"1px 8px",fontSize:9,fontWeight:800,display:"inline-block",marginTop:2,textTransform:"uppercase"}}>Plan {plan}</div>
        </div>
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
      {nav.map(item=>{
        const badge=item.id==="delivery"&&newOrders>0?newOrders:0;
        const isActive=active===item.id;
        return <div key={item.id} onClick={()=>onSelect(item.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,cursor:"pointer",background:isActive?T.coralL:"transparent",marginBottom:2,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=isActive?T.coralL:T.bg} onMouseLeave={e=>e.currentTarget.style.background=isActive?T.coralL:"transparent"}>
          <span style={{fontSize:13,fontWeight:isActive?700:500,color:isActive?T.coralD:T.mid}}>{item.label}</span>
          {badge>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:T.amber,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{badge}</span>}
        </div>;
      })}
    </div>
    <div style={{padding:"14px 16px",borderTop:`1px solid ${T.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${T.coral},${T.coralD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{user.avatar}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:T.text,fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
          <div style={{color:T.light,fontSize:9}}>{user.title}</div>
        </div>
        <button onClick={onLogout} style={{background:T.redL,border:"none",borderRadius:7,color:T.red,fontSize:11,padding:"4px 7px",cursor:"pointer"}}>⏻</button>
      </div>
    </div>
    <button onClick={onClose} className="mob-close-btn" style={{display:"none",position:"absolute",top:12,right:12,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.mid,fontSize:18,width:32,height:32,cursor:"pointer",alignItems:"center",justifyContent:"center"}}>×</button>
  </nav>
  </>;
}

/* ─── ADMIN: HOME ─────────────────────────────────────────── */
