import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Check, Star, Zap, Globe, BarChart3, Layers, Cpu,
  MapPin, QrCode, ChevronRight, Play, ShoppingBag, Truck, Palette,
  Shield, Clock, Users, Menu, X, Sparkles, TrendingUp, Store,
} from "lucide-react";

/* ─── TOKENS ──────────────────────────────────────────────────── */
const C = {
  navy:    "#0a1628",
  navyM:   "#0d2040",
  navyS:   "#1a3358",
  coral:   "#ff4d4c",
  coralD:  "#e63c3b",
  violet:  "#6d28d9",
  violetL: "#ede9fe",
  white:   "#ffffff",
  off:     "#f8f9fc",
  border:  "#e8ebf4",
  text:    "#111827",
  mid:     "#6b7280",
  light:   "#9ca3af",
  green:   "#059669",
  greenL:  "#d1fae5",
  amber:   "#d97706",
  blue:    "#2563eb",
  blueL:   "#dbeafe",
  pink:    "#db2777",
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
  { icon:"🍽️", name:"Restaurantes",      color:"#f97316" },
  { icon:"👗", name:"Moda & Ropa",        color:"#ec4899" },
  { icon:"🛒", name:"Tiendas & Supermer", color:"#059669" },
  { icon:"💄", name:"Belleza & Salud",    color:"#db2777" },
  { icon:"📱", name:"Tecnología",         color:"#2563eb" },
  { icon:"🐾", name:"Mascotas",           color:"#d97706" },
  { icon:"🔧", name:"Ferretería",         color:"#d97706" },
  { icon:"🧸", name:"Juguetería",         color:"#8b5cf6" },
  { icon:"🏢", name:"Servicios Prof.",    color:"#4338ca" },
];

