import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T, CM, STYLES } from "../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../constants/seed";
import { VERTICALS, getVertical } from "../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../utils/format";
import { pointInPoly } from "../../utils/geo";
import { Store, DollarSign, Calendar, AlertCircle, Zap, Ticket, CheckCircle2, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../shared/components";

export function CEODash({restaurants,tickets}){
  const active=restaurants.filter(r=>r.status==="active");
  const suspended=restaurants.filter(r=>r.status==="suspended");
  const trial=restaurants.filter(r=>r.status==="trial");
  const mrr=active.reduce((s,r)=>s+r.mrr,0);
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:900,color:T.text,display:"flex",alignItems:"center",gap:8}}>Dashboard Global</h1><p style={{color:T.mid,fontSize:13,marginTop:3}}>{new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p></div>
    {suspended.length>0&&<div style={{background:"linear-gradient(135deg,#fee2e2,#fecaca)",border:"1.5px solid #fca5a5",borderRadius:14,padding:"13px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
      <AlertCircle size={20} color="#991b1b"/>
      <div><div style={{fontWeight:800,color:"#991b1b",fontSize:13}}>{suspended.length} restaurante{suspended.length>1?"s":""} suspendido{suspended.length>1?"s":""}</div><div style={{fontSize:12,color:"#b91c1c"}}>{suspended.map(r=>r.name).join(", ")} — requieren atención urgente</div></div>
    </div>}
    {trial.length>0&&<div style={{background:"linear-gradient(135deg,#fef3c7,#fde68a)",border:"1.5px solid #fcd34d",borderRadius:14,padding:"12px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <Zap size={18} color="#92400e"/>
      <div style={{fontWeight:700,color:"#92400e",fontSize:13}}>{trial.map(r=>r.name).join(", ")} en trial — {trial.map(r=>`${r.daysLeft}d`).join(", ")} restantes</div>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:14,marginBottom:22}}>
      <StatCard icon={Store} label="Restaurantes activos" value={active.length} sub={`${restaurants.length} total`} color={T.indigo}/>
      <StatCard icon={DollarSign} label="MRR" value={fmtCOP(mrr)} sub="↑ 12% este mes" color={T.green}/>
      <StatCard icon={Calendar} label="ARR estimado" value={fmtCOP(mrr*12)} color={T.coral}/>
      <StatCard icon={AlertCircle} label="Suspendidos" value={suspended.length} color={suspended.length>0?T.red:T.mid}/>
      <StatCard icon={Zap} label="En trial" value={trial.length} color={T.amber}/>
      <StatCard icon={Ticket} label="Tickets abiertos" value={tickets.filter(t=>t.status==="open").length} color={T.blue}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16,marginBottom:18}}>
      <Card>
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>MRR — Últimos 7 meses</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={MRR_TREND} margin={{top:5,right:5,left:-10,bottom:0}}>
            <defs><linearGradient id="gMrr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.indigo} stopOpacity={.25}/><stop offset="95%" stopColor={T.indigo} stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="m" tick={{fontSize:10,fill:T.light}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} tick={{fontSize:9,fill:T.light}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{borderRadius:10,border:`1px solid ${T.border}`,fontSize:11}} formatter={v=>[fmtCOP(v),"MRR"]}/>
            <Area type="monotone" dataKey="mrr" stroke={T.indigo} fill="url(#gMrr)" strokeWidth={2.5}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card style={{display:"flex",flexDirection:"column"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>Distribución de planes</div>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <PieChart width={190} height={150}>
            <Pie data={PLAN_DIST} cx={95} cy={75} innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
              {PLAN_DIST.map(p=><Cell key={p.name} fill={p.color}/>)}
            </Pie>
            <Tooltip formatter={v=>[`${v} restaurantes`]}/>
          </PieChart>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          {PLAN_DIST.map(p=><div key={p.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:8,height:8,borderRadius:"50%",background:p.color}}/><span style={{color:T.mid}}>{p.name}: <strong>{p.value}</strong></span></div>)}
        </div>
      </Card>
    </div>
    <Card>
      <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>Actividad reciente</div>
      {[{time:"Hace 2h",icon:CheckCircle2,text:"Crepes & Waffles registrado (Trial 14d)",color:T.green},{time:"Hace 5h",icon:CreditCard,text:"Pago recibido: La Leña — Pro $99.900",color:T.indigo},{time:"Hace 8h",icon:Ticket,text:"Ticket: La Leña — Error iOS Safari (Alta)",color:T.amber},{time:"Hace 1d",icon:AlertTriangle,text:"Pizza & Co suspendida — 18 días sin pago",color:T.red},{time:"Hace 2d",icon:TrendingUp,text:"El Corral Premium superó 500 pedidos",color:T.coral}].map((a,i)=>(
        <div key={i} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:10,background:a.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><a.icon size={14} color={a.color}/></div>
          <div style={{flex:1}}><div style={{fontSize:13,color:T.text,fontWeight:500}}>{a.text}</div><div style={{fontSize:11,color:T.light,marginTop:2}}>{a.time}</div></div>
        </div>
      ))}
    </Card>
  </div>;
}

/* ─── CEO: RESTAURANTES ───────────────────────────────────── */
