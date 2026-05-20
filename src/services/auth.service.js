import { supabase } from "../lib/supabase";

export function mapProfileUser(authUser, profile){
  if(!authUser || !profile) return null;
  return {
    ...authUser,
    role: profile.role,
    name: profile.name,
    title: profile.title,
    avatar: profile.avatar,
    subscriptionExpiresAt: profile.subscription_expires_at || null,
    businessType: profile.business_type || "restaurant",
  };
}

export async function getCurrentUserWithProfile(){
  const { data: { session }, error } = await supabase.auth.getSession();
  if(error) throw error;
  if(!session?.user) return null;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  if(profileError) throw profileError;
  return mapProfileUser(session.user, profile);
}

export async function loginWithPassword(email, password){
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if(error) throw error;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();
  if(profileError) throw profileError;
  return mapProfileUser(data.user, profile);
}

export async function logoutUser(){
  const { error } = await supabase.auth.signOut();
  if(error) throw error;
}

export function onAuthChanged(callback){
  let lastUserId = null;

  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if(!session?.user){
      lastUserId = null;
      callback(null);
      return;
    }

    // TOKEN_REFRESHED fires every ~1h with the same user.
    // SIGNED_IN can re-fire when the browser tab regains focus after being
    // idle (Supabase reconnects and emits SIGNED_IN even though the session
    // never changed). Skip both to avoid a mass re-render cascade.
    const sameUser =
      (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") &&
      session.user.id === lastUserId;
    if(sameUser) return;

    lastUserId = session.user.id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    callback(profile ? mapProfileUser(session.user, profile) : null);
  });
  return data?.subscription;
}
