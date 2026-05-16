import {T} from "../../constants/theme";

export function Card({children,style={},p=20,onClick,className}){
  return <div onClick={onClick} className={className} style={{background:T.white,borderRadius:16,border:`1px solid ${T.border}`,boxShadow:T.sh,padding:p,transition:"box-shadow .18s",...style}}>{children}</div>;
}
