import { useState, useEffect, useRef, useMemo, useCallback } from "react";
// supabase client eliminado — usar servicio ceo.service para operaciones cross-user
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T, CM, STYLES } from "../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../constants/seed";
import { VERTICALS, getVertical } from "../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../utils/format";
import { pointInPoly } from "../../utils/geo";
import { Eye, CheckCircle2, Mail, AlertCircle, Calendar, User, Package, ClipboardList, DollarSign, Store, FileText, AlertTriangle, MapPin, Phone, Plus, Trash2, Building2 } from "lucide-react";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../shared/components";
import { loadBusinessBranches, saveBusinessBranches, extendSubscription } from "../../services/ceo.service";

const DEFAULT_SCHEDULE = {
  mon: { active: true,  open: "09:00", close: "22:00" },
  tue: { active: true,  open: "09:00", close: "22:00" },
  wed: { active: true,  open: "09:00", close: "22:00" },
  thu: { active: true,  open: "09:00", close: "22:00" },
  fri: { active: true,  open: "09:00", close: "23:00" },
  sat: { active: true,  open: "10:00", close: "23:00" },
  sun: { active: false, open: "10:00", close: "20:00" },
};

const INIT_BRANCH_FORM = {
  name: "", address: "", city: "", phone: "",
  services: { menuDigital: true, domicilios: false, pickup: false, reservas: false, pedidoMesa: false },
};

export function CEORestaurantes({restaurants,onUpdate,showToast}){
  const [sel,setSel]=useState(null);
  const [q,setQ]=useState("");
  const [filter,setFilter]=useState("all");

  // branches per business
  const [branches,setBranches]=useState([]);
  const [branchLoading,setBranchLoading]=useState(false);
  const [branchSaving,setBranchSaving]=useState(false);
  const [showBranchForm,setShowBranchForm]=useState(false);
  const [branchForm,setBranchForm]=useState(INIT_BRANCH_FORM);

  const shown=restaurants.filter(r=>{
    const mQ=!q||r.name.toLowerCase().includes(q.toLowerCase())||r.city.toLowerCase().includes(q.toLowerCase());
    const mF=filter==="all"||r.status===filter||(filter==="expiring"&&r.daysLeft<=7&&r.status==="active");
    return mQ&&mF;
  });
  const r=sel?restaurants.find(x=>x.id===sel)||sel:null;

  // Load branches whenever a business detail is opened
  useEffect(()=>{
    if(!sel){ setBranches([]); setShowBranchForm(false); setBranchForm(INIT_BRANCH_FORM); return; }
    setBranchLoading(true);
    loadBusinessBranches(sel).then(data=>{ setBranches(data); setBranchLoading(false); });
  },[sel]);
  const changeStatus=(res,status)=>{onUpdate(res.id,{status});showToast(`${res.name} → ${STATUS_MAP[status]?.label}`);if(r?.id===res.id)setSel(p=>p);};
  // Extender suscripción 30 días por email del owner
  const extendSub=async(res)=>{
    const { error, newExpiry } = await extendSubscription(res.id);
    if(error){ showToast(`⚠ Error extendiendo suscripción`,"warn"); return; }
    onUpdate(res.id,{status:"active",nextPayment:newExpiry.slice(0,10),daysLeft:30});
    showToast(`✅ Suscripción de ${res.name} extendida hasta ${newExpiry.slice(0,10)}`);
    setSel(null);
  };
  const changePlan=(res,plan)=>{onUpdate(res.id,{plan,mrr:PLAN_MAP[plan]?.price||0});showToast(`Plan de ${res.name} → ${PLAN_MAP[plan]?.label}`);};

  const addBranch=async()=>{
    if(!branchForm.name||!branchForm.address||!branchForm.city) return;
    const newBranch={ id:`b_${Date.now()}`, ...branchForm, status:true, deliveryZones:[], schedule: DEFAULT_SCHEDULE };
    const updated=[...branches, newBranch];
    setBranchSaving(true);
    const {error}=await saveBusinessBranches(sel, updated);
    setBranchSaving(false);
    if(error){ showToast("❌ Error guardando sucursal","error"); return; }
    setBranches(updated);
    setBranchForm(INIT_BRANCH_FORM);
    setShowBranchForm(false);
    showToast(`✓ Sucursal "${newBranch.name}" creada`);
  };

  const deleteBranch=async(branchId)=>{
    const updated=branches.filter(b=>b.id!==branchId);
    const {error}=await saveBusinessBranches(sel, updated);
    if(error){ showToast("❌ Error eliminando sucursal","error"); return; }
    setBranches(updated);
    showToast("Sucursal eliminada","warn");
  };

  const setBF=k=>v=>setBranchForm(p=>({...p,[k]:v}));
  const setSvc=k=>setBranchForm(p=>({...p,services:{...p.services,[k]:!p.services[k]}}));

  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Negocios</h2><p style={{color:T.mid,fontSize:13,marginTop:2}}>{restaurants.filter(r=>r.status!=="inactive").length} activos en la plataforma</p></div>
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
              <div style={{fontSize:12,color:T.mid,marginBottom:5,display:"flex",alignItems:"center",gap:5}}><User size={11}/>{res.owner} <Mail size={11}/>{res.email}</div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:T.mid}}>
                <span style={{display:"flex",alignItems:"center",gap:4}}><Package size={10}/>{res.products} productos</span><span style={{display:"flex",alignItems:"center",gap:4}}><ClipboardList size={10}/>{res.orders} pedidos</span><span style={{display:"flex",alignItems:"center",gap:4}}><DollarSign size={10}/>{fmtCOP(res.mrr)}/mes</span>{res.status!=="inactive"&&<span style={{display:"flex",alignItems:"center",gap:4}}><Calendar size={10}/>{res.nextPayment}</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,flexWrap:"wrap"}}>
            <Btn sm v="ghost" icon={Eye} onClick={()=>setSel(res.id)}>Detalle</Btn>
            {res.status==="active"&&<Btn sm v="danger" onClick={()=>changeStatus(res,"suspended")}>Suspender</Btn>}
            {res.status==="suspended"&&<Btn sm v="success" icon={CheckCircle2} onClick={()=>extendSub(res)}>Reactivar + 30d</Btn>}
            {res.status==="trial"&&<Btn sm v="primary" onClick={()=>changeStatus(res,"active")}>Activar</Btn>}
            <Btn sm v="amber" icon={Mail} onClick={()=>window.open(`mailto:${res.email}`)}>Contactar</Btn>
          </div>
        </Card>;
      })}
      {shown.length===0&&<Card style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:44,marginBottom:10}}>🔍</div><div style={{color:T.mid}}>Sin resultados</div></Card>}
    </div>
    {r&&<Modal title={r.name} icon={Store} onClose={()=>setSel(null)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <div style={{height:110,borderRadius:12,overflow:"hidden",marginBottom:14,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {r.coverImg?<img src={r.coverImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:44}}>{r.logo}</span>}
          </div>
          <div style={{display:"flex",gap:5,marginBottom:12}}><Tag color={PLAN_MAP[r.plan]?.color||T.mid}>{PLAN_MAP[r.plan]?.label}</Tag><Tag color={STATUS_MAP[r.status]?.color||T.mid}>{STATUS_MAP[r.status]?.label}</Tag></div>
          {[[User,"Propietario",r.owner],[Mail,"Email",r.email],[Store,"Teléfono",r.phone],[Store,"Ciudad",r.city],[Calendar,"Registrado",r.createdAt],[Calendar,"Próximo pago",r.nextPayment],[DollarSign,"MRR",fmtCOP(r.mrr)],[Package,"Productos",r.products],[ClipboardList,"Pedidos",r.orders]].map(([Ic,lb,vl])=>(
            <div key={lb} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:12,paddingBottom:7,borderBottom:`1px solid ${T.border}`}}><span style={{color:T.mid,display:"flex",alignItems:"center",gap:5}}><Ic size={11}/>{lb}</span><span style={{color:T.text,fontWeight:600,textAlign:"right",maxWidth:"55%"}}>{vl}</span></div>
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
              {r.status==="active"&&<Btn full v="danger" icon={AlertCircle} onClick={()=>{changeStatus(r,"suspended");setSel(null);}}>Suspender cuenta</Btn>}
              {r.status==="suspended"&&<Btn full v="success" icon={CheckCircle2} onClick={()=>{changeStatus(r,"active");setSel(null);}}>Reactivar cuenta</Btn>}
              {r.status==="trial"&&<Btn full v="primary" onClick={()=>{changeStatus(r,"active");setSel(null);}}>Convertir a activo</Btn>}
              <Btn full v="green" onClick={()=>extendSub(r)} icon={Calendar}>Extender 30 días</Btn>
              <Btn full v="neutral" onClick={()=>window.open(`mailto:${r.email}`)} icon={Mail}>Enviar email</Btn>
            </div>
          </div>
          {r.notes&&<div style={{marginTop:14,background:T.indigoL,borderRadius:10,padding:"10px 12px",fontSize:12,color:T.indigo,display:"flex",alignItems:"center",gap:6}}><FileText size={12}/>{r.notes}</div>}
        </div>
      </div>

      {/* ── SUCURSALES ───────────────────────────── */}
      <div style={{marginTop:22,borderTop:`1px solid ${T.border}`,paddingTop:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Building2 size={15} color={T.coral}/>
            <span style={{fontSize:13,fontWeight:900,color:T.text}}>
              Sucursales ({branchLoading?"…":branches.length})
            </span>
          </div>
          {!showBranchForm&&<Btn sm onClick={()=>setShowBranchForm(true)}>
            <span style={{display:"flex",alignItems:"center",gap:5}}><Plus size={12}/>Nueva sucursal</span>
          </Btn>}
        </div>

        {/* Lista de sucursales */}
        {branchLoading
          ? <div style={{color:T.mid,fontSize:12,textAlign:"center",padding:"14px 0"}}>Cargando sucursales…</div>
          : branches.length===0&&!showBranchForm
            ? <div style={{background:T.bg,borderRadius:10,padding:"20px",textAlign:"center"}}>
                <Building2 size={28} color={T.light} style={{margin:"0 auto 8px"}}/>
                <div style={{color:T.mid,fontSize:12}}>Sin sucursales. Crea la primera.</div>
              </div>
            : branches.map(b=>(
                <div key={b.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:T.bg,borderRadius:10,marginBottom:8,border:`1px solid ${T.border}`}}>
                  <div style={{width:34,height:34,borderRadius:9,background:T.coralL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Building2 size={15} color={T.coral}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:2}}>{b.name}</div>
                    <div style={{fontSize:11,color:T.mid,display:"flex",gap:8,flexWrap:"wrap"}}>
                      {b.address&&<span style={{display:"flex",alignItems:"center",gap:3}}><MapPin size={9}/>{b.address}</span>}
                      {b.city&&<span>{b.city}</span>}
                      {b.phone&&<span style={{display:"flex",alignItems:"center",gap:3}}><Phone size={9}/>{b.phone}</span>}
                    </div>
                    {b.services&&<div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
                      {Object.entries({menuDigital:"Catálogo",domicilios:"Domicilios",pickup:"Pickup",reservas:"Reservas",pedidoMesa:"Mesa"})
                        .filter(([k])=>b.services[k])
                        .map(([k,lbl])=>(
                          <span key={k} style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,background:T.greenL,color:T.green}}>
                            {lbl}
                          </span>
                        ))}
                    </div>}
                  </div>
                  <button
                    onClick={()=>deleteBranch(b.id)}
                    title="Eliminar sucursal"
                    style={{background:T.redL,border:"none",borderRadius:7,color:T.red,padding:"5px 7px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
                  >
                    <Trash2 size={12}/>
                  </button>
                </div>
              ))
        }

        {/* Formulario nueva sucursal */}
        {showBranchForm&&(
          <div style={{background:T.bg,borderRadius:12,padding:16,border:`1.5px solid ${T.border}`,marginTop:8}}>
            <div style={{fontSize:12,fontWeight:800,color:T.text,marginBottom:12}}>📍 Nueva sucursal</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <Field label="Nombre *" value={branchForm.name} onChange={setBF("name")} placeholder="Sucursal Norte"/>
              <Field label="Ciudad *" value={branchForm.city} onChange={setBF("city")} placeholder="Cali"/>
              <Field label="Dirección *" value={branchForm.address} onChange={setBF("address")} placeholder="Cra 5 #15-32"/>
              <Field label="Teléfono" value={branchForm.phone} onChange={setBF("phone")} placeholder="+57 300 000 0000"/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T.mid,marginBottom:7}}>SERVICIOS DISPONIBLES</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[["menuDigital","Catálogo Digital"],["domicilios","Domicilios"],["pickup","Pickup"],["reservas","Reservas"],["pedidoMesa","Pedido en Mesa"]].map(([k,lbl])=>(
                  <button
                    key={k}
                    onClick={()=>setSvc(k)}
                    style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${branchForm.services[k]?T.green:T.border}`,background:branchForm.services[k]?T.greenL:T.white,color:branchForm.services[k]?T.green:T.mid,fontSize:11,fontWeight:branchForm.services[k]?700:400,cursor:"pointer",transition:"all .15s"}}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn v="neutral" sm onClick={()=>{setShowBranchForm(false);setBranchForm(INIT_BRANCH_FORM);}}>Cancelar</Btn>
              <Btn sm onClick={addBranch} disabled={!branchForm.name||!branchForm.address||!branchForm.city||branchSaving}>
                {branchSaving?"Guardando…":"✓ Guardar sucursal"}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </Modal>}
  </div>;
}

/* ─── CEO: ONBOARDING ─────────────────────────────────────── */
