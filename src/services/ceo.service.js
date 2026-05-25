import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseAdmin";
// CEO necesita leer datos de TODOS los negocios (cross-user).
// Mientras no esté aplicada la migración SQL de RLS, usamos supabaseAdmin
// para las consultas que necesitan bypass. En producción se debe ejecutar
// la migración SQL y las funciones helper auth.get_my_role() para que el CEO
// pueda leer con su propio JWT.

/**
 * Load the branches array for a specific business (by owner user_id).
 * Uses the admin client because CEO's session doesn't satisfy the
 * "auth.uid() = user_id" RLS policy on restaurant_config.
 */
export async function loadBusinessBranches(ownerId) {
  // Política "CEO acceso completo restaurant_config" permite leer cualquier fila.
  const { data, error } = await supabase
    .from("restaurant_config")
    .select("branches")
    .eq("user_id", ownerId)
    .single();
  if (error) { console.error("loadBusinessBranches:", error); return []; }
  return data?.branches || [];
}

export async function saveBusinessBranches(ownerId, branches) {
  // Política "CEO acceso completo restaurant_config" permite INSERT/UPDATE.
  const { error } = await supabase
    .from("restaurant_config")
    .upsert(
      { user_id: ownerId, branches: branches || [] },
      { onConflict: "user_id" }
    );
  return { error };
}

export async function loadPaymentRequests(){
  // CEO lee solicitudes de TODOS los negocios → supabaseAdmin bypasa RLS
  return supabaseAdmin.from("payment_requests").select("*").order("created_at", { ascending: false });
}

export async function loadRealRestaurants(){
  // CEO lee configuraciones y perfiles de todos los negocios → supabaseAdmin
  const [cfgRes, profRes] = await Promise.all([
    supabaseAdmin.from("restaurant_config").select("*"),
    supabaseAdmin.from("profiles").select("*").eq("role", "admin"),
  ]);

  if(cfgRes.error || profRes.error) return { data: [], error: cfgRes.error || profRes.error };

  const cfgs = cfgRes.data || [];
  const profs = profRes.data || [];
  const MRR_MAP = { pro: 99900, business: 189900, starter: 49900, enterprise: 299900 };
  const now = new Date();

  const data = cfgs.map(cfg => {
    const prof = profs.find(p => p.id === cfg.user_id);
    if(!prof) return null;
    const rawPlan = prof.billing_plan || "pro";
    // billing_plan="suspended_pro" → manualmente suspendido (evita tocar subscription_expires_at)
    const isManuallySuspended = rawPlan.startsWith("suspended_");
    const plan = isManuallySuspended ? rawPlan.replace("suspended_", "") || "pro" : rawPlan;
    const expiry = prof.subscription_expires_at ? new Date(prof.subscription_expires_at) : null;
    const daysLeft = expiry ? Math.max(0, Math.round((expiry - now) / (1000 * 60 * 60 * 24))) : null;
    const status = isManuallySuspended
      ? "suspended"
      : (!expiry ? "trial" : daysLeft === 0 ? "suspended" : daysLeft < 0 ? "suspended" : "active");

    return {
      id: cfg.user_id,
      name: cfg.name || "Sin nombre",
      owner: prof.name || "Admin",
      email: prof.email || "",
      phone: cfg.phone || "",
      city: cfg.city || "",
      plan,
      rawBillingPlan: rawPlan, // incluye "suspended_pro" — necesario para reactivar
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

  const payRes = await supabaseAdmin
    .from("payment_requests")
    .update({ status: "approved", reviewed_at: now, reviewed_by: reviewerName || "CEO" })
    .eq("id", req.id);

  if(payRes.error) return { error: payRes.error, newExpiry, reviewedAt: now };

  // Actualizar billing_plan (y subscription_expires_at si el trigger lo permite)
  // Si el trigger bloquea subscription_expires_at, solo actualizamos el plan.
  const profRes = await supabaseAdmin
    .from("profiles")
    .update({ billing_plan: req.plan, subscription_expires_at: newExpiry })
    .eq("id", req.owner_id);

  if (profRes.error?.message?.includes("permiso") || profRes.error?.code === "P0001") {
    // Trigger bloqueó subscription_expires_at — solo actualizar billing_plan
    const fallback = await supabaseAdmin
      .from("profiles")
      .update({ billing_plan: req.plan })
      .eq("id", req.owner_id);
    return { error: fallback.error, newExpiry, reviewedAt: now };
  }

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
/**
 * Crea un usuario admin.
 * - Si hay VITE_SUPABASE_SERVICE_ROLE_KEY (dev local): usa supabaseAdmin directamente.
 * - Si no hay (producción): invoca la Edge Function "create-admin-user".
 * NOTA: en producción deploye la Edge Function y elimine VITE_SUPABASE_SERVICE_ROLE_KEY del .env.
 */
export async function createAdminUser(form, tempPassword) {
  // ── Modo dev / local: usar supabaseAdmin directamente ──────────────────
  if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    return _createAdminUserDirect(form, tempPassword);
  }
  // ── Modo producción: Edge Function (service key solo en el servidor) ───
  const { data, error } = await supabase.functions.invoke("create-admin-user", {
    body: { form, tempPassword },
  });
  if (error) return { userId: null, error };
  if (data?.error) return { userId: null, error: new Error(data.error) };
  return { userId: data?.userId ?? null, error: null };
}

async function _createAdminUserDirect(form, tempPassword) {
  // 1. Crear usuario en Auth
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: form.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: form.owner },
  });
  if (authErr) return { userId: null, error: authErr };
  const userId = authData.user.id;

  // 2. Crear perfil
  const { error: profErr } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    role: "admin",
    name: form.owner,
    email: form.email,
    business_type: form.businessType,
    billing_plan: form.plan,
    subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: "id" });
  if (profErr) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    return { userId: null, error: profErr };
  }

  // 3. Crear configuración del negocio
  const { error: cfgErr } = await supabaseAdmin.from("restaurant_config").upsert({
    user_id: userId,
    name: form.name,
    city: form.city,
    phone: form.phone || "",
    logo: form.logo || "🏪",
    primary_color: form.primaryColor || "#f97316",
    open_status: false,
    cover_img: "",
    branches: [],
  }, { onConflict: "user_id" });
  if (cfgErr) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    return { userId: null, error: cfgErr };
  }

  return { userId, error: null };
}

