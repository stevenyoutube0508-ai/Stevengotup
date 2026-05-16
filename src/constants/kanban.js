import { T } from "./theme";

export const KANBAN_COLS = [
  {key:"pendiente",label:"Pendiente",color:"#f59e0b"},
  {key:"en_cocina",label:"En cocina",color:"#3b82f6"},
  {key:"listo",label:"Listo",color:"#059669"},
  {key:"en_camino",label:"En camino",color:"#8b5cf6"},
  {key:"entregado",label:"Entregado",color:"#9ca3af"},
];

export const K_NEXT = {pendiente:"en_cocina",en_cocina:"listo",listo:"en_camino",en_camino:"entregado"};

export const ANALYTICS_WEEK = [
  {d:"Lu",v:120,o:18},{d:"Ma",v:98,o:14},{d:"Mi",v:145,o:22},
  {d:"Ju",v:210,o:38},{d:"Vi",v:289,o:54},{d:"Sa",v:342,o:71},{d:"Do",v:187,o:29},
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

export const PAYMENT_LABEL = {
  cash:"Efectivo",card:"Tarjeta",transfer:"Transferencia",nequi:"Nequi",daviplata:"Daviplata",
};
