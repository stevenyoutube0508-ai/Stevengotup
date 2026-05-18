import { T } from "../../constants/theme";

export function Toggle({
  value,
  onChange,
  label,
  sm = false,
  disabled = false,
}) {
  const active = Boolean(value);

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) return;

    onChange?.(!active);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
      disabled={disabled}
      aria-pressed={active}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: label ? 8 : 0,
        border: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {label && (
        <span
          style={{
            fontSize: sm ? 11 : 12,
            fontWeight: 800,
            color: active ? T.green : T.mid,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {label}
        </span>
      )}

      <span
        style={{
          width: sm ? 40 : 44,
          height: sm ? 22 : 24,
          borderRadius: 999,
          background: active ? T.coral : "#d1d5db",
          position: "relative",
          display: "inline-block",
          flexShrink: 0,
          transition: "background .18s ease",
          boxShadow: active
            ? `0 6px 14px ${T.coral}26`
            : "inset 0 0 0 1px rgba(15,23,42,.04)",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            width: sm ? 18 : 20,
            height: sm ? 18 : 20,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 2,
            left: active ? (sm ? 20 : 22) : 2,
            transition: "left .18s ease",
            boxShadow: "0 2px 7px rgba(15,23,42,.24)",
            pointerEvents: "none",
          }}
        />
      </span>
    </button>
  );
}