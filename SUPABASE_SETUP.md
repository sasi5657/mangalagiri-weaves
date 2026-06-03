# Going Live — Connect the Shared Cloud (Supabase)

The site already works in **demo mode** (data saved in your browser). Follow
these steps once to make your catalogue **shared** — so every customer, on any
phone or computer, sees the same sarees you add.

Total time: about **5 minutes**. It's free.

---

## 1. Create a free Supabase project
1. Go to **https://supabase.com** → **Start your project** → sign in with Google/GitHub.
2. Click **New project**.
   - **Name:** `mangalagiri-weaves`
   - **Database password:** pick any strong password (you won't need it daily — save it somewhere).
   - **Region:** choose the one closest to you (e.g. *South Asia (Mumbai)*).
3. Wait ~1 minute for it to finish setting up.

## 2. Set your owner email, then create the tables
1. Open **`supabase_schema.sql`** (in this project folder) in any text editor.
2. Find this line near the top and change the email to **your** owner email:
   ```sql
   select 'owner@mangalagiri.com'   -- <<< CHANGE THIS to your owner email
   ```
3. In Supabase, go to the **SQL Editor** (left sidebar) → **New query**.
4. Paste the **entire** contents of `supabase_schema.sql` → click **Run**.
   You should see *Success. No rows returned*. This creates the products,
   categories and image storage with the right security rules.

## 3. Get your keys
1. In Supabase, go to **Project Settings** (gear icon) → **API**.
2. Copy two values:
   - **Project URL** — looks like `https://abcdxyz.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`

## 4. Paste the keys into the site
Open **`js/config.js`** and fill these three lines:
```js
whatsappNumber: "919876543210",          // your WhatsApp number, country code, no '+'
supabaseUrl:    "https://abcdxyz.supabase.co",
supabaseAnonKey:"eyJ...your-anon-key...",
ownerEmail:     "owner@mangalagiri.com", // MUST match the email you set in step 2
```
Save the file. The yellow **"Demo mode"** badge in the top bar will disappear —
you're now on the shared cloud. 🎉

## 5. Create your owner account
1. Open the site → **Sign in** → **Owner** tab → **Create an account**.
2. Use the exact **ownerEmail** and a password (min 6 characters).
3. Supabase sends a confirmation email by default. Click the link, then sign in.
   - *To skip email confirmation while testing:* Supabase → **Authentication →
     Providers → Email** → turn **off** "Confirm email" → Save.

You can now add sarees from the **Owner** dashboard and they'll appear for every
customer instantly.

---

### How customers use it
- Customers **never log in** — only you (the owner) do.
- You open a saree and tap **Share** to send its link to a customer on **WhatsApp**.
- Customers who land on the site can browse the **Collection** freely.
- They tap **💬** to enquire with you directly on your WhatsApp number.

### Free hosting (optional)
Drag this whole folder onto **https://app.netlify.com/drop** to get a public
link in seconds. Or push to GitHub and connect **Vercel** / **GitHub Pages**.

### Troubleshooting
- **"new row violates row-level security"** when adding a product → your signed-in
  email doesn't match `owner_email()` in the SQL **and** `ownerEmail` in config.js.
  Make all three identical, re-run the SQL if you changed it.
- **Images not uploading** → make sure step 2's SQL ran fully (it creates the
  `product-images` bucket and its policies).
- **Still see "Demo mode"** → `supabaseUrl` or `supabaseAnonKey` is still blank
  in `js/config.js`.
