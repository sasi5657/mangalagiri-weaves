/* Shared UI utilities: formatting, toasts, WhatsApp share, navbar */
(function () {
  const cfg = window.APP_CONFIG;

  const Util = {
    money(n) {
      const v = Number(n) || 0;
      return cfg.currency + v.toLocaleString("en-IN");
    },

    esc(s) {
      return String(s ?? "").replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },

    // Toast notification ------------------------------------------------
    toast(msg, type = "ok") {
      let host = document.querySelector(".toast-host");
      if (!host) {
        host = document.createElement("div");
        host.className = "toast-host";
        document.body.appendChild(host);
      }
      const el = document.createElement("div");
      el.className = `toast toast--${type}`;
      el.textContent = msg;
      host.appendChild(el);
      requestAnimationFrame(() => el.classList.add("toast--in"));
      setTimeout(() => {
        el.classList.remove("toast--in");
        setTimeout(() => el.remove(), 300);
      }, 3200);
    },

    // WhatsApp share ----------------------------------------------------
    // Opens WhatsApp with a nicely formatted product message.
    shareProduct(product) {
      const lines = [
        `*${product.name}*`,
        `${cfg.currency}${Number(product.price).toLocaleString("en-IN")}`,
        product.description ? `\n${product.description}` : "",
        `\nFrom *${cfg.brandName}*`,
        product.image_url && !String(product.image_url).startsWith("data:")
          ? `\n${product.image_url}` : "",
      ].filter(Boolean);
      const text = encodeURIComponent(lines.join("\n"));

      // Native share sheet first (mobile), else WhatsApp web/app
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        navigator.share({
          title: product.name,
          text: lines.join("\n"),
          url: product.image_url || location.href,
        }).catch(() => window.open(`https://wa.me/?text=${text}`, "_blank"));
      } else {
        window.open(`https://wa.me/?text=${text}`, "_blank");
      }
    },

    // "Enquire" -> message the shop owner directly about a product
    enquire(product) {
      const text = encodeURIComponent(
        `Hello ${cfg.brandName}, I'm interested in *${product.name}* ` +
        `(${cfg.currency}${Number(product.price).toLocaleString("en-IN")}). Is it available?`
      );
      window.open(`https://wa.me/${cfg.whatsappNumber}?text=${text}`, "_blank");
    },

    // Shared navbar -----------------------------------------------------
    async renderNav(active) {
      const user = await window.Store.getUser();
      const isOwner = window.Store.isOwner(user);
      const host = document.querySelector("[data-nav]");
      if (!host) return;

      const link = (href, label, key) =>
        `<a href="${href}" class="nav__link ${active === key ? "is-active" : ""}">${label}</a>`;

      const right = user
        ? `<span class="nav__user" title="${Util.esc(user.email)}">Owner</span>
           <button class="btn btn--ghost btn--sm" data-logout>Sign out</button>`
        : `<a href="login.html" class="nav__owner" title="Store owner login">Owner Login</a>`;

      host.innerHTML = `
        <div class="nav">
          <a class="nav__brand" href="index.html">
            <img class="nav__logo" src="assets/logo.png" alt="${cfg.brandName}" />
            <span class="nav__name">${cfg.brandName}</span>
          </a>
          <nav class="nav__links">
            ${link("index.html", "Home", "home")}
            ${link("shop.html", "Collection", "shop")}
            ${isOwner ? link("owner.html", "Owner", "owner") : ""}
          </nav>
          <div class="nav__actions">
            ${window.Store.mode === "demo" ? '<span class="badge badge--demo" title="Add Supabase keys in js/config.js to go live">Demo mode</span>' : ""}
            ${right}
          </div>
        </div>`;

      const lo = host.querySelector("[data-logout]");
      if (lo) lo.addEventListener("click", async () => {
        await window.Store.signOut();
        location.href = "index.html";
      });
    },

    // Product card markup (shared by landing + shop) -------------------
    cardHTML(p) {
      const img = p.image_url || "https://via.placeholder.com/400x500?text=Saree";
      return `
        <article class="card">
          <div class="card__media">
            <span class="card__tag">${Util.esc(p.category_name)}</span>
            <img src="${Util.esc(img)}" alt="${Util.esc(p.name)}" loading="lazy" />
            ${p.in_stock === false ? '<div class="card__oos">Sold Out</div>' : ""}
          </div>
          <div class="card__body">
            <h3 class="card__name">${Util.esc(p.name)}</h3>
            <p class="card__desc">${Util.esc(p.description || "")}</p>
            <div class="card__row">
              <span class="card__price">${Util.money(p.price)}</span>
            </div>
            <div class="card__actions">
              <button class="btn btn--wa" data-share="${p.id}">Share</button>
              <button class="icon-btn" data-enquire="${p.id}" title="Enquire on WhatsApp">💬</button>
            </div>
          </div>
        </article>`;
    },

    // Wire Share / Enquire buttons within a container -----------------
    wireCards(host, products) {
      const byId = Object.fromEntries(products.map((p) => [String(p.id), p]));
      host.querySelectorAll("[data-share]").forEach((b) =>
        b.addEventListener("click", () => Util.shareProduct(byId[b.dataset.share])));
      host.querySelectorAll("[data-enquire]").forEach((b) =>
        b.addEventListener("click", () => Util.enquire(byId[b.dataset.enquire])));
    },
  };

  window.Util = Util;
})();
