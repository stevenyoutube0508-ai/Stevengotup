import {T} from "../../constants/theme";

export function Field({label,value,onChange,placeholder,type="text",textarea,rows=3,hint,required,prefix,suffix}){
  const s={width:"100%",boxSizing:"border-box",padding:`10px ${suffix?36:14}px 10px ${prefix?36:14}px`,background:T.white,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",resize:textarea?"vertical":undefined,transition:"border-color .2s",boxShadow:"0 1px 2px rgba(0,0,0,.03)"};
  return <div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:5,letterSpacing:".4px",textTransform:"uppercase"}}>{label}{required&&<span style={{color:T.coral}}> *</span>}</label>}
    <div style={{position:"relative"}}>
      {prefix&&<span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.light,pointerEvents:"none"}}>{prefix}</span>}
      {textarea?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s} onFocus={e=>e.target.style.borderColor=T.coral} onBlur={e=>e.target.style.borderColor=T.border}/>}
      {suffix&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:12,color:T.mid,pointerEvents:"none"}}>{suffix}</span>}
    </div>
    {hint&&<p style={{fontSize:11,color:T.light,marginTop:3}}>{hint}</p>}
  </div>;
}
