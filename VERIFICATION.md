# Coffee Atlas verification

## Automated checks

Run from the repository root with Node.js, without installing dependencies:

```sh
node tests/state.test.cjs
```

Eleven tests passed for the expanded atlas on September 13, 2026:

1. JavaScript syntax, embedded geometry, and absence of external runtime assets or network calls.
2. Sample total of 10.3895 million tonnes, conversion to approximately 173.2 million 60 kg bags, and default Brazil selection.
3. Unique origin IDs, matching country geometry, positive costs/yields, and export/cost allocations totaling 100%.
4. Disjoint whole-origin bean filters: 21 Arabica-led, 5 Robusta-led, and 8 mixed origins. All 34 origins are covered exactly once, volumes are conserved, and incompatible selections fall back correctly.
5. All 272 valid layer/filter/country combinations render without NaN, undefined, or Infinity; each flow state includes four routes.
6. Country selection, export call-to-action, five supply-chain stages, and upper/lower zoom limits.
7. Paired Arabica/Robusta summary percentages match the visible origins' weighted composition; the selected origin retains its own composition under every filter.
8. Refined map needles stay within their width/height bounds, and expanded origins including Peru, Jamaica, Rwanda, Côte d’Ivoire, Papua New Guinea, and China can be selected.
9. Map panning stays bounded, persists when switching layers, and resets at default zoom.
10. Mobile pan limits account for the narrower, horizontally scrolled viewport.
11. Mouse and touch pointer sequences distinguish taps from drags, suppress drag-generated clicks, release capture on cancellation, preserve keyboard activation, and leave native scrolling available at default zoom.

These are state/render smoke tests with a minimal DOM adapter. They do not replace a real browser, accessibility audit, or touch-device test.

## Responsive design

The layout includes breakpoints for phones, tablets, laptops, and wide screens. Phones use a horizontally swipeable map, large controls, a single-column detail panel, and stacked lower sections. Tablets move country details below the map. Laptops retain a side panel. Large desktops use a wider detail panel and a bounded content width.

The expanded 34-origin edition was verified against [the hosted HTTPS app](https://stryxzilla.github.io/coffee/) in the Codex in-app browser on September 13, 2026. All four layers—Production, Cost, Composition, and Flows—were checked at every size below: 24 layer/viewport cases. Every case had no horizontal page overflow or detail-panel overflow, rendered all 34 origin markers, and showed four routes only in flow mode.

| Viewport | Result |
| --- | --- |
| 320 × 720 small phone | No horizontal page overflow; all layer controls fit; comparison table and consumption stage usable. |
| 390 × 844 iPhone size | Paired composition labels and color track remain legible; single-column panels, map filters, and origin picker work. |
| 768 × 1024 iPad portrait | No horizontal page overflow; full map visible and country details moved below it. |
| 1024 × 768 iPad landscape | Map and profile fit side by side without overflow. |
| 1440 × 900/1000 laptop | No horizontal page overflow; map and country profile appear side by side. |
| 2560 × 1440 extra-wide | Main content is bounded at 1920 px with a 355 px profile panel; four export routes render. |

Additional real-browser checks passed:

- Every filter produces matching map, comparison-table, and origin-picker counts: 21 Arabica-led, 5 Robusta-led, 8 mixed, and 34 total.
- The visible composition summary reads 99% Arabica / 1% Robusta for Arabica-led origins and 8% / 92% for Robusta-led origins. Both shares remain explicit.
- Choosing Papua New Guinea updates its profile. Its export action draws four routes and reports 52.3k tonnes exported in the modeled scenario.
- Keyboard Enter selects Jamaica and retains focus on its marker. Applying the Robusta-led filter then falls back to Vietnam.
- Cost needles use cyan, distinct from mint Arabica and amber Robusta; the legend and summary note reflect the active layer.
- The methodology dialog opens, closes with Escape, and restores focus to its opener.
- Browser warning/error logs were empty.

The revised layout was visually inspected on laptop, phone, and tablet views; wide-screen structure was also measured in the browser. Compact needles replace large blocks, secondary labels are reduced, and the selected origin remains emphasized. Phone map navigation uses native horizontal overflow, while the origin picker and table provide alternatives to small map targets. The app honors the operating system's reduced-motion preference.

Local-file browser navigation was blocked by the browser tool's URL policy, so browser QA used the published HTTPS app. Viewport checks emulate screen dimensions; they are not tests on physical devices. Mobile Safari, actual touch gestures, assistive technology, and a formal accessibility audit remain unverified.

## Product limits

- The coffee dataset is synthetic and represents 34 origins; no claim is made that figures are current or verified.
- Import routes are a modeled allocation to representative markets, not literal shipping lanes or consumption statistics.
- All data is client-side and static. There are no credentials, external APIs, accounts, or backend services.
- GitHub Pages was confirmed live over HTTPS. Changes may take a short time to propagate after a push.
