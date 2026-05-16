import { getVertical } from "../../constants/verticals";
import { SecCategorias } from "../../features/admin/categories/SecCategorias";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function CategoriasPage(){
  const user = useAuthStore(s => s.user);
  const cats = useAdminStore(s => s.cats);
  const products = useAdminStore(s => s.products);
  const branches = useAdminStore(s => s.branches);
  const addCat = useAdminStore(s => s.addCat);
  const updateCat = useAdminStore(s => s.updateCat);
  const deleteCat = useAdminStore(s => s.deleteCat);
  const vertical = getVertical(user?.businessType || "restaurant");
  return <SecCategorias cats={cats} products={products} onAdd={addCat} onUpdate={updateCat} onDelete={deleteCat} vertical={vertical} branches={branches}/>;
}
