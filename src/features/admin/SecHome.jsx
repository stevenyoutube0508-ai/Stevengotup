import {T} from "../../constants/theme";
import {VERTICALS} from "../../constants/verticals";
import {ANALYTICS_WEEK} from "../../constants/kanban";
import {fmtCOP} from "../../utils/format";
import {Card,StatCard} from "../../shared/components";
import {AreaChart,Area,XAxis,Tooltip,ResponsiveContainer} from "recharts";

export function SecHome({products,orders,config,billing,onNav,vertical}){
  const vl=(vertical||VERTICALS.restaurant).labels;
  const pendingOrders=orders.filter(o=>o.status==="pendiente").length;
  const todayRev=orders.filter(o=>o.status==="entregado").reduce((s,o)=>s+(o.total||0),0);
  const vc=(vertical||VERTICALS.restaurant).color||T.coral;
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:22,display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
      <div>
        <h1 style={{fontSize:24,fontWeight:900,color:T.text,marginBottom:3}}>Hola, {config.name} 👋</h1>
        <p style={{color:T.mid,fontSize:13}}>{new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}</p>
      </div>
      {vertical&&<div style={{display:"flex",alignItems:"center",gap:8,background:vc+"15",border:`1px solid ${vc}30`,borderRadius:12,padding:"7px 12px"}}>
        <span style={{fontSize:18}}>{vertical.icon}</span>
        <div>
          <div style={{fontSize:11,fontWeight:800,color:vc}}>{vertical.name}</div>
          <div style={{fontSize:9,color:T.mid}}>{vl.catalog} Digital</div>
        </div>
      </div>}
    </div>
    <Card style={{marginBottom:20,background:`linear-gradient(135deg,${T.navy} 0%,#1a2d4a 100%)`,border:"none",padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginBottom:4}}>Estado del {vl.catalog.toLowerCase()}</div>
        <div style={{color:"#fff",fontSize:20,fontWeight:800}}>Plan {billing.plan.charAt(0).toUpperCase()+billing.plan.slice(1)} · Activo ✅</div>
        <div style={{color:"rgba(255,255,255,.5)",fontSize:12,marginTop:4}}>Próxima factura: {billing.nextPayment} · {fmtCOP(billing.amount)}</div>
      </div>
      <button onClick={()=>onNav("facturacion")} style={{background:T.coral,border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,padding:"8px 16px",cursor:"pointer",boxShadow:`0 3px 12px ${T.coral}50`}}>Ver suscripción</button>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:14,marginBottom:20}}>
      <StatCard icon={(vertical||VERTICALS.restaurant).icon} label={vl.home_products} value={products.filter(p=>p.active&&p.stock).length} color={vc} onClick={()=>onNav("productos")}/>
      <StatCard icon="📋" label={`${vl.order}s pendientes`} value={pendingOrders} sub={pendingOrders>0?"¡Atención!":""} color={pendingOrders>0?T.amber:T.mid} onClick={()=>onNav("delivery")}/>
      <StatCard icon="💰" label="Ingresos hoy" value={fmtCOP(todayRev)} color={T.green}/>
      <StatCard icon="👁️" label={`Vistas ${vl.catalog.toLowerCase()}`} value={products.reduce((s,p)=>s+p.clicks,0)} sub="↑ Esta semana" color={T.blue}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card style={{minWidth:0,overflow:"hidden"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>📈 Vistas esta semana</div>
        <div style={{width:"100%",height:140}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ANALYTICS_WEEK} margin={{top:5,right:5,left:-25,bottom:0}}>
              <defs><linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.coral} stopOpacity={.2}/><stop offset="95%" stopColor={T.coral} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="d" tick={{fontSize:10,fill:T.light}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:8,border:`1px solid ${T.border}`,fontSize:11}}/>
              <Area type="monotone" dataKey="v" stroke={T.coral} fill="url(#gV)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card style={{minWidth:0,overflow:"hidden"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:12}}>⭐ Top productos</div>
        {[...products].sort((a,b)=>b.clicks-a.clicks).slice(0,5).map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:15,width:20,textAlign:"center",flexShrink:0}}>{p.emoji}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
              <div style={{width:`${Math.round((p.clicks/products[0]?.clicks)*100)}%`,height:4,background:T.coral,borderRadius:4,marginTop:3}}/>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:T.mid,flexShrink:0}}>{p.clicks}</span>
          </div>
        ))}
      </Card>
    </div>
  </div>;
}
