# THE MANGALAGIRI WEAVES

A luxury saree storefront — landing page, owner product management, and a
customer collection with one-tap **WhatsApp sharing**. Pure HTML / CSS / JS,
no build step. Works instantly in **demo mode**, upgrades to a **shared cloud**
catalogue with Supabase.

## ✨ What's inside
| Page | File | Who | Does |
|------|------|-----|------|
| Landing | `index.html` | Everyone | Hero, categories, featured sarees, story |
| Collection | `shop.html` | Customers | Browse, filter, search, **Share on WhatsApp**, enquire |
| Owner login | `login.html` | Owner only | Single restricted owner account (no customer login) |
| Dashboard | `owner.html` | Owner only | Add/edit/delete sarees, set **prices**, manage **categories**, upload photos |

## ▶️ Run it now (demo mode)
Because browsers block some features on `file://`, run a tiny local server:

```powershell
# from this folder (PowerShell)
python -m http.server 5500
```
Then open **http://localhost:5500/index.html**.

> No Python? Any static server works — e.g. the VS Code **Live Server**
> extension (right-click `index.html` → *Open with Live Server*).

### Try the owner flow
1. **Sign in → Owner tab → Create an account** using the email shown
   (`owner@mangalagiri.com`) and any password (6+ chars).
2. Add a category, then add a saree with a photo and price.
3. Open **Collection** — your saree appears with a **Share** button.

In demo mode everything is saved in **your browser only**. To make the
catalogue shared across all devices, follow **`SUPABASE_SETUP.md`** (≈5 min).

## ⚙️ Configure
Everything you'd normally change lives in **`js/config.js`**:
- `whatsappNumber` — your business WhatsApp (international format, no `+`)
- `ownerEmail` — the single account allowed to manage products
- `supabaseUrl` / `supabaseAnonKey` — leave blank for demo, fill to go live

## 🔐 How access works
- **Owner only** logs in — with `ownerEmail`. Only then can they reach the
  dashboard and write products. In the cloud this is enforced by Supabase
  Row-Level Security (see `supabase_schema.sql`), not just the UI.
- **Customers have no account.** They browse the collection freely, and the
  owner shares product links to them directly via **WhatsApp** (the **Share**
  button on each saree). Customers can also enquire with one tap — no login.

## 📁 Structure
```
index.html        landing page
shop.html         customer collection
login.html        owner + customer auth
owner.html        owner dashboard
css/styles.css    luxury design system (maroon / antique gold / ivory)
js/config.js      ← edit this
js/store.js       data layer (Supabase ⇄ localStorage)
js/util.js        formatting, toasts, WhatsApp share, navbar, cards
js/auth.js        login/signup logic
js/owner.js       dashboard logic
js/shop.js        collection + filters
js/landing.js     featured products
supabase_schema.sql   run once in Supabase
SUPABASE_SETUP.md     step-by-step go-live guide
```

## 🚀 Deploy (free)
Drag this folder onto **https://app.netlify.com/drop**, or connect the repo to
Vercel / GitHub Pages. It's fully static.
