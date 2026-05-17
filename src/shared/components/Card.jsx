import { T } from "../../constants/theme";

export function Card({
  children,
  style = {},
  p = 20,
  onClick,
  className = "",
}) {
  const isClickable = typeof onClick === "function";

  return (
    <>
      <style>
        {`
          .picku-card {
            position: relative;
            isolation: isolate;
          }

          .picku-card::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            background: linear-gradient(
              180deg,
              rgba(255,255,255,.55),
              rgba(255,255,255,0)
            );
            opacity: .65;
            z-index: -1;
          }

          .picku-card-clickable:hover {
            transform: translateY(-2px);
            box-shadow:
              0 18px 40px rgba(15, 23, 42, .085),
              0 2px 8px rgba(15, 23, 42, .045);
            border-color: rgba(249, 115, 22, .22);
          }

          .picku-card-clickable:active {
            transform: translateY(0);
            box-shadow:
              0 8px 22px rgba(15, 23, 42, .065),
              0 1px 4px rgba(15, 23, 42, .035);
          }

          .picku-card-clickable:focus-visible {
            outline: 3px solid rgba(249, 115, 22, .22);
            outline-offset: 2px;
          }

          @media(max-width:640px) {
            .picku-card {
              border-radius: 18px !important;
            }
          }
        `}
      </style>

      <div
        onClick={onClick}
        onKeyDown={(event) => {
          if (!isClickable) return;

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick(event);
          }
        }}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={`picku-card ${isClickable ? "picku-card-clickable" : ""} ${className}`}
        style={{
          background: T.white,
          borderRadius: 20,
          border: `1px solid ${T.border}`,
          boxShadow:
            "0 10px 28px rgba(15, 23, 42, .055), 0 1px 3px rgba(15, 23, 42, .035)",
          padding: p,
          transition:
            "transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease",
          cursor: isClickable ? "pointer" : "default",
          ...style,
        }}
      >
        {children}
      </div>
    </>
  );
}