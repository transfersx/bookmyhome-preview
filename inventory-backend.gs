/**
 * Book My Home — Live Inventory backend (Google Apps Script)
 * ===========================================================
 * Makes the inventory SHARED & LIVE so units added in inventory-admin.html
 * show on every visitor's inventory.html.
 *
 * SETUP (≈5 minutes):
 *  1. Create a new Google Sheet (any name).
 *  2. Extensions → Apps Script. Delete the sample code, paste THIS file.
 *  3. Set PIN below to the same value as window.INVENTORY_PIN in
 *     assets/js/inventory-config.js (default "2580").
 *  4. Deploy → New deployment → type "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Click Deploy, authorise, and COPY the Web app URL.
 *  5. Paste that URL into window.INVENTORY_API in inventory-config.js, commit & push.
 *  Done — add/delete from inventory-admin.html now updates the live site for everyone.
 */

var SHEET_NAME = 'Inventory';
var PIN = '2580'; // <-- must match window.INVENTORY_PIN in inventory-config.js
var COLS = ['id','project','projectSlug','city','locality','config','size','facing',
            'floorUnit','price','paymentPlan','units','status','possession','notes','createdAt'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(COLS); }
  return sh;
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sh = sheet_();
  var vals = sh.getDataRange().getValues();
  var head = vals.shift() || COLS;
  var items = vals.filter(function(r){ return r[0]; }).map(function(r){
    var o = {}; head.forEach(function(h,i){ o[h] = r[i]; }); return o;
  });
  return json_({ items: items });
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) {}
  if (String(body.pin) !== String(PIN)) return json_({ ok:false, error:'auth' });
  var sh = sheet_();

  if (body.action === 'add') {
    var it = body.item || {};
    sh.appendRow(COLS.map(function(c){ return it[c] !== undefined ? it[c] : ''; }));
    return json_({ ok:true });
  }
  if (body.action === 'delete') {
    var vals = sh.getDataRange().getValues();
    for (var i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(body.id)) { sh.deleteRow(i + 1); return json_({ ok:true }); }
    }
    return json_({ ok:false, error:'not found' });
  }
  return json_({ ok:false, error:'unknown action' });
}
