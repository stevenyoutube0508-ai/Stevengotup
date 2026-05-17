import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FolderOpen,
  Globe2,
  ImageIcon,
  Link2,
  Megaphone,
  MousePointerClick,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Timer,
  Trash2,
  X,
} from "lucide-react";

import { T } from "../../../constants/theme";
import { Card, Btn, Field, Toggle, PhotoInput } from "../../../shared/components";

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

function SoftIcon({ icon: Icon, color = T.coral, size = 18, box = 38, style }) {
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

function InfoChip({ icon, children, color = T.coral, bg }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10,
        fontWeight: 900,
        background: bg || `${color}14`,
        color,
        borderRadius: 999,
        padding: "4px 8px",
        lineHeight: 1,
      }}
    >
      <InlineIcon icon={icon} size={11} />
      {children}
    </span>
  );
}

function OptionCard({ active, icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "11px 9px",
        borderRadius: 14,
        border: `2px solid ${active ? T.coral : T.border}`,
        background: active ? T.coralL : T.bg,
        cursor: "pointer",
        textAlign: "left",
        transition: "all .15s ease",
        minHeight: 78,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontSize: 12,
          fontWeight: 900,
          color: active ? T.coral : T.text,
          marginBottom: 4,
        }}
      >
        <InlineIcon icon={icon} size={15} />
        {title}
      </div>

      <div
        style={{
          fontSize: 10,
          color: T.mid,
          lineHeight: 1.35,
          fontWeight: 600,
        }}
      >
        {subtitle}
      </div>
    </button>
  );
}

function PopupPreview({ popup }) {
  const hasImage = Boolean(popup.img);
  const bg = popup.bgColor || "#7c3aed";

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 22,
        overflow: "hidden",
        background: bg,
        minHeight: 280,
        position: "relative",
        boxShadow: "0 18px 45px rgba(15,23,42,.18)",
        border: "1px solid rgba(255,255,255,.22)",
      }}
    >
      {hasImage && (
        <img
          src={popup.img}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hasImage
            ? "linear-gradient(to top,rgba(0,0,0,.72),rgba(0,0,0,.08))"
            : "linear-gradient(135deg,rgba(0,0,0,.16),rgba(255,255,255,.08))",
        }}
      />

      <button
        type="button"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 30,
          height: 30,
          borderRadius: 999,
          border: "none",
          background: "rgba(255,255,255,.22)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <X size={15} strokeWidth={2.4} />
      </button>

      <div
        style={{
          position: "relative",
          minHeight: 280,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 15,
            background: "rgba(255,255,255,.2)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            marginBottom: 12,
            backdropFilter: "blur(8px)",
          }}
        >
          <Megaphone size={20} strokeWidth={2.4} />
        </div>

        <div
          style={{
            color: "#fff",
            fontSize: 21,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-.35px",
            marginBottom: 7,
          }}
        >
          {popup.title || "Título del popup"}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,.82)",
            fontSize: 12,
            lineHeight: 1.45,
            marginBottom: 14,
          }}
        >
          {popup.subtitle || "Subtexto promocional para explicar la oferta."}
        </div>

        <div
          style={{
            width: "100%",
            minHeight: 42,
            borderRadius: 14,
            background: "#fff",
            color: bg,
            fontSize: 13,
            fontWeight: 900,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 24px rgba(0,0,0,.16)",
          }}
        >
          {popup.ctaText || "Ver promoción"}
        </div>
      </div>
    </div>
  );
}

