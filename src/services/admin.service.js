import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseAdmin";
// supabase eliminado — las políticas RLS de staff permiten operar
// directamente con el cliente normal (ver SQL migration en el README).

export function mapCategoryFromDb(c){
  return {
    id: c.id,
    name: c.name,
    icon: c.icon || "🍽️",
    iconType: c.icon_type || "emoji",
    iconImg: c.icon_img || "",
    active: c.active !== false,
    order: c.sort_order || 0,
    bgImg: c.bg_img || "",
    bgColor: c.bg_color || "",
    textColor: c.text_color || "#ffffff",
    fontStyle: c.font_style || "modern",
    branchIds: c.branch_ids || ["all"],
  };
}

export function mapProductFromDb(p){
  return {
    id: p.id,
    catId: p.cat_id,
    name: p.name,
    price: p.price,
    deliveryPrice: p.delivery_price || null,
    forMenu: p.for_menu !== false,
    forDelivery: p.for_delivery !== false,
    desc: p.description,
    emoji: p.emoji,
    img: p.img,
    active: p.active,
    featured: p.featured,
    stock: p.in_stock,
    label: p.label,
    labelColor: p.label_color,
    allergens: p.allergens || [],
    clicks: p.clicks || 0,
    branchIds: p.branch_ids || ["all"],
  };
}

export function mapConfigFromDb(d){
  return {
    name: d.name,
    tagline: d.tagline,
    logo: d.logo,
    primaryColor: d.primary_color,
    menuStyle: d.menu_style,
    menuFont: d.menu_font,
    city: d.city,
    address: d.address,
    phone: d.phone,
    whatsapp: d.whatsapp,
    schedule: d.schedule,
    coverImg: d.cover_img || "",
    bgImg: d.bg_img || "",
    openStatus: d.open_status,
    deliveryFee: d.delivery_fee,
    showAllergens: d.show_allergens,
    banners: d.banners || [],
    promoPopup: d.promo_popup || null,
    socialLinks: d.social_links || {},
    branches: d.branches || [],   // ← loaded per-user; empty for new businesses
  };
}

export function mapOrderFromDb(o){
  return {
    id: o.id,
    createdAt: o.created_at,
    status: o.status,
    mode: o.mode,
    time: o.time,
    date: o.date,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email,
    address: o.address,
    addressRef: o.address_ref,
    table: o.table_num,
    notes: o.notes,
    payment: o.payment,
    items: o.items || [],
    subtotal: o.subtotal,
    delivery: o.delivery,
    total: o.total,
    branchId: o.branch_id || null,   // ← sucursal donde se originó el pedido
  };
}

const MRR_MAP = { pro: 99900, business: 189900, starter: 49900, enterprise: 299900 };

function buildBillingFromProfile(prof) {
  if (!prof) return null;
  // CEO suspende via billing_plan="suspended_<plan>" para no tocar subscription_expires_at
  const rawPlan = prof.billing_plan || "pro";
  const isManuallySuspended = rawPlan.startsWith("suspended_");
  const plan = isManuallySuspended ? (rawPlan.replace("suspended_", "") || "pro") : rawPlan;
  const expiry = prof.subscription_expires_at ? new Date(prof.subscription_expires_at) : null;
  const now = new Date();
  const daysLeft = expiry ? Math.max(0, Math.round((expiry - now) / (1000 * 60 * 60 * 24))) : null;
  const status = isManuallySuspended
    ? "suspended"
    : (!expiry ? "trial" : (daysLeft <= 0 ? "suspended" : "active"));
  return {
    plan,
    status,
    daysLeft,
    nextPayment: expiry ? expiry.toISOString().slice(0, 10) : null,
    amount: MRR_MAP[plan] || 99900,
  };
}

export async function loadAdminData(userId){
  const [cr, pr, cfr, or, profR] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", userId).order("sort_order"),
    supabase.from("products").select("*").eq("user_id", userId),
    supabase.from("restaurant_config").select("*").eq("user_id", userId).single(),
    supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("profiles").select("billing_plan,subscription_expires_at").eq("id", userId).single(),
  ]);

  return {
    cats: cr.data?.length ? cr.data.map(mapCategoryFromDb) : [],
    products: pr.data?.length ? pr.data.map(mapProductFromDb) : [],
    config: cfr.data ? mapConfigFromDb(cfr.data) : null,
    orders: or.data?.length ? or.data.map(mapOrderFromDb) : [],
    billing: buildBillingFromProfile(profR.data),
    errors: [cr.error, pr.error, cfr.error, or.error, profR.error].filter(Boolean),
  };
}

