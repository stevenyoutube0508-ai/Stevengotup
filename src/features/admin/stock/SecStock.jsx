import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T, CM, STYLES } from "../../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../../constants/seed";
import { VERTICALS, getVertical } from "../../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../../utils/format";
import { pointInPoly } from "../../../utils/geo";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../../shared/components";

export function SecStock({products,onUpdate}){
  const out=products.filter(p=>!p.stock);
  return <div style={{animation:"fadeUp .35s ease"}}>
    <h2 style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Fuera de stock</h2>
    <p style={{color:T.mid,fontSize:13,marginBottom:20}}>Gestiona la disponibilidad rápidamente</p>
    {out.length===0&&<Card style={{textAlign:"center",padding:"44px 20px",marginBottom:20}}><div style={{fontSize:44,marginBottom:8}}>✅</div><div style={{fontWeight:700,color:T.text}}>Todos los productos disponibles</div></Card>}
    {out.map(p=>(
      <Card key={p.id} style={{padding:"12px 16px",marginBottom:8,borderLeft:`3px solid ${T.red}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:10,overflow:"hidden",flexShrink:0,background:T.bg}}>{p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:18}}>{p.emoji}</span>}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,color:T.text}}>{p.name}</div><div style={{fontSize:11,color:T.mid}}>{fmtCOP(p.price)}</div></div>
          <Tag color={T.red}>Agotado</Tag>
          <Btn sm v="success" onClick={()=>onUpdate(p.id,{stock:true})}>✓ Disponible</Btn>
        </div>
      </Card>
    ))}
    <div style={{marginTop:20}}>
      <div style={{fontSize:12,fontWeight:700,color:T.mid,marginBottom:10,textTransform:"uppercase",letterSpacing:".5px"}}>Toggle rápido de stock</div>
      {products.filter(p=>p.stock&&p.active).map(p=>(
        <Card key={p.id} style={{padding:"10px 16px",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:9,overflow:"hidden",flexShrink:0,background:T.bg}}>{p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:16}}>{p.emoji}</span>}</div>
            <div style={{flex:1,fontSize:13,fontWeight:600,color:T.text}}>{p.name}</div>
            <Toggle value={p.stock} onChange={v=>onUpdate(p.id,{stock:v})} sm/>
          </div>
        </Card>
      ))}
    </div>
  </div>;
}

/* ─── ADMIN: DISEÑO ───────────────────────────────────────── */
