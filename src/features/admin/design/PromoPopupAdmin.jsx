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

export function PromoPopupAdmin({popup,onChange,cats}){
  const def={active:false,img:"",bgColor:"#7c3aed",title:"",subtitle:"",ctaText:"Ver promoción",linkType:"none",linkCatId:"",linkUrl:"",frequency:"session",delay:20};
  const p=popup||def;
  const hasContent=!!(p.img||p.title);
  const [editing,setEditing]=useState(!hasContent);
  const [draft,setDraft]=useState({...def,...p});
  const dset=k=>v=>setDraft(x=>({...x,[k]:v}));
  const openEdit=()=>{setDraft({...def,...p});setEditing(true);};
  const apply=()=>{onChange(draft);setEditing(false);};
  const clear=()=>{onChange({...def,active:false});setDraft({...def});setEditing(false);};
  const toggleActive=()=>onChange({...p,active:!p.active});
  const FREQ_LABEL={"always":"Siempre","session":"Por sesión","daily":"Una al día"};
  const LINK_LABEL={"none":"Sin acción","category":"→ Categoría","external":"→ Link externo"};
  return <Card style={{marginTop:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hasContent&&!editing?0:14}}>
      <div>
        <div style={{fontSize:13,fontWeight:800,color:T.text}}>🎯 Popup promocional</div>
        <div style={{fontSize:11,color:T.mid,marginTop:2}}>Aparece al entrar al menú — ideal para promos flash</div>
      </div>
      {hasContent&&!editing
        ?<div style={{display:"flex",gap:8,alignItems:"center"}}>
           <Toggle value={p.active} onChange={toggleActive} sm/>
         </div>
        :<Toggle value={draft.active} onChange={v=>setDraft(x=>({...x,active:v}))} sm/>
      }
    </div>

    {/* ── VISTA COMPACTA (guardado) ── */}
    {hasContent&&!editing&&<div style={{display:"flex",gap:12,alignItems:"center",paddingTop:12,borderTop:`1px solid ${T.border}`}}>
      <div style={{width:60,height:60,borderRadius:10,overflow:"hidden",flexShrink:0,background:p.bgColor||"#7c3aed",position:"relative"}}>
        {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:22}}>🎯</div>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title||"Popup sin título"}</div>
        <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap"}}>
          <span style={{fontSize:9,fontWeight:700,background:T.coralL,color:T.coral,borderRadius:6,padding:"2px 6px"}}>⏱️ {p.delay??20}s</span>
          <span style={{fontSize:9,fontWeight:700,background:"#f0fdf4",color:"#16a34a",borderRadius:6,padding:"2px 6px"}}>🔁 {FREQ_LABEL[p.frequency||"session"]}</span>
          {p.linkType!=="none"&&<span style={{fontSize:9,fontWeight:700,background:"#dbeafe",color:"#1e40af",borderRadius:6,padding:"2px 6px"}}>{LINK_LABEL[p.linkType]}</span>}
          {p.subtitle&&<span style={{fontSize:10,color:T.mid}}>{p.subtitle}</span>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
        <button onClick={openEdit} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",color:T.mid}}>✏️</button>
        <button onClick={()=>window.confirm("¿Quitar el popup promocional?")&&clear()} style={{background:"none",border:"1px solid rgba(220,38,38,.2)",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",color:"#dc2626"}}>🗑</button>
      </div>
    </div>}

    {/* ── FORMULARIO DE EDICIÓN ── */}
    {(!hasContent||editing)&&<>
      {!hasContent&&<div style={{background:T.bg,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.mid,marginBottom:14}}>Sin popup configurado — agrega una imagen o título para activarlo.</div>}
      <PhotoInput label="🖼️ Imagen del popup" value={draft.img} onChange={dset("img")} height={120} dims="600×800 px • Vertical • JPG o PNG • Máx 3MB • Se adapta a cualquier pantalla"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Field label="Título (opcional)" value={draft.title} onChange={dset("title")} placeholder="¡Oferta del día!"/>
        <Field label="Texto botón CTA" value={draft.ctaText} onChange={dset("ctaText")} placeholder="Ver promoción"/>
      </div>
      <Field label="Subtexto (opcional)" value={draft.subtitle} onChange={dset("subtitle")} placeholder="Solo hoy · Hasta agotar existencias"/>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🎨 Color de fondo (si no hay imagen)</label>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="color" value={draft.bgColor||"#7c3aed"} onChange={e=>dset("bgColor")(e.target.value)} style={{width:44,height:38,borderRadius:8,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
          <div style={{flex:1,height:38,borderRadius:8,background:draft.bgColor||"#7c3aed",display:"flex",alignItems:"center",paddingLeft:12,color:"#fff",fontWeight:700,fontSize:12}}>{draft.title||"Preview popup"}</div>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🔗 Acción del botón CTA</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          {[["none","🚫 Solo cerrar","Sin navegación"],["category","🗂️ Categoría","Lleva a una sección"],["external","🌐 Link externo","Abre una URL"]].map(([k,label,sub])=>(
            <button key={k} onClick={()=>setDraft(x=>({...x,linkType:k}))} style={{padding:"9px 8px",borderRadius:10,border:`2px solid ${(draft.linkType||"none")===k?T.coral:T.border}`,background:(draft.linkType||"none")===k?T.coralL:T.bg,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:800,color:T.text}}>{label}</div>
              <div style={{fontSize:10,color:T.mid,marginTop:2,lineHeight:1.3}}>{sub}</div>
            </button>
          ))}
        </div>
        {draft.linkType==="category"&&<select value={draft.linkCatId} onChange={e=>dset("linkCatId")(e.target.value)} style={{width:"100%",padding:"10px 12px",background:T.bg,border:`1.5px solid ${draft.linkCatId?T.coral:T.border}`,borderRadius:10,fontSize:13,color:draft.linkCatId?T.text:T.mid,outline:"none"}}>
          <option value="">— Elige una categoría —</option>
          {(cats||[]).map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>}
        {draft.linkType==="external"&&<div>
          <input value={draft.linkUrl} onChange={e=>dset("linkUrl")(e.target.value)} placeholder="https://ejemplo.com/promo" style={{width:"100%",padding:"10px 12px",background:T.bg,border:`1.5px solid ${draft.linkUrl?T.coral:T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"}}/>
          <div style={{fontSize:10,color:T.mid,marginTop:5}}>💡 Se abrirá en nueva pestaña</div>
        </div>}
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🔁 ¿Con qué frecuencia aparece?</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["always","🔄 Siempre","Cada vez que abre el menú"],["session","1️⃣ Una vez","Por sesión del navegador"],["daily","📅 Una al día","Se resetea cada 24h"]].map(([k,label,sub])=>(
            <button key={k} onClick={()=>dset("frequency")(k)} style={{padding:"9px 8px",borderRadius:10,border:`2px solid ${(draft.frequency||"session")===k?T.coral:T.border}`,background:(draft.frequency||"session")===k?T.coralL:T.bg,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:800,color:T.text}}>{label}</div>
              <div style={{fontSize:10,color:T.mid,marginTop:2,lineHeight:1.3}}>{sub}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>⏱️ Aparece después de… <span style={{color:T.coral,fontWeight:900}}>{draft.delay??20}s de navegación</span></label>
        <input type="range" min={0} max={60} step={5} value={draft.delay??20} onChange={e=>dset("delay")(parseInt(e.target.value))} style={{width:"100%",accentColor:T.coral,cursor:"pointer"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.light,marginTop:3}}>
          {["0s","10s","20s","30s","40s","50s","60s"].map((l,i)=><span key={i}>{l}</span>)}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        {editing&&<Btn full v="neutral" onClick={()=>setEditing(false)}>Cancelar</Btn>}
        <Btn full onClick={apply} disabled={!(draft.img||draft.title)}>
          {editing?"Guardar popup":"Agregar popup"}
        </Btn>
      </div>
    </>}
  </Card>;
}

/* ─── ADMIN: BANNERS ──────────────────────────────────────── */
