import { SecInformes } from "../../features/admin/reports/SecInformes";
import { useAdminStore } from "../../stores/useAdminStore";

export default function InformesPage(){
  const products = useAdminStore(s => s.products);
  const orders   = useAdminStore(s => s.orders);
  return <SecInformes products={products} orders={orders}/>;
}
