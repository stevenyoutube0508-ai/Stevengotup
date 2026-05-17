import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { T, CM, STYLES } from "../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../constants/seed";
import { VERTICALS, getVertical } from "../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../utils/format";
import { pointInPoly } from "../utils/geo";
import { Lock, Eye, AlertTriangle } from "lucide-react";
import { LogoIcon, LogoFull } from "../shared/components/Logo";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../shared/components";

export function Login({onLogin}){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const submit=async()=>{
    setErr("");setLoading(true);
    const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
    if(error){setErr("Correo o contraseña incorrectos.");setLoading(false);return;}
    const {data:profile}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
    if(profile) onLogin({...data.user,role:profile.role,name:profile.name,title:profile.title,avatar:profile.avatar,subscriptionExpiresAt:profile.subscription_expires_at||null,businessType:profile.business_type||"restaurant"});
    else{setErr("Perfil no encontrado.");setLoading(false);}
  };
  const inp={width:"100%",boxSizing:"border-box",padding:"12px 16px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",transition:"border-color .2s"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#fff8f5 0%,#fef3ee 40%,#f0f4ff 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <style>{STYLES}</style>
    <div style={{width:"100%",maxWidth:420,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:0,filter:`drop-shadow(0 10px 32px ${T.coral}50)`}}>
          <LogoIcon size={72}/>
        </div>
        <div style={{fontWeight:900,fontSize:30,letterSpacing:"-.5px",lineHeight:1,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          <span style={{color:T.navy}}>picku</span><span style={{color:T.coral}}>.ai</span>
        </div>
        <div style={{color:T.light,fontSize:11,marginTop:8,letterSpacing:"2px",fontWeight:600,textTransform:"uppercase"}}>Digital Business Platform</div>
      </div>
      <div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:20,padding:32,boxShadow:"0 8px 40px rgba(0,0,0,.07)"}}>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>Correo</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.co" style={inp} onFocus={e=>e.target.style.borderColor=T.coral} onBlur={e=>e.target.style.borderColor=T.border}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>Contraseña</label>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={inp} onFocus={e=>e.target.style.borderColor=T.coral} onBlur={e=>e.target.style.borderColor=T.border}/>
        </div>
        {err&&<div style={{background:T.redL,border:`1px solid ${T.red}30`,borderRadius:10,padding:"10px 14px",fontSize:13,color:T.red,marginBottom:16,display:"flex",alignItems:"center",gap:7}}><AlertTriangle size={14}/>{err}</div>}
        <button onClick={submit} disabled={loading} style={{width:"100%",padding:"14px",background:T.coral,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:loading?"not-allowed":"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 4px 18px ${T.coral}50`,transition:"opacity .15s",opacity:loading?.7:1}}>
          {loading?<div style={{width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.4)",borderTopColor:"#fff",animation:"spin .7s linear infinite"}}/>:<Lock size={16}/>}{loading?"Verificando…":"Ingresar"}
        </button>
      </div>
      <button onClick={()=>window.location.href="?menu"} style={{width:"100%",marginTop:12,padding:"12px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:12,color:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=T.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <Eye size={14}/> Ver menú del cliente (demo público)
      </button>
    </div>
  </div>;
}

/* ─── ADMIN SIDEBAR ───────────────────────────────────────── */
