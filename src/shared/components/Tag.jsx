import { T } from "../../constants/theme";

export function Tag({children,color=T.coral,sm}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:sm?9:10,fontWeight:700,padding:sm?"2px 7px":"3px 9px",borderRadius:20,background:color+"18",color,whiteSpace:"nowrap"}}>{children}</span>;
}
