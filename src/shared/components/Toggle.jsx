import {T} from "../../constants/theme";

export function Toggle({value,onChange,label,sm}){
  return <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>onChange(!value)}>
    <div style={{width:sm?36:44,height:sm?20:24,borderRadius:sm?10:12,background:value?T.coral:T.border,position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{position:"absolute",top:sm?2:3,left:value?(sm?18:22):3,width:sm?16:18,height:sm?16:18,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.15)"}}/>
    </div>
    {label&&<span style={{fontSize:13,color:T.text,fontWeight:value?700:400,userSelect:"none"}}>{label}</span>}
  </div>;
}
