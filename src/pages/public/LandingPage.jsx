import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Check, Star, Zap, Globe, BarChart3, Layers, Cpu,
  MapPin, QrCode, ChevronRight, Play, ShoppingBag, Truck, Palette,
  Shield, Clock, Users, Menu, X, Sparkles, TrendingUp, Store,
  Calendar,
} from "lucide-react";
import { LogoFull } from "../../shared/components/Logo";

/* ─── TOKENS ──────────────────────────────────────────────────── */
const C = {
  navy:    "#fff8f4",
  navyM:   "#ffffff",
  navyS:   "#f1f5f9",

  coral:   "#ef5350",
  coralD:  "#dc3f3f",
  coralL:  "#fff1ef",

  violet:  "#8b5cf6",
  violetL: "#f3edff",

  white:   "#ffffff",
  off:     "#f8fafc",
  border:  "#e8edf3",

  text:    "#101828",
  mid:     "#667085",
  light:   "#98a2b3",

  green:   "#159a63",
  greenL:  "#ecfdf3",

  amber:   "#d97706",
  blue:    "#377dff",
  blueL:   "#eff6ff",

  pink:    "#cc3377",
};

const fmtCOP = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);

/* ─── HOOK: INTERSECTION OBSERVER ────────────────────────────── */
function useVisible(threshold = 0.15){
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(()=>{
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVisible(true); },{threshold});
    if(ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[threshold]);
  return [ref, visible];
}

/* ─── DATA ────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: QrCode,      color: C.coral,   title: "Catálogo QR Digital",        desc: "Comparte tu menú con un QR. Tus clientes lo abren en segundos, sin apps ni descargas." },
  { icon: Truck,       color: C.violet,  title: "Gestión de pedidos",          desc: "Kanban en tiempo real. Acepta, prepara y entrega cada pedido con un clic. Cero llamadas." },
  { icon: Palette,     color: C.amber,   title: "Diseño personalizable",       desc: "Elige colores, banners y estilos que reflejen tu marca. Sin diseñador, sin código." },
  { icon: MapPin,      color: C.green,   title: "Zonas de cobertura",          desc: "Dibuja tus zonas de domicilio en el mapa y define precios por distancia automáticamente." },
  { icon: Cpu,         color: C.blue,    title: "Asistente IA integrado",      desc: "Genera descripciones irresistibles, analiza ventas y sugiere mejoras para tu negocio." },
  { icon: BarChart3,   color: C.pink,    title: "Informes y analytics",        desc: "Ventas por día, productos más pedidos, pico de horas. Decide con datos reales." },
];

const VERTICALS = [
  { icon:"/icons/restaurantes.svg", name:"Restaurantes",       color:"#f97316" },
  { icon:"/icons/moda.svg",         name:"Moda & Ropa",        color:"#ec4899" },
  { icon:"/icons/mercado.svg",      name:"Tiendas & Supermer", color:"#059669" },
  { icon:"/icons/cosmeticos.svg",   name:"Belleza & Salud",    color:"#db2777" },
  { icon:"/icons/phone.svg",        name:"Tecnología",         color:"#2563eb" },
  { icon:"/icons/mascotas.svg",     name:"Mascotas",           color:"#d97706" },
  { icon:"/icons/ferreteria.svg",   name:"Ferretería",         color:"#d97706" },
  { icon:"/icons/jugueteria.svg",   name:"Juguetería",         color:"#8b5cf6" },
  { icon:"/icons/business.svg",     name:"Servicios Prof.",    color:"#4338ca" },
];

const PLANS = [
  {
    id:"core", name:"Picku Core", priceCOP:"$99.900", priceCAD:"$49 USD",
    color:C.blue,
    desc:"Todo lo que necesita tu negocio para empezar a vender digital.",
    features:[
      "Catálogo digital con QR",
      "Pedidos y reservas online",
      "Panel administrador",
      "Pickup y delivery básico",
      "Analytics básico",
      "Soporte estándar",
    ],
  },
  {
    id:"smart", name:"Picku Smart", priceCOP:"$199.900", priceCAD:"$129 USD",
    color:C.violet, popular:true,
    desc:"Automatización, IA y campañas para escalar tu negocio.",
    features:[
      "Todo lo de Core",
      "WhatsApp automático",
      "Bot IA + agente entrenado",
      "Recuperación de pedidos abandonados",
      "Recordatorios automáticos",
      "Campañas básicas",
      "Analytics avanzado",
      "Soporte prioritario",
    ],
  },
  {
    id:"custom", name:"Custom", custom:true, color:C.pink,
    desc:"Para empresas que necesitan una solución personalizada a su medida.",
    features:[
      "Todo lo de Smart",
      "Multi-sucursal ilimitada",
      "Integraciones a medida",
      "Manager dedicado",
      "Onboarding personalizado",
      "SLA y soporte premium",
    ],
  },
];

const TESTIMONIALS = [
  {
    name:"Carlos Mejía", role:"Propietario · La Leña, Cali", avatar:"👨‍🍳", stars:5,
    text:"Antes tomábamos pedidos por WhatsApp y era un caos. Con Picku tenemos el kanban en tiempo real y los domicilios fluyen solos. Subimos un 35% en pedidos el primer mes.",
  },
  {
    name:"Ana Torres", role:"Fundadora · Bufalo Ribs Co, Bogotá", avatar:"👩‍💼", stars:5,
    text:"Tenemos 4 sucursales y Picku nos permite gestionarlas desde un solo panel. El catálogo por QR fue un hit con los clientes. Nuestro equipo aprendió a usarlo en una tarde.",
  },
  {
    name:"Diego Park", role:"Chef & Dueño · Sushi Nakama, Medellín", avatar:"👨", stars:5,
    text:"El asistente IA me escribió todas las descripciones del menú en minutos. Los reportes de productos más pedidos me ayudaron a rediseñar la carta. Increíble herramienta.",
  },
];

const STEPS = [
  { n:"01", icon:Store,    title:"Crea tu cuenta",          desc:"Regístrate en 2 minutos. Sin tarjeta requerida. Elige el tipo de negocio y empieza el trial." },
  { n:"02", icon:Palette,  title:"Configura tu catálogo",   desc:"Sube tus productos, personaliza colores y añade tu logo. El asistente IA te ayuda en cada paso." },
  { n:"03", icon:QrCode,   title:"Comparte y vende",         desc:"Genera tu QR, ponlo en las mesas o redes sociales. Recibe pedidos y gestiona todo en tiempo real." },
];

const LOGOS = ["La Leña","Bufalo Ribs","Sushi Nakama","El Corral","Crepes & Co","Tacos El Rancho","PizzaCo","Baguetería París"];

/* ─── COMPONENTS ──────────────────────────────────────────────── */

