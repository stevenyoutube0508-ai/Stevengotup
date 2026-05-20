import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import QRCodeLib from "qrcode";
import { supabase } from "../../../lib/supabase";
import { T, CM, STYLES } from "../../../constants/theme";
import { USERS, SEED_RESTAURANTS, SEED_TICKETS, PAYMENTS_HISTORY, MRR_TREND, PLAN_DIST, INIT_CATS, INIT_PRODUCTS, INIT_CONFIG, INIT_BILLING, BANK_INFO, PLANS_CATALOG, INIT_BRANCHES, ALLERGENS_LIST, LABEL_PRESETS, PLAN_MAP, STATUS_MAP } from "../../../constants/seed";
import { VERTICALS, getVertical } from "../../../constants/verticals";
import { KANBAN_COLS, K_NEXT, ANALYTICS_WEEK } from "../../../constants/kanban";
import { fmtCOP, newId, todayStr, timeNow, readFile } from "../../../utils/format";
import { pointInPoly } from "../../../utils/geo";
import { Card, Btn, Field, Toggle, Tag, Modal, Toast, StatCard, PhotoInput } from "../../../shared/components";
import {
  AlertTriangle,
  ArrowLeft,
  Bike,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Copy,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Link2,
  Map,
  MapPin,
  Megaphone,
  Navigation,
  Pencil,
  Printer,
  QrCode,
  Settings,
  Store,
  Trash2,
  User,
  X,
} from "lucide-react";

import { useLeaflet } from "../../../shared/hooks/useLeaflet";

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

function SoftIcon({ icon: Icon, color = T.coral, size = 18, box = 36, style }) {
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
      <Icon size={size} strokeWidth={2.4} />
    </div>
  );
}

function IconButton({ icon: Icon, onClick, color, bg, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        background: bg,
        color,
        border: "none",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Icon size={15} strokeWidth={2.4} />
    </button>
  );
}

