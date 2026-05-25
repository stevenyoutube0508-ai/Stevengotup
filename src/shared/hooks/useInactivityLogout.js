import { useEffect, useRef, useCallback } from "react";

/**
 * Cierra la sesión automáticamente tras un período de inactividad.
 *
 * Flujo:
 *  1. El usuario no interactúa por WARN_AT_MS  → se llama a onWarn(remainingMs)
 *  2. Si en los siguientes WARNING_MS no hay actividad → se llama a onLogout()
 *  3. Cualquier evento de usuario reinicia el contador.
 *
 * @param {object} opts
 * @param {(remainingMs: number) => void} opts.onWarn    - Callback cuando queda poco tiempo
 * @param {() => void}                   opts.onLogout  - Callback para hacer logout
 * @param {() => void}                   opts.onResume  - Callback cuando el usuario retoma actividad
 * @param {boolean}                      [opts.enabled] - Activar/desactivar el hook (default: true)
 */

// ── Tiempos configurables ──────────────────────────────────────────────────
const INACTIVITY_MS  = 4 * 60 * 60 * 1000;   // 4 horas sin actividad → logout
const WARNING_MS     = 2 * 60 * 1000;         // aviso 2 minutos antes del logout
const WARN_AT_MS     = INACTIVITY_MS - WARNING_MS; // ~3h 58m → mostrar aviso

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];

export function useInactivityLogout({ onWarn, onLogout, onResume, enabled = true }) {
  const warnTimerRef   = useRef(null);
  const logoutTimerRef = useRef(null);
  const warnedRef      = useRef(false); // evita llamar onWarn múltiples veces

  const clearTimers = useCallback(() => {
    clearTimeout(warnTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    warnTimerRef.current   = null;
    logoutTimerRef.current = null;
  }, []);

  const resetTimers = useCallback(() => {
    const wasWarned = warnedRef.current;
    clearTimers();
    warnedRef.current = false;

    if (!enabled) return;

    // Si el aviso ya estaba visible y el usuario volvió a moverse → notificar
    if (wasWarned && onResume) onResume();

    warnTimerRef.current = setTimeout(() => {
      warnedRef.current = true;
      onWarn(WARNING_MS);
    }, WARN_AT_MS);

    logoutTimerRef.current = setTimeout(() => {
      onLogout();
    }, INACTIVITY_MS);
  }, [enabled, onWarn, onLogout, onResume, clearTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    ACTIVITY_EVENTS.forEach(ev =>
      window.addEventListener(ev, resetTimers, { passive: true })
    );
    resetTimers(); // arrancar los timers desde ya

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach(ev =>
        window.removeEventListener(ev, resetTimers)
      );
    };
  }, [enabled, resetTimers, clearTimers]);

  /** Permite que los botones del modal reinicien manualmente los timers */
  return { resetTimers };
}
