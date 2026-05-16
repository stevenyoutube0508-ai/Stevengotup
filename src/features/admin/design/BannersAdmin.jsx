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

export function BannersAdmin({banners,onChange,primaryColor,cats}){
  const pc=primaryColor;
  const [editIdx,setEditIdx]=useState(null);
  const [form,setForm]=useState({title:"",subtitle:"",img:"",bgColor:pc,active:true,linkType:"none",linkCatId:"",linkUrl:""});
  const openNew=()=>{setForm({title:"",subtitle:"",img:"",bgColor:pc,active:true,position:"inicio",linkType:"none",linkCatId:"",linkUrl:""});setEditIdx(-1);};
  const openEdit=i=>{setForm({...banners[i],linkType:banners[i].linkType||"none",linkCatId:banners[i].linkCatId||"",linkUrl:banners[i].linkUrl||""});setEditIdx(i);};
  const save=()=>{
    if(editIdx===-1) onChange([...banners,{...form,id:newId()}]);
    else onChange(banners.map((b,i)=>i===editIdx?{...b,...form}:b));
    setEditIdx(null);
  };
  const del=i=>onChange(banners.filter((_,j)=>j!==i));
  const toggle=i=>onChange(banners.map((b,j)=>j===i?{...b,active:!b.active}:b));
  return <Card style={{marginTop:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:800,color:T.text}}>🎯 Banners promocionales</div>
      <Btn sm onClick={openNew}>+ Agregar banner</Btn>
    </div>
    {banners.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:T.light,fontSize:12}}>Sin banners — agrega uno para mostrar promociones en el menú del cliente</div>}
    {banners.map((b,i)=>(
      <div key={b.id||i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
        <div style={{width:60,height:40,borderRadius:8,overflow:"hidden",flexShrink:0,background:b.bgColor||"#f97316"}}>
          {b.img?<img src={b.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:18}}>🎯</div>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.title||"Sin título"}</div>
          <div style={{display:"flex",gap:5,marginTop:2,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:9,fontWeight:700,background:T.coralL,color:T.coral,borderRadius:6,padding:"2px 6px"}}>{b.position==="productos"?"📋 En carta":b.position==="ambos"?"🔁 Ambos":"🏠 Inicio"}</span>
            {b.linkType==="category"&&<span style={{fontSize:9,fontWeight:700,background:"#d1fae5",color:"#065f46",borderRadius:6,padding:"2px 6px"}}>🗂️ {(cats||[]).find(c=>c.id===b.linkCatId)?.name||"Categoría"}</span>}
            {b.linkType==="external"&&<span style={{fontSize:9,fontWeight:700,background:"#dbeafe",color:"#1e40af",borderRadius:6,padding:"2px 6px"}}>🌐 Link</span>}
            {b.subtitle&&<span style={{fontSize:11,color:T.mid}}>{b.subtitle}</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <button onClick={()=>toggle(i)} style={{width:36,height:20,borderRadius:20,border:"none",cursor:"pointer",background:b.active?pc:"#ccc",position:"relative",transition:"background .2s"}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:b.active?18:2,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
          </button>
          <button onClick={()=>openEdit(i)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",color:T.mid}}>✏️</button>
          <button onClick={()=>del(i)} style={{background:"none",border:"1px solid rgba(220,38,38,.2)",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",color:"#dc2626"}}>🗑</button>
        </div>
      </div>
    ))}
    {editIdx!==null&&<div onClick={()=>setEditIdx(null)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 16px",overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,.25)",margin:"auto"}}>
        <div style={{fontWeight:900,fontSize:17,color:T.text,marginBottom:16}}>{editIdx===-1?"Nuevo banner":"Editar banner"}</div>
        <Field label="Título del banner *" value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} placeholder="2x1 en Bandeja Paisa · Hoy"/>
        <Field label="Subtexto" value={form.subtitle} onChange={v=>setForm(p=>({...p,subtitle:v}))} placeholder="Válido solo hoy · Hasta agotar existencias"/>
        <PhotoInput label="Imagen del banner" value={form.img} onChange={v=>setForm(p=>({...p,img:v}))} height={100} dims="1200×500 px • Horizontal 12:5 • JPG o PNG • Máx 3MB"/>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>Color de fondo (si no hay imagen)</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="color" value={form.bgColor} onChange={e=>setForm(p=>({...p,bgColor:e.target.value}))} style={{width:44,height:38,borderRadius:8,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
            <div style={{flex:1,height:38,borderRadius:8,background:form.bgColor,display:"flex",alignItems:"center",paddingLeft:12,color:"#fff",fontWeight:700,fontSize:12}}>{form.title||"Preview"}</div>
          </div>
        </div>
        {/* Dónde aparece */}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>📍 ¿Dónde aparece el banner?</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[["inicio","🏠 Inicio","Antes de las categorías"],["productos","📋 En carta","Mientras navega productos"],["ambos","🔁 Ambos","En inicio y en carta"]].map(([k,label,sub])=>(
              <button key={k} onClick={()=>setForm(p=>({...p,position:k}))} style={{padding:"9px 8px",borderRadius:10,border:`2px solid ${(form.position||"inicio")===k?T.coral:T.border}`,background:(form.position||"inicio")===k?T.coralL:T.bg,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
                <div style={{fontSize:12,fontWeight:800,color:T.text}}>{label}</div>
                <div style={{fontSize:10,color:T.mid,marginTop:2,lineHeight:1.3}}>{sub}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Acción al hacer clic */}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🔗 Acción al hacer clic en el banner</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            {[["none","🚫 Ninguna","Solo informativo"],["category","🗂️ Categoría","Lleva a una sección"],["external","🌐 Link externo","Abre una URL"]].map(([k,label,sub])=>(
              <button key={k} onClick={()=>setForm(p=>({...p,linkType:k}))} style={{padding:"9px 8px",borderRadius:10,border:`2px solid ${(form.linkType||"none")===k?T.coral:T.border}`,background:(form.linkType||"none")===k?T.coralL:T.bg,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
                <div style={{fontSize:12,fontWeight:800,color:T.text}}>{label}</div>
                <div style={{fontSize:10,color:T.mid,marginTop:2,lineHeight:1.3}}>{sub}</div>
              </button>
            ))}
          </div>
          {form.linkType==="category"&&<div>
            <label style={{fontSize:11,fontWeight:600,color:T.mid,display:"block",marginBottom:6}}>Selecciona la categoría destino</label>
            <select value={form.linkCatId} onChange={e=>setForm(p=>({...p,linkCatId:e.target.value}))} style={{width:"100%",padding:"10px 12px",background:T.bg,border:`1.5px solid ${form.linkCatId?T.coral:T.border}`,borderRadius:10,fontSize:13,color:form.linkCatId?T.text:T.mid,outline:"none"}}>
              <option value="">— Elige una categoría —</option>
              {(cats||[]).map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>}
          {form.linkType==="external"&&<div>
            <label style={{fontSize:11,fontWeight:600,color:T.mid,display:"block",marginBottom:6}}>URL de destino</label>
            <input value={form.linkUrl} onChange={e=>setForm(p=>({...p,linkUrl:e.target.value}))} placeholder="https://ejemplo.com/promo" style={{width:"100%",padding:"10px 12px",background:T.bg,border:`1.5px solid ${form.linkUrl?T.coral:T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"}}/>
            <div style={{fontSize:10,color:T.mid,marginTop:5}}>💡 Debe empezar por https:// — se abrirá en una nueva pestaña</div>
          </div>}
        </div>
        <Toggle value={form.active} onChange={v=>setForm(p=>({...p,active:v}))} label="Banner activo (visible para clientes)"/>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <Btn full v="neutral" onClick={()=>setEditIdx(null)}>Cancelar</Btn>
          <Btn full onClick={save} disabled={!form.title}>{editIdx===-1?"Agregar banner":"Guardar cambios"}</Btn>
        </div>
      </div>
    </div>}
  </Card>;
}


/* ─── ADMIN: POPUP PROMOCIONAL ────────────────────────────── */
