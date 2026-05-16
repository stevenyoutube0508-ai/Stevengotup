import {useState,useRef,useEffect} from "react";
import {T} from "../../../constants/theme";
import {PLANS_CATALOG,BANK_INFO} from "../../../constants/seed";
import {fmtCOP} from "../../../utils/format";
import {Card,Tag,Btn,Modal} from "../../../shared/components";
import {supabase} from "../../../../lib/supabase";

export function SecFacturacion({billing,setBilling,user,configName,showToast}){
  const [payReqs,setPayReqs]=useState([]);
  const [modal,setModal]=useState(null);
  const [receipt,setReceipt]=useState(null);
  const [notes,setNotes]=useState("");
  const [uploading,setUploading]=useState(false);
  const [selBank,setSelBank]=useState(0);
  const fileRef=useRef();

  useEffect(()=>{
    if(!user?.id)return;
    supabase.from("payment_requests").select("id,plan,amount,status,created_at,ceo_notes,reviewed_at").eq("owner_id",user.id).order("created_at",{ascending:false}).then(({data})=>{if(data)setPayReqs(data);});
  },[user]);

  const plan=billing.plan;
  const pc={starter:T.blue,pro:T.coral,business:T.pink}[plan]||T.coral;
  const pn={starter:"Starter",pro:"Pro",business:"Business"}[plan]||"Pro";
  const pendingReq=payReqs.find(r=>r.status==="pending");

  const handleFile=e=>{
    const f=e.target.files?.[0];if(!f)return;
    if(f.size>3*1024*1024){alert("El archivo no puede superar 3 MB.");return;}
    const rd=new FileReader();
    rd.onload=ev=>setReceipt({data:ev.target.result,name:f.name});
    rd.readAsDataURL(f);
  };

  const submitPayment=async()=>{
    if(!receipt){showToast("⚠️ Sube el comprobante de pago","err");return;}
    setUploading(true);
    const {error}=await supabase.from("payment_requests").insert({
      owner_id:user.id,restaurant_name:configName||"Restaurante",
      plan:modal.id,amount:modal.price,method:"transfer",status:"pending",
      receipt_data:receipt.data,receipt_name:receipt.name,notes,
    });
    setUploading(false);
    if(error){showToast("❌ Error al enviar. Intenta de nuevo.","err");return;}
    const newReq={id:Date.now()+"",plan:modal.id,amount:modal.price,status:"pending",created_at:new Date().toISOString()};
    setPayReqs(v=>[newReq,...v]);
    setBilling({...billing,plan:billing.plan});
    setModal(null);setReceipt(null);setNotes("");
    showToast("✅ Comprobante enviado — te avisaremos cuando sea aprobado");
  };

  const statusTag=(s,n)=>{
    if(s==="pending") return <Tag color={T.amber}>⏳ En revisión</Tag>;
    if(s==="approved") return <Tag color={T.green}>✅ Aprobado</Tag>;
    return <div style={{display:"flex",flexDirection:"column",gap:2}}><Tag color={T.red}>❌ Rechazado</Tag>{n&&<div style={{fontSize:10,color:T.mid}}>{n}</div>}</div>;
  };

  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:22}}><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Mi suscripción</h2></div>

    <Card style={{background:`linear-gradient(135deg,${pc}15,${pc}05)`,border:`1.5px solid ${pc}30`,marginBottom:pendingReq?12:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.mid,marginBottom:3,fontWeight:600,textTransform:"uppercase",letterSpacing:".5px"}}>Plan actual</div>
          <div style={{fontSize:24,fontWeight:900,color:T.text}}>Plan {pn}</div>
          <div style={{fontSize:13,color:T.mid,marginTop:3}}>Próxima factura: <strong>{billing.nextPayment}</strong> · {fmtCOP(billing.amount)}/mes</div>
        </div>
        <div style={{width:56,height:56,borderRadius:16,background:pc+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>💳</div>
      </div>
    </Card>

    {pendingReq&&<div style={{background:T.amberL,border:`1.5px solid ${T.amber}40`,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"center"}}>
      <span style={{fontSize:20}}>⏳</span>
      <div>
        <div style={{fontWeight:800,fontSize:13,color:T.amber}}>Pago en revisión</div>
        <div style={{fontSize:12,color:T.text,marginTop:1}}>Enviaste un comprobante para el plan <strong>{pendingReq.plan?.charAt(0).toUpperCase()+pendingReq.plan?.slice(1)}</strong> — {fmtCOP(pendingReq.amount)}/mes. Te avisaremos cuando sea aprobado (máx. 24 h hábiles).</div>
      </div>
    </div>}

    <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>Planes disponibles</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:22}}>
      {PLANS_CATALOG.map(p=>{const isCurrent=p.id===plan;return(
        <Card key={p.id} style={{border:`2px solid ${isCurrent?p.color:T.border}`,position:"relative",textAlign:"center",padding:"20px 16px"}}>
          {p.popular&&!isCurrent&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:T.coral,color:"#fff",fontSize:10,fontWeight:800,padding:"3px 12px",borderRadius:20}}>⭐ Más popular</div>}
          {isCurrent&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:p.color,color:"#fff",fontSize:10,fontWeight:800,padding:"3px 12px",borderRadius:20}}>Tu plan actual</div>}
          <div style={{fontSize:18,fontWeight:900,color:T.text,marginBottom:3}}>{p.name}</div>
          <div style={{fontSize:24,fontWeight:900,color:p.color,marginBottom:14}}>{fmtCOP(p.price)}<span style={{fontSize:11,color:T.mid,fontWeight:500}}>/mes</span></div>
          {p.features.map(f=><div key={f} style={{fontSize:12,color:T.mid,marginBottom:5,display:"flex",alignItems:"center",gap:6,textAlign:"left"}}><span style={{color:T.green,fontWeight:900}}>✓</span>{f}</div>)}
          {!isCurrent&&!pendingReq&&<Btn full v="ghost" style={{marginTop:12}} onClick={()=>setModal(p)}>Cambiar a {p.name}</Btn>}
          {!isCurrent&&pendingReq&&<div style={{marginTop:12,fontSize:11,color:T.amber,fontWeight:600}}>Pago pendiente de revisión</div>}
          {isCurrent&&<div style={{marginTop:12,padding:"8px",background:p.color+"15",borderRadius:10,fontSize:12,fontWeight:700,color:p.color}}>Plan activo ✓</div>}
        </Card>
      );})}
    </div>

    <Card style={{overflow:"hidden",padding:0}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,fontWeight:800,fontSize:14,color:T.text}}>Historial de pagos</div>
      {payReqs.length===0?<div style={{padding:24,textAlign:"center",color:T.light,fontSize:13}}>Sin historial de pagos aún</div>:
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:T.bg}}>{["Fecha","Plan","Monto","Estado"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:T.mid,borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{payReqs.map((r,i)=>(
          <tr key={r.id||i} style={{borderBottom:`1px solid ${T.border}`}}>
            <td style={{padding:"12px 16px",fontSize:12,color:T.mid}}>{r.created_at?.split("T")[0]||"—"}</td>
            <td style={{padding:"12px 16px"}}><Tag color={{starter:T.blue,pro:T.coral,business:T.pink}[r.plan]||T.mid} sm>{r.plan?.charAt(0).toUpperCase()+r.plan?.slice(1)||"—"}</Tag></td>
            <td style={{padding:"12px 16px",fontSize:13,fontWeight:700}}>{fmtCOP(r.amount)}</td>
            <td style={{padding:"12px 16px"}}>{statusTag(r.status,r.ceo_notes)}</td>
          </tr>
        ))}</tbody>
      </table>}
    </Card>

    {modal&&<Modal title={`Cambiar a Plan ${modal.name}`} icon="💳" onClose={()=>{setModal(null);setReceipt(null);setNotes("");}}>
      <div style={{background:`linear-gradient(135deg,${modal.color}15,${modal.color}05)`,border:`1.5px solid ${modal.color}30`,borderRadius:14,padding:"16px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.mid,fontWeight:700,textTransform:"uppercase"}}>Nuevo plan</div>
          <div style={{fontSize:20,fontWeight:900,color:T.text}}>Plan {modal.name}</div>
          <div style={{fontSize:13,color:modal.color,fontWeight:700}}>{fmtCOP(modal.price)}/mes</div>
        </div>
        <div style={{fontSize:32}}>🚀</div>
      </div>

      <div style={{fontSize:12,color:T.mid,background:T.bg,borderRadius:10,padding:"10px 14px",marginBottom:16,lineHeight:1.7,whiteSpace:"pre-line"}}>{BANK_INFO.instructions}</div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T.text,marginBottom:8}}>📋 Datos para transferencia</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {BANK_INFO.banks.map((b,i)=><button key={i} onClick={()=>setSelBank(i)} style={{flex:1,padding:"8px 6px",borderRadius:10,border:`2px solid ${selBank===i?T.coral:T.border}`,background:selBank===i?T.coralL:T.white,cursor:"pointer",fontSize:11,fontWeight:selBank===i?800:500,color:selBank===i?T.coral:T.mid,transition:"all .15s"}}>{BANK_INFO.banks[i].icon} {b.name}</button>)}
        </div>
        <div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Titular",BANK_INFO.titular],["Cédula",BANK_INFO.cedula],[BANK_INFO.banks[selBank].type,BANK_INFO.banks[selBank].number],["Referencia",configName||"Tu restaurante"]].map(([k,v])=>(
              <div key={k}>
                <div style={{fontSize:10,color:T.light,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                <div style={{fontSize:13,fontWeight:800,color:T.text,background:T.bg,borderRadius:7,padding:"6px 10px",letterSpacing:".3px"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T.text,marginBottom:8}}>📸 Comprobante de pago <span style={{color:T.red}}>*</span></div>
        <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{display:"none"}}/>
        {!receipt?<div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${T.border}`,borderRadius:12,padding:"24px",textAlign:"center",cursor:"pointer",background:T.bg,transition:"border .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.coral} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <div style={{fontSize:24,marginBottom:6}}>📎</div>
          <div style={{fontSize:13,fontWeight:700,color:T.text}}>Sube tu comprobante</div>
          <div style={{fontSize:11,color:T.mid,marginTop:2}}>Imagen o PDF · Máx. 3 MB</div>
        </div>:
        <div style={{background:T.greenL,border:`1.5px solid ${T.green}40`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>✅</span>
            <div><div style={{fontSize:12,fontWeight:700,color:T.green}}>Comprobante listo</div><div style={{fontSize:11,color:T.mid}}>{receipt.name}</div></div>
          </div>
          <button onClick={()=>setReceipt(null)} style={{background:"none",border:"none",color:T.mid,cursor:"pointer",fontSize:16}}>✕</button>
        </div>}
      </div>

      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:700,color:T.mid,marginBottom:6}}>Notas adicionales (opcional)</div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ej: Pagado el día de hoy desde Bancolombia..." rows={2} style={{width:"100%",padding:"10px 12px",border:`1px solid ${T.border}`,borderRadius:10,fontSize:12,color:T.text,background:T.bg,resize:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
      </div>

      <div style={{display:"flex",gap:10}}>
        <Btn v="ghost" onClick={()=>{setModal(null);setReceipt(null);setNotes("");}}>Cancelar</Btn>
        <Btn full onClick={submitPayment} disabled={uploading||!receipt}>{uploading?"Enviando…":"📤 Enviar comprobante"}</Btn>
      </div>
    </Modal>}
  </div>;
}
