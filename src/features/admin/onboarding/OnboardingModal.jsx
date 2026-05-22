import { useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Store, FolderOpen, Package, Paintbrush, Share2,
  CheckCircle2, Circle, X, Rocket, ChevronRight,
} from "lucide-react";
import { T } from "../../../constants/theme";
import { Btn } from "../../../shared/components";
import { useAdminStore } from "../../../stores/useAdminStore";
import { useAuthStore }  from "../../../stores/useAuthStore";

const STORAGE_KEY     = (uid) => `picki_ob_${uid}`;
const DESIGN_KEY      = (uid) => `picki_ob_design_${uid}`;
const SHARE_KEY       = (uid) => `picki_ob_share_${uid}`;

/** Devuelve true si el usuario ya cerró el onboarding. */
export function isOnboardingDismissed(uid) {
  try { return !!localStorage.getItem(STORAGE_KEY(uid)); } catch { return false; }
}

/** Marca el onboarding como cerrado para este usuario. */
function dismiss(uid) {
  try { localStorage.setItem(STORAGE_KEY(uid), "1"); } catch {}
}

/**
 * Panel flotante de bienvenida / checklist.
 * Se muestra en la esquina inferior-derecha hasta que el admin lo cierre
 * o complete todos los pasos.
 *
 * Props:
 *  onDismiss — callback cuando el usuario lo cierra
 */
export function OnboardingModal({ onDismiss }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const user       = useAuthStore(s => s.user);
  const products   = useAdminStore(s => s.products);
  const cats       = useAdminStore(s => s.cats);
  const config     = useAdminStore(s => s.config);

  const uid = user?.id || "";

  // I-14: marcar "Diseño" como hecho cuando el usuario visita /admin/diseno
  // y "Compartir" cuando visita /admin/sucursales
  useEffect(() => {
    if (!uid) return;
    const p = location.pathname;
    if (p === "/admin/diseno")      try { localStorage.setItem(DESIGN_KEY(uid), "1"); } catch {}
    if (p === "/admin/sucursales")  try { localStorage.setItem(SHARE_KEY(uid),  "1"); } catch {}
  }, [location.pathname, uid]);

  // I-14: "Diseño" done si fue a /admin/diseno O si personalizó colores/cover
  const designDone = useMemo(() => {
    try { if (localStorage.getItem(DESIGN_KEY(uid))) return true; } catch {}
    const defaultColor = "#f97316";
    return !!(config?.coverImg || (config?.primaryColor && config.primaryColor !== defaultColor));
  }, [uid, config]);

  // I-14: "Compartir" done si fue a /admin/sucursales
  const shareDone = useMemo(() => {
    try { return !!localStorage.getItem(SHARE_KEY(uid)); } catch { return false; }
  }, [uid, location.pathname]);

  const steps = useMemo(() => [
    {
      id:    "config",
      icon:  Store,
      label: "Configura tu negocio",
      desc:  "Nombre, ciudad, logo y horarios",
      done:  !!(config?.name && config.name !== "Mi Negocio" && config.name !== ""),
      route: "/admin/home",
    },
    {
      id:    "category",
      icon:  FolderOpen,
      label: "Crea tu primera categoría",
      desc:  "Organiza tu catálogo por secciones",
      done:  cats.length > 0,
      route: "/admin/categorias",
    },
    {
      id:    "product",
      icon:  Package,
      label: "Agrega tu primer producto",
      desc:  "El primero de muchos 🚀",
      done:  products.length > 0,
      route: "/admin/productos",
    },
    {
      id:    "design",
      icon:  Paintbrush,
      label: "Personaliza tu catálogo",
      desc:  "Colores, banner y tema visual",
      done:  designDone,
      route: "/admin/diseno",
    },
    {
      id:    "share",
      icon:  Share2,
      label: "Comparte tu catálogo",
      desc:  "Descarga el QR de tu sucursal",
      done:  shareDone,
      route: "/admin/sucursales",
    },
  ], [config, cats, products, designDone, shareDone]);

  const doneCount  = steps.filter(s => s.done).length;
  const pct        = Math.round((doneCount / steps.length) * 100);
  const nextStep   = steps.find(s => !s.done);

  const handleDismiss = () => {
    dismiss(user?.id);
    onDismiss?.();
  };

  const goTo = (route) => {
    navigate(route);
    // No cerrar — que siga viendo el progreso
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 200,
      width: 320,
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: 20,
      boxShadow: "0 20px 60px rgba(15,23,42,.18), 0 0 0 1px rgba(15,23,42,.04)",
      overflow: "hidden",
      animation: "fadeUp .35s ease",
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${T.coral}, ${T.pink})`,
        padding: "16px 16px 12px",
        position: "relative",
      }}>
        <button
          onClick={handleDismiss}
          style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(255,255,255,.25)", border: "none",
            borderRadius: 8, color: "#fff", width: 26, height: 26,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={13} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Rocket size={16} color="#fff" />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>¡Bienvenido, {user?.name?.split(" ")[0] || "admin"}!</div>
            <div style={{ color: "rgba(255,255,255,.8)", fontSize: 11 }}>Completa tu configuración inicial</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ background: "rgba(255,255,255,.25)", borderRadius: 99, height: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "#fff",
            width: `${pct}%`,
            transition: "width .4s ease",
          }} />
        </div>
        <div style={{ color: "rgba(255,255,255,.9)", fontSize: 11, fontWeight: 700, marginTop: 5 }}>
          {doneCount} de {steps.length} pasos completados
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: "10px 12px" }}>
        {steps.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => !step.done && goTo(step.route)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 6px", borderRadius: 10, cursor: step.done ? "default" : "pointer",
                marginBottom: 2,
                transition: "background .12s",
              }}
              onMouseEnter={e => { if (!step.done) e.currentTarget.style.background = T.bg; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              {/* Status icon */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: step.done ? T.greenL : T.bg,
                border: `1.5px solid ${step.done ? T.green : T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {step.done
                  ? <CheckCircle2 size={14} color={T.green} />
                  : <Icon size={13} color={T.mid} />
                }
              </div>
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: step.done ? 500 : 700,
                  color: step.done ? T.light : T.text,
                  textDecoration: step.done ? "line-through" : "none",
                }}>
                  {step.label}
                </div>
                {!step.done && (
                  <div style={{ fontSize: 10, color: T.light }}>{step.desc}</div>
                )}
              </div>
              {!step.done && <ChevronRight size={13} color={T.light} />}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {nextStep && (
        <div style={{ padding: "0 12px 12px" }}>
          <button
            onClick={() => goTo(nextStep.route)}
            style={{
              width: "100%", padding: "9px 14px",
              background: `linear-gradient(135deg, ${T.coral}, ${T.pink})`,
              border: "none", borderRadius: 12, color: "#fff",
              fontSize: 12, fontWeight: 800, cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <nextStep.icon size={13} />
            Ir a: {nextStep.label}
          </button>
        </div>
      )}

      {doneCount === steps.length && (
        <div style={{ padding: "0 12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>🎉</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.green }}>¡Todo listo!</div>
          <div style={{ fontSize: 11, color: T.light, marginBottom: 10 }}>Tu negocio está configurado.</div>
          <Btn full v="ghost" onClick={handleDismiss}>Cerrar</Btn>
        </div>
      )}
    </div>
  );
}
