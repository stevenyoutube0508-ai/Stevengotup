import { getVertical } from "../../constants/verticals";
import { SecDelivery } from "../../features/admin/delivery/SecDelivery";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function StaffDeliveryPage() {
  const user     = useAuthStore((s) => s.user);
  const orders   = useAdminStore((s) => s.orders);
  const products = useAdminStore((s) => s.products);
  const config   = useAdminStore((s) => s.config);
  const addOrder      = useAdminStore((s) => s.addOrder);
  const moveOrderBase = useAdminStore((s) => s.moveOrder);

  // Staff hereda el tipo de negocio del dueño — por ahora default restaurant.
  // TODO: leer businessType del config una vez cargado.
  const vertical  = getVertical("restaurant");
  const moveOrder = (id, status) => moveOrderBase(id, status, "restaurant");

  // Filtrar pedidos por sucursal asignada al operador.
  // Si el operador no tiene sucursal asignada, ve todos los pedidos (retrocompatibilidad).
  const staffBranchId = user?.branchId;
  const visibleOrders = staffBranchId
    ? orders.filter(o => !o.branchId || o.branchId === staffBranchId)
    : orders;

  return (
    <SecDelivery
      orders={visibleOrders}
      onMove={moveOrder}
      products={products}
      config={config}
      onAddOrder={addOrder}
      vertical={vertical}
    />
  );
}
