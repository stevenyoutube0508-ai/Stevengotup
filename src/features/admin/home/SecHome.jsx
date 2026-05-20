import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import activePlanIcon from "../../../assets/active_plan.svg";

import { Card, StatCard } from "../../../shared/components";
import { fmtCOP } from "../../../utils/format";
import { T } from "../../../constants/theme";
import { VERTICALS } from "../../../constants/verticals";

const DAY_LABELS_HOME = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function buildHomeWeekData(orders, totalViews) {
  const now = new Date();
  const totalOrdCount = orders.length || 1;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
    const dayStr = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => {
      const ts = o.createdAt ? String(o.createdAt).slice(0, 10) : null;
      const od = o.date    ? String(o.date).slice(0, 10)    : null;
      return ts === dayStr || od === dayStr;
    });
    return {
      d: DAY_LABELS_HOME[d.getDay()],
      v: Math.round(totalViews * (dayOrders.length / totalOrdCount)),
    };
  });
}

import platesActiveIcon from "../../../assets/plates_active.svg";
import pendingOrdersIcon from "../../../assets/pending_orders.svg";
import incomesIcon from "../../../assets/incomes.svg";
import visitsMenuIcon from "../../../assets/visits_menu.svg";

function DashboardStatIcon({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width: 100,
        height: 100,
        objectFit: "contain",
        display: "block",
        filter: "drop-shadow(0 6px 10px rgba(15,23,42,.10))",
      }}
    />
  );
}

