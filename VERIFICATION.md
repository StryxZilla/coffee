# Coffee Atlas verification

## Automated checks

Run from the repository root with Node.js:

```sh
node --test tests/state.test.cjs
```

Six tests passed on September 13, 2026:

1. JavaScript syntax, embedded geometry, and absence of external runtime assets or network calls.
2. Sample total of 8.7 million tonnes, conversion to 145 million 60 kg bags, and default Brazil selection.
3. Unique origin IDs, matching country geometry, positive costs/yields, and export/cost allocations totaling 100%.
4. Arabica and Robusta volume conservation, eligibility filtering, mixed-system classification, and fallback selection when a country is filtered out.
5. All 100 valid layer/filter/country combinations render without NaN, undefined, or Infinity; each flow state includes four routes.
6. Country selection, export call-to-action, five supply-chain stages, and upper/lower zoom limits.

These are state/render smoke tests with a minimal DOM adapter. They do not replace a real browser, accessibility audit, or touch-device test.

## Responsive design

The layout includes breakpoints for phones, tablets, laptops, and wide screens. Phones use a horizontally swipeable map, large controls, a single-column detail panel, and stacked lower sections. Tablets move country details below the map. Laptops retain a side panel. Large desktops use a wider detail panel and a bounded content width.

Browser verification completed against [the hosted HTTPS app](https://stryxzilla.github.io/coffee/) in the Codex in-app browser:

| Viewport | Result |
| --- | --- |
| 320 × 720 small phone | No horizontal page overflow; all layer controls fit; comparison table and consumption stage usable. |
| 390 × 844 iPhone size | No horizontal page overflow; single-column layout, horizontally scrollable map, layer switching, filtering, and Indonesia export selection verified. |
| 768 × 1024 iPad portrait | No horizontal page overflow; full map visible and country details moved below it. |
| 1024 × 768 iPad landscape | No horizontal page overflow; side panel fits at 290 px. |
| 1440 × 900/1000 laptop | No horizontal page overflow; map and country profile appear side by side. |
| 2560 × 1440 extra-wide | No horizontal page overflow; main content remains bounded at 1800 px; four export routes render. |

Additional real-browser checks passed: all four visualization modes; mixed filter yields four origin rows; Robusta filter yields five; selecting Indonesia updates the title, profile, and four routes; keyboard Enter selects Colombia and retains marker focus; filtering out Colombia selects Brazil; zoom and reset update the map transform; Escape closes the methodology dialog and restores focus to its opener; the Consume stage updates its content. Browser warning/error log was empty.

Visual review led to improved spacing between India and Ethiopia labels and map recentering after viewport changes. Phone map navigation uses native horizontal overflow, and country buttons in the table provide an alternative to map selection. The app honors the operating system's reduced-motion preference.

Local-file browser navigation was blocked by the browser tool's URL policy, so browser QA used the published HTTPS app. Viewport checks emulate screen dimensions; they are not tests on physical devices. Mobile Safari, actual touch gestures, assistive technology, and a formal accessibility audit remain unverified.

## Product limits

- The coffee dataset is synthetic and represents only eight origins; no claim is made that figures are current or verified.
- Import routes are a modeled allocation to representative markets, not literal shipping lanes or consumption statistics.
- All data is client-side and static. There are no credentials, external APIs, accounts, or backend services.
- GitHub Pages was confirmed live over HTTPS. Changes may take a short time to propagate after a push.
