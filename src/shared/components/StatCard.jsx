import { T } from "../../constants/theme";
import { Card } from "./Card.jsx";

export function StatCard({icon,label,value,sub,color=T.coral,onClick}){
  return <Card style={{padding:"18px 20px",cursor:onClick?"pointer":"default"}} onClick={onClick} className={onClick?"hov":""}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:T.light,textTransform:"uppercase",letterSpacing:".6px",marginBottom:6}}>{label}</div>
        <div style={{fontSize:26,fontWeight:900,color:T.text,letterSpacing:"-.5px",lineHeight:1}}>{value}</div>
        {sub&&<div style={{fontSize:11,fontWeight:600,marginTop:5,color:sub.startsWith("↑")?T.green:sub.startsWith("↓")?T.red:T.mid}}>{sub}</div>}
      </div>
      <div style={{width:44,height:44,borderRadius:14,background:color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{icon}</div>
    </div>
  </Card>;
}
