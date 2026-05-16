import {useState,useRef} from "react";
import {T} from "../../constants/theme";
import {readFile} from "../../utils/format";

export function PhotoInput({label,value,onChange,height=130,hint,dims}){
  const ref=useRef();
  const [tab,setTab]=useState("url");
  return <div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>{label}</label>}
    {dims&&<div style={{display:"flex",alignItems:"center",gap:6,background:T.coralL,borderRadius:8,padding:"5px 10px",marginBottom:8}}>
      <span style={{fontSize:13}}>📐</span>
      <div>
        <span style={{fontSize:10,fontWeight:800,color:T.coralD}}>{dims.split("•")[0]?.trim()}</span>
        {dims.split("•").slice(1).map((d,i)=><span key={i} style={{fontSize:10,color:T.mid,fontWeight:500}}> · {d.trim()}</span>)}
      </div>
    </div>}
    <div style={{display:"flex",gap:5,marginBottom:8}}>
      {[["url","🔗 URL"],["file","📁 Archivo"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"4px 12px",borderRadius:20,border:`1.5px solid ${tab===k?T.coral:T.border}`,background:tab===k?T.coralL:"transparent",color:tab===k?T.coralD:T.mid,fontSize:11,fontWeight:700}}>{l}</button>)}
      {value&&<button onClick={()=>onChange("")} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:20,border:`1px solid ${T.red}30`,background:T.redL,color:T.red,fontSize:11,fontWeight:700}}>✕ Quitar</button>}
    </div>
    {value&&<div style={{height,borderRadius:10,overflow:"hidden",marginBottom:8,border:`1px solid ${T.border}`}}><img src={value} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/></div>}
    {tab==="url"
      ?<input value={value} onChange={e=>onChange(e.target.value)} placeholder="https://images.unsplash.com/…" style={{width:"100%",boxSizing:"border-box",padding:"9px 13px",background:T.white,border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:12,color:T.text,outline:"none"}} onFocus={e=>e.target.style.borderColor=T.coral} onBlur={e=>e.target.style.borderColor=T.border}/>
      :<div onClick={()=>ref.current?.click()} style={{height:value?44:80,borderRadius:10,border:`2px dashed ${T.border}`,background:T.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.light,fontSize:13,fontWeight:600,gap:8}}>📁 {value?"Cambiar imagen":"Seleccionar imagen"}</div>
    }
    <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files?.[0];if(f)onChange(await readFile(f));}}/>
    {hint&&<p style={{fontSize:11,color:T.light,marginTop:3}}>{hint}</p>}
  </div>;
}
