import { useNavigate } from "react-router-dom";
import { getVertical } from "../../constants/verticals";
import { SecHome } from "../../features/admin/home/SecHome";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

const ROUTE_BY_ID = {home:"/admin/home",sucursales:"/admin/sucursales",productos:"/admin/productos",categorias:"/admin/categorias",stock:"/admin/stock",diseno:"/admin/diseno",banners:"/admin/banners",delivery:"/admin/delivery",informes:"/admin/informes",ai:"/admin/ai",facturacion:"/admin/facturacion"};
export default function HomePage(){
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const products = useAdminStore(s => s.products);
  const orders = useAdminStore(s => s.orders);
  const config = useAdminStore(s => s.config);
  const billing = useAdminStore(s => s.billing);
  const vertical = getVertical(user?.businessType || "restaurant");
  return <SecHome products={products} orders={orders} config={config} billing={billing} onNav={id => navigate(ROUTE_BY_ID[id] || "/admin/home")} vertical={vertical}/>;
}
