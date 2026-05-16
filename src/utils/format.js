export const fmtCOP = n => "$"+Number(n).toLocaleString("es-CO");
export const newId  = () => "id"+Math.random().toString(36).slice(2,8);
export const todayStr = () => new Date().toISOString().slice(0,10);
export const timeNow  = () => new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});
export const readFile = f => new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL(f);});
