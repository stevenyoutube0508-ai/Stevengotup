import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  MonitorSmartphone,
  Save,
  Sparkles,
  Target,
} from "lucide-react";

import { T } from "../../../constants/theme";
import { Card, Btn } from "../../../shared/components";

import { BannersAdmin } from "./BannersAdmin.jsx";
import { PromoPopupAdmin } from "./PromoPopupAdmin.jsx";

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

function SummaryCard({ icon, label, value, hint, color = T.coral }) {
  return (
    <Card
      style={{
        padding: "14px 15px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 78,
      }}
    >
      <SoftIcon icon={icon} color={color} box={42} size={19} />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: T.light,
            textTransform: "uppercase",
            letterSpacing: ".45px",
            marginBottom: 3,
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: T.text,
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>

        {hint && (
          <div
            style={{
              fontSize: 11,
              color: T.mid,
              marginTop: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {hint}
          </div>
        )}
      </div>
    </Card>
  );
}

export function SecBanners({ config, onUpdate, vertical, cats }) {
  const [banners, setBanners] = useState(config.banners || []);
  const [promoPopup, setPromoPopup] = useState(
    config.promoPopup || {
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
    }
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBanners(config.banners || []);
    setPromoPopup(
      config.promoPopup || {
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
      }
    );
  }, [config]);

  const primaryColor = config.primaryColor || "#f97316";

  const activeBanners = useMemo(
    () => banners.filter((banner) => banner.active !== false).length,
    [banners]
  );

  const bannersWithAction = useMemo(
    () =>
      banners.filter(
        (banner) =>
          banner.linkType === "category" || banner.linkType === "external"
      ).length,
    [banners]
  );

  const save = () => {
    onUpdate({
      ...config,
      banners,
      promoPopup,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  // Auto-save when the user flips the active toggle on a banner so the
  // preview page reflects the change immediately without an explicit save.
  const handleBannerToggle = (updatedBanners) => {
    onUpdate({ ...config, banners: updatedBanners, promoPopup });
  };

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <style>
        {`
          @media(max-width:860px){
            .banners-header{
              flex-direction:column!important;
              align-items:stretch!important;
            }

            .banners-header-actions button{
              width:100%!important;
            }

            .banners-summary-grid{
              grid-template-columns:1fr!important;
            }

            .banners-guide-grid{
              grid-template-columns:1fr!important;
            }
          }
        `}
      </style>

      <div
        className="banners-header"
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
            <InlineIcon icon={Megaphone} size={13} />
            Promociones visuales
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
            Banners y Popup
          </h2>

          <p
            style={{
              color: T.mid,
              fontSize: 13,
              marginTop: 6,
              lineHeight: 1.45,
              maxWidth: 560,
            }}
          >
            Administra promociones visibles en el menú del cliente: carrusel de
            banners, popup principal, acciones y enlaces.
          </p>
        </div>

        <div className="banners-header-actions">
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
        className="banners-summary-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <SummaryCard
          icon={LayoutDashboard}
          label="Banners"
          value={banners.length}
          hint={`${activeBanners} activos`}
          color={primaryColor}
        />

        <SummaryCard
          icon={Target}
          label="Con acción"
          value={bannersWithAction}
          hint="Categoría o link externo"
          color="#2563eb"
        />

        <SummaryCard
          icon={MonitorSmartphone}
          label="Popup"
          value={promoPopup?.active ? "Activo" : "Inactivo"}
          hint={promoPopup?.title || "Sin título configurado"}
          color={promoPopup?.active ? "#059669" : T.mid}
        />

        <SummaryCard
          icon={Clock}
          label="Aparición"
          value={`${promoPopup?.delay || 0}s`}
          hint={
            promoPopup?.frequency === "always"
              ? "Siempre"
              : promoPopup?.frequency === "daily"
              ? "Una vez al día"
              : "Una vez por sesión"
          }
          color="#7c3aed"
        />
      </div>

      <Card
        style={{
          background: T.coralL,
          border: `1px solid ${T.coral}22`,
          marginBottom: 16,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <SoftIcon icon={ImageIcon} color={T.coral} box={38} size={18} />

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                color: T.coral,
                fontWeight: 900,
                marginBottom: 8,
              }}
            >
              Guía de imágenes para promociones
            </div>

            <div
              className="banners-guide-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,.55)",
                  border: `1px solid ${T.coral}18`,
                  borderRadius: 13,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 900,
                    color: T.text,
                    marginBottom: 4,
                  }}
                >
                  <InlineIcon icon={LayoutDashboard} size={14} color={T.coral} />
                  Banners
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: T.mid,
                    lineHeight: 1.55,
                  }}
                >
                  1200 × 500 px · Horizontal · JPG/PNG · Máx 3MB.
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,.55)",
                  border: `1px solid ${T.coral}18`,
                  borderRadius: 13,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 900,
                    color: T.text,
                    marginBottom: 4,
                  }}
                >
                  <InlineIcon icon={MonitorSmartphone} size={14} color={T.coral} />
                  Popup
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: T.mid,
                    lineHeight: 1.55,
                  }}
                >
                  600 × 800 px · Vertical o cuadrado · JPG/PNG · Máx 3MB.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: T.mid,
                lineHeight: 1.6,
                display: "flex",
                alignItems: "flex-start",
                gap: 7,
              }}
            >
              <InlineIcon icon={Sparkles} size={14} color={T.coral} />
              Usa fotos de alta calidad{" "}
              {vertical?.labels?.banner_tip ||
                "con el producto protagonista centrado y texto corto en la imagen"}
              .
            </div>
          </div>
        </div>
      </Card>

      <BannersAdmin
        banners={banners}
        onChange={setBanners}
        onToggle={handleBannerToggle}
        primaryColor={primaryColor}
        cats={cats}
      />

      <PromoPopupAdmin
        popup={promoPopup}
        onChange={setPromoPopup}
        cats={cats}
      />

      <div style={{ marginTop: 16 }}>
        <Btn full onClick={save} style={{ padding: "14px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <InlineIcon icon={saved ? CheckCircle2 : Save} size={16} />
            {saved ? "¡Cambios guardados!" : "Guardar cambios"}
          </span>
        </Btn>
      </div>
    </div>
  );
}

/* ─── ADMIN: DELIVERY ─────────────────────────────────────── */