import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { SecInformes } from "../../features/admin/reports/SecInformes";
import { useAdminStore } from "../../stores/useAdminStore";

export default function InformesPage(){
  const products = useAdminStore(s => s.products);
  const orders   = useAdminStore(s => s.orders);
  const ownerId  = useAdminStore(s => s.ownerId);
  const [viewsData, setViewsData] = useState([]);

  useEffect(() => {
    if (!ownerId) return;
    // Últimos 7 días de visitas al catálogo desde la tabla menu_views
    const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    supabase
      .from("menu_views")
      .select("viewed_at")
      .eq("owner_id", ownerId)
      .gte("viewed_at", since)
      .then(({ data, error }) => {
        if (error || !data?.length) { setViewsData([]); return; }
        // Agrupar por fecha
        const counts = {};
        data.forEach(r => { counts[r.viewed_at] = (counts[r.viewed_at] || 0) + 1; });
        setViewsData(Object.entries(counts).map(([date, count]) => ({ date, count })));
      });
  }, [ownerId]);

  return <SecInformes products={products} orders={orders} viewsData={viewsData}/>;
}
