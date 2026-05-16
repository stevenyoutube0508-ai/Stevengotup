import {useState,useMemo} from "react";
import {T} from "../../../constants/theme";
import {VERTICALS} from "../../../constants/verticals";
import {ALLERGENS_LIST,LABEL_PRESETS} from "../../../constants/seed";
import {fmtCOP,newId} from "../../../utils/format";
import {Card,Btn,Field,Toggle,Tag,Modal,PhotoInput} from "../../../shared/components";

export function SecProductos({products,cats,onAdd,onUpdate,onDelete,vertical,branches}){
  const vl = vertical?.labels || VERTICALS.restaurant.labels;
  const isRestaurant=!vertical||vertical.id==="restaurant";
  const multiBranch=branches?.length>1;
  const [modal,setModal]=useState(false);
  const [editP,setEditP]=useState(null);
  const [q,setQ]=useState("");
  const [fCat,setFCat]=useState("all");
  const [fSt,setFSt]=useState("all");
  const [fBranch,setFBranch]=useState("all");
  const [importModal,setImportModal]=useState(false);
  const [importRows,setImportRows]=useState([]);
  const [importError,setImportError]=useState("");
  const filtered=useMemo(()=>products.filter(p=>{
    const mQ=!q||p.name.toLowerCase().includes(q.toLowerCase());
    const mC=fCat==="all"||p.catId===fCat;
    const mS=fSt==="all"||(fSt==="active"&&p.active&&p.stock)||(fSt==="agotado"&&!p.stock)||(fSt==="oculto"&&!p.active);
    const mB=fBranch==="all"||(p.branchIds||["all"]).includes("all")||(p.branchIds||["all"]).includes(fBranch);
    return mQ&&mC&&mS&&mB;
  }),[products,q,fCat,fSt,fBranch]);

  const downloadTemplate=()=>{
    const sep=";";
    const header=["nombre","categoria","precio_menu","precio_domicilio","descripcion","activo","destacado"];
    const catNames=cats.length>0?cats.map(c=>c.name):["Hamburguesas","Bebidas","Platos fuertes"];
    const rows=[
      ["Hamburguesa Clásica",catNames[0]||"Hamburguesas","25000","28000","Carne 100% res con lechuga tomate y queso","si","no"],
      ["Limonada de Coco",catNames[1]||"Bebidas","8000","9000","Limonada natural con leche de coco","si","si"],
      ["Bandeja Paisa",catNames[2]||"Platos fuertes","38000","42000","Frijoles arroz chicharron huevo y arepa","si","si"],
    ];
    const catHint=`## Categorias disponibles: ${catNames.join(" | ")}`;
    const csv=["sep=;",catHint,header.join(sep),...rows.map(r=>r.join(sep))].join("\n");
    const blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="plantilla_productos_picku.csv";a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    setImportError("");
    if(!file.name.match(/\.(csv|txt)$/i)){setImportError("⚠️ Debes guardar el archivo como CSV desde Excel: Archivo → Guardar como → CSV UTF-8.");return;}
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const text=ev.target.result.replace(/^﻿/,"").replace(/\r/g,"");
        const allLines=text.split("\n");
        const lines=allLines.filter(l=>l.trim()&&!l.trim().startsWith("sep=")&&!l.trim().startsWith("##")&&!l.trim().startsWith("//"));
        if(lines.length<2){setImportError("El archivo está vacío o no tiene productos.");return;}
        const sep=lines[0].includes(";")?";":",";
        const headers=lines[0].split(sep).map(h=>h.trim().replace(/^"|"$/g,"").toLowerCase().replace(/\s+/g,"_"));
        const rows=lines.slice(1).map(line=>{
          const vals=line.split(sep);
          const clean=vals.map(v=>v.trim().replace(/^"|"$/g,"").trim());
          return Object.fromEntries(headers.map((h,i)=>[h,clean[i]||""]));
        }).filter(r=>r.nombre&&r.nombre.trim()&&!r.nombre.startsWith("#"));
        if(rows.length===0){setImportError("No se encontraron productos válidos.");return;}
        setImportRows(rows);
        setImportModal(true);
      }catch(err){setImportError("Error al leer el archivo. Usa la plantilla descargada.");}
    };
    reader.readAsText(file,"UTF-8");
    e.target.value="";
  };

  const confirmImport=async()=>{
    let count=0;
    for(const row of importRows){
      const cat=cats.find(c=>c.name.toLowerCase()===row.categoria?.toLowerCase())||cats[0];
      const menuPrice=parseInt((row.precio_menu||row.precio||"0").replace(/\D/g,""))||0;
      const delivPrice=parseInt((row.precio_domicilio||"0").replace(/\D/g,""))||0;
      if(!menuPrice&&!delivPrice)continue;
      const p={id:newId(),catId:cat?.id||"",name:row.nombre,price:menuPrice||delivPrice,deliveryPrice:delivPrice||null,forMenu:menuPrice>0,forDelivery:delivPrice>0,desc:row.descripcion||"",emoji:"🍽️",img:"",active:(row.activo||"si").toLowerCase()==="si",featured:(row.destacado||"no").toLowerCase()==="si",stock:true,label:"",labelColor:"#f97316",allergens:[],clicks:0};
      await onAdd(p);count++;
    }
    setImportModal(false);setImportRows([]);
    alert(`✅ ${count} producto${count!==1?"s":""} importado${count!==1?"s":""} correctamente.`);
  };

  function PForm({init,onSave,onClose}){
    const isRestaurant=!vertical||vertical.id==="restaurant";
    const isFood=isRestaurant||vertical?.id==="grocery";
    const priceLabelA=isRestaurant?`📋 Precio ${vl.catalog||"menú"}`:`💰 Precio de venta`;
    const priceLabelB=isRestaurant?`🛵 Precio domicilio`:`🚚 Precio con ${(vl.delivery||"envío").toLowerCase()}`;
    const priceTip=isRestaurant?"💡 Deja en 0 el precio que no aplica — el producto solo aparecerá en ese canal.":`💡 Deja en 0 si no ofreces ${(vl.delivery||"envío").toLowerCase()} para esta ${(vl.item||"producto").toLowerCase()}.`;
    const labelPresetsLocal=isRestaurant?LABEL_PRESETS:[
      {name:"Popular",color:"#f97316"},{name:"Nuevo",color:"#8b5cf6"},
      {name:"Oferta",color:"#dc2626"},{name:"Exclusivo",color:"#059669"},
      {name:"Especial",color:"#2563eb"},{name:"Edición limitada",color:"#db2777"},
    ];
    const defaultEmoji=vl.item==="Plato"?"🍽️":vl.item==="Prenda"?"👗":vl.item==="Equipo"?"📱":vl.item==="Servicio"?"⚙️":"🛍️";
    const defaultBIds=branches?.length===1?[branches[0].id]:["all"];
    const [d,setD]=useState(init?{...init,price:String(init.price||0),deliveryPrice:String(init.deliveryPrice||""),branchIds:init.branchIds||defaultBIds}:{name:"",price:"",deliveryPrice:"",desc:"",catId:cats[0]?.id||"",emoji:defaultEmoji,img:"",active:true,featured:false,stock:true,forMenu:true,forDelivery:false,label:"",labelColor:"#f97316",allergens:[],branchIds:defaultBIds});
    const set=k=>v=>setD(p=>({...p,[k]:v}));
    const togA=id=>set("allergens")(d.allergens.includes(id)?d.allergens.filter(x=>x!==id):[...d.allergens,id]);
    const valid=d.name.trim()&&parseInt(d.price)>0&&d.catId;
    return <div>
      <PhotoInput label={vl.item_photo||"Foto del producto"} value={d.img} onChange={set("img")} dims="800×800 px • Cuadrada 1:1 • JPG o PNG • Máx 2MB"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 86px",gap:10}}>
        <Field label={`${vl.item||"Producto"} *`} value={d.name} onChange={set("name")} placeholder={`Ej: ${vl.item_example||"Producto destacado"}`} required/>
        <div><label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:5}}>Emoji</label><input value={d.emoji} onChange={e=>set("emoji")(e.target.value)} style={{width:"100%",padding:"10px 4px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:22,textAlign:"center",outline:"none"}}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label={priceLabelA} value={d.price} onChange={v=>{set("price")(v);if(parseInt(v)>0)setD(p=>({...p,forMenu:true}));}} type="number" placeholder="38000" prefix="$" suffix="COP"/>
        <Field label={priceLabelB} value={d.deliveryPrice} onChange={v=>{set("deliveryPrice")(v);if(parseInt(v)>0)setD(p=>({...p,forDelivery:true}));}} type="number" placeholder="42000" prefix="$" suffix="COP"/>
      </div>
      <div style={{background:T.coralL,borderRadius:8,padding:"6px 10px",fontSize:11,color:T.coral,marginBottom:14}}>
        {priceTip}
      </div>
      <Field label="Descripción" value={d.desc} onChange={set("desc")} textarea rows={3} placeholder="Ingredientes, preparación…"/>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Categoría *</label>
        <select value={d.catId} onChange={e=>set("catId")(e.target.value)} style={{width:"100%",padding:"10px 13px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}>
          {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Etiqueta badge</label>
        <div style={{display:"flex",gap:8,marginBottom:7}}>
          <input value={d.label} onChange={e=>set("label")(e.target.value)} placeholder="Popular, Nuevo…" style={{flex:1,padding:"9px 13px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}/>
          {d.label&&<input type="color" value={d.labelColor} onChange={e=>set("labelColor")(e.target.value)} style={{width:40,height:38,borderRadius:8,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {labelPresetsLocal.map(lp=><button key={lp.name} onClick={()=>setD(p=>({...p,label:lp.name,labelColor:lp.color}))} style={{padding:"3px 10px",borderRadius:20,border:`1.5px solid ${d.label===lp.name?lp.color:T.border}`,background:d.label===lp.name?lp.color+"18":"transparent",color:d.label===lp.name?lp.color:T.mid,fontSize:11,fontWeight:700,cursor:"pointer"}}>{lp.name}</button>)}
          {d.label&&<button onClick={()=>setD(p=>({...p,label:""}))} style={{padding:"3px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:"transparent",color:T.mid,fontSize:11,cursor:"pointer"}}>✕</button>}
        </div>
      </div>
      {isFood&&<div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>Alérgenos</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {ALLERGENS_LIST.map(a=><button key={a.id} onClick={()=>togA(a.id)} style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${d.allergens.includes(a.id)?T.coral:T.border}`,background:d.allergens.includes(a.id)?T.coralL:"transparent",color:d.allergens.includes(a.id)?T.coral:T.mid,fontSize:12,fontWeight:d.allergens.includes(a.id)?700:500,cursor:"pointer"}}>{a.i} {a.l}</button>)}
        </div>
      </div>}
      <div style={{background:T.bg,borderRadius:12,padding:14,marginBottom:18}}>
        <div style={{fontSize:11,fontWeight:700,color:T.mid,marginBottom:10,textTransform:"uppercase",letterSpacing:".5px"}}>Opciones</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Toggle value={d.active} onChange={set("active")} label={isRestaurant?"Visible en el menú":"Activo en el catálogo"}/>
          <Toggle value={d.stock} onChange={set("stock")} label="En stock / disponible"/>
          <Toggle value={d.featured} onChange={set("featured")} label="⭐ Producto destacado"/>
          {isRestaurant&&<Toggle value={d.forMenu!==false} onChange={set("forMenu")} label="📋 Aparece en menú digital (mesa)"/>}
          {isRestaurant&&<Toggle value={d.forDelivery!==false} onChange={set("forDelivery")} label="🛵 Aparece en domicilio"/>}
        </div>
      </div>
      {multiBranch&&<div style={{marginBottom:18}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🏪 Sucursal</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["all","🌐 Todas las sucursales"],...(branches||[]).map(b=>[b.id,"🏪 "+b.name])].map(([k,l])=>(
            <button key={k} onClick={()=>setD(p=>({...p,branchIds:[k]}))} style={{padding:"8px 14px",borderRadius:10,border:`2px solid ${(d.branchIds||["all"])[0]===k?T.coral:T.border}`,background:(d.branchIds||["all"])[0]===k?T.coralL:T.bg,color:(d.branchIds||["all"])[0]===k?T.coral:T.mid,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>}
      <div style={{display:"flex",gap:10}}><Btn full v="neutral" onClick={onClose}>Cancelar</Btn><Btn full disabled={!valid} onClick={()=>onSave({...d,price:parseInt(d.price)||0,deliveryPrice:parseInt(d.deliveryPrice)||null,forMenu:d.forMenu!==false,forDelivery:d.forDelivery!==false,id:d.id||newId(),clicks:d.clicks||0})}>{init?"Guardar cambios":"Agregar producto"}</Btn></div>
    </div>;
  }

  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Productos</h2><p style={{color:T.mid,fontSize:13,marginTop:3}}>{products.filter(p=>p.active&&p.stock).length} activos · {products.filter(p=>!p.stock).length} agotados</p></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Btn v="light" sm icon="📋" onClick={downloadTemplate}>Plantilla Excel</Btn>
        <label style={{cursor:"pointer"}}>
          <input type="file" accept=".csv,.txt" onChange={handleImportFile} style={{display:"none"}}/>
          <span onClick={e=>e.currentTarget.previousSibling.click()} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",background:T.greenL,border:`1px solid ${T.green}44`,borderRadius:10,fontSize:12,fontWeight:700,color:T.green,cursor:"pointer"}}>📤 Importar CSV</span>
        </label>
        <Btn icon="+" onClick={()=>{setEditP(null);setModal(true);}}>Nuevo producto</Btn>
      </div>
      {importError&&<div style={{marginTop:8,color:T.red,fontSize:12}}>{importError}</div>}
    </div>
    {multiBranch&&<Card style={{marginBottom:10,padding:"10px 14px"}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:T.mid,marginRight:4}}>🏪 Sucursal:</span>
        {[["all","🌐 Todas"],...(branches||[]).map(b=>[b.id,b.name])].map(([k,l])=>(
          <button key={k} onClick={()=>setFBranch(k)} style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${fBranch===k?T.coral:T.border}`,background:fBranch===k?T.coralL:T.white,color:fBranch===k?T.coral:T.mid,fontSize:12,fontWeight:fBranch===k?700:500,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
    </Card>}
    <Card style={{marginBottom:14,padding:"12px 16px"}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Buscar…" style={{flex:1,minWidth:160,padding:"9px 13px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none"}}/>
        <select value={fCat} onChange={e=>setFCat(e.target.value)} style={{padding:"9px 12px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,fontSize:12,color:T.mid,outline:"none"}}>
          <option value="all">Todas las categorías</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{display:"flex",gap:5}}>
          {[["all","Todos"],["active","Activos"],["agotado","Agotados"],["oculto","Ocultos"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFSt(k)} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${fSt===k?T.coral:T.border}`,background:fSt===k?T.coralL:T.white,color:fSt===k?T.coral:T.mid,fontSize:11,fontWeight:fSt===k?700:500,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>
    </Card>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {filtered.map(p=>{
        const cat=cats.find(c=>c.id===p.catId);
        return <Card key={p.id} style={{padding:"14px 16px",opacity:p.active?1:0.6}} className="hov">
          <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
            <div style={{width:70,height:70,borderRadius:14,overflow:"hidden",flexShrink:0,background:T.bg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:28}}>{p.emoji}</span>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:4}}>
                <span style={{fontWeight:800,fontSize:15,color:T.text}}>{p.name}{p.featured?" ⭐":""}</span>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0,gap:1}}>
                  {p.price>0&&<span style={{fontWeight:900,fontSize:13,color:T.coral}}>{isRestaurant?"📋":"💰"} {fmtCOP(p.price)}</span>}
                  {p.deliveryPrice>0&&<span style={{fontWeight:900,fontSize:13,color:"#059669"}}>{isRestaurant?"🛵":"🚚"} {fmtCOP(p.deliveryPrice)}</span>}
                </div>
              </div>
              <p style={{fontSize:11,color:T.mid,lineHeight:1.5,marginBottom:7,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.desc}</p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {cat&&<Tag color={T.coral}>{cat.icon} {cat.name}</Tag>}
                {isRestaurant&&p.forMenu!==false&&<Tag color="#2563eb">📋 Menú</Tag>}
                {isRestaurant&&p.forDelivery!==false&&<Tag color="#059669">🛵 Domicilio</Tag>}
                {multiBranch&&<Tag color={T.mid}>🏪 {(p.branchIds||["all"]).includes("all")?"Todas":(branches?.find(b=>b.id===(p.branchIds||[])[0])?.name||(p.branchIds||[])[0])}</Tag>}
                {p.label&&<Tag color={p.labelColor}>{p.label}</Tag>}
                {p.allergens.map(a=>{const al=ALLERGENS_LIST.find(x=>x.id===a);return al?<Tag key={a} color="#78716c" sm>{al.i}</Tag>:null;})}
                {!p.stock&&<Tag color={T.red}>Agotado</Tag>}
                {!p.active&&<Tag color={T.mid}>Oculto</Tag>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12,paddingTop:10,borderTop:`1px solid ${T.border}`,flexWrap:"wrap"}}>
            <Toggle value={p.active} onChange={v=>onUpdate(p.id,{active:v})} label={p.active?"Visible":"Oculto"} sm/>
            <div style={{width:1,height:16,background:T.border}}/>
            <Toggle value={p.stock} onChange={v=>onUpdate(p.id,{stock:v})} label={p.stock?"En stock":"Agotado"} sm/>
            <div style={{marginLeft:"auto",display:"flex",gap:8}}>
              <Btn sm v="ghost" onClick={()=>{setEditP(p);setModal(true);}}>✏️ Editar</Btn>
              <Btn sm v="danger" onClick={()=>window.confirm(`¿Eliminar "${p.name}"?`)&&onDelete(p.id)}>🗑️</Btn>
            </div>
          </div>
        </Card>;
      })}
      {filtered.length===0&&<Card style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:44,marginBottom:10}}>🍽️</div><div style={{fontWeight:700,color:T.text,marginBottom:16}}>{q?`Sin resultados para "${q}"`:"No hay productos"}</div>{!q&&<Btn icon="+" onClick={()=>{setEditP(null);setModal(true);}}>Agregar primer producto</Btn>}</Card>}
    </div>
    {modal&&<Modal title={editP?"Editar producto":"Nuevo producto"} icon="🍽️" onClose={()=>setModal(false)} wide>
      <PForm init={editP} onSave={d=>{editP?onUpdate(editP.id,d):onAdd(d);setModal(false);setEditP(null);}} onClose={()=>setModal(false)} branches={branches}/>
    </Modal>}
    {importModal&&<div onClick={()=>setImportModal(false)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:560,maxHeight:"85vh",overflowY:"auto",boxShadow:T.shMd}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div><div style={{fontSize:18,fontWeight:900,color:T.text}}>📤 Importar productos</div><div style={{color:T.mid,fontSize:12,marginTop:2}}>{importRows.length} producto{importRows.length!==1?"s":""} encontrado{importRows.length!==1?"s":""}</div></div>
          <button onClick={()=>setImportModal(false)} style={{background:T.bg,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:T.mid,fontSize:16}}>×</button>
        </div>
        <div style={{background:T.bg,borderRadius:12,overflow:"hidden",marginBottom:18}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:0,padding:"8px 14px",borderBottom:`1px solid ${T.border}`}}>
            {["Producto","Categoría","Precio menú","Precio dom."].map(h=><div key={h} style={{fontSize:10,fontWeight:800,color:T.light,textTransform:"uppercase"}}>{h}</div>)}
          </div>
          {importRows.map((r,i)=>{
            const cat=cats.find(c=>c.name.toLowerCase()===r.categoria?.toLowerCase());
            const valid=r.nombre&&parseInt((r.precio_menu||"0").replace(/\D/g,""))>0;
            return <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:0,padding:"10px 14px",borderBottom:`1px solid ${T.border}`,background:valid?"transparent":"#fff5f5"}}>
              <div style={{fontWeight:600,fontSize:13,color:T.text,display:"flex",alignItems:"center",gap:6}}><span>{r.emoji||"🍽️"}</span>{r.nombre}</div>
              <div style={{fontSize:12,color:cat?T.green:T.amber}}>{cat?cat.name:<span title="Se usará primera categoría">⚠️ {r.categoria||"—"}</span>}</div>
              <div style={{fontSize:12,fontWeight:700,color:T.text}}>{r.precio_menu?`$${parseInt(r.precio_menu.replace(/\D/g,"")).toLocaleString("es-CO")}`:"—"}</div>
              <div style={{fontSize:12,color:T.mid}}>{r.precio_domicilio?`$${parseInt(r.precio_domicilio.replace(/\D/g,"")).toLocaleString("es-CO")}`:"—"}</div>
            </div>;
          })}
        </div>
        <div style={{background:T.greenL,border:`1px solid ${T.green}44`,borderRadius:10,padding:"10px 14px",fontSize:12,color:"#065f46",marginBottom:18}}>
          ✅ Canal asignado automáticamente: <strong>precio menú</strong> → 📋 menú digital · <strong>precio domicilio</strong> → 🛵 domicilio. Si tiene ambos, aparece en los dos.
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn full v="neutral" onClick={()=>setImportModal(false)}>Cancelar</Btn>
          <Btn full onClick={confirmImport}>✅ Importar {importRows.length} productos</Btn>
        </div>
      </div>
    </div>}
  </div>;
}