export async function insertProduct(userId, p){
  return supabase.from("products").insert({
    id: p.id,
    user_id: userId,
    cat_id: p.catId,
    name: p.name,
    price: p.price,
    delivery_price: p.deliveryPrice || null,
    for_menu: p.forMenu !== false,
    for_delivery: p.forDelivery !== false,
    description: p.desc,
    emoji: p.emoji,
    img: p.img,
    active: p.active,
    featured: p.featured,
    in_stock: p.stock,
    label: p.label,
    label_color: p.labelColor,
    allergens: p.allergens,
    clicks: 0,
    branch_ids: p.branchIds || ["all"],
  });
}

export function productPatchToDb(patch){
  const db = {};
  if(patch.catId !== undefined) db.cat_id = patch.catId;
  if(patch.name !== undefined) db.name = patch.name;
  if(patch.price !== undefined) db.price = patch.price;
  if(patch.desc !== undefined) db.description = patch.desc;
  if(patch.emoji !== undefined) db.emoji = patch.emoji;
  if(patch.img !== undefined) db.img = patch.img;
  if(patch.active !== undefined) db.active = patch.active;
  if(patch.featured !== undefined) db.featured = patch.featured;
  if(patch.stock !== undefined) db.in_stock = patch.stock;
  if(patch.label !== undefined) db.label = patch.label;
  if(patch.labelColor !== undefined) db.label_color = patch.labelColor;
  if(patch.allergens !== undefined) db.allergens = patch.allergens;
  if(patch.deliveryPrice !== undefined) db.delivery_price = patch.deliveryPrice;
  if(patch.forMenu !== undefined) db.for_menu = patch.forMenu;
  if(patch.forDelivery !== undefined) db.for_delivery = patch.forDelivery;
  if(patch.branchIds !== undefined) db.branch_ids = patch.branchIds;
  return db;
}

export async function updateProduct(id, patch){
  const db = productPatchToDb(patch);
  if(!Object.keys(db).length) return { error: null };
  return supabase.from("products").update(db).eq("id", id);
}

export async function deleteProduct(id){
  return supabase.from("products").delete().eq("id", id);
}

export async function insertCategory(userId, c){
  return supabase.from("categories").insert({
    id: c.id,
    user_id: userId,
    name: c.name,
    icon: c.icon,
    icon_type: c.iconType || "emoji",
    icon_img: c.iconImg || null,
    active: c.active,
    sort_order: c.order,
    bg_img: c.bgImg || null,
    bg_color: c.bgColor || null,
    text_color: c.textColor || "#ffffff",
    font_style: c.fontStyle || "modern",
    branch_ids: c.branchIds || ["all"],
  });
}

export function categoryPatchToDb(patch){
  const db = {};
  if(patch.name !== undefined) db.name = patch.name;
  if(patch.icon !== undefined) db.icon = patch.icon;
  if(patch.active !== undefined) db.active = patch.active;
  if(patch.order !== undefined) db.sort_order = patch.order;
  if(patch.iconType !== undefined) db.icon_type = patch.iconType;
  if(patch.iconImg !== undefined) db.icon_img = patch.iconImg || null;
  if(patch.bgImg !== undefined) db.bg_img = patch.bgImg || null;
  if(patch.bgColor !== undefined) db.bg_color = patch.bgColor || null;
  if(patch.textColor !== undefined) db.text_color = patch.textColor;
  if(patch.fontStyle !== undefined) db.font_style = patch.fontStyle;
  if(patch.branchIds !== undefined) db.branch_ids = patch.branchIds;
  return db;
}

export async function updateCategory(id, patch){
  const db = categoryPatchToDb(patch);
  if(!Object.keys(db).length) return { error: null };
  return supabase.from("categories").update(db).eq("id", id);
}

export async function deleteCategory(id){
  return supabase.from("categories").delete().eq("id", id);
}

