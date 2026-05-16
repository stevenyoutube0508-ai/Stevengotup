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

export function SecDelivery({orders,onMove,products,config,onAddOrder,vertical}){
  const vl=(vertical||getVertical("restaurant")).labels;
  const isRestaurant=!vertical||vertical.id==="restaurant";
  const [selId,setSelId]=useState(null);
  const [filter,setFilter]=useState("all");
  const [newModal,setNewModal]=useState(false);
  const [delivWaModal,setDelivWaModal]=useState(false);
  const [delivWaPhone,setDelivWaPhone]=useState("");
  const [form,setForm]=useState({mode:"domicilio",customerName:"",customerPhone:"",customerEmail:"",address:"",addressRef:"",table:"",notes:"",payment:"cash",items:[]});
  const pc=config.primaryColor||"#f97316";
  const PAYMENT_LABEL={cash:"Efectivo",nequi:"Nequi",daviplata:"Daviplata",card:"Tarjeta"};
  const printComanda=(o)=>{
    const w=window.open("","_blank","width=400,height=700");
    if(!w)return;
    const items=o.items?.map(it=>`<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span>${it.qty}x ${it.name}</span><span>${fmtCOP(it.price*it.qty)}</span></div>`).join("")||"";
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comanda</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;font-size:13px;width:302px;padding:10px;}
    .center{text-align:center;}.bold{font-weight:bold;}.big{font-size:16px;font-weight:bold;}
    .row{display:flex;justify-content:space-between;margin-bottom:4px;}
    .divider{border-top:1px dashed #000;margin:8px 0;}
    .badge{text-align:center;font-weight:bold;font-size:12px;border:2px solid #000;padding:5px;margin:8px 0;letter-spacing:1px;}
    @media print{@page{margin:0;size:80mm auto;}body{width:100%;padding:4px;}}</style>
    </head><body>
    <div class="center big" style="margin-bottom:2px">${config.name||"Picku"}</div>
    ${config.address?`<div class="center" style="font-size:10px;margin-bottom:8px">${config.address}</div>`:""}
    <div class="divider"></div>
    <div class="badge">${o.mode==="domicilio"?"DOMICILIO":o.mode==="mesa"?"MESA "+o.table:"PICKUP"}</div>
    <div class="row"><span>Pedido:</span><span class="bold">#${o.id.toUpperCase().slice(0,8)}</span></div>
    <div class="row"><span>Fecha:</span><span>${o.date} ${o.time}</span></div>
    <div class="row"><span>Cliente:</span><span>${o.customerName}</span></div>
    ${o.customerPhone?`<div class="row"><span>Tel:</span><span>${o.customerPhone}</span></div>`:""}
    ${o.mode==="domicilio"?`<div class="row"><span>Dir:</span><span style="text-align:right;max-width:58%">${o.address}${o.addressRef?" ("+o.addressRef+")":""}</span></div>`:""}
    <div class="divider"></div>
    <div class="bold" style="margin-bottom:6px">PRODUCTOS</div>
    ${items}
    <div class="divider"></div>
    ${o.mode==="domicilio"?`<div class="row"><span>Domicilio</span><span>${fmtCOP(o.delivery||0)}</span></div>`:""}
    <div class="row bold" style="font-size:15px"><span>TOTAL</span><span>${fmtCOP(o.total)}</span></div>
    <div class="row" style="margin-top:4px"><span>Pago:</span><span>${PAYMENT_LABEL[o.payment]||o.payment}</span></div>
    ${o.notes?`<div class="divider"></div><div style="font-size:11px"><b>Notas:</b> ${o.notes}</div>`:""}
    <div class="divider"></div>
    <div class="center" style="font-size:10px">¡Gracias!</div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
    </body></html>`);
    w.document.close();
  };
  const sendToDelivery=(o,phone)=>{
    const mapsUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`;
    const items=o.items?.map(it=>`  • ${it.qty}x ${it.name} — ${fmtCOP(it.price*it.qty)}`).join("\n")||"";
    const msg=`${vl.delivery_icon} *NUEVO ${vl.delivery_title.toUpperCase()}*\n\n*Negocio:* ${config.name||"Picku"}\n*${vl.order}:* #${o.id.toUpperCase().slice(0,8)}\n*Hora:* ${o.time}\n\n*Cliente:* ${o.customerName}\n*Tel cliente:* ${o.customerPhone||"—"}\n*Dirección:* ${o.address}${o.addressRef?"\n*Referencia:* "+o.addressRef:""}\n\n*${vl.itemPlural}:*\n${items}\n\n*Subtotal:* ${fmtCOP(o.subtotal)}\n*${vl.delivery_fee_label}:* ${fmtCOP(o.delivery||0)}\n*TOTAL:* ${fmtCOP(o.total)}\n*Pago:* ${PAYMENT_LABEL[o.payment]||o.payment}${o.notes?"\n*Notas:* "+o.notes:""}\n\n📍 *Ubicación:*\n${mapsUrl}`;
    const waNum=phone.replace(/\D/g,"");
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`,"_blank");
  };
  const shown=filter==="all"?orders:filter==="pendiente"?orders.filter(o=>o.status==="pendiente"):orders.filter(o=>o.mode===filter);
  const sel=selId?orders.find(o=>o.id===selId):null;
  const SL={pendiente:"Pendiente",en_cocina:vl.status_processing,listo:vl.status_ready,en_camino:vl.status_shipping,entregado:vl.status_done};
  const SC={pendiente:"#f59e0b",en_cocina:"#3b82f6",listo:"#059669",en_camino:"#8b5cf6",entregado:"#9ca3af"};
  const NL={pendiente:"Aceptar "+vl.order.toLowerCase(),en_cocina:vl.status_ready,listo:vl.status_shipping,en_camino:"Finalizar"};
  const addItem=p=>setForm(f=>({...f,items:[...f.items,{...p,qty:1,total:p.price}]}));
  const removeItem=pid=>setForm(f=>({...f,items:f.items.filter(i=>i.id!==pid)}));
  const createOrder=()=>{
    if(!form.customerName||!form.items.length)return;
    const sub=form.items.reduce((s,i)=>s+i.total,0);
    const del=form.mode==="domicilio"?(config.deliveryFee||5000):0;
    const o={id:newId(),createdAt:Date.now(),status:"pendiente",mode:form.mode,time:timeNow(),date:todayStr(),...form,subtotal:sub,delivery:del,total:sub+del};
    onAddOrder(o);setSelId(o.id);setNewModal(false);
    setForm({mode:"domicilio",customerName:"",customerPhone:"",customerEmail:"",address:"",addressRef:"",table:"",notes:"",payment:"cash",items:[]});
  };
  return <div style={{animation:"fadeUp .35s ease",display:"flex",gap:0,height:"calc(100vh - 110px)",overflow:"hidden"}}>
    {/* LEFT */}
    <div style={{width:255,flexShrink:0,background:T.white,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"12px 13px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <span style={{fontWeight:800,fontSize:14,color:T.text}}>Pedidos</span>
          <Btn sm icon="+" onClick={()=>setNewModal(true)}>Nuevo</Btn>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {[["all","Todos"],["pendiente","Pend."],["domicilio",vl.delivery_icon],isRestaurant&&["mesa","🪑"]].filter(Boolean).map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{padding:"4px 8px",borderRadius:20,border:`1px solid ${filter===k?pc:T.border}`,background:filter===k?pc+"18":"transparent",color:filter===k?pc:T.mid,fontSize:10,fontWeight:filter===k?700:500,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {shown.length===0&&<div style={{textAlign:"center",padding:"40px 14px",color:T.light,fontSize:12}}>Sin pedidos</div>}
        {shown.map(o=>{
          const isNew=Date.now()-o.createdAt<25000;
          return <div key={o.id} onClick={()=>setSelId(o.id)} style={{padding:"11px 13px",borderBottom:`1px solid ${T.border}`,cursor:"pointer",background:selId===o.id?pc+"10":"transparent",borderLeft:`3px solid ${selId===o.id?pc:"transparent"}`,transition:"all .15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
              <div style={{fontWeight:700,fontSize:13,color:isNew?pc:T.text}}>{o.customerName||"Sin nombre"}{isNew&&<span style={{marginLeft:4,fontSize:8,background:pc,color:"#fff",borderRadius:20,padding:"1px 5px",fontWeight:800}}>NUEVO</span>}</div>
              <span style={{fontSize:8,fontWeight:700,color:"#fff",background:SC[o.status]||"#999",borderRadius:20,padding:"2px 6px",flexShrink:0}}>{SL[o.status]}</span>
            </div>
            <div style={{fontSize:11,color:T.mid}}>{o.mode==="domicilio"?vl.delivery_icon+" "+vl.delivery_title:o.mode==="mesa"?"🪑 "+(o.table||"Mesa"):"🏪 "+vl.pickup_title}</div>
            <div style={{fontSize:11,color:T.light}}>{o.items?.length||0} ítem{o.items?.length!==1?"s":""} · {fmtCOP(o.total)} · {o.time}</div>
          </div>;
        })}
      </div>
    </div>
    {/* RIGHT */}
    <div style={{flex:1,overflowY:"auto",background:T.bg}}>
      {!sel&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:T.light}}>
        <div style={{fontSize:52,marginBottom:10}}>📋</div>
        <div style={{fontSize:15,fontWeight:700,color:T.mid}}>Selecciona un pedido</div>
        <div style={{fontSize:12,marginTop:4}}>O crea uno nuevo con el botón "+ Nuevo"</div>
      </div>}
      {sel&&<div style={{padding:"20px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <div style={{fontSize:11,color:T.mid,marginBottom:2}}>{vl.order} · {sel.mode==="domicilio"?vl.delivery_title:sel.mode==="mesa"?"En Mesa":vl.pickup_title}</div>
            <div style={{fontWeight:900,fontSize:20,color:T.text}}>#{sel.id.toUpperCase()}</div>
            <div style={{fontSize:12,color:T.mid,marginTop:2}}>{sel.date} · {sel.time}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
            <button onClick={()=>printComanda(sel)} title="Imprimir comanda para cocina" style={{padding:"7px 13px",background:T.white,border:`1.5px solid ${T.border}`,borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:700,color:T.text,display:"flex",alignItems:"center",gap:6,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>🖨️ Comanda</button>
            {sel.mode==="domicilio"&&<button onClick={()=>{setDelivWaPhone("");setDelivWaModal(true);}} title="Enviar pedido al domiciliario por WhatsApp" style={{padding:"7px 13px",background:"#22c55e18",border:"1.5px solid #22c55e44",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:700,color:"#16a34a",display:"flex",alignItems:"center",gap:6,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>🛵 WhatsApp domiciliario</button>}
            <span style={{fontSize:12,fontWeight:700,color:"#fff",background:SC[sel.status],borderRadius:20,padding:"5px 14px"}}>{SL[sel.status]}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{display:"flex",gap:0,marginBottom:18,background:T.white,borderRadius:12,overflow:"hidden",border:`1px solid ${T.border}`}}>
          {Object.entries(SL).map(([k,l],i)=>{const done=Object.keys(SL).indexOf(k)<=Object.keys(SL).indexOf(sel.status);return(
            <div key={k} style={{flex:1,padding:"8px 4px",textAlign:"center",background:done?SC[k]+"18":"transparent",borderRight:i<4?`1px solid ${T.border}`:"none"}}>
              <div style={{fontSize:9,fontWeight:700,color:done?SC[k]:T.light}}>{l}</div>
            </div>
          );})}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
          <Card>
            <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:12}}>👤 Datos del cliente</div>
            {[["Cliente",sel.customerName||"—"],["📞 Teléfono",sel.customerPhone||"—"],["📧 Email",sel.customerEmail||"—"],sel.mode==="domicilio"&&["📍 Dirección",sel.address||"—"],sel.mode==="domicilio"&&["🏠 Referencia",sel.addressRef||"—"],sel.mode==="mesa"&&["🪑 Mesa",sel.table||"—"],["💳 Pago",{cash:"Efectivo",nequi:"Nequi",daviplata:"Daviplata",card:"Tarjeta"}[sel.payment]||sel.payment],sel.notes&&["📝 Notas",sel.notes]].filter(Boolean).map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:12,paddingBottom:7,borderBottom:`1px solid ${T.border}`}}>
                <span style={{color:T.mid}}>{l}</span><span style={{color:T.text,fontWeight:600,textAlign:"right",maxWidth:"55%"}}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:12}}>🛒 Detalle del pedido</div>
            {sel.items?.map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:13}}><span style={{color:T.text}}>{it.qty} {it.name}</span><span style={{fontWeight:700}}>{fmtCOP(it.price*it.qty)}</span></div>)}
            <div style={{borderTop:`1px solid ${T.border}`,marginTop:7,paddingTop:7}}>
              {sel.mode==="domicilio"&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.mid,marginBottom:4}}><span>{vl.delivery_fee_label}</span><span>{fmtCOP(sel.delivery||0)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:16}}><span>Total</span><span style={{color:pc}}>{fmtCOP(sel.total)}</span></div>
            </div>
            {sel.status!=="entregado"&&<div style={{marginTop:12,padding:"8px 12px",background:T.greenL,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:11,fontWeight:700,color:T.green}}>Pago: {sel.payment==="cash"?"Efectivo":sel.payment}</span>
              <Btn sm v="success">Recibir pago</Btn>
            </div>}
          </Card>
        </div>
        {sel.status!=="entregado"&&<div style={{background:T.white,borderRadius:14,padding:"14px 18px",border:`1px solid ${T.border}`,display:"flex",gap:10,alignItems:"center",boxShadow:T.sh}}>
          <div style={{flex:1,fontSize:12,color:T.mid}}>
            <span style={{fontWeight:700,color:T.text}}>Estado: {SL[sel.status]}</span>
            {sel.status==="pendiente"&&<div>Acepta el pedido para empezar a procesarlo</div>}
          </div>
          {K_NEXT[sel.status]&&<Btn v="green" onClick={()=>{onMove(sel.id,K_NEXT[sel.status]);setSelId(null);setTimeout(()=>setSelId(sel.id),50);}} style={{padding:"12px 22px",fontSize:14,fontWeight:800}}>{NL[sel.status]} →</Btn>}
          {sel.status!=="entregado"&&<Btn v="ghost" onClick={()=>onMove(sel.id,"entregado")}>Finalizar</Btn>}
        </div>}
      </div>}
    </div>
    {/* NEW ORDER MODAL */}
    {newModal&&<Modal title="Nuevo pedido" icon="📝" onClose={()=>setNewModal(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Modo</label>
            <div style={{display:"flex",gap:6}}>
              {[["domicilio",vl.delivery_icon+" "+vl.delivery_title],isRestaurant&&["mesa","🪑 Mesa"],["pickup","🏪 "+vl.pickup_title]].filter(Boolean).map(([k,l])=>(
                <button key={k} onClick={()=>setForm(p=>({...p,mode:k}))} style={{flex:1,padding:"8px",borderRadius:9,border:`1.5px solid ${form.mode===k?pc:T.border}`,background:form.mode===k?pc+"15":"transparent",color:form.mode===k?pc:T.mid,fontSize:11,fontWeight:form.mode===k?700:500,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </div>
          <Field label="Nombre del cliente *" value={form.customerName} onChange={v=>setForm(p=>({...p,customerName:v}))} required/>
          <Field label="Teléfono *" value={form.customerPhone} onChange={v=>setForm(p=>({...p,customerPhone:v}))} type="tel" required/>
          <Field label="Email" value={form.customerEmail} onChange={v=>setForm(p=>({...p,customerEmail:v}))} type="email"/>
          {form.mode==="domicilio"&&<><Field label="Dirección *" value={form.address} onChange={v=>setForm(p=>({...p,address:v}))} placeholder="Cra 5 #15-32, El Peñón" required/><Field label="Referencia" value={form.addressRef} onChange={v=>setForm(p=>({...p,addressRef:v}))} placeholder="Apto 304, torre A, portería…"/></>}
          {form.mode==="mesa"&&<Field label="Número de mesa *" value={form.table} onChange={v=>setForm(p=>({...p,table:v}))} placeholder="Mesa 3, 4A…" required/>}
          <Field label="Notas" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} textarea rows={2} placeholder={vl.notes_placeholder}/>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Método de pago</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[["cash","💵 Efectivo"],["nequi","📱 Nequi"],["daviplata","📲 Daviplata"],["card","💳 Tarjeta"]].map(([k,l])=>(
                <button key={k} onClick={()=>setForm(p=>({...p,payment:k}))} style={{padding:"5px 10px",borderRadius:20,border:`1.5px solid ${form.payment===k?pc:T.border}`,background:form.payment===k?pc+"18":"transparent",color:form.payment===k?pc:T.mid,fontSize:11,fontWeight:form.payment===k?700:500,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{marginBottom:8,fontSize:12,fontWeight:700,color:T.mid}}>Agregar productos</div>
          <div style={{maxHeight:200,overflowY:"auto",marginBottom:10,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
            {products.filter(p=>p.active&&p.stock).map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}} onClick={()=>addItem(p)}>
                <span style={{fontSize:13,color:T.text}}>{p.emoji} {p.name}</span>
                <div style={{display:"flex",gap:7,alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,color:T.coral}}>{fmtCOP(p.price)}</span>
                  <span style={{fontSize:16,color:T.green,fontWeight:700}}>+</span>
                </div>
              </div>
            ))}
          </div>
          {form.items.length>0&&<div style={{background:T.coralL,borderRadius:10,padding:12}}>
            <div style={{fontSize:11,fontWeight:700,color:T.coral,marginBottom:7}}>Pedido</div>
            {form.items.map((it,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,fontSize:12}}>
                <span style={{color:T.coralD}}>{it.qty}× {it.name}</span>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{color:T.coral,fontWeight:700}}>{fmtCOP(it.total)}</span>
                  <button onClick={()=>removeItem(it.id)} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:14}}>×</button>
                </div>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${T.coral}30`,paddingTop:7,marginTop:5,display:"flex",justifyContent:"space-between",fontWeight:800,color:T.coral,fontSize:14}}>
              <span>Total</span><span>{fmtCOP(form.items.reduce((s,i)=>s+i.total,0)+(form.mode==="domicilio"?(config.deliveryFee||5000):0))}</span>
            </div>
          </div>}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:8}}>
        <Btn full v="neutral" onClick={()=>setNewModal(false)}>Cancelar</Btn>
        <Btn full disabled={!form.customerName||!form.items.length} onClick={createOrder}>Crear pedido</Btn>
      </div>
    </Modal>}
    {delivWaModal&&sel&&<div onClick={()=>setDelivWaModal(false)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:900,fontSize:17,color:T.text}}>🛵 Enviar al domiciliario</div>
          <button onClick={()=>setDelivWaModal(false)} style={{background:"none",border:"none",color:T.mid,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#166534"}}>
          <div style={{fontWeight:700,marginBottom:4}}>Pedido #{sel.id.toUpperCase().slice(0,8)}</div>
          <div>{sel.customerName} · {sel.address}</div>
          <div style={{marginTop:4,color:"#16a34a",fontWeight:600}}>{sel.items?.length} producto{sel.items?.length!==1?"s":""} · {fmtCOP(sel.total)}</div>
        </div>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>NÚMERO WHATSAPP DEL DOMICILIARIO</label>
        <input
          value={delivWaPhone}
          onChange={e=>setDelivWaPhone(e.target.value)}
          placeholder="+57 300 000 0000"
          type="tel"
          autoFocus
          style={{width:"100%",boxSizing:"border-box",padding:"11px 13px",background:"rgba(0,0,0,.04)",border:`1.5px solid ${T.border}`,borderRadius:11,color:T.text,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",marginBottom:14}}
        />
        <div style={{fontSize:11,color:T.mid,marginBottom:16,lineHeight:1.5}}>
          Se abrirá WhatsApp con el mensaje pre-llenado: datos del cliente, productos, total y enlace de ubicación en Google Maps.
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn full v="neutral" onClick={()=>setDelivWaModal(false)}>Cancelar</Btn>
          <button onClick={()=>{if(!delivWaPhone.trim())return;sendToDelivery(sel,delivWaPhone);setDelivWaModal(false);}} disabled={!delivWaPhone.trim()} style={{flex:1,padding:"11px",background:delivWaPhone.trim()?"#22c55e":"#e5e7eb",border:"none",borderRadius:12,color:delivWaPhone.trim()?"#fff":T.mid,fontWeight:800,fontSize:14,cursor:delivWaPhone.trim()?"pointer":"default",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"background .2s"}}>
            💬 Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>}
  </div>;
}

/* ─── ADMIN: RESERVAS ─────────────────────────────────────── */
