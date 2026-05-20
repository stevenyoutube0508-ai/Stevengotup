import { create } from "zustand";
import { INIT_CONFIG, INIT_BILLING } from "../constants/seed";
import { getVertical } from "../constants/verticals";
import {
  loadAdminData as loadAdminDataService,
  insertProduct,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  insertCategory,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  insertOrder,
  updateOrderStatus,
  updateRestaurantConfig,
  updateRestaurantBanners,
  saveBranches as saveBranchesService,
} from "../services/admin.service";

let toastTimer = null;

export const useAdminStore = create((set, get) => ({
  ownerId: null,
  products: [],
  cats: [],
  config: INIT_CONFIG,
  billing: INIT_BILLING,
  orders: [],
  branches: [],          // starts empty; loaded per-user from restaurant_config
  dbLoaded: false,
  adminLoading: false,
  toast: null,
  sidebarOpen: false,

  setSidebarOpen: value => set({ sidebarOpen: typeof value === "function" ? value(get().sidebarOpen) : value }),
  setBilling: value => set(state => ({ billing: typeof value === "function" ? value(state.billing) : value })),

  showToast: (msg, type = "ok") => {
    if(toastTimer) clearTimeout(toastTimer);
    set({ toast: { msg, type } });
    toastTimer = setTimeout(() => set({ toast: null }), 2600);
  },

  loadAdminData: async user => {
    if(!user?.id) return;
    set({ ownerId: user.id, dbLoaded: false, adminLoading: true });
    try{
      const data = await loadAdminDataService(user.id);
      set(state => ({
        cats: data.cats,
        products: data.products,
        config: data.config || state.config,
        branches: data.config?.branches || [],   // per-user branches from DB
        orders: data.orders,
        billing: data.billing || state.billing,  // real plan from profiles table
        dbLoaded: true,
        adminLoading: false,
      }));
      if(data.errors?.length){
        console.warn("loadAdminData partial errors:", data.errors);
      }
    }catch(error){
      console.error("loadAdminData error:", error);
      set({ dbLoaded: true, adminLoading: false });
      get().showToast("❌ Error cargando datos", "error");
    }
  },

  addProduct: async p => {
    const ownerId = get().ownerId;
    const { error } = await insertProduct(ownerId, p);
    if(error){
      console.error("addProduct error:", error);
      get().showToast("❌ Error al guardar: " + error.message, "error");
      return;
    }
    set(state => ({ products: [p, ...state.products] }));
    get().showToast("✓ Producto agregado");
  },

  updateProduct: async (id, patch) => {
    const { error } = await updateProductService(id, patch);
    if(error){
      console.error("updateProduct error:", error);
      get().showToast("❌ Error al guardar: " + error.message, "error");
      return;
    }
    set(state => ({ products: state.products.map(x => x.id === id ? { ...x, ...patch } : x) }));
    get().showToast("✓ Cambios guardados");
  },

  deleteProduct: async id => {
    const { error } = await deleteProductService(id);
    if(error){
      console.error("deleteProduct error:", error);
      get().showToast("❌ Error eliminando producto", "error");
      return;
    }
    set(state => ({ products: state.products.filter(x => x.id !== id) }));
    get().showToast("Producto eliminado", "warn");
  },

  addCat: async c => {
    const ownerId = get().ownerId;
    const { error } = await insertCategory(ownerId, c);
    if(error){
      console.error("addCat error:", error);
      get().showToast("❌ Error: " + error.message, "error");
      return;
    }
    set(state => ({ cats: [...state.cats, c] }));
    get().showToast("✓ Categoría creada");
  },

  updateCat: async (id, patch) => {
    const { error } = await updateCategoryService(id, patch);
    if(error){
      console.error("updateCat error:", error);
      get().showToast("❌ Error al guardar: " + error.message, "error");
      return;
    }
    set(state => ({ cats: state.cats.map(x => x.id === id ? { ...x, ...patch } : x) }));
  },

  deleteCat: async id => {
    const { error } = await deleteCategoryService(id);
    if(error){
      console.error("deleteCat error:", error);
      get().showToast("❌ Error eliminando categoría", "error");
      return;
    }
    set(state => ({ cats: state.cats.filter(x => x.id !== id) }));
    get().showToast("Categoría eliminada", "warn");
  },

  addOrder: async o => {
    const ownerId = get().ownerId;
    if(ownerId){
      const { error } = await insertOrder(ownerId, o);
      if(error){
        console.error("addOrder error:", error);
        get().showToast("❌ Error guardando pedido", "error");
        return;
      }
    }
    set(state => ({ orders: [o, ...state.orders] }));
    get().showToast("🔔 Nuevo pedido recibido");
  },

  moveOrder: async (id, status, businessType = "restaurant") => {
    const { error } = await updateOrderStatus(id, status);
    if(error){
      console.error("moveOrder error:", error);
      get().showToast("❌ Error moviendo pedido", "error");
      return;
    }
    set(state => ({ orders: state.orders.map(o => o.id === id ? { ...o, status } : o) }));
    const labels = getVertical(businessType).labels;
    const statusLabels = {
      pendiente: "Pendiente",
      en_cocina: labels.status_processing,
      listo: labels.status_ready,
      en_camino: labels.status_shipping,
      entregado: labels.status_done,
    };
    get().showToast(`→ ${statusLabels[status] || status}`);
  },

  updateBranch: async (id, patch) => {
    const updated = get().branches.map(x => x.id === id ? { ...x, ...patch } : x);
    set({ branches: updated });
    const ownerId = get().ownerId;
    if(ownerId){
      const { error } = await saveBranchesService(ownerId, updated);
      if(error){
        console.error("updateBranch error:", error);
        get().showToast("❌ Error guardando sucursal", "error");
      }
    }
  },

  addBranch: async branch => {
    const updated = [...get().branches, branch];
    set({ branches: updated });
    const ownerId = get().ownerId;
    if(ownerId){
      const { error } = await saveBranchesService(ownerId, updated);
      if(error){
        console.error("addBranch error:", error);
        get().showToast("❌ Error guardando sucursal", "error");
        return;
      }
    }
    get().showToast("✓ Sucursal creada");
  },

  updateConfig: async config => {
    const ownerId = get().ownerId;
    const { error } = await updateRestaurantConfig(ownerId, config);
    if(error){
      console.error("updateConfig error:", error);
      get().showToast("❌ Error guardando diseño", "error");
      return;
    }
    set({ config });
    get().showToast("✓ Diseño guardado");
  },

  updateBannersAndPopup: async config => {
    const ownerId = get().ownerId;
    const { error } = await updateRestaurantBanners(ownerId, config);
    if(error){
      console.error("updateBannersAndPopup error:", error);
      get().showToast("❌ Error guardando banners", "error");
      return;
    }
    set({ config });
    get().showToast("✓ Banners y popup guardados");
  },

  resetAdminStore: () => set({
    ownerId: null,
    products: [],
    cats: [],
    config: INIT_CONFIG,
    billing: INIT_BILLING,
    orders: [],
    branches: [],
    dbLoaded: false,
    adminLoading: false,
    toast: null,
    sidebarOpen: false,
  }),
}));
