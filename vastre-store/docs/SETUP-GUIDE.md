# Setup guide: from zero to live

Time: about 2 hours the first time, plus waiting for her answers. Everything here is free except what is marked.

## 0. Hosting decision (read before you touch anything)

You asked for Vercel free. The problem is Vercel's own rules, not the code.

| Option | Cost | Can it legally host a paid store? |
|---|---|---|
| **Vercel Hobby** (free) | Rs 0 | **No.** Vercel's Hobby plan is for non-commercial, personal use. A store that takes orders, built for a client who pays you, is commercial use. Vercel can pause the project, and it would happen on a customer-facing store. |
| **Vercel Pro** | about US$20 a month | Yes. The client pays, since it is her business. |
| **Netlify Free** | Rs 0 | A Netlify forum reply from 2021 says "Yes, you can use the free plan for commercial projects" (you may not resell the hosting itself). I did not find their current terms page, so read it once before launch: https://www.netlify.com/legal/terms-of-use/ |

**Recommendation: host the store on Netlify Free.** The code runs on either host with no changes, so you can move
to Vercel Pro later by importing the same GitHub repo. You can still use a free Vercel Hobby link to show her a
preview before she pays.

Netlify's free plan has a monthly usage allowance (credits). This store keeps host usage low because product
photos are served from Sanity's CDN, not from Netlify. A small brand running Rs 1,000/day of ads is very unlikely to
reach the limit, but look at Netlify's usage page in the first month.

**Sanity free plan:** 2 public datasets, 250k API requests a month, 100 GB bandwidth, 100 GB assets, 10k documents,
20 user seats. That is far more than a clothing store needs. Sanity's pricing page does not say whether
commercial use is allowed on Free (it describes the plan as for "individuals and hobbyists working on smaller projects"),
so read their terms once: https://www.sanity.io/legal/terms-of-service. If they object, their paid plan is
the fix. Nothing in the code changes.

## 1. Accounts you need (all free)

| Account | Who makes it | Why |
|---|---|---|
| GitHub | You | Holds the code. Make the repo **private**. |
| Sanity | You | The product database and editing panel. |
| Netlify (or Vercel) | You | Hosts the site. |
| Google | **Her** account | Owns the order Sheet, since it holds her customers' details. |

Decide who owns what and tell her in writing. A sensible split: she owns the Google Sheet and the domain, you own
GitHub, Sanity and hosting while you maintain the site, and you hand them over if she asks.

## 2. Create the Sanity project

1. Go to https://www.sanity.io/manage and sign in. Create a project named **Vastre**, dataset **production**, and keep the
   dataset **public** (the default). Choose the free plan.
2. Copy the **Project ID** (shown under the project name). It is not a secret.

## 3. The editing panel (Studio)

Nothing to install. The panel is built into the website at `/studio` (for example `https://vastre.pk/studio`), so it
goes live with the site in step 6.

After the first deploy, allow the site to talk to Sanity: sanity.io/manage, your project, **API**, **CORS origins**,
**Add CORS origin**. Add the Netlify address (e.g. `https://vastre.netlify.app`) and tick **Allow credentials**. Add her
real domain the same way after step 8. If you skip this, the panel shows a sign-in or network error.

Invite her: sanity.io/manage, your project, **Members**, **Invite**, her email, role **Editor** (or Administrator).

## 4. Put the order Sheet in place

Follow `ORDERS-SETUP.md`. At the end you will have two values to keep: the **web app URL** (ends in `/exec`) and the
**secret**.

## 5. Put the code on GitHub

```
cd vastre-store                # the folder that contains storefront/ and docs/
git init
git add .
git commit -m "Vastre store"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/vastre-store.git
git push -u origin main
```

Create the empty **private** repo on github.com first, then run the commands. No terminal? On the new repo's page click
**uploading an existing file** and drag in everything inside the `vastre-store` folder (not `node_modules` or `.next`). No passwords or keys are in the code
(`.env` files are excluded).

## 6. Deploy

### Netlify (recommended)

