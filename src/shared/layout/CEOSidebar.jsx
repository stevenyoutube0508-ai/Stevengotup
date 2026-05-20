import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { BarChart3, Store, Plus, DollarSign, Ticket, Settings, AlertTriangle, LogOut } from "lucide-react";
import { LogoFull } from "../components/Logo";
import { T, CM, STYLES } from "../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../constants/seed";
import { VERTICALS, getVertical } from "../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../utils/format";
import { pointInPoly } from "../../utils/geo";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../shared/components";

export const CEO_NAV = [
  {id:"ceo_dash",label:"Dashboard",icon:BarChart3},
  {id:"ceo_restaurantes",label:"Negocios",icon:Store},
  {id:"ceo_onboarding",label:"Nuevo negocio",icon:Plus},
  {id:"ceo_pagos",label:"Pagos",icon:DollarSign},
  {id:"ceo_soporte",label:"Soporte",icon:Ticket},
  {id:"ceo_plataforma",label:"Configuración",icon:Settings},
];

export function CEOSidebar({active,onSelect,restaurants,tickets,onLogout,user,pendingPayments}){
  const suspended=restaurants.filter(r=>r.status==="suspended").length;
  const openT=tickets.filter(t=>t.status==="open").length;
  return <nav style={{width:230,background:T.white,borderRight:`1px solid ${T.border}`,minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0}}>
    <div style={{padding:"20px 16px 14px",borderBottom:`1px solid ${T.border}`}}>
      <div style={{marginBottom:3}}>
        <LogoFull height={32}/>
        <div style={{color:T.light,fontSize:9,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginTop:4,marginLeft:2}}>CEO Panel</div>
      </div>
      {(suspended>0||openT>0)&&<div style={{marginTop:8,background:T.redL,border:`1px solid ${T.red}20`,borderRadius:8,padding:"6px 10px"}}>
        {suspended>0&&<div style={{fontSize:10,fontWeight:700,color:T.red,display:"flex",alignItems:"center",gap:4}}><AlertTriangle size={10}/> {suspended} negocio{suspended>1?"s":""} suspendido{suspended>1?"s":""}</div>}
        {openT>0&&<div style={{fontSize:10,fontWeight:700,color:T.amber,marginTop:suspended>0?2:0,display:"flex",alignItems:"center",gap:4}}><Ticket size={10}/> {openT} ticket{openT>1?"s":""} abierto{openT>1?"s":""}</div>}
      </div>}
    </div>
    <div style={{flex:1,padding:"12px 8px",overflowY:"auto"}}>
      {CEO_NAV.map(item=>{
        const badge=(item.id==="ceo_soporte"&&openT>0)?openT:(item.id==="ceo_restaurantes"&&suspended>0)?suspended:(item.id==="ceo_pagos"&&pendingPayments>0)?pendingPayments:0;
        const isActive=active===item.id;
        return <div key={item.id} onClick={()=>onSelect(item.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,cursor:"pointer",background:isActive?T.coralL:"transparent",marginBottom:2,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=isActive?T.coralL:T.bg} onMouseLeave={e=>e.currentTarget.style.background=isActive?T.coralL:"transparent"}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <item.icon size={16}/>
            <span style={{fontSize:13,fontWeight:isActive?700:500,color:isActive?T.coralD:T.mid}}>{item.label}</span>
          </div>
          {badge>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:item.id==="ceo_soporte"?T.amber:item.id==="ceo_pagos"?T.green:T.red,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{badge}</span>}
        </div>;
      })}
    </div>
    <div style={{padding:"14px 16px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${T.coral},${T.coralD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{user.avatar}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:T.text,fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
        <div style={{color:T.light,fontSize:9}}>CEO & Fundador</div>
      </div>
      <button onClick={onLogout} style={{background:T.redL,border:"none",borderRadius:7,color:T.red,padding:"5px 7px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><LogOut size={13}/></button>
    </div>
  </nav>;
}

/* ─── CEO: DASHBOARD ──────────────────────────────────────── */
