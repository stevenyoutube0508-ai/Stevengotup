import { supabase } from "../lib/supabase";

export async function loadReservations(userId) {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export function mapReservationFromDb(r) {
  return {
    id:        r.id,
    name:      r.name,
    phone:     r.phone,
    email:     r.email  || "",
    date:      r.date,
    time:      r.time,
    guests:    r.guests || 2,
    area:      r.area   || "Interior",
    status:    r.status || "pendiente",
    notes:     r.notes  || "",
    createdAt: r.created_at,
  };
}

export async function insertReservation(userId, r) {
  return supabase.from("reservations").insert({
    id:       r.id,
    user_id:  userId,
    name:     r.name,
    phone:    r.phone,
    email:    r.email  || "",
    date:     r.date,
    time:     r.time,
    guests:   r.guests || 2,
    area:     r.area   || "Interior",
    status:   r.status || "pendiente",
    notes:    r.notes  || "",
  });
}

export async function updateReservationStatus(id, status) {
  return supabase.from("reservations").update({ status }).eq("id", id);
}

export async function deleteReservation(id) {
  return supabase.from("reservations").delete().eq("id", id);
}