export function PromoPopupAdmin({ popup, onChange, cats = [] }) {
  const def = useMemo(
    () => ({
      active: false,
      img: "",
      bgColor: "#7c3aed",
      title: "",
      subtitle: "",
      ctaText: "Ver promoción",
      linkType: "none",
      linkCatId: "",
      linkUrl: "",
      frequency: "session",
      delay: 20,
    }),
    []
  );

  const p = popup || def;
  const hasContent = Boolean(p.img || p.title);

  const [editing, setEditing] = useState(!hasContent);
  const [draft, setDraft] = useState({ ...def, ...p });

  useEffect(() => {
    const next = { ...def, ...(popup || {}) };
    setDraft(next);
    setEditing(!(next.img || next.title));
  }, [popup, def]);

  const dset = (k) => (v) => setDraft((x) => ({ ...x, [k]: v }));

  const openEdit = () => {
    setDraft({ ...def, ...p });
    setEditing(true);
  };

  const apply = () => {
    onChange(draft);
    setEditing(false);
  };

  const clear = () => {
    onChange({
      ...def,
      active: false,
    });
    setDraft({ ...def });
    setEditing(false);
  };

  const toggleActive = () => {
    onChange({
      ...p,
      active: !p.active,
    });
  };

  const FREQ_LABEL = {
    always: "Siempre",
    session: "Por sesión",
    daily: "Una al día",
  };

  const LINK_LABEL = {
    none: "Sin acción",
    category: "Categoría",
    external: "Link externo",
  };

  const linkIsReady =
    draft.linkType === "none" ||
    (draft.linkType === "category" && draft.linkCatId) ||
    (draft.linkType === "external" && draft.linkUrl);

  return (
    <Card style={{ marginTop: 16 }}>
      <style>
        {`
          @media(max-width:760px){
            .popup-admin-header{
              flex-direction:column!important;
              align-items:stretch!important;
            }

            .popup-compact{
              flex-direction:column!important;
              align-items:flex-start!important;
            }

            .popup-actions{
              width:100%!important;
              justify-content:flex-end!important;
            }

            .popup-form-grid{
              grid-template-columns:1fr!important;
            }

            .popup-option-grid{
              grid-template-columns:1fr!important;
            }

            .popup-two{
              grid-template-columns:1fr!important;
            }
          }
        `}
      </style>

      <div
        className="popup-admin-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 14,
          marginBottom: hasContent && !editing ? 0 : 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 14,
              fontWeight: 900,
              color: T.text,
              marginBottom: 4,
            }}
          >
            <SoftIcon icon={Megaphone} color="#7c3aed" box={34} size={17} />
            Popup promocional
          </div>

          <div
            style={{
              fontSize: 12,
              color: T.mid,
              lineHeight: 1.45,
              paddingLeft: 43,
            }}
          >
            Aparece al entrar al menú. Es ideal para promos flash, combos o
            campañas especiales.
          </div>
        </div>

        {hasContent && !editing ? (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: p.active ? "#d1fae5" : T.bg,
              border: `1px solid ${p.active ? "#05966933" : T.border}`,
              borderRadius: 999,
              padding: "6px 10px",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: p.active ? "#059669" : T.mid,
                fontWeight: 900,
              }}
            >
              {p.active ? "Activo" : "Inactivo"}
            </span>
            <Toggle value={p.active} onChange={toggleActive} sm />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: draft.active ? "#d1fae5" : T.bg,
              border: `1px solid ${draft.active ? "#05966933" : T.border}`,
              borderRadius: 999,
              padding: "6px 10px",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: draft.active ? "#059669" : T.mid,
                fontWeight: 900,
              }}
            >
              {draft.active ? "Activo" : "Inactivo"}
            </span>
            <Toggle
              value={draft.active}
              onChange={(v) => setDraft((x) => ({ ...x, active: v }))}
              sm
            />
          </div>
        )}
      </div>

      {hasContent && !editing && (
        <div
          className="popup-compact"
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            paddingTop: 14,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              overflow: "hidden",
              flexShrink: 0,
              background: p.bgColor || "#7c3aed",
              position: "relative",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              border: `1px solid ${T.border}`,
              boxShadow: "0 10px 24px rgba(15,23,42,.08)",
            }}
          >
            {p.img ? (
              <img
                src={p.img}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt=""
              />
            ) : (
              <Megaphone size={24} strokeWidth={2.35} />
            )}

            {!p.active && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,.48)",
                }}
              />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 14,
                  color: T.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {p.title || "Popup sin título"}
              </div>

              <InfoChip
                icon={p.active ? CheckCircle2 : Ban}
                color={p.active ? "#059669" : T.light}
                bg={p.active ? "#d1fae5" : T.bg}
              >
                {p.active ? "Activo" : "Inactivo"}
              </InfoChip>
            </div>

            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 3,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <InfoChip icon={Timer} color={T.coral}>
                {p.delay ?? 20}s
              </InfoChip>

              <InfoChip icon={RefreshCw} color="#16a34a" bg="#f0fdf4">
                {FREQ_LABEL[p.frequency || "session"]}
              </InfoChip>

              {p.linkType !== "none" && (
                <InfoChip icon={ExternalLink} color="#1e40af" bg="#dbeafe">
                  {LINK_LABEL[p.linkType]}
                </InfoChip>
              )}

              {p.linkType === "none" || !p.linkType ? (
                <InfoChip icon={Ban} color={T.light} bg={T.bg}>
                  Sin acción
                </InfoChip>
              ) : null}

              {p.subtitle && (
                <span
                  style={{
                    fontSize: 11,
                    color: T.mid,
                    maxWidth: 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.subtitle}
                </span>
              )}
            </div>
          </div>

          <div
            className="popup-actions"
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={openEdit}
              title="Editar popup"
              style={{
                width: 32,
                height: 32,
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                cursor: "pointer",
                color: T.mid,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Pencil size={14} strokeWidth={2.4} />
            </button>

            <button
              type="button"
              onClick={() =>
                window.confirm("¿Quitar el popup promocional?") && clear()
              }
              title="Eliminar popup"
              style={{
                width: 32,
                height: 32,
                background: T.redL,
                border: "1px solid rgba(220,38,38,.18)",
                borderRadius: 10,
                cursor: "pointer",
                color: "#dc2626",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Trash2 size={14} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}

      {(!hasContent || editing) && (
        <>
          {!hasContent && (
            <div
              style={{
                background: T.bg,
                border: `1px dashed ${T.border}`,
                borderRadius: 16,
                padding: "18px 16px",
                fontSize: 12,
                color: T.mid,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <SoftIcon icon={Sparkles} color="#7c3aed" box={40} size={19} />
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: T.text,
                    marginBottom: 3,
                  }}
                >
                  Sin popup configurado
                </div>
                Agrega una imagen o título para activar una promoción emergente
                en el menú del cliente.
              </div>
            </div>
          )}

          <div
            className="popup-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) 280px",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div>
              <PhotoInput
                label="Imagen del popup"
                value={draft.img}
                onChange={dset("img")}
                height={124}
                dims="600×800 px • Vertical • JPG o PNG • Máx 3MB • Se adapta a cualquier pantalla"
              />

              <div
                className="popup-two"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <Field
                  label="Título"
                  value={draft.title}
                  onChange={dset("title")}
                  placeholder="¡Oferta del día!"
                />

                <Field
                  label="Texto botón CTA"
                  value={draft.ctaText}
                  onChange={dset("ctaText")}
                  placeholder="Ver promoción"
                />
              </div>

              <Field
                label="Subtexto"
                value={draft.subtitle}
                onChange={dset("subtitle")}
                placeholder="Solo hoy · Hasta agotar existencias"
              />

              <div style={{ marginBottom: 15 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    color: T.mid,
                    marginBottom: 8,
                  }}
                >
                  <InlineIcon icon={ImageIcon} size={13} />
                  Color de fondo si no hay imagen
                </label>

                <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                  <input
                    type="color"
                    value={draft.bgColor || "#7c3aed"}
                    onChange={(e) => dset("bgColor")(e.target.value)}
                    style={{
                      width: 46,
                      height: 40,
                      borderRadius: 10,
                      border: `1px solid ${T.border}`,
                      background: "none",
                      cursor: "pointer",
                    }}
                  />

                  <input
                    value={draft.bgColor || "#7c3aed"}
                    onChange={(e) => dset("bgColor")(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      background: T.bg,
                      border: `1.5px solid ${T.border}`,
                      borderRadius: 11,
                      color: T.text,
                      fontSize: 13,
                      outline: "none",
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    color: T.mid,
                    marginBottom: 8,
                  }}
                >
                  <InlineIcon icon={MousePointerClick} size={13} />
                  Acción del botón CTA
                </label>

                <div
                  className="popup-option-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <OptionCard
                    active={(draft.linkType || "none") === "none"}
                    icon={Ban}
                    title="Solo cerrar"
                    subtitle="Sin navegación"
                    onClick={() => setDraft((x) => ({ ...x, linkType: "none" }))}
                  />

                  <OptionCard
                    active={(draft.linkType || "none") === "category"}
                    icon={FolderOpen}
                    title="Categoría"
                    subtitle="Lleva a una sección"
                    onClick={() =>
                      setDraft((x) => ({ ...x, linkType: "category" }))
                    }
                  />

                  <OptionCard
                    active={(draft.linkType || "none") === "external"}
                    icon={Globe2}
                    title="Link externo"
                    subtitle="Abre una URL"
                    onClick={() =>
                      setDraft((x) => ({ ...x, linkType: "external" }))
                    }
                  />
                </div>

                {draft.linkType === "category" && (
                  <select
                    value={draft.linkCatId}
                    onChange={(e) => dset("linkCatId")(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      background: T.bg,
                      border: `1.5px solid ${
                        draft.linkCatId ? T.coral : T.border
                      }`,
                      borderRadius: 12,
                      fontSize: 13,
                      color: draft.linkCatId ? T.text : T.mid,
                      outline: "none",
                    }}
                  >
                    <option value="">— Elige una categoría —</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}

                {draft.linkType === "external" && (
                  <div>
                    <div style={{ position: "relative" }}>
                      <Link2
                        size={15}
                        strokeWidth={2.4}
                        style={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: draft.linkUrl ? T.coral : T.light,
                          pointerEvents: "none",
                        }}
                      />

                      <input
                        value={draft.linkUrl}
                        onChange={(e) => dset("linkUrl")(e.target.value)}
                        placeholder="https://ejemplo.com/promo"
                        style={{
                          width: "100%",
                          padding: "11px 12px 11px 37px",
                          background: T.bg,
                          border: `1.5px solid ${
                            draft.linkUrl ? T.coral : T.border
                          }`,
                          borderRadius: 12,
                          fontSize: 13,
                          color: T.text,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        color: T.mid,
                        marginTop: 6,
                        lineHeight: 1.35,
                      }}
                    >
                      Se abrirá en una nueva pestaña.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 15 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    color: T.mid,
                    marginBottom: 8,
                  }}
                >
                  <InlineIcon icon={RefreshCw} size={13} />
                  ¿Con qué frecuencia aparece?
                </label>

                <div
                  className="popup-option-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  <OptionCard
                    active={(draft.frequency || "session") === "always"}
                    icon={RefreshCw}
                    title="Siempre"
                    subtitle="Cada vez que abre el menú"
                    onClick={() => dset("frequency")("always")}
                  />

                  <OptionCard
                    active={(draft.frequency || "session") === "session"}
                    icon={Clock3}
                    title="Una vez"
                    subtitle="Por sesión del navegador"
                    onClick={() => dset("frequency")("session")}
                  />

                  <OptionCard
                    active={(draft.frequency || "session") === "daily"}
                    icon={CalendarClock}
                    title="Una al día"
                    subtitle="Se resetea cada 24h"
                    onClick={() => dset("frequency")("daily")}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    color: T.mid,
                    marginBottom: 8,
                  }}
                >
                  <InlineIcon icon={Timer} size={13} />
                  Aparece después de{" "}
                  <span style={{ color: T.coral, fontWeight: 900 }}>
                    {draft.delay ?? 20}s de navegación
                  </span>
                </label>

                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={draft.delay ?? 20}
                  onChange={(e) => dset("delay")(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    accentColor: T.coral,
                    cursor: "pointer",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    color: T.light,
                    marginTop: 3,
                  }}
                >
                  {["0s", "10s", "20s", "30s", "40s", "50s", "60s"].map(
                    (l) => (
                      <span key={l}>{l}</span>
                    )
                  )}
                </div>
              </div>

              <div
                style={{
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  marginBottom: 16,
                }}
              >
                <Toggle
                  value={draft.active}
                  onChange={(v) => setDraft((x) => ({ ...x, active: v }))}
                  label="Popup activo visible para clientes"
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                {editing && hasContent && (
                  <Btn full v="neutral" onClick={() => setEditing(false)}>
                    Cancelar
                  </Btn>
                )}

                <Btn
                  full
                  onClick={apply}
                  disabled={!(draft.img || draft.title)}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <InlineIcon icon={editing ? Check : Plus} size={15} />
                    {editing && hasContent ? "Guardar popup" : "Agregar popup"}
                  </span>
                </Btn>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: T.mid,
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <InlineIcon icon={ImageIcon} size={13} color="#7c3aed" />
                Preview
              </div>

              <PopupPreview popup={draft} />

              <div
                style={{
                  marginTop: 12,
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  padding: "11px 12px",
                }}
              >
                {[
                  ["Contenido", Boolean(draft.img || draft.title)],
                  ["CTA", Boolean(draft.ctaText?.trim())],
                  ["Acción", Boolean(linkIsReady)],
                  ["Frecuencia", Boolean(draft.frequency)],
                ].map(([label, ok]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      color: ok ? "#059669" : T.light,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "5px 0",
                    }}
                  >
                    <InlineIcon icon={ok ? CheckCircle2 : Check} size={14} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

/* ─── ADMIN: BANNERS ──────────────────────────────────────── */