import { useCallback, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { PageLoader } from "../../shared/components/PageLoader";
import { InactivityWarningModal } from "../../shared/components/InactivityWarningModal";
import { useInactivityLogout } from "../../shared/hooks/useInactivityLogout";

export function AuthGuard(){
  const location   = useLocation();
  const navigate   = useNavigate();

  const user       = useAuthStore(s => s.user);
  const authChecked= useAuthStore(s => s.authChecked);
  const initAuth   = useAuthStore(s => s.initAuth);
  const logout     = useAuthStore(s => s.logout);

  const [showWarning,  setShowWarning]  = useState(false);
  const [remainingMs,  setRemainingMs]  = useState(0);

  useEffect(() => { initAuth(); }, [initAuth]);

  // ── Inactividad: forzar logout ────────────────────────────────────────────
  const handleWarn = useCallback((ms) => {
    setRemainingMs(ms);
    setShowWarning(true);
  }, []);

  const handleAutoLogout = useCallback(async () => {
    setShowWarning(false);
    await logout();
    navigate("/login", { replace: true, state: { reason: "inactivity" } });
  }, [logout, navigate]);

  const handleResume = useCallback(() => {
    setShowWarning(false);
  }, []);

  const { resetTimers } = useInactivityLogout({
    onWarn:   handleWarn,
    onLogout: handleAutoLogout,
    onResume: handleResume,
    enabled:  !!user, // solo activo cuando hay sesión iniciada
  });

  const handleStay = useCallback(() => {
    setShowWarning(false);
    resetTimers();
  }, [resetTimers]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!authChecked) return <PageLoader label="Verificando sesión…" />;
  if (!user)        return <Navigate to="/login" replace state={{ from: location }} />;

  return (
    <>
      <Outlet />
      {showWarning && (
        <InactivityWarningModal
          remainingMs={remainingMs}
          onStay={handleStay}
          onLogout={handleAutoLogout}
        />
      )}
    </>
  );
}
