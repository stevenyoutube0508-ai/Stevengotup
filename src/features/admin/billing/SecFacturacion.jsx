import { useEffect, useRef, useState } from "react";
import billingPlanIcon from "../../../assets/billing_plan.svg";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  FileCheck2,
  FileText,
  Landmark,
  Loader2,
  ReceiptText,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  WalletCards,
  XCircle,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import { T } from "../../../constants/theme";
import { BANK_INFO, PLANS_CATALOG } from "../../../constants/seed";
import { fmtCOP } from "../../../utils/format";
import { Card, Btn, Tag, Modal } from "../../../shared/components";

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

function SoftIcon({ icon: Icon, color = T.coral, size = 18, box = 40, style }) {
  return (
    <div
      style={{
        width: box,
        height: box,
        borderRadius: Math.round(box / 3),
        background: `${color}15`,
        color,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <Icon size={size} strokeWidth={2.35} />
    </div>
  );
}

function BillingPlanIcon({ src, alt, size = 46 }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        filter: "drop-shadow(0 8px 14px rgba(15,23,42,.14))",
      }}
    />
  );
}

function StatusTag({ status, notes }) {
  if (status === "pending") {
    return (
      <Tag color={T.amber}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <InlineIcon icon={Clock3} size={12} />
          En revisión
        </span>
      </Tag>
    );
  }

  if (status === "approved") {
    return (
      <Tag color={T.green}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <InlineIcon icon={CheckCircle2} size={12} />
          Aprobado
        </span>
      </Tag>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Tag color={T.red}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <InlineIcon icon={XCircle} size={12} />
          Rechazado
        </span>
      </Tag>

      {notes && (
        <div
          style={{
            fontSize: 10,
            color: T.mid,
            lineHeight: 1.35,
            maxWidth: 220,
          }}
        >
          {notes}
        </div>
      )}
    </div>
  );
}

function CopyBox({ label, value, onCopy }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: T.light,
          fontWeight: 900,
          textTransform: "uppercase",
          marginBottom: 4,
          letterSpacing: ".35px",
        }}
      >
        {label}
      </div>

      <button
        type="button"
        onClick={() => onCopy(value)}
        style={{
          width: "100%",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          fontSize: 13,
          fontWeight: 800,
          color: T.text,
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "8px 10px",
          cursor: "pointer",
          letterSpacing: ".2px",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "—"}
        </span>

        <Copy size={13} strokeWidth={2.4} color={T.mid} />
      </button>
    </div>
  );
}

