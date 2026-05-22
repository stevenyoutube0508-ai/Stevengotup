import { useMemo, useState, useCallback } from "react";

import orderPendingIcon from "../../../assets/order_pending.svg";
import orderPreparingIcon from "../../../assets/order_preparing.svg";
import orderReadyIcon from "../../../assets/order_ready.svg";
import orderOnWayIcon from "../../../assets/order_on_way.svg";
import orderDeliveredIcon from "../../../assets/order_delivered.svg";

import {
  ArrowRight,
  Bike,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  Printer,
  ReceiptText,
  Search,
  ShoppingBag,
  Store,
  Table2,
  Timer,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";

import { T } from "../../../constants/theme";
import { getVertical } from "../../../constants/verticals";
import { K_NEXT } from "../../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow } from "../../../utils/format";
import { Card, Btn, Field, Modal } from "../../../shared/components";

function InlineIcon({ icon: Icon, size = 14, color = "currentColor", style }) {
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={2.35}
      style={{
        flexShrink: 0,
        verticalAlign: "-2px",
        pointerEvents: "none",
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
        pointerEvents: "none",
        ...style,
      }}
    >
      <Icon size={size} strokeWidth={2.35} />
    </div>
  );
}

function OrderStatusIcon({ src, alt, size = 28, faded = false }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        opacity: faded ? 0.45 : 1,
        filter: faded
          ? "grayscale(.35)"
          : "drop-shadow(0 6px 10px rgba(15,23,42,.14))",
        pointerEvents: "none",
      }}
    />
  );
}

function StatusBadge({ label, color }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 900,
        color: "#fff",
        background: color || "#999",
        borderRadius: 999,
        padding: "5px 10px",
        lineHeight: 1,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <InlineIcon icon={CheckCircle2} size={11} />
      {label}
    </span>
  );
}

function FilterButton({ active, onClick, icon, children, color }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1.5px solid ${active ? color : T.border}`,
        background: active ? `${color}14` : "transparent",
        color: active ? color : T.mid,
        fontSize: 10,
        fontWeight: active ? 900 : 700,
        cursor: "pointer",
        transition: "all .15s ease",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      <InlineIcon icon={icon} size={12} />
      {children}
    </button>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div
      className="delivery-detail-row"
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        marginBottom: 8,
        fontSize: 12,
        paddingBottom: 8,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <span
        style={{
          color: T.mid,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <InlineIcon icon={icon} size={13} />
        {label}
      </span>

      <span
        style={{
          color: T.text,
          fontWeight: 700,
          textAlign: "right",
          maxWidth: "58%",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
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

export function SecDelivery({
  orders = [],
  onMove,
  products = [],
  config = {},
  onAddOrder,
  vertical,
}) {
  const vl = (vertical || getVertical("restaurant")).labels;
  const isRestaurant = !vertical || vertical.id === "restaurant";

  const [selId, setSelId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [paidOrders, setPaidOrders] = useState(() => new Set());
  const [newModal, setNewModal] = useState(false);
  const [delivWaModal, setDelivWaModal] = useState(false);
  const [delivWaPhone, setDelivWaPhone] = useState("");
  const [productQ, setProductQ] = useState("");

  const [form, setForm] = useState({
    mode: "domicilio",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    addressRef: "",
    table: "",
    notes: "",
    payment: "cash",
    items: [],
  });

  const pc = config?.primaryColor || "#f97316";

  const PAYMENT_LABEL = {
    cash: "Efectivo",
    nequi: "Nequi",
    daviplata: "Daviplata",
    card: "Tarjeta",
  };

  const PAYMENT_OPTIONS = [
    ["cash", "Efectivo", Wallet],
    ["nequi", "Nequi", Phone],
    ["daviplata", "Daviplata", Phone],
    ["card", "Tarjeta", CreditCard],
  ];

  const STATUS_FLOW = [
    "pendiente",
    "en_cocina",
    "listo",
    "en_camino",
    "entregado",
  ];

  const SL = {
    pendiente: "Pendiente",
    en_cocina: vl.status_processing || "En proceso",
    listo: vl.status_ready || "Listo",
    en_camino: vl.status_shipping || "En camino",
    entregado: vl.status_done || "Entregado",
  };

  const SC = {
    pendiente: "#f59e0b",
    en_cocina: "#3b82f6",
    listo: "#059669",
    en_camino: "#8b5cf6",
    entregado: "#9ca3af",
  };

  const STATUS_ICON = {
    pendiente: orderPendingIcon,
    en_cocina: orderPreparingIcon,
    listo: orderReadyIcon,
    en_camino: orderOnWayIcon,
    entregado: orderDeliveredIcon,
  };

  const NL = {
    pendiente: `Aceptar ${(vl.order || "pedido").toLowerCase()}`,
    en_cocina: vl.status_ready || "Listo",
    listo: vl.status_shipping || "Enviar",
    en_camino: "Finalizar",
  };

  const shown = useMemo(() => {
    const base =
      filter === "all"
        ? orders
        : filter === "pendiente"
        ? orders.filter((o) => o.status === "pendiente")
        : orders.filter((o) => o.mode === filter);

    return [...base].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [orders, filter]);

  const sel = selId ? orders.find((o) => o.id === selId) : null;

  const visibleProducts = useMemo(() => {
    const query = productQ.trim().toLowerCase();

    return products
      .filter((p) => p.active && p.stock)
      .filter((p) => !query || p.name?.toLowerCase().includes(query));
  }, [products, productQ]);

  const formSubtotal = form.items.reduce(
    (s, i) => s + (i.total || i.price * i.qty),
    0
  );

  const formDelivery =
    form.mode === "domicilio" ? config.deliveryFee || 5000 : 0;

  const formTotal = formSubtotal + formDelivery;
  const validOrder = Boolean(form.customerName && form.items.length);

  const getModeMeta = (mode, table) => {
    if (mode === "domicilio") {
      return {
        label: vl.delivery_title || "Domicilio",
        icon: Bike,
        color: "#059669",
      };
    }

    if (mode === "mesa") {
      return {
        label: table || "Mesa",
        icon: Table2,
        color: "#2563eb",
      };
    }

    return {
      label: vl.pickup_title || "Pickup",
      icon: Store,
      color: "#db2777",
    };
  };

  const printComanda = (o) => {
    const w = window.open("", "_blank", "width=400,height=700");
    if (!w) return;

    const items =
      o.items
        ?.map(
          (it) =>
            `<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span>${escapeHtml(
              it.qty
            )}x ${escapeHtml(it.name)}</span><span>${fmtCOP(
              it.price * it.qty
            )}</span></div>`
        )
        .join("") || "";

    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comanda</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Courier New',monospace;font-size:13px;width:302px;padding:10px;}
        .center{text-align:center;}
        .bold{font-weight:bold;}
        .big{font-size:16px;font-weight:bold;}
        .row{display:flex;justify-content:space-between;margin-bottom:4px;}
        .divider{border-top:1px dashed #000;margin:8px 0;}
        .badge{text-align:center;font-weight:bold;font-size:12px;border:2px solid #000;padding:5px;margin:8px 0;letter-spacing:1px;}
        @media print{@page{margin:0;size:80mm auto;}body{width:100%;padding:4px;}}
      </style>
      </head><body>
      <div class="center big" style="margin-bottom:2px">${escapeHtml(
        config.name || "Picku"
      )}</div>
      ${
        config.address
          ? `<div class="center" style="font-size:10px;margin-bottom:8px">${escapeHtml(
              config.address
            )}</div>`
          : ""
      }
      <div class="divider"></div>
      <div class="badge">${
        o.mode === "domicilio"
          ? "DOMICILIO"
          : o.mode === "mesa"
          ? `MESA ${escapeHtml(o.table || "")}`
          : "PICKUP"
      }</div>
      <div class="row"><span>Pedido:</span><span class="bold">#${escapeHtml(
        o.id.toUpperCase().slice(0, 8)
      )}</span></div>
      <div class="row"><span>Fecha:</span><span>${escapeHtml(
        o.date
      )} ${escapeHtml(o.time)}</span></div>
      <div class="row"><span>Cliente:</span><span>${escapeHtml(
        o.customerName
      )}</span></div>
      ${
        o.customerPhone
          ? `<div class="row"><span>Tel:</span><span>${escapeHtml(
              o.customerPhone
            )}</span></div>`
          : ""
      }
      ${
        o.mode === "domicilio"
          ? `<div class="row"><span>Dir:</span><span style="text-align:right;max-width:58%">${escapeHtml(
              o.address
            )}${
              o.addressRef ? ` (${escapeHtml(o.addressRef)})` : ""
            }</span></div>`
          : ""
      }
      <div class="divider"></div>
      <div class="bold" style="margin-bottom:6px">PRODUCTOS</div>
      ${items}
      <div class="divider"></div>
      ${
        o.mode === "domicilio"
          ? `<div class="row"><span>Domicilio</span><span>${fmtCOP(
              o.delivery || 0
            )}</span></div>`
          : ""
      }
      <div class="row bold" style="font-size:15px"><span>TOTAL</span><span>${fmtCOP(
        o.total
      )}</span></div>
      <div class="row" style="margin-top:4px"><span>Pago:</span><span>${escapeHtml(
        PAYMENT_LABEL[o.payment] || o.payment
      )}</span></div>
      ${
        o.notes
          ? `<div class="divider"></div><div style="font-size:11px"><b>Notas:</b> ${escapeHtml(
              o.notes
            )}</div>`
          : ""
      }
      <div class="divider"></div>
      <div class="center" style="font-size:10px">¡Gracias!</div>
      <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
      </body></html>`);

    w.document.close();
  };

  const sendToDelivery = (o, phone) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      o.address
    )}`;

    const items =
      o.items
        ?.map((it) => `  • ${it.qty}x ${it.name} — ${fmtCOP(it.price * it.qty)}`)
        .join("\n") || "";

    const msg = `*NUEVO ${(vl.delivery_title || "DOMICILIO").toUpperCase()}*

*Negocio:* ${config.name || "Picku"}
*${vl.order || "Pedido"}:* #${o.id.toUpperCase().slice(0, 8)}
*Hora:* ${o.time}

