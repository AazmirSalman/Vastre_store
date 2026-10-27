# Vastre online store

A fast ladies' eastern-wear store for Pakistan: browse, choose a size, cash-on-delivery checkout, WhatsApp
confirmation, Meta Pixel tracking. The owner edits products, prices and text in a simple web panel. Nobody
touches code after launch.

## How it fits together

```
Customer's phone ──► Website (storefront/)  ──reads products──►  Sanity (free CMS)  ◄── Owner edits at yoursite.com/studio
                          │
                          └── places order ──►  Google Sheet (private, in the owner's Google account)
                                                 (apps-script/Code.gs)
```

| Part | What it does | Cost |
|---|---|---|
| `storefront/` | The website (Next.js). Hosted on Netlify or Vercel. | Rs 0 on Netlify free (see hosting note) |
| `/studio` page | The editing panel for products, collections, prices, banner, policies. Built into the website, nothing separate to host. | Rs 0 on Sanity's free plan |
| `apps-script/Code.gs` | Saves every order as a row in a private Google Sheet and can email the owner. | Rs 0 |
| Domain | She already owns it. Only DNS records change. | Already paid |

Customer details (name, phone, address) go only to the private Sheet. They are never stored in Sanity,
because Sanity's free plan keeps data public.

## Read in this order

1. `docs/CLIENT-CHECKLIST.md` is what you ask her for. Start this today, it takes the longest.
2. `docs/SETUP-GUIDE.md` is every account and click from zero to live, including the hosting decision.
3. `docs/ORDERS-SETUP.md` is the order sheet and its script, about 15 minutes.
4. `docs/ADS-TRACKING.md` is Pixel and UTM setup so you can see which ad brings which order.
5. `docs/EDITING-GUIDE.md` is for her. Send it once the site is live.

## Try it before any accounts exist

```
cd storefront
npm install
npm run dev        # http://localhost:3000 shows sample products (preview mode)
```

With no Sanity project connected, the site shows sample products, a "Preview" banner, and tells search
engines not to index it. Setting `NEXT_PUBLIC_SANITY_PROJECT_ID` switches it to real data.

## What this version does

- Home, Shop, collection pages, product pages with size picker and size chart, cart, checkout, order confirmation
- Cash on delivery across Pakistan, with a pre-filled WhatsApp message for each order
- Prices are always recalculated on the server, so a customer cannot edit a price in the browser
- Sale prices, sold-out products, sold-out sizes, free-delivery threshold, top banner
- Orders saved to a Google Sheet with a Status dropdown (New, Confirmed, Dispatched, Delivered...)
- Meta Pixel events (ViewContent, AddToCart, InitiateCheckout, Purchase) and the ad that brought each order
- If the order sheet is unreachable, the customer is sent to WhatsApp instead of seeing a dead end

## Not included (say so before she asks)

Online payment (JazzCash, Easypaisa, cards), customer accounts, discount codes, product search,
order-tracking page, stock counts (only sold out / not), Urdu language switch, product reviews.
Cash on delivery plus WhatsApp confirmation is how most small Pakistani brands start. Add online payment later, as a separate paid job.

## Tested here, and what was not

Tested: the whole order flow in a real browser (29 checks: cart, checkout, price tampering, sold-out items,
spam trap, phone formats, ad attribution, mobile layout), the editing panel builds and loads at /studio, and the order
script's logic against a simulated Google Sheet.

Not testable from the build environment, so do these once yourself (the setup guide has a test-order step):
the live Sanity connection, the real Google Apps Script deployment, and the real host deploy and domain.
