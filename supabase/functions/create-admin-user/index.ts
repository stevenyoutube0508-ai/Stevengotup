// supabase/functions/create-admin-user/index.ts
// Crea un usuario admin (negocio) en Auth + profiles + restaurant_config.
// La service role key SOLO vive aquí, nunca en el bundle del cliente.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    // ── 1. Verificar que el caller sea CEO ──────────────────────────────────
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return json({ userId: null, error: "No autorizado" }, 401);
    }
    const { data: prof } = await userClient
      .from("profiles").select("role").eq("id", user.id).single();
    if (prof?.role !== "ceo") {
      return json({ userId: null, error: "Acceso denegado — solo CEO" }, 403);
    }

    // ── 2. Leer body ─────────────────────────────────────────────────────────
    const { form, tempPassword } = await req.json();

    // ── 3. Usar service role para crear el usuario ────────────────────────
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: form.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: form.owner },
    });
    if (authErr) throw new Error(authErr.message);
    const userId = authData.user.id;

    // ── 4. Perfil ─────────────────────────────────────────────────────────
    const { error: profErr } = await admin.from("profiles").upsert({
      id: userId,
      role: "admin",
      name: form.owner,
      email: form.email,
      business_type: form.businessType,
      billing_plan: form.plan,
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "id" });
    if (profErr) {
      await admin.auth.admin.deleteUser(userId).catch(() => {});
      throw new Error(profErr.message);
    }

    // ── 5. Configuración del negocio ──────────────────────────────────────
    const { error: cfgErr } = await admin.from("restaurant_config").upsert({
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
      await admin.auth.admin.deleteUser(userId).catch(() => {});
      throw new Error(cfgErr.message);
    }

    return json({ userId, error: null });
  } catch (e) {
    return json({ userId: null, error: (e as Error).message }, 400);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
