import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T, CM, STYLES } from "../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../constants/seed";
import { VERTICALS, getVertical } from "../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../utils/format";
import { pointInPoly } from "../../utils/geo";
import { Clock, CheckCircle2, DollarSign, BarChart3, Eye, XCircle } from "lucide-react";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../shared/components";

export function CEOPagos({restaurants,paymentRequests,onApprove,onReject,loading}){
  const [viewReceipt,setViewReceipt]=useState(null);
  const [rejectModal,setRejectModal]=useState(null);
  const [rejectNote,setRejectNote]=useState("");
  const [acting,setActing]=useState(null);

  const pending=paymentRequests.filter(r=>r.status==="pending");
  const approved=paymentRequests.filter(r=>r.status==="approved");
  const rejected=paymentRequests.filter(r=>r.status==="rejected");
  const mrr=restaurants.filter(r=>r.status==="active").reduce((s,r)=>s+r.mrr,0);
  const totalApproved=approved.reduce((s,r)=>s+(r.amount||0),0);

  const doApprove=async(r)=>{
    setActing(r.id);await onApprove(r);setActing(null);
  };
  const doReject=async()=>{
    if(!rejectModal)return;
    setActing(rejectModal.id);await onReject(rejectModal,rejectNote);setActing(null);setRejectModal(null);setRejectNote("");
  };

  const planColor={starter:T.blue,pro:T.coral,business:T.pink};
  const ReqRow=({r,showActions})=>(
    <tr style={{borderBottom:`1px solid ${T.border}`}}>
      <td style={{padding:"12px 14px"}}>
        <div style={{fontWeight:700,color:T.text,fontSize:13}}>{r.restaurant_name||"—"}</div>
        <div style={{fontSize:10,color:T.mid}}>{r.created_at?.split("T")[0]||"—"}</div>
      </td>
      <td style={{padding:"12px 14px"}}><Tag color={planColor[r.plan]||T.mid} sm>{r.plan?.charAt(0).toUpperCase()+r.plan?.slice(1)}</Tag></td>
      <td style={{padding:"12px 14px",fontWeight:800,color:T.indigo}}>{fmtCOP(r.amount)}</td>
      <td style={{padding:"12px 14px"}}>
        {r.receipt_data?<button onClick={()=>setViewReceipt(r)} style={{background:T.indigoL,color:T.indigo,border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Eye size={12}/> Ver comprobante</button>:<span style={{fontSize:11,color:T.light}}>Sin comprobante</span>}
      </td>
      <td style={{padding:"12px 14px"}}>
        {showActions?
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>doApprove(r)} disabled={acting===r.id} style={{background:T.green,color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:800,cursor:acting===r.id?"not-allowed":"pointer",opacity:acting===r.id?.6:1}}>
              {acting===r.id?"…":<><CheckCircle2 size={12}/> Aprobar</>}
            </button>
            <button onClick={()=>{setRejectModal(r);setRejectNote("");}} disabled={acting===r.id} style={{background:T.redL,color:T.red,border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:800,cursor:"pointer"}}>
              <XCircle size={12}/> Rechazar
            </button>
          </div>:
          <div>
            {r.status==="approved"&&<Tag color={T.green}><CheckCircle2 size={10}/> Aprobado</Tag>}
            {r.status==="rejected"&&<div><Tag color={T.red}><XCircle size={10}/> Rechazado</Tag>{r.ceo_notes&&<div style={{fontSize:10,color:T.mid,marginTop:3}}>{r.ceo_notes}</div>}</div>}
          </div>
        }
      </td>
    </tr>
  );

  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Pagos & Facturación</h2>
      <p style={{color:T.mid,fontSize:13}}>Gestiona las solicitudes de pago de todos los restaurantes</p>
    </div>

    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
      <StatCard icon={Clock} label="Pendientes" value={pending.length} color={pending.length>0?T.amber:T.mid}/>
      <StatCard icon={CheckCircle2} label="Aprobados" value={approved.length} color={T.green}/>
      <StatCard icon={DollarSign} label="Total aprobado" value={fmtCOP(totalApproved)} color={T.indigo}/>
      <StatCard icon={BarChart3} label="MRR activo" value={fmtCOP(mrr)} color={T.coral}/>
    </div>

    {/* Pendientes */}
    {pending.length>0&&<Card style={{marginBottom:16,overflow:"hidden",padding:0,border:`2px solid ${T.amber}40`}}>
      <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,background:T.amberL,display:"flex",alignItems:"center",gap:8}}>
        <Clock size={18} color={T.amber}/>
        <div style={{fontWeight:800,fontSize:14,color:T.amber}}>Solicitudes pendientes · {pending.length}</div>
        <div style={{fontSize:11,color:T.mid,marginLeft:"auto"}}>Revisa el comprobante antes de aprobar</div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:T.bg}}>{["Restaurante","Plan","Monto","Comprobante","Acción"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:T.mid,borderBottom:`1px solid ${T.border}`,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}</tr></thead>
          <tbody>{pending.map(r=><ReqRow key={r.id} r={r} showActions={true}/>)}</tbody>
        </table>
      </div>
    </Card>}

    {/* Sin pendientes */}
    {!loading&&pending.length===0&&<div style={{background:T.greenL,border:`1px solid ${T.green}30`,borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",gap:10,alignItems:"center"}}>
      <CheckCircle2 size={18} color={T.green}/>
      <div style={{fontWeight:700,color:T.green,fontSize:13}}>Sin pagos pendientes por revisar</div>
    </div>}

    {/* Historial */}
    {(approved.length>0||rejected.length>0)&&<Card style={{overflow:"hidden",padding:0}}>
      <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,fontWeight:800,fontSize:14,color:T.text}}>Historial de pagos ({approved.length+rejected.length})</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:T.bg}}>{["Restaurante","Plan","Monto","Comprobante","Estado"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:T.mid,borderBottom:`1px solid ${T.border}`,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}</tr></thead>
          <tbody>{[...approved,...rejected].map(r=><ReqRow key={r.id} r={r} showActions={false}/>)}</tbody>
        </table>
      </div>
    </Card>}

    {loading&&<div style={{textAlign:"center",padding:32,color:T.mid}}>Cargando pagos…</div>}
    {!loading&&paymentRequests.length===0&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:28,marginBottom:8}}>💳</div><div style={{fontWeight:700,color:T.mid}}>Aún no hay solicitudes de pago</div><div style={{fontSize:12,color:T.light,marginTop:4}}>Aparecerán aquí cuando los restaurantes envíen comprobantes</div></Card>}

    {/* Modal ver comprobante */}
    {viewReceipt&&<Modal title="Comprobante de pago" icon="📎" onClose={()=>setViewReceipt(null)}>
      <div style={{marginBottom:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[["Restaurante",viewReceipt.restaurant_name],["Plan",viewReceipt.plan?.charAt(0).toUpperCase()+viewReceipt.plan?.slice(1)],["Monto",fmtCOP(viewReceipt.amount)],["Fecha",viewReceipt.created_at?.split("T")[0]]].map(([k,v])=>(
            <div key={k} style={{background:T.bg,borderRadius:8,padding:"8px 12px"}}>
              <div style={{fontSize:10,color:T.light,fontWeight:700,textTransform:"uppercase"}}>{k}</div>
              <div style={{fontSize:13,fontWeight:800,color:T.text,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
        {viewReceipt.notes&&<div style={{background:T.bg,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.mid,marginBottom:12}}><strong>Nota del cliente:</strong> {viewReceipt.notes}</div>}
        {viewReceipt.receipt_data?.startsWith("data:image")?
          <img src={viewReceipt.receipt_data} alt="comprobante" style={{width:"100%",borderRadius:12,border:`1px solid ${T.border}`}}/>:
          viewReceipt.receipt_data?.startsWith("data:application/pdf")?
          <div style={{textAlign:"center",padding:24,background:T.bg,borderRadius:12}}>
            <div style={{fontSize:32}}>📄</div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginTop:6}}>{viewReceipt.receipt_name}</div>
            <a href={viewReceipt.receipt_data} download={viewReceipt.receipt_name} style={{display:"inline-block",marginTop:10,background:T.indigo,color:"#fff",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,textDecoration:"none"}}>Descargar PDF</a>
          </div>:
          <div style={{textAlign:"center",color:T.mid,padding:20}}>No se puede previsualizar</div>
        }
      </div>
      {viewReceipt.status==="pending"&&<div style={{display:"flex",gap:10,marginTop:16}}>
        <Btn full onClick={()=>{setViewReceipt(null);doApprove(viewReceipt);}}>✅ Aprobar</Btn>
        <Btn v="ghost" onClick={()=>{setViewReceipt(null);setRejectModal(viewReceipt);setRejectNote("");}}>❌ Rechazar</Btn>
      </div>}
    </Modal>}

    {/* Modal rechazar */}
    {rejectModal&&<Modal title="Rechazar pago" icon="❌" onClose={()=>{setRejectModal(null);setRejectNote("");}}>
      <div style={{marginBottom:12}}>
        <p style={{fontSize:13,color:T.mid,marginBottom:14}}>¿Por qué rechazas este pago de <strong>{rejectModal.restaurant_name}</strong>?</p>
        <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)} placeholder="Ej: El comprobante no es legible, favor reenviar..." rows={3} style={{width:"100%",padding:"10px 12px",border:`1px solid ${T.border}`,borderRadius:10,fontSize:13,color:T.text,background:T.bg,resize:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <Btn v="ghost" onClick={()=>{setRejectModal(null);setRejectNote("");}}>Cancelar</Btn>
        <Btn full style={{background:T.red}} onClick={doReject} disabled={acting===rejectModal?.id}>{acting===rejectModal?.id?"Rechazando…":"❌ Confirmar rechazo"}</Btn>
      </div>
    </Modal>}
  </div>;
}

/* ─── CEO: SOPORTE ────────────────────────────────────────── */
