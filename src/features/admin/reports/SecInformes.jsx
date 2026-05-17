import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import {
  Brain,
  CalendarDays,
  ChartNoAxesCombined,
  Clock3,
  Lightbulb,
  PackageCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { T } from "../../../constants/theme";
import { ANALYTICS_WEEK } from "../../../constants/kanban";
import { fmtCOP } from "../../../utils/format";
import { Card, StatCard, Tag } from "../../../shared/components";

import totalViewsIcon from "../../../assets/total_views.svg";
import weeklyOrdersIcon from "../../../assets/weekly_orders.svg";
import peakHourIcon from "../../../assets/peak_hour.svg";
import averageTicketIcon from "../../../assets/average_ticket.svg";

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

function DashboardStatIcon({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width: 38,
        height: 38,
        objectFit: "contain",
        display: "block",
        filter: "drop-shadow(0 7px 12px rgba(15,23,42,.12))",
      }}
    />
  );
}

function ChartHeader({ icon, title, subtitle, color = T.coral }) {
  return (
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
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 15,
            fontWeight: 900,
            color: T.text,
            letterSpacing: "-.2px",
          }}
        >
          <InlineIcon icon={icon} size={16} color={color} />
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: 11,
              color: T.mid,
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function SecInformes({ products = [] }) {
  const topProduct = [...products]
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .find((p) => p.clicks > 0);

  const insights = [
    {
      icon: TrendingUp,
      color: T.coral,
      tag: "Optimización",
      text:
        "Los viernes y sábados generan el 42% de tus ventas semanales. Considera personal extra esos días.",
    },
    {
      icon: PackageCheck,
      color: T.blue,
      tag: "Producto",
      text: topProduct
        ? `${topProduct.name} está entre los productos con mayor interés. Revisa si está activo en todos tus canales para capturar más ventas.`
        : "Bandeja Paisa tiene 289 vistas pero 0% de domicilios. Agrégala a la carta de delivery para aumentar ingresos.",
    },
    {
      icon: ChartNoAxesCombined,
      color: T.green,
      tag: "Precio",
      text:
        "Tu ticket promedio de $42.000 está 15% por encima del sector. Tus clientes valoran la calidad premium.",
    },
  ];

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <style>
        {`
          @media(max-width:860px){
            .reports-grid{
              grid-template-columns:1fr!important;
            }
          }
        `}
      </style>

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
            <InlineIcon icon={ChartNoAxesCombined} size={13} />
            Analytics
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
            Informes
          </h2>

          <p
            style={{
              color: T.mid,
              fontSize: 13,
              marginTop: 6,
              lineHeight: 1.45,
            }}
          >
            Análisis de desempeño — Abril 2026
          </p>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "9px 12px",
            color: T.mid,
            fontSize: 12,
            fontWeight: 800,
            boxShadow: "0 8px 22px rgba(15,23,42,.04)",
          }}
        >
          <InlineIcon icon={CalendarDays} size={15} color={T.coral} />
          Últimos 7 días
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          icon={<DashboardStatIcon src={totalViewsIcon} alt="Vistas totales" />}
          label="Vistas totales"
          value="1,391"
          sub="↑ 18.3%"
          color={T.coral}
        />

        <StatCard
          icon={
            <DashboardStatIcon
              src={weeklyOrdersIcon}
              alt="Pedidos semana"
            />
          }
          label="Pedidos semana"
          value="246"
          sub="↑ 8.1%"
          color={T.green}
        />

        <StatCard
          icon={<DashboardStatIcon src={peakHourIcon} alt="Hora pico" />}
          label="Hora pico"
          value="8 PM"
          sub="98 visitas/h"
          color={T.amber}
        />

        <StatCard
          icon={
            <DashboardStatIcon
              src={averageTicketIcon}
              alt="Ticket promedio"
            />
          }
          label="Ticket promedio"
          value={fmtCOP(42000)}
          color={T.blue}
        />
      </div>

      <div
        className="reports-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Card
          style={{
            minWidth: 0,
            overflow: "hidden",
            padding: 18,
          }}
        >
          <ChartHeader
            icon={TrendingUp}
            title="Vistas por día"
            subtitle="Evolución de visitas al menú durante la semana"
            color={T.coral}
          />

          <div style={{ width: "100%", height: 175 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={ANALYTICS_WEEK}
                margin={{ top: 8, right: 8, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gA1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.coral} stopOpacity={0.25} />
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
                    borderRadius: 12,
                    border: `1px solid ${T.border}`,
                    fontSize: 11,
                    boxShadow: "0 10px 28px rgba(15,23,42,.08)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={T.coral}
                  fill="url(#gA1)"
                  strokeWidth={2.5}
                  name="Vistas"
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
          <ChartHeader
            icon={Clock3}
            title="Pedidos por día"
            subtitle="Volumen diario de pedidos recibidos"
            color={T.green}
          />

          <div style={{ width: "100%", height: 175 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ANALYTICS_WEEK}
                margin={{ top: 8, right: 8, left: -25, bottom: 0 }}
              >
                <XAxis
                  dataKey="d"
                  tick={{ fontSize: 10, fill: T.light }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: `1px solid ${T.border}`,
                    fontSize: 11,
                    boxShadow: "0 10px 28px rgba(15,23,42,.08)",
                  }}
                  formatter={(v) => [`${v} pedidos`]}
                />

                <Bar
                  dataKey="o"
                  fill={T.green}
                  radius={[7, 7, 0, 0]}
                  name="Pedidos"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontSize: 15,
                fontWeight: 900,
                color: T.text,
              }}
            >
              <SoftIcon icon={Brain} color={T.coral} box={34} size={17} />
              Insights con Inteligencia Artificial
            </div>

            <div
              style={{
                fontSize: 12,
                color: T.mid,
                marginTop: 5,
                paddingLeft: 43,
                lineHeight: 1.45,
              }}
            >
              Recomendaciones rápidas para mejorar ventas, operación y conversión.
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: T.coralL,
              color: T.coral,
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            <InlineIcon icon={Sparkles} size={13} />
            IA
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {insights.map((ins) => (
            <Card
              key={ins.tag}
              style={{
                padding: "15px 16px",
                border: `1px solid ${T.border}`,
                boxShadow: "0 8px 22px rgba(15,23,42,.035)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 13,
                }}
              >
                <SoftIcon icon={ins.icon} color={ins.color} box={46} size={21} />

                <div style={{ flex: 1 }}>
                  <Tag color={ins.color}>{ins.tag}</Tag>

                  <p
                    style={{
                      fontSize: 13,
                      color: T.text,
                      lineHeight: 1.72,
                      marginTop: 7,
                    }}
                  >
                    {ins.text}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "11px 13px",
            color: T.mid,
            fontSize: 11,
            lineHeight: 1.5,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <InlineIcon icon={Lightbulb} size={15} color={T.amber} />
          Estos insights son sugerencias automáticas basadas en comportamiento,
          vistas y patrones de venta.
        </div>
      </Card>
    </div>
  );
}

/* ─── ADMIN: ASISTENTE IA ─────────────────────────────────── */