export async function insertOrder(userId, o){
  return supabase.from("orders").insert({
    id: o.id,
    user_id: userId,
    branch_id: o.branchId || null,
    status: o.status,
    mode: o.mode,
    created_at: typeof o.createdAt === "number" ? o.createdAt : (o.createdAt ? new Date(o.createdAt).getTime() : Date.now()),
    time: o.time,
    date: o.date,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    customer_email: o.customerEmail,
    address: o.address,
    address_ref: o.addressRef,
    table_num: o.table,
    notes: o.notes,
    payment: o.payment,
    items: o.items,
    subtotal: o.subtotal,
    delivery: o.delivery,
    total: o.total,
  });
}

/**
 * Carga datos del negocio con el JWT del staff.
 * Funciona gracias a las políticas RLS "owner_or_staff" (ver SQL migration).
 */
export async function loadAdminDataBypass(ownerId){
  const [cr, pr, cfr, or, profR] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", ownerId).order("sort_order"),
    supabase.from("products").select("*").eq("user_id", ownerId),
    supabase.from("restaurant_config").select("*").eq("user_id", ownerId).single(),
    supabase.from("orders").select("*").eq("user_id", ownerId).order("created_at", { ascending: false }),
    supabase.from("profiles").select("billing_plan,subscription_expires_at").eq("id", ownerId).single(),
  ]);

  return {
    cats:     cr.data?.length ? cr.data.map(mapCategoryFromDb) : [],
    products: pr.data?.length ? pr.data.map(mapProductFromDb)  : [],
    config:   cfr.data ? mapConfigFromDb(cfr.data) : null,
    orders:   or.data?.length ? or.data.map(mapOrderFromDb)    : [],
    billing:  null,  // staff no necesita info de facturación
    errors:   [cr.error, pr.error, cfr.error, or.error, profR.error].filter(Boolean),
  };
}

export async function updateOrderStatus(id, status){
  return supabase.from("orders").update({ status }).eq("id", id);
}

export async function updateRestaurantConfig(userId, c){
  return supabase.from("restaurant_config").upsert({
    user_id: userId,
    name: c.name,
    tagline: c.tagline,
    logo: c.logo,
    primary_color: c.primaryColor,
    menu_style: c.menuStyle,
    menu_font: c.menuFont,
    city: c.city,
    address: c.address,
    phone: c.phone,
    whatsapp: c.whatsapp,
    schedule: c.schedule,
    cover_img: c.coverImg,
    bg_img: c.bgImg ?? null,
    open_status: c.openStatus,
    delivery_fee: c.deliveryFee,
    show_allergens: c.showAllergens,
    banners: c.banners || [],
    promo_popup: c.promoPopup ?? null,
    social_links: c.socialLinks || {},
  }, { onConflict: "user_id" });
}

export async function updateRestaurantBanners(userId, c){
  return supabase.from("restaurant_config").upsert({
    user_id: userId,
    banners: c.banners || [],
    promo_popup: c.promoPopup || null,
  }, { onConflict: "user_id" });
}

export async function saveBranches(userId, branches){
  return supabase.from("restaurant_config").upsert(
    { user_id: userId, branches: branches || [] },
    { onConflict: "user_id" }
  );
}

// ── Soporte: tickets que el admin envía ─────────────────────────────────────

export async function submitSupportTicket(userId, restaurantName, form) {
  const now = new Date().toISOString();
  return supabase.from("support_tickets").insert({
    id:         form.id,
    owner_id:   userId,
    restaurant: restaurantName || "Mi negocio",
    user_name:  form.userName || "",
    subject:    form.subject,
    priority:   form.priority || "medium",
    status:     "open",
    messages:   [{ from: form.userName || "Admin", text: form.message, time: now }],
    created_at: now,
  });
}

/**
 * Carga los precios actuales de planes desde platform_config.
 * Usa supabaseAdmin porque el usuario admin no tiene acceso RLS a esta tabla.
 */
export async function loadPlatformPrices() {
  try {
    const { data } = await supabaseAdmin
      .from("platform_config")
      .select("starter_price,pro_price,business_price")
      .eq("id", 1)
      .single();
    return data || {};
  } catch {
    return {};
  }
}

export async function loadMyTickets(userId) {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("id,subject,status,priority,messages,created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  return { data: data || [], error };
}
