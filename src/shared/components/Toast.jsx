import { T } from "../../constants/theme";

export function Toast({msg,type="ok"}){
  return <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:99999,background:type==="err"?T.red:type==="warn"?T.amber:T.green,color:"#fff",borderRadius:20,padding:"10px 22px",fontSize:12,fontWeight:700,boxShadow:T.shMd,whiteSpace:"nowrap",animation:"fadeIn .25s ease",display:"flex",alignItems:"center",gap:7}}>
    {type==="ok"?"✓":type==="warn"?"⚠":"✕"} {msg}
  </div>;
}
