import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T, CM, STYLES } from "../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../constants/seed";
import { VERTICALS, getVertical } from "../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../utils/format";
import { pointInPoly } from "../../utils/geo";
import { Package, Settings, BarChart3, Globe, HardDrive, Mail, CreditCard, AlertTriangle } from "lucide-react";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../shared/components";

export function CEOPlataforma(){
  const [cfg,setCfg]=useState({trialDays:"14",graceDays:"7",starterPrice:"49900",proPrice:"99900",businessPrice:"189900",supportEmail:"soporte@picku.co",maintenanceMode:false,newRegistrations:true});
  const [saved,setSaved]=useState(false);
  const set=k=>v=>setCfg(p=>({...p,[k]:v}));
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Configuración de la plataforma</h2><p style={{color:T.mid,fontSize:13,marginTop:3}}>Ajustes globales de Picku</p></div>
      <Btn onClick={save}>{saved?"✓ ¡Guardado!":"Guardar cambios"}</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16,display:"flex",alignItems:"center",gap:6}}><Package size={14}/> Precios de planes (COP/mes)</div>
        <Field label="Plan Starter" value={cfg.starterPrice} onChange={set("starterPrice")} type="number" prefix="$"/>
        <Field label="Plan Pro" value={cfg.proPrice} onChange={set("proPrice")} type="number" prefix="$"/>
        <Field label="Plan Business" value={cfg.businessPrice} onChange={set("businessPrice")} type="number" prefix="$"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Días de trial" value={cfg.trialDays} onChange={set("trialDays")} type="number" suffix="días"/>
          <Field label="Días de gracia" value={cfg.graceDays} onChange={set("graceDays")} type="number" suffix="días" hint="Antes de suspender"/>
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16,display:"flex",alignItems:"center",gap:6}}><Settings size={14}/> Opciones del sistema</div>
          <Field label="Email de soporte" value={cfg.supportEmail} onChange={set("supportEmail")} type="email"/>
          {[["newRegistrations","Nuevos registros habilitados"],["maintenanceMode","Modo mantenimiento"]].map(([k,l])=>(
            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:13,color:T.text}}>{l}</span>
              <Toggle value={cfg[k]} onChange={v=>setCfg(p=>({...p,[k]:v}))} sm/>
            </div>
          ))}
          {cfg.maintenanceMode&&<div style={{background:T.amberL,border:`1px solid ${T.amber}30`,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,fontWeight:700,marginTop:8,display:"flex",alignItems:"center",gap:6}}><AlertTriangle size={12}/> Restaurantes verán página de mantenimiento</div>}
        </Card>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:14,display:"flex",alignItems:"center",gap:6}}><BarChart3 size={14}/> Estado del sistema</div>
          {[[Globe,"Plataforma","Operativa",T.green],[HardDrive,"Base de datos","Conectada",T.green],[Mail,"Email","Activo",T.green],[CreditCard,"Wompi","Conectado",T.green]].map(([Ic,lb,st,co])=>(
            <div key={lb} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,fontSize:13}}>
              <span style={{color:T.mid,display:"flex",alignItems:"center",gap:6}}><Ic size={13}/> {lb}</span>
              <span style={{fontWeight:700,color:co,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:co,display:"inline-block"}}/>{st}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
    <div style={{marginTop:16}}><Btn full onClick={save} style={{padding:"14px"}}>{saved?"✓ Cambios guardados":"Guardar configuración"}</Btn></div>
  </div>;
}

/* ─── PANTALLA DE SUSPENSIÓN ─────────────────────────────── */
