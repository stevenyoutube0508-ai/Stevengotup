import { getVertical } from "../../constants/verticals";
import { SecDelivery } from "../../features/admin/delivery/SecDelivery";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function DeliveryPage(){
  const user = useAuthStore(s => s.user);
  const orders = useAdminStore(s => s.orders);
  const products = useAdminStore(s => s.products);
  const config = useAdminStore(s => s.config);
  const addOrder = useAdminStore(s => s.addOrder);
  const moveOrderBase = useAdminStore(s => s.moveOrder);
  const vertical = getVertical(user?.businessType || "restaurant");
  const moveOrder = (id, status) => moveOrderBase(id, status, user?.businessType || "restaurant");
  return <SecDelivery orders={orders} onMove={moveOrder} products={products} config={config} onAddOrder={addOrder} vertical={vertical}/>;
}
