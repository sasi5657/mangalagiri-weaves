/* Owner dashboard — gate access, manage categories & products */
(async function () {
  Util.renderNav("owner");

  const user = await Store.getUser();
  const gate = document.querySelector("[data-gate]");
  const blocked = document.querySelector("[data-blocked]");

  if (!Store.isOwner(user)) {
    blocked.hidden = false;
    return;
  }
  gate.hidden = false;

  // ----- element refs -----
  const el = {
    drop: document.querySelector("[data-drop]"),
    dropText: document.querySelector("[data-drop-text]"),
    image: document.querySelector("[data-image]"),
    name: document.querySelector("[data-name]"),
    desc: document.querySelector("[data-desc]"),
    price: document.querySelector("[data-price]"),
    cat: document.querySelector("[data-cat]"),
    instock: document.querySelector("[data-instock]"),
    save: document.querySelector("[data-save]"),
    productForm: document.querySelector("[data-product-form]"),
    catForm: document.querySelector("[data-cat-form]"),
    catName: document.querySelector("[data-cat-name]"),
    catList: document.querySelector("[data-cat-list]"),
    adminList: document.querySelector("[data-admin-list]"),
    statProducts: document.querySelector("[data-stat-products]"),
    statCats: document.querySelector("[data-stat-cats]"),
    statStock: document.querySelector("[data-stat-stock]"),
  };

  let categories = [];
  let products = [];
  let pendingImage = null; // uploaded URL / dataURL for the new product

  // ----- image upload -----
  el.image.addEventListener("change", async () => {
    const file = el.image.files[0];
    if (!file) return;
    el.dropText.textContent = "Uploading…";
    try {
      pendingImage = await Store.uploadImage(file);
      el.drop.classList.add("has-img");
      el.drop.innerHTML = `<img src="${Util.esc(pendingImage)}" alt="preview" />`;
    } catch (e) {
      Util.toast(e.message, "err");
      el.dropText.textContent = "📷 Click to upload a saree photo";
    }
  });

  // ----- categories -----
  function renderCats() {
    el.cat.innerHTML = categories.length
      ? categories.map((c) => `<option value="${c.id}">${Util.esc(c.name)}</option>`).join("")
      : `<option value="">— add a category first —</option>`;

    el.catList.innerHTML = categories.length
      ? categories.map((c) =>
          `<span class="tag">${Util.esc(c.name)}<button data-del-cat="${c.id}" title="Delete">×</button></span>`).join("")
      : `<span class="muted" style="font-size:13px">No categories yet.</span>`;

    el.catList.querySelectorAll("[data-del-cat]").forEach((b) =>
      b.addEventListener("click", () => deleteCategory(b.dataset.delCat)));
    el.statCats.textContent = categories.length;
  }

  el.catForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = el.catName.value.trim();
    if (!name) return;
    try {
      await Store.addCategory(name);
      el.catName.value = "";
      categories = await Store.getCategories();
      renderCats();
      Util.toast(`Category “${name}” added`, "ok");
    } catch (err) { Util.toast(err.message, "err"); }
  });

  async function deleteCategory(id) {
    const inUse = products.some((p) => p.category_id === id);
    if (inUse && !confirm("Some sarees use this category. Delete it anyway? Those sarees will become uncategorised.")) return;
    try {
      await Store.deleteCategory(id);
      categories = await Store.getCategories();
      renderCats();
      Util.toast("Category removed", "ok");
    } catch (err) { Util.toast(err.message, "err"); }
  }

  // ----- products -----
  function renderProducts() {
    el.statProducts.textContent = products.length;
    el.statStock.textContent = products.filter((p) => p.in_stock !== false).length;

    if (!products.length) {
      el.adminList.innerHTML = `<div class="empty"><div class="big">🧵</div><p>No sarees yet. Add your first above.</p></div>`;
      return;
    }
    el.adminList.innerHTML = products.map((p) => {
      const img = p.image_url || "https://via.placeholder.com/120x150?text=Saree";
      return `<div class="admin-item">
        <img src="${Util.esc(img)}" alt="" />
        <div class="admin-item__info">
          <h4>${Util.esc(p.name)}</h4>
          <span class="price">${Util.money(p.price)}</span> ·
          <span>${Util.esc(p.category_name)}</span> ·
          <span>${p.in_stock === false ? "Sold out" : "In stock"}</span>
        </div>
        <div class="admin-item__actions">
          <button class="icon-btn" data-edit="${p.id}" title="Edit price">✎</button>
          <button class="icon-btn" data-stock="${p.id}" title="Toggle stock">${p.in_stock === false ? "📦" : "✓"}</button>
          <button class="icon-btn" data-del="${p.id}" title="Delete" style="color:#c0392b">🗑</button>
        </div>
      </div>`;
    }).join("");

    el.adminList.querySelectorAll("[data-edit]").forEach((b) =>
      b.addEventListener("click", () => editProduct(b.dataset.edit)));
    el.adminList.querySelectorAll("[data-stock]").forEach((b) =>
      b.addEventListener("click", () => toggleStock(b.dataset.stock)));
    el.adminList.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => deleteProduct(b.dataset.del)));
  }

  el.productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!categories.length) { Util.toast("Add a category first.", "err"); return; }
    const payload = {
      name: el.name.value.trim(),
      description: el.desc.value.trim(),
      price: Number(el.price.value),
      category_id: el.cat.value,
      image_url: pendingImage || "",
      in_stock: el.instock.checked,
    };
    if (!payload.name || !payload.price) { Util.toast("Name and price are required.", "err"); return; }

    el.save.disabled = true; el.save.textContent = "Saving…";
    try {
      await Store.addProduct(payload);
      products = await Store.getProducts();
      renderProducts();
      el.productForm.reset();
      el.instock.checked = true;
      pendingImage = null;
      el.drop.classList.remove("has-img");
      el.drop.innerHTML = `<span data-drop-text>📷 Click to upload a saree photo</span><input type="file" accept="image/*" hidden data-image />`;
      // re-bind the freshly created input
      rebindDrop();
      renderCats();
      Util.toast("Saree added to your collection ✦", "ok");
    } catch (err) { Util.toast(err.message, "err"); }
    finally { el.save.disabled = false; el.save.textContent = "Add Saree"; }
  });

  function rebindDrop() {
    el.image = document.querySelector("[data-image]");
    el.dropText = document.querySelector("[data-drop-text]");
    el.image.addEventListener("change", async () => {
      const file = el.image.files[0];
      if (!file) return;
      el.dropText.textContent = "Uploading…";
      try {
        pendingImage = await Store.uploadImage(file);
        el.drop.classList.add("has-img");
        el.drop.innerHTML = `<img src="${Util.esc(pendingImage)}" alt="preview" />`;
      } catch (e) { Util.toast(e.message, "err"); el.dropText.textContent = "📷 Click to upload a saree photo"; }
    });
  }

  async function editProduct(id) {
    const p = products.find((x) => x.id === id);
    const next = prompt(`New price for “${p.name}” (₹):`, p.price);
    if (next === null) return;
    const price = Number(next);
    if (!price || price < 0) { Util.toast("Enter a valid price.", "err"); return; }
    try {
      await Store.updateProduct(id, { price });
      products = await Store.getProducts();
      renderProducts();
      Util.toast("Price updated", "ok");
    } catch (err) { Util.toast(err.message, "err"); }
  }

  async function toggleStock(id) {
    const p = products.find((x) => x.id === id);
    try {
      await Store.updateProduct(id, { in_stock: p.in_stock === false });
      products = await Store.getProducts();
      renderProducts();
    } catch (err) { Util.toast(err.message, "err"); }
  }

  async function deleteProduct(id) {
    const p = products.find((x) => x.id === id);
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    try {
      await Store.deleteProduct(id);
      products = await Store.getProducts();
      renderProducts();
      Util.toast("Saree removed", "ok");
    } catch (err) { Util.toast(err.message, "err"); }
  }

  // ----- initial load -----
  try {
    [categories, products] = await Promise.all([Store.getCategories(), Store.getProducts()]);
    renderCats();
    renderProducts();
  } catch (err) {
    Util.toast("Could not load data: " + err.message, "err");
  }
})();
