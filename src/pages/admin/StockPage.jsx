import { SecStock } from "../../features/admin/stock/SecStock";
import { useAdminStore } from "../../stores/useAdminStore";

export default function StockPage(){
  const products = useAdminStore(s => s.products);
  const updateProduct = useAdminStore(s => s.updateProduct);
  return <SecStock products={products} onUpdate={updateProduct}/>;
}
