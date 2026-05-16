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

export function SecDiseno({config,onUpdate}){
  const [d,setD]=useState(config);
  const [saved,setSaved]=useState(false);
  const set=k=>v=>setD(p=>({...p,[k]:v}));
  const save=()=>{onUpdate(d);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Diseño del menú</h2><p style={{color:T.mid,fontSize:13,marginTop:3}}>Personaliza la experiencia visual del cliente</p></div>
      <Btn onClick={save}>{saved?"✓ ¡Guardado!":"Guardar cambios"}</Btn>
    </div>
    <div className="diseno-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>🏪 Identidad</div>
        <Field label="Nombre del restaurante" value={d.name} onChange={set("name")} placeholder="Ej: La Leña" required/>
        <Field label="Tagline / Slogan" value={d.tagline} onChange={set("tagline")} placeholder="Cocina de fuego lento · Desde 1998"/>
        <div style={{fontSize:11,color:T.mid,marginBottom:8,marginTop:-4}}>El nombre y tagline son opcionales — si tienes un buen banner, ¡no hace falta!</div>
        <PhotoInput label="Logo del restaurante" value={d.logo} onChange={set("logo")} height={100} dims="400×400 px • Cuadrada • PNG con fondo transparente o JPG • Máx 1MB"/>
        <div style={{marginTop:4,marginBottom:16}}><Toggle value={d.openStatus} onChange={set("openStatus")} label="🟢 Abierto ahora"/></div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>🎨 Colores y estilo</div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>Color principal</label>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <input type="color" value={d.primaryColor} onChange={e=>set("primaryColor")(e.target.value)} style={{width:50,height:42,borderRadius:10,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
              <input value={d.primaryColor} onChange={e=>set("primaryColor")(e.target.value)} style={{flex:1,padding:"10px 12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}/>
              <div style={{width:42,height:42,borderRadius:10,background:d.primaryColor,boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["#f97316","#e85d04","#dc2626","#8b5cf6","#059669","#2563eb","#d97706","#db2777","#0f172a"].map(c=><div key={c} onClick={()=>set("primaryColor")(c)} style={{width:26,height:26,borderRadius:"50%",background:c,cursor:"pointer",border:d.primaryColor===c?`3px solid ${T.text}`:"3px solid transparent",transition:"all .15s"}}/>)}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>Estilo del menú</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["dark","🌙 Oscuro"],["light","☀️ Claro"]].map(([k,l])=>(
                <button key={k} onClick={()=>set("menuStyle")(k)} style={{padding:"10px",borderRadius:10,border:`2px solid ${d.menuStyle===k?d.primaryColor:T.border}`,background:d.menuStyle===k?d.primaryColor+"12":T.bg,color:d.menuStyle===k?d.primaryColor:T.mid,fontSize:12,fontWeight:d.menuStyle===k?800:500,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </div>
          <Toggle value={d.showAllergens} onChange={set("showAllergens")} label="Mostrar alérgenos en el menú"/>
        </Card>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>📸 Fotos</div>
          <PhotoInput label="Foto de portada (banner)" value={d.coverImg} onChange={set("coverImg")} height={90} dims="1200×450 px • Horizontal 8:3 • JPG o PNG • Máx 3MB"/>
          <PhotoInput label="Fondo del menú (opcional)" value={d.bgImg} onChange={set("bgImg")} height={70} dims="1080×1920 px • Vertical • JPG o PNG • Máx 3MB"/>
        </Card>
        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,fontSize:11,fontWeight:700,color:T.mid,textTransform:"uppercase",letterSpacing:".5px"}}>🔍 Preview</div>
          <div style={{height:130,background:d.menuStyle==="dark"?"#111009":"#f8f7f4",position:"relative",overflow:"hidden"}}>
            {d.coverImg&&<img src={d.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.5}} alt=""/>}
            <div style={{position:"absolute",inset:0,background:d.menuStyle==="dark"?"linear-gradient(to top,rgba(17,16,9,1),rgba(0,0,0,.2))":"linear-gradient(to top,rgba(248,247,244,1),rgba(255,255,255,.2))"}}/>
            <div style={{position:"absolute",bottom:12,left:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:12,background:d.primaryColor+"30",border:`2px solid ${d.primaryColor}55`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>{d.logo&&(d.logo.startsWith("http")||d.logo.startsWith("data:"))?<img src={d.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:20}}>{d.logo||"🏪"}</span>}</div>
                <div>
                  <div style={{color:d.menuStyle==="dark"?"#fff":"#111",fontWeight:800,fontSize:15}}>{d.name}</div>
                  <div style={{color:d.primaryColor,fontSize:10,fontStyle:"italic"}}>{d.tagline}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    {/* REDES SOCIALES */}
    <Card style={{marginTop:16}}>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:4}}>📱 Redes sociales</div>
      <div style={{fontSize:12,color:T.mid,marginBottom:16}}>Los clientes verán los íconos en el menú. Pega el link completo o solo el número para WhatsApp.</div>
      <div className="diseno-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="WhatsApp (número)" value={d.socialLinks?.whatsapp||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),whatsapp:v}}))} placeholder="573001234567"/>
        <Field label="Instagram (link)" value={d.socialLinks?.instagram||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),instagram:v}}))} placeholder="https://instagram.com/…"/>
        <Field label="Facebook (link)" value={d.socialLinks?.facebook||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),facebook:v}}))} placeholder="https://facebook.com/…"/>
        <Field label="TikTok (link)" value={d.socialLinks?.tiktok||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),tiktok:v}}))} placeholder="https://tiktok.com/@…"/>
        <Field label="TripAdvisor (link)" value={d.socialLinks?.tripadvisor||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),tripadvisor:v}}))} placeholder="https://tripadvisor.com/…"/>
      </div>
    </Card>
    <div style={{marginTop:20}}><Btn full onClick={save} style={{padding:"14px"}}>{saved?"✓ ¡Cambios guardados!":"Guardar todos los cambios"}</Btn></div>
  </div>;
}
