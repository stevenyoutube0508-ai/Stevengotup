import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Ban,
  Check,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Globe2,
  Home,
  ImageIcon,
  Link2,
  Megaphone,
  MousePointerClick,
  Pencil,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  X,
} from "lucide-react";

import { T } from "../../../constants/theme";
import { newId } from "../../../utils/format";
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

function BannerChip({ icon, children, color = T.coral, bg }) {
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

function ToggleSwitch({ active, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "Desactivar banner" : "Activar banner"}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: active ? color : "#d1d5db",
        position: "relative",
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 2,
          left: active ? 20 : 2,
          transition: "left .2s",
          boxShadow: "0 2px 6px rgba(15,23,42,.22)",
        }}
      />
    </button>
  );
}

function BannerPreview({ form }) {
  const hasImage = Boolean(form.img);

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${T.border}`,
        background: form.bgColor || T.coral,
        minHeight: 124,
        position: "relative",
        boxShadow: "0 10px 24px rgba(15,23,42,.08)",
      }}
    >
      {hasImage && (
        <img
          src={form.img}
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
            ? "linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.08))"
            : "linear-gradient(135deg,rgba(0,0,0,.14),rgba(255,255,255,.08))",
        }}
      />

      <div
        style={{
          position: "relative",
          padding: 16,
          minHeight: 124,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            background: "rgba(255,255,255,.2)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            marginBottom: 10,
            backdropFilter: "blur(6px)",
          }}
        >
          <Megaphone size={17} strokeWidth={2.4} />
        </div>

        <div
          style={{
            color: "#fff",
            fontSize: 17,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-.25px",
            maxWidth: "80%",
          }}
        >
          {form.title || "Título del banner"}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,.82)",
            fontSize: 12,
            marginTop: 5,
            maxWidth: "86%",
            lineHeight: 1.35,
          }}
        >
          {form.subtitle || "Subtexto promocional o descripción corta"}
        </div>
      </div>
    </div>
  );
}

export function BannersAdmin({ banners = [], onChange, onToggle, primaryColor, cats = [] }) {
  const pc = primaryColor || T.coral;

  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    img: "",
    bgColor: pc,
    active: true,
    position: "inicio",
    linkType: "none",
    linkCatId: "",
    linkUrl: "",
  });

  const openNew = () => {
    setForm({
      title: "",
      subtitle: "",
      img: "",
      bgColor: pc,
      active: true,
      position: "inicio",
      linkType: "none",
      linkCatId: "",
      linkUrl: "",
    });
    setEditIdx(-1);
  };

  const openEdit = (i) => {
    const banner = banners[i];

    setForm({
      ...banner,
      bgColor: banner.bgColor || pc,
      active: banner.active !== false,
      position: banner.position || "inicio",
      linkType: banner.linkType || "none",
      linkCatId: banner.linkCatId || "",
      linkUrl: banner.linkUrl || "",
    });

    setEditIdx(i);
  };

  const save = () => {
    if (editIdx === -1) {
      onChange([...banners, { ...form, id: newId() }]);
    } else {
      onChange(banners.map((b, i) => (i === editIdx ? { ...b, ...form } : b)));
    }

    setEditIdx(null);
  };

  const del = (i) => onChange(banners.filter((_, j) => j !== i));

  const toggle = (i) => {
    const updated = banners.map((b, j) => (j === i ? { ...b, active: !b.active } : b));
    onChange(updated);
    // Notify parent so it can auto-save this change immediately
    if (onToggle) onToggle(updated);
  };

  const getPositionChip = (position) => {
    if (position === "productos") {
      return {
        icon: ClipboardList,
        label: "En carta",
      };
    }

    if (position === "ambos") {
      return {
        icon: RefreshCw,
        label: "Ambos",
      };
    }

    return {
      icon: Home,
      label: "Inicio",
    };
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <style>
        {`
          @media(max-width:720px){
            .banner-admin-header{flex-direction:column!important;align-items:stretch!important}
            .banner-row{align-items:flex-start!important}
            .banner-actions{width:100%!important;justify-content:flex-end!important}
            .banner-modal-grid{grid-template-columns:1fr!important}
            .banner-option-grid{grid-template-columns:1fr!important}
          }
        `}
      </style>

      <div
        className="banner-admin-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 14,
          marginBottom: 16,
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
            <SoftIcon icon={Target} color={pc} box={34} size={17} />
            Banners promocionales
          </div>

          <div
            style={{
              fontSize: 12,
              color: T.mid,
              lineHeight: 1.45,
              paddingLeft: 43,
            }}
          >
            Crea promociones visibles en el catálogo del cliente para destacar
            ofertas, lanzamientos o campañas.
          </div>
        </div>

        <Btn sm onClick={openNew}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <InlineIcon icon={Plus} size={14} />
            Agregar banner
          </span>
        </Btn>
      </div>

      {banners.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "34px 20px",
            color: T.mid,
            fontSize: 12,
            border: `2px dashed ${T.border}`,
            borderRadius: 18,
            background: T.bg,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              background: `${pc}14`,
              color: pc,
              display: "grid",
              placeItems: "center",
              margin: "0 auto 12px",
            }}
          >
            <Megaphone size={25} strokeWidth={2.3} />
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: T.text,
              marginBottom: 5,
            }}
          >
            No tienes banners todavía
          </div>

          <div style={{ marginBottom: 16 }}>
            Agrega uno para mostrar promociones en el catálogo del cliente.
          </div>

          <Btn sm onClick={openNew}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <InlineIcon icon={Plus} size={14} />
              Crear primer banner
            </span>
          </Btn>
        </div>
      )}

      {banners.length > 0 && (
        <div
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {banners.map((b, i) => {
            const positionChip = getPositionChip(b.position);
            const category = cats.find((c) => c.id === b.linkCatId);

            return (
              <div
                key={b.id || i}
                className="banner-row"
                style={{
                  display: "flex",
                  gap: 13,
                  alignItems: "center",
                  padding: "13px 14px",
                  borderBottom:
                    i === banners.length - 1
                      ? "none"
                      : `1px solid ${T.border}`,
                  background: b.active ? T.white : T.bg,
                  opacity: b.active ? 1 : 0.66,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 48,
                    borderRadius: 14,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: b.bgColor || pc,
                    border: `1px solid ${T.border}`,
                    boxShadow: "0 8px 18px rgba(15,23,42,.06)",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    position: "relative",
                  }}
                >
                  {b.img ? (
                    <img
                      src={b.img}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      alt=""
                    />
                  ) : (
                    <Megaphone size={20} strokeWidth={2.4} />
                  )}

                  {!b.active && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255,255,255,.45)",
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
                      marginBottom: 5,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 13,
                        color: T.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      {b.title || "Sin título"}
                    </div>

                    <BannerChip
                      icon={b.active ? CheckCircle2 : Ban}
                      color={b.active ? "#059669" : T.light}
                      bg={b.active ? "#d1fae5" : T.bg}
                    >
                      {b.active ? "Activo" : "Inactivo"}
                    </BannerChip>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <BannerChip icon={positionChip.icon} color={pc}>
                      {positionChip.label}
                    </BannerChip>

                    {b.linkType === "category" && (
                      <BannerChip
                        icon={FolderOpen}
                        color="#065f46"
                        bg="#d1fae5"
                      >
                        {category?.name || "Categoría"}
                      </BannerChip>
                    )}

                    {b.linkType === "external" && (
                      <BannerChip
                        icon={ExternalLink}
                        color="#1e40af"
                        bg="#dbeafe"
                      >
                        Link externo
                      </BannerChip>
                    )}

                    {b.linkType === "none" || !b.linkType ? (
                      <BannerChip icon={Ban} color={T.light} bg={T.bg}>
                        Sin acción
                      </BannerChip>
                    ) : null}

                    {b.subtitle && (
                      <span
                        style={{
                          fontSize: 11,
                          color: T.mid,
                          maxWidth: 360,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {b.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="banner-actions"
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <ToggleSwitch active={b.active} color={pc} onClick={() => toggle(i)} />

                  <button
                    type="button"
                    onClick={() => openEdit(i)}
                    title="Editar banner"
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
                    onClick={() => del(i)}
                    title="Eliminar banner"
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
            );
          })}
        </div>
      )}

      {editIdx !== null &&
  createPortal(
    <div
      onClick={() => setEditIdx(null)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(10,15,30,.62)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        overflowY: "auto",
      }}
    >
          <div
  onClick={(e) => e.stopPropagation()}
  style={{
    background: T.white,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 760,
    maxHeight: "calc(100vh - 48px)",
    overflowY: "auto",
    boxShadow: "0 30px 90px rgba(0,0,0,.34)",
    margin: "auto",
  }}
>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontWeight: 900,
                    fontSize: 18,
                    color: T.text,
                    letterSpacing: "-.25px",
                  }}
                >
                  <SoftIcon
                    icon={editIdx === -1 ? Plus : Pencil}
                    color={pc}
                    box={36}
                    size={17}
                  />
                  {editIdx === -1 ? "Nuevo banner" : "Editar banner"}
                </div>

                <div
                  style={{
                    color: T.mid,
                    fontSize: 12,
                    marginTop: 5,
                    paddingLeft: 46,
                  }}
                >
                  Configura el contenido, ubicación y acción del banner.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditIdx(null)}
                style={{
                  width: 34,
                  height: 34,
                  border: "none",
                  borderRadius: 11,
                  background: T.bg,
                  color: T.mid,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={17} strokeWidth={2.4} />
              </button>
            </div>

            <div
              className="banner-modal-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) 260px",
                gap: 18,
                alignItems: "start",
              }}
            >
              <div>
                <Field
                  label="Título del banner *"
                  value={form.title}
                  onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                  placeholder="2x1 en Bandeja Paisa · Hoy"
                />

                <Field
                  label="Subtexto"
                  value={form.subtitle}
                  onChange={(v) => setForm((p) => ({ ...p, subtitle: v }))}
                  placeholder="Válido solo hoy · Hasta agotar existencias"
                />

                <PhotoInput
                  label="Imagen del banner"
                  value={form.img}
                  onChange={(v) => setForm((p) => ({ ...p, img: v }))}
                  height={104}
                  dims="1200×500 px • Horizontal 12:5 • JPG o PNG • Máx 3MB"
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
                      value={form.bgColor || pc}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, bgColor: e.target.value }))
                      }
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
                      value={form.bgColor || pc}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, bgColor: e.target.value }))
                      }
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
                    <InlineIcon icon={Home} size={13} />
                    ¿Dónde aparece el banner?
                  </label>

                  <div
                    className="banner-option-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <OptionCard
                      active={(form.position || "inicio") === "inicio"}
                      icon={Home}
                      title="Inicio"
                      subtitle="Antes de las categorías"
                      onClick={() =>
                        setForm((p) => ({ ...p, position: "inicio" }))
                      }
                    />

                    <OptionCard
                      active={(form.position || "inicio") === "productos"}
                      icon={ClipboardList}
                      title="En carta"
                      subtitle="Mientras navega productos"
                      onClick={() =>
                        setForm((p) => ({ ...p, position: "productos" }))
                      }
                    />

                    <OptionCard
                      active={(form.position || "inicio") === "ambos"}
                      icon={RefreshCw}
                      title="Ambos"
                      subtitle="En inicio y en carta"
                      onClick={() =>
                        setForm((p) => ({ ...p, position: "ambos" }))
                      }
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
                    Acción al hacer clic en el banner
                  </label>

                  <div
                    className="banner-option-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <OptionCard
                      active={(form.linkType || "none") === "none"}
                      icon={Ban}
                      title="Ninguna"
                      subtitle="Solo informativo"
                      onClick={() =>
                        setForm((p) => ({ ...p, linkType: "none" }))
                      }
                    />

                    <OptionCard
                      active={(form.linkType || "none") === "category"}
                      icon={FolderOpen}
                      title="Categoría"
                      subtitle="Lleva a una sección"
                      onClick={() =>
                        setForm((p) => ({ ...p, linkType: "category" }))
                      }
                    />

                    <OptionCard
                      active={(form.linkType || "none") === "external"}
                      icon={Globe2}
                      title="Link externo"
                      subtitle="Abre una URL"
                      onClick={() =>
                        setForm((p) => ({ ...p, linkType: "external" }))
                      }
                    />
                  </div>

                  {form.linkType === "category" && (
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: T.mid,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Selecciona la categoría destino
                      </label>

                      <select
                        value={form.linkCatId}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            linkCatId: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "11px 12px",
                          background: T.bg,
                          border: `1.5px solid ${
                            form.linkCatId ? T.coral : T.border
                          }`,
                          borderRadius: 12,
                          fontSize: 13,
                          color: form.linkCatId ? T.text : T.mid,
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
                    </div>
                  )}

                  {form.linkType === "external" && (
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: T.mid,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        URL de destino
                      </label>

                      <div style={{ position: "relative" }}>
                        <Link2
                          size={15}
                          strokeWidth={2.4}
                          style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: form.linkUrl ? T.coral : T.light,
                            pointerEvents: "none",
                          }}
                        />

                        <input
                          value={form.linkUrl}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              linkUrl: e.target.value,
                            }))
                          }
                          placeholder="https://ejemplo.com/promo"
                          style={{
                            width: "100%",
                            padding: "11px 12px 11px 37px",
                            background: T.bg,
                            border: `1.5px solid ${
                              form.linkUrl ? T.coral : T.border
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
                        Debe empezar por https:// — se abrirá en una nueva
                        pestaña.
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    padding: "12px 14px",
                  }}
                >
                  <Toggle
                    value={form.active}
                    onChange={(v) => setForm((p) => ({ ...p, active: v }))}
                    label="Banner activo visible para clientes"
                  />
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
                  <InlineIcon icon={ImageIcon} size={13} color={pc} />
                  Preview
                </div>

                <BannerPreview form={form} />

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
                    ["Título", Boolean(form.title?.trim())],
                    [
                      "Ubicación",
                      Boolean(form.position || form.position === undefined),
                    ],
                    [
                      "Acción configurada",
                      form.linkType === "none" ||
                        (form.linkType === "category" && form.linkCatId) ||
                        (form.linkType === "external" && form.linkUrl),
                    ],
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

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
                paddingTop: 16,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <Btn full v="neutral" onClick={() => setEditIdx(null)}>
                Cancelar
              </Btn>

              <Btn full onClick={save} disabled={!form.title}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <InlineIcon icon={editIdx === -1 ? Plus : Check} size={15} />
                  {editIdx === -1 ? "Agregar banner" : "Guardar cambios"}
                </span>
              </Btn>
            </div>
          </div>
          </div>,
  document.body
)}
    </Card>
  );
}

/* ─── ADMIN: POPUP PROMOCIONAL ────────────────────────────── */