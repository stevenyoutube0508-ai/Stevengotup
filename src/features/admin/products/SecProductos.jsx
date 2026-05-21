import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bike,
  Check,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Download,
  EyeOff,
  FileSpreadsheet,
  Filter,
  Globe2,
  ImageIcon,
  Package,
  PackageCheck,
  PackagePlus,
  PackageX,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Store,
  Tags,
  Trash2,
  Truck,
  Upload,
  Utensils,
  X,
} from "lucide-react";

import { T } from "../../../constants/theme";
import {
  ALLERGENS_LIST,
  LABEL_PRESETS,
} from "../../../constants/seed";
import { VERTICALS } from "../../../constants/verticals";
import { fmtCOP, newId } from "../../../utils/format";
import {
  Card,
  Btn,
  Field,
  Toggle,
  Tag,
  Modal,
  PhotoInput,
} from "../../../shared/components";

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

function PillButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "7px 13px",
        borderRadius: 999,
        border: `1.5px solid ${active ? T.coral : T.border}`,
        background: active ? T.coralL : T.white,
        color: active ? T.coral : T.mid,
        fontSize: 11,
        fontWeight: active ? 800 : 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "all .15s ease",
      }}
    >
      {children}
    </button>
  );
}

function ProductFallbackIcon({ isRestaurant, color = T.coral }) {
  const Icon = isRestaurant ? Utensils : Package;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: `${color}10`,
        color,
      }}
    >
      <Icon size={28} strokeWidth={2.25} />
    </div>
  );
}

