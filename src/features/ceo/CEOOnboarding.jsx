import { useState } from "react";
import { T } from "../../constants/theme";
import { VERTICALS } from "../../constants/verticals";
import { fmtCOP, newId, todayStr } from "../../utils/format";
import { PLAN_MAP } from "../../constants/seed";
import { createAdminUser } from "../../services/ceo.service";
import {
  CheckCircle2, Mail, Store, User, Package, Calendar,
  Copy, KeyRound, AlertCircle, Loader2,
} from "lucide-react";
import { Card, Btn, Field } from "../../shared/components";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genTempPassword(businessName) {
  const slug = businessName.replace(/[^a-zA-Z]/g, "").slice(0, 3) || "biz";
  const upper = slug.charAt(0).toUpperCase();
  const lower = slug.slice(1).toLowerCase();
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${upper}${lower}${digits}!`;
}

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copiar"
      style={{
        background: copied ? T.greenL : T.bg,
        border: `1px solid ${copied ? T.green : T.border}`,
        borderRadius: 7,
        padding: "3px 9px",
        fontSize: 11,
        fontWeight: 700,
        color: copied ? T.green : T.mid,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexShrink: 0,
        transition: "all .15s",
      }}
    >
      <Copy size={11} />
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

const STEPS = [
  { n: 0, l: "Vertical" },
  { n: 1, l: "Datos" },
  { n: 2, l: "Plan" },
  { n: 3, l: "Confirmar" },
];

function Stepper({ step }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
      {STEPS.map((s, i) => (
        <div
          key={s.n}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {i > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 15,
                width: "50%",
                height: 2,
                background: step > s.n ? T.indigo : T.border,
              }}
            />
          )}
          {i < STEPS.length - 1 && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 15,
                width: "50%",
                height: 2,
                background: step > s.n ? T.indigo : T.border,
              }}
            />
          )}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: step >= s.n ? T.indigo : T.bg,
              border: `2px solid ${step >= s.n ? T.indigo : T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              color: step >= s.n ? "#fff" : T.mid,
              position: "relative",
              zIndex: 1,
              transition: "all .2s",
            }}
          >
            {step > s.n ? "✓" : s.n + 1}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: step >= s.n ? T.indigo : T.light,
              marginTop: 4,
            }}
          >
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pantalla de éxito con credenciales ──────────────────────────────────────

