import { supabase } from "../lib/supabase";

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

export async function rejectPaymentRequest(req, note, reviewerName){
  const now = new Date().toISOString();
  const res = await supabase
    .from("payment_requests")
    .update({ status: "rejected", ceo_notes: note || "", reviewed_at: now, reviewed_by: reviewerName || "CEO" })
    .eq("id", req.id);

  return { error: res.error, reviewedAt: now };
}
