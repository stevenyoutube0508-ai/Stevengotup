import { supabase } from "../lib/supabase";
// supabaseAdmin eliminado — operaciones de Auth van a la Edge Function manage-staff.
// Las lecturas de profiles usan supabase normal (RLS permite al owner ver su staff).

/**
 * Crea un usuario staff via Edge Function.
 * Solo puede llamar este endpoint el admin dueño del negocio.
 */
export async function createStaffUser(ownerUserId, form, tempPassword, branchId = null) {
  const { data, error } = await supabase.functions.invoke("manage-staff", {
    body: { action: "create", form, tempPassword, branchId },
  });
  if (error) return { userId: null, error };
  if (data?.error) return { userId: null, error: new Error(data.error) };
  return { userId: data?.userId ?? null, error: null };
}

/**
 * Carga todos los operadores de un negocio.
 * RLS permite: owner_id = auth.uid() → el admin ve su propio staff.
 */
export async function loadStaffMembers(ownerUserId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,email,staff_role,branch_id")
    .eq("owner_id", ownerUserId)
    .eq("role", "staff");
  return { data: data || [], error };
}

/**
 * Elimina un operador via Edge Function.
 */
export async function deleteStaffUser(staffId) {
  const { data, error } = await supabase.functions.invoke("manage-staff", {
    body: { action: "delete", staffId },
  });
  if (error) return { error };
  if (data?.error) return { error: new Error(data.error) };
  return { error: null };
}

/**
 * Resetea la contraseña de un operador via Edge Function.
 */
export async function resetStaffPassword(staffId, newPassword) {
  const { data, error } = await supabase.functions.invoke("manage-staff", {
    body: { action: "reset_password", staffId, newPassword },
  });
  if (error) return { error };
  if (data?.error) return { error: new Error(data.error) };
  return { error: null };
}
