import {
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useId,
} from "react";
import { X } from "lucide-react";

import { T } from "../../constants/theme";

function ModalIcon({ icon }) {
  if (!icon) return null;

  const isIconElement = isValidElement(icon);
  const isIconComponent =
    typeof icon === "function" ||
    (typeof icon === "object" && typeof icon.render === "function");

  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 13,
        background: T.coralL,
        color: T.coral,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        boxShadow: "0 8px 18px rgba(249,115,22,.12)",
      }}
    >
      {isIconElement
        ? cloneElement(icon, {
            size: icon.props?.size || 19,
            strokeWidth: icon.props?.strokeWidth || 2.4,
          })
        : isIconComponent
        ? createElement(icon, {
            size: 19,
            strokeWidth: 2.4,
          })
        : (
          <span
            style={{
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            {icon}
          </span>
        )}
    </div>
  );
}

export function Modal({
  title,
  icon,
  onClose,
  children,
  wide,
  extraWide,
}) {
  const titleId = useId();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const maxWidth = extraWide ? 940 : wide ? 680 : 500;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10,15,30,.52)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "modalOverlayIn .18s ease",
      }}
    >
      <style>
        {`
          @keyframes modalOverlayIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes modalPanelIn {
            from {
              opacity: 0;
              transform: translateY(10px) scale(.985);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media(max-width:640px) {
            .app-modal-panel {
              max-height: 92vh !important;
              border-radius: 22px 22px 0 0 !important;
              align-self: flex-end !important;
            }

            .app-modal-overlay {
              align-items: flex-end !important;
              padding: 12px 8px 0 !important;
            }
          }
        `}
      </style>

      <div
        className="app-modal-overlay"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          className="app-modal-panel"
          onClick={(event) => event.stopPropagation()}
          style={{
            width: "100%",
            maxWidth,
            maxHeight: "92vh",
            background: T.white,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow:
              "0 28px 80px rgba(15,23,42,.22), 0 0 0 1px rgba(255,255,255,.55)",
            animation: "modalPanelIn .22s ease",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              background: "rgba(255,255,255,.92)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderBottom: `1px solid ${T.border}`,
              padding: "18px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                minWidth: 0,
              }}
            >
              <ModalIcon icon={icon} />

              <div style={{ minWidth: 0 }}>
                <h3
                  id={titleId}
                  style={{
                    margin: 0,
                    fontWeight: 900,
                    fontSize: 18,
                    lineHeight: 1.2,
                    color: T.text,
                    letterSpacing: "-.25px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: T.bg,
                border: `1px solid ${T.border}`,
                color: T.mid,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all .15s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = T.redL;
                event.currentTarget.style.color = T.red;
                event.currentTarget.style.borderColor = "rgba(220,38,38,.18)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = T.bg;
                event.currentTarget.style.color = T.mid;
                event.currentTarget.style.borderColor = T.border;
              }}
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>

          <div
            style={{
              padding: 22,
              overflowY: "auto",
              flex: 1,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}