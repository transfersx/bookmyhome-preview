# Book My Home — Tricity luxury property platform

A mobile-first property-listing website for **Mohali · Chandigarh · Panchkula**, built from 9 developer brochures. Static HTML/CSS/vanilla-JS — **no build step, no framework**. Open `index.html` in any browser or serve the folder over HTTP.

> _"Happiness Begins Now."_ — every brochure decoded, reorganised and presented better than the original.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home — hero search, value props, featured homes, **Find My Home** matcher quiz, localities, lead form |
| `listings.html` | All properties — live search, filters (city, BHK, type, possession, size, developer), sort, mobile filter sheet |
| `project.html?p=<slug>` | Project detail — gallery + lightbox, key facts, about, configs table, amenities, floor plans, specs, **OpenStreetMap** map, **EMI calculator**, enquiry modal |
| `compare.html` | Side-by-side comparison of up to 3 saved homes |
| `shortlist.html` | Saved homes (heart) |

## Out-of-the-box features
- **Find My Home** — 3-question lifestyle matcher that scores and recommends projects.
- **Shortlist** (♥) and **Compare** (up to 3) — persisted in `localStorage`, with a floating compare bar.
- **EMI calculator** on every project (value / down-payment / rate / tenure sliders).
- **RERA-verified** badges, brochure data re-organised into clean specs & config tables.
- WhatsApp FAB, site-visit/enquiry capture (stored to `localStorage` → `bmh_leads`).

## Data
- `assets/js/data.js` — `window.PROJECTS` array (the single source of truth for all pages).
- `assets/data/projects.json` — same data as JSON.
- Per-project source: `projects/p1..p9/data.json` (raw extraction) and `projects/p#/pages|img` (rendered brochure pages + extracted photos).
- Web images: `assets/img/projects/<slug>/{hero,card,g#,fp#}.jpg` (optimised for mobile).

### To add / edit a listing
Edit the object in `assets/js/data.js` (and `projects.json` to keep them in sync). Drop images into `assets/img/projects/<slug>/` and reference them in the record's `hero` / `gallery` / `floorplans` fields.

## Projects included
Falcon View · Galaxy Heights-2 · Noble Callista · Galaxy Heights · Hero Homes Mohali · Premium Residences · Horizon Belmond · Joy Grand · The Medallion — all in Mohali (Tricity).

## Brand
- Colours from the logo: deep red `#b01627`, olive accent `#93a312`.
- Type: **Fraunces** (display serif) + **Inter** (UI sans), via Google Fonts.
- Tokens & components live in `assets/css/styles.css`.

## Re-running the extraction pipeline
Brochures live in `brochures/p1..p9.pdf`. The extraction used **PyMuPDF** (render pages + pull large photos) and **Pillow** (resize/optimise). Parsed data was normalised into `data.js`.

## Local preview
```
cd "book my home"
python3 -m http.server 8000
# open http://localhost:8000
```

_Prices show "Price on Request" because the brochures did not publish pricing — the enquiry/EMI flows are designed around that. RERA numbers are shown where the brochure stated them. Images are artistic representations from the brochures._
