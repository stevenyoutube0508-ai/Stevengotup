import { SecDiseno } from "../../features/admin/design/SecDiseno";
import { useAdminStore } from "../../stores/useAdminStore";

export default function DisenioPage(){
  const config     = useAdminStore(s => s.config);
  const cats       = useAdminStore(s => s.cats);
  const products   = useAdminStore(s => s.products);
  const updateConfig = useAdminStore(s => s.updateConfig);
  return <SecDiseno config={config} cats={cats} products={products} onUpdate={updateConfig}/>;
}