export function SecFacturacion({
  billing,
  setBilling,
  user,
  configName,
  showToast,
}) {
  const [payReqs, setPayReqs] = useState([]);
  const [modal, setModal] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selBank, setSelBank] = useState(0);
  const [copied, setCopied] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    supabase
      .from("payment_requests")
      .select("id,plan,amount,status,created_at,ceo_notes,reviewed_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPayReqs(data);
      });
  }, [user]);

  const plan = billing.plan;
  const pc = { starter: T.blue, pro: T.coral, business: T.pink }[plan] || T.coral;
  const pn =
    { starter: "Starter", pro: "Pro", business: "Business" }[plan] || "Pro";

  const pendingReq = payReqs.find((r) => r.status === "pending");

  const copyValue = async (value) => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setCopied(String(value || ""));
      setTimeout(() => setCopied(""), 1600);
      showToast?.("Copiado al portapapeles");
    } catch {
      showToast?.("No se pudo copiar", "err");
    }
  };

  const resetModal = () => {
    setModal(null);
    setReceipt(null);
    setNotes("");
    setSelBank(0);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 3 * 1024 * 1024) {
      alert("El archivo no puede superar 3 MB.");
      return;
    }

    const rd = new FileReader();
    rd.onload = (ev) =>
      setReceipt({
        data: ev.target.result,
        name: f.name,
      });

    rd.readAsDataURL(f);
  };

  const submitPayment = async () => {
    if (!receipt) {
      showToast?.("Sube el comprobante de pago", "err");
      return;
    }

    setUploading(true);

    const { error } = await supabase.from("payment_requests").insert({
      owner_id: user.id,
      restaurant_name: configName || "Restaurante",
      plan: modal.id,
      amount: modal.price,
      method: "transfer",
      status: "pending",
      receipt_data: receipt.data,
      receipt_name: receipt.name,
      notes,
    });

    setUploading(false);

    if (error) {
      showToast?.("Error al enviar. Intenta de nuevo.", "err");
      return;
    }

    const newReq = {
      id: Date.now() + "",
      plan: modal.id,
      amount: modal.price,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    setPayReqs((v) => [newReq, ...v]);
    setBilling({ ...billing, plan: billing.plan });
    resetModal();

    showToast?.("Comprobante enviado. Te avisaremos cuando sea aprobado.");
  };

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <style>
        {`
          @media(max-width:860px){
            .billing-header{
              flex-direction:column!important;
            }

            .billing-current{
              flex-direction:column!important;
              align-items:flex-start!important;
            }

            .billing-plans{
              grid-template-columns:1fr!important;
            }

            .billing-history-row,
            .billing-history-head{
              grid-template-columns:1fr!important;
              gap:8px!important;
            }

            .billing-modal-grid{
              grid-template-columns:1fr!important;
            }

            .billing-bank-grid{
              grid-template-columns:1fr!important;
            }
          }
        `}
      </style>

      <div
        className="billing-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: `${pc}15`,
              border: `1px solid ${pc}22`,
              color: pc,
              borderRadius: 999,
              padding: "5px 10px",
              marginBottom: 9,
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            <InlineIcon icon={WalletCards} size={13} />
            Suscripción
          </div>

          <h2
            style={{
              fontSize: 25,
              lineHeight: 1.1,
              fontWeight: 900,
              color: T.text,
              letterSpacing: "-.45px",
            }}
          >
            Mi suscripción
          </h2>

          <p
            style={{
              color: T.mid,
              fontSize: 13,
              marginTop: 6,
              lineHeight: 1.45,
            }}
          >
            Administra tu plan, pagos por transferencia y solicitudes en revisión.
          </p>
        </div>
      </div>

      <Card
        style={{
          background: `linear-gradient(135deg,${pc}16,${pc}05)`,
          border: `1.5px solid ${pc}30`,
          marginBottom: pendingReq ? 12 : 20,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -55,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: `${pc}12`,
          }}
        />

        <div
          className="billing-current"
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: T.mid,
                marginBottom: 5,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".5px",
              }}
            >
              Plan actual
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: T.text,
                letterSpacing: "-.4px",
              }}
            >
              Plan {pn}
            </div>

            <div
              style={{
                fontSize: 13,
                color: T.mid,
                marginTop: 6,
                lineHeight: 1.45,
              }}
            >
              Próxima factura: <strong>{billing.nextPayment}</strong> ·{" "}
              <strong>{fmtCOP(billing.amount)}/mes</strong>
            </div>
          </div>

          <div
  style={{
    width: 90,
    height: 90,
    borderRadius: 20,
    background: `${pc}12`,
    border: `1px solid ${pc}24`,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  }}
>
  <BillingPlanIcon
    src={billingPlanIcon}
    alt="Plan de facturación"
    size={70}
  />
