/* Customer shop — browse, filter, search, WhatsApp share */
(async function () {
  Util.renderNav("shop");

  const grid = document.querySelector("[data-grid]");
  const toolbar = document.querySelector("[data-toolbar]");

  let products = [];
  let activeCat = new URLSearchParams(location.search).get("cat") || "all";
  let query = "";

  try {
    products = await Store.getProducts();
  } catch (e) {
    grid.innerHTML = `<p class="empty" style="grid-column:1/-1">Could not load products: ${Util.esc(e.message)}</p>`;
    return;
  }

  if (!products.length) {
    toolbar.innerHTML = "";
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
      <div class="big">🧵</div>
      <h3 style="color:var(--maroon-deep)">The collection is being woven</h3>
      <p>No sarees have been listed yet. Please check back soon.</p></div>`;
    return;
  }

  // Build category chips from the products that exist
  const cats = ["all", ...Array.from(new Set(products.map((p) => p.category_name)))];

  function renderToolbar() {
    const chips = cats.map((c) =>
      `<button class="chip ${activeCat === c ? "is-active" : ""}" data-chip="${Util.esc(c)}">${c === "all" ? "All Sarees" : Util.esc(c)}</button>`
    ).join("");
    toolbar.innerHTML = `
      ${chips}
      <div class="search">
        <span>🔍</span>
        <input data-search type="search" placeholder="Search sarees…" value="${Util.esc(query)}" />
      </div>`;

    toolbar.querySelectorAll("[data-chip]").forEach((b) =>
      b.addEventListener("click", () => { activeCat = b.dataset.chip; renderToolbar(); renderGrid(); }));
    const s = toolbar.querySelector("[data-search]");
    s.addEventListener("input", () => { query = s.value; renderGrid(); });
    // keep focus while typing
    if (document.activeElement?.dataset?.search !== undefined) s.focus();
  }

  function renderGrid() {
    let list = products;
    if (activeCat !== "all") list = list.filter((p) => p.category_name === activeCat);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) =>
        (p.name + " " + (p.description || "") + " " + p.category_name).toLowerCase().includes(q));
    }
    if (!list.length) {
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="big">🔎</div><p>No sarees match your search.</p></div>`;
      return;
    }
    grid.innerHTML = list.map(Util.cardHTML).join("");
    Util.wireCards(grid, products);
  }

  // Deep link from a shared "Share" message: ?product=<id>
  const productParam = new URLSearchParams(location.search).get("product");
  if (productParam) activeCat = "all"; // make sure it's visible regardless of category

  renderToolbar();
  renderGrid();

  if (productParam) {
    requestAnimationFrame(() => {
      const card = grid.querySelector(`[data-id="${(window.CSS && CSS.escape) ? CSS.escape(productParam) : productParam}"]`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("card--flash");
        setTimeout(() => card.classList.remove("card--flash"), 2400);
      }
    });
  }
})();
