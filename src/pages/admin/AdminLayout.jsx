import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { T, STYLES } from "../../constants/theme";
import { getVertical } from "../../constants/verticals";
import { Btn, Toast } from "../../shared/components";
import { PageLoader } from "../../shared/components/PageLoader";
import { SuspendedScreen } from "../../features/customer/CustomerView";
import { AdminSidebar } from "../../shared/layout/AdminSidebar";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

const ROUTE_BY_ID = {
  home: "/admin/home",
  sucursales: "/admin/sucursales",
  productos: "/admin/productos",
  categorias: "/admin/categorias",
  stock: "/admin/stock",
  diseno: "/admin/diseno",
  banners: "/admin/banners",
  delivery: "/admin/delivery",
  informes: "/admin/informes",
  ai: "/admin/ai",
  facturacion: "/admin/facturacion",
};

const ID_BY_ROUTE = Object.fromEntries(
  Object.entries(ROUTE_BY_ID).map(([id, path]) => [path, id])
);

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const config = useAdminStore((s) => s.config);
  const billing = useAdminStore((s) => s.billing);
  const orders = useAdminStore((s) => s.orders);
  const dbLoaded = useAdminStore((s) => s.dbLoaded);
  const toast = useAdminStore((s) => s.toast);
  const sidebarOpen = useAdminStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAdminStore((s) => s.setSidebarOpen);
  const loadAdminData = useAdminStore((s) => s.loadAdminData);

  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData(user);
    }
  }, [user?.id, user?.role, loadAdminData]);

  const vertical = getVertical(user?.businessType || "restaurant");
  const active = ID_BY_ROUTE[location.pathname] || "home";
  const newOrders = orders.filter((o) => o.status === "pendiente").length;

  const isAdminSuspended =
    user?.role === "admin" &&
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) < new Date();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setSidebarOpen(false);
      navigate("/login", { replace: true });
    }
  };

  if (isAdminSuspended) {
    return (
      <SuspendedScreen
        onLogout={handleLogout}
        configName={config?.name}
      />
    );
  }

  if (!dbLoaded) {
    return <PageLoader label="Cargando tu negocio…" />;
  }

  const ADMIN_RESP_CSS = `
    .admin-sidebar{transition:transform .25s ease;z-index:99}
    .admin-content-pad{padding:24px 28px}
    .admin-topbar-name{display:flex;align-items:center;gap:10px}
    .admin-preview-panel{display:flex}
    .mob-hamburger{display:none!important}
    @media(max-width:768px){
      .admin-sidebar{position:fixed!important;top:0;left:0;height:100vh!important;transform:translateX(-100%)}
      .admin-sidebar.open{transform:translateX(0)!important}
      .mob-overlay{display:block!important}
      .mob-close-btn{display:flex!important}
      .mob-hamburger{display:flex!important}
      .admin-preview-panel{display:none!important}
      .admin-content-pad{padding:16px 14px}
      .admin-topbar-name{display:none!important}
      .hide-mob{display:none!important}
      .diseno-grid{grid-template-columns:1fr!important}
    }
    @media(max-width:480px){.admin-content-pad{padding:12px 10px}}
  `;

  const goToSection = (id) => {
    navigate(ROUTE_BY_ID[id] || "/admin/home");
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <style>{STYLES}</style>
      <style>{ADMIN_RESP_CSS}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
        <AdminSidebar
          active={active}
          onSelect={goToSection}
          billing={billing}
          newOrders={newOrders}
          user={user}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          vertical={vertical}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div
            style={{
              background: T.white,
              borderBottom: `1px solid ${T.border}`,
              padding: "11px 16px",
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
              <button
                className="mob-hamburger"
                onClick={toggleSidebar}
                style={{
                  background: "none",
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  width: 34,
                  height: 34,
                  cursor: "pointer",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <span style={{ display: "block", width: 16, height: 2, background: T.text, borderRadius: 2 }} />
                <span style={{ display: "block", width: 16, height: 2, background: T.text, borderRadius: 2 }} />
                <span style={{ display: "block", width: 16, height: 2, background: T.text, borderRadius: 2 }} />
              </button>

              <div className="admin-topbar-name">
                <span style={{ fontSize: 13, color: T.mid, fontWeight: 500 }}>
                  {vertical.icon} {config.name} · {config.city}
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: config.openStatus ? T.greenL : T.redL,
                    borderRadius: 20,
                    padding: "3px 10px",
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: config.openStatus ? T.green : T.red,
                      display: "inline-block",
                      animation: config.openStatus ? "pulse2 2s infinite" : "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: config.openStatus ? T.green : T.red,
                    }}
                  >
                    {config.openStatus ? "Abierto" : "Cerrado"}
                  </span>
                </div>
              </div>

              <span
                className="mob-hamburger"
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: T.text,
                  display: "none",
                }}
              >
                {config.name}
              </span>
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {newOrders > 0 && (
                <div
                  onClick={() => navigate("/admin/delivery")}
                  style={{
                    background: T.amberL,
                    border: "1px solid #fed7aa",
                    borderRadius: 20,
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#9a3412",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: T.amber,
                      animation: "pulse2 1s infinite",
                      display: "inline-block",
                    }}
                  />
                  {newOrders} nuevo{newOrders > 1 ? "s" : ""}
                </div>
              )}

              <Btn
                sm
                v="ghost"
                onClick={() => navigate("/admin/preview")}
                icon="🔗"
              >
                {vertical.labels.btn_view || "Ver catálogo"}
              </Btn>

              <Btn sm v="danger" onClick={handleLogout}>
                ⏻
              </Btn>
            </div>
          </div>

          <main className="admin-content-pad" style={{ flex: 1, overflowY: "auto" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}