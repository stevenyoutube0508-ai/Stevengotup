import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { INIT_CONFIG, INIT_BILLING } from "../constants/seed";
import { getVertical } from "../constants/verticals";
import {
  loadAdminData as loadAdminDataService,
  loadAdminDataBypass,
  mapOrderFromDb,
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
import {
  loadReservations,
  mapReservationFromDb,
  insertReservation,
  updateReservationStatus as updateReservationStatusService,
  deleteReservation as deleteReservationService,
} from "../services/reservations.service";

let toastTimer = null;

/** Beep corto usando Web Audio API */
function playPing() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  } catch (_) {}
}

/**
 * Envía un evento Broadcast a un canal Supabase de forma fire-and-forget.
 * Crea el canal, espera SUBSCRIBED, manda el evento y lo limpia.
 */
function broadcastSend(channelName, event, payload) {
  const ch = supabase.channel(channelName);
  ch.subscribe(status => {
    if (status !== "SUBSCRIBED") return;
    ch.send({ type: "broadcast", event, payload }).finally(() => {
      setTimeout(() => supabase.removeChannel(ch), 1500);
    });
  });
}

export const useAdminStore = create((set, get) => ({
  ownerId:        null,
  products:       [],
  cats:           [],
  config:         INIT_CONFIG,
  billing:        INIT_BILLING,
  orders:         [],
  branches:       [],
  reservations:   [],
  dbLoaded:       false,
  adminLoading:   false,
  toast:          null,
  sidebarOpen:    false,
  _ordersChannel: null,
  _pollInterval:  null,   // polling fallback si Realtime no está configurado

  setSidebarOpen: value => set({ sidebarOpen: typeof value === "function" ? value(get().sidebarOpen) : value }),
  setBilling: value => set(state => ({ billing: typeof value === "function" ? value(state.billing) : value })),

  showToast: (msg, type = "ok") => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { msg, type } });
    toastTimer = setTimeout(() => set({ toast: null }), 2600);
  },

  // ─── Procesador unificado de pedidos nuevos ─────────────────────────────
  // Llamado tanto por broadcast como por postgres_changes para evitar duplicar lógica.
  _handleIncomingOrder: (rawOrder) => {
    const newOrder = rawOrder.id ? rawOrder : mapOrderFromDb(rawOrder);
    if (get().orders.find(o => o.id === newOrder.id)) return; // dedup
    set(state => ({ orders: [newOrder, ...state.orders] }));
    playPing();
    get().showToast(`🔔 Nuevo pedido de ${newOrder.customerName || "cliente"}`);
  },

  // ─── Realtime: suscribirse ──────────────────────────────────────────────
  subscribeOrders: () => {
    const ownerId = get().ownerId;
    if (!ownerId) return;

    // Limpiar suscripción y polling previos
    const existing = get()._ordersChannel;
    if (existing) supabase.removeChannel(existing);
    const existingPoll = get()._pollInterval;
    if (existingPoll) clearInterval(existingPoll);

    const channelName = `biz:${ownerId}`;

    const channel = supabase
      .channel(channelName)

      // ① Broadcast — funciona SIN configurar Realtime en Supabase.
      //   El cliente emite 'new_order' cuando hace un pedido.
      .on("broadcast", { event: "new_order" }, payload => {
        const { orderId, customerName } = payload.payload || {};
        if (!orderId) return;
        // Fetch completo del pedido para tener todos los campos
        supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single()
          .then(({ data }) => {
            if (data) get()._handleIncomingOrder(mapOrderFromDb(data));
          });
      })

      // ② postgres_changes — funciona cuando la tabla 'orders' está en
      //   la publicación Realtime de Supabase (Dashboard → Database → Replication).
      //   Si no está configurado, este handler simplemente nunca se ejecuta.
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `user_id=eq.${ownerId}` },
        payload => {
          get()._handleIncomingOrder(payload.new);
        }
      )

      .subscribe(status => {
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] canal activo:", channelName);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[Realtime] canal con error — el polling de respaldo está activo");
        }
      });

    // ③ Polling de respaldo — consulta pedidos nuevos cada 20 s.
    //   Se vuelve irrelevante si Broadcast o postgres_changes funcionan,
    //   pero garantiza que los pedidos aparezcan aunque WebSockets fallen.
    const poll = setInterval(async () => {
      const mostRecent = get().orders[0];
      const since = mostRecent?.createdAt
        ? mostRecent.createdAt
        : new Date(Date.now() - 60 * 60 * 1000).toISOString(); // última hora si no hay pedidos

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", ownerId)
        .gt("created_at", since)
        .order("created_at", { ascending: false });

      if (!data?.length) return;
      const currentIds = new Set(get().orders.map(o => o.id));
      const newOrders  = data.map(mapOrderFromDb).filter(o => !currentIds.has(o.id));
      if (!newOrders.length) return;

      set(state => ({ orders: [...newOrders, ...state.orders] }));
      playPing();
      const msg = newOrders.length > 1
        ? `🔔 ${newOrders.length} nuevos pedidos`
        : `🔔 Nuevo pedido de ${newOrders[0].customerName || "cliente"}`;
      get().showToast(msg);
    }, 20_000);

    set({ _ordersChannel: channel, _pollInterval: poll });
  },

  // ─── Realtime: desuscribirse ────────────────────────────────────────────
  unsubscribeOrders: () => {
    const ch   = get()._ordersChannel;
    const poll = get()._pollInterval;
    if (ch)   supabase.removeChannel(ch);
    if (poll) clearInterval(poll);
    set({ _ordersChannel: null, _pollInterval: null });
  },

  // ─── Carga para operadores (staff) — usa supabaseAdmin para saltar RLS ──
  loadStaffData: async (ownerId) => {
    if (!ownerId) return;
    set({ ownerId, dbLoaded: false, adminLoading: true });
    try {
      const data = await loadAdminDataBypass(ownerId);
      set(state => ({
        cats:         data.cats,
        products:     data.products,
        config:       data.config || state.config,
        branches:     data.config?.branches || [],
        orders:       data.orders,
        dbLoaded:     true,
        adminLoading: false,
      }));
      if (data.errors?.length) console.warn("loadStaffData partial errors:", data.errors);
      get().subscribeOrders();
    } catch (error) {
      console.error("loadStaffData error:", error);
      set({ dbLoaded: true, adminLoading: false });
      get().showToast("❌ Error cargando datos del negocio", "error");
    }
  },

  // ─── Carga inicial ──────────────────────────────────────────────────────
  loadAdminData: async user => {
    if (!user?.id) return;
    set({ ownerId: user.id, dbLoaded: false, adminLoading: true });
    try {
      const [data, rvResult] = await Promise.all([
        loadAdminDataService(user.id),
        loadReservations(user.id).catch(() => ({ data: [], error: null })),
      ]);
      set(state => ({
        cats:         data.cats,
        products:     data.products,
        config:       data.config || state.config,
        branches:     data.config?.branches || [],
        orders:       data.orders,
        billing:      data.billing || state.billing,
        reservations: (rvResult.data || []).map(mapReservationFromDb),
        dbLoaded:     true,
        adminLoading: false,
      }));
      if (data.errors?.length) console.warn("loadAdminData partial errors:", data.errors);
      get().subscribeOrders();
    } catch (error) {
      console.error("loadAdminData error:", error);
      set({ dbLoaded: true, adminLoading: false });
      get().showToast("❌ Error cargando datos", "error");
    }
  },

  // ─── CRUD productos ─────────────────────────────────────────────────────
  addProduct: async p => {
    const { error } = await insertProduct(get().ownerId, p);
    if (error) { get().showToast("❌ Error al guardar: " + error.message, "error"); return; }
    set(state => ({ products: [p, ...state.products] }));
    get().showToast("✓ Producto agregado");
  },

  updateProduct: async (id, patch) => {
    const { error } = await updateProductService(id, patch);
    if (error) { get().showToast("❌ Error al guardar: " + error.message, "error"); return; }
    set(state => ({ products: state.products.map(x => x.id === id ? { ...x, ...patch } : x) }));
    get().showToast("✓ Cambios guardados");
  },

  deleteProduct: async id => {
    const { error } = await deleteProductService(id);
    if (error) { get().showToast("❌ Error eliminando producto", "error"); return; }
    set(state => ({ products: state.products.filter(x => x.id !== id) }));
    get().showToast("Producto eliminado", "warn");
  },

  // ─── CRUD categorías ────────────────────────────────────────────────────
  addCat: async c => {
    const { error } = await insertCategory(get().ownerId, c);
    if (error) { get().showToast("❌ Error: " + error.message, "error"); return; }
    set(state => ({ cats: [...state.cats, c] }));
    get().showToast("✓ Categoría creada");
  },

  updateCat: async (id, patch) => {
    const { error } = await updateCategoryService(id, patch);
    if (error) { get().showToast("❌ Error al guardar: " + error.message, "error"); return; }
    set(state => ({ cats: state.cats.map(x => x.id === id ? { ...x, ...patch } : x) }));
  },

  deleteCat: async id => {
    const { error } = await deleteCategoryService(id);
    if (error) { get().showToast("❌ Error eliminando categoría", "error"); return; }
    set(state => ({ cats: state.cats.filter(x => x.id !== id) }));
    get().showToast("Categoría eliminada", "warn");
  },

  // ─── Pedidos ─────────────────────────────────────────────────────────────
  addOrder: async o => {
    const ownerId = get().ownerId;
    if (ownerId) {
      const { error } = await insertOrder(ownerId, o);
      if (error) { get().showToast("❌ Error guardando pedido", "error"); return; }
      // Actualizar estado local inmediatamente — el evento Realtime/broadcast
      // hará dedup si llega después (el _handleIncomingOrder lo ignora).
      set(state => ({ orders: [o, ...state.orders] }));
      get().showToast("🔔 Nuevo pedido recibido");
    } else {
      // Modo offline/demo
      set(state => ({ orders: [o, ...state.orders] }));
      get().showToast("🔔 Nuevo pedido recibido");
    }
  },

  moveOrder: async (id, status, businessType = "restaurant") => {
    const { error } = await updateOrderStatus(id, status);
    if (error) { get().showToast("❌ Error moviendo pedido", "error"); return; }

    set(state => ({ orders: state.orders.map(o => o.id === id ? { ...o, status } : o) }));

    // Notificar al cliente en tiempo real — canal específico del pedido
    broadcastSend(`order:${id}`, "order_update", { status });

    const labels = getVertical(businessType).labels;
    const statusLabels = {
      pendiente:  "Pendiente",
      en_cocina:  labels.status_processing,
      listo:      labels.status_ready,
      en_camino:  labels.status_shipping,
      entregado:  labels.status_done,
    };
    get().showToast(`→ ${statusLabels[status] || status}`);
  },

  // ─── Reservas ────────────────────────────────────────────────────────────
  addReservation: async r => {
    const ownerId = get().ownerId;
    if (!ownerId) return;
    const { error } = await insertReservation(ownerId, r);
    if (error) { get().showToast("❌ Error guardando reserva", "error"); return; }
    set(state => ({ reservations: [r, ...state.reservations] }));
    get().showToast("✓ Reserva creada");
  },

  moveReservation: async (id, status) => {
    const { error } = await updateReservationStatusService(id, status);
    if (error) { get().showToast("❌ Error actualizando reserva", "error"); return; }
    set(state => ({ reservations: state.reservations.map(r => r.id === id ? { ...r, status } : r) }));
  },

  cancelReservation: async id => {
    const { error } = await updateReservationStatusService(id, "cancelada");
    if (error) { get().showToast("❌ Error cancelando reserva", "error"); return; }
    set(state => ({ reservations: state.reservations.map(r => r.id === id ? { ...r, status: "cancelada" } : r) }));
    get().showToast("Reserva cancelada", "warn");
  },

  // ─── Sucursales ──────────────────────────────────────────────────────────
  updateBranch: async (id, patch) => {
    const updated = get().branches.map(x => x.id === id ? { ...x, ...patch } : x);
    set({ branches: updated });
    const ownerId = get().ownerId;
    if (ownerId) {
      const { error } = await saveBranchesService(ownerId, updated);
      if (error) get().showToast("❌ Error guardando sucursal", "error");
    }
  },

  addBranch: async branch => {
    const updated = [...get().branches, branch];
    set({ branches: updated });
    const ownerId = get().ownerId;
    if (ownerId) {
      const { error } = await saveBranchesService(ownerId, updated);
      if (error) { get().showToast("❌ Error guardando sucursal", "error"); return; }
    }
    get().showToast("✓ Sucursal creada");
  },

  // ─── Configuración / Diseño ──────────────────────────────────────────────
  updateConfig: async config => {
    const { error } = await updateRestaurantConfig(get().ownerId, config);
    if (error) { get().showToast("❌ Error guardando diseño", "error"); return; }
    set({ config });
    get().showToast("✓ Diseño guardado");
  },

  updateBannersAndPopup: async config => {
    const { error } = await updateRestaurantBanners(get().ownerId, config);
    if (error) { get().showToast("❌ Error guardando banners", "error"); return; }
    set({ config });
    get().showToast("✓ Banners y popup guardados");
  },

  // ─── Reset (logout) ──────────────────────────────────────────────────────
  resetAdminStore: () => {
    get().unsubscribeOrders();
    set({
      ownerId:        null,
      products:       [],
      cats:           [],
      config:         INIT_CONFIG,
      billing:        INIT_BILLING,
      orders:         [],
      branches:       [],
      reservations:   [],
      dbLoaded:       false,
      adminLoading:   false,
      toast:          null,
      sidebarOpen:    false,
      _ordersChannel: null,
      _pollInterval:  null,
    });
  },
}));