const PLANS = [
  {
    id:"starter", name:"Starter", price:49900, color:C.blue,
    desc:"Para negocios que empiezan a digitalizarse.",
    features:["Catálogo digital con QR","Hasta 30 productos","1 sucursal","Pedidos y delivery básico","Soporte por email"],
  },
  {
    id:"pro", name:"Pro", price:99900, color:C.violet, popular:true,
    desc:"La elección de la mayoría de negocios en Colombia.",
    features:["Todo lo de Starter","Productos ilimitados","Zonas de delivery en mapa","Asistente IA incluido","Banners y popups promo","Analytics avanzados","Soporte 24/7"],
  },
  {
    id:"business", name:"Business", price:189900, color:C.pink,
    desc:"Para cadenas y negocios con múltiples sedes.",
    features:["Todo lo de Pro","Multi-sucursal ilimitada","API de integración","Manager dedicado","Onboarding personalizado","SLA prioritario"],
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
    name:"Diego Park", role:"Chef & Dueño · Sushi Nakama, Medellín", avatar:"👨‍🍽️", stars:5,
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
      background: plan.popular ? C.navy : C.white,
      border: plan.popular ? `1px solid ${C.navyS}` : `1px solid ${C.border}`,
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
      <div style={{marginBottom:8, display:"flex", alignItems:"baseline", gap:4}}>
        <span style={{fontSize:36, fontWeight:800, color: plan.popular ? C.white : C.text, lineHeight:1}}>
          {fmtCOP(plan.price)}
        </span>
        <span style={{fontSize:12,color: plan.popular ? "rgba(255,255,255,0.5)" : C.light}}>/mes</span>
      </div>
      <div style={{fontSize:13, color: plan.popular ? "rgba(255,255,255,0.6)" : C.mid, marginBottom:24, lineHeight:1.5}}>{plan.desc}</div>
      <div style={{flex:1, display:"flex", flexDirection:"column", gap:10, marginBottom:28}}>
        {plan.features.map(f=>(
          <div key={f} style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:`${plan.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Check size={10} color={plan.color} strokeWidth={3}/>
            </div>
            <span style={{fontSize:13, color: plan.popular ? "rgba(255,255,255,0.85)" : C.mid}}>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={()=>navigate("/login")}
        style={{
          width:"100%", padding:"13px 0", borderRadius:12, fontWeight:700, fontSize:14,
          cursor:"pointer", border:"none", fontFamily:"'Plus Jakarta Sans',sans-serif",
          background: plan.popular ? `linear-gradient(135deg,${C.coral},${C.violet})` : `${plan.color}12`,
          color: plan.popular ? C.white : plan.color,
          transition:"transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 24px ${plan.color}40`; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
      >
        Empezar con {plan.name} →
      </button>
    </div>
  );
}

/* ─── PRODUCT MOCKUP ──────────────────────────────────────────── */
function ProductMockup(){
  return (
    <div style={{
      background:"#0d1e35", borderRadius:20, padding:20, width:"100%", maxWidth:540,
      boxShadow:"0 32px 80px rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.08)",
      fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      {/* Window chrome */}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:"#ff5f57"}}/>
        <div style={{width:10,height:10,borderRadius:"50%",background:"#febc2e"}}/>
        <div style={{width:10,height:10,borderRadius:"50%",background:"#28c840"}}/>
        <div style={{flex:1,height:22,borderRadius:6,background:"rgba(255,255,255,0.07)",marginLeft:8,display:"flex",alignItems:"center",padding:"0 10px"}}>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>app.picku.co/admin/delivery</span>
        </div>
      </div>
      {/* App layout */}
      <div style={{display:"flex",gap:12,height:280}}>
        {/* Sidebar */}
        <div style={{width:44,background:"rgba(255,255,255,0.04)",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0",gap:8}}>
          {["🏠","🍽️","🛵","🎨","📊","⚙️"].map((ico,i)=>(
            <div key={i} style={{width:28,height:28,borderRadius:7,background:i===2?"rgba(255,77,76,0.25)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{ico}</div>
          ))}
        </div>
        {/* Main content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.9)"}}>🛵 Pedidos del día</span>
            <div style={{background:"rgba(255,77,76,0.2)",borderRadius:6,padding:"3px 8px",fontSize:9,fontWeight:700,color:C.coral}}>EN VIVO</div>
          </div>
          {/* Kanban columns */}
          <div style={{display:"flex",gap:8,flex:1}}>
            {[
              {label:"Nuevos", color:"#2563eb", items:["🍔 Bandeja x2","🥤 Limonada"]},
              {label:"En prep.", color:"#d97706", items:["🍖 Costillas","🌮 Tacos x3"]},
              {label:"Listo", color:"#059669", items:["🍣 Sushi Roll"]},
            ].map((col,ci)=>(
              <div key={ci} style={{flex:1,background:"rgba(255,255,255,0.03)",borderRadius:8,padding:8}}>
                <div style={{fontSize:9,fontWeight:800,color:col.color,marginBottom:6,letterSpacing:"0.5px",textTransform:"uppercase"}}>{col.label}</div>
                {col.items.map((item,ii)=>(
                  <div key={ii} style={{background:"rgba(255,255,255,0.07)",borderRadius:6,padding:"6px 8px",marginBottom:5,fontSize:10,color:"rgba(255,255,255,0.8)",fontWeight:500}}>{item}</div>
                ))}
              </div>
            ))}
          </div>
          {/* Stats row */}
          <div style={{display:"flex",gap:6,marginTop:4}}>
            {[{l:"Pedidos hoy",v:"47",c:"#059669"},{l:"MRR",v:"$99.9K",c:"#6d28d9"},{l:"Productos",v:"32",c:"#ff4d4c"}].map((s,i)=>(
              <div key={i} style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"8px 8px"}}>
                <div style={{fontSize:14,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginTop:2}}>{s.l}</div>
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
      <div style={{background:"linear-gradient(135deg,#0a1628,#1a3358)",padding:"16px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"#ff4d4c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔥</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>La Leña</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>● Abierto ahora</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {["🍽️ Carta","🛵 Delivery","📍 Local"].map((t,i)=>(
            <div key={i} style={{padding:"3px 7px",borderRadius:12,background:i===0?"rgba(255,77,76,0.3)":"rgba(255,255,255,0.08)",fontSize:8,color:i===0?"#ff8a89":"rgba(255,255,255,0.5)",fontWeight:600}}>{t}</div>
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
      background: scrolled ? "rgba(10,22,40,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
      transition:"background .3s, border-color .3s",
      padding:"0 24px",
    }}>
      <div style={{maxWidth:1140,margin:"0 auto",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer"}} onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>
          <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#ff4d4c,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800}}>P</div>
          <span style={{fontSize:18,fontWeight:800,color:"#fff",letterSpacing:"-0.5px"}}>Picku</span>
        </div>
        {/* Desktop links */}
        <div style={{display:"flex",alignItems:"center",gap:32}} className="hide-mobile">
          {links.map(({l,h})=>(
            <a key={h} href={h} style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.7)",textDecoration:"none",transition:"color .15s"}}
              onMouseEnter={e=>e.target.style.color="#fff"}
              onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.7)"}
            >{l}</a>
          ))}
        </div>
        {/* CTAs */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button
            onClick={()=>navigate("/login")}
            style={{background:"transparent",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.8)",padding:"8px 18px",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"border-color .15s, color .15s"}}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.5)"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"; e.currentTarget.style.color="rgba(255,255,255,0.8)"; }}
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
          <button onClick={()=>setOpen(o=>!o)} className="show-mobile" style={{background:"transparent",border:"none",color:"#fff",cursor:"pointer",padding:4,display:"none"}}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div style={{background:"rgba(10,22,40,0.98)",borderTop:"1px solid rgba(255,255,255,0.07)",padding:"16px 24px 24px"}}>
          {links.map(({l,h})=>(
            <a key={h} href={h} onClick={()=>setOpen(false)} style={{display:"block",padding:"12px 0",fontSize:15,fontWeight:500,color:"rgba(255,255,255,0.8)",textDecoration:"none",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>{l}</a>
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

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        background:`linear-gradient(160deg,${C.navy} 0%,#0f2847 50%,#1a1040 100%)`,
        minHeight:"100vh", display:"flex", alignItems:"center", position:"relative",
        overflow:"hidden", padding:"100px 24px 80px",
      }}>
        {/* Orbs */}
        <div className="hero-orb" style={{width:500,height:500,background:"rgba(255,77,76,0.12)",top:-100,right:-100}}/>
        <div className="hero-orb" style={{width:400,height:400,background:"rgba(109,40,217,0.12)",bottom:-100,left:-60}}/>
        <div className="hero-orb" style={{width:240,height:240,background:"rgba(255,77,76,0.08)",top:"40%",left:"30%"}}/>

        <div style={{maxWidth:1140,margin:"0 auto",width:"100%",display:"flex",alignItems:"center",gap:60,position:"relative",zIndex:1}} className="hero-cols">
          {/* Text */}
          <div style={{flex:1,minWidth:0,animation:"fadeUp .7s ease both"}}>
            <div style={{marginBottom:20}}>
              <Chip color={C.coral}>Nuevo · Potenciado con IA</Chip>
            </div>
            <h1 style={{fontSize:"clamp(38px,6vw,68px)",fontWeight:900,lineHeight:1.1,letterSpacing:"-2px",marginBottom:20}}>
              <span style={{color:C.white}}>Tu negocio,</span><br/>
              <span className="gradient-text">digital en minutos.</span>
            </h1>
            <p style={{fontSize:"clamp(15px,1.8vw,18px)",color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:36,maxWidth:480}}>
              Crea tu catálogo digital, gestiona pedidos en tiempo real y crece tu negocio desde un solo panel. Sin apps, sin complicaciones.
            </p>
            {/* Social proof */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
              <div style={{display:"flex"}}>
                {["👨‍🍳","👩‍💼","👨‍🍽️","👩‍🍳","👨‍💻"].map((a,i)=>(
                  <div key={i} style={{width:30,height:30,borderRadius:"50%",background:`hsl(${i*40},60%,50%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,border:"2px solid #0a1628",marginLeft:i>0?-8:0}}>{a}</div>
                ))}
              </div>
              <div>
                <div style={{display:"flex",gap:2}}>
                  {[1,2,3,4,5].map(i=><Star key={i} size={11} color="#f59e0b" fill="#f59e0b"/>)}
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:2}}>+200 negocios en Colombia</div>
              </div>
            </div>
            {/* CTAs */}
            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}} className="hero-btns">
              <button
                onClick={()=>navigate("/login")}
                style={{
                  background:`linear-gradient(135deg,${C.coral},#e0352e)`,
                  color:C.white, border:"none", padding:"15px 30px",
                  borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer",
                  display:"flex", alignItems:"center", gap:8, transition:"transform .15s, box-shadow .15s",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 30px rgba(255,77,76,0.5)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
              >
                Empezar gratis <ArrowRight size={16}/>
              </button>
              <a
                href="#features"
                style={{
                  display:"flex", alignItems:"center", gap:8,
                  color:"rgba(255,255,255,0.7)", fontSize:14, fontWeight:600,
                  padding:"15px 24px", borderRadius:12,
                  border:"1px solid rgba(255,255,255,0.12)", transition:"color .15s, border-color .15s",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="rgba(255,255,255,0.3)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; }}
              >
                <Play size={14} fill="currentColor"/> Ver demo
              </a>
            </div>
          </div>
          {/* Mockup */}
          <div style={{flex:"0 0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:20,animation:"fadeUp .7s .2s ease both"}}>
            <div style={{animation:"float 4s ease-in-out infinite",display:"flex",gap:20,alignItems:"flex-start"}}>
              <ProductMockup/>
              <div style={{marginTop:60,animation:"float 4s 1.5s ease-in-out infinite"}}>
                <CatalogMockup/>
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
      <section style={{background:`linear-gradient(160deg,${C.navy} 0%,${C.navyM} 100%)`,padding:"96px 24px",overflow:"hidden"}}>
        <div style={{maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",gap:72,flexWrap:"wrap"}}>
          {/* Text */}
          <div style={{flex:1,minWidth:260}}>
            <Chip color={C.coral}>Catálogo digital</Chip>
            <h2 style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:800,letterSpacing:"-1.2px",color:C.white,marginTop:16,marginBottom:16,lineHeight:1.15}}>
              Un menú que tus clientes van a amar
            </h2>
            <p style={{fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.7,marginBottom:28,maxWidth:420}}>
              Crea un catálogo visualmente impactante con fotos, descripciones generadas por IA, etiquetas personalizadas y modo oscuro. Compártelo con un QR en segundos.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {["Generación de descripciones con IA","Etiquetas de producto personalizadas","Popup promocional configurable","Modo oscuro para el cliente"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(255,77,76,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Check size={11} color={C.coral} strokeWidth={3}/>
                  </div>
                  <span style={{fontSize:14,color:"rgba(255,255,255,0.75)"}}>{f}</span>
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
            <div style={{background:C.navy,borderRadius:20,padding:24,width:400,boxShadow:"0 20px 60px rgba(0,0,0,0.12)"}}>
              <div style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.9)",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                🛵 Gestión de pedidos
                <span style={{marginLeft:"auto",background:"rgba(5,150,105,0.2)",color:"#059669",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:5}}>● EN VIVO</span>
              </div>
              <div style={{display:"flex",gap:10}}>
                {[
                  {col:"Nuevos",color:"#2563eb",items:["#001 Bandeja x2","#002 Costillas"]},
                  {col:"Preparando",color:"#d97706",items:["#003 Sushi Roll"]},
                  {col:"Entregado",color:"#059669",items:["#004 Limonada","#005 Flan"]},
                ].map((k,ki)=>(
                  <div key={ki} style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:10,padding:10}}>
                    <div style={{fontSize:8,fontWeight:800,color:k.color,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{k.col}</div>
                    {k.items.map((it,ii)=>(
                      <div key={ii} style={{background:"rgba(255,255,255,0.08)",borderRadius:6,padding:"6px 8px",marginBottom:6,fontSize:10,color:"rgba(255,255,255,0.8)"}}>{it}</div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,display:"flex",gap:8}}>
                {[{l:"47 pedidos",v:"hoy",c:"#059669"},{l:"$1.8M",v:"facturado",c:"#6d28d9"},{l:"18 min",v:"promedio",c:"#ff4d4c"}].map((s,i)=>(
                  <div key={i} style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:8,padding:8,textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:800,color:s.c}}>{s.l}</div>
                    <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",marginTop:2}}>{s.v}</div>
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
                <span style={{fontSize:26,lineHeight:1}}>{v.icon}</span>
                <span style={{fontSize:11,fontWeight:700,color:C.mid,textAlign:"center",lineHeight:1.3}}>{v.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section style={{background:C.navy,padding:"96px 24px"}} ref={stepRef}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <Chip color={C.coral}>Proceso</Chip>
            <h2 style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:800,letterSpacing:"-1.2px",color:C.white,marginTop:16}}>
              Listo en 3 pasos
            </h2>
          </div>
          <div className="steps-row" style={{display:"flex",gap:0,position:"relative"}}>
            {/* Line */}
            <div style={{position:"absolute",top:28,left:"16.5%",right:"16.5%",height:1,background:"rgba(255,255,255,0.08)",zIndex:0}} className="hide-mobile"/>
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
                  <div style={{fontSize:17,fontWeight:800,color:C.white,marginBottom:10,lineHeight:1.2}}>{s.title}</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.65,maxWidth:220,margin:"0 auto"}}>{s.desc}</div>
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
        background:`linear-gradient(135deg,${C.navy} 0%,#1a1040 100%)`,
        padding:"100px 24px", textAlign:"center", position:"relative", overflow:"hidden",
      }}>
        <div className="hero-orb" style={{width:400,height:400,background:"rgba(255,77,76,0.1)",top:-100,left:"50%",transform:"translateX(-50%)"}}/>
        <div style={{maxWidth:600,margin:"0 auto",position:"relative",zIndex:1}}>
          <div style={{width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,#ff4d4c,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",boxShadow:"0 16px 40px rgba(255,77,76,0.35)"}}>
            <Sparkles size={28} color="#fff"/>
          </div>
          <h2 style={{fontSize:"clamp(28px,4.5vw,52px)",fontWeight:900,letterSpacing:"-2px",color:C.white,marginBottom:16,lineHeight:1.1}}>
            Empieza hoy.<br/>
            <span className="gradient-text">Gratis por 14 días.</span>
          </h2>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.55)",marginBottom:40,lineHeight:1.65}}>
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
                color:"rgba(255,255,255,0.65)", fontSize:15, fontWeight:600,
                padding:"16px 28px", borderRadius:12, border:"1px solid rgba(255,255,255,0.15)",
                transition:"color .15s, border-color .15s", display:"inline-flex", alignItems:"center", gap:6,
              }}
              onMouseEnter={e=>{ e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="rgba(255,255,255,0.3)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; }}
            >
              Ver planes <ChevronRight size={16}/>
            </a>
          </div>
          <p style={{marginTop:24,fontSize:12,color:"rgba(255,255,255,0.3)"}}>
            Pago mensual · Cancela en cualquier momento · Soporte en español
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{background:C.navy,borderTop:"1px solid rgba(255,255,255,0.06)",padding:"48px 24px 32px"}}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:40,marginBottom:48}}>
            {/* Brand */}
            <div style={{flex:"0 0 220px",minWidth:180}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#ff4d4c,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff"}}>P</div>
                <span style={{fontSize:18,fontWeight:800,color:"#fff"}}>Picku</span>
              </div>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.65,maxWidth:200}}>
                El panel de gestión digital para negocios latinoamericanos.
              </p>
              <div style={{display:"flex",gap:8,marginTop:16}}>
                {["𝕏","in","ig","📘"].map(s=>(
                  <div key={s} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(255,255,255,0.4)",cursor:"pointer",transition:"background .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                  >{s}</div>
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
                <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.35)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:16}}>{col.title}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {col.links.map(l=>(
                    <a key={l} href="#" style={{fontSize:13,color:"rgba(255,255,255,0.5)",textDecoration:"none",transition:"color .15s"}}
                      onMouseEnter={e=>e.target.style.color="#fff"}
                      onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.5)"}
                    >{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Bottom bar */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:24,display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.25)"}}>© 2026 Picku. Hecho con ❤️ en Colombia.</span>
            <div style={{display:"flex",gap:16}}>
              {["Privacidad","Términos","Cookies"].map(l=>(
                <a key={l} href="#" style={{fontSize:12,color:"rgba(255,255,255,0.25)",textDecoration:"none",transition:"color .15s"}}
                  onMouseEnter={e=>e.target.style.color="rgba(255,255,255,0.6)"}
                  onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.25)"}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
