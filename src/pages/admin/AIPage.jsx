import { SecAI } from "../../features/admin/ai/SecAI";
import { useAdminStore } from "../../stores/useAdminStore";

export default function AIPage(){
  const products = useAdminStore(s => s.products);
  const orders = useAdminStore(s => s.orders);
  const cats = useAdminStore(s => s.cats);
  const config = useAdminStore(s => s.config);
  const branches = useAdminStore(s => s.branches);
  const addProduct = useAdminStore(s => s.addProduct);
  const updateProduct = useAdminStore(s => s.updateProduct);
  return <SecAI products={products} orders={orders} cats={cats} config={config} branches={branches} onAddProduct={addProduct} onUpdateProduct={updateProduct}/>;
}
