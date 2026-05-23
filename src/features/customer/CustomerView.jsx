import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T, CM, STYLES } from "../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../constants/seed";
import { VERTICALS, getVertical } from "../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../utils/format";
import { pointInPoly } from "../../utils/geo";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../shared/components";
import relojArenaGif from "../../assets/reloj-arena.gif";
import enPreparacionGif from "../../assets/enpreparacion.gif";
import deliveryGif from "../../assets/delivery.gif";
import entregadoGif from "../../assets/entregado.gif";
import pedidolistoGif from "../../assets/pedidolisto.gif";


export function MenuPreview({config,products,cats}){
  const [selCat,setSelCat]=useState(cats[0]?.id||"");
  const pc=config.primaryColor||"#f97316";
  const isDark=config.menuStyle==="dark";
  const bg=isDark?"#111009":"#f8f7f4";
  const surf=isDark?"#1e1a14":"#fff";
  const txt=isDark?"#f5f0e6":"#1a1a1a";
  const mid=isDark?"rgba(255,255,255,.5)":"rgba(0,0,0,.5)";
  const bdr=isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.08)";
  const activeCats=cats.filter(c=>c.active&&products.some(p=>p.catId===c.id&&p.active));
  const catProds=products.filter(p=>p.catId===selCat&&p.active);
  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:bg,overflow:"hidden",position:"relative"}}>
    {/* bgImg — fondo sutil exactamente como en SecDiseno preview */}
    {config.bgImg&&<img src={config.bgImg} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:isDark?0.14:0.08,zIndex:0,pointerEvents:"none"}}/>}
    {/* Topbar */}
    <div style={{position:"relative",zIndex:1,background:isDark?"rgba(17,16,9,.97)":"rgba(255,255,255,.97)",borderBottom:`1px solid ${bdr}`,padding:"6px 10px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
      <div style={{width:26,height:26,borderRadius:8,background:pc+"22",border:`1px solid ${pc}33`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
        {config.logo&&(config.logo.startsWith("http")||config.logo.startsWith("data:"))?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:13}}>{config.logo||"🏪"}</span>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:txt,fontWeight:800,fontSize:11,lineHeight:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{config.name||"Tu negocio"}</div>
        <div style={{display:"flex",alignItems:"center",gap:3,marginTop:2}}>
          <span style={{width:4,height:4,borderRadius:"50%",background:config.openStatus?"#22c55e":"#ef4444",display:"inline-block"}}/>
          <span style={{color:config.openStatus?"#22c55e":"#ef4444",fontSize:8,fontWeight:700}}>{config.openStatus?"Abierto":"Cerrado"}</span>
        </div>
      </div>
    </div>
    {/* Cover banner strip — franja con coverImg, sin texto superpuesto */}
    {config.coverImg
      ?<div style={{position:"relative",zIndex:1,height:56,overflow:"hidden",flexShrink:0}}>
          <img src={config.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.75}} alt=""/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.5) 0%,rgba(0,0,0,.08) 100%)"}}/>
        </div>
      :<div style={{position:"relative",zIndex:1,height:36,background:pc+"10",border:`1.5px dashed ${pc}28`,margin:"6px 8px",borderRadius:8,display:"grid",placeItems:"center",flexShrink:0}}>
          <span style={{color:pc,fontSize:8,fontWeight:700,opacity:.6}}>📸 Foto de portada</span>
        </div>
    }
    {/* Category tabs */}
    <div style={{position:"relative",zIndex:1,background:isDark?"rgba(17,16,9,.97)":bg,borderBottom:`1px solid ${bdr}`,display:"flex",overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
      {activeCats.map(c=><button key={c.id} onClick={()=>setSelCat(c.id)} style={{flexShrink:0,padding:"7px 9px",background:"none",border:"none",borderBottom:selCat===c.id?`2.5px solid ${pc}`:"2.5px solid transparent",cursor:"pointer",fontSize:9,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:selCat===c.id?800:500,color:selCat===c.id?pc:mid,whiteSpace:"nowrap"}}>{c.icon} {c.name}</button>)}
    </div>
    {/* Product list */}
    <div style={{position:"relative",zIndex:1,flex:1,overflowY:"auto",padding:"8px 8px 14px"}}>
      {catProds.map(p=>(
        <div key={p.id} style={{background:surf,borderRadius:10,marginBottom:7,overflow:"hidden",border:`1px solid ${bdr}`,opacity:p.stock?1:0.5}}>
          {p.img&&<div style={{height:75,overflow:"hidden",position:"relative"}}>
            <img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.name}/>
            <div style={{position:"absolute",inset:0,background:isDark?"linear-gradient(to top,rgba(30,26,20,.9),transparent 55%)":"linear-gradient(to top,rgba(255,255,255,.7),transparent 55%)"}}/>
            <div style={{position:"absolute",bottom:6,left:7,right:7}}>
              <div style={{color:txt,fontWeight:700,fontSize:10,lineHeight:1.2}}>{p.name}</div>
              <div style={{color:pc,fontWeight:800,fontSize:10}}>{fmtCOP(p.price)}</div>
            </div>
            {p.label&&<div style={{position:"absolute",top:4,left:4,background:p.labelColor,color:"#fff",borderRadius:20,padding:"1px 5px",fontSize:7,fontWeight:800}}>{p.label}</div>}
            {!p.stock&&<div style={{position:"absolute",top:4,right:4,background:"rgba(220,38,38,.9)",color:"#fff",borderRadius:20,padding:"1px 5px",fontSize:7,fontWeight:800}}>Agotado</div>}
          </div>}
          {!p.img&&<div style={{padding:"8px 9px",display:"flex",gap:7,alignItems:"center"}}>
            <span style={{fontSize:16}}>{p.emoji}</span>
            <div style={{flex:1}}><div style={{color:txt,fontWeight:700,fontSize:10}}>{p.name}</div><div style={{color:pc,fontWeight:800,fontSize:10}}>{fmtCOP(p.price)}</div></div>
          </div>}
          {config.showAllergens&&p.allergens?.length>0&&<div style={{padding:"0 8px 5px",display:"flex",gap:2}}>{p.allergens.map(a=>{const al=ALLERGENS_LIST.find(x=>x.id===a);return al?<span key={a} style={{fontSize:9}} title={al.l}>{al.i}</span>:null;})}</div>}
        </div>
      ))}
      {catProds.length===0&&<div style={{textAlign:"center",padding:"24px 8px",color:mid,fontSize:10}}>Sin productos en esta categoría</div>}
    </div>
  </div>;
}

/* ─── BANNERS CARRUSEL (VISTA CLIENTE) ───────────────────── */

