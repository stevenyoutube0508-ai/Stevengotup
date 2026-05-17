import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Eye,
  ImageIcon,
  Moon,
  Palette,
  Save,
  Sparkles,
  Store,
  Sun,
  Upload,
  Globe2,
  BadgeCheck,
} from "lucide-react";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaTripadvisor,
} from "react-icons/fa";

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

function SectionTitle({ icon, title, subtitle, color = T.coral }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontSize: 14,
          fontWeight: 900,
          color: T.text,
          marginBottom: subtitle ? 4 : 0,
        }}
      >
        <SoftIcon icon={icon} color={color} box={32} size={16} />
        {title}
      </div>

      {subtitle && (
        <div
          style={{
            fontSize: 12,
            color: T.mid,
            lineHeight: 1.45,
            paddingLeft: 41,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

function ColorDot({ color, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={color}
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: color,
        cursor: "pointer",
        border: selected ? `3px solid ${T.text}` : "3px solid transparent",
        boxShadow: selected
          ? "0 0 0 3px rgba(15,23,42,.08)"
          : "0 4px 10px rgba(15,23,42,.08)",
        transition: "all .15s ease",
      }}
    />
  );
}

function SocialField({ icon, label, value, onChange, placeholder, color }) {
  return (
    <div
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <SoftIcon icon={icon} color={color} box={30} size={15} />
        <div style={{ fontSize: 12, fontWeight: 900, color: T.text }}>
          {label}
        </div>
      </div>

      <Field
        label=""
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export function SecDiseno({ config, onUpdate }) {
  const [d, setD] = useState(config);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setD(config);
  }, [config]);

  const set = (k) => (v) => setD((p) => ({ ...p, [k]: v }));

  const save = () => {
    onUpdate(d);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const colorPresets = useMemo(
    () => [
      "#f97316",
      "#e85d04",
      "#dc2626",
      "#8b5cf6",
      "#059669",
      "#2563eb",
      "#d97706",
      "#db2777",
      "#0f172a",
    ],
    []
  );

  const previewBg = d.menuStyle === "dark" ? "#111009" : "#f8f7f4";
  const previewText = d.menuStyle === "dark" ? "#fff" : "#111";
  const previewMuted = d.menuStyle === "dark" ? "rgba(255,255,255,.65)" : T.mid;

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <style>
        {`
          @media(max-width:980px){
            .design-grid{grid-template-columns:1fr!important}
            .design-preview-card{position:relative!important;top:auto!important}
          }
          @media(max-width:720px){
            .design-header{flex-direction:column!important}
            .design-actions{width:100%!important}
            .design-actions button{width:100%!important}
            .design-two{grid-template-columns:1fr!important}
            .social-grid{grid-template-columns:1fr!important}
          }
        `}
      </style>

      <div
        className="design-header"
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
            <InlineIcon icon={Palette} size={13} />
            Personalización
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
            Diseño del menú
          </h2>

          <p
            style={{
              color: T.mid,
              fontSize: 13,
              marginTop: 6,
              lineHeight: 1.45,
            }}
          >
            Personaliza cómo tus clientes ven tu marca, colores, fotos y redes
            sociales.
          </p>
        </div>

        <div className="design-actions">
          <Btn onClick={save}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <InlineIcon icon={saved ? CheckCircle2 : Save} size={15} />
              {saved ? "¡Guardado!" : "Guardar cambios"}
            </span>
          </Btn>
        </div>
      </div>

      {saved && (
        <div
          style={{
            marginBottom: 14,
            background: T.greenL,
            border: `1px solid ${T.green}44`,
            color: T.green,
            borderRadius: 14,
            padding: "11px 14px",
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <InlineIcon icon={CheckCircle2} size={16} />
          Cambios guardados correctamente.
        </div>
      )}

      <div
        className="design-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(360px, .95fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle
              icon={Store}
              title="Identidad"
              subtitle="Define los datos principales que aparecerán en el encabezado del menú."
            />

            <Field
              label="Nombre del restaurante"
              value={d.name}
              onChange={set("name")}
              placeholder="Ej: La Leña"
              required
            />

            <Field
              label="Tagline / Slogan"
              value={d.tagline}
              onChange={set("tagline")}
              placeholder="Cocina de fuego lento · Desde 1998"
            />

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 11,
                color: T.mid,
                lineHeight: 1.45,
                marginTop: -4,
                marginBottom: 16,
              }}
            >
              <InlineIcon icon={Sparkles} size={14} color={T.coral} />
              El nombre y tagline son opcionales. Si tienes un buen banner,
              puedes dejar el diseño más visual y limpio.
            </div>

            <PhotoInput
              label="Logo del restaurante"
              value={d.logo}
              onChange={set("logo")}
              height={100}
              dims="400×400 px • Cuadrada • PNG con fondo transparente o JPG • Máx 1MB"
            />

            <div
              style={{
                marginTop: 6,
                padding: "12px 14px",
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
              }}
            >
              <Toggle
                value={d.openStatus}
                onChange={set("openStatus")}
                label="Mostrar como abierto ahora"
              />
            </div>
          </Card>

          <Card>
            <SectionTitle
              icon={Palette}
              title="Colores y estilo"
              subtitle="Escoge el color principal y el modo visual del menú."
            />

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: T.mid,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Color principal
              </label>

              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <input
                  type="color"
                  value={d.primaryColor}
                  onChange={(e) => set("primaryColor")(e.target.value)}
                  style={{
                    width: 52,
                    height: 44,
                    borderRadius: 12,
                    border: `1px solid ${T.border}`,
                    background: "none",
                    cursor: "pointer",
                  }}
                />

                <input
                  value={d.primaryColor}
                  onChange={(e) => set("primaryColor")(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "11px 12px",
                    background: T.bg,
                    border: `1.5px solid ${T.border}`,
                    borderRadius: 12,
                    color: T.text,
                    fontSize: 13,
                    outline: "none",
                    fontWeight: 700,
                  }}
                />

                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background: d.primaryColor,
                    boxShadow: "0 8px 18px rgba(15,23,42,.16)",
                    border: "3px solid #fff",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {colorPresets.map((c) => (
                  <ColorDot
                    key={c}
                    color={c}
                    selected={d.primaryColor === c}
                    onClick={() => set("primaryColor")(c)}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: T.mid,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Estilo del menú
              </label>

              <div
                className="design-two"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {[
                  {
                    key: "dark",
                    label: "Oscuro",
                    Icon: Moon,
                    desc: "Ideal para fotos fuertes y ambiente premium.",
                  },
                  {
                    key: "light",
                    label: "Claro",
                    Icon: Sun,
                    desc: "Más limpio, simple y fácil de leer.",
                  },
                ].map(({ key, label, Icon, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("menuStyle")(key)}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderRadius: 14,
                      border: `2px solid ${
                        d.menuStyle === key ? d.primaryColor : T.border
                      }`,
                      background:
                        d.menuStyle === key ? d.primaryColor + "12" : T.bg,
                      color: d.menuStyle === key ? d.primaryColor : T.mid,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 900,
                        marginBottom: 4,
                      }}
                    >
                      <InlineIcon icon={Icon} size={15} />
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        lineHeight: 1.35,
                        color: d.menuStyle === key ? d.primaryColor : T.light,
                        fontWeight: 600,
                      }}
                    >
                      {desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
              }}
            >
              <Toggle
                value={d.showAllergens}
                onChange={set("showAllergens")}
                label="Mostrar alérgenos en el menú"
              />
            </div>
          </Card>

          <Card>
            <SectionTitle
              icon={ImageIcon}
              title="Fotos"
              subtitle="Carga imágenes que hagan que tu menú se vea más profesional."
            />

            <PhotoInput
              label="Foto de portada (banner)"
              value={d.coverImg}
              onChange={set("coverImg")}
              height={100}
              dims="1200×450 px • Horizontal 8:3 • JPG o PNG • Máx 3MB"
            />

            <PhotoInput
              label="Fondo del menú (opcional)"
              value={d.bgImg}
              onChange={set("bgImg")}
              height={76}
              dims="1080×1920 px • Vertical • JPG o PNG • Máx 3MB"
            />
          </Card>

          <Card>
            <SectionTitle
              icon={Globe2}
              title="Redes sociales"
              subtitle="Los clientes verán los accesos en el menú. Pega el link completo o solo el número para WhatsApp."
            />

            <div
              className="social-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <SocialField
                icon={FaWhatsapp}
                label="WhatsApp"
                color="#059669"
                value={d.socialLinks?.whatsapp || ""}
                onChange={(v) =>
                  setD((p) => ({
                    ...p,
                    socialLinks: {
                      ...(p.socialLinks || {}),
                      whatsapp: v,
                    },
                  }))
                }
                placeholder="573001234567"
              />

              <SocialField
                icon={FaInstagram}
                label="Instagram"
                color="#db2777"
                value={d.socialLinks?.instagram || ""}
                onChange={(v) =>
                  setD((p) => ({
                    ...p,
                    socialLinks: {
                      ...(p.socialLinks || {}),
                      instagram: v,
                    },
                  }))
                }
                placeholder="https://instagram.com/…"
              />

              <SocialField
                icon={FaFacebookF}
                label="Facebook"
                color="#2563eb"
                value={d.socialLinks?.facebook || ""}
                onChange={(v) =>
                  setD((p) => ({
                    ...p,
                    socialLinks: {
                      ...(p.socialLinks || {}),
                      facebook: v,
                    },
                  }))
                }
                placeholder="https://facebook.com/…"
              />

              <SocialField
                icon={FaTiktok}
                label="TikTok"
                color="#0f172a"
                value={d.socialLinks?.tiktok || ""}
                onChange={(v) =>
                  setD((p) => ({
                    ...p,
                    socialLinks: {
                      ...(p.socialLinks || {}),
                      tiktok: v,
                    },
                  }))
                }
                placeholder="https://tiktok.com/@…"
              />

              <SocialField
                icon={FaTripadvisor}
                label="TripAdvisor"
                color="#059669"
                value={d.socialLinks?.tripadvisor || ""}
                onChange={(v) =>
                  setD((p) => ({
                    ...p,
                    socialLinks: {
                      ...(p.socialLinks || {}),
                      tripadvisor: v,
                    },
                  }))
                }
                placeholder="https://tripadvisor.com/…"
              />
            </div>
          </Card>
        </div>

        <div
          className="design-preview-card"
          style={{
            position: "sticky",
            top: 18,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "12px 15px",
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 11,
                  fontWeight: 900,
                  color: T.mid,
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                <InlineIcon icon={Eye} size={14} color={T.coral} />
                Preview del cliente
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 10,
                  fontWeight: 800,
                  color: d.openStatus ? "#059669" : T.light,
                  background: d.openStatus ? "#d1fae5" : T.bg,
                  borderRadius: 999,
                  padding: "4px 8px",
                }}
              >
                <InlineIcon icon={BadgeCheck} size={11} />
                {d.openStatus ? "Abierto" : "Estado oculto"}
              </div>
            </div>

            <div
              style={{
                minHeight: 300,
                background: previewBg,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {d.bgImg && (
                <img
                  src={d.bgImg}
                  alt=""
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: d.menuStyle === "dark" ? 0.16 : 0.1,
                  }}
                />
              )}

              <div
                style={{
                  height: 160,
                  position: "relative",
                  overflow: "hidden",
                  background: d.primaryColor + "18",
                }}
              >
                {d.coverImg ? (
                  <img
                    src={d.coverImg}
                    alt=""
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: 0.72,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, ${d.primaryColor}22, ${d.primaryColor}08)`,
                      display: "grid",
                      placeItems: "center",
                      color: d.primaryColor,
                    }}
                  >
                    <Upload size={34} strokeWidth={2.1} />
                  </div>
                )}

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      d.menuStyle === "dark"
                        ? "linear-gradient(to top,rgba(17,16,9,1),rgba(0,0,0,.08))"
                        : "linear-gradient(to top,rgba(248,247,244,1),rgba(255,255,255,.08))",
                  }}
                />
              </div>

              <div
                style={{
                  position: "relative",
                  marginTop: -34,
                  padding: "0 18px 18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: 20,
                      background: d.primaryColor + "22",
                      border: `3px solid ${d.primaryColor}66`,
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                      boxShadow: "0 14px 34px rgba(15,23,42,.18)",
                    }}
                  >
                    {d.logo &&
                    (d.logo.startsWith("http") || d.logo.startsWith("data:")) ? (
                      <img
                        src={d.logo}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          background: "#fff",
                        }}
                      />
                    ) : (
                      <Store size={30} color={d.primaryColor} strokeWidth={2.25} />
                    )}
                  </div>

                  <div style={{ minWidth: 0, paddingBottom: 3 }}>
                    <div
                      style={{
                        color: previewText,
                        fontWeight: 900,
                        fontSize: 20,
                        letterSpacing: "-.35px",
                        lineHeight: 1.15,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.name || "Nombre del restaurante"}
                    </div>

                    <div
                      style={{
                        color: d.primaryColor,
                        fontSize: 12,
                        fontWeight: 800,
                        marginTop: 3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.tagline || "Tu slogan aparecerá aquí"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 9,
                    marginBottom: 12,
                  }}
                >
                  {["Entradas", "Principales"].map((label, i) => (
                    <div
                      key={label}
                      style={{
                        background:
                          d.menuStyle === "dark"
                            ? "rgba(255,255,255,.08)"
                            : "#fff",
                        border:
                          d.menuStyle === "dark"
                            ? "1px solid rgba(255,255,255,.1)"
                            : `1px solid ${T.border}`,
                        borderRadius: 15,
                        padding: 11,
                        boxShadow:
                          d.menuStyle === "dark"
                            ? "none"
                            : "0 8px 20px rgba(15,23,42,.04)",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 10,
                          background: d.primaryColor + "18",
                          color: d.primaryColor,
                          display: "grid",
                          placeItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Sparkles size={14} strokeWidth={2.4} />
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: previewText,
                          fontWeight: 900,
                          marginBottom: 3,
                        }}
                      >
                        {label}
                      </div>

                      <div
                        style={{
                          width: i === 0 ? "80%" : "64%",
                          height: 6,
                          borderRadius: 999,
                          background: d.primaryColor + "30",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background:
                      d.menuStyle === "dark"
                        ? "rgba(255,255,255,.08)"
                        : "#fff",
                    border:
                      d.menuStyle === "dark"
                        ? "1px solid rgba(255,255,255,.1)"
                        : `1px solid ${T.border}`,
                    borderRadius: 17,
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 15,
                      background: d.primaryColor + "18",
                      color: d.primaryColor,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ImageIcon size={20} strokeWidth={2.3} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: previewText,
                        marginBottom: 4,
                      }}
                    >
                      Producto destacado
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: previewMuted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Descripción corta del producto
                    </div>
                  </div>

                  <div
                    style={{
                      color: d.primaryColor,
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    $25K
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle
              icon={CheckCircle2}
              title="Checklist visual"
              subtitle="Pequeñas señales para saber si tu menú se verá completo."
              color={T.green}
            />

            {[
              ["Nombre configurado", Boolean(d.name?.trim())],
              ["Color principal seleccionado", Boolean(d.primaryColor)],
              ["Logo cargado", Boolean(d.logo)],
              ["Foto de portada cargada", Boolean(d.coverImg)],
              [
                "Al menos una red social",
                Boolean(
                  d.socialLinks?.whatsapp ||
                    d.socialLinks?.instagram ||
                    d.socialLinks?.facebook ||
                    d.socialLinks?.tiktok ||
                    d.socialLinks?.tripadvisor
                ),
              ],
            ].map(([label, ok]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: `1px solid ${T.border}`,
                  color: ok ? T.green : T.light,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                <InlineIcon icon={ok ? CheckCircle2 : Check} size={15} />
                {label}
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Btn full onClick={save} style={{ padding: "14px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <InlineIcon icon={saved ? CheckCircle2 : Save} size={16} />
            {saved ? "¡Cambios guardados!" : "Guardar todos los cambios"}
          </span>
        </Btn>
      </div>
    </div>
  );
}