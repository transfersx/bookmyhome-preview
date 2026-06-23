/* ============================================================
   Inventory config
   ------------------------------------------------------------
   By default inventory is stored in this browser only (localStorage).
   To make it LIVE & SHARED for everyone (so units you add show on every
   visitor's site), deploy the Google Apps Script in `inventory-backend.gs`
   and paste its Web-App URL below. Then add/delete from inventory-admin.html.
   ============================================================ */
window.INVENTORY_API = "";        // <-- paste your deployed Apps Script Web App URL to go live
window.INVENTORY_PIN = "2580";    // <-- admin PIN for the add/delete page (change this, and set the same in the Apps Script)
