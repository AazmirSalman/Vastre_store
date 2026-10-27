/**
 * Vastre orders -> private Google Sheet.
 *
 * The website sends each order here as JSON. This script checks the shared secret,
 * adds one row to the "Orders" tab, and (optionally) emails the owner.
 *
 * One-time setup is in docs/ORDERS-SETUP.md. Short version:
 *   1. Paste this file into Extensions > Apps Script of a new Google Sheet.
 *   2. Project Settings > Script properties > add SECRET = a long random string.
 *   3. Run setup() once (approve the permissions), then Deploy > New deployment > Web app.
 */

var SHEET_NAME = 'Orders';

// Optional: the email that gets a message for every new order. Leave '' for no emails.
var NOTIFY_EMAIL = '';

var HEADERS = [
  'Ref', 'Time', 'Status', 'Name', 'Phone', 'City', 'Address', 'Items',
  'Subtotal', 'Delivery', 'Total', 'Notes', 'Source', 'Medium', 'Campaign', 'Ad', 'Click ID', 'Landing page'
];

// Columns stored as plain text so names, notes and addresses can never be read as formulas.
var NUMBER_COLUMNS = ['Subtotal', 'Delivery', 'Total'];

var STATUSES = ['New', 'Confirmed', 'Dispatched', 'Delivered', 'Returned', 'Cancelled'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    if (!secret || data.secret !== secret) return json_({ ok: false, error: 'unauthorized' });
    if (!data.ref || !data.customer || !data.items) return json_({ ok: false, error: 'bad_payload' });

    lock.waitLock(20000);
    var sheet = getSheet_();
    var c = data.customer;
    var a = data.attribution || {};

    var items = (data.items || [])
      .map(function (i) {
        return i.qty + ' x ' + i.name + (i.size ? ' (' + i.size + ')' : '') + ' @ Rs. ' + i.unitPrice;
      })
      .join('\n');

    var record = {
      'Ref': data.ref,
      'Time': Utilities.formatDate(new Date(), 'Asia/Karachi', 'yyyy-MM-dd HH:mm'),
      'Status': 'New',
      'Name': c.name,
      'Phone': c.phone,
      'City': c.city,
      'Address': c.address,
      'Items': items,
      'Subtotal': Number(data.subtotal) || 0,
      'Delivery': Number(data.deliveryFee) || 0,
      'Total': Number(data.total) || 0,
      'Notes': c.notes || '',
      'Source': a.utm_source || (a.referrer ? 'referral' : 'direct'),
      'Medium': a.utm_medium || '',
      'Campaign': a.utm_campaign || '',
      'Ad': a.utm_content || '',
      'Click ID': a.fbclid || '',
      'Landing page': a.landing || ''
    };

    var row = sheet.getLastRow() + 1;
    if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 500);
    var range = sheet.getRange(row, 1, 1, HEADERS.length);
    range.setNumberFormats([HEADERS.map(function (h) { return NUMBER_COLUMNS.indexOf(h) >= 0 ? '#,##0' : '@'; })]);
    range.setValues([HEADERS.map(function (h) { return record[h]; })]);
    SpreadsheetApp.flush();

    notify_(record);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) { /* lock was never taken */ }
  }
}

// Opening the web app address in a browser shows this, which is a quick "is it live" check.
function doGet() {
  return json_({ ok: true, service: 'vastre-orders' });
}

/** Run this once from the editor. It builds the Orders tab and asks for the permissions it needs. */
function setup() {
  var sheet = getSheet_();
  var statusCol = HEADERS.indexOf('Status') + 1;
  var rows = Math.max(sheet.getMaxRows() - 1, 1);
  var statusRange = sheet.getRange(2, statusCol, rows, 1);

  // A dropdown in the Status column, so the owner picks instead of typing.
  statusRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build());

  // Colour the Status cell so new orders stand out at a glance.
  var colours = { New: '#fde7c0', Confirmed: '#d6eadf', Dispatched: '#d7e3f4', Delivered: '#c9e7d0', Returned: '#f4d6d6', Cancelled: '#e3e3e3' };
  sheet.setConditionalFormatRules(
    STATUSES.map(function (s) {
      return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s).setBackground(colours[s]).setRanges([statusRange]).build();
    })
  );

  if (NOTIFY_EMAIL) MailApp.getRemainingDailyQuota(); // makes Google ask for the email permission now
  SpreadsheetApp.getActive().toast('Orders sheet is ready.');
}

/** Run this from the editor after deploying, to confirm a row appears. Delete the test row afterwards. */
function testOrder() {
  var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  var res = doPost({
    postData: {
      contents: JSON.stringify({
        secret: secret,
        ref: 'VS-TEST01',
        customer: { name: 'Test Customer', phone: '03001234567', city: 'Karachi', address: 'Test address', notes: 'Delete this row' },
        items: [{ name: 'Test Product', size: 'M', qty: 1, unitPrice: 1000, lineTotal: 1000 }],
        subtotal: 1000,
        deliveryFee: 200,
        total: 1200,
        paymentMethod: 'Cash on delivery',
        attribution: { utm_source: 'test' }
      })
    }
  });
  Logger.log(res.getContent());
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    var first = ss.getSheets()[0];
    // Reuse the empty default tab of a brand-new spreadsheet instead of leaving a blank one behind.
    sheet = first && first.getLastRow() === 0 ? first.setName(SHEET_NAME) : ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#4a1432').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, HEADERS.length, 120);
    sheet.setColumnWidth(HEADERS.indexOf('Address') + 1, 280);
    sheet.setColumnWidth(HEADERS.indexOf('Items') + 1, 300);
    sheet.setColumnWidth(HEADERS.indexOf('Notes') + 1, 200);
    sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).setVerticalAlignment('top');
    sheet.getRange(2, HEADERS.indexOf('Address') + 1, Math.max(sheet.getMaxRows() - 1, 1), 2).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  }
  return sheet;
}

function notify_(r) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail(
      NOTIFY_EMAIL,
      'New order ' + r.Ref + ' - Rs. ' + r.Total,
      [
        r.Name + ' | ' + r.Phone + ' | ' + r.City,
        r.Address,
        '',
        r.Items,
        '',
        'Total (cash on delivery): Rs. ' + r.Total,
        r.Notes ? 'Notes: ' + r.Notes : '',
        r.Source ? 'Source: ' + r.Source + (r.Campaign ? ' / ' + r.Campaign : '') : ''
      ].join('\n')
    );
  } catch (err) {
    // A failed email must never lose the order, which is already saved in the sheet.
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
