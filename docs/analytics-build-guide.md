# International Trucks — Adobe Analytics Build Guide

Implementation guide for the International Edge Delivery (EDS) site
`main--international--ynaka-adobe`. Adobe Analytics only (no Customer Journey Analytics; the CJA values in the
insights panel are simulated). Derived from the code in `scripts/analytics*.js`, `scripts/consent.js` and
`scripts/insights.js` as of this branch.

## 1. Configuration

| Setting | Value | Where |
|---|---|---|
| Report suite | `acsmarketinginternational` (duplicate of the Parker/TEBG suite) | `scripts/analytics-config.js` -> `reportSuiteId`, or `<meta name="analytics-report-suite-id">` |
| Tracking server | `acsmarketing.sc.omtrdc.net` | `trackingServer`, or `<meta name="analytics-tracking-server">` |
| IMS org | `21BD487E5F2280130A495ECC@AdobeOrg` | `orgId` |
| Web SDK datastream | not configured (Web SDK mode stays dormant) | `edgeConfigId` |
| Mode | `appmeasurement` while RSID and tracking server are set; `debug` if either is empty | `getAnalyticsConfig()` |

Overrides: `?analytics-mode=debug|appmeasurement|websdk` for testing; `<meta name="analytics" content="off">`
opts one page out.

## 2. How it works

```
DOM (blocks, links, forms, scroll)
  -> scripts/analytics.js        block-aware auto-instrumentation, delayed phase only
  -> window.adobeDataLayer       Adobe Client Data Layer convention
  -> transport adapter           analytics-transport/{appmeasurement,websdk,debug}.js
  -> Adobe Analytics             /b/ss/acsmarketinginternational/...
```

- Every EDS block is a `div` whose class is the block name, so any block, including new ones from the
  migration, is measured the moment it renders. No per-block tagging code.
- Everything runs from `scripts/delayed.js` after load, so it cannot affect LCP or CWV.
- **Consent gates collection.** Events queue in memory until the visitor grants the `analytics` category in the
  consent banner. They flush on grant and drop on refusal.
- The AppMeasurement adapter builds the `/b/ss/{rsid}/` request itself. If a real `AppMeasurement.min.js` is
  placed at `/deps/appmeasurement/` it is used instead (`s.t()` / `s.tl()`). That file is not in this repo.

## 3. Events

| Data layer event | Analytics event | When |
|---|---|---|
| `page-view` | (page view, `s.t`) | Page load, after consent |
| `block-view` | `event1` Component Impression | Block scrolls into view |
| `cta-click` | `event2` | Click on a link/button in the main content |
| `navigation-click` | `event2` | Click on a link in the header or footer |
| `download-click` | `event3` | Link to pdf, doc, xls, ppt, zip, csv, media files, etc. |
| `form-start` | `event4` | First interaction with a form field |
| `form-submit` | `event5` | Form submitted (native form or Marketo) |
| `scroll-depth` | `event6` | 25, 50, 75, 100 percent |
| `form-view` | none | A block containing a form appears |
| `consent-update` | none | Consent decision changes |

Link hits are typed `d` (download), `e` (external) or `o` (custom).

## 4. Variables to create in the report suite

The duplicate suite should already carry these from the source suite. Verify each in Admin > Report Suites >
Edit Settings > Conversion before relying on reports.

| Variable | Carries | Notes |
|---|---|---|
| `pageName` | Page title | `og:title`, falling back to `document.title` |
| `channel` | Site section | The SECOND path segment (inherited from Parker's `/us/en/...` paths): `/products/trucks/x` reports `trucks`, but `/parts` and `/` both report `home`. See section 7 |
| `eVar1` / `prop1` | Page template (eVar1) / page path (prop1) | Template from the `template` metadata, `default` otherwise |
| `eVar2` | Locale | `en` unless the path starts with a locale such as `fr` |
| `eVar3` / `prop3` | Component id (`block\|variant`) | |
| `eVar4` / `prop4` | Block name | |
| `eVar5` | Block position on the page | |
| `eVar6` | Section index | |
| `eVar10` | Link text | |
| `eVar11` | Link URL | |
| `prop10` | `region:linkType` | region is main, header or footer |
| `eVar12` | Download file name | |
| `eVar13` | Scroll depth | e.g. `50%` |
| `eVar14` | Form name | |
| `event1` to `event6` | See section 3 | Counter events |

### Not mapped yet (recommended additions)

- **Persona** is not sent to Analytics today. It is in the data layer (`demo` push from `head.html`) and in the
  Target profile (`profile.persona`). Recommended: `eVar15` = persona id, set on every hit, so reports can split by
  Fleet Operations Manager, Owner-Operator, Vocational & Procurement Buyer, and EV & Sustainability Lead. See
  `docs/personas.md`.
- **Inventory detail** pages (`/products/trucks/inventory/<id>`) are measured only as generic page views and
  clicks. Recommended: `eVar16` = truck model and `eVar17` = VIN, with the "Contact Seller" click counted under
  `event2` and a dedicated success event once the suite has a free one.

## 5. Block inventory

Instrumented generically by name. The blocks currently in the repo:

- **Navigation/frame:** header, footer, modal, fragment
- **Heroes and banners:** hero, hero-banner, banner, promo-banner, carousel, carousel-hero, carousel-cards,
  carousel-hotspot, carousel-thumbnails
- **Cards:** cards, cards-callouts, cards-category, cards-feature, cards-news, cards-overlay, cards-promo
- **Columns:** columns, columns-cta-band, columns-headline, columns-media
- **Content:** accordion, accordion-specs, tabs, table, quote, quote-large-caps, embed, video, video-poster
- **Forms and search:** form, marketo, search
- **Commerce and personalization:** commerce-products, target-offer, target-slot-hero (and `inventory-detail`
  when PR #6 merges)

The EMA migration adds and renames blocks, so refresh this list from `blocks/` before relying on it.

## 6. Testing

1. Open a page with `?analytics-debug=1` to log events to the console, and `?insights=1` for the live panel
   (Shift+Alt+I toggles it).
2. Accept the consent banner. Before that, nothing is sent.
3. In the console, `intlAnalytics.dump()` prints the event table and `intlAnalytics.lastHit` the last
   `/b/ss/acsmarketinginternational/` request.
4. In the Network tab, filter on `omtrdc.net` and check `pageName`, `events` (e1 to e6) and the eVar parameters
   (`v1`, `v2`, ...) on the hit.
5. In Analysis Workspace, add the suite, confirm Page views, then Component Impression (`event1`) by
   `eVar4` Block name.

## 7. Known limits

- `channel` / `siteSection` uses the second path segment. International URLs have no locale prefix, so
  single-segment pages (`/parts`, `/services`) all report `home`. Recommended fix: use the first segment in
  `getPageContext()` in `scripts/analytics.js` (a one-line change), or skip a leading locale segment only.
- Visitor identity is a first-party id (`intl-analytics-vid`) unless VisitorAPI is added, in which case the ECID
  is used. Without VisitorAPI there is no Analytics for Target (A4T) stitching.
- Marketing opt-in rate in the insights panel and the bot signals are browser-side illustrations, not
  Adobe-measured values.
- The CJA "User Traits" section in the insights panel is simulated.
- Verify the suite settings in section 4 in Adobe Analytics itself; this guide describes what the site sends,
  not what the suite is configured to accept.
