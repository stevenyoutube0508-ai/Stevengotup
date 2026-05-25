import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Database,
  Image,
  Kanban,
  Layers,
  Loader2,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Send,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Wand2,
  X,
} from "lucide-react";

import { T } from "../../../constants/theme";
import { fmtCOP, newId } from "../../../utils/format";
import { Card } from "../../../shared/components";
import { supabase } from "../../../lib/supabase";

/* ─── GUÍA DE LA PLATAFORMA (constante fuera del componente) ─── */
const PLATFORM_GUIDE = `
GUÍA COMPLETA DE LA PLATAFORMA (usa esto para ayudar cuando el usuario pregunte CÓMO hacer algo):

=== SECCIÓN: INICIO (Home) ===
- Muestra un resumen del negocio: ingresos totales, pedidos, ticket promedio, productos activos.
- Hay tarjetas de acceso rápido a cada sección del panel.
- Muestra los últimos pedidos recientes.

=== SECCIÓN: PRODUCTOS ===
- Para AGREGAR un producto: clic en el botón "+ Nuevo producto" (arriba a la derecha) → llenar nombre, precio, categoría, descripción, imagen → guardar.
- Para EDITAR un producto: clic sobre la tarjeta del producto → se abre el modal → modificar campos → guardar.
- Para ELIMINAR: dentro del modal del producto, botón "Eliminar" (rojo, al final del formulario).
- Para ACTIVAR / DESACTIVAR rápido: toggle directamente en la tarjeta (sin abrir el modal).
- Campos disponibles: nombre, precio, descripción, imagen, categoría, etiqueta especial (Nuevo/Popular/Oferta/etc.), alérgenos, producto destacado, disponibilidad en stock.
- Los productos "Destacados" aparecen en la parte superior del menú del cliente.

=== SECCIÓN: CATEGORÍAS ===
- Para AGREGAR: botón "+ Nueva categoría" → nombre y emoji → guardar.
- Para EDITAR o ELIMINAR: clic sobre la tarjeta de la categoría → modal de edición.
- Para REORDENAR las categorías: arrastrar y soltar las tarjetas.
- Las categorías agrupan los productos en el menú del cliente.

=== SECCIÓN: STOCK ===
- Vista rápida para marcar productos como disponibles o agotados.
- Toggle verde = disponible, toggle rojo/gris = agotado.
- Los productos agotados muestran "Agotado" en el menú del cliente y no se pueden pedir.
- Ideal para actualizar disponibilidad al inicio o cierre del día.

=== SECCIÓN: DISEÑO (Personalización del menú) ===
- Cambiar color primario del menú: selector de color en "Color principal".
- Subir LOGO: botón de carga de imagen en "Logo del restaurante".
- Subir IMAGEN DE FONDO o portada: PhotoInput en "Imagen de fondo".
- Cambiar TIPOGRAFÍA: menú desplegable de fuentes.
- Hay una vista previa del menú en tiempo real.
- Al terminar los cambios, clic en "Guardar cambios" para aplicarlos al menú público.

=== SECCIÓN: BANNERS ===
- Los banners son imágenes promocionales que aparecen como carrusel en la parte superior del menú del cliente.
- Para AGREGAR un banner: botón "+ Nuevo banner" → subir imagen → título y descripción opcionales → guardar.
- Para REORDENAR: arrastrar y soltar.
- Para ACTIVAR / DESACTIVAR un banner: toggle en la tarjeta.
- Para ELIMINAR: icono de papelera en la tarjeta del banner.

=== SECCIÓN: PEDIDOS (Delivery / Kanban) ===
- Tablero Kanban con 4 columnas: Pendiente → En preparación → En camino → Entregado.
- Para MOVER un pedido al siguiente estado: clic en el pedido → botón "Siguiente estado" o arrastrar la tarjeta.
- Los pedidos nuevos entran siempre en "Pendiente".
- Para ver DETALLES de un pedido: clic sobre la tarjeta.
- Los pedidos muestran: cliente, items, total, modo (mesa/delivery/menú), hora.
- Para filtrar por fecha o estado usar los filtros en la parte superior.

=== SECCIÓN: SUCURSALES ===
- Administrar múltiples puntos de venta o zonas de delivery.
- Para AGREGAR una sucursal: botón "+ Nueva sucursal" → nombre, dirección, horarios, zona de cobertura.
- El mapa interactivo permite dibujar un polígono que define la zona de delivery de cada sucursal.
- Para EDITAR o ELIMINAR: clic sobre la tarjeta de la sucursal.

=== SECCIÓN: INFORMES ===
- Muestra estadísticas de ventas, productos más vendidos, ingresos, ticket promedio.
- Gráfica de ventas y vistas del catálogo de los últimos 7 días.
- "Vistas" = cuántas veces abrieron el menú público en los últimos 7 días.
- "Clicks" en productos = cuántas veces abrieron la ficha de un producto.
- Los datos de vistas son en tiempo real (se registran cuando los clientes abren el menú).

=== SECCIÓN: IA (esta sección) ===
- Puedes hacer preguntas en lenguaje natural sobre el negocio.
- Puedes pedir análisis: ventas, clientes frecuentes, productos más vendidos, etc.
- Puedes pedir CAMBIOS a productos: precio, activar, desactivar, marcar agotado, agregar productos nuevos.
- IMPORTANTE: Los cambios de productos siempre piden confirmación antes de aplicarse.
- Escribe "confirmar" o "sí" para aprobar un cambio, "no" o "cancelar" para rechazarlo.

=== SECCIÓN: FACTURACIÓN ===
- Muestra el plan actual, fecha de renovación e historial de pagos.
- Para cambiar de plan o reportar un problema de pago: usar el botón de contacto con soporte.

=== MENÚ PÚBLICO (lo que ven los clientes) ===
- La URL del menú público es única por restaurante (se comparte con los clientes).
- Los clientes pueden ver el catálogo, ver detalles de cada producto, y hacer pedidos.
- Los cambios de diseño, productos y banners se reflejan inmediatamente en el menú público.
`;