function Chip({ children, color = C.coral }){
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px",
      borderRadius:20, background:`${color}18`, border:`1px solid ${color}30`,
      color, fontSize:11, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase",
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:color,animation:"pulse2 2s infinite"}}/>
      {children}
    </span>
  );
}

function FeatureCard({ item, visible, delay = 0 }){
  const Icon = item.icon;
  return (
    <div style={{
      background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"28px 24px",
      opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)",
      transition:`opacity .5s ${delay}s, transform .5s ${delay}s`,
      display:"flex", flexDirection:"column", gap:14,
    }}>
      <div style={{
        width:44, height:44, borderRadius:12, background:`${item.color}14`,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <Icon size={20} color={item.color}/>
      </div>
      <div>
        <div style={{fontSize:15, fontWeight:700, color:C.text, marginBottom:6}}>{item.title}</div>
        <div style={{fontSize:13, color:C.mid, lineHeight:1.65}}>{item.desc}</div>
      </div>
    </div>
  );
}

function PlanCard({ plan, visible, delay = 0 }){
  const navigate = useNavigate();
  return (
    <div style={{
      background: plan.popular ? `linear-gradient(180deg,${C.white},${C.navy})` : C.white,
      border: plan.popular ? `1.5px solid ${C.coral}35` : `1px solid ${C.border}`,
      borderRadius:20, padding:"32px 28px", position:"relative", flex:1, minWidth:0,
      opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)",
      transition:`opacity .5s ${delay}s, transform .5s ${delay}s`,
      display:"flex", flexDirection:"column", gap:0,
    }}>
      {plan.popular && (
        <div style={{
          position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)",
          background:`linear-gradient(90deg,${C.coral},${C.violet})`,
          color:C.white, fontSize:10, fontWeight:800, letterSpacing:"1px",
          padding:"4px 14px", borderRadius:20, whiteSpace:"nowrap",
          textTransform:"uppercase",
        }}>
          ⭐ Más popular
        </div>
      )}
      <div style={{marginBottom:8}}>
        <span style={{fontSize:11,fontWeight:800,letterSpacing:"1px",textTransform:"uppercase",color:plan.color}}>{plan.name}</span>
      </div>

      {/* Price block */}
      {plan.custom ? (
        <div style={{marginBottom:8}}>
          <span style={{fontSize:32, fontWeight:800, color:C.text, lineHeight:1}}>A medida</span>
        </div>
      ) : (
        <div style={{marginBottom:4}}>
          <div style={{display:"flex", alignItems:"baseline", gap:4}}>
            <span style={{fontSize:22, fontWeight:800, color:C.text, lineHeight:1}}>{plan.priceCOP}</span>
            <span style={{fontSize:11,color:C.light}}>/sucursal/mes</span>
          </div>
          <div style={{fontSize:11, color:C.light, marginTop:3}}>{plan.priceCAD} / sucursal / mes</div>
        </div>
      )}

      <div style={{fontSize:13, color:C.mid, marginBottom:24, marginTop:10, lineHeight:1.5}}>{plan.desc}</div>
      <div style={{flex:1, display:"flex", flexDirection:"column", gap:10, marginBottom:28}}>
        {plan.features.map(f=>(
          <div key={f} style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:`${plan.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Check size={10} color={plan.color} strokeWidth={3}/>
            </div>
            <span style={{fontSize:13, color:C.mid}}>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={()=> plan.custom ? window.open("mailto:hola@picku.co","_blank") : navigate("/login")}
        style={{
          width:"100%", padding:"13px 0", borderRadius:12, fontWeight:700, fontSize:14,
          cursor:"pointer", border: plan.custom ? `1.5px solid ${plan.color}` : "none",
          fontFamily:"'Plus Jakarta Sans',sans-serif",
          background: plan.popular ? `linear-gradient(135deg,${C.coral},${C.violet})` : plan.custom ? "transparent" : `${plan.color}12`,
          color: plan.popular ? C.white : plan.color,
          transition:"transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 24px ${plan.color}40`; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
      >
        {plan.custom ? "Contáctanos →" : `Empezar con ${plan.name} →`}
      </button>
    </div>
  );
}

/* ─── PRODUCT MOCKUP ──────────────────────────────────────────── */
function ProductMockup(){
  return (
    <div style={{
      background:C.white, borderRadius:20, padding:20, width:"100%", maxWidth:540,
      boxShadow:"0 32px 80px rgba(15,23,42,0.10)", border:`1px solid ${C.border}`,
      fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      {/* Window chrome */}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:"#ff5f57"}}/>
        <div style={{width:10,height:10,borderRadius:"50%",background:"#febc2e"}}/>
        <div style={{width:10,height:10,borderRadius:"50%",background:"#28c840"}}/>
        <div style={{flex:1,height:22,borderRadius:6,background:C.off,marginLeft:8,display:"flex",alignItems:"center",padding:"0 10px",border:`1px solid ${C.border}`}}>
          <span style={{fontSize:10,color:C.light}}>app.picku.co/admin/delivery</span>
        </div>
      </div>
      {/* App layout */}
      <div style={{display:"flex",gap:12,height:280}}>
        {/* Sidebar */}
        <div style={{width:44,background:C.off,borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0",gap:8,border:`1px solid ${C.border}`}}>
          {["🏠","🍽️","🛵","🎨","📊","⚙️"].map((ico,i)=>(
            <div key={i} style={{width:28,height:28,borderRadius:7,background:i===2?`${C.coral}18`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{ico}</div>
          ))}
        </div>
        {/* Main content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,fontWeight:700,color:C.text}}>🛵 Pedidos del día</span>
            <div style={{background:"rgba(255,77,76,0.2)",borderRadius:6,padding:"3px 8px",fontSize:9,fontWeight:700,color:C.coral}}>EN VIVO</div>
          </div>
          {/* Kanban columns */}
          <div style={{display:"flex",gap:8,flex:1}}>
            {[
              {label:"Nuevos", color:"#2563eb", items:["🍔 Bandeja x2","🥤 Limonada"]},
              {label:"En prep.", color:"#d97706", items:["🍖 Costillas","🌮 Tacos x3"]},
              {label:"Listo", color:"#059669", items:["🍣 Sushi Roll"]},
            ].map((col,ci)=>(
              <div key={ci} style={{flex:1,background:C.off,borderRadius:8,padding:8,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:9,fontWeight:800,color:col.color,marginBottom:6,letterSpacing:"0.5px",textTransform:"uppercase"}}>{col.label}</div>
                {col.items.map((item,ii)=>(
                  <div key={ii} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 8px",marginBottom:5,fontSize:10,color:C.mid,fontWeight:700}}>{item}</div>
                ))}
              </div>
            ))}
          </div>
          {/* Stats row */}
          <div style={{display:"flex",gap:6,marginTop:4}}>
            {[{l:"Pedidos hoy",v:"47",c:"#059669"},{l:"MRR",v:"$99.9K",c:"#6d28d9"},{l:"Productos",v:"32",c:"#ff4d4c"}].map((s,i)=>(
              <div key={i} style={{flex:1,background:C.off,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 8px"}}>
                <div style={{fontSize:14,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:9,color:C.light,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CATALOG MOCKUP (customer side) ─────────────────────────── */
function CatalogMockup(){
  return (
    <div style={{
      background:"#fff", borderRadius:20, overflow:"hidden", width:220,
      boxShadow:"0 24px 60px rgba(0,0,0,0.15)", border:`1px solid ${C.border}`,
      fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.coralL || "#fff1ef"},#ffffff)`,padding:"16px 14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"#ff4d4c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔥</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.text}}>La Leña</div>
            <div style={{fontSize:9,color:C.green}}>● Abierto ahora</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {["🍽️ Carta","🛵 Delivery","📍 Local"].map((t,i)=>(
            <div key={i} style={{padding:"3px 7px",borderRadius:12,background:i===0?`${C.coral}18`:C.off,fontSize:8,color:i===0?C.coral:C.mid,fontWeight:700,border:`1px solid ${i===0?`${C.coral}28`:C.border}`}}>{t}</div>
          ))}
        </div>
      </div>
      {/* Categories */}
      <div style={{display:"flex",gap:5,padding:"10px 12px 0",overflowX:"hidden"}}>
        {["🔥 Top","🥗 Entradas","🍖 Platos"].map((c,i)=>(
          <div key={i} style={{padding:"4px 9px",borderRadius:12,background:i===0?"#ff4d4c":"#f3f4f6",fontSize:9,color:i===0?"#fff":"#6b7280",fontWeight:600,whiteSpace:"nowrap"}}>{c}</div>
        ))}
      </div>
      {/* Products */}
      <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",gap:8}}>
        {[
          {name:"Bandeja Paisa",price:"$38.000",img:"🍛",label:"Lo más pedido",lc:"#f97316"},
          {name:"Costillas BBQ",price:"$48.000",img:"🍖",label:"Chef recomienda",lc:"#8b5cf6"},
          {name:"Lomo al Trapo",price:"$52.000",img:"🥩",label:"Especial",lc:"#059669"},
        ].map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"#f9fafb",borderRadius:10,padding:"8px 10px"}}>
            <div style={{fontSize:22,lineHeight:1}}>{p.img}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,fontWeight:700,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
              <span style={{fontSize:8,background:`${p.lc}20`,color:p.lc,borderRadius:4,padding:"1px 5px",fontWeight:700}}>{p.label}</span>
            </div>
            <div style={{fontSize:10,fontWeight:800,color:"#111",whiteSpace:"nowrap"}}>{p.price}</div>
          </div>
        ))}
      </div>
      {/* CTA */}
      <div style={{padding:"8px 12px 12px"}}>
        <div style={{background:"#ff4d4c",borderRadius:10,padding:"9px 0",textAlign:"center",fontSize:10,fontWeight:800,color:"#fff"}}>
          🛒 Ver carta completa
        </div>
      </div>
    </div>
  );
}

/* ─── NAV ──────────────────────────────────────────────────────── */
function Nav({ scrolled }){
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = [{l:"Características",h:"#features"},{l:"Precios",h:"#pricing"},{l:"Testimonios",h:"#testimonios"}];

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? "rgba(255, 255, 255, 0.46)" : "rgba(255,255,255,0.36)",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      transition:"background .3s, border-color .3s",
      padding:"0 24px",
    }}>
      <div style={{maxWidth:1140,margin:"0 auto",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer"}} onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>
          <LogoFull width={300} height={50} color={C.text}/>
        </div>
        {/* Desktop links */}
        <div style={{display:"flex",alignItems:"center",gap:32}} className="hide-mobile">
          {links.map(({l,h})=>(
            <a key={h} href={h} style={{fontSize:13,fontWeight:500,color:C.mid,textDecoration:"none",transition:"color .15s"}}
              onMouseEnter={e=>e.target.style.color=C.text}
              onMouseLeave={e=>e.target.style.color=C.mid}
            >{l}</a>
          ))}
        </div>
        {/* CTAs */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button
            onClick={()=>navigate("/login")}
            style={{background:C.white,border:`1px solid ${C.border}`,color:C.mid,padding:"8px 18px",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"border-color .15s, color .15s"}}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.coral; e.currentTarget.style.color=C.text; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.mid; }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={()=>navigate("/login")}
            style={{background:"linear-gradient(135deg,#ff4d4c,#e03c3b)",color:"#fff",border:"none",padding:"8px 20px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"transform .15s, box-shadow .15s"}}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(255,77,76,0.4)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
          >
            Empezar gratis
          </button>
          {/* Mobile hamburger */}
          <button onClick={()=>setOpen(o=>!o)} className="show-mobile" style={{background:"transparent",border:"none",color:C.text,cursor:"pointer",padding:4,display:"none"}}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div style={{background:C.white,borderTop:`1px solid ${C.border}`,padding:"16px 24px 24px",boxShadow:"0 20px 40px rgba(15,23,42,.08)"}}>
          {links.map(({l,h})=>(
            <a key={h} href={h} onClick={()=>setOpen(false)} style={{display:"block",padding:"12px 0",fontSize:15,fontWeight:500,color:C.text,textDecoration:"none",borderBottom:`1px solid ${C.border}`}}>{l}</a>
          ))}
          <button onClick={()=>navigate("/login")} style={{marginTop:16,width:"100%",padding:"13px 0",borderRadius:12,background:"linear-gradient(135deg,#ff4d4c,#6d28d9)",color:"#fff",border:"none",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            Empezar gratis →
          </button>
        </div>
      )}
    </nav>
  );
}

/* ─── MAIN LANDING ─────────────────────────────────────────────── */
export default function LandingPage(){
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener
  useEffect(()=>{
    const h = ()=>setScrolled(window.scrollY > 40);
    window.addEventListener("scroll",h);
    return ()=>window.removeEventListener("scroll",h);
  },[]);

  // Intersection refs
  const [featRef,   featVis]   = useVisible();
  const [planRef,   planVis]   = useVisible();
  const [testRef,   testVis]   = useVisible();
  const [stepRef,   stepVis]   = useVisible();
  const [vertRef,   vertVis]   = useVisible();

  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(()=>{
    const h = ()=>setShowFloatingButton(window.scrollY > 300);
    window.addEventListener("scroll",h);
    return ()=>window.removeEventListener("scroll",h);
  },[]);

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",overflowX:"hidden",background:C.off}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .gradient-text{
          background:linear-gradient(135deg,#ff4d4c 0%,#ff8a4c 40%,#a855f7 80%,#6d28d9 100%);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 4s linear infinite;
        }
        .hero-orb{
          position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;
        }
        .hide-mobile{}
        .show-mobile{display:none!important}
        @media(max-width:768px){
          .hide-mobile{display:none!important}
          .show-mobile{display:flex!important}
          .hero-cols{flex-direction:column!important;text-align:center!important}
          .hero-btns{justify-content:center!important}
          .features-grid{grid-template-columns:1fr 1fr!important}
          .plans-row{flex-direction:column!important}
          .steps-row{flex-direction:column!important}
          .test-grid{grid-template-columns:1fr!important}
          .vert-grid{grid-template-columns:repeat(3,1fr)!important}
        }
        @media(max-width:480px){
          .features-grid{grid-template-columns:1fr!important}
          .vert-grid{grid-template-columns:repeat(2,1fr)!important}
        }
        a{color:inherit;text-decoration:none}
        button{font-family:'Plus Jakarta Sans',sans-serif}
      `}</style>

      <Nav scrolled={scrolled} />

      {showFloatingButton && (
        <button
          onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
          style={{
            position:"fixed",
            bottom:24,
            right:24,
            width:48,
            height:48,
            borderRadius:"50%",
            background:"rgba(255, 255, 255, 0.46)",
            backdropFilter:"blur(12px)",
            border:`1px solid ${C.border}`,
            cursor:"pointer",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            zIndex:99,
            transition:"all .3s ease",
            boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.background="rgba(255, 255, 255, 0.56)";
            e.currentTarget.style.transform="translateY(-4px)";
            e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.background="rgba(255, 255, 255, 0.46)";
            e.currentTarget.style.transform="translateY(0)";
            e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.1)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:C.text}}>
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      )}

     {/* ── HERO ──────────────────────────────────────────────── */}
<section
  style={{
    background:
      "radial-gradient(circle at 46% -12%, rgba(236,72,153,.26) 0%, rgba(236,72,153,.14) 22%, transparent 42%), radial-gradient(circle at 82% 16%, rgba(255,77,76,.13) 0%, transparent 34%), linear-gradient(180deg,#fff7f3 0%,#ffffff 48%,#f8fafc 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    padding: "120px 24px 84px",
  }}
>
  {/* Orbs claros */}
  <div
    className="hero-orb"
    style={{
      width: 480,
      height: 480,
      background: "rgba(255,77,76,0.12)",
      top: -140,
      right: -120,
    }}
  />

  <div
    className="hero-orb"
    style={{
      width: 420,
      height: 420,
      background: "rgba(139,92,246,0.10)",
      bottom: -160,
      left: -90,
    }}
  />

  <div
    className="hero-orb"
    style={{
      width: 260,
      height: 260,
      background: "rgba(236,72,153,0.10)",
      top: "30%",
      left: "34%",
    }}
  />

  <div
    style={{
      maxWidth: 1280,
      margin: "0 auto",
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 64,
      position: "relative",
      zIndex: 1,
    }}
    className="hero-cols"
  >
    {/* Text */}
    <div
      style={{
        flex: 1,
        minWidth: 0,
        animation: "fadeUp .7s ease both",
      }}
    >
     

      <h1
        style={{
          fontSize: "clamp(42px,6vw,76px)",
          fontWeight: 950,
          lineHeight: 1.04,
          letterSpacing: "-3px",
          marginBottom: 22,
          color: C.text,
        }}
      >
        <span style={{ color: C.text }}>Tu negocio,</span>
        <br />
        <span className="gradient-text">digital en minutos.</span>
      </h1>

      <p
        style={{
          fontSize: "clamp(16px,1.8vw,19px)",
          color: C.mid,
          lineHeight: 1.75,
          marginBottom: 34,
          maxWidth: 520,
          fontWeight: 500,
        }}
      >
        Crea tu catálogo digital, gestiona pedidos en tiempo real y crece tu
        negocio desde un solo panel. Sin apps, sin complicaciones.
      </p>

      {/* Social proof */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 34,
        }}
      >
        <div style={{ display: "flex" }}>
          {["👨‍🍳", "👩‍💼", "👨", "👩‍🍳", "👨‍💻"].map((a, i) => (
            <div
              key={i}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: `hsl(${i * 40},60%,50%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                border: `2px solid ${C.white}`,
                marginLeft: i > 0 ? -8 : 0,
                boxShadow: "0 8px 18px rgba(15,23,42,.10)",
              }}
            >
              {a}
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: "flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={12} color="#f59e0b" fill="#f59e0b" />
            ))}
          </div>

          <div
            style={{
              fontSize: 12,
              color: C.mid,
              marginTop: 3,
              fontWeight: 600,
            }}
          >
            +200 negocios en Colombia
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
        className="hero-btns"
      >
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            background: `linear-gradient(135deg,${C.coral},#e0352e)`,
            color: C.white,
            border: "none",
            padding: "15px 30px",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "transform .15s, box-shadow .15s",
            boxShadow: "0 12px 28px rgba(255,77,76,0.28)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 16px 34px rgba(255,77,76,0.36)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow =
              "0 12px 28px rgba(255,77,76,0.28)";
          }}
        >
          Empezar gratis <ArrowRight size={16} />
        </button>

        <a
          href="#features"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: C.text,
            fontSize: 15,
            fontWeight: 700,
            padding: "15px 24px",
            borderRadius: 12,
            background: C.white,
            border: `1px solid ${C.border}`,
            boxShadow: "0 10px 24px rgba(15,23,42,.05)",
            transition: "color .15s, border-color .15s, transform .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = C.coral;
            e.currentTarget.style.borderColor = `${C.coral}55`;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = C.text;
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.transform = "none";
          }}
        >
          <Calendar size={14} fill="currentColor" /> Agendar demo
        </a>
      </div>
    </div>

    {/* Mockup */}
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        animation: "fadeUp .7s .2s ease both",
      }}
    >
      <div
        style={{
          animation: "float 4s ease-in-out infinite",
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        <ProductMockup />

        <div
          style={{
            marginTop: 60,
            animation: "float 4s 1.5s ease-in-out infinite",
          }}
        >
          <CatalogMockup />
        </div>
      </div>
    </div>
  </div>
</section>
      {/* ── LOGOS ─────────────────────────────────────────────── */}
      <section style={{background:C.white,padding:"32px 24px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:1140,margin:"0 auto",textAlign:"center"}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:C.light,marginBottom:20}}>Confían en Picku</p>
          <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:"10px 28px"}}>
            {LOGOS.map(l=>(
              <span key={l} style={{fontSize:13,fontWeight:700,color:C.light,letterSpacing:"-0.3px",padding:"6px 14px",borderRadius:8,border:`1px solid ${C.border}`}}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="features" style={{background:C.off,padding:"96px 24px"}} ref={featRef}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <Chip color={C.violet}>Características</Chip>
            <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:800,letterSpacing:"-1.5px",color:C.text,marginTop:16,marginBottom:16}}>
              Todo lo que tu negocio necesita
            </h2>
            <p style={{fontSize:16,color:C.mid,maxWidth:520,margin:"0 auto",lineHeight:1.65}}>
              Desde el catálogo digital hasta los informes de ventas — Picku es el único panel que necesitas.
            </p>
          </div>
          <div className="features-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {FEATURES.map((f,i)=>(
              <FeatureCard key={f.title} item={f} visible={featVis} delay={i*0.08}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE CALLOUT 1: Catalog ────────────────────────── */}
      <section style={{background:`linear-gradient(160deg,${C.white} 0%,${C.navy} 100%)`,padding:"96px 24px",overflow:"hidden"}}>
        <div style={{maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",gap:72,flexWrap:"wrap"}}>
          {/* Text */}
          <div style={{flex:1,minWidth:260}}>
            <Chip color={C.coral}>Catálogo digital</Chip>
            <h2 style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:800,letterSpacing:"-1.2px",color:C.text,marginTop:16,marginBottom:16,lineHeight:1.15}}>
              Un menú que tus clientes van a amar
            </h2>
            <p style={{fontSize:15,color:C.mid,lineHeight:1.7,marginBottom:28,maxWidth:420}}>
              Crea un catálogo visualmente impactante con fotos, descripciones generadas por IA, etiquetas personalizadas y modo oscuro. Compártelo con un QR en segundos.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {["Generación de descripciones con IA","Etiquetas de producto personalizadas","Popup promocional configurable","Modo oscuro para el cliente"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:`${C.coral}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Check size={11} color={C.coral} strokeWidth={3}/>
                  </div>
                  <span style={{fontSize:14,color:C.mid}}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Visual */}
          <div style={{flex:"0 0 auto",display:"flex",justifyContent:"center",animation:"float 4s ease-in-out infinite"}}>
            <CatalogMockup/>
          </div>
        </div>
      </section>

      {/* ── FEATURE CALLOUT 2: Orders ─────────────────────────── */}
      <section style={{background:C.white,padding:"96px 24px"}}>
        <div style={{maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",gap:72,flexWrap:"wrap"}}>
          {/* Visual */}
          <div style={{flex:"0 0 auto",display:"flex",justifyContent:"center",animation:"float 4s 1s ease-in-out infinite"}}>
            <div style={{background:C.white,borderRadius:20,padding:24,width:400,boxShadow:"0 20px 60px rgba(15,23,42,0.10)",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:12,fontWeight:800,color:C.text,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                🛵 Gestión de pedidos
                <span style={{marginLeft:"auto",background:"rgba(5,150,105,0.2)",color:"#059669",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:5}}>● EN VIVO</span>
              </div>
              <div style={{display:"flex",gap:10}}>
                {[
                  {col:"Nuevos",color:"#2563eb",items:["#001 Bandeja x2","#002 Costillas"]},
                  {col:"Preparando",color:"#d97706",items:["#003 Sushi Roll"]},
                  {col:"Entregado",color:"#059669",items:["#004 Limonada","#005 Flan"]},
                ].map((k,ki)=>(
                  <div key={ki} style={{flex:1,background:C.off,borderRadius:10,padding:10,border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:8,fontWeight:800,color:k.color,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{k.col}</div>
                    {k.items.map((it,ii)=>(
                      <div key={ii} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 8px",marginBottom:6,fontSize:10,color:C.mid}}>{it}</div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,display:"flex",gap:8}}>
                {[{l:"47 pedidos",v:"hoy",c:"#059669"},{l:"$1.8M",v:"facturado",c:"#6d28d9"},{l:"18 min",v:"promedio",c:"#ff4d4c"}].map((s,i)=>(
                  <div key={i} style={{flex:1,background:C.off,border:`1px solid ${C.border}`,borderRadius:8,padding:8,textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:800,color:s.c}}>{s.l}</div>
                    <div style={{fontSize:8,color:C.light,marginTop:2}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Text */}
          <div style={{flex:1,minWidth:260}}>
            <Chip color={C.green}>Gestión de pedidos</Chip>
            <h2 style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:800,letterSpacing:"-1.2px",color:C.text,marginTop:16,marginBottom:16,lineHeight:1.15}}>
              Cero llamadas.<br/>Todo en un kanban.
            </h2>
            <p style={{fontSize:15,color:C.mid,lineHeight:1.7,marginBottom:28,maxWidth:420}}>
              Recibe y gestiona cada pedido en tiempo real con un tablero Kanban visual. Tu equipo sabe exactamente qué preparar, cuándo y para quién.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {["Pedidos en tiempo real vía Supabase Realtime","Kanban: Nuevo → Preparando → Entregado","Notificaciones instantáneas al equipo","Historial completo de pedidos del día"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:C.greenL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Check size={11} color={C.green} strokeWidth={3}/>
                  </div>
                  <span style={{fontSize:14,color:C.mid}}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VERTICALS ──────────────────────────────────────────── */}
      <section style={{background:C.off,padding:"80px 24px"}} ref={vertRef}>
        <div style={{maxWidth:1140,margin:"0 auto",textAlign:"center"}}>
          <Chip color={C.amber}>Sectores</Chip>
          <h2 style={{fontSize:"clamp(26px,3.5vw,40px)",fontWeight:800,letterSpacing:"-1.2px",color:C.text,marginTop:16,marginBottom:12}}>
            Para cualquier tipo de negocio
          </h2>
          <p style={{fontSize:15,color:C.mid,marginBottom:48,maxWidth:440,margin:"12px auto 48px"}}>
            Restaurantes, tiendas, ferreterías, salones de belleza — Picku se adapta a tu industria automáticamente.
          </p>
          <div className="vert-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}} ref={vertRef}>
            {VERTICALS.map((v,i)=>(
              <div key={v.name} style={{
                background:C.white, border:`1px solid ${C.border}`, borderRadius:14,
                padding:"20px 12px", display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                opacity: vertVis ? 1 : 0, transform: vertVis ? "none" : "translateY(16px)",
                transition:`opacity .4s ${i*0.06}s, transform .4s ${i*0.06}s`,
                cursor:"pointer",
              }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${v.color}0a`; e.currentTarget.style.borderColor=`${v.color}40`; e.currentTarget.style.transform="translateY(-3px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.white; e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform="none"; }}
              >
                <img src={v.icon} alt={v.name} style={{width:52,height:52,objectFit:"contain"}} loading="lazy"/>
                <span style={{fontSize:11,fontWeight:700,color:C.mid,textAlign:"center",lineHeight:1.3}}>{v.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section style={{background:`linear-gradient(160deg,${C.white} 0%,${C.navy} 100%)`,padding:"96px 24px"}} ref={stepRef}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <Chip color={C.coral}>Proceso</Chip>
            <h2 style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:800,letterSpacing:"-1.2px",color:C.text,marginTop:16}}>
              Listo en 3 pasos
            </h2>
          </div>
          <div className="steps-row" style={{display:"flex",gap:0,position:"relative"}}>
            {/* Line */}
            <div style={{position:"absolute",top:28,left:"16.5%",right:"16.5%",height:1,background:C.border,zIndex:0}} className="hide-mobile"/>
            {STEPS.map((s,i)=>{
              const Icon = s.icon;
              return (
                <div key={s.n} style={{
                  flex:1, textAlign:"center", padding:"0 24px", position:"relative", zIndex:1,
                  opacity: stepVis ? 1 : 0, transform: stepVis ? "none" : "translateY(24px)",
                  transition:`opacity .5s ${i*0.15}s, transform .5s ${i*0.15}s`,
                }}>
                  <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.coral},${C.violet})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:`0 8px 24px rgba(255,77,76,0.3)`}}>
                    <Icon size={22} color="#fff"/>
                  </div>
                  <div style={{fontSize:10,fontWeight:800,color:"rgba(255,77,76,0.7)",letterSpacing:"1px",marginBottom:8,textTransform:"uppercase"}}>{s.n}</div>
                  <div style={{fontSize:17,fontWeight:800,color:C.text,marginBottom:10,lineHeight:1.2}}>{s.title}</div>
                  <div style={{fontSize:13,color:C.mid,lineHeight:1.65,maxWidth:220,margin:"0 auto"}}>{s.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" style={{background:C.off,padding:"96px 24px"}} ref={planRef}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <Chip color={C.violet}>Precios</Chip>
            <h2 style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:800,letterSpacing:"-1.2px",color:C.text,marginTop:16,marginBottom:16}}>
              Simple, transparente, sin sorpresas
            </h2>
            <p style={{fontSize:15,color:C.mid,maxWidth:440,margin:"0 auto"}}>
              14 días de prueba gratis en cualquier plan. Sin tarjeta de crédito. Cancela cuando quieras.
            </p>
          </div>
          <div className="plans-row" style={{display:"flex",gap:20,alignItems:"stretch"}}>
            {PLANS.map((p,i)=>(
              <PlanCard key={p.id} plan={p} visible={planVis} delay={i*0.12}/>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:24,fontSize:13,color:C.light}}>
            * Todos los precios en COP. Incluye IVA. Pagos mensuales vía transferencia bancaria.
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section id="testimonios" style={{background:C.white,padding:"96px 24px"}} ref={testRef}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <Chip color={C.green}>Testimonios</Chip>
            <h2 style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:800,letterSpacing:"-1.2px",color:C.text,marginTop:16}}>
              Negocios que ya crecen con Picku
            </h2>
          </div>
          <div className="test-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={t.name} style={{
                background:C.off, border:`1px solid ${C.border}`, borderRadius:18, padding:28,
                opacity: testVis ? 1 : 0, transform: testVis ? "none" : "translateY(20px)",
                transition:`opacity .5s ${i*0.12}s, transform .5s ${i*0.12}s`,
                display:"flex", flexDirection:"column", gap:16,
              }}>
                <div style={{display:"flex",gap:3}}>
                  {[1,2,3,4,5].map(s=><Star key={s} size={14} color="#f59e0b" fill="#f59e0b"/>)}
                </div>
                <p style={{fontSize:14,color:C.mid,lineHeight:1.7,flex:1}}>"{t.text}"</p>
                <div style={{display:"flex",alignItems:"center",gap:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${C.coral},${C.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{t.avatar}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{t.name}</div>
                    <div style={{fontSize:11,color:C.light}}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section style={{background:C.off,padding:"64px 24px",borderTop:`1px solid ${C.border}`}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"flex",flexWrap:"wrap",gap:0,justifyContent:"center"}}>
          {[
            {n:"+200",l:"Negocios activos",c:C.coral},
            {n:"+12K",l:"Pedidos mensuales",c:C.violet},
            {n:"99.9%",l:"Uptime garantizado",c:C.green},
            {n:"<2 min",l:"Para empezar",c:C.amber},
          ].map((s,i)=>(
            <div key={s.l} style={{flex:"1 0 180px",textAlign:"center",padding:"20px 16px",borderRight:i<3?`1px solid ${C.border}`:"none"}}>
              <div style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:900,color:s.c,letterSpacing:"-1.5px",lineHeight:1}}>{s.n}</div>
              <div style={{fontSize:13,color:C.mid,marginTop:8,fontWeight:500}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────── */}
      <section style={{
        background:`linear-gradient(135deg,${C.white} 0%,${C.coralL} 100%)`,
        padding:"100px 24px", textAlign:"center", position:"relative", overflow:"hidden",
      }}>
        <div className="hero-orb" style={{width:400,height:400,background:"rgba(255,77,76,0.1)",top:-100,left:"50%",transform:"translateX(-50%)"}}/>
        <div style={{maxWidth:600,margin:"0 auto",position:"relative",zIndex:1}}>
          
          <h2 style={{fontSize:"clamp(28px,4.5vw,52px)",fontWeight:900,letterSpacing:"-2px",color:C.text,marginBottom:16,lineHeight:1.1}}>
            Empieza hoy.<br/>
            <span className="gradient-text">10% de descuento en tus primeros 3 meses.</span>
          </h2>
          <p style={{fontSize:16,color:C.mid,marginBottom:40,lineHeight:1.65}}>
            Sin tarjeta de crédito. Sin contratos. Tu catálogo digital listo en minutos — con IA de tu lado.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button
              onClick={()=>navigate("/login")}
              style={{
                background:`linear-gradient(135deg,${C.coral},#e0352e)`,
                color:C.white, border:"none", padding:"16px 36px",
                borderRadius:12, fontSize:16, fontWeight:800, cursor:"pointer",
                display:"flex", alignItems:"center", gap:10, transition:"transform .15s, box-shadow .15s",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 14px 36px rgba(255,77,76,0.5)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
            >
              Crear mi cuenta gratis <ArrowRight size={18}/>
            </button>
            <a
              href="#pricing"
              style={{
                color:C.mid, fontSize:15, fontWeight:600,
                padding:"16px 28px", borderRadius:12, background:C.white, border:`1px solid ${C.border}`,
                transition:"color .15s, border-color .15s", display:"inline-flex", alignItems:"center", gap:6,
              }}
              onMouseEnter={e=>{ e.currentTarget.style.color=C.text; e.currentTarget.style.borderColor=C.coral; }}
              onMouseLeave={e=>{ e.currentTarget.style.color=C.mid; e.currentTarget.style.borderColor=C.border; }}
            >
              Ver planes <ChevronRight size={16}/>
            </a>
          </div>
          <p style={{marginTop:24,fontSize:12,color:C.light}}>
            Pago mensual · Cancela en cualquier momento · Soporte en español
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{background:C.white,borderTop:`1px solid ${C.border}`,padding:"48px 24px 32px"}}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:40,marginBottom:48}}>
            {/* Brand */}
            <div style={{flex:"0 0 220px",minWidth:180}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <LogoFull width={300} height={50} color={C.text}/>
              </div>
              <p style={{fontSize:13,color:C.mid,lineHeight:1.65,maxWidth:200}}>
                El panel de gestión digital para negocios latinoamericanos.
              </p>
              <div style={{display:"flex",gap:8,marginTop:16}}>
                {[`
<svg xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 264.583 264.583"><defs><radialGradient xlink:href="#instagram_icon__a" id="instagram_icon__f" cx="158.429" cy="578.088" r="52.352" fx="158.429" fy="578.088" gradientTransform="matrix(0 -4.03418 4.28018 0 -2332.227 942.236)" gradientUnits="userSpaceOnUse"/><radialGradient xlink:href="#instagram_icon__b" id="instagram_icon__g" cx="172.615" cy="600.692" r="65" fx="172.615" fy="600.692" gradientTransform="matrix(.67441 -1.16203 1.51283 .87801 -814.366 -47.835)" gradientUnits="userSpaceOnUse"/><radialGradient xlink:href="#instagram_icon__c" id="instagram_icon__h" cx="144.012" cy="51.337" r="67.081" fx="144.012" fy="51.337" gradientTransform="matrix(-2.3989 .67549 -.23008 -.81732 464.996 -26.404)" gradientUnits="userSpaceOnUse"/><radialGradient xlink:href="#instagram_icon__d" id="instagram_icon__e" cx="199.788" cy="628.438" r="52.352" fx="199.788" fy="628.438" gradientTransform="matrix(-3.10797 .87652 -.6315 -2.23914 1345.65 1374.198)" gradientUnits="userSpaceOnUse"/><linearGradient id="instagram_icon__d"><stop offset="0" stop-color="#ff005f"/><stop offset="1" stop-color="#fc01d8"/></linearGradient><linearGradient id="instagram_icon__c"><stop offset="0" stop-color="#780cff"/><stop offset="1" stop-color="#820bff" stop-opacity="0"/></linearGradient><linearGradient id="instagram_icon__b"><stop offset="0" stop-color="#fc0"/><stop offset="1" stop-color="#fc0" stop-opacity="0"/></linearGradient><linearGradient id="instagram_icon__a"><stop offset="0" stop-color="#fc0"/><stop offset=".124" stop-color="#fc0"/><stop offset=".567" stop-color="#fe4a05"/><stop offset=".694" stop-color="#ff0f3f"/><stop offset="1" stop-color="#fe0657" stop-opacity="0"/></linearGradient></defs><path fill="url(#instagram_icon__e)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/><path fill="url(#instagram_icon__f)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/><path fill="url(#instagram_icon__g)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/><path fill="url(#instagram_icon__h)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/><path fill="#fff" d="M132.345 33.973c-26.716 0-30.07.117-40.563.594-10.472.48-17.62 2.136-23.876 4.567-6.47 2.51-11.958 5.87-17.426 11.335-5.472 5.464-8.834 10.948-11.354 17.412-2.44 6.252-4.1 13.397-4.57 23.858-.47 10.486-.593 13.838-.593 40.535 0 26.697.119 30.037.594 40.522.482 10.465 2.14 17.609 4.57 23.859 2.515 6.465 5.876 11.95 11.346 17.414 5.466 5.468 10.955 8.834 17.42 11.345 6.26 2.431 13.41 4.088 23.881 4.567 10.493.477 13.844.594 40.559.594 26.719 0 30.061-.117 40.555-.594 10.472-.48 17.63-2.136 23.888-4.567 6.468-2.51 11.948-5.877 17.414-11.345 5.472-5.464 8.834-10.949 11.354-17.412 2.419-6.252 4.079-13.398 4.57-23.858.472-10.486.595-13.828.595-40.525s-.123-30.047-.594-40.533c-.492-10.465-2.152-17.608-4.57-23.858-2.521-6.466-5.883-11.95-11.355-17.414-5.472-5.468-10.944-8.827-17.42-11.335-6.271-2.431-13.424-4.088-23.897-4.567-10.493-.477-13.834-.594-40.558-.594zm-8.825 17.715c2.62-.004 5.542 0 8.825 0 26.266 0 29.38.094 39.752.565 9.591.438 14.797 2.04 18.264 3.385 4.591 1.782 7.864 3.912 11.305 7.352 3.443 3.44 5.575 6.717 7.362 11.305 1.346 3.46 2.951 8.663 3.388 18.247.47 10.363.573 13.475.573 39.71 0 26.233-.102 29.346-.573 39.709-.44 9.584-2.042 14.786-3.388 18.247-1.783 4.587-3.919 7.854-7.362 11.292-3.443 3.441-6.712 5.57-11.305 7.352-3.463 1.352-8.673 2.95-18.264 3.388-10.37.47-13.486.573-39.752.573-26.268 0-29.38-.102-39.751-.573-9.592-.443-14.797-2.044-18.267-3.39-4.59-1.781-7.87-3.911-11.313-7.352-3.443-3.44-5.574-6.709-7.362-11.298-1.346-3.461-2.95-8.663-3.387-18.247-.472-10.363-.566-13.476-.566-39.726s.094-29.347.566-39.71c.438-9.584 2.04-14.786 3.387-18.25 1.783-4.588 3.919-7.865 7.362-11.305 3.443-3.441 6.722-5.57 11.313-7.357 3.468-1.351 8.675-2.949 18.267-3.389 9.075-.41 12.592-.532 30.926-.553zm61.337 16.322c-6.518 0-11.805 5.277-11.805 11.792 0 6.512 5.287 11.796 11.805 11.796 6.517 0 11.804-5.284 11.804-11.796 0-6.513-5.287-11.796-11.805-11.796zm-52.512 13.782c-27.9 0-50.519 22.603-50.519 50.482 0 27.879 22.62 50.471 50.52 50.471s50.51-22.592 50.51-50.471c0-27.879-22.613-50.482-50.513-50.482zm0 17.715c18.11 0 32.792 14.67 32.792 32.767 0 18.096-14.683 32.767-32.792 32.767-18.11 0-32.791-14.671-32.791-32.767 0-18.098 14.68-32.767 32.791-32.767z"/></svg>
`,
`<svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 256"><path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453" fill="#0A66C2"/></svg>`,
`<svg viewBox="0 0 666.667 666.667"><defs><clipPath id="facebook_icon__a" clipPathUnits="userSpaceOnUse"><path d="M0 700h700V0H0Z"/></clipPath></defs><g clip-path="url(#facebook_icon__a)" transform="matrix(1.33333 0 0 -1.33333 -133.333 800)"><path d="M0 0c0 138.071-111.929 250-250 250S-500 138.071-500 0c0-117.245 80.715-215.622 189.606-242.638v166.242h-51.552V0h51.552v32.919c0 85.092 38.508 124.532 122.048 124.532 15.838 0 43.167-3.105 54.347-6.211V81.986c-5.901.621-16.149.932-28.882.932-40.993 0-56.832-15.528-56.832-55.9V0h81.659l-14.028-76.396h-67.631v-171.773C-95.927-233.218 0-127.818 0 0" style="fill:#0866ff;fill-opacity:1;fill-rule:nonzero;stroke:none" transform="translate(600 350)"/><path d="m0 0 14.029 76.396H-67.63v27.019c0 40.372 15.838 55.899 56.831 55.899 12.733 0 22.981-.31 28.882-.931v69.253c-11.18 3.106-38.509 6.212-54.347 6.212-83.539 0-122.048-39.441-122.048-124.533V76.396h-51.552V0h51.552v-166.242a250.559 250.559 0 0 1 60.394-7.362c10.254 0 20.358.632 30.288 1.831V0Z" style="fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none" transform="translate(447.918 273.604)"/></g></svg>`,
`<svg id="tiktok_icon_dark__Layer_2" viewBox="0 0 352.28 398.67"><g id="tiktok_icon_dark__Layer_1-2"><path d="M137.17 156.98v-15.56c-5.34-.73-10.76-1.18-16.29-1.18C54.23 140.24 0 194.47 0 261.13c0 40.9 20.43 77.09 51.61 98.97-20.12-21.6-32.46-50.53-32.46-82.31 0-65.7 52.69-119.28 118.03-120.81Z"/><path d="M140.02 333c29.74 0 54-23.66 55.1-53.13l.11-263.2h48.08c-1-5.41-1.55-10.97-1.55-16.67h-65.67l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-9.24 0-17.95-2.31-25.61-6.34C105.3 323.9 121.6 333 140.02 333ZM333.13 106V91.37c-18.34 0-35.43-5.45-49.76-14.8 12.76 14.65 30.09 25.22 49.76 29.43Z"/><path d="M283.38 76.57c-13.98-16.05-22.47-37-22.47-59.91h-17.59c4.63 25.02 19.48 46.49 40.06 59.91ZM120.88 205.92c-30.44 0-55.21 24.77-55.21 55.21 0 21.2 12.03 39.62 29.6 48.86-6.55-9.08-10.45-20.18-10.45-32.2 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-67.05c-5.34-.73-10.76-1.18-16.29-1.18-.96 0-1.9.05-2.85.07v51.49c-5.16-1.61-10.61-2.55-16.29-2.55Z"/><path d="M333.13 106v51.04c-34.05 0-65.61-10.89-91.37-29.38v133.47c0 66.66-54.23 120.88-120.88 120.88-25.76 0-49.64-8.12-69.28-21.91 22.08 23.71 53.54 38.57 88.42 38.57 66.66 0 120.88-54.23 120.88-120.88V144.33c25.76 18.49 57.32 29.38 91.37 29.38v-65.68c-6.57 0-12.97-.71-19.14-2.03Z"/><path d="M241.76 261.13V127.66c25.76 18.49 57.32 29.38 91.37 29.38V106c-19.67-4.21-37-14.77-49.76-29.43-20.58-13.42-35.43-34.88-40.06-59.91h-48.08l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-18.42 0-34.72-9.1-44.75-23.01-17.57-9.25-29.6-27.67-29.6-48.86 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-51.49C71.83 158.5 19.14 212.08 19.14 277.78c0 31.78 12.34 60.71 32.46 82.31C71.23 373.87 95.12 382 120.88 382c66.65 0 120.88-54.23 120.88-120.88Z" style="fill:#fff"/></g></svg>`
  ].map((svg,i)=>(
    <div key={i} style={{width:16,height:16,borderRadius:8,background:C.off,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.mid,cursor:"pointer",transition:"background .15s"}}
      onMouseEnter={e=>e.currentTarget.style.background=C.navy}
      onMouseLeave={e=>e.currentTarget.style.background=C.off}
      dangerouslySetInnerHTML={{__html: svg}}
    />
  ))}
              </div>
            </div>
            {/* Links */}
            {[
              {title:"Producto",links:["Características","Precios","Integraciones","Changelog","Roadmap"]},
              {title:"Empresa",links:["Sobre nosotros","Blog","Prensa","Empleos","Contacto"]},
              {title:"Legal",links:["Privacidad","Términos","Cookies","Seguridad"]},
            ].map(col=>(
              <div key={col.title} style={{flex:"0 0 140px",minWidth:120}}>
                <div style={{fontSize:11,fontWeight:800,color:C.light,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:16}}>{col.title}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {col.links.map(l=>(
                    <a key={l} href="#" style={{fontSize:13,color:C.mid,textDecoration:"none",transition:"color .15s"}}
                      onMouseEnter={e=>e.target.style.color=C.text}
                      onMouseLeave={e=>e.target.style.color=C.mid}
                    >{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Bottom bar */}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:24,display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <span style={{fontSize:12,color:C.light}}>© 2026 Picku. Todos los derechos reservados.</span>
            <div style={{display:"flex",gap:16}}>
              {["Privacidad","Términos","Cookies"].map(l=>(
                <a key={l} href="#" style={{fontSize:12,color:C.light,textDecoration:"none",transition:"color .15s"}}
                  onMouseEnter={e=>e.target.style.color=C.mid}
                  onMouseLeave={e=>e.target.style.color=C.light}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
