import { SecEquipo } from "../../features/admin/team/SecEquipo";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function EquipoPage() {
  const user      = useAuthStore((s) => s.user);
  const showToast = useAdminStore((s) => s.showToast);
  const branches  = useAdminStore((s) => s.branches);

  return (
    <SecEquipo
      ownerId={user?.id}
      showToast={showToast}
      branches={branches}
    />
  );
}
