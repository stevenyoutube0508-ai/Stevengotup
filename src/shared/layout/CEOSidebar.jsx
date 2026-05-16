import {T} from "../../constants/theme";

const CEO_NAV = [
  {id:"ceo_dash",label:"Dashboard",icon:"📊"},
  {id:"ceo_restaurantes",label:"Restaurantes",icon:"🏪"},
  {id:"ceo_onboarding",label:"Nuevo restaurante",icon:"➕"},
  {id:"ceo_pagos",label:"Pagos",icon:"💰"},
  {id:"ceo_soporte",label:"Soporte",icon:"🎫"},
  {id:"ceo_plataforma",label:"Configuración",icon:"⚙️"},
];

export function CEOSidebar({active,onSelect,restaurants,tickets,onLogout,user,pendingPayments}){
  const suspended=restaurants.filter(r=>r.status==="suspended").length;
  const openT=tickets.filter(t=>t.status==="open").length;
  return <nav style={{width:230,background:T.white,borderRight:`1px solid ${T.border}`,minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0}}>
    <div style={{padding:"20px 16px 14px",borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}>
        <div style={{width:38,height:38,borderRadius:12,background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="24" height="24" viewBox="0 0 38 38" fill="none">
            <rect x="7" y="6" width="10" height="26" rx="5" fill="white"/>
            <rect x="21" y="6" width="10" height="14" rx="5" fill={T.coral}/>
            <rect x="21" y="24" width="10" height="8" rx="4" fill={T.coral} opacity=".6"/>
          </svg>
        </div>
        <div>
          <div style={{color:T.navy,fontWeight:900,fontSize:18,letterSpacing:"-.3px"}}>Pick<span style={{color:T.coral}}>u</span></div>
          <div style={{color:T.light,fontSize:9,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase"}}>CEO Panel</div>
        </div>
      </div>
      {(suspended>0||openT>0)&&<div style={{marginTop:8,background:T.redL,border:`1px solid ${T.red}20`,borderRadius:8,padding:"6px 10px"}}>
        {suspended>0&&<div style={{fontSize:10,fontWeight:700,color:T.red}}>⚠ {suspended} restaurante{suspended>1?"s":""} suspendido{suspended>1?"s":""}</div>}
        {openT>0&&<div style={{fontSize:10,fontWeight:700,color:T.amber,marginTop:suspended>0?2:0}}>🎫 {openT} ticket{openT>1?"s":""} abierto{openT>1?"s":""}</div>}
      </div>}
    </div>
    <div style={{flex:1,padding:"12px 8px",overflowY:"auto"}}>
      {CEO_NAV.map(item=>{
        const badge=(item.id==="ceo_soporte"&&openT>0)?openT:(item.id==="ceo_restaurantes"&&suspended>0)?suspended:(item.id==="ceo_pagos"&&pendingPayments>0)?pendingPayments:0;
        const isActive=active===item.id;
        return <div key={item.id} onClick={()=>onSelect(item.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,cursor:"pointer",background:isActive?T.coralL:"transparent",marginBottom:2,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=isActive?T.coralL:T.bg} onMouseLeave={e=>e.currentTarget.style.background=isActive?T.coralL:"transparent"}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>{item.icon}</span>
            <span style={{fontSize:13,fontWeight:isActive?700:500,color:isActive?T.coralD:T.mid}}>{item.label}</span>
          </div>
          {badge>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:item.id==="ceo_soporte"?T.amber:item.id==="ceo_pagos"?T.green:T.red,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{badge}</span>}
        </div>;
      })}
    </div>
    <div style={{padding:"14px 16px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${T.coral},${T.coralD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{user.avatar}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:T.text,fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
        <div style={{color:T.light,fontSize:9}}>CEO & Fundador</div>
      </div>
      <button onClick={onLogout} style={{background:T.redL,border:"none",borderRadius:7,color:T.red,fontSize:11,padding:"4px 7px",cursor:"pointer"}}>⏻</button>
    </div>
  </nav>;
}
