import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Database,
  Loader2,
  MessageSquareText,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  ReceiptText,
  Send,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";

import { T } from "../../../constants/theme";
import { fmtCOP, newId } from "../../../utils/format";
import { Card, Btn } from "../../../shared/components";
import { supabase } from "../../../lib/supabase";

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

function AiAvatar({ size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size / 2.6),
        background: `linear-gradient(135deg,${T.coral},${T.pink})`,
        display: "grid",
        placeItems: "center",
        color: "#fff",
        boxShadow: `0 10px 24px ${T.coral}30`,
        flexShrink: 0,
      }}
    >
      <Bot size={Math.round(size * 0.5)} strokeWidth={2.4} />
    </div>
  );
}

function ContextChip({ icon, label, value, color = T.coral }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 999,
        padding: "7px 10px",
        boxShadow: "0 7px 18px rgba(15,23,42,.035)",
      }}
    >
      <InlineIcon icon={icon} size={14} color={color} />
      <span
        style={{
          fontSize: 11,
          color: T.mid,
          fontWeight: 800,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 11,
          color: T.text,
          fontWeight: 900,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderMd(text, color = T.text) {
  const safe = escapeHtml(text);

  return safe.split("\n").map((line, i) => {
    const html = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /`(.*?)`/g,
        "<code style='background:#f0f2f8;padding:1px 5px;border-radius:4px;font-size:11px'>$1</code>"
      );

    if (!line.trim()) {
      return <div key={i} style={{ height: 6 }} />;
    }

    return (
      <p
        key={i}
        style={{
          margin: "1px 0",
          fontSize: 13,
          lineHeight: 1.72,
          color,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

export function SecAI({
  products = [],
  orders = [],
  cats = [],
  config,
  branches = [],
  onAddProduct,
  onUpdateProduct,
}) {
  const WELCOME =
    "¡Hola! Soy tu asistente de gestión.\n\nTengo acceso a tus datos del negocio y puedo ayudarte a:\n\n• **Analizar ventas:** ingresos, tendencias y hora pico.\n• **Entender clientes:** clientes frecuentes y ticket promedio.\n• **Revisar productos:** más vendidos, precios y disponibilidad.\n• **Preparar cambios:** actualizar precios, activar, desactivar o agregar productos.\n\nPrueba con: *¿Cuánto vendí este mes?* o *Sube el precio de la Bandeja a $42.000*.";

  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      text: WELCOME,
      acts: [],
      type: "text",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingActs, setPendingActs] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === "entregado"),
    [orders]
  );

  const totalRevenue = useMemo(
    () => deliveredOrders.reduce((s, o) => s + (o.total || 0), 0),
    [deliveredOrders]
  );

  const avgTicket = deliveredOrders.length
    ? Math.round(totalRevenue / deliveredOrders.length)
    : 0;

  const pendingOrders = orders.filter((o) => o.status === "pendiente").length;

  const QUICK = [
    {
      icon: BarChart3,
      label: "¿Cuánto vendí este mes?",
    },
    {
      icon: Users,
      label: "¿Quién es el cliente que más pide?",
    },
    {
      icon: PackageCheck,
      label: "¿Cuáles son los productos más vendidos?",
    },
    {
      icon: AlertTriangle,
      label: "¿Qué productos están agotados?",
    },
    {
      icon: Pencil,
      label: "Sube el precio de la Bandeja Paisa a $42.000",
    },
    {
      icon: Plus,
      label: "Agrega jugo de lulo a $8.000",
    },
  ];

  const buildCtx = () => {
    const delivered = orders.filter((o) => o.status === "entregado");
    const totalRev = delivered.reduce((s, o) => s + (o.total || 0), 0);
    const avgTicket = delivered.length ? Math.round(totalRev / delivered.length) : 0;

    const custMap = {};

    orders.forEach((o) => {
      const n = o.customerName || "Anónimo";

      if (!custMap[n]) {
        custMap[n] = {
          pedidos: 0,
          total: 0,
          ultimoPedido: o.date || "",
        };
      }

      custMap[n].pedidos++;
      custMap[n].total += o.total || 0;

      if ((o.date || "") > custMap[n].ultimoPedido) {
        custMap[n].ultimoPedido = o.date || "";
      }
    });

    const topClientes = Object.entries(custMap)
      .sort((a, b) => b[1].pedidos - a[1].pedidos)
      .slice(0, 8)
      .map(([nombre, d]) => ({
        nombre,
        ...d,
      }));

    const prodSales = {};

    orders.forEach((o) =>
      (o.items || []).forEach((it) => {
        const k = it.name || it.productId;

        if (!prodSales[k]) {
          prodSales[k] = {
            qty: 0,
            revenue: 0,
          };
        }

        prodSales[k].qty += it.qty || 1;
        prodSales[k].revenue += (it.price || 0) * (it.qty || 1);
      })
    );

    const topProductos = Object.entries(prodSales)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 8)
      .map(([nombre, d]) => ({
        nombre,
        ...d,
      }));

    const porModo = {
      menu: 0,
      domicilio: 0,
      mesa: 0,
    };

    orders.forEach((o) => {
      const m = o.mode || "menu";
      porModo[m] = (porModo[m] || 0) + 1;
    });

    const porDia = {};

    orders.forEach((o) => {
      if (o.createdAt || o.date) {
        const d = new Date(o.createdAt || o.date);
        const dia = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][
          d.getDay()
        ];

        if (!porDia[dia]) {
          porDia[dia] = {
            pedidos: 0,
            ingresos: 0,
          };
        }

        porDia[dia].pedidos++;
        porDia[dia].ingresos += o.total || 0;
      }
    });

    return {
      restaurante: config.name,
      resumen: {
        totalPedidos: orders.length,
        pedidosEntregados: delivered.length,
        ingresosTotales: totalRev,
        ticketPromedio: avgTicket,
        pendientes: orders.filter((o) => o.status === "pendiente").length,
      },
      topClientes,
      topProductos,
      distribucionModo: porModo,
      ventasPorDia: porDia,
      productos: products.map((p) => ({
        id: p.id,
        nombre: p.name,
        precio: p.price,
        categoria: cats.find((c) => c.id === p.catId)?.name || p.catId,
        activo: p.active,
        enStock: p.stock,
        clicks: p.clicks,
      })),
      categorias: cats.map((c) => ({
        id: c.id,
        nombre: c.name,
      })),
      ultimosPedidos: orders.slice(-30).map((o) => ({
        id: o.id,
        cliente: o.customerName,
        total: o.total,
        estado: o.status,
        modo: o.mode,
        fecha: o.date || o.createdAt?.split("T")[0] || "",
      })),
    };
  };

  const SYS = () => `Eres el asistente IA de gestión para "${
    config.name || "el restaurante"
  }". Tienes acceso completo a todos los datos en tiempo real.

DATOS ACTUALES:
${JSON.stringify(buildCtx())}

RESPONDE SIEMPRE con JSON válido sin backticks, exactamente en este formato:
{"message":"texto claro y útil","actions":[],"confirmNeeded":false}

ACCIONES DISPONIBLES (incluir en "actions" cuando corresponda):
• Cambiar precio: {"type":"update","id":"p1","patch":{"price":42000},"preview":"Bandeja Paisa: $38.000 → $42.000"}
• Activar: {"type":"update","id":"p1","patch":{"active":true},"preview":"Activar: Bandeja Paisa"}
• Desactivar: {"type":"update","id":"p1","patch":{"active":false},"preview":"Desactivar: Bandeja Paisa"}
• Marcar agotado: {"type":"update","id":"p1","patch":{"stock":false},"preview":"Agotado: Bandeja Paisa"}
• Marcar disponible: {"type":"update","id":"p1","patch":{"stock":true},"preview":"Disponible: Bandeja Paisa"}
• Agregar: {"type":"add","data":{name,price,desc,catId,emoji,active:true,stock:true,featured:false,label:"",allergens:[]},"preview":"Agregar: [nombre] $[precio]"}

REGLAS CRÍTICAS:
1. Para cambios de precio/estado: pon "confirmNeeded":true y la acción lista. NO ejecutes sin confirmación.
2. Si el usuario dice "sí", "confirmar", "dale", "hazlo": pon "confirmNeeded":false y las mismas acciones listas.
3. Para reportes: usa los números EXACTOS de los datos. Sé específico con cifras.
4. Habla en español colombiano, amigable y directo. Máximo 4 oraciones.
5. Usa formato markdown: **negrita** para números importantes, listas con •`;

  const runActions = async (acts = []) => {
    const done = [];

    for (const a of acts) {
      if (a.type === "update" && a.id) {
        await onUpdateProduct(a.id, a.patch);
        done.push(a.preview || "Producto actualizado");
      } else if (a.type === "add" && a.data) {
        await onAddProduct({
          ...a.data,
          id: newId(),
          img: "",
          clicks: 0,
          labelColor: "#f97316",
          allergens: a.data.allergens || [],
        });
        done.push(a.preview || "Producto agregado");
      }
    }

    return done;
  };

  const cancelPending = () => {
    setPendingActs(null);
    setMsgs((p) => [
      ...p,
      {
        role: "assistant",
        text: "De acuerdo, cancelé los cambios. ¿En qué más te puedo ayudar?",
        acts: [],
        type: "text",
      },
    ]);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const confirmPending = async () => {
    if (!pendingActs || loading) return;

    setLoading(true);

    setMsgs((p) => [
      ...p,
      {
        role: "user",
        text: "Confirmar cambios",
        acts: [],
        type: "text",
      },
    ]);

    const done = await runActions(pendingActs);

    setPendingActs(null);

    setMsgs((p) => [
      ...p,
      {
        role: "assistant",
        text: `Listo. Realicé **${done.length}** cambio${
          done.length !== 1 ? "s" : ""
        } exitosamente.`,
        acts: done,
        type: "text",
      },
    ]);

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const send = async (overrideText) => {
    const txt = (overrideText || input).trim();

    if (!txt || loading) return;

    const normalized = txt.toLowerCase();

    if (pendingActs && ["sí", "si", "confirmar", "dale", "hazlo"].includes(normalized)) {
      if (!overrideText) setInput("");
      await confirmPending();
      return;
    }

    if (pendingActs && ["no", "cancelar", "cancela"].includes(normalized)) {
      if (!overrideText) setInput("");
      cancelPending();
      return;
    }

    if (!overrideText) setInput("");

    setLoading(true);

    setMsgs((p) => [
      ...p,
      {
        role: "user",
        text: txt,
        acts: [],
        type: "text",
      },
    ]);

    try {
      // Llamar a la Edge Function de Supabase (API key guardada de forma segura en el servidor)
      const { data, error: fnError } = await supabase.functions.invoke("ai-chat", {
        body: { system: SYS(), message: txt },
      });

      if (fnError) throw new Error(fnError.message || "Error en Edge Function");
      if (data?.error) throw new Error(data.error);

      const raw = (data?.content?.[0]?.text || "{}")
        .replace(/```json\n?|```/g, "")
        .trim();

      let parsed = {
        message: "Listo.",
        actions: [],
        confirmNeeded: false,
      };

      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {
          message: raw.slice(0, 700),
          actions: [],
          confirmNeeded: false,
        };
      }

      const acts = parsed.actions || [];

      if (parsed.confirmNeeded && acts.length > 0) {
        setPendingActs(acts);

        setMsgs((p) => [
          ...p,
          {
            role: "assistant",
            text: parsed.message || "",
            acts: [],
            type: "confirm",
            pendingActs: acts,
          },
        ]);
      } else {
        const done = await runActions(acts);

        setPendingActs(null);

        setMsgs((p) => [
          ...p,
          {
            role: "assistant",
            text: parsed.message || "",
            acts: done,
            type: "text",
          },
        ]);
      }
    } catch (e) {
      setMsgs((p) => [
        ...p,
        {
          role: "assistant",
          text: `No se pudo conectar con el asistente. Detalle: ${
            e.message || "error desconocido"
          }. Verifica tu clave de API.`,
          acts: [],
          type: "text",
        },
      ]);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
        animation: "fadeUp .35s ease",
      }}
    >
      <style>
        {`
          @media(max-width:760px){
            .ai-header{
              flex-direction:column!important;
              align-items:flex-start!important;
            }

            .ai-context{
              width:100%!important;
              overflow-x:auto!important;
              padding-bottom:2px!important;
            }

            .ai-message{
              max-width:92%!important;
            }

            .ai-input-row{
              gap:6px!important;
            }
          }

          @keyframes dotPulse {
            0%, 80%, 100% {
              transform: scale(.7);
              opacity: .45;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

      <div
        className="ai-header"
        style={{
          marginBottom: 14,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AiAvatar size={44} />

          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: T.coralL,
                border: `1px solid ${T.coral}22`,
                color: T.coral,
                borderRadius: 999,
                padding: "4px 9px",
                marginBottom: 7,
                fontSize: 10,
                fontWeight: 900,
              }}
            >
              <InlineIcon icon={Sparkles} size={12} />
              Copiloto operativo
            </div>

            <h2
              style={{
                fontSize: 23,
                lineHeight: 1.1,
                fontWeight: 900,
                color: T.text,
                margin: 0,
                letterSpacing: "-.4px",
              }}
            >
              Asistente IA
            </h2>

            <p
              style={{
                color: T.mid,
                fontSize: 12,
                margin: "5px 0 0",
                lineHeight: 1.4,
              }}
            >
              Datos en tiempo real · acciones con confirmación · respuestas en
              español
            </p>
          </div>
        </div>

        <div
          className="ai-context"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <ContextChip icon={ReceiptText} label="Pedidos" value={orders.length} />
          <ContextChip icon={Package} label="Productos" value={products.length} color={T.blue} />
          <ContextChip icon={Database} label="Categorías" value={cats.length} color={T.green} />
          <ContextChip icon={TrendingUp} label="Ventas" value={fmtCOP(totalRevenue)} color={T.amber} />
        </div>
      </div>

      <Card
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          minHeight: 0,
          borderRadius: 22,
          boxShadow: "0 14px 38px rgba(15,23,42,.06)",
        }}
      >
        <div
          style={{
            padding: "12px 15px",
            borderBottom: `1px solid ${T.border}`,
            background: T.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 12,
              fontWeight: 900,
              color: T.text,
            }}
          >
            <SoftIcon icon={Brain} color={T.coral} box={32} size={16} />
            Chat de gestión
          </div>

          <div
            style={{
              display: "flex",
              gap: 7,
              alignItems: "center",
              fontSize: 11,
              color: pendingOrders > 0 ? T.amber : T.green,
              fontWeight: 900,
              background: pendingOrders > 0 ? T.amberL : T.greenL,
              borderRadius: 999,
              padding: "5px 9px",
            }}
          >
            <InlineIcon
              icon={pendingOrders > 0 ? AlertTriangle : CheckCircle2}
              size={13}
            />
            {pendingOrders} pendiente{pendingOrders !== 1 ? "s" : ""}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 16px 10px",
            background:
              "linear-gradient(180deg, rgba(249,250,251,.7), rgba(255,255,255,1))",
          }}
        >
          {msgs.map((m, i) => {
            const isUser = m.role === "user";

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  marginBottom: 15,
                  alignItems: "flex-end",
                  gap: 9,
                }}
              >
                {!isUser && <AiAvatar size={30} />}

                <div className="ai-message" style={{ maxWidth: "78%" }}>
                  <div
                    style={{
                      padding: "12px 15px",
                      borderRadius: isUser
                        ? "17px 17px 5px 17px"
                        : "17px 17px 17px 5px",
                      background: isUser
                        ? `linear-gradient(135deg,${T.coral},${T.pink})`
                        : T.white,
                      color: isUser ? "#fff" : T.text,
                      border: isUser ? "none" : `1px solid ${T.border}`,
                      boxShadow: isUser
                        ? `0 12px 24px ${T.coral}24`
                        : "0 8px 22px rgba(15,23,42,.045)",
                    }}
                  >
                    {renderMd(m.text, isUser ? "#fff" : T.text)}
                  </div>

                  {m.acts?.length > 0 && (
                    <div
                      style={{
                        marginTop: 7,
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {m.acts.map((a, j) => (
                        <div
                          key={j}
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            background: T.greenL,
                            color: T.green,
                            borderRadius: 10,
                            padding: "6px 10px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            border: `1px solid ${T.green}22`,
                          }}
                        >
                          <InlineIcon icon={CheckCircle2} size={13} />
                          {a}
                        </div>
                      ))}
                    </div>
                  )}

                  {m.type === "confirm" && m.pendingActs && pendingActs && (
                    <div
                      style={{
                        marginTop: 9,
                        background: T.amberL,
                        border: `1.5px solid ${T.amber}44`,
                        borderRadius: 15,
                        padding: "13px 14px",
                        boxShadow: "0 10px 24px rgba(15,23,42,.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 12,
                          fontWeight: 900,
                          color: T.amber,
                          marginBottom: 9,
                        }}
                      >
                        <InlineIcon icon={AlertTriangle} size={15} />
                        Confirma los siguientes cambios
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: 6,
                          marginBottom: 11,
                        }}
                      >
                        {m.pendingActs.map((a, j) => (
                          <div
                            key={j}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 7,
                              fontSize: 12,
                              color: T.text,
                              background: "rgba(255,255,255,.58)",
                              border: `1px solid ${T.amber}20`,
                              borderRadius: 10,
                              padding: "8px 9px",
                              lineHeight: 1.45,
                            }}
                          >
                            <InlineIcon icon={Wand2} size={13} color={T.amber} />
                            {a.preview || a.type}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={confirmPending}
                          disabled={loading}
                          style={{
                            flex: 1,
                            padding: "9px 0",
                            background: T.green,
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            fontWeight: 900,
                            fontSize: 12,
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <InlineIcon icon={Check} size={14} />
                          Confirmar
                        </button>

                        <button
                          type="button"
                          onClick={cancelPending}
                          style={{
                            flex: 1,
                            padding: "9px 0",
                            background: T.redL,
                            color: T.red,
                            border: `1px solid ${T.red}30`,
                            borderRadius: 10,
                            fontWeight: 900,
                            fontSize: 12,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <InlineIcon icon={X} size={14} />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 11,
                      background: T.bg,
                      color: T.mid,
                      display: "grid",
                      placeItems: "center",
                      border: `1px solid ${T.border}`,
                      flexShrink: 0,
                    }}
                  >
                    <User size={15} strokeWidth={2.35} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 9,
                marginBottom: 10,
              }}
            >
              <AiAvatar size={30} />

              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: "17px 17px 17px 5px",
                  padding: "12px 16px",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  boxShadow: "0 8px 22px rgba(15,23,42,.045)",
                }}
              >
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: T.coral,
                      animation: `dotPulse 1.2s ease ${j * 0.2}s infinite`,
                    }}
                  />
                ))}

                <span
                  style={{
                    fontSize: 11,
                    color: T.mid,
                    marginLeft: 5,
                    fontWeight: 700,
                  }}
                >
                  Analizando datos…
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div
          style={{
            padding: "9px 14px 7px",
            display: "flex",
            gap: 7,
            overflowX: "auto",
            borderTop: `1px solid ${T.border}55`,
            background: T.white,
          }}
        >
          {QUICK.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (!loading) {
                  setInput(label);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }
              }}
              style={{
                flexShrink: 0,
                padding: "7px 11px",
                borderRadius: 999,
                border: `1px solid ${T.border}`,
                background: T.white,
                color: T.mid,
                fontSize: 10,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                transition: "all .15s",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <InlineIcon icon={Icon} size={12} color={T.coral} />
              {label}
            </button>
          ))}
        </div>

        <div
          className="ai-input-row"
          style={{
            padding: "12px 14px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            gap: 9,
            background: T.white,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              pendingActs
                ? "Escribe confirmar o cancelar..."
                : "Pregunta algo sobre tu negocio o pide un cambio..."
            }
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 14px",
              background: T.bg,
              border: `1.5px solid ${loading || pendingActs ? T.coral : T.border}`,
              borderRadius: 13,
              fontSize: 13,
              color: T.text,
              outline: "none",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              transition: "border-color .2s",
            }}
          />

          <button
            type="button"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background:
                !loading && input.trim()
                  ? `linear-gradient(135deg,${T.coral},${T.pink})`
                  : T.bg,
              border: "none",
              color: !loading && input.trim() ? "#fff" : T.light,
              display: "grid",
              placeItems: "center",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all .2s",
              flexShrink: 0,
              boxShadow:
                !loading && input.trim()
                  ? `0 10px 22px ${T.coral}28`
                  : "none",
            }}
          >
            {loading ? (
              <Loader2
                size={18}
                strokeWidth={2.4}
                style={{ animation: "spin .8s linear infinite" }}
              />
            ) : (
              <Send size={18} strokeWidth={2.4} />
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ─── MENU PREVIEW (sidebar time-real) ───────────────────── */