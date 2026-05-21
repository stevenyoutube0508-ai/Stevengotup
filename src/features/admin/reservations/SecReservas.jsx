import { useState } from "react";
import { T } from "../../../constants/theme";
import { todayStr, newId } from "../../../utils/format";
import { Card, Btn, Field, StatCard, Modal } from "../../../shared/components";

const STATUS_CFG = {
  pendiente:  { label: "Pendiente",  color: T.amber },
  confirmada: { label: "Confirmada", color: T.green },
  sentada:    { label: "En mesa",    color: T.blue  },
  completada: { label: "Completada", color: T.mid   },
  cancelada:  { label: "Cancelada",  color: T.red   },
};
const NEXT_STATUS = { pendiente: "confirmada", confirmada: "sentada", sentada: "completada" };
const TIMES = ["12:00","12:30","13:00","13:30","14:00","14:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00"];
const AREAS = ["Interior", "Terraza", "Privado", "Barra"];
const EMPTY_FORM = { name:"", phone:"", email:"", date: todayStr(), time:"19:00", guests:2, area:"Interior", notes:"", status:"pendiente" };

export function SecReservas({ reservations = [], onAdd, onMove, onCancel, showToast }) {
  const [modal, setModal]   = useState(false);
  const [form,  setForm]    = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const today     = todayStr();
  const todayList = reservations.filter(r => r.date === today);

  const openNew = (preset = {}) => {
    setForm({ ...EMPTY_FORM, ...preset });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    const r = { ...form, id: newId(), createdAt: new Date().toISOString() };
    await onAdd?.(r);
    setSaving(false);
    setModal(false);
  };

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:T.text }}>Reservas</h2>
          <p style={{ color:T.mid, fontSize:13, marginTop:2 }}>
            Hoy: {todayList.length} · Total: {reservations.length}
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn v="light" sm onClick={() => openNew({ status:"sentada", notes:"Walk-in" })}>🚶 Walk-in</Btn>
          <Btn icon="+" onClick={() => openNew()}>Nueva reserva</Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          ["📅","Hoy",          todayList.length,                                        T.coral],
          ["✅","Confirmadas",  reservations.filter(r => r.status==="confirmada").length, T.green],
          ["🪑","En mesa",      reservations.filter(r => r.status==="sentada").length,    T.blue ],
          ["⏳","Pendientes",   reservations.filter(r => r.status==="pendiente").length,  T.amber],
        ].map(([ic,l,v,c]) => <StatCard key={l} icon={ic} label={l} value={v} color={c}/>)}
      </div>

      {/* List */}
      {reservations.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:T.mid }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🗓️</div>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Sin reservas todavía</div>
          <div style={{ fontSize:12 }}>Crea la primera con el botón superior</div>
        </div>
      )}

      {reservations.map(r => {
        const st = STATUS_CFG[r.status] || STATUS_CFG.pendiente;
        const next = NEXT_STATUS[r.status];
        return (
          <Card key={r.id} style={{ padding:"14px 16px", marginBottom:8, borderLeft:`3px solid ${st.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:T.text }}>{r.name}</div>
                <div style={{ fontSize:11, color:T.mid }}>
                  📞 {r.phone} · 👥 {r.guests} pers. · 🕐 {r.time} · 📍 {r.area}
                  {r.date !== today && <> · 📅 {r.date}</>}
                </div>
              </div>
              <span style={{ fontSize:10, fontWeight:700, background:st.color+"18", color:st.color, borderRadius:20, padding:"3px 9px" }}>
                {st.label}
              </span>
            </div>
            {r.notes && <div style={{ fontSize:11, color:T.coral, fontStyle:"italic", marginBottom:7 }}>📝 {r.notes}</div>}
            <div style={{ display:"flex", gap:8 }}>
              {next && (
                <Btn sm v="light" onClick={() => onMove?.(r.id, next)}>
                  ✓ {STATUS_CFG[next]?.label}
                </Btn>
              )}
              {r.status !== "cancelada" && r.status !== "completada" && (
                <Btn sm v="danger" onClick={() => onCancel?.(r.id)}>Cancelar</Btn>
              )}
            </div>
          </Card>
        );
      })}

      {/* Modal nueva reserva */}
      {modal && (
        <Modal title="Nueva reserva" icon="🗓️" onClose={() => setModal(false)} wide>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Nombre *"   value={form.name}  onChange={v => setForm(p=>({...p,name:v}))}  required/>
            <Field label="Teléfono *" value={form.phone} onChange={v => setForm(p=>({...p,phone:v}))} required/>
            <Field label="Email"      value={form.email} onChange={v => setForm(p=>({...p,email:v}))} type="email"/>

            {/* Personas */}
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:T.mid, display:"block", marginBottom:6 }}>Personas</label>
              <div style={{ display:"flex", gap:4 }}>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <button key={n} onClick={() => setForm(p=>({...p,guests:n}))}
                    style={{ flex:1, padding:"8px 4px", borderRadius:8,
                      border:`1.5px solid ${form.guests===n?T.coral:T.border}`,
                      background:form.guests===n?T.coralL:"transparent",
                      color:form.guests===n?T.coral:T.mid,
                      fontWeight:form.guests===n?800:500, fontSize:11, cursor:"pointer" }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Fecha *" value={form.date} onChange={v => setForm(p=>({...p,date:v}))} type="date" required/>

            {/* Hora */}
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:T.mid, display:"block", marginBottom:6 }}>Hora *</label>
              <select value={form.time} onChange={e => setForm(p=>({...p,time:e.target.value}))}
                style={{ width:"100%", padding:"10px 13px", background:T.bg, border:`1.5px solid ${T.border}`,
                  borderRadius:10, color:T.text, fontSize:13, outline:"none" }}>
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Área */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, fontWeight:700, color:T.mid, display:"block", marginBottom:6 }}>Área</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {AREAS.map(a => (
                <button key={a} onClick={() => setForm(p=>({...p,area:a}))}
                  style={{ padding:"6px 14px", borderRadius:20,
                    border:`1.5px solid ${form.area===a?T.coral:T.border}`,
                    background:form.area===a?T.coralL:"transparent",
                    color:form.area===a?T.coral:T.mid,
                    fontSize:11, fontWeight:form.area===a?700:500, cursor:"pointer" }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Field label="Notas" value={form.notes} onChange={v => setForm(p=>({...p,notes:v}))}
            textarea rows={2} placeholder="Alergias, ocasión especial…"/>

          <div style={{ display:"flex", gap:10 }}>
            <Btn full v="neutral" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn full disabled={!form.name || !form.phone || saving} onClick={handleSave}>
              {saving ? "Guardando…" : "Guardar reserva"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
