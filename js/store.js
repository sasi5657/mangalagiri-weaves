/* =====================================================================
   Data layer for THE MANGALAGIRI WEAVES
   ---------------------------------------------------------------------
   One clean API used by every page. It automatically uses:
     • Supabase  (shared cloud)  — when keys are set in config.js
     • localStorage (demo mode)  — when keys are blank
   So the site works instantly, and "just works" once you go cloud.
   ===================================================================== */

(function () {
  const cfg = window.APP_CONFIG;
  const CLOUD = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);

  // ---- tiny helpers -------------------------------------------------
  const uid = () =>
    "id-" + Math.random().toString(36).slice(2, 10) + "-" + (window.performance?.now?.() | 0);
  const read = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // =====================================================================
  // CLOUD (Supabase) implementation
  // =====================================================================
  let sb = null;
  if (CLOUD) {
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }

  const cloud = {
    isCloud: () => true,

    async getUser() {
      const { data } = await sb.auth.getUser();
      return data?.user ? { id: data.user.id, email: data.user.email } : null;
    },
    async signUp(email, password) {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      return data.user ? { id: data.user.id, email: data.user.email } : null;
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      return { id: data.user.id, email: data.user.email };
    },
    async signOut() { await sb.auth.signOut(); },

    async getCategories() {
      const { data, error } = await sb.from("categories").select("*").order("name");
      if (error) throw new Error(error.message);
      return data;
    },
    async addCategory(name) {
      const { data, error } = await sb.from("categories").insert({ name }).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    async deleteCategory(id) {
      const { error } = await sb.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },

    async getProducts() {
      const { data, error } = await sb
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data.map((p) => ({ ...p, category_name: p.categories?.name || "Uncategorised" }));
    },
    async addProduct(p) {
      const { data, error } = await sb.from("products").insert(p).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    async updateProduct(id, fields) {
      const { error } = await sb.from("products").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
    },
    async deleteProduct(id) {
      const { error } = await sb.from("products").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },

    async uploadImage(file) {
      const path = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error } = await sb.storage.from(cfg.storageBucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw new Error(error.message);
      const { data } = sb.storage.from(cfg.storageBucket).getPublicUrl(path);
      return data.publicUrl;
    },
  };

  // =====================================================================
  // DEMO (localStorage) implementation
  // =====================================================================
  const K = { users: "mw_users", session: "mw_session", cats: "mw_cats", prods: "mw_prods" };

  function seedDemo() {
    if (read(K.cats, null)) return;
    const cats = [
      { id: uid(), name: "Pure Cotton" },
      { id: uid(), name: "Silk Cotton" },
      { id: uid(), name: "Pattu (Silk)" },
      { id: uid(), name: "Bridal Collection" },
    ];
    const img = (q) =>
      `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;
    const prods = [
      { id: uid(), name: "Royal Maroon Zari Saree", description: "Handwoven Mangalagiri cotton with a temple gold border.", price: 2499, category_id: cats[0].id, image_url: img("photo-1610030469983-98e550d6193c"), in_stock: true, created_at: new Date(2026, 4, 1).toISOString() },
      { id: uid(), name: "Emerald Silk Cotton", description: "Lustrous silk-cotton blend with contrast gold pallu.", price: 3799, category_id: cats[1].id, image_url: img("photo-1583391733956-6c78276477e2"), in_stock: true, created_at: new Date(2026, 4, 2).toISOString() },
      { id: uid(), name: "Ivory Bridal Pattu", description: "Pure silk bridal saree with rich zari work.", price: 8999, category_id: cats[3].id, image_url: img("photo-1617627143750-d86bc21e42bb"), in_stock: true, created_at: new Date(2026, 4, 3).toISOString() },
    ];
    write(K.cats, cats);
    write(K.prods, prods);
  }
  seedDemo();

  const delay = (v) => new Promise((r) => setTimeout(() => r(v), 120)); // feel async

  const demo = {
    isCloud: () => false,

    async getUser() { return read(K.session, null); },
    async signUp(email, password) {
      email = email.trim().toLowerCase();
      const users = read(K.users, {});
      if (users[email]) throw new Error("An account with this email already exists. Please sign in.");
      users[email] = { id: uid(), email, password };
      write(K.users, users);
      const user = { id: users[email].id, email };
      write(K.session, user);
      return delay(user);
    },
    async signIn(email, password) {
      email = email.trim().toLowerCase();
      const users = read(K.users, {});
      const u = users[email];
      if (!u || u.password !== password) throw new Error("Invalid email or password.");
      const user = { id: u.id, email };
      write(K.session, user);
      return delay(user);
    },
    async signOut() { localStorage.removeItem(K.session); return delay(); },

    async getCategories() { return delay(read(K.cats, [])); },
    async addCategory(name) {
      const cats = read(K.cats, []);
      if (cats.some((c) => c.name.toLowerCase() === name.toLowerCase()))
        throw new Error("That category already exists.");
      const cat = { id: uid(), name };
      cats.push(cat); write(K.cats, cats);
      return delay(cat);
    },
    async deleteCategory(id) {
      write(K.cats, read(K.cats, []).filter((c) => c.id !== id));
      return delay();
    },

    async getProducts() {
      const cats = read(K.cats, []);
      const map = Object.fromEntries(cats.map((c) => [c.id, c.name]));
      const prods = read(K.prods, [])
        .map((p) => ({ ...p, category_name: map[p.category_id] || "Uncategorised" }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return delay(prods);
    },
    async addProduct(p) {
      const prods = read(K.prods, []);
      const prod = { id: uid(), created_at: new Date().toISOString(), ...p };
      prods.unshift(prod); write(K.prods, prods);
      return delay(prod);
    },
    async updateProduct(id, fields) {
      const prods = read(K.prods, []).map((p) => (p.id === id ? { ...p, ...fields } : p));
      write(K.prods, prods);
      return delay();
    },
    async deleteProduct(id) {
      write(K.prods, read(K.prods, []).filter((p) => p.id !== id));
      return delay();
    },

    async uploadImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // data URL stored inline
        reader.onerror = () => reject(new Error("Could not read image file."));
        reader.readAsDataURL(file);
      });
    },
  };

  // =====================================================================
  // Public API
  // =====================================================================
  const impl = CLOUD ? cloud : demo;

  window.Store = Object.assign({}, impl, {
    mode: CLOUD ? "cloud" : "demo",
    isOwner(user) {
      return Boolean(user && user.email &&
        user.email.toLowerCase() === cfg.ownerEmail.toLowerCase());
    },
  });
})();
