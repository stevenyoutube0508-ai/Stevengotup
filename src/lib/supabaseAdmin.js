import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.warn(
    "[supabaseAdmin] VITE_SUPABASE_SERVICE_ROLE_KEY no está definido. " +
    "Añádelo en .env desde: Supabase Dashboard → Project Settings → API → service_role"
  );
}

// Cliente con privilegios de administrador.
// Solo se usa server-side (CEO panel) para crear usuarios sin afectar la sesión activa.
// autoRefreshToken y persistSession en false evitan que este cliente
// sobreescriba la sesión del CEO en localStorage.
export const supabaseAdmin = createClient(
  supabaseUrl || "",
  serviceRoleKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
