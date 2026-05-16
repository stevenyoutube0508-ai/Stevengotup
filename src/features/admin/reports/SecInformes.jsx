import {T} from "../../../constants/theme";
import {ANALYTICS_WEEK} from "../../../constants/kanban";
import {fmtCOP} from "../../../utils/format";
import {Card,StatCard} from "../../../shared/components";
import {AreaChart,Area,BarChart,Bar,XAxis,Tooltip,ResponsiveContainer} from "recharts";

export function SecInformes({products}){
  return <div style={{animation:"fadeUp .35s ease"}}>
    <h2 style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Informes</h2>
    <p style={{color:T.mid,fontSize:13,marginBottom:20}}>Análisis de desempeño — Abril 2026</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:20}}>
      <StatCard icon="👁️" label="Vistas totales" value="1,391" sub="↑ 18.3%" color={T.coral}/>
      <StatCard icon="📦" label="Pedidos semana" value="246" sub="↑ 8.1%" color={T.green}/>
      <StatCard icon="⏰" label="Hora pico" value="8 PM" sub="98 visitas/h" color={T.amber}/>
      <StatCard icon="💰" label="Ticket promedio" value={fmtCOP(42000)} color={T.blue}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <Card style={{minWidth:0,overflow:"hidden"}}>
        <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:14}}>Vistas por día</div>
        <div style={{width:"100%",height:150}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ANALYTICS_WEEK} margin={{top:5,right:5,left:-25,bottom:0}}>
              <defs><linearGradient id="gA1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.coral} stopOpacity={.25}/><stop offset="95%" stopColor={T.coral} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="d" tick={{fontSize:10,fill:T.light}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:`1px solid ${T.border}`,fontSize:11}}/>
              <Area type="monotone" dataKey="v" stroke={T.coral} fill="url(#gA1)" strokeWidth={2} name="Vistas"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card style={{minWidth:0,overflow:"hidden"}}>
        <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:14}}>Pedidos por día</div>
        <div style={{width:"100%",height:150}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ANALYTICS_WEEK} margin={{top:5,right:5,left:-25,bottom:0}}>
              <XAxis dataKey="d" tick={{fontSize:10,fill:T.light}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:`1px solid ${T.border}`,fontSize:11}} formatter={v=>[v+" pedidos"]}/>
              <Bar dataKey="o" fill={T.green} radius={[5,5,0,0]} name="Pedidos"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
    <Card>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>🧠 Insights con Inteligencia Artificial</div>
      {[
        {icon:"🚀",color:T.coral,tag:"Optimización",text:"Los viernes y sábados generan el 42% de tus ventas semanales. Considera personal extra esos días."},
        {icon:"⭐",color:T.blue,tag:"Producto",text:"Bandeja Paisa tiene 289 vistas pero 0% de domicilios. Agrégala a la carta de delivery para aumentar ingresos."},
        {icon:"💰",color:T.green,tag:"Precio",text:"Tu ticket promedio de $42.000 está 15% por encima del sector. Tus clientes valoran la calidad premium."},
      ].map(ins=>(
        <Card key={ins.tag} style={{marginBottom:10,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{width:46,height:46,borderRadius:12,background:ins.color+"12",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ins.icon}</div>
            <div>
              <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:ins.color+"18",color:ins.color,whiteSpace:"nowrap"}}>{ins.tag}</span>
              <p style={{fontSize:13,color:T.text,lineHeight:1.75,marginTop:6}}>{ins.text}</p>
            </div>
          </div>
        </Card>
      ))}
    </Card>
  </div>;
}