export function SecHome({ products, orders, config, billing, onNav, vertical }) {
  const currentVertical = vertical || VERTICALS.restaurant;
  const vl = currentVertical.labels;
  const vc = currentVertical.color || T.coral;

  const activeProducts = products.filter((p) => p.active && p.stock);
  const pendingOrders = orders.filter((o) => o.status === "pendiente").length;
  const todayRev = orders
    .filter((o) => o.status === "entregado")
    .reduce((s, o) => s + (o.total || 0), 0);

  const catalogViews = products.reduce((s, p) => s + (p.clicks || 0), 0);

  // Build last-7-days chart data from real orders
  const weekChartData = buildHomeWeekData(orders, catalogViews);

  const topProducts = [...products]
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 5);

  const maxProductClicks = Math.max(
    ...topProducts.map((p) => p.clicks || 0),
    1
  );

  const planName =
    billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1);

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 22,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ minWidth: 220 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: vc + "12",
              border: `1px solid ${vc}24`,
              borderRadius: 999,
              padding: "5px 10px",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 13 }}>{currentVertical.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: vc,
              }}
            >
              Panel principal
            </span>
          </div>

          <h1
            style={{
              fontSize: 28,
              lineHeight: 1.1,
              fontWeight: 900,
              color: T.text,
              marginBottom: 6,
              letterSpacing: "-.5px",
            }}
          >
            Hola, {config.name} 👋
          </h1>

          <p
            style={{
              color: T.mid,
              fontSize: 13,
              margin: 0,
            }}
          >
            {new Date().toLocaleDateString("es-CO", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {vertical && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: vc + "15",
              border: `1px solid ${vc}30`,
              borderRadius: 16,
              padding: "9px 13px",
              boxShadow: "0 8px 22px rgba(15,23,42,.04)",
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: "#fff",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {vertical.icon}
            </span>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: vc,
                  lineHeight: 1.2,
                }}
              >
                {vertical.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: T.mid,
                  marginTop: 2,
                }}
              >
                {vl.catalog} Digital
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription status */}
      <Card
        style={{
          marginBottom: 20,
          background: `linear-gradient(135deg,${T.navy} 0%,#1a2d4a 100%)`,
          border: "none",
          padding: "20px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -34,
            top: -44,
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "rgba(255,255,255,.06)",
          }}
        />

        <div style={{ position: "relative", minWidth: 230 }}>
          <div
            style={{
              color: "rgba(255,255,255,.62)",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 7,
            }}
          >
            Estado del {vl.catalog.toLowerCase()}
          </div>

          <div
  style={{
    color: "#fff",
    fontSize: 21,
    lineHeight: 1.2,
    fontWeight: 900,
    letterSpacing: "-.25px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  }}
>
  <span>Plan {planName} · Activo</span>

  <img
    src={activePlanIcon}
    alt="Plan activo"
    draggable={false}
    style={{
      width: 42,
      height: 42,
      objectFit: "contain",
      display: "block",
      filter: "drop-shadow(0 6px 10px rgba(0,0,0,.18))",
    }}
  />
</div>

          <div
            style={{
              color: "rgba(255,255,255,.56)",
              fontSize: 12,
              marginTop: 7,
            }}
          >
            Próxima factura: {billing.nextPayment} · {fmtCOP(billing.amount)}
          </div>
        </div>

        <button
          onClick={() => onNav("facturacion")}
          style={{
            position: "relative",
            background: T.coral,
            border: "none",
            borderRadius: 12,
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            padding: "10px 16px",
            cursor: "pointer",
            boxShadow: `0 8px 20px ${T.coral}45`,
            minHeight: 38,
          }}
        >
          Ver suscripción
        </button>
      </Card>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          icon={
            <DashboardStatIcon
              src={platesActiveIcon}
              alt={vl.home_products}
            />
          }
          label={vl.home_products}
          value={activeProducts.length}
          color={vc}
          onClick={() => onNav("productos")}
        />

        <StatCard
          icon={
            <DashboardStatIcon
              src={pendingOrdersIcon}
              alt={`${vl.order}s pendientes`}
            />
          }
          label={`${vl.order}s pendientes`}
          value={pendingOrders}
          sub={pendingOrders > 0 ? "¡Atención!" : "Todo al día"}
          color={pendingOrders > 0 ? T.amber : T.mid}
          onClick={() => onNav("delivery")}
        />

        <StatCard
          icon={
            <DashboardStatIcon
              src={incomesIcon}
              alt="Ingresos hoy"
            />
          }
          label="Ingresos hoy"
          value={fmtCOP(todayRev)}
          color={T.green}
        />

        <StatCard
          icon={
            <DashboardStatIcon
              src={visitsMenuIcon}
              alt={`Vistas ${vl.catalog.toLowerCase()}`}
            />
          }
          label={`Vistas ${vl.catalog.toLowerCase()}`}
          value={catalogViews}
          sub="↑ Esta semana"
          color={T.blue}
        />
      </div>

      {/* Analytics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <Card
          style={{
            minWidth: 0,
            overflow: "hidden",
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: T.text,
                  letterSpacing: "-.2px",
                }}
              >
                📈 Vistas esta semana
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.mid,
                  marginTop: 4,
                }}
              >
                Evolución de visitas al {vl.catalog.toLowerCase()}
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weekChartData}
                margin={{ top: 8, right: 8, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.coral} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={T.coral} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="d"
                  tick={{ fontSize: 10, fill: T.light }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${T.border}`,
                    fontSize: 11,
                    boxShadow: "0 10px 28px rgba(15,23,42,.08)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={T.coral}
                  fill="url(#gV)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          style={{
            minWidth: 0,
            overflow: "hidden",
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: T.text,
                  letterSpacing: "-.2px",
                }}
              >
                ⭐ Top productos
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.mid,
                  marginTop: 4,
                }}
              >
                Los más vistos por tus clientes
              </div>
            </div>
          </div>

          {topProducts.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {topProducts.map((p, index) => {
                const progress = Math.max(
                  6,
                  Math.round(((p.clicks || 0) / maxProductClicks) * 100)
                );

                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 10,
                        background: vc + "12",
                        border: `1px solid ${vc}20`,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {p.emoji}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          marginBottom: 5,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: T.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {index + 1}. {p.name}
                        </div>

                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: T.mid,
                            flexShrink: 0,
                          }}
                        >
                          {p.clicks || 0}
                        </span>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: 6,
                          background: vc + "12",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${progress}%`,
                            height: "100%",
                            background: T.coral,
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                minHeight: 132,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                border: `1px dashed ${T.border}`,
                borderRadius: 14,
                color: T.mid,
                fontSize: 12,
                padding: 18,
              }}
            >
              Aún no tienes productos con vistas.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}