export function PolygonMap({
  zones,
  onUpdate,
  onAdd,
  onDelete,
  branchAddress,
  branchCity,
}) {
  const leafletReady = useLeaflet();
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const polyLayersRef = useRef({});
  const drawPointsRef = useRef([]);
  const drawLayersRef = useRef([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ptCount, setPtCount] = useState(0);
  const [newForm, setNewForm] = useState(null);
  const [pendingLatLngs, setPendingLatLngs] = useState([]);
  const [editZone, setEditZone] = useState(null);
  const [drawColor, setDrawColor] = useState("#6d28d9");

  const COLORS = [
    "#6d28d9",
    "#059669",
    "#dc2626",
    "#2563eb",
    "#d97706",
    "#db2777",
    "#0891b2",
    "#f97316",
  ];

  const renderZone = useCallback((map, z) => {
    if (!z.latLngs?.length) return;

    if (polyLayersRef.current[z.id]) {
      map.removeLayer(polyLayersRef.current[z.id]);
    }

    const poly = window.L.polygon(
      z.latLngs.map((p) => [p.lat, p.lng]),
      {
        color: z.color,
        fillColor: z.color,
        fillOpacity: z.active ? 0.3 : 0.07,
        weight: 2.5,
        opacity: z.active ? 1 : 0.4,
      }
    ).addTo(map);

    poly.bindPopup(
      `<b>${z.name}</b><br><span style="color:${z.color};font-weight:700">${fmtCOP(
        z.price
      )}</span> · ${z.minTime}–${z.maxTime} min`
    );

    polyLayersRef.current[z.id] = poly;
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapDivRef.current || mapRef.current) return;

    const L = window.L;

    const initMap = ([lat, lng]) => {
      const map = L.map(mapDivRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      const markerHtml = `
        <div style="
          background:${T.coral};
          width:34px;
          height:34px;
          border-radius:14px;
          display:flex;
          align-items:center;
          justify-content:center;
          border:3px solid #fff;
          box-shadow:0 8px 18px rgba(15,23,42,.28);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: "",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([lat, lng], { icon }).addTo(map).bindPopup("<b>Tu sucursal</b>");

      zones.forEach((z) => renderZone(map, z));

      map.on("click", (e) => {
        if (!drawPointsRef.current._active) return;

        const latlng = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        };

        drawPointsRef.current.push(latlng);
        setPtCount(drawPointsRef.current.length);

        const dot = L.circleMarker([latlng.lat, latlng.lng], {
          radius: 5,
          color: "#fff",
          fillColor: drawPointsRef.current._color || "#6d28d9",
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);

        drawLayersRef.current.push(dot);

        drawLayersRef.current
          .filter((l) => l._isPreview)
          .forEach((l) => map.removeLayer(l));

        if (drawPointsRef.current.length >= 2) {
          const line = L.polyline(
            drawPointsRef.current.map((p) => [p.lat, p.lng]),
            {
              color: drawPointsRef.current._color || "#6d28d9",
              dashArray: "6,4",
              weight: 2,
            }
          );

          line._isPreview = true;
          line.addTo(map);
          drawLayersRef.current.push(line);
        }
      });
    };

    const q = encodeURIComponent(
      [branchAddress, branchCity].filter(Boolean).join(", ") || "Colombia"
    );

    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { "Accept-Language": "es" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.length) {
          initMap([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          initMap([4.711, -74.0721]);
        }
      })
      .catch(() => initMap([4.711, -74.0721]));

    // Cleanup: destroy the Leaflet map instance when the component unmounts
    // so its internal DOM event-listeners don't linger and block UI interactions.
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletReady]);

  useEffect(() => {
    if (!mapRef.current) return;

    Object.keys(polyLayersRef.current).forEach((id) => {
      if (!zones.find((z) => z.id === id)) {
        mapRef.current.removeLayer(polyLayersRef.current[id]);
        delete polyLayersRef.current[id];
      }
    });

    zones.forEach((z) => renderZone(mapRef.current, z));
  }, [zones, renderZone]);

  const startDraw = () => {
    drawPointsRef.current = [];
    drawPointsRef.current._active = true;
    drawPointsRef.current._color = drawColor;
    setPtCount(0);
    setIsDrawing(true);

    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = "crosshair";
    }
  };

  const cancelDraw = () => {
    drawPointsRef.current = [];
    drawPointsRef.current._active = false;

    drawLayersRef.current.forEach((l) => mapRef.current?.removeLayer(l));
    drawLayersRef.current = [];

    setPtCount(0);
    setIsDrawing(false);
    setNewForm(null);
    setPendingLatLngs([]);

    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = "";
    }
  };

  const closePoly = () => {
    const pts = drawPointsRef.current;

    if (pts.length < 3) {
      alert("Necesitas al menos 3 puntos en el mapa.");
      return;
    }

    drawPointsRef.current._active = false;

    drawLayersRef.current.forEach((l) => mapRef.current?.removeLayer(l));
    drawLayersRef.current = [];

    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = "";
    }

    setPendingLatLngs([...pts]);
    setNewForm({
      name: "",
      price: "5000",
      minTime: "20",
      maxTime: "40",
    });
    setIsDrawing(false);
  };

  const saveZone = () => {
    if (!newForm?.name?.trim() || !pendingLatLngs.length) return;

    onAdd({
      id: newId(),
      name: newForm.name,
      color: drawColor,
      price: parseInt(newForm.price) || 5000,
      minTime: parseInt(newForm.minTime) || 20,
      maxTime: parseInt(newForm.maxTime) || 40,
      active: true,
      latLngs: [...pendingLatLngs],
      points: [],
    });

    setPendingLatLngs([]);
    setNewForm(null);
    drawPointsRef.current = [];
    setPtCount(0);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {!isDrawing && !newForm && (
          <button
            onClick={startDraw}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: T.coral,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 8px 18px ${T.coral}35`,
            }}
          >
            <InlineIcon icon={Pencil} size={15} />
            Dibujar zona
          </button>
        )}

        {isDrawing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: T.coralL,
              border: `1.5px solid ${T.coral}44`,
              borderRadius: 14,
              padding: "9px 12px",
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                fontWeight: 800,
                color: T.coral,
              }}
            >
              <InlineIcon icon={Navigation} size={15} />
              Haz clic en el mapa para añadir vértices · {ptCount} punto
              {ptCount !== 1 ? "s" : ""}
            </span>

            <div style={{ display: "flex", gap: 5 }}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => {
                    setDrawColor(c);
                    drawPointsRef.current._color = c;
                  }}
                  style={{
                    width: 21,
                    height: 21,
                    borderRadius: "50%",
                    background: c,
                    cursor: "pointer",
                    border:
                      drawColor === c
                        ? `3px solid ${T.text}`
                        : "3px solid transparent",
                  }}
                />
              ))}
            </div>

            <button
              onClick={closePoly}
              disabled={ptCount < 3}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: T.coral,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 800,
                cursor: ptCount < 3 ? "not-allowed" : "pointer",
                opacity: ptCount < 3 ? 0.5 : 1,
              }}
            >
              <InlineIcon icon={Check} size={14} />
              Cerrar zona
            </button>

            <button
              onClick={cancelDraw}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: T.redL,
                color: T.red,
                border: "none",
                borderRadius: 9,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <InlineIcon icon={X} size={14} />
              Cancelar
            </button>
          </div>
        )}

        <div style={{ marginLeft: "auto", fontSize: 12, color: T.mid }}>
          {zones.filter((z) => z.active).length} zona
          {zones.filter((z) => z.active).length !== 1 ? "s" : ""} activa
          {zones.filter((z) => z.active).length !== 1 ? "s" : ""}
        </div>
      </div>

      {!leafletReady && (
        <div
          style={{
            height: 420,
            borderRadius: 16,
            background: T.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `3px solid ${T.border}`,
              borderTopColor: T.coral,
              animation: "spin .7s linear infinite",
            }}
          />
          <div style={{ color: T.mid, fontSize: 13 }}>Cargando mapa…</div>
        </div>
      )}

      <div
        ref={mapDivRef}
        style={{
          height: 420,
          borderRadius: 16,
          overflow: "hidden",
          display: leafletReady ? "block" : "none",
          marginBottom: 16,
          boxShadow: T.shMd,
          border: `1px solid ${T.border}`,
        }}
      />

      {newForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 700,
            background: "rgba(0,0,0,.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: T.white,
              borderRadius: 22,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              boxShadow: T.shMd,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 900,
                fontSize: 17,
                color: T.text,
                marginBottom: 16,
              }}
            >
              <SoftIcon icon={MapPin} color={T.coral} box={34} size={17} />
              Nueva zona de domicilio
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: T.mid,
                  display: "block",
                  marginBottom: 7,
                }}
              >
                Color de la zona
              </label>

              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setDrawColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      cursor: "pointer",
                      border:
                        drawColor === c
                          ? `3px solid ${T.text}`
                          : "3px solid transparent",
                    }}
                  />
                ))}
              </div>
            </div>

            <Field
              label="Nombre de la zona"
              value={newForm.name}
              onChange={(v) => setNewForm((p) => ({ ...p, name: v }))}
              placeholder="Ej: Centro, Zona Norte…"
              required
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
              }}
            >
              <Field
                label="Precio"
                value={newForm.price}
                onChange={(v) => setNewForm((p) => ({ ...p, price: v }))}
                type="number"
                prefix="$"
                suffix="COP"
              />
              <Field
                label="Min"
                value={newForm.minTime}
                onChange={(v) => setNewForm((p) => ({ ...p, minTime: v }))}
                type="number"
              />
              <Field
                label="Max"
                value={newForm.maxTime}
                onChange={(v) => setNewForm((p) => ({ ...p, maxTime: v }))}
                type="number"
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <Btn full v="neutral" onClick={cancelDraw}>
                Cancelar
              </Btn>
              <Btn full disabled={!newForm.name?.trim()} onClick={saveZone}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <InlineIcon icon={Check} size={14} />
                  Guardar zona
                </span>
              </Btn>
            </div>
          </div>
        </div>
      )}

      {editZone && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 700,
            background: "rgba(0,0,0,.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: T.white,
              borderRadius: 22,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              boxShadow: T.shMd,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 900,
                fontSize: 17,
                color: T.text,
                marginBottom: 16,
              }}
            >
              <SoftIcon icon={Pencil} color={T.coral} box={34} size={17} />
              Editar zona
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: T.mid,
                  display: "block",
                  marginBottom: 7,
                }}
              >
                Color
              </label>

              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setEditZone((p) => ({ ...p, color: c }))}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      cursor: "pointer",
                      border:
                        editZone.color === c
                          ? `3px solid ${T.text}`
                          : "3px solid transparent",
                    }}
                  />
                ))}
              </div>
            </div>

            <Field
              label="Nombre"
              value={editZone.name}
              onChange={(v) => setEditZone((p) => ({ ...p, name: v }))}
              required
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
              }}
            >
              <Field
                label="Precio"
                value={String(editZone.price)}
                onChange={(v) =>
                  setEditZone((p) => ({ ...p, price: parseInt(v) || 0 }))
                }
                type="number"
                prefix="$"
              />
              <Field
                label="Min"
                value={String(editZone.minTime)}
                onChange={(v) =>
                  setEditZone((p) => ({ ...p, minTime: parseInt(v) || 0 }))
                }
                type="number"
              />
              <Field
                label="Max"
                value={String(editZone.maxTime)}
                onChange={(v) =>
                  setEditZone((p) => ({ ...p, maxTime: parseInt(v) || 0 }))
                }
                type="number"
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <Btn full v="neutral" onClick={() => setEditZone(null)}>
                Cancelar
              </Btn>
              <Btn
                full
                disabled={!editZone.name?.trim()}
                onClick={() => {
                  onUpdate(editZone.id, editZone);
                  setEditZone(null);
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <InlineIcon icon={Check} size={14} />
                  Guardar
                </span>
              </Btn>
            </div>
          </div>
        </div>
      )}

      {zones.length > 0 && (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 48px 130px 90px 72px 80px",
              padding: "10px 16px",
              background: T.bg,
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            {["Zona", "Color", "Domicilio", "Hora", "Activo", "Acciones"].map(
              (h) => (
                <div
                  key={h}
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: T.light,
                    textTransform: "uppercase",
                    letterSpacing: ".4px",
                  }}
                >
                  {h}
                </div>
              )
            )}
          </div>

          {zones.map((z) => (
            <div
              key={z.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 48px 130px 90px 72px 80px",
                padding: "13px 16px",
                borderBottom: `1px solid ${T.border}`,
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>
                {z.name}
              </div>

              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  background: z.color,
                }}
              />

              <div style={{ fontWeight: 800, fontSize: 13, color: T.text }}>
                {fmtCOP(z.price)}
              </div>

              <div style={{ fontSize: 13, color: T.mid }}>
                {z.minTime}–{z.maxTime} min
              </div>

              <Toggle
                value={z.active}
                onChange={(v) => onUpdate(z.id, { active: v })}
                sm
              />

              <div style={{ display: "flex", gap: 6 }}>
                <IconButton
                  icon={Pencil}
                  title="Editar zona"
                  onClick={() => setEditZone({ ...z })}
                  color={T.coral}
                  bg={T.coralL}
                />
                <IconButton
                  icon={Trash2}
                  title="Eliminar zona"
                  onClick={() =>
                    window.confirm(`¿Eliminar "${z.name}"?`) && onDelete(z.id)
                  }
                  color={T.red}
                  bg={T.redL}
                />
              </div>
            </div>
          ))}

          <div style={{ padding: "9px 16px", fontSize: 11, color: T.light }}>
            En total hay {zones.length} polígono{zones.length !== 1 ? "s" : ""}{" "}
            de domicilio
          </div>
        </div>
      )}

      {zones.length === 0 && !isDrawing && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 20px",
            color: T.mid,
            fontSize: 13,
            border: `2px dashed ${T.border}`,
            borderRadius: 16,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: T.coralL,
              color: T.coral,
              display: "grid",
              placeItems: "center",
              margin: "0 auto 10px",
            }}
          >
            <Map size={20} strokeWidth={2.4} />
          </div>
          Sin zonas. Haz clic en <b>Dibujar zona</b> y traza el área de cobertura
          en el mapa.
        </div>
      )}
    </div>
  );
}

