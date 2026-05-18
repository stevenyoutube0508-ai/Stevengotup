import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseAdmin";

export async function loadPaymentRequests(){
  return supabase.from("payment_requests").select("*").order("created_at", { ascending: false });
}

export async function loadRealRestaurants(){
  const [cfgRes, profRes] = await Promise.all([
    supabase.from("restaurant_config").select("*"),
    supabase.from("profiles").select("*").eq("role", "admin"),
  ]);

  if(cfgRes.error || profRes.error) return { data: [], error: cfgRes.error || profRes.error };

  const cfgs = cfgRes.data || [];
  const profs = profRes.data || [];
  const MRR_MAP = { pro: 99900, business: 189900, starter: 49900, enterprise: 299900 };
  const now = new Date();

  const data = cfgs.map(cfg => {
    const prof = profs.find(p => p.id === cfg.user_id);
    if(!prof) return null;
    const expiry = prof.subscription_expires_at ? new Date(prof.subscription_expires_at) : null;
    const daysLeft = expiry ? Math.max(0, Math.round((expiry - now) / (1000 * 60 * 60 * 24))) : null;
    const status = !expiry ? "trial" : daysLeft === 0 ? "suspended" : daysLeft < 0 ? "suspended" : "active";
    const plan = prof.billing_plan || "pro";

    return {
      id: cfg.user_id,
      name: cfg.name || "Sin nombre",
      owner: prof.name || "Admin",
      email: prof.email || "",
      phone: cfg.phone || "",
      city: cfg.city || "",
      plan,
      status,
      businessType: prof.business_type || "restaurant",
      createdAt: prof.created_at ? prof.created_at.slice(0, 10) : "2025-01-01",
      nextPayment: expiry ? expiry.toISOString().slice(0, 10) : null,
      daysLeft,
      mrr: MRR_MAP[plan] || 99900,
      products: 0,
      orders: 0,
      coverImg: cfg.cover_img || "",
      logo: cfg.logo || "🏪",
      notes: "",
    };
  }).filter(Boolean);

  return { data, error: null };
}

export async function approvePaymentRequest(req, reviewerName){
  const now = new Date().toISOString();
  const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const payRes = await supabase
    .from("payment_requests")
    .update({ status: "approved", reviewed_at: now, reviewed_by: reviewerName || "CEO" })
    .eq("id", req.id);

  if(payRes.error) return { error: payRes.error, newExpiry, reviewedAt: now };

  const profRes = await supabase
    .from("profiles")
    .update({ billing_plan: req.plan, subscription_expires_at: newExpiry })
    .eq("id", req.owner_id);

  return { error: profRes.error, newExpiry, reviewedAt: now };
}

/**
 * Crea un usuario admin en Supabase Auth + fila en profiles + fila en restaurant_config.
 * Requiere que VITE_SUPABASE_SERVICE_ROLE_KEY esté definido en .env
 *
 * @param {object} form  - Datos del formulario de onboarding
 * @param {string} tempPassword - Contraseña temporal generada antes de llamar
 * @returns {{ userId: string|null, error: Error|null }}
 */
export async function createAdminUser(form, tempPassword) {
  // ── 1. Crear usuario en Auth ───────────────────────────────
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: form.email,
    password: tempPassword,
    email_confirm: true,          // confirma inmediatamente, no necesita email
    user_metadata: { name: form.owner },
  });

  if (authError) return { userId: null, error: authError };
  const userId = authData.user.id;

  // ── 2. Insertar / actualizar perfil ────────────────────────
  // En algunos proyectos Supabase hay un trigger que ya crea la fila;
  // usamos upsert para no fallar si ya existe.
  const { error: profError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: userId,
      role: "admin",
      name: form.owner,
      email: form.email,
      business_type: form.businessType,
      billing_plan: form.plan,
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "id" });

  if (profError) {
    // Si el perfil falla intentamos limpiar el usuario creado para no dejar huérfanos
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    return { userId: null, error: profError };
  }

  // ── 3. Crear configuración del negocio ─────────────────────
  const { error: cfgError } = await supabaseAdmin
    .from("restaurant_config")
    .upsert({
      user_id: userId,
      name: form.name,
      city: form.city,
      phone: form.phone || "",
      logo: form.logo || "🏪",
      primary_color: form.primaryColor || "#f97316",
      open_status: false,
      cover_img: "",
    }, { onConflict: "user_id" });

  if (cfgError) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    return { userId: null, error: cfgError };
  }

  return { userId, error: null };
}

export async function rejectPaymentRequest(req, note, reviewerName){
  const now = new Date().toISOString();
  const res = await supabase
    .from("payment_requests")
    .update({ status: "rejected", ceo_notes: note || "", reviewed_at: now, reviewed_by: reviewerName || "CEO" })
    .eq("id", req.id);

  return { error: res.error, reviewedAt: now };
}
