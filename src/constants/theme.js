export const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#f8f9fc;-webkit-font-smoothing:antialiased;color:#111827}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#e2e5ef;border-radius:4px}
  ::-webkit-scrollbar-thumb:hover{background:#c9cdd8}
  scrollbar-width:thin;scrollbar-color:#e2e5ef transparent
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes dotB{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  input:focus,textarea:focus,select:focus{outline:none!important}
  button{cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif}
  .hov{transition:transform .18s,box-shadow .18s}
  .hov:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.10)!important}
  img{display:block;max-width:100%}
  .admin-sidebar{transition:transform .25s ease}
  @media(max-width:768px){
    .admin-sidebar{position:fixed!important;left:0;top:0;height:100vh;z-index:99;transform:translateX(-100%)}
    .admin-sidebar.open{transform:translateX(0)}
    .mob-overlay{display:block!important}
    .mob-close-btn{display:flex!important}
  }
`;

/* ─── TOKENS ──────────────────────────────────────────────── */

export const T = {
  bg:"#f8f9fc", white:"#fff", border:"#e8ebf4", sidebar:"#0a1628",
  text:"#111827", mid:"#6b7280", light:"#9ca3af",
  coral:"#ff4d4c", coralL:"#fff7ed", coralD:"#ff4d4c",
  navy:"#0a1628", navyL:"#eef1f8",
  violet:"#6d28d9", violetL:"#ede9fe", violetD:"#4c1d95",
  indigo:"#4338ca", indigoL:"#e0e7ff",
  green:"#059669", greenL:"#d1fae5",
  amber:"#d97706", amberL:"#fef3c7",
  red:"#dc2626", redL:"#fee2e2",
  blue:"#2563eb", blueL:"#dbeafe",
  pink:"#db2777", pinkL:"#fce7f3",
  sh:"0 1px 3px rgba(0,0,0,.04),0 2px 12px rgba(0,0,0,.05)",
  shMd:"0 4px 24px rgba(0,0,0,.08)",
};

export const CM = {
  bg:"#111009", surface:"#1c1812", card:"#231e18",
  border:"rgba(255,255,255,0.07)", text:"#f5f0e6",
  mid:"rgba(255,255,255,0.52)", green:"#22c55e",
};

/* ─── USUARIOS ────────────────────────────────────────────── */