export function QRCard({ card, branchName }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const CardIcon = card.Icon;

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCodeLib.toCanvas(
      canvasRef.current,
      card.url,
      {
        width: 220,
        margin: 2,
        color: {
          dark: card.color,
          light: "#ffffff",
        },
      },
      (err) => {
        if (err) console.error(err);
      }
    );
  }, [card.url, card.color]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `QR-${branchName || "sucursal"}-${card.key}.png`;
    a.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(card.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const printQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = canvas.toDataURL("image/png");
    const w = window.open("", "_blank", "width=500,height=600");
    if (!w) return;

    w.document.write(`<!DOCTYPE html><html><head><title>QR ${card.label} — ${
      branchName || ""
    }</title>
    <style>
      body{font-family:sans-serif;text-align:center;padding:40px;background:#fff}
      img{width:260px;height:260px;display:block;margin:0 auto 16px;border-radius:12px}
      h2{margin:0 0 6px;font-size:22px;color:${card.color}}
      p{margin:0 0 4px;font-size:13px;color:#666}
      small{font-size:11px;color:#aaa;word-break:break-all}
      @media print{button{display:none}}
    </style></head>
    <body>
      <h2>${card.label}</h2>
      <p style="font-size:15px;font-weight:700;color:#111">${branchName || ""}</p>
      <img src="${img}" alt="QR"/>
      <p>${card.desc}</p>
      <small>${card.url}</small><br/><br/>
      <button onclick="window.print()" style="padding:10px 24px;background:${
        card.color
      };color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer">Imprimir / Guardar PDF</button>
    </body></html>`);

    w.document.close();
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 24px rgba(15,23,42,.07)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        border: `2px solid ${card.light}`,
      }}
    >
      <SoftIcon icon={CardIcon} color={card.color} box={42} size={20} />

      <div style={{ fontWeight: 900, fontSize: 15, color: card.color }}>
        {card.label}
      </div>

      <div
        style={{
          fontSize: 11,
          color: T.mid,
          textAlign: "center",
          lineHeight: 1.45,
          minHeight: 32,
        }}
      >
        {card.desc}
      </div>

      <canvas
        ref={canvasRef}
        data-qr={card.key}
        style={{
          borderRadius: 14,
          border: `3px solid ${card.light}`,
        }}
      />

      <div
        style={{
          fontSize: 10,
          color: T.mid,
          wordBreak: "break-all",
          textAlign: "center",
          maxWidth: 220,
          lineHeight: 1.3,
        }}
      >
        {card.url}
      </div>

      <div style={{ display: "flex", gap: 6, width: "100%", flexWrap: "wrap" }}>
        <button
          onClick={download}
          style={{
            flex: 1,
            minWidth: 90,
            padding: "9px 0",
            background: card.color,
            color: "#fff",
            border: "none",
            borderRadius: 11,
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <InlineIcon icon={Download} size={14} />
          PNG
        </button>

        <button
          onClick={printQR}
          style={{
            flex: 1,
            minWidth: 90,
            padding: "9px 0",
            background: card.light,
            color: card.color,
            border: `1.5px solid ${card.color}`,
            borderRadius: 11,
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <InlineIcon icon={Printer} size={14} />
          PDF
        </button>
      </div>

      <button
        onClick={copyLink}
        style={{
          width: "100%",
          padding: "8px 0",
          background: copied ? "#d1fae5" : "#f3f4f6",
          color: copied ? "#059669" : T.mid,
          border: "none",
          borderRadius: 11,
          fontWeight: 800,
          fontSize: 12,
          cursor: "pointer",
          transition: "all .2s",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <InlineIcon icon={copied ? CheckCircle2 : Copy} size={14} />
        {copied ? "¡Link copiado!" : "Copiar link"}
      </button>
    </div>
  );
}

export function BranchQR({ br, ownerId }) {
  const origin = window.location.origin;
  const base = `${origin}${window.location.pathname}?menu&r=${ownerId}&b=${br?.id}`;

  const CARDS = [
    {
      key: "mesa",
      label: "Mesa / Restaurante",
      Icon: ClipboardList,
      color: "#4f46e5",
      light: "#ede9fe",
      url: `${base}&mode=menu`,
      desc: "El cliente escanea y ve la carta para comer en el restaurante",
    },
    {
      key: "domicilio",
      label: "Domicilio",
      Icon: Bike,
      color: "#059669",
      light: "#d1fae5",
      url: `${base}&mode=domicilio`,
      desc: "El cliente escanea y hace su pedido a domicilio",
    },
    {
      key: "publicidad",
      label: "Publicidad / General",
      Icon: Megaphone,
      color: "#d97706",
      light: "#fef3c7",
      url: base,
      desc: "QR general, el cliente elige el modo al ingresar",
    },
  ];

  const printAll = () => {
    const items = CARDS.map((c) => {
      const canvas = document.querySelector(`canvas[data-qr="${c.key}"]`);
      return canvas ? { ...c, img: canvas.toDataURL("image/png") } : null;
    }).filter(Boolean);

    if (!items.length) {
      alert("Los QR aún no terminaron de generarse. Espera un momento.");
      return;
    }

    const w = window.open("", "_blank", "width=700,height=800");
    if (!w) return;

    w.document.write(`<!DOCTYPE html><html><head><title>QR Sucursal — ${
      br?.name || ""
    }</title>
    <style>
      body{font-family:sans-serif;padding:30px;background:#fff}
      h1{text-align:center;font-size:22px;margin-bottom:4px}
      .sub{text-align:center;font-size:13px;color:#888;margin-bottom:24px}
      .grid{display:flex;flex-wrap:wrap;gap:24px;justify-content:center}
      .card{width:200px;text-align:center;padding:16px;border-radius:12px;border:2px solid #eee}
      .card img{width:180px;height:180px;border-radius:8px}
      .card h3{font-size:14px;margin:8px 0 4px}
      .card p{font-size:11px;color:#666;margin:0 0 4px}
      .card small{font-size:9px;color:#aaa;word-break:break-all}
      @media print{button{display:none!important}}
    </style></head>
    <body>
      <h1>Códigos QR</h1>
      <div class="sub">${br?.name || ""} ${br?.city ? `· ${br.city}` : ""}</div>
      <div class="grid">
        ${items
          .map(
            (c) =>
              `<div class="card" style="border-color:${c.light}">
                <img src="${c.img}" alt="${c.label}"/>
                <h3 style="color:${c.color}">${c.label}</h3>
                <p>${c.desc}</p>
                <small>${c.url}</small>
              </div>`
          )
          .join("")}
      </div><br/>
      <div style="text-align:center">
        <button onclick="window.print()" style="padding:12px 32px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer">Imprimir / Guardar PDF</button>
      </div>
    </body></html>`);

    w.document.close();
  };

  return (
    <div style={{ padding: "4px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 900,
          fontSize: 14,
          color: T.text,
          marginBottom: 5,
        }}
      >
        <InlineIcon icon={QrCode} size={16} color={T.coral} />
        Códigos QR de esta sucursal
      </div>

      <div style={{ fontSize: 12, color: T.mid, marginBottom: 16 }}>
        Escanea con cualquier celular para abrir el menú directamente. Descarga o
        imprime cada QR.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 16,
        }}
      >
        {CARDS.map((c) => (
          <QRCard key={c.key} card={c} branchName={br?.name} />
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={printAll}
          style={{
            width: "100%",
            padding: "13px 0",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 13,
            fontWeight: 900,
            fontSize: 14,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <InlineIcon icon={Printer} size={16} />
          Imprimir / PDF con los 3 QR juntos
        </button>
      </div>
    </div>
  );
}

export function SecSucursales({
  branches,
  onUpdateBranch,
  onAddBranch,
  ownerId,
}) {
  const [selected, setSelected] = useState(null);
  const [subTab, setSubTab] = useState("overview");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    manager: "",
  });
  const [infoForm, setInfoForm] = useState(null);
  const [infoSaved, setInfoSaved] = useState(false);

  const SERVICES_DEFS = [
    {
      id: "menuDigital",
      Icon: ClipboardList,
      label: "Menú Digital",
      desc: "Menú QR para tus mesas",
      color: T.coral,
    },
    {
      id: "domicilios",
      Icon: Bike,
      label: "Domicilios",
      desc: "Pedidos a domicilio con zonas",
      color: T.blue,
    },
    {
      id: "pickup",
      Icon: Store,
      label: "Pickup / Llevar",
      desc: "Pedidos para recoger",
      color: T.pink,
    },
  ];

  const SUBTABS = [
    { key: "overview", label: "Resumen", Icon: ClipboardList },
    { key: "servicios", label: "Servicios", Icon: Settings },
    { key: "domicilios", label: "Zonas", Icon: Map },
    { key: "horarios", label: "Horarios", Icon: Clock },
    { key: "qr", label: "QR", Icon: QrCode },
  ];

  const DAYS_ES = {
    mon: "Lunes",
    tue: "Martes",
    wed: "Miércoles",
    thu: "Jueves",
    fri: "Viernes",
    sat: "Sábado",
    sun: "Domingo",
  };

  const br = selected
    ? branches.find((b) => b.id === selected.id) || selected
    : null;

  const upd = (id, patch) => {
    onUpdateBranch(id, patch);
    setSelected((p) => (p && p.id === id ? { ...p, ...patch } : p));
  };

  const selectBranch = (b) => {
    setSelected(b);
    setSubTab("overview");
    setInfoForm({
      name: b.name,
      address: b.address || "",
      city: b.city || "",
      phone: b.phone || "",
      whatsapp: b.whatsapp || "",
      manager: b.manager || "",
      mapLink: b.mapLink || "",
    });
    setInfoSaved(false);
  };

  const updZone = (zoneId, patch) => {
    if (!br) return;
    const nz = br.deliveryZones.map((z) =>
      z.id === zoneId ? { ...z, ...patch } : z
    );
    upd(br.id, { deliveryZones: nz });
  };

  const addZone = (zone) => {
    if (!br) return;
    const nz = [...br.deliveryZones, zone];
    upd(br.id, { deliveryZones: nz });
  };

  const delZone = (zoneId) => {
    if (!br) return;
    const nz = br.deliveryZones.filter((z) => z.id !== zoneId);
    upd(br.id, { deliveryZones: nz });
  };

  const togSvc = (k) => {
    if (!br) return;
    upd(br.id, {
      services: {
        ...br.services,
        [k]: !br.services[k],
      },
    });
  };

  const SUC_CSS = `
    @media(min-width:769px){
      .suc-grid{display:grid!important;grid-template-columns:280px 1fr;gap:16px}
      .suc-list{display:block!important}
      .suc-detail{display:block!important}
    }
    @media(max-width:768px){
      .suc-grid{display:block!important}
      .suc-detail-mobile-hidden{display:none!important}
      .suc-list-mobile-hidden{display:none!important}
    }
  `;

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      <style>{SUC_CSS}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          gap: 14,
        }}
      >
        <div>
          {selected && (
            <button
              onClick={() => {
                setSelected(null);
                setInfoForm(null);
              }}
              className="suc-list-mobile-hidden"
              style={{
                background: "none",
                border: "none",
                color: T.coral,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                padding: "0 0 8px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <InlineIcon icon={ArrowLeft} size={14} />
              Todas las sucursales
            </button>
          )}

          <h2
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 24,
              fontWeight: 900,
              color: T.text,
              letterSpacing: "-.35px",
            }}
          >
            <InlineIcon icon={Building2} size={23} color={T.coral} />
            {selected ? selected.name : "Sucursales"}
          </h2>

          <p
            style={{
              color: T.mid,
              fontSize: 13,
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {selected ? (
              <>
                <InlineIcon icon={MapPin} size={14} />
                {selected.city}
              </>
            ) : (
              <>
                {branches.length} sucursal{branches.length !== 1 ? "es" : ""} ·{" "}
                {branches.filter((b) => b.status).length} activa
                {branches.filter((b) => b.status).length !== 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>

        {selected && (
          <Btn
            v="neutral"
            sm
            onClick={() => {
              setSelected(null);
              setInfoForm(null);
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <InlineIcon icon={ArrowLeft} size={14} />
              Volver
            </span>
          </Btn>
        )}
      </div>

      <div
        className="suc-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 16,
        }}
      >
        <div className={selected ? "suc-list-mobile-hidden" : ""}>
          {branches.map((b) => (
            <div
              key={b.id}
              onClick={() => selectBranch(b)}
              className="hov"
              style={{
                background: T.white,
                borderRadius: 16,
                border: `2px solid ${
                  selected?.id === b.id ? T.coral : T.border
                }`,
                padding: "15px 16px",
                marginBottom: 10,
                cursor: "pointer",
                transition: "all .15s",
                boxShadow:
                  selected?.id === b.id
                    ? `0 10px 24px ${T.coral}18`
                    : "0 6px 18px rgba(15,23,42,.035)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 7,
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 13,
                      color: T.coral,
                      marginBottom: 3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      color: T.mid,
                    }}
                  >
                    <InlineIcon icon={MapPin} size={12} />
                    {b.city}
                  </div>
                </div>

                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: b.status ? T.green : T.red,
                    marginTop: 4,
                    flexShrink: 0,
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: T.light,
                  marginBottom: 9,
                  lineHeight: 1.35,
                }}
              >
                {b.address}
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Object.entries(b.services || {})
                  .filter(([, v]) => v)
                  .map(([k]) => {
                    const s = SERVICES_DEFS.find((x) => x.id === k);
                    return s ? (
                      <div
                        key={k}
                        title={s.label}
                        style={{
                          width: 25,
                          height: 25,
                          borderRadius: 9,
                          background: `${s.color}15`,
                          color: s.color,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <s.Icon size={13} strokeWidth={2.4} />
                      </div>
                    ) : null;
                  })}
              </div>

              <div style={{ fontSize: 9, color: T.light, marginTop: 7 }}>
                ID: {b.id}
              </div>
            </div>
          ))}
        </div>

        {br && (
          <div className={!selected ? "suc-detail-mobile-hidden" : ""}>
            <Card style={{ marginBottom: 14, padding: "16px 18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 18,
                      color: T.text,
                      marginBottom: 5,
                      letterSpacing: "-.2px",
                    }}
                  >
                    {br.name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: T.mid,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <InlineIcon icon={MapPin} size={13} />
                      {br.address}
                    </span>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <InlineIcon icon={User} size={13} />
                      {br.manager}
                    </span>
                  </div>
                </div>

                <Toggle
                  value={br.status}
                  onChange={(v) => upd(br.id, { status: v })}
                  label={br.status ? "Activa" : "Inactiva"}
                />
              </div>

              <div
                style={{
                  background: T.bg,
                  borderRadius: 12,
                  padding: "10px 12px",
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {SERVICES_DEFS.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "6px 11px",
                      borderRadius: 22,
                      background: br.services?.[s.id] ? T.white : T.bg,
                      border: `1px solid ${
                        br.services?.[s.id] ? s.color + "44" : T.border
                      }`,
                    }}
                  >
                    <InlineIcon
                      icon={s.Icon}
                      size={13}
                      color={br.services?.[s.id] ? s.color : T.light}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: br.services?.[s.id] ? s.color : T.light,
                      }}
                    >
                      {s.label.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <div
              style={{
                display: "flex",
                gap: 7,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              {SUBTABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setSubTab(key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 14px",
                    borderRadius: 22,
                    border: `1.5px solid ${
                      subTab === key ? T.coral : T.border
                    }`,
                    background: subTab === key ? T.coralL : T.white,
                    color: subTab === key ? T.coral : T.mid,
                    fontSize: 12,
                    fontWeight: subTab === key ? 800 : 600,
                    cursor: "pointer",
                  }}
                >
                  <InlineIcon icon={Icon} size={14} />
                  {label}
                </button>
              ))}
            </div>

            {subTab === "overview" && infoForm && (
              <Card>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 900,
                    color: T.text,
                    marginBottom: 16,
                  }}
                >
                  <InlineIcon icon={ClipboardList} size={16} color={T.coral} />
                  Información de la sucursal
                </div>

                <Field
                  label="Nombre de la sucursal"
                  value={infoForm.name}
                  onChange={(v) => setInfoForm((p) => ({ ...p, name: v }))}
                  placeholder="Ej: La Leña — El Peñón"
                  required
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <Field
                    label="Dirección"
                    value={infoForm.address}
                    onChange={(v) =>
                      setInfoForm((p) => ({ ...p, address: v }))
                    }
                    placeholder="Cra 5 #15-32, El Peñón"
                  />
                  <Field
                    label="Ciudad"
                    value={infoForm.city}
                    onChange={(v) => setInfoForm((p) => ({ ...p, city: v }))}
                    placeholder="Cali"
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <Field
                    label="Teléfono"
                    value={infoForm.phone}
                    onChange={(v) => setInfoForm((p) => ({ ...p, phone: v }))}
                    placeholder="+57 300 123 4567"
                  />
                  <Field
                    label="WhatsApp"
                    value={infoForm.whatsapp}
                    onChange={(v) =>
                      setInfoForm((p) => ({ ...p, whatsapp: v }))
                    }
                    placeholder="573001234567"
                    hint="Solo números, con código de país"
                  />
                </div>

                <Field
                  label="Encargado / Manager"
                  value={infoForm.manager}
                  onChange={(v) =>
                    setInfoForm((p) => ({ ...p, manager: v }))
                  }
                  placeholder="Carlos Mejía"
                />

                <Field
                  label="Link de ubicación"
                  value={infoForm.mapLink}
                  onChange={(v) =>
                    setInfoForm((p) => ({ ...p, mapLink: v }))
                  }
                  placeholder="https://maps.app.goo.gl/…"
                  hint="Copia el link corto desde Google Maps → Compartir"
                />

                {infoForm.mapLink && (
                  <a
                    href={infoForm.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: T.coral,
                      fontWeight: 800,
                      marginBottom: 14,
                      textDecoration: "none",
                    }}
                  >
                    <InlineIcon icon={ExternalLink} size={14} />
                    Ver en mapa
                  </a>
                )}

                <Btn
                  full
                  onClick={() => {
                    upd(br.id, infoForm);
                    setInfoSaved(true);
                    setTimeout(() => setInfoSaved(false), 2500);
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <InlineIcon icon={infoSaved ? CheckCircle2 : Check} size={15} />
                    {infoSaved ? "¡Guardado!" : "Guardar cambios"}
                  </span>
                </Btn>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  {[
                    {
                      Icon: Map,
                      label: "Zonas domicilio",
                      value: `${br.deliveryZones?.length || 0} configuradas`,
                    },
                    {
                      Icon: Settings,
                      label: "Servicios activos",
                      value: `${
                        Object.values(br.services || {}).filter(Boolean).length
                      }/${SERVICES_DEFS.length}`,
                    },
                  ].map(({ Icon, label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: T.bg,
                        borderRadius: 12,
                        padding: "11px 12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 10,
                          fontWeight: 800,
                          color: T.light,
                          marginBottom: 4,
                        }}
                      >
                        <InlineIcon icon={Icon} size={12} />
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.text,
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {Object.values(br.services || {}).some((v) => !v) && (
                  <div
                    style={{
                      marginTop: 14,
                      border: `1.5px solid ${T.amber}44`,
                      borderRadius: 14,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        color: T.amber,
                        fontSize: 13,
                        marginBottom: 8,
                      }}
                    >
                      Servicios disponibles para activar
                    </div>

                    {SERVICES_DEFS.filter((s) => !br.services?.[s.id]).map(
                      (s) => (
                        <div
                          key={s.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 12,
                            color: T.mid,
                            marginBottom: 6,
                          }}
                        >
                          <InlineIcon icon={s.Icon} size={14} color={s.color} />
                          <span>{s.label}</span>
                          <button
                            onClick={() => setSubTab("servicios")}
                            style={{
                              marginLeft: "auto",
                              fontSize: 10,
                              color: T.coral,
                              background: "none",
                              border: `1px solid ${T.coral}`,
                              borderRadius: 20,
                              padding: "3px 9px",
                              cursor: "pointer",
                              fontWeight: 800,
                            }}
                          >
                            Activar
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </Card>
            )}

            {subTab === "servicios" && (
              <Card>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 900,
                    color: T.text,
                    marginBottom: 16,
                  }}
                >
                  <InlineIcon icon={Settings} size={16} color={T.coral} />
                  Activar / desactivar servicios
                </div>

                {SERVICES_DEFS.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "15px 0",
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <SoftIcon icon={s.Icon} color={s.color} box={46} size={21} />

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: T.text,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: T.mid,
                          marginTop: 2,
                        }}
                      >
                        {s.desc}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: br.services?.[s.id] ? T.green : T.light,
                        }}
                      >
                        {br.services?.[s.id] ? "Activo" : "Inactivo"}
                      </span>
                      <Toggle
                        value={br.services?.[s.id] || false}
                        onChange={() => togSvc(s.id)}
                        sm
                      />
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {subTab === "domicilios" && (
              <div>
                {!br.services?.domicilios && (
                  <div
                    style={{
                      background: T.amberL,
                      border: `1px solid ${T.amber}44`,
                      borderRadius: 14,
                      padding: "12px 16px",
                      marginBottom: 14,
                      fontSize: 13,
                      color: T.amber,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <InlineIcon icon={AlertTriangle} size={16} />
                    Activa "Domicilios" en Servicios para configurar zonas.
                  </div>
                )}

                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 900,
                      color: T.text,
                      marginBottom: 4,
                    }}
                  >
                    <InlineIcon icon={Map} size={16} color={T.coral} />
                    Zonas de entrega con precios personalizados
                  </div>

                  <div style={{ fontSize: 12, color: T.mid }}>
                    Dibuja polígonos haciendo click en el mapa. Cada zona puede
                    tener precio y tiempo de entrega diferente.
                  </div>
                </div>

                <PolygonMap
                  zones={br.deliveryZones || []}
                  onUpdate={updZone}
                  onAdd={addZone}
                  onDelete={delZone}
                  branchAddress={br.address}
                  branchCity={br.city}
                />
              </div>
            )}

            {subTab === "horarios" && (
              <Card>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 900,
                    color: T.text,
                    marginBottom: 16,
                  }}
                >
                  <InlineIcon icon={Clock} size={16} color={T.coral} />
                  Horarios de atención
                </div>

                {Object.entries(br.schedule || {}).map(([day, cfg]) => (
                  <div
                    key={day}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <div
                      style={{
                        width: 76,
                        fontSize: 13,
                        fontWeight: 700,
                        color: T.text,
                      }}
                    >
                      {DAYS_ES[day]}
                    </div>

                    <Toggle
                      value={cfg.active}
                      onChange={(v) => {
                        const ns = {
                          ...br.schedule,
                          [day]: { ...cfg, active: v },
                        };
                        upd(br.id, { schedule: ns });
                      }}
                      sm
                    />

                    {cfg.active ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="time"
                          value={cfg.open}
                          onChange={(e) => {
                            const ns = {
                              ...br.schedule,
                              [day]: { ...cfg, open: e.target.value },
                            };
                            upd(br.id, { schedule: ns });
                          }}
                          style={{
                            padding: "6px 8px",
                            border: `1px solid ${T.border}`,
                            borderRadius: 9,
                            fontSize: 12,
                            color: T.text,
                            background: T.bg,
                          }}
                        />

                        <span style={{ color: T.mid, fontSize: 12 }}>a</span>

                        <input
                          type="time"
                          value={cfg.close}
                          onChange={(e) => {
                            const ns = {
                              ...br.schedule,
                              [day]: { ...cfg, close: e.target.value },
                            };
                            upd(br.id, { schedule: ns });
                          }}
                          style={{
                            padding: "6px 8px",
                            border: `1px solid ${T.border}`,
                            borderRadius: 9,
                            fontSize: 12,
                            color: T.text,
                            background: T.bg,
                          }}
                        />
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: T.light,
                          fontStyle: "italic",
                        }}
                      >
                        Cerrado
                      </span>
                    )}
                  </div>
                ))}
              </Card>
            )}

            {subTab === "qr" && <BranchQR br={br} ownerId={ownerId} />}
          </div>
        )}
      </div>
    </div>
  );
}



/* ─── ADMIN: PRODUCTOS ────────────────────────────────────── */
