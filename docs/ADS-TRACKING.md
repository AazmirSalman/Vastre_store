# Ads tracking: Pixel and ad names on every order

## What the site tracks

| Event | When it fires | Data sent |
|---|---|---|
| PageView | Every page | |
| ViewContent | Product page opened | product, price (PKR) |
| AddToCart | Add to cart pressed | product, value (PKR) |
| InitiateCheckout | Checkout page opened with items in the cart (once per visit) | cart value (PKR) |
| Purchase | Order confirmation page, once per order | total (PKR), event ID = the order ref (e.g. VS-49KF7Y) |

A Purchase here means an order was **placed** (cash on delivery), not delivered. Returns and refusals still count in Meta,
so compare against the Status column in the Sheet for the real number.

## 1. Add the Pixel

1. Meta Events Manager, **Connect data sources**, **Web**, create a Pixel (or use the existing one). Copy the **Pixel ID** (digits).
2. Studio, **Site settings**, **Ads tracking**, paste it, **Publish**. No redeploy needed.
3. Install the **Meta Pixel Helper** Chrome extension, open the live site, and check that the events above appear.
4. In Events Manager, **Test events**, enter the site address, and place a test order to see Purchase arrive.

## 2. Tag every ad with its name

In each ad, **Tracking**, **URL parameters**, paste:

```
utm_source={{site_source_name}}&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

Meta fills in the names when it shows the ad. The site remembers them on the visitor's phone and sends them with the order,
so the Sheet fills **Source, Medium, Campaign, Ad** and **Click ID** automatically. Orders with no tags show Source `direct`
(or `referral` if they came from another site).

Use clear ad names. If your ad is called `Video A - Lawn - Hook 1`, that is exactly what lands in the Sheet.

## 3. See what each ad really costs

In Sheets, make a pivot table (Insert, Pivot table) with **Ad** as rows and a count of **Ref**, with a filter that hides Status
Cancelled and Returned. Divide each ad's spend from Ads Manager by its order count. That is the real cost per order,
not Meta's estimate.

## Notes

- The Pixel runs only in the browser. Ad blockers and iPhone privacy settings hide some purchases from Meta, so Meta may show fewer than
  the Sheet does. The Sheet is the truth. Server-side tracking (Conversions API) is not built in this version.
- At Rs 1,000 a day it can take a long time to reach the roughly 50 conversions a week Meta likes for a Purchase-optimised ad set. If the
  ad set stays in learning, optimise for Add to Cart or Initiate Checkout first, or use a WhatsApp conversation campaign, and
  judge by the Sheet.
- The privacy page already says the Meta Pixel is used. If she changes the text, keep that sentence.
