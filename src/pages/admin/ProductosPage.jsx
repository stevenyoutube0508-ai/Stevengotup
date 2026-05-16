import { getVertical } from "../../constants/verticals";
import { SecProductos } from "../../features/admin/products/SecProductos";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function ProductosPage(){
  const user = useAuthStore(s => s.user);
  const products = useAdminStore(s => s.products);
  const cats = useAdminStore(s => s.cats);
  const branches = useAdminStore(s => s.branches);
  const addProduct = useAdminStore(s => s.addProduct);
  const updateProduct = useAdminStore(s => s.updateProduct);
  const deleteProduct = useAdminStore(s => s.deleteProduct);
  const vertical = getVertical(user?.businessType || "restaurant");
  return <SecProductos products={products} cats={cats} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} vertical={vertical} branches={branches}/>;
}
