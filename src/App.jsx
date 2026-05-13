
/**
 * Gotup v4.0 — Sistema Completo Unificado
 * CEO + Admin + Menú Cliente — Un solo archivo
 *
 * STACKBLITZ: New Project → React → pega en App.jsx
 * package.json: agregar "recharts": "^2.12.0"
 *
 * ACCESOS:
 *   CEO:   ceo@gotup.co   / gotup2026
 *   Admin: admin@lalena.co / lalena2026
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import QRCodeLib from "qrcode";
import { supabase } from "./lib/supabase";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

/* ─── ESTILOS ─────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f2f8;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}
  scrollbar-width:thin
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes dotB{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  input:focus,textarea:focus,select:focus{outline:none!important}
  button{cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif}
  .hov{transition:transform .18s,box-shadow .18s}
  .hov:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.11)!important}
  img{display:block;max-width:100%}
`;

/* ─── TOKENS ──────────────────────────────────────────────── */
const T = {
  bg:"#f0f2f8", white:"#fff", border:"#e4e7f0", sidebar:"#0a0f1e",
  text:"#111827", mid:"#6b7280", light:"#9ca3af",
  violet:"#6d28d9", violetL:"#ede9fe", violetD:"#4c1d95",
  indigo:"#4338ca", indigoL:"#e0e7ff",
  green:"#059669", greenL:"#d1fae5",
  amber:"#d97706", amberL:"#fef3c7",
  red:"#dc2626", redL:"#fee2e2",
  blue:"#2563eb", blueL:"#dbeafe",
  pink:"#db2777", pinkL:"#fce7f3",
  sh:"0 1px 3px rgba(0,0,0,.06),0 2px 10px rgba(0,0,0,.06)",
  shMd:"0 4px 24px rgba(0,0,0,.10)",
};
const CM = {
  bg:"#111009", surface:"#1c1812", card:"#231e18",
  border:"rgba(255,255,255,0.07)", text:"#f5f0e6",
  mid:"rgba(255,255,255,0.52)", green:"#22c55e",
};

/* ─── USUARIOS ────────────────────────────────────────────── */
const USERS = [
  { email:"ceo@gotup.co",    password:"gotup2026", role:"ceo",   name:"Steven Giraldo", title:"CEO & Fundador",         avatar:"👑" },
  { email:"admin@lalena.co",  password:"lalena2026", role:"admin", name:"Carlos Mejía",   title:"Admin · La Leña",        avatar:"👨‍💼" },
];

/* ─── DATOS SEED ──────────────────────────────────────────── */
const SEED_RESTAURANTS = [
  {id:"r1",name:"La Leña",owner:"Carlos Mejía",email:"carlos@lalena.co",phone:"+57 300 111 2222",city:"Cali",plan:"pro",status:"active",createdAt:"2025-10-15",nextPayment:"2026-05-01",daysLeft:8,mrr:99900,products:10,orders:142,coverImg:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=70",logo:"🔥",notes:"Cliente VIP."},
  {id:"r2",name:"Bufalo Ribs Co",owner:"Ana Torres",email:"ana@bufalo.co",phone:"+57 310 333 4444",city:"Bogotá",plan:"business",status:"active",createdAt:"2025-11-02",nextPayment:"2026-05-02",daysLeft:9,mrr:189900,products:28,orders:389,coverImg:"https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=70",logo:"🦬",notes:"Multi-sucursal."},
  {id:"r3",name:"Sushi Nakama",owner:"Diego Park",email:"diego@nakama.co",phone:"+57 320 555 6666",city:"Medellín",plan:"pro",status:"active",createdAt:"2025-12-10",nextPayment:"2026-05-10",daysLeft:17,mrr:99900,products:45,orders:201,coverImg:"https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=70",logo:"🍣",notes:""},
  {id:"r4",name:"Tacos El Rancho",owner:"María González",email:"maria@elrancho.co",phone:"+57 315 777 8888",city:"Barranquilla",plan:"starter",status:"active",createdAt:"2026-01-20",nextPayment:"2026-05-20",daysLeft:27,mrr:49900,products:15,orders:67,coverImg:"https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=70",logo:"🌮",notes:"Potencial upgrade."},
  {id:"r5",name:"Pizza & Co",owner:"Roberto Salcedo",email:"roberto@pizzaco.co",phone:"+57 305 999 0000",city:"Cali",plan:"starter",status:"suspended",createdAt:"2025-09-05",nextPayment:"2026-04-05",daysLeft:-18,mrr:49900,products:20,orders:0,coverImg:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70",logo:"🍕",notes:"Suspendida 18 días."},
  {id:"r6",name:"El Corral Premium",owner:"Valentina Ruiz",email:"valentina@corral.co",phone:"+57 312 111 3333",city:"Bogotá",plan:"business",status:"active",createdAt:"2025-08-15",nextPayment:"2026-05-15",daysLeft:22,mrr:189900,products:60,orders:512,coverImg:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70",logo:"🍔",notes:""},
  {id:"r7",name:"Crepes & Waffles",owner:"Laura Moreno",email:"laura@creperia.co",phone:"+57 318 444 5555",city:"Cartagena",plan:"pro",status:"trial",createdAt:"2026-04-01",nextPayment:"2026-04-15",daysLeft:3,mrr:0,products:8,orders:12,coverImg:"https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=70",logo:"🧇",notes:"Trial activo."},
];
const SEED_TICKETS = [
  {id:"t1",restaurant:"La Leña",user:"Carlos Mejía",subject:"Menú no carga en iOS",priority:"high",status:"open",date:"2026-04-22",messages:[{from:"Carlos Mejía",text:"El menú no abre bien en iPhone.",time:"10:30"}]},
  {id:"t2",restaurant:"Sushi Nakama",user:"Diego Park",subject:"Cómo activar domicilios",priority:"medium",status:"open",date:"2026-04-21",messages:[{from:"Diego Park",text:"¿Cómo activo domicilios?",time:"14:15"}]},
  {id:"t3",restaurant:"Bufalo Ribs Co",user:"Ana Torres",subject:"Factura de marzo incorrecta",priority:"high",status:"resolved",date:"2026-04-20",messages:[{from:"Ana Torres",text:"Me cobraron dos veces.",time:"09:00"},{from:"Soporte Gotup",text:"Aplicamos el crédito. Disculpa.",time:"11:30"}]},
];
const PAYMENTS_HISTORY = [
  {id:"p1",restaurant:"Bufalo Ribs Co",plan:"Business",amount:189900,date:"2026-04-02",method:"Visa ****8821",status:"paid"},
  {id:"p2",restaurant:"El Corral Premium",plan:"Business",amount:189900,date:"2026-04-02",method:"MC ****3344",status:"paid"},
  {id:"p3",restaurant:"La Leña",plan:"Pro",amount:99900,date:"2026-04-02",method:"Visa ****4821",status:"paid"},
  {id:"p4",restaurant:"Pizza & Co",plan:"Starter",amount:49900,date:"2026-04-05",method:"Visa ****1122",status:"failed"},
];
const MRR_TREND = [{m:"Oct",mrr:149900},{m:"Nov",mrr:339800},{m:"Dic",mrr:489600},{m:"Ene",mrr:579400},{m:"Feb",mrr:629300},{m:"Mar",mrr:728800},{m:"Abr",mrr:729400}];
const PLAN_DIST = [{name:"Starter",value:2,color:"#2563eb"},{name:"Pro",value:3,color:"#6d28d9"},{name:"Business",value:2,color:"#db2777"}];

const INIT_CATS = [
  {id:"c1",name:"Lo más pedido",icon:"🔥",active:true,order:0},
  {id:"c2",name:"Entradas",icon:"🥗",active:true,order:1},
  {id:"c3",name:"Platos fuertes",icon:"🍖",active:true,order:2},
  {id:"c4",name:"Bebidas",icon:"🥤",active:true,order:3},
  {id:"c5",name:"Postres",icon:"🍮",active:true,order:4},
];
const INIT_PRODUCTS = [
  {id:"p1",catId:"c1",name:"Bandeja Paisa Completa",price:38000,desc:"Frijoles rojos, arroz, chicharrón, carne molida, chorizo, huevo frito, plátano y arepa.",emoji:"🍛",img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",active:true,featured:true,stock:true,label:"Lo más pedido",labelColor:"#f97316",allergens:["gluten","huevo"],clicks:289},
  {id:"p2",catId:"c1",name:"Costillas BBQ Ahumadas",price:48000,desc:"Costillas ahumadas 6 horas con salsa BBQ artesanal de mora.",emoji:"🍖",img:"https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",active:true,featured:true,stock:true,label:"Chef recomienda",labelColor:"#8b5cf6",allergens:[],clicks:201},
  {id:"p3",catId:"c3",name:"Lomo al Trapo",price:52000,desc:"Lomo de res en sal gruesa asado al carbón. Papa criolla y ensalada.",emoji:"🥩",img:"https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80",active:true,featured:false,stock:true,label:"Especial",labelColor:"#059669",allergens:[],clicks:178},
  {id:"p4",catId:"c2",name:"Patacones con Hogao",price:18000,desc:"Patacón crujiente con hogao casero y queso costeño.",emoji:"🫓",img:"https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80",active:true,featured:false,stock:true,label:"Popular",labelColor:"#f97316",allergens:["lacteo"],clicks:142},
  {id:"p5",catId:"c2",name:"Empanadas de Pipián",price:15000,desc:"3 empanadas de pipián de papa y maní. Ají de maracuyá.",emoji:"🥟",img:"https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",active:true,featured:false,stock:true,label:"",labelColor:"#f97316",allergens:["mani"],clicks:98},
  {id:"p6",catId:"c3",name:"Pollo Sudado Criollo",price:32000,desc:"En salsa criolla con papa, yuca y arroz blanco.",emoji:"🍗",img:"https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600&q=80",active:true,featured:false,stock:false,label:"",labelColor:"#f97316",allergens:[],clicks:87},
  {id:"p7",catId:"c4",name:"Limonada de Coco",price:12000,desc:"Limonada con crema de coco y hierbabuena.",emoji:"🥥",img:"https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",active:true,featured:false,stock:true,label:"Popular",labelColor:"#2563eb",allergens:["lacteo"],clicks:176},
  {id:"p8",catId:"c4",name:"Michelada Artesanal",price:18000,desc:"Cerveza artesanal con limón, sal de gusano y chiles.",emoji:"🍺",img:"https://images.unsplash.com/photo-1566633806827-5f2ee7d0f4dc?w=600&q=80",active:true,featured:false,stock:true,label:"",labelColor:"#f97316",allergens:[],clicks:134},
  {id:"p9",catId:"c5",name:"Flan de Arequipe",price:14000,desc:"Flan artesanal en arequipe casero con nueces caramelizadas.",emoji:"🍮",img:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",active:true,featured:false,stock:true,label:"",labelColor:"#f97316",allergens:["lacteo","huevo"],clicks:94},
  {id:"p10",catId:"c5",name:"Cholado Caleño",price:11000,desc:"Hielo raspado con frutas tropicales y siropes artesanales.",emoji:"🧊",img:"https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600&q=80",active:true,featured:false,stock:true,label:"Típico",labelColor:"#db2777",allergens:[],clicks:78},
];
const INIT_CONFIG = {
  name:"La Leña", tagline:"Cocina de fuego lento · Desde 1998", logo:"🔥",
  primaryColor:"#f97316", menuStyle:"dark", menuFont:"modern",
  city:"Cali", address:"Cra 5 #15-32, El Peñón", phone:"+57 300 123 4567",
  whatsapp:"573001234567", schedule:"Lun–Vie 11am–10pm · Sáb–Dom 11am–11pm",
  coverImg:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=85",
  bgImg:"", openStatus:true, deliveryFee:5000, showAllergens:true,
  banners:[],
  promoPopup:{active:false,img:"",bgColor:"#7c3aed",title:"",subtitle:"",ctaText:"Ver promoción",linkType:"none",linkCatId:"",linkUrl:"",frequency:"session",delay:20},
  socialLinks:{facebook:"",instagram:"",tiktok:"",whatsapp:"573001234567",tripadvisor:""},
};
const INIT_BILLING = {
  plan:"pro", status:"active", daysLeft:18, nextPayment:"2026-05-10", amount:99900,
  card:"**** **** **** 4821", cardBrand:"Visa",
  history:[
    {id:"INV-003",date:"2026-03-01",amount:99900,status:"paid",plan:"Pro"},
    {id:"INV-002",date:"2026-02-01",amount:99900,status:"paid",plan:"Pro"},
    {id:"INV-001",date:"2026-01-01",amount:49900,status:"paid",plan:"Starter"},
  ],
};
// ─── DATOS BANCARIOS (personaliza con los tuyos) ──────────────
const BANK_INFO = {
  titular:"Steven Muñoz",
  cedula:"1.234.567.890",
  banks:[
    {name:"Nequi",icon:"💜",number:"310-XXX-XXXX",type:"Nequi"},
    {name:"Bancolombia",icon:"🟡",number:"123-456789-01",type:"Cuenta Ahorros"},
    {name:"Daviplata",icon:"🔴",number:"311-XXX-XXXX",type:"Daviplata"},
  ],
  instructions:"1. Realiza la transferencia al número/cuenta de tu preferencia.\n2. En la referencia escribe el nombre de tu restaurante.\n3. Toma captura del comprobante y súbela aquí.\n4. El equipo Gotup verificará y activará tu plan en máximo 24 horas hábiles.",
};
const PLANS_CATALOG = [
  {id:"starter",name:"Starter",price:49900,color:"#2563eb",features:["Menú digital QR","Hasta 30 productos","1 sucursal","Soporte email"]},
  {id:"pro",name:"Pro",price:99900,color:"#6d28d9",features:["Productos ilimitados","Delivery","Reservas","Asistente IA","Soporte 24/7"],popular:true},
  {id:"business",name:"Business",price:189900,color:"#db2777",features:["Todo Pro","Multi-sucursal","API acceso","Manager dedicado"]},
];
const INIT_BRANCHES = [
  {id:"b1",name:"La Leña — El Peñón",address:"Cra 5 #15-32, El Peñón",city:"Cali",phone:"+57 300 123 4567",manager:"Carlos Mejía",status:true,
    services:{menuDigital:true,domicilios:true,reservas:true,pedidoMesa:true,pickup:false},
    deliveryZones:[
      {id:"z1",name:"El Peñón - San Antonio",color:"#6d28d9",price:4000,minTime:20,maxTime:35,active:true,points:[[120,80],[200,80],[200,160],[120,160]]},
      {id:"z2",name:"Granada - Versalles",color:"#059669",price:5000,minTime:25,maxTime:40,active:true,points:[[210,70],[310,70],[310,150],[210,150]]},
      {id:"z3",name:"Ciudad Jardín",color:"#dc2626",price:6000,minTime:30,maxTime:50,active:true,points:[[100,170],[220,170],[220,250],[100,250]]},
    ],
    schedule:{mon:{open:"11:00",close:"22:00",active:true},tue:{open:"11:00",close:"22:00",active:true},wed:{open:"11:00",close:"22:00",active:true},thu:{open:"11:00",close:"22:00",active:true},fri:{open:"11:00",close:"23:00",active:true},sat:{open:"11:00",close:"23:00",active:true},sun:{open:"12:00",close:"21:00",active:true}},
  },
  {id:"b2",name:"La Leña — Granada",address:"Av. 9N #14-52, Granada",city:"Cali",phone:"+57 300 987 6543",manager:"Andrea Ríos",status:true,
    services:{menuDigital:true,domicilios:false,reservas:true,pedidoMesa:false,pickup:true},
    deliveryZones:[],
    schedule:{mon:{open:"12:00",close:"22:00",active:true},tue:{open:"12:00",close:"22:00",active:true},wed:{open:"12:00",close:"22:00",active:true},thu:{open:"12:00",close:"22:00",active:true},fri:{open:"12:00",close:"23:00",active:true},sat:{open:"12:00",close:"23:00",active:true},sun:{open:"13:00",close:"21:00",active:false}},
  },
];
const ALLERGENS_LIST = [
  {id:"gluten",l:"Gluten",i:"🌾"},{id:"lacteo",l:"Lácteos",i:"🥛"},
  {id:"huevo",l:"Huevo",i:"🥚"},{id:"mani",l:"Maní",i:"🥜"},
  {id:"mariscos",l:"Mariscos",i:"🦐"},{id:"picante",l:"Picante",i:"🌶️"},
  {id:"vegano",l:"Vegano",i:"🌿"},{id:"soja",l:"Soja",i:"🫘"},
];
const LABEL_PRESETS = [
  {name:"Popular",color:"#f97316"},{name:"Nuevo",color:"#8b5cf6"},
  {name:"Lo más pedido",color:"#dc2626"},{name:"Chef recomienda",color:"#059669"},
  {name:"Especial",color:"#2563eb"},{name:"Típico",color:"#db2777"},
];
const KANBAN_COLS = [
  {key:"pendiente",label:"Pendiente",color:"#f59e0b"},
  {key:"en_cocina",label:"En cocina",color:"#3b82f6"},
  {key:"listo",label:"Listo",color:"#059669"},
  {key:"en_camino",label:"En camino",color:"#8b5cf6"},
  {key:"entregado",label:"Entregado",color:"#9ca3af"},
];
const K_NEXT = {pendiente:"en_cocina",en_cocina:"listo",listo:"en_camino",en_camino:"entregado"};
const ANALYTICS_WEEK = [{d:"Lu",v:120,o:18},{d:"Ma",v:98,o:14},{d:"Mi",v:145,o:22},{d:"Ju",v:210,o:38},{d:"Vi",v:289,o:54},{d:"Sa",v:342,o:71},{d:"Do",v:187,o:29}];
const PLAN_MAP = {
  starter:{label:"Starter",color:T.blue,price:49900},
  pro:{label:"Pro",color:T.violet,price:99900},
  business:{label:"Business",color:T.pink,price:189900},
};
const STATUS_MAP = {
  active:{label:"Activo",color:T.green},
  suspended:{label:"Suspendido",color:T.red},
  trial:{label:"Trial",color:T.amber},
  inactive:{label:"Inactivo",color:T.mid},
};

/* ─── VERTICALES DE NEGOCIO ───────────────────────────────── */
const VERTICALS = {
  restaurant:{
    id:"restaurant",name:"Restaurante / Cafetería",icon:"🍽️",color:"#f97316",
    desc:"Restaurantes, cafeterías, bares, food trucks, dark kitchens",
    labels:{catalog:"Menú",item:"Plato",itemPlural:"Platos",category:"Categoría",categoryPlural:"Categorías",
      order:"Pedido",delivery:"Domicilio",branch:"Sucursal",stock:"Disponibilidad",
      design:"Diseño del menú",nav_products:"🍽️ Productos",nav_delivery:"🛵 Delivery / Pedidos",
      nav_design:"🎨 Diseño del menú",nav_stock:"📦 Fuera de stock",
      nav_branches:"🏪 Sucursales",home_products:"Platos activos",home_orders:"Pedidos hoy",
      public_title:"Menú Digital",btn_view:"Ver menú",cta:"¡Haz tu pedido!",
      cat_example:"Platos fuertes",item_example:"Bandeja paisa",item_photo:"Foto del plato",
      banner_tip:"con el plato protagonista centrado y texto corto en la imagen",
      // Customer UX labels
      featured_label:"Recomendados",popular_label:"Más pedidos",catalog_btn:"🍽️ Ver carta completa",
      how_order:"¿Cómo quieres tu pedido?",table_mode:true,
      delivery_title:"Pedir a domicilio",delivery_desc:"Recibe tu pedido en casa",delivery_icon:"🛵",
      pickup_title:"Recoger en el local",pickup_desc:"Pides y recoges tú mismo",
      table_title:"En mesa",table_desc:"Pedido directo a tu mesa",
      notes_placeholder:"Sin cebolla, extra salsa…",
      status_processing_icon:"👨‍🍳",status_processing:"En preparación",status_processing_desc:"¡Tu pedido está siendo preparado!",
      status_ready:"Listo para entregar",status_ready_desc:"Tu pedido está listo. ¡Pronto saldrá!",
      status_shipping_icon:"🛵",status_shipping:"¡En camino!",status_shipping_desc:"Tu domicilio está en camino.",
      status_done:"¡Entregado!",status_done_desc:"¡Buen provecho!",
      delivery_fee_label:"Domicilio",confirm_btn:"Confirmar pedido",
      cart_title:"Tu pedido",checkout_title:"Tus datos",summary_title:"Pago y resumen"},
    emojis:["🔥","🍕","🌮","🍣","🥩","🍔","🍗","🥗","☕","🍺","🧇","🐟"],
  },
  fashion:{
    id:"fashion",name:"Moda & Ropa",icon:"👗",color:"#ec4899",
    desc:"Tiendas de ropa, calzado, accesorios, boutiques",
    labels:{catalog:"Catálogo",item:"Prenda",itemPlural:"Prendas",category:"Colección",categoryPlural:"Colecciones",
      order:"Pedido",delivery:"Envío",branch:"Tienda",stock:"Inventario",
      design:"Diseño de la tienda",nav_products:"👗 Catálogo",nav_delivery:"📦 Envíos / Pedidos",
      nav_design:"🎨 Diseño de la tienda",nav_stock:"🚫 Sin stock",
      nav_branches:"🏪 Tiendas",home_products:"Prendas activas",home_orders:"Pedidos hoy",
      public_title:"Tienda Online",btn_view:"Ver catálogo",cta:"¡Compra ahora!",
      cat_example:"Vestidos de noche",item_example:"Vestido floral manga corta",item_photo:"Foto de la prenda",
      banner_tip:"con la prenda o modelo protagonista centrado y texto corto",
      featured_label:"Destacados",popular_label:"Más vendidos",catalog_btn:"🛍️ Ver catálogo completo",
      how_order:"¿Cómo quieres recibirlo?",table_mode:false,
      delivery_title:"Envío a domicilio",delivery_desc:"Recibe tu compra en casa",delivery_icon:"🚚",
      pickup_title:"Recoger en tienda",pickup_desc:"Pides online y recoges tú",
      notes_placeholder:"Talla, color, instrucciones especiales…",
      status_processing_icon:"📦",status_processing:"Procesando pedido",status_processing_desc:"Estamos preparando tu pedido.",
      status_ready:"Listo para envío",status_ready_desc:"Tu pedido está empacado. ¡En camino!",
      status_shipping_icon:"🚚",status_shipping:"¡Enviado!",status_shipping_desc:"Tu pedido está en camino.",
      status_done:"¡Recibido!",status_done_desc:"¡Gracias por tu compra!",
      delivery_fee_label:"Envío",confirm_btn:"Confirmar compra",
      cart_title:"Tu carrito",checkout_title:"Tus datos",summary_title:"Resumen de compra"},
    emojis:["👗","👠","👜","🧢","💍","🕶️","👒","👔","🛍️","✨","💎","🧣"],
  },
  hardware:{
    id:"hardware",name:"Ferretería / Construcción",icon:"🔧",color:"#d97706",
    desc:"Ferreterías, materiales de construcción, herramientas, plomería",
    labels:{catalog:"Catálogo",item:"Producto",itemPlural:"Productos",category:"Categoría",categoryPlural:"Categorías",
      order:"Pedido",delivery:"Entrega",branch:"Local",stock:"Inventario",
      design:"Diseño del catálogo",nav_products:"🔧 Productos",nav_delivery:"🚚 Entregas / Pedidos",
      nav_design:"🎨 Diseño del catálogo",nav_stock:"📦 Sin stock",
      nav_branches:"🏭 Locales",home_products:"Productos activos",home_orders:"Pedidos hoy",
      public_title:"Catálogo Digital",btn_view:"Ver catálogo",cta:"¡Cotiza ahora!",
      cat_example:"Herramientas eléctricas",item_example:"Taladro percutor 1/2\"",item_photo:"Foto del producto",
      banner_tip:"con el producto o marca destacado y texto corto en la imagen",
      featured_label:"Destacados",popular_label:"Más solicitados",catalog_btn:"🔧 Ver catálogo completo",
      how_order:"¿Cómo quieres recibirlo?",table_mode:false,
      delivery_title:"Entrega a domicilio",delivery_desc:"Te lo llevamos donde estás",delivery_icon:"🚚",
      pickup_title:"Recoger en local",pickup_desc:"Pasa por el local a recoger",
      notes_placeholder:"Especificaciones, cantidad, referencia…",
      status_processing_icon:"📦",status_processing:"Procesando pedido",status_processing_desc:"Estamos alistando tu pedido.",
      status_ready:"Listo para entregar",status_ready_desc:"Tu pedido está listo.",
      status_shipping_icon:"🚚",status_shipping:"En camino",status_shipping_desc:"Tu pedido está en camino.",
      status_done:"¡Entregado!",status_done_desc:"¡Gracias por tu pedido!",
      delivery_fee_label:"Entrega",confirm_btn:"Confirmar pedido",
      cart_title:"Tu pedido",checkout_title:"Tus datos",summary_title:"Resumen del pedido"},
    emojis:["🔧","🔨","⚙️","🪛","🪚","🔩","🏗️","🧰","🔌","💡","🪝","🔑"],
  },
  toys:{
    id:"toys",name:"Juguetería / Infantil",icon:"🧸",color:"#8b5cf6",
    desc:"Juguetes, ropa infantil, artículos para bebé, didácticos",
    labels:{catalog:"Catálogo",item:"Juguete",itemPlural:"Juguetes",category:"Categoría",categoryPlural:"Categorías",
      order:"Pedido",delivery:"Envío",branch:"Tienda",stock:"Disponibilidad",
      design:"Diseño de la tienda",nav_products:"🧸 Productos",nav_delivery:"📦 Envíos / Pedidos",
      nav_design:"🎨 Diseño de la tienda",nav_stock:"🚫 Sin stock",
      nav_branches:"🏪 Tiendas",home_products:"Productos activos",home_orders:"Pedidos hoy",
      public_title:"Tienda Infantil",btn_view:"Ver catálogo",cta:"¡Sorprende a los peques!",
      cat_example:"Juguetes educativos",item_example:"Rompecabezas 500 piezas",item_photo:"Foto del juguete",
      banner_tip:"con el juguete o personaje protagonista centrado y texto corto",
      featured_label:"Destacados",popular_label:"Más vendidos",catalog_btn:"🧸 Ver catálogo completo",
      how_order:"¿Cómo quieres recibirlo?",table_mode:false,
      delivery_title:"Envío a domicilio",delivery_desc:"Recibe el regalo en casa",delivery_icon:"🚚",
      pickup_title:"Recoger en tienda",pickup_desc:"Pides y recoges tú mismo",
      notes_placeholder:"Mensaje para regalo, instrucciones especiales…",
      status_processing_icon:"📦",status_processing:"Preparando pedido",status_processing_desc:"Estamos empacando tu pedido.",
      status_ready:"Listo para envío",status_ready_desc:"Tu pedido está listo.",
      status_shipping_icon:"🚚",status_shipping:"¡Enviado!",status_shipping_desc:"Tu pedido está en camino.",
      status_done:"¡Recibido!",status_done_desc:"¡Esperamos que les encante!",
      delivery_fee_label:"Envío",confirm_btn:"Confirmar compra",
      cart_title:"Tu carrito",checkout_title:"Datos de entrega",summary_title:"Resumen de compra"},
    emojis:["🧸","🎮","🎯","🎪","🎨","🎭","🪁","🛝","🎠","🧩","🪀","🎲"],
  },
  beauty:{
    id:"beauty",name:"Belleza & Salud",icon:"💄",color:"#db2777",
    desc:"Salones, spas, cosméticos, farmacias, bienestar",
    labels:{catalog:"Servicios & Productos",item:"Servicio",itemPlural:"Servicios",category:"Categoría",categoryPlural:"Categorías",
      order:"Reserva",delivery:"Domicilio",branch:"Local",stock:"Disponibilidad",
      design:"Diseño del perfil",nav_products:"💄 Servicios",nav_delivery:"📋 Reservas / Pedidos",
      nav_design:"🎨 Diseño del perfil",nav_stock:"🚫 Sin disponibilidad",
      nav_branches:"🏪 Locales",home_products:"Servicios activos",home_orders:"Reservas hoy",
      public_title:"Catálogo & Servicios",btn_view:"Ver servicios",cta:"¡Reserva tu cita!",
      cat_example:"Tratamientos faciales",item_example:"Limpieza profunda de cutis",item_photo:"Foto del servicio",
      banner_tip:"con el servicio o resultado protagonista centrado y texto corto",
      featured_label:"Más populares",popular_label:"Más solicitados",catalog_btn:"💄 Ver todos los servicios",
      how_order:"¿Cómo lo prefieres?",table_mode:false,
      delivery_title:"Servicio a domicilio",delivery_desc:"El servicio llega donde estés",delivery_icon:"🚗",
      pickup_title:"En el local",pickup_desc:"Reserva y visítanos",
      notes_placeholder:"Alergias, preferencias, hora deseada…",
      status_processing_icon:"💆",status_processing:"Confirmando reserva",status_processing_desc:"Estamos confirmando tu reserva.",
      status_ready:"Confirmado",status_ready_desc:"Tu cita está confirmada.",
      status_shipping_icon:"🚗",status_shipping:"En camino",status_shipping_desc:"El profesional está en camino.",
      status_done:"¡Completado!",status_done_desc:"¡Gracias por tu visita!",
      delivery_fee_label:"Desplazamiento",confirm_btn:"Confirmar reserva",
      cart_title:"Tu selección",checkout_title:"Tus datos",summary_title:"Resumen de reserva"},
    emojis:["💄","💅","✂️","🧖","🌸","💆","🧴","💊","🌿","🫧","🪷","💋"],
  },
  tech:{
    id:"tech",name:"Tecnología / Electrónica",icon:"📱",color:"#2563eb",
    desc:"Celulares, computadores, accesorios tech, reparaciones",
    labels:{catalog:"Catálogo Tech",item:"Equipo",itemPlural:"Equipos",category:"Categoría",categoryPlural:"Categorías",
      order:"Pedido",delivery:"Envío",branch:"Tienda",stock:"Inventario",
      design:"Diseño de la tienda",nav_products:"📱 Productos",nav_delivery:"📦 Envíos / Pedidos",
      nav_design:"🎨 Diseño de la tienda",nav_stock:"🚫 Sin stock",
      nav_branches:"🏪 Tiendas",home_products:"Equipos activos",home_orders:"Pedidos hoy",
      public_title:"Tienda Tech",btn_view:"Ver catálogo",cta:"¡Compra tech!",
      cat_example:"Celulares y tablets",item_example:"iPhone 15 Pro 256GB",item_photo:"Foto del equipo",
      banner_tip:"con el equipo o marca protagonista centrado y texto corto",
      featured_label:"Lo nuevo",popular_label:"Más vendidos",catalog_btn:"📱 Ver catálogo tech",
      how_order:"¿Cómo quieres recibirlo?",table_mode:false,
      delivery_title:"Envío a domicilio",delivery_desc:"Recibe tu equipo en casa",delivery_icon:"🚚",
      pickup_title:"Recoger en tienda",pickup_desc:"Pasa por la tienda a reclamar",
      notes_placeholder:"Modelo, color, especificaciones…",
      status_processing_icon:"📦",status_processing:"Procesando pedido",status_processing_desc:"Verificando disponibilidad de tu equipo.",
      status_ready:"Listo para envío",status_ready_desc:"Tu equipo está empacado.",
      status_shipping_icon:"🚚",status_shipping:"¡Enviado!",status_shipping_desc:"Tu pedido está en camino.",
      status_done:"¡Recibido!",status_done_desc:"¡Disfruta tu nuevo equipo!",
      delivery_fee_label:"Envío",confirm_btn:"Confirmar compra",
      cart_title:"Tu carrito",checkout_title:"Datos de envío",summary_title:"Resumen de compra"},
    emojis:["📱","💻","🖥️","⌨️","🖱️","🎧","📷","🔋","💾","🖨️","📡","🎮"],
  },
  grocery:{
    id:"grocery",name:"Tienda / Supermercado",icon:"🛒",color:"#059669",
    desc:"Tiendas de barrio, supermercados, abarrotes, minimarkets",
    labels:{catalog:"Catálogo",item:"Producto",itemPlural:"Productos",category:"Sección",categoryPlural:"Secciones",
      order:"Pedido",delivery:"Domicilio",branch:"Punto de venta",stock:"Inventario",
      design:"Diseño de la tienda",nav_products:"🛒 Productos",nav_delivery:"🛵 Domicilios / Pedidos",
      nav_design:"🎨 Diseño de la tienda",nav_stock:"📦 Sin stock",
      nav_branches:"🏪 Puntos de venta",home_products:"Productos activos",home_orders:"Pedidos hoy",
      public_title:"Tienda Online",btn_view:"Ver productos",cta:"¡Pide a domicilio!",
      cat_example:"Frutas y verduras",item_example:"Aguacate Hass x unidad",item_photo:"Foto del producto",
      banner_tip:"con el producto o categoría protagonista centrado y texto corto",
      featured_label:"Destacados",popular_label:"Más pedidos",catalog_btn:"🛒 Ver todos los productos",
      how_order:"¿Cómo quieres recibirlo?",table_mode:false,
      delivery_title:"Domicilio",delivery_desc:"Recibe tu mercado en casa",delivery_icon:"🛵",
      pickup_title:"Recoger en tienda",pickup_desc:"Pasa y recoge tu pedido",
      notes_placeholder:"Sustituciones, cantidades exactas, instrucciones…",
      status_processing_icon:"🛒",status_processing:"Alistando pedido",status_processing_desc:"Estamos seleccionando tus productos.",
      status_ready:"Listo para despacho",status_ready_desc:"Tu pedido está listo.",
      status_shipping_icon:"🛵",status_shipping:"¡En camino!",status_shipping_desc:"Tu pedido viene en camino.",
      status_done:"¡Entregado!",status_done_desc:"¡Buen provecho!",
      delivery_fee_label:"Domicilio",confirm_btn:"Confirmar pedido",
      cart_title:"Tu pedido",checkout_title:"Tus datos",summary_title:"Pago y resumen"},
    emojis:["🛒","🏪","🥦","🧀","🥩","🍎","🧃","🥫","🧹","🏷️","🛍️","🌽"],
  },
  pets:{
    id:"pets",name:"Mascotas & Veterinaria",icon:"🐾",color:"#d97706",
    desc:"Petshops, veterinarias, grooming, accesorios para mascotas",
    labels:{catalog:"Catálogo",item:"Producto",itemPlural:"Productos",category:"Categoría",categoryPlural:"Categorías",
      order:"Pedido",delivery:"Envío",branch:"Tienda",stock:"Disponibilidad",
      design:"Diseño de la tienda",nav_products:"🐾 Productos",nav_delivery:"📦 Envíos / Pedidos",
      nav_design:"🎨 Diseño de la tienda",nav_stock:"🚫 Sin stock",
      nav_branches:"🏪 Tiendas",home_products:"Productos activos",home_orders:"Pedidos hoy",
      public_title:"Tienda de Mascotas",btn_view:"Ver catálogo",cta:"¡Todo para tu mascota!",
      cat_example:"Alimentos para perros",item_example:"Concentrado Royal Canin 15kg",item_photo:"Foto del producto",
      banner_tip:"con la mascota o producto protagonista centrado y texto corto",
      featured_label:"Destacados",popular_label:"Más vendidos",catalog_btn:"🐾 Ver catálogo completo",
      how_order:"¿Cómo quieres recibirlo?",table_mode:false,
      delivery_title:"Envío a domicilio",delivery_desc:"Lo recibe tu mascota en casa",delivery_icon:"🚚",
      pickup_title:"Recoger en tienda",pickup_desc:"Pasa por la tienda",
      notes_placeholder:"Raza, peso, edad de tu mascota, instrucciones…",
      status_processing_icon:"📦",status_processing:"Preparando pedido",status_processing_desc:"Estamos alistando tu pedido.",
      status_ready:"Listo para envío",status_ready_desc:"Tu pedido está listo.",
      status_shipping_icon:"🚚",status_shipping:"¡Enviado!",status_shipping_desc:"Tu pedido está en camino.",
      status_done:"¡Recibido!",status_done_desc:"¡Que lo disfrute tu mascota!",
      delivery_fee_label:"Envío",confirm_btn:"Confirmar pedido",
      cart_title:"Tu pedido",checkout_title:"Tus datos",summary_title:"Resumen del pedido"},
    emojis:["🐾","🐕","🐈","🦜","🐠","🐹","🦴","🐾","🧴","🏥","💊","🛁"],
  },
  services:{
    id:"services",name:"Servicios Profesionales",icon:"🏢",color:"#4338ca",
    desc:"Talleres, consultorías, agencias, servicios técnicos",
    labels:{catalog:"Portafolio",item:"Servicio",itemPlural:"Servicios",category:"Categoría",categoryPlural:"Categorías",
      order:"Cotización",delivery:"Despacho",branch:"Sede",stock:"Disponibilidad",
      design:"Diseño del perfil",nav_products:"🏢 Servicios",nav_delivery:"📋 Cotizaciones",
      nav_design:"🎨 Diseño del perfil",nav_stock:"🚫 No disponible",
      nav_branches:"🏢 Sedes",home_products:"Servicios activos",home_orders:"Cotizaciones hoy",
      public_title:"Portafolio Digital",btn_view:"Ver servicios",cta:"¡Solicita cotización!",
      cat_example:"Reparaciones eléctricas",item_example:"Instalación de tomacorrientes",item_photo:"Foto del servicio",
      banner_tip:"con el servicio o resultado protagonista centrado y texto corto",
      featured_label:"Servicios populares",popular_label:"Más solicitados",catalog_btn:"🏢 Ver portafolio completo",
      how_order:"¿Cómo prefieres el servicio?",table_mode:false,
      delivery_title:"Servicio a domicilio",delivery_desc:"Vamos donde nos necesitas",delivery_icon:"🚗",
      pickup_title:"En nuestra sede",pickup_desc:"Visítanos en la sede",
      notes_placeholder:"Describe lo que necesitas, dimensiones, urgencia…",
      status_processing_icon:"📋",status_processing:"Revisando solicitud",status_processing_desc:"Estamos revisando tu cotización.",
      status_ready:"Cotización lista",status_ready_desc:"Tu cotización está lista para revisar.",
      status_shipping_icon:"🚗",status_shipping:"En camino",status_shipping_desc:"Nuestro equipo está en camino.",
      status_done:"¡Completado!",status_done_desc:"¡Gracias por confiar en nosotros!",
      delivery_fee_label:"Desplazamiento",confirm_btn:"Enviar solicitud",
      cart_title:"Tu selección",checkout_title:"Tus datos",summary_title:"Resumen de solicitud"},
    emojis:["🏢","⚙️","🔨","🚗","🏠","💼","📋","🖥️","🔌","🏗️","🧰","📐"],
  },
};
const getVertical = t => VERTICALS[t] || VERTICALS.restaurant;

/* ─── HELPERS ─────────────────────────────────────────────── */
const fmtCOP = n => "$"+Number(n).toLocaleString("es-CO");
const newId  = () => "id"+Math.random().toString(36).slice(2,8);
const todayStr = () => new Date().toISOString().slice(0,10);
const timeNow  = () => new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});
const readFile = f => new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL(f);});

/* ─── UI ATOMS ────────────────────────────────────────────── */
function Card({children,style={},p=20,onClick,className}){
  return <div onClick={onClick} className={className} style={{background:T.white,borderRadius:16,border:`1px solid ${T.border}`,boxShadow:T.sh,padding:p,...style}}>{children}</div>;
}
function Btn({children,v="primary",onClick,disabled,full,sm,icon,style:sx={}}){
  const vs={
    primary:{bg:T.violet,c:"#fff",b:"none",sh:`0 2px 8px ${T.violet}40`},
    ceo:{bg:T.indigo,c:"#fff",b:"none",sh:`0 2px 8px ${T.indigo}40`},
    ghost:{bg:"transparent",c:T.violet,b:`1.5px solid ${T.violet}`,sh:"none"},
    light:{bg:T.violetL,c:T.violet,b:"none",sh:"none"},
    danger:{bg:T.redL,c:T.red,b:`1px solid ${T.red}30`,sh:"none"},
    success:{bg:T.greenL,c:T.green,b:`1px solid ${T.green}30`,sh:"none"},
    neutral:{bg:T.bg,c:T.mid,b:`1px solid ${T.border}`,sh:"none"},
    amber:{bg:T.amberL,c:T.amber,b:`1px solid ${T.amber}30`,sh:"none"},
    green:{bg:T.green,c:"#fff",b:"none",sh:`0 2px 8px ${T.green}40`},
    dark:{bg:T.sidebar,c:"#fff",b:"none",sh:"none"},
  };
  const vt=vs[v]||vs.primary;
  return <button onClick={disabled?undefined:onClick} disabled={disabled} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,background:vt.bg,color:vt.c,border:vt.b,boxShadow:vt.sh,borderRadius:10,padding:sm?"6px 14px":"10px 22px",fontWeight:700,fontSize:sm?12:13,fontFamily:"'Plus Jakarta Sans',sans-serif",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.45:1,width:full?"100%":"auto",transition:"all .15s",...sx}}>
    {icon&&<span style={{fontSize:sm?13:15}}>{icon}</span>}{children}
  </button>;
}
function Field({label,value,onChange,placeholder,type="text",textarea,rows=3,hint,required,prefix,suffix}){
  const s={width:"100%",boxSizing:"border-box",padding:`10px ${suffix?36:14}px 10px ${prefix?36:14}px`,background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",resize:textarea?"vertical":undefined,transition:"border-color .2s"};
  return <div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:5}}>{label}{required&&<span style={{color:T.violet}}> *</span>}</label>}
    <div style={{position:"relative"}}>
      {prefix&&<span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.light,pointerEvents:"none"}}>{prefix}</span>}
      {textarea?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s} onFocus={e=>e.target.style.borderColor=T.violet} onBlur={e=>e.target.style.borderColor=T.border}/>}
      {suffix&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:12,color:T.mid,pointerEvents:"none"}}>{suffix}</span>}
    </div>
    {hint&&<p style={{fontSize:11,color:T.light,marginTop:3}}>{hint}</p>}
  </div>;
}
function Toggle({value,onChange,label,sm}){
  return <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>onChange(!value)}>
    <div style={{width:sm?36:44,height:sm?20:24,borderRadius:sm?10:12,background:value?T.violet:T.border,position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{position:"absolute",top:sm?2:3,left:value?(sm?18:22):3,width:sm?16:18,height:sm?16:18,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.15)"}}/>
    </div>
    {label&&<span style={{fontSize:13,color:T.text,fontWeight:value?700:400,userSelect:"none"}}>{label}</span>}
  </div>;
}
function Tag({children,color=T.violet,sm}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:sm?9:10,fontWeight:700,padding:sm?"2px 7px":"3px 9px",borderRadius:20,background:color+"18",color,whiteSpace:"nowrap"}}>{children}</span>;
}
function Modal({title,icon,onClose,children,wide,extraWide}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(10,8,30,.5)",backdropFilter:"blur(8px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:extraWide?900:wide?660:480,maxHeight:"93vh",overflowY:"auto",boxShadow:T.shMd,animation:"scaleIn .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {icon&&<div style={{width:36,height:36,borderRadius:10,background:T.violetL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>}
          <span style={{fontWeight:800,fontSize:17,color:T.text}}>{title}</span>
        </div>
        <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",background:T.bg,border:`1px solid ${T.border}`,color:T.mid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>×</button>
      </div>
      {children}
    </div>
  </div>;
}
function Toast({msg,type="ok"}){
  return <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:99999,background:type==="err"?T.red:type==="warn"?T.amber:T.green,color:"#fff",borderRadius:20,padding:"10px 22px",fontSize:12,fontWeight:700,boxShadow:T.shMd,whiteSpace:"nowrap",animation:"fadeIn .25s ease",display:"flex",alignItems:"center",gap:7}}>
    {type==="ok"?"✓":type==="warn"?"⚠":"✕"} {msg}
  </div>;
}
function StatCard({icon,label,value,sub,color=T.violet,onClick}){
  return <Card style={{padding:"18px 20px",cursor:onClick?"pointer":"default"}} onClick={onClick} className={onClick?"hov":""}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:T.light,textTransform:"uppercase",letterSpacing:".6px",marginBottom:6}}>{label}</div>
        <div style={{fontSize:26,fontWeight:900,color:T.text,letterSpacing:"-.5px",lineHeight:1}}>{value}</div>
        {sub&&<div style={{fontSize:11,fontWeight:600,marginTop:5,color:sub.startsWith("↑")?T.green:sub.startsWith("↓")?T.red:T.mid}}>{sub}</div>}
      </div>
      <div style={{width:44,height:44,borderRadius:14,background:color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{icon}</div>
    </div>
  </Card>;
}
function PhotoInput({label,value,onChange,height=130,hint,dims}){
  const ref=useRef();
  const [tab,setTab]=useState("url");
  return <div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>{label}</label>}
    {dims&&<div style={{display:"flex",alignItems:"center",gap:6,background:T.violetL,borderRadius:8,padding:"5px 10px",marginBottom:8}}>
      <span style={{fontSize:13}}>📐</span>
      <div>
        <span style={{fontSize:10,fontWeight:800,color:T.violet}}>{dims.split("•")[0]?.trim()}</span>
        {dims.split("•").slice(1).map((d,i)=><span key={i} style={{fontSize:10,color:T.mid,fontWeight:500}}> · {d.trim()}</span>)}
      </div>
    </div>}
    <div style={{display:"flex",gap:5,marginBottom:8}}>
      {[["url","🔗 URL"],["file","📁 Archivo"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"4px 12px",borderRadius:20,border:`1.5px solid ${tab===k?T.violet:T.border}`,background:tab===k?T.violetL:"transparent",color:tab===k?T.violet:T.mid,fontSize:11,fontWeight:700}}>{l}</button>)}
      {value&&<button onClick={()=>onChange("")} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:20,border:`1px solid ${T.red}30`,background:T.redL,color:T.red,fontSize:11,fontWeight:700}}>✕ Quitar</button>}
    </div>
    {value&&<div style={{height,borderRadius:10,overflow:"hidden",marginBottom:8,border:`1px solid ${T.border}`}}><img src={value} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/></div>}
    {tab==="url"
      ?<input value={value} onChange={e=>onChange(e.target.value)} placeholder="https://images.unsplash.com/…" style={{width:"100%",boxSizing:"border-box",padding:"9px 13px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:12,color:T.text,outline:"none"}} onFocus={e=>e.target.style.borderColor=T.violet} onBlur={e=>e.target.style.borderColor=T.border}/>
      :<div onClick={()=>ref.current?.click()} style={{height:value?44:80,borderRadius:10,border:`2px dashed ${T.border}`,background:T.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.light,fontSize:13,fontWeight:600,gap:8}}>📁 {value?"Cambiar imagen":"Seleccionar imagen"}</div>
    }
    <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files?.[0];if(f)onChange(await readFile(f));}}/>
    {hint&&<p style={{fontSize:11,color:T.light,marginTop:3}}>{hint}</p>}
  </div>;
}

/* ─── LOGIN ───────────────────────────────────────────────── */
function Login({onLogin}){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const submit=async()=>{
    setErr("");setLoading(true);
    const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
    if(error){setErr("Correo o contraseña incorrectos.");setLoading(false);return;}
    const {data:profile}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
    if(profile) onLogin({...data.user,role:profile.role,name:profile.name,title:profile.title,avatar:profile.avatar,subscriptionExpiresAt:profile.subscription_expires_at||null,businessType:profile.business_type||"restaurant"});
    else{setErr("Perfil no encontrado.");setLoading(false);}
  };
  const inp={width:"100%",boxSizing:"border-box",padding:"12px 16px",background:"rgba(255,255,255,.08)",border:"1.5px solid rgba(255,255,255,.15)",borderRadius:12,color:"#fff",fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a0f1e 0%,#1a1040 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <style>{STYLES}</style>
    <div style={{width:"100%",maxWidth:420,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        {/* ── Gotup logo ── */}
        <div style={{width:72,height:72,borderRadius:22,background:"linear-gradient(145deg,#ea580c 0%,#f97316 40%,#fbbf24 100%)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",boxShadow:"0 10px 40px rgba(234,88,12,.55), inset 0 1px 0 rgba(255,255,255,.25)"}}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <defs>
              <linearGradient id="gw" x1="0" y1="44" x2="44" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255,255,255,0.75)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,1)"/>
              </linearGradient>
            </defs>
            {/* G arc — gap at upper-right, sweeps CCW all the way around to middle-right, then crossbar */}
            <path d="M32 11A15 15 0 1 0 37 23H24" stroke="url(#gw)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {/* Arrow shaft shooting up from the G gap */}
            <line x1="32" y1="11" x2="32" y2="3" stroke="url(#gw)" strokeWidth="4" strokeLinecap="round"/>
            {/* Arrow head */}
            <path d="M26.5 7.5L32 3L37.5 7.5" stroke="url(#gw)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <div style={{color:"#fff",fontWeight:900,fontSize:32,letterSpacing:"-.5px",lineHeight:1}}>Got<span style={{background:"linear-gradient(90deg,#fed7aa,#fde68a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>up</span></div>
        <div style={{color:"rgba(255,255,255,.4)",fontSize:10,marginTop:7,letterSpacing:"3px",fontWeight:700,textTransform:"uppercase"}}>Digital Business Platform</div>
      </div>
      <div style={{background:"rgba(255,255,255,.06)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:32}}>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",display:"block",marginBottom:6}}>CORREO</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.co" style={inp} onFocus={e=>e.target.style.borderColor="rgba(167,139,250,.8)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.15)"}/>
        </div>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",display:"block",marginBottom:6}}>CONTRASEÑA</label>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={inp} onFocus={e=>e.target.style.borderColor="rgba(167,139,250,.8)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.15)"}/>
        </div>
        {err&&<div style={{background:"rgba(220,38,38,.15)",border:"1px solid rgba(220,38,38,.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#fca5a5",marginBottom:14}}>⚠ {err}</div>}
        <button onClick={submit} disabled={loading} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#6d28d9,#4338ca)",border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading?<div style={{width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite"}}/>:"🔐"}{loading?"Verificando…":"Ingresar"}
        </button>
      </div>
      <button onClick={()=>window.location.href="?menu"} style={{width:"100%",marginTop:14,padding:"12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:12,color:"rgba(255,255,255,.65)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
        👁️ Ver menú del cliente (demo público)
      </button>
    </div>
  </div>;
}

/* ─── ADMIN SIDEBAR ───────────────────────────────────────── */
const getAdminNav = (vl) => [
  {id:"home",   label:"🏠 Home"},
  {id:"sucursales", label:`${vl.nav_branches||"🏪 Sucursales"}`},
  {id:"productos",  label:vl.nav_products||"🍽️ Productos"},
  {id:"categorias", label:`🗂️ ${vl.categoryPlural||vl.category||"Categorías"}`},
  {id:"stock",      label:vl.nav_stock||"📦 Fuera de stock"},
  {id:"diseno",     label:vl.nav_design||"🎨 Diseño"},
  {id:"banners",    label:"🎯 Banners"},
  {id:"delivery",   label:vl.nav_delivery||"🛵 Pedidos"},
  {id:"informes",   label:"📊 Informes"},
  {id:"ai",         label:"🤖 Asistente IA"},
  {id:"facturacion",label:"💳 Facturación"},
];
function AdminSidebar({active,onSelect,billing,newOrders,user,onLogout,isOpen,onClose,vertical}){
  const plan=billing?.plan||"pro";
  const planColor={starter:T.blue,pro:T.violet,business:T.pink}[plan]||T.violet;
  const vl = vertical?.labels || VERTICALS.restaurant.labels;
  const nav = getAdminNav(vl);
  return <>
    {/* Overlay mobile */}
    {isOpen&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:98,display:"none"}} className="mob-overlay"/>}
    <nav className={`admin-sidebar${isOpen?" open":""}`} style={{width:220,flexShrink:0,background:T.sidebar,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflowY:"auto"}}>
    <div style={{padding:"20px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:12,background:`linear-gradient(135deg,${vertical?.color||"#6d28d9"},#db2777)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{vertical?.icon||"⚡"}</div>
        <div>
          <div style={{color:"#fff",fontWeight:900,fontSize:16,letterSpacing:"-.2px"}}>Got<span style={{background:"linear-gradient(90deg,#fb923c,#fbbf24)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>up</span></div>
          <div style={{background:planColor+"30",color:planColor,borderRadius:20,padding:"1px 8px",fontSize:9,fontWeight:800,display:"inline-block",marginTop:2,textTransform:"uppercase"}}>Plan {plan}</div>
        </div>
      </div>
    </div>
    <div style={{flex:1,padding:"12px 8px",overflowY:"auto"}}>
      {/* Vertical badge */}
      {vertical&&<div style={{margin:"0 8px 10px",padding:"7px 10px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",gap:7}}>
        <span style={{fontSize:16}}>{vertical.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:"rgba(255,255,255,.9)",fontSize:10,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{vertical.name}</div>
          <div style={{color:"rgba(255,255,255,.35)",fontSize:9}}>{vl.catalog}</div>
        </div>
      </div>}
      {nav.map(item=>{
        const badge=item.id==="delivery"&&newOrders>0?newOrders:0;
        return <div key={item.id} onClick={()=>onSelect(item.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 13px",borderRadius:11,cursor:"pointer",background:active===item.id?"rgba(255,255,255,.13)":"transparent",marginBottom:3,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=active===item.id?"rgba(255,255,255,.13)":"rgba(255,255,255,.06)"} onMouseLeave={e=>e.currentTarget.style.background=active===item.id?"rgba(255,255,255,.13)":"transparent"}>
          <span style={{fontSize:13,fontWeight:active===item.id?700:500,color:active===item.id?"#fff":"rgba(255,255,255,.65)"}}>{item.label}</span>
          {badge>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:T.amber,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{badge}</span>}
        </div>;
      })}
    </div>
    <div style={{padding:"14px 16px",borderTop:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#6d28d9,#db2777)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{user.avatar}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:"#fff",fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
          <div style={{color:"rgba(255,255,255,.35)",fontSize:9}}>{user.title}</div>
        </div>
        <button onClick={onLogout} style={{background:"rgba(220,38,38,.15)",border:"none",borderRadius:7,color:"#fca5a5",fontSize:11,padding:"4px 7px",cursor:"pointer"}}>⏻</button>
      </div>
    </div>
    {/* Botón cerrar en mobile */}
    <button onClick={onClose} className="mob-close-btn" style={{display:"none",position:"absolute",top:12,right:12,background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"rgba(255,255,255,.7)",fontSize:18,width:32,height:32,cursor:"pointer",alignItems:"center",justifyContent:"center"}}>×</button>
  </nav>
  </>;
}

/* ─── ADMIN: HOME ─────────────────────────────────────────── */
function SecHome({products,orders,config,billing,onNav,vertical}){
  const vl=(vertical||VERTICALS.restaurant).labels;
  const pendingOrders=orders.filter(o=>o.status==="pendiente").length;
  const todayRev=orders.filter(o=>o.status==="entregado").reduce((s,o)=>s+(o.total||0),0);
  const vc=(vertical||VERTICALS.restaurant).color||T.violet;
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:22,display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
      <div>
        <h1 style={{fontSize:24,fontWeight:900,color:T.text,marginBottom:3}}>Hola, {config.name} 👋</h1>
        <p style={{color:T.mid,fontSize:13}}>{new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}</p>
      </div>
      {vertical&&<div style={{display:"flex",alignItems:"center",gap:8,background:vc+"15",border:`1px solid ${vc}30`,borderRadius:12,padding:"7px 12px"}}>
        <span style={{fontSize:18}}>{vertical.icon}</span>
        <div>
          <div style={{fontSize:11,fontWeight:800,color:vc}}>{vertical.name}</div>
          <div style={{fontSize:9,color:T.mid}}>{vl.catalog} Digital</div>
        </div>
      </div>}
    </div>
    <Card style={{marginBottom:20,background:`linear-gradient(135deg,${T.violetD},${T.pink})`,border:"none",padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{color:"rgba(255,255,255,.7)",fontSize:12,marginBottom:4}}>Estado del {vl.catalog.toLowerCase()}</div>
        <div style={{color:"#fff",fontSize:20,fontWeight:800}}>Plan {billing.plan.charAt(0).toUpperCase()+billing.plan.slice(1)} · Activo ✅</div>
        <div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginTop:4}}>Próxima factura: {billing.nextPayment} · {fmtCOP(billing.amount)}</div>
      </div>
      <button onClick={()=>onNav("facturacion")} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,padding:"8px 16px",cursor:"pointer"}}>Ver suscripción</button>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:14,marginBottom:20}}>
      <StatCard icon={(vertical||VERTICALS.restaurant).icon} label={vl.home_products} value={products.filter(p=>p.active&&p.stock).length} color={vc} onClick={()=>onNav("productos")}/>
      <StatCard icon="📋" label={`${vl.order}s pendientes`} value={pendingOrders} sub={pendingOrders>0?"¡Atención!":""} color={pendingOrders>0?T.amber:T.mid} onClick={()=>onNav("delivery")}/>
      <StatCard icon="💰" label="Ingresos hoy" value={fmtCOP(todayRev)} color={T.green}/>
      <StatCard icon="👁️" label={`Vistas ${vl.catalog.toLowerCase()}`} value={products.reduce((s,p)=>s+p.clicks,0)} sub="↑ Esta semana" color={T.blue}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card style={{minWidth:0,overflow:"hidden"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>📈 Vistas esta semana</div>
        <div style={{width:"100%",height:140}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ANALYTICS_WEEK} margin={{top:5,right:5,left:-25,bottom:0}}>
              <defs><linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.violet} stopOpacity={.2}/><stop offset="95%" stopColor={T.violet} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="d" tick={{fontSize:10,fill:T.light}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:8,border:`1px solid ${T.border}`,fontSize:11}}/>
              <Area type="monotone" dataKey="v" stroke={T.violet} fill="url(#gV)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card style={{minWidth:0,overflow:"hidden"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:12}}>⭐ Top productos</div>
        {[...products].sort((a,b)=>b.clicks-a.clicks).slice(0,5).map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:15,width:20,textAlign:"center",flexShrink:0}}>{p.emoji}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
              <div style={{width:`${Math.round((p.clicks/products[0]?.clicks)*100)}%`,height:4,background:T.violet,borderRadius:4,marginTop:3}}/>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:T.mid,flexShrink:0}}>{p.clicks}</span>
          </div>
        ))}
      </Card>
    </div>
  </div>;
}

/* ─── ADMIN: SUCURSALES ───────────────────────────────────── */
function useLeaflet(){
  const [ready,setReady]=useState(!!(window.L?.map));
  useEffect(()=>{
    if(ready)return;
    if(window.L?.map){setReady(true);return;}
    // CSS
    if(!document.getElementById("lf-css")){
      const lk=document.createElement("link");
      lk.id="lf-css";lk.rel="stylesheet";
      lk.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(lk);
    }
    if(document.getElementById("lf-js"))return;
    const s=document.createElement("script");
    s.id="lf-js";
    s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload=()=>setReady(true);
    document.head.appendChild(s);
  },[]);
  return ready;
}
function PolygonMap({zones,onUpdate,onAdd,onDelete,branchAddress,branchCity}){
  const leafletReady=useLeaflet();
  const mapDivRef=useRef(null);
  const mapRef=useRef(null);
  const polyLayersRef=useRef({});
  const drawPointsRef=useRef([]);
  const drawLayersRef=useRef([]); // temp markers + polyline while drawing
  const [isDrawing,setIsDrawing]=useState(false);
  const [ptCount,setPtCount]=useState(0);
  const [newForm,setNewForm]=useState(null);
  const [pendingLatLngs,setPendingLatLngs]=useState([]);
  const [editZone,setEditZone]=useState(null);
  const [drawColor,setDrawColor]=useState("#6d28d9");
  const COLORS=["#6d28d9","#059669","#dc2626","#2563eb","#d97706","#db2777","#0891b2","#f97316"];

  // Render / update a single zone polygon on the map
  const renderZone=useCallback((map,z)=>{
    if(!z.latLngs?.length)return;
    if(polyLayersRef.current[z.id]){map.removeLayer(polyLayersRef.current[z.id]);}
    const poly=window.L.polygon(z.latLngs.map(p=>[p.lat,p.lng]),{
      color:z.color,fillColor:z.color,fillOpacity:z.active?.3:.07,weight:2.5,opacity:z.active?1:.4,
    }).addTo(map);
    poly.bindPopup(`<b>${z.name}</b><br><span style="color:${z.color};font-weight:700">${fmtCOP(z.price)}</span> · ${z.minTime}–${z.maxTime} min`);
    polyLayersRef.current[z.id]=poly;
  },[]);

  // Init map once Leaflet is ready
  useEffect(()=>{
    if(!leafletReady||!mapDivRef.current||mapRef.current)return;
    const L=window.L;
    const initMap=([lat,lng])=>{
      const map=L.map(mapDivRef.current,{center:[lat,lng],zoom:14,zoomControl:true});
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
        attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a>',maxZoom:19,
      }).addTo(map);
      mapRef.current=map;
      // Marker for restaurant
      const icon=L.divIcon({html:'<div style="background:#db2777;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">🏪</div>',className:"",iconSize:[32,32],iconAnchor:[16,16]});
      L.marker([lat,lng],{icon}).addTo(map).bindPopup("<b>Tu restaurante</b>");
      // Render existing zones
      zones.forEach(z=>renderZone(map,z));
      // Click handler for polygon drawing
      map.on("click",e=>{
        if(!drawPointsRef.current._active)return;
        const latlng={lat:e.latlng.lat,lng:e.latlng.lng};
        drawPointsRef.current.push(latlng);
        setPtCount(drawPointsRef.current.length);
        // Dot marker
        const dot=L.circleMarker([latlng.lat,latlng.lng],{radius:5,color:"#fff",fillColor:drawPointsRef.current._color||"#6d28d9",fillOpacity:1,weight:2}).addTo(map);
        drawLayersRef.current.push(dot);
        // Redraw preview polyline
        drawLayersRef.current.filter(l=>l._isPreview).forEach(l=>map.removeLayer(l));
        if(drawPointsRef.current.length>=2){
          const line=L.polyline(drawPointsRef.current.map(p=>[p.lat,p.lng]),{color:drawPointsRef.current._color||"#6d28d9",dashArray:"6,4",weight:2});
          line._isPreview=true;
          line.addTo(map);
          drawLayersRef.current.push(line);
        }
      });
    };
    // Geocode with Nominatim (free OSM)
    const q=encodeURIComponent([branchAddress,branchCity].filter(Boolean).join(", ")||"Colombia");
    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,{headers:{"Accept-Language":"es"}})
      .then(r=>r.json())
      .then(data=>{
        if(data?.length) initMap([parseFloat(data[0].lat),parseFloat(data[0].lon)]);
        else initMap([4.711,-74.0721]);
      })
      .catch(()=>initMap([4.711,-74.0721]));
  },[leafletReady]);

  // Sync zones when they change
  useEffect(()=>{
    if(!mapRef.current)return;
    // Remove deleted
    Object.keys(polyLayersRef.current).forEach(id=>{
      if(!zones.find(z=>z.id===id)){mapRef.current.removeLayer(polyLayersRef.current[id]);delete polyLayersRef.current[id];}
    });
    zones.forEach(z=>renderZone(mapRef.current,z));
  },[zones,renderZone]);

  const startDraw=()=>{
    drawPointsRef.current=[];drawPointsRef.current._active=true;drawPointsRef.current._color=drawColor;
    setPtCount(0);setIsDrawing(true);
    if(mapRef.current)mapRef.current.getContainer().style.cursor="crosshair";
  };
  const cancelDraw=()=>{
    drawPointsRef.current=[];drawPointsRef.current._active=false;
    drawLayersRef.current.forEach(l=>mapRef.current?.removeLayer(l));
    drawLayersRef.current=[];
    setPtCount(0);setIsDrawing(false);setNewForm(null);setPendingLatLngs([]);
    if(mapRef.current)mapRef.current.getContainer().style.cursor="";
  };
  const closePoly=()=>{
    const pts=drawPointsRef.current;
    if(pts.length<3){alert("Necesitas al menos 3 puntos en el mapa.");return;}
    drawPointsRef.current._active=false;
    drawLayersRef.current.forEach(l=>mapRef.current?.removeLayer(l));
    drawLayersRef.current=[];
    if(mapRef.current)mapRef.current.getContainer().style.cursor="";
    setPendingLatLngs([...pts]);
    setNewForm({name:"",price:"5000",minTime:"20",maxTime:"40"});
    setIsDrawing(false);
  };
  const saveZone=()=>{
    if(!newForm?.name?.trim()||!pendingLatLngs.length)return;
    onAdd({id:newId(),name:newForm.name,color:drawColor,price:parseInt(newForm.price)||5000,minTime:parseInt(newForm.minTime)||20,maxTime:parseInt(newForm.maxTime)||40,active:true,latLngs:[...pendingLatLngs],points:[]});
    setPendingLatLngs([]);setNewForm(null);drawPointsRef.current=[];setPtCount(0);
  };

  return <div>
    {/* Toolbar */}
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
      {!isDrawing&&!newForm&&<button onClick={startDraw} style={{display:"flex",alignItems:"center",gap:6,background:T.violet,color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 10px ${T.violet}44`}}>✏️ Dibujar zona</button>}
      {isDrawing&&<div style={{display:"flex",alignItems:"center",gap:8,background:T.violetL,border:`1.5px solid ${T.violet}44`,borderRadius:10,padding:"8px 14px",flex:1,flexWrap:"wrap"}}>
        <span style={{fontSize:13,fontWeight:700,color:T.violet}}>🖊 Haz clic en el mapa para añadir vértices · {ptCount} punto{ptCount!==1?"s":""}</span>
        <div style={{display:"flex",gap:5}}>{COLORS.map(c=><div key={c} onClick={()=>{setDrawColor(c);drawPointsRef.current._color=c;}} style={{width:20,height:20,borderRadius:"50%",background:c,cursor:"pointer",border:drawColor===c?`3px solid ${T.text}`:"3px solid transparent"}}/>)}</div>
        <button onClick={closePoly} disabled={ptCount<3} style={{background:T.violet,color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:ptCount<3?"not-allowed":"pointer",opacity:ptCount<3?.5:1}}>✓ Cerrar zona</button>
        <button onClick={cancelDraw} style={{background:T.redL,color:T.red,border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>✕ Cancelar</button>
      </div>}
      <div style={{marginLeft:"auto",fontSize:12,color:T.mid}}>{zones.filter(z=>z.active).length} zona{zones.filter(z=>z.active).length!==1?"s":""} activa{zones.filter(z=>z.active).length!==1?"s":""}</div>
    </div>
    {/* Mapa */}
    {!leafletReady&&<div style={{height:420,borderRadius:14,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}><div style={{width:36,height:36,borderRadius:"50%",border:`3px solid ${T.border}`,borderTopColor:T.violet,animation:"spin .7s linear infinite"}}/><div style={{color:T.mid,fontSize:13}}>Cargando mapa…</div></div>}
    <div ref={mapDivRef} style={{height:420,borderRadius:14,overflow:"hidden",display:leafletReady?"block":"none",marginBottom:16,boxShadow:T.shMd}}/>
    {/* Modal nueva zona */}
    {newForm&&<div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:400,boxShadow:T.shMd}}>
        <div style={{fontWeight:900,fontSize:17,color:T.text,marginBottom:16}}>📍 Nueva zona de domicilio</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Color de la zona</label>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} onClick={()=>setDrawColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:drawColor===c?`3px solid ${T.text}`:"3px solid transparent"}}/>)}</div>
        </div>
        <Field label="Nombre de la zona" value={newForm.name} onChange={v=>setNewForm(p=>({...p,name:v}))} placeholder="Ej: Centro, Zona Norte…" required/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <Field label="💰 Precio" value={newForm.price} onChange={v=>setNewForm(p=>({...p,price:v}))} type="number" prefix="$" suffix="COP"/>
          <Field label="⏱ Min" value={newForm.minTime} onChange={v=>setNewForm(p=>({...p,minTime:v}))} type="number"/>
          <Field label="⏱ Max" value={newForm.maxTime} onChange={v=>setNewForm(p=>({...p,maxTime:v}))} type="number"/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <Btn full v="neutral" onClick={cancelDraw}>Cancelar</Btn>
          <Btn full disabled={!newForm.name?.trim()} onClick={saveZone}>✓ Guardar zona</Btn>
        </div>
      </div>
    </div>}
    {/* Modal editar zona */}
    {editZone&&<div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:400,boxShadow:T.shMd}}>
        <div style={{fontWeight:900,fontSize:17,color:T.text,marginBottom:16}}>✏️ Editar zona</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Color</label>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} onClick={()=>setEditZone(p=>({...p,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:editZone.color===c?`3px solid ${T.text}`:"3px solid transparent"}}/>)}</div>
        </div>
        <Field label="Nombre" value={editZone.name} onChange={v=>setEditZone(p=>({...p,name:v}))} required/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <Field label="💰 Precio" value={String(editZone.price)} onChange={v=>setEditZone(p=>({...p,price:parseInt(v)||0}))} type="number" prefix="$"/>
          <Field label="⏱ Min" value={String(editZone.minTime)} onChange={v=>setEditZone(p=>({...p,minTime:parseInt(v)||0}))} type="number"/>
          <Field label="⏱ Max" value={String(editZone.maxTime)} onChange={v=>setEditZone(p=>({...p,maxTime:parseInt(v)||0}))} type="number"/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <Btn full v="neutral" onClick={()=>setEditZone(null)}>Cancelar</Btn>
          <Btn full disabled={!editZone.name?.trim()} onClick={()=>{onUpdate(editZone.id,editZone);setEditZone(null);}}>✓ Guardar</Btn>
        </div>
      </div>
    </div>}
    {/* Tabla de zonas */}
    {zones.length>0&&<div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 48px 130px 90px 72px 80px",padding:"9px 16px",background:T.bg,borderBottom:`1px solid ${T.border}`}}>
        {["Zona","Color","Domicilio","Hora","Activo","Acciones"].map(h=><div key={h} style={{fontSize:11,fontWeight:800,color:T.light,textTransform:"uppercase",letterSpacing:".4px"}}>{h}</div>)}
      </div>
      {zones.map(z=>(
        <div key={z.id} style={{display:"grid",gridTemplateColumns:"1fr 48px 130px 90px 72px 80px",padding:"12px 16px",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}>
          <div style={{fontWeight:600,fontSize:13,color:T.text}}>{z.name}</div>
          <div style={{width:24,height:24,borderRadius:6,background:z.color}}/>
          <div style={{fontWeight:700,fontSize:13,color:T.text}}>{fmtCOP(z.price)}</div>
          <div style={{fontSize:13,color:T.mid}}>{z.minTime}–{z.maxTime} min</div>
          <Toggle value={z.active} onChange={v=>onUpdate(z.id,{active:v})} sm/>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setEditZone({...z})} style={{width:28,height:28,borderRadius:7,background:T.violetL,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✏️</button>
            <button onClick={()=>window.confirm(`¿Eliminar "${z.name}"?`)&&onDelete(z.id)} style={{width:28,height:28,borderRadius:7,background:T.redL,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🗑️</button>
          </div>
        </div>
      ))}
      <div style={{padding:"8px 16px",fontSize:11,color:T.light}}>En total hay {zones.length} polígono{zones.length!==1?"s":""} de domicilio</div>
    </div>}
    {zones.length===0&&!isDrawing&&<div style={{textAlign:"center",padding:"30px 20px",color:T.mid,fontSize:13,border:`2px dashed ${T.border}`,borderRadius:14}}>Sin zonas. Haz clic en <b>✏️ Dibujar zona</b> y traza el área de cobertura en el mapa.</div>}
  </div>;
}

// ── QR CARD (top-level — NO puede estar dentro de otro componente) ────────────
function QRCard({card,branchName}){
  const canvasRef=useRef(null);
  const [copied,setCopied]=useState(false);

  useEffect(()=>{
    if(!canvasRef.current)return;
    QRCodeLib.toCanvas(canvasRef.current,card.url,{
      width:220,margin:2,
      color:{dark:card.color,light:"#ffffff"}
    },err=>{if(err)console.error(err);});
  },[card.url,card.color]);

  const download=()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const a=document.createElement("a");
    a.href=canvas.toDataURL("image/png");
    a.download=`QR-${branchName||"sucursal"}-${card.key}.png`;
    a.click();
  };

  const copyLink=()=>{
    navigator.clipboard.writeText(card.url).then(()=>{
      setCopied(true);setTimeout(()=>setCopied(false),2000);
    });
  };

  const printQR=()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const img=canvas.toDataURL("image/png");
    const w=window.open("","_blank","width=500,height=600");
    w.document.write(`<!DOCTYPE html><html><head><title>QR ${card.label} — ${branchName||""}</title>
    <style>body{font-family:sans-serif;text-align:center;padding:40px;background:#fff}
    img{width:260px;height:260px;display:block;margin:0 auto 16px;border-radius:12px}
    h2{margin:0 0 6px;font-size:22px;color:${card.color}}
    p{margin:0 0 4px;font-size:13px;color:#666}
    small{font-size:11px;color:#aaa;word-break:break-all}
    @media print{button{display:none}}</style></head>
    <body>
    <h2>${card.emoji} ${card.label}</h2>
    <p style="font-size:15px;font-weight:700;color:#111">${branchName||""}</p>
    <img src="${img}" alt="QR"/>
    <p>${card.desc}</p>
    <small>${card.url}</small><br/><br/>
    <button onclick="window.print()" style="padding:10px 24px;background:${card.color};color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer">🖨️ Imprimir / Guardar PDF</button>
    </body></html>`);
    w.document.close();
  };

  return <div style={{background:"#fff",borderRadius:18,boxShadow:"0 2px 16px rgba(0,0,0,.08)",padding:20,display:"flex",flexDirection:"column",alignItems:"center",gap:10,border:`2px solid ${card.light}`}}>
    <div style={{width:36,height:36,borderRadius:10,background:card.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{card.emoji}</div>
    <div style={{fontWeight:800,fontSize:15,color:card.color}}>{card.label}</div>
    <div style={{fontSize:11,color:T.mid,textAlign:"center",lineHeight:1.4}}>{card.desc}</div>
    <canvas ref={canvasRef} data-qr={card.key} style={{borderRadius:12,border:`3px solid ${card.light}`}}/>
    <div style={{fontSize:10,color:T.mid,wordBreak:"break-all",textAlign:"center",maxWidth:220,lineHeight:1.3}}>{card.url}</div>
    <div style={{display:"flex",gap:6,width:"100%",flexWrap:"wrap"}}>
      <button onClick={download} style={{flex:1,minWidth:90,padding:"8px 0",background:card.color,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer"}}>⬇️ Descargar PNG</button>
      <button onClick={printQR} style={{flex:1,minWidth:90,padding:"8px 0",background:card.light,color:card.color,border:`1.5px solid ${card.color}`,borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer"}}>🖨️ PDF / Imprimir</button>
    </div>
    <button onClick={copyLink} style={{width:"100%",padding:"7px 0",background:copied?"#d1fae5":"#f3f4f6",color:copied?"#059669":T.mid,border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .2s"}}>
      {copied?"✅ ¡Link copiado!":"🔗 Copiar link"}
    </button>
  </div>;
}

// ── BRANCH QR COMPONENT ───────────────────────────────────────────────────────
function BranchQR({br,ownerId}){
  const origin=window.location.origin;
  const base=`${origin}${window.location.pathname}?menu&r=${ownerId}&b=${br?.id}`;

  const CARDS=[
    {key:"mesa",     label:"Mesa / Restaurante",   emoji:"📋", color:"#4f46e5", light:"#ede9fe", url:`${base}&mode=menu`,      desc:"El cliente escanea y ve la carta para comer en el restaurante"},
    {key:"domicilio",label:"Domicilio",             emoji:"🛵", color:"#059669", light:"#d1fae5", url:`${base}&mode=domicilio`, desc:"El cliente escanea y hace su pedido a domicilio"},
    {key:"publicidad",label:"Publicidad / General", emoji:"📢", color:"#d97706", light:"#fef3c7", url:base,                    desc:"QR general, el cliente elige el modo al ingresar"},
  ];

  const printAll=()=>{
    const items=CARDS.map(c=>{
      const canvas=document.querySelector(`canvas[data-qr="${c.key}"]`);
      return canvas?{...c,img:canvas.toDataURL("image/png")}:null;
    }).filter(Boolean);
    if(!items.length){alert("Los QR aún no terminaron de generarse. Espera un momento.");return;}
    const w=window.open("","_blank","width=700,height=800");
    w.document.write(`<!DOCTYPE html><html><head><title>QR Sucursal — ${br?.name||""}</title>
    <style>body{font-family:sans-serif;padding:30px;background:#fff}
    h1{text-align:center;font-size:22px;margin-bottom:4px}
    .sub{text-align:center;font-size:13px;color:#888;margin-bottom:24px}
    .grid{display:flex;flex-wrap:wrap;gap:24px;justify-content:center}
    .card{width:200px;text-align:center;padding:16px;border-radius:12px;border:2px solid #eee}
    .card img{width:180px;height:180px;border-radius:8px}
    .card h3{font-size:14px;margin:8px 0 4px}
    .card p{font-size:11px;color:#666;margin:0 0 4px}
    .card small{font-size:9px;color:#aaa;word-break:break-all}
    @media print{button{display:none!important}}</style></head>
    <body>
    <h1>🔲 Códigos QR</h1>
    <div class="sub">${br?.name||""} ${br?.city?`· ${br.city}`:""}</div>
    <div class="grid">
    ${items.map(c=>`<div class="card" style="border-color:${c.light}"><img src="${c.img}" alt="${c.label}"/><h3 style="color:${c.color}">${c.emoji} ${c.label}</h3><p>${c.desc}</p><small>${c.url}</small></div>`).join("")}
    </div><br/>
    <div style="text-align:center"><button onclick="window.print()" style="padding:12px 32px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer">🖨️ Imprimir / Guardar PDF</button></div>
    </body></html>`);
    w.document.close();
  };

  return <div style={{padding:"4px 0"}}>
    <div style={{fontWeight:800,fontSize:14,color:T.text,marginBottom:4}}>🔲 Códigos QR de esta sucursal</div>
    <div style={{fontSize:12,color:T.mid,marginBottom:16}}>Escanea con cualquier celular para abrir el menú directamente. Descarga o imprime cada QR.</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
      {CARDS.map(c=><QRCard key={c.key} card={c} branchName={br?.name}/>)}
    </div>
    <div style={{marginTop:16}}>
      <button onClick={printAll} style={{width:"100%",padding:"12px 0",background:"#4f46e5",color:"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:14,cursor:"pointer"}}>🖨️ Imprimir / PDF con los 3 QR juntos</button>
    </div>
  </div>;
}

function SecSucursales({branches,onUpdateBranch,onAddBranch,ownerId}){
  const [selected,setSelected]=useState(null);
  const [subTab,setSubTab]=useState("overview");
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({name:"",address:"",city:"",phone:"",manager:""});
  const [infoForm,setInfoForm]=useState(null);
  const [infoSaved,setInfoSaved]=useState(false);
  const SERVICES_DEFS=[
    {id:"menuDigital",icon:"📋",label:"Menú Digital",desc:"Menú QR para tus mesas",color:T.violet},
    {id:"domicilios",icon:"🛵",label:"Domicilios",desc:"Pedidos a domicilio con zonas",color:T.blue},
    {id:"pickup",icon:"🏪",label:"Pickup / Llevar",desc:"Pedidos para recoger",color:T.pink},
  ];
  const SUBTABS=[["overview","📋 Resumen"],["servicios","⚙️ Servicios"],["domicilios","🗺️ Zonas"],["horarios","🕐 Horarios"],["qr","🔲 QR"]];
  const DAYS_ES={mon:"Lunes",tue:"Martes",wed:"Miércoles",thu:"Jueves",fri:"Viernes",sat:"Sábado",sun:"Domingo"};
  const br=selected?branches.find(b=>b.id===selected.id)||selected:null;
  const upd=(id,patch)=>{onUpdateBranch(id,patch);setSelected(p=>p&&p.id===id?{...p,...patch}:p);};
  const selectBranch=b=>{setSelected(b);setSubTab("overview");setInfoForm({name:b.name,address:b.address||"",city:b.city||"",phone:b.phone||"",whatsapp:b.whatsapp||"",manager:b.manager||"",mapLink:b.mapLink||""});setInfoSaved(false);};
  const updZone=(zoneId,patch)=>{if(!br)return;const nz=br.deliveryZones.map(z=>z.id===zoneId?{...z,...patch}:z);upd(br.id,{deliveryZones:nz});};
  const addZone=zone=>{if(!br)return;const nz=[...br.deliveryZones,zone];upd(br.id,{deliveryZones:nz});};
  const delZone=zoneId=>{if(!br)return;const nz=br.deliveryZones.filter(z=>z.id!==zoneId);upd(br.id,{deliveryZones:nz});};
  const togSvc=k=>{if(!br)return;upd(br.id,{services:{...br.services,[k]:!br.services[k]}});};
  const SUC_CSS=`@media(min-width:769px){.suc-grid{display:grid!important;grid-template-columns:280px 1fr;gap:16px}.suc-list{display:block!important}.suc-detail{display:block!important}}@media(max-width:768px){.suc-grid{display:block!important}.suc-detail-mobile-hidden{display:none!important}.suc-list-mobile-hidden{display:none!important}}`;
  return <div style={{animation:"fadeUp .35s ease"}}>
    <style>{SUC_CSS}</style>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div>
        {selected&&<button onClick={()=>{setSelected(null);setInfoForm(null);}} className="suc-list-mobile-hidden" style={{background:"none",border:"none",color:T.violet,fontSize:13,fontWeight:700,cursor:"pointer",padding:"0 0 6px",display:"block"}}>← Todas las sucursales</button>}
        <h2 style={{fontSize:22,fontWeight:800,color:T.text}}>{selected?"":""}{selected?selected.name:"Sucursales"}</h2>
        <p style={{color:T.mid,fontSize:13,marginTop:2}}>{selected?`📍 ${selected.city}`:`${branches.length} sucursal${branches.length!==1?"es":""} · ${branches.filter(b=>b.status).length} activa${branches.filter(b=>b.status).length!==1?"s":""}`}</p>
      </div>
      {selected&&<Btn v="neutral" sm onClick={()=>{setSelected(null);setInfoForm(null);}}>← Volver</Btn>}
    </div>
    <div className="suc-grid" style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16}}>
      {/* Lista de sucursales - oculta en mobile cuando hay seleccionada */}
      <div className={selected?"suc-list-mobile-hidden":""}>
        {branches.map(b=>(
          <div key={b.id} onClick={()=>selectBranch(b)} className="hov" style={{background:T.white,borderRadius:14,border:`2px solid ${selected?.id===b.id?T.violet:T.border}`,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"all .15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontWeight:800,fontSize:13,color:T.violet,marginBottom:2}}>{b.name}</div>
                <div style={{fontSize:11,color:T.mid}}>{b.city}</div>
              </div>
              <div style={{width:8,height:8,borderRadius:"50%",background:b.status?T.green:T.red,marginTop:3}}/>
            </div>
            <div style={{fontSize:10,color:T.light,marginBottom:7}}>{b.address}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {Object.entries(b.services||{}).filter(([,v])=>v).map(([k])=>{const s=SERVICES_DEFS.find(x=>x.id===k);return s?<span key={k} title={s.label} style={{fontSize:14}}>{s.icon}</span>:null;})}
            </div>
            <div style={{fontSize:9,color:T.light,marginTop:5}}>ID: {b.id}</div>
          </div>
        ))}
      </div>
      {/* Detalle - oculto en mobile cuando no hay seleccionada */}
      {br&&<div className={!selected?"suc-detail-mobile-hidden":""}>
        <Card style={{marginBottom:14,padding:"14px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontWeight:900,fontSize:17,color:T.text,marginBottom:2}}>{br.name}</div>
              <div style={{fontSize:12,color:T.mid}}>📍 {br.address} · 👤 {br.manager}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Toggle value={br.status} onChange={v=>upd(br.id,{status:v})} label={br.status?"Activa":"Inactiva"}/>
            </div>
          </div>
          <div style={{background:T.bg,borderRadius:10,padding:"10px 14px",display:"flex",gap:8,flexWrap:"wrap"}}>
            {SERVICES_DEFS.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:br.services?.[s.id]?T.white:T.bg,border:`1px solid ${br.services?.[s.id]?s.color+"44":T.border}`}}>
                <span style={{fontSize:14}}>{s.icon}</span>
                <span style={{fontSize:11,fontWeight:700,color:br.services?.[s.id]?s.color:T.light}}>{s.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </Card>
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {SUBTABS.map(([k,l])=><button key={k} onClick={()=>setSubTab(k)} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${subTab===k?T.violet:T.border}`,background:subTab===k?T.violetL:T.white,color:subTab===k?T.violet:T.mid,fontSize:12,fontWeight:subTab===k?700:500,cursor:"pointer"}}>{l}</button>)}
        </div>
        {subTab==="overview"&&infoForm&&<Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>📋 Información de la sucursal</div>
          <Field label="Nombre de la sucursal" value={infoForm.name} onChange={v=>setInfoForm(p=>({...p,name:v}))} placeholder="Ej: La Leña — El Peñón" required/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="📍 Dirección" value={infoForm.address} onChange={v=>setInfoForm(p=>({...p,address:v}))} placeholder="Cra 5 #15-32, El Peñón"/>
            <Field label="🏙️ Ciudad" value={infoForm.city} onChange={v=>setInfoForm(p=>({...p,city:v}))} placeholder="Cali"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="📞 Teléfono" value={infoForm.phone} onChange={v=>setInfoForm(p=>({...p,phone:v}))} placeholder="+57 300 123 4567"/>
            <Field label="💬 WhatsApp" value={infoForm.whatsapp} onChange={v=>setInfoForm(p=>({...p,whatsapp:v}))} placeholder="573001234567" hint="Solo números, con código de país"/>
          </div>
          <Field label="👤 Encargado / Manager" value={infoForm.manager} onChange={v=>setInfoForm(p=>({...p,manager:v}))} placeholder="Carlos Mejía"/>
          <Field label="🗺️ Link de ubicación (Google Maps)" value={infoForm.mapLink} onChange={v=>setInfoForm(p=>({...p,mapLink:v}))} placeholder="https://maps.app.goo.gl/…" hint="Copia el link corto desde Google Maps → Compartir"/>
          {infoForm.mapLink&&<a href={infoForm.mapLink} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:T.violet,fontWeight:700,marginBottom:14,textDecoration:"none"}}>🔗 Ver en mapa →</a>}
          <Btn full onClick={()=>{upd(br.id,infoForm);setInfoSaved(true);setTimeout(()=>setInfoSaved(false),2500);}}>{infoSaved?"✓ ¡Guardado!":"Guardar cambios"}</Btn>
          {/* Resumen estado */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
            {[["🗺️","Zonas domicilio",`${br.deliveryZones?.length||0} configuradas`],["⚙️","Servicios activos",`${Object.values(br.services||{}).filter(Boolean).length}/${SERVICES_DEFS.length}`]].map(([ic,lb,vl])=>(
              <div key={lb} style={{background:T.bg,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:10,fontWeight:700,color:T.light,marginBottom:2}}>{ic} {lb}</div>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{vl}</div>
              </div>
            ))}
          </div>
          {Object.values(br.services||{}).some(v=>!v)&&<div style={{marginTop:14,border:`1.5px solid ${T.amber}44`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontWeight:800,color:T.amber,fontSize:13,marginBottom:7}}>Servicios disponibles para activar</div>
            {SERVICES_DEFS.filter(s=>!br.services?.[s.id]).map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:T.mid,marginBottom:5}}>
                <span>{s.icon}</span><span>{s.label}</span>
                <button onClick={()=>setSubTab("servicios")} style={{marginLeft:"auto",fontSize:10,color:T.violet,background:"none",border:`1px solid ${T.violet}`,borderRadius:20,padding:"2px 8px",cursor:"pointer"}}>Activar</button>
              </div>
            ))}
          </div>}
        </Card>}
        {subTab==="servicios"&&<Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>Activar / desactivar servicios</div>
          {SERVICES_DEFS.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{width:44,height:44,borderRadius:12,background:s.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>{s.label}</div>
                <div style={{fontSize:12,color:T.mid,marginTop:2}}>{s.desc}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:br.services?.[s.id]?T.green:T.light}}>{br.services?.[s.id]?"Activo":"Inactivo"}</span>
                <Toggle value={br.services?.[s.id]||false} onChange={()=>togSvc(s.id)} sm/>
              </div>
            </div>
          ))}
        </Card>}
        {subTab==="domicilios"&&<div>
          {!br.services?.domicilios&&<div style={{background:T.amberL,border:`1px solid ${T.amber}44`,borderRadius:12,padding:"12px 16px",marginBottom:14,fontSize:13,color:T.amber,fontWeight:600}}>⚠️ Activa "Domicilios" en Servicios para configurar zonas.</div>}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>Zonas de entrega con precios personalizados</div>
            <div style={{fontSize:12,color:T.mid}}>Dibuja polígonos haciendo click en el mapa. Cada zona puede tener precio y tiempo de entrega diferente.</div>
          </div>
          <PolygonMap zones={br.deliveryZones||[]} onUpdate={updZone} onAdd={addZone} onDelete={delZone} branchAddress={br.address} branchCity={br.city}/>
        </div>}
        {subTab==="horarios"&&<Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>Horarios de atención</div>
          {Object.entries(br.schedule||{}).map(([day,cfg])=>(
            <div key={day} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{width:76,fontSize:13,fontWeight:600,color:T.text}}>{DAYS_ES[day]}</div>
              <Toggle value={cfg.active} onChange={v=>{const ns={...br.schedule,[day]:{...cfg,active:v}};upd(br.id,{schedule:ns});}} sm/>
              {cfg.active?<div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="time" value={cfg.open} onChange={e=>{const ns={...br.schedule,[day]:{...cfg,open:e.target.value}};upd(br.id,{schedule:ns});}} style={{padding:"5px 8px",border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text,background:T.bg}}/>
                <span style={{color:T.mid,fontSize:12}}>a</span>
                <input type="time" value={cfg.close} onChange={e=>{const ns={...br.schedule,[day]:{...cfg,close:e.target.value}};upd(br.id,{schedule:ns});}} style={{padding:"5px 8px",border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text,background:T.bg}}/>
              </div>:<span style={{fontSize:12,color:T.light,fontStyle:"italic"}}>Cerrado</span>}
            </div>
          ))}
        </Card>}
        {subTab==="qr"&&<BranchQR br={br} ownerId={ownerId}/>}
      </div>}
    </div>
  </div>;
}

/* ─── ADMIN: PRODUCTOS ────────────────────────────────────── */
function SecProductos({products,cats,onAdd,onUpdate,onDelete,vertical,branches}){
  const vl = vertical?.labels || VERTICALS.restaurant.labels;
  const isRestaurant=!vertical||vertical.id==="restaurant";
  const multiBranch=branches?.length>1;
  const [modal,setModal]=useState(false);
  const [editP,setEditP]=useState(null);
  const [q,setQ]=useState("");
  const [fCat,setFCat]=useState("all");
  const [fSt,setFSt]=useState("all");
  const [fBranch,setFBranch]=useState("all");
  const [importModal,setImportModal]=useState(false);
  const [importRows,setImportRows]=useState([]);
  const [importError,setImportError]=useState("");
  const filtered=useMemo(()=>products.filter(p=>{
    const mQ=!q||p.name.toLowerCase().includes(q.toLowerCase());
    const mC=fCat==="all"||p.catId===fCat;
    const mS=fSt==="all"||(fSt==="active"&&p.active&&p.stock)||(fSt==="agotado"&&!p.stock)||(fSt==="oculto"&&!p.active);
    const mB=fBranch==="all"||(p.branchIds||["all"]).includes("all")||(p.branchIds||["all"]).includes(fBranch);
    return mQ&&mC&&mS&&mB;
  }),[products,q,fCat,fSt,fBranch]);

  const downloadTemplate=()=>{
    const sep=";";
    const header=["nombre","categoria","precio_menu","precio_domicilio","descripcion","activo","destacado"];
    const catNames=cats.length>0?cats.map(c=>c.name):["Hamburguesas","Bebidas","Platos fuertes"];
    const rows=[
      ["Hamburguesa Clásica",catNames[0]||"Hamburguesas","25000","28000","Carne 100% res con lechuga tomate y queso","si","no"],
      ["Limonada de Coco",catNames[1]||"Bebidas","8000","9000","Limonada natural con leche de coco","si","si"],
      ["Bandeja Paisa",catNames[2]||"Platos fuertes","38000","42000","Frijoles arroz chicharron huevo y arepa","si","si"],
    ];
    // sep= hint para Excel en español + encabezado de categorías disponibles
    const catHint=`## Categorias disponibles: ${catNames.join(" | ")}`;
    const csv=["sep=;",catHint,header.join(sep),...rows.map(r=>r.join(sep))].join("\n");
    const blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="plantilla_productos_gotup.csv";a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    setImportError("");
    if(!file.name.match(/\.(csv|txt)$/i)){setImportError("⚠️ Debes guardar el archivo como CSV desde Excel: Archivo → Guardar como → CSV UTF-8.");return;}
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        // Quitar BOM y limpiar
        const text=ev.target.result.replace(/^﻿/,"").replace(/\r/g,"");
        const allLines=text.split("\n");
        // Filtrar líneas de metadatos (sep=, ##, vacías)
        const lines=allLines.filter(l=>l.trim()&&!l.trim().startsWith("sep=")&&!l.trim().startsWith("##")&&!l.trim().startsWith("//"));
        if(lines.length<2){setImportError("El archivo está vacío o no tiene productos.");return;}
        // Detectar separador: ; o ,
        const sep=lines[0].includes(";")?";":",";
        const headers=lines[0].split(sep).map(h=>h.trim().replace(/^"|"$/g,"").toLowerCase().replace(/\s+/g,"_"));
        const rows=lines.slice(1).map(line=>{
          const vals=line.split(sep);
          const clean=vals.map(v=>v.trim().replace(/^"|"$/g,"").trim());
          return Object.fromEntries(headers.map((h,i)=>[h,clean[i]||""]));
        }).filter(r=>r.nombre&&r.nombre.trim()&&!r.nombre.startsWith("#"));
        if(rows.length===0){setImportError("No se encontraron productos válidos.");return;}
        setImportRows(rows);
        setImportModal(true);
      }catch(err){setImportError("Error al leer el archivo. Usa la plantilla descargada.");}
    };
    reader.readAsText(file,"UTF-8");
    e.target.value="";
  };

  const confirmImport=async()=>{
    let count=0;
    for(const row of importRows){
      const cat=cats.find(c=>c.name.toLowerCase()===row.categoria?.toLowerCase())||cats[0];
      const menuPrice=parseInt((row.precio_menu||row.precio||"0").replace(/\D/g,""))||0;
      const delivPrice=parseInt((row.precio_domicilio||"0").replace(/\D/g,""))||0;
      if(!menuPrice&&!delivPrice)continue;
      const p={id:newId(),catId:cat?.id||"",name:row.nombre,price:menuPrice||delivPrice,deliveryPrice:delivPrice||null,forMenu:menuPrice>0,forDelivery:delivPrice>0,desc:row.descripcion||"",emoji:"🍽️",img:"",active:(row.activo||"si").toLowerCase()==="si",featured:(row.destacado||"no").toLowerCase()==="si",stock:true,label:"",labelColor:"#f97316",allergens:[],clicks:0};
      await onAdd(p);count++;
    }
    setImportModal(false);setImportRows([]);
    alert(`✅ ${count} producto${count!==1?"s":""} importado${count!==1?"s":""} correctamente.`);
  };

  function PForm({init,onSave,onClose}){
    const isRestaurant=!vertical||vertical.id==="restaurant";
    const isFood=isRestaurant||vertical?.id==="grocery";
    const priceLabelA=isRestaurant?`📋 Precio ${vl.catalog||"menú"}`:`💰 Precio de venta`;
    const priceLabelB=isRestaurant?`🛵 Precio domicilio`:`🚚 Precio con ${(vl.delivery||"envío").toLowerCase()}`;
    const priceTip=isRestaurant?"💡 Deja en 0 el precio que no aplica — el producto solo aparecerá en ese canal.":`💡 Deja en 0 si no ofreces ${(vl.delivery||"envío").toLowerCase()} para esta ${(vl.item||"producto").toLowerCase()}.`;
    const labelPresetsLocal=isRestaurant?LABEL_PRESETS:[
      {name:"Popular",color:"#f97316"},{name:"Nuevo",color:"#8b5cf6"},
      {name:"Oferta",color:"#dc2626"},{name:"Exclusivo",color:"#059669"},
      {name:"Especial",color:"#2563eb"},{name:"Edición limitada",color:"#db2777"},
    ];
    const defaultEmoji=vl.item==="Plato"?"🍽️":vl.item==="Prenda"?"👗":vl.item==="Equipo"?"📱":vl.item==="Servicio"?"⚙️":"🛍️";
    const defaultBIds=branches?.length===1?[branches[0].id]:["all"];
    const [d,setD]=useState(init?{...init,price:String(init.price||0),deliveryPrice:String(init.deliveryPrice||""),branchIds:init.branchIds||defaultBIds}:{name:"",price:"",deliveryPrice:"",desc:"",catId:cats[0]?.id||"",emoji:defaultEmoji,img:"",active:true,featured:false,stock:true,forMenu:true,forDelivery:false,label:"",labelColor:"#f97316",allergens:[],branchIds:defaultBIds});
    const set=k=>v=>setD(p=>({...p,[k]:v}));
    const togA=id=>set("allergens")(d.allergens.includes(id)?d.allergens.filter(x=>x!==id):[...d.allergens,id]);
    const valid=d.name.trim()&&parseInt(d.price)>0&&d.catId;
    return <div>
      <PhotoInput label={vl.item_photo||"Foto del producto"} value={d.img} onChange={set("img")} dims="800×800 px • Cuadrada 1:1 • JPG o PNG • Máx 2MB"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 86px",gap:10}}>
        <Field label={`${vl.item||"Producto"} *`} value={d.name} onChange={set("name")} placeholder={`Ej: ${vl.item_example||"Producto destacado"}`} required/>
        <div><label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:5}}>Emoji</label><input value={d.emoji} onChange={e=>set("emoji")(e.target.value)} style={{width:"100%",padding:"10px 4px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:22,textAlign:"center",outline:"none"}}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label={priceLabelA} value={d.price} onChange={v=>{set("price")(v);if(parseInt(v)>0)setD(p=>({...p,forMenu:true}));}} type="number" placeholder="38000" prefix="$" suffix="COP"/>
        <Field label={priceLabelB} value={d.deliveryPrice} onChange={v=>{set("deliveryPrice")(v);if(parseInt(v)>0)setD(p=>({...p,forDelivery:true}));}} type="number" placeholder="42000" prefix="$" suffix="COP"/>
      </div>
      <div style={{background:T.violetL,borderRadius:8,padding:"6px 10px",fontSize:11,color:T.violet,marginBottom:14}}>
        {priceTip}
      </div>
      <Field label="Descripción" value={d.desc} onChange={set("desc")} textarea rows={3} placeholder="Ingredientes, preparación…"/>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Categoría *</label>
        <select value={d.catId} onChange={e=>set("catId")(e.target.value)} style={{width:"100%",padding:"10px 13px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}>
          {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Etiqueta badge</label>
        <div style={{display:"flex",gap:8,marginBottom:7}}>
          <input value={d.label} onChange={e=>set("label")(e.target.value)} placeholder="Popular, Nuevo…" style={{flex:1,padding:"9px 13px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}/>
          {d.label&&<input type="color" value={d.labelColor} onChange={e=>set("labelColor")(e.target.value)} style={{width:40,height:38,borderRadius:8,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {labelPresetsLocal.map(lp=><button key={lp.name} onClick={()=>setD(p=>({...p,label:lp.name,labelColor:lp.color}))} style={{padding:"3px 10px",borderRadius:20,border:`1.5px solid ${d.label===lp.name?lp.color:T.border}`,background:d.label===lp.name?lp.color+"18":"transparent",color:d.label===lp.name?lp.color:T.mid,fontSize:11,fontWeight:700,cursor:"pointer"}}>{lp.name}</button>)}
          {d.label&&<button onClick={()=>setD(p=>({...p,label:""}))} style={{padding:"3px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:"transparent",color:T.mid,fontSize:11,cursor:"pointer"}}>✕</button>}
        </div>
      </div>
      {isFood&&<div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>Alérgenos</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {ALLERGENS_LIST.map(a=><button key={a.id} onClick={()=>togA(a.id)} style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${d.allergens.includes(a.id)?T.violet:T.border}`,background:d.allergens.includes(a.id)?T.violetL:"transparent",color:d.allergens.includes(a.id)?T.violet:T.mid,fontSize:12,fontWeight:d.allergens.includes(a.id)?700:500,cursor:"pointer"}}>{a.i} {a.l}</button>)}
        </div>
      </div>}
      <div style={{background:T.bg,borderRadius:12,padding:14,marginBottom:18}}>
        <div style={{fontSize:11,fontWeight:700,color:T.mid,marginBottom:10,textTransform:"uppercase",letterSpacing:".5px"}}>Opciones</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Toggle value={d.active} onChange={set("active")} label={isRestaurant?"Visible en el menú":"Activo en el catálogo"}/>
          <Toggle value={d.stock} onChange={set("stock")} label="En stock / disponible"/>
          <Toggle value={d.featured} onChange={set("featured")} label="⭐ Producto destacado"/>
          {isRestaurant&&<Toggle value={d.forMenu!==false} onChange={set("forMenu")} label="📋 Aparece en menú digital (mesa)"/>}
          {isRestaurant&&<Toggle value={d.forDelivery!==false} onChange={set("forDelivery")} label="🛵 Aparece en domicilio"/>}
        </div>
      </div>
      {multiBranch&&<div style={{marginBottom:18}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🏪 Sucursal</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["all","🌐 Todas las sucursales"],...(branches||[]).map(b=>[b.id,"🏪 "+b.name])].map(([k,l])=>(
            <button key={k} onClick={()=>setD(p=>({...p,branchIds:[k]}))} style={{padding:"8px 14px",borderRadius:10,border:`2px solid ${(d.branchIds||["all"])[0]===k?T.violet:T.border}`,background:(d.branchIds||["all"])[0]===k?T.violetL:T.bg,color:(d.branchIds||["all"])[0]===k?T.violet:T.mid,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>}
      <div style={{display:"flex",gap:10}}><Btn full v="neutral" onClick={onClose}>Cancelar</Btn><Btn full disabled={!valid} onClick={()=>onSave({...d,price:parseInt(d.price)||0,deliveryPrice:parseInt(d.deliveryPrice)||null,forMenu:d.forMenu!==false,forDelivery:d.forDelivery!==false,id:d.id||newId(),clicks:d.clicks||0})}>{init?"Guardar cambios":"Agregar producto"}</Btn></div>
    </div>;
  }

  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Productos</h2><p style={{color:T.mid,fontSize:13,marginTop:3}}>{products.filter(p=>p.active&&p.stock).length} activos · {products.filter(p=>!p.stock).length} agotados</p></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Btn v="light" sm icon="📋" onClick={downloadTemplate}>Plantilla Excel</Btn>
        <label style={{cursor:"pointer"}}>
          <input type="file" accept=".csv,.txt" onChange={handleImportFile} style={{display:"none"}}/>
          <span onClick={e=>e.currentTarget.previousSibling.click()} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",background:T.greenL,border:`1px solid ${T.green}44`,borderRadius:10,fontSize:12,fontWeight:700,color:T.green,cursor:"pointer"}}>📤 Importar CSV</span>
        </label>
        <Btn icon="+" onClick={()=>{setEditP(null);setModal(true);}}>Nuevo producto</Btn>
      </div>
      {importError&&<div style={{marginTop:8,color:T.red,fontSize:12}}>{importError}</div>}
    </div>
    {multiBranch&&<Card style={{marginBottom:10,padding:"10px 14px"}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:T.mid,marginRight:4}}>🏪 Sucursal:</span>
        {[["all","🌐 Todas"],...(branches||[]).map(b=>[b.id,b.name])].map(([k,l])=>(
          <button key={k} onClick={()=>setFBranch(k)} style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${fBranch===k?T.violet:T.border}`,background:fBranch===k?T.violetL:T.white,color:fBranch===k?T.violet:T.mid,fontSize:12,fontWeight:fBranch===k?700:500,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
    </Card>}
    <Card style={{marginBottom:14,padding:"12px 16px"}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Buscar…" style={{flex:1,minWidth:160,padding:"9px 13px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none"}}/>
        <select value={fCat} onChange={e=>setFCat(e.target.value)} style={{padding:"9px 12px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,fontSize:12,color:T.mid,outline:"none"}}>
          <option value="all">Todas las categorías</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{display:"flex",gap:5}}>
          {[["all","Todos"],["active","Activos"],["agotado","Agotados"],["oculto","Ocultos"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFSt(k)} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${fSt===k?T.violet:T.border}`,background:fSt===k?T.violetL:T.white,color:fSt===k?T.violet:T.mid,fontSize:11,fontWeight:fSt===k?700:500,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>
    </Card>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {filtered.map(p=>{
        const cat=cats.find(c=>c.id===p.catId);
        return <Card key={p.id} style={{padding:"14px 16px",opacity:p.active?1:0.6}} className="hov">
          <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
            <div style={{width:70,height:70,borderRadius:14,overflow:"hidden",flexShrink:0,background:T.bg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:28}}>{p.emoji}</span>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:4}}>
                <span style={{fontWeight:800,fontSize:15,color:T.text}}>{p.name}{p.featured?" ⭐":""}</span>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0,gap:1}}>
                  {p.price>0&&<span style={{fontWeight:900,fontSize:13,color:T.violet}}>{isRestaurant?"📋":"💰"} {fmtCOP(p.price)}</span>}
                  {p.deliveryPrice>0&&<span style={{fontWeight:900,fontSize:13,color:"#059669"}}>{isRestaurant?"🛵":"🚚"} {fmtCOP(p.deliveryPrice)}</span>}
                </div>
              </div>
              <p style={{fontSize:11,color:T.mid,lineHeight:1.5,marginBottom:7,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.desc}</p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {cat&&<Tag color={T.violet}>{cat.icon} {cat.name}</Tag>}
                {isRestaurant&&p.forMenu!==false&&<Tag color="#2563eb">📋 Menú</Tag>}
                {isRestaurant&&p.forDelivery!==false&&<Tag color="#059669">🛵 Domicilio</Tag>}
                {multiBranch&&<Tag color={T.mid}>🏪 {(p.branchIds||["all"]).includes("all")?"Todas":(branches?.find(b=>b.id===(p.branchIds||[])[0])?.name||(p.branchIds||[])[0])}</Tag>}
                {p.label&&<Tag color={p.labelColor}>{p.label}</Tag>}
                {p.allergens.map(a=>{const al=ALLERGENS_LIST.find(x=>x.id===a);return al?<Tag key={a} color="#78716c" sm>{al.i}</Tag>:null;})}
                {!p.stock&&<Tag color={T.red}>Agotado</Tag>}
                {!p.active&&<Tag color={T.mid}>Oculto</Tag>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12,paddingTop:10,borderTop:`1px solid ${T.border}`,flexWrap:"wrap"}}>
            <Toggle value={p.active} onChange={v=>onUpdate(p.id,{active:v})} label={p.active?"Visible":"Oculto"} sm/>
            <div style={{width:1,height:16,background:T.border}}/>
            <Toggle value={p.stock} onChange={v=>onUpdate(p.id,{stock:v})} label={p.stock?"En stock":"Agotado"} sm/>
            <div style={{marginLeft:"auto",display:"flex",gap:8}}>
              <Btn sm v="ghost" onClick={()=>{setEditP(p);setModal(true);}}>✏️ Editar</Btn>
              <Btn sm v="danger" onClick={()=>window.confirm(`¿Eliminar "${p.name}"?`)&&onDelete(p.id)}>🗑️</Btn>
            </div>
          </div>
        </Card>;
      })}
      {filtered.length===0&&<Card style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:44,marginBottom:10}}>🍽️</div><div style={{fontWeight:700,color:T.text,marginBottom:16}}>{q?`Sin resultados para "${q}"`:"No hay productos"}</div>{!q&&<Btn icon="+" onClick={()=>{setEditP(null);setModal(true);}}>Agregar primer producto</Btn>}</Card>}
    </div>
    {modal&&<Modal title={editP?"Editar producto":"Nuevo producto"} icon="🍽️" onClose={()=>setModal(false)} wide>
      <PForm init={editP} onSave={d=>{editP?onUpdate(editP.id,d):onAdd(d);setModal(false);setEditP(null);}} onClose={()=>setModal(false)} branches={branches}/>
    </Modal>}
    {importModal&&<div onClick={()=>setImportModal(false)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:560,maxHeight:"85vh",overflowY:"auto",boxShadow:T.shMd}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div><div style={{fontSize:18,fontWeight:900,color:T.text}}>📤 Importar productos</div><div style={{color:T.mid,fontSize:12,marginTop:2}}>{importRows.length} producto{importRows.length!==1?"s":""} encontrado{importRows.length!==1?"s":""}</div></div>
          <button onClick={()=>setImportModal(false)} style={{background:T.bg,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:T.mid,fontSize:16}}>×</button>
        </div>
        <div style={{background:T.bg,borderRadius:12,overflow:"hidden",marginBottom:18}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:0,padding:"8px 14px",borderBottom:`1px solid ${T.border}`}}>
            {["Producto","Categoría","Precio menú","Precio dom."].map(h=><div key={h} style={{fontSize:10,fontWeight:800,color:T.light,textTransform:"uppercase"}}>{h}</div>)}
          </div>
          {importRows.map((r,i)=>{
            const cat=cats.find(c=>c.name.toLowerCase()===r.categoria?.toLowerCase());
            const valid=r.nombre&&parseInt((r.precio_menu||"0").replace(/\D/g,""))>0;
            return <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:0,padding:"10px 14px",borderBottom:`1px solid ${T.border}`,background:valid?"transparent":"#fff5f5"}}>
              <div style={{fontWeight:600,fontSize:13,color:T.text,display:"flex",alignItems:"center",gap:6}}><span>{r.emoji||"🍽️"}</span>{r.nombre}</div>
              <div style={{fontSize:12,color:cat?T.green:T.amber}}>{cat?cat.name:<span title="Se usará primera categoría">⚠️ {r.categoria||"—"}</span>}</div>
              <div style={{fontSize:12,fontWeight:700,color:T.text}}>{r.precio_menu?`$${parseInt(r.precio_menu.replace(/\D/g,"")).toLocaleString("es-CO")}`:"—"}</div>
              <div style={{fontSize:12,color:T.mid}}>{r.precio_domicilio?`$${parseInt(r.precio_domicilio.replace(/\D/g,"")).toLocaleString("es-CO")}`:"—"}</div>
            </div>;
          })}
        </div>
        <div style={{background:T.greenL,border:`1px solid ${T.green}44`,borderRadius:10,padding:"10px 14px",fontSize:12,color:"#065f46",marginBottom:18}}>
          ✅ Canal asignado automáticamente: <strong>precio menú</strong> → 📋 menú digital · <strong>precio domicilio</strong> → 🛵 domicilio. Si tiene ambos, aparece en los dos.
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn full v="neutral" onClick={()=>setImportModal(false)}>Cancelar</Btn>
          <Btn full onClick={confirmImport}>✅ Importar {importRows.length} productos</Btn>
        </div>
      </div>
    </div>}
  </div>;
}

/* ─── ADMIN: CATEGORÍAS ───────────────────────────────────── */
function SecCategorias({cats,products,onAdd,onUpdate,onDelete,vertical,branches}){
  const vl = vertical?.labels || VERTICALS.restaurant.labels;
  const multiBranch=branches?.length>1;
  const defaultBIds=branches?.length===1?[branches[0].id]:["all"];
  const [modal,setModal]=useState(false);
  const [editC,setEditC]=useState(null);
  const [fBranch,setFBranch]=useState("all");
  const [form,setForm]=useState({name:"",icon:"🍽️",iconType:"emoji",iconImg:"",active:true,bgImg:"",bgColor:"",textColor:"#ffffff",fontStyle:"modern",branchIds:defaultBIds});
  const openNew=()=>{setEditC(null);setForm({name:"",icon:"🍽️",iconType:"emoji",iconImg:"",active:true,bgImg:"",bgColor:"",textColor:"#ffffff",fontStyle:"modern",branchIds:defaultBIds});setModal(true);};
  const openEdit=c=>{setEditC(c);setForm({name:c.name,icon:c.icon,iconType:c.iconType||"emoji",iconImg:c.iconImg||"",active:c.active,bgImg:c.bgImg||"",bgColor:c.bgColor||"",textColor:c.textColor||"#ffffff",fontStyle:c.fontStyle||"modern",branchIds:c.branchIds||defaultBIds});setModal(true);};
  const save=()=>{if(!form.name.trim())return;editC?onUpdate(editC.id,form):onAdd({...form,id:newId(),order:cats.length});setModal(false);};
  const EMOJIS = vertical?.emojis ? [...vertical.emojis,"⭐","✨","💎","🎯","🏷️","🔖"] : ["🔥","🥗","🍖","🥤","🍮","🍕","🌮","🍣","🥩","🍜","🍔","🥪","🧁","☕","🍺","🌿","⭐","✨","💎","🎯"];
  const filteredCats=[...cats].filter(c=>fBranch==="all"||(c.branchIds||["all"]).includes("all")||(c.branchIds||["all"]).includes(fBranch)).sort((a,b)=>a.order-b.order);
  const branchName=id=>branches?.find(b=>b.id===id)?.name||id;
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>{vl.categoryPlural||"Categorías"}</h2><p style={{color:T.mid,fontSize:13,marginTop:3}}>{filteredCats.length} {(vl.categoryPlural||"Categorías").toLowerCase()}</p></div>
      <Btn icon="+" onClick={openNew}>Nueva {(vl.category||"categoría").toLowerCase()}</Btn>
    </div>
    {multiBranch&&<Card style={{marginBottom:14,padding:"10px 14px"}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:T.mid,marginRight:4}}>🏪 Sucursal:</span>
        {[["all","🌐 Todas"],...(branches||[]).map(b=>[b.id,b.name])].map(([k,l])=>(
          <button key={k} onClick={()=>setFBranch(k)} style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${fBranch===k?T.violet:T.border}`,background:fBranch===k?T.violetL:T.white,color:fBranch===k?T.violet:T.mid,fontSize:12,fontWeight:fBranch===k?700:500,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
    </Card>}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {filteredCats.map((c,i)=>(
        <Card key={c.id} style={{padding:"14px 18px",opacity:c.active?1:0.6}} className="hov">
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:16,color:T.light,cursor:"grab"}}>⠿</div>
            <div style={{width:26,height:26,borderRadius:"50%",background:T.bg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:T.mid,flexShrink:0}}>{i+1}</div>
            <div style={{width:46,height:46,borderRadius:12,background:T.violetL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,overflow:"hidden",position:"relative"}}>
              {c.bgImg&&<img src={c.bgImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.85}} alt=""/>}
              <span style={{position:"relative",zIndex:1}}>{c.icon}</span>
            </div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:T.text}}>{c.name}</div><div style={{fontSize:11,color:T.mid,marginTop:1}}>{products.filter(p=>p.catId===c.id).length} productos{multiBranch&&<span style={{marginLeft:6,color:T.violet}}>· {(c.branchIds||["all"]).includes("all")?"Todas las sucursales":branchName((c.branchIds||[])[0])}</span>}</div></div>
            {!c.active&&<Tag color={T.mid}>Inactiva</Tag>}
            <Toggle value={c.active} onChange={v=>onUpdate(c.id,{active:v})} sm/>
            <Btn sm v="ghost" onClick={()=>openEdit(c)}>✏️</Btn>
            <Btn sm v="danger" onClick={()=>window.confirm(`¿Eliminar "${c.name}"?`)&&onDelete(c.id)}>🗑️</Btn>
          </div>
        </Card>
      ))}
      {cats.length===0&&<Card style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:48,marginBottom:12}}>🗂️</div><Btn icon="+" onClick={openNew}>Crear primera {(vl.category||"categoría").toLowerCase()}</Btn></Card>}
    </div>
    {modal&&<Modal title={editC?`Editar ${vl.category}`:`Nueva ${vl.category}`} icon="🗂️" onClose={()=>setModal(false)}>
      <Field label="Nombre" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder={`Ej: ${vl.cat_example||"Categoría principal"}…`} required/>
      {/* Tipo de ícono */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🎭 Ícono de la tarjeta</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[["emoji","😊 Emoji","Selecciona un emoji"],["photo","📷 Foto",vl.item_photo||"Foto del producto"],["none","✕ Ninguno","Solo imagen de fondo"]].map(([k,label,sub])=>(
            <button key={k} onClick={()=>setForm(p=>({...p,iconType:k}))} style={{padding:"10px 8px",borderRadius:10,border:`2px solid ${(form.iconType||"emoji")===k?T.violet:T.border}`,background:(form.iconType||"emoji")===k?T.violetL:T.bg,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
              <div style={{fontSize:13,fontWeight:800,color:T.text}}>{label}</div>
              <div style={{fontSize:10,color:T.mid,marginTop:2}}>{sub}</div>
            </button>
          ))}
        </div>
        {(form.iconType||"emoji")==="emoji"&&<>
          <input value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))} style={{width:"100%",padding:"12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:28,textAlign:"center",outline:"none",marginBottom:8}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{EMOJIS.map(em=><button key={em} onClick={()=>setForm(p=>({...p,icon:em}))} style={{width:36,height:36,borderRadius:9,border:`1.5px solid ${form.icon===em?T.violet:T.border}`,background:form.icon===em?T.violetL:"transparent",fontSize:18,cursor:"pointer"}}>{em}</button>)}</div>
        </>}
        {(form.iconType||"emoji")==="photo"&&<PhotoInput label={`${vl.item_photo||"Foto del producto"} / ícono`} value={form.iconImg} onChange={v=>setForm(p=>({...p,iconImg:v}))} height={90} dims="400×400 px • Cuadrada • JPG/PNG • Máx 1MB"/>}
        {(form.iconType||"emoji")==="none"&&<div style={{background:T.bg,borderRadius:10,padding:"12px 14px",fontSize:12,color:T.mid}}>🖼️ Solo se verá la imagen de fondo de la tarjeta, sin ícono extra.</div>}
      </div>
      {/* Foto de fondo */}
      <PhotoInput label="🖼️ Foto de fondo de categoría" value={form.bgImg} onChange={v=>setForm(p=>({...p,bgImg:v}))} height={100} dims="1200×500 px • Horizontal • JPG/PNG • Máx 2MB • Se recorta al centro"/>
      {/* Color de fondo */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🎨 Color de fondo (sin imagen)</label>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <input type="color" value={form.bgColor||"#7c3aed"} onChange={e=>setForm(p=>({...p,bgColor:e.target.value}))} style={{width:44,height:40,borderRadius:10,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
          <input value={form.bgColor||""} onChange={e=>setForm(p=>({...p,bgColor:e.target.value}))} placeholder="Ej: #7c3aed" style={{flex:1,padding:"9px 12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}/>
          <div style={{width:40,height:40,borderRadius:10,background:form.bgColor||"linear-gradient(135deg,#8b5cf6,#7c3aed)",border:`1px solid ${T.border}`}}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["#7c3aed","#2563eb","#059669","#d97706","#dc2626","#db2777","#0891b2","#111111","#374151","#b45309"].map(col=><div key={col} onClick={()=>setForm(p=>({...p,bgColor:col}))} style={{width:26,height:26,borderRadius:"50%",background:col,cursor:"pointer",border:(form.bgColor||"")===col?`3px solid ${T.violet}`:"3px solid transparent",boxShadow:"0 1px 4px rgba(0,0,0,.2)",transition:"all .15s"}}/>)}
        </div>
      </div>
      {/* Color de texto */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🔤 Color del texto</label>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <input type="color" value={form.textColor||"#ffffff"} onChange={e=>setForm(p=>({...p,textColor:e.target.value}))} style={{width:44,height:40,borderRadius:10,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
          <input value={form.textColor||"#ffffff"} onChange={e=>setForm(p=>({...p,textColor:e.target.value}))} style={{flex:1,padding:"9px 12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}/>
          <div style={{width:40,height:40,borderRadius:10,background:form.textColor||"#ffffff",border:`1px solid ${T.border}`}}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["#ffffff","#111111","#f97316","#fbbf24","#34d399","#60a5fa","#f472b6","#a78bfa"].map(c=><div key={c} onClick={()=>setForm(p=>({...p,textColor:c}))} style={{width:26,height:26,borderRadius:"50%",background:c,cursor:"pointer",border:(form.textColor||"#ffffff")===c?`3px solid ${T.violet}`:"3px solid transparent",boxShadow:"0 1px 4px rgba(0,0,0,.2)",transition:"all .15s"}}/>)}
        </div>
      </div>
      {/* Estilo de fuente */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>✍️ Estilo de fuente</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["modern","Moderna","900","'Plus Jakarta Sans',sans-serif"],["classic","Clásica","700","Georgia,serif"],["bold","Impacto","900","Impact,sans-serif"],["elegant","Elegante","300","'Plus Jakarta Sans',sans-serif"]].map(([k,label,w,ff])=>(
            <button key={k} onClick={()=>setForm(p=>({...p,fontStyle:k}))} style={{padding:"10px 12px",borderRadius:10,border:`2px solid ${(form.fontStyle||"modern")===k?T.violet:T.border}`,background:(form.fontStyle||"modern")===k?T.violetL:T.bg,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
              <div style={{fontFamily:ff,fontWeight:w,fontSize:14,color:T.text,letterSpacing:k==="elegant"?"2px":k==="bold"?"1px":"-.2px",textTransform:k==="elegant"?"uppercase":"none",fontStyle:k==="classic"?"italic":"normal"}}>{label}</div>
              <div style={{fontSize:10,color:T.mid,marginTop:3,fontFamily:"sans-serif",fontWeight:400}}>{k==="modern"?"Sans · Negrita":k==="classic"?"Serif · Cursiva":k==="bold"?"Condensada · Fuerte":"Light · Espaciada"}</div>
            </button>
          ))}
        </div>
      </div>
      {/* Preview de la tarjeta */}
      {(form.bgImg||form.name)&&(()=>{const fw2={modern:"900",classic:"700",bold:"900",elegant:"300"};const ff2={modern:"'Plus Jakarta Sans',sans-serif",classic:"Georgia,serif",bold:"Impact,sans-serif",elegant:"'Plus Jakarta Sans',sans-serif"};const lsp2={modern:"-.3px",classic:"0",bold:"1px",elegant:"2px"};const fs2=form.fontStyle||"modern";return<div style={{marginBottom:18}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>👁️ Vista previa</label>
        <div style={{height:100,borderRadius:14,overflow:"hidden",position:"relative",background:form.bgImg?"#111":(form.bgColor||"linear-gradient(135deg,#8b5cf6,#7c3aed)")}}>
          {form.bgImg&&<img src={form.bgImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} alt=""/>}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,.55) 0%,rgba(0,0,0,.1) 60%,rgba(0,0,0,0) 100%)"}}/>
          {(form.iconType||"emoji")==="emoji"&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:46,opacity:.85,userSelect:"none",flexShrink:0}}>{form.icon}</div>}
          {(form.iconType||"emoji")==="photo"&&form.iconImg&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",width:58,height:58,borderRadius:12,overflow:"hidden",border:"2px solid rgba(255,255,255,.3)",boxShadow:"0 4px 14px rgba(0,0,0,.5)",flexShrink:0}}><img src={form.iconImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/></div>}
          <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",maxWidth:"calc(100% - 88px)",overflow:"hidden"}}>
            <div style={{color:form.textColor||"#fff",fontWeight:fw2[fs2],fontFamily:ff2[fs2],fontSize:18,letterSpacing:lsp2[fs2],textTransform:fs2==="elegant"?"uppercase":"none",fontStyle:fs2==="classic"?"italic":"normal",textShadow:"0 2px 10px rgba(0,0,0,.6)",lineHeight:1.25,wordBreak:"break-word"}}>{form.name||"Nombre categoría"}</div>
          </div>
        </div>
      </div>;})()}
      {multiBranch&&<div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🏪 Asignar a sucursal</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["all","🌐 Todas las sucursales"],...(branches||[]).map(b=>[b.id,"🏪 "+b.name])].map(([k,l])=>(
            <button key={k} onClick={()=>setForm(p=>({...p,branchIds:[k]}))} style={{padding:"8px 14px",borderRadius:10,border:`2px solid ${(form.branchIds||["all"])[0]===k?T.violet:T.border}`,background:(form.branchIds||["all"])[0]===k?T.violetL:T.bg,color:(form.branchIds||["all"])[0]===k?T.violet:T.mid,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>}
      <div style={{marginBottom:18}}><Toggle value={form.active} onChange={v=>setForm(p=>({...p,active:v}))} label="Categoría activa"/></div>
      <div style={{display:"flex",gap:10}}><Btn full v="neutral" onClick={()=>setModal(false)}>Cancelar</Btn><Btn full disabled={!form.name.trim()} onClick={save}>{editC?"Guardar":"Crear"}</Btn></div>
    </Modal>}
  </div>;
}

/* ─── ADMIN: STOCK ────────────────────────────────────────── */
function SecStock({products,onUpdate}){
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
function SecDiseno({config,onUpdate}){
  const [d,setD]=useState(config);
  const [saved,setSaved]=useState(false);
  const set=k=>v=>setD(p=>({...p,[k]:v}));
  const save=()=>{onUpdate(d);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Diseño del menú</h2><p style={{color:T.mid,fontSize:13,marginTop:3}}>Personaliza la experiencia visual del cliente</p></div>
      <Btn onClick={save}>{saved?"✓ ¡Guardado!":"Guardar cambios"}</Btn>
    </div>
    <div className="diseno-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>🏪 Identidad</div>
        <Field label="Nombre del restaurante" value={d.name} onChange={set("name")} placeholder="Ej: La Leña" required/>
        <Field label="Tagline / Slogan" value={d.tagline} onChange={set("tagline")} placeholder="Cocina de fuego lento · Desde 1998"/>
        <div style={{fontSize:11,color:T.mid,marginBottom:8,marginTop:-4}}>El nombre y tagline son opcionales — si tienes un buen banner, ¡no hace falta!</div>
        <PhotoInput label="Logo del restaurante" value={d.logo} onChange={set("logo")} height={100} dims="400×400 px • Cuadrada • PNG con fondo transparente o JPG • Máx 1MB"/>
        <div style={{marginTop:4,marginBottom:16}}><Toggle value={d.openStatus} onChange={set("openStatus")} label="🟢 Abierto ahora"/></div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>🎨 Colores y estilo</div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>Color principal</label>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <input type="color" value={d.primaryColor} onChange={e=>set("primaryColor")(e.target.value)} style={{width:50,height:42,borderRadius:10,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
              <input value={d.primaryColor} onChange={e=>set("primaryColor")(e.target.value)} style={{flex:1,padding:"10px 12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}/>
              <div style={{width:42,height:42,borderRadius:10,background:d.primaryColor,boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["#f97316","#e85d04","#dc2626","#8b5cf6","#059669","#2563eb","#d97706","#db2777","#0f172a"].map(c=><div key={c} onClick={()=>set("primaryColor")(c)} style={{width:26,height:26,borderRadius:"50%",background:c,cursor:"pointer",border:d.primaryColor===c?`3px solid ${T.text}`:"3px solid transparent",transition:"all .15s"}}/>)}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>Estilo del menú</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["dark","🌙 Oscuro"],["light","☀️ Claro"]].map(([k,l])=>(
                <button key={k} onClick={()=>set("menuStyle")(k)} style={{padding:"10px",borderRadius:10,border:`2px solid ${d.menuStyle===k?d.primaryColor:T.border}`,background:d.menuStyle===k?d.primaryColor+"12":T.bg,color:d.menuStyle===k?d.primaryColor:T.mid,fontSize:12,fontWeight:d.menuStyle===k?800:500,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </div>
          <Toggle value={d.showAllergens} onChange={set("showAllergens")} label="Mostrar alérgenos en el menú"/>
        </Card>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>📸 Fotos</div>
          <PhotoInput label="Foto de portada (banner)" value={d.coverImg} onChange={set("coverImg")} height={90} dims="1200×450 px • Horizontal 8:3 • JPG o PNG • Máx 3MB"/>
          <PhotoInput label="Fondo del menú (opcional)" value={d.bgImg} onChange={set("bgImg")} height={70} dims="1080×1920 px • Vertical • JPG o PNG • Máx 3MB"/>
        </Card>
        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,fontSize:11,fontWeight:700,color:T.mid,textTransform:"uppercase",letterSpacing:".5px"}}>🔍 Preview</div>
          <div style={{height:130,background:d.menuStyle==="dark"?"#111009":"#f8f7f4",position:"relative",overflow:"hidden"}}>
            {d.coverImg&&<img src={d.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.5}} alt=""/>}
            <div style={{position:"absolute",inset:0,background:d.menuStyle==="dark"?"linear-gradient(to top,rgba(17,16,9,1),rgba(0,0,0,.2))":"linear-gradient(to top,rgba(248,247,244,1),rgba(255,255,255,.2))"}}/>
            <div style={{position:"absolute",bottom:12,left:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:12,background:d.primaryColor+"30",border:`2px solid ${d.primaryColor}55`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>{d.logo&&(d.logo.startsWith("http")||d.logo.startsWith("data:"))?<img src={d.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:20}}>{d.logo||"🏪"}</span>}</div>
                <div>
                  <div style={{color:d.menuStyle==="dark"?"#fff":"#111",fontWeight:800,fontSize:15}}>{d.name}</div>
                  <div style={{color:d.primaryColor,fontSize:10,fontStyle:"italic"}}>{d.tagline}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    {/* REDES SOCIALES */}
    <Card style={{marginTop:16}}>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:4}}>📱 Redes sociales</div>
      <div style={{fontSize:12,color:T.mid,marginBottom:16}}>Los clientes verán los íconos en el menú. Pega el link completo o solo el número para WhatsApp.</div>
      <div className="diseno-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="WhatsApp (número)" value={d.socialLinks?.whatsapp||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),whatsapp:v}}))} placeholder="573001234567"/>
        <Field label="Instagram (link)" value={d.socialLinks?.instagram||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),instagram:v}}))} placeholder="https://instagram.com/…"/>
        <Field label="Facebook (link)" value={d.socialLinks?.facebook||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),facebook:v}}))} placeholder="https://facebook.com/…"/>
        <Field label="TikTok (link)" value={d.socialLinks?.tiktok||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),tiktok:v}}))} placeholder="https://tiktok.com/@…"/>
        <Field label="TripAdvisor (link)" value={d.socialLinks?.tripadvisor||""} onChange={v=>setD(p=>({...p,socialLinks:{...(p.socialLinks||{}),tripadvisor:v}}))} placeholder="https://tripadvisor.com/…"/>
      </div>
    </Card>
    <div style={{marginTop:20}}><Btn full onClick={save} style={{padding:"14px"}}>{saved?"✓ ¡Cambios guardados!":"Guardar todos los cambios"}</Btn></div>
  </div>;
}

function BannersAdmin({banners,onChange,primaryColor,cats}){
  const pc=primaryColor;
  const [editIdx,setEditIdx]=useState(null);
  const [form,setForm]=useState({title:"",subtitle:"",img:"",bgColor:pc,active:true,linkType:"none",linkCatId:"",linkUrl:""});
  const openNew=()=>{setForm({title:"",subtitle:"",img:"",bgColor:pc,active:true,position:"inicio",linkType:"none",linkCatId:"",linkUrl:""});setEditIdx(-1);};
  const openEdit=i=>{setForm({...banners[i],linkType:banners[i].linkType||"none",linkCatId:banners[i].linkCatId||"",linkUrl:banners[i].linkUrl||""});setEditIdx(i);};
  const save=()=>{
    if(editIdx===-1) onChange([...banners,{...form,id:newId()}]);
    else onChange(banners.map((b,i)=>i===editIdx?{...b,...form}:b));
    setEditIdx(null);
  };
  const del=i=>onChange(banners.filter((_,j)=>j!==i));
  const toggle=i=>onChange(banners.map((b,j)=>j===i?{...b,active:!b.active}:b));
  return <Card style={{marginTop:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:800,color:T.text}}>🎯 Banners promocionales</div>
      <Btn sm onClick={openNew}>+ Agregar banner</Btn>
    </div>
    {banners.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:T.light,fontSize:12}}>Sin banners — agrega uno para mostrar promociones en el menú del cliente</div>}
    {banners.map((b,i)=>(
      <div key={b.id||i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
        <div style={{width:60,height:40,borderRadius:8,overflow:"hidden",flexShrink:0,background:b.bgColor||"#f97316"}}>
          {b.img?<img src={b.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:18}}>🎯</div>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.title||"Sin título"}</div>
          <div style={{display:"flex",gap:5,marginTop:2,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:9,fontWeight:700,background:T.violetL,color:T.violet,borderRadius:6,padding:"2px 6px"}}>{b.position==="productos"?"📋 En carta":b.position==="ambos"?"🔁 Ambos":"🏠 Inicio"}</span>
            {b.linkType==="category"&&<span style={{fontSize:9,fontWeight:700,background:"#d1fae5",color:"#065f46",borderRadius:6,padding:"2px 6px"}}>🗂️ {(cats||[]).find(c=>c.id===b.linkCatId)?.name||"Categoría"}</span>}
            {b.linkType==="external"&&<span style={{fontSize:9,fontWeight:700,background:"#dbeafe",color:"#1e40af",borderRadius:6,padding:"2px 6px"}}>🌐 Link</span>}
            {b.subtitle&&<span style={{fontSize:11,color:T.mid}}>{b.subtitle}</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <button onClick={()=>toggle(i)} style={{width:36,height:20,borderRadius:20,border:"none",cursor:"pointer",background:b.active?pc:"#ccc",position:"relative",transition:"background .2s"}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:b.active?18:2,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
          </button>
          <button onClick={()=>openEdit(i)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",color:T.mid}}>✏️</button>
          <button onClick={()=>del(i)} style={{background:"none",border:"1px solid rgba(220,38,38,.2)",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",color:"#dc2626"}}>🗑</button>
        </div>
      </div>
    ))}
    {editIdx!==null&&<div onClick={()=>setEditIdx(null)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 16px",overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,.25)",margin:"auto"}}>
        <div style={{fontWeight:900,fontSize:17,color:T.text,marginBottom:16}}>{editIdx===-1?"Nuevo banner":"Editar banner"}</div>
        <Field label="Título del banner *" value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} placeholder="2x1 en Bandeja Paisa · Hoy"/>
        <Field label="Subtexto" value={form.subtitle} onChange={v=>setForm(p=>({...p,subtitle:v}))} placeholder="Válido solo hoy · Hasta agotar existencias"/>
        <PhotoInput label="Imagen del banner" value={form.img} onChange={v=>setForm(p=>({...p,img:v}))} height={100} dims="1200×500 px • Horizontal 12:5 • JPG o PNG • Máx 3MB"/>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>Color de fondo (si no hay imagen)</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="color" value={form.bgColor} onChange={e=>setForm(p=>({...p,bgColor:e.target.value}))} style={{width:44,height:38,borderRadius:8,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
            <div style={{flex:1,height:38,borderRadius:8,background:form.bgColor,display:"flex",alignItems:"center",paddingLeft:12,color:"#fff",fontWeight:700,fontSize:12}}>{form.title||"Preview"}</div>
          </div>
        </div>
        {/* Dónde aparece */}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>📍 ¿Dónde aparece el banner?</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[["inicio","🏠 Inicio","Antes de las categorías"],["productos","📋 En carta","Mientras navega productos"],["ambos","🔁 Ambos","En inicio y en carta"]].map(([k,label,sub])=>(
              <button key={k} onClick={()=>setForm(p=>({...p,position:k}))} style={{padding:"9px 8px",borderRadius:10,border:`2px solid ${(form.position||"inicio")===k?T.violet:T.border}`,background:(form.position||"inicio")===k?T.violetL:T.bg,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
                <div style={{fontSize:12,fontWeight:800,color:T.text}}>{label}</div>
                <div style={{fontSize:10,color:T.mid,marginTop:2,lineHeight:1.3}}>{sub}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Acción al hacer clic */}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🔗 Acción al hacer clic en el banner</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            {[["none","🚫 Ninguna","Solo informativo"],["category","🗂️ Categoría","Lleva a una sección"],["external","🌐 Link externo","Abre una URL"]].map(([k,label,sub])=>(
              <button key={k} onClick={()=>setForm(p=>({...p,linkType:k}))} style={{padding:"9px 8px",borderRadius:10,border:`2px solid ${(form.linkType||"none")===k?T.violet:T.border}`,background:(form.linkType||"none")===k?T.violetL:T.bg,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
                <div style={{fontSize:12,fontWeight:800,color:T.text}}>{label}</div>
                <div style={{fontSize:10,color:T.mid,marginTop:2,lineHeight:1.3}}>{sub}</div>
              </button>
            ))}
          </div>
          {form.linkType==="category"&&<div>
            <label style={{fontSize:11,fontWeight:600,color:T.mid,display:"block",marginBottom:6}}>Selecciona la categoría destino</label>
            <select value={form.linkCatId} onChange={e=>setForm(p=>({...p,linkCatId:e.target.value}))} style={{width:"100%",padding:"10px 12px",background:T.bg,border:`1.5px solid ${form.linkCatId?T.violet:T.border}`,borderRadius:10,fontSize:13,color:form.linkCatId?T.text:T.mid,outline:"none"}}>
              <option value="">— Elige una categoría —</option>
              {(cats||[]).map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>}
          {form.linkType==="external"&&<div>
            <label style={{fontSize:11,fontWeight:600,color:T.mid,display:"block",marginBottom:6}}>URL de destino</label>
            <input value={form.linkUrl} onChange={e=>setForm(p=>({...p,linkUrl:e.target.value}))} placeholder="https://ejemplo.com/promo" style={{width:"100%",padding:"10px 12px",background:T.bg,border:`1.5px solid ${form.linkUrl?T.violet:T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"}}/>
            <div style={{fontSize:10,color:T.mid,marginTop:5}}>💡 Debe empezar por https:// — se abrirá en una nueva pestaña</div>
          </div>}
        </div>
        <Toggle value={form.active} onChange={v=>setForm(p=>({...p,active:v}))} label="Banner activo (visible para clientes)"/>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <Btn full v="neutral" onClick={()=>setEditIdx(null)}>Cancelar</Btn>
          <Btn full onClick={save} disabled={!form.title}>{editIdx===-1?"Agregar banner":"Guardar cambios"}</Btn>
        </div>
      </div>
    </div>}
  </Card>;
}


/* ─── ADMIN: POPUP PROMOCIONAL ────────────────────────────── */
function PromoPopupAdmin({popup,onChange,cats}){
  const def={active:false,img:"",bgColor:"#7c3aed",title:"",subtitle:"",ctaText:"Ver promoción",linkType:"none",linkCatId:"",linkUrl:"",frequency:"session",delay:20};
  const p=popup||def;
  const hasContent=!!(p.img||p.title);
  const [editing,setEditing]=useState(!hasContent);
  const [draft,setDraft]=useState({...def,...p});
  const dset=k=>v=>setDraft(x=>({...x,[k]:v}));
  const openEdit=()=>{setDraft({...def,...p});setEditing(true);};
  const apply=()=>{onChange(draft);setEditing(false);};
  const clear=()=>{onChange({...def,active:false});setDraft({...def});setEditing(false);};
  const toggleActive=()=>onChange({...p,active:!p.active});
  const FREQ_LABEL={"always":"Siempre","session":"Por sesión","daily":"Una al día"};
  const LINK_LABEL={"none":"Sin acción","category":"→ Categoría","external":"→ Link externo"};
  return <Card style={{marginTop:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hasContent&&!editing?0:14}}>
      <div>
        <div style={{fontSize:13,fontWeight:800,color:T.text}}>🎯 Popup promocional</div>
        <div style={{fontSize:11,color:T.mid,marginTop:2}}>Aparece al entrar al menú — ideal para promos flash</div>
      </div>
      {hasContent&&!editing
        ?<div style={{display:"flex",gap:8,alignItems:"center"}}>
           <Toggle value={p.active} onChange={toggleActive} sm/>
         </div>
        :<Toggle value={draft.active} onChange={v=>setDraft(x=>({...x,active:v}))} sm/>
      }
    </div>

    {/* ── VISTA COMPACTA (guardado) ── */}
    {hasContent&&!editing&&<div style={{display:"flex",gap:12,alignItems:"center",paddingTop:12,borderTop:`1px solid ${T.border}`}}>
      <div style={{width:60,height:60,borderRadius:10,overflow:"hidden",flexShrink:0,background:p.bgColor||"#7c3aed",position:"relative"}}>
        {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:22}}>🎯</div>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title||"Popup sin título"}</div>
        <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap"}}>
          <span style={{fontSize:9,fontWeight:700,background:T.violetL,color:T.violet,borderRadius:6,padding:"2px 6px"}}>⏱️ {p.delay??20}s</span>
          <span style={{fontSize:9,fontWeight:700,background:"#f0fdf4",color:"#16a34a",borderRadius:6,padding:"2px 6px"}}>🔁 {FREQ_LABEL[p.frequency||"session"]}</span>
          {p.linkType!=="none"&&<span style={{fontSize:9,fontWeight:700,background:"#dbeafe",color:"#1e40af",borderRadius:6,padding:"2px 6px"}}>{LINK_LABEL[p.linkType]}</span>}
          {p.subtitle&&<span style={{fontSize:10,color:T.mid}}>{p.subtitle}</span>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
        <button onClick={openEdit} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",color:T.mid}}>✏️</button>
        <button onClick={()=>window.confirm("¿Quitar el popup promocional?")&&clear()} style={{background:"none",border:"1px solid rgba(220,38,38,.2)",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",color:"#dc2626"}}>🗑</button>
      </div>
    </div>}

    {/* ── FORMULARIO DE EDICIÓN ── */}
    {(!hasContent||editing)&&<>
      {!hasContent&&<div style={{background:T.bg,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.mid,marginBottom:14}}>Sin popup configurado — agrega una imagen o título para activarlo.</div>}
      <PhotoInput label="🖼️ Imagen del popup" value={draft.img} onChange={dset("img")} height={120} dims="600×800 px • Vertical • JPG o PNG • Máx 3MB • Se adapta a cualquier pantalla"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Field label="Título (opcional)" value={draft.title} onChange={dset("title")} placeholder="¡Oferta del día!"/>
        <Field label="Texto botón CTA" value={draft.ctaText} onChange={dset("ctaText")} placeholder="Ver promoción"/>
      </div>
      <Field label="Subtexto (opcional)" value={draft.subtitle} onChange={dset("subtitle")} placeholder="Solo hoy · Hasta agotar existencias"/>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🎨 Color de fondo (si no hay imagen)</label>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="color" value={draft.bgColor||"#7c3aed"} onChange={e=>dset("bgColor")(e.target.value)} style={{width:44,height:38,borderRadius:8,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
          <div style={{flex:1,height:38,borderRadius:8,background:draft.bgColor||"#7c3aed",display:"flex",alignItems:"center",paddingLeft:12,color:"#fff",fontWeight:700,fontSize:12}}>{draft.title||"Preview popup"}</div>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🔗 Acción del botón CTA</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          {[["none","🚫 Solo cerrar","Sin navegación"],["category","🗂️ Categoría","Lleva a una sección"],["external","🌐 Link externo","Abre una URL"]].map(([k,label,sub])=>(
            <button key={k} onClick={()=>setDraft(x=>({...x,linkType:k}))} style={{padding:"9px 8px",borderRadius:10,border:`2px solid ${(draft.linkType||"none")===k?T.violet:T.border}`,background:(draft.linkType||"none")===k?T.violetL:T.bg,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:800,color:T.text}}>{label}</div>
              <div style={{fontSize:10,color:T.mid,marginTop:2,lineHeight:1.3}}>{sub}</div>
            </button>
          ))}
        </div>
        {draft.linkType==="category"&&<select value={draft.linkCatId} onChange={e=>dset("linkCatId")(e.target.value)} style={{width:"100%",padding:"10px 12px",background:T.bg,border:`1.5px solid ${draft.linkCatId?T.violet:T.border}`,borderRadius:10,fontSize:13,color:draft.linkCatId?T.text:T.mid,outline:"none"}}>
          <option value="">— Elige una categoría —</option>
          {(cats||[]).map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>}
        {draft.linkType==="external"&&<div>
          <input value={draft.linkUrl} onChange={e=>dset("linkUrl")(e.target.value)} placeholder="https://ejemplo.com/promo" style={{width:"100%",padding:"10px 12px",background:T.bg,border:`1.5px solid ${draft.linkUrl?T.violet:T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"}}/>
          <div style={{fontSize:10,color:T.mid,marginTop:5}}>💡 Se abrirá en nueva pestaña</div>
        </div>}
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>🔁 ¿Con qué frecuencia aparece?</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["always","🔄 Siempre","Cada vez que abre el menú"],["session","1️⃣ Una vez","Por sesión del navegador"],["daily","📅 Una al día","Se resetea cada 24h"]].map(([k,label,sub])=>(
            <button key={k} onClick={()=>dset("frequency")(k)} style={{padding:"9px 8px",borderRadius:10,border:`2px solid ${(draft.frequency||"session")===k?T.violet:T.border}`,background:(draft.frequency||"session")===k?T.violetL:T.bg,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:800,color:T.text}}>{label}</div>
              <div style={{fontSize:10,color:T.mid,marginTop:2,lineHeight:1.3}}>{sub}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:8}}>⏱️ Aparece después de… <span style={{color:T.violet,fontWeight:900}}>{draft.delay??20}s de navegación</span></label>
        <input type="range" min={0} max={60} step={5} value={draft.delay??20} onChange={e=>dset("delay")(parseInt(e.target.value))} style={{width:"100%",accentColor:T.violet,cursor:"pointer"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.light,marginTop:3}}>
          {["0s","10s","20s","30s","40s","50s","60s"].map((l,i)=><span key={i}>{l}</span>)}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        {editing&&<Btn full v="neutral" onClick={()=>setEditing(false)}>Cancelar</Btn>}
        <Btn full onClick={apply} disabled={!(draft.img||draft.title)}>
          {editing?"Guardar popup":"Agregar popup"}
        </Btn>
      </div>
    </>}
  </Card>;
}

/* ─── ADMIN: BANNERS ──────────────────────────────────────── */
function SecBanners({config,onUpdate,vertical,cats}){
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
    <Card style={{background:T.violetL,border:`1px solid ${T.violet}22`,marginBottom:16,padding:"12px 16px"}}>
      <div style={{fontSize:12,color:T.violet,fontWeight:700,marginBottom:4}}>💡 Guía de imágenes para banners</div>
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
function SecDelivery({orders,onMove,products,config,onAddOrder,vertical}){
  const vl=(vertical||getVertical("restaurant")).labels;
  const isRestaurant=!vertical||vertical.id==="restaurant";
  const [selId,setSelId]=useState(null);
  const [filter,setFilter]=useState("all");
  const [newModal,setNewModal]=useState(false);
  const [delivWaModal,setDelivWaModal]=useState(false);
  const [delivWaPhone,setDelivWaPhone]=useState("");
  const [form,setForm]=useState({mode:"domicilio",customerName:"",customerPhone:"",customerEmail:"",address:"",addressRef:"",table:"",notes:"",payment:"cash",items:[]});
  const pc=config.primaryColor||"#f97316";
  const PAYMENT_LABEL={cash:"Efectivo",nequi:"Nequi",daviplata:"Daviplata",card:"Tarjeta"};
  const printComanda=(o)=>{
    const w=window.open("","_blank","width=400,height=700");
    if(!w)return;
    const items=o.items?.map(it=>`<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span>${it.qty}x ${it.name}</span><span>${fmtCOP(it.price*it.qty)}</span></div>`).join("")||"";
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comanda</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;font-size:13px;width:302px;padding:10px;}
    .center{text-align:center;}.bold{font-weight:bold;}.big{font-size:16px;font-weight:bold;}
    .row{display:flex;justify-content:space-between;margin-bottom:4px;}
    .divider{border-top:1px dashed #000;margin:8px 0;}
    .badge{text-align:center;font-weight:bold;font-size:12px;border:2px solid #000;padding:5px;margin:8px 0;letter-spacing:1px;}
    @media print{@page{margin:0;size:80mm auto;}body{width:100%;padding:4px;}}</style>
    </head><body>
    <div class="center big" style="margin-bottom:2px">${config.name||"Gotup"}</div>
    ${config.address?`<div class="center" style="font-size:10px;margin-bottom:8px">${config.address}</div>`:""}
    <div class="divider"></div>
    <div class="badge">${o.mode==="domicilio"?"DOMICILIO":o.mode==="mesa"?"MESA "+o.table:"PICKUP"}</div>
    <div class="row"><span>Pedido:</span><span class="bold">#${o.id.toUpperCase().slice(0,8)}</span></div>
    <div class="row"><span>Fecha:</span><span>${o.date} ${o.time}</span></div>
    <div class="row"><span>Cliente:</span><span>${o.customerName}</span></div>
    ${o.customerPhone?`<div class="row"><span>Tel:</span><span>${o.customerPhone}</span></div>`:""}
    ${o.mode==="domicilio"?`<div class="row"><span>Dir:</span><span style="text-align:right;max-width:58%">${o.address}${o.addressRef?" ("+o.addressRef+")":""}</span></div>`:""}
    <div class="divider"></div>
    <div class="bold" style="margin-bottom:6px">PRODUCTOS</div>
    ${items}
    <div class="divider"></div>
    ${o.mode==="domicilio"?`<div class="row"><span>Domicilio</span><span>${fmtCOP(o.delivery||0)}</span></div>`:""}
    <div class="row bold" style="font-size:15px"><span>TOTAL</span><span>${fmtCOP(o.total)}</span></div>
    <div class="row" style="margin-top:4px"><span>Pago:</span><span>${PAYMENT_LABEL[o.payment]||o.payment}</span></div>
    ${o.notes?`<div class="divider"></div><div style="font-size:11px"><b>Notas:</b> ${o.notes}</div>`:""}
    <div class="divider"></div>
    <div class="center" style="font-size:10px">¡Gracias!</div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
    </body></html>`);
    w.document.close();
  };
  const sendToDelivery=(o,phone)=>{
    const mapsUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`;
    const items=o.items?.map(it=>`  • ${it.qty}x ${it.name} — ${fmtCOP(it.price*it.qty)}`).join("\n")||"";
    const msg=`${vl.delivery_icon} *NUEVO ${vl.delivery_title.toUpperCase()}*\n\n*Negocio:* ${config.name||"Gotup"}\n*${vl.order}:* #${o.id.toUpperCase().slice(0,8)}\n*Hora:* ${o.time}\n\n*Cliente:* ${o.customerName}\n*Tel cliente:* ${o.customerPhone||"—"}\n*Dirección:* ${o.address}${o.addressRef?"\n*Referencia:* "+o.addressRef:""}\n\n*${vl.itemPlural}:*\n${items}\n\n*Subtotal:* ${fmtCOP(o.subtotal)}\n*${vl.delivery_fee_label}:* ${fmtCOP(o.delivery||0)}\n*TOTAL:* ${fmtCOP(o.total)}\n*Pago:* ${PAYMENT_LABEL[o.payment]||o.payment}${o.notes?"\n*Notas:* "+o.notes:""}\n\n📍 *Ubicación:*\n${mapsUrl}`;
    const waNum=phone.replace(/\D/g,"");
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`,"_blank");
  };
  const shown=filter==="all"?orders:filter==="pendiente"?orders.filter(o=>o.status==="pendiente"):orders.filter(o=>o.mode===filter);
  const sel=selId?orders.find(o=>o.id===selId):null;
  const SL={pendiente:"Pendiente",en_cocina:vl.status_processing,listo:vl.status_ready,en_camino:vl.status_shipping,entregado:vl.status_done};
  const SC={pendiente:"#f59e0b",en_cocina:"#3b82f6",listo:"#059669",en_camino:"#8b5cf6",entregado:"#9ca3af"};
  const NL={pendiente:"Aceptar "+vl.order.toLowerCase(),en_cocina:vl.status_ready,listo:vl.status_shipping,en_camino:"Finalizar"};
  const addItem=p=>setForm(f=>({...f,items:[...f.items,{...p,qty:1,total:p.price}]}));
  const removeItem=pid=>setForm(f=>({...f,items:f.items.filter(i=>i.id!==pid)}));
  const createOrder=()=>{
    if(!form.customerName||!form.items.length)return;
    const sub=form.items.reduce((s,i)=>s+i.total,0);
    const del=form.mode==="domicilio"?(config.deliveryFee||5000):0;
    const o={id:newId(),createdAt:Date.now(),status:"pendiente",mode:form.mode,time:timeNow(),date:todayStr(),...form,subtotal:sub,delivery:del,total:sub+del};
    onAddOrder(o);setSelId(o.id);setNewModal(false);
    setForm({mode:"domicilio",customerName:"",customerPhone:"",customerEmail:"",address:"",addressRef:"",table:"",notes:"",payment:"cash",items:[]});
  };
  return <div style={{animation:"fadeUp .35s ease",display:"flex",gap:0,height:"calc(100vh - 110px)",overflow:"hidden"}}>
    {/* LEFT */}
    <div style={{width:255,flexShrink:0,background:T.white,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"12px 13px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <span style={{fontWeight:800,fontSize:14,color:T.text}}>Pedidos</span>
          <Btn sm icon="+" onClick={()=>setNewModal(true)}>Nuevo</Btn>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {[["all","Todos"],["pendiente","Pend."],["domicilio",vl.delivery_icon],isRestaurant&&["mesa","🪑"]].filter(Boolean).map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{padding:"4px 8px",borderRadius:20,border:`1px solid ${filter===k?pc:T.border}`,background:filter===k?pc+"18":"transparent",color:filter===k?pc:T.mid,fontSize:10,fontWeight:filter===k?700:500,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {shown.length===0&&<div style={{textAlign:"center",padding:"40px 14px",color:T.light,fontSize:12}}>Sin pedidos</div>}
        {shown.map(o=>{
          const isNew=Date.now()-o.createdAt<25000;
          return <div key={o.id} onClick={()=>setSelId(o.id)} style={{padding:"11px 13px",borderBottom:`1px solid ${T.border}`,cursor:"pointer",background:selId===o.id?pc+"10":"transparent",borderLeft:`3px solid ${selId===o.id?pc:"transparent"}`,transition:"all .15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
              <div style={{fontWeight:700,fontSize:13,color:isNew?pc:T.text}}>{o.customerName||"Sin nombre"}{isNew&&<span style={{marginLeft:4,fontSize:8,background:pc,color:"#fff",borderRadius:20,padding:"1px 5px",fontWeight:800}}>NUEVO</span>}</div>
              <span style={{fontSize:8,fontWeight:700,color:"#fff",background:SC[o.status]||"#999",borderRadius:20,padding:"2px 6px",flexShrink:0}}>{SL[o.status]}</span>
            </div>
            <div style={{fontSize:11,color:T.mid}}>{o.mode==="domicilio"?vl.delivery_icon+" "+vl.delivery_title:o.mode==="mesa"?"🪑 "+(o.table||"Mesa"):"🏪 "+vl.pickup_title}</div>
            <div style={{fontSize:11,color:T.light}}>{o.items?.length||0} ítem{o.items?.length!==1?"s":""} · {fmtCOP(o.total)} · {o.time}</div>
          </div>;
        })}
      </div>
    </div>
    {/* RIGHT */}
    <div style={{flex:1,overflowY:"auto",background:T.bg}}>
      {!sel&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:T.light}}>
        <div style={{fontSize:52,marginBottom:10}}>📋</div>
        <div style={{fontSize:15,fontWeight:700,color:T.mid}}>Selecciona un pedido</div>
        <div style={{fontSize:12,marginTop:4}}>O crea uno nuevo con el botón "+ Nuevo"</div>
      </div>}
      {sel&&<div style={{padding:"20px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <div style={{fontSize:11,color:T.mid,marginBottom:2}}>{vl.order} · {sel.mode==="domicilio"?vl.delivery_title:sel.mode==="mesa"?"En Mesa":vl.pickup_title}</div>
            <div style={{fontWeight:900,fontSize:20,color:T.text}}>#{sel.id.toUpperCase()}</div>
            <div style={{fontSize:12,color:T.mid,marginTop:2}}>{sel.date} · {sel.time}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
            <button onClick={()=>printComanda(sel)} title="Imprimir comanda para cocina" style={{padding:"7px 13px",background:T.white,border:`1.5px solid ${T.border}`,borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:700,color:T.text,display:"flex",alignItems:"center",gap:6,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>🖨️ Comanda</button>
            {sel.mode==="domicilio"&&<button onClick={()=>{setDelivWaPhone("");setDelivWaModal(true);}} title="Enviar pedido al domiciliario por WhatsApp" style={{padding:"7px 13px",background:"#22c55e18",border:"1.5px solid #22c55e44",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:700,color:"#16a34a",display:"flex",alignItems:"center",gap:6,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>🛵 WhatsApp domiciliario</button>}
            <span style={{fontSize:12,fontWeight:700,color:"#fff",background:SC[sel.status],borderRadius:20,padding:"5px 14px"}}>{SL[sel.status]}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{display:"flex",gap:0,marginBottom:18,background:T.white,borderRadius:12,overflow:"hidden",border:`1px solid ${T.border}`}}>
          {Object.entries(SL).map(([k,l],i)=>{const done=Object.keys(SL).indexOf(k)<=Object.keys(SL).indexOf(sel.status);return(
            <div key={k} style={{flex:1,padding:"8px 4px",textAlign:"center",background:done?SC[k]+"18":"transparent",borderRight:i<4?`1px solid ${T.border}`:"none"}}>
              <div style={{fontSize:9,fontWeight:700,color:done?SC[k]:T.light}}>{l}</div>
            </div>
          );})}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
          <Card>
            <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:12}}>👤 Datos del cliente</div>
            {[["Cliente",sel.customerName||"—"],["📞 Teléfono",sel.customerPhone||"—"],["📧 Email",sel.customerEmail||"—"],sel.mode==="domicilio"&&["📍 Dirección",sel.address||"—"],sel.mode==="domicilio"&&["🏠 Referencia",sel.addressRef||"—"],sel.mode==="mesa"&&["🪑 Mesa",sel.table||"—"],["💳 Pago",{cash:"Efectivo",nequi:"Nequi",daviplata:"Daviplata",card:"Tarjeta"}[sel.payment]||sel.payment],sel.notes&&["📝 Notas",sel.notes]].filter(Boolean).map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:12,paddingBottom:7,borderBottom:`1px solid ${T.border}`}}>
                <span style={{color:T.mid}}>{l}</span><span style={{color:T.text,fontWeight:600,textAlign:"right",maxWidth:"55%"}}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{fontWeight:800,fontSize:13,color:T.text,marginBottom:12}}>🛒 Detalle del pedido</div>
            {sel.items?.map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:13}}><span style={{color:T.text}}>{it.qty} {it.name}</span><span style={{fontWeight:700}}>{fmtCOP(it.price*it.qty)}</span></div>)}
            <div style={{borderTop:`1px solid ${T.border}`,marginTop:7,paddingTop:7}}>
              {sel.mode==="domicilio"&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.mid,marginBottom:4}}><span>{vl.delivery_fee_label}</span><span>{fmtCOP(sel.delivery||0)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:16}}><span>Total</span><span style={{color:pc}}>{fmtCOP(sel.total)}</span></div>
            </div>
            {sel.status!=="entregado"&&<div style={{marginTop:12,padding:"8px 12px",background:T.greenL,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:11,fontWeight:700,color:T.green}}>Pago: {sel.payment==="cash"?"Efectivo":sel.payment}</span>
              <Btn sm v="success">Recibir pago</Btn>
            </div>}
          </Card>
        </div>
        {sel.status!=="entregado"&&<div style={{background:T.white,borderRadius:14,padding:"14px 18px",border:`1px solid ${T.border}`,display:"flex",gap:10,alignItems:"center",boxShadow:T.sh}}>
          <div style={{flex:1,fontSize:12,color:T.mid}}>
            <span style={{fontWeight:700,color:T.text}}>Estado: {SL[sel.status]}</span>
            {sel.status==="pendiente"&&<div>Acepta el pedido para empezar a procesarlo</div>}
          </div>
          {K_NEXT[sel.status]&&<Btn v="green" onClick={()=>{onMove(sel.id,K_NEXT[sel.status]);setSelId(null);setTimeout(()=>setSelId(sel.id),50);}} style={{padding:"12px 22px",fontSize:14,fontWeight:800}}>{NL[sel.status]} →</Btn>}
          {sel.status!=="entregado"&&<Btn v="ghost" onClick={()=>onMove(sel.id,"entregado")}>Finalizar</Btn>}
        </div>}
      </div>}
    </div>
    {/* NEW ORDER MODAL */}
    {newModal&&<Modal title="Nuevo pedido" icon="📝" onClose={()=>setNewModal(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Modo</label>
            <div style={{display:"flex",gap:6}}>
              {[["domicilio",vl.delivery_icon+" "+vl.delivery_title],isRestaurant&&["mesa","🪑 Mesa"],["pickup","🏪 "+vl.pickup_title]].filter(Boolean).map(([k,l])=>(
                <button key={k} onClick={()=>setForm(p=>({...p,mode:k}))} style={{flex:1,padding:"8px",borderRadius:9,border:`1.5px solid ${form.mode===k?pc:T.border}`,background:form.mode===k?pc+"15":"transparent",color:form.mode===k?pc:T.mid,fontSize:11,fontWeight:form.mode===k?700:500,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </div>
          <Field label="Nombre del cliente *" value={form.customerName} onChange={v=>setForm(p=>({...p,customerName:v}))} required/>
          <Field label="Teléfono *" value={form.customerPhone} onChange={v=>setForm(p=>({...p,customerPhone:v}))} type="tel" required/>
          <Field label="Email" value={form.customerEmail} onChange={v=>setForm(p=>({...p,customerEmail:v}))} type="email"/>
          {form.mode==="domicilio"&&<><Field label="Dirección *" value={form.address} onChange={v=>setForm(p=>({...p,address:v}))} placeholder="Cra 5 #15-32, El Peñón" required/><Field label="Referencia" value={form.addressRef} onChange={v=>setForm(p=>({...p,addressRef:v}))} placeholder="Apto 304, torre A, portería…"/></>}
          {form.mode==="mesa"&&<Field label="Número de mesa *" value={form.table} onChange={v=>setForm(p=>({...p,table:v}))} placeholder="Mesa 3, 4A…" required/>}
          <Field label="Notas" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} textarea rows={2} placeholder={vl.notes_placeholder}/>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Método de pago</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[["cash","💵 Efectivo"],["nequi","📱 Nequi"],["daviplata","📲 Daviplata"],["card","💳 Tarjeta"]].map(([k,l])=>(
                <button key={k} onClick={()=>setForm(p=>({...p,payment:k}))} style={{padding:"5px 10px",borderRadius:20,border:`1.5px solid ${form.payment===k?pc:T.border}`,background:form.payment===k?pc+"18":"transparent",color:form.payment===k?pc:T.mid,fontSize:11,fontWeight:form.payment===k?700:500,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{marginBottom:8,fontSize:12,fontWeight:700,color:T.mid}}>Agregar productos</div>
          <div style={{maxHeight:200,overflowY:"auto",marginBottom:10,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
            {products.filter(p=>p.active&&p.stock).map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}} onClick={()=>addItem(p)}>
                <span style={{fontSize:13,color:T.text}}>{p.emoji} {p.name}</span>
                <div style={{display:"flex",gap:7,alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,color:T.violet}}>{fmtCOP(p.price)}</span>
                  <span style={{fontSize:16,color:T.green,fontWeight:700}}>+</span>
                </div>
              </div>
            ))}
          </div>
          {form.items.length>0&&<div style={{background:T.violetL,borderRadius:10,padding:12}}>
            <div style={{fontSize:11,fontWeight:700,color:T.violet,marginBottom:7}}>Pedido</div>
            {form.items.map((it,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,fontSize:12}}>
                <span style={{color:T.violetD}}>{it.qty}× {it.name}</span>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{color:T.violet,fontWeight:700}}>{fmtCOP(it.total)}</span>
                  <button onClick={()=>removeItem(it.id)} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:14}}>×</button>
                </div>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${T.violet}30`,paddingTop:7,marginTop:5,display:"flex",justifyContent:"space-between",fontWeight:800,color:T.violet,fontSize:14}}>
              <span>Total</span><span>{fmtCOP(form.items.reduce((s,i)=>s+i.total,0)+(form.mode==="domicilio"?(config.deliveryFee||5000):0))}</span>
            </div>
          </div>}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:8}}>
        <Btn full v="neutral" onClick={()=>setNewModal(false)}>Cancelar</Btn>
        <Btn full disabled={!form.customerName||!form.items.length} onClick={createOrder}>Crear pedido</Btn>
      </div>
    </Modal>}
    {delivWaModal&&sel&&<div onClick={()=>setDelivWaModal(false)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:900,fontSize:17,color:T.text}}>🛵 Enviar al domiciliario</div>
          <button onClick={()=>setDelivWaModal(false)} style={{background:"none",border:"none",color:T.mid,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#166534"}}>
          <div style={{fontWeight:700,marginBottom:4}}>Pedido #{sel.id.toUpperCase().slice(0,8)}</div>
          <div>{sel.customerName} · {sel.address}</div>
          <div style={{marginTop:4,color:"#16a34a",fontWeight:600}}>{sel.items?.length} producto{sel.items?.length!==1?"s":""} · {fmtCOP(sel.total)}</div>
        </div>
        <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>NÚMERO WHATSAPP DEL DOMICILIARIO</label>
        <input
          value={delivWaPhone}
          onChange={e=>setDelivWaPhone(e.target.value)}
          placeholder="+57 300 000 0000"
          type="tel"
          autoFocus
          style={{width:"100%",boxSizing:"border-box",padding:"11px 13px",background:"rgba(0,0,0,.04)",border:`1.5px solid ${T.border}`,borderRadius:11,color:T.text,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",marginBottom:14}}
        />
        <div style={{fontSize:11,color:T.mid,marginBottom:16,lineHeight:1.5}}>
          Se abrirá WhatsApp con el mensaje pre-llenado: datos del cliente, productos, total y enlace de ubicación en Google Maps.
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn full v="neutral" onClick={()=>setDelivWaModal(false)}>Cancelar</Btn>
          <button onClick={()=>{if(!delivWaPhone.trim())return;sendToDelivery(sel,delivWaPhone);setDelivWaModal(false);}} disabled={!delivWaPhone.trim()} style={{flex:1,padding:"11px",background:delivWaPhone.trim()?"#22c55e":"#e5e7eb",border:"none",borderRadius:12,color:delivWaPhone.trim()?"#fff":T.mid,fontWeight:800,fontSize:14,cursor:delivWaPhone.trim()?"pointer":"default",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"background .2s"}}>
            💬 Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>}
  </div>;
}

/* ─── ADMIN: RESERVAS ─────────────────────────────────────── */
function SecReservas(){
  const [reservations,setReservations]=useState([
    {id:"rv1",name:"Familia Martínez",phone:"3001234567",date:todayStr(),time:"19:00",guests:4,area:"Interior",status:"confirmada",notes:"Cumpleaños"},
    {id:"rv2",name:"Andrea Ríos",phone:"3102345678",date:todayStr(),time:"20:30",guests:2,area:"Terraza",status:"pendiente",notes:""},
  ]);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({name:"",phone:"",email:"",date:todayStr(),time:"19:00",guests:2,area:"Interior",notes:"",status:"pendiente"});
  const SR={pendiente:{label:"Pendiente",color:T.amber},confirmada:{label:"Confirmada",color:T.green},sentada:{label:"En mesa",color:T.blue},completada:{label:"Completada",color:T.mid},cancelada:{label:"Cancelada",color:T.red}};
  const RN={pendiente:"confirmada",confirmada:"sentada",sentada:"completada"};
  const TIMES=["12:00","12:30","13:00","13:30","14:00","14:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00"];
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Reservas</h2><p style={{color:T.mid,fontSize:13,marginTop:2}}>Hoy: {reservations.filter(r=>r.date===todayStr()).length} · Total: {reservations.length}</p></div>
      <div style={{display:"flex",gap:8}}>
        <Btn v="light" sm onClick={()=>{setForm(p=>({...p,status:"sentada",notes:"Walk-in"}));setModal(true);}}>🚶 Walk-in</Btn>
        <Btn icon="+" onClick={()=>setModal(true)}>Nueva reserva</Btn>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      {[["📅","Hoy",reservations.filter(r=>r.date===todayStr()).length,T.violet],["✅","Confirmadas",reservations.filter(r=>r.status==="confirmada").length,T.green],["🪑","En mesa",reservations.filter(r=>r.status==="sentada").length,T.blue],["⏳","Pendientes",reservations.filter(r=>r.status==="pendiente").length,T.amber]].map(([ic,l,v,c])=>(
        <StatCard key={l} icon={ic} label={l} value={v} color={c}/>
      ))}
    </div>
    {reservations.map(r=>{const st=SR[r.status]||SR.pendiente;return(
      <Card key={r.id} style={{padding:"14px 16px",marginBottom:8,borderLeft:`3px solid ${st.color}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
          <div><div style={{fontWeight:800,fontSize:14,color:T.text}}>{r.name}</div><div style={{fontSize:11,color:T.mid}}>📞 {r.phone} · 👥 {r.guests} pers. · 🕐 {r.time} · 📍 {r.area}</div></div>
          <span style={{fontSize:10,fontWeight:700,background:st.color+"18",color:st.color,borderRadius:20,padding:"3px 9px"}}>{st.label}</span>
        </div>
        {r.notes&&<div style={{fontSize:11,color:T.violet,fontStyle:"italic",marginBottom:7}}>📝 {r.notes}</div>}
        <div style={{display:"flex",gap:8}}>
          {RN[r.status]&&<Btn sm v="light" onClick={()=>setReservations(p=>p.map(x=>x.id===r.id?{...x,status:RN[r.status]}:x))}>✓ {SR[RN[r.status]]?.label}</Btn>}
          {r.status!=="cancelada"&&<Btn sm v="danger" onClick={()=>setReservations(p=>p.map(x=>x.id===r.id?{...x,status:"cancelada"}:x))}>Cancelar</Btn>}
        </div>
      </Card>
    );})}
    {modal&&<Modal title="Nueva reserva" icon="🗓️" onClose={()=>setModal(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Nombre *" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} required/>
        <Field label="Teléfono *" value={form.phone} onChange={v=>setForm(p=>({...p,phone:v}))} required/>
        <Field label="Email" value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} type="email"/>
        <div><label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Personas</label><div style={{display:"flex",gap:4}}>{[1,2,3,4,5,6,7,8].map(n=><button key={n} onClick={()=>setForm(p=>({...p,guests:n}))} style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1.5px solid ${form.guests===n?T.violet:T.border}`,background:form.guests===n?T.violetL:"transparent",color:form.guests===n?T.violet:T.mid,fontWeight:form.guests===n?800:500,fontSize:11,cursor:"pointer"}}>{n}</button>)}</div></div>
        <Field label="Fecha *" value={form.date} onChange={v=>setForm(p=>({...p,date:v}))} type="date" required/>
        <div><label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Hora *</label><select value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} style={{width:"100%",padding:"10px 13px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,outline:"none"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
      </div>
      <div style={{marginBottom:12}}><label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>Área</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["Interior","Terraza","Privado","Barra"].map(a=><button key={a} onClick={()=>setForm(p=>({...p,area:a}))} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${form.area===a?T.violet:T.border}`,background:form.area===a?T.violetL:"transparent",color:form.area===a?T.violet:T.mid,fontSize:11,fontWeight:form.area===a?700:500,cursor:"pointer"}}>{a}</button>)}</div></div>
      <Field label="Notas" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} textarea rows={2} placeholder="Alergias, ocasión especial…"/>
      <div style={{display:"flex",gap:10}}><Btn full v="neutral" onClick={()=>setModal(false)}>Cancelar</Btn><Btn full disabled={!form.name||!form.phone} onClick={()=>{setReservations(p=>[{...form,id:newId(),createdAt:Date.now()},...p]);setModal(false);}}>Guardar reserva</Btn></div>
    </Modal>}
  </div>;
}

/* ─── ADMIN: FACTURACIÓN ──────────────────────────────────── */
function SecFacturacion({billing,setBilling,user,configName,showToast}){
  const [payReqs,setPayReqs]=useState([]);
  const [modal,setModal]=useState(null);
  const [receipt,setReceipt]=useState(null);
  const [notes,setNotes]=useState("");
  const [uploading,setUploading]=useState(false);
  const [selBank,setSelBank]=useState(0);
  const fileRef=useRef();

  useEffect(()=>{
    if(!user?.id)return;
    supabase.from("payment_requests").select("id,plan,amount,status,created_at,ceo_notes,reviewed_at").eq("owner_id",user.id).order("created_at",{ascending:false}).then(({data})=>{if(data)setPayReqs(data);});
  },[user]);

  const plan=billing.plan;
  const pc={starter:T.blue,pro:T.violet,business:T.pink}[plan]||T.violet;
  const pn={starter:"Starter",pro:"Pro",business:"Business"}[plan]||"Pro";
  const pendingReq=payReqs.find(r=>r.status==="pending");

  const handleFile=e=>{
    const f=e.target.files?.[0];if(!f)return;
    if(f.size>3*1024*1024){alert("El archivo no puede superar 3 MB.");return;}
    const rd=new FileReader();
    rd.onload=ev=>setReceipt({data:ev.target.result,name:f.name});
    rd.readAsDataURL(f);
  };

  const submitPayment=async()=>{
    if(!receipt){showToast("⚠️ Sube el comprobante de pago","err");return;}
    setUploading(true);
    const {error}=await supabase.from("payment_requests").insert({
      owner_id:user.id,restaurant_name:configName||"Restaurante",
      plan:modal.id,amount:modal.price,method:"transfer",status:"pending",
      receipt_data:receipt.data,receipt_name:receipt.name,notes,
    });
    setUploading(false);
    if(error){showToast("❌ Error al enviar. Intenta de nuevo.","err");return;}
    const newReq={id:Date.now()+"",plan:modal.id,amount:modal.price,status:"pending",created_at:new Date().toISOString()};
    setPayReqs(v=>[newReq,...v]);
    setBilling({...billing,plan:billing.plan});
    setModal(null);setReceipt(null);setNotes("");
    showToast("✅ Comprobante enviado — te avisaremos cuando sea aprobado");
  };

  const statusTag=(s,n)=>{
    if(s==="pending") return <Tag color={T.amber}>⏳ En revisión</Tag>;
    if(s==="approved") return <Tag color={T.green}>✅ Aprobado</Tag>;
    return <div style={{display:"flex",flexDirection:"column",gap:2}}><Tag color={T.red}>❌ Rechazado</Tag>{n&&<div style={{fontSize:10,color:T.mid}}>{n}</div>}</div>;
  };

  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:22}}><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Mi suscripción</h2></div>

    {/* Plan actual */}
    <Card style={{background:`linear-gradient(135deg,${pc}15,${pc}05)`,border:`1.5px solid ${pc}30`,marginBottom:pendingReq?12:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.mid,marginBottom:3,fontWeight:600,textTransform:"uppercase",letterSpacing:".5px"}}>Plan actual</div>
          <div style={{fontSize:24,fontWeight:900,color:T.text}}>Plan {pn}</div>
          <div style={{fontSize:13,color:T.mid,marginTop:3}}>Próxima factura: <strong>{billing.nextPayment}</strong> · {fmtCOP(billing.amount)}/mes</div>
        </div>
        <div style={{width:56,height:56,borderRadius:16,background:pc+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>💳</div>
      </div>
    </Card>

    {/* Aviso pago en revisión */}
    {pendingReq&&<div style={{background:T.amberL,border:`1.5px solid ${T.amber}40`,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"center"}}>
      <span style={{fontSize:20}}>⏳</span>
      <div>
        <div style={{fontWeight:800,fontSize:13,color:T.amber}}>Pago en revisión</div>
        <div style={{fontSize:12,color:T.text,marginTop:1}}>Enviaste un comprobante para el plan <strong>{pendingReq.plan?.charAt(0).toUpperCase()+pendingReq.plan?.slice(1)}</strong> — {fmtCOP(pendingReq.amount)}/mes. Te avisaremos cuando sea aprobado (máx. 24 h hábiles).</div>
      </div>
    </div>}

    {/* Planes */}
    <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>Planes disponibles</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:22}}>
      {PLANS_CATALOG.map(p=>{const isCurrent=p.id===plan;return(
        <Card key={p.id} style={{border:`2px solid ${isCurrent?p.color:T.border}`,position:"relative",textAlign:"center",padding:"20px 16px"}}>
          {p.popular&&!isCurrent&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:T.violet,color:"#fff",fontSize:10,fontWeight:800,padding:"3px 12px",borderRadius:20}}>⭐ Más popular</div>}
          {isCurrent&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:p.color,color:"#fff",fontSize:10,fontWeight:800,padding:"3px 12px",borderRadius:20}}>Tu plan actual</div>}
          <div style={{fontSize:18,fontWeight:900,color:T.text,marginBottom:3}}>{p.name}</div>
          <div style={{fontSize:24,fontWeight:900,color:p.color,marginBottom:14}}>{fmtCOP(p.price)}<span style={{fontSize:11,color:T.mid,fontWeight:500}}>/mes</span></div>
          {p.features.map(f=><div key={f} style={{fontSize:12,color:T.mid,marginBottom:5,display:"flex",alignItems:"center",gap:6,textAlign:"left"}}><span style={{color:T.green,fontWeight:900}}>✓</span>{f}</div>)}
          {!isCurrent&&!pendingReq&&<Btn full v="ghost" style={{marginTop:12}} onClick={()=>setModal(p)}>Cambiar a {p.name}</Btn>}
          {!isCurrent&&pendingReq&&<div style={{marginTop:12,fontSize:11,color:T.amber,fontWeight:600}}>Pago pendiente de revisión</div>}
          {isCurrent&&<div style={{marginTop:12,padding:"8px",background:p.color+"15",borderRadius:10,fontSize:12,fontWeight:700,color:p.color}}>Plan activo ✓</div>}
        </Card>
      );})}
    </div>

    {/* Historial de solicitudes */}
    <Card style={{overflow:"hidden",padding:0}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,fontWeight:800,fontSize:14,color:T.text}}>Historial de pagos</div>
      {payReqs.length===0?<div style={{padding:24,textAlign:"center",color:T.light,fontSize:13}}>Sin historial de pagos aún</div>:
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:T.bg}}>{["Fecha","Plan","Monto","Estado"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:T.mid,borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{payReqs.map((r,i)=>(
          <tr key={r.id||i} style={{borderBottom:`1px solid ${T.border}`}}>
            <td style={{padding:"12px 16px",fontSize:12,color:T.mid}}>{r.created_at?.split("T")[0]||"—"}</td>
            <td style={{padding:"12px 16px"}}><Tag color={{starter:T.blue,pro:T.violet,business:T.pink}[r.plan]||T.mid} sm>{r.plan?.charAt(0).toUpperCase()+r.plan?.slice(1)||"—"}</Tag></td>
            <td style={{padding:"12px 16px",fontSize:13,fontWeight:700}}>{fmtCOP(r.amount)}</td>
            <td style={{padding:"12px 16px"}}>{statusTag(r.status,r.ceo_notes)}</td>
          </tr>
        ))}</tbody>
      </table>}
    </Card>

    {/* Modal de pago */}
    {modal&&<Modal title={`Cambiar a Plan ${modal.name}`} icon="💳" onClose={()=>{setModal(null);setReceipt(null);setNotes("");}}>
      {/* Plan resumen */}
      <div style={{background:`linear-gradient(135deg,${modal.color}15,${modal.color}05)`,border:`1.5px solid ${modal.color}30`,borderRadius:14,padding:"16px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.mid,fontWeight:700,textTransform:"uppercase"}}>Nuevo plan</div>
          <div style={{fontSize:20,fontWeight:900,color:T.text}}>Plan {modal.name}</div>
          <div style={{fontSize:13,color:modal.color,fontWeight:700}}>{fmtCOP(modal.price)}/mes</div>
        </div>
        <div style={{fontSize:32}}>🚀</div>
      </div>

      {/* Instrucciones */}
      <div style={{fontSize:12,color:T.mid,background:T.bg,borderRadius:10,padding:"10px 14px",marginBottom:16,lineHeight:1.7,whiteSpace:"pre-line"}}>{BANK_INFO.instructions}</div>

      {/* Datos bancarios */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T.text,marginBottom:8}}>📋 Datos para transferencia</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {BANK_INFO.banks.map((b,i)=><button key={i} onClick={()=>setSelBank(i)} style={{flex:1,padding:"8px 6px",borderRadius:10,border:`2px solid ${selBank===i?T.violet:T.border}`,background:selBank===i?T.violetL:T.white,cursor:"pointer",fontSize:11,fontWeight:selBank===i?800:500,color:selBank===i?T.violet:T.mid,transition:"all .15s"}}>{BANK_INFO.banks[i].icon} {b.name}</button>)}
        </div>
        <div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Titular",BANK_INFO.titular],["Cédula",BANK_INFO.cedula],[BANK_INFO.banks[selBank].type,BANK_INFO.banks[selBank].number],["Referencia",configName||"Tu restaurante"]].map(([k,v])=>(
              <div key={k}>
                <div style={{fontSize:10,color:T.light,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                <div style={{fontSize:13,fontWeight:800,color:T.text,background:T.bg,borderRadius:7,padding:"6px 10px",letterSpacing:".3px"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload comprobante */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T.text,marginBottom:8}}>📸 Comprobante de pago <span style={{color:T.red}}>*</span></div>
        <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{display:"none"}}/>
        {!receipt?<div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${T.border}`,borderRadius:12,padding:"24px",textAlign:"center",cursor:"pointer",background:T.bg,transition:"border .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.violet} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <div style={{fontSize:24,marginBottom:6}}>📎</div>
          <div style={{fontSize:13,fontWeight:700,color:T.text}}>Sube tu comprobante</div>
          <div style={{fontSize:11,color:T.mid,marginTop:2}}>Imagen o PDF · Máx. 3 MB</div>
        </div>:
        <div style={{background:T.greenL,border:`1.5px solid ${T.green}40`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>✅</span>
            <div><div style={{fontSize:12,fontWeight:700,color:T.green}}>Comprobante listo</div><div style={{fontSize:11,color:T.mid}}>{receipt.name}</div></div>
          </div>
          <button onClick={()=>setReceipt(null)} style={{background:"none",border:"none",color:T.mid,cursor:"pointer",fontSize:16}}>✕</button>
        </div>}
      </div>

      {/* Notas opcionales */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:700,color:T.mid,marginBottom:6}}>Notas adicionales (opcional)</div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ej: Pagado el día de hoy desde Bancolombia..." rows={2} style={{width:"100%",padding:"10px 12px",border:`1px solid ${T.border}`,borderRadius:10,fontSize:12,color:T.text,background:T.bg,resize:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
      </div>

      <div style={{display:"flex",gap:10}}>
        <Btn v="ghost" onClick={()=>{setModal(null);setReceipt(null);setNotes("");}}>Cancelar</Btn>
        <Btn full onClick={submitPayment} disabled={uploading||!receipt}>{uploading?"Enviando…":"📤 Enviar comprobante"}</Btn>
      </div>
    </Modal>}
  </div>;
}

/* ─── ADMIN: INFORMES ─────────────────────────────────────── */
function SecInformes({products}){
  return <div style={{animation:"fadeUp .35s ease"}}>
    <h2 style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Informes</h2>
    <p style={{color:T.mid,fontSize:13,marginBottom:20}}>Análisis de desempeño — Abril 2026</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:20}}>
      <StatCard icon="👁️" label="Vistas totales" value="1,391" sub="↑ 18.3%" color={T.violet}/>
      <StatCard icon="📦" label="Pedidos semana" value="246" sub="↑ 8.1%" color={T.green}/>
      <StatCard icon="⏰" label="Hora pico" value="8 PM" sub="98 visitas/h" color={T.amber}/>
      <StatCard icon="💰" label="Ticket promedio" value={fmtCOP(42000)} color={T.blue}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <Card style={{minWidth:0,overflow:"hidden"}}>
        <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:14}}>Vistas por día</div>
        <div style={{width:"100%",height:150}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ANALYTICS_WEEK} margin={{top:5,right:5,left:-25,bottom:0}}>
              <defs><linearGradient id="gA1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.violet} stopOpacity={.25}/><stop offset="95%" stopColor={T.violet} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="d" tick={{fontSize:10,fill:T.light}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:`1px solid ${T.border}`,fontSize:11}}/>
              <Area type="monotone" dataKey="v" stroke={T.violet} fill="url(#gA1)" strokeWidth={2} name="Vistas"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card style={{minWidth:0,overflow:"hidden"}}>
        <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:14}}>Pedidos por día</div>
        <div style={{width:"100%",height:150}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ANALYTICS_WEEK} margin={{top:5,right:5,left:-25,bottom:0}}>
              <XAxis dataKey="d" tick={{fontSize:10,fill:T.light}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:`1px solid ${T.border}`,fontSize:11}} formatter={v=>[v+" pedidos"]}/>
              <Bar dataKey="o" fill={T.green} radius={[5,5,0,0]} name="Pedidos"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
    <Card>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>🧠 Insights con Inteligencia Artificial</div>
      {[
        {icon:"🚀",color:T.violet,tag:"Optimización",text:"Los viernes y sábados generan el 42% de tus ventas semanales. Considera personal extra esos días."},
        {icon:"⭐",color:T.blue,tag:"Producto",text:"Bandeja Paisa tiene 289 vistas pero 0% de domicilios. Agrégala a la carta de delivery para aumentar ingresos."},
        {icon:"💰",color:T.green,tag:"Precio",text:"Tu ticket promedio de $42.000 está 15% por encima del sector. Tus clientes valoran la calidad premium."},
      ].map(ins=>(
        <Card key={ins.tag} style={{marginBottom:10,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{width:46,height:46,borderRadius:12,background:ins.color+"12",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ins.icon}</div>
            <div><Tag color={ins.color}>{ins.tag}</Tag><p style={{fontSize:13,color:T.text,lineHeight:1.75,marginTop:6}}>{ins.text}</p></div>
          </div>
        </Card>
      ))}
    </Card>
  </div>;
}

/* ─── ADMIN: ASISTENTE IA ─────────────────────────────────── */
function SecAI({products,orders,cats,config,branches,onAddProduct,onUpdateProduct}){
  const WELCOME="¡Hola! Soy tu asistente de gestión ⚡\n\nTengo acceso completo a tus datos en tiempo real. Puedo:\n\n• 📊 **Analizar ventas** — ingresos, tendencias, hora pico\n• 👤 **Clientes** — quién más pide, ticket promedio\n• 🍽️ **Productos** — más vendidos, precios, disponibilidad\n• ✏️ **Hacer cambios** — precios, activar/desactivar, agregar\n\nPrueba: *\"¿Cuánto vendí este mes?\"* o *\"Sube el precio de la Bandeja a $42.000\"*";
  const [msgs,setMsgs]=useState([{role:"assistant",text:WELCOME,acts:[],type:"text"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [pendingActs,setPendingActs]=useState(null);
  const bottomRef=useRef();
  const inputRef=useRef();
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  // ── Contexto rico con datos reales ──────────────────────────
  const buildCtx=()=>{
    const delivered=orders.filter(o=>o.status==="entregado");
    const totalRev=delivered.reduce((s,o)=>s+(o.total||0),0);
    const avgTicket=delivered.length?Math.round(totalRev/delivered.length):0;
    // Clientes
    const custMap={};
    orders.forEach(o=>{
      const n=o.customerName||"Anónimo";
      if(!custMap[n])custMap[n]={pedidos:0,total:0,ultimoPedido:o.date||""};
      custMap[n].pedidos++;custMap[n].total+=(o.total||0);
      if((o.date||"")>custMap[n].ultimoPedido)custMap[n].ultimoPedido=o.date||"";
    });
    const topClientes=Object.entries(custMap).sort((a,b)=>b[1].pedidos-a[1].pedidos).slice(0,8).map(([nombre,d])=>({nombre,...d}));
    // Productos vendidos
    const prodSales={};
    orders.forEach(o=>(o.items||[]).forEach(it=>{
      const k=it.name||it.productId;
      if(!prodSales[k])prodSales[k]={qty:0,revenue:0};
      prodSales[k].qty+=(it.qty||1);
      prodSales[k].revenue+=(it.price||0)*(it.qty||1);
    }));
    const topProductos=Object.entries(prodSales).sort((a,b)=>b[1].qty-a[1].qty).slice(0,8).map(([nombre,d])=>({nombre,...d}));
    // Por modo
    const porModo={menu:0,domicilio:0,mesa:0};
    orders.forEach(o=>{const m=o.mode||"menu";porModo[m]=(porModo[m]||0)+1;});
    // Por día de la semana
    const porDia={};
    orders.forEach(o=>{
      if(o.createdAt||o.date){
        const d=new Date(o.createdAt||o.date);
        const dia=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()]||"";
        if(!porDia[dia])porDia[dia]={pedidos:0,ingresos:0};
        porDia[dia].pedidos++;porDia[dia].ingresos+=(o.total||0);
      }
    });
    return {
      restaurante:config.name,
      resumen:{totalPedidos:orders.length,pedidosEntregados:delivered.length,ingresosTotales:totalRev,ticketPromedio:avgTicket,pendientes:orders.filter(o=>o.status==="pendiente").length},
      topClientes,topProductos,
      distribucionModo:porModo,
      ventasPorDia:porDia,
      productos:products.map(p=>({id:p.id,nombre:p.name,precio:p.price,categoria:cats.find(c=>c.id===p.catId)?.name||p.catId,activo:p.active,enStock:p.stock,clicks:p.clicks})),
      categorias:cats.map(c=>({id:c.id,nombre:c.name})),
      ultimosPedidos:orders.slice(-30).map(o=>({id:o.id,cliente:o.customerName,total:o.total,estado:o.status,modo:o.mode,fecha:o.date||o.createdAt?.split("T")[0]||""})),
    };
  };

  const SYS=()=>`Eres el asistente IA de gestión para "${config.name||"el restaurante"}". Tienes acceso completo a todos los datos en tiempo real.

DATOS ACTUALES:
${JSON.stringify(buildCtx())}

RESPONDE SIEMPRE con JSON válido sin backticks, exactamente en este formato:
{"message":"texto claro y útil","actions":[],"confirmNeeded":false}

ACCIONES DISPONIBLES (incluir en "actions" cuando corresponda):
• Cambiar precio: {"type":"update","id":"p1","patch":{"price":42000},"preview":"Bandeja Paisa: $38.000 → $42.000"}
• Activar: {"type":"update","id":"p1","patch":{"active":true},"preview":"Activar: Bandeja Paisa"}
• Desactivar: {"type":"update","id":"p1","patch":{"active":false},"preview":"Desactivar: Bandeja Paisa"}
• Marcar agotado: {"type":"update","id":"p1","patch":{"stock":false},"preview":"Agotado: Bandeja Paisa"}
• Marcar disponible: {"type":"update","id":"p1","patch":{"stock":true},"preview":"Disponible: Bandeja Paisa"}
• Agregar: {"type":"add","data":{name,price,desc,catId,emoji,active:true,stock:true,featured:false,label:"",allergens:[]},"preview":"Agregar: [nombre] $[precio]"}

REGLAS CRÍTICAS:
1. Para cambios de precio/estado: pon "confirmNeeded":true y la acción lista. NO ejecutes sin confirmación.
2. Si el usuario dice "sí", "confirmar", "dale", "hazlo": pon "confirmNeeded":false y las mismas acciones listas.
3. Para reportes: usa los números EXACTOS de los datos. Sé específico con cifras.
4. Habla en español colombiano, amigable y directo. Máximo 4 oraciones.
5. Usa formato markdown: **negrita** para números importantes, listas con •`;

  // ── Enviar mensaje ──────────────────────────────────────────
  const send=async(overrideText)=>{
    const txt=(overrideText||input).trim();
    if(!txt||loading)return;
    if(!overrideText)setInput("");
    setLoading(true);
    setMsgs(p=>[...p,{role:"user",text:txt,acts:[],type:"text"}]);
    const apiKey=import.meta.env.VITE_ANTHROPIC_KEY;
    if(!apiKey){
      setMsgs(p=>[...p,{role:"assistant",text:"⚠️ Falta configurar la clave de API.\n\nAgrega tu clave de Anthropic en el archivo `.env`:\n```\nVITE_ANTHROPIC_KEY=sk-ant-...\n```\nLuego reinicia el servidor de desarrollo.",acts:[],type:"text"}]);
      setLoading(false);return;
    }
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-opus-4-5",max_tokens:900,system:SYS(),messages:[{role:"user",content:txt}]})
      });
      const data=await res.json();
      if(data.error){throw new Error(data.error.message||"API error");}
      const raw=(data.content?.[0]?.text||"{}").replace(/```json\n?|```/g,"").trim();
      let parsed={message:"✓",actions:[],confirmNeeded:false};
      try{parsed=JSON.parse(raw);}catch{parsed={message:raw.slice(0,500),actions:[],confirmNeeded:false};}
      const acts=parsed.actions||[];
      if(parsed.confirmNeeded&&acts.length>0){
        setPendingActs(acts);
        setMsgs(p=>[...p,{role:"assistant",text:parsed.message||"",acts:[],type:"confirm",pendingActs:acts}]);
      } else {
        const done=[];
        for(const a of acts){
          if(a.type==="update"&&a.id){await onUpdateProduct(a.id,a.patch);done.push(a.preview||"Producto actualizado");}
          else if(a.type==="add"&&a.data){await onAddProduct({...a.data,id:newId(),img:"",clicks:0,labelColor:"#f97316",allergens:a.data.allergens||[]});done.push(a.preview||"Producto agregado");}
        }
        setPendingActs(null);
        setMsgs(p=>[...p,{role:"assistant",text:parsed.message||"",acts:done,type:"text"}]);
      }
    }catch(e){
      setMsgs(p=>[...p,{role:"assistant",text:`❌ Error: ${e.message||"No se pudo conectar"}. Verifica tu clave de API.`,acts:[],type:"text"}]);
    }
    setLoading(false);setTimeout(()=>inputRef.current?.focus(),80);
  };

  // ── Confirmar acciones pendientes ───────────────────────────
  const confirmPending=async()=>{
    if(!pendingActs||loading)return;
    setLoading(true);
    setMsgs(p=>[...p,{role:"user",text:"✅ Confirmar",acts:[],type:"text"}]);
    const done=[];
    for(const a of pendingActs){
      if(a.type==="update"&&a.id){await onUpdateProduct(a.id,a.patch);done.push(a.preview||"Actualizado");}
      else if(a.type==="add"&&a.data){await onAddProduct({...a.data,id:newId(),img:"",clicks:0,labelColor:"#f97316",allergens:a.data.allergens||[]});done.push(a.preview||"Agregado");}
    }
    setPendingActs(null);
    setMsgs(p=>[...p,{role:"assistant",text:`✅ ¡Listo! Realicé **${done.length}** cambio${done.length!==1?"s":""} exitosamente.`,acts:done,type:"text"}]);
    setLoading(false);setTimeout(()=>inputRef.current?.focus(),80);
  };

  // ── Render de texto markdown simple ─────────────────────────
  const renderMd=t=>t.split("\n").map((l,i)=>{
    const h=l.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/`(.*?)`/g,"<code style='background:#f0f2f8;padding:1px 5px;border-radius:4px;font-size:11px'>$1</code>");
    return <p key={i} style={{margin:"1px 0",fontSize:13,lineHeight:1.7}} dangerouslySetInnerHTML={{__html:h}}/>;
  });

  const QUICK=["¿Cuánto vendí este mes?","¿Quién es el cliente que más pide?","¿Cuáles son los productos más vendidos?","¿Qué productos están agotados?","Sube el precio de la Bandeja Paisa a $42.000","Agrega jugo de lulo a $8.000"];

  return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
    <div style={{marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(135deg,${T.violet},${T.pink})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚡</div>
      <div>
        <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:0}}>Asistente IA</h2>
        <p style={{color:T.mid,fontSize:11,margin:0}}>Claude Opus 4 · Datos en tiempo real · {orders.length} pedidos · {products.length} productos</p>
      </div>
    </div>
    <Card style={{flex:1,display:"flex",flexDirection:"column",padding:0,overflow:"hidden",minHeight:0}}>
      {/* Mensajes */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:14,alignItems:"flex-end",gap:8}}>
            {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.violet},${T.pink})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>⚡</div>}
            <div style={{maxWidth:"78%"}}>
              <div style={{padding:"12px 15px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?`linear-gradient(135deg,${T.violet},${T.pink})`:T.bg,color:m.role==="user"?"#fff":T.text,border:m.role==="user"?"none":`1px solid ${T.border}`}}>
                {renderMd(m.text)}
              </div>
              {/* Acciones completadas */}
              {m.acts?.length>0&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>
                {m.acts.map((a,j)=><div key={j} style={{fontSize:11,fontWeight:700,background:T.greenL,color:T.green,borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:4}}>✓ {a}</div>)}
              </div>}
              {/* Card de confirmación */}
              {m.type==="confirm"&&m.pendingActs&&pendingActs&&<div style={{marginTop:8,background:T.amberL,border:`1.5px solid ${T.amber}`,borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:8}}>⚠️ Confirma los siguientes cambios:</div>
                {m.pendingActs.map((a,j)=><div key={j} style={{fontSize:12,color:T.text,padding:"3px 0",borderBottom:`1px solid ${T.amber}30`}}>• {a.preview||a.type}</div>)}
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={confirmPending} disabled={loading} style={{flex:1,padding:"8px 0",background:T.green,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Confirmar</button>
                  <button onClick={()=>{setPendingActs(null);setMsgs(p=>[...p,{role:"assistant",text:"De acuerdo, cancelé los cambios. ¿En qué más te puedo ayudar?",acts:[],type:"text"}]);}} style={{flex:1,padding:"8px 0",background:T.redL,color:T.red,border:`1px solid ${T.red}30`,borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>❌ Cancelar</button>
                </div>
              </div>}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:10}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.violet},${T.pink})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>⚡</div>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:"16px 16px 16px 4px",padding:"12px 16px",display:"flex",gap:5,alignItems:"center"}}>
            {[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:T.violet,animation:`dotB 1.2s ease ${j*0.2}s infinite`}}/>)}
            <span style={{fontSize:11,color:T.mid,marginLeft:4}}>Analizando datos…</span>
          </div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      {/* Sugerencias rápidas */}
      <div style={{padding:"6px 14px 4px",display:"flex",gap:6,overflowX:"auto",borderTop:`1px solid ${T.border}30`}}>
        {QUICK.map(q=><button key={q} onClick={()=>{if(!loading){setInput(q);setTimeout(()=>inputRef.current?.focus(),50);}}} style={{flexShrink:0,padding:"5px 11px",borderRadius:20,border:`1px solid ${T.border}`,background:T.white,color:T.mid,fontSize:10,cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s"}}>{q}</button>)}
      </div>
      {/* Input */}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,background:T.white}}>
        <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Pregunta algo sobre tu negocio o pide un cambio…" disabled={loading}
          style={{flex:1,padding:"10px 14px",background:T.bg,border:`1.5px solid ${loading?T.violet:T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"border-color .2s"}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{width:44,height:44,borderRadius:10,background:!loading&&input.trim()?`linear-gradient(135deg,${T.violet},${T.pink})`:T.bg,border:"none",color:!loading&&input.trim()?"#fff":T.light,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:loading||!input.trim()?"not-allowed":"pointer",transition:"all .2s",flexShrink:0}}>
          {loading?<div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${T.violet}`,borderTopColor:"transparent",animation:"spin .8s linear infinite"}}/>:"→"}
        </button>
      </div>
    </Card>
  </div>;
}

/* ─── MENU PREVIEW (sidebar time-real) ───────────────────── */
function MenuPreview({config,products,cats}){
  const [selCat,setSelCat]=useState(cats[0]?.id||"");
  const pc=config.primaryColor||"#f97316";
  const isDark=config.menuStyle==="dark";
  const bg=isDark?"#111009":"#f8f7f4";
  const surf=isDark?"#1e1a14":"#fff";
  const txt=isDark?"#f5f0e6":"#1a1a1a";
  const mid=isDark?"rgba(255,255,255,.5)":"rgba(0,0,0,.5)";
  const bdr=isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.08)";
  const activeCats=cats.filter(c=>c.active&&products.some(p=>p.catId===c.id&&p.active));
  const catProds=products.filter(p=>p.catId===selCat&&p.active);
  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:bg,overflow:"hidden"}}>
    <div style={{position:"relative",height:100,overflow:"hidden",flexShrink:0}}>
      {config.coverImg&&<img src={config.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.55}} alt=""/>}
      <div style={{position:"absolute",inset:0,background:isDark?"linear-gradient(to top,rgba(17,16,9,1),rgba(0,0,0,.2))":"linear-gradient(to top,rgba(248,247,244,1),rgba(255,255,255,.1))"}}/>
      <div style={{position:"absolute",bottom:10,left:10,right:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:10,background:pc+"28",border:`1.5px solid ${pc}44`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>{config.logo&&(config.logo.startsWith("http")||config.logo.startsWith("data:"))?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:17}}>{config.logo||"🏪"}</span>}</div>
          <div><div style={{color:txt,fontWeight:800,fontSize:13,lineHeight:1}}>{config.name}</div><div style={{color:pc,fontSize:9,fontStyle:"italic",marginTop:1}}>{config.tagline}</div></div>
        </div>
      </div>
    </div>
    <div style={{background:isDark?"rgba(17,16,9,.97)":bg,borderBottom:`1px solid ${bdr}`,display:"flex",overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
      {activeCats.map(c=><button key={c.id} onClick={()=>setSelCat(c.id)} style={{flexShrink:0,padding:"8px 10px",background:"none",border:"none",borderBottom:selCat===c.id?`2.5px solid ${pc}`:"2.5px solid transparent",cursor:"pointer",fontSize:9,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:selCat===c.id?800:500,color:selCat===c.id?pc:mid,whiteSpace:"nowrap"}}>{c.icon} {c.name}</button>)}
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"8px 8px 14px"}}>
      {catProds.map(p=>(
        <div key={p.id} style={{background:surf,borderRadius:10,marginBottom:7,overflow:"hidden",border:`1px solid ${bdr}`,opacity:p.stock?1:0.5}}>
          {p.img&&<div style={{height:75,overflow:"hidden",position:"relative"}}>
            <img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.name}/>
            <div style={{position:"absolute",inset:0,background:isDark?"linear-gradient(to top,rgba(30,26,20,.9),transparent 55%)":"linear-gradient(to top,rgba(255,255,255,.7),transparent 55%)"}}/>
            <div style={{position:"absolute",bottom:6,left:7,right:7}}>
              <div style={{color:txt,fontWeight:700,fontSize:10,lineHeight:1.2}}>{p.name}</div>
              <div style={{color:pc,fontWeight:800,fontSize:10}}>{fmtCOP(p.price)}</div>
            </div>
            {p.label&&<div style={{position:"absolute",top:4,left:4,background:p.labelColor,color:"#fff",borderRadius:20,padding:"1px 5px",fontSize:7,fontWeight:800}}>{p.label}</div>}
            {!p.stock&&<div style={{position:"absolute",top:4,right:4,background:"rgba(220,38,38,.9)",color:"#fff",borderRadius:20,padding:"1px 5px",fontSize:7,fontWeight:800}}>Agotado</div>}
          </div>}
          {!p.img&&<div style={{padding:"8px 9px",display:"flex",gap:7,alignItems:"center"}}>
            <span style={{fontSize:16}}>{p.emoji}</span>
            <div style={{flex:1}}><div style={{color:txt,fontWeight:700,fontSize:10}}>{p.name}</div><div style={{color:pc,fontWeight:800,fontSize:10}}>{fmtCOP(p.price)}</div></div>
          </div>}
          {config.showAllergens&&p.allergens?.length>0&&<div style={{padding:"0 8px 5px",display:"flex",gap:2}}>{p.allergens.map(a=>{const al=ALLERGENS_LIST.find(x=>x.id===a);return al?<span key={a} style={{fontSize:9}} title={al.l}>{al.i}</span>:null;})}</div>}
        </div>
      ))}
      {catProds.length===0&&<div style={{textAlign:"center",padding:"24px 8px",color:mid,fontSize:10}}>Sin productos en esta categoría</div>}
    </div>
  </div>;
}

/* ─── BANNERS CARRUSEL (VISTA CLIENTE) ───────────────────── */
function BannersCarousel({banners,primaryColor,isDark,cats,onSelectCat,catalogBtn="🍽️ Ver carta completa"}){
  const [idx,setIdx]=useState(0);
  const [showCats,setShowCats]=useState(false);
  const total=banners.length;
  useEffect(()=>{
    if(total<=1)return;
    const t=setInterval(()=>setIdx(i=>(i+1)%total),4500);
    return()=>clearInterval(t);
  },[total]);
  const b=banners[idx];
  const bg=b.bgColor||primaryColor;
  const handleBannerClick=()=>{
    if(b.linkType==="category"&&b.linkCatId){onSelectCat(b.linkCatId);return;}
    if(b.linkType==="external"&&b.linkUrl){window.open(b.linkUrl,"_blank","noopener");return;}
    setShowCats(v=>!v);
  };
  const ctaLabel=b.linkType==="category"?"Ver productos →":b.linkType==="external"?"Ver oferta →":null;
  return <div style={{padding:"12px 12px 4px"}}>
    {/* Banner principal */}
    <div style={{position:"relative",borderRadius:18,overflow:"hidden",height:160,marginBottom:10,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,.18)"}}
      onClick={handleBannerClick}>
      {b.img
        ?<img src={b.img} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} alt={b.title}/>
        :<div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${bg},${bg}bb)`}}/>
      }
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.15) 55%,transparent 100%)"}}/>
      <div style={{position:"absolute",bottom:14,left:16,right:ctaLabel?120:16}}>
        <div style={{color:"#fff",fontWeight:900,fontSize:20,letterSpacing:"-.3px",lineHeight:1.15,textShadow:"0 2px 10px rgba(0,0,0,.5)",marginBottom:4}}>{b.title}</div>
        {b.subtitle&&<div style={{color:"rgba(255,255,255,.8)",fontSize:12,fontWeight:500}}>{b.subtitle}</div>}
      </div>
      {ctaLabel&&<div style={{position:"absolute",bottom:14,right:14,background:"rgba(255,255,255,.2)",backdropFilter:"blur(8px)",border:"1.5px solid rgba(255,255,255,.35)",borderRadius:20,padding:"6px 13px",color:"#fff",fontSize:11,fontWeight:800,whiteSpace:"nowrap",letterSpacing:".2px"}}>{ctaLabel}</div>}
      {total>1&&<div style={{position:"absolute",top:10,right:12,display:"flex",gap:4}}>
        {banners.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setIdx(i);}} style={{width:i===idx?18:6,height:6,borderRadius:10,background:i===idx?"#fff":"rgba(255,255,255,.4)",transition:"all .3s",cursor:"pointer"}}/>)}
      </div>}
    </div>
    {/* Botón ver carta completa */}
    <button onClick={()=>setShowCats(!showCats)} style={{width:"100%",padding:"13px",background:isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)",border:`1.5px solid ${isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.08)"}`,borderRadius:14,color:isDark?"#fff":"#1a1a1a",fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:showCats?8:0,transition:"all .2s"}}>
      <span>{catalogBtn}</span>
      <span style={{fontSize:18,opacity:.4,transform:showCats?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
    </button>
    {showCats&&<div style={{display:"flex",flexDirection:"column",gap:6,animation:"fadeUp .2s ease"}}>
      {cats.map(c=><button key={c.id} onClick={()=>{onSelectCat(c.id);setShowCats(false);}} style={{width:"100%",padding:"11px 16px",background:isDark?"rgba(255,255,255,.05)":"#fff",border:`1px solid ${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.07)"}`,borderRadius:12,color:isDark?"rgba(255,255,255,.85)":"#1a1a1a",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"'Plus Jakarta Sans',sans-serif",textAlign:"left"}}>
        <span style={{fontSize:18}}>{c.icon}</span>
        <span style={{flex:1}}>{c.name}</span>
        <span style={{fontSize:14,opacity:.3}}>›</span>
      </button>)}
    </div>}
  </div>;
}

/* ─── MODAL DETALLE PRODUCTO ─────────────────────────────── */
function ProductDetailModal({p,onClose,onAdd,orderMode,pc,isDark,config,bdr,txt,mid}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:520,background:"rgba(0,0,0,.78)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:isDark?"#1c1710":"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",animation:"slideUp .28s ease",boxShadow:"0 -10px 60px rgba(0,0,0,.5)"}}>
      {/* Imagen grande */}
      {p.img
        ?<div style={{position:"relative",height:270,flexShrink:0,overflow:"hidden",borderRadius:"24px 24px 0 0"}}>
          <img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.name}/>
          <div style={{position:"absolute",inset:0,background:isDark?"linear-gradient(to top,rgba(28,23,16,1) 0%,transparent 55%)":"linear-gradient(to top,rgba(255,255,255,.85) 0%,transparent 55%)"}}/>
          {!p.stock&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{background:"rgba(220,38,38,.95)",color:"#fff",fontSize:14,fontWeight:800,padding:"9px 24px",borderRadius:24}}>Temporalmente agotado</span></div>}
          {p.label&&p.stock&&<div style={{position:"absolute",top:16,left:16,background:p.labelColor,color:"#fff",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:800}}>{p.label}</div>}
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,width:36,height:36,borderRadius:"50%",background:"rgba(0,0,0,.55)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
        </div>
        :<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 20px 0"}}>
          <div style={{width:72,height:72,borderRadius:20,background:isDark?"rgba(255,255,255,.07)":"#f4f4f4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42}}>{p.emoji}</div>
          <button onClick={onClose} style={{width:36,height:36,borderRadius:"50%",background:isDark?"rgba(255,255,255,.09)":"#f0f0f0",border:"none",color:mid,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      }
      <div style={{padding:"18px 22px 36px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <h2 style={{color:txt,fontSize:22,fontWeight:900,letterSpacing:"-.3px",margin:0,lineHeight:1.2,flex:1,paddingRight:10}}>{p.name}</h2>
          {!p.img&&p.label&&p.stock&&<div style={{background:p.labelColor,color:"#fff",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:800,flexShrink:0}}>{p.label}</div>}
        </div>
        <div style={{color:pc,fontWeight:900,fontSize:26,marginBottom:14,letterSpacing:"-.5px"}}>{fmtCOP(orderMode==="domicilio"&&p.deliveryPrice?p.deliveryPrice:p.price)}</div>
        {p.desc&&<p style={{color:mid,fontSize:14,lineHeight:1.75,margin:"0 0 16px"}}>{p.desc}</p>}
        {config.showAllergens&&p.allergens?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {p.allergens.map(a=>{const al=ALLERGENS_LIST.find(x=>x.id===a);return al?<span key={a} style={{fontSize:12,background:isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)",borderRadius:20,padding:"4px 10px",color:mid,fontWeight:600}}>{al.i} {al.l}</span>:null;})}
        </div>}
        {orderMode&&p.stock&&<button onClick={()=>{onAdd(p);onClose();}} style={{width:"100%",padding:"16px",background:`linear-gradient(135deg,${pc},${pc}cc)`,border:"none",borderRadius:18,color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 8px 28px ${pc}55`,marginTop:6,letterSpacing:"-.2px"}}>+ Agregar al pedido · {fmtCOP(orderMode==="domicilio"&&p.deliveryPrice?p.deliveryPrice:p.price)}</button>}
        {orderMode&&!p.stock&&<div style={{textAlign:"center",padding:"14px",background:"rgba(220,38,38,.08)",borderRadius:14,color:"#dc2626",fontWeight:700,fontSize:13,marginTop:6}}>No disponible en este momento</div>}
        {!orderMode&&<button onClick={onClose} style={{width:"100%",padding:"14px",background:"none",border:`1.5px solid ${bdr}`,borderRadius:16,color:mid,fontSize:14,fontWeight:600,cursor:"pointer",marginTop:6,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Cerrar</button>}
      </div>
    </div>
  </div>;
}

/* ─── TARJETA DE CATEGORÍA (VISTA CLIENTE) ───────────────── */
const CAT_GRADIENTS=[
  ["#f97316","#ea580c"],["#8b5cf6","#7c3aed"],["#059669","#047857"],
  ["#2563eb","#1d4ed8"],["#dc2626","#b91c1c"],["#d97706","#b45309"],
  ["#0891b2","#0e7490"],["#be185d","#9d174d"],["#16a34a","#15803d"],["#7c3aed","#6d28d9"],
];
function CategoryCard({c,pc,isDark,onClick,idx,prodCount}){
  const [g0,g1]=CAT_GRADIENTS[idx%CAT_GRADIENTS.length];
  const hasBg=!!c.bgImg;
  const iconType=c.iconType||"emoji";
  const txColor=c.textColor||"#ffffff";
  const fs=c.fontStyle||"modern";
  const fontMap={modern:["'Plus Jakarta Sans',sans-serif","900","-.3px","none","normal"],classic:["Georgia,serif","700","0","none","italic"],bold:["Impact,sans-serif","900","1px","uppercase","normal"],elegant:["'Plus Jakarta Sans',sans-serif","300","3px","uppercase","normal"]};
  const [ff,fw,lsp,ttu,fst]=fontMap[fs]||fontMap.modern;
  const bgFinal=hasBg?"#111":(c.bgColor||`linear-gradient(135deg,${g0},${g1})`);
  const shadowColor=c.bgColor||g0;
  return <div onClick={onClick}
    style={{width:"100%",height:130,borderRadius:18,overflow:"hidden",position:"relative",cursor:"pointer",
      marginBottom:12,background:bgFinal,
      boxShadow:`0 6px 20px ${hasBg?"rgba(0,0,0,.35)":shadowColor+"44"}`,transition:"transform .18s,box-shadow .18s"}}
    onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.015)";e.currentTarget.style.boxShadow=hasBg?"0 10px 28px rgba(0,0,0,.5)":`0 10px 28px ${shadowColor}66`;}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 6px 20px ${hasBg?"rgba(0,0,0,.35)":shadowColor+"44"}`;}}>
    {hasBg&&<img src={c.bgImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} alt=""/>}
    <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,.55) 0%,rgba(0,0,0,.1) 60%,rgba(0,0,0,0) 100%)"}}/>
    {iconType==="emoji"&&<div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",fontSize:62,opacity:.85,filter:"drop-shadow(0 4px 12px rgba(0,0,0,.4))",userSelect:"none",flexShrink:0}}>{c.icon}</div>}
    {iconType==="photo"&&c.iconImg&&<div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",width:70,height:70,borderRadius:14,overflow:"hidden",border:"2px solid rgba(255,255,255,.25)",boxShadow:"0 4px 16px rgba(0,0,0,.5)",flexShrink:0}}><img src={c.iconImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/></div>}
    <div style={{position:"absolute",left:20,top:"50%",transform:"translateY(-50%)",maxWidth:"calc(100% - 104px)",overflow:"hidden"}}>
      <div style={{color:txColor,fontWeight:fw,fontFamily:ff,fontSize:20,letterSpacing:lsp,textTransform:ttu,fontStyle:fst,textShadow:"0 2px 12px rgba(0,0,0,.7)",lineHeight:1.25,wordBreak:"break-word"}}>{c.name}</div>
      {prodCount>0&&<div style={{color:txColor,opacity:.7,fontSize:11,marginTop:5,fontWeight:600}}>{prodCount} producto{prodCount!==1?"s":""}</div>}
    </div>
    <div style={{position:"absolute",right:16,bottom:12,color:txColor,opacity:.6,fontSize:22,fontWeight:900}}>›</div>
  </div>;
}

/* ─── ICONOS REDES SOCIALES ──────────────────────────────── */
function SocialLinksRow({config,isDark}){
  const sl=config?.socialLinks||{};
  const wa=(sl.whatsapp||config?.whatsapp||"").replace(/\D/g,"");
  const links=[
    wa&&{key:"wa",href:`https://wa.me/${wa}`,bg:"#22c55e",icon:"whatsapp"},
    sl.instagram&&{key:"ig",href:sl.instagram,bg:"radial-gradient(circle at 30% 107%, #fdf497 0%,#fd5949 45%,#d6249f 60%,#285AEB 90%)",icon:"instagram"},
    sl.facebook&&{key:"fb",href:sl.facebook,bg:"#1877f2",icon:"facebook"},
    sl.tiktok&&{key:"tt",href:sl.tiktok,bg:"#010101",icon:"tiktok"},
    sl.tripadvisor&&{key:"ta",href:sl.tripadvisor,bg:"#34e0a1",icon:"tripadvisor"},
  ].filter(Boolean);
  if(!links.length)return null;
  const SVGS={
    whatsapp:<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
    instagram:<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    facebook:<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    tiktok:<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    tripadvisor:<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-3.5 9.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm7 0a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm-3.5-2L9 10.5h1.5V15l3-3H12V7.5z"/></svg>,
  };
  return <div style={{padding:"16px 16px 0",display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
    {links.map(l=><a key={l.key} href={l.href} target="_blank" rel="noreferrer"
      style={{width:52,height:52,borderRadius:"50%",background:l.bg,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",boxShadow:"0 4px 14px rgba(0,0,0,.22)",flexShrink:0}}>
      {SVGS[l.icon]}
    </a>)}
  </div>;
}

/* ─── POINT-IN-POLYGON (ray casting) ────────────────────── */
function pointInPoly(pt,poly){
  const x=pt.lng,y=pt.lat;let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const xi=poly[i].lng,yi=poly[i].lat,xj=poly[j].lng,yj=poly[j].lat;
    if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
  }
  return inside;
}
/* ─── MENÚ CLIENTE (VISTA PÚBLICA) ───────────────────────── */
function CustomerView({config,products,cats,onBack,onAddOrder,branches,banners=[],businessType="restaurant"}){
  const vl=(VERTICALS[businessType]||VERTICALS.restaurant).labels;
  const isRestaurant=businessType==="restaurant";
  const vertIcon=(VERTICALS[businessType]||VERTICALS.restaurant).icon;
  const [screen,setScreen]=useState("landing"); // landing | menu
  const [activeCat,setActiveCat]=useState("");
  const [cart,setCart]=useState([]);
  const [cartOpen,setCartOpen]=useState(false);
  const [q,setQ]=useState("");
  const [checkout,setCheckout]=useState(false);
  const [step,setStep]=useState(1);
  const [orderMode,setOrderMode]=useState(null);
  const [showPopup,setShowPopup]=useState(false);
  const popupTimerRef=useRef(null);
  const popup=config.promoPopup;
  const [selBranchId,setSelBranchId]=useState(null);
  const [branchPickerMode,setBranchPickerMode]=useState(null);
  const [selectedZone,setSelectedZone]=useState(null);
  const [zoneStatus,setZoneStatus]=useState(null); // null|"checking"|"found"|"none"
  const zoneTimer=useRef(null);
  const [form,setForm]=useState({name:"",phone:"",email:"",address:"",table:"",payment:"cash",notes:""});
  const [submitting,setSubmitting]=useState(false);
  const [trackedOrder,setTrackedOrder]=useState(null);
  const [selProd,setSelProd]=useState(null);
  const pc=config.primaryColor||"#f97316";
  const isDark=config.menuStyle==="dark";
  const bg=isDark?CM.bg:"#f8f7f4";
  const surf=isDark?CM.surface:"#fff";
  const card=isDark?CM.card:"#fff";
  const txt=isDark?CM.text:"#1a1a1a";
  const mid=isDark?CM.mid:"rgba(0,0,0,.5)";
  const bdr=isDark?CM.border:"rgba(0,0,0,.08)";
  const inp={width:"100%",boxSizing:"border-box",padding:"11px 13px",background:isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.05)",border:`1.5px solid ${bdr}`,borderRadius:11,color:txt,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",marginBottom:12};
  const selBranch=branches?.find(b=>b.id===selBranchId)||branches?.[0];
  const hasDomicilios=branches?.some(b=>b.services?.domicilios);
  const hasReservas=selBranch?.services?.reservas;
  const hasPickup=branches?.some(b=>b.services?.pickup);
  const deliveryZones=selBranch?.deliveryZones||branches?.find(b=>b.services?.domicilios)?.deliveryZones||[];
  const detectZone=useCallback(async addr=>{
    const zones=(selBranch?.deliveryZones||[]).filter(z=>z.active&&z.latLngs?.length>=3);
    if(!zones.length){setZoneStatus(null);return;}
    if(!addr?.trim()){setSelectedZone(null);setZoneStatus(null);return;}
    setZoneStatus("checking");setSelectedZone(null);
    try{
      const city=selBranch?.city||"";
      const q=encodeURIComponent([addr,city].filter(Boolean).join(", "));
      const res=await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,{headers:{"Accept-Language":"es"}});
      const data=await res.json();
      if(!data?.length){setZoneStatus("none");return;}
      const pt={lat:parseFloat(data[0].lat),lng:parseFloat(data[0].lon)};
      const match=zones.find(z=>pointInPoly(pt,z.latLngs));
      if(match){setSelectedZone(match);setZoneStatus("found");}
      else setZoneStatus("none");
    }catch{setZoneStatus(null);}
  },[selBranch]);
  const effectiveMode=orderMode||"domicilio";
  const deliveryFee=selectedZone?.price||(effectiveMode==="domicilio"?config.deliveryFee||5000:0);
  const cartSubtotal=cart.reduce((s,c)=>s+c.total,0);
  const cartFinal=cartSubtotal+(effectiveMode==="domicilio"?deliveryFee:0);
  const cartCount=cart.reduce((s,c)=>s+c.qty,0);
  const getEffPrice=p=>orderMode==="domicilio"&&p.deliveryPrice?p.deliveryPrice:p.price;
  const channelOk=p=>orderMode==="domicilio"?(p.forDelivery!==false):(p.forMenu!==false);
  const activeCats=cats.filter(c=>c.active&&products.some(p=>p.catId===c.id&&p.active&&channelOk(p)));
  const catProds=q?products.filter(p=>p.active&&channelOk(p)&&(p.name.toLowerCase().includes(q.toLowerCase())||p.desc.toLowerCase().includes(q.toLowerCase()))):products.filter(p=>p.catId===activeCat&&p.active&&channelOk(p));
  const featured=products.filter(p=>p.featured&&p.active&&p.stock&&channelOk(p));
  const add=p=>setCart(c=>[...c,{uid:Date.now()+Math.random(),product:p,qty:1,total:getEffPrice(p)}]);
  const rem=uid=>setCart(c=>c.filter(x=>x.uid!==uid));
  const ff=v=>setForm(f=>({...f,...v}));
  const STATUS_INFO={
    pendiente:{icon:"⏳",label:"Recibido — confirmando",color:"#f59e0b",desc:"Tu pedido fue recibido. Estamos confirmando."},
    en_cocina:{icon:vl.status_processing_icon,label:vl.status_processing,color:"#3b82f6",desc:vl.status_processing_desc},
    listo:{icon:"✅",label:vl.status_ready,color:"#059669",desc:vl.status_ready_desc},
    en_camino:{icon:vl.status_shipping_icon,label:vl.status_shipping,color:"#8b5cf6",desc:vl.status_shipping_desc},
    entregado:{icon:"🎉",label:vl.status_done,color:"#059669",desc:vl.status_done_desc},
  };
  useEffect(()=>{
    if(!trackedOrder||trackedOrder.status==="entregado")return;
    const t=setInterval(async()=>{
      const {data}=await supabase.from("orders").select("status").eq("id",trackedOrder.id).single();
      if(data&&data.status!==trackedOrder.status)setTrackedOrder(p=>({...p,status:data.status}));
    },4000);
    return()=>clearInterval(t);
  },[trackedOrder?.id,trackedOrder?.status]);
  // Popup trigger — fires when user enters the menu screen
  useEffect(()=>{
    if(screen!=="menu")return;
    if(!popup?.active||(!(popup.img)&&!(popup.title)))return;
    const freq=popup.frequency||"session";
    const key=`popup_${config.name||"menu"}`;
    if(freq==="session"&&sessionStorage.getItem(key))return;
    if(freq==="daily"){const stored=localStorage.getItem(key);if(stored===new Date().toDateString())return;}
    const delaySec=(popup.delay??20)*1000;
    popupTimerRef.current=setTimeout(()=>{
      setShowPopup(true);
      if(freq==="session")sessionStorage.setItem(key,"1");
      if(freq==="daily")localStorage.setItem(key,new Date().toDateString());
    },delaySec);
    return()=>clearTimeout(popupTimerRef.current);
  },[screen]);
  const closePopup=()=>setShowPopup(false);
  const handlePopupCTA=()=>{
    if(popup?.linkType==="category"&&popup.linkCatId){setActiveCat(popup.linkCatId);closePopup();return;}
    if(popup?.linkType==="external"&&popup.linkUrl){window.open(popup.linkUrl,"_blank","noopener");closePopup();return;}
    closePopup();
  };
  const submitOrder=async()=>{
    if(!form.name||!form.phone)return;
    if(orderMode==="domicilio"&&!form.address)return;
    setSubmitting(true);
    const o={id:newId(),createdAt:Date.now(),status:"pendiente",mode:effectiveMode,time:timeNow(),date:todayStr(),customerName:form.name,customerPhone:form.phone,customerEmail:form.email,address:form.address,addressRef:selectedZone?.name||"",table:form.table,notes:form.notes,payment:form.payment,items:cart.map(c=>({id:c.product.id,name:c.product.name,price:c.product.price,qty:c.qty,total:c.total,emoji:c.product.emoji})),subtotal:cartSubtotal,delivery:effectiveMode==="domicilio"?deliveryFee:0,total:cartFinal};
    if(onAddOrder)await onAddOrder(o);
    setTrackedOrder(o);setCart([]);setCheckout(false);setStep(1);setSubmitting(false);
  };
  if(screen==="landing"){
    const mostOrdered=products.filter(p=>p.active&&p.stock&&channelOk(p)&&(p.clicks||0)>0).sort((a,b)=>(b.clicks||0)-(a.clicks||0)).slice(0,8);
    const btnBase={width:"100%",padding:"14px 18px",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:14,fontWeight:700,border:"none",textAlign:"left"};
    return <div style={{minHeight:"100vh",background:isDark?CM.bg:"#fff",paddingBottom:72}}>
      <style>{STYLES}</style>
      {/* Hero */}
      <div style={{position:"relative",height:250,overflow:"hidden",flexShrink:0}}>
        {config.coverImg&&<img src={config.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 25%"}} alt=""/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.72))"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
          {config.logo&&<div style={{width:config.logo.startsWith("http")||config.logo.startsWith("data:")?90:72,height:config.logo.startsWith("http")||config.logo.startsWith("data:")?90:72,borderRadius:22,background:(config.logo.startsWith("http")||config.logo.startsWith("data:"))?"transparent":pc+"33",border:(config.logo.startsWith("http")||config.logo.startsWith("data:"))?"none":`3px solid ${pc}88`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",backdropFilter:"blur(10px)",boxShadow:`0 8px 30px rgba(0,0,0,.4)`}}>{(config.logo.startsWith("http")||config.logo.startsWith("data:"))?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:34}}>{config.logo}</span>}</div>}
          {config.name&&<div style={{color:"#fff",fontWeight:900,fontSize:26,letterSpacing:"-.5px",textShadow:"0 2px 12px rgba(0,0,0,.6)",textAlign:"center",padding:"0 20px"}}>{config.name}</div>}
          {config.tagline&&<div style={{color:"rgba(255,255,255,.7)",fontSize:13,textAlign:"center",maxWidth:260,padding:"0 20px"}}>{config.tagline}</div>}
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:config.openStatus?"#22c55e":"#ef4444",display:"inline-block",boxShadow:config.openStatus?"0 0 8px #22c55e":"none"}}/>
            <span style={{color:"rgba(255,255,255,.85)",fontSize:12,fontWeight:700}}>{config.openStatus?"Abierto ahora":"Cerrado"}</span>
          </div>
        </div>
      </div>
      {/* Recomendados + Más pedidos — grid cuadrado compacto */}
      {(featured.length>0||mostOrdered.length>0)&&<div style={{padding:"18px 14px 8px"}}>
        {featured.length>0&&<>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
            <span style={{fontSize:16}}>⭐</span>
            <span style={{color:isDark?CM.text:"#111",fontWeight:800,fontSize:14}}>{vl.featured_label}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
            {featured.slice(0,6).map(p=><div key={p.id} onClick={()=>{setScreen("menu");setTimeout(()=>setSelProd(p),80);}} style={{borderRadius:14,overflow:"hidden",cursor:"pointer",background:isDark?CM.card:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,.08)",border:`1px solid ${isDark?CM.border:"#f0f0f0"}`}}>
              <div style={{aspectRatio:"1",position:"relative",background:isDark?"rgba(255,255,255,.04)":"#f0f0f0"}}>
                {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} alt={p.name}/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:30}}>{p.emoji}</div>}
                {p.label&&<div style={{position:"absolute",top:5,left:5,background:p.labelColor,color:"#fff",borderRadius:8,padding:"2px 6px",fontSize:8,fontWeight:800}}>{p.label}</div>}
              </div>
              <div style={{padding:"7px 8px 9px"}}>
                <div style={{color:isDark?CM.text:"#111",fontWeight:700,fontSize:11,lineHeight:1.3,marginBottom:3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.name}</div>
                <div style={{color:pc,fontWeight:900,fontSize:12}}>{fmtCOP(p.price)}</div>
              </div>
            </div>)}
          </div>
        </>}
        {mostOrdered.length>0&&<>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
            <span style={{fontSize:16}}>🔥</span>
            <span style={{color:isDark?CM.text:"#111",fontWeight:800,fontSize:14}}>{vl.popular_label}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {mostOrdered.slice(0,6).map(p=><div key={p.id} onClick={()=>{setScreen("menu");setTimeout(()=>setSelProd(p),80);}} style={{borderRadius:14,overflow:"hidden",cursor:"pointer",background:isDark?CM.card:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,.08)",border:`1px solid ${isDark?CM.border:"#f0f0f0"}`}}>
              <div style={{aspectRatio:"1",position:"relative",background:isDark?"rgba(255,255,255,.04)":"#f0f0f0"}}>
                {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} alt={p.name}/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:30}}>{p.emoji}</div>}
              </div>
              <div style={{padding:"7px 8px 9px"}}>
                <div style={{color:isDark?CM.text:"#111",fontWeight:700,fontSize:11,lineHeight:1.3,marginBottom:3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.name}</div>
                <div style={{color:pc,fontWeight:900,fontSize:12}}>{fmtCOP(p.price)}</div>
              </div>
            </div>)}
          </div>
        </>}
      </div>}
      {/* Ver carta completa */}
      <div style={{padding:"16px 16px 8px"}}>
        <button onClick={()=>branches?.length>1?setBranchPickerMode("menu"):setScreen("menu")} style={{...btnBase,background:pc,color:"#fff",justifyContent:"center",gap:10,fontSize:15,fontWeight:800,boxShadow:`0 6px 24px ${pc}44`,borderRadius:16,padding:"16px"}}>
          {vl.catalog_btn}
        </button>
      </div>
      {/* Servicios */}
      {(hasDomicilios||hasPickup||hasReservas)&&<div style={{padding:"4px 16px 0",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{color:mid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:2,paddingLeft:2}}>{vl.how_order}</div>
        {hasDomicilios&&<button onClick={()=>{if(branches?.length>1)setBranchPickerMode("domicilio");else{setOrderMode("domicilio");setScreen("menu");}}} style={{...btnBase,background:isDark?"rgba(255,255,255,.06)":"#f8f8f8",color:isDark?"#fff":"#111",border:`1px solid ${isDark?"rgba(255,255,255,.08)":"#e5e7eb"}`}}>
          <span style={{fontSize:22,flexShrink:0}}>{vl.delivery_icon}</span><div><div style={{fontWeight:700}}>{vl.delivery_title}</div><div style={{fontSize:11,fontWeight:400,opacity:.5,marginTop:1}}>{vl.delivery_desc}</div></div><span style={{marginLeft:"auto",opacity:.3,fontSize:18}}>›</span>
        </button>}
        {hasPickup&&<button onClick={()=>{if(branches?.length>1)setBranchPickerMode("pickup");else{setOrderMode("pickup");setScreen("menu");}}} style={{...btnBase,background:isDark?"rgba(255,255,255,.06)":"#f8f8f8",color:isDark?"#fff":"#111",border:`1px solid ${isDark?"rgba(255,255,255,.08)":"#e5e7eb"}`}}>
          <span style={{fontSize:22,flexShrink:0}}>🏪</span><div><div style={{fontWeight:700}}>{vl.pickup_title}</div><div style={{fontSize:11,fontWeight:400,opacity:.5,marginTop:1}}>{vl.pickup_desc}</div></div><span style={{marginLeft:"auto",opacity:.3,fontSize:18}}>›</span>
        </button>}
      </div>}
      {/* Info sucursal(es) */}
      {selBranch?.address&&<div style={{margin:"14px 16px 0",padding:"13px 16px",background:isDark?"rgba(255,255,255,.04)":"#f8f8f8",borderRadius:14,border:`1px solid ${isDark?"rgba(255,255,255,.06)":"#e8e8e8"}`}}>
        <div style={{color:mid,fontSize:10,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:".5px"}}>📍 {branches?.length>1?selBranch.name:"Ubicación"}</div>
        <div style={{color:isDark?CM.text:"#374151",fontSize:13,fontWeight:600}}>{selBranch.address}</div>
        {config.schedule&&<div style={{color:mid,fontSize:11,marginTop:4}}>🕐 {config.schedule}</div>}
        {branches?.length>1&&<button onClick={()=>setBranchPickerMode("info")} style={{marginTop:8,background:"none",border:`1px solid ${isDark?"rgba(255,255,255,.12)":pc+"44"}`,borderRadius:20,padding:"4px 12px",color:pc,fontSize:11,fontWeight:700,cursor:"pointer"}}>Cambiar sucursal ›</button>}
      </div>}
      {/* Redes sociales */}
      <SocialLinksRow config={config} isDark={isDark}/>
      {/* Modal selector de sucursal */}
      {branchPickerMode&&<div onClick={()=>setBranchPickerMode(null)} style={{position:"fixed",inset:0,zIndex:520,background:"rgba(0,0,0,.72)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:isDark?"#1c1710":"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"28px 20px 44px",boxShadow:"0 -10px 50px rgba(0,0,0,.4)",animation:"slideUp .28s ease"}}>
          <div style={{color:txt,fontWeight:900,fontSize:20,marginBottom:4,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {branchPickerMode==="domicilio"?"🛵 ¿A cuál sucursal pides?":branchPickerMode==="pickup"?"🏪 ¿De cuál sucursal recoges?":"📍 Selecciona tu sucursal"}
          </div>
          <div style={{color:mid,fontSize:13,marginBottom:20}}>Elige la más cercana a ti</div>
          {branches?.map(b=><button key={b.id} onClick={()=>{
            setSelBranchId(b.id);setBranchPickerMode(null);
            if(branchPickerMode==="domicilio"){setOrderMode("domicilio");setScreen("menu");}
            else if(branchPickerMode==="pickup"){setOrderMode("pickup");setScreen("menu");}
            else if(branchPickerMode==="menu") setScreen("menu");
          }} style={{width:"100%",padding:"16px 18px",background:isDark?"rgba(255,255,255,.05)":"#f8f8f8",border:`1.5px solid ${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.07)"}`,borderRadius:16,marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:14,fontFamily:"'Plus Jakarta Sans',sans-serif",textAlign:"left"}}>
            <span style={{width:40,height:40,borderRadius:12,background:pc+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📍</span>
            <div style={{flex:1}}>
              <div style={{color:txt,fontWeight:800,fontSize:15}}>{b.name}</div>
              <div style={{color:mid,fontSize:12,marginTop:2}}>{b.address}</div>
            </div>
            <span style={{color:pc,fontSize:22,fontWeight:900,lineHeight:1}}>›</span>
          </button>)}
        </div>
      </div>}
      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:40,background:isDark?"rgba(17,16,9,.97)":"rgba(255,255,255,.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"}`,display:"flex",height:58}}>
        <button style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,color:pc}}>
          <span style={{fontSize:18}}>🏠</span><span style={{fontSize:10,fontWeight:700}}>Inicio</span>
        </button>
        <button onClick={()=>setScreen("menu")} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,color:mid}}>
          <span style={{fontSize:18}}>{vertIcon}</span><span style={{fontSize:10,fontWeight:600}}>{vl.catalog}</span>
        </button>
        {(config.socialLinks?.whatsapp||config.whatsapp)&&<a href={`https://wa.me/${(config.socialLinks?.whatsapp||config.whatsapp||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,color:mid,textDecoration:"none"}}><span style={{fontSize:18}}>💬</span><span style={{fontSize:10,fontWeight:600}}>Contacto</span></a>}
      </div>
    </div>;
  }

  if(trackedOrder){
    const si=STATUS_INFO[trackedOrder.status]||STATUS_INFO.pendiente;
    const steps=["pendiente","en_cocina","listo","en_camino","entregado"];
    const idx=steps.indexOf(trackedOrder.status);
    return <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{STYLES}</style>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{background:surf,borderRadius:24,padding:28,border:`1px solid ${bdr}`,animation:"scaleIn .4s ease",marginBottom:12}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:52,marginBottom:8}}>{si.icon}</div>
            <div style={{color:txt,fontSize:20,fontWeight:900}}>{si.label}</div>
            <div style={{color:mid,fontSize:13,marginTop:4}}>{si.desc}</div>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:20}}>
            {steps.map((s,i)=><div key={s} style={{flex:1,height:5,borderRadius:10,background:i<=idx?si.color:isDark?"rgba(255,255,255,.1)":"#e5e7eb",transition:"background .5s"}}/>)}
          </div>
          <div style={{background:isDark?"rgba(255,255,255,.04)":"#f8f8f8",borderRadius:12,padding:"12px 16px",marginBottom:14}}>
            <div style={{color:mid,fontSize:10,fontWeight:700,marginBottom:4}}>CÓDIGO DE PEDIDO</div>
            <div style={{color:pc,fontSize:22,fontWeight:900,letterSpacing:3}}>{trackedOrder.id.toUpperCase().slice(0,8)}</div>
          </div>
          <div style={{fontSize:12,color:mid}}>
            {[["Subtotal",fmtCOP(trackedOrder.subtotal)],trackedOrder.mode==="domicilio"&&[vl.delivery_fee_label,fmtCOP(trackedOrder.delivery)]].filter(Boolean).map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span>{l}</span><span style={{color:txt,fontWeight:600}}>{v}</span></div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:900,color:txt,borderTop:`1px solid ${bdr}`,paddingTop:8,marginTop:6}}><span>Total</span><span style={{color:pc}}>{fmtCOP(trackedOrder.total)}</span></div>
          </div>
        </div>
        {trackedOrder.status!=="entregado"&&<div style={{textAlign:"center",color:mid,fontSize:12,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:si.color,animation:"pulse2 1.5s infinite"}}/>
          Actualizando en tiempo real…
        </div>}
        {trackedOrder.status==="entregado"&&<button onClick={()=>setTrackedOrder(null)} style={{width:"100%",padding:14,background:pc,border:"none",borderRadius:16,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>← Volver al menú</button>}
      </div>
    </div>;
  }
  return <div style={{minHeight:"100vh",background:bg,paddingBottom:130}}>
    {/* POPUP PROMOCIONAL */}
    {showPopup&&popup&&<div onClick={closePopup} style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,.82)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .3s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:380,animation:"scaleIn .3s ease"}}>
        {/* Imagen o fondo */}
        <div style={{borderRadius:24,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.6)",position:"relative",background:popup.img?"#111":(popup.bgColor||"#7c3aed")}}>
          {popup.img
            ?<img src={popup.img} style={{width:"100%",display:"block",maxHeight:"72vh",objectFit:"contain"}} alt={popup.title||"Promo"}/>
            :<div style={{minHeight:260,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 28px",gap:10}}>
               <div style={{color:"#fff",fontWeight:900,fontSize:26,textAlign:"center",lineHeight:1.2,textShadow:"0 2px 12px rgba(0,0,0,.3)"}}>{popup.title}</div>
               {popup.subtitle&&<div style={{color:"rgba(255,255,255,.78)",fontSize:14,textAlign:"center"}}>{popup.subtitle}</div>}
             </div>
          }
          {/* Overlay texto sobre imagen */}
          {popup.img&&(popup.title||popup.subtitle)&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.4) 60%,transparent 100%)",padding:"32px 20px 72px"}}>
            {popup.title&&<div style={{color:"#fff",fontWeight:900,fontSize:22,lineHeight:1.2,textShadow:"0 2px 10px rgba(0,0,0,.5)"}}>{popup.title}</div>}
            {popup.subtitle&&<div style={{color:"rgba(255,255,255,.8)",fontSize:13,marginTop:5}}>{popup.subtitle}</div>}
          </div>}
          {/* CTA button */}
          {popup.linkType!=="none"&&<div style={{position:"absolute",bottom:16,left:16,right:16}}>
            <button onClick={handlePopupCTA} style={{width:"100%",padding:"13px",background:pc,border:"none",borderRadius:16,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 6px 24px ${pc}66`,letterSpacing:"-.2px"}}>
              {popup.ctaText||"Ver promoción"} →
            </button>
          </div>}
        </div>
        {/* Cerrar */}
        <button onClick={closePopup} style={{position:"absolute",top:-14,right:-14,width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,.15)",backdropFilter:"blur(8px)",border:"2px solid rgba(255,255,255,.3)",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,zIndex:10}}>×</button>
      </div>
    </div>}
    {/* HERO — logo centrado */}
    <div style={{position:"relative",height:230,overflow:"hidden"}}>
      {config.coverImg&&<img src={config.coverImg} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 25%"}} alt=""/>}
      <div style={{position:"absolute",inset:0,background:isDark?"linear-gradient(to bottom,rgba(0,0,0,.35),rgba(17,16,9,.95))":"linear-gradient(to bottom,rgba(0,0,0,.3),rgba(248,247,244,1))"}}/>
      {/* Logo centrado */}
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,paddingTop:10}}>
        {config.logo&&(()=>{const isImg=config.logo.startsWith("http")||config.logo.startsWith("data:");return<div style={{width:isImg?80:64,height:isImg?80:64,borderRadius:20,background:isImg?"transparent":pc+"35",border:isImg?"none":`2.5px solid ${pc}66`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",backdropFilter:"blur(8px)",boxShadow:`0 4px 24px rgba(0,0,0,.5)`}}>{isImg?<img src={config.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<span style={{fontSize:30}}>{config.logo}</span>}</div>})()}
        <div style={{textAlign:"center"}}>
          {config.name&&<h1 style={{color:"#fff",fontSize:24,fontWeight:900,letterSpacing:"-.5px",lineHeight:1,textShadow:"0 2px 14px rgba(0,0,0,.6)",margin:0}}>{config.name}</h1>}
          {config.tagline&&<div style={{color:pc,fontSize:12,marginTop:4,fontWeight:600,textShadow:"0 1px 8px rgba(0,0,0,.4)"}}>{config.tagline}</div>}
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{color:config.openStatus?"#4ade80":T.red,fontWeight:700,fontSize:11,display:"flex",alignItems:"center",gap:4}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:config.openStatus?"#4ade80":T.red,display:"inline-block",boxShadow:config.openStatus?"0 0 7px #4ade80":"none"}}/>
            {config.openStatus?"Abierto":"Cerrado"}
          </span>
        </div>
      </div>
    </div>
    {/* BANNERS INICIO */}
    {banners.filter(b=>b.active&&(b.position==="inicio"||b.position==="ambos"||!b.position)).length>0&&
      <BannersCarousel banners={banners.filter(b=>b.active&&(b.position==="inicio"||b.position==="ambos"||!b.position))} primaryColor={pc} isDark={isDark} cats={activeCats} onSelectCat={id=>{setActiveCat(id);}} catalogBtn={vl.catalog_btn}/>}
    {featured.length>0&&!q&&!activeCat&&<div style={{padding:"12px 0 4px"}}>
      <div style={{padding:"0 14px 8px",fontSize:10,fontWeight:700,color:mid,textTransform:"uppercase",letterSpacing:"1px"}}>⭐ {vl.featured_label}</div>
      <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none",padding:"0 14px"}}>
        {featured.map(p=><div key={p.id} onClick={()=>setSelProd(p)} style={{flexShrink:0,width:148,background:card,border:`1px solid ${bdr}`,borderRadius:14,overflow:"hidden",cursor:"pointer"}}>
          <div style={{height:95,overflow:"hidden",position:"relative"}}>{p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.name}/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:34,background:isDark?"rgba(255,255,255,.04)":"#f0f0f0"}}>{p.emoji}</div>}{p.label&&<div style={{position:"absolute",bottom:5,left:6,background:p.labelColor,color:"#fff",borderRadius:12,padding:"2px 7px",fontSize:9,fontWeight:800}}>{p.label}</div>}</div>
          <div style={{padding:"8px 10px 11px"}}><div style={{color:txt,fontWeight:700,fontSize:11,lineHeight:1.3,marginBottom:2}}>{p.name}</div><div style={{color:pc,fontWeight:900,fontSize:13}}>{fmtCOP(p.price)}</div></div>
        </div>)}
      </div>
    </div>}
    {/* BARRA DE BÚSQUEDA + NAVEGACIÓN */}
    <div style={{position:"sticky",top:0,zIndex:20,background:isDark?"rgba(17,16,9,.97)":bg,backdropFilter:"blur(16px)",borderBottom:`1px solid ${bdr}`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px"}}>
        {activeCat&&!q&&<button onClick={()=>setActiveCat("")} style={{flexShrink:0,width:34,height:34,borderRadius:10,background:isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)",border:"none",color:mid,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>←</button>}
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`🔍 Buscar en ${vl.catalog.toLowerCase()}…`} style={{flex:1,padding:"8px 12px",background:isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.06)",border:`1px solid ${bdr}`,borderRadius:10,color:txt,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/>
        {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",color:mid,cursor:"pointer",fontSize:18}}>×</button>}
      </div>
      {activeCat&&!q&&<div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",padding:"0 12px 8px",gap:6}}>
        {activeCats.map(c=><button key={c.id} onClick={()=>setActiveCat(c.id)} style={{flexShrink:0,padding:"6px 14px",background:activeCat===c.id?pc+"18":"none",border:`1.5px solid ${activeCat===c.id?pc:bdr}`,borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:activeCat===c.id?800:500,color:activeCat===c.id?pc:mid,whiteSpace:"nowrap",transition:"all .15s"}}>{c.icon} {c.name}</button>)}
      </div>}
    </div>
    {/* GRID DE CATEGORÍAS (vista inicial) */}
    {!activeCat&&!q&&<div style={{padding:"14px 14px 0"}}>
      <style>{`@media(min-width:600px){.cat-grid{display:grid!important;grid-template-columns:1fr 1fr;gap:12px}.cat-grid>div{margin-bottom:0!important}}`}</style>
      <div className="cat-grid">
        {activeCats.map((c,i)=><CategoryCard key={c.id} c={c} pc={pc} isDark={isDark}
          onClick={()=>setActiveCat(c.id)} idx={i}
          prodCount={products.filter(p=>p.catId===c.id&&p.active).length}/>)}
      </div>
      {activeCats.length===0&&<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:44,marginBottom:10}}>{vertIcon}</div><div style={{color:mid,fontSize:14}}>Sin categorías activas</div></div>}
    </div>}
    {/* RESULTADOS DE BÚSQUEDA o PRODUCTOS DE CATEGORÍA */}
    {(activeCat||q)&&<div style={{padding:"12px 12px 0"}}>
      {activeCat&&!q&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{fontSize:22}}>{activeCats.find(c=>c.id===activeCat)?.icon}</div>
        <div style={{color:txt,fontWeight:900,fontSize:18}}>{activeCats.find(c=>c.id===activeCat)?.name}</div>
        <div style={{marginLeft:"auto",color:mid,fontSize:12}}>{catProds.length} {catProds.length===1?vl.item.toLowerCase():vl.itemPlural.toLowerCase()}</div>
      </div>}
      {(()=>{
        const prodBanners=banners.filter(b=>b.active&&(b.position==="productos"||b.position==="ambos"));
        return catProds.flatMap((p,i)=>{
          const productEl=<div key={p.id} onClick={()=>setSelProd(p)} style={{background:card,borderRadius:16,marginBottom:8,border:`1px solid ${p.stock?bdr:"rgba(220,38,38,.12)"}`,cursor:"pointer",opacity:p.stock?1:0.65,animation:`fadeUp .3s ease ${i*.04}s both`,display:"flex",alignItems:"stretch",overflow:"hidden",minHeight:88}} onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,.04)":card} onMouseLeave={e=>e.currentTarget.style.background=card}>
            <div style={{flexShrink:0,width:90,height:90,position:"relative",alignSelf:"center",margin:8,borderRadius:12,overflow:"hidden",background:isDark?"rgba(255,255,255,.06)":"#f0f0f0"}}>
              {p.img?<img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.name} loading="lazy"/>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:32}}>{p.emoji}</div>}
              {!p.stock&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{background:"rgba(220,38,38,.9)",color:"#fff",fontSize:9,fontWeight:800,padding:"3px 7px",borderRadius:8,textAlign:"center",lineHeight:1.2}}>Agotado</span></div>}
            </div>
            <div style={{flex:1,minWidth:0,padding:"10px 12px 10px 4px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:3}}>
                  <div style={{color:txt,fontWeight:700,fontSize:13,lineHeight:1.35,flex:1}}>{p.name}</div>
                  {p.label&&p.stock&&<div style={{flexShrink:0,background:p.labelColor,color:"#fff",borderRadius:10,padding:"2px 7px",fontSize:9,fontWeight:800}}>{p.label}</div>}
                </div>
                {p.desc&&<div style={{color:mid,fontSize:11,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",marginBottom:4}}>{p.desc}</div>}
                {config.showAllergens&&p.allergens?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
                  {p.allergens.map(a=>{const al=ALLERGENS_LIST.find(x=>x.id===a);return al?<span key={a} style={{fontSize:9,background:isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.06)",borderRadius:12,padding:"1px 6px",color:mid,fontWeight:600}}>{al.i}</span>:null;})}
                </div>}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{color:pc,fontWeight:900,fontSize:15}}>{fmtCOP(getEffPrice(p))}</span>
                {orderMode&&p.stock&&<button onClick={e=>{e.stopPropagation();add(p);}} style={{background:pc,border:"none",borderRadius:20,color:"#fff",fontSize:11,fontWeight:800,padding:"6px 14px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",flexShrink:0}}>+ Agregar</button>}
                {!orderMode&&<span style={{color:mid,fontSize:18,lineHeight:1}}>›</span>}
              </div>
            </div>
          </div>;
          const bannerEl=(i===2&&prodBanners.length>0)?<div key="promo-banner" style={{margin:"4px 0 8px"}}><BannersCarousel banners={prodBanners} primaryColor={pc} isDark={isDark} cats={activeCats} onSelectCat={id=>setActiveCat(id)} catalogBtn={vl.catalog_btn}/></div>:null;
          return bannerEl?[productEl,bannerEl]:[productEl];
        });
      })()}
      {catProds.length===0&&<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:44,marginBottom:10}}>{vertIcon}</div><div style={{color:mid,fontSize:14}}>{q?"Sin resultados":"Sin productos en esta categoría"}</div></div>}
    </div>}
    {/* BOTTOM NAV — Menú */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:30,background:isDark?"rgba(17,16,9,.97)":"rgba(255,255,255,.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"}`,display:"flex",height:56}}>
      <button onClick={()=>setScreen("landing")} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:mid}}>
        <span style={{fontSize:17}}>🏠</span><span style={{fontSize:9,fontWeight:600}}>Inicio</span>
      </button>
      <button style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:pc}}>
        <span style={{fontSize:17}}>{vertIcon}</span><span style={{fontSize:9,fontWeight:800}}>{vl.catalog}</span>
      </button>
      <button onClick={()=>{setActiveCat("");setQ("");document.querySelector('input[placeholder*="Buscar"]')?.focus();}} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:q?pc:mid}}>
        <span style={{fontSize:17}}>🔍</span><span style={{fontSize:9,fontWeight:600}}>Buscar</span>
      </button>
      {config.whatsapp&&<a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:mid,textDecoration:"none"}}>
        <span style={{fontSize:17}}>💬</span><span style={{fontSize:9,fontWeight:600}}>Contacto</span>
      </a>}
    </div>
    {cartCount>0&&!cartOpen&&<div style={{position:"fixed",bottom:64,left:"50%",transform:"translateX(-50%)",zIndex:25,width:"calc(100% - 24px)",maxWidth:430}}>
      <button onClick={()=>setCartOpen(true)} style={{width:"100%",padding:"13px 20px",background:isDark?"rgba(17,16,9,.97)":"rgba(255,255,255,.97)",backdropFilter:"blur(20px)",color:txt,border:`1.5px solid ${pc}44`,borderRadius:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 8px 32px rgba(0,0,0,.4),0 0 0 1px ${pc}18`,fontSize:13}}>
        <div style={{background:pc,borderRadius:20,padding:"4px 12px",fontSize:13,fontWeight:900,color:"#fff"}}>{cartCount}</div>
        <span style={{fontWeight:700}}>Ver pedido</span>
        <span style={{fontWeight:900,color:pc,fontSize:15}}>{fmtCOP(cartFinal)}</span>
      </button>
    </div>}
    {cartOpen&&<div onClick={()=>setCartOpen(false)} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,.75)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:isDark?"#1a1510":"#fff",borderRadius:"24px 24px 0 0",padding:20,width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"87vh",overflowY:"auto",animation:"slideUp .3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontSize:20,fontWeight:800,color:txt,margin:0}}>{vl.cart_title}</h2>
          <button onClick={()=>setCartOpen(false)} style={{width:30,height:30,borderRadius:"50%",background:isDark?"rgba(255,255,255,.08)":"#f5f5f5",border:"none",color:mid,fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
        </div>
        {cart.map(c=>(
          <div key={c.uid} style={{display:"flex",gap:12,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${bdr}`}}>
            <div style={{width:50,height:50,borderRadius:12,overflow:"hidden",flexShrink:0,background:isDark?"rgba(255,255,255,.04)":"#f0f0f0"}}>{c.product.img?<img src={c.product.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:22}}>{c.product.emoji}</span>}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:txt}}>{c.qty}× {c.product.name}</div><div style={{fontSize:13,fontWeight:800,color:pc,marginTop:3}}>{fmtCOP(c.total)}</div></div>
            <button onClick={()=>rem(c.uid)} style={{background:"none",border:"none",color:"rgba(220,38,38,.5)",cursor:"pointer",fontSize:16,alignSelf:"flex-start",padding:"2px 6px"}}>×</button>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:17,marginBottom:16}}>
          <span style={{color:txt}}>Total</span><span style={{color:pc}}>{fmtCOP(cartFinal)}</span>
        </div>
        <button onClick={()=>{setCartOpen(false);setCheckout(true);setStep(orderMode?2:1);}} style={{width:"100%",padding:"15px",background:`linear-gradient(135deg,${pc},${pc}cc)`,border:"none",borderRadius:16,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 6px 24px ${pc}55`}}>Ir al checkout →</button>
      </div>
    </div>}
    {checkout&&<div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:isDark?"#1a1510":"#fff",borderRadius:"24px 24px 0 0",padding:"20px 20px 36px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"93vh",overflowY:"auto",animation:"slideUp .3s ease"}}>
        {step===1&&<>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{color:txt,fontSize:18,fontWeight:900,marginBottom:4}}>{vl.how_order}</div>
            <div style={{color:mid,fontSize:12}}>Elige el tipo de entrega</div>
          </div>
          {[
            hasDomicilios&&["domicilio",vl.delivery_icon,vl.delivery_title,vl.delivery_desc],
            hasPickup&&["pickup","🏪",vl.pickup_title,vl.pickup_desc],
            vl.table_mode&&["mesa","🪑",vl.table_title||"En mesa",vl.table_desc||"Pedido directo a tu mesa"]
          ].filter(Boolean).map(([k,icon,label,desc])=>(
            <button key={k} onClick={()=>{setOrderMode(k);setStep(2);}} style={{width:"100%",padding:"16px",background:isDark?"rgba(255,255,255,.05)":"#f8f8f8",border:`2px solid ${bdr}`,borderRadius:16,marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:14,fontFamily:"'Plus Jakarta Sans',sans-serif",textAlign:"left"}}>
              <span style={{fontSize:30}}>{icon}</span>
              <div><div style={{color:txt,fontWeight:800,fontSize:15}}>{label}</div><div style={{color:mid,fontSize:12}}>{desc}</div></div>
              <span style={{marginLeft:"auto",color:mid,fontSize:18}}>›</span>
            </button>
          ))}
          <button onClick={()=>setCheckout(false)} style={{width:"100%",padding:12,background:"none",border:`1px solid ${bdr}`,borderRadius:14,color:mid,fontSize:13,cursor:"pointer",marginTop:4}}>Cancelar</button>
        </>}
        {step===2&&<>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:mid,cursor:"pointer",fontSize:20,padding:0,lineHeight:1}}>←</button>
            <div style={{color:txt,fontSize:17,fontWeight:900}}>{vl.checkout_title}</div>
          </div>
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>NOMBRE COMPLETO *</label>
          <input value={form.name} onChange={e=>ff({name:e.target.value})} placeholder="Tu nombre" style={inp}/>
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>TELÉFONO / CELULAR *</label>
          <input value={form.phone} onChange={e=>ff({phone:e.target.value})} placeholder="+57 300 000 0000" type="tel" style={inp}/>
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>CORREO ELECTRÓNICO</label>
          <input value={form.email} onChange={e=>ff({email:e.target.value})} placeholder="tu@correo.com" type="email" style={inp}/>
          {effectiveMode==="domicilio"&&<>
            <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>DIRECCIÓN DE ENTREGA *</label>
            <input value={form.address} onChange={e=>{
              const v=e.target.value;ff({address:v});
              clearTimeout(zoneTimer.current);
              setZoneStatus(v.trim()?"checking":null);setSelectedZone(null);
              zoneTimer.current=setTimeout(()=>detectZone(v),900);
            }} placeholder="Calle, carrera, barrio, ciudad…" style={inp}/>
            <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>REFERENCIA (opcional)</label>
            <input value={form.addressRef||""} onChange={e=>ff({addressRef:e.target.value})} placeholder="Apto, torre, punto de referencia…" style={{...inp,marginBottom:14}}/>
            {/* Estado de cobertura */}
            {zoneStatus==="checking"&&<div style={{display:"flex",alignItems:"center",gap:10,background:isDark?"rgba(255,255,255,.06)":"#f4f4f8",borderRadius:12,padding:"11px 14px",marginBottom:12}}>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2.5px solid ${bdr}`,borderTopColor:pc,animation:"spin .7s linear infinite",flexShrink:0}}/>
              <span style={{color:mid,fontSize:13,fontWeight:600}}>Verificando cobertura en tu dirección…</span>
            </div>}
            {zoneStatus==="found"&&selectedZone&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:isDark?"rgba(34,197,94,.12)":"#f0fdf4",border:"1.5px solid #22c55e44",borderRadius:12,padding:"11px 14px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:18}}>✅</span>
                <div>
                  <div style={{color:"#16a34a",fontWeight:800,fontSize:13}}>¡Hacemos {vl.delivery_title.toLowerCase()} a tu zona!</div>
                  <div style={{color:mid,fontSize:11,marginTop:1}}>📍 {selectedZone.name} · {selectedZone.minTime}–{selectedZone.maxTime} min</div>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{color:"#16a34a",fontWeight:900,fontSize:15}}>{fmtCOP(selectedZone.price)}</div>
                <div style={{color:mid,fontSize:10}}>domicilio</div>
              </div>
            </div>}
            {zoneStatus==="none"&&<div style={{display:"flex",alignItems:"center",gap:10,background:isDark?"rgba(239,68,68,.1)":"#fef2f2",border:"1.5px solid #ef444444",borderRadius:12,padding:"11px 14px",marginBottom:12}}>
              <span style={{fontSize:18}}>😔</span>
              <div>
                <div style={{color:"#dc2626",fontWeight:800,fontSize:13}}>Sin cobertura en esta dirección</div>
                <div style={{color:mid,fontSize:11,marginTop:1}}>Por ahora no llegamos a tu zona. Intenta con otra dirección o elige {vl.pickup_title.toLowerCase()}.</div>
              </div>
            </div>}
          </>}
          {effectiveMode==="mesa"&&<><label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>NÚMERO DE MESA</label><input value={form.table} onChange={e=>ff({table:e.target.value})} placeholder="Mesa 1, 2…" style={inp}/></>}
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:6}}>NOTAS (opcional)</label>
          <input value={form.notes} onChange={e=>ff({notes:e.target.value})} placeholder={vl.notes_placeholder} style={inp}/>
          {(()=>{
            const hasPolygons=(selBranch?.deliveryZones||[]).some(z=>z.active&&z.latLngs?.length>=3);
            const zoneBlocked=effectiveMode==="domicilio"&&hasPolygons&&zoneStatus!=="found";
            const disabled=!form.name||!form.phone||(effectiveMode==="domicilio"&&!form.address)||zoneBlocked;
            return <button onClick={()=>{if(disabled)return;setStep(3);}} style={{width:"100%",padding:14,background:disabled?"#ccc":pc,border:"none",borderRadius:14,color:"#fff",fontSize:14,fontWeight:800,cursor:disabled?"not-allowed":"pointer",marginTop:4,fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:disabled?.7:1,transition:"all .15s"}}>
              {zoneStatus==="checking"?"Verificando dirección…":zoneStatus==="none"?"Sin cobertura en tu zona":"Continuar →"}
            </button>;
          })()}
        </>}
        {step===3&&<>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:mid,cursor:"pointer",fontSize:20,padding:0,lineHeight:1}}>←</button>
            <div style={{color:txt,fontSize:17,fontWeight:900}}>{vl.summary_title}</div>
          </div>
          <label style={{fontSize:11,fontWeight:700,color:mid,display:"block",marginBottom:8}}>MÉTODO DE PAGO</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[["cash","💵","Efectivo"],["nequi","📱","Nequi"],["daviplata","📲","Daviplata"],["card","💳","Tarjeta"]].map(([k,icon,label])=>(
              <button key={k} onClick={()=>ff({payment:k})} style={{padding:"12px",background:form.payment===k?pc+"18":isDark?"rgba(255,255,255,.04)":"#f8f8f8",border:`1.5px solid ${form.payment===k?pc:bdr}`,borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                <span style={{fontSize:20}}>{icon}</span><span style={{color:txt,fontWeight:700,fontSize:12}}>{label}</span>
              </button>
            ))}
          </div>
          <div style={{background:isDark?"rgba(255,255,255,.04)":"#f8f8f8",borderRadius:14,padding:"14px 16px",marginBottom:16}}>
            <div style={{color:txt,fontWeight:800,fontSize:13,marginBottom:10}}>Resumen</div>
            {cart.map(c=><div key={c.uid} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}><span style={{color:mid}}>{c.qty}× {c.product.name}</span><span style={{color:txt,fontWeight:600}}>{fmtCOP(c.total)}</span></div>)}
            <div style={{borderTop:`1px solid ${bdr}`,marginTop:8,paddingTop:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:mid,marginBottom:4}}><span>Subtotal</span><span style={{color:txt}}>{fmtCOP(cartSubtotal)}</span></div>
              {effectiveMode==="domicilio"&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:mid,marginBottom:4}}><span>{vl.delivery_fee_label}{selectedZone?` · ${selectedZone.name}`:""}</span><span style={{color:txt}}>{fmtCOP(deliveryFee)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:900,color:txt,marginTop:8}}><span>Total</span><span style={{color:pc}}>{fmtCOP(cartFinal)}</span></div>
            </div>
          </div>
          <button onClick={submitOrder} disabled={submitting} style={{width:"100%",padding:15,background:`linear-gradient(135deg,${pc},${pc}cc)`,border:"none",borderRadius:16,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 6px 24px ${pc}55`,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {submitting?<div style={{width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite"}}/>:"🚀"}{submitting?"Enviando pedido…":vl.confirm_btn}
          </button>
        </>}
      </div>
    </div>}
    {selProd&&<ProductDetailModal p={selProd} onClose={()=>setSelProd(null)} onAdd={add} orderMode={orderMode} pc={pc} isDark={isDark} config={config} bdr={bdr} txt={txt} mid={mid} surf={surf}/>}
  </div>;
}

/* ─── CEO SIDEBAR ─────────────────────────────────────────── */
const CEO_NAV = [
  {id:"ceo_dash",label:"Dashboard",icon:"📊"},
  {id:"ceo_restaurantes",label:"Restaurantes",icon:"🏪"},
  {id:"ceo_onboarding",label:"Nuevo restaurante",icon:"➕"},
  {id:"ceo_pagos",label:"Pagos",icon:"💰"},
  {id:"ceo_soporte",label:"Soporte",icon:"🎫"},
  {id:"ceo_plataforma",label:"Configuración",icon:"⚙️"},
];
function CEOSidebar({active,onSelect,restaurants,tickets,onLogout,user,pendingPayments}){
  const suspended=restaurants.filter(r=>r.status==="suspended").length;
  const openT=tickets.filter(t=>t.status==="open").length;
  return <nav style={{width:230,background:T.sidebar,minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0}}>
    <div style={{padding:"20px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}>
        <div style={{width:38,height:38,borderRadius:12,background:"linear-gradient(145deg,#ea580c 0%,#f97316 45%,#fbbf24 100%)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 12px rgba(234,88,12,.5), inset 0 1px 0 rgba(255,255,255,.2)"}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6A8 8 0 1 0 21 13H14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <line x1="18" y1="6" x2="18" y2="1" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M15 3.5L18 1L21 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <div>
          <div style={{color:"#fff",fontWeight:900,fontSize:18,letterSpacing:"-.3px"}}>Got<span style={{background:"linear-gradient(90deg,#fb923c,#fbbf24)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>up</span></div>
          <div style={{color:"rgba(255,255,255,.3)",fontSize:9,fontWeight:700,letterSpacing:"1.5px"}}>CEO PANEL</div>
        </div>
      </div>
      {(suspended>0||openT>0)&&<div style={{marginTop:8,background:"rgba(220,38,38,.12)",border:"1px solid rgba(220,38,38,.2)",borderRadius:8,padding:"6px 10px"}}>
        {suspended>0&&<div style={{fontSize:10,fontWeight:700,color:"#fca5a5"}}>⚠ {suspended} restaurante{suspended>1?"s":""} suspendido{suspended>1?"s":""}</div>}
        {openT>0&&<div style={{fontSize:10,fontWeight:700,color:"#fcd34d",marginTop:suspended>0?2:0}}>🎫 {openT} ticket{openT>1?"s":""} abierto{openT>1?"s":""}</div>}
      </div>}
    </div>
    <div style={{flex:1,padding:"12px 8px",overflowY:"auto"}}>
      {CEO_NAV.map(item=>{
        const badge=(item.id==="ceo_soporte"&&openT>0)?openT:(item.id==="ceo_restaurantes"&&suspended>0)?suspended:(item.id==="ceo_pagos"&&pendingPayments>0)?pendingPayments:0;
        return <div key={item.id} onClick={()=>onSelect(item.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 13px",borderRadius:11,cursor:"pointer",background:active===item.id?"rgba(255,255,255,.13)":"transparent",marginBottom:3,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=active===item.id?"rgba(255,255,255,.13)":"rgba(255,255,255,.06)"} onMouseLeave={e=>e.currentTarget.style.background=active===item.id?"rgba(255,255,255,.13)":"transparent"}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>{item.icon}</span>
            <span style={{fontSize:13,fontWeight:active===item.id?700:500,color:active===item.id?"#fff":"rgba(255,255,255,.65)"}}>{item.label}</span>
          </div>
          {badge>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:item.id==="ceo_soporte"?T.amber:item.id==="ceo_pagos"?T.green:T.red,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{badge}</span>}
        </div>;
      })}
    </div>
    <div style={{padding:"14px 16px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#6d28d9,#db2777)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{user.avatar}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:"#fff",fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
        <div style={{color:"rgba(255,255,255,.35)",fontSize:9}}>CEO & Fundador</div>
      </div>
      <button onClick={onLogout} style={{background:"rgba(220,38,38,.15)",border:"none",borderRadius:7,color:"#fca5a5",fontSize:11,padding:"4px 7px",cursor:"pointer"}}>⏻</button>
    </div>
  </nav>;
}

/* ─── CEO: DASHBOARD ──────────────────────────────────────── */
function CEODash({restaurants,tickets}){
  const active=restaurants.filter(r=>r.status==="active");
  const suspended=restaurants.filter(r=>r.status==="suspended");
  const trial=restaurants.filter(r=>r.status==="trial");
  const mrr=active.reduce((s,r)=>s+r.mrr,0);
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:900,color:T.text}}>Dashboard Global 📊</h1><p style={{color:T.mid,fontSize:13,marginTop:3}}>{new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p></div>
    {suspended.length>0&&<div style={{background:"linear-gradient(135deg,#fee2e2,#fecaca)",border:"1.5px solid #fca5a5",borderRadius:14,padding:"13px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
      <span style={{fontSize:20}}>🔴</span>
      <div><div style={{fontWeight:800,color:"#991b1b",fontSize:13}}>{suspended.length} restaurante{suspended.length>1?"s":""} suspendido{suspended.length>1?"s":""}</div><div style={{fontSize:12,color:"#b91c1c"}}>{suspended.map(r=>r.name).join(", ")} — requieren atención urgente</div></div>
    </div>}
    {trial.length>0&&<div style={{background:"linear-gradient(135deg,#fef3c7,#fde68a)",border:"1.5px solid #fcd34d",borderRadius:14,padding:"12px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18}}>⚡</span>
      <div style={{fontWeight:700,color:"#92400e",fontSize:13}}>{trial.map(r=>r.name).join(", ")} en trial — {trial.map(r=>`${r.daysLeft}d`).join(", ")} restantes</div>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:14,marginBottom:22}}>
      <StatCard icon="🏪" label="Restaurantes activos" value={active.length} sub={`${restaurants.length} total`} color={T.indigo}/>
      <StatCard icon="💰" label="MRR" value={fmtCOP(mrr)} sub="↑ 12% este mes" color={T.green}/>
      <StatCard icon="📅" label="ARR estimado" value={fmtCOP(mrr*12)} color={T.violet}/>
      <StatCard icon="🔴" label="Suspendidos" value={suspended.length} color={suspended.length>0?T.red:T.mid}/>
      <StatCard icon="⚡" label="En trial" value={trial.length} color={T.amber}/>
      <StatCard icon="🎫" label="Tickets abiertos" value={tickets.filter(t=>t.status==="open").length} color={T.blue}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16,marginBottom:18}}>
      <Card>
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>MRR — Últimos 7 meses</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={MRR_TREND} margin={{top:5,right:5,left:-10,bottom:0}}>
            <defs><linearGradient id="gMrr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.indigo} stopOpacity={.25}/><stop offset="95%" stopColor={T.indigo} stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="m" tick={{fontSize:10,fill:T.light}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} tick={{fontSize:9,fill:T.light}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{borderRadius:10,border:`1px solid ${T.border}`,fontSize:11}} formatter={v=>[fmtCOP(v),"MRR"]}/>
            <Area type="monotone" dataKey="mrr" stroke={T.indigo} fill="url(#gMrr)" strokeWidth={2.5}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card style={{display:"flex",flexDirection:"column"}}>
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>Distribución de planes</div>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <PieChart width={190} height={150}>
            <Pie data={PLAN_DIST} cx={95} cy={75} innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
              {PLAN_DIST.map(p=><Cell key={p.name} fill={p.color}/>)}
            </Pie>
            <Tooltip formatter={v=>[`${v} restaurantes`]}/>
          </PieChart>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          {PLAN_DIST.map(p=><div key={p.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:8,height:8,borderRadius:"50%",background:p.color}}/><span style={{color:T.mid}}>{p.name}: <strong>{p.value}</strong></span></div>)}
        </div>
      </Card>
    </div>
    <Card>
      <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>Actividad reciente</div>
      {[{time:"Hace 2h",icon:"✅",text:"Crepes & Waffles registrado (Trial 14d)",color:T.green},{time:"Hace 5h",icon:"💳",text:"Pago recibido: La Leña — Pro $99.900",color:T.indigo},{time:"Hace 8h",icon:"🎫",text:"Ticket: La Leña — Error iOS Safari (Alta)",color:T.amber},{time:"Hace 1d",icon:"⚠️",text:"Pizza & Co suspendida — 18 días sin pago",color:T.red},{time:"Hace 2d",icon:"📈",text:"El Corral Premium superó 500 pedidos",color:T.violet}].map((a,i)=>(
        <div key={i} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:10,background:a.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{a.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:13,color:T.text,fontWeight:500}}>{a.text}</div><div style={{fontSize:11,color:T.light,marginTop:2}}>{a.time}</div></div>
        </div>
      ))}
    </Card>
  </div>;
}

/* ─── CEO: RESTAURANTES ───────────────────────────────────── */
function CEORestaurantes({restaurants,onUpdate,showToast}){
  const [sel,setSel]=useState(null);
  const [q,setQ]=useState("");
  const [filter,setFilter]=useState("all");
  const shown=restaurants.filter(r=>{
    const mQ=!q||r.name.toLowerCase().includes(q.toLowerCase())||r.city.toLowerCase().includes(q.toLowerCase());
    const mF=filter==="all"||r.status===filter||(filter==="expiring"&&r.daysLeft<=7&&r.status==="active");
    return mQ&&mF;
  });
  const r=sel?restaurants.find(x=>x.id===sel)||sel:null;
  const changeStatus=(res,status)=>{onUpdate(res.id,{status});showToast(`${res.name} → ${STATUS_MAP[status]?.label}`);if(r?.id===res.id)setSel(p=>p);};
  // Extender suscripción 30 días por email del owner
  const extendSub=async(res)=>{
    const newExpiry=new Date(Date.now()+30*24*60*60*1000).toISOString();
    // Buscar profile por email
    const {data:prof}=await supabase.from("profiles").select("id").eq("email",res.email).single();
    if(prof){
      await supabase.from("profiles").update({subscription_expires_at:newExpiry}).eq("id",prof.id);
      onUpdate(res.id,{status:"active",nextPayment:newExpiry.slice(0,10),daysLeft:30});
      showToast(`✅ Suscripción de ${res.name} extendida hasta ${newExpiry.slice(0,10)}`);
      setSel(null);
    } else {
      showToast(`⚠ No se encontró el perfil de ${res.email}`,"warn");
    }
  };
  const changePlan=(res,plan)=>{onUpdate(res.id,{plan,mrr:PLAN_MAP[plan]?.price||0});showToast(`Plan de ${res.name} → ${PLAN_MAP[plan]?.label}`);};
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Restaurantes</h2><p style={{color:T.mid,fontSize:13,marginTop:2}}>{restaurants.filter(r=>r.status!=="inactive").length} activos en la plataforma</p></div>
    </div>
    <Card style={{marginBottom:14,padding:"12px 16px"}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Buscar por nombre o ciudad…" style={{flex:1,minWidth:200,padding:"9px 13px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,fontSize:13,color:T.text,outline:"none"}}/>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {[["all","Todos"],["active","Activos"],["suspended","Suspendidos"],["trial","Trial"],["expiring","Por vencer"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${filter===k?T.indigo:T.border}`,background:filter===k?T.indigoL:T.white,color:filter===k?T.indigo:T.mid,fontSize:11,fontWeight:filter===k?700:500,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>
    </Card>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {shown.map(res=>{
        const st=STATUS_MAP[res.status]||STATUS_MAP.inactive;
        const pl=PLAN_MAP[res.plan]||PLAN_MAP.starter;
        const exp=res.status==="active"&&res.daysLeft<=7;
        return <Card key={res.id} style={{padding:"14px 18px",borderLeft:`3px solid ${exp?T.amber:res.status==="suspended"?T.red:"transparent"}`}} className="hov">
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:50,height:50,borderRadius:13,overflow:"hidden",flexShrink:0,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>{res.coverImg?<img src={res.coverImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:22}}>{res.logo}</span>}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:4}}>
                <div><span style={{fontWeight:800,fontSize:15,color:T.text}}>{res.name}</span><span style={{fontSize:11,color:T.mid,marginLeft:8}}>{res.city}</span></div>
                <div style={{display:"flex",gap:5,flexShrink:0}}>
                  <Tag color={pl.color}>{pl.label}</Tag>
                  <Tag color={st.color}>{st.label}</Tag>
                  {exp&&<Tag color={T.amber}>⚠ {res.daysLeft}d</Tag>}
                </div>
              </div>
              <div style={{fontSize:12,color:T.mid,marginBottom:5}}>👤 {res.owner} · 📧 {res.email}</div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:T.mid}}>
                <span>📦 {res.products} productos</span><span>📋 {res.orders} pedidos</span><span>💰 {fmtCOP(res.mrr)}/mes</span>{res.status!=="inactive"&&<span>📅 {res.nextPayment}</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,flexWrap:"wrap"}}>
            <Btn sm v="ghost" onClick={()=>setSel(res.id)}>👁️ Detalle</Btn>
            {res.status==="active"&&<Btn sm v="danger" onClick={()=>changeStatus(res,"suspended")}>Suspender</Btn>}
            {res.status==="suspended"&&<Btn sm v="success" onClick={()=>extendSub(res)}>✅ Reactivar + 30d</Btn>}
            {res.status==="trial"&&<Btn sm v="primary" onClick={()=>changeStatus(res,"active")}>✓ Activar</Btn>}
            <Btn sm v="amber" onClick={()=>window.open(`mailto:${res.email}`)}>📧 Contactar</Btn>
          </div>
        </Card>;
      })}
      {shown.length===0&&<Card style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:44,marginBottom:10}}>🔍</div><div style={{color:T.mid}}>Sin resultados</div></Card>}
    </div>
    {r&&<Modal title={r.name} icon="🏪" onClose={()=>setSel(null)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <div style={{height:110,borderRadius:12,overflow:"hidden",marginBottom:14,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {r.coverImg?<img src={r.coverImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:44}}>{r.logo}</span>}
          </div>
          <div style={{display:"flex",gap:5,marginBottom:12}}><Tag color={PLAN_MAP[r.plan]?.color||T.mid}>{PLAN_MAP[r.plan]?.label}</Tag><Tag color={STATUS_MAP[r.status]?.color||T.mid}>{STATUS_MAP[r.status]?.label}</Tag></div>
          {[["👤","Propietario",r.owner],["📧","Email",r.email],["📞","Teléfono",r.phone],["📍","Ciudad",r.city],["📅","Registrado",r.createdAt],["💳","Próximo pago",r.nextPayment],["💰","MRR",fmtCOP(r.mrr)],["📦","Productos",r.products],["📋","Pedidos",r.orders]].map(([ic,lb,vl])=>(
            <div key={lb} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:12,paddingBottom:7,borderBottom:`1px solid ${T.border}`}}><span style={{color:T.mid}}>{ic} {lb}</span><span style={{color:T.text,fontWeight:600,textAlign:"right",maxWidth:"55%"}}>{vl}</span></div>
          ))}
        </div>
        <div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:T.mid,marginBottom:8}}>Cambiar plan</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.entries(PLAN_MAP).map(([k,v])=>(
                <button key={k} onClick={()=>changePlan(r,k)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${r.plan===k?v.color:T.border}`,background:r.plan===k?v.color+"18":"transparent",color:r.plan===k?v.color:T.mid,fontSize:11,fontWeight:r.plan===k?700:500,cursor:"pointer"}}>{v.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T.mid,marginBottom:8}}>Acciones</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {r.status==="active"&&<Btn full v="danger" onClick={()=>{changeStatus(r,"suspended");setSel(null);}}>🔴 Suspender cuenta</Btn>}
              {r.status==="suspended"&&<Btn full v="success" onClick={()=>{changeStatus(r,"active");setSel(null);}}>✅ Reactivar cuenta</Btn>}
              {r.status==="trial"&&<Btn full v="primary" onClick={()=>{changeStatus(r,"active");setSel(null);}}>✓ Convertir a activo</Btn>}
              <Btn full v="green" onClick={()=>extendSub(r)} icon="📅">Extender 30 días</Btn>
              <Btn full v="neutral" onClick={()=>window.open(`mailto:${r.email}`)} icon="📧">Enviar email</Btn>
            </div>
          </div>
          {r.notes&&<div style={{marginTop:14,background:T.indigoL,borderRadius:10,padding:"10px 12px",fontSize:12,color:T.indigo}}>📝 {r.notes}</div>}
        </div>
      </div>
    </Modal>}
  </div>;
}

/* ─── CEO: ONBOARDING ─────────────────────────────────────── */
function CEOOnboarding({onAdd,showToast}){
  const [step,setStep]=useState(0);
  const INIT_FORM={name:"",owner:"",email:"",phone:"",city:"",plan:"pro",businessType:"restaurant",logo:"🍽️",primaryColor:"#f97316",notes:"",sendWelcome:true};
  const [form,setForm]=useState(INIT_FORM);
  const [done,setDone]=useState(null);
  const set=k=>v=>setForm(p=>({...p,[k]:v}));
  const selV=VERTICALS[form.businessType]||VERTICALS.restaurant;
  const valid1=form.name&&form.owner&&form.email&&form.city;
  const create=()=>{
    const r={...form,id:newId(),status:"active",createdAt:todayStr(),nextPayment:new Date(Date.now()+30*24*60*60*1000).toISOString().slice(0,10),daysLeft:30,mrr:PLAN_MAP[form.plan]?.price||0,products:0,orders:0,coverImg:""};
    onAdd(r);setDone(r);showToast(`✓ ${form.name} creado exitosamente`);
  };
  if(done)return <div style={{maxWidth:500,margin:"0 auto",textAlign:"center",animation:"fadeUp .35s ease"}}>
    <div style={{width:72,height:72,borderRadius:22,background:T.greenL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 18px"}}>✅</div>
    <h2 style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:8}}>¡Cuenta creada!</h2>
    <p style={{color:T.mid,fontSize:14,marginBottom:22}}>La cuenta de <strong>{done.name}</strong> está activa.</p>
    <Card style={{marginBottom:18,textAlign:"left"}}>
      {[[selV.icon,"Tipo de negocio",selV.name],["🏪","Negocio",done.name],["👤","Propietario",done.owner],["📧","Email",done.email],["📦","Plan",PLAN_MAP[done.plan]?.label],["📅","Próximo pago",done.nextPayment]].map(([ic,lb,vl])=>(
        <div key={lb} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:13}}><span style={{color:T.mid}}>{ic} {lb}</span><span style={{color:T.text,fontWeight:700}}>{vl}</span></div>
      ))}
    </Card>
    {done.sendWelcome&&<div style={{background:T.greenL,border:`1px solid ${T.green}30`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.green,marginBottom:18}}>📨 Email de bienvenida enviado a {done.email}</div>}
    <div style={{display:"flex",gap:10}}>
      <Btn full v="neutral" onClick={()=>{setDone(null);setStep(0);setForm(INIT_FORM);}}>Crear otro</Btn>
      <Btn full onClick={()=>setDone(null)}>Ver en Clientes</Btn>
    </div>
  </div>;
  const STEPS=[{n:0,l:"Vertical"},{n:1,l:"Datos"},{n:2,l:"Plan"},{n:3,l:"Confirmar"}];
  return <div style={{maxWidth:680,margin:"0 auto",animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Nuevo cliente</h2>
      <p style={{color:T.mid,fontSize:13}}>Crea la cuenta para cualquier tipo de negocio · Gotup</p>
    </div>
    {/* Stepper */}
    <div style={{display:"flex",gap:0,marginBottom:24}}>
      {STEPS.map((s,i)=>(
        <div key={s.n} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
          {i>0&&<div style={{position:"absolute",left:0,top:15,width:"50%",height:2,background:step>s.n?T.indigo:T.border}}/>}
          {i<STEPS.length-1&&<div style={{position:"absolute",right:0,top:15,width:"50%",height:2,background:step>s.n?T.indigo:T.border}}/>}
          <div style={{width:30,height:30,borderRadius:"50%",background:step>=s.n?T.indigo:T.bg,border:`2px solid ${step>=s.n?T.indigo:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:step>=s.n?"#fff":T.mid,position:"relative",zIndex:1,transition:"all .2s"}}>{step>s.n?"✓":s.n+1}</div>
          <div style={{fontSize:10,fontWeight:600,color:step>=s.n?T.indigo:T.light,marginTop:4}}>{s.l}</div>
        </div>
      ))}
    </div>

    {/* STEP 0: Selección de vertical */}
    {step===0&&<div>
      <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:6}}>¿Qué tipo de negocio es el cliente?</div>
      <p style={{color:T.mid,fontSize:12,marginBottom:16}}>Selecciona el vertical para que la plataforma se adapte al idioma y flujo de ese negocio.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10,marginBottom:20}}>
        {Object.values(VERTICALS).map(v=>{
          const sel=form.businessType===v.id;
          return <div key={v.id} onClick={()=>{set("businessType")(v.id);set("logo")(v.emojis[0]);set("primaryColor")(v.color);}} style={{padding:"14px 16px",borderRadius:14,border:`2px solid ${sel?v.color:T.border}`,background:sel?v.color+"0e":T.white,cursor:"pointer",transition:"all .18s",boxShadow:sel?`0 4px 16px ${v.color}28`:"none"}}>
            <div style={{fontSize:28,marginBottom:6}}>{v.icon}</div>
            <div style={{fontSize:13,fontWeight:800,color:sel?v.color:T.text,marginBottom:3}}>{v.name}</div>
            <div style={{fontSize:10,color:T.mid,lineHeight:1.5}}>{v.desc}</div>
            {sel&&<div style={{marginTop:8,display:"flex",gap:4,flexWrap:"wrap"}}>
              {[v.labels.catalog,v.labels.order,v.labels.delivery].map(lb=><span key={lb} style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:10,background:v.color+"20",color:v.color}}>{lb}</span>)}
            </div>}
          </div>;
        })}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={()=>setStep(1)} style={{background:selV.color}}>Continuar con {selV.name} →</Btn>
      </div>
    </div>}

    {/* STEP 1: Info del negocio */}
    {step===1&&<Card>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,padding:"10px 14px",background:selV.color+"10",border:`1px solid ${selV.color}30`,borderRadius:12}}>
        <span style={{fontSize:20}}>{selV.icon}</span>
        <div><div style={{fontSize:12,fontWeight:800,color:selV.color}}>{selV.name}</div><div style={{fontSize:10,color:T.mid}}>{selV.labels.catalog} · {selV.labels.order}s</div></div>
      </div>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:14}}>📋 Información del negocio</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label={`Nombre del ${selV.labels.branch} *`} value={form.name} onChange={set("name")} placeholder={`Ej: ${selV.name.split("/")[0].trim()} XYZ`} required/>
        <Field label="Propietario *" value={form.owner} onChange={set("owner")} placeholder="Carlos Mejía" required/>
        <Field label="Email *" value={form.email} onChange={set("email")} type="email" placeholder="carlos@negocio.co" required/>
        <Field label="Teléfono" value={form.phone} onChange={set("phone")} placeholder="+57 300 111 2222"/>
        <Field label="Ciudad *" value={form.city} onChange={set("city")} placeholder="Cali" required/>
      </div>
      <Field label="Notas internas" value={form.notes} onChange={set("notes")} textarea rows={2} placeholder="Cómo llegó, potencial de upgrade…"/>
      <div style={{display:"flex",gap:10,justifyContent:"space-between"}}><Btn v="neutral" onClick={()=>setStep(0)}>← Atrás</Btn><Btn disabled={!valid1} onClick={()=>setStep(2)}>Siguiente →</Btn></div>
    </Card>}

    {/* STEP 2: Plan y branding */}
    {step===2&&<Card>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>📦 Plan y branding</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {Object.entries(PLAN_MAP).map(([k,v])=>(
          <button key={k} onClick={()=>set("plan")(k)} style={{padding:"14px",borderRadius:12,border:`2px solid ${form.plan===k?v.color:T.border}`,background:form.plan===k?v.color+"12":T.bg,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
            <div style={{fontWeight:800,color:v.color,fontSize:14}}>{v.label}</div>
            <div style={{fontWeight:900,fontSize:16,color:T.text,marginTop:3}}>{fmtCOP(v.price)}<span style={{fontSize:10,color:T.mid,fontWeight:400}}>/mes</span></div>
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>EMOJI / LOGO</label>
          <input value={form.logo} onChange={e=>set("logo")(e.target.value)} style={{width:"100%",padding:"12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:28,textAlign:"center",outline:"none"}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:7}}>{selV.emojis.map(e=><button key={e} onClick={()=>set("logo")(e)} style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${form.logo===e?selV.color:T.border}`,background:form.logo===e?selV.color+"20":"transparent",fontSize:17,cursor:"pointer"}}>{e}</button>)}</div>
        </div>
        <div>
          <label style={{fontSize:11,fontWeight:700,color:T.mid,display:"block",marginBottom:6}}>COLOR PRINCIPAL</label>
          <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:8}}>
            <input type="color" value={form.primaryColor} onChange={e=>set("primaryColor")(e.target.value)} style={{width:48,height:40,borderRadius:10,border:`1px solid ${T.border}`,background:"none",cursor:"pointer"}}/>
            <input value={form.primaryColor} onChange={e=>set("primaryColor")(e.target.value)} style={{flex:1,padding:"9px 12px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:12,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[selV.color,"#f97316","#dc2626","#8b5cf6","#059669","#2563eb","#db2777","#d97706"].map(c=><div key={c} onClick={()=>set("primaryColor")(c)} style={{width:24,height:24,borderRadius:"50%",background:c,cursor:"pointer",border:form.primaryColor===c?`3px solid ${T.text}`:"3px solid transparent"}}/>)}
          </div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:4}} onClick={()=>set("sendWelcome")(!form.sendWelcome)}>
        <div style={{width:44,height:24,borderRadius:12,background:form.sendWelcome?T.indigo:T.border,position:"relative",transition:"background .2s",flexShrink:0}}>
          <div style={{position:"absolute",top:3,left:form.sendWelcome?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
        </div>
        <span style={{fontSize:13,color:T.text,fontWeight:form.sendWelcome?700:400}}>Enviar email de bienvenida con credenciales</span>
      </div>
      <div style={{display:"flex",gap:10,marginTop:18}}><Btn v="neutral" onClick={()=>setStep(1)}>← Atrás</Btn><Btn onClick={()=>setStep(3)}>Siguiente →</Btn></div>
    </Card>}

    {/* STEP 3: Confirmar */}
    {step===3&&<Card>
      <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>✅ Confirmar y crear</div>
      <div style={{background:selV.color+"0a",border:`1px solid ${selV.color}25`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22}}>{selV.icon}</span>
        <div><div style={{fontSize:13,fontWeight:800,color:selV.color}}>{selV.name}</div><div style={{fontSize:11,color:T.mid}}>{selV.labels.catalog} · {selV.labels.order}s · {selV.labels.delivery}</div></div>
      </div>
      <div style={{background:T.bg,borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["🏪","Negocio",form.name],["👤","Propietario",form.owner],["📧","Email",form.email],["📞","Teléfono",form.phone||"—"],["📍","Ciudad",form.city],["📦","Plan",`${PLAN_MAP[form.plan]?.label} — ${fmtCOP(PLAN_MAP[form.plan]?.price)}/mes`]].map(([ic,lb,vl])=>(
            <div key={lb} style={{marginBottom:8}}><div style={{fontSize:10,fontWeight:700,color:T.light,marginBottom:2}}>{ic} {lb}</div><div style={{fontSize:13,color:T.text,fontWeight:600}}>{vl}</div></div>
          ))}
        </div>
      </div>
      <div style={{height:70,borderRadius:12,background:"#111009",display:"flex",alignItems:"center",padding:"0 14px",gap:12,border:`1px solid ${T.border}`,marginBottom:16}}>
        <div style={{width:40,height:40,borderRadius:12,background:form.primaryColor+"28",border:`2px solid ${form.primaryColor}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{form.logo}</div>
        <div>
          <div style={{color:"#fff",fontWeight:800,fontSize:14}}>{form.name||"Nombre"}</div>
          <div style={{color:form.primaryColor,fontSize:10}}>{selV.name} · {form.city}</div>
        </div>
      </div>
      {form.sendWelcome&&<div style={{background:T.greenL,border:`1px solid ${T.green}30`,borderRadius:10,padding:"9px 13px",fontSize:12,color:T.green,marginBottom:14}}>📨 Email de bienvenida → {form.email}</div>}
      <div style={{display:"flex",gap:10}}><Btn v="neutral" onClick={()=>setStep(2)}>← Atrás</Btn><Btn full onClick={create} icon="✅">Crear cuenta ahora</Btn></div>
    </Card>}
  </div>;
}

/* ─── CEO: PAGOS ──────────────────────────────────────────── */
function CEOPagos({restaurants,paymentRequests,onApprove,onReject,loading}){
  const [viewReceipt,setViewReceipt]=useState(null);
  const [rejectModal,setRejectModal]=useState(null);
  const [rejectNote,setRejectNote]=useState("");
  const [acting,setActing]=useState(null);

  const pending=paymentRequests.filter(r=>r.status==="pending");
  const approved=paymentRequests.filter(r=>r.status==="approved");
  const rejected=paymentRequests.filter(r=>r.status==="rejected");
  const mrr=restaurants.filter(r=>r.status==="active").reduce((s,r)=>s+r.mrr,0);
  const totalApproved=approved.reduce((s,r)=>s+(r.amount||0),0);

  const doApprove=async(r)=>{
    setActing(r.id);await onApprove(r);setActing(null);
  };
  const doReject=async()=>{
    if(!rejectModal)return;
    setActing(rejectModal.id);await onReject(rejectModal,rejectNote);setActing(null);setRejectModal(null);setRejectNote("");
  };

  const planColor={starter:T.blue,pro:T.violet,business:T.pink};
  const ReqRow=({r,showActions})=>(
    <tr style={{borderBottom:`1px solid ${T.border}`}}>
      <td style={{padding:"12px 14px"}}>
        <div style={{fontWeight:700,color:T.text,fontSize:13}}>{r.restaurant_name||"—"}</div>
        <div style={{fontSize:10,color:T.mid}}>{r.created_at?.split("T")[0]||"—"}</div>
      </td>
      <td style={{padding:"12px 14px"}}><Tag color={planColor[r.plan]||T.mid} sm>{r.plan?.charAt(0).toUpperCase()+r.plan?.slice(1)}</Tag></td>
      <td style={{padding:"12px 14px",fontWeight:800,color:T.indigo}}>{fmtCOP(r.amount)}</td>
      <td style={{padding:"12px 14px"}}>
        {r.receipt_data?<button onClick={()=>setViewReceipt(r)} style={{background:T.indigoL,color:T.indigo,border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>👁 Ver comprobante</button>:<span style={{fontSize:11,color:T.light}}>Sin comprobante</span>}
      </td>
      <td style={{padding:"12px 14px"}}>
        {showActions?
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>doApprove(r)} disabled={acting===r.id} style={{background:T.green,color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:800,cursor:acting===r.id?"not-allowed":"pointer",opacity:acting===r.id?.6:1}}>
              {acting===r.id?"…":"✅ Aprobar"}
            </button>
            <button onClick={()=>{setRejectModal(r);setRejectNote("");}} disabled={acting===r.id} style={{background:T.redL,color:T.red,border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:800,cursor:"pointer"}}>
              ❌ Rechazar
            </button>
          </div>:
          <div>
            {r.status==="approved"&&<Tag color={T.green}>✅ Aprobado</Tag>}
            {r.status==="rejected"&&<div><Tag color={T.red}>❌ Rechazado</Tag>{r.ceo_notes&&<div style={{fontSize:10,color:T.mid,marginTop:3}}>{r.ceo_notes}</div>}</div>}
          </div>
        }
      </td>
    </tr>
  );

  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Pagos & Facturación</h2>
      <p style={{color:T.mid,fontSize:13}}>Gestiona las solicitudes de pago de todos los restaurantes</p>
    </div>

    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
      <StatCard icon="⏳" label="Pendientes" value={pending.length} color={pending.length>0?T.amber:T.mid}/>
      <StatCard icon="✅" label="Aprobados" value={approved.length} color={T.green}/>
      <StatCard icon="💰" label="Total aprobado" value={fmtCOP(totalApproved)} color={T.indigo}/>
      <StatCard icon="📊" label="MRR activo" value={fmtCOP(mrr)} color={T.violet}/>
    </div>

    {/* Pendientes */}
    {pending.length>0&&<Card style={{marginBottom:16,overflow:"hidden",padding:0,border:`2px solid ${T.amber}40`}}>
      <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,background:T.amberL,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:18}}>⏳</span>
        <div style={{fontWeight:800,fontSize:14,color:T.amber}}>Solicitudes pendientes · {pending.length}</div>
        <div style={{fontSize:11,color:T.mid,marginLeft:"auto"}}>Revisa el comprobante antes de aprobar</div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:T.bg}}>{["Restaurante","Plan","Monto","Comprobante","Acción"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:T.mid,borderBottom:`1px solid ${T.border}`,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}</tr></thead>
          <tbody>{pending.map(r=><ReqRow key={r.id} r={r} showActions={true}/>)}</tbody>
        </table>
      </div>
    </Card>}

    {/* Sin pendientes */}
    {!loading&&pending.length===0&&<div style={{background:T.greenL,border:`1px solid ${T.green}30`,borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",gap:10,alignItems:"center"}}>
      <span style={{fontSize:18}}>✅</span>
      <div style={{fontWeight:700,color:T.green,fontSize:13}}>Sin pagos pendientes por revisar</div>
    </div>}

    {/* Historial */}
    {(approved.length>0||rejected.length>0)&&<Card style={{overflow:"hidden",padding:0}}>
      <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,fontWeight:800,fontSize:14,color:T.text}}>Historial de pagos ({approved.length+rejected.length})</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:T.bg}}>{["Restaurante","Plan","Monto","Comprobante","Estado"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:T.mid,borderBottom:`1px solid ${T.border}`,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}</tr></thead>
          <tbody>{[...approved,...rejected].map(r=><ReqRow key={r.id} r={r} showActions={false}/>)}</tbody>
        </table>
      </div>
    </Card>}

    {loading&&<div style={{textAlign:"center",padding:32,color:T.mid}}>Cargando pagos…</div>}
    {!loading&&paymentRequests.length===0&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:28,marginBottom:8}}>💳</div><div style={{fontWeight:700,color:T.mid}}>Aún no hay solicitudes de pago</div><div style={{fontSize:12,color:T.light,marginTop:4}}>Aparecerán aquí cuando los restaurantes envíen comprobantes</div></Card>}

    {/* Modal ver comprobante */}
    {viewReceipt&&<Modal title="Comprobante de pago" icon="📎" onClose={()=>setViewReceipt(null)}>
      <div style={{marginBottom:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[["Restaurante",viewReceipt.restaurant_name],["Plan",viewReceipt.plan?.charAt(0).toUpperCase()+viewReceipt.plan?.slice(1)],["Monto",fmtCOP(viewReceipt.amount)],["Fecha",viewReceipt.created_at?.split("T")[0]]].map(([k,v])=>(
            <div key={k} style={{background:T.bg,borderRadius:8,padding:"8px 12px"}}>
              <div style={{fontSize:10,color:T.light,fontWeight:700,textTransform:"uppercase"}}>{k}</div>
              <div style={{fontSize:13,fontWeight:800,color:T.text,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
        {viewReceipt.notes&&<div style={{background:T.bg,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.mid,marginBottom:12}}><strong>Nota del cliente:</strong> {viewReceipt.notes}</div>}
        {viewReceipt.receipt_data?.startsWith("data:image")?
          <img src={viewReceipt.receipt_data} alt="comprobante" style={{width:"100%",borderRadius:12,border:`1px solid ${T.border}`}}/>:
          viewReceipt.receipt_data?.startsWith("data:application/pdf")?
          <div style={{textAlign:"center",padding:24,background:T.bg,borderRadius:12}}>
            <div style={{fontSize:32}}>📄</div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginTop:6}}>{viewReceipt.receipt_name}</div>
            <a href={viewReceipt.receipt_data} download={viewReceipt.receipt_name} style={{display:"inline-block",marginTop:10,background:T.indigo,color:"#fff",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,textDecoration:"none"}}>Descargar PDF</a>
          </div>:
          <div style={{textAlign:"center",color:T.mid,padding:20}}>No se puede previsualizar</div>
        }
      </div>
      {viewReceipt.status==="pending"&&<div style={{display:"flex",gap:10,marginTop:16}}>
        <Btn full onClick={()=>{setViewReceipt(null);doApprove(viewReceipt);}}>✅ Aprobar</Btn>
        <Btn v="ghost" onClick={()=>{setViewReceipt(null);setRejectModal(viewReceipt);setRejectNote("");}}>❌ Rechazar</Btn>
      </div>}
    </Modal>}

    {/* Modal rechazar */}
    {rejectModal&&<Modal title="Rechazar pago" icon="❌" onClose={()=>{setRejectModal(null);setRejectNote("");}}>
      <div style={{marginBottom:12}}>
        <p style={{fontSize:13,color:T.mid,marginBottom:14}}>¿Por qué rechazas este pago de <strong>{rejectModal.restaurant_name}</strong>?</p>
        <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)} placeholder="Ej: El comprobante no es legible, favor reenviar..." rows={3} style={{width:"100%",padding:"10px 12px",border:`1px solid ${T.border}`,borderRadius:10,fontSize:13,color:T.text,background:T.bg,resize:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <Btn v="ghost" onClick={()=>{setRejectModal(null);setRejectNote("");}}>Cancelar</Btn>
        <Btn full style={{background:T.red}} onClick={doReject} disabled={acting===rejectModal?.id}>{acting===rejectModal?.id?"Rechazando…":"❌ Confirmar rechazo"}</Btn>
      </div>
    </Modal>}
  </div>;
}

/* ─── CEO: SOPORTE ────────────────────────────────────────── */
function CEOSoporte({tickets,onUpdateTicket}){
  const [sel,setSel]=useState(null);
  const [reply,setReply]=useState("");
  const open=tickets.filter(t=>t.status==="open");
  const PR={high:T.red,medium:T.amber,low:T.green};
  const sendReply=()=>{
    if(!reply.trim()||!sel)return;
    const updated={...sel,messages:[...(sel.messages||[]),{from:"Soporte Gotup",text:reply,time:new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})}]};
    onUpdateTicket(sel.id,updated);setSel(updated);setReply("");
  };
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Soporte & Tickets</h2><p style={{color:T.mid,fontSize:13,marginTop:2}}>{open.length} abiertos · {tickets.filter(t=>t.status==="resolved").length} resueltos</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      <StatCard icon="🎫" label="Abiertos" value={open.length} color={open.length>0?T.red:T.mid}/>
      <StatCard icon="🔴" label="Alta prioridad" value={open.filter(t=>t.priority==="high").length} color={T.red}/>
      <StatCard icon="✅" label="Resueltos" value={tickets.filter(t=>t.status==="resolved").length} color={T.green}/>
    </div>
    {[...open,...tickets.filter(t=>t.status==="resolved")].map(t=>(
      <Card key={t.id} style={{padding:"14px 16px",marginBottom:8,borderLeft:`3px solid ${PR[t.priority]||T.mid}`,cursor:"pointer"}} className="hov" onClick={()=>setSel(t)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
          <div><div style={{fontWeight:800,color:T.text,fontSize:14}}>{t.subject}</div><div style={{fontSize:11,color:T.mid,marginTop:2}}>🏪 {t.restaurant} · 👤 {t.user} · 📅 {t.date}</div></div>
          <div style={{display:"flex",gap:5,flexShrink:0}}>
            <Tag color={PR[t.priority]||T.mid} sm>{t.priority==="high"?"Alta":t.priority==="medium"?"Media":"Baja"}</Tag>
            <Tag color={t.status==="open"?T.amber:T.green}>{t.status==="open"?"Abierto":"Resuelto"}</Tag>
          </div>
        </div>
        <div style={{fontSize:12,color:T.mid}}>{t.messages?.[0]?.text?.slice(0,80)}{t.messages?.[0]?.text?.length>80?"…":""}</div>
      </Card>
    ))}
    {sel&&<Modal title={sel.subject} icon="🎫" onClose={()=>setSel(null)} wide>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        <Tag color={PR[sel.priority]||T.mid}>{sel.priority==="high"?"🔴 Alta":sel.priority==="medium"?"🟡 Media":"🟢 Baja"}</Tag>
        <Tag color={sel.status==="open"?T.amber:T.green}>{sel.status==="open"?"Abierto":"Resuelto"}</Tag>
        <span style={{fontSize:11,color:T.mid}}>🏪 {sel.restaurant}</span>
      </div>
      <div style={{background:T.bg,borderRadius:12,padding:14,marginBottom:14,maxHeight:260,overflowY:"auto"}}>
        {sel.messages?.map((m,i)=>(
          <div key={i} style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:m.from==="Soporte Gotup"?T.indigo:T.mid,marginBottom:3}}>{m.from} · {m.time}</div>
            <div style={{background:m.from==="Soporte Gotup"?T.indigoL:T.white,border:`1px solid ${m.from==="Soporte Gotup"?T.indigo+"30":T.border}`,borderRadius:10,padding:"10px 13px",fontSize:13,color:T.text,lineHeight:1.6}}>{m.text}</div>
          </div>
        ))}
      </div>
      {sel.status==="open"&&<>
        <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Escribe tu respuesta…" rows={3} style={{width:"100%",boxSizing:"border-box",padding:"11px 14px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",resize:"vertical",marginBottom:12}}/>
        <div style={{display:"flex",gap:10}}>
          <Btn v="ghost" onClick={()=>{onUpdateTicket(sel.id,{...sel,status:"resolved"});setSel(null);}}>✓ Marcar resuelto</Btn>
          <Btn disabled={!reply.trim()} onClick={sendReply}>Enviar respuesta</Btn>
        </div>
      </>}
      {sel.status==="resolved"&&<div style={{background:T.greenL,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.green,fontWeight:700}}>✅ Ticket resuelto</div>}
    </Modal>}
  </div>;
}

/* ─── CEO: PLATAFORMA ─────────────────────────────────────── */
function CEOPlataforma(){
  const [cfg,setCfg]=useState({trialDays:"14",graceDays:"7",starterPrice:"49900",proPrice:"99900",businessPrice:"189900",supportEmail:"soporte@gotup.co",maintenanceMode:false,newRegistrations:true});
  const [saved,setSaved]=useState(false);
  const set=k=>v=>setCfg(p=>({...p,[k]:v}));
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return <div style={{animation:"fadeUp .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Configuración de la plataforma</h2><p style={{color:T.mid,fontSize:13,marginTop:3}}>Ajustes globales de Gotup</p></div>
      <Btn onClick={save}>{saved?"✓ ¡Guardado!":"Guardar cambios"}</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>📦 Precios de planes (COP/mes)</div>
        <Field label="Plan Starter" value={cfg.starterPrice} onChange={set("starterPrice")} type="number" prefix="$"/>
        <Field label="Plan Pro" value={cfg.proPrice} onChange={set("proPrice")} type="number" prefix="$"/>
        <Field label="Plan Business" value={cfg.businessPrice} onChange={set("businessPrice")} type="number" prefix="$"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Días de trial" value={cfg.trialDays} onChange={set("trialDays")} type="number" suffix="días"/>
          <Field label="Días de gracia" value={cfg.graceDays} onChange={set("graceDays")} type="number" suffix="días" hint="Antes de suspender"/>
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:16}}>⚙️ Opciones del sistema</div>
          <Field label="Email de soporte" value={cfg.supportEmail} onChange={set("supportEmail")} type="email"/>
          {[["newRegistrations","Nuevos registros habilitados"],["maintenanceMode","Modo mantenimiento"]].map(([k,l])=>(
            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:13,color:T.text}}>{l}</span>
              <Toggle value={cfg[k]} onChange={v=>setCfg(p=>({...p,[k]:v}))} sm/>
            </div>
          ))}
          {cfg.maintenanceMode&&<div style={{background:T.amberL,border:`1px solid ${T.amber}30`,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.amber,fontWeight:700,marginTop:8}}>⚠️ Restaurantes verán página de mantenimiento</div>}
        </Card>
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:14}}>📊 Estado del sistema</div>
          {[["🌐","Plataforma","Operativa",T.green],["💾","Base de datos","Conectada",T.green],["📧","Email","Activo",T.green],["💳","Wompi","Conectado",T.green]].map(([ic,lb,st,co])=>(
            <div key={lb} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,fontSize:13}}>
              <span style={{color:T.mid}}>{ic} {lb}</span>
              <span style={{fontWeight:700,color:co,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:co,display:"inline-block"}}/>{st}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
    <div style={{marginTop:16}}><Btn full onClick={save} style={{padding:"14px"}}>{saved?"✓ Cambios guardados":"Guardar configuración"}</Btn></div>
  </div>;
}

/* ─── PANTALLA DE SUSPENSIÓN ─────────────────────────────── */
function SuspendedScreen({onLogout,configName}){
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0a0f1e 0%,#1a0a0a 100%)",padding:24}}>
    <style>{STYLES}</style>
    <div style={{textAlign:"center",maxWidth:480,animation:"fadeUp .4s ease"}}>
      <div style={{width:90,height:90,borderRadius:26,background:"#dc262620",border:"2px solid #dc262640",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,margin:"0 auto 24px"}}>🔒</div>
      <h1 style={{fontSize:26,fontWeight:900,color:"#fff",marginBottom:10}}>Servicio Suspendido</h1>
      <p style={{color:"rgba(255,255,255,.55)",fontSize:14,lineHeight:1.7,marginBottom:28}}>
        La suscripción de <strong style={{color:"#fff"}}>{configName||"tu restaurante"}</strong> ha vencido.<br/>
        Para reactivar el menú y todos los servicios, realiza el pago de tu plan y súbelo desde la sección <strong style={{color:"#c084fc"}}>Facturación</strong>.
      </p>
      <div style={{background:"rgba(220,38,38,.12)",border:"1px solid rgba(220,38,38,.25)",borderRadius:14,padding:"16px 20px",marginBottom:28,textAlign:"left"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#f87171",marginBottom:10}}>⚠️ Servicios desactivados</div>
        {[["🌐","Menú digital QR"],["📦","Gestión de productos"],["🚴","Delivery"],["📊","Estadísticas"],["🤖","Asistente IA"]].map(([ic,lb])=>(
          <div key={lb} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,fontSize:12,color:"rgba(255,255,255,.4)"}}>{ic} {lb} <span style={{marginLeft:"auto",color:"#dc2626",fontSize:10,fontWeight:700}}>INACTIVO</span></div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <Btn v="primary" onClick={onLogout}>Ir a pagar →</Btn>
        <button onClick={onLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.5)",borderRadius:10,padding:"10px 20px",fontSize:13,cursor:"pointer"}}>Cerrar sesión</button>
      </div>
      <p style={{marginTop:20,fontSize:11,color:"rgba(255,255,255,.3)"}}>¿Pagaste y aún ves esta pantalla? Escríbenos a <span style={{color:"#818cf8"}}>soporte@gotup.co</span></p>
    </div>
  </div>;
}

/* ─── MENÚ PÚBLICO (sin login) ───────────────────────────── */
function PublicMenu({onBack}){
  const [config,setConfig]=useState(INIT_CONFIG);
  const [products,setProducts]=useState([]);
  const [cats,setCats]=useState([]);
  const [branches,setBranches]=useState(INIT_BRANCHES);
  const [loading,setLoading]=useState(true);
  const [ownerId,setOwnerId]=useState(null);
  const [suspended,setSuspended]=useState(false);
  const [businessType,setBusinessType]=useState("restaurant");
  useEffect(()=>{
    (async()=>{
      const {data:cfg}=await supabase.from("restaurant_config").select("*").limit(1).single();
      if(cfg){
        setOwnerId(cfg.user_id);
        // Verificar suscripción del dueño
        const {data:prof}=await supabase.from("profiles").select("subscription_expires_at,business_type").eq("id",cfg.user_id).single();
        if(prof?.subscription_expires_at && new Date(prof.subscription_expires_at)<new Date()){
          setSuspended(true);setLoading(false);return;
        }
        if(prof?.business_type) setBusinessType(prof.business_type);
        setConfig({name:cfg.name,tagline:cfg.tagline,logo:cfg.logo,primaryColor:cfg.primary_color,menuStyle:cfg.menu_style,menuFont:cfg.menu_font,city:cfg.city,address:cfg.address,phone:cfg.phone,whatsapp:cfg.whatsapp,schedule:cfg.schedule,coverImg:cfg.cover_img,bgImg:"",openStatus:cfg.open_status,deliveryFee:cfg.delivery_fee,showAllergens:cfg.show_allergens,banners:cfg.banners||[],promoPopup:cfg.promo_popup||null,socialLinks:cfg.social_links||{}});
        const [cr,pr]=await Promise.all([
          supabase.from("categories").select("*").eq("user_id",cfg.user_id).order("sort_order"),
          supabase.from("products").select("*").eq("user_id",cfg.user_id),
        ]);
        if(cr.data?.length) setCats(cr.data.map(c=>({id:c.id,name:c.name,icon:c.icon||"🍽️",iconType:c.icon_type||"emoji",iconImg:c.icon_img||"",active:c.active!==false,order:c.sort_order||0,bgImg:c.bg_img||"",bgColor:c.bg_color||"",textColor:c.text_color||"#ffffff",fontStyle:c.font_style||"modern",branchIds:c.branch_ids||["all"]})));
        if(pr.data?.length) setProducts(pr.data.map(p=>({id:p.id,catId:p.cat_id,name:p.name,price:p.price,deliveryPrice:p.delivery_price||null,forMenu:p.for_menu!==false,forDelivery:p.for_delivery!==false,desc:p.description,emoji:p.emoji,img:p.img,active:p.active,featured:p.featured,stock:p.in_stock,label:p.label,labelColor:p.label_color,allergens:p.allergens||[],clicks:p.clicks||0,branchIds:p.branch_ids||["all"]})));
      }
      setLoading(false);
    })();
  },[]);
  const addOrder=async o=>{
    if(!ownerId) return;
    await supabase.from("orders").insert({id:o.id,user_id:ownerId,status:o.status,mode:o.mode,created_at:o.createdAt,time:o.time,date:o.date,customer_name:o.customerName,customer_phone:o.customerPhone,customer_email:o.customerEmail,address:o.address,address_ref:o.addressRef,table_num:o.table,notes:o.notes,payment:o.payment,items:o.items,subtotal:o.subtotal,delivery:o.delivery,total:o.total});
  };
  if(loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#111009"}}><style>{STYLES}</style><div style={{textAlign:"center"}}><div style={{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(255,255,255,.1)",borderTopColor:"#c084fc",animation:"spin .7s linear infinite",margin:"0 auto 14px"}}/><div style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Cargando menú…</div></div></div>;
  if(suspended) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#111009",padding:24}}>
    <style>{STYLES}</style>
    <div style={{textAlign:"center",maxWidth:420,animation:"fadeUp .4s ease"}}>
      <div style={{fontSize:64,marginBottom:20}}>🔒</div>
      <h2 style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:12}}>Menú no disponible</h2>
      <p style={{color:"rgba(255,255,255,.5)",fontSize:14,lineHeight:1.7}}>Este restaurante ha suspendido temporalmente su servicio digital. Contáctanos directamente para hacer tu pedido.</p>
    </div>
  </div>;
  return <><style>{STYLES}</style><CustomerView config={config} products={products} cats={cats} onBack={onBack} onAddOrder={addOrder} branches={branches} banners={config.banners||[]} businessType={businessType}/></>;
}

/* ─── APP ROOT ────────────────────────────────────────────── */
export default function App(){
  const [user,setUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const logout=useCallback(async()=>{await supabase.auth.signOut();setUser(null);},[]);
  const [menuView,setMenuView]=useState(false);

  useEffect(()=>{
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(session){
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
        if(profile) setUser({...session.user,role:profile.role,name:profile.name,title:profile.title,avatar:profile.avatar,subscriptionExpiresAt:profile.subscription_expires_at||null,businessType:profile.business_type||"restaurant"});
      }
      setAuthChecked(true);
    });
  },[]);

  // Admin state
  const [adminSection,setAdminSection]=useState("home");
  const [products,setProducts]=useState([]);
  const [cats,setCats]=useState([]);
  const [config,setConfig]=useState(INIT_CONFIG);
  const [billing,setBilling]=useState(INIT_BILLING);
  const [orders,setOrders]=useState([]);
  const [branches,setBranches]=useState(INIT_BRANCHES);
  const [toast,setToast]=useState(null);
  const [showPreview,setShowPreview]=useState(false);
  const [dbLoaded,setDbLoaded]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);

  // CEO state
  const [ceoSection,setCeoSection]=useState("ceo_dash");
  const [restaurants,setRestaurants]=useState(SEED_RESTAURANTS);
  const [tickets,setTickets]=useState(SEED_TICKETS);
  const [paymentRequests,setPaymentRequests]=useState([]);
  const [payReqLoading,setPayReqLoading]=useState(false);

  const showToast=useCallback((msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),2600);},[]);
  const newOrders=orders.filter(o=>o.status==="pendiente").length;

  // Carga datos del admin desde Supabase
  useEffect(()=>{
    if(!user||user.role!=="admin")return;
    (async()=>{
      const [cr,pr,cfr,or]=await Promise.all([
        supabase.from("categories").select("*").eq("user_id",user.id).order("sort_order"),
        supabase.from("products").select("*").eq("user_id",user.id),
        supabase.from("restaurant_config").select("*").eq("user_id",user.id).single(),
        supabase.from("orders").select("*").eq("user_id",user.id).order("created_at",{ascending:false}),
      ]);
      if(cr.data?.length) setCats(cr.data.map(c=>({id:c.id,name:c.name,icon:c.icon||"🍽️",iconType:c.icon_type||"emoji",iconImg:c.icon_img||"",active:c.active!==false,order:c.sort_order||0,bgImg:c.bg_img||"",bgColor:c.bg_color||"",textColor:c.text_color||"#ffffff",fontStyle:c.font_style||"modern",branchIds:c.branch_ids||["all"]})));
      if(pr.data?.length) setProducts(pr.data.map(p=>({id:p.id,catId:p.cat_id,name:p.name,price:p.price,deliveryPrice:p.delivery_price||null,forMenu:p.for_menu!==false,forDelivery:p.for_delivery!==false,desc:p.description,emoji:p.emoji,img:p.img,active:p.active,featured:p.featured,stock:p.in_stock,label:p.label,labelColor:p.label_color,allergens:p.allergens||[],clicks:p.clicks||0,branchIds:p.branch_ids||["all"]})));
      if(cfr.data){const d=cfr.data;setConfig({name:d.name,tagline:d.tagline,logo:d.logo,primaryColor:d.primary_color,menuStyle:d.menu_style,menuFont:d.menu_font,city:d.city,address:d.address,phone:d.phone,whatsapp:d.whatsapp,schedule:d.schedule,coverImg:d.cover_img,bgImg:"",openStatus:d.open_status,deliveryFee:d.delivery_fee,showAllergens:d.show_allergens,banners:d.banners||[],promoPopup:d.promo_popup||null,socialLinks:d.social_links||{}});}
      if(or.data?.length) setOrders(or.data.map(o=>({id:o.id,createdAt:o.created_at,status:o.status,mode:o.mode,time:o.time,date:o.date,customerName:o.customer_name,customerPhone:o.customer_phone,customerEmail:o.customer_email,address:o.address,addressRef:o.address_ref,table:o.table_num,notes:o.notes,payment:o.payment,items:o.items||[],subtotal:o.subtotal,delivery:o.delivery,total:o.total})));
      setDbLoaded(true);
    })();
  },[user]);

  // Admin handlers
  const addProduct=useCallback(async p=>{
    const {error}=await supabase.from("products").insert({id:p.id,user_id:user.id,cat_id:p.catId,name:p.name,price:p.price,delivery_price:p.deliveryPrice||null,for_menu:p.forMenu!==false,for_delivery:p.forDelivery!==false,description:p.desc,emoji:p.emoji,img:p.img,active:p.active,featured:p.featured,in_stock:p.stock,label:p.label,label_color:p.labelColor,allergens:p.allergens,clicks:0,branch_ids:p.branchIds||["all"]});
    if(error){console.error("addProduct error:",error);showToast("❌ Error al guardar: "+error.message,"error");return;}
    setProducts(v=>[p,...v]);showToast("✓ Producto agregado");
  },[user,showToast]);
  const updateProduct=useCallback(async(id,patch)=>{
    const db={};
    if(patch.catId!==undefined)db.cat_id=patch.catId;
    if(patch.name!==undefined)db.name=patch.name;
    if(patch.price!==undefined)db.price=patch.price;
    if(patch.desc!==undefined)db.description=patch.desc;
    if(patch.emoji!==undefined)db.emoji=patch.emoji;
    if(patch.img!==undefined)db.img=patch.img;
    if(patch.active!==undefined)db.active=patch.active;
    if(patch.featured!==undefined)db.featured=patch.featured;
    if(patch.stock!==undefined)db.in_stock=patch.stock;
    if(patch.label!==undefined)db.label=patch.label;
    if(patch.labelColor!==undefined)db.label_color=patch.labelColor;
    if(patch.allergens!==undefined)db.allergens=patch.allergens;
    if(patch.deliveryPrice!==undefined)db.delivery_price=patch.deliveryPrice;
    if(patch.forMenu!==undefined)db.for_menu=patch.forMenu;
    if(patch.forDelivery!==undefined)db.for_delivery=patch.forDelivery;
    if(patch.branchIds!==undefined)db.branch_ids=patch.branchIds;
    if(Object.keys(db).length){const {error}=await supabase.from("products").update(db).eq("id",id);if(error){console.error("updateProduct error:",error);showToast("❌ Error al guardar: "+error.message,"error");return;}}
    setProducts(v=>v.map(x=>x.id===id?{...x,...patch}:x));showToast("✓ Cambios guardados");
  },[showToast]);
  const deleteProduct=useCallback(async id=>{
    await supabase.from("products").delete().eq("id",id);
    setProducts(v=>v.filter(x=>x.id!==id));showToast("Producto eliminado","warn");
  },[showToast]);
  const addCat=useCallback(async c=>{
    const {error}=await supabase.from("categories").insert({id:c.id,user_id:user.id,name:c.name,icon:c.icon,icon_type:c.iconType||"emoji",icon_img:c.iconImg||null,active:c.active,sort_order:c.order,bg_img:c.bgImg||null,bg_color:c.bgColor||null,text_color:c.textColor||"#ffffff",font_style:c.fontStyle||"modern",branch_ids:c.branchIds||["all"]});
    if(error){console.error("addCat error:",error);showToast("❌ Error: "+error.message,"error");return;}
    setCats(v=>[...v,c]);showToast("✓ Categoría creada");
  },[user,showToast]);
  const updateCat=useCallback(async(id,patch)=>{
    const db={};
    if(patch.name!==undefined)db.name=patch.name;
    if(patch.icon!==undefined)db.icon=patch.icon;
    if(patch.active!==undefined)db.active=patch.active;
    if(patch.order!==undefined)db.sort_order=patch.order;
    if(patch.iconType!==undefined)db.icon_type=patch.iconType;
    if(patch.iconImg!==undefined)db.icon_img=patch.iconImg||null;
    if(patch.bgImg!==undefined)db.bg_img=patch.bgImg||null;
    if(patch.bgColor!==undefined)db.bg_color=patch.bgColor||null;
    if(patch.textColor!==undefined)db.text_color=patch.textColor;
    if(patch.fontStyle!==undefined)db.font_style=patch.fontStyle;
    if(patch.branchIds!==undefined)db.branch_ids=patch.branchIds;
    if(Object.keys(db).length){const {error}=await supabase.from("categories").update(db).eq("id",id);if(error){console.error("updateCat error:",error);showToast("❌ Error al guardar: "+error.message,"error");return;}}
    setCats(v=>v.map(x=>x.id===id?{...x,...patch}:x));
  },[showToast]);
  const deleteCat=useCallback(async id=>{
    await supabase.from("categories").delete().eq("id",id);
    setCats(v=>v.filter(x=>x.id!==id));showToast("Categoría eliminada","warn");
  },[showToast]);
  const addOrder=useCallback(async o=>{
    await supabase.from("orders").insert({id:o.id,user_id:user.id,status:o.status,mode:o.mode,created_at:o.createdAt,time:o.time,date:o.date,customer_name:o.customerName,customer_phone:o.customerPhone,customer_email:o.customerEmail,address:o.address,address_ref:o.addressRef,table_num:o.table,notes:o.notes,payment:o.payment,items:o.items,subtotal:o.subtotal,delivery:o.delivery,total:o.total});
    setOrders(v=>[o,...v]);showToast("🔔 Nuevo pedido recibido");
  },[user,showToast]);
  const moveOrder=useCallback(async(id,s)=>{
    await supabase.from("orders").update({status:s}).eq("id",id);
    setOrders(v=>v.map(o=>o.id===id?{...o,status:s}:o));
    const _vl=getVertical(user?.businessType||"restaurant").labels;
    const _sl={pendiente:"Pendiente",en_cocina:_vl.status_processing,listo:_vl.status_ready,en_camino:_vl.status_shipping,entregado:_vl.status_done};
    showToast(`→ ${_sl[s]||s}`);
  },[showToast]);
  const updateBranch=useCallback((id,patch)=>{setBranches(v=>v.map(x=>x.id===id?{...x,...patch}:x));},[]);
  const addBranch=useCallback(b=>{setBranches(v=>[...v,b]);showToast("✓ Sucursal creada");},[showToast]);

  // CEO handlers
  const updateRestaurant=useCallback((id,patch)=>setRestaurants(v=>v.map(r=>r.id===id?{...r,...patch}:r)),[]);
  const addRestaurant=useCallback(r=>setRestaurants(v=>[r,...v]),[]);
  const updateTicket=useCallback((id,patch)=>setTickets(v=>v.map(t=>t.id===id?{...t,...patch}:t)),[]);

  // CEO: cargar payment_requests
  useEffect(()=>{
    if(!user||user.role!=="ceo")return;
    setPayReqLoading(true);
    supabase.from("payment_requests").select("*").order("created_at",{ascending:false}).then(({data})=>{
      if(data)setPaymentRequests(data);
      setPayReqLoading(false);
    });
  },[user]);

  // CEO: cargar negocios reales desde Supabase y combinar con seed
  useEffect(()=>{
    if(!user||user.role!=="ceo")return;
    (async()=>{
      const {data:cfgs}=await supabase.from("restaurant_config").select("*");
      const {data:profs}=await supabase.from("profiles").select("*").eq("role","admin");
      if(!cfgs||!profs)return;
      const MRR_MAP={pro:99900,business:189900,starter:49900,enterprise:299900};
      const now=new Date();
      const realRestaurants=cfgs.map(cfg=>{
        const prof=profs.find(p=>p.id===cfg.user_id);
        if(!prof)return null;
        const expiry=prof.subscription_expires_at?new Date(prof.subscription_expires_at):null;
        const daysLeft=expiry?Math.max(0,Math.round((expiry-now)/(1000*60*60*24))):null;
        const status=!expiry?"trial":daysLeft===0?"suspended":daysLeft<0?"suspended":"active";
        return {
          id:cfg.user_id,
          name:cfg.name||"Sin nombre",
          owner:prof.name||"Admin",
          email:prof.email||"",
          phone:cfg.phone||"",
          city:cfg.city||"",
          plan:prof.billing_plan||"pro",
          status,
          businessType:prof.business_type||"restaurant",
          createdAt:prof.created_at?prof.created_at.slice(0,10):"2025-01-01",
          nextPayment:expiry?expiry.toISOString().slice(0,10):null,
          daysLeft,
          mrr:MRR_MAP[prof.billing_plan||"pro"]||99900,
          products:0,orders:0,
          coverImg:cfg.cover_img||"",
          logo:cfg.logo||"🏪",
          notes:""
        };
      }).filter(Boolean);
      // Combinar: seed primero, luego los reales que no estén en seed por email
      setRestaurants(prev=>{
        const seedEmails=new Set(prev.map(r=>r.email));
        const newOnes=realRestaurants.filter(r=>!seedEmails.has(r.email));
        return [...prev,...newOnes];
      });
    })();
  },[user]);

  // CEO: aprobar pago
  const approvePayment=useCallback(async(req)=>{
    const now=new Date().toISOString();
    // Calcular nueva fecha de expiración: hoy + 30 días
    const newExpiry=new Date(Date.now()+30*24*60*60*1000).toISOString();
    await supabase.from("payment_requests").update({status:"approved",reviewed_at:now,reviewed_by:user?.name||"CEO"}).eq("id",req.id);
    // Actualiza billing_plan Y subscription_expires_at en profiles del owner
    await supabase.from("profiles").update({billing_plan:req.plan,subscription_expires_at:newExpiry}).eq("id",req.owner_id);
    setPaymentRequests(v=>v.map(r=>r.id===req.id?{...r,status:"approved",reviewed_at:now}:r));
    showToast(`✅ Pago de ${req.restaurant_name} aprobado — Plan ${req.plan} activo hasta ${newExpiry.slice(0,10)}`);
  },[user,showToast]);

  // CEO: rechazar pago
  const rejectPayment=useCallback(async(req,note)=>{
    const now=new Date().toISOString();
    await supabase.from("payment_requests").update({status:"rejected",ceo_notes:note||"",reviewed_at:now,reviewed_by:user?.name||"CEO"}).eq("id",req.id);
    setPaymentRequests(v=>v.map(r=>r.id===req.id?{...r,status:"rejected",ceo_notes:note||"",reviewed_at:now}:r));
    showToast(`❌ Pago de ${req.restaurant_name} rechazado`,"warn");
  },[user,showToast]);

  // Acceso público al menú del cliente: ?menu en la URL
  const isPublicMenu=new URLSearchParams(window.location.search).has("menu");
  if(isPublicMenu&&!user) return <PublicMenu onBack={()=>{window.history.pushState({},"","/");window.location.reload();}}/>;

  if(!authChecked) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0a0f1e 0%,#1a1040 100%)"}}><style>{STYLES}</style><div style={{width:36,height:36,borderRadius:"50%",border:"3px solid rgba(255,255,255,.15)",borderTopColor:"#c084fc",animation:"spin .7s linear infinite"}}/></div>;
  if(!user) return <Login onLogin={setUser}/>;

  // ── Chequeo de suspensión por vencimiento ──────────────────
  const isAdminSuspended = user?.role==="admin" && user?.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt)<new Date();
  if(isAdminSuspended) return <SuspendedScreen onLogout={logout} configName={config?.name}/>;

  if(user.role==="admin"&&!dbLoaded) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,flexDirection:"column",gap:12}}>
    <style>{STYLES}</style>
    <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #e4e7f0",borderTopColor:T.violet,animation:"spin .7s linear infinite"}}/>
    <div style={{color:T.mid,fontSize:14,fontWeight:600}}>Cargando tu restaurante…</div>
  </div>;

  // Customer menu
  if(menuView) return <>
    <style>{STYLES}</style>
    <CustomerView config={config} products={products} cats={cats} onBack={()=>setMenuView(false)} onAddOrder={addOrder} branches={branches} banners={config.banners||[]} businessType={user?.businessType||"restaurant"}/>
  </>;

  // CEO view
  if(user.role==="ceo"){
    const CEO_SECTIONS={
      ceo_dash:<CEODash restaurants={restaurants} tickets={tickets}/>,
      ceo_restaurantes:<CEORestaurantes restaurants={restaurants} onUpdate={updateRestaurant} showToast={showToast}/>,
      ceo_onboarding:<CEOOnboarding onAdd={addRestaurant} showToast={showToast}/>,
      ceo_pagos:<CEOPagos restaurants={restaurants} paymentRequests={paymentRequests} onApprove={approvePayment} onReject={rejectPayment} loading={payReqLoading}/>,
      ceo_soporte:<CEOSoporte tickets={tickets} onUpdateTicket={updateTicket}/>,
      ceo_plataforma:<CEOPlataforma/>,
    };
    return <>
      <style>{STYLES}</style>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      <div style={{display:"flex",minHeight:"100vh",background:T.bg}}>
        <CEOSidebar active={ceoSection} onSelect={setCeoSection} restaurants={restaurants} tickets={tickets} onLogout={logout} user={user} pendingPayments={paymentRequests.filter(r=>r.status==="pending").length}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"11px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40,boxShadow:T.sh}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:13,color:T.text,fontWeight:700}}>Got<span style={{background:"linear-gradient(90deg,#f97316,#fbbf24)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>up</span> · CEO Panel</span>
              <div style={{display:"flex",alignItems:"center",gap:5,background:T.greenL,borderRadius:20,padding:"3px 10px"}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:T.green,display:"inline-block",animation:"pulse2 2s infinite"}}/>
                <span style={{fontSize:10,fontWeight:700,color:T.green}}>Sistema operativo</span>
              </div>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:12,color:T.mid}}>
                {restaurants.filter(r=>r.status==="active").length} restaurantes activos · MRR: {fmtCOP(restaurants.filter(r=>r.status==="active").reduce((s,r)=>s+r.mrr,0))}
              </span>
              <Btn sm v="danger" onClick={logout}>🔓 Cerrar sesión</Btn>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}} key={ceoSection}>
            {CEO_SECTIONS[ceoSection]||CEO_SECTIONS.ceo_dash}
          </div>
        </div>
      </div>
    </>;
  }

  // ── ADMIN VIEW ──────────────────────────────────────────
  const vertical = getVertical(user?.businessType||"restaurant");
  const ADMIN_SECTIONS = {
    home:       <SecHome products={products} orders={orders} config={config} billing={billing} onNav={setAdminSection} vertical={vertical}/>,
    sucursales: <SecSucursales branches={branches} onUpdateBranch={updateBranch} onAddBranch={addBranch} ownerId={user?.id}/>,
    productos:  <SecProductos products={products} cats={cats} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} vertical={vertical} branches={branches}/>,
    categorias: <SecCategorias cats={cats} products={products} onAdd={addCat} onUpdate={updateCat} onDelete={deleteCat} vertical={vertical} branches={branches}/>,
    stock:      <SecStock products={products} onUpdate={updateProduct}/>,
    diseno:     <SecDiseno config={config} onUpdate={async c=>{await supabase.from("restaurant_config").update({name:c.name,tagline:c.tagline,logo:c.logo,primary_color:c.primaryColor,menu_style:c.menuStyle,menu_font:c.menuFont,city:c.city,address:c.address,phone:c.phone,whatsapp:c.whatsapp,schedule:c.schedule,cover_img:c.coverImg,open_status:c.openStatus,delivery_fee:c.deliveryFee,show_allergens:c.showAllergens,banners:c.banners||[],social_links:c.socialLinks||{}}).eq("user_id",user.id);setConfig(c);showToast("✓ Diseño guardado");}}/>,
    banners:    <SecBanners config={config} vertical={vertical} cats={cats} onUpdate={async c=>{await supabase.from("restaurant_config").update({banners:c.banners||[],promo_popup:c.promoPopup||null}).eq("user_id",user.id);setConfig(c);showToast("✓ Banners y popup guardados");}}/>,
    delivery:   <SecDelivery orders={orders} onMove={moveOrder} products={products} config={config} onAddOrder={addOrder} vertical={vertical}/>,
    informes:   <SecInformes products={products}/>,
    ai:         <SecAI products={products} orders={orders} cats={cats} config={config} branches={branches} onAddProduct={addProduct} onUpdateProduct={updateProduct}/>,
    facturacion:<SecFacturacion billing={billing} setBilling={setBilling} user={user} configName={config.name} showToast={showToast}/>,
  };

  const ADMIN_RESP_CSS=`
    .admin-sidebar{transition:transform .25s ease;z-index:99}
    .admin-content-pad{padding:24px 28px}
    .admin-topbar-name{display:flex;align-items:center;gap:10}
    .admin-topbar-actions{display:flex;gap:8;align-items:center}
    .admin-preview-panel{display:flex}
    .mob-hamburger{display:none!important}
    @media(max-width:768px){
      .admin-sidebar{position:fixed!important;top:0;left:0;height:100vh!important;transform:translateX(-100%)}
      .admin-sidebar.open{transform:translateX(0)!important}
      .mob-overlay{display:block!important}
      .mob-close-btn{display:flex!important}
      .mob-hamburger{display:flex!important}
      .admin-preview-panel{display:none!important}
      .admin-content-pad{padding:16px 14px}
      .admin-topbar-name{display:none!important}
      .hide-mob{display:none!important}
      .diseno-grid{grid-template-columns:1fr!important}
    }
    @media(max-width:480px){
      .admin-content-pad{padding:12px 10px}
    }
  `;
  return <>
    <style>{STYLES}</style>
    <style>{ADMIN_RESP_CSS}</style>
    {toast&&<Toast msg={toast.msg} type={toast.type}/>}
    <div style={{display:"flex",minHeight:"100vh",background:T.bg}}>
      <AdminSidebar
        active={adminSection}
        onSelect={s=>{setAdminSection(s);setSidebarOpen(false);}}
        billing={billing}
        newOrders={newOrders}
        user={user}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={()=>setSidebarOpen(false)}
        vertical={vertical}
      />
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Top bar */}
        <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40,boxShadow:T.sh}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* Hamburger mobile */}
            <button className="mob-hamburger" onClick={()=>setSidebarOpen(o=>!o)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,width:34,height:34,cursor:"pointer",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,flexShrink:0}}>
              <span style={{display:"block",width:16,height:2,background:T.text,borderRadius:2}}/>
              <span style={{display:"block",width:16,height:2,background:T.text,borderRadius:2}}/>
              <span style={{display:"block",width:16,height:2,background:T.text,borderRadius:2}}/>
            </button>
            <div className="admin-topbar-name">
              <span style={{fontSize:13,color:T.mid,fontWeight:500}}>{vertical.icon} {config.name} · {config.city}</span>
              <div style={{display:"flex",alignItems:"center",gap:5,background:config.openStatus?T.greenL:T.redL,borderRadius:20,padding:"3px 10px"}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:config.openStatus?T.green:T.red,display:"inline-block",animation:config.openStatus?"pulse2 2s infinite":"none"}}/>
                <span style={{fontSize:10,fontWeight:700,color:config.openStatus?T.green:T.red}}>{config.openStatus?"Abierto":"Cerrado"}</span>
              </div>
            </div>
            {/* Nombre restaurante en mobile */}
            <span className="mob-hamburger" style={{fontSize:13,fontWeight:800,color:T.text,display:"none"}}>{config.name}</span>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {newOrders>0&&(
              <div onClick={()=>setAdminSection("delivery")} style={{background:T.amberL,border:"1px solid #fed7aa",borderRadius:20,padding:"5px 10px",fontSize:11,fontWeight:700,color:"#9a3412",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:T.amber,animation:"pulse2 1s infinite",display:"inline-block"}}/>
                {newOrders} nuevo{newOrders>1?"s":""}
              </div>
            )}
            <Btn sm v="ghost" onClick={()=>setMenuView(true)} icon="🔗">{vertical.labels.btn_view||"Ver catálogo"}</Btn>
            <Btn sm v="danger"  onClick={logout}>⏻</Btn>
          </div>
        </div>

        {/* Content area */}
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          <div className="admin-content-pad" style={{flex:1,overflowY:"auto"}} key={adminSection}>
            {ADMIN_SECTIONS[adminSection]||ADMIN_SECTIONS.home}
          </div>

          {/* Live preview panel */}
          {showPreview&&(
            <div className="admin-preview-panel" style={{width:284,flexShrink:0,borderLeft:`1px solid ${T.border}`,flexDirection:"column",background:T.white}}>
              <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:11,fontWeight:700,color:T.mid,textTransform:"uppercase",letterSpacing:".5px"}}>📱 Vista cliente</span>
                <span style={{fontSize:10,color:T.light}}>Tiempo real</span>
              </div>
              <div style={{flex:1,overflow:"hidden",margin:"10px",border:`2px solid ${T.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}>
                <MenuPreview config={config} products={products} cats={cats}/>
              </div>
              <div style={{padding:"8px 12px",borderTop:`1px solid ${T.border}`,fontSize:9,color:T.light,textAlign:"center"}}>
                Vista que ve el cliente al escanear el QR
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </>;
}