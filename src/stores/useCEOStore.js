import { create } from "zustand";
import {
  loadPaymentRequests,
  loadRealRestaurants,
  loadCEOStats,
  approvePaymentRequest,
  rejectPaymentRequest,
  updateRestaurantPlan,
  suspendRestaurant,
  activateRestaurant,
  loadTickets,
  updateTicketInDB,
  loadPlatformConfig,
  savePlatformConfig,
} from "../services/ceo.service";

export const useCEOStore = create((set, get) => ({
  restaurants: [],
  tickets: [],
  paymentRequests: [],
  payReqLoading: false,
  ceoLoaded: false,
  ceoStats:        { mrrTrend: [], recentActivity: [] },
  platformConfig:  null,   // cargado desde platform_config (id=1)

  loadCEOData: async () => {
    set({ payReqLoading: true });
    try {
      const [payments, realRestaurants, stats, ticketsRes, cfgRes] = await Promise.all([
        loadPaymentRequests(),
        loadRealRestaurants(),
        loadCEOStats(),
        loadTickets().catch(() => ({ data: [], error: null })),
        loadPlatformConfig().catch(() => ({ data: null, error: null })),
      ]);

      if (payments.data)          set({ paymentRequests: payments.data });
      if (realRestaurants.data)   set({ restaurants: realRestaurants.data });
      set({ ceoStats: stats });
      set({ tickets: ticketsRes.data || [] });
      if (cfgRes.data) set({ platformConfig: cfgRes.data });
    } catch (error) {
      console.error("loadCEOData error:", error);
    } finally {
      set({ payReqLoading: false, ceoLoaded: true });
    }
  },

  updateRestaurant: async (id, patch) => {
    // Capturar datos originales ANTES del update optimista
    const current = get().restaurants.find(r => r.id === id);
    const originalStatus      = current?.status;
    const originalPlan        = current?.plan || "pro";
    const originalRawBilling  = current?.rawBillingPlan || originalPlan;

    // Actualizar local inmediatamente para UX fluida
    set(state => ({ restaurants: state.restaurants.map(r => r.id === id ? { ...r, ...patch } : r) }));

    // Persistir cambios de plan en DB
    if (patch.plan && patch.status !== "suspended") {
      const { error } = await updateRestaurantPlan(id, patch.plan);
      if (error) console.error("updateRestaurantPlan DB error:", error);
    }
    // Persistir suspensión: usa billing_plan="suspended_<plan>" (evita trigger en subscription_expires_at)
    if (patch.status === "suspended") {
      const { error } = await suspendRestaurant(id, originalPlan);
      if (error) console.error("suspendRestaurant DB error:", error);
    }
    // Persistir reactivación: restaura el plan original
    else if (patch.status === "active" && originalStatus === "suspended") {
      const { error, originalPlan: restoredPlan } = await activateRestaurant(id, originalRawBilling);
      if (error) {
        console.error("activateRestaurant DB error:", error);
      } else {
        // Actualizar local con el plan restaurado
        set(state => ({
          restaurants: state.restaurants.map(r =>
            r.id === id ? { ...r, plan: restoredPlan, rawBillingPlan: restoredPlan } : r
          ),
        }));
      }
    }
  },

  addRestaurant: restaurant => {
    set(state => ({ restaurants: [restaurant, ...state.restaurants] }));
  },

  updateTicket: async (id, patch) => {
    // Actualizar local inmediatamente para UX fluida
    set(state => ({ tickets: state.tickets.map(t => t.id === id ? { ...t, ...patch } : t) }));
    // Persistir en DB sin bloquear
    const { error } = await updateTicketInDB(id, patch);
    if (error) console.error("updateTicket DB error:", error);
  },

  savePlatformConfig: async (cfg, showToast) => {
    const { error } = await savePlatformConfig(cfg);
    if (error) {
      console.error("savePlatformConfig error:", error);
      showToast?.("❌ Error guardando configuración", "error");
      return false;
    }
    // Guardar en formato DB para que dbToForm pueda leerlo en el próximo render
    set({
      platformConfig: {
        trial_days:        parseInt(cfg.trialDays)     || 14,
        grace_days:        parseInt(cfg.graceDays)     || 7,
        starter_price:     parseInt(cfg.starterPrice)  || 49900,
        pro_price:         parseInt(cfg.proPrice)      || 99900,
        business_price:    parseInt(cfg.businessPrice) || 189900,
        support_email:     cfg.supportEmail            || "soporte@picku.co",
        maintenance_mode:  cfg.maintenanceMode         || false,
        new_registrations: cfg.newRegistrations !== false,
      },
    });
    showToast?.("✓ Configuración guardada");
    return true;
  },

  approvePayment: async (req, reviewerName, showToast) => {
    const { error, newExpiry, reviewedAt } = await approvePaymentRequest(req, reviewerName);
    if (error) {
      console.error("approvePayment error:", error);
      showToast?.("❌ Error aprobando pago", "error");
      return;
    }
    set(state => ({
      paymentRequests: state.paymentRequests.map(r =>
        r.id === req.id ? { ...r, status: "approved", reviewed_at: reviewedAt } : r
      ),
    }));
    showToast?.(`✅ Pago de ${req.restaurant_name} aprobado — Plan ${req.plan} activo hasta ${newExpiry.slice(0, 10)}`);
  },

  rejectPayment: async (req, note, reviewerName, showToast) => {
    const { error, reviewedAt } = await rejectPaymentRequest(req, note, reviewerName);
    if (error) {
      console.error("rejectPayment error:", error);
      showToast?.("❌ Error rechazando pago", "error");
      return;
    }
    set(state => ({
      paymentRequests: state.paymentRequests.map(r =>
        r.id === req.id ? { ...r, status: "rejected", ceo_notes: note || "", reviewed_at: reviewedAt } : r
      ),
    }));
    showToast?.(`❌ Pago de ${req.restaurant_name} rechazado`, "warn");
  },
}));