function SuccessScreen({ done, tempPassword, selV, onReset }) {
  return (
    <div
      style={{
        maxWidth: 520,
        margin: "0 auto",
        textAlign: "center",
        animation: "fadeUp .35s ease",
      }}
    >
      {/* Ícono */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: T.greenL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px",
        }}
      >
        <CheckCircle2 size={36} color={T.green} />
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 6 }}>
        ¡Cuenta creada!
      </h2>
      <p style={{ color: T.mid, fontSize: 13, marginBottom: 22 }}>
        La cuenta de <strong>{done.name}</strong> está activa y lista para usar.
      </p>

      {/* Credenciales de acceso */}
      <div
        style={{
          background: "#0f172a",
          borderRadius: 16,
          padding: "18px 20px",
          marginBottom: 18,
          textAlign: "left",
          border: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 14,
          }}
        >
          <KeyRound size={14} color="#94a3b8" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: ".5px" }}>
            CREDENCIALES DE ACCESO
          </span>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>
            USUARIO / EMAIL
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#1e293b",
              borderRadius: 9,
              padding: "9px 12px",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, wordBreak: "break-all" }}>
              {done.email}
            </span>
            <CopyBtn value={done.email} />
          </div>
        </div>

        {/* Contraseña temporal */}
        <div>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>
            CONTRASEÑA TEMPORAL
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#1e293b",
              borderRadius: 9,
              padding: "9px 12px",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: "#fbbf24",
                fontWeight: 800,
                fontFamily: "monospace",
                letterSpacing: ".5px",
              }}
            >
              {tempPassword}
            </span>
            <CopyBtn value={tempPassword} />
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            color: "#f59e0b",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <AlertCircle size={11} />
          Comparte estas credenciales con el negocio. Pídeles que cambien la contraseña al ingresar.
        </div>
      </div>

      {/* Resumen del negocio */}
      <Card style={{ marginBottom: 18, textAlign: "left" }}>
        {[
          [null, "Tipo de negocio", selV.name],
          [Store, "Negocio", done.name],
          [User, "Propietario", done.owner],
          [Mail, "Email", done.email],
          [Package, "Plan", PLAN_MAP[done.plan]?.label],
          [Calendar, "Próximo pago", done.nextPayment],
        ].map(([Ic, lb, vl]) => (
          <div
            key={lb}
            style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13 }}
          >
            <span style={{ color: T.mid, display: "flex", alignItems: "center", gap: 5 }}>
              {Ic && <Ic size={12} />}
              {lb}
            </span>
            <span style={{ color: T.text, fontWeight: 700 }}>{vl}</span>
          </div>
        ))}
      </Card>

      <div style={{ display: "flex", gap: 10 }}>
        <Btn full v="neutral" onClick={onReset}>
          Crear otro negocio
        </Btn>
        <Btn full onClick={onReset}>
          Ver en Clientes
        </Btn>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const INIT_FORM = {
  name: "",
  owner: "",
  email: "",
  cedula: "",
  phone: "",
  city: "",
  plan: "pro",
  businessType: "restaurant",
  logo: "🍽️",
  primaryColor: "#f97316",
  notes: "",
};

