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

import { BannersAdmin } from "./BannersAdmin.jsx";
import { PromoPopupAdmin } from "./PromoPopupAdmin.jsx";

export function SecBanners({config,onUpdate,vertical,cats}){
  const [banners,setBanners]=useState(config.banners||[]);
  const [promoPopup,setPromoPopup]=useState(config.promoPopup||{active:false,img:"",bgColor:"#7c3aed",title:"",subtitle:"",ctaText:"Ver promoción",linkType:"none",linkCatId:"",linkUrl:"",frequency:"session",delay:20});
  const [saved,setSaved]=useState(false);
  const save=()=>{onUpdate({...config,banners,promoPopup});setSaved(true);setTimeout(()=>setSaved(false),2200);};
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Banners y Popup</h2>
        <p style={{color:T.mid,fontSize:13,marginTop:3}}>Carrusel de banners + popup promocional para el menú del cliente</p>
      </div>
      <Btn onClick={save}>{saved?"✓ ¡Guardado!":"Guardar cambios"}</Btn>
    </div>
    <Card style={{background:T.coralL,border:`1px solid ${T.coral}22`,marginBottom:16,padding:"12px 16px"}}>
      <div style={{fontSize:12,color:T.coral,fontWeight:700,marginBottom:4}}>💡 Guía de imágenes para banners</div>
      <div style={{fontSize:11,color:T.mid,lineHeight:1.7}}>
        • <strong>Banners:</strong> 1200 × 500 px (horizontal) · JPG/PNG · Máx 3MB<br/>
        • <strong>Popup:</strong> 600 × 800 px (vertical/cuadrado) · JPG/PNG · Máx 3MB<br/>
        • <strong>Tip:</strong> Usa fotos de alta calidad {(vertical?.labels?.banner_tip)||"con el producto protagonista centrado y texto corto en la imagen"}
      </div>
    </Card>
    <BannersAdmin banners={banners} onChange={setBanners} primaryColor={config.primaryColor||"#f97316"} cats={cats}/>
    <PromoPopupAdmin popup={promoPopup} onChange={setPromoPopup} cats={cats}/>
    <div style={{marginTop:16}}><Btn full onClick={save} style={{padding:"14px"}}>{saved?"✓ ¡Cambios guardados!":"Guardar cambios"}</Btn></div>
  </div>;
}

/* ─── ADMIN: DELIVERY ─────────────────────────────────────── */
