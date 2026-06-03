/* =====================================================================
   THE MANGALAGIRI WEAVES — Configuration
   ---------------------------------------------------------------------
   This is the ONLY file you normally need to edit.

   1) WhatsApp number for customer enquiries / sharing.
      Use full international format WITHOUT '+', spaces, or dashes.
      Example for India (+91 98765 43210)  ->  "919876543210"

   2) Supabase keys (for the SHARED cloud catalog).
      Leave them as "" to run in DEMO MODE (saves to your browser only).
      Paste your keys to switch to the real shared cloud.
      See SUPABASE_SETUP.md for the 5-minute setup.

   3) OWNER_EMAIL — the single account allowed to manage products.
      Sign up once with this email on the Owner login tab.
   ===================================================================== */

window.APP_CONFIG = {
  brandName: "THE MANGALAGIRI WEAVES",
  tagline: "Handwoven heritage, draped in gold.",

  // 1) WhatsApp business number (international format, no '+')
  whatsappNumber: "917990399926",

  // 2) Supabase project keys — LIVE (shared cloud catalog)
  supabaseUrl: "https://jbogocoqpujsepoxirkn.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2dvY29xcHVqc2Vwb3hpcmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTI0MTEsImV4cCI6MjA5NjAyODQxMX0.qaliI3n_SJBXjXTGRC_Sc7rPEG2mhP4oKqEyPvfNF-A",

  // 3) The owner account (only this email can add/edit products)
  ownerEmail: "bandarusivanageswaraohandlooms@gmail.com",

  // Storage bucket name in Supabase (created in setup)
  storageBucket: "product-images",

  // The 5 standard categories — auto-created in the Owner dashboard so the
  // owner can pick them when adding a saree. These match the homepage cards.
  standardCategories: [
    "Cotton by Pattu Saree",
    "Pure Pattu Saree",
    "Cotton by Cotton Saree",
    "Pattu Dress Materials",
    "Cotton Dress Materials",
  ],

  // Currency symbol used across the site
  currency: "₹",
};
