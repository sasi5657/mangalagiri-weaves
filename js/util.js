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

    // Absolute link to this exact saree's page on the website
    productUrl(product) {
      try {
        return new URL(`shop.html?product=${encodeURIComponent(product.id)}`, location.href).href;
      } catch { return location.href; }
    },

    // SHARE button -> goes to the shop OWNER only, with the website link
    shareProduct(product) {
      const link = Util.productUrl(product);
      const text = encodeURIComponent(
        `Hello ${cfg.brandName}, I'm interested in *${product.name}* ` +
        `(${cfg.currency}${Number(product.price).toLocaleString("en-IN")}).\n${link}`
      );
      window.open(`https://wa.me/${cfg.whatsappNumber}?text=${text}`, "_blank");
    },

    // MESSAGE button -> let the customer forward this saree to friends & family
    forwardToFriends(product) {
      const link = Util.productUrl(product);
      const lines = [
        `*${product.name}*`,
        `${cfg.currency}${Number(product.price).toLocaleString("en-IN")}`,
        product.description ? `\n${product.description}` : "",
        `\nFrom *${cfg.brandName}*`,
        `🔗 ${link}`,
        `📲 Order on WhatsApp: https://wa.me/${cfg.whatsappNumber}`,
      ].filter(Boolean);
      const text = encodeURIComponent(lines.join("\n"));
      // Native share sheet first (mobile lets them pick any contact), else WhatsApp picker
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        navigator.share({ title: product.name, text: lines.join("\n"), url: link })
          .catch(() => window.open(`https://wa.me/?text=${text}`, "_blank"));
      } else {
        window.open(`https://wa.me/?text=${text}`, "_blank");
      }
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
        <article class="card" data-id="${p.id}">
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
              <button class="btn btn--wa" data-share="${p.id}" title="Share with the shop on WhatsApp">Share</button>
              <button class="icon-btn" data-forward="${p.id}" title="Send to friends &amp; family">📤</button>
            </div>
          </div>
        </article>`;
    },

    // Wire Share / Enquire buttons within a container -----------------
    wireCards(host, products) {
      const byId = Object.fromEntries(products.map((p) => [String(p.id), p]));
      host.querySelectorAll("[data-share]").forEach((b) =>
        b.addEventListener("click", () => Util.shareProduct(byId[b.dataset.share])));
      host.querySelectorAll("[data-forward]").forEach((b) =>
        b.addEventListener("click", () => Util.forwardToFriends(byId[b.dataset.forward])));
    },
  };

  window.Util = Util;
})();
