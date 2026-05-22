import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { T, STYLES } from "../../constants/theme";
import { LogoIcon } from "../../shared/components/Logo";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pw,        setPw]        = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);
  const [ready,     setReady]     = useState(false);

  useEffect(() => {
    // Supabase detecta el token de recovery del hash de la URL y emite
    // el evento PASSWORD_RECOVERY. En ese momento el usuario tiene sesión
    // temporal y podemos llamar updateUser({ password }).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Si ya hay sesión (usuario llegó directo), también habilitamos el form.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async () => {
    if (pw.length < 8)    { setError("Mínimo 8 caracteres"); return; }
    if (pw !== confirm)   { setError("Las contraseñas no coinciden"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => navigate("/login", { replace: true }), 2500);
  };

  const inputBase = {
    width: "100%", boxSizing: "border-box",
    padding: "13px 14px 13px 42px",
    background: T.bg, border: `1.5px solid ${T.border}`,
    borderRadius: 14, color: T.text, fontSize: 14,
    fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none",
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background: T.bg, padding: 20 }}>
      <style>{STYLES}</style>

      <div style={{ width:"100%", maxWidth:420, animation:"fadeUp .4s ease" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:8,
            filter:`drop-shadow(0 10px 28px ${T.coral}35)` }}>
            <LogoIcon size={60}/>
          </div>
          <h2 style={{ fontSize:24, fontWeight:950, color:T.text, margin:0,
            letterSpacing:"-.45px" }}>Nueva contraseña</h2>
          <p style={{ color:T.mid, fontSize:13, marginTop:6, lineHeight:1.55 }}>
            Elige una contraseña segura de mínimo 8 caracteres.
          </p>
        </div>

        <div style={{ background:"#fff", borderRadius:24, padding:28,
          boxShadow:"0 20px 60px rgba(15,23,42,.10)", border:`1px solid ${T.border}` }}>

          {done ? (
            <div style={{ textAlign:"center", padding:"12px 0" }}>
              <CheckCircle2 size={48} color={T.green} style={{ marginBottom:12 }}/>
              <div style={{ fontSize:17, fontWeight:800, color:T.text, marginBottom:6 }}>
                ¡Contraseña actualizada!
              </div>
              <div style={{ fontSize:13, color:T.mid }}>
                Redirigiendo al login…
              </div>
            </div>
          ) : !ready ? (
            <div style={{ textAlign:"center", padding:"20px 0", color:T.mid, fontSize:13 }}>
              Verificando enlace de recuperación…
            </div>
          ) : (
            <>
              {/* Nueva contraseña */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:900, color:T.mid,
                  display:"block", marginBottom:7, letterSpacing:".5px",
                  textTransform:"uppercase" }}>Nueva contraseña</label>
                <div style={{ position:"relative" }}>
                  <Lock size={16} style={{ position:"absolute", left:14,
                    top:"50%", transform:"translateY(-50%)", color:T.light,
                    pointerEvents:"none" }}/>
                  <input type={showPw ? "text" : "password"} value={pw}
                    onChange={e => { setPw(e.target.value); setError(""); }}
                    placeholder="Mínimo 8 caracteres"
                    style={{ ...inputBase, paddingRight:44 }}
                    onFocus={e => { e.target.style.borderColor=T.coral; e.target.style.boxShadow=`0 0 0 4px ${T.coral}14`; }}
                    onBlur={e  => { e.target.style.borderColor=T.border; e.target.style.boxShadow="none"; }}/>
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position:"absolute", right:10, top:"50%",
                      transform:"translateY(-50%)", width:32, height:32,
                      borderRadius:10, border:"none", background:"transparent",
                      color:T.mid, cursor:"pointer", display:"grid", placeItems:"center" }}>
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* Confirmar */}
              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:11, fontWeight:900, color:T.mid,
                  display:"block", marginBottom:7, letterSpacing:".5px",
                  textTransform:"uppercase" }}>Confirmar contraseña</label>
                <div style={{ position:"relative" }}>
                  <Lock size={16} style={{ position:"absolute", left:14,
                    top:"50%", transform:"translateY(-50%)", color:T.light,
                    pointerEvents:"none" }}/>
                  <input type="password" value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(""); }}
                    placeholder="Repite la contraseña"
                    onKeyDown={e => e.key === "Enter" && submit()}
                    style={inputBase}
                    onFocus={e => { e.target.style.borderColor=T.coral; e.target.style.boxShadow=`0 0 0 4px ${T.coral}14`; }}
                    onBlur={e  => { e.target.style.borderColor=T.border; e.target.style.boxShadow="none"; }}/>
                </div>
              </div>

              {error && (
                <div style={{ background:T.redL, border:`1px solid ${T.red}30`,
                  borderRadius:12, padding:"10px 13px", fontSize:13, color:T.red,
                  marginBottom:14, display:"flex", alignItems:"center", gap:8,
                  fontWeight:700 }}>
                  <AlertTriangle size={15}/> {error}
                </div>
              )}

              <button type="button" onClick={submit} disabled={loading}
                style={{ width:"100%", padding:14,
                  background:`linear-gradient(135deg,${T.coral},${T.pink})`,
                  border:"none", borderRadius:14, color:"#fff", fontSize:15,
                  fontWeight:900, cursor:loading?"not-allowed":"pointer",
                  fontFamily:"'Plus Jakarta Sans',sans-serif",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:`0 12px 28px ${T.coral}38`,
                  opacity:loading ? 0.72 : 1 }}>
                {loading ? (
                  <div style={{ width:18, height:18, borderRadius:"50%",
                    border:"2.5px solid rgba(255,255,255,.4)", borderTopColor:"#fff",
                    animation:"spin .7s linear infinite" }}/>
                ) : <Lock size={16}/>}
                {loading ? "Guardando…" : "Guardar nueva contraseña"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
