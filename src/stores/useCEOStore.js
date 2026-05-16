import { create } from "zustand";
import { SEED_RESTAURANTS, SEED_TICKETS } from "../constants/seed";
import { loadPaymentRequests, loadRealRestaurants, approvePaymentRequest, rejectPaymentRequest } from "../services/ceo.service";

export const useCEOStore = create((set, get) => ({
  restaurants: SEED_RESTAURANTS,
  tickets: SEED_TICKETS,
  paymentRequests: [],
  payReqLoading: false,
  ceoLoaded: false,

  loadCEOData: async () => {
    set({ payReqLoading: true });
    try{
      const [payments, realRestaurants] = await Promise.all([
        loadPaymentRequests(),
        loadRealRestaurants(),
      ]);

      if(payments.data) set({ paymentRequests: payments.data });
      if(realRestaurants.data?.length){
        set(state => {
          const currentEmails = new Set(state.restaurants.map(r => r.email));
          const newOnes = realRestaurants.data.filter(r => !currentEmails.has(r.email));
          return { restaurants: [...state.restaurants, ...newOnes] };
        });
      }
    }catch(error){
      console.error("loadCEOData error:", error);
    }finally{
      set({ payReqLoading: false, ceoLoaded: true });
    }
  },

  updateRestaurant: (id, patch) => {
    set(state => ({ restaurants: state.restaurants.map(r => r.id === id ? { ...r, ...patch } : r) }));
  },

  addRestaurant: restaurant => {
    set(state => ({ restaurants: [restaurant, ...state.restaurants] }));
  },

  updateTicket: (id, patch) => {
    set(state => ({ tickets: state.tickets.map(t => t.id === id ? { ...t, ...patch } : t) }));
  },

  approvePayment: async (req, reviewerName, showToast) => {
    const { error, newExpiry, reviewedAt } = await approvePaymentRequest(req, reviewerName);
    if(error){
      console.error("approvePayment error:", error);
      showToast?.("❌ Error aprobando pago", "error");
      return;
    }
    set(state => ({ paymentRequests: state.paymentRequests.map(r => r.id === req.id ? { ...r, status: "approved", reviewed_at: reviewedAt } : r) }));
    showToast?.(`✅ Pago de ${req.restaurant_name} aprobado — Plan ${req.plan} activo hasta ${newExpiry.slice(0,10)}`);
  },

  rejectPayment: async (req, note, reviewerName, showToast) => {
    const { error, reviewedAt } = await rejectPaymentRequest(req, note, reviewerName);
    if(error){
      console.error("rejectPayment error:", error);
      showToast?.("❌ Error rechazando pago", "error");
      return;
    }
    set(state => ({ paymentRequests: state.paymentRequests.map(r => r.id === req.id ? { ...r, status: "rejected", ceo_notes: note || "", reviewed_at: reviewedAt } : r) }));
    showToast?.(`❌ Pago de ${req.restaurant_name} rechazado`, "warn");
  },
}));
