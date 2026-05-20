import { useState, useEffect } from "react";
import {
  Copy,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Btn, Field, Modal } from "../../../shared/components";
import {
  createStaffUser,
  deleteStaffUser,
  loadStaffMembers,
  resetStaffPassword,
} from "../../../services/staff.service";

const ROLE_LABELS = { delivery: "Solo Pedidos" };

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function InlineIcon({ icon: Icon, size = 14, color = "currentColor" }) {
  return <Icon size={size} color={color} strokeWidth={2.35} style={{ flexShrink: 0, verticalAlign: "-2px" }} />;
}

function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      style={{
        background: copied ? T.greenL : T.bg,
        border: `1px solid ${copied ? T.green : T.border}`,
        borderRadius: 8,
        padding: "5px 10px",
        fontSize: 11,
        fontWeight: 700,
        color: copied ? T.green : T.mid,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "all .2s",
      }}
    >
      <InlineIcon icon={Copy} size={12} color={copied ? T.green : T.mid} />
      {copied ? "Copiado" : label}
    </button>
  );
}

export function SecEquipo({ ownerId, showToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [creds, setCreds] = useState(null); // { email, password } after creation

  const [form, setForm] = useState({ name: "", email: "" });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Load staff members
  useEffect(() => {
    if (!ownerId) return;
    setLoading(true);
    loadStaffMembers(ownerId).then(({ data, error }) => {
      if (error) console.error("loadStaffMembers:", error);
      else setMembers(data);
      setLoading(false);
    });
  }, [ownerId]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    const tempPwd = randomPassword();
    const { userId, error } = await createStaffUser(ownerId, form, tempPwd);
    setSaving(false);
    if (error) {
      showToast?.("❌ " + error.message, "error");
      return;
    }
    const newMember = {
      id: userId,
      name: form.name,
      email: form.email,
      staff_role: "delivery",
      created_at: new Date().toISOString(),
    };
    setMembers((m) => [newMember, ...m]);
    setForm({ name: "", email: "" });
    setShowModal(false);
    setCreds({ email: form.email, password: tempPwd });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este operador? Perderá acceso inmediatamente.")) return;
    setDeletingId(id);
    const { error } = await deleteStaffUser(id);
    setDeletingId(null);
    if (error) {
      showToast?.("❌ " + error.message, "error");
      return;
    }
    setMembers((m) => m.filter((x) => x.id !== id));
    showToast?.("Operador eliminado", "warn");
  };

  const handleReset = async (member) => {
    setResettingId(member.id);
    const newPwd = randomPassword();
    const { error } = await resetStaffPassword(member.id, newPwd);
    setResettingId(null);
    if (error) {
      showToast?.("❌ " + error.message, "error");
      return;
    }
    setCreds({ email: member.email, password: newPwd });
  };

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 22,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: T.coralL,
              border: `1px solid ${T.coral}22`,
              color: T.coral,
              borderRadius: 999,
              padding: "5px 10px",
              marginBottom: 9,
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            <InlineIcon icon={Users} size={13} />
            Equipo
          </div>
          <h2 style={{ fontSize: 25, lineHeight: 1.1, fontWeight: 900, color: T.text, letterSpacing: "-.45px" }}>
            Operadores
          </h2>
          <p style={{ color: T.mid, fontSize: 13, marginTop: 6, lineHeight: 1.45 }}>
            Usuarios con acceso limitado solo al módulo de pedidos.
          </p>
        </div>
        <Btn icon={Plus} onClick={() => setShowModal(true)}>
          Nuevo operador
        </Btn>
      </div>

      {/* Info card */}
      <Card
        style={{
          marginBottom: 20,
          background: `linear-gradient(135deg,${T.blue}08,${T.blue}03)`,
          border: `1px solid ${T.blue}22`,
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: T.blue + "18",
            color: T.blue,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={18} strokeWidth={2.3} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 4 }}>
            ¿Qué puede hacer un operador?
          </div>
          <div style={{ fontSize: 12, color: T.mid, lineHeight: 1.6 }}>
            Solo puede ver y gestionar el <strong>módulo de pedidos</strong>: mover pedidos entre estados, agregar pedidos manuales y ver el historial. No tiene acceso a productos, diseño, configuración ni facturación.
          </div>
        </div>
      </Card>

      {/* Members list */}
      {loading ? (
        <div style={{ display: "grid", placeItems: "center", padding: "60px 0", color: T.mid }}>
          <Loader2 size={24} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : members.length === 0 ? (
        <Card
          style={{
            textAlign: "center",
            padding: "50px 20px",
            border: `2px dashed ${T.border}`,
            background: "transparent",
            boxShadow: "none",
          }}
        >
          <Users size={40} color={T.light} strokeWidth={1.5} style={{ margin: "0 auto 12px" }} />
          <div style={{ color: T.mid, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
            Sin operadores aún
          </div>
          <div style={{ color: T.light, fontSize: 12, marginBottom: 18 }}>
            Crea el primer operador para que pueda gestionar los pedidos de tu negocio.
          </div>
          <Btn icon={Plus} onClick={() => setShowModal(true)}>
            Nuevo operador
          </Btn>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {members.map((m) => (
            <Card
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${T.coral},${T.coralD})`,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {(m.name || "?")[0].toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{m.name}</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 3,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 12, color: T.mid }}>{m.email}</span>
                  <span
                    style={{
                      background: T.greenL,
                      color: T.green,
                      borderRadius: 20,
                      padding: "1px 8px",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {ROLE_LABELS[m.staff_role] || m.staff_role}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => handleReset(m)}
                  disabled={resettingId === m.id}
                  title="Resetear contraseña"
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.mid,
                  }}
                >
                  {resettingId === m.id ? (
                    <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <KeyRound size={13} />
                  )}
                  Reset
                </button>

                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  title="Eliminar operador"
                  style={{
                    background: T.redL,
                    border: `1px solid ${T.red}22`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.red,
                  }}
                >
                  {deletingId === m.id ? (
                    <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Eliminar
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: crear operador */}
      {showModal && (
        <Modal onClose={() => !saving && setShowModal(false)}>
          <div style={{ padding: "22px 22px 18px" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, marginBottom: 4 }}>
              Nuevo operador
            </div>
            <p style={{ fontSize: 13, color: T.mid, marginBottom: 20, lineHeight: 1.5 }}>
              Se creará una cuenta con acceso solo al módulo de pedidos. Podrás compartir las credenciales manualmente.
            </p>

            <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
              <Field
                label="Nombre"
                value={form.name}
                onChange={(v) => setF("name", v)}
                placeholder="Ej. Carlos Ruiz"
              />
              <Field
                label="Correo electrónico"
                value={form.email}
                onChange={(v) => setF("email", v)}
                placeholder="operador@negocio.com"
                type="email"
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn v="ghost" onClick={() => setShowModal(false)} disabled={saving}>
                Cancelar
              </Btn>
              <Btn
                onClick={handleCreate}
                disabled={saving || !form.name.trim() || !form.email.trim()}
                icon={saving ? Loader2 : Plus}
              >
                {saving ? "Creando…" : "Crear operador"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: mostrar credenciales */}
      {creds && (
        <Modal onClose={() => setCreds(null)}>
          <div style={{ padding: "22px 22px 18px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: T.greenL,
                color: T.green,
                borderRadius: 999,
                padding: "5px 12px",
                fontSize: 11,
                fontWeight: 900,
                marginBottom: 14,
              }}
            >
              ✓ Operador creado
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, marginBottom: 6 }}>
              Credenciales de acceso
            </div>
            <p style={{ fontSize: 13, color: T.mid, marginBottom: 20, lineHeight: 1.5 }}>
              Copia y comparte estas credenciales de forma segura. La contraseña solo se muestra una vez.
            </p>

            <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
              {[
                { label: "URL de acceso", value: window.location.origin + "/login" },
                { label: "Correo", value: creds.email },
                { label: "Contraseña temporal", value: creds.password },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: T.light, fontWeight: 700, marginBottom: 2 }}>
                      {row.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: "monospace" }}>
                      {row.value}
                    </div>
                  </div>
                  <CopyBtn text={row.value} label="Copiar" />
                </div>
              ))}
            </div>

            <Btn onClick={() => setCreds(null)} style={{ width: "100%" }}>
              Listo, ya copié las credenciales
            </Btn>
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