</div>
        </div>
      </Card>

      {pendingReq && (
        <div
          style={{
            background: T.amberL,
            border: `1.5px solid ${T.amber}40`,
            borderRadius: 15,
            padding: "13px 16px",
            marginBottom: 20,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <SoftIcon icon={Clock3} color={T.amber} box={38} size={18} />

          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 13,
                color: T.amber,
                marginBottom: 3,
              }}
            >
              Pago en revisión
            </div>

            <div
              style={{
                fontSize: 12,
                color: T.text,
                lineHeight: 1.5,
              }}
            >
              Enviaste un comprobante para el plan{" "}
              <strong>
                {pendingReq.plan?.charAt(0).toUpperCase() +
                  pendingReq.plan?.slice(1)}
              </strong>{" "}
              — {fmtCOP(pendingReq.amount)}/mes. Te avisaremos cuando sea
              aprobado. Tiempo estimado: máximo 24 h hábiles.
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 15,
          fontWeight: 900,
          color: T.text,
          marginBottom: 14,
        }}
      >
        <InlineIcon icon={Sparkles} size={17} color={pc} />
        Planes disponibles
      </div>

      <div
        className="billing-plans"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {PLANS_CATALOG.map((p) => {
          const isCurrent = p.id === plan;

          return (
            <Card
              key={p.id}
              style={{
                border: `2px solid ${isCurrent ? p.color : T.border}`,
                position: "relative",
                padding: "22px 17px 17px",
                boxShadow: isCurrent
                  ? `0 12px 28px ${p.color}18`
                  : "0 8px 22px rgba(15,23,42,.04)",
              }}
            >
              {p.popular && !isCurrent && (
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: T.coral,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "4px 12px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <InlineIcon icon={Star} size={11} />
                  Más popular
                </div>
              )}

              {isCurrent && (
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: p.color,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "4px 12px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <InlineIcon icon={ShieldCheck} size={11} />
                  Tu plan actual
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: T.text,
                      marginBottom: 4,
                    }}
                  >
                    {p.name}
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: p.color,
                      lineHeight: 1,
                    }}
                  >
                    {fmtCOP(p.price)}
                    <span
                      style={{
                        fontSize: 11,
                        color: T.mid,
                        fontWeight: 600,
                      }}
                    >
                      /mes
                    </span>
                  </div>
                </div>

                <SoftIcon icon={CreditCard} color={p.color} box={44} size={20} />
              </div>

              <div style={{ display: "grid", gap: 7 }}>
                {p.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      fontSize: 12,
                      color: T.mid,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 7,
                      lineHeight: 1.4,
                    }}
                  >
                    <InlineIcon icon={Check} size={14} color={T.green} />
                    {f}
                  </div>
                ))}
              </div>

              {!isCurrent && !pendingReq && (
                <Btn
                  full
                  v="ghost"
                  style={{ marginTop: 15 }}
                  onClick={() => setModal(p)}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    Cambiar a {p.name}
                    <InlineIcon icon={ArrowRight} size={14} />
                  </span>
                </Btn>
              )}

              {!isCurrent && pendingReq && (
                <div
                  style={{
                    marginTop: 15,
                    fontSize: 11,
                    color: T.amber,
                    fontWeight: 800,
                    background: T.amberL,
                    borderRadius: 12,
                    padding: "9px 10px",
                    textAlign: "center",
                  }}
                >
                  Pago pendiente de revisión
                </div>
              )}

              {isCurrent && (
                <div
                  style={{
                    marginTop: 15,
                    padding: "9px 10px",
                    background: `${p.color}15`,
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 900,
                    color: p.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <InlineIcon icon={CheckCircle2} size={14} />
                  Plan activo
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card style={{ overflow: "hidden", padding: 0 }}>
        <div
          style={{
            padding: "15px 18px",
            borderBottom: `1px solid ${T.border}`,
            fontWeight: 900,
            fontSize: 14,
            color: T.text,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <InlineIcon icon={ReceiptText} size={16} color={pc} />
          Historial de pagos
        </div>

        {payReqs.length === 0 ? (
          <div
            style={{
              padding: "34px 20px",
              textAlign: "center",
              color: T.light,
              fontSize: 13,
            }}
          >
            <SoftIcon
              icon={FileText}
              color={T.light}
              box={52}
              size={24}
              style={{ margin: "0 auto 12px" }}
            />
            Sin historial de pagos aún.
          </div>
        ) : (
          <div>
            <div
              className="billing-history-head"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1.2fr",
                gap: 0,
                padding: "10px 16px",
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              {["Fecha", "Plan", "Monto", "Estado"].map((h) => (
                <div
                  key={h}
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: T.mid,
                    textTransform: "uppercase",
                    letterSpacing: ".35px",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {payReqs.map((r, i) => (
              <div
                key={r.id || i}
                className="billing-history-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1.2fr",
                  gap: 0,
                  padding: "13px 16px",
                  borderBottom: `1px solid ${T.border}`,
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 12, color: T.mid }}>
                  {r.created_at?.split("T")[0] || "—"}
                </div>

                <div>
                  <Tag
                    color={
                      { starter: T.blue, pro: T.coral, business: T.pink }[
                        r.plan
                      ] || T.mid
                    }
                    sm
                  >
                    {r.plan?.charAt(0).toUpperCase() + r.plan?.slice(1) || "—"}
                  </Tag>
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: T.text,
                  }}
                >
                  {fmtCOP(r.amount)}
                </div>

                <div>
                  <StatusTag status={r.status} notes={r.ceo_notes} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modal && (
        <Modal
          title={`Cambiar a Plan ${modal.name}`}
          icon={
            <CreditCard
              size={20}
              strokeWidth={2.4}
              style={{ verticalAlign: "-4px" }}
            />
          }
          onClose={resetModal}
        >
          <div
            style={{
              background: `linear-gradient(135deg,${modal.color}15,${modal.color}05)`,
              border: `1.5px solid ${modal.color}30`,
              borderRadius: 16,
              padding: 16,
              marginBottom: 18,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: T.mid,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: ".35px",
                  marginBottom: 4,
                }}
              >
                Nuevo plan
              </div>

              <div
                style={{
                  fontSize: 21,
                  fontWeight: 900,
                  color: T.text,
                }}
              >
                Plan {modal.name}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: modal.color,
                  fontWeight: 900,
                  marginTop: 3,
                }}
              >
                {fmtCOP(modal.price)}/mes
              </div>
            </div>

            <SoftIcon icon={Sparkles} color={modal.color} box={50} size={23} />
          </div>

          <div
            style={{
              fontSize: 12,
              color: T.mid,
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: 13,
              padding: "11px 14px",
              marginBottom: 16,
              lineHeight: 1.7,
              whiteSpace: "pre-line",
            }}
          >
            {BANK_INFO.instructions}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                fontWeight: 900,
                color: T.text,
                marginBottom: 9,
              }}
            >
              <InlineIcon icon={Landmark} size={16} color={T.coral} />
              Datos para transferencia
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 11 }}>
              {BANK_INFO.banks.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelBank(i)}
                  style={{
                    flex: 1,
                    padding: "9px 8px",
                    borderRadius: 12,
                    border: `2px solid ${selBank === i ? T.coral : T.border}`,
                    background: selBank === i ? T.coralL : T.white,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: selBank === i ? 900 : 700,
                    color: selBank === i ? T.coral : T.mid,
                    transition: "all .15s",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <InlineIcon icon={Banknote} size={14} />
                  {b.name}
                </button>
              ))}
            </div>

            <div
              style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                className="billing-bank-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  ["Titular", BANK_INFO.titular],
                  ["Cédula", BANK_INFO.cedula],
                  [
                    BANK_INFO.banks[selBank].type,
                    BANK_INFO.banks[selBank].number,
                  ],
                  ["Referencia", configName || "Tu restaurante"],
                ].map(([k, v]) => (
                  <CopyBox key={k} label={k} value={v} onCopy={copyValue} />
                ))}
              </div>

              {copied && (
                <div
                  style={{
                    marginTop: 10,
                    color: T.green,
                    fontSize: 11,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <InlineIcon icon={CheckCircle2} size={13} />
                  Copiado: {copied}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                fontWeight: 900,
                color: T.text,
                marginBottom: 9,
              }}
            >
              <InlineIcon icon={UploadCloud} size={16} color={T.coral} />
              Comprobante de pago <span style={{ color: T.red }}>*</span>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFile}
              style={{ display: "none" }}
            />

            {!receipt ? (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${T.border}`,
                  borderRadius: 15,
                  padding: "26px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: T.bg,
                  transition: "border .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.coral;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border;
                }}
              >
                <SoftIcon
                  icon={UploadCloud}
                  color={T.coral}
                  box={48}
                  size={23}
                  style={{ margin: "0 auto 10px" }}
                />

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: T.text,
                  }}
                >
                  Sube tu comprobante
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: T.mid,
                    marginTop: 4,
                  }}
                >
                  Imagen o PDF · Máx. 3 MB
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: T.greenL,
                  border: `1.5px solid ${T.green}40`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    minWidth: 0,
                  }}
                >
                  <SoftIcon icon={FileCheck2} color={T.green} box={36} size={17} />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: T.green,
                      }}
                    >
                      Comprobante listo
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: T.mid,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 240,
                      }}
                    >
                      {receipt.name}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReceipt(null)}
                  style={{
                    width: 30,
                    height: 30,
                    background: "rgba(255,255,255,.7)",
                    border: `1px solid ${T.green}22`,
                    borderRadius: 10,
                    color: T.mid,
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Trash2 size={14} strokeWidth={2.4} />
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: T.mid,
                marginBottom: 7,
              }}
            >
              Notas adicionales
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Pagado el día de hoy desde Bancolombia..."
              rows={2}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                fontSize: 12,
                color: T.text,
                background: T.bg,
                resize: "none",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                outline: "none",
              }}
            />
          </div>

          <div
            style={{
              background: T.amberL,
              border: `1px solid ${T.amber}30`,
              borderRadius: 13,
              padding: "10px 12px",
              color: T.amber,
              fontSize: 11,
              fontWeight: 800,
              lineHeight: 1.45,
              marginBottom: 16,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <InlineIcon icon={AlertCircle} size={15} />
            Tu plan cambiará cuando el comprobante sea aprobado por el equipo.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn v="ghost" onClick={resetModal}>
              Cancelar
            </Btn>

            <Btn full onClick={submitPayment} disabled={uploading || !receipt}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                {uploading ? (
                  <Loader2
                    size={15}
                    strokeWidth={2.4}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                ) : (
                  <Send size={15} strokeWidth={2.4} />
                )}
                {uploading ? "Enviando…" : "Enviar comprobante"}
              </span>
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── ADMIN: INFORMES ─────────────────────────────────────── */