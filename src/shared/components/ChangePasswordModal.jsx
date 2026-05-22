import { useState } from "react";
import { KeyRound, Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { T } from "../../constants/theme";
import { Modal, Btn, Field } from "./index";

export function ChangePasswordModal({ onClose }) {
  const [newPw,    setNewPw]    = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  const submit = async () => {
    setError("");
    if (newPw.length < 8)  { setError("Mínimo 8 caracteres"); return; }
    if (newPw !== confirm)  { setError("Las contraseñas no coinciden"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPw });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => onClose(true), 1800);
  };

  return (
    <Modal title="Cambiar contraseña" icon={<KeyRound size={16}/>} onClose={() => onClose(false)}>
      {done ? (
        <div style={{ textAlign:"center", padding:"16px 0" }}>
          <CheckCircle2 size={44} color={T.green} style={{ marginBottom:10 }}/>
          <div style={{ fontSize:15, fontWeight:800, color:T.text, marginBottom:4 }}>
            ¡Contraseña actualizada!
          </div>
          <div style={{ fontSize:12, color:T.mid }}>Cerrando…</div>
        </div>
      ) : (
        <>
          {/* Nueva contraseña */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:700, color:T.mid,
              display:"block", marginBottom:6, textTransform:"uppercase",
              letterSpacing:".4px" }}>Nueva contraseña</label>
            <div style={{ position:"relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setError(""); }}
                placeholder="Mínimo 8 caracteres"
                style={{ width:"100%", boxSizing:"border-box",
                  padding:"11px 42px 11px 14px",
                  background:T.bg, border:`1.5px solid ${T.border}`,
                  borderRadius:10, color:T.text, fontSize:13,
                  fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none" }}
                onFocus={e => { e.target.style.borderColor=T.coral; e.target.style.boxShadow=`0 0 0 3px ${T.coral}14`; }}
                onBlur={e  => { e.target.style.borderColor=T.border; e.target.style.boxShadow="none"; }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position:"absolute", right:8, top:"50%",
                  transform:"translateY(-50%)", background:"none", border:"none",
                  color:T.mid, cursor:"pointer", display:"grid", placeItems:"center",
                  width:28, height:28, borderRadius:8 }}>
                {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>

          {/* Confirmar */}
          <Field
            label="Confirmar contraseña"
            value={confirm}
            onChange={v => { setConfirm(v); setError(""); }}
            type="password"
            placeholder="Repite la contraseña"
          />

          {error && (
            <div style={{ background:T.redL, border:`1px solid ${T.red}30`,
              borderRadius:10, padding:"9px 12px", fontSize:12, color:T.red,
              fontWeight:700, display:"flex", alignItems:"center", gap:7,
              marginBottom:4 }}>
              <AlertTriangle size={13}/> {error}
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <Btn v="ghost" onClick={() => onClose(false)}>Cancelar</Btn>
            <Btn full disabled={loading || !newPw || !confirm} onClick={submit}>
              {loading ? "Guardando…" : "Guardar contraseña"}
            </Btn>
          </div>
        </>
      )}
    </Modal>
  );
}
