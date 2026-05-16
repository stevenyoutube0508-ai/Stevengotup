import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T, CM, STYLES } from "../../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../../constants/seed";
import { VERTICALS, getVertical } from "../../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../../utils/format";
import { pointInPoly } from "../../../utils/geo";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../../shared/components";

export function SecReservas(){
  const [reservations,setReservations]=useState([
    {id:"rv1",name:"Familia Martínez",phone:"3001234567",date:todayStr(),time:"19:00",guests:4,area:"Interior",status:"confirmada",notes:"Cumpleaños"},
    {id:"rv2",name:"Andrea Ríos",phone:"3102345678",date:todayStr(),time:"20:30",guests:2,area:"Terraza",status:"pendiente",notes:""},
  ]);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({name:"",phone:"",email:"",date:todayStr(),time:"19:00",guests:2,area:"Interior",notes:"",status:"pendiente"});
  const SR={pendiente:{label:"Pendiente",color:T.amber},confirmada:{label:"Confirmada",color:T.green},sentada:{label:"En mesa",color:T.blue},completada:{label:"Completada",color:T.mid},cancelada:{label:"Cancelada",color:T.red}};
  const RN={pendiente:"confirmada",confirmada:"sentada",sentada:"completada"};
  const TIMES=["12:00","12:30","13:00","13:30","14:00","14:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00"];
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Reservas</h2><p style={{color:T.mid,fontSize:13,marginTop:2}}>Hoy: {reservations.filter(r=>r.date===todayStr()).length} · Total: {reservations.length}</p></div>
      <div style={{display:"flex",gap:8}}>
        <Btn v="light" sm onClick={()=>{setForm(p=>({...p,status:"sentada",notes:"Walk-in"}));setModal(true);}}>🚶 Walk-in</Btn>
        <Btn icon="+" onClick={()=>setModal(true)}>Nueva reserva</Btn>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      {[["📅","Hoy",reservations.filter(r=>r.date===todayStr()).length,T.coral],["✅","Confirmadas",reservations.filter(r=>r.status==="confirmada").length,T.green],["🪑","En mesa",reservations.filter(r=>r.status==="sentada").length,T.blue],["⏳","Pendientes",reservations.filter(r=>r.status==="pendiente").length,T.amber]].map(([ic,l,v,c])=>(
        <StatCard key={l} icon={ic} label={l} value={v} color={c}/>
      ))}
    </div>
    {reservations.map(r=>{const st=SR[r.status]||SR.pendiente;return(
      <Card key={r.id} style={{padding:"14px 16px",marginBottom:8,borderLeft:`3px solid ${st.color}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
          <div><div style={{fontWeight:800,fontSize:14,color:T.text}}>{r.name}</div><div style={{fontSize:11,color:T.mid}}>📞 {r.phone} · 👥 {r.guests} pers. · 🕐 {r.time} · 📍 {r.area}</div></div>
          <span style={{fontSize:10,fontWeight:700,background:st.color+"18",color:st.color,borderRadius:20,padding:"3px 9px"}}>{st.label}</span>
        </div>
        {r.notes&&<div style={{fontSize:11,color:T.coral,fontStyle:"italic",marginBottom:7}}>📝 {r.notes}</div>}
        <div style={{display:"flex",gap:8}}>
          {RN[r.status]&&<Btn sm v="light" onClick={()=>setReservations(p=>p.map(x=>x.id===r.id?{...x,status:RN[r.status]}:x))}>✓ {SR[RN[r.status]]?.label}</Btn>}
          {r.status!=="cancelada"&&<Btn sm v="danger" onClick={()=>setReservations(p=>p.map(x=>x.id===r.id?{...x,status:"cancelada"}:x))}>Cancelar</Btn>}
        </div>
      </Card>
    );})}
    {modal&&<Modal title="Nueva reserva" icon="🗓️" onClose={()=>setModal(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Nombre *" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} required/>
        <Field label="Teléfono *" value={form.phone} onChange={v=>setForm(p=>({...p,phone:v}))} required/>
        <Field label="Email" value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} type="email"/>
        <div><label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Personas</label><div style={{display:"flex",gap:4}}>{[1,2,3,4,5,6,7,8].map(n=><button key={n} onClick={()=>setForm(p=>({...p,guests:n}))} style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1.5px solid ${form.guests===n?T.coral:T.border}`,background:form.guests===n?T.coralL:"transparent",color:form.guests===n?T.coral:T.mid,fontWeight:form.guests===n?800:500,fontSize:11,cursor:"pointer"}}>{n}</button>)}</div></div>
        <Field label="Fecha *" value={form.date} onChange={v=>setForm(p=>({...p,date:v}))} type="date" required/>
        <div><label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Hora *</label><select value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} style={{width:"100%",padding:"10px 13px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
      </div>
      <div style={{marginBottom:12}}><label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Área</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["Interior","Terraza","Privado","Barra"].map(a=><button key={a} onClick={()=>setForm(p=>({...p,area:a}))} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${form.area===a?T.coral:T.border}`,background:form.area===a?T.coralL:"transparent",color:form.area===a?T.coral:T.mid,fontSize:11,fontWeight:form.area===a?700:500,cursor:"pointer"}}>{a}</button>)}</div></div>
      <Field label="Notas" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} textarea rows={2} placeholder="Alergias, ocasión especial…"/>
      <div style={{display:"flex",gap:10}}><Btn full v="neutral" onClick={()=>setModal(false)}>Cancelar</Btn><Btn full disabled={!form.name||!form.phone} onClick={()=>{setReservations(p=>[{...form,id:newId(),createdAt:Date.now()},...p]);setModal(false);}}>Guardar reserva</Btn></div>
    </Modal>}
  </div>;
}

/* ─── ADMIN: FACTURACIÓN ──────────────────────────────────── */
