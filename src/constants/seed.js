import { T } from "./theme";

export const USERS = [
  { email:"ceo@gotup.co",    password:"gotup2026", role:"ceo",   name:"Steven Giraldo", title:"CEO & Fundador",         avatar:"👑" },
  { email:"admin@lalena.co",  password:"lalena2026", role:"admin", name:"Carlos Mejía",   title:"Admin · La Leña",        avatar:"👨‍💼" },
];

/* ─── DATOS SEED ──────────────────────────────────────────── */

export const SEED_RESTAURANTS = [
  {id:"r1",name:"La Leña",owner:"Carlos Mejía",email:"carlos@lalena.co",phone:"+57 300 111 2222",city:"Cali",plan:"pro",status:"active",createdAt:"2025-10-15",nextPayment:"2026-05-01",daysLeft:8,mrr:99900,products:10,orders:142,coverImg:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=70",logo:"🔥",notes:"Cliente VIP."},
  {id:"r2",name:"Bufalo Ribs Co",owner:"Ana Torres",email:"ana@bufalo.co",phone:"+57 310 333 4444",city:"Bogotá",plan:"business",status:"active",createdAt:"2025-11-02",nextPayment:"2026-05-02",daysLeft:9,mrr:189900,products:28,orders:389,coverImg:"https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=70",logo:"🦬",notes:"Multi-sucursal."},
  {id:"r3",name:"Sushi Nakama",owner:"Diego Park",email:"diego@nakama.co",phone:"+57 320 555 6666",city:"Medellín",plan:"pro",status:"active",createdAt:"2025-12-10",nextPayment:"2026-05-10",daysLeft:17,mrr:99900,products:45,orders:201,coverImg:"https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=70",logo:"🍣",notes:""},
  {id:"r4",name:"Tacos El Rancho",owner:"María González",email:"maria@elrancho.co",phone:"+57 315 777 8888",city:"Barranquilla",plan:"starter",status:"active",createdAt:"2026-01-20",nextPayment:"2026-05-20",daysLeft:27,mrr:49900,products:15,orders:67,coverImg:"https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=70",logo:"🌮",notes:"Potencial upgrade."},
  {id:"r5",name:"Pizza & Co",owner:"Roberto Salcedo",email:"roberto@pizzaco.co",phone:"+57 305 999 0000",city:"Cali",plan:"starter",status:"suspended",createdAt:"2025-09-05",nextPayment:"2026-04-05",daysLeft:-18,mrr:49900,products:20,orders:0,coverImg:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70",logo:"🍕",notes:"Suspendida 18 días."},
  {id:"r6",name:"El Corral Premium",owner:"Valentina Ruiz",email:"valentina@corral.co",phone:"+57 312 111 3333",city:"Bogotá",plan:"business",status:"active",createdAt:"2025-08-15",nextPayment:"2026-05-15",daysLeft:22,mrr:189900,products:60,orders:512,coverImg:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70",logo:"🍔",notes:""},
  {id:"r7",name:"Crepes & Waffles",owner:"Laura Moreno",email:"laura@creperia.co",phone:"+57 318 444 5555",city:"Cartagena",plan:"pro",status:"trial",createdAt:"2026-04-01",nextPayment:"2026-04-15",daysLeft:3,mrr:0,products:8,orders:12,coverImg:"https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=70",logo:"🧇",notes:"Trial activo."},
];

export const SEED_TICKETS = [
  {id:"t1",restaurant:"La Leña",user:"Carlos Mejía",subject:"Catálogo no carga en iOS",priority:"high",status:"open",date:"2026-04-22",messages:[{from:"Carlos Mejía",text:"El catálogo no abre bien en iPhone.",time:"10:30"}]},
  {id:"t2",restaurant:"Sushi Nakama",user:"Diego Park",subject:"Cómo activar domicilios",priority:"medium",status:"open",date:"2026-04-21",messages:[{from:"Diego Park",text:"¿Cómo activo domicilios?",time:"14:15"}]},
  {id:"t3",restaurant:"Bufalo Ribs Co",user:"Ana Torres",subject:"Factura de marzo incorrecta",priority:"high",status:"resolved",date:"2026-04-20",messages:[{from:"Ana Torres",text:"Me cobraron dos veces.",time:"09:00"},{from:"Soporte Picku",text:"Aplicamos el crédito. Disculpa.",time:"11:30"}]},
];

export const PAYMENTS_HISTORY = [
  {id:"p1",restaurant:"Bufalo Ribs Co",plan:"Business",amount:189900,date:"2026-04-02",method:"Visa ****8821",status:"paid"},
  {id:"p2",restaurant:"El Corral Premium",plan:"Business",amount:189900,date:"2026-04-02",method:"MC ****3344",status:"paid"},
  {id:"p3",restaurant:"La Leña",plan:"Pro",amount:99900,date:"2026-04-02",method:"Visa ****4821",status:"paid"},
  {id:"p4",restaurant:"Pizza & Co",plan:"Starter",amount:49900,date:"2026-04-05",method:"Visa ****1122",status:"failed"},
];

export const MRR_TREND = [{m:"Oct",mrr:149900},{m:"Nov",mrr:339800},{m:"Dic",mrr:489600},{m:"Ene",mrr:579400},{m:"Feb",mrr:629300},{m:"Mar",mrr:728800},{m:"Abr",mrr:729400}];

export const PLAN_DIST = [{name:"Starter",value:2,color:"#2563eb"},{name:"Pro",value:3,color:"#6d28d9"},{name:"Business",value:2,color:"#db2777"}];

export const INIT_CATS = [
  {id:"c1",name:"Lo más pedido",icon:"🔥",active:true,order:0},
  {id:"c2",name:"Entradas",icon:"🥗",active:true,order:1},
  {id:"c3",name:"Platos fuertes",icon:"🍖",active:true,order:2},
  {id:"c4",name:"Bebidas",icon:"🥤",active:true,order:3},
  {id:"c5",name:"Postres",icon:"🍮",active:true,order:4},
];

export const INIT_PRODUCTS = [
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

export const INIT_CONFIG = {
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

export const INIT_BILLING = {
  plan:"pro", status:"active", daysLeft:18, nextPayment:"2026-05-10", amount:99900,
  card:"**** **** **** 4821", cardBrand:"Visa",
  history:[
    {id:"INV-003",date:"2026-03-01",amount:99900,status:"paid",plan:"Pro"},
    {id:"INV-002",date:"2026-02-01",amount:99900,status:"paid",plan:"Pro"},
    {id:"INV-001",date:"2026-01-01",amount:49900,status:"paid",plan:"Starter"},
  ],
};
// ─── DATOS BANCARIOS (personaliza con los tuyos) ──────────────

export const BANK_INFO = {
  titular:"Steven Muñoz",
  cedula:"1.234.567.890",
  banks:[
    {name:"Nequi",icon:"💜",number:"310-XXX-XXXX",type:"Nequi"},
    {name:"Bancolombia",icon:"🟡",number:"123-456789-01",type:"Cuenta Ahorros"},
    {name:"Daviplata",icon:"🔴",number:"311-XXX-XXXX",type:"Daviplata"},
  ],
  instructions:"1. Realiza la transferencia al número/cuenta de tu preferencia.\n2. En la referencia escribe el nombre de tu restaurante.\n3. Toma captura del comprobante y súbela aquí.\n4. El equipo Picku verificará y activará tu plan en máximo 24 horas hábiles.",
};

export const PLANS_CATALOG = [
  {id:"starter",name:"Starter",price:49900,color:"#2563eb",features:["Catálogo digital QR","Hasta 30 productos","1 sucursal","Soporte email"]},
  {id:"pro",name:"Pro",price:99900,color:"#6d28d9",features:["Productos ilimitados","Delivery","Reservas","Asistente IA","Soporte 24/7"],popular:true},
  {id:"business",name:"Business",price:189900,color:"#db2777",features:["Todo Pro","Multi-sucursal","API acceso","Manager dedicado"]},
];

export const INIT_BRANCHES = [
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

export const ALLERGENS_LIST = [
  {id:"gluten",l:"Gluten",i:"🌾"},{id:"lacteo",l:"Lácteos",i:"🥛"},
  {id:"huevo",l:"Huevo",i:"🥚"},{id:"mani",l:"Maní",i:"🥜"},
  {id:"mariscos",l:"Mariscos",i:"🦐"},{id:"picante",l:"Picante",i:"🌶️"},
  {id:"vegano",l:"Vegano",i:"🌿"},{id:"soja",l:"Soja",i:"🫘"},
];

export const LABEL_PRESETS = [
  {name:"Popular",color:"#f97316"},{name:"Nuevo",color:"#8b5cf6"},
  {name:"Lo más pedido",color:"#dc2626"},{name:"Chef recomienda",color:"#059669"},
  {name:"Especial",color:"#2563eb"},{name:"Típico",color:"#db2777"},
];

export const PLAN_MAP = {
  starter:{label:"Starter",color:T.blue,price:49900},
  pro:{label:"Pro",color:T.violet,price:99900},
  business:{label:"Business",color:T.pink,price:189900},
};

export const STATUS_MAP = {
  active:{label:"Activo",color:T.green},
  suspended:{label:"Suspendido",color:T.red},
  trial:{label:"Trial",color:T.amber},
  inactive:{label:"Inactivo",color:T.mid},
};

/* ─── VERTICALES DE NEGOCIO ───────────────────────────────── */