*Cliente:* ${o.customerName}
*Tel cliente:* ${o.customerPhone || "—"}
*Dirección:* ${o.address}${
      o.addressRef ? "\n*Referencia:* " + o.addressRef : ""
    }

*${vl.itemPlural || "Productos"}:*
${items}

*Subtotal:* ${fmtCOP(o.subtotal)}
*${vl.delivery_fee_label || "Domicilio"}:* ${fmtCOP(o.delivery || 0)}
*TOTAL:* ${fmtCOP(o.total)}
*Pago:* ${PAYMENT_LABEL[o.payment] || o.payment}${
      o.notes ? "\n*Notas:* " + o.notes : ""
    }

*Ubicación:*
${mapsUrl}`;

    const waNum = phone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const addItem = (product) => {
    const itemPrice =
      form.mode === "domicilio" && product.deliveryPrice
        ? product.deliveryPrice
        : product.price;

    setForm((f) => {
      const exists = f.items.find((it) => it.id === product.id);

      if (exists) {
        return {
          ...f,
          items: f.items.map((it) =>
            it.id === product.id
              ? {
                  ...it,
                  qty: it.qty + 1,
                  total: itemPrice * (it.qty + 1),
                }
              : it
          ),
        };
      }

      return {
        ...f,
        items: [
          ...f.items,
          {
            ...product,
            price: itemPrice,
            qty: 1,
            total: itemPrice,
          },
        ],
      };
    });
  };

  const decreaseItem = (pid) => {
    setForm((f) => ({
      ...f,
      items: f.items
        .map((it) =>
          it.id === pid
            ? {
                ...it,
                qty: it.qty - 1,
                total: it.price * (it.qty - 1),
              }
            : it
        )
        .filter((it) => it.qty > 0),
    }));
  };

  const removeItem = (pid) => {
    setForm((f) => ({
      ...f,
      items: f.items.filter((i) => i.id !== pid),
    }));
  };

  const resetForm = () => {
    setForm({
      mode: "domicilio",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      address: "",
      addressRef: "",
      table: "",
      notes: "",
      payment: "cash",
      items: [],
    });
    setProductQ("");
  };

  const createOrder = () => {
    if (!validOrder) return;

    const o = {
      id: newId(),
      createdAt: Date.now(),
      status: "pendiente",
      mode: form.mode,
      time: timeNow(),
      date: todayStr(),
      ...form,
      subtotal: formSubtotal,
      delivery: formDelivery,
      total: formTotal,
    };

    onAddOrder?.(o);
    setSelId(o.id);
    setNewModal(false);
    resetForm();
  };

  return (
    <div
      className="delivery-root"
      style={{
        animation: "fadeUp .35s ease",
        width: "100%",
        minWidth: 0,
        height: "calc(100dvh - 110px)",
        overflow: "hidden",
        background: T.bg,
      }}
    >
      <style>
        {`
          .delivery-root,
          .delivery-root * {
            box-sizing: border-box;
          }

          .delivery-shell {
            display: flex;
            width: 100%;
            height: 100%;
            min-width: 0;
            overflow: hidden;
          }

          .delivery-list {
            width: 292px;
            flex-shrink: 0;
            background: ${T.white};
            border-right: 1px solid ${T.border};
            display: flex;
            flex-direction: column;
            min-height: 0;
          }

          .delivery-list-scroll {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
          }

          .delivery-detail {
            flex: 1;
            min-width: 0;
            overflow-y: auto;
            background: ${T.bg};
          }

          .delivery-detail-content {
            padding: 22px 24px;
          }

          .delivery-detail-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 14px;
            margin-bottom: 18px;
          }

          .delivery-status-scroll {
            width: 100%;
            overflow-x: auto;
          }

          .delivery-status-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(92px, 1fr));
            min-width: 560px;
          }

          .delivery-actions-card {
            padding: 14px 18px;
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
            box-shadow: ${T.sh};
          }

          .new-order-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 14px;
          }

          .new-order-footer {
            display: flex;
            gap: 10px;
            margin-top: 14px;
          }

          .product-list-box {
            max-height: 210px;
            overflow-y: auto;
            margin-bottom: 12px;
            border: 1px solid ${T.border};
            border-radius: 14px;
            background: ${T.white};
          }

          .delivery-wa-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: rgba(0,0,0,.6);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .delivery-wa-panel {
            background: ${T.white};
            border-radius: 22px;
            padding: 24px;
            width: 100%;
            max-width: 420px;
            max-height: calc(100dvh - 40px);
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,.3);
          }

          .delivery-wa-actions {
            display: flex;
            gap: 10px;
          }

          @media(max-width: 1120px) {
            .delivery-list {
              width: 270px !important;
            }

            .delivery-detail-content {
              padding: 20px !important;
            }
          }

          @media(max-width: 920px) {
            .delivery-root {
              height: auto !important;
              min-height: calc(100dvh - 110px) !important;
              overflow: visible !important;
            }

            .delivery-shell {
              flex-direction: column !important;
              height: auto !important;
              overflow: visible !important;
            }

            .delivery-list {
              width: 100% !important;
              max-height: none !important;
              border-right: none !important;
              border-bottom: 1px solid ${T.border} !important;
            }

            .delivery-list-scroll {
              max-height: 360px !important;
            }

            .delivery-detail {
              overflow: visible !important;
            }

            .delivery-detail-content {
              padding: 18px !important;
            }

            .delivery-detail-grid {
              grid-template-columns: 1fr !important;
            }

            .delivery-header-actions {
              justify-content: flex-start !important;
            }

            .new-order-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media(max-width: 640px) {
            .delivery-list-header {
              padding: 13px !important;
            }

            .delivery-list-header-top {
              align-items: flex-start !important;
              flex-direction: column !important;
            }

            .delivery-filter-row {
              flex-wrap: nowrap !important;
              overflow-x: auto !important;
              padding-bottom: 2px !important;
            }

            .delivery-filter-row button {
              flex-shrink: 0 !important;
            }

            .delivery-order-card {
              padding: 12px 13px !important;
            }

            .delivery-detail-content {
              padding: 14px !important;
            }

            .delivery-title-row {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .delivery-order-code {
              font-size: 18px !important;
              word-break: break-all !important;
            }

            .delivery-header-actions {
              width: 100% !important;
            }

            .delivery-header-action-btn {
              width: 100% !important;
              justify-content: center !important;
            }

            .delivery-status-grid {
              min-width: 520px !important;
            }

            .delivery-detail-row {
              flex-direction: column !important;
              gap: 4px !important;
            }

            .delivery-detail-row span:last-child {
              max-width: 100% !important;
              text-align: left !important;
            }

            .delivery-item-row {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .delivery-total-row {
              font-size: 16px !important;
            }

            .delivery-payment-box {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .delivery-payment-box button {
              width: 100% !important;
            }

            .delivery-actions-card {
              flex-direction: column !important;
              align-items: stretch !important;
              padding: 14px !important;
            }

            .delivery-actions-card-main {
              width: 100% !important;
              justify-content: center !important;
            }

            .delivery-actions-card button {
              width: 100% !important;
            }

            .mode-options,
            .payment-options {
              flex-direction: column !important;
            }

            .mode-options button,
            .payment-options button {
              width: 100% !important;
            }

            .product-row {
              align-items: flex-start !important;
              flex-direction: column !important;
            }

            .product-row-price {
              width: 100% !important;
              justify-content: space-between !important;
            }

            .cart-item-row {
              align-items: flex-start !important;
              flex-direction: column !important;
            }

            .cart-item-actions {
              width: 100% !important;
              justify-content: space-between !important;
            }

            .new-order-footer {
              flex-direction: column !important;
            }

            .delivery-wa-overlay {
              align-items: flex-end !important;
              padding: 12px !important;
            }

            .delivery-wa-panel {
              max-width: none !important;
              border-radius: 22px 22px 18px 18px !important;
              padding: 18px !important;
              max-height: calc(100dvh - 24px) !important;
            }

            .delivery-wa-actions {
              flex-direction: column !important;
            }

            .delivery-wa-actions button {
              width: 100% !important;
            }
          }
        `}
      </style>

      <div className="delivery-shell">
        <div className="delivery-list">
          <div
            className="delivery-list-header"
            style={{
              padding: "14px 14px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <div
              className="delivery-list-header-top"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 11,
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 900,
                    fontSize: 15,
                    color: T.text,
                  }}
                >
                  <InlineIcon icon={ReceiptText} size={17} color={pc} />
                  Pedidos
                </div>

                <div style={{ fontSize: 11, color: T.mid, marginTop: 3 }}>
                  {shown.length} visible{shown.length !== 1 ? "s" : ""} ·{" "}
                  {orders.length} total
                </div>
              </div>

              <Btn sm onClick={() => setNewModal(true)}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <InlineIcon icon={Plus} size={14} />
                  Nuevo
                </span>
              </Btn>
            </div>

            <div
              className="delivery-filter-row"
              style={{
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
              }}
            >
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
                icon={ClipboardList}
                color={pc}
              >
                Todos
              </FilterButton>

              <FilterButton
                active={filter === "pendiente"}
                onClick={() => setFilter("pendiente")}
                icon={Timer}
                color={pc}
              >
                Pend.
              </FilterButton>

              <FilterButton
                active={filter === "domicilio"}
                onClick={() => setFilter("domicilio")}
                icon={Bike}
                color={pc}
              >
                Domicilio
              </FilterButton>

              {isRestaurant && (
                <FilterButton
                  active={filter === "mesa"}
                  onClick={() => setFilter("mesa")}
                  icon={Table2}
                  color={pc}
                >
                  Mesa
                </FilterButton>
              )}

              <FilterButton
                active={filter === "pickup"}
                onClick={() => setFilter("pickup")}
                icon={Store}
                color={pc}
              >
                Pickup
              </FilterButton>
            </div>
          </div>

          <div className="delivery-list-scroll">
            {shown.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "44px 18px",
                  color: T.light,
                  fontSize: 12,
                }}
              >
                <SoftIcon
                  icon={ReceiptText}
                  color={T.light}
                  box={48}
                  size={22}
                  style={{ margin: "0 auto 12px" }}
                />
                Sin pedidos para este filtro.
              </div>
            )}

            {shown.map((o) => {
              const isNew = Date.now() - o.createdAt < 25000;
              const modeMeta = getModeMeta(o.mode, o.table);
              const ModeIcon = modeMeta.icon;

              return (
                <button
                  key={o.id}
                  type="button"
                  className="delivery-order-card"
                  onClick={() => setSelId(o.id)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "none",
                    borderBottom: `1px solid ${T.border}`,
                    cursor: "pointer",
                    background: selId === o.id ? `${pc}10` : "transparent",
                    borderLeft: `4px solid ${
                      selId === o.id ? pc : "transparent"
                    }`,
                    transition: "all .15s",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 5,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 13,
                          color: isNew ? pc : T.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {o.customerName || "Sin nombre"}
                      </div>

                      {isNew && (
                        <span
                          style={{
                            display: "inline-flex",
                            marginTop: 4,
                            fontSize: 8,
                            background: pc,
                            color: "#fff",
                            borderRadius: 999,
                            padding: "2px 6px",
                            fontWeight: 900,
                          }}
                        >
                          NUEVO
                        </span>
                      )}
                    </div>

                    <StatusBadge label={SL[o.status]} color={SC[o.status]} />
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: T.mid,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 3,
                    }}
                  >
                    <InlineIcon
                      icon={ModeIcon}
                      size={13}
                      color={modeMeta.color}
                    />
                    {modeMeta.label}
                  </div>

                  <div style={{ fontSize: 11, color: T.light }}>
                    {o.items?.length || 0} ítem
                    {o.items?.length !== 1 ? "s" : ""} · {fmtCOP(o.total)} ·{" "}
                    {o.time}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="delivery-detail">
          {!sel && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
                color: T.light,
                padding: 30,
                textAlign: "center",
              }}
            >
              <SoftIcon icon={ReceiptText} color={pc} box={64} size={30} />

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: T.text,
                  marginTop: 14,
                }}
              >
                Selecciona un pedido
              </div>

              <div style={{ fontSize: 12, marginTop: 5, color: T.mid }}>
                O crea uno nuevo con el botón Nuevo.
              </div>
            </div>
          )}

          {sel && (
            <div className="delivery-detail-content">
              <div
                className="delivery-title-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  marginBottom: 18,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.mid,
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".4px",
                    }}
                  >
                    <InlineIcon icon={ReceiptText} size={13} color={pc} />
                    {vl.order || "Pedido"} ·{" "}
                    {getModeMeta(sel.mode, sel.table).label}
                  </div>

                  <div
                    className="delivery-order-code"
                    style={{
                      fontWeight: 900,
                      fontSize: 22,
                      color: T.text,
                      letterSpacing: "-.4px",
                    }}
                  >
                    #{sel.id.toUpperCase()}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: T.mid,
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <InlineIcon icon={CalendarDays} size={13} />
                    {sel.date} · {sel.time}
                  </div>
                </div>

                <div
                  className="delivery-header-actions"
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="delivery-header-action-btn"
                    onClick={() => printComanda(sel)}
                    title="Imprimir comanda para cocina"
                    style={{
                      padding: "8px 13px",
                      background: T.white,
                      border: `1.5px solid ${T.border}`,
                      borderRadius: 12,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 800,
                      color: T.text,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                    }}
                  >
                    <InlineIcon icon={Printer} size={14} />
                    Comanda
                  </button>

                  {sel.mode === "domicilio" && (
                    <button
                      type="button"
                      className="delivery-header-action-btn"
                      onClick={() => {
                        setDelivWaPhone("");
                        setDelivWaModal(true);
                      }}
                      title="Enviar pedido al domiciliario por WhatsApp"
                      style={{
                        padding: "8px 13px",
                        background: "#22c55e18",
                        border: "1.5px solid #22c55e44",
                        borderRadius: 12,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#16a34a",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                      }}
                    >
                      <InlineIcon icon={MessageCircle} size={14} />
                      WhatsApp domiciliario
                    </button>
                  )}

                  <StatusBadge label={SL[sel.status]} color={SC[sel.status]} />
                </div>
              </div>

              <Card style={{ padding: 0, overflow: "hidden", marginBottom: 18 }}>
                <div className="delivery-status-scroll">
                  <div className="delivery-status-grid">
                    {STATUS_FLOW.map((status, i) => {
                      const currentIndex = STATUS_FLOW.indexOf(sel.status);
                      const done = i <= currentIndex;
                      const statusIcon = STATUS_ICON[status];

                      return (
                        <div
                          key={status}
                          style={{
                            padding: "11px 7px",
                            textAlign: "center",
                            background: done ? `${SC[status]}12` : "transparent",
                            borderRight:
                              i < STATUS_FLOW.length - 1
                                ? `1px solid ${T.border}`
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 15,
                              display: "grid",
                              placeItems: "center",
                              margin: "0 auto 6px",
                              background: done ? `${SC[status]}12` : T.bg,
                              border: `1px solid ${
                                done ? `${SC[status]}24` : T.border
                              }`,
                            }}
                          >
                            <OrderStatusIcon
                              src={statusIcon}
                              alt={SL[status]}
                              size={28}
                              faded={!done}
                            />
                          </div>

                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: 900,
                              color: done ? SC[status] : T.light,
                            }}
                          >
                            {SL[status]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              <div className="delivery-detail-grid">
                <Card>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 900,
                      fontSize: 14,
                      color: T.text,
                      marginBottom: 13,
                    }}
                  >
                    <InlineIcon icon={User} size={16} color={pc} />
                    Datos del cliente
                  </div>

                  <DetailRow
                    icon={User}
                    label="Cliente"
                    value={sel.customerName}
                  />
                  <DetailRow
                    icon={Phone}
                    label="Teléfono"
                    value={sel.customerPhone}
                  />
                  <DetailRow
                    icon={Mail}
                    label="Email"
                    value={sel.customerEmail}
                  />

                  {sel.mode === "domicilio" && (
                    <>
                      <DetailRow
                        icon={MapPin}
                        label="Dirección"
                        value={sel.address}
                      />
                      <DetailRow
                        icon={Home}
                        label="Referencia"
                        value={sel.addressRef}
                      />
                    </>
                  )}

                  {sel.mode === "mesa" && (
                    <DetailRow icon={Table2} label="Mesa" value={sel.table} />
                  )}

                  <DetailRow
                    icon={CreditCard}
                    label="Pago"
                    value={PAYMENT_LABEL[sel.payment] || sel.payment}
                  />

                  {sel.notes && (
                    <DetailRow icon={FileText} label="Notas" value={sel.notes} />
                  )}
                </Card>

                <Card>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 900,
                      fontSize: 14,
                      color: T.text,
                      marginBottom: 13,
                    }}
                  >
                    <InlineIcon icon={ShoppingBag} size={16} color={pc} />
                    Detalle del pedido
                  </div>

                  {sel.items?.map((it, i) => (
                    <div
                      key={i}
                      className="delivery-item-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 8,
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: T.text, fontWeight: 700 }}>
                        {it.qty}× {it.name}
                      </span>

                      <span style={{ fontWeight: 900, color: T.text }}>
                        {fmtCOP(it.price * it.qty)}
                      </span>
                    </div>
                  ))}

                  <div
                    style={{
                      borderTop: `1px solid ${T.border}`,
                      marginTop: 9,
                      paddingTop: 9,
                    }}
                  >
                    {sel.mode === "domicilio" && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: T.mid,
                          marginBottom: 5,
                        }}
                      >
                        <span>{vl.delivery_fee_label || "Domicilio"}</span>
                        <span>{fmtCOP(sel.delivery || 0)}</span>
                      </div>
                    )}

                    <div
                      className="delivery-total-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontWeight: 900,
                        fontSize: 17,
                      }}
                    >
                      <span>Total</span>
                      <span style={{ color: pc }}>{fmtCOP(sel.total)}</span>
                    </div>
                  </div>

                  {sel.status !== "entregado" && (
                    <div
                      className="delivery-payment-box"
                      style={{
                        marginTop: 13,
                        padding: "10px 12px",
                        background: T.greenL,
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          fontWeight: 900,
                          color: T.green,
                        }}
                      >
                        <InlineIcon icon={CreditCard} size={13} />
                        Pago: {PAYMENT_LABEL[sel.payment] || sel.payment}
                      </span>

                      <Btn
                        sm
                        v={paidOrders.has(sel?.id) ? "ghost" : "success"}
                        disabled={paidOrders.has(sel?.id)}
                        onClick={() => {
                          if (!sel) return;
                          setPaidOrders(prev => new Set([...prev, sel.id]));
                        }}
                      >
                        {paidOrders.has(sel?.id) ? "✓ Pago recibido" : "Recibir pago"}
                      </Btn>
                    </div>
                  )}
                </Card>
              </div>

              {sel.status !== "entregado" && (
                <Card className="delivery-actions-card">
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      background: `${SC[sel.status] || pc}12`,
                      border: `1px solid ${SC[sel.status] || pc}24`,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <OrderStatusIcon
                      src={STATUS_ICON[sel.status]}
                      alt={SL[sel.status]}
                      size={34}
                    />
                  </div>

                  <div style={{ flex: 1, fontSize: 12, color: T.mid }}>
                    <span style={{ fontWeight: 900, color: T.text }}>
                      Estado: {SL[sel.status]}
                    </span>

                    {sel.status === "pendiente" && (
                      <div>Acepta el pedido para empezar a procesarlo.</div>
                    )}
                  </div>

                  {K_NEXT[sel.status] && (
                    <Btn
                      onClick={() => {
                        onMove?.(sel.id, K_NEXT[sel.status]);
                      }}
                      style={{
                        padding: "12px 18px",
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      <span
                        className="delivery-actions-card-main"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        {NL[sel.status]}
                        <InlineIcon icon={ArrowRight} size={15} />
                      </span>
                    </Btn>
                  )}

                  <Btn v="ghost" onClick={() => onMove?.(sel.id, "entregado")}>
                    Finalizar
                  </Btn>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {newModal && (
        <Modal
          title="Nuevo pedido"
          icon={
            <ReceiptText
              size={20}
              strokeWidth={2.4}
              style={{ verticalAlign: "-4px" }}
            />
          }
          onClose={() => setNewModal(false)}
          wide
        >
          <div className="new-order-grid">
            <div>
              <div style={{ marginBottom: 13 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: T.mid,
                    display: "block",
                    marginBottom: 7,
                  }}
                >
                  Modo
                </label>

                <div
                  className="mode-options"
                  style={{ display: "flex", gap: 7, flexWrap: "wrap" }}
                >
                  {[
                    ["domicilio", vl.delivery_title || "Domicilio", Bike],
                    isRestaurant && ["mesa", "Mesa", Table2],
                    ["pickup", vl.pickup_title || "Pickup", Store],
                  ]
                    .filter(Boolean)
                    .map(([k, l, Icon]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, mode: k }))}
                        style={{
                          flex: 1,
                          minWidth: 92,
                          padding: "9px",
                          borderRadius: 12,
                          border: `1.5px solid ${
                            form.mode === k ? pc : T.border
                          }`,
                          background: form.mode === k ? `${pc}15` : "transparent",
                          color: form.mode === k ? pc : T.mid,
                          fontSize: 11,
                          fontWeight: form.mode === k ? 900 : 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          fontFamily: "'Plus Jakarta Sans',sans-serif",
                        }}
                      >
                        <InlineIcon icon={Icon} size={13} />
                        {l}
                      </button>
                    ))}
                </div>
              </div>

              <Field
                label="Nombre del cliente *"
                value={form.customerName}
                onChange={(v) => setForm((p) => ({ ...p, customerName: v }))}
                required
              />

              <Field
                label="Teléfono"
                value={form.customerPhone}
                onChange={(v) => setForm((p) => ({ ...p, customerPhone: v }))}
                type="tel"
              />

              <Field
                label="Email"
                value={form.customerEmail}
                onChange={(v) => setForm((p) => ({ ...p, customerEmail: v }))}
                type="email"
              />

              {form.mode === "domicilio" && (
                <>
                  <Field
                    label="Dirección"
                    value={form.address}
                    onChange={(v) => setForm((p) => ({ ...p, address: v }))}
                    placeholder="Cra 5 #15-32, El Peñón"
                  />

                  <Field
                    label="Referencia"
                    value={form.addressRef}
                    onChange={(v) => setForm((p) => ({ ...p, addressRef: v }))}
                    placeholder="Apto 304, torre A, portería…"
                  />
                </>
              )}

              {form.mode === "mesa" && (
                <Field
                  label="Número de mesa"
                  value={form.table}
                  onChange={(v) => setForm((p) => ({ ...p, table: v }))}
                  placeholder="Mesa 3, 4A…"
                />
              )}

              <Field
                label="Notas"
                value={form.notes}
                onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
                textarea
                rows={2}
                placeholder={vl.notes_placeholder}
              />

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: T.mid,
                    display: "block",
                    marginBottom: 7,
                  }}
                >
                  Método de pago
                </label>

                <div
                  className="payment-options"
                  style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                >
                  {PAYMENT_OPTIONS.map(([k, l, Icon]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, payment: k }))}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: `1.5px solid ${
                          form.payment === k ? pc : T.border
                        }`,
                        background: form.payment === k ? `${pc}18` : "transparent",
                        color: form.payment === k ? pc : T.mid,
                        fontSize: 11,
                        fontWeight: form.payment === k ? 900 : 700,
                        cursor: "pointer",
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                      }}
                    >
                      <InlineIcon icon={Icon} size={12} />
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 9,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: T.mid,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <InlineIcon icon={Package} size={14} color={pc} />
                  Agregar productos
                </div>
              </div>

              <div style={{ position: "relative", marginBottom: 10 }}>
                <Search
                  size={15}
                  strokeWidth={2.4}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: T.light,
                    pointerEvents: "none",
                  }}
                />

                <input
                  value={productQ}
                  onChange={(e) => setProductQ(e.target.value)}
                  placeholder="Buscar producto..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 13px 10px 36px",
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    fontSize: 13,
                    color: T.text,
                    outline: "none",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                />
              </div>

              <div className="product-list-box">
                {visibleProducts.length === 0 && (
                  <div
                    style={{
                      padding: 20,
                      color: T.light,
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    No hay productos disponibles.
                  </div>
                )}

                {visibleProducts.map((p) => {
                  const itemPrice =
                    form.mode === "domicilio" && p.deliveryPrice
                      ? p.deliveryPrice
                      : p.price;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      className="product-row"
                      onClick={() => addItem(p)}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        border: "none",
                        borderBottom: `1px solid ${T.border}`,
                        cursor: "pointer",
                        background: "transparent",
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          minWidth: 0,
                        }}
                      >
                        <SoftIcon
                          icon={isRestaurant ? ShoppingBag : Package}
                          color={pc}
                          box={30}
                          size={14}
                        />

                        <span
                          style={{
                            fontSize: 13,
                            color: T.text,
                            fontWeight: 700,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.name}
                        </span>
                      </div>

                      <div
                        className="product-row-price"
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            color: pc,
                          }}
                        >
                          {fmtCOP(itemPrice)}
                        </span>

                        <SoftIcon icon={Plus} color={T.green} box={24} size={13} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {form.items.length > 0 && (
                <div
                  style={{
                    background: T.coralL,
                    borderRadius: 14,
                    padding: 13,
                    border: `1px solid ${pc}22`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: pc,
                      marginBottom: 9,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <InlineIcon icon={ShoppingBag} size={13} />
                    Pedido
                  </div>

                  {form.items.map((it) => (
                    <div
                      key={it.id}
                      className="cart-item-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 7,
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          color: T.coralD,
                          fontWeight: 700,
                          flex: 1,
                        }}
                      >
                        {it.qty}× {it.name}
                      </span>

                      <div
                        className="cart-item-actions"
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => decreaseItem(it.id)}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 8,
                            border: `1px solid ${pc}22`,
                            background: T.white,
                            color: pc,
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <Minus
                            size={12}
                            strokeWidth={2.5}
                            style={{ pointerEvents: "none" }}
                          />
                        </button>

                        <span
                          style={{
                            color: pc,
                            fontWeight: 900,
                            minWidth: 64,
                            textAlign: "right",
                          }}
                        >
                          {fmtCOP(it.total)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(it.id)}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 8,
                            border: "none",
                            background: T.redL,
                            color: T.red,
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <Trash2
                            size={12}
                            strokeWidth={2.4}
                            style={{ pointerEvents: "none" }}
                          />
                        </button>
                      </div>
                    </div>
                  ))}

                  {form.mode === "domicilio" && (
                    <div
                      style={{
                        borderTop: `1px solid ${pc}22`,
                        paddingTop: 8,
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: T.coralD,
                        fontWeight: 700,
                      }}
                    >
                      <span>{vl.delivery_fee_label || "Domicilio"}</span>
                      <span>{fmtCOP(formDelivery)}</span>
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: `1px solid ${pc}30`,
                      paddingTop: 8,
                      marginTop: 7,
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 900,
                      color: pc,
                      fontSize: 15,
                    }}
                  >
                    <span>Total</span>
                    <span>{fmtCOP(formTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="new-order-footer">
            <Btn full v="neutral" onClick={() => setNewModal(false)}>
              Cancelar
            </Btn>

            <Btn full disabled={!validOrder} onClick={createOrder}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <InlineIcon icon={Plus} size={15} />
                Crear pedido
              </span>
            </Btn>
          </div>
        </Modal>
      )}

      {delivWaModal && sel && (
        <div
          className="delivery-wa-overlay"
          onClick={() => setDelivWaModal(false)}
        >
          <div
            className="delivery-wa-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
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
                    fontWeight: 900,
                    fontSize: 17,
                    color: T.text,
                  }}
                >
                  <SoftIcon icon={Bike} color="#16a34a" box={36} size={17} />
                  Enviar al domiciliario
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: T.mid,
                    marginTop: 4,
                    paddingLeft: 45,
                  }}
                >
                  Se abrirá WhatsApp con el mensaje prellenado.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDelivWaModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  background: T.bg,
                  border: "none",
                  borderRadius: 10,
                  color: T.mid,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <X
                  size={16}
                  strokeWidth={2.4}
                  style={{ pointerEvents: "none" }}
                />
              </button>
            </div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 14,
                padding: "11px 14px",
                marginBottom: 16,
                fontSize: 12,
                color: "#166534",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 5 }}>
                Pedido #{sel.id.toUpperCase().slice(0, 8)}
              </div>

              <div>
                {sel.customerName} · {sel.address}
              </div>

              <div
                style={{
                  marginTop: 5,
                  color: "#16a34a",
                  fontWeight: 800,
                }}
              >
                {sel.items?.length} producto{sel.items?.length !== 1 ? "s" : ""} ·{" "}
                {fmtCOP(sel.total)}
              </div>
            </div>

            <label
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: T.mid,
                display: "block",
                marginBottom: 7,
              }}
            >
              Número WhatsApp del domiciliario
            </label>

            <input
              value={delivWaPhone}
              onChange={(e) => setDelivWaPhone(e.target.value)}
              placeholder="+57 300 000 0000"
              type="tel"
              autoFocus
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 13px",
                background: "rgba(0,0,0,.04)",
                border: `1.5px solid ${T.border}`,
                borderRadius: 12,
                color: T.text,
                fontSize: 14,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                outline: "none",
                marginBottom: 14,
              }}
            />

            <div
              style={{
                fontSize: 11,
                color: T.mid,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Incluye datos del cliente, productos, total y enlace de ubicación
              en Google Maps.
            </div>

            <div className="delivery-wa-actions">
              <Btn full v="neutral" onClick={() => setDelivWaModal(false)}>
                Cancelar
              </Btn>

              <button
                type="button"
                onClick={() => {
                  if (!delivWaPhone.trim()) return;
                  sendToDelivery(sel, delivWaPhone);
                  setDelivWaModal(false);
                }}
                disabled={!delivWaPhone.trim()}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: delivWaPhone.trim() ? "#22c55e" : "#e5e7eb",
                  border: "none",
                  borderRadius: 12,
                  color: delivWaPhone.trim() ? "#fff" : T.mid,
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: delivWaPhone.trim() ? "pointer" : "default",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  transition: "background .2s",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <InlineIcon icon={MessageCircle} size={16} />
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ADMIN: RESERVAS ─────────────────────────────────────── */