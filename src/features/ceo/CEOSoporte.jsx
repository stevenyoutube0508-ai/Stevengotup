import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T, CM, STYLES } from "../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../constants/seed";
import { VERTICALS, getVertical } from "../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../utils/format";
import { pointInPoly } from "../../utils/geo";
import { Ticket, AlertCircle, CheckCircle2, Store, User, Calendar, Circle } from "lucide-react";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../shared/components";

export function CEOSoporte({tickets,onUpdateTicket}){
  const [sel,setSel]=useState(null);
  const [reply,setReply]=useState("");
  const open=tickets.filter(t=>t.status==="open");
  const PR={high:T.red,medium:T.amber,low:T.green};
  const sendReply=()=>{
    if(!reply.trim()||!sel)return;
    const updated={...sel,messages:[...(sel.messages||[]),{from:"Soporte Picku",text:reply,time:new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})}]};
    onUpdateTicket(sel.id,updated);setSel(updated);setReply("");
  };
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Soporte & Tickets</h2><p style={{color:T.mid,fontSize:13,marginTop:2}}>{open.length} abiertos · {tickets.filter(t=>t.status==="resolved").length} resueltos</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      <StatCard icon={Ticket} label="Abiertos" value={open.length} color={open.length>0?T.red:T.mid}/>
      <StatCard icon={AlertCircle} label="Alta prioridad" value={open.filter(t=>t.priority==="high").length} color={T.red}/>
      <StatCard icon={CheckCircle2} label="Resueltos" value={tickets.filter(t=>t.status==="resolved").length} color={T.green}/>
    </div>
    {[...open,...tickets.filter(t=>t.status==="resolved")].map(t=>(
      <Card key={t.id} style={{padding:"14px 16px",marginBottom:8,borderLeft:`3px solid ${PR[t.priority]||T.mid}`,cursor:"pointer"}} className="hov" onClick={()=>setSel(t)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
          <div><div style={{fontWeight:800,color:T.text,fontSize:14}}>{t.subject}</div><div style={{fontSize:11,color:T.mid,marginTop:2,display:"flex",alignItems:"center",gap:5}}><Store size={10}/>{t.restaurant}<User size={10}/>{t.user}<Calendar size={10}/>{t.date}</div></div>
          <div style={{display:"flex",gap:5,flexShrink:0}}>
            <Tag color={PR[t.priority]||T.mid} sm>{t.priority==="high"?"Alta":t.priority==="medium"?"Media":"Baja"}</Tag>
            <Tag color={t.status==="open"?T.amber:T.green}>{t.status==="open"?"Abierto":"Resuelto"}</Tag>
          </div>
        </div>
        <div style={{fontSize:12,color:T.mid}}>{t.messages?.[0]?.text?.slice(0,80)}{t.messages?.[0]?.text?.length>80?"…":""}</div>
      </Card>
    ))}
    {sel&&<Modal title={sel.subject} icon={Ticket} onClose={()=>setSel(null)} wide>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        <Tag color={PR[sel.priority]||T.mid}>{sel.priority==="high"?<><Circle size={8} fill={T.red} color={T.red}/> Alta</>:sel.priority==="medium"?<><Circle size={8} fill={T.amber} color={T.amber}/> Media</>:<><Circle size={8} fill={T.green} color={T.green}/> Baja</>}</Tag>
        <Tag color={sel.status==="open"?T.amber:T.green}>{sel.status==="open"?"Abierto":"Resuelto"}</Tag>
        <span style={{fontSize:11,color:T.mid,display:"flex",alignItems:"center",gap:4}}><Store size={10}/>{sel.restaurant}</span>
      </div>
      <div style={{background:T.bg,borderRadius:12,padding:14,marginBottom:14,maxHeight:260,overflowY:"auto"}}>
        {sel.messages?.map((m,i)=>(
          <div key={i} style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:m.from==="Soporte Picku"?T.indigo:T.mid,marginBottom:3}}>{m.from} · {m.time}</div>
            <div style={{background:m.from==="Soporte Picku"?T.indigoL:T.white,border:`1px solid ${m.from==="Soporte Picku"?T.indigo+"30":T.border}`,borderRadius:10,padding:"10px 13px",fontSize:13,color:T.text,lineHeight:1.6}}>{m.text}</div>
          </div>
        ))}
      </div>
      {sel.status==="open"&&<>
        <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Escribe tu respuesta…" rows={3} style={{width:"100%",boxSizing:"border-box",padding:"11px 14px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",resize:"vertical",marginBottom:12}}/>
        <div style={{display:"flex",gap:10}}>
          <Btn v="ghost" onClick={()=>{onUpdateTicket(sel.id,{...sel,status:"resolved"});setSel(null);}}>✓ Marcar resuelto</Btn>
          <Btn disabled={!reply.trim()} onClick={sendReply}>Enviar respuesta</Btn>
        </div>
      </>}
      {sel.status==="resolved"&&<div style={{background:T.greenL,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.green,fontWeight:700,display:"flex",alignItems:"center",gap:6}}><CheckCircle2 size={14}/> Ticket resuelto</div>}
    </Modal>}
  </div>;
}

/* ─── CEO: PLATAFORMA ─────────────────────────────────────── */
