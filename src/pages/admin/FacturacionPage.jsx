import { SecFacturacion } from "../../features/admin/billing/SecFacturacion";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function FacturacionPage(){
  const user = useAuthStore(s => s.user);
  const billing = useAdminStore(s => s.billing);
  const setBilling = useAdminStore(s => s.setBilling);
  const config = useAdminStore(s => s.config);
  const showToast = useAdminStore(s => s.showToast);
  return <SecFacturacion billing={billing} setBilling={setBilling} user={user} configName={config.name} showToast={showToast}/>;
}