export function CEOOnboarding({ onAdd, showToast }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INIT_FORM);
  const [done, setDone] = useState(null);
  const [tempPassword, setTempPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const selV = VERTICALS[form.businessType] || VERTICALS.restaurant;
  const valid1 = form.name && form.owner && form.email && form.cedula && form.city;

  const reset = () => {
    setDone(null);
    setStep(0);
    setForm(INIT_FORM);
    setTempPassword("");
    setError("");
  };

  const create = async () => {
    setLoading(true);
    setError("");

    const pwd = genTempPassword(form.name);
    setTempPassword(pwd);

    const { userId, error: err } = await createAdminUser(form, pwd);

    setLoading(false);

    if (err) {
      const msg =
        err.message?.includes("already registered")
          ? "Este email ya tiene una cuenta registrada."
          : err.message || "Error al crear la cuenta. Intenta de nuevo.";
      setError(msg);
      return;
    }

    const r = {
      ...form,
      id: userId,
      status: "active",
      createdAt: todayStr(),
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      daysLeft: 30,
      mrr: PLAN_MAP[form.plan]?.price || 0,
      products: 0,
      orders: 0,
      coverImg: "",
    };

    onAdd(r);
    setDone(r);
    showToast(`✓ ${form.name} creado exitosamente`);
  };

  // ── Pantalla de éxito ──────────────────────────────────────
  if (done) {
    return (
      <SuccessScreen
        done={done}
        tempPassword={tempPassword}
        selV={selV}
        onReset={reset}
      />
    );
  }

  // ── Wizard ─────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp .35s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 4 }}>
          Nuevo cliente
        </h2>
        <p style={{ color: T.mid, fontSize: 13 }}>
          Crea la cuenta para cualquier tipo de negocio · Picku
        </p>
      </div>

      <Stepper step={step} />

      {/* ── STEP 0: Selección de vertical ── */}
      {step === 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 6 }}>
            ¿Qué tipo de negocio es el cliente?
          </div>
          <p style={{ color: T.mid, fontSize: 12, marginBottom: 16 }}>
            Selecciona el vertical para que la plataforma se adapte al idioma y flujo de ese negocio.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {Object.values(VERTICALS).map((v) => {
              const sel = form.businessType === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    set("businessType")(v.id);
                    set("logo")(v.emojis[0]);
                    set("primaryColor")(v.color);
                  }}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: `2px solid ${sel ? v.color : T.border}`,
                    background: sel ? v.color + "0e" : T.white,
                    cursor: "pointer",
                    transition: "all .18s",
                    boxShadow: sel ? `0 4px 16px ${v.color}28` : "none",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{v.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: sel ? v.color : T.text, marginBottom: 3 }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: 10, color: T.mid, lineHeight: 1.5 }}>{v.desc}</div>
                  {sel && (
                    <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {[v.labels.catalog, v.labels.order, v.labels.delivery].map((lb) => (
                        <span
                          key={lb}
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 10,
                            background: v.color + "20",
                            color: v.color,
                          }}
                        >
                          {lb}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={() => setStep(1)} style={{ background: selV.color }}>
              Continuar con {selV.name} →
            </Btn>
          </div>
        </div>
      )}

      {/* ── STEP 1: Info del negocio ── */}
      {step === 1 && (
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              padding: "10px 14px",
              background: selV.color + "10",
              border: `1px solid ${selV.color}30`,
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 20 }}>{selV.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: selV.color }}>{selV.name}</div>
              <div style={{ fontSize: 10, color: T.mid }}>
                {selV.labels.catalog} · {selV.labels.order}s
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 14 }}>
            📋 Información del negocio
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field
              label={`Nombre del ${selV.labels.branch} *`}
              value={form.name}
              onChange={set("name")}
              placeholder={`Ej: ${selV.name.split("/")[0].trim()} XYZ`}
              required
            />
            <Field
              label="Propietario *"
              value={form.owner}
              onChange={set("owner")}
              placeholder="Carlos Mejía"
              required
            />
            <Field
              label="Email *"
              value={form.email}
              onChange={set("email")}
              type="email"
              placeholder="carlos@negocio.co"
              required
            />
            <Field
              label="Cédula / NIT *"
              value={form.cedula}
              onChange={set("cedula")}
              placeholder="900.123.456-7"
              required
            />
            <Field
              label="Teléfono"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+57 300 111 2222"
            />
            <Field
              label="Ciudad *"
              value={form.city}
              onChange={set("city")}
              placeholder="Cali"
              required
            />
          </div>

          <Field
            label="Notas internas"
            value={form.notes}
            onChange={set("notes")}
            textarea
            rows={2}
            placeholder="Cómo llegó, potencial de upgrade…"
          />

          <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
            <Btn v="neutral" onClick={() => setStep(0)}>← Atrás</Btn>
            <Btn disabled={!valid1} onClick={() => setStep(2)}>Siguiente →</Btn>
          </div>
        </Card>
      )}

      {/* ── STEP 2: Plan y branding ── */}
      {step === 2 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 16 }}>
            📦 Plan y branding
          </div>

          {/* Selector de plan */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {Object.entries(PLAN_MAP).map(([k, v]) => (
              <button
                key={k}
                onClick={() => set("plan")(k)}
                style={{
                  padding: "14px",
                  borderRadius: 12,
                  border: `2px solid ${form.plan === k ? v.color : T.border}`,
                  background: form.plan === k ? v.color + "12" : T.bg,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all .15s",
                }}
              >
                <div style={{ fontWeight: 800, color: v.color, fontSize: 14 }}>{v.label}</div>
                <div style={{ fontWeight: 900, fontSize: 16, color: T.text, marginTop: 3 }}>
                  {fmtCOP(v.price)}
                  <span style={{ fontSize: 10, color: T.mid, fontWeight: 400 }}>/mes</span>
                </div>
              </button>
            ))}
          </div>

          {/* Branding */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {/* Emoji / Logo */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.mid, display: "block", marginBottom: 6 }}>
                EMOJI / LOGO
              </label>
              <input
                value={form.logo}
                onChange={(e) => set("logo")(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: T.bg,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 10,
                  fontSize: 28,
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
                {selV.emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => set("logo")(e)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: `1.5px solid ${form.logo === e ? selV.color : T.border}`,
                      background: form.logo === e ? selV.color + "20" : "transparent",
                      fontSize: 17,
                      cursor: "pointer",
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color principal */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.mid, display: "block", marginBottom: 6 }}>
                COLOR PRINCIPAL
              </label>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 8 }}>
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => set("primaryColor")(e.target.value)}
                  style={{
                    width: 48,
                    height: 40,
                    borderRadius: 10,
                    border: `1px solid ${T.border}`,
                    background: "none",
                    cursor: "pointer",
                  }}
                />
                <input
                  value={form.primaryColor}
                  onChange={(e) => set("primaryColor")(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    background: T.bg,
                    border: `1.5px solid ${T.border}`,
                    borderRadius: 10,
                    color: T.text,
                    fontSize: 12,
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {[selV.color, "#f97316", "#dc2626", "#8b5cf6", "#059669", "#2563eb", "#db2777", "#d97706"].map((c) => (
                  <div
                    key={c}
                    onClick={() => set("primaryColor")(c)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: c,
                      cursor: "pointer",
                      border: form.primaryColor === c ? `3px solid ${T.text}` : "3px solid transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <Btn v="neutral" onClick={() => setStep(1)}>← Atrás</Btn>
            <Btn onClick={() => setStep(3)}>Siguiente →</Btn>
          </div>
        </Card>
      )}

      {/* ── STEP 3: Confirmar ── */}
      {step === 3 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 16 }}>
            ✅ Confirmar y crear
          </div>

          {/* Badge de vertical */}
          <div
            style={{
              background: selV.color + "0a",
              border: `1px solid ${selV.color}25`,
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>{selV.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: selV.color }}>{selV.name}</div>
              <div style={{ fontSize: 11, color: T.mid }}>
                {selV.labels.catalog} · {selV.labels.order}s · {selV.labels.delivery}
              </div>
            </div>
          </div>

          {/* Resumen de datos */}
          <div style={{ background: T.bg, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["🏪", "Negocio", form.name],
                ["👤", "Propietario", form.owner],
                ["📧", "Email", form.email],
                ["🪪", "Cédula / NIT", form.cedula],
                ["📞", "Teléfono", form.phone || "—"],
                ["📍", "Ciudad", form.city],
                ["📦", "Plan", `${PLAN_MAP[form.plan]?.label} — ${fmtCOP(PLAN_MAP[form.plan]?.price)}/mes`],
              ].map(([ic, lb, vl]) => (
                <div key={lb} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.light, marginBottom: 2 }}>
                    {ic} {lb}
                  </div>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{vl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview de branding */}
          <div
            style={{
              height: 70,
              borderRadius: 12,
              background: "#111009",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              gap: 12,
              border: `1px solid ${T.border}`,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: form.primaryColor + "28",
                border: `2px solid ${form.primaryColor}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {form.logo}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>
                {form.name || "Nombre"}
              </div>
              <div style={{ color: form.primaryColor, fontSize: 10 }}>
                {selV.name} · {form.city}
              </div>
            </div>
          </div>

          {/* Aviso contraseña temporal */}
          <div
            style={{
              background: "#fefce8",
              border: "1px solid #fde68a",
              borderRadius: 10,
              padding: "9px 13px",
              fontSize: 12,
              color: "#92400e",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <KeyRound size={12} />
            Se generará una contraseña temporal que podrás compartir con el negocio.
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "9px 13px",
                fontSize: 12,
                color: "#991b1b",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Btn v="neutral" onClick={() => setStep(2)} disabled={loading}>
              ← Atrás
            </Btn>
            <Btn full onClick={create} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Creando cuenta…
                </span>
              ) : (
                "✅ Crear cuenta ahora"
              )}
            </Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