1. Netlify, **Add new site**, **Import an existing project**, GitHub, choose the repo.
2. The settings come from `netlify.toml` (base folder `storefront`). Leave the publish directory empty.
3. Before the first deploy, add the **environment variables** below (Site configuration, Environment variables).
4. Deploy. The first build takes a few minutes.

### Vercel (needs Pro for a paid store, free Hobby is fine for a private preview)

1. Vercel, **Add New**, **Project**, import the repo.
2. Set **Root Directory** to `storefront`. Framework is detected as Next.js.
3. Add the environment variables below, then Deploy.

### Environment variables

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Project ID from step 2 |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `ORDERS_WEBHOOK_URL` | The Apps Script web app URL (ends `/exec`) |
| `ORDERS_WEBHOOK_SECRET` | The same secret you put in the script |
| `NEXT_PUBLIC_SITE_URL` | Her final address, e.g. `https://vastre.pk` (no trailing slash) |

Variables that start with `NEXT_PUBLIC_` are baked in when the site builds, so after changing one, trigger a new
deploy (Deploys, **Trigger deploy**).

## 7. Fill in the content (in this order)

Open `yoursite/studio` and sign in. Do this with her on a call the first time.

1. **Site settings**: store name, headline, WhatsApp number (`923001234567` format), delivery fee, free-delivery amount,
   delivery time, return line, policies, size chart. **Publish.** Until you publish Site settings, the site uses plain defaults.
2. **Collections**: name, cover photo, position (1, 2, 3...).
3. **Products**: photos first, then name, price, collection, sizes, description. **Publish** each one.

Everything shows on the live site within about a minute of pressing Publish.

## 8. Connect her domain

1. In Netlify, **Domain management**, **Add a domain**, type her domain. Netlify shows the exact DNS records to add.
   Copy them from the screen (do not rely on numbers from guides, they change).
2. Log in to wherever she bought the domain (ask her: GoDaddy, Namecheap, PKNIC and so on) and add those records. Or
   ask her to give you access for ten minutes.
3. Wait from a few minutes to a few hours. HTTPS is switched on automatically.
4. Make sure `NEXT_PUBLIC_SITE_URL` is her real address, then redeploy once. It feeds the sitemap and share links.

If she has email on that domain (Zoho, Google Workspace), do **not** delete her existing MX records.

## 9. Test order, then go live

1. On your phone, open the live site, add a real product, and place an order with your own number.
2. A new row should appear in the Sheet within seconds, and the WhatsApp button on the confirmation page should open
   with the order text. Delete the test row afterwards.
3. Check the Studio-to-site loop: change a price, publish, and see it on the site after a minute.
4. Add the Meta Pixel ID in Site settings and follow `ADS-TRACKING.md`.

Go-live checklist:

- [ ] Delivery, returns and privacy text read and approved by her
- [ ] WhatsApp number tested from a different phone
- [ ] Someone is actually assigned to confirm orders on WhatsApp (the site promises it)
- [ ] Test order arrived in the Sheet, then deleted
- [ ] Site address in Instagram bio, and no "Preview with sample products" banner
- [ ] Pixel shows PageView and a test Purchase in Meta Events Manager
- [ ] You told her where the Sheet and the Studio live, and sent `EDITING-GUIDE.md`

## Troubleshooting

| What you see | Cause and fix |
|---|---|
| Yellow "Preview with sample products" banner | `NEXT_PUBLIC_SANITY_PROJECT_ID` is missing, or you have not redeployed since adding it. |
| A product is missing | It is not **published** (still a draft), or it has no web address or price. |
| Checkout shows WhatsApp instead of the form | `ORDERS_WEBHOOK_URL` is not set on the host. Add it and redeploy. |
| "We could not save your order" | Wrong web app URL or secret. Re-check both. Re-deploy the script as a **new version** after any code change. Run `testOrder` in the script editor to see the real error. |
| No WhatsApp buttons | WhatsApp number is empty or not published in Site settings. |
| /studio shows "not connected" | `NEXT_PUBLIC_SANITY_PROJECT_ID` is missing on the host. Add it and redeploy. |
| /studio shows a network or sign-in error | Add the site address under CORS origins with **Allow credentials** (step 3). |
| A change in the Studio does not show | Wait two minutes and hard-refresh. Check that you pressed **Publish**. |
