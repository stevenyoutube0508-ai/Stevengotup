import { useState, useEffect } from "react";
import { T } from "../../constants/theme";
import { Package, Settings, BarChart3, Globe, HardDrive, Mail, CreditCard, AlertTriangle } from "lucide-react";
import { Card, Btn, Field, Toggle } from "../../shared/components";
import { useCEOStore } from "../../stores/useCEOStore";

const DEFAULTS = {
  trialDays:"14", graceDays:"7",
  starterPrice:"49900", proPrice:"99900", businessPrice:"189900",
  supportEmail:"soporte@picku.co",
  maintenanceMode:false, newRegistrations:true,
};

function dbToForm(d) {
  if (!d) return DEFAULTS;
  return {
    trialDays:       String(d.trial_days     ?? 14),
    graceDays:       String(d.grace_days     ?? 7),
    starterPrice:    String(d.starter_price  ?? 49900),
    proPrice:        String(d.pro_price      ?? 99900),
    businessPrice:   String(d.business_price ?? 189900),
    supportEmail:    d.support_email         ?? "soporte@picku.co",
    maintenanceMode: d.maintenance_mode      ?? false,
    newRegistrations:d.new_registrations     ?? true,
  };
}

export function CEOPlataforma(){
  const platformConfig  = useCEOStore(s => s.platformConfig);
  const saveCfgAction   = useCEOStore(s => s.savePlatformConfig);
  const [cfg, setCfg]   = useState(() => dbToForm(platformConfig));
  const [saving, setSaving] = useState(false);

  // Sync when store loads from DB
  useEffect(() => { if (platformConfig) setCfg(dbToForm(platformConfig)); }, [platformConfig]);

  const set = k => v => setCfg(p => ({...p, [k]: v}));

  const save = async () => {
    setSaving(true);
    await saveCfgAction(cfg);
    setSaving(false);
  };

  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Configuración de la plataforma</h2><p style={{color:T.mid,fontSize:13,marginTop:3}}>Ajustes globales de Picku</p></div>
      <Btn onClick={save} disabled={saving}>{saving?"Guardando…":"Guardar cambios"}</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16,display:"flex",alignItems:"center",gap:6}}><Package size={14}/> Precios de planes (COP/mes)</div>
        <Field label="Plan Starter"  value={cfg.starterPrice}  onChange={set("starterPrice")}  type="number" prefix="$"/>
        <Field label="Plan Pro"      value={cfg.proPrice}       onChange={set("proPrice")}       type="number" prefix="$"/>
        <Field label="Plan Business" value={cfg.businessPrice} onChange={set("businessPrice")} type="number" prefix="$"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Días de trial"  value={cfg.trialDays}  onChange={set("trialDays")}  type="number" suffix="días"/>
          <Field label="Días de gracia" value={cfg.graceDays}  onChange={set("graceDays")}  type="number" suffix="días" hint="Antes de suspender"/>
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16,display:"flex",alignItems:"center",gap:6}}><Settings size={14}/> Opciones del sistema</div>
          <Field label="Email de soporte" value={cfg.supportEmail} onChange={set("supportEmail")} type="email"/>
          {[["newRegistrations","Nuevos registros habilitados"],["maintenanceMode","Modo mantenimiento"]].map(([k,l])=>(
            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:13,color:T.text}}>{l}</span>
              <Toggle value={cfg[k]} onChange={v=>setCfg(p=>({...p,[k]:v}))} sm/>
            </div>
          ))}
          {cfg.maintenanceMode&&<div style={{background:T.amberL,border:`1px solid ${T.amber}30`,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,fontWeight:700,marginTop:8,display:"flex",alignItems:"center",gap:6}}><AlertTriangle size={12}/> Restaurantes verán página de mantenimiento</div>}
        </Card>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:14,display:"flex",alignItems:"center",gap:6}}><BarChart3 size={14}/> Estado del sistema</div>
          {[[Globe,"Plataforma","Operativa",T.green],[HardDrive,"Base de datos","Conectada",T.green],[Mail,"Email","Activo",T.green],[CreditCard,"Wompi","Conectado",T.green]].map(([Ic,lb,st,co])=>(
            <div key={lb} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,fontSize:13}}>
              <span style={{color:T.mid,display:"flex",alignItems:"center",gap:6}}><Ic size={13}/> {lb}</span>
              <span style={{fontWeight:700,color:co,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:co,display:"inline-block"}}/>{st}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
    <div style={{marginTop:16}}><Btn full onClick={save} disabled={saving} style={{padding:"14px"}}>{saving?"Guardando…":"Guardar configuración"}</Btn></div>
  </div>;
}

/* ─── PANTALLA DE SUSPENSIÓN ─────────────────────────────── */