export function BannersCarousel({banners,primaryColor,isDark,cats,onSelectCat,catalogBtn="🍽️ Ver carta completa"}){
  const [idx,setIdx]=useState(0);
  const [showCats,setShowCats]=useState(false);
  const total=banners.length;
  useEffect(()=>{
    if(total<=1)return;
    const t=setInterval(()=>setIdx(i=>(i+1)%total),4500);
    return()=>clearInterval(t);
  },[total]);
  const b=banners[idx];
  const bg=b.bgColor||primaryColor;
  const handleBannerClick=()=>{
    if(b.linkType==="category"&&b.linkCatId){onSelectCat(b.linkCatId);return;}
    if(b.linkType==="external"&&b.linkUrl){window.open(b.linkUrl,"_blank","noopener");return;}
    setShowCats(v=>!v);
  };
  const ctaLabel=b.linkType==="category"?"Ver productos →":b.linkType==="external"?"Ver oferta →":null;
  return <div style={{padding:"12px 12px 4px"}}>
    {/* Banner principal */}
    <div style={{position:"relative",borderRadius:18,overflow:"hidden",height:160,marginBottom:10,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,.18)"}}
      onClick={handleBannerClick}>
      {b.img
        ?<img src={b.img} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} alt={b.title}/>
        :<div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${bg},${bg}bb)`}}/>
      }
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.15) 55%,transparent 100%)"}}/>
      <div style={{position:"absolute",bottom:14,left:16,right:ctaLabel?120:16}}>
        <div style={{color:"#fff",fontWeight:900,fontSize:20,letterSpacing:"-.3px",lineHeight:1.15,textShadow:"0 2px 10px rgba(0,0,0,.5)",marginBottom:4}}>{b.title}</div>
        {b.subtitle&&<div style={{color:"rgba(255,255,255,.8)",fontSize:12,fontWeight:500}}>{b.subtitle}</div>}
      </div>
      {ctaLabel&&<div style={{position:"absolute",bottom:14,right:14,background:"rgba(255,255,255,.2)",backdropFilter:"blur(8px)",border:"1.5px solid rgba(255,255,255,.35)",borderRadius:20,padding:"6px 13px",color:"#fff",fontSize:11,fontWeight:800,whiteSpace:"nowrap",letterSpacing:".2px"}}>{ctaLabel}</div>}
      {total>1&&<div style={{position:"absolute",top:10,right:12,display:"flex",gap:4}}>
        {banners.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setIdx(i);}} style={{width:i===idx?18:6,height:6,borderRadius:10,background:i===idx?"#fff":"rgba(255,255,255,.4)",transition:"all .3s",cursor:"pointer"}}/>)}
      </div>}
    </div>
    {/* Botón ver carta completa */}
    <button onClick={()=>setShowCats(!showCats)} style={{width:"100%",padding:"13px",background:isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",border:`1.5px solid ${isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.08)"}`,borderRadius:14,color:isDark?"#fff":"#1a1a1a",fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:showCats?8:0,transition:"all .2s"}}>
      <span>{catalogBtn}</span>
      <span style={{fontSize:18,opacity:.4,transform:showCats?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
    </button>
    {showCats&&<div style={{display:"flex",flexDirection:"column",gap:6,animation:"fadeUp .2s ease"}}>
      {cats.map(c=><button key={c.id} onClick={()=>{onSelectCat(c.id);setShowCats(false);}} style={{width:"100%",padding:"11px 16px",background:isDark?"rgba(255,255,255,.05)":"#fff",border:`1px solid ${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.07)"}`,borderRadius:12,color:isDark?"rgba(255,255,255,.85)":"#1a1a1a",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"'Plus Jakarta Sans',sans-serif",textAlign:"left"}}>
        <span style={{fontSize:18}}>{c.icon}</span>
        <span style={{flex:1}}>{c.name}</span>
        <span style={{fontSize:14,opacity:.3}}>›</span>
      </button>)}
    </div>}
  </div>;
}

/* ─── MODAL DETALLE PRODUCTO ─────────────────────────────── */

export function ProductDetailModal({p,onClose,onAdd,orderMode,pc,isDark,config,bdr,txt,mid}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:520,background:"rgba(0,0,0,.78)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:isDark?"#1c1710":"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",animation:"slideUp .28s ease",boxShadow:"0 -10px 60px rgba(0,0,0,.5)"}}>
      {/* Imagen grande */}
      {p.img
        ?<div style={{position:"relative",height:270,flexShrink:0,overflow:"hidden",borderRadius:"24px 24px 0 0"}}>
          <img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.name}/>
          <div style={{position:"absolute",inset:0,background:isDark?"linear-gradient(to top,rgba(28,23,16,1) 0%,transparent 55%)":"linear-gradient(to top,rgba(255,255,255,.85) 0%,transparent 55%)"}}/>
          {!p.stock&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{background:"rgba(220,38,38,.95)",color:"#fff",fontSize:14,fontWeight:800,padding:"9px 24px",borderRadius:24}}>Temporalmente agotado</span></div>}
          {p.label&&p.stock&&<div style={{position:"absolute",top:16,left:16,background:p.labelColor,color:"#fff",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:800}}>{p.label}</div>}
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,width:36,height:36,borderRadius:"50%",background:"rgba(0,0,0,.55)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
        </div>
        :<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 20px 0"}}>
          <div style={{width:72,height:72,borderRadius:20,background:isDark?"rgba(255,255,255,.07)":"#f4f4f4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42}}>{p.emoji}</div>
          <button onClick={onClose} style={{width:36,height:36,borderRadius:"50%",background:isDark?"rgba(255,255,255,.09)":"#f0f0f0",border:"none",color:mid,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      }
      <div style={{padding:"18px 22px 36px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <h2 style={{color:txt,fontSize:22,fontWeight:900,letterSpacing:"-.3px",margin:0,lineHeight:1.2,flex:1,paddingRight:10}}>{p.name}</h2>
          {!p.img&&p.label&&p.stock&&<div style={{background:p.labelColor,color:"#fff",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:800,flexShrink:0}}>{p.label}</div>}
        </div>
        <div style={{color:pc,fontWeight:900,fontSize:26,marginBottom:14,letterSpacing:"-.5px"}}>{fmtCOP(orderMode==="domicilio"&&p.deliveryPrice?p.deliveryPrice:p.price)}</div>
        {p.desc&&<p style={{color:mid,fontSize:14,lineHeight:1.75,margin:"0 0 16px"}}>{p.desc}</p>}
        {config.showAllergens&&p.allergens?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {p.allergens.map(a=>{const al=ALLERGENS_LIST.find(x=>x.id===a);return al?<span key={a} style={{fontSize:12,background:isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)",borderRadius:20,padding:"4px 10px",color:mid,fontWeight:600}}>{al.i} {al.l}</span>:null;})}
        </div>}
        {orderMode&&p.stock&&<button onClick={()=>{onAdd(p);onClose();}} style={{width:"100%",padding:"16px",background:`linear-gradient(135deg,${pc},${pc}cc)`,border:"none",borderRadius:18,color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 8px 28px ${pc}55`,marginTop:6,letterSpacing:"-.2px"}}>+ Agregar al pedido · {fmtCOP(orderMode==="domicilio"&&p.deliveryPrice?p.deliveryPrice:p.price)}</button>}
        {orderMode&&!p.stock&&<div style={{textAlign:"center",padding:"14px",background:"rgba(220,38,38,.08)",borderRadius:14,color:"#dc2626",fontWeight:700,fontSize:13,marginTop:6}}>No disponible en este momento</div>}
        {!orderMode&&<button onClick={onClose} style={{width:"100%",padding:"14px",background:"none",border:`1.5px solid ${bdr}`,borderRadius:16,color:mid,fontSize:14,fontWeight:600,cursor:"pointer",marginTop:6,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Cerrar</button>}
      </div>
    </div>
  </div>;
}

/* ─── TARJETA DE CATEGORÍA (VISTA CLIENTE) ───────────────── */

export const CAT_GRADIENTS=[
  ["#f97316","#ea580c"],["#8b5cf6","#7c3aed"],["#059669","#047857"],
  ["#2563eb","#1d4ed8"],["#dc2626","#b91c1c"],["#d97706","#b45309"],
  ["#0891b2","#0e7490"],["#be185d","#9d174d"],["#16a34a","#15803d"],["#7c3aed","#6d28d9"],
];

export function CategoryCard({c,pc,isDark,onClick,idx,prodCount}){
  const [g0,g1]=CAT_GRADIENTS[idx%CAT_GRADIENTS.length];
  const hasBg=!!c.bgImg;
  const txColor=c.textColor||"#ffffff";
  const fs=c.fontStyle||"modern";
  const fontMap={modern:["'Plus Jakarta Sans',sans-serif","900","-.3px","none"],classic:["Georgia,serif","700","0","none"],bold:["Impact,sans-serif","900","1px","uppercase"],elegant:["'Plus Jakarta Sans',sans-serif","300","3px","uppercase"]};
  const [ff,fw,lsp,ttu]=fontMap[fs]||fontMap.modern;
  const bgFinal=hasBg?"#111":(c.bgColor||`linear-gradient(135deg,${g0},${g1})`);
  return <div onClick={onClick}
    style={{width:"100%",height:122,borderRadius:16,overflow:"hidden",position:"relative",cursor:"pointer",
      marginBottom:10,background:bgFinal,boxShadow:`0 4px 16px rgba(0,0,0,.22)`,
      transition:"transform .18s,opacity .18s"}}
    onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.012)";e.currentTarget.style.opacity=".92";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}>
    {hasBg&&<img src={c.bgImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} alt=""/>}
    {/* Gradient overlay — heavier on left for text legibility */}
    <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,.68) 0%,rgba(0,0,0,.3) 55%,rgba(0,0,0,.1) 100%)"}}/>
    {/* Content row */}
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 16px 0 22px",justifyContent:"space-between",gap:12}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:txColor,fontWeight:fw,fontFamily:ff,fontSize:22,letterSpacing:lsp,textTransform:ttu,
          textShadow:"0 2px 10px rgba(0,0,0,.65)",lineHeight:1.2,
          overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{c.name}</div>
        {prodCount>0&&<div style={{marginTop:7,display:"inline-flex",alignItems:"center",
          background:"rgba(255,255,255,.18)",backdropFilter:"blur(6px)",
          borderRadius:20,padding:"3px 10px"}}>
          <span style={{color:txColor,opacity:.95,fontSize:11,fontWeight:700}}>{prodCount} {prodCount===1?"producto":"productos"}</span>
        </div>}
      </div>
      {/* Arrow circle */}
      <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,.18)",
        backdropFilter:"blur(8px)",border:"1.5px solid rgba(255,255,255,.28)",
        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{color:txColor,fontSize:18,fontWeight:900,lineHeight:1,marginLeft:2}}>›</span>
      </div>
    </div>
  </div>;
}

/* ─── ICONOS REDES SOCIALES ──────────────────────────────── */

export function SocialLinksRow({config,isDark}){
  const sl=config?.socialLinks||{};
  const wa=(sl.whatsapp||config?.whatsapp||"").replace(/\D/g,"");
  const links=[
    wa&&{key:"wa",href:`https://wa.me/${wa}`,bg:"#22c55e",icon:"whatsapp"},
    sl.instagram&&{key:"ig",href:sl.instagram,bg:"radial-gradient(circle at 30% 107%, #fdf497 0%,#fd5949 45%,#d6249f 60%,#285AEB 90%)",icon:"instagram"},
    sl.facebook&&{key:"fb",href:sl.facebook,bg:"#1877f2",icon:"facebook"},
    sl.tiktok&&{key:"tt",href:sl.tiktok,bg:"#010101",icon:"tiktok"},
    sl.tripadvisor&&{key:"ta",href:sl.tripadvisor,bg:"#34e0a1",icon:"tripadvisor"},
  ].filter(Boolean);
  if(!links.length)return null;
  const SVGS={
    whatsapp:<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
    instagram:<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    facebook:<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    tiktok:<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    tripadvisor:<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-3.5 9.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm7 0a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm-3.5-2L9 10.5h1.5V15l3-3H12V7.5z"/></svg>,
  };
  return <div style={{padding:"16px 16px 0",display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
    {links.map(l=><a key={l.key} href={l.href} target="_blank" rel="noreferrer"
      style={{width:52,height:52,borderRadius:"50%",background:l.bg,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",boxShadow:"0 4px 14px rgba(0,0,0,.22)",flexShrink:0}}>
      {SVGS[l.icon]}
    </a>)}
  </div>;
}

function StatusVisualIcon({ icon, label, size = 86 }) {
  const isImage =
    typeof icon === "string" &&
    /\.(gif|png|jpe?g|webp|svg)(\?.*)?$/i.test(icon);

  if (isImage) {
    return (
      <img
        src={icon}
        alt={label || "Estado del pedido"}
        draggable={false}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
          filter: "drop-shadow(0 12px 22px rgba(0,0,0,.22))",
          pointerEvents: "none",
        }}
      />
    );
  }

  return (
    <span
      style={{
        fontSize: size * 0.68,
        lineHeight: 1,
        display: "block",
      }}
    >
      {icon}
    </span>
  );
}

/* ─── POINT-IN-POLYGON (ray casting) ────────────────────── */

export function CustomerView({config,products,cats,onBack,onAddOrder,branches,banners=[],businessType="restaurant",initialBranchId=null,initialMode=null,storeKey=null}){
  const vl=(VERTICALS[businessType]||VERTICALS.restaurant).labels;
  const isRestaurant=businessType==="restaurant";
  const vertIcon=(VERTICALS[businessType]||VERTICALS.restaurant).icon;
  const [screen,setScreen]=useState("splash"); // splash | city | branch | menu
  const [activeCat,setActiveCat]=useState("");
  // I-12: persistir carrito en sessionStorage para sobrevivir F5
  const cartKey = `cart_${storeKey||"demo"}`;
  const [cart,setCart]=useState(()=>{
    try{const s=sessionStorage.getItem(cartKey);return s?JSON.parse(s):[];}catch{return [];}
  });
  const setCartPersist = cb => setCart(prev => {
    const next = typeof cb === "function" ? cb(prev) : cb;
    try{sessionStorage.setItem(cartKey,JSON.stringify(next));}catch{}
    return next;
  });
  const [cartOpen,setCartOpen]=useState(false);
  const [q,setQ]=useState("");
  const [checkout,setCheckout]=useState(false);
  const [step,setStep]=useState(1);
  const [orderMode,setOrderMode]=useState(initialMode||null);
  const [showPopup,setShowPopup]=useState(false);
  const popupTimerRef=useRef(null);
  const popup=config.promoPopup;
  const [selBranchId,setSelBranchId]=useState(null);
  const [selCity,setSelCity]=useState(null);
  const [branchPickerMode,setBranchPickerMode]=useState(null);
  const [selectedZone,setSelectedZone]=useState(null);
  const [zoneStatus,setZoneStatus]=useState(null); // null|"checking"|"found"|"none"
  const zoneTimer=useRef(null);
  const [form,setForm]=useState({name:"",phone:"",email:"",address:"",table:"",payment:"cash",notes:""});
  const [submitting,setSubmitting]=useState(false);
  const [trackedOrder,setTrackedOrder]=useState(null);
  const [selProd,setSelProd]=useState(null);
  // Abre modal de producto Y registra la vista en Supabase (solo menú público, no preview admin)
  const openProduct = useCallback((p) => {
    setSelProd(p);
    if (storeKey && p?.id) {
      supabase.from("products")
        .update({ clicks: (p.clicks || 0) + 1 })
        .eq("id", p.id);
    }
  }, [storeKey]);
  const pc=config.primaryColor||"#f97316";
  const isDark=config.menuStyle==="dark";
  const bg=isDark?CM.bg:"#f8f7f4";
  const surf=isDark?CM.surface:"#fff";
  const card=isDark?CM.card:"#fff";
  const txt=isDark?CM.text:"#1a1a1a";
  const mid=isDark?CM.mid:"rgba(0,0,0,.5)";
  const bdr=isDark?CM.border:"rgba(0,0,0,.08)";
  const inp={width:"100%",boxSizing:"border-box",padding:"11px 13px",background:isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.05)",border:`1.5px solid ${bdr}`,borderRadius:11,color:txt,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",marginBottom:12};
  const selBranch=branches?.find(b=>b.id===selBranchId)||branches?.[0];
  const cities=[...new Set((branches||[]).map(b=>b.city).filter(Boolean))];
  const hasDomicilios=branches?.some(b=>b.services?.domicilios);
  const hasReservas=selBranch?.services?.reservas;
  const hasPickup=branches?.some(b=>b.services?.pickup);
  const deliveryZones=selBranch?.deliveryZones||branches?.find(b=>b.services?.domicilios)?.deliveryZones||[];
  const detectZone=useCallback(async addr=>{
    const zones=(selBranch?.deliveryZones||[]).filter(z=>z.active&&z.latLngs?.length>=3);
    if(!zones.length){setZoneStatus(null);return;}
    if(!addr?.trim()){setSelectedZone(null);setZoneStatus(null);return;}
    setZoneStatus("checking");setSelectedZone(null);
    try{
      const city=selBranch?.city||"";
      const q=encodeURIComponent([addr,city].filter(Boolean).join(", "));
      const res=await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,{headers:{"Accept-Language":"es"}});
      const data=await res.json();
      if(!data?.length){setZoneStatus("none");return;}
      const pt={lat:parseFloat(data[0].lat),lng:parseFloat(data[0].lon)};
      const match=zones.find(z=>pointInPoly(pt,z.latLngs));
      if(match){setSelectedZone(match);setZoneStatus("found");}
      else setZoneStatus("none");
    }catch{setZoneStatus(null);}
  },[selBranch]);
  const effectiveMode=orderMode||"domicilio";
  const deliveryFee=selectedZone?.price||(effectiveMode==="domicilio"?config.deliveryFee||5000:0);
  const cartSubtotal=cart.reduce((s,c)=>s+c.total,0);
  const cartFinal=cartSubtotal+(effectiveMode==="domicilio"?deliveryFee:0);
  const cartCount=cart.reduce((s,c)=>s+c.qty,0);
  const getEffPrice=p=>orderMode==="domicilio"&&p.deliveryPrice?p.deliveryPrice:p.price;
  const channelOk=p=>orderMode==="domicilio"?(p.forDelivery!==false):(p.forMenu!==false);
  // branchOk: show the product only if it's assigned to "all" branches
  // OR the currently selected branch. When there's only one branch (or no
  // branch selection yet), selBranch falls back to branches[0] — still correct.
  const branchOk=p=>{
    const ids=p.branchIds||["all"];
    if(ids.includes("all")) return true;
    if(!selBranch) return true;
    return ids.includes(selBranch.id);
  };
  const activeCats=cats.filter(c=>c.active&&products.some(p=>p.catId===c.id&&p.active&&channelOk(p)&&branchOk(p)));
  const catProds=q?products.filter(p=>p.active&&channelOk(p)&&branchOk(p)&&(p.name.toLowerCase().includes(q.toLowerCase())||(p.desc||"").toLowerCase().includes(q.toLowerCase()))):products.filter(p=>p.catId===activeCat&&p.active&&channelOk(p)&&branchOk(p));
  const featured=products.filter(p=>p.featured&&p.active&&p.stock&&channelOk(p)&&branchOk(p));
  const add=p=>setCartPersist(c=>[...c,{uid:Date.now()+Math.random(),product:p,qty:1,total:getEffPrice(p)}]);
  const rem=uid=>setCartPersist(c=>c.filter(x=>x.uid!==uid));
  const ff=v=>setForm(f=>({...f,...v}));
  const STATUS_INFO = {
  pendiente: {
    icon: relojArenaGif,
    label: "Recibido — confirmando",
    color: "#f59e0b",
    desc: "Tu pedido fue recibido. Estamos confirmando.",
  },
  en_cocina: {
    icon: enPreparacionGif,
    label: vl.status_processing,
    color: "#3b82f6",
    desc: vl.status_processing_desc,
  },
  listo: {
    icon: pedidolistoGif,
    label: vl.status_ready,
    color: "#059669",
    desc: vl.status_ready_desc,
  },
  en_camino: {
    icon: deliveryGif,
    label: vl.status_shipping,
    color: "#8b5cf6",
    desc: vl.status_shipping_desc,
  },
  entregado: {
    icon: entregadoGif,
    label: vl.status_done,
    color: "#059669",
    desc: vl.status_done_desc,
  },
};
  useEffect(()=>{
    if(!trackedOrder||trackedOrder.status==="entregado")return;

    // I-8: fetch inmediato del estado real en DB (la suscripción puede llegar tarde)
    supabase.from("orders").select("status").eq("id",trackedOrder.id).single()
      .then(({data})=>{ if(data?.status&&data.status!==trackedOrder.status) setTrackedOrder(p=>({...p,status:data.status})); });

    // ① Canal Broadcast — el admin/operador emite 'order_update' en el canal
    //   específico del pedido. No requiere Realtime configurado, funciona con anon key.
    const channel = supabase
      .channel(`order:${trackedOrder.id}`)
      .on("broadcast",{ event:"order_update" }, payload=>{
        const {status:newStatus}=payload.payload||{};
        if(newStatus) setTrackedOrder(p=>({...p,status:newStatus}));
      })
      // ② postgres_changes — bonus si la tabla tiene Realtime activado
      .on("postgres_changes",
        {event:"UPDATE",schema:"public",table:"orders",filter:`id=eq.${trackedOrder.id}`},
        payload=>{ if(payload.new?.status) setTrackedOrder(p=>({...p,status:payload.new.status})); }
      )
      .subscribe();

    // ③ Polling cada 8 s — fallback si WebSockets fallan o si la política RLS
    //   permite SELECT público por id (UUID no adivinable → seguro).
    const poll=setInterval(async()=>{
      const {data}=await supabase.from("orders").select("status").eq("id",trackedOrder.id).single();
      if(data?.status&&data.status!==trackedOrder.status)
        setTrackedOrder(p=>({...p,status:data.status}));
    },8000);

    return()=>{ supabase.removeChannel(channel); clearInterval(poll); };
  },[trackedOrder?.id]);
  // Popup trigger — fires when user enters the menu screen
  useEffect(()=>{
    if(screen!=="menu")return;
    if(!popup?.active||(!(popup.img)&&!(popup.title)))return;
    const freq=popup.frequency||"session";
    const key=`popup_${config.name||"menu"}`;
    if(freq==="session"&&sessionStorage.getItem(key))return;
    if(freq==="daily"){const stored=localStorage.getItem(key);if(stored===new Date().toDateString())return;}
    const delaySec=(popup.delay??20)*1000;
    popupTimerRef.current=setTimeout(()=>{
      setShowPopup(true);
      if(freq==="session")sessionStorage.setItem(key,"1");
      if(freq==="daily")localStorage.setItem(key,new Date().toDateString());
    },delaySec);
    return()=>clearTimeout(popupTimerRef.current);
  },[screen]);
  // Splash auto-advance
  useEffect(()=>{
    if(screen!=="splash")return;
    const t=setTimeout(()=>{
      const cs=[...new Set((branches||[]).map(b=>b.city).filter(Boolean))];
      if(!branches||branches.length===0){setScreen("menu");return;}
      // QR con sucursal específica → saltar el selector de ciudad/sucursal
      if(initialBranchId){
        const b=branches.find(br=>br.id===initialBranchId)||branches[0];
        setSelBranchId(b.id);
        if(b.services?.domicilios||b.services?.pickup) setScreen("service");
        else setScreen("menu");
        return;
      }
      if(branches.length===1){
        const b=branches[0];setSelBranchId(b.id);
        if(b.services?.domicilios||b.services?.pickup) setScreen("service");
        else setScreen("menu");
        return;
      }
      if(cs.length>1){setScreen("city");return;}
      setScreen("branch");
    },1600);
    return()=>clearTimeout(t);
  },[screen,branches,initialBranchId]);
  const closePopup=()=>setShowPopup(false);
  const handlePopupCTA=()=>{
    if(popup?.linkType==="category"&&popup.linkCatId){setActiveCat(popup.linkCatId);closePopup();return;}
    if(popup?.linkType==="external"&&popup.linkUrl){window.open(popup.linkUrl,"_blank","noopener");closePopup();return;}
    closePopup();
  };
  const submitOrder=async()=>{
    if(!form.name||!form.phone)return;
    if(orderMode==="domicilio"&&!form.address)return;
    setSubmitting(true);
    const o={id:newId(),createdAt:Date.now(),status:"pendiente",mode:effectiveMode,time:timeNow(),date:todayStr(),branchId:selBranchId||null,customerName:form.name,customerPhone:form.phone,customerEmail:form.email,address:form.address,addressRef:selectedZone?.name||"",table:form.table,notes:form.notes,payment:form.payment,items:cart.map(c=>({id:c.product.id,name:c.product.name,price:c.product.price,qty:c.qty,total:c.total,emoji:c.product.emoji})),subtotal:cartSubtotal,delivery:effectiveMode==="domicilio"?deliveryFee:0,total:cartFinal};
    if(onAddOrder)await onAddOrder(o);
    setTrackedOrder(o);setCartPersist([]);setCheckout(false);setStep(1);setSubmitting(false);
  };
  /* ── SPLASH ───────────────────────────────────────────────── */
  if(screen==="splash"){
    const isImg=config.logo&&(config.logo.startsWith("http")||config.logo.startsWith("data:"));
    return <div style={{position:"fixed",inset:0,background:pc,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999}}>
      <style>{STYLES}</style>
      {config.logo&&<div style={{width:isImg?112:92,height:isImg?112:92,borderRadius:28,
        background:isImg?"transparent":"rgba(255,255,255,.2)",
        border:isImg?"none":"3px solid rgba(255,255,255,.38)",
        display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",
        marginBottom:20,animation:"scaleIn .55s ease",
        boxShadow:isImg?"0 10px 48px rgba(0,0,0,.28)":"none"}}>
        {isImg?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:48}}>{config.logo}</span>}
      </div>}
      {config.name&&<div style={{color:"#fff",fontWeight:900,fontSize:26,letterSpacing:"-.5px",
        textShadow:"0 2px 16px rgba(0,0,0,.2)",textAlign:"center",padding:"0 28px",marginBottom:4}}>{config.name}</div>}
      <div style={{marginTop:38,display:"flex",gap:9}}>
        {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",
          background:"rgba(255,255,255,.55)",animation:`pulse2 1.4s ease ${i*.22}s infinite`}}/>)}
      </div>
    </div>;
  }

  /* ── CITY PICKER ──────────────────────────────────────────── */
  if(screen==="city"){
    return <div style={{minHeight:"100vh",background:"#0d0d0d",position:"relative",display:"flex",flexDirection:"column"}}>
      <style>{STYLES}</style>
      {(config.bgImg||config.coverImg)&&<img src={config.bgImg||config.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.28}} alt=""/>}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.55) 0%,rgba(0,0,0,.9) 100%)"}}/>
      <div style={{position:"relative",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"52px 24px 80px"}}>
        {config.logo&&(()=>{const isImg=config.logo.startsWith("http")||config.logo.startsWith("data:");
          return <div style={{width:isImg?90:76,height:isImg?90:76,borderRadius:24,
            background:isImg?"transparent":pc+"44",border:isImg?"none":`3px solid ${pc}77`,
            display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",
            marginBottom:18,boxShadow:`0 8px 36px rgba(0,0,0,.55)`}}>
            {isImg?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:36}}>{config.logo}</span>}
          </div>;
        })()}
        {config.name&&<div style={{color:"#fff",fontWeight:900,fontSize:24,letterSpacing:"-.4px",
          textAlign:"center",marginBottom:config.tagline?5:28,textShadow:"0 2px 8px rgba(0,0,0,.5)"}}>{config.name}</div>}
        {config.tagline&&<div style={{color:"rgba(255,255,255,.5)",fontSize:13,textAlign:"center",marginBottom:30}}>{config.tagline}</div>}
        <div style={{color:"rgba(255,255,255,.38)",fontSize:10,fontWeight:800,textTransform:"uppercase",
          letterSpacing:"2.5px",marginBottom:14}}>Selecciona tu ciudad</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:320}}>
          {cities.map(city=><button key={city} onClick={()=>{
            setSelCity(city);
            const cb=(branches||[]).filter(b=>b.city===city);
            if(cb.length===1){setSelBranchId(cb[0].id);setScreen("menu");}
            else setScreen("branch");
          }} style={{padding:"15px 20px",background:"rgba(255,255,255,.1)",backdropFilter:"blur(14px)",
            border:"1.5px solid rgba(255,255,255,.16)",borderRadius:14,color:"#fff",fontSize:15,
            fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",
            fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"background .18s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.19)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}>
            <span>📍 {city}</span>
            <span style={{opacity:.4,fontSize:18}}>›</span>
          </button>)}
          {cities.length===0&&<button onClick={()=>setScreen("menu")} style={{padding:"15px 20px",
            background:pc,border:"none",borderRadius:14,color:"#fff",fontSize:15,fontWeight:800,
            cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Ver catálogo →</button>}
        </div>
      </div>
      <div style={{position:"relative",paddingBottom:44}}><SocialLinksRow config={config} isDark={true}/></div>
    </div>;
  }

  /* ── BRANCH PICKER ────────────────────────────────────────── */
  if(screen==="branch"){
    const cityBranches=selCity?(branches||[]).filter(b=>b.city===selCity):(branches||[]);
    return <div style={{minHeight:"100vh",background:"#0d0d0d",position:"relative",display:"flex",flexDirection:"column"}}>
      <style>{STYLES}</style>
      {(config.bgImg||config.coverImg)&&<img src={config.bgImg||config.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.22}} alt=""/>}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.6) 0%,rgba(0,0,0,.92) 100%)"}}/>
      <div style={{position:"relative",flex:1,display:"flex",flexDirection:"column"}}>
        {/* Topbar */}
        <div style={{padding:"14px 18px 10px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setScreen(cities.length>1?"city":"splash")} style={{width:38,height:38,
            borderRadius:12,background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.18)",
            color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>←</button>
          {config.logo&&(()=>{const isImg=config.logo.startsWith("http")||config.logo.startsWith("data:");
            return <div style={{width:30,height:30,borderRadius:8,background:isImg?"transparent":pc+"44",
              display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              {isImg?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:15}}>{config.logo}</span>}
            </div>;
          })()}
          <span style={{color:"#fff",fontWeight:800,fontSize:14,flex:1}}>{config.name}</span>
        </div>
        {/* Content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"22px 20px 48px"}}>
          <div style={{color:"rgba(255,255,255,.38)",fontSize:10,fontWeight:800,textTransform:"uppercase",
            letterSpacing:"2.5px",marginBottom:selCity?4:16}}>Elige tu sucursal</div>
          {selCity&&<div style={{color:"rgba(255,255,255,.55)",fontSize:13,marginBottom:20}}>📍 {selCity}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:400}}>
            {cityBranches.map(b=><button key={b.id} onClick={()=>{setSelBranchId(b.id);const hasSvc=b.services?.domicilios||b.services?.pickup;if(hasSvc)setScreen("service");else setScreen("menu");}}
              style={{padding:"16px 18px",background:"rgba(255,255,255,.09)",backdropFilter:"blur(14px)",
                border:"1.5px solid rgba(255,255,255,.15)",borderRadius:16,cursor:"pointer",
                display:"flex",alignItems:"center",gap:14,fontFamily:"'Plus Jakarta Sans',sans-serif",
                textAlign:"left",transition:"background .18s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.16)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.09)"}>
              <div style={{width:44,height:44,borderRadius:12,background:pc+"33",
                border:`1.5px solid ${pc}44`,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:20,flexShrink:0}}>📍</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:"#fff",fontWeight:800,fontSize:15}}>{b.name}</div>
                {b.address&&<div style={{color:"rgba(255,255,255,.42)",fontSize:12,marginTop:2,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.address}</div>}
              </div>
              <span style={{color:"rgba(255,255,255,.32)",fontSize:22,fontWeight:900,lineHeight:1}}>›</span>
            </button>)}
          </div>
        </div>
      </div>
    </div>;
  }

  /* ── SERVICE PICKER ──────────────────────────────────────── */
  if(screen==="service"){
    const svcBranch=branches?.find(b=>b.id===selBranchId)||selBranch;
    const hasDomSvc=svcBranch?.services?.domicilios;
    const hasPickupSvc=svcBranch?.services?.pickup;
    const btnBase={padding:"18px 20px",background:"rgba(255,255,255,.1)",backdropFilter:"blur(14px)",
      border:"1.5px solid rgba(255,255,255,.16)",borderRadius:16,cursor:"pointer",
      display:"flex",alignItems:"center",gap:14,fontFamily:"'Plus Jakarta Sans',sans-serif",
      textAlign:"left",transition:"background .18s",width:"100%"};
    return <div style={{minHeight:"100vh",background:"#0d0d0d",position:"relative",display:"flex",flexDirection:"column"}}>
      <style>{STYLES}</style>
      {(config.bgImg||config.coverImg)&&<img src={config.bgImg||config.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.2}} alt=""/>}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.6) 0%,rgba(0,0,0,.92) 100%)"}}/>
      <div style={{position:"relative",flex:1,display:"flex",flexDirection:"column"}}>
        {/* Topbar */}
        <div style={{padding:"14px 18px 10px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setScreen(branches?.length>1?"branch":"splash")} style={{width:38,height:38,
            borderRadius:12,background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.18)",
            color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>←</button>
          {config.logo&&(()=>{const isImg=config.logo.startsWith("http")||config.logo.startsWith("data:");
            return <div style={{width:30,height:30,borderRadius:8,background:isImg?"transparent":pc+"44",
              display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              {isImg?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:15}}>{config.logo}</span>}
            </div>;
          })()}
          <span style={{color:"#fff",fontWeight:800,fontSize:14,flex:1}}>{config.name}</span>
        </div>
        {/* Content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 24px 52px"}}>
          {/* Branch badge */}
          <div style={{textAlign:"center",marginBottom:30}}>
            <div style={{color:"rgba(255,255,255,.38)",fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>Sucursal seleccionada</div>
            <div style={{color:"#fff",fontWeight:900,fontSize:19}}>{svcBranch?.name}</div>
            {svcBranch?.address&&<div style={{color:"rgba(255,255,255,.44)",fontSize:12,marginTop:5}}>📍 {svcBranch.address}</div>}
          </div>
          <div style={{color:"rgba(255,255,255,.38)",fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"2.5px",marginBottom:14}}>¿Cómo quieres tu pedido?</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:360}}>
            {hasDomSvc&&<button style={btnBase}
              onClick={()=>{setOrderMode("domicilio");setScreen("menu");}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}>
              <span style={{fontSize:28,flexShrink:0}}>{vl.delivery_icon}</span>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontWeight:800,fontSize:15}}>{vl.delivery_title}</div>
                <div style={{color:"rgba(255,255,255,.44)",fontSize:12,marginTop:2}}>{vl.delivery_desc}</div>
              </div>
              <span style={{color:"rgba(255,255,255,.3)",fontSize:20,fontWeight:900,lineHeight:1}}>›</span>
            </button>}
            {hasPickupSvc&&<button style={btnBase}
              onClick={()=>{setOrderMode("pickup");setScreen("menu");}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}>
              <span style={{fontSize:28,flexShrink:0}}>🏪</span>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontWeight:800,fontSize:15}}>{vl.pickup_title}</div>
                <div style={{color:"rgba(255,255,255,.44)",fontSize:12,marginTop:2}}>{vl.pickup_desc}</div>
              </div>
              <span style={{color:"rgba(255,255,255,.3)",fontSize:20,fontWeight:900,lineHeight:1}}>›</span>
            </button>}
            {/* Always show "solo ver carta" */}
            <button style={{...btnBase,background:"rgba(255,255,255,.055)",border:"1.5px solid rgba(255,255,255,.09)"}}
              onClick={()=>{setOrderMode(null);setScreen("menu");}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.12)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.055)"}>
              <span style={{fontSize:26,flexShrink:0}}>📖</span>
              <div style={{flex:1}}>
                <div style={{color:"rgba(255,255,255,.7)",fontWeight:700,fontSize:14}}>Ver carta</div>
                <div style={{color:"rgba(255,255,255,.32)",fontSize:12,marginTop:2}}>Solo explorar el catálogo</div>
              </div>
              <span style={{color:"rgba(255,255,255,.2)",fontSize:20,fontWeight:900,lineHeight:1}}>›</span>
            </button>
          </div>
        </div>
      </div>
    </div>;
  }

  if(screen==="landing"){
    const mostOrdered=products.filter(p=>p.active&&p.stock&&channelOk(p)&&branchOk(p)&&(p.clicks||0)>0).sort((a,b)=>(b.clicks||0)-(a.clicks||0)).slice(0,8);
    const btnBase={width:"100%",padding:"14px 18px",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:14,fontWeight:700,border:"none",textAlign:"left"};
    return <div style={{minHeight:"100vh",background:isDark?CM.bg:"#fff",paddingBottom:72}}>
      <style>{STYLES}</style>
      {config.bgImg&&<img src={config.bgImg} style={{position:"fixed",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:isDark?0.14:0.08,zIndex:-1,pointerEvents:"none"}} alt=""/>}
      {/* Hero */}
      <div style={{position:"relative",height:250,overflow:"hidden",flexShrink:0}}>
        {config.coverImg&&<img src={config.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 25%"}} alt=""/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.72))"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
          {config.logo&&<div style={{width:config.logo.startsWith("http")||config.logo.startsWith("data:")?90:72,height:config.logo.startsWith("http")||config.logo.startsWith("data:")?90:72,borderRadius:22,background:(config.logo.startsWith("http")||config.logo.startsWith("data:"))?"transparent":pc+"33",border:(config.logo.startsWith("http")||config.logo.startsWith("data:"))?"none":`3px solid ${pc}88`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",backdropFilter:"blur(10px)",boxShadow:`0 8px 30px rgba(0,0,0,.4)`}}>{(config.logo.startsWith("http")||config.logo.startsWith("data:"))?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:34}}>{config.logo}</span>}</div>}
          {config.name&&<div style={{color:"#fff",fontWeight:900,fontSize:26,letterSpacing:"-.5px",textShadow:"0 2px 12px rgba(0,0,0,.6)",textAlign:"center",padding:"0 20px"}}>{config.name}</div>}
          {config.tagline&&<div style={{color:"rgba(255,255,255,.7)",fontSize:13,textAlign:"center",maxWidth:260,padding:"0 20px"}}>{config.tagline}</div>}
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:config.openStatus?"#22c55e":"#ef4444",display:"inline-block",boxShadow:config.openStatus?"0 0 8px #22c55e":"none"}}/>
            <span style={{color:"rgba(255,255,255,.85)",fontSize:12,fontWeight:700}}>{config.openStatus?"Abierto ahora":"Cerrado"}</span>
          </div>
        </div>
      </div>
      {/* Recomendados + Más pedidos — grid cuadrado compacto */}
      {(featured.length>0||mostOrdered.length>0)&&<div style={{padding:"18px 14px 8px"}}>
        {featured.length>0&&<>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
            <span style={{fontSize:16}}>⭐</span>
            <span style={{color:isDark?CM.text:"#111",fontWeight:800,fontSize:14}}>{vl.featured_label}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
            {featured.slice(0,6).map(p=><div key={p.id} onClick={()=>{setScreen("menu");setTimeout(()=>openProduct(p),80);}} style={{borderRadius:14,overflow:"hidden",cursor:"pointer",background:isDark?CM.card:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,.08)",border:`1px solid ${isDark?CM.border:"#f0f0f0"}`}}>
              <div style={{aspectRatio:"1",position:"relative",background:isDark?"rgba(255,255,255,.04)":"#f0f0f0"}}>
                {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} alt={p.name}/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:30}}>{p.emoji}</div>}
                {p.label&&<div style={{position:"absolute",top:5,left:5,background:p.labelColor,color:"#fff",borderRadius:8,padding:"2px 6px",fontSize:8,fontWeight:800}}>{p.label}</div>}
              </div>
              <div style={{padding:"7px 8px 9px"}}>
                <div style={{color:isDark?CM.text:"#111",fontWeight:700,fontSize:11,lineHeight:1.3,marginBottom:3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.name}</div>
                <div style={{color:pc,fontWeight:900,fontSize:12}}>{fmtCOP(p.price)}</div>
              </div>
            </div>)}
          </div>
        </>}
        {mostOrdered.length>0&&<>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
            <span style={{fontSize:16}}>🔥</span>
            <span style={{color:isDark?CM.text:"#111",fontWeight:800,fontSize:14}}>{vl.popular_label}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {mostOrdered.slice(0,6).map(p=><div key={p.id} onClick={()=>{setScreen("menu");setTimeout(()=>openProduct(p),80);}} style={{borderRadius:14,overflow:"hidden",cursor:"pointer",background:isDark?CM.card:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,.08)",border:`1px solid ${isDark?CM.border:"#f0f0f0"}`}}>
              <div style={{aspectRatio:"1",position:"relative",background:isDark?"rgba(255,255,255,.04)":"#f0f0f0"}}>
                {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} alt={p.name}/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:30}}>{p.emoji}</div>}
              </div>
              <div style={{padding:"7px 8px 9px"}}>
                <div style={{color:isDark?CM.text:"#111",fontWeight:700,fontSize:11,lineHeight:1.3,marginBottom:3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.name}</div>
                <div style={{color:pc,fontWeight:900,fontSize:12}}>{fmtCOP(p.price)}</div>
              </div>
            </div>)}
          </div>
        </>}
      </div>}
      {/* Ver carta completa */}
      <div style={{padding:"16px 16px 8px"}}>
        <button onClick={()=>branches?.length>1?setBranchPickerMode("menu"):setScreen("menu")} style={{...btnBase,background:pc,color:"#fff",justifyContent:"center",gap:10,fontSize:15,fontWeight:800,boxShadow:`0 6px 24px ${pc}44`,borderRadius:16,padding:"16px"}}>
          {vl.catalog_btn}
        </button>
      </div>
      {/* Servicios */}
      {(hasDomicilios||hasPickup||hasReservas)&&<div style={{padding:"4px 16px 0",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{color:mid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:2,paddingLeft:2}}>{vl.how_order}</div>
        {hasDomicilios&&<button onClick={()=>{if(branches?.length>1)setBranchPickerMode("domicilio");else{setOrderMode("domicilio");setScreen("menu");}}} style={{...btnBase,background:isDark?"rgba(255,255,255,.06)":"#f8f8f8",color:isDark?"#fff":"#111",border:`1px solid ${isDark?"rgba(255,255,255,.08)":"#e5e7eb"}`}}>
          <span style={{fontSize:22,flexShrink:0}}>{vl.delivery_icon}</span><div><div style={{fontWeight:700}}>{vl.delivery_title}</div><div style={{fontSize:11,fontWeight:400,opacity:.5,marginTop:1}}>{vl.delivery_desc}</div></div><span style={{marginLeft:"auto",opacity:.3,fontSize:18}}>›</span>
        </button>}
        {hasPickup&&<button onClick={()=>{if(branches?.length>1)setBranchPickerMode("pickup");else{setOrderMode("pickup");setScreen("menu");}}} style={{...btnBase,background:isDark?"rgba(255,255,255,.06)":"#f8f8f8",color:isDark?"#fff":"#111",border:`1px solid ${isDark?"rgba(255,255,255,.08)":"#e5e7eb"}`}}>
          <span style={{fontSize:22,flexShrink:0}}>🏪</span><div><div style={{fontWeight:700}}>{vl.pickup_title}</div><div style={{fontSize:11,fontWeight:400,opacity:.5,marginTop:1}}>{vl.pickup_desc}</div></div><span style={{marginLeft:"auto",opacity:.3,fontSize:18}}>›</span>
        </button>}
      </div>}
      {/* Info sucursal(es) */}
      {selBranch?.address&&<div style={{margin:"14px 16px 0",padding:"13px 16px",background:isDark?"rgba(255,255,255,.04)":"#f8f8f8",borderRadius:14,border:`1px solid ${isDark?"rgba(255,255,255,.06)":"#e8e8e8"}`}}>
        <div style={{color:mid,fontSize:10,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:".5px"}}>📍 {branches?.length>1?selBranch.name:"Ubicación"}</div>
        <div style={{color:isDark?CM.text:"#374151",fontSize:13,fontWeight:600}}>{selBranch.address}</div>
        {config.schedule&&<div style={{color:mid,fontSize:11,marginTop:4}}>🕐 {config.schedule}</div>}
        {branches?.length>1&&<button onClick={()=>setBranchPickerMode("info")} style={{marginTop:8,background:"none",border:`1px solid ${isDark?"rgba(255,255,255,.12)":pc+"44"}`,borderRadius:20,padding:"4px 12px",color:pc,fontSize:11,fontWeight:700,cursor:"pointer"}}>Cambiar sucursal ›</button>}
      </div>}
      {/* Redes sociales */}
      <SocialLinksRow config={config} isDark={isDark}/>
      {/* Modal selector de sucursal */}
      {branchPickerMode&&<div onClick={()=>setBranchPickerMode(null)} style={{position:"fixed",inset:0,zIndex:520,background:"rgba(0,0,0,.72)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:isDark?"#1c1710":"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"28px 20px 44px",boxShadow:"0 -10px 50px rgba(0,0,0,.4)",animation:"slideUp .28s ease"}}>
          <div style={{color:txt,fontWeight:900,fontSize:20,marginBottom:4,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {branchPickerMode==="domicilio"?"🛵 ¿A cuál sucursal pides?":branchPickerMode==="pickup"?"🏪 ¿De cuál sucursal recoges?":"📍 Selecciona tu sucursal"}
          </div>
          <div style={{color:mid,fontSize:13,marginBottom:20}}>Elige la más cercana a ti</div>
          {branches?.map(b=><button key={b.id} onClick={()=>{
            setSelBranchId(b.id);setBranchPickerMode(null);
            if(branchPickerMode==="domicilio"){setOrderMode("domicilio");setScreen("menu");}
            else if(branchPickerMode==="pickup"){setOrderMode("pickup");setScreen("menu");}
            else if(branchPickerMode==="menu") setScreen("menu");
          }} style={{width:"100%",padding:"16px 18px",background:isDark?"rgba(255,255,255,.05)":"#f8f8f8",border:`1.5px solid ${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.07)"}`,borderRadius:16,marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:14,fontFamily:"'Plus Jakarta Sans',sans-serif",textAlign:"left"}}>
            <span style={{width:40,height:40,borderRadius:12,background:pc+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📍</span>
            <div style={{flex:1}}>
              <div style={{color:txt,fontWeight:800,fontSize:15}}>{b.name}</div>
              <div style={{color:mid,fontSize:12,marginTop:2}}>{b.address}</div>
            </div>
            <span style={{color:pc,fontSize:22,fontWeight:900,lineHeight:1}}>›</span>
          </button>)}
        </div>
      </div>}
      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:40,background:isDark?"rgba(17,16,9,.97)":"rgba(255,255,255,.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"}`,display:"flex",height:58}}>
        <button style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,color:pc}}>
          <span style={{fontSize:18}}>🏠</span><span style={{fontSize:10,fontWeight:700}}>Inicio</span>
        </button>
        <button onClick={()=>setScreen("menu")} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,color:mid}}>
          <span style={{fontSize:18}}>{vertIcon}</span><span style={{fontSize:10,fontWeight:600}}>{vl.catalog}</span>
        </button>
        {(config.socialLinks?.whatsapp||config.whatsapp)&&<a href={`https://wa.me/${(config.socialLinks?.whatsapp||config.whatsapp||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,color:mid,textDecoration:"none"}}><span style={{fontSize:18}}>💬</span><span style={{fontSize:10,fontWeight:600}}>Contacto</span></a>}
      </div>
    </div>;
  }

  if(trackedOrder){
    const si=STATUS_INFO[trackedOrder.status]||STATUS_INFO.pendiente;
    const steps=["pendiente","en_cocina","listo","en_camino","entregado"];
    const idx=steps.indexOf(trackedOrder.status);
    return <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{STYLES}</style>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{background:surf,borderRadius:24,padding:28,border:`1px solid ${bdr}`,animation:"scaleIn .4s ease",marginBottom:12}}>
          <div style={{textAlign:"center",marginBottom:20}}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    }}
  >
    <StatusVisualIcon
      icon={si.icon}
      label={si.label}
      size={86}
    />
  </div>

  <div style={{color:txt,fontSize:20,fontWeight:900}}>
    {si.label}
  </div>

  <div style={{color:mid,fontSize:13,marginTop:4}}>
    {si.desc}
  </div>
</div>
          <div style={{display:"flex",gap:4,marginBottom:20}}>
            {steps.map((s,i)=><div key={s} style={{flex:1,height:5,borderRadius:10,background:i<=idx?si.color:isDark?"rgba(255,255,255,.1)":"#e5e7eb",transition:"background .5s"}}/>)}
          </div>
          <div style={{background:isDark?"rgba(255,255,255,.04)":"#f8f8f8",borderRadius:12,padding:"12px 16px",marginBottom:14}}>
            <div style={{color:mid,fontSize:10,fontWeight:700,marginBottom:4}}>CÓDIGO DE PEDIDO</div>
            <div style={{color:pc,fontSize:22,fontWeight:900,letterSpacing:3}}>{trackedOrder.id.toUpperCase().slice(0,8)}</div>
          </div>
          <div style={{fontSize:12,color:mid}}>
            {[["Subtotal",fmtCOP(trackedOrder.subtotal)],trackedOrder.mode==="domicilio"&&[vl.delivery_fee_label,fmtCOP(trackedOrder.delivery)]].filter(Boolean).map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span>{l}</span><span style={{color:txt,fontWeight:600}}>{v}</span></div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:900,color:txt,borderTop:`1px solid ${bdr}`,paddingTop:8,marginTop:6}}><span>Total</span><span style={{color:pc}}>{fmtCOP(trackedOrder.total)}</span></div>
          </div>
        </div>
        {trackedOrder.status!=="entregado"&&<div style={{textAlign:"center",color:mid,fontSize:12,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:si.color,animation:"pulse2 1.5s infinite"}}/>
          Actualizando en tiempo real…
        </div>}
        {trackedOrder.status==="entregado"&&<button onClick={()=>setTrackedOrder(null)} style={{width:"100%",padding:14,background:pc,border:"none",borderRadius:16,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>← Volver al catálogo</button>}
      </div>
    </div>;
  }
  return <div style={{minHeight:"100vh",background:bg,paddingBottom:130}}>
    {/* FONDO DEL CATÁLOGO — bgImg como textura de fondo (muy sutil) */}
    {config.bgImg&&<img src={config.bgImg} style={{position:"fixed",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:isDark?0.14:0.08,zIndex:-1,pointerEvents:"none"}} alt=""/>}
    {/* POPUP PROMOCIONAL */}
    {showPopup&&popup&&<div onClick={closePopup} style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,.82)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .3s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:380,animation:"scaleIn .3s ease"}}>
        {/* Imagen o fondo */}
        <div style={{borderRadius:24,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.6)",position:"relative",background:popup.img?"#111":(popup.bgColor||"#7c3aed")}}>
          {popup.img
            ?<img src={popup.img} style={{width:"100%",display:"block",maxHeight:"72vh",objectFit:"contain"}} alt={popup.title||"Promo"}/>
            :<div style={{minHeight:260,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 28px",gap:10}}>
               <div style={{color:"#fff",fontWeight:900,fontSize:26,textAlign:"center",lineHeight:1.2,textShadow:"0 2px 12px rgba(0,0,0,.3)"}}>{popup.title}</div>
               {popup.subtitle&&<div style={{color:"rgba(255,255,255,.78)",fontSize:14,textAlign:"center"}}>{popup.subtitle}</div>}
             </div>
          }
          {/* Overlay texto sobre imagen */}
          {popup.img&&(popup.title||popup.subtitle)&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.4) 60%,transparent 100%)",padding:"32px 20px 72px"}}>
            {popup.title&&<div style={{color:"#fff",fontWeight:900,fontSize:22,lineHeight:1.2,textShadow:"0 2px 10px rgba(0,0,0,.5)"}}>{popup.title}</div>}
            {popup.subtitle&&<div style={{color:"rgba(255,255,255,.8)",fontSize:13,marginTop:5}}>{popup.subtitle}</div>}
          </div>}
          {/* CTA button */}
          {popup.linkType!=="none"&&<div style={{position:"absolute",bottom:16,left:16,right:16}}>
            <button onClick={handlePopupCTA} style={{width:"100%",padding:"13px",background:pc,border:"none",borderRadius:16,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 6px 24px ${pc}66`,letterSpacing:"-.2px"}}>
              {popup.ctaText||"Ver promoción"} →
            </button>
          </div>}
        </div>
        {/* Cerrar */}
        <button onClick={closePopup} style={{position:"absolute",top:-14,right:-14,width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,.15)",backdropFilter:"blur(8px)",border:"2px solid rgba(255,255,255,.3)",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,zIndex:10}}>×</button>
      </div>
    </div>}
    {/* TOPBAR — pequeño, sticky, estilo Archies */}
    <div style={{position:"sticky",top:0,zIndex:25,
      background:isDark?"rgba(17,16,9,.97)":"rgba(255,255,255,.97)",
      backdropFilter:"blur(20px)",borderBottom:`1px solid ${bdr}`,
      padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:1}}>
        {config.logo&&(()=>{const isImg=config.logo.startsWith("http")||config.logo.startsWith("data:");
          return <div style={{width:isImg?36:32,height:isImg?36:32,borderRadius:10,
            background:isImg?"transparent":pc+"22",display:"flex",alignItems:"center",justifyContent:"center",
            overflow:"hidden",flexShrink:0}}>
            {isImg?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:16}}>{config.logo}</span>}
          </div>;
        })()}
        <div style={{minWidth:0}}>
          <div style={{color:txt,fontWeight:800,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{config.name}</div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:1}}>
            <span style={{width:5,height:5,borderRadius:"50%",display:"inline-block",
              background:config.openStatus?"#22c55e":"#ef4444",
              boxShadow:config.openStatus?"0 0 6px #22c55e":"none"}}/>
            <span style={{color:config.openStatus?"#22c55e":"#ef4444",fontSize:10,fontWeight:700}}>
              {config.openStatus?"Abierto":"Cerrado"}
            </span>
          </div>
        </div>
      </div>
      {branches?.length>1&&<button onClick={()=>setScreen(cities.length>1?"city":"branch")}
        style={{flexShrink:0,background:isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.05)",
          border:`1px solid ${bdr}`,borderRadius:20,padding:"5px 11px",color:mid,
          fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
        <span>📍</span>{selBranch?.name||"Sucursal"}<span style={{opacity:.4}}>‹</span>
      </button>}
    </div>
    {/* PORTADA — franja visual compacta (sin texto, el topbar ya muestra el nombre) */}
    {config.coverImg&&!activeCat&&!q&&<div style={{position:"relative",height:90,overflow:"hidden",flexShrink:0}}>
      <img src={config.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 35%",opacity:.82}} alt="portada"/>
      <div style={{position:"absolute",inset:0,background:isDark?"linear-gradient(to top,rgba(17,16,9,.68) 0%,rgba(0,0,0,.18) 100%)":"linear-gradient(to top,rgba(248,247,244,.72) 0%,rgba(255,255,255,.08) 100%)"}}/>
    </div>}
    {/* BANNERS INICIO */}
    {banners.filter(b=>b.active&&(b.position==="inicio"||b.position==="ambos"||!b.position)).length>0&&
      <BannersCarousel banners={banners.filter(b=>b.active&&(b.position==="inicio"||b.position==="ambos"||!b.position))} primaryColor={pc} isDark={isDark} cats={activeCats} onSelectCat={id=>{setActiveCat(id);}} catalogBtn={vl.catalog_btn}/>}
    {featured.length>0&&!q&&!activeCat&&<div style={{padding:"12px 0 4px"}}>
      <div style={{padding:"0 14px 8px",fontSize:10,fontWeight:700,color:mid,textTransform:"uppercase",letterSpacing:"1px"}}>⭐ {vl.featured_label}</div>
      <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none",padding:"0 14px"}}>
        {featured.map(p=><div key={p.id} onClick={()=>openProduct(p)} style={{flexShrink:0,width:148,background:card,border:`1px solid ${bdr}`,borderRadius:14,overflow:"hidden",cursor:"pointer"}}>
          <div style={{height:95,overflow:"hidden",position:"relative"}}>{p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.name}/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:34,background:isDark?"rgba(255,255,255,.04)":"#f0f0f0"}}>{p.emoji}</div>}{p.label&&<div style={{position:"absolute",bottom:5,left:6,background:p.labelColor,color:"#fff",borderRadius:12,padding:"2px 7px",fontSize:9,fontWeight:800}}>{p.label}</div>}</div>
          <div style={{padding:"8px 10px 11px"}}><div style={{color:txt,fontWeight:700,fontSize:11,lineHeight:1.3,marginBottom:2}}>{p.name}</div><div style={{color:pc,fontWeight:900,fontSize:13}}>{fmtCOP(p.price)}</div></div>
        </div>)}
      </div>
    </div>}
    {/* BARRA DE BÚSQUEDA + NAVEGACIÓN */}
    <div style={{position:"sticky",top:56,zIndex:20,background:isDark?"rgba(17,16,9,.97)":bg,backdropFilter:"blur(16px)",borderBottom:`1px solid ${bdr}`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px"}}>
        {activeCat&&!q&&<button onClick={()=>setActiveCat("")} style={{flexShrink:0,width:34,height:34,borderRadius:10,background:isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)",border:"none",color:mid,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>←</button>}
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`🔍 Buscar en ${vl.catalog.toLowerCase()}…`} style={{flex:1,padding:"8px 12px",background:isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.06)",border:`1px solid ${bdr}`,borderRadius:10,color:txt,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/>
        {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",color:mid,cursor:"pointer",fontSize:18}}>×</button>}
      </div>
      {activeCat&&!q&&<div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",padding:"0 12px 8px",gap:6}}>
        {activeCats.map(c=><button key={c.id} onClick={()=>setActiveCat(c.id)} style={{flexShrink:0,padding:"6px 14px",background:activeCat===c.id?pc+"18":"none",border:`1.5px solid ${activeCat===c.id?pc:bdr}`,borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:activeCat===c.id?800:500,color:activeCat===c.id?pc:mid,whiteSpace:"nowrap",transition:"all .15s"}}>{c.icon} {c.name}</button>)}
      </div>}
    </div>
    {/* GRID DE CATEGORÍAS (vista inicial) */}
    {!activeCat&&!q&&<div style={{padding:"14px 14px 0"}}>
      <div>
        {activeCats.map((c,i)=><CategoryCard key={c.id} c={c} pc={pc} isDark={isDark}
          onClick={()=>setActiveCat(c.id)} idx={i}
          prodCount={products.filter(p=>p.catId===c.id&&p.active&&channelOk(p)&&branchOk(p)).length}/>)}
      </div>
      {activeCats.length===0&&<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:44,marginBottom:10}}>{vertIcon}</div><div style={{color:mid,fontSize:14}}>Sin categorías activas</div></div>}
    </div>}
    {/* RESULTADOS DE BÚSQUEDA o PRODUCTOS DE CATEGORÍA */}
    {(activeCat||q)&&<div style={{padding:"12px 12px 0"}}>
      {activeCat&&!q&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{fontSize:22}}>{activeCats.find(c=>c.id===activeCat)?.icon}</div>
        <div style={{color:txt,fontWeight:900,fontSize:18}}>{activeCats.find(c=>c.id===activeCat)?.name}</div>
        <div style={{marginLeft:"auto",color:mid,fontSize:12}}>{catProds.length} {catProds.length===1?vl.item.toLowerCase():vl.itemPlural.toLowerCase()}</div>
      </div>}
      {(()=>{
        const prodBanners=banners.filter(b=>b.active&&(b.position==="productos"||b.position==="ambos"));
        return catProds.flatMap((p,i)=>{
          const productEl=<div key={p.id} onClick={()=>openProduct(p)} style={{background:card,borderRadius:16,marginBottom:8,border:`1px solid ${p.stock?bdr:"rgba(220,38,38,.12)"}`,cursor:"pointer",opacity:p.stock?1:0.65,animation:`fadeUp .3s ease ${i*.04}s both`,display:"flex",alignItems:"stretch",overflow:"hidden",minHeight:88}} onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,.04)":card} onMouseLeave={e=>e.currentTarget.style.background=card}>
            <div style={{flexShrink:0,width:90,height:90,position:"relative",alignSelf:"center",margin:8,borderRadius:12,overflow:"hidden",background:isDark?"rgba(255,255,255,.06)":"#f0f0f0"}}>
              {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.name} loading="lazy"/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:32}}>{p.emoji}</div>}
              {!p.stock&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{background:"rgba(220,38,38,.9)",color:"#fff",fontSize:9,fontWeight:800,padding:"3px 7px",borderRadius:8,textAlign:"center",lineHeight:1.2}}>Agotado</span></div>}
            </div>
            <div style={{flex:1,minWidth:0,padding:"10px 12px 10px 4px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:3}}>
                  <div style={{color:txt,fontWeight:700,fontSize:13,lineHeight:1.35,flex:1}}>{p.name}</div>
                  {p.label&&p.stock&&<div style={{flexShrink:0,background:p.labelColor,color:"#fff",borderRadius:10,padding:"2px 7px",fontSize:9,fontWeight:800}}>{p.label}</div>}
                </div>
                {p.desc&&<div style={{color:mid,fontSize:11,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",marginBottom:4}}>{p.desc}</div>}
                {config.showAllergens&&p.allergens?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
                  {p.allergens.map(a=>{const al=ALLERGENS_LIST.find(x=>x.id===a);return al?<span key={a} style={{fontSize:9,background:isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.06)",borderRadius:12,padding:"1px 6px",color:mid,fontWeight:600}}>{al.i}</span>:null;})}
                </div>}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{color:pc,fontWeight:900,fontSize:15}}>{fmtCOP(getEffPrice(p))}</span>
                {orderMode&&p.stock&&<button onClick={e=>{e.stopPropagation();add(p);}} style={{background:pc,border:"none",borderRadius:20,color:"#fff",fontSize:11,fontWeight:800,padding:"6px 14px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",flexShrink:0}}>+ Agregar</button>}
                {!orderMode&&<span style={{color:mid,fontSize:18,lineHeight:1}}>›</span>}
              </div>
            </div>
          </div>;
          const bannerEl=(i===2&&prodBanners.length>0)?<div key="promo-banner" style={{margin:"4px 0 8px"}}><BannersCarousel banners={prodBanners} primaryColor={pc} isDark={isDark} cats={activeCats} onSelectCat={id=>setActiveCat(id)} catalogBtn={vl.catalog_btn}/></div>:null;
          return bannerEl?[productEl,bannerEl]:[productEl];
        });
      })()}
      {catProds.length===0&&<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:44,marginBottom:10}}>{vertIcon}</div><div style={{color:mid,fontSize:14}}>{q?"Sin resultados":"Sin productos en esta categoría"}</div></div>}
    </div>}
    {/* BOTTOM NAV — Menú */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:30,background:isDark?"rgba(17,16,9,.97)":"rgba(255,255,255,.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"}`,display:"flex",height:56}}>
      <button onClick={()=>setScreen(cities.length>1?"city":branches?.length>1?"branch":"splash")} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:mid}}>
        <span style={{fontSize:17}}>🏠</span><span style={{fontSize:9,fontWeight:600}}>Inicio</span>
      </button>
      <button style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:pc}}>
        <span style={{fontSize:17}}>{vertIcon}</span><span style={{fontSize:9,fontWeight:800}}>{vl.catalog}</span>
      </button>
      <button onClick={()=>{setActiveCat("");setQ("");document.querySelector('input[placeholder*="Buscar"]')?.focus();}} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:q?pc:mid}}>
        <span style={{fontSize:17}}>🔍</span><span style={{fontSize:9,fontWeight:600}}>Buscar</span>
      </button>
      {(config.socialLinks?.whatsapp||config.whatsapp)&&<a href={`https://wa.me/${(config.socialLinks?.whatsapp||config.whatsapp||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:mid,textDecoration:"none"}}>
        <span style={{fontSize:17}}>💬</span><span style={{fontSize:9,fontWeight:600}}>Contacto</span>
      </a>}
    </div>
    {cartCount>0&&!cartOpen&&<div style={{position:"fixed",bottom:64,left:"50%",transform:"translateX(-50%)",zIndex:25,width:"calc(100% - 24px)",maxWidth:430}}>
      <button onClick={()=>setCartOpen(true)} style={{width:"100%",padding:"13px 20px",background:isDark?"rgba(17,16,9,.97)":"rgba(255,255,255,.97)",backdropFilter:"blur(20px)",color:txt,border:`1.5px solid ${pc}44`,borderRadius:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 8px 32px rgba(0,0,0,.4),0 0 0 1px ${pc}18`,fontSize:13}}>
        <div style={{background:pc,borderRadius:20,padding:"4px 12px",fontSize:13,fontWeight:900,color:"#fff"}}>{cartCount}</div>
        <span style={{fontWeight:700}}>Ver pedido</span>
        <span style={{fontWeight:900,color:pc,fontSize:15}}>{fmtCOP(cartFinal)}</span>
      </button>
    </div>}
    {cartOpen&&<div onClick={()=>setCartOpen(false)} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,.75)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:isDark?"#1a1510":"#fff",borderRadius:"24px 24px 0 0",padding:20,width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"87vh",overflowY:"auto",animation:"slideUp .3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontSize:20,fontWeight:800,color:txt,margin:0}}>{vl.cart_title}</h2>
          <button onClick={()=>setCartOpen(false)} style={{width:30,height:30,borderRadius:"50%",background:isDark?"rgba(255,255,255,.08)":"#f5f5f5",border:"none",color:mid,fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
        </div>
        {cart.map(c=>(
          <div key={c.uid} style={{display:"flex",gap:12,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${bdr}`}}>
            <div style={{width:50,height:50,borderRadius:12,overflow:"hidden",flexShrink:0,background:isDark?"rgba(255,255,255,.04)":"#f0f0f0"}}>{c.product.img?<img src={c.product.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:22}}>{c.product.emoji}</span>}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:txt}}>{c.qty}× {c.product.name}</div><div style={{fontSize:13,fontWeight:800,color:pc,marginTop:3}}>{fmtCOP(c.total)}</div></div>
            <button onClick={()=>rem(c.uid)} style={{background:"none",border:"none",color:"rgba(220,38,38,.5)",cursor:"pointer",fontSize:16,alignSelf:"flex-start",padding:"2px 6px"}}>×</button>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:17,marginBottom:16}}>
          <span style={{color:txt}}>Total</span><span style={{color:pc}}>{fmtCOP(cartFinal)}</span>
        </div>
        <button onClick={()=>{setCartOpen(false);setCheckout(true);setStep(orderMode?2:1);}} style={{width:"100%",padding:"15px",background:`linear-gradient(135deg,${pc},${pc}cc)`,border:"none",borderRadius:16,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 6px 24px ${pc}55`}}>Ir al checkout →</button>
      </div>
    </div>}
    {checkout&&<div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:isDark?"#1a1510":"#fff",borderRadius:"24px 24px 0 0",padding:"20px 20px 36px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"93vh",overflowY:"auto",animation:"slideUp .3s ease"}}>
        {step===1&&<>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{color:txt,fontSize:18,fontWeight:900,marginBottom:4}}>{vl.how_order}</div>
            <div style={{color:mid,fontSize:12}}>Elige el tipo de entrega</div>
          </div>
          {[
            hasDomicilios&&["domicilio",vl.delivery_icon,vl.delivery_title,vl.delivery_desc],
            hasPickup&&["pickup","🏪",vl.pickup_title,vl.pickup_desc],
            vl.table_mode&&["mesa","🪑",vl.table_title||"En mesa",vl.table_desc||"Pedido directo a tu mesa"]
          ].filter(Boolean).map(([k,icon,label,desc])=>(
            <button key={k} onClick={()=>{setOrderMode(k);setStep(2);}} style={{width:"100%",padding:"16px",background:isDark?"rgba(255,255,255,.05)":"#f8f8f8",border:`2px solid ${bdr}`,borderRadius:16,marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:14,fontFamily:"'Plus Jakarta Sans',sans-serif",textAlign:"left"}}>
              <span style={{fontSize:30}}>{icon}</span>
              <div><div style={{color:txt,fontWeight:800,fontSize:15}}>{label}</div><div style={{color:mid,fontSize:12}}>{desc}</div></div>
              <span style={{marginLeft:"auto",color:mid,fontSize:18}}>›</span>
            </button>
          ))}
          <button onClick={()=>setCheckout(false)} style={{width:"100%",padding:12,background:"none",border:`1px solid ${bdr}`,borderRadius:14,color:mid,fontSize:13,cursor:"pointer",marginTop:4}}>Cancelar</button>
        </>}
        {step===2&&<>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:mid,cursor:"pointer",fontSize:20,padding:0,lineHeight:1}}>←</button>
            <div style={{color:txt,fontSize:17,fontWeight:900}}>{vl.checkout_title}</div>
          </div>
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>NOMBRE COMPLETO *</label>
          <input value={form.name} onChange={e=>ff({name:e.target.value})} placeholder="Tu nombre" style={inp}/>
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>TELÉFONO / CELULAR *</label>
          <input value={form.phone} onChange={e=>ff({phone:e.target.value})} placeholder="+57 300 000 0000" type="tel" style={inp}/>
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>CORREO ELECTRÓNICO</label>
          <input value={form.email} onChange={e=>ff({email:e.target.value})} placeholder="tu@correo.com" type="email" style={inp}/>
          {effectiveMode==="domicilio"&&<>
            <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>DIRECCIÓN DE ENTREGA *</label>
            <input value={form.address} onChange={e=>{
              const v=e.target.value;ff({address:v});
              clearTimeout(zoneTimer.current);
              setZoneStatus(v.trim()?"checking":null);setSelectedZone(null);
              zoneTimer.current=setTimeout(()=>detectZone(v),900);
            }} placeholder="Calle, carrera, barrio, ciudad…" style={inp}/>
            <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>REFERENCIA (opcional)</label>
            <input value={form.addressRef||""} onChange={e=>ff({addressRef:e.target.value})} placeholder="Apto, torre, punto de referencia…" style={{...inp,marginBottom:14}}/>
            {/* Estado de cobertura */}
            {zoneStatus==="checking"&&<div style={{display:"flex",alignItems:"center",gap:10,background:isDark?"rgba(255,255,255,.06)":"#f4f4f8",borderRadius:12,padding:"11px 14px",marginBottom:12}}>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2.5px solid ${bdr}`,borderTopColor:pc,animation:"spin .7s linear infinite",flexShrink:0}}/>
              <span style={{color:mid,fontSize:13,fontWeight:600}}>Verificando cobertura en tu dirección…</span>
            </div>}
            {zoneStatus==="found"&&selectedZone&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:isDark?"rgba(34,197,94,.12)":"#f0fdf4",border:"1.5px solid #22c55e44",borderRadius:12,padding:"11px 14px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:18}}>✅</span>
                <div>
                  <div style={{color:"#16a34a",fontWeight:800,fontSize:13}}>¡Hacemos {vl.delivery_title.toLowerCase()} a tu zona!</div>
                  <div style={{color:mid,fontSize:11,marginTop:1}}>📍 {selectedZone.name} · {selectedZone.minTime}–{selectedZone.maxTime} min</div>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{color:"#16a34a",fontWeight:900,fontSize:15}}>{fmtCOP(selectedZone.price)}</div>
                <div style={{color:mid,fontSize:10}}>domicilio</div>
              </div>
            </div>}
            {zoneStatus==="none"&&<div style={{display:"flex",alignItems:"center",gap:10,background:isDark?"rgba(239,68,68,.1)":"#fef2f2",border:"1.5px solid #ef444444",borderRadius:12,padding:"11px 14px",marginBottom:12}}>
              <span style={{fontSize:18}}>😔</span>
              <div>
                <div style={{color:"#dc2626",fontWeight:800,fontSize:13}}>Sin cobertura en esta dirección</div>
                <div style={{color:mid,fontSize:11,marginTop:1}}>Por ahora no llegamos a tu zona. Intenta con otra dirección o elige {vl.pickup_title.toLowerCase()}.</div>
              </div>
            </div>}
          </>}
          {effectiveMode==="mesa"&&<><label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>NÚMERO DE MESA</label><input value={form.table} onChange={e=>ff({table:e.target.value})} placeholder="Mesa 1, 2…" style={inp}/></>}
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>NOTAS (opcional)</label>
          <input value={form.notes} onChange={e=>ff({notes:e.target.value})} placeholder={vl.notes_placeholder} style={inp}/>
          {(()=>{
            const hasPolygons=(selBranch?.deliveryZones||[]).some(z=>z.active&&z.latLngs?.length>=3);
            const zoneBlocked=effectiveMode==="domicilio"&&hasPolygons&&zoneStatus!=="found";
            const disabled=!form.name||!form.phone||(effectiveMode==="domicilio"&&!form.address)||zoneBlocked;
            return <button onClick={()=>{if(disabled)return;setStep(3);}} style={{width:"100%",padding:14,background:disabled?"#ccc":pc,border:"none",borderRadius:14,color:"#fff",fontSize:14,fontWeight:800,cursor:disabled?"not-allowed":"pointer",marginTop:4,fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:disabled?.7:1,transition:"all .15s"}}>
              {zoneStatus==="checking"?"Verificando dirección…":zoneStatus==="none"?"Sin cobertura en tu zona":"Continuar →"}
            </button>;
          })()}
        </>}
        {step===3&&<>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:mid,cursor:"pointer",fontSize:20,padding:0,lineHeight:1}}>←</button>
            <div style={{color:txt,fontSize:17,fontWeight:900}}>{vl.summary_title}</div>
          </div>
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:8}}>MÉTODO DE PAGO</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[["cash","💵","Efectivo"],["nequi","📱","Nequi"],["daviplata","📲","Daviplata"],["card","💳","Tarjeta"]].map(([k,icon,label])=>(
              <button key={k} onClick={()=>ff({payment:k})} style={{padding:"12px",background:form.payment===k?pc+"18":isDark?"rgba(255,255,255,.04)":"#f8f8f8",border:`1.5px solid ${form.payment===k?pc:bdr}`,borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                <span style={{fontSize:20}}>{icon}</span><span style={{color:txt,fontWeight:700,fontSize:12}}>{label}</span>
              </button>
            ))}
          </div>
          <div style={{background:isDark?"rgba(255,255,255,.04)":"#f8f8f8",borderRadius:14,padding:"14px 16px",marginBottom:16}}>
            <div style={{color:txt,fontWeight:800,fontSize:13,marginBottom:10}}>Resumen</div>
            {cart.map(c=><div key={c.uid} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}><span style={{color:mid}}>{c.qty}× {c.product.name}</span><span style={{color:txt,fontWeight:600}}>{fmtCOP(c.total)}</span></div>)}
            <div style={{borderTop:`1px solid ${bdr}`,marginTop:8,paddingTop:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:mid,marginBottom:4}}><span>Subtotal</span><span style={{color:txt}}>{fmtCOP(cartSubtotal)}</span></div>
              {effectiveMode==="domicilio"&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:mid,marginBottom:4}}><span>{vl.delivery_fee_label}{selectedZone?` · ${selectedZone.name}`:""}</span><span style={{color:txt}}>{fmtCOP(deliveryFee)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:900,color:txt,marginTop:8}}><span>Total</span><span style={{color:pc}}>{fmtCOP(cartFinal)}</span></div>
            </div>
          </div>
          <button onClick={submitOrder} disabled={submitting} style={{width:"100%",padding:15,background:`linear-gradient(135deg,${pc},${pc}cc)`,border:"none",borderRadius:16,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 6px 24px ${pc}55`,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {submitting?<div style={{width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite"}}/>:"🚀"}{submitting?"Enviando pedido…":vl.confirm_btn}
          </button>
        </>}
      </div>
    </div>}
    {selProd&&<ProductDetailModal p={selProd} onClose={()=>setSelProd(null)} onAdd={add} orderMode={orderMode} pc={pc} isDark={isDark} config={config} bdr={bdr} txt={txt} mid={mid} surf={surf}/>}
  </div>;
}

/* ─── CEO SIDEBAR ─────────────────────────────────────────── */

export function SuspendedScreen({onLogout,onGoToBilling,configName}){
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0a0f1e 0%,#1a0a0a 100%)",padding:24}}>
    <style>{STYLES}</style>
    <div style={{textAlign:"center",maxWidth:480,animation:"fadeUp .4s ease"}}>
      <div style={{width:90,height:90,borderRadius:26,background:"#dc262620",border:"2px solid #dc262640",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,margin:"0 auto 24px"}}>🔒</div>
      <h1 style={{fontSize:26,fontWeight:900,color:"#fff",marginBottom:10}}>Servicio Suspendido</h1>
      <p style={{color:"rgba(255,255,255,.55)",fontSize:14,lineHeight:1.7,marginBottom:28}}>
        La suscripción de <strong style={{color:"#fff"}}>{configName||"tu restaurante"}</strong> ha vencido.<br/>
        Para reactivar el catálogo y todos los servicios, realiza el pago de tu plan y súbelo desde la sección <strong style={{color:"#c084fc"}}>Facturación</strong>.
      </p>
      <div style={{background:"rgba(220,38,38,.12)",border:"1px solid rgba(220,38,38,.25)",borderRadius:14,padding:"16px 20px",marginBottom:28,textAlign:"left"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#f87171",marginBottom:10}}>⚠️ Servicios desactivados</div>
        {[["🌐","Menú digital QR"],["📦","Gestión de productos"],["🚴","Delivery"],["📊","Estadísticas"],["🤖","Asistente IA"]].map(([ic,lb])=>(
          <div key={lb} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,fontSize:12,color:"rgba(255,255,255,.4)"}}>{ic} {lb} <span style={{marginLeft:"auto",color:"#dc2626",fontSize:10,fontWeight:700}}>INACTIVO</span></div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <Btn v="primary" onClick={onGoToBilling||onLogout}>Ir a Facturación →</Btn>
        <button onClick={onLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.5)",borderRadius:10,padding:"10px 20px",fontSize:13,cursor:"pointer"}}>Cerrar sesión</button>
      </div>
      <p style={{marginTop:20,fontSize:11,color:"rgba(255,255,255,.3)"}}>¿Pagaste y aún ves esta pantalla? Escríbenos a <span style={{color:T.coral}}>soporte@picku.co</span></p>
    </div>
  </div>;
}

/* ─── MENÚ PÚBLICO (sin login) ───────────────────────────── */

export function PublicMenu({onBack, userId, branchId, initialMode=null}){
  const [config,setConfig]=useState(INIT_CONFIG);
  const [products,setProducts]=useState([]);
  const [cats,setCats]=useState([]);
  const [branches,setBranches]=useState([]);
  const [loading,setLoading]=useState(true);
  const [ownerId,setOwnerId]=useState(null);
  const [suspended,setSuspended]=useState(false);
  const [notFound,setNotFound]=useState(false);
  const [businessType,setBusinessType]=useState("restaurant");

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      setSuspended(false);
      setNotFound(false);

      // ── Buscar configuración del negocio ──────────────────────
      // Si llega userId (desde QR /menu/:userId o ?r=) buscar ese negocio.
      // Sin userId: cargar el primero (modo demo/dev).
      let cfgQuery = supabase.from("restaurant_config").select("*");
      if(userId){
        cfgQuery = cfgQuery.eq("user_id", userId).single();
      } else {
        cfgQuery = cfgQuery.limit(1).single();
      }

      const {data:cfg, error:cfgErr} = await cfgQuery;

      if(cfgErr || !cfg){
        setNotFound(true);
        setLoading(false);
        return;
      }

      setOwnerId(cfg.user_id);

      // ── Verificar suscripción ─────────────────────────────────
      const {data:prof}=await supabase
        .from("profiles")
        .select("subscription_expires_at,business_type")
        .eq("id",cfg.user_id)
        .single();

      if(prof?.subscription_expires_at && new Date(prof.subscription_expires_at)<new Date()){
        setSuspended(true);
        setLoading(false);
        return;
      }

      if(prof?.business_type) setBusinessType(prof.business_type);

      setConfig({
        name:cfg.name, tagline:cfg.tagline, logo:cfg.logo,
        primaryColor:cfg.primary_color, menuStyle:cfg.menu_style,
        menuFont:cfg.menu_font, city:cfg.city, address:cfg.address,
        phone:cfg.phone, whatsapp:cfg.whatsapp, schedule:cfg.schedule,
        coverImg:cfg.cover_img||"", bgImg:cfg.bg_img||"", openStatus:cfg.open_status,
        deliveryFee:cfg.delivery_fee, showAllergens:cfg.show_allergens,
        banners:cfg.banners||[], promoPopup:cfg.promo_popup||null,
        socialLinks:cfg.social_links||{},
      });
      setBranches(cfg.branches||[]);

      // ── Cargar categorías y productos ─────────────────────────
      const [cr,pr]=await Promise.all([
        supabase.from("categories").select("*").eq("user_id",cfg.user_id).order("sort_order"),
        supabase.from("products").select("*").eq("user_id",cfg.user_id),
      ]);
      if(cr.data?.length) setCats(cr.data.map(c=>({
        id:c.id, name:c.name, icon:c.icon||"🍽️", iconType:c.icon_type||"emoji",
        iconImg:c.icon_img||"", active:c.active!==false, order:c.sort_order||0,
        bgImg:c.bg_img||"", bgColor:c.bg_color||"", textColor:c.text_color||"#ffffff",
        fontStyle:c.font_style||"modern", branchIds:c.branch_ids||["all"],
      })));
      if(pr.data?.length) setProducts(pr.data.map(p=>({
        id:p.id, catId:p.cat_id, name:p.name, price:p.price,
        deliveryPrice:p.delivery_price||null, forMenu:p.for_menu!==false,
        forDelivery:p.for_delivery!==false, desc:p.description, emoji:p.emoji,
        img:p.img, active:p.active, featured:p.featured, stock:p.in_stock,
        label:p.label, labelColor:p.label_color, allergens:p.allergens||[],
        clicks:p.clicks||0, branchIds:p.branch_ids||["all"],
      })));

      // ── Registrar visita al catálogo (una vez por tab/sesión por día) ──
      const _sk = `pv_${cfg.user_id}_${new Date().toISOString().slice(0,10)}`;
      if (!sessionStorage.getItem(_sk)) {
        // Seteamos la key DESPUÉS de insertar para que si falla, el próximo intento lo reintente
        supabase.from("menu_views")
          .insert({ owner_id: cfg.user_id })
          .then(({ error }) => { if (!error) sessionStorage.setItem(_sk, "1"); });
      }

      setLoading(false);
    })();
  },[userId]);

  const addOrder=async o=>{
    if(!ownerId) return;
    await supabase.from("orders").insert({
      id:o.id, user_id:ownerId, branch_id:o.branchId||null,
      status:o.status, mode:o.mode,
      created_at:o.createdAt, time:o.time, date:o.date,
      customer_name:o.customerName, customer_phone:o.customerPhone,
      customer_email:o.customerEmail, address:o.address,
      address_ref:o.addressRef, table_num:o.table, notes:o.notes,
      payment:o.payment, items:o.items, subtotal:o.subtotal,
      delivery:o.delivery, total:o.total,
    });
    // Notificar al admin en tiempo real — canal Broadcast (no requiere config de Realtime)
    const bc = supabase.channel(`biz:${ownerId}`);
    bc.subscribe(status => {
      if(status !== "SUBSCRIBED") return;
      bc.send({ type:"broadcast", event:"new_order",
        payload:{ orderId:o.id, customerName:o.customerName||"cliente" }
      }).finally(()=>{ setTimeout(()=>supabase.removeChannel(bc), 1500); });
    });
  };

  const spinnerScreen = (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#111009"}}>
      <style>{STYLES}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(255,255,255,.1)",borderTopColor:"#c084fc",animation:"spin .7s linear infinite",margin:"0 auto 14px"}}/>
        <div style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Cargando catálogo…</div>
      </div>
    </div>
  );

  if(loading) return spinnerScreen;

  if(notFound) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#111009",padding:24}}>
      <style>{STYLES}</style>
      <div style={{textAlign:"center",maxWidth:420,animation:"fadeUp .4s ease"}}>
        <div style={{fontSize:64,marginBottom:20}}>🔍</div>
        <h2 style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:12}}>Catálogo no encontrado</h2>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:14,lineHeight:1.7}}>El enlace del QR no corresponde a ningún negocio activo. Verifica que el código sea correcto.</p>
      </div>
    </div>
  );

  if(suspended) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#111009",padding:24}}>
      <style>{STYLES}</style>
      <div style={{textAlign:"center",maxWidth:420,animation:"fadeUp .4s ease"}}>
        <div style={{fontSize:64,marginBottom:20}}>🔒</div>
        <h2 style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:12}}>Catálogo no disponible</h2>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:14,lineHeight:1.7}}>Este negocio ha suspendido temporalmente su servicio digital. Contáctanos directamente para hacer tu pedido.</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>
      <CustomerView
        config={config}
        products={products}
        cats={cats}
        onBack={onBack}
        onAddOrder={addOrder}
        branches={branches}
        banners={config.banners||[]}
        businessType={businessType}
        initialBranchId={branchId||null}
        initialMode={initialMode}
        storeKey={userId||null}
      />
    </>
  );
}

/* ─── APP ROOT ────────────────────────────────────────────── */
