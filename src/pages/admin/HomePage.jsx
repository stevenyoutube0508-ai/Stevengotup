import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVertical } from "../../constants/verticals";
import { SecHome } from "../../features/admin/home/SecHome";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";
import { supabase } from "../../lib/supabase";

const ROUTE_BY_ID = {
  home:"/admin/home", sucursales:"/admin/sucursales", productos:"/admin/productos",
  categorias:"/admin/categorias", stock:"/admin/stock", diseno:"/admin/diseno",
  banners:"/admin/banners", delivery:"/admin/delivery", informes:"/admin/informes",
  ai:"/admin/ai", facturacion:"/admin/facturacion",
};

export default function HomePage() {
  const navigate  = useNavigate();
  const user      = useAuthStore(s => s.user);
  const products  = useAdminStore(s => s.products);
  const orders    = useAdminStore(s => s.orders);
  const config    = useAdminStore(s => s.config);
  const billing   = useAdminStore(s => s.billing);
  const ownerId   = useAdminStore(s => s.ownerId);
  const vertical  = getVertical(user?.businessType || "restaurant");

  const refreshClicks = useAdminStore(s => s.refreshClicks);
  const [viewsData, setViewsData] = useState([]);

  useEffect(() => {
    if (!ownerId) return;

    // Refrescar clicks de productos desde la BD
    refreshClicks();

    // Vistas reales del catálogo (últimos 7 días)
    const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    supabase
      .from("menu_views")
      .select("viewed_at")
      .eq("owner_id", ownerId)
      .gte("viewed_at", since)
      .then(({ data }) => {
        if (!data?.length) { setViewsData([]); return; }
        const counts = {};
        data.forEach(r => { counts[r.viewed_at] = (counts[r.viewed_at] || 0) + 1; });
        setViewsData(Object.entries(counts).map(([date, count]) => ({ date, count })));
      });
  }, [ownerId]);

  return (
    <SecHome
      products={products}
      orders={orders}
      config={config}
      billing={billing}
      viewsData={viewsData}
      onNav={id => navigate(ROUTE_BY_ID[id] || "/admin/home")}
      vertical={vertical}
    />
  );
}
