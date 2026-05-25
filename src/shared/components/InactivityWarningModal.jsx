import { useEffect, useRef, useState } from "react";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { T } from "../../constants/theme";

/**
 * Modal que advierte al usuario que su sesión está a punto de expirar.
 *
 * Props:
 *  - remainingMs : número de milisegundos hasta el logout forzado
 *  - onStay      : callback cuando el usuario pulsa "Seguir conectado"
 *  - onLogout    : callback para cerrar sesión inmediatamente
 */
export function InactivityWarningModal({ remainingMs, onStay, onLogout }) {
  const [secs, setSecs] = useState(Math.ceil((remainingMs || 120000) / 1000));
  const intervalRef = useRef(null);

  useEffect(() => {
    setSecs(Math.ceil((remainingMs || 120000) / 1000));
  }, [remainingMs]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecs(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const mins = Math.floor(secs / 60);
  const ss   = secs % 60;
  const countdown = mins > 0
    ? `${mins}:${String(ss).padStart(2, "0")} min`
    : `${secs} seg`;

  // Porcentaje para el arco de progreso
  const totalSecs = Math.ceil((remainingMs || 120000) / 1000);
  const pct = secs / totalSecs; // 1 → 0
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  const urgentColor = secs <= 30 ? T.red : secs <= 60 ? T.amber : T.coral;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(10,22,40,.65)",
          backdropFilter: "blur(3px)",
          zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn .2s ease",
        }}
      >
        <div
          style={{
            background: T.white,
            borderRadius: 20,
            padding: "36px 32px",
            width: "min(92vw, 400px)",
            boxShadow: "0 24px 60px rgba(0,0,0,.22)",
            textAlign: "center",
            animation: "scaleIn .22s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Barra de urgencia superior */}
          <div
            style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg, ${urgentColor}, ${urgentColor}88)`,
              transition: "background .5s",
            }}
          />

          {/* Ícono animado con arco de cuenta regresiva */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ position: "relative", width: 72, height: 72 }}>
              <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                {/* Track */}
                <circle
                  cx="36" cy="36" r={radius}
                  fill="none" stroke={T.border} strokeWidth="4"
                />
                {/* Progress */}
                <circle
                  cx="36" cy="36" r={radius}
                  fill="none"
                  stroke={urgentColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 1s linear, stroke .5s" }}
                />
              </svg>
              <div
                style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Clock size={26} color={urgentColor} style={{ transition: "color .5s" }} />
              </div>
            </div>
          </div>

          {/* Título */}
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8 }}>
            ¿Sigues ahí?
          </div>

          <div style={{ fontSize: 13, color: T.mid, lineHeight: 1.6, marginBottom: 6 }}>
            Tu sesión se cerrará automáticamente por inactividad en
          </div>

          {/* Countdown */}
          <div
            style={{
              fontSize: 32, fontWeight: 900, color: urgentColor,
              fontVariantNumeric: "tabular-nums",
              marginBottom: 24,
              transition: "color .5s",
            }}
          >
            {countdown}
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onLogout}
              style={{
                flex: 1, padding: "10px 0",
                borderRadius: 10, border: `1.5px solid ${T.border}`,
                background: "transparent", color: T.mid,
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "background .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>

            <button
              onClick={onStay}
              style={{
                flex: 2, padding: "10px 0",
                borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${T.coral}, ${T.coralD})`,
                color: "#fff",
                fontSize: 13, fontWeight: 700,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: `0 4px 14px ${T.coral}44`,
                transition: "opacity .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <RefreshCw size={14} />
              Seguir conectado
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