const MRR_MAP = { pro: 99900, business: 189900, starter: 49900, enterprise: 299900 };

/**
 * Carga estadísticas para el CEO Dashboard:
 * - mrrTrend: arreglo de 7 meses con MRR acumulado de pagos aprobados ese mes
 * - recentActivity: últimas actividades combinadas (pagos + registros)
 */
export async function loadCEOStats() {
  const sevenAgo = new Date();
  sevenAgo.setMonth(sevenAgo.getMonth() - 6);
  sevenAgo.setDate(1);
  sevenAgo.setHours(0, 0, 0, 0);

  const [paymentsRes, profilesRes] = await Promise.all([
    supabaseAdmin
      .from("payment_requests")
      .select("id,plan,status,created_at,reviewed_at,restaurant_name,owner_id")
      .gte("created_at", sevenAgo.toISOString())
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("profiles")
      .select("name,email,created_at,billing_plan")
      .eq("role", "admin")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const payments = paymentsRes.data || [];
  const profiles = profilesRes.data || [];

  // ── MRR trend: últimos 7 meses ──────────────────────────────
  const months = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("es-CO", { month: "short" });
    months.push({ key, label });
  }

  const mrrTrend = months.map(({ key, label }) => {
    const approved = payments.filter(
      p => p.status === "approved" && p.created_at?.slice(0, 7) === key
    );
    const mrr = approved.reduce((s, p) => s + (MRR_MAP[p.plan] || 99900), 0);
    return { m: label, mrr };
  });

  // ── Actividad reciente ──────────────────────────────────────
  const payActivity = payments.slice(0, 8).map(p => ({
    time: p.reviewed_at || p.created_at,
    type: p.status === "approved" ? "payment_approved"
        : p.status === "rejected" ? "payment_rejected"
        : "payment_pending",
    name: p.restaurant_name || "Negocio",
    plan: p.plan,
    amount: MRR_MAP[p.plan] || 99900,
  }));

  const regActivity = profiles.map(p => ({
    time: p.created_at,
    type: "new_registration",
    name: p.name || p.email || "Nuevo negocio",
    plan: p.billing_plan || "trial",
    amount: null,
  }));

  const recentActivity = [...payActivity, ...regActivity]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8);

  return { mrrTrend, recentActivity };
}

