import { T } from "../../constants/theme";

export function Modal({title,icon,onClose,children,wide,extraWide}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(10,15,30,.45)",backdropFilter:"blur(10px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:extraWide?900:wide?660:480,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 8px 40px rgba(0,0,0,.14)",animation:"scaleIn .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {icon&&<div style={{width:36,height:36,borderRadius:10,background:T.coralL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>}
          <span style={{fontWeight:800,fontSize:17,color:T.text}}>{title}</span>
        </div>
        <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",background:T.bg,border:`1px solid ${T.border}`,color:T.mid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>×</button>
      </div>
      {children}
    </div>
  </div>;
}
