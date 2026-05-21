import { useMemo } from "react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T } from "../../constants/theme";
import { fmtCOP } from "../../utils/format";
import { Store, DollarSign, Calendar, AlertCircle, Zap, Ticket, CheckCircle2, CreditCard, UserPlus, AlertTriangle } from "lucide-react";
import { Card, StatCard } from "../../shared/components";

const PLAN_COLORS = { starter: T.blue, pro: T.violet || "#7c3aed", business: T.pink || "#ec4899", enterprise: T.coral };

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
}

function activityMeta(item) {
  switch (item.type) {
    case "payment_approved":
      return { icon: CheckCircle2, color: T.green,  text: `Pago aprobado: ${item.name} — Plan ${item.plan} ${item.amount ? fmtCOP(item.amount) : ""}` };
    case "payment_rejected":
      return { icon: AlertTriangle, color: T.red,   text: `Pago rechazado: ${item.name}` };
    case "payment_pending":
      return { icon: CreditCard,   color: T.amber,  text: `Solicitud de pago: ${item.name} — Plan ${item.plan}` };
    case "new_registration":
      return { icon: UserPlus,     color: T.indigo, text: `${item.name} se registró — Plan ${item.plan}` };
    default:
      return { icon: Store,        color: T.mid,    text: item.name };
  }
}

export function CEODash({ restaurants, tickets, ceoStats }) {
  const active    = restaurants.filter(r => r.status === "active");
  const suspended = restaurants.filter(r => r.status === "suspended");
  const trial     = restaurants.filter(r => r.status === "trial");
  const mrr       = active.reduce((s, r) => s + r.mrr, 0);

  // MRR growth % vs previous month
  const trend    = ceoStats?.mrrTrend || [];
  const mrrGrowth = useMemo(() => {
    if (trend.length < 2) return null;
    const prev = trend[trend.length - 2]?.mrr || 0;
    const curr = trend[trend.length - 1]?.mrr || 0;
    if (!prev) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }, [trend]);

  // Plan distribution computed from real restaurants
  const planDist = useMemo(() => {
    const counts = {};
    restaurants.forEach(r => { counts[r.plan] = (counts[r.plan] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: PLAN_COLORS[name] || T.mid,
    }));
  }, [restaurants]);

  const activity = ceoStats?.recentActivity || [];

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: T.text }}>Dashboard Global</h1>
        <p style={{ color: T.mid, fontSize: 13, marginTop: 3 }}>
          {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {suspended.length > 0 && (
        <div style={{ background: "linear-gradient(135deg,#fee2e2,#fecaca)", border: "1.5px solid #fca5a5", borderRadius: 14, padding: "13px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertCircle size={20} color="#991b1b" />
          <div>
            <div style={{ fontWeight: 800, color: "#991b1b", fontSize: 13 }}>
              {suspended.length} negocio{suspended.length > 1 ? "s" : ""} suspendido{suspended.length > 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: 12, color: "#b91c1c" }}>{suspended.map(r => r.name).join(", ")} — requieren atención urgente</div>
          </div>
        </div>
      )}

      {trial.length > 0 && (
        <div style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "1.5px solid #fcd34d", borderRadius: 14, padding: "12px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={18} color="#92400e" />
          <div style={{ fontWeight: 700, color: "#92400e", fontSize: 13 }}>
            {trial.map(r => r.name).join(", ")} en trial — {trial.map(r => `${r.daysLeft ?? "?"}d`).join(", ")} restantes
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard icon={Store}       label="Negocios activos"   value={active.length}    sub={`${restaurants.length} total`} color={T.indigo} />
        <StatCard icon={DollarSign}  label="MRR"                value={fmtCOP(mrr)}      sub={mrrGrowth !== null ? `${mrrGrowth >= 0 ? "↑" : "↓"} ${Math.abs(mrrGrowth)}% vs mes anterior` : "Sin datos previos"} color={T.green} />
        <StatCard icon={Calendar}    label="ARR estimado"       value={fmtCOP(mrr * 12)} color={T.coral} />
        <StatCard icon={AlertCircle} label="Suspendidos"        value={suspended.length} color={suspended.length > 0 ? T.red : T.mid} />
        <StatCard icon={Zap}         label="En trial"           value={trial.length}     color={T.amber} />
        <StatCard icon={Ticket}      label="Tickets abiertos"   value={tickets.filter(t => t.status === "open").length} color={T.blue} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 18 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 14 }}>MRR — Últimos 7 meses</div>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={T.indigo} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={T.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: T.light }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9, fill: T.light }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 11 }} formatter={v => [fmtCOP(v), "MRR"]} />
                <Area type="monotone" dataKey="mrr" stroke={T.indigo} fill="url(#gMrr)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: T.light, fontSize: 13 }}>Sin datos de pagos aún</div>
          )}
        </Card>

        <Card style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 14 }}>Distribución de planes</div>
          {planDist.length > 0 ? (<>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PieChart width={190} height={150}>
                <Pie data={planDist} cx={95} cy={75} innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {planDist.map(p => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip formatter={v => [`${v} negocio${v !== 1 ? "s" : ""}`]} />
              </PieChart>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {planDist.map(p => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                  <span style={{ color: T.mid }}>{p.name}: <strong>{p.value}</strong></span>
                </div>
              ))}
            </div>
          </>) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.light, fontSize: 13 }}>Sin negocios aún</div>
          )}
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 14 }}>Actividad reciente</div>
        {activity.length === 0 ? (
          <div style={{ color: T.light, fontSize: 13, padding: "12px 0" }}>No hay actividad reciente</div>
        ) : activity.map((a, i) => {
          const { icon: Icon, color, text } = activityMeta(a);
          return (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={14} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{text}</div>
                <div style={{ fontSize: 11, color: T.light, marginTop: 2 }}>{timeAgo(a.time)}</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ─── CEO: RESTAURANTES ───────────────────────────────────── */
