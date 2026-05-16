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

export function SecCategorias({cats,products,onAdd,onUpdate,onDelete,vertical,branches}){
  const vl = vertical?.labels || VERTICALS.restaurant.labels;
  const multiBranch=branches?.length>1;
  const defaultBIds=branches?.length===1?[branches[0].id]:["all"];
  const [modal,setModal]=useState(false);
  const [editC,setEditC]=useState(null);
  const [fBranch,setFBranch]=useState("all");
  const [form,setForm]=useState({name:"",icon:"🍽️",iconType:"emoji",iconImg:"",active:true,bgImg:"",bgColor:"",textColor:"#ffffff",fontStyle:"modern",branchIds:defaultBIds});
  const openNew=()=>{setEditC(null);setForm({name:"",icon:"🍽️",iconType:"emoji",iconImg:"",active:true,bgImg:"",bgColor:"",textColor:"#ffffff",fontStyle:"modern",branchIds:defaultBIds});setModal(true);};
  const openEdit=c=>{setEditC(c);setForm({name:c.name,icon:c.icon,iconType:c.iconType||"emoji",iconImg:c.iconImg||"",active:c.active,bgImg:c.bgImg||"",bgColor:c.bgColor||"",textColor:c.textColor||"#ffffff",fontStyle:c.fontStyle||"modern",branchIds:c.branchIds||defaultBIds});setModal(true);};
  const save=()=>{if(!form.name.trim())return;editC?onUpdate(editC.id,form):onAdd({...form,id:newId(),order:cats.length});setModal(false);};
  const EMOJIS = vertical?.emojis ? [...vertical.emojis,"⭐","✨","💎","🎯","🏷️","🔖"] : ["🔥","🥗","🍖","🥤","🍮","🍕","🌮","🍣","🥩","🍜","🍔","🥪","🧁","☕","🍺","🌿","⭐","✨","💎","🎯"];
  const filteredCats=[...cats].filter(c=>fBranch==="all"||(c.branchIds||["all"]).includes("all")||(c.branchIds||["all"]).includes(fBranch)).sort((a,b)=>a.order-b.order);
  const branchName=id=>branches?.find(b=>b.id===id)?.name||id;
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>{vl.categoryPlural||"Categorías"}</h2><p style={{color:T.mid,fontSize:13,marginTop:3}}>{filteredCats.length} {(vl.categoryPlural||"Categorías").toLowerCase()}</p></div>
      <Btn icon="+" onClick={openNew}>Nueva {(vl.category||"categoría").toLowerCase()}</Btn>
    </div>
    {multiBranch&&<Card style={{marginBottom:14,padding:"10px 14px"}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:T.mid,marginRight:4}}>🏪 Sucursal:</span>
        {[["all","🌐 Todas"],...(branches||[]).map(b=>[b.id,b.name])].map(([k,l])=>(
          <button key={k} onClick={()=>setFBranch(k)} style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${fBranch===k?T.coral:T.border}`,background:fBranch===k?T.coralL:T.white,color:fBranch===k?T.coral:T.mid,fontSize:12,fontWeight:fBranch===k?700:500,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
    </Card>}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {filteredCats.map((c,i)=>(
        <Card key={c.id} style={{padding:"14px 18px",opacity:c.active?1:0.6}} className="hov">
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:16,color:T.light,cursor:"grab"}}>⠿</div>
            <div style={{width:26,height:26,borderRadius:"50%",background:T.bg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:T.mid,flexShrink:0}}>{i+1}</div>
            <div style={{width:46,height:46,borderRadius:12,background:T.coralL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,overflow:"hidden",position:"relative"}}>
              {c.bgImg&&<img src={c.bgImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.85}} alt=""/>}
              <span style={{position:"relative",zIndex:1}}>{c.icon}</span>
            </div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:T.text}}>{c.name}</div><div style={{fontSize:11,color:T.mid,marginTop:1}}>{products.filter(p=>p.catId===c.id).length} productos{multiBranch&&<span style={{marginLeft:6,color:T.coral}}>· {(c.branchIds||["all"]).includes("all")?"Todas las sucursales":branchName((c.branchIds||[])[0])}</span>}</div></div>
            {!c.active&&<Tag color={T.mid}>Inactiva</Tag>}
            <Toggle value={c.active} onChange={v=>onUpdate(c.id,{active:v})} sm/>
            <Btn sm v="ghost" onClick={()=>openEdit(c)}>✏️</Btn>
            <Btn sm v="danger" onClick={()=>window.confirm(`¿Eliminar "${c.name}"?`)&&onDelete(c.id)}>🗑️</Btn>
          </div>
        </Card>
      ))}
      {cats.length===0&&<Card style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:48,marginBottom:12}}>🗂️</div><Btn icon="+" onClick={openNew}>Crear primera {(vl.category||"categoría").toLowerCase()}</Btn></Card>}
    </div>
    {modal&&<Modal title={editC?`Editar ${vl.category}`:`Nueva ${vl.category}`} icon="🗂️" onClose={()=>setModal(false)}>
      <Field label="Nombre" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder={`Ej: ${vl.cat_example||"Categoría principal"}…`} required/>
      {/* Tipo de ícono */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🎭 Ícono de la tarjeta</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[["emoji","😊 Emoji","Selecciona un emoji"],["photo","📷 Foto",vl.item_photo||"Foto del producto"],["none","✕ Ninguno","Solo imagen de fondo"]].map(([k,label,sub])=>(
            <button key={k} onClick={()=>setForm(p=>({...p,iconType:k}))} style={{padding:"10px 8px",borderRadius:10,border:`2px solid ${(form.iconType||"emoji")===k?T.coral:T.border}`,background:(form.iconType||"emoji")===k?T.coralL:T.bg,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
              <div style={{fontSize:13,fontWeight:800,color:T.text}}>{label}</div>
              <div style={{fontSize:10,color:T.mid,marginTop:2}}>{sub}</div>
            </button>
          ))}
        </div>
        {(form.iconType||"emoji")==="emoji"&&<>
          <input value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))} style={{width:"100%",padding:"12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:28,textAlign:"center",outline:"none",marginBottom:8}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{EMOJIS.map(em=><button key={em} onClick={()=>setForm(p=>({...p,icon:em}))} style={{width:36,height:36,borderRadius:9,border:`1.5px solid ${form.icon===em?T.coral:T.border}`,background:form.icon===em?T.coralL:"transparent",fontSize:18,cursor:"pointer"}}>{em}</button>)}</div>
        </>}
        {(form.iconType||"emoji")==="photo"&&<PhotoInput label={`${vl.item_photo||"Foto del producto"} / ícono`} value={form.iconImg} onChange={v=>setForm(p=>({...p,iconImg:v}))} height={90} dims="400×400 px • Cuadrada • JPG/PNG • Máx 1MB"/>}
        {(form.iconType||"emoji")==="none"&&<div style={{background:T.bg,borderRadius:10,padding:"12px 14px",fontSize:12,color:T.mid}}>🖼️ Solo se verá la imagen de fondo de la tarjeta, sin ícono extra.</div>}
      </div>
      {/* Foto de fondo */}
      <PhotoInput label="🖼️ Foto de fondo de categoría" value={form.bgImg} onChange={v=>setForm(p=>({...p,bgImg:v}))} height={100} dims="1200×500 px • Horizontal • JPG/PNG • Máx 2MB • Se recorta al centro"/>
      {/* Color de fondo */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🎨 Color de fondo (sin imagen)</label>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <input type="color" value={form.bgColor||"#7c3aed"} onChange={e=>setForm(p=>({...p,bgColor:e.target.value}))} style={{width:44,height:40,borderRadius:10,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
          <input value={form.bgColor||""} onChange={e=>setForm(p=>({...p,bgColor:e.target.value}))} placeholder="Ej: #7c3aed" style={{flex:1,padding:"9px 12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}/>
          <div style={{width:40,height:40,borderRadius:10,background:form.bgColor||"linear-gradient(135deg,#8b5cf6,#7c3aed)",border:`1px solid ${T.border}`}}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["#7c3aed","#2563eb","#059669","#d97706","#dc2626","#db2777","#0891b2","#111111","#374151","#b45309"].map(col=><div key={col} onClick={()=>setForm(p=>({...p,bgColor:col}))} style={{width:26,height:26,borderRadius:"50%",background:col,cursor:"pointer",border:(form.bgColor||"")===col?`3px solid ${T.coral}`:"3px solid transparent",boxShadow:"0 1px 4px rgba(0,0,0,.2)",transition:"all .15s"}}/>)}
        </div>
      </div>
      {/* Color de texto */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🔤 Color del texto</label>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <input type="color" value={form.textColor||"#ffffff"} onChange={e=>setForm(p=>({...p,textColor:e.target.value}))} style={{width:44,height:40,borderRadius:10,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
          <input value={form.textColor||"#ffffff"} onChange={e=>setForm(p=>({...p,textColor:e.target.value}))} style={{flex:1,padding:"9px 12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}/>
          <div style={{width:40,height:40,borderRadius:10,background:form.textColor||"#ffffff",border:`1px solid ${T.border}`}}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["#ffffff","#111111","#f97316","#fbbf24","#34d399","#60a5fa","#f472b6","#a78bfa"].map(c=><div key={c} onClick={()=>setForm(p=>({...p,textColor:c}))} style={{width:26,height:26,borderRadius:"50%",background:c,cursor:"pointer",border:(form.textColor||"#ffffff")===c?`3px solid ${T.coral}`:"3px solid transparent",boxShadow:"0 1px 4px rgba(0,0,0,.2)",transition:"all .15s"}}/>)}
        </div>
      </div>
      {/* Estilo de fuente */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>✍️ Estilo de fuente</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["modern","Moderna","900","'Plus Jakarta Sans',sans-serif"],["classic","Clásica","700","Georgia,serif"],["bold","Impacto","900","Impact,sans-serif"],["elegant","Elegante","300","'Plus Jakarta Sans',sans-serif"]].map(([k,label,w,ff])=>(
            <button key={k} onClick={()=>setForm(p=>({...p,fontStyle:k}))} style={{padding:"10px 12px",borderRadius:10,border:`2px solid ${(form.fontStyle||"modern")===k?T.coral:T.border}`,background:(form.fontStyle||"modern")===k?T.coralL:T.bg,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
              <div style={{fontFamily:ff,fontWeight:w,fontSize:14,color:T.text,letterSpacing:k==="elegant"?"2px":k==="bold"?"1px":"-.2px",textTransform:k==="elegant"?"uppercase":"none",fontStyle:k==="classic"?"italic":"normal"}}>{label}</div>
              <div style={{fontSize:10,color:T.mid,marginTop:3,fontFamily:"sans-serif",fontWeight:400}}>{k==="modern"?"Sans · Negrita":k==="classic"?"Serif · Cursiva":k==="bold"?"Condensada · Fuerte":"Light · Espaciada"}</div>
            </button>
          ))}
        </div>
      </div>
      {/* Preview de la tarjeta */}
      {(form.bgImg||form.name)&&(()=>{const fw2={modern:"900",classic:"700",bold:"900",elegant:"300"};const ff2={modern:"'Plus Jakarta Sans',sans-serif",classic:"Georgia,serif",bold:"Impact,sans-serif",elegant:"'Plus Jakarta Sans',sans-serif"};const lsp2={modern:"-.3px",classic:"0",bold:"1px",elegant:"2px"};const fs2=form.fontStyle||"modern";return<div style={{marginBottom:18}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>👁️ Vista previa</label>
        <div style={{height:100,borderRadius:14,overflow:"hidden",position:"relative",background:form.bgImg?"#111":(form.bgColor||"linear-gradient(135deg,#8b5cf6,#7c3aed)")}}>
          {form.bgImg&&<img src={form.bgImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} alt=""/>}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,.55) 0%,rgba(0,0,0,.1) 60%,rgba(0,0,0,0) 100%)"}}/>
          {(form.iconType||"emoji")==="emoji"&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:46,opacity:.85,userSelect:"none",flexShrink:0}}>{form.icon}</div>}
          {(form.iconType||"emoji")==="photo"&&form.iconImg&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",width:58,height:58,borderRadius:12,overflow:"hidden",border:"2px solid rgba(255,255,255,.3)",boxShadow:"0 4px 14px rgba(0,0,0,.5)",flexShrink:0}}><img src={form.iconImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/></div>}
          <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",maxWidth:"calc(100% - 88px)",overflow:"hidden"}}>
            <div style={{color:form.textColor||"#fff",fontWeight:fw2[fs2],fontFamily:ff2[fs2],fontSize:18,letterSpacing:lsp2[fs2],textTransform:fs2==="elegant"?"uppercase":"none",fontStyle:fs2==="classic"?"italic":"normal",textShadow:"0 2px 10px rgba(0,0,0,.6)",lineHeight:1.25,wordBreak:"break-word"}}>{form.name||"Nombre categoría"}</div>
          </div>
        </div>
      </div>;})()}
      {multiBranch&&<div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🏪 Asignar a sucursal</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["all","🌐 Todas las sucursales"],...(branches||[]).map(b=>[b.id,"🏪 "+b.name])].map(([k,l])=>(
            <button key={k} onClick={()=>setForm(p=>({...p,branchIds:[k]}))} style={{padding:"8px 14px",borderRadius:10,border:`2px solid ${(form.branchIds||["all"])[0]===k?T.coral:T.border}`,background:(form.branchIds||["all"])[0]===k?T.coralL:T.bg,color:(form.branchIds||["all"])[0]===k?T.coral:T.mid,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>}
      <div style={{marginBottom:18}}><Toggle value={form.active} onChange={v=>setForm(p=>({...p,active:v}))} label="Categoría activa"/></div>
      <div style={{display:"flex",gap:10}}><Btn full v="neutral" onClick={()=>setModal(false)}>Cancelar</Btn><Btn full disabled={!form.name.trim()} onClick={save}>{editC?"Guardar":"Crear"}</Btn></div>
    </Modal>}
  </div>;
}

/* ─── ADMIN: STOCK ────────────────────────────────────────── */
