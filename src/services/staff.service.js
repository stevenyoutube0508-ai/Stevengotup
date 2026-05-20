import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseAdmin";

/**
 * Crea un usuario con rol "staff" vinculado a un negocio admin.
 * @param {string} ownerUserId  - ID del admin dueño del negocio
 * @param {{ name, email }}  form
 * @param {string} tempPassword - contraseña temporal generada antes de llamar
 */
export async function createStaffUser(ownerUserId, form, tempPassword) {
  // 1. Crear usuario en Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: form.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: form.name },
  });
  if (authError) return { userId: null, error: authError };
  const userId = authData.user.id;

  // 2. Crear / actualizar perfil con role = staff
  // Intentamos UPDATE primero (por si el trigger ya creó la fila),
  // si no afecta ninguna fila hacemos INSERT.
  const profilePayload = {
    role: "staff",
    staff_role: "delivery",
    owner_id: ownerUserId,
    name: form.name,
    email: form.email,
  };

  const { data: updRows, error: updError } = await supabaseAdmin
    .from("profiles")
    .update(profilePayload)
    .eq("id", userId)
    .select("id");

  let profError = updError;

  if (!updError && (!updRows || updRows.length === 0)) {
    // El trigger aún no corrió o no existe — insertar directamente
    const { error: insError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: userId, ...profilePayload });
    profError = insError;
  }

  if (profError) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    return { userId: null, error: profError };
  }

  return { userId, error: null };
}

/**
 * Carga todos los operadores de un negocio.
 */
export async function loadStaffMembers(ownerUserId) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id,name,email,staff_role")
    .eq("owner_id", ownerUserId)
    .eq("role", "staff");
  return { data: data || [], error };
}

/**
 * Elimina un operador: borra de Auth y de profiles.
 */
export async function deleteStaffUser(staffId) {
  const { error: delAuthError } = await supabaseAdmin.auth.admin.deleteUser(staffId);
  if (delAuthError) return { error: delAuthError };
  const { error } = await supabaseAdmin.from("profiles").delete().eq("id", staffId);
  return { error };
}

/**
 * Cambia la contraseña de un operador (para reset manual).
 */
export async function resetStaffPassword(staffId, newPassword) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(staffId, {
    password: newPassword,
  });
  return { error };
}