/* ─── Helpers visuales ──────────────────────────────────────── */
function InlineIcon({ icon: Icon, size = 14, color = "currentColor", style }) {
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={2.35}
      style={{ flexShrink: 0, verticalAlign: "-2px", ...style }}
    />
  );
}

function SoftIcon({ icon: Icon, color = T.coral, size = 18, box = 38, style }) {
  return (
    <div
      style={{
        width: box, height: box,
        borderRadius: Math.round(box / 3),
        background: `${color}15`, color,
        display: "grid", placeItems: "center", flexShrink: 0,
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
        width: size, height: size,
        borderRadius: Math.round(size / 2.6),
        background: `linear-gradient(135deg,${T.coral},${T.pink})`,
        display: "grid", placeItems: "center",
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
        display: "inline-flex", alignItems: "center", gap: 7,
        background: T.white, border: `1px solid ${T.border}`,
        borderRadius: 999, padding: "7px 10px",
        boxShadow: "0 7px 18px rgba(15,23,42,.035)",
      }}
    >
      <InlineIcon icon={icon} size={14} color={color} />
      <span style={{ fontSize: 11, color: T.mid, fontWeight: 800 }}>{label}</span>
      <span style={{ fontSize: 11, color: T.text, fontWeight: 900 }}>{value}</span>
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
    if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
    return (
      <p
        key={i}
        style={{ margin: "1px 0", fontSize: 13, lineHeight: 1.72, color }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

/* ─── Mensaje de error amigable ─────────────────────────────── */
function friendlyError(err) {
  const msg = err?.message || String(err);
  if (msg.includes("No hay API key") || msg.includes("API key"))
    return "⚙️ El asistente no tiene una clave de API configurada. Pide al administrador que configure `MISTRAL_API_KEY` o `ANTHROPIC_API_KEY` en Supabase → Edge Functions → Secrets.";
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch"))
    return "📡 Sin conexión. Verifica tu internet e intenta de nuevo.";
  if (msg.includes("JWT") || msg.includes("session") || msg.includes("401"))
    return "🔐 Sesión expirada. Recarga la página e inicia sesión de nuevo.";
  if (msg.includes("timeout") || msg.includes("504"))
    return "⏱️ El asistente tardó demasiado en responder. Intenta con una pregunta más corta.";
  return `❌ Error: ${msg}`;
}

/* ─── Parsear respuesta IA de forma robusta ─────────────────── */
function parseAIResponse(raw) {
  // 1. Limpiar markdown code fences
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // 2. Intentar parsear directo
  try {
    return JSON.parse(cleaned);
  } catch { /* sigue */ }

  // 3. Extraer primer objeto JSON del texto
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch { /* sigue */ }
  }

  // 4. Fallback: usar el texto como mensaje
  return {
    message: cleaned.slice(0, 800),
    actions: [],
    confirmNeeded: false,
  };
}

/* ─── Componente principal ──────────────────────────────────── */
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
    "¡Hola! Soy tu asistente de gestión.\n\nTengo acceso a tus datos del negocio y también puedo guiarte en cómo usar cualquier función de la plataforma.\n\n**Puedo ayudarte a:**\n• **Analizar tu negocio:** ventas, ingresos, tendencias y clientes frecuentes.\n• **Gestionar productos:** subir precios, activar, desactivar o agregar productos.\n• **Guiarte en la plataforma:** cómo usar pedidos, diseño, banners, sucursales, etc.\n\nPrueba: *¿Cuánto vendí este mes?* o *¿Cómo agrego un producto nuevo?*";

  const [msgs, setMsgs] = useState([
    { role: "assistant", text: WELCOME, acts: [], type: "text" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingActs, setPendingActs] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  /* ── Métricas del header ── */
  const deliveredOrders = useMemo(
    () => (orders || []).filter((o) => o.status === "entregado"),
    [orders]
  );
  const totalRevenue = useMemo(
    () => deliveredOrders.reduce((s, o) => s + (o.total || 0), 0),
    [deliveredOrders]
  );
  const pendingOrders = (orders || []).filter((o) => o.status === "pendiente").length;

  /* ── Contexto del negocio (memoizado — solo recalcula si cambian datos) ── */
  const businessCtx = useMemo(() => {
    const safeOrders   = orders   || [];
    const safeProducts = products || [];
    const safeCats     = cats     || [];

    const delivered = safeOrders.filter((o) => o.status === "entregado");
    const totalRev  = delivered.reduce((s, o) => s + (o.total || 0), 0);
    const avg       = delivered.length ? Math.round(totalRev / delivered.length) : 0;

    // Clientes
    const custMap = {};
    safeOrders.forEach((o) => {
      const n = o.customerName || "Anónimo";
      if (!custMap[n]) custMap[n] = { pedidos: 0, total: 0, ultimoPedido: "" };
      custMap[n].pedidos++;
      custMap[n].total += o.total || 0;
      if ((o.date || "") > custMap[n].ultimoPedido) custMap[n].ultimoPedido = o.date || "";
    });
    const topClientes = Object.entries(custMap)
      .sort((a, b) => b[1].pedidos - a[1].pedidos)
      .slice(0, 8)
      .map(([nombre, d]) => ({ nombre, ...d }));

    // Productos por ventas
    const prodSales = {};
    safeOrders.forEach((o) =>
      (o.items || []).forEach((it) => {
        const k = it.name || it.productId || "?";
        if (!prodSales[k]) prodSales[k] = { qty: 0, revenue: 0 };
        prodSales[k].qty     += it.qty    || 1;
        prodSales[k].revenue += (it.price || 0) * (it.qty || 1);
      })
    );
    const topProductos = Object.entries(prodSales)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 8)
      .map(([nombre, d]) => ({ nombre, ...d }));

    // Distribución por modo
    const porModo = { menu: 0, domicilio: 0, mesa: 0 };
    safeOrders.forEach((o) => {
      const m = o.mode || "menu";
      porModo[m] = (porModo[m] || 0) + 1;
    });

    // Ventas por día de semana
    const porDia = {};
    safeOrders.forEach((o) => {
      const ts = o.createdAt || o.date;
      if (ts) {
        const dia = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][new Date(ts).getDay()];
        if (!porDia[dia]) porDia[dia] = { pedidos: 0, ingresos: 0 };
        porDia[dia].pedidos++;
        porDia[dia].ingresos += o.total || 0;
      }
    });

    return {
      restaurante: config?.name || "el restaurante",
      resumen: {
        totalPedidos:       safeOrders.length,
        pedidosEntregados:  delivered.length,
        ingresosTotales:    totalRev,
        ticketPromedio:     avg,
        pendientes:         safeOrders.filter((o) => o.status === "pendiente").length,
      },
      topClientes,
      topProductos,
      distribucionModo: porModo,
      ventasPorDia:     porDia,
      productos: safeProducts.map((p) => ({
        id:        p.id,
        nombre:    p.name,
        precio:    p.price,
        categoria: safeCats.find((c) => c.id === p.catId)?.name || p.catId || "Sin categoría",
        activo:    p.active,
        enStock:   p.stock,
        clicks:    p.clicks || 0,
      })),
      categorias: safeCats.map((c) => ({ id: c.id, nombre: c.name })),
      ultimosPedidos: safeOrders.slice(-30).map((o) => ({
        id:      o.id,
        cliente: o.customerName || "Anónimo",
        total:   o.total,
        estado:  o.status,
        modo:    o.mode,
        fecha:   o.date || (o.createdAt || "").split("T")[0] || "",
      })),
    };
  }, [orders, products, cats, config]);

  /* ── System prompt completo (memoizado) ── */
  const systemPrompt = useMemo(() => {
    const name = config?.name || "el restaurante";
    return `Eres el asistente IA de gestión para "${name}". Tienes acceso completo a los datos del negocio y también conoces a fondo cómo funciona la plataforma.

${PLATFORM_GUIDE}

DATOS ACTUALES DEL NEGOCIO (en tiempo real):
${JSON.stringify(businessCtx)}

RESPONDE SIEMPRE con JSON válido sin backticks, exactamente en este formato:
{"message":"texto claro y útil","actions":[],"confirmNeeded":false}

ACCIONES DISPONIBLES (incluir en "actions" solo cuando el usuario pida hacer cambios a productos):
• Cambiar precio:     {"type":"update","id":"p1","patch":{"price":42000},"preview":"Bandeja Paisa: $38.000 → $42.000"}
• Activar producto:   {"type":"update","id":"p1","patch":{"active":true},"preview":"Activar: Bandeja Paisa"}
• Desactivar:         {"type":"update","id":"p1","patch":{"active":false},"preview":"Desactivar: Bandeja Paisa"}
• Marcar agotado:     {"type":"update","id":"p1","patch":{"stock":false},"preview":"Agotado: Bandeja Paisa"}
• Marcar disponible:  {"type":"update","id":"p1","patch":{"stock":true},"preview":"Disponible: Bandeja Paisa"}
• Agregar producto:   {"type":"add","data":{name,price,desc,catId,emoji,active:true,stock:true,featured:false,label:"",allergens:[]},"preview":"Agregar: [nombre] $[precio]"}

REGLAS CRÍTICAS:
1. Para cambios de precio/estado/agregar: pon "confirmNeeded":true y la acción lista. NO ejecutes sin confirmación.
2. Si el usuario escribe "sí", "confirmar", "dale", "hazlo": pon "confirmNeeded":false con las mismas acciones.
3. Para reportes y análisis: usa los números EXACTOS de los datos. Sé específico con cifras en pesos colombianos.
4. Para preguntas de "cómo usar la plataforma": usa la GUÍA DE LA PLATAFORMA de arriba, da pasos claros y numerados.
5. Habla en español colombiano, amigable y directo. Máximo 5 oraciones para respuestas normales.
6. Usa markdown: **negrita** para números y términos clave, • para listas.
7. Si no tienes datos suficientes para responder algo, dilo claramente y sugiere qué información falta.
8. NUNCA inventes datos o estadísticas que no estén en el contexto.`;
  }, [businessCtx, config]);

  /* ── Quick suggestions divididas por categoría ── */
  const QUICK_ANALYTICS = [
    { icon: BarChart3,    label: "¿Cuánto vendí este mes?" },
    { icon: Users,        label: "¿Quién es el cliente que más pide?" },
    { icon: PackageCheck, label: "¿Cuáles son los productos más vendidos?" },
    { icon: AlertTriangle,label: "¿Qué productos están agotados?" },
    { icon: CircleDollarSign, label: "¿Cuál es mi ticket promedio?" },
  ];
  const QUICK_GUIDE = [
    { icon: Plus,       label: "¿Cómo agrego un producto nuevo?" },
    { icon: Image,      label: "¿Cómo cambio el diseño del menú?" },
    { icon: Kanban,     label: "¿Cómo manejo los pedidos?" },
    { icon: Layers,     label: "¿Cómo creo un banner promocional?" },
    { icon: ShoppingBag,label: "¿Cómo marco un producto como agotado?" },
    { icon: BookOpen,   label: "¿Qué puedo hacer en la sección Informes?" },
  ];

  /* ── Ejecutar acciones ── */
  const runActions = useCallback(async (acts = []) => {
    const done = [];
    for (const a of acts) {
      try {
        if (a.type === "update" && a.id) {
          if (typeof onUpdateProduct === "function") {
            await onUpdateProduct(a.id, a.patch);
            done.push(a.preview || "Producto actualizado");
          } else {
            done.push(`⚠️ No se pudo actualizar (función no disponible): ${a.preview || a.id}`);
          }
        } else if (a.type === "add" && a.data) {
          if (typeof onAddProduct === "function") {
            await onAddProduct({
              ...a.data,
              id:         newId(),
              img:        "",
              clicks:     0,
              labelColor: "#f97316",
              allergens:  a.data.allergens || [],
            });
            done.push(a.preview || "Producto agregado");
          } else {
            done.push(`⚠️ No se pudo agregar (función no disponible): ${a.preview || a.data?.name}`);
          }
        }
      } catch (err) {
        done.push(`⚠️ Error ejecutando acción: ${err?.message || "desconocido"}`);
      }
    }
    return done;
  }, [onUpdateProduct, onAddProduct]);

  /* ── Cancelar acción pendiente ── */
  const cancelPending = useCallback(() => {
    setPendingActs(null);
    setMsgs((p) => [
      ...p,
      {
        role: "assistant",
        text: "De acuerdo, cancelé los cambios. ¿En qué más te puedo ayudar?",
        acts: [], type: "text",
      },
    ]);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  /* ── Confirmar acción pendiente ── */
  const confirmPending = useCallback(async () => {
    if (!pendingActs || loading) return;
    setLoading(true);
    setMsgs((p) => [
      ...p,
      { role: "user", text: "Confirmar cambios", acts: [], type: "text" },
    ]);
    const done = await runActions(pendingActs);
    setPendingActs(null);
    setMsgs((p) => [
      ...p,
      {
        role: "assistant",
        text: `Listo. Realicé **${done.length}** cambio${done.length !== 1 ? "s" : ""} exitosamente.`,
        acts: done, type: "text",
      },
    ]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [pendingActs, loading, runActions]);

  /* ── Enviar mensaje ── */
  const send = useCallback(async (overrideText) => {
    const txt = (overrideText || input).trim();
    if (!txt || loading) return;

    const normalized = txt.toLowerCase().trim();

    // Atajos de confirmación/cancelación
    if (pendingActs && ["sí","si","confirmar","dale","hazlo","ok","aplica"].includes(normalized)) {
      if (!overrideText) setInput("");
      await confirmPending();
      return;
    }
    if (pendingActs && ["no","cancelar","cancela","olvídalo","olvida"].includes(normalized)) {
      if (!overrideText) setInput("");
      cancelPending();
      return;
    }

    if (!overrideText) setInput("");
    setLoading(true);

    setMsgs((p) => [
      ...p,
      { role: "user", text: txt, acts: [], type: "text" },
    ]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-chat", {
        body: { system: systemPrompt, message: txt },
      });

      if (fnError) throw new Error(fnError.message || "Error en Edge Function");
      if (data?.error) throw new Error(data.error);

      const raw = data?.content?.[0]?.text || "{}";
      const parsed = parseAIResponse(raw);

      const acts = Array.isArray(parsed.actions) ? parsed.actions : [];

      if (parsed.confirmNeeded && acts.length > 0) {
        setPendingActs(acts);
        setMsgs((p) => [
          ...p,
          {
            role: "assistant",
            text: parsed.message || "",
            acts: [], type: "confirm",
            pendingActs: acts,
          },
        ]);
      } else {
        const done = acts.length > 0 ? await runActions(acts) : [];
        setPendingActs(null);
        setMsgs((p) => [
          ...p,
          {
            role: "assistant",
            text: parsed.message || "Listo.",
            acts: done, type: "text",
          },
        ]);
      }
    } catch (e) {
      setMsgs((p) => [
        ...p,
        {
          role: "assistant",
          text: friendlyError(e),
          acts: [], type: "text",
        },
      ]);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [input, loading, pendingActs, systemPrompt, runActions, confirmPending, cancelPending]);

  /* ── Limpiar conversación ── */
  const clearChat = useCallback(() => {
    setPendingActs(null);
    setInput("");
    setMsgs([{ role: "assistant", text: WELCOME, acts: [], type: "text" }]);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  /* ─────────────────────── RENDER ─────────────────────────── */
  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 120px)",
        animation: "fadeUp .35s ease",
      }}
    >
      <style>{`
        @media(max-width:760px){
          .ai-header{ flex-direction:column!important; align-items:flex-start!important; }
          .ai-context{ width:100%!important; overflow-x:auto!important; padding-bottom:2px!important; }
          .ai-message{ max-width:92%!important; }
          .ai-input-row{ gap:6px!important; }
        }
        @keyframes dotPulse {
          0%,80%,100%{ transform:scale(.7); opacity:.45; }
          40%{ transform:scale(1); opacity:1; }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        className="ai-header"
        style={{
          marginBottom: 14, display: "flex",
          alignItems: "flex-start", justifyContent: "space-between", gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AiAvatar size={44} />
          <div>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: T.coralL, border: `1px solid ${T.coral}22`,
                color: T.coral, borderRadius: 999, padding: "4px 9px",
                marginBottom: 7, fontSize: 10, fontWeight: 900,
              }}
            >
              <InlineIcon icon={Sparkles} size={12} />
              Copiloto operativo
            </div>
            <h2 style={{ fontSize: 23, lineHeight: 1.1, fontWeight: 900, color: T.text, margin: 0, letterSpacing: "-.4px" }}>
              Asistente IA
            </h2>
            <p style={{ color: T.mid, fontSize: 12, margin: "5px 0 0", lineHeight: 1.4 }}>
              Análisis del negocio · guía de plataforma · cambios con confirmación
            </p>
          </div>
        </div>

        <div
          className="ai-context"
          style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}
        >
          <ContextChip icon={ReceiptText}  label="Pedidos"    value={orders.length} />
          <ContextChip icon={Package}      label="Productos"  value={products.length}     color={T.blue} />
          <ContextChip icon={Database}     label="Categorías" value={cats.length}          color={T.green} />
          <ContextChip icon={TrendingUp}   label="Ventas"     value={fmtCOP(totalRevenue)} color={T.amber} />
        </div>
      </div>

      {/* ── Card principal ── */}
      <Card
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: 0, overflow: "hidden", minHeight: 0,
          borderRadius: 22, boxShadow: "0 14px 38px rgba(15,23,42,.06)",
        }}
      >
        {/* Topbar del chat */}
        <div
          style={{
            padding: "12px 15px", borderBottom: `1px solid ${T.border}`,
            background: T.white, display: "flex",
            alignItems: "center", justifyContent: "space-between", gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, fontWeight: 900, color: T.text }}>
            <SoftIcon icon={Brain} color={T.coral} box={32} size={16} />
            Chat de gestión
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Estado pedidos pendientes */}
            <div
              style={{
                display: "flex", gap: 7, alignItems: "center",
                fontSize: 11, fontWeight: 900,
                color: pendingOrders > 0 ? T.amber : T.green,
                background: pendingOrders > 0 ? T.amberL : T.greenL,
                borderRadius: 999, padding: "5px 9px",
              }}
            >
              <InlineIcon icon={pendingOrders > 0 ? AlertTriangle : CheckCircle2} size={13} />
              {pendingOrders} pendiente{pendingOrders !== 1 ? "s" : ""}
            </div>

            {/* Botón limpiar */}
            <button
              type="button"
              onClick={clearChat}
              title="Limpiar conversación"
              style={{
                width: 30, height: 30, borderRadius: 9,
                background: T.bg, border: `1px solid ${T.border}`,
                color: T.mid, display: "grid", placeItems: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <RefreshCw size={13} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* ── Mensajes ── */}
        <div
          style={{
            flex: 1, overflowY: "auto",
            padding: "18px 16px 10px",
            background: "linear-gradient(180deg, rgba(249,250,251,.7), rgba(255,255,255,1))",
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
                  marginBottom: 15, alignItems: "flex-end", gap: 9,
                }}
              >
                {!isUser && <AiAvatar size={30} />}

                <div className="ai-message" style={{ maxWidth: "78%" }}>
                  <div
                    style={{
                      padding: "12px 15px",
                      borderRadius: isUser ? "17px 17px 5px 17px" : "17px 17px 17px 5px",
                      background: isUser ? `linear-gradient(135deg,${T.coral},${T.pink})` : T.white,
                      color: isUser ? "#fff" : T.text,
                      border: isUser ? "none" : `1px solid ${T.border}`,
                      boxShadow: isUser ? `0 12px 24px ${T.coral}24` : "0 8px 22px rgba(15,23,42,.045)",
                    }}
                  >
                    {renderMd(m.text, isUser ? "#fff" : T.text)}
                  </div>

                  {/* Acciones ejecutadas */}
                  {m.acts?.length > 0 && (
                    <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 5 }}>
                      {m.acts.map((a, j) => (
                        <div
                          key={j}
                          style={{
                            fontSize: 11, fontWeight: 800,
                            background: a.startsWith("⚠️") ? T.amberL : T.greenL,
                            color:      a.startsWith("⚠️") ? T.amber  : T.green,
                            borderRadius: 10, padding: "6px 10px",
                            display: "inline-flex", alignItems: "center", gap: 6,
                            border: `1px solid ${a.startsWith("⚠️") ? T.amber : T.green}22`,
                          }}
                        >
                          <InlineIcon
                            icon={a.startsWith("⚠️") ? AlertTriangle : CheckCircle2}
                            size={13}
                          />
                          {a}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Confirmación pendiente */}
                  {m.type === "confirm" && m.pendingActs && pendingActs && (
                    <div
                      style={{
                        marginTop: 9, background: T.amberL,
                        border: `1.5px solid ${T.amber}44`,
                        borderRadius: 15, padding: "13px 14px",
                        boxShadow: "0 10px 24px rgba(15,23,42,.05)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 900, color: T.amber, marginBottom: 9 }}>
                        <InlineIcon icon={AlertTriangle} size={15} />
                        Confirma los siguientes cambios
                      </div>

                      <div style={{ display: "grid", gap: 6, marginBottom: 11 }}>
                        {m.pendingActs.map((a, j) => (
                          <div
                            key={j}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 7,
                              fontSize: 12, color: T.text,
                              background: "rgba(255,255,255,.58)",
                              border: `1px solid ${T.amber}20`,
                              borderRadius: 10, padding: "8px 9px", lineHeight: 1.45,
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
                            flex: 1, padding: "9px 0",
                            background: T.green, color: "#fff",
                            border: "none", borderRadius: 10,
                            fontWeight: 900, fontSize: 12,
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                          }}
                        >
                          <InlineIcon icon={Check} size={14} />
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={cancelPending}
                          style={{
                            flex: 1, padding: "9px 0",
                            background: T.redL, color: T.red,
                            border: `1px solid ${T.red}30`, borderRadius: 10,
                            fontWeight: 900, fontSize: 12, cursor: "pointer",
                            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
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
                      width: 30, height: 30, borderRadius: 11,
                      background: T.bg, color: T.mid,
                      display: "grid", placeItems: "center",
                      border: `1px solid ${T.border}`, flexShrink: 0,
                    }}
                  >
                    <User size={15} strokeWidth={2.35} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Indicador de escritura */}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 9, marginBottom: 10 }}>
              <AiAvatar size={30} />
              <div
                style={{
                  background: T.white, border: `1px solid ${T.border}`,
                  borderRadius: "17px 17px 17px 5px",
                  padding: "12px 16px", display: "flex", gap: 6, alignItems: "center",
                  boxShadow: "0 8px 22px rgba(15,23,42,.045)",
                }}
              >
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: T.coral,
                      animation: `dotPulse 1.2s ease ${j * 0.2}s infinite`,
                    }}
                  />
                ))}
                <span style={{ fontSize: 11, color: T.mid, marginLeft: 5, fontWeight: 700 }}>
                  Analizando…
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Quick suggestions (dos filas: análisis + guía) ── */}
        <div
          style={{
            borderTop: `1px solid ${T.border}55`,
            background: T.white,
          }}
        >
          {/* Fila análisis */}
          <div
            style={{
              padding: "8px 14px 4px",
              display: "flex", gap: 7, overflowX: "auto",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 9, fontWeight: 900, color: T.mid,
                textTransform: "uppercase", letterSpacing: ".6px",
                flexShrink: 0, marginRight: 2,
              }}
            >
              Análisis
            </span>
            {QUICK_ANALYTICS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => { if (!loading) { setInput(label); setTimeout(() => inputRef.current?.focus(), 50); } }}
                style={{
                  flexShrink: 0, padding: "6px 10px",
                  borderRadius: 999, border: `1px solid ${T.border}`,
                  background: T.white, color: T.mid,
                  fontSize: 10, fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap", transition: "all .15s",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <InlineIcon icon={Icon} size={12} color={T.coral} />
                {label}
              </button>
            ))}
          </div>

          {/* Fila guía de plataforma */}
          <div
            style={{
              padding: "4px 14px 8px",
              display: "flex", gap: 7, overflowX: "auto",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 9, fontWeight: 900, color: T.mid,
                textTransform: "uppercase", letterSpacing: ".6px",
                flexShrink: 0, marginRight: 2,
              }}
            >
              Guía
            </span>
            {QUICK_GUIDE.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => { if (!loading) { setInput(label); setTimeout(() => inputRef.current?.focus(), 50); } }}
                style={{
                  flexShrink: 0, padding: "6px 10px",
                  borderRadius: 999, border: `1px solid ${T.border}`,
                  background: T.white, color: T.mid,
                  fontSize: 10, fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap", transition: "all .15s",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <InlineIcon icon={Icon} size={12} color={T.blue} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Input ── */}
        <div
          className="ai-input-row"
          style={{
            padding: "10px 14px 12px",
            borderTop: `1px solid ${T.border}`,
            display: "flex", gap: 9, background: T.white,
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
                : "Pregunta sobre tu negocio o cómo usar la plataforma..."
            }
            disabled={loading}
            style={{
              flex: 1, padding: "12px 14px",
              background: T.bg,
              border: `1.5px solid ${loading || pendingActs ? T.coral : T.border}`,
              borderRadius: 13, fontSize: 13, color: T.text, outline: "none",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              transition: "border-color .2s",
            }}
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 46, height: 46, borderRadius: 13,
              background: !loading && input.trim()
                ? `linear-gradient(135deg,${T.coral},${T.pink})`
                : T.bg,
              border: "none",
              color: !loading && input.trim() ? "#fff" : T.light,
              display: "grid", placeItems: "center",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all .2s", flexShrink: 0,
              boxShadow: !loading && input.trim() ? `0 10px 22px ${T.coral}28` : "none",
            }}
          >
            {loading ? (
              <Loader2 size={18} strokeWidth={2.4} style={{ animation: "spin .8s linear infinite" }} />
            ) : (
              <Send size={18} strokeWidth={2.4} />
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}
