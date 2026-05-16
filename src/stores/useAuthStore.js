import { create } from "zustand";
import { getCurrentUserWithProfile, logoutUser, onAuthChanged } from "../services/auth.service";

let authSubscription = null;

export const useAuthStore = create((set, get) => ({
  user: null,
  authChecked: false,
  authLoading: false,
  authError: null,

  setUser: user => set({ user, authChecked: true, authError: null }),

  initAuth: async () => {
    if(get().authLoading || get().authChecked) return;
    set({ authLoading: true, authError: null });
    try{
      const user = await getCurrentUserWithProfile();
      set({ user, authChecked: true, authLoading: false });
    }catch(error){
      console.error("initAuth error:", error);
      set({ user: null, authChecked: true, authLoading: false, authError: error?.message || "No se pudo verificar la sesión" });
    }

    if(!authSubscription){
      authSubscription = onAuthChanged(user => set({ user, authChecked: true }));
    }
  },

  logout: async () => {
    try{
      await logoutUser();
    }catch(error){
      console.error("logout error:", error);
    }finally{
      set({ user: null, authChecked: true });
    }
  },
}));
