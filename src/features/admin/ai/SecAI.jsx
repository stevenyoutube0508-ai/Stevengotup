import {useState,useEffect,useRef} from "react";
import {T} from "../../../constants/theme";
import {newId} from "../../../utils/format";
import {Card,Btn} from "../../../shared/components";

export function SecAI({products,orders,cats,config,branches,onAddProduct,onUpdateProduct}){
  const WELCOME="¡Hola! Soy tu asistente de gestión ⚡\n\nTengo acceso completo a tus datos en tiempo real. Puedo:\n\n• 📊 **Analizar ventas** — ingresos, tendencias, hora pico\n• 👤 **Clientes** — quién más pide, ticket promedio\n• 🍽️ **Productos** — más vendidos, precios, disponibilidad\n• ✏️ **Hacer cambios** — precios, activar/desactivar, agregar\n\nPrueba: *\"¿Cuánto vendí este mes?\"* o *\"Sube el precio de la Bandeja a $42.000\"*";
  const [msgs,setMsgs]=useState([{role:"assistant",text:WELCOME,acts:[],type:"text"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [pendingActs,setPendingActs]=useState(null);
  const bottomRef=useRef();
  const inputRef=useRef();
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const buildCtx=()=>{
    const delivered=orders.filter(o=>o.status==="entregado");
    const totalRev=delivered.reduce((s,o)=>s+(o.total||0),0);
    const avgTicket=delivered.length?Math.round(totalRev/delivered.length):0;
    const custMap={};
    orders.forEach(o=>{
      const n=o.customerName||"Anónimo";
      if(!custMap[n])custMap[n]={pedidos:0,total:0,ultimoPedido:o.date||""};
      custMap[n].pedidos++;custMap[n].total+=(o.total||0);
      if((o.date||"")>custMap[n].ultimoPedido)custMap[n].ultimoPedido=o.date||"";
    });
    const topClientes=Object.entries(custMap).sort((a,b)=>b[1].pedidos-a[1].pedidos).slice(0,8).map(([nombre,d])=>({nombre,...d}));
    const prodSales={};
    orders.forEach(o=>(o.items||[]).forEach(it=>{
      const k=it.name||it.productId;
      if(!prodSales[k])prodSales[k]={qty:0,revenue:0};
      prodSales[k].qty+=(it.qty||1);
      prodSales[k].revenue+=(it.price||0)*(it.qty||1);
    }));
    const topProductos=Object.entries(prodSales).sort((a,b)=>b[1].qty-a[1].qty).slice(0,8).map(([nombre,d])=>({nombre,...d}));
    const porModo={menu:0,domicilio:0,mesa:0};
    orders.forEach(o=>{const m=o.mode||"menu";porModo[m]=(porModo[m]||0)+1;});
    const porDia={};
    orders.forEach(o=>{
      if(o.createdAt||o.date){
        const d=new Date(o.createdAt||o.date);
        const dia=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()]||"";
        if(!porDia[dia])porDia[dia]={pedidos:0,ingresos:0};
        porDia[dia].pedidos++;porDia[dia].ingresos+=(o.total||0);
      }
    });
    return {
      restaurante:config.name,
      resumen:{totalPedidos:orders.length,pedidosEntregados:delivered.length,ingresosTotales:totalRev,ticketPromedio:avgTicket,pendientes:orders.filter(o=>o.status==="pendiente").length},
      topClientes,topProductos,
      distribucionModo:porModo,
      ventasPorDia:porDia,
      productos:products.map(p=>({id:p.id,nombre:p.name,precio:p.price,categoria:cats.find(c=>c.id===p.catId)?.name||p.catId,activo:p.active,enStock:p.stock,clicks:p.clicks})),
      categorias:cats.map(c=>({id:c.id,nombre:c.name})),
      ultimosPedidos:orders.slice(-30).map(o=>({id:o.id,cliente:o.customerName,total:o.total,estado:o.status,modo:o.mode,fecha:o.date||o.createdAt?.split("T")[0]||""})),
    };
  };

  const SYS=()=>`Eres el asistente IA de gestión para "${config.name||"el restaurante"}". Tienes acceso completo a todos los datos en tiempo real.

DATOS ACTUALES:
${JSON.stringify(buildCtx())}

RESPONDE SIEMPRE con JSON válido sin backticks, exactamente en este formato:
{"message":"texto claro y útil","actions":[],"confirmNeeded":false}

ACCIONES DISPONIBLES (incluir en "actions" cuando corresponda):
• Cambiar precio: {"type":"update","id":"p1","patch":{"price":42000},"preview":"Bandeja Paisa: $38.000 → $42.000"}
• Activar: {"type":"update","id":"p1","patch":{"active":true},"preview":"Activar: Bandeja Paisa"}
• Desactivar: {"type":"update","id":"p1","patch":{"active":false},"preview":"Desactivar: Bandeja Paisa"}
• Marcar agotado: {"type":"update","id":"p1","patch":{"stock":false},"preview":"Agotado: Bandeja Paisa"}
• Marcar disponible: {"type":"update","id":"p1","patch":{"stock":true},"preview":"Disponible: Bandeja Paisa"}
• Agregar: {"type":"add","data":{name,price,desc,catId,emoji,active:true,stock:true,featured:false,label:"",allergens:[]},"preview":"Agregar: [nombre] $[precio]"}

REGLAS CRÍTICAS:
1. Para cambios de precio/estado: pon "confirmNeeded":true y la acción lista. NO ejecutes sin confirmación.
2. Si el usuario dice "sí", "confirmar", "dale", "hazlo": pon "confirmNeeded":false y las mismas acciones listas.
3. Para reportes: usa los números EXACTOS de los datos. Sé específico con cifras.
4. Habla en español colombiano, amigable y directo. Máximo 4 oraciones.
5. Usa formato markdown: **negrita** para números importantes, listas con •`;

  const send=async(overrideText)=>{
    const txt=(overrideText||input).trim();
    if(!txt||loading)return;
    if(!overrideText)setInput("");
    setLoading(true);
    setMsgs(p=>[...p,{role:"user",text:txt,acts:[],type:"text"}]);
    const apiKey=import.meta.env.VITE_ANTHROPIC_KEY;
    if(!apiKey){
      setMsgs(p=>[...p,{role:"assistant",text:"⚠️ Falta configurar la clave de API.\n\nAgrega tu clave de Anthropic en el archivo `.env`:\n```\nVITE_ANTHROPIC_KEY=sk-ant-...\n```\nLuego reinicia el servidor de desarrollo.",acts:[],type:"text"}]);
      setLoading(false);return;
    }
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-opus-4-5",max_tokens:900,system:SYS(),messages:[{role:"user",content:txt}]})
      });
      const data=await res.json();
      if(data.error){throw new Error(data.error.message||"API error");}
      const raw=(data.content?.[0]?.text||"{}").replace(/```json\n?|```/g,"").trim();
      let parsed={message:"✓",actions:[],confirmNeeded:false};
      try{parsed=JSON.parse(raw);}catch{parsed={message:raw.slice(0,500),actions:[],confirmNeeded:false};}
      const acts=parsed.actions||[];
      if(parsed.confirmNeeded&&acts.length>0){
        setPendingActs(acts);
        setMsgs(p=>[...p,{role:"assistant",text:parsed.message||"",acts:[],type:"confirm",pendingActs:acts}]);
      } else {
        const done=[];
        for(const a of acts){
          if(a.type==="update"&&a.id){await onUpdateProduct(a.id,a.patch);done.push(a.preview||"Producto actualizado");}
          else if(a.type==="add"&&a.data){await onAddProduct({...a.data,id:newId(),img:"",clicks:0,labelColor:"#f97316",allergens:a.data.allergens||[]});done.push(a.preview||"Producto agregado");}
        }
        setPendingActs(null);
        setMsgs(p=>[...p,{role:"assistant",text:parsed.message||"",acts:done,type:"text"}]);
      }
    }catch(e){
      setMsgs(p=>[...p,{role:"assistant",text:`❌ Error: ${e.message||"No se pudo conectar"}. Verifica tu clave de API.`,acts:[],type:"text"}]);
    }
    setLoading(false);setTimeout(()=>inputRef.current?.focus(),80);
  };

  const confirmPending=async()=>{
    if(!pendingActs||loading)return;
    setLoading(true);
    setMsgs(p=>[...p,{role:"user",text:"✅ Confirmar",acts:[],type:"text"}]);
    const done=[];
    for(const a of pendingActs){
      if(a.type==="update"&&a.id){await onUpdateProduct(a.id,a.patch);done.push(a.preview||"Actualizado");}
      else if(a.type==="add"&&a.data){await onAddProduct({...a.data,id:newId(),img:"",clicks:0,labelColor:"#f97316",allergens:a.data.allergens||[]});done.push(a.preview||"Agregado");}
    }
    setPendingActs(null);
    setMsgs(p=>[...p,{role:"assistant",text:`✅ ¡Listo! Realicé **${done.length}** cambio${done.length!==1?"s":""} exitosamente.`,acts:done,type:"text"}]);
    setLoading(false);setTimeout(()=>inputRef.current?.focus(),80);
  };

  const renderMd=t=>t.split("\n").map((l,i)=>{
    const h=l.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/`(.*?)`/g,"<code style='background:#f0f2f8;padding:1px 5px;border-radius:4px;font-size:11px'>$1</code>");
    return <p key={i} style={{margin:"1px 0",fontSize:13,lineHeight:1.7}} dangerouslySetInnerHTML={{__html:h}}/>;
  });

  const QUICK=["¿Cuánto vendí este mes?","¿Quién es el cliente que más pide?","¿Cuáles son los productos más vendidos?","¿Qué productos están agotados?","Sube el precio de la Bandeja Paisa a $42.000","Agrega jugo de lulo a $8.000"];

  return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
    <div style={{marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(135deg,${T.coral},${T.pink})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚡</div>
      <div>
        <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:0}}>Asistente IA</h2>
        <p style={{color:T.mid,fontSize:11,margin:0}}>Claude Opus 4 · Datos en tiempo real · {orders.length} pedidos · {products.length} productos</p>
      </div>
    </div>
    <Card style={{flex:1,display:"flex",flexDirection:"column",padding:0,overflow:"hidden",minHeight:0}}>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:14,alignItems:"flex-end",gap:8}}>
            {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.coral},${T.pink})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>⚡</div>}
            <div style={{maxWidth:"78%"}}>
              <div style={{padding:"12px 15px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?`linear-gradient(135deg,${T.coral},${T.pink})`:T.bg,color:m.role==="user"?"#fff":T.text,border:m.role==="user"?"none":`1px solid ${T.border}`}}>
                {renderMd(m.text)}
              </div>
              {m.acts?.length>0&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>
                {m.acts.map((a,j)=><div key={j} style={{fontSize:11,fontWeight:700,background:T.greenL,color:T.green,borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:4}}>✓ {a}</div>)}
              </div>}
              {m.type==="confirm"&&m.pendingActs&&pendingActs&&<div style={{marginTop:8,background:T.amberL,border:`1.5px solid ${T.amber}`,borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:8}}>⚠️ Confirma los siguientes cambios:</div>
                {m.pendingActs.map((a,j)=><div key={j} style={{fontSize:12,color:T.text,padding:"3px 0",borderBottom:`1px solid ${T.amber}30`}}>• {a.preview||a.type}</div>)}
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={confirmPending} disabled={loading} style={{flex:1,padding:"8px 0",background:T.green,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Confirmar</button>
                  <button onClick={()=>{setPendingActs(null);setMsgs(p=>[...p,{role:"assistant",text:"De acuerdo, cancelé los cambios. ¿En qué más te puedo ayudar?",acts:[],type:"text"}]);}} style={{flex:1,padding:"8px 0",background:T.redL,color:T.red,border:`1px solid ${T.red}30`,borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>❌ Cancelar</button>
                </div>
              </div>}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:10}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.coral},${T.pink})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>⚡</div>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:"16px 16px 16px 4px",padding:"12px 16px",display:"flex",gap:5,alignItems:"center"}}>
            {[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:T.coral,animation:`dotB 1.2s ease ${j*0.2}s infinite`}}/>)}
            <span style={{fontSize:11,color:T.mid,marginLeft:4}}>Analizando datos…</span>
          </div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"6px 14px 4px",display:"flex",gap:6,overflowX:"auto",borderTop:`1px solid ${T.border}30`}}>
        {QUICK.map(q=><button key={q} onClick={()=>{if(!loading){setInput(q);setTimeout(()=>inputRef.current?.focus(),50);}}} style={{flexShrink:0,padding:"5px 11px",borderRadius:20,border:`1px solid ${T.border}`,background:T.white,color:T.mid,fontSize:10,cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s"}}>{q}</button>)}
      </div>
      <div style={{padding:"10px 14px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,background:T.white}}>
        <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Pregunta algo sobre tu negocio o pide un cambio…" disabled={loading}
          style={{flex:1,padding:"10px 14px",background:T.bg,border:`1.5px solid ${loading?T.coral:T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"border-color .2s"}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{width:44,height:44,borderRadius:10,background:!loading&&input.trim()?`linear-gradient(135deg,${T.coral},${T.pink})`:T.bg,border:"none",color:!loading&&input.trim()?"#fff":T.light,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:loading||!input.trim()?"not-allowed":"pointer",transition:"all .2s",flexShrink:0}}>
          {loading?<div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${T.coral}`,borderTopColor:"transparent",animation:"spin .8s linear infinite"}}/>:"→"}
        </button>
      </div>
    </Card>
  </div>;
}
