import {useState} from "react";
import {T} from "../../constants/theme";
import {VERTICALS} from "../../constants/verticals";
import {PLAN_MAP} from "../../constants/kanban";
import {newId,todayStr} from "../../utils/format";
import {fmtCOP} from "../../utils/format";
import {Card,Btn,Field} from "../../shared/components";

export function CEOOnboarding({onAdd,showToast}){
  const [step,setStep]=useState(0);
  const INIT_FORM={name:"",owner:"",email:"",phone:"",city:"",plan:"pro",businessType:"restaurant",logo:"🍽️",primaryColor:"#f97316",notes:"",sendWelcome:true};
  const [form,setForm]=useState(INIT_FORM);
  const [done,setDone]=useState(null);
  const set=k=>v=>setForm(p=>({...p,[k]:v}));
  const selV=VERTICALS[form.businessType]||VERTICALS.restaurant;
  const valid1=form.name&&form.owner&&form.email&&form.city;
  const create=()=>{
    const r={...form,id:newId(),status:"active",createdAt:todayStr(),nextPayment:new Date(Date.now()+30*24*60*60*1000).toISOString().slice(0,10),daysLeft:30,mrr:PLAN_MAP[form.plan]?.price||0,products:0,orders:0,coverImg:""};
    onAdd(r);setDone(r);showToast(`✓ ${form.name} creado exitosamente`);
  };
  if(done)return <div style={{maxWidth:500,margin:"0 auto",textAlign:"center",animation:"fadeUp .35s ease"}}>
    <div style={{width:72,height:72,borderRadius:22,background:T.greenL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 18px"}}>✅</div>
    <h2 style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:8}}>¡Cuenta creada!</h2>
    <p style={{color:T.mid,fontSize:14,marginBottom:22}}>La cuenta de <strong>{done.name}</strong> está activa.</p>
    <Card style={{marginBottom:18,textAlign:"left"}}>
      {[[selV.icon,"Tipo de negocio",selV.name],["🏪","Negocio",done.name],["👤","Propietario",done.owner],["📧","Email",done.email],["📦","Plan",PLAN_MAP[done.plan]?.label],["📅","Próximo pago",done.nextPayment]].map(([ic,lb,vl])=>(
        <div key={lb} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:13}}><span style={{color:T.mid}}>{ic} {lb}</span><span style={{color:T.text,fontWeight:700}}>{vl}</span></div>
      ))}
    </Card>
    {done.sendWelcome&&<div style={{background:T.greenL,border:`1px solid ${T.green}30`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.green,marginBottom:18}}>📨 Email de bienvenida enviado a {done.email}</div>}
    <div style={{display:"flex",gap:10}}>
      <Btn full v="neutral" onClick={()=>{setDone(null);setStep(0);setForm(INIT_FORM);}}>Crear otro</Btn>
      <Btn full onClick={()=>setDone(null)}>Ver en Clientes</Btn>
    </div>
  </div>;
  const STEPS=[{n:0,l:"Vertical"},{n:1,l:"Datos"},{n:2,l:"Plan"},{n:3,l:"Confirmar"}];
  return <div style={{maxWidth:680,margin:"0 auto",animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Nuevo cliente</h2>
      <p style={{color:T.mid,fontSize:13}}>Crea la cuenta para cualquier tipo de negocio · Picku</p>
    </div>
    <div style={{display:"flex",gap:0,marginBottom:24}}>
      {STEPS.map((s,i)=>(
        <div key={s.n} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
          {i>0&&<div style={{position:"absolute",left:0,top:15,width:"50%",height:2,background:step>s.n?T.indigo:T.border}}/>}
          {i<STEPS.length-1&&<div style={{position:"absolute",right:0,top:15,width:"50%",height:2,background:step>s.n?T.indigo:T.border}}/>}
          <div style={{width:30,height:30,borderRadius:"50%",background:step>=s.n?T.indigo:T.bg,border:`2px solid ${step>=s.n?T.indigo:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:step>=s.n?"#fff":T.mid,position:"relative",zIndex:1,transition:"all .2s"}}>{step>s.n?"✓":s.n+1}</div>
          <div style={{fontSize:10,fontWeight:600,color:step>=s.n?T.indigo:T.light,marginTop:4}}>{s.l}</div>
        </div>
      ))}
    </div>

    {step===0&&<div>
      <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:6}}>¿Qué tipo de negocio es el cliente?</div>
      <p style={{color:T.mid,fontSize:12,marginBottom:16}}>Selecciona el vertical para que la plataforma se adapte al idioma y flujo de ese negocio.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10,marginBottom:20}}>
        {Object.values(VERTICALS).map(v=>{
          const sel=form.businessType===v.id;
          return <div key={v.id} onClick={()=>{set("businessType")(v.id);set("logo")(v.emojis[0]);set("primaryColor")(v.color);}} style={{padding:"14px 16px",borderRadius:14,border:`2px solid ${sel?v.color:T.border}`,background:sel?v.color+"0e":T.white,cursor:"pointer",transition:"all .18s",boxShadow:sel?`0 4px 16px ${v.color}28`:"none"}}>
            <div style={{fontSize:28,marginBottom:6}}>{v.icon}</div>
            <div style={{fontSize:13,fontWeight:800,color:sel?v.color:T.text,marginBottom:3}}>{v.name}</div>
            <div style={{fontSize:10,color:T.mid,lineHeight:1.5}}>{v.desc}</div>
            {sel&&<div style={{marginTop:8,display:"flex",gap:4,flexWrap:"wrap"}}>
              {[v.labels.catalog,v.labels.order,v.labels.delivery].map(lb=><span key={lb} style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:10,background:v.color+"20",color:v.color}}>{lb}</span>)}
            </div>}
          </div>;
        })}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={()=>setStep(1)} style={{background:selV.color}}>Continuar con {selV.name} →</Btn>
      </div>
    </div>}

    {step===1&&<Card>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,padding:"10px 14px",background:selV.color+"10",border:`1px solid ${selV.color}30`,borderRadius:12}}>
        <span style={{fontSize:20}}>{selV.icon}</span>
        <div><div style={{fontSize:12,fontWeight:800,color:selV.color}}>{selV.name}</div><div style={{fontSize:10,color:T.mid}}>{selV.labels.catalog} · {selV.labels.order}s</div></div>
      </div>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:14}}>📋 Información del negocio</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label={`Nombre del ${selV.labels.branch} *`} value={form.name} onChange={set("name")} placeholder={`Ej: ${selV.name.split("/")[0].trim()} XYZ`} required/>
        <Field label="Propietario *" value={form.owner} onChange={set("owner")} placeholder="Carlos Mejía" required/>
        <Field label="Email *" value={form.email} onChange={set("email")} type="email" placeholder="carlos@negocio.co" required/>
        <Field label="Teléfono" value={form.phone} onChange={set("phone")} placeholder="+57 300 111 2222"/>
        <Field label="Ciudad *" value={form.city} onChange={set("city")} placeholder="Cali" required/>
      </div>
      <Field label="Notas internas" value={form.notes} onChange={set("notes")} textarea rows={2} placeholder="Cómo llegó, potencial de upgrade…"/>
      <div style={{display:"flex",gap:10,justifyContent:"space-between"}}><Btn v="neutral" onClick={()=>setStep(0)}>← Atrás</Btn><Btn disabled={!valid1} onClick={()=>setStep(2)}>Siguiente →</Btn></div>
    </Card>}

    {step===2&&<Card>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>📦 Plan y branding</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {Object.entries(PLAN_MAP).map(([k,v])=>(
          <button key={k} onClick={()=>set("plan")(k)} style={{padding:"14px",borderRadius:12,border:`2px solid ${form.plan===k?v.color:T.border}`,background:form.plan===k?v.color+"12":T.bg,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
            <div style={{fontWeight:800,color:v.color,fontSize:14}}>{v.label}</div>
            <div style={{fontWeight:900,fontSize:16,color:T.text,marginTop:3}}>{fmtCOP(v.price)}<span style={{fontSize:10,color:T.mid,fontWeight:400}}>/mes</span></div>
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>EMOJI / LOGO</label>
          <input value={form.logo} onChange={e=>set("logo")(e.target.value)} style={{width:"100%",padding:"12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:28,textAlign:"center",outline:"none"}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:7}}>{selV.emojis.map(e=><button key={e} onClick={()=>set("logo")(e)} style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${form.logo===e?selV.color:T.border}`,background:form.logo===e?selV.color+"20":"transparent",fontSize:17,cursor:"pointer"}}>{e}</button>)}</div>
        </div>
        <div>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>COLOR PRINCIPAL</label>
          <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:8}}>
            <input type="color" value={form.primaryColor} onChange={e=>set("primaryColor")(e.target.value)} style={{width:48,height:40,borderRadius:10,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
            <input value={form.primaryColor} onChange={e=>set("primaryColor")(e.target.value)} style={{flex:1,padding:"9px 12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:12,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[selV.color,"#f97316","#dc2626","#8b5cf6","#059669","#2563eb","#db2777","#d97706"].map(c=><div key={c} onClick={()=>set("primaryColor")(c)} style={{width:24,height:24,borderRadius:"50%",background:c,cursor:"pointer",border:form.primaryColor===c?`3px solid ${T.text}`:"3px solid transparent"}}/>)}
          </div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:4}} onClick={()=>set("sendWelcome")(!form.sendWelcome)}>
        <div style={{width:44,height:24,borderRadius:12,background:form.sendWelcome?T.indigo:T.border,position:"relative",transition:"background .2s",flexShrink:0}}>
          <div style={{position:"absolute",top:3,left:form.sendWelcome?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
        </div>
        <span style={{fontSize:13,color:T.text,fontWeight:form.sendWelcome?700:400}}>Enviar email de bienvenida con credenciales</span>
      </div>
      <div style={{display:"flex",gap:10,marginTop:18}}><Btn v="neutral" onClick={()=>setStep(1)}>← Atrás</Btn><Btn onClick={()=>setStep(3)}>Siguiente →</Btn></div>
    </Card>}

    {step===3&&<Card>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>✅ Confirmar y crear</div>
      <div style={{background:selV.color+"0a",border:`1px solid ${selV.color}25`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22}}>{selV.icon}</span>
        <div><div style={{fontSize:13,fontWeight:800,color:selV.color}}>{selV.name}</div><div style={{fontSize:11,color:T.mid}}>{selV.labels.catalog} · {selV.labels.order}s · {selV.labels.delivery}</div></div>
      </div>
      <div style={{background:T.bg,borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["🏪","Negocio",form.name],["👤","Propietario",form.owner],["📧","Email",form.email],["📞","Teléfono",form.phone||"—"],["📍","Ciudad",form.city],["📦","Plan",`${PLAN_MAP[form.plan]?.label} — ${fmtCOP(PLAN_MAP[form.plan]?.price)}/mes`]].map(([ic,lb,vl])=>(
            <div key={lb} style={{marginBottom:8}}><div style={{fontSize:10,fontWeight:700,color:T.light,marginBottom:2}}>{ic} {lb}</div><div style={{fontSize:13,color:T.text,fontWeight:600}}>{vl}</div></div>
          ))}
        </div>
      </div>
      <div style={{height:70,borderRadius:12,background:"#111009",display:"flex",alignItems:"center",padding:"0 14px",gap:12,border:`1px solid ${T.border}`,marginBottom:16}}>
        <div style={{width:40,height:40,borderRadius:12,background:form.primaryColor+"28",border:`2px solid ${form.primaryColor}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{form.logo}</div>
        <div>
          <div style={{color:"#fff",fontWeight:800,fontSize:14}}>{form.name||"Nombre"}</div>
          <div style={{color:form.primaryColor,fontSize:10}}>{selV.name} · {form.city}</div>
        </div>
      </div>
      {form.sendWelcome&&<div style={{background:T.greenL,border:`1px solid ${T.green}30`,borderRadius:10,padding:"9px 13px",fontSize:12,color:T.green,marginBottom:14}}>📨 Email de bienvenida → {form.email}</div>}
      <div style={{display:"flex",gap:10}}><Btn v="neutral" onClick={()=>setStep(2)}>← Atrás</Btn><Btn full onClick={create} icon="✅">Crear cuenta ahora</Btn></div>
    </Card>}
  </div>;
}
