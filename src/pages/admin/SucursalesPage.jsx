import { SecSucursales } from "../../features/admin/branches/SecSucursales";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function SucursalesPage(){
  const user = useAuthStore(s => s.user);
  const branches = useAdminStore(s => s.branches);
  const updateBranch = useAdminStore(s => s.updateBranch);
  const addBranch = useAdminStore(s => s.addBranch);
  return <SecSucursales branches={branches} onUpdateBranch={updateBranch} onAddBranch={addBranch} ownerId={user?.id} noCreate={true}/>;
}
