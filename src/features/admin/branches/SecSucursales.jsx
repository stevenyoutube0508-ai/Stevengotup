import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import QRCodeLib from "qrcode";
import { supabase } from "../../../lib/supabase";
import { T, CM, STYLES } from "../../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../../constants/seed";
import { VERTICALS, getVertical } from "../../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../../utils/format";
import { pointInPoly } from "../../../utils/geo";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../../shared/components";

import { useLeaflet } from "../../../shared/hooks/useLeaflet";

export function PolygonMap({zones,onUpdate,onAdd,onDelete,branchAddress,branchCity}){
  const leafletReady=useLeaflet();
  const mapDivRef=useRef(null);
  const mapRef=useRef(null);
  const polyLayersRef=useRef({});
  const drawPointsRef=useRef([]);
  const drawLayersRef=useRef([]); // temp markers + polyline while drawing
  const [isDrawing,setIsDrawing]=useState(false);
  const [ptCount,setPtCount]=useState(0);
  const [newForm,setNewForm]=useState(null);
  const [pendingLatLngs,setPendingLatLngs]=useState([]);
  const [editZone,setEditZone]=useState(null);
  const [drawColor,setDrawColor]=useState("#6d28d9");
  const COLORS=["#6d28d9","#059669","#dc2626","#2563eb","#d97706","#db2777","#0891b2","#f97316"];

  // Render / update a single zone polygon on the map
  const renderZone=useCallback((map,z)=>{
    if(!z.latLngs?.length)return;
    if(polyLayersRef.current[z.id]){map.removeLayer(polyLayersRef.current[z.id]);}
    const poly=window.L.polygon(z.latLngs.map(p=>[p.lat,p.lng]),{
      color:z.color,fillColor:z.color,fillOpacity:z.active?.3:.07,weight:2.5,opacity:z.active?1:.4,
    }).addTo(map);
    poly.bindPopup(`<b>${z.name}</b><br><span style="color:${z.color};font-weight:700">${fmtCOP(z.price)}</span> · ${z.minTime}–${z.maxTime} min`);
    polyLayersRef.current[z.id]=poly;
  },[]);

  // Init map once Leaflet is ready
  useEffect(()=>{
    if(!leafletReady||!mapDivRef.current||mapRef.current)return;
    const L=window.L;
    const initMap=([lat,lng])=>{
      const map=L.map(mapDivRef.current,{center:[lat,lng],zoom:14,zoomControl:true});
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
        attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a>',maxZoom:19,
      }).addTo(map);
      mapRef.current=map;
      // Marker for restaurant
      const icon=L.divIcon({html:'<div style="background:#db2777;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">🏪</div>',className:"",iconSize:[32,32],iconAnchor:[16,16]});
      L.marker([lat,lng],{icon}).addTo(map).bindPopup("<b>Tu restaurante</b>");
      // Render existing zones
      zones.forEach(z=>renderZone(map,z));
      // Click handler for polygon drawing
      map.on("click",e=>{
        if(!drawPointsRef.current._active)return;
        const latlng={lat:e.latlng.lat,lng:e.latlng.lng};
        drawPointsRef.current.push(latlng);
        setPtCount(drawPointsRef.current.length);
        // Dot marker
        const dot=L.circleMarker([latlng.lat,latlng.lng],{radius:5,color:"#fff",fillColor:drawPointsRef.current._color||"#6d28d9",fillOpacity:1,weight:2}).addTo(map);
        drawLayersRef.current.push(dot);
        // Redraw preview polyline
        drawLayersRef.current.filter(l=>l._isPreview).forEach(l=>map.removeLayer(l));
        if(drawPointsRef.current.length>=2){
          const line=L.polyline(drawPointsRef.current.map(p=>[p.lat,p.lng]),{color:drawPointsRef.current._color||"#6d28d9",dashArray:"6,4",weight:2});
          line._isPreview=true;
          line.addTo(map);
          drawLayersRef.current.push(line);
        }
      });
    };
    // Geocode with Nominatim (free OSM)
    const q=encodeURIComponent([branchAddress,branchCity].filter(Boolean).join(", ")||"Colombia");
    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,{headers:{"Accept-Language":"es"}})
      .then(r=>r.json())
      .then(data=>{
        if(data?.length) initMap([parseFloat(data[0].lat),parseFloat(data[0].lon)]);
        else initMap([4.711,-74.0721]);
      })
      .catch(()=>initMap([4.711,-74.0721]));
  },[leafletReady]);

  // Sync zones when they change
  useEffect(()=>{
    if(!mapRef.current)return;
    // Remove deleted
    Object.keys(polyLayersRef.current).forEach(id=>{
      if(!zones.find(z=>z.id===id)){mapRef.current.removeLayer(polyLayersRef.current[id]);delete polyLayersRef.current[id];}
    });
    zones.forEach(z=>renderZone(mapRef.current,z));
  },[zones,renderZone]);

  const startDraw=()=>{
    drawPointsRef.current=[];drawPointsRef.current._active=true;drawPointsRef.current._color=drawColor;
    setPtCount(0);setIsDrawing(true);
    if(mapRef.current)mapRef.current.getContainer().style.cursor="crosshair";
  };
  const cancelDraw=()=>{
    drawPointsRef.current=[];drawPointsRef.current._active=false;
    drawLayersRef.current.forEach(l=>mapRef.current?.removeLayer(l));
    drawLayersRef.current=[];
    setPtCount(0);setIsDrawing(false);setNewForm(null);setPendingLatLngs([]);
    if(mapRef.current)mapRef.current.getContainer().style.cursor="";
  };
  const closePoly=()=>{
    const pts=drawPointsRef.current;
    if(pts.length<3){alert("Necesitas al menos 3 puntos en el mapa.");return;}
    drawPointsRef.current._active=false;
    drawLayersRef.current.forEach(l=>mapRef.current?.removeLayer(l));
    drawLayersRef.current=[];
    if(mapRef.current)mapRef.current.getContainer().style.cursor="";
    setPendingLatLngs([...pts]);
    setNewForm({name:"",price:"5000",minTime:"20",maxTime:"40"});
    setIsDrawing(false);
  };
  const saveZone=()=>{
    if(!newForm?.name?.trim()||!pendingLatLngs.length)return;
    onAdd({id:newId(),name:newForm.name,color:drawColor,price:parseInt(newForm.price)||5000,minTime:parseInt(newForm.minTime)||20,maxTime:parseInt(newForm.maxTime)||40,active:true,latLngs:[...pendingLatLngs],points:[]});
    setPendingLatLngs([]);setNewForm(null);drawPointsRef.current=[];setPtCount(0);
  };

  return <div>
    {/* Toolbar */}
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
      {!isDrawing&&!newForm&&<button onClick={startDraw} style={{display:"flex",alignItems:"center",gap:6,background:T.coral,color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 10px ${T.coral}44`}}>✏️ Dibujar zona</button>}
      {isDrawing&&<div style={{display:"flex",alignItems:"center",gap:8,background:T.coralL,border:`1.5px solid ${T.coral}44`,borderRadius:10,padding:"8px 14px",flex:1,flexWrap:"wrap"}}>
        <span style={{fontSize:13,fontWeight:700,color:T.coral}}>🖊 Haz clic en el mapa para añadir vértices · {ptCount} punto{ptCount!==1?"s":""}</span>
        <div style={{display:"flex",gap:5}}>{COLORS.map(c=><div key={c} onClick={()=>{setDrawColor(c);drawPointsRef.current._color=c;}} style={{width:20,height:20,borderRadius:"50%",background:c,cursor:"pointer",border:drawColor===c?`3px solid ${T.text}`:"3px solid transparent"}}/>)}</div>
        <button onClick={closePoly} disabled={ptCount<3} style={{background:T.coral,color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:ptCount<3?"not-allowed":"pointer",opacity:ptCount<3?.5:1}}>✓ Cerrar zona</button>
        <button onClick={cancelDraw} style={{background:T.redL,color:T.red,border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>✕ Cancelar</button>
      </div>}
      <div style={{marginLeft:"auto",fontSize:12,color:T.mid}}>{zones.filter(z=>z.active).length} zona{zones.filter(z=>z.active).length!==1?"s":""} activa{zones.filter(z=>z.active).length!==1?"s":""}</div>
    </div>
    {/* Mapa */}
    {!leafletReady&&<div style={{height:420,borderRadius:14,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}><div style={{width:36,height:36,borderRadius:"50%",border:`3px solid ${T.border}`,borderTopColor:T.coral,animation:"spin .7s linear infinite"}}/><div style={{color:T.mid,fontSize:13}}>Cargando mapa…</div></div>}
    <div ref={mapDivRef} style={{height:420,borderRadius:14,overflow:"hidden",display:leafletReady?"block":"none",marginBottom:16,boxShadow:T.shMd}}/>
    {/* Modal nueva zona */}
    {newForm&&<div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:400,boxShadow:T.shMd}}>
        <div style={{fontWeight:900,fontSize:17,color:T.text,marginBottom:16}}>📍 Nueva zona de domicilio</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Color de la zona</label>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} onClick={()=>setDrawColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:drawColor===c?`3px solid ${T.text}`:"3px solid transparent"}}/>)}</div>
        </div>
        <Field label="Nombre de la zona" value={newForm.name} onChange={v=>setNewForm(p=>({...p,name:v}))} placeholder="Ej: Centro, Zona Norte…" required/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <Field label="💰 Precio" value={newForm.price} onChange={v=>setNewForm(p=>({...p,price:v}))} type="number" prefix="$" suffix="COP"/>
          <Field label="⏱ Min" value={newForm.minTime} onChange={v=>setNewForm(p=>({...p,minTime:v}))} type="number"/>
          <Field label="⏱ Max" value={newForm.maxTime} onChange={v=>setNewForm(p=>({...p,maxTime:v}))} type="number"/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <Btn full v="neutral" onClick={cancelDraw}>Cancelar</Btn>
          <Btn full disabled={!newForm.name?.trim()} onClick={saveZone}>✓ Guardar zona</Btn>
        </div>
      </div>
    </div>}
    {/* Modal editar zona */}
    {editZone&&<div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:400,boxShadow:T.shMd}}>
        <div style={{fontWeight:900,fontSize:17,color:T.text,marginBottom:16}}>✏️ Editar zona</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Color</label>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} onClick={()=>setEditZone(p=>({...p,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:editZone.color===c?`3px solid ${T.text}`:"3px solid transparent"}}/>)}</div>
        </div>
        <Field label="Nombre" value={editZone.name} onChange={v=>setEditZone(p=>({...p,name:v}))} required/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <Field label="💰 Precio" value={String(editZone.price)} onChange={v=>setEditZone(p=>({...p,price:parseInt(v)||0}))} type="number" prefix="$"/>
          <Field label="⏱ Min" value={String(editZone.minTime)} onChange={v=>setEditZone(p=>({...p,minTime:parseInt(v)||0}))} type="number"/>
          <Field label="⏱ Max" value={String(editZone.maxTime)} onChange={v=>setEditZone(p=>({...p,maxTime:parseInt(v)||0}))} type="number"/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <Btn full v="neutral" onClick={()=>setEditZone(null)}>Cancelar</Btn>
          <Btn full disabled={!editZone.name?.trim()} onClick={()=>{onUpdate(editZone.id,editZone);setEditZone(null);}}>✓ Guardar</Btn>
        </div>
      </div>
    </div>}
    {/* Tabla de zonas */}
    {zones.length>0&&<div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 48px 130px 90px 72px 80px",padding:"9px 16px",background:T.bg,borderBottom:`1px solid ${T.border}`}}>
        {["Zona","Color","Domicilio","Hora","Activo","Acciones"].map(h=><div key={h} style={{fontSize:11,fontWeight:800,color:T.light,textTransform:"uppercase",letterSpacing:".4px"}}>{h}</div>)}
      </div>
      {zones.map(z=>(
        <div key={z.id} style={{display:"grid",gridTemplateColumns:"1fr 48px 130px 90px 72px 80px",padding:"12px 16px",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}>
          <div style={{fontWeight:600,fontSize:13,color:T.text}}>{z.name}</div>
          <div style={{width:24,height:24,borderRadius:6,background:z.color}}/>
          <div style={{fontWeight:700,fontSize:13,color:T.text}}>{fmtCOP(z.price)}</div>
          <div style={{fontSize:13,color:T.mid}}>{z.minTime}–{z.maxTime} min</div>
          <Toggle value={z.active} onChange={v=>onUpdate(z.id,{active:v})} sm/>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setEditZone({...z})} style={{width:28,height:28,borderRadius:7,background:T.coralL,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✏️</button>
            <button onClick={()=>window.confirm(`¿Eliminar "${z.name}"?`)&&onDelete(z.id)} style={{width:28,height:28,borderRadius:7,background:T.redL,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🗑️</button>
          </div>
        </div>
      ))}
      <div style={{padding:"8px 16px",fontSize:11,color:T.light}}>En total hay {zones.length} polígono{zones.length!==1?"s":""} de domicilio</div>
    </div>}
    {zones.length===0&&!isDrawing&&<div style={{textAlign:"center",padding:"30px 20px",color:T.mid,fontSize:13,border:`2px dashed ${T.border}`,borderRadius:14}}>Sin zonas. Haz clic en <b>✏️ Dibujar zona</b> y traza el área de cobertura en el mapa.</div>}
  </div>;
}

// ── QR CARD (top-level — NO puede estar dentro de otro componente) ────────────

export function QRCard({card,branchName}){
  const canvasRef=useRef(null);
  const [copied,setCopied]=useState(false);

  useEffect(()=>{
    if(!canvasRef.current)return;
    QRCodeLib.toCanvas(canvasRef.current,card.url,{
      width:220,margin:2,
      color:{dark:card.color,light:"#ffffff"}
    },err=>{if(err)console.error(err);});
  },[card.url,card.color]);

  const download=()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const a=document.createElement("a");
    a.href=canvas.toDataURL("image/png");
    a.download=`QR-${branchName||"sucursal"}-${card.key}.png`;
    a.click();
  };

  const copyLink=()=>{
    navigator.clipboard.writeText(card.url).then(()=>{
      setCopied(true);setTimeout(()=>setCopied(false),2000);
    });
  };

  const printQR=()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const img=canvas.toDataURL("image/png");
    const w=window.open("","_blank","width=500,height=600");
    w.document.write(`<!DOCTYPE html><html><head><title>QR ${card.label} — ${branchName||""}</title>
    <style>body{font-family:sans-serif;text-align:center;padding:40px;background:#fff}
    img{width:260px;height:260px;display:block;margin:0 auto 16px;border-radius:12px}
    h2{margin:0 0 6px;font-size:22px;color:${card.color}}
    p{margin:0 0 4px;font-size:13px;color:#666}
    small{font-size:11px;color:#aaa;word-break:break-all}
    @media print{button{display:none}}</style></head>
    <body>
    <h2>${card.emoji} ${card.label}</h2>
    <p style="font-size:15px;font-weight:700;color:#111">${branchName||""}</p>
    <img src="${img}" alt="QR"/>
    <p>${card.desc}</p>
    <small>${card.url}</small><br/><br/>
    <button onclick="window.print()" style="padding:10px 24px;background:${card.color};color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer">🖨️ Imprimir / Guardar PDF</button>
    </body></html>`);
    w.document.close();
  };

  return <div style={{background:"#fff",borderRadius:18,boxShadow:"0 2px 16px rgba(0,0,0,.08)",padding:20,display:"flex",flexDirection:"column",alignItems:"center",gap:10,border:`2px solid ${card.light}`}}>
    <div style={{width:36,height:36,borderRadius:10,background:card.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{card.emoji}</div>
    <div style={{fontWeight:800,fontSize:15,color:card.color}}>{card.label}</div>
    <div style={{fontSize:11,color:T.mid,textAlign:"center",lineHeight:1.4}}>{card.desc}</div>
    <canvas ref={canvasRef} data-qr={card.key} style={{borderRadius:12,border:`3px solid ${card.light}`}}/>
    <div style={{fontSize:10,color:T.mid,wordBreak:"break-all",textAlign:"center",maxWidth:220,lineHeight:1.3}}>{card.url}</div>
    <div style={{display:"flex",gap:6,width:"100%",flexWrap:"wrap"}}>
      <button onClick={download} style={{flex:1,minWidth:90,padding:"8px 0",background:card.color,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer"}}>⬇️ Descargar PNG</button>
      <button onClick={printQR} style={{flex:1,minWidth:90,padding:"8px 0",background:card.light,color:card.color,border:`1.5px solid ${card.color}`,borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer"}}>🖨️ PDF / Imprimir</button>
    </div>
    <button onClick={copyLink} style={{width:"100%",padding:"7px 0",background:copied?"#d1fae5":"#f3f4f6",color:copied?"#059669":T.mid,border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .2s"}}>
      {copied?"✅ ¡Link copiado!":"🔗 Copiar link"}
    </button>
  </div>;
}

// ── BRANCH QR COMPONENT ───────────────────────────────────────────────────────

export function BranchQR({br,ownerId}){
  const origin=window.location.origin;
  const base=`${origin}${window.location.pathname}?menu&r=${ownerId}&b=${br?.id}`;

  const CARDS=[
    {key:"mesa",     label:"Mesa / Restaurante",   emoji:"📋", color:"#4f46e5", light:"#ede9fe", url:`${base}&mode=menu`,      desc:"El cliente escanea y ve la carta para comer en el restaurante"},
    {key:"domicilio",label:"Domicilio",             emoji:"🛵", color:"#059669", light:"#d1fae5", url:`${base}&mode=domicilio`, desc:"El cliente escanea y hace su pedido a domicilio"},
    {key:"publicidad",label:"Publicidad / General", emoji:"📢", color:"#d97706", light:"#fef3c7", url:base,                    desc:"QR general, el cliente elige el modo al ingresar"},
  ];

  const printAll=()=>{
    const items=CARDS.map(c=>{
      const canvas=document.querySelector(`canvas[data-qr="${c.key}"]`);
      return canvas?{...c,img:canvas.toDataURL("image/png")}:null;
    }).filter(Boolean);
    if(!items.length){alert("Los QR aún no terminaron de generarse. Espera un momento.");return;}
    const w=window.open("","_blank","width=700,height=800");
    w.document.write(`<!DOCTYPE html><html><head><title>QR Sucursal — ${br?.name||""}</title>
    <style>body{font-family:sans-serif;padding:30px;background:#fff}
    h1{text-align:center;font-size:22px;margin-bottom:4px}
    .sub{text-align:center;font-size:13px;color:#888;margin-bottom:24px}
    .grid{display:flex;flex-wrap:wrap;gap:24px;justify-content:center}
    .card{width:200px;text-align:center;padding:16px;border-radius:12px;border:2px solid #eee}
    .card img{width:180px;height:180px;border-radius:8px}
    .card h3{font-size:14px;margin:8px 0 4px}
    .card p{font-size:11px;color:#666;margin:0 0 4px}
    .card small{font-size:9px;color:#aaa;word-break:break-all}
    @media print{button{display:none!important}}</style></head>
    <body>
    <h1>🔲 Códigos QR</h1>
    <div class="sub">${br?.name||""} ${br?.city?`· ${br.city}`:""}</div>
    <div class="grid">
    ${items.map(c=>`<div class="card" style="border-color:${c.light}"><img src="${c.img}" alt="${c.label}"/><h3 style="color:${c.color}">${c.emoji} ${c.label}</h3><p>${c.desc}</p><small>${c.url}</small></div>`).join("")}
    </div><br/>
    <div style="text-align:center"><button onclick="window.print()" style="padding:12px 32px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer">🖨️ Imprimir / Guardar PDF</button></div>
    </body></html>`);
    w.document.close();
  };

  return <div style={{padding:"4px 0"}}>
    <div style={{fontWeight:800,fontSize:14,color:T.text,marginBottom:4}}>🔲 Códigos QR de esta sucursal</div>
    <div style={{fontSize:12,color:T.mid,marginBottom:16}}>Escanea con cualquier celular para abrir el menú directamente. Descarga o imprime cada QR.</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
      {CARDS.map(c=><QRCard key={c.key} card={c} branchName={br?.name}/>)}
    </div>
    <div style={{marginTop:16}}>
      <button onClick={printAll} style={{width:"100%",padding:"12px 0",background:"#4f46e5",color:"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:14,cursor:"pointer"}}>🖨️ Imprimir / PDF con los 3 QR juntos</button>
    </div>
  </div>;
}

export function SecSucursales({branches,onUpdateBranch,onAddBranch,ownerId}){
  const [selected,setSelected]=useState(null);
  const [subTab,setSubTab]=useState("overview");
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({name:"",address:"",city:"",phone:"",manager:""});
  const [infoForm,setInfoForm]=useState(null);
  const [infoSaved,setInfoSaved]=useState(false);
  const SERVICES_DEFS=[
    {id:"menuDigital",icon:"📋",label:"Menú Digital",desc:"Menú QR para tus mesas",color:T.coral},
    {id:"domicilios",icon:"🛵",label:"Domicilios",desc:"Pedidos a domicilio con zonas",color:T.blue},
    {id:"pickup",icon:"🏪",label:"Pickup / Llevar",desc:"Pedidos para recoger",color:T.pink},
  ];
  const SUBTABS=[["overview","📋 Resumen"],["servicios","⚙️ Servicios"],["domicilios","🗺️ Zonas"],["horarios","🕐 Horarios"],["qr","🔲 QR"]];
  const DAYS_ES={mon:"Lunes",tue:"Martes",wed:"Miércoles",thu:"Jueves",fri:"Viernes",sat:"Sábado",sun:"Domingo"};
  const br=selected?branches.find(b=>b.id===selected.id)||selected:null;
  const upd=(id,patch)=>{onUpdateBranch(id,patch);setSelected(p=>p&&p.id===id?{...p,...patch}:p);};
  const selectBranch=b=>{setSelected(b);setSubTab("overview");setInfoForm({name:b.name,address:b.address||"",city:b.city||"",phone:b.phone||"",whatsapp:b.whatsapp||"",manager:b.manager||"",mapLink:b.mapLink||""});setInfoSaved(false);};
  const updZone=(zoneId,patch)=>{if(!br)return;const nz=br.deliveryZones.map(z=>z.id===zoneId?{...z,...patch}:z);upd(br.id,{deliveryZones:nz});};
  const addZone=zone=>{if(!br)return;const nz=[...br.deliveryZones,zone];upd(br.id,{deliveryZones:nz});};
  const delZone=zoneId=>{if(!br)return;const nz=br.deliveryZones.filter(z=>z.id!==zoneId);upd(br.id,{deliveryZones:nz});};
  const togSvc=k=>{if(!br)return;upd(br.id,{services:{...br.services,[k]:!br.services[k]}});};
  const SUC_CSS=`@media(min-width:769px){.suc-grid{display:grid!important;grid-template-columns:280px 1fr;gap:16px}.suc-list{display:block!important}.suc-detail{display:block!important}}@media(max-width:768px){.suc-grid{display:block!important}.suc-detail-mobile-hidden{display:none!important}.suc-list-mobile-hidden{display:none!important}}`;
  return <div style={{animation:"fadeUp .35s ease"}}>
    <style>{SUC_CSS}</style>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div>
        {selected&&<button onClick={()=>{setSelected(null);setInfoForm(null);}} className="suc-list-mobile-hidden" style={{background:"none",border:"none",color:T.coral,fontSize:13,fontWeight:700,cursor:"pointer",padding:"0 0 6px",display:"block"}}>← Todas las sucursales</button>}
        <h2 style={{fontSize:22,fontWeight:800,color:T.text}}>{selected?"":""}{selected?selected.name:"Sucursales"}</h2>
        <p style={{color:T.mid,fontSize:13,marginTop:2}}>{selected?`📍 ${selected.city}`:`${branches.length} sucursal${branches.length!==1?"es":""} · ${branches.filter(b=>b.status).length} activa${branches.filter(b=>b.status).length!==1?"s":""}`}</p>
      </div>
      {selected&&<Btn v="neutral" sm onClick={()=>{setSelected(null);setInfoForm(null);}}>← Volver</Btn>}
    </div>
    <div className="suc-grid" style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16}}>
      {/* Lista de sucursales - oculta en mobile cuando hay seleccionada */}
      <div className={selected?"suc-list-mobile-hidden":""}>
        {branches.map(b=>(
          <div key={b.id} onClick={()=>selectBranch(b)} className="hov" style={{background:T.white,borderRadius:14,border:`2px solid ${selected?.id===b.id?T.coral:T.border}`,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"all .15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontWeight:800,fontSize:13,color:T.coral,marginBottom:2}}>{b.name}</div>
                <div style={{fontSize:11,color:T.mid}}>{b.city}</div>
              </div>
              <div style={{width:8,height:8,borderRadius:"50%",background:b.status?T.green:T.red,marginTop:3}}/>
            </div>
            <div style={{fontSize:10,color:T.light,marginBottom:7}}>{b.address}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {Object.entries(b.services||{}).filter(([,v])=>v).map(([k])=>{const s=SERVICES_DEFS.find(x=>x.id===k);return s?<span key={k} title={s.label} style={{fontSize:14}}>{s.icon}</span>:null;})}
            </div>
            <div style={{fontSize:9,color:T.light,marginTop:5}}>ID: {b.id}</div>
          </div>
        ))}
      </div>
      {/* Detalle - oculto en mobile cuando no hay seleccionada */}
      {br&&<div className={!selected?"suc-detail-mobile-hidden":""}>
        <Card style={{marginBottom:14,padding:"14px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontWeight:900,fontSize:17,color:T.text,marginBottom:2}}>{br.name}</div>
              <div style={{fontSize:12,color:T.mid}}>📍 {br.address} · 👤 {br.manager}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Toggle value={br.status} onChange={v=>upd(br.id,{status:v})} label={br.status?"Activa":"Inactiva"}/>
            </div>
          </div>
          <div style={{background:T.bg,borderRadius:10,padding:"10px 14px",display:"flex",gap:8,flexWrap:"wrap"}}>
            {SERVICES_DEFS.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:br.services?.[s.id]?T.white:T.bg,border:`1px solid ${br.services?.[s.id]?s.color+"44":T.border}`}}>
                <span style={{fontSize:14}}>{s.icon}</span>
                <span style={{fontSize:11,fontWeight:700,color:br.services?.[s.id]?s.color:T.light}}>{s.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </Card>
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {SUBTABS.map(([k,l])=><button key={k} onClick={()=>setSubTab(k)} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${subTab===k?T.coral:T.border}`,background:subTab===k?T.coralL:T.white,color:subTab===k?T.coral:T.mid,fontSize:12,fontWeight:subTab===k?700:500,cursor:"pointer"}}>{l}</button>)}
        </div>
        {subTab==="overview"&&infoForm&&<Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>📋 Información de la sucursal</div>
          <Field label="Nombre de la sucursal" value={infoForm.name} onChange={v=>setInfoForm(p=>({...p,name:v}))} placeholder="Ej: La Leña — El Peñón" required/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="📍 Dirección" value={infoForm.address} onChange={v=>setInfoForm(p=>({...p,address:v}))} placeholder="Cra 5 #15-32, El Peñón"/>
            <Field label="🏙️ Ciudad" value={infoForm.city} onChange={v=>setInfoForm(p=>({...p,city:v}))} placeholder="Cali"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="📞 Teléfono" value={infoForm.phone} onChange={v=>setInfoForm(p=>({...p,phone:v}))} placeholder="+57 300 123 4567"/>
            <Field label="💬 WhatsApp" value={infoForm.whatsapp} onChange={v=>setInfoForm(p=>({...p,whatsapp:v}))} placeholder="573001234567" hint="Solo números, con código de país"/>
          </div>
          <Field label="👤 Encargado / Manager" value={infoForm.manager} onChange={v=>setInfoForm(p=>({...p,manager:v}))} placeholder="Carlos Mejía"/>
          <Field label="🗺️ Link de ubicación (Google Maps)" value={infoForm.mapLink} onChange={v=>setInfoForm(p=>({...p,mapLink:v}))} placeholder="https://maps.app.goo.gl/…" hint="Copia el link corto desde Google Maps → Compartir"/>
          {infoForm.mapLink&&<a href={infoForm.mapLink} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:T.coral,fontWeight:700,marginBottom:14,textDecoration:"none"}}>🔗 Ver en mapa →</a>}
          <Btn full onClick={()=>{upd(br.id,infoForm);setInfoSaved(true);setTimeout(()=>setInfoSaved(false),2500);}}>{infoSaved?"✓ ¡Guardado!":"Guardar cambios"}</Btn>
          {/* Resumen estado */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
            {[["🗺️","Zonas domicilio",`${br.deliveryZones?.length||0} configuradas`],["⚙️","Servicios activos",`${Object.values(br.services||{}).filter(Boolean).length}/${SERVICES_DEFS.length}`]].map(([ic,lb,vl])=>(
              <div key={lb} style={{background:T.bg,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:10,fontWeight:700,color:T.light,marginBottom:2}}>{ic} {lb}</div>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{vl}</div>
              </div>
            ))}
          </div>
          {Object.values(br.services||{}).some(v=>!v)&&<div style={{marginTop:14,border:`1.5px solid ${T.amber}44`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontWeight:800,color:T.amber,fontSize:13,marginBottom:7}}>Servicios disponibles para activar</div>
            {SERVICES_DEFS.filter(s=>!br.services?.[s.id]).map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.mid,marginBottom:5}}>
                <span>{s.icon}</span><span>{s.label}</span>
                <button onClick={()=>setSubTab("servicios")} style={{marginLeft:"auto",fontSize:10,color:T.coral,background:"none",border:`1px solid ${T.coral}`,borderRadius:20,padding:"2px 8px",cursor:"pointer"}}>Activar</button>
              </div>
            ))}
          </div>}
        </Card>}
        {subTab==="servicios"&&<Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>Activar / desactivar servicios</div>
          {SERVICES_DEFS.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{width:44,height:44,borderRadius:12,background:s.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>{s.label}</div>
                <div style={{fontSize:12,color:T.mid,marginTop:2}}>{s.desc}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:br.services?.[s.id]?T.green:T.light}}>{br.services?.[s.id]?"Activo":"Inactivo"}</span>
                <Toggle value={br.services?.[s.id]||false} onChange={()=>togSvc(s.id)} sm/>
              </div>
            </div>
          ))}
        </Card>}
        {subTab==="domicilios"&&<div>
          {!br.services?.domicilios&&<div style={{background:T.amberL,border:`1px solid ${T.amber}44`,borderRadius:12,padding:"12px 16px",marginBottom:14,fontSize:13,color:T.amber,fontWeight:600}}>⚠️ Activa "Domicilios" en Servicios para configurar zonas.</div>}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>Zonas de entrega con precios personalizados</div>
            <div style={{fontSize:12,color:T.mid}}>Dibuja polígonos haciendo click en el mapa. Cada zona puede tener precio y tiempo de entrega diferente.</div>
          </div>
          <PolygonMap zones={br.deliveryZones||[]} onUpdate={updZone} onAdd={addZone} onDelete={delZone} branchAddress={br.address} branchCity={br.city}/>
        </div>}
        {subTab==="horarios"&&<Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>Horarios de atención</div>
          {Object.entries(br.schedule||{}).map(([day,cfg])=>(
            <div key={day} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{width:76,fontSize:13,fontWeight:600,color:T.text}}>{DAYS_ES[day]}</div>
              <Toggle value={cfg.active} onChange={v=>{const ns={...br.schedule,[day]:{...cfg,active:v}};upd(br.id,{schedule:ns});}} sm/>
              {cfg.active?<div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="time" value={cfg.open} onChange={e=>{const ns={...br.schedule,[day]:{...cfg,open:e.target.value}};upd(br.id,{schedule:ns});}} style={{padding:"5px 8px",border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text,background:T.bg}}/>
                <span style={{color:T.mid,fontSize:12}}>a</span>
                <input type="time" value={cfg.close} onChange={e=>{const ns={...br.schedule,[day]:{...cfg,close:e.target.value}};upd(br.id,{schedule:ns});}} style={{padding:"5px 8px",border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text,background:T.bg}}/>
              </div>:<span style={{fontSize:12,color:T.light,fontStyle:"italic"}}>Cerrado</span>}
            </div>
          ))}
        </Card>}
        {subTab==="qr"&&<BranchQR br={br} ownerId={ownerId}/>}
      </div>}
    </div>
  </div>;
}

/* ─── ADMIN: PRODUCTOS ────────────────────────────────────── */
