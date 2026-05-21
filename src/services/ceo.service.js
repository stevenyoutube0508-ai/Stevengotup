import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseAdmin";

/**
 * Load the branches array for a specific business (by owner user_id).
 * Uses the admin client because CEO's session doesn't satisfy the
 * "auth.uid() = user_id" RLS policy on restaurant_config.
 */
export async function loadBusinessBranches(ownerId) {
  const { data, error } = await supabaseAdmin
    .from("restaurant_config")
    .select("branches")
    .eq("user_id", ownerId)
    .single();
  if (error) { console.error("loadBusinessBranches:", error); return []; }
  return data?.branches || [];
}

/**
 * Persist the branches array for a specific business.
 */
export async function saveBusinessBranches(ownerId, branches) {
  const { error } = await supabaseAdmin
    .from("restaurant_config")
    .update({ branches: branches || [] })
    .eq("user_id", ownerId);
  return { error };
}

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
      branches: [],    // new businesses start with no branches
    }, { onConflict: "user_id" });

  if (cfgError) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    return { userId: null, error: cfgError };
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
  // Últimos 7 meses desde el primer día del mes de hace 6 meses
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

export async function rejectPaymentRequest(req, note, reviewerName){
  const now = new Date().toISOString();
  const res = await supabase
    .from("payment_requests")
    .update({ status: "rejected", ceo_notes: note || "", reviewed_at: now, reviewed_by: reviewerName || "CEO" })
    .eq("id", req.id);

  return { error: res.error, reviewedAt: now };
}

// ── Support Tickets ──────────────────────────────────────────────────────────

export async function loadTickets() {
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
