# Innovative Generator Parts

A complete responsive generator-parts catalogue built with semantic HTML5, CSS Grid/Flexbox and vanilla JavaScript. No framework, package installation or third-party runtime requests are required.

## Run locally

From this directory, run a static server:

```sh
python -m http.server 4173
```

On Windows, `py -m http.server 4173` is an alternative. Open `http://localhost:4173`. Opening `index.html` directly also renders the site; a server is recommended for shareable part URLs and deployment parity.

## Files

```text
index.html                 Page sections, navigation and accessible dialogs
styles.css                 Tokens, layouts, interactions and responsive styles
script.js                  Search, filters, detail and quote behavior
data/products.js           All 80 catalogue records and eight categories
assets/images/             Official IGP logo and illustrative hero photograph
assets/products/           80 reference images extracted from the supplied DOCX
assets/categories/         Reserved for replacement category photographs
assets/icons/              Favicon; other icons are inline SVG in index.html
build.mjs                  Optional static deployment staging, using Node built-ins
dist/                      Staged website used by Sites hosting
.openai/hosting.json        Private Site identity and static output configuration
```

## Catalogue content and sources

`8 categories.docx` is the sole source of product names, working principles and daily-use descriptions. All 80 table rows are preserved, with ten records in each of the eight categories. Repeated products such as AVR and filters remain separate records in their original categories because the document supplies category-specific descriptions.

Every record in `data/products.js` contains `id`, `name`, `category`, `workingPrinciple`, `dailyUse`, `image` and `featured`. IDs identify catalogue entries, **not manufacturer part numbers**. Technical descriptions have not been expanded with unsupported specifications, compatibility, prices, availability or warranties.

The Pantheone screenshot mentioned in the brief was not present in the attachments. Composition follows the user's detailed written section, spacing and interaction requirements; an exact screenshot match has not been verified.

## Images and branding

- `assets/images/igp-logo.jpeg` is the supplied official logo. CSS clips its surrounding whitespace without modifying the original image.
- All `assets/products/*.webp` images are extracted from the supplied catalogue and optimized as WebP. The catalogue identifies these as product reference-board photography. They are presented as reference images, not verified factory/model photographs.
- `assets/images/generator-hero.webp` is an AI-generated illustrative generator-room photograph, reused with a different crop for the final CTA. It is not a photograph of a verified IGP facility or a specified generator model.
- Replace the hero with approved company photography at the same path, ideally at least 1920px wide. Replace product images using their current paths, or update each product's `image` field. Preserve a neutral background and consistent crop.
- The category mosaic currently reuses relevant catalogue photography. To use dedicated photography, put the files in `assets/categories/` and update `setupCatalogue()` / `categoryImages` in `script.js` to reference the new paths.
- The favicon is an IGP initials placeholder; replace `assets/icons/favicon.svg` with an approved small-format brand asset if supplied.

## Add a product or category

Add a record to `window.IGP_CATALOGUE.products` in `data/products.js` with a unique slug-like `id`, one of the exact category strings and verified content. Add its image locally. Search, category counts, sort, datalist suggestions and related parts update automatically. The initial eight IDs and four maintenance products are curated in `script.js`; change those lists to adjust the homepage selection.

To add a category, append its exact label to `categories` in the same file, add its products, and extend the `categoryImages` and `descriptions` arrays in `script.js`. Adjust the mosaic grid in `styles.css` for the new number of tiles. Review footer grouping and homepage copy that refers to eight systems.

Part views use `?part=6-avr` style URLs and open a native modal on reload. `showProduct()` and `getPart()` provide a clear extraction point for a future dedicated product-route implementation.

## Contact information

Replace `[Phone Number]`, `[Email Address]` and `[Business Address]` in the `#contact` footer in `index.html`. These are intentionally marked client placeholders. Use `tel:` and `mailto:` links when approved contact values are provided. Supply approved privacy and business terms before activating a live enquiry service; preview notices currently open from the footer.

## Quote form and backend connection

The form is an explicit **demo**. It validates required name/email/part fields and optional positive integer quantity, preselects a chosen product, and creates a downloadable text enquiry. No email is sent, no order is placed, no form data is sent to a server, and no personal information is stored in localStorage or cookies by the application.

`prepareEnquiry(fields)` in `script.js` is the documented integration point. Replace its local demo handling with an awaited API call. Add server-side validation, request throttling and mail delivery there; keep mail provider secrets on the server. Preserve entered values on failure and show a sent state only after the server confirms success. Then update the demo notice, submit label, success copy, and approved privacy information. Do not put API secrets in this static website.

## Responsive and accessibility behavior

- Four-column desktop collection, three columns on tablets, two columns on larger phones, one column below 400px.
- Asymmetric category mosaic recomposes at tablet and mobile widths.
- Native `<dialog>` elements support focus containment, inert backgrounds, Escape and focus restoration. Mobile navigation also closes on a desktop resize.
- Visible keyboard focus, labelled fields, accessible validation errors, live result count and skip link.
- IntersectionObserver drives the sticky header and restrained reveals; reduced-motion preferences disable animation and smooth scrolling.
- Below-fold images are lazy loaded and sized. Fonts and assets are local/system resources.

## Deployment

The root directory is the complete editable source. To stage it for private Sites hosting:

```sh
node build.mjs
```

Deploy `dist/` as a static site; no server-side runtime is required. Re-run staging after editing source files. This does not activate quote delivery.

## Verification

Browser QA covers 1440, 1280, 1024, 768, 430, 390 and 360px widths; search, all category filters, sorting, empty states, 80-record expansion, product details, related parts, deep links, quote validation/prefill/download/edit, mobile navigation, dialog keyboard behavior, asset loading and overflow. Internal evidence is retained in `qa/` in the working directory, excluded from the client bundle and hosted files.
