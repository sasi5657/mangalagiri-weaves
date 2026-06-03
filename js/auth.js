/* Authentication page — OWNER ONLY.
   Customers do not log in; they browse freely and receive links the owner
   shares to WhatsApp. This page only lets the single owner account in. */
(async function () {
  Util.renderNav();

  // Already signed in as owner? Go straight to the dashboard.
  const existing = await Store.getUser();
  if (existing && Store.isOwner(existing)) {
    location.href = "owner.html";
    return;
  }
  // Signed in as someone else (legacy/customer session) — clear it.
  if (existing) await Store.signOut();

  let mode = "signin"; // or "signup"

  const els = {
    form: document.querySelector("[data-auth-form]"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    submit: document.querySelector("[data-submit]"),
    formTitle: document.querySelector("[data-form-title]"),
    formSub: document.querySelector("[data-form-sub]"),
    switchText: document.querySelector("[data-switch-text]"),
    switchBtn: document.querySelector("[data-switch]"),
    hint: document.querySelector("[data-hint]"),
  };

  function render() {
    els.formTitle.textContent = mode === "signin" ? "Owner Sign In" : "Create Owner Account";
    els.formSub.textContent = mode === "signin"
      ? "Access your store dashboard."
      : "Set the password for your owner account.";
    els.submit.textContent = mode === "signin" ? "Sign In" : "Create Account";
    els.password.autocomplete = mode === "signin" ? "current-password" : "new-password";
    els.switchText.textContent = mode === "signin" ? "First time?" : "Already set up?";
    els.switchBtn.textContent = mode === "signin" ? "Create the owner account" : "Sign in instead";

    if (!els.email.value) els.email.value = APP_CONFIG.ownerEmail;

    els.hint.innerHTML = `<b>Owner account:</b> ${Util.esc(APP_CONFIG.ownerEmail)}. ` +
      (Store.mode === "demo"
        ? "First time? Choose <b>Create the owner account</b> to set your password (saved in this browser)."
        : "Only this email can manage products.");
  }

  els.switchBtn.addEventListener("click", () => {
    mode = mode === "signin" ? "signup" : "signin";
    render();
  });

  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = els.email.value.trim();
    const password = els.password.value;

    // Owner login is restricted to the configured owner email.
    if (email.toLowerCase() !== APP_CONFIG.ownerEmail.toLowerCase()) {
      Util.toast(`Owner access is restricted to ${APP_CONFIG.ownerEmail}`, "err");
      return;
    }

    els.submit.disabled = true;
    els.submit.textContent = "Please wait…";
    try {
      const user = mode === "signup"
        ? await Store.signUp(email, password)
        : await Store.signIn(email, password);

      // Cloud sign-up may require email confirmation (no session yet)
      if (!user && Store.mode === "cloud") {
        Util.toast("Account created. Check your email to confirm, then sign in.", "ok");
        mode = "signin"; render();
        return;
      }
      Util.toast("Welcome back ✦", "ok");
      setTimeout(() => { location.href = "owner.html"; }, 600);
    } catch (err) {
      Util.toast(err.message || "Something went wrong.", "err");
    } finally {
      els.submit.disabled = false;
      render();
    }
  });

  render();
})();
