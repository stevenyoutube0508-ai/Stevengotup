// supabase/functions/manage-staff/index.ts
// Gestiona usuarios staff (crear, eliminar, reset password).
// Solo el admin dueño del negocio puede llamar esta función.
// actions: create | delete | reset_password

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    // ── 1. Verificar que el caller sea admin (dueño del negocio) ───────────
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "No autorizado" }, 401);

    const { data: prof } = await userClient
      .from("profiles").select("role").eq("id", user.id).single();
    if (prof?.role !== "admin") {
      return json({ error: "Acceso denegado — solo el admin del negocio" }, 403);
    }

    // ── 2. Leer body ─────────────────────────────────────────────────────────
    const body = await req.json();
    const { action } = body;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ── 3. Ejecutar acción ────────────────────────────────────────────────
    if (action === "create") {
      const { form, tempPassword, branchId } = body;

      const { data: authData, error: authErr } = await admin.auth.admin.createUser({
        email: form.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name: form.name },
      });
      if (authErr) throw new Error(authErr.message);
      const userId = authData.user.id;

      const profilePayload = {
        role: "staff",
        staff_role: "delivery",
        owner_id: user.id,          // ← el caller ES el dueño
        name: form.name,
        email: form.email,
        branch_id: branchId || null,
      };

      const { data: updRows, error: updErr } = await admin
        .from("profiles").update(profilePayload).eq("id", userId).select("id");

      let profErr = updErr;
      if (!updErr && (!updRows || updRows.length === 0)) {
        const { error: insErr } = await admin
          .from("profiles").insert({ id: userId, ...profilePayload });
        profErr = insErr;
      }

      if (profErr) {
        await admin.auth.admin.deleteUser(userId).catch(() => {});
        throw new Error(profErr.message);
      }

      return json({ userId, error: null });
    }

    if (action === "delete") {
      const { staffId } = body;
      // Verificar que el staff pertenece al caller
      const { data: staffProf } = await admin
        .from("profiles").select("owner_id").eq("id", staffId).single();
      if (staffProf?.owner_id !== user.id) {
        return json({ error: "No puedes eliminar operadores de otro negocio" }, 403);
      }
      const { error: delAuthErr } = await admin.auth.admin.deleteUser(staffId);
      if (delAuthErr) throw new Error(delAuthErr.message);
      const { error } = await admin.from("profiles").delete().eq("id", staffId);
      return json({ error: error?.message ?? null });
    }

    if (action === "reset_password") {
      const { staffId, newPassword } = body;
      const { data: staffProf } = await admin
        .from("profiles").select("owner_id").eq("id", staffId).single();
      if (staffProf?.owner_id !== user.id) {
        return json({ error: "No puedes resetear la contraseña de otro negocio" }, 403);
      }
      const { error } = await admin.auth.admin.updateUserById(staffId, { password: newPassword });
      return json({ error: error?.message ?? null });
    }

    return json({ error: `Acción desconocida: ${action}` }, 400);

  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