/** Extiende la suscripción de un negocio 30 días desde hoy. */
export async function extendSubscription(ownerId) {
  const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ subscription_expires_at: newExpiry })
    .eq("id", ownerId);
  if (error?.message?.includes("permiso") || error?.code === "P0001") {
    // Trigger bloquea subscription_expires_at — no se puede extender por esta vía.
    // Solución: eliminar el trigger en Supabase Dashboard → Database → Functions → drop trigger on profiles.
    return { error: new Error("El trigger de base de datos impide extender la suscripción. Elimina el trigger 'prevent_subscription_date_update' en Supabase Dashboard."), newExpiry: null };
  }
  return { error, newExpiry };
}

/** Cambia el plan (billing_plan) de un negocio en la tabla profiles. */
export async function updateRestaurantPlan(ownerId, plan) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ billing_plan: plan })
    .eq("id", ownerId);
  return { error };
}

/**
 * Suspende un negocio usando billing_plan="suspended_<plan>" para
 * preservar el plan original sin tocar subscription_expires_at
 * (que puede tener un trigger de base de datos que bloquea escrituras).
 */
export async function suspendRestaurant(ownerId, currentPlan) {
  const planToStore = (currentPlan && !currentPlan.startsWith("suspended"))
    ? currentPlan
    : "pro";
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ billing_plan: `suspended_${planToStore}` })
    .eq("id", ownerId);
  return { error };
}

/**
 * Reactiva un negocio: lee el plan original del valor "suspended_<plan>"
 * y lo restaura en billing_plan.
 */
export async function activateRestaurant(ownerId, suspendedBillingPlan) {
  const originalPlan = suspendedBillingPlan?.startsWith("suspended_")
    ? suspendedBillingPlan.replace("suspended_", "")
    : "pro";
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ billing_plan: originalPlan })
    .eq("id", ownerId);
  return { error, originalPlan };
}

export async function rejectPaymentRequest(req, note, reviewerName){
  const now = new Date().toISOString();
  const res = await supabaseAdmin
    .from("payment_requests")
    .update({ status: "rejected", ceo_notes: note || "", reviewed_at: now, reviewed_by: reviewerName || "CEO" })
    .eq("id", req.id);

  return { error: res.error, reviewedAt: now };
}

// ── Support Tickets ──────────────────────────────────────────────────────────

export async function loadTickets() {
  // CEO lee tickets de TODOS los admins → supabaseAdmin
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

/**
 * Persiste cambios de estado y/o mensajes de un ticket.
 * `ticket` es el objeto completo (el componente pasa {...sel, status/messages: newValue}).
 */
export async function updateTicketInDB(id, ticket) {
  const patch = {};
  if (ticket.status   !== undefined) patch.status   = ticket.status;
  if (ticket.messages !== undefined) patch.messages = ticket.messages || [];
  if (!Object.keys(patch).length) return { error: null };

  const { error } = await supabaseAdmin
    .from("support_tickets")
    .update(patch)
    .eq("id", id);
  return { error };
}

// ── Platform Config ──────────────────────────────────────────────────────────

export async function loadPlatformConfig() {
  const { data, error } = await supabaseAdmin
    .from("platform_config")
    .select("*")
    .eq("id", 1)
    .single();
  return { data, error };
}

export async function savePlatformConfig(cfg) {
  const { error } = await supabaseAdmin
    .from("platform_config")
    .upsert(
      {
        id:               1,
        trial_days:       parseInt(cfg.trialDays)      || 14,
        grace_days:       parseInt(cfg.graceDays)      || 7,
        starter_price:    parseInt(cfg.starterPrice)   || 49900,
        pro_price:        parseInt(cfg.proPrice)        || 99900,
        business_price:   parseInt(cfg.businessPrice)  || 189900,
        support_email:    cfg.supportEmail             || "soporte@picku.co",
        maintenance_mode: cfg.maintenanceMode          || false,
        new_registrations: cfg.newRegistrations !== false,
        updated_at:       new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  return { error };
}
