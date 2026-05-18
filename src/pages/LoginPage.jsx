import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Lock,
  Mail,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { T, STYLES } from "../constants/theme";
import { LogoIcon } from "../shared/components/Logo";
import fondoLogin from "../assets/fondo_login.png";

function InlineIcon({ icon: Icon, size = 14, color = "currentColor", style }) {
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={2.35}
      style={{
        flexShrink: 0,
        verticalAlign: "-2px",
        ...style,
      }}
    />
  );
}

function FloatingFeature({ icon: Icon, label, style }) {
  return (
    <div
      style={{
        position: "absolute",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        background: "rgba(255,255,255,.72)",
        border: "1px solid rgba(255,255,255,.76)",
        borderRadius: 18,
        boxShadow: "0 18px 40px rgba(15,23,42,.10)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        color: T.text,
        fontSize: 12,
        fontWeight: 900,
        ...style,
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 11,
          display: "grid",
          placeItems: "center",
          background: T.coralL,
          color: T.coral,
          flexShrink: 0,
        }}
      >
        <Icon size={15} strokeWidth={2.4} />
      </span>
      {label}
    </div>
  );
}

function MiniDashboardRow({ icon: Icon, title, value, color, width = "70%" }) {
  return (
    <div
      style={{
        height: 58,
        borderRadius: 18,
        background: "rgba(255,255,255,.72)",
        border: "1px solid rgba(255,255,255,.78)",
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "0 13px",
        boxShadow: "0 12px 26px rgba(15,23,42,.055)",
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: `${color}15`,
          color,
          flexShrink: 0,
        }}
      >
        <Icon size={16} strokeWidth={2.45} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: T.text,
            marginBottom: 6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>

        <div
          style={{
            height: 7,
            width,
            borderRadius: 999,
            background: `${color}25`,
          }}
        />
      </div>

      <div
        style={{
          fontSize: 12,
          color,
          fontWeight: 950,
          flexShrink: 0,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const loginBackgroundUrl = "";

  const submit = async () => {
    if (loading) return;

    setErr("");

    if (!email.trim() || !pass.trim()) {
      setErr("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      setErr("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profile) {
      onLogin({
        ...data.user,
        role: profile.role,
        name: profile.name,
        title: profile.title,
        avatar: profile.avatar,
        subscriptionExpiresAt: profile.subscription_expires_at || null,
        businessType: profile.business_type || "restaurant",
      });
    } else {
      setErr("Perfil no encontrado.");
      setLoading(false);
    }
  };

  const inputBase = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px 13px 42px",
    background: T.bg,
    border: `1.5px solid ${T.border}`,
    borderRadius: 14,
    color: T.text,
    fontSize: 14,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    outline: "none",
    transition: "border-color .2s, box-shadow .2s, background .2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,.34) 38%, rgba(255,255,255,.76) 68%, rgba(255,255,255,.94) 100%), url(${loginBackgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>
        {STYLES}
        {`
          @media(max-width:1040px){
            .login-layout {
              grid-template-columns: 1fr !important;
              max-width: 520px !important;
            }

            .login-visual {
              display: none !important;
            }

            .login-card-side {
              padding: 0 !important;
            }
          }

          @media(max-width:520px){
            .login-panel {
              padding: 22px !important;
              border-radius: 24px !important;
            }

            .login-logo-title {
              font-size: 28px !important;
            }

            .login-root {
              padding: 14px !important;
            }
          }
        `}
      </style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 12% 18%, rgba(249,115,22,.10), transparent 32%), radial-gradient(circle at 86% 80%, rgba(139,92,246,.10), transparent 30%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="login-layout"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1160,
          display: "grid",
          gridTemplateColumns: "1.08fr 440px",
          gap: 24,
          alignItems: "center",
          animation: "fadeUp .45s ease",
        }}
      >
        <div
          className="login-visual"
          style={{
            minHeight: 620,
            borderRadius: 36,
            overflow: "hidden",
            position: "relative",
            background:
              "linear-gradient(135deg, rgba(255,255,255,.74), rgba(255,255,255,.28))",
            border: "1px solid rgba(255,255,255,.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow:
              "0 28px 80px rgba(15,23,42,.13), inset 0 0 0 1px rgba(255,255,255,.42)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 20% 16%, rgba(255,255,255,.68), transparent 30%), radial-gradient(circle at 78% 72%, rgba(249,115,22,.13), transparent 34%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: -110,
              bottom: -110,
              width: 390,
              height: 390,
              borderRadius: "50%",
              background: "rgba(249,115,22,.10)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: 44,
              top: 42,
              right: 44,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,.70)",
                border: "1px solid rgba(255,255,255,.78)",
                backdropFilter: "blur(12px)",
                fontSize: 12,
                color: T.coral,
                fontWeight: 950,
                marginBottom: 18,
                boxShadow: "0 10px 24px rgba(15,23,42,.055)",
              }}
            >
              <InlineIcon icon={Sparkles} size={14} />
              Plataforma omnicanal
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 45,
                lineHeight: 1.02,
                letterSpacing: "-1.55px",
                fontWeight: 950,
                maxWidth: 520,
                color: T.navy,
              }}
            >
              Digitaliza, vende y gestiona tu negocio desde un solo lugar.
            </h1>

            <p
              style={{
                marginTop: 18,
                color: T.mid,
                fontSize: 15,
                lineHeight: 1.72,
                maxWidth: 470,
                fontWeight: 650,
              }}
            >
              Catálogos digitales, pedidos QR, pickup, delivery, pagos y
              operación para restaurantes, tiendas, servicios y comercios.
            </p>
          </div>

          <FloatingFeature
            icon={Store}
            label="Catálogo digital"
            style={{ left: 521, bottom: 460 }}
          />

          <FloatingFeature
            icon={QrCode}
            label="QR inteligente"
            style={{ right: 80, top: 172 }}
          />

          <FloatingFeature
            icon={Truck}
            label="Delivery & pickup"
            style={{ right: 56, bottom: 520 }}
          />

          <FloatingFeature
            icon={BarChart3}
            label="Analytics"
            style={{ left: 525, bottom: 325 }}
          />

          <div
            style={{
              position: "absolute",
              left: 56,
              right: 56,
              bottom: 24,
              borderRadius: 30,
              background: "rgba(255,255,255,.44)",
              border: "1px solid rgba(255,255,255,.70)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              boxShadow: "0 24px 60px rgba(15,23,42,.09)",
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", gap: 9 }}>
                {["#f87171", "#fbbf24", "#34d399"].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c,
                      boxShadow: `0 4px 10px ${c}55`,
                    }}
                  />
                ))}
              </div>

              <div
                style={{
                  fontSize: 10,
                  fontWeight: 950,
                  color: T.light,
                  letterSpacing: ".5px",
                  textTransform: "uppercase",
                }}
              >
                Web dashboard
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <MiniDashboardRow
                icon={ShoppingBag}
                title="Pedidos unificados"
                value="+24%"
                color={T.coral}
                width="76%"
              />

              <MiniDashboardRow
                icon={Truck}
                title="Delivery y pickup"
                value="Live"
                color="#059669"
                width="58%"
              />

              <MiniDashboardRow
                icon={BarChart3}
                title="Reportes en tiempo real"
                value="AI"
                color="#2563eb"
                width="68%"
              />
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: T.mid,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              <ArrowRight size={13} strokeWidth={2.5} color={T.coral} />
              Todo conectado en una sola plataforma web.
            </div>
          </div>
        </div>

        <div
          className="login-card-side"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px 0",
          }}
        >
          <div style={{ width: "100%", maxWidth: 440 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 4,
                  filter: `drop-shadow(0 10px 28px ${T.coral}35)`,
                }}
              >
                <LogoIcon size={70} />
              </div>

              <div
                className="login-logo-title"
                style={{
                  fontWeight: 950,
                  fontSize: 32,
                  letterSpacing: "-.7px",
                  lineHeight: 1,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                <span style={{ color: T.navy }}>picku</span>
                <span style={{ color: T.coral }}>.ai</span>
              </div>

              <div
                style={{
                  color: T.light,
                  fontSize: 11,
                  marginTop: 9,
                  letterSpacing: "2px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                Digital Business Platform
              </div>
            </div>

            <div
              className="login-panel"
              style={{
                background: "rgba(255,255,255,.90)",
                border: `1px solid rgba(255,255,255,.76)`,
                borderRadius: 28,
                padding: 32,
                boxShadow:
                  "0 24px 70px rgba(15,23,42,.12), 0 0 0 1px rgba(15,23,42,.03)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
              }}
            >
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: T.coralL,
                    color: T.coral,
                    borderRadius: 999,
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 900,
                    marginBottom: 12,
                  }}
                >
                  <InlineIcon icon={ShieldCheck} size={13} />
                  Acceso seguro
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 950,
                    color: T.text,
                    letterSpacing: "-.45px",
                  }}
                >
                  Bienvenido de nuevo
                </h2>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: T.mid,
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  Ingresa para administrar tu catálogo, pedidos, sucursales y
                  operación.
                </p>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: T.mid,
                    display: "block",
                    marginBottom: 7,
                    letterSpacing: ".5px",
                    textTransform: "uppercase",
                  }}
                >
                  Correo
                </label>

                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    strokeWidth={2.4}
                    style={{
                      position: "absolute",
                      left: 15,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: T.light,
                      pointerEvents: "none",
                    }}
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (err) setErr("");
                    }}
                    placeholder="tu@email.co"
                    autoComplete="email"
                    style={inputBase}
                    onFocus={(e) => {
                      e.target.style.borderColor = T.coral;
                      e.target.style.boxShadow = `0 0 0 4px ${T.coral}14`;
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = T.border;
                      e.target.style.boxShadow = "none";
                      e.target.style.background = T.bg;
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: T.mid,
                    display: "block",
                    marginBottom: 7,
                    letterSpacing: ".5px",
                    textTransform: "uppercase",
                  }}
                >
                  Contraseña
                </label>

                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    strokeWidth={2.4}
                    style={{
                      position: "absolute",
                      left: 15,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: T.light,
                      pointerEvents: "none",
                    }}
                  />

                  <input
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={(e) => {
                      setPass(e.target.value);
                      if (err) setErr("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                    autoComplete="current-password"
                    style={{
                      ...inputBase,
                      paddingRight: 44,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = T.coral;
                      e.target.style.boxShadow = `0 0 0 4px ${T.coral}14`;
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = T.border;
                      e.target.style.boxShadow = "none";
                      e.target.style.background = T.bg;
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: T.mid,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {showPass ? (
                      <EyeOff size={16} strokeWidth={2.4} />
                    ) : (
                      <Eye size={16} strokeWidth={2.4} />
                    )}
                  </button>
                </div>
              </div>

              {err && (
                <div
                  style={{
                    background: T.redL,
                    border: `1px solid ${T.red}30`,
                    borderRadius: 14,
                    padding: "11px 13px",
                    fontSize: 13,
                    color: T.red,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontWeight: 700,
                    lineHeight: 1.45,
                  }}
                >
                  <AlertTriangle size={16} strokeWidth={2.4} />
                  {err}
                </div>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: `linear-gradient(135deg,${T.coral},${T.pink})`,
                  border: "none",
                  borderRadius: 15,
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: `0 12px 28px ${T.coral}38`,
                  transition: "opacity .15s, transform .15s, box-shadow .15s",
                  opacity: loading ? 0.72 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = `0 16px 34px ${T.coral}45`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 12px 28px ${T.coral}38`;
                }}
              >
                {loading ? (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: "2.5px solid rgba(255,255,255,.4)",
                      borderTopColor: "#fff",
                      animation: "spin .7s linear infinite",
                    }}
                  />
                ) : (
                  <Lock size={16} strokeWidth={2.4} />
                )}
                {loading ? "Verificando…" : "Ingresar"}
              </button>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: `1px solid ${T.border}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => (window.location.href = "?menu")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    color: T.mid,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = T.coral;
                    e.currentTarget.style.borderColor = `${T.coral}33`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = T.bg;
                    e.currentTarget.style.color = T.mid;
                    e.currentTarget.style.borderColor = T.border;
                  }}
                >
                  <Eye size={15} strokeWidth={2.4} />
                  Ver menú del cliente demo
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 7,
                color: T.light,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={13} strokeWidth={2.4} />
              Acceso protegido por Supabase Auth
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ADMIN SIDEBAR ───────────────────────────────────────── */