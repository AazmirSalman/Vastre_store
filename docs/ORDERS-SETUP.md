# Order Sheet setup (about 15 minutes)

Each order becomes one row in a private Google Sheet. Do this **in her Google account**, because it holds her
customers' names, phones and addresses. Sit with her, or ask her to share her screen.

## 1. Create the Sheet and add the script

1. Go to https://sheets.new and name the file **Vastre Orders**.
2. Menu **Extensions**, **Apps Script**. Delete the sample code.
3. Open `apps-script/Code.gs` from this project, copy everything, paste it into the editor, and save (disk icon).
4. Optional: to get an email for every order, put her email between the quotes in `var NOTIFY_EMAIL = '';`.

## 2. Set the secret

The secret stops strangers from posting fake orders to the script.

1. In the Apps Script editor, **Project Settings** (gear icon), **Script properties**, **Add script property**.
2. Name: `SECRET`. Value: a long random string. Generate one with: `openssl rand -hex 24`, or mash 30 or more random letters and digits. Save.
3. Keep this value. It also goes on the host as `ORDERS_WEBHOOK_SECRET`.

## 3. Run setup once

1. In the editor, choose the function **setup** in the dropdown and press **Run**.
2. Google asks for permission ("Review permissions", then her account, then **Advanced**, then **Go to ... (unsafe)**,
   then **Allow**). This is normal for your own script. It only touches this Sheet (and sends email if you set one).
3. The **Orders** tab now has headers and a Status dropdown.

## 4. Publish it as a web app

1. **Deploy**, **New deployment**, gear icon, **Web app**.
2. Description: `Orders v1`. **Execute as: Me.** **Who has access: Anyone.**
3. **Deploy**. Copy the **Web app URL** (it ends in `/exec`). This is `ORDERS_WEBHOOK_URL`.

"Anyone" only means anyone who has the URL and the secret can post. Without the secret every request is rejected.

## 5. Test it

1. In the editor choose **testOrder** and **Run**. A row for "Test Customer" should appear in the Orders tab. Delete it.
2. Open the web app URL in a browser. You should see `{"ok":true,"service":"vastre-orders"}`.
3. Later, place a real test order from the website (see `SETUP-GUIDE.md`, step 9).

## Day to day

- New orders appear at the bottom with Status **New**. Change the Status as the order moves along (Confirmed, Dispatched, Delivered, Returned, Cancelled). It is colour coded.
- Turn on notifications on her phone: Google Sheets app, **Settings**, enable notifications for this file. Or use `NOTIFY_EMAIL`.
- The Source, Campaign, Ad and Click ID columns show which Meta ad brought the order (see `ADS-TRACKING.md`).

## If you change the script later

Editing the code is not enough. **Deploy**, **Manage deployments**, the pencil, **Version: New version**, **Deploy**.
The URL stays the same.

## Limits to know

- Google caps free Apps Script email at about 100 a day. Orders are never blocked by that, only the emails.
- Two orders at the same instant are handled one after the other (the script takes a lock), so rows never overwrite each other.
- The site retries nothing automatically. If the Sheet is unreachable, the customer sees "We could not save your order. Please try again, or order on WhatsApp." and no order is lost silently.
