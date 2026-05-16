import { SecDiseno } from "../../features/admin/design/SecDiseno";
import { useAdminStore } from "../../stores/useAdminStore";

export default function DisenioPage(){
  const config = useAdminStore(s => s.config);
  const updateConfig = useAdminStore(s => s.updateConfig);
  return <SecDiseno config={config} onUpdate={updateConfig}/>;
}
