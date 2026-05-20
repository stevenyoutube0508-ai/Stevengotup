import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { T, STYLES } from "../../constants/theme";
import { Btn, Toast } from "../../shared/components";
import { PageLoader } from "../../shared/components/PageLoader";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";
import { getVertical } from "../../constants/verticals";

export default function StaffLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const config = useAdminStore((s) => s.config);
  const toast = useAdminStore((s) => s.toast);
  const dbLoaded = useAdminStore((s) => s.dbLoaded);
  const loadAdminData = useAdminStore((s) => s.loadAdminData);

  // Load the owner's data using owner_id from the staff profile
  useEffect(() => {
    if (user?.role === "staff" && user?.ownerId) {
      loadAdminData({ id: user.ownerId });
    }
  }, [user?.id, user?.role, user?.ownerId, loadAdminData]);

  const vertical = getVertical("restaurant");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (!dbLoaded) {
    return <PageLoader label="Cargando negocio…" />;
  }

  return (
    <>
      <style>{STYLES}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div
          style={{
            background: T.white,
            borderBottom: `1px solid ${T.border}`,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
            boxShadow: T.sh,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Staff badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: T.blue + "12",
                border: `1px solid ${T.blue}22`,
                borderRadius: 20,
                padding: "4px 10px",
              }}
            >
              <ShieldCheck size={12} color={T.blue} strokeWidth={2.5} />
              <span style={{ fontSize: 11, fontWeight: 800, color: T.blue }}>
                Operador
              </span>
            </div>

            <span style={{ fontSize: 13, color: T.mid, fontWeight: 600 }}>
              {vertical.icon} {config?.name || "Negocio"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: T.light, fontWeight: 600 }}>
              {user?.name}
            </span>
            <Btn sm v="danger" icon={LogOut} onClick={handleLogout} />
          </div>
        </div>

        {/* Content */}
        <main style={{ flex: 1, padding: "20px 16px", maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
