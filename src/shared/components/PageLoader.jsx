import { T, STYLES } from "../../constants/theme";

export function PageLoader({ label = "Cargando…", full = true }){
  return <div style={{minHeight: full ? "100vh" : "240px", display:"flex", alignItems:"center", justifyContent:"center", background: full ? T.bg : "transparent", flexDirection:"column", gap:12}}>
    <style>{STYLES}</style>
    <div style={{width:36,height:36,borderRadius:"50%",border:`3px solid ${T.border}`,borderTopColor:T.coral,animation:"spin .7s linear infinite"}}/>
    <div style={{color:T.mid,fontSize:14,fontWeight:600}}>{label}</div>
  </div>;
}