export function SecProductos({
  products = [],
  cats = [],
  onAdd,
  onUpdate,
  onDelete,
  vertical,
  branches = [],
}) {
  const vl = vertical?.labels || VERTICALS.restaurant.labels;
  const isRestaurant = !vertical || vertical.id === "restaurant";
  const multiBranch = branches?.length > 1;

  const [modal, setModal] = useState(false);
  const [editP, setEditP] = useState(null);
  const [q, setQ] = useState("");
  const [fCat, setFCat] = useState("all");
  const [fSt, setFSt] = useState("all");
  const [fBranch, setFBranch] = useState("all");
  const [importModal, setImportModal] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importError, setImportError] = useState("");

  const activeCount = products.filter((p) => p.active && p.stock).length;
  const outOfStockCount = products.filter((p) => !p.stock).length;
  const hiddenCount = products.filter((p) => !p.active).length;

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const search = q.trim().toLowerCase();

        const mQ = !search || p.name?.toLowerCase().includes(search);
        const mC = fCat === "all" || p.catId === fCat;
        const mS =
          fSt === "all" ||
          (fSt === "active" && p.active && p.stock) ||
          (fSt === "agotado" && !p.stock) ||
          (fSt === "oculto" && !p.active);
        const mB =
          fBranch === "all" ||
          (p.branchIds || ["all"]).includes("all") ||
          (p.branchIds || ["all"]).includes(fBranch);

        return mQ && mC && mS && mB;
      }),
    [products, q, fCat, fSt, fBranch]
  );

  const downloadTemplate = () => {
    const sep = ";";
    const header = [
      "nombre",
      "categoria",
      "precio_menu",
      "precio_domicilio",
      "descripcion",
      "activo",
      "destacado",
    ];

    const catNames =
      cats.length > 0
        ? cats.map((c) => c.name)
        : ["Hamburguesas", "Bebidas", "Platos fuertes"];

    const rows = [
      [
        "Hamburguesa Clásica",
        catNames[0] || "Hamburguesas",
        "25000",
        "28000",
        "Carne 100% res con lechuga tomate y queso",
        "si",
        "no",
      ],
      [
        "Limonada de Coco",
        catNames[1] || "Bebidas",
        "8000",
        "9000",
        "Limonada natural con leche de coco",
        "si",
        "si",
      ],
      [
        "Bandeja Paisa",
        catNames[2] || "Platos fuertes",
        "38000",
        "42000",
        "Frijoles arroz chicharron huevo y arepa",
        "si",
        "si",
      ],
    ];

    const catHint = `## Categorias disponibles: ${catNames.join(" | ")}`;
    const csv = [
      "sep=;",
      catHint,
      header.join(sep),
      ...rows.map((r) => r.join(sep)),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_productos_picku.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportError("");

    if (!file.name.match(/\.(csv|txt)$/i)) {
      setImportError(
        "Debes guardar el archivo como CSV desde Excel: Archivo → Guardar como → CSV UTF-8."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = (ev) => {
      try {
        const text = ev.target.result.replace(/^\ufeff/, "").replace(/\r/g, "");
        const allLines = text.split("\n");

        const lines = allLines.filter(
          (l) =>
            l.trim() &&
            !l.trim().startsWith("sep=") &&
            !l.trim().startsWith("##") &&
            !l.trim().startsWith("//")
        );

        if (lines.length < 2) {
          setImportError("El archivo está vacío o no tiene productos.");
          return;
        }

        const sep = lines[0].includes(";") ? ";" : ",";

        const headers = lines[0]
          .split(sep)
          .map((h) =>
            h
              .trim()
              .replace(/^"|"$/g, "")
              .toLowerCase()
              .replace(/\s+/g, "_")
          );

        const rows = lines
          .slice(1)
          .map((line) => {
            const vals = line.split(sep);
            const clean = vals.map((v) =>
              v.trim().replace(/^"|"$/g, "").trim()
            );
            return Object.fromEntries(headers.map((h, i) => [h, clean[i] || ""]));
          })
          .filter((r) => r.nombre && r.nombre.trim() && !r.nombre.startsWith("#"));

        if (rows.length === 0) {
          setImportError("No se encontraron productos válidos.");
          return;
        }

        setImportRows(rows);
        setImportModal(true);
      } catch (err) {
        setImportError("Error al leer el archivo. Usa la plantilla descargada.");
      }
    };

    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const confirmImport = async () => {
    let count = 0;

    for (const row of importRows) {
      const cat =
        cats.find(
          (c) => c.name.toLowerCase() === row.categoria?.toLowerCase()
        ) || cats[0];

      const menuPrice =
        parseInt((row.precio_menu || row.precio || "0").replace(/\D/g, "")) ||
        0;

      const delivPrice =
        parseInt((row.precio_domicilio || "0").replace(/\D/g, "")) || 0;

      if (!menuPrice && !delivPrice) continue;

      const p = {
        id: newId(),
        catId: cat?.id || "",
        name: row.nombre,
        price: menuPrice || delivPrice,
        deliveryPrice: delivPrice || null,
        forMenu: menuPrice > 0,
        forDelivery: delivPrice > 0,
        desc: row.descripcion || "",
        emoji: "🍽️",
        img: "",
        active: (row.activo || "si").toLowerCase() === "si",
        featured: (row.destacado || "no").toLowerCase() === "si",
        stock: true,
        label: "",
        labelColor: "#f97316",
        allergens: [],
        clicks: 0,
      };

      await onAdd(p);
      count++;
    }

    setImportModal(false);
    setImportRows([]);

    alert(
      `${count} producto${count !== 1 ? "s" : ""} importado${
        count !== 1 ? "s" : ""
      } correctamente.`
    );
  };

  function PForm({ init, onSave, onClose }) {
    const isFood = isRestaurant || vertical?.id === "grocery";

    const itemName = vl.item || "Producto";
    const deliveryName = vl.delivery || "Domicilio";

    const priceLabelA = isRestaurant
      ? `Precio ${vl.catalog || "catálogo"}`
      : "Precio de venta";

    const priceLabelB = isRestaurant
      ? "Precio domicilio"
      : `Precio con ${deliveryName.toLowerCase()}`;

    const priceTip = isRestaurant
      ? "Deja en 0 el precio que no aplica. El producto solo aparecerá en el canal configurado."
      : `Deja en 0 si no ofreces ${deliveryName.toLowerCase()} para este ${itemName.toLowerCase()}.`;

    const labelPresetsLocal = isRestaurant
      ? LABEL_PRESETS
      : [
          { name: "Popular", color: "#f97316" },
          { name: "Nuevo", color: "#8b5cf6" },
          { name: "Oferta", color: "#dc2626" },
          { name: "Exclusivo", color: "#059669" },
          { name: "Especial", color: "#2563eb" },
          { name: "Edición limitada", color: "#db2777" },
        ];

    const defaultEmoji =
      vl.item === "Plato"
        ? "🍽️"
        : vl.item === "Prenda"
        ? "👗"
        : vl.item === "Equipo"
        ? "📱"
        : vl.item === "Servicio"
        ? "⚙️"
        : "🛍️";

    const defaultBIds = branches?.length === 1 ? [branches[0].id] : ["all"];

    const [d, setD] = useState(
      init
        ? {
            ...init,
            price: String(init.price || 0),
            deliveryPrice: String(init.deliveryPrice || ""),
            allergens: init.allergens || [],
            branchIds: init.branchIds || defaultBIds,
          }
        : {
            name: "",
            price: "",
            deliveryPrice: "",
            desc: "",
            catId: cats[0]?.id || "",
            emoji: defaultEmoji,
            img: "",
            active: true,
            featured: false,
            stock: true,
            forMenu: true,
            forDelivery: false,
            label: "",
            labelColor: "#f97316",
            allergens: [],
            branchIds: defaultBIds,
          }
    );

    const set = (k) => (v) => setD((p) => ({ ...p, [k]: v }));

    const togA = (id) =>
      set("allergens")(
        d.allergens.includes(id)
          ? d.allergens.filter((x) => x !== id)
          : [...d.allergens, id]
      );

    const hasAnyPrice =
      (parseInt(d.price) || 0) > 0 || (parseInt(d.deliveryPrice) || 0) > 0;

    const valid = d.name.trim() && hasAnyPrice && d.catId;

    return (
      <div>
        <style>
          {`
            @media(max-width:720px){
              .prod-form-two{grid-template-columns:1fr!important}
              .prod-form-name{grid-template-columns:1fr!important}
            }
          `}
        </style>

        <PhotoInput
          label={vl.item_photo || "Foto del producto"}
          value={d.img}
          onChange={set("img")}
          dims="800×800 px • Cuadrada 1:1 • JPG o PNG • Máx 2MB"
        />

        <div
          className="prod-form-name"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 92px",
            gap: 10,
          }}
        >
          <Field
            label={`${itemName} *`}
            value={d.name}
            onChange={set("name")}
            placeholder={`Ej: ${vl.item_example || "Producto destacado"}`}
            required
          />

          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.mid,
                display: "block",
                marginBottom: 5,
              }}
            >
              Icono fallback
            </label>
            <input
              value={d.emoji}
              onChange={(e) => set("emoji")(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 4px",
                background: T.bg,
                border: `1.5px solid ${T.border}`,
                borderRadius: 12,
                fontSize: 20,
                textAlign: "center",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div
          className="prod-form-two"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <Field
            label={priceLabelA}
            value={d.price}
            onChange={(v) => {
              set("price")(v);
              if (parseInt(v) > 0) {
                setD((p) => ({ ...p, forMenu: true }));
              }
            }}
            type="number"
            placeholder="38000"
            prefix="$"
            suffix="COP"
          />

          <Field
            label={priceLabelB}
            value={d.deliveryPrice}
            onChange={(v) => {
              set("deliveryPrice")(v);
              if (parseInt(v) > 0) {
                setD((p) => ({ ...p, forDelivery: true }));
              }
            }}
            type="number"
            placeholder="42000"
            prefix="$"
            suffix="COP"
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            background: T.coralL,
            borderRadius: 12,
            padding: "9px 11px",
            fontSize: 11,
            color: T.coral,
            marginBottom: 14,
            lineHeight: 1.45,
            fontWeight: 700,
          }}
        >
          <InlineIcon icon={DollarSign} size={14} />
          {priceTip}
        </div>

        <Field
          label="Descripción"
          value={d.desc}
          onChange={set("desc")}
          textarea
          rows={3}
          placeholder="Ingredientes, preparación, beneficios o detalles del producto…"
        />

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: T.mid,
              display: "block",
              marginBottom: 6,
            }}
          >
            Categoría *
          </label>

          <select
            value={d.catId}
            onChange={(e) => set("catId")(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 13px",
              background: T.bg,
              border: `1.5px solid ${T.border}`,
              borderRadius: 12,
              color: T.text,
              fontSize: 13,
              outline: "none",
            }}
          >
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: T.mid,
              display: "block",
              marginBottom: 6,
            }}
          >
            Etiqueta badge
          </label>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              value={d.label}
              onChange={(e) => set("label")(e.target.value)}
              placeholder="Popular, Nuevo, Oferta…"
              style={{
                flex: 1,
                padding: "10px 13px",
                background: T.bg,
                border: `1.5px solid ${T.border}`,
                borderRadius: 12,
                color: T.text,
                fontSize: 13,
                outline: "none",
              }}
            />

            {d.label && (
              <input
                type="color"
                value={d.labelColor}
                onChange={(e) => set("labelColor")(e.target.value)}
                style={{
                  width: 42,
                  height: 40,
                  borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: "none",
                  cursor: "pointer",
                }}
              />
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {labelPresetsLocal.map((lp) => (
              <button
                key={lp.name}
                type="button"
                onClick={() =>
                  setD((p) => ({
                    ...p,
                    label: lp.name,
                    labelColor: lp.color,
                  }))
                }
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: `1.5px solid ${
                    d.label === lp.name ? lp.color : T.border
                  }`,
                  background:
                    d.label === lp.name ? lp.color + "18" : "transparent",
                  color: d.label === lp.name ? lp.color : T.mid,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {lp.name}
              </button>
            ))}

            {d.label && (
              <button
                type="button"
                onClick={() => setD((p) => ({ ...p, label: "" }))}
                style={{
                  width: 27,
                  height: 27,
                  borderRadius: 999,
                  border: `1px solid ${T.border}`,
                  background: "transparent",
                  color: T.mid,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={13} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>

        {isFood && (
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.mid,
                display: "block",
                marginBottom: 8,
              }}
            >
              Alérgenos
            </label>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ALLERGENS_LIST.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => togA(a.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 11px",
                    borderRadius: 999,
                    border: `1.5px solid ${
                      d.allergens.includes(a.id) ? T.coral : T.border
                    }`,
                    background: d.allergens.includes(a.id)
                      ? T.coralL
                      : "transparent",
                    color: d.allergens.includes(a.id) ? T.coral : T.mid,
                    fontSize: 12,
                    fontWeight: d.allergens.includes(a.id) ? 800 : 600,
                    cursor: "pointer",
                  }}
                >
                  <InlineIcon icon={AlertTriangle} size={12} />
                  {a.l}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            background: T.bg,
            borderRadius: 16,
            padding: 15,
            marginBottom: 18,
            border: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 11,
              fontWeight: 900,
              color: T.mid,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            <InlineIcon icon={Filter} size={13} />
            Opciones
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Toggle
              value={d.active}
              onChange={set("active")}
              label={isRestaurant ? "Visible en el catálogo" : "Activo en el catálogo"}
            />
            <Toggle
              value={d.stock}
              onChange={set("stock")}
              label="En stock / disponible"
            />
            <Toggle
              value={d.featured}
              onChange={set("featured")}
              label="Producto destacado"
            />
            {isRestaurant && (
              <Toggle
                value={d.forMenu !== false}
                onChange={set("forMenu")}
                label="Aparece en catálogo digital"
              />
            )}
            {isRestaurant && (
              <Toggle
                value={d.forDelivery !== false}
                onChange={set("forDelivery")}
                label="Aparece en domicilio"
              />
            )}
          </div>
        </div>

        {multiBranch && (
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 800,
                color: T.mid,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: ".5px",
              }}
            >
              <InlineIcon icon={Store} size={13} />
              Sucursales donde aparece
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* "Todas las sucursales" option */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 13px",
                  borderRadius: 12,
                  border: `1.5px solid ${
                    (d.branchIds || ["all"]).includes("all") ? T.coral + "66" : T.border
                  }`,
                  background: (d.branchIds || ["all"]).includes("all") ? T.coralL : T.bg,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={(d.branchIds || ["all"]).includes("all")}
                  onChange={() => setD((p) => ({ ...p, branchIds: ["all"] }))}
                  style={{ accentColor: T.coral, width: 16, height: 16, cursor: "pointer" }}
                />
                <InlineIcon
                  icon={Globe2}
                  size={14}
                  color={(d.branchIds || ["all"]).includes("all") ? T.coral : T.light}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: (d.branchIds || ["all"]).includes("all") ? T.coral : T.mid,
                  }}
                >
                  Todas las sucursales
                </span>
              </label>

              {/* Individual branches */}
              {(branches || []).map((b) => {
                const isAll = (d.branchIds || ["all"]).includes("all");
                const isChecked = !isAll && (d.branchIds || []).includes(b.id);
                return (
                  <label
                    key={b.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 13px",
                      borderRadius: 12,
                      border: `1.5px solid ${isChecked ? T.coral + "44" : T.border}`,
                      background: isChecked ? T.coralL : T.bg,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isAll) {
                          // Switch from "Todas" mode to selecting just this branch
                          setD((p) => ({ ...p, branchIds: [b.id] }));
                        } else {
                          const cur = (d.branchIds || []).filter((x) => x !== "all");
                          const next = cur.includes(b.id)
                            ? cur.filter((x) => x !== b.id)
                            : [...cur, b.id];
                          setD((p) => ({
                            ...p,
                            branchIds: next.length ? next : ["all"],
                          }));
                        }
                      }}
                      style={{ accentColor: T.coral, width: 16, height: 16, cursor: "pointer" }}
                    />
                    <InlineIcon
                      icon={Store}
                      size={14}
                      color={isChecked ? T.coral : T.light}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isChecked ? T.coral : T.mid,
                      }}
                    >
                      {b.name}
                    </span>
                    {b.city && (
                      <span style={{ fontSize: 11, color: T.light, marginLeft: "auto" }}>
                        {b.city}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Summary hint */}
            {!(d.branchIds || ["all"]).includes("all") && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: T.coral,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <InlineIcon icon={Store} size={12} />
                Asignado a {(d.branchIds || []).length} sucursal
                {(d.branchIds || []).length !== 1 ? "es" : ""}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <Btn full v="neutral" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn
            full
            disabled={!valid}
            onClick={() =>
              onSave({
                ...d,
                price: parseInt(d.price) || 0,
                deliveryPrice: parseInt(d.deliveryPrice) || null,
                forMenu: d.forMenu !== false,
                forDelivery: d.forDelivery !== false,
                id: d.id || newId(),
                clicks: d.clicks || 0,
              })
            }
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <InlineIcon icon={init ? Check : Plus} size={15} />
              {init ? "Guardar cambios" : "Agregar producto"}
            </span>
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <style>
        {`
          @media(max-width:820px){
            .prod-header{flex-direction:column!important}
            .prod-actions{width:100%!important}
            .prod-actions > *{flex:1!important}
            .prod-filter-row{flex-direction:column!important;align-items:stretch!important}
            .prod-product-main{flex-direction:column!important}
            .prod-product-actions{margin-left:0!important;width:100%!important;justify-content:flex-end!important}
          }
        `}
      </style>

      <div
        className="prod-header"
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
              gap: 6,
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
            <InlineIcon icon={Package} size={13} />
            Catálogo
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
            Productos
          </h2>

          <p
            style={{
              color: T.mid,
              fontSize: 13,
              marginTop: 6,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span>{activeCount} activos</span>
            <span>·</span>
            <span>{outOfStockCount} agotados</span>
            <span>·</span>
            <span>{hiddenCount} ocultos</span>
          </p>
        </div>

        <div
          className="prod-actions"
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Btn v="light" sm onClick={downloadTemplate}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <InlineIcon icon={FileSpreadsheet} size={14} />
              Plantilla Excel
            </span>
          </Btn>

          <label style={{ cursor: "pointer" }}>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleImportFile}
              style={{ display: "none" }}
            />
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "8px 14px",
                background: T.greenL,
                border: `1px solid ${T.green}44`,
                borderRadius: 11,
                fontSize: 12,
                fontWeight: 800,
                color: T.green,
                cursor: "pointer",
                minHeight: 34,
              }}
            >
              <InlineIcon icon={Upload} size={14} />
              Importar CSV
            </span>
          </label>

          <Btn
            onClick={() => {
              setEditP(null);
              setModal(true);
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <InlineIcon icon={Plus} size={15} />
              Nuevo producto
            </span>
          </Btn>
        </div>
      </div>

      {importError && (
        <div
          style={{
            marginBottom: 12,
            color: T.red,
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: T.redL,
            border: `1px solid ${T.red}22`,
            borderRadius: 12,
            padding: "10px 12px",
          }}
        >
          <InlineIcon icon={AlertTriangle} size={15} />
          {importError}
        </div>
      )}

      {multiBranch && (
        <Card style={{ marginBottom: 12, padding: "11px 14px" }}>
          <div
            style={{
              display: "flex",
              gap: 7,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 900,
                color: T.mid,
                marginRight: 4,
              }}
            >
              <InlineIcon icon={Store} size={13} />
              Sucursal:
            </span>

            {[
              ["all", "Todas", Globe2],
              ...(branches || []).map((b) => [b.id, b.name, Store]),
            ].map(([k, l, Icon]) => (
              <PillButton
                key={k}
                active={fBranch === k}
                onClick={() => setFBranch(k)}
              >
                <InlineIcon icon={Icon} size={12} />
                {l}
              </PillButton>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 14, padding: "13px 16px" }}>
        <div
          className="prod-filter-row"
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar producto..."
              style={{
                width: "100%",
                padding: "10px 13px 10px 36px",
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                fontSize: 13,
                color: T.text,
                outline: "none",
              }}
            />
          </div>

          <select
            value={fCat}
            onChange={(e) => setFCat(e.target.value)}
            style={{
              padding: "10px 12px",
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              fontSize: 12,
              color: T.mid,
              outline: "none",
              minHeight: 38,
            }}
          >
            <option value="all">Todas las categorías</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              ["all", "Todos", Package],
              ["active", "Activos", PackageCheck],
              ["agotado", "Agotados", PackageX],
              ["oculto", "Ocultos", EyeOff],
            ].map(([k, l, Icon]) => (
              <PillButton key={k} active={fSt === k} onClick={() => setFSt(k)}>
                <InlineIcon icon={Icon} size={12} />
                {l}
              </PillButton>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((p) => {
          const cat = cats.find((c) => c.id === p.catId);

          const branchLabel = (p.branchIds || ["all"]).includes("all")
            ? "Todas"
            : branches?.find((b) => b.id === (p.branchIds || [])[0])?.name ||
              (p.branchIds || [])[0];

          return (
            <Card
              key={p.id}
              style={{
                padding: "15px 16px",
                opacity: p.active ? 1 : 0.68,
                transition: "all .15s ease",
              }}
              className="hov"
            >
              <div
                className="prod-product-main"
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 18,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px rgba(15,23,42,.04)",
                  }}
                >
                  {p.img ? (
                    <img
                      src={p.img}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      alt=""
                    />
                  ) : (
                    <ProductFallbackIcon
                      isRestaurant={isRestaurant}
                      color={T.coral}
                    />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 5,
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 900,
                            fontSize: 15,
                            color: T.text,
                            lineHeight: 1.25,
                          }}
                        >
                          {p.name}
                        </span>

                        {p.featured && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: T.amber,
                              background: T.amberL,
                              borderRadius: 999,
                              padding: "3px 7px",
                              fontSize: 10,
                              fontWeight: 900,
                            }}
                          >
                            <InlineIcon icon={Sparkles} size={11} />
                            Destacado
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: 11,
                          color: T.mid,
                          lineHeight: 1.5,
                          marginTop: 5,
                          marginBottom: 8,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {p.desc || "Sin descripción registrada."}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        flexShrink: 0,
                        gap: 3,
                      }}
                    >
                      {p.price > 0 && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontWeight: 900,
                            fontSize: 13,
                            color: T.coral,
                          }}
                        >
                          <InlineIcon
                            icon={isRestaurant ? ClipboardList : DollarSign}
                            size={13}
                          />
                          {fmtCOP(p.price)}
                        </span>
                      )}

                      {p.deliveryPrice > 0 && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontWeight: 900,
                            fontSize: 13,
                            color: "#059669",
                          }}
                        >
                          <InlineIcon icon={isRestaurant ? Bike : Truck} size={13} />
                          {fmtCOP(p.deliveryPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {cat && (
                      <Tag color={T.coral}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <InlineIcon icon={Tags} size={11} />
                          {cat.name}
                        </span>
                      </Tag>
                    )}

                    {isRestaurant && p.forMenu !== false && (
                      <Tag color="#2563eb">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <InlineIcon icon={ClipboardList} size={11} />
                          Catálogo
                        </span>
                      </Tag>
                    )}

                    {isRestaurant && p.forDelivery !== false && (
                      <Tag color="#059669">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <InlineIcon icon={Bike} size={11} />
                          Domicilio
                        </span>
                      </Tag>
                    )}

                    {multiBranch && (
                      <Tag color={T.mid}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <InlineIcon
                            icon={branchLabel === "Todas" ? Globe2 : Store}
                            size={11}
                          />
                          {branchLabel}
                        </span>
                      </Tag>
                    )}

                    {p.label && (
                      <Tag color={p.labelColor}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <InlineIcon icon={Sparkles} size={11} />
                          {p.label}
                        </span>
                      </Tag>
                    )}

                    {(p.allergens || []).map((a) => {
                      const al = ALLERGENS_LIST.find((x) => x.id === a);
                      return al ? (
                        <Tag key={a} color="#78716c" sm>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <InlineIcon icon={AlertTriangle} size={10} />
                            {al.l}
                          </span>
                        </Tag>
                      ) : null;
                    })}

                    {!p.stock && <Tag color={T.red}>Agotado</Tag>}
                    {!p.active && <Tag color={T.mid}>Oculto</Tag>}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 13,
                  paddingTop: 11,
                  borderTop: `1px solid ${T.border}`,
                  flexWrap: "wrap",
                }}
              >
                <Toggle
                  value={p.active}
                  onChange={(v) => onUpdate(p.id, { active: v })}
                  label={p.active ? "Visible" : "Oculto"}
                  sm
                />

                <div style={{ width: 1, height: 16, background: T.border }} />

                <Toggle
                  value={p.stock}
                  onChange={(v) => onUpdate(p.id, { stock: v })}
                  label={p.stock ? "En stock" : "Agotado"}
                  sm
                />

                <div
                  className="prod-product-actions"
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <Btn
                    sm
                    v="ghost"
                    onClick={() => {
                      setEditP(p);
                      setModal(true);
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <InlineIcon icon={Pencil} size={13} />
                      Editar
                    </span>
                  </Btn>

                  <Btn
                    sm
                    v="danger"
                    onClick={() =>
                      window.confirm(`¿Eliminar "${p.name}"?`) &&
                      onDelete(p.id)
                    }
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <InlineIcon icon={Trash2} size={13} />
                    </span>
                  </Btn>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card style={{ textAlign: "center", padding: "62px 20px" }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 20,
                background: T.coralL,
                color: T.coral,
                display: "grid",
                placeItems: "center",
                margin: "0 auto 13px",
              }}
            >
              {q ? (
                <Search size={26} strokeWidth={2.35} />
              ) : (
                <PackagePlus size={28} strokeWidth={2.35} />
              )}
            </div>

            <div
              style={{
                fontWeight: 900,
                color: T.text,
                marginBottom: 6,
                fontSize: 15,
              }}
            >
              {q ? `Sin resultados para "${q}"` : "No hay productos"}
            </div>

            <div
              style={{
                color: T.mid,
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              {q
                ? "Prueba con otro nombre, categoría o estado."
                : "Crea tu primer producto para empezar a vender."}
            </div>

            {!q && (
              <Btn
                onClick={() => {
                  setEditP(null);
                  setModal(true);
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <InlineIcon icon={Plus} size={15} />
                  Agregar primer producto
                </span>
              </Btn>
            )}
          </Card>
        )}
      </div>

      {modal && (
        <Modal
          title={editP ? "Editar producto" : "Nuevo producto"}
          icon={
            <Package
              size={20}
              strokeWidth={2.4}
              style={{ verticalAlign: "-4px" }}
            />
          }
          onClose={() => setModal(false)}
          wide
        >
          <PForm
            init={editP}
            onSave={(d) => {
              editP ? onUpdate(editP.id, d) : onAdd(d);
              setModal(false);
              setEditP(null);
            }}
            onClose={() => setModal(false)}
            branches={branches}
          />
        </Modal>
      )}

      {importModal && (
        <div
          onClick={() => setImportModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 600,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.white,
              borderRadius: 22,
              padding: 24,
              width: "100%",
              maxWidth: 600,
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: T.shMd,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 18,
                    fontWeight: 900,
                    color: T.text,
                  }}
                >
                  <SoftIcon icon={Upload} color={T.green} box={36} size={17} />
                  Importar productos
                </div>

                <div style={{ color: T.mid, fontSize: 12, marginTop: 5 }}>
                  {importRows.length} producto
                  {importRows.length !== 1 ? "s" : ""} encontrado
                  {importRows.length !== 1 ? "s" : ""}
                </div>
              </div>

              <button
                onClick={() => setImportModal(false)}
                style={{
                  background: T.bg,
                  border: "none",
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  color: T.mid,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            <div
              style={{
                background: T.bg,
                borderRadius: 14,
                overflow: "hidden",
                marginBottom: 18,
                border: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: 0,
                  padding: "9px 14px",
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                {["Producto", "Categoría", "Precio catálogo", "Precio dom."].map(
                  (h) => (
                    <div
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: T.light,
                        textTransform: "uppercase",
                        letterSpacing: ".35px",
                      }}
                    >
                      {h}
                    </div>
                  )
                )}
              </div>

              {importRows.map((r, i) => {
                const cat = cats.find(
                  (c) => c.name.toLowerCase() === r.categoria?.toLowerCase()
                );

                const menuPrice =
                  parseInt((r.precio_menu || "0").replace(/\D/g, "")) || 0;

                const deliveryPrice =
                  parseInt((r.precio_domicilio || "0").replace(/\D/g, "")) ||
                  0;

                const valid = r.nombre && (menuPrice > 0 || deliveryPrice > 0);

                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr",
                      gap: 0,
                      padding: "11px 14px",
                      borderBottom: `1px solid ${T.border}`,
                      background: valid ? "transparent" : "#fff5f5",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: T.text,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        minWidth: 0,
                      }}
                    >
                      <InlineIcon
                        icon={valid ? PackageCheck : AlertTriangle}
                        size={14}
                        color={valid ? T.green : T.red}
                      />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.nombre}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: cat ? T.green : T.amber,
                        fontWeight: 700,
                      }}
                    >
                      {cat ? cat.name : r.categoria || "—"}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: T.text,
                      }}
                    >
                      {menuPrice
                        ? `$${menuPrice.toLocaleString("es-CO")}`
                        : "—"}
                    </div>

                    <div style={{ fontSize: 12, color: T.mid }}>
                      {deliveryPrice
                        ? `$${deliveryPrice.toLocaleString("es-CO")}`
                        : "—"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                background: T.greenL,
                border: `1px solid ${T.green}44`,
                borderRadius: 13,
                padding: "11px 14px",
                fontSize: 12,
                color: "#065f46",
                marginBottom: 18,
                lineHeight: 1.45,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <InlineIcon icon={CheckCircle2} size={16} color={T.green} />
              <span>
                Canal asignado automáticamente: <strong>precio catálogo</strong> →
                catálogo digital · <strong>precio domicilio</strong> → domicilio. Si
                tiene ambos, aparece en los dos.
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn full v="neutral" onClick={() => setImportModal(false)}>
                Cancelar
              </Btn>

              <Btn full onClick={confirmImport}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <InlineIcon icon={Download} size={15} />
                  Importar {importRows.length} productos
                </span>
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ADMIN: CATEGORÍAS ───────────────────────────────────── */