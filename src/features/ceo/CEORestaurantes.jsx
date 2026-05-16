import {useState} from "react";
import {T} from "../../constants/theme";
import {STATUS_MAP,PLAN_MAP} from "../../constants/kanban";
import {supabase} from "../../../lib/supabase";
import {fmtCOP} from "../../utils/format";
import {Card,Btn,Modal,Tag,StatCard} from "../../shared/components";

export function CEORestaurantes({restaurants,onUpdate,showToast}){
  const [sel,setSel]=useState(null);
  const [q,setQ]=useState("");
  const [filter,setFilter]=useState("all");
  const shown=restaurants.filter(r=>{
    const mQ=!q||r.name.toLowerCase().includes(q.toLowerCase())||r.city.toLowerCase().includes(q.toLowerCase());
    const mF=filter==="all"||r.status===filter||(filter==="expiring"&&r.daysLeft<=7&&r.status==="active");
    return mQ&&mF;
  });
  const r=sel?restaurants.find(x=>x.id===sel)||sel:null;
  const changeStatus=(res,status)=>{onUpdate(res.id,{status});showToast(`${res.name} → ${STATUS_MAP[status]?.label}`);if(r?.id===res.id)setSel(p=>p);};
  const extendSub=async(res)=>{
    const newExpiry=new Date(Date.now()+30*24*60*60*1000).toISOString();
    const {data:prof}=await supabase.from("profiles").select("id").eq("email",res.email).single();
    if(prof){
      await supabase.from("profiles").update({subscription_expires_at:newExpiry}).eq("id",prof.id);
      onUpdate(res.id,{status:"active",nextPayment:newExpiry.slice(0,10),daysLeft:30});
      showToast(`✅ Suscripción de ${res.name} extendida hasta ${newExpiry.slice(0,10)}`);
      setSel(null);
    } else {
      showToast(`⚠ No se encontró el perfil de ${res.email}`,"warn");
    }
  };
  const changePlan=(res,plan)=>{onUpdate(res.id,{plan,mrr:PLAN_MAP[plan]?.price||0});showToast(`Plan de ${res.name} → ${PLAN_MAP[plan]?.label}`);};
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Restaurantes</h2><p style={{color:T.mid,fontSize:13,marginTop:2}}>{restaurants.filter(r=>r.status!=="inactive").length} activos en la plataforma</p></div>
    </div>
    <Card style={{marginBottom:14,padding:"12px 16px"}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Buscar por nombre o ciudad…" style={{flex:1,minWidth:200,padding:"9px 13px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none"}}/>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {[["all","Todos"],["active","Activos"],["suspended","Suspendidos"],["trial","Trial"],["expiring","Por vencer"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${filter===k?T.indigo:T.border}`,background:filter===k?T.indigoL:T.white,color:filter===k?T.indigo:T.mid,fontSize:11,fontWeight:filter===k?700:500,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>
    </Card>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {shown.map(res=>{
        const st=STATUS_MAP[res.status]||STATUS_MAP.inactive;
        const pl=PLAN_MAP[res.plan]||PLAN_MAP.starter;
        const exp=res.status==="active"&&res.daysLeft<=7;
        return <Card key={res.id} style={{padding:"14px 18px",borderLeft:`3px solid ${exp?T.amber:res.status==="suspended"?T.red:"transparent"}`}} className="hov">
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:50,height:50,borderRadius:13,overflow:"hidden",flexShrink:0,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>{res.coverImg?<img src={res.coverImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:22}}>{res.logo}</span>}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:4}}>
                <div><span style={{fontWeight:800,fontSize:15,color:T.text}}>{res.name}</span><span style={{fontSize:11,color:T.mid,marginLeft:8}}>{res.city}</span></div>
                <div style={{display:"flex",gap:5,flexShrink:0}}>
                  <Tag color={pl.color}>{pl.label}</Tag>
                  <Tag color={st.color}>{st.label}</Tag>
                  {exp&&<Tag color={T.amber}>⚠ {res.daysLeft}d</Tag>}
                </div>
              </div>
              <div style={{fontSize:12,color:T.mid,marginBottom:5}}>👤 {res.owner} · 📧 {res.email}</div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:T.mid}}>
                <span>📦 {res.products} productos</span><span>📋 {res.orders} pedidos</span><span>💰 {fmtCOP(res.mrr)}/mes</span>{res.status!=="inactive"&&<span>📅 {res.nextPayment}</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,flexWrap:"wrap"}}>
            <Btn sm v="ghost" onClick={()=>setSel(res.id)}>👁️ Detalle</Btn>
            {res.status==="active"&&<Btn sm v="danger" onClick={()=>changeStatus(res,"suspended")}>Suspender</Btn>}
            {res.status==="suspended"&&<Btn sm v="success" onClick={()=>extendSub(res)}>✅ Reactivar + 30d</Btn>}
            {res.status==="trial"&&<Btn sm v="primary" onClick={()=>changeStatus(res,"active")}>✓ Activar</Btn>}
            <Btn sm v="amber" onClick={()=>window.open(`mailto:${res.email}`)}>📧 Contactar</Btn>
          </div>
        </Card>;
      })}
      {shown.length===0&&<Card style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:44,marginBottom:10}}>🔍</div><div style={{color:T.mid}}>Sin resultados</div></Card>}
    </div>
    {r&&<Modal title={r.name} icon="🏪" onClose={()=>setSel(null)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <div style={{height:110,borderRadius:12,overflow:"hidden",marginBottom:14,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {r.coverImg?<img src={r.coverImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:44}}>{r.logo}</span>}
          </div>
          <div style={{display:"flex",gap:5,marginBottom:12}}><Tag color={PLAN_MAP[r.plan]?.color||T.mid}>{PLAN_MAP[r.plan]?.label}</Tag><Tag color={STATUS_MAP[r.status]?.color||T.mid}>{STATUS_MAP[r.status]?.label}</Tag></div>
          {[["👤","Propietario",r.owner],["📧","Email",r.email],["📞","Teléfono",r.phone],["📍","Ciudad",r.city],["📅","Registrado",r.createdAt],["💳","Próximo pago",r.nextPayment],["💰","MRR",fmtCOP(r.mrr)],["📦","Productos",r.products],["📋","Pedidos",r.orders]].map(([ic,lb,vl])=>(
            <div key={lb} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:12,paddingBottom:7,borderBottom:`1px solid ${T.border}`}}><span style={{color:T.mid}}>{ic} {lb}</span><span style={{color:T.text,fontWeight:600,textAlign:"right",maxWidth:"55%"}}>{vl}</span></div>
          ))}
        </div>
        <div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:T.mid,marginBottom:8}}>Cambiar plan</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.entries(PLAN_MAP).map(([k,v])=>(
                <button key={k} onClick={()=>changePlan(r,k)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${r.plan===k?v.color:T.border}`,background:r.plan===k?v.color+"18":"transparent",color:r.plan===k?v.color:T.mid,fontSize:11,fontWeight:r.plan===k?700:500,cursor:"pointer"}}>{v.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T.mid,marginBottom:8}}>Acciones</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {r.status==="active"&&<Btn full v="danger" onClick={()=>{changeStatus(r,"suspended");setSel(null);}}>🔴 Suspender cuenta</Btn>}
              {r.status==="suspended"&&<Btn full v="success" onClick={()=>{changeStatus(r,"active");setSel(null);}}>✅ Reactivar cuenta</Btn>}
              {r.status==="trial"&&<Btn full v="primary" onClick={()=>{changeStatus(r,"active");setSel(null);}}>✓ Convertir a activo</Btn>}
              <Btn full v="green" onClick={()=>extendSub(r)} icon="📅">Extender 30 días</Btn>
              <Btn full v="neutral" onClick={()=>window.open(`mailto:${r.email}`)} icon="📧">Enviar email</Btn>
            </div>
          </div>
          {r.notes&&<div style={{marginTop:14,background:T.indigoL,borderRadius:10,padding:"10px 12px",fontSize:12,color:T.indigo}}>📝 {r.notes}</div>}
        </div>
      </div>
    </Modal>}
  </div>;
}
