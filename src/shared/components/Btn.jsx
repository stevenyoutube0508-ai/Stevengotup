import { T } from "../../constants/theme";

export function Btn({children,v="primary",onClick,disabled,full,sm,icon,style:sx={}}){
  const vs={
    primary:{bg:T.coral,c:"#fff",b:"none",sh:`0 2px 10px ${T.coral}40`},
    ceo:{bg:T.navy,c:"#fff",b:"none",sh:`0 2px 8px ${T.navy}40`},
    ghost:{bg:"transparent",c:T.coral,b:`1.5px solid ${T.coral}`,sh:"none"},
    light:{bg:T.coralL,c:T.coralD,b:"none",sh:"none"},
    danger:{bg:T.redL,c:T.red,b:`1px solid ${T.red}30`,sh:"none"},
    success:{bg:T.greenL,c:T.green,b:`1px solid ${T.green}30`,sh:"none"},
    neutral:{bg:T.bg,c:T.mid,b:`1px solid ${T.border}`,sh:"none"},
    amber:{bg:T.amberL,c:T.amber,b:`1px solid ${T.amber}30`,sh:"none"},
    green:{bg:T.green,c:"#fff",b:"none",sh:`0 2px 8px ${T.green}40`},
    dark:{bg:T.navy,c:"#fff",b:"none",sh:"none"},
  };
  const vt=vs[v]||vs.primary;
  const isComp = icon && (typeof icon === "function" || typeof icon.render === "function");
  const IconComp = isComp ? icon : null;
  return <button onClick={disabled?undefined:onClick} disabled={disabled} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,background:vt.bg,color:vt.c,border:vt.b,boxShadow:vt.sh,borderRadius:10,padding:sm?"6px 14px":"10px 22px",fontWeight:700,fontSize:sm?12:13,fontFamily:"'Plus Jakarta Sans',sans-serif",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.45:1,width:full?"100%":"auto",transition:"all .15s",...sx}}>
    {icon&&(IconComp?<IconComp size={sm?13:15}/>:<span style={{fontSize:sm?13:15}}>{icon}</span>)}{children}
  </button>;
}
