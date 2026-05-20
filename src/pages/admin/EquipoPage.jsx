import { SecEquipo } from "../../features/admin/team/SecEquipo";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function EquipoPage() {
  const user = useAuthStore((s) => s.user);
  const showToast = useAdminStore((s) => s.showToast);
  return <SecEquipo ownerId={user?.id} showToast={showToast} />;
}
