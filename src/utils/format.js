export const fmtCOP = n => "$"+Number(n).toLocaleString("es-CO");

export const newId  = () => "id"+Math.random().toString(36).slice(2,8);

export const todayStr = () => new Date().toISOString().slice(0,10);

export const timeNow  = () => new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});

export const readFile = f => new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL(f);});

/**
 * Comprime una imagen usando Canvas antes de almacenarla.
 * Redimensiona al ancho máximo especificado y aplica calidad JPEG.
 * Esto mantiene el base64 resultante < ~300 KB para evitar errores de payload en Supabase.
 */
export const compressImage = (file, { maxWidth = 1280, quality = 0.78 } = {}) =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale   = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas  = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

/* ─── UI ATOMS ────────────────────────────────────────────── */
