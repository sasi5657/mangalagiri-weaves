/* Landing page: nav, featured products, footer wiring */
(async function () {
  Util.renderNav("home");

  // footer dynamic bits
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = "2026";
  const wa = document.querySelector("[data-wa-link]");
  if (wa) wa.href = `https://wa.me/${APP_CONFIG.whatsappNumber}`;

  // Featured = newest 4 products
  const host = document.querySelector("[data-featured]");
  try {
    const products = await Store.getProducts();
    if (!products.length) {
      host.innerHTML = `<div class="empty" style="grid-column:1/-1">
        <div class="big">🧵</div>
        <p>No sarees yet. The owner can add them from the dashboard.</p></div>`;
      return;
    }
    host.innerHTML = products.slice(0, 4).map(Util.cardHTML).join("");
    Util.wireCards(host, products);
  } catch (e) {
    host.innerHTML = `<p class="empty" style="grid-column:1/-1">Could not load products: ${Util.esc(e.message)}</p>`;
  }
})();
