import { useState } from "react";
import { User, Save, KeyRound, CheckCircle2, Building2, Calendar } from "lucide-react";
import { T } from "../../constants/theme";
import { Card, Btn, Field, Tag, ChangePasswordModal } from "../../shared/components";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";
import { updateProfile } from "../../services/auth.service";

const AVATARS = [
  "👤","👩","👨","🧑‍💼","👩‍💼","👨‍💼","🧑‍🍳","👩‍🍳","👨‍🍳",
  "🧑‍💻","👩‍💻","👨‍💻","🦊","🐼","🦁","⭐","🚀","💎","🎯","🔥",
];

const PLAN_COLOR = { starter: T.blue, pro: T.violet, business: T.pink };

export default function PerfilPage() {
  const user      = useAuthStore(s => s.user);
  const setUser   = useAuthStore(s => s.setUser);
  const billing   = useAdminStore(s => s.billing);
  const showToast = useAdminStore(s => s.showToast);

  const [name,       setName]       = useState(user?.name  || "");
  const [title,      setTitle]      = useState(user?.title || "");
  const [avatar,     setAvatar]     = useState(user?.avatar || "👤");
  const [saving,     setSaving]     = useState(false);
  const [showPwModal,setShowPwModal]= useState(false);

  const plan      = billing?.plan || "pro";
  const planColor = PLAN_COLOR[plan] || T.coral;
  const expiresAt = (billing?.nextPayment || billing?.expiresAt)
    ? new Date(billing.nextPayment || billing.expiresAt).toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric" })
    : null;

  const save = async () => {
    if (!name.trim()) { showToast("El nombre no puede estar vacío", "error"); return; }
    setSaving(true);
    const { error } = await updateProfile({ name: name.trim(), title: title.trim(), avatar });
    setSaving(false);
    if (error) { showToast("❌ Error guardando perfil", "error"); return; }
    setUser({ ...user, name: name.trim(), title: title.trim(), avatar });
    showToast("✓ Perfil actualizado");
  };

  const isDirty = name !== (user?.name || "") || title !== (user?.title || "") || avatar !== (user?.avatar || "👤");

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.text }}>Mi perfil</h2>
        <p style={{ margin: "4px 0 0", color: T.light, fontSize: 13 }}>
          Actualiza tu nombre, título y avatar.
        </p>
      </div>

      {/* ── Avatar ──────────────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.mid, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".4px", fontSize: 11 }}>
          Avatar
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: `linear-gradient(135deg,${T.coral},${T.coralD})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, flexShrink: 0, boxShadow: `0 4px 14px ${T.coral}30`,
          }}>
            {avatar}
          </div>
          <div style={{ color: T.mid, fontSize: 12 }}>
            Elige un emoji para tu avatar
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {AVATARS.map(em => (
            <button
              key={em}
              onClick={() => setAvatar(em)}
              style={{
                width: 38, height: 38, borderRadius: 10, fontSize: 20,
                border: avatar === em ? `2px solid ${T.coral}` : `1.5px solid ${T.border}`,
                background: avatar === em ? T.coralL : T.bg,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .12s",
              }}
            >
              {em}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Info ────────────────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: T.mid, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".4px" }}>
          Información
        </div>
        <Field label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" style={{ marginBottom: 12 }} />
        <Field label="Cargo / descripción" value={title} onChange={setTitle} placeholder="ej. Dueño, Gerente, Admin…" />
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Btn onClick={save} disabled={saving || !isDirty} icon={isDirty ? Save : CheckCircle2}>
            {saving ? "Guardando…" : isDirty ? "Guardar cambios" : "Sin cambios"}
          </Btn>
        </div>
      </Card>

      {/* ── Seguridad ───────────────────────────────────────── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: T.mid, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".4px" }}>
          Seguridad
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Contraseña</div>
            <div style={{ fontSize: 12, color: T.light }}>Cambia tu contraseña de acceso al panel</div>
          </div>
          <Btn v="ghost" icon={KeyRound} onClick={() => setShowPwModal(true)}>
            Cambiar
          </Btn>
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, color: T.light }}>
            Correo: <strong style={{ color: T.text }}>{user?.email || "—"}</strong>
          </div>
        </div>
      </Card>

      {/* ── Plan ────────────────────────────────────────────── */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 11, color: T.mid, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".4px" }}>
          Suscripción
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Building2 size={16} color={planColor} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </div>
              {expiresAt && (
                <div style={{ fontSize: 11, color: T.light, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Calendar size={10} />
                  Vence {expiresAt}
                </div>
              )}
            </div>
          </div>
          <Tag style={{ background: planColor + "18", color: planColor, border: `1px solid ${planColor}30`, fontWeight: 800 }}>
            {plan.toUpperCase()}
          </Tag>
        </div>
      </Card>

      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
    </div>
  );
}
