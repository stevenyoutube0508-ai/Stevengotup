import React, { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "./guards/AuthGuard";
import { RoleGuard } from "./guards/RoleGuard";
import { RootRedirect } from "./guards/RootRedirect";
import { PageLoader } from "../shared/components/PageLoader";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";

const LoginRoute = React.lazy(() => import("../pages/LoginRoute"));
const MenuPage = React.lazy(() => import("../pages/public/MenuPage"));

const AdminLayout = React.lazy(() => import("../pages/admin/AdminLayout"));
const HomePage = React.lazy(() => import("../pages/admin/HomePage"));
const ProductosPage = React.lazy(() => import("../pages/admin/ProductosPage"));
const CategoriasPage = React.lazy(() => import("../pages/admin/CategoriasPage"));
const StockPage = React.lazy(() => import("../pages/admin/StockPage"));
const DisenioPage = React.lazy(() => import("../pages/admin/DisenioPage"));
const BannersPage = React.lazy(() => import("../pages/admin/BannersPage"));
const DeliveryPage = React.lazy(() => import("../pages/admin/DeliveryPage"));
const SucursalesPage = React.lazy(() => import("../pages/admin/SucursalesPage"));
const InformesPage = React.lazy(() => import("../pages/admin/InformesPage"));
const AIPage = React.lazy(() => import("../pages/admin/AIPage"));
const FacturacionPage = React.lazy(() => import("../pages/admin/FacturacionPage"));
const MenuPreviewPage = React.lazy(() => import("../pages/admin/MenuPreviewPage"));
const EquipoPage      = React.lazy(() => import("../pages/admin/EquipoPage"));
const ReservasPage    = React.lazy(() => import("../pages/admin/ReservasPage"));

const StaffLayout       = React.lazy(() => import("../pages/staff/StaffLayout"));
const StaffDeliveryPage = React.lazy(() => import("../pages/staff/StaffDeliveryPage"));

const CEOLayout = React.lazy(() => import("../pages/ceo/CEOLayout"));
const DashPage = React.lazy(() => import("../pages/ceo/DashPage"));
const RestaurantesPage = React.lazy(() => import("../pages/ceo/RestaurantesPage"));
const OnboardingPage = React.lazy(() => import("../pages/ceo/OnboardingPage"));
const PagosPage = React.lazy(() => import("../pages/ceo/PagosPage"));
const SoportePage = React.lazy(() => import("../pages/ceo/SoportePage"));
const PlataformaPage = React.lazy(() => import("../pages/ceo/PlataformaPage"));

function lazyPage(Component){
  return <Suspense fallback={<PageLoader label="Cargando sección…" />}><Component /></Suspense>;
}

function lazyLayout(Component){
  return <ErrorBoundary><Suspense fallback={<PageLoader label="Cargando panel…" />}><Component /></Suspense></ErrorBoundary>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: lazyPage(LoginRoute),
  },
  {
    path: "/menu",
    element: lazyPage(MenuPage),
  },
  {
    // URL que se imprime en el QR: /menu/<userId>
    // Opcionalmente ?b=<branchId> para pre-seleccionar sucursal
    path: "/menu/:userId",
    element: lazyPage(MenuPage),
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard role="admin" />,
        children: [
          {
            path: "/admin",
            element: lazyLayout(AdminLayout),
            children: [
              { index: true, element: <Navigate to="/admin/home" replace /> },
              { path: "home", element: lazyPage(HomePage) },
              { path: "productos", element: lazyPage(ProductosPage) },
              { path: "categorias", element: lazyPage(CategoriasPage) },
              { path: "stock", element: lazyPage(StockPage) },
              { path: "diseno", element: lazyPage(DisenioPage) },
              { path: "banners", element: lazyPage(BannersPage) },
              { path: "delivery", element: lazyPage(DeliveryPage) },
              { path: "sucursales", element: lazyPage(SucursalesPage) },
              { path: "informes", element: lazyPage(InformesPage) },
              { path: "ai", element: lazyPage(AIPage) },
              { path: "facturacion", element: lazyPage(FacturacionPage) },
              { path: "preview",    element: lazyPage(MenuPreviewPage) },
              { path: "equipo",     element: lazyPage(EquipoPage) },
              { path: "reservas",   element: lazyPage(ReservasPage) },
            ],
          },
        ],
      },
      {
        element: <RoleGuard role="ceo" />,
        children: [
          {
            path: "/ceo",
            element: lazyLayout(CEOLayout),
            children: [
              { index: true, element: <Navigate to="/ceo/dashboard" replace /> },
              { path: "dashboard", element: lazyPage(DashPage) },
              { path: "restaurantes", element: lazyPage(RestaurantesPage) },
              { path: "onboarding", element: lazyPage(OnboardingPage) },
              { path: "pagos", element: lazyPage(PagosPage) },
              { path: "soporte", element: lazyPage(SoportePage) },
              { path: "plataforma", element: lazyPage(PlataformaPage) },
            ],
          },
        ],
      },
      {
        element: <RoleGuard role="staff" />,
        children: [
          {
            path: "/staff",
            element: lazyLayout(StaffLayout),
            children: [
              { index: true, element: <Navigate to="/staff/delivery" replace /> },
              { path: "delivery", element: lazyPage(StaffDeliveryPage) },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
