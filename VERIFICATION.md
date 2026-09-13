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

Browser verification is in progress against the hosted HTTPS version. Local-file navigation was blocked by the browser tool's URL policy. Device screenshots and actual mobile Safari testing have not yet been completed.

## Product limits

- The coffee dataset is synthetic and represents only eight origins; no claim is made that figures are current or verified.
- Import routes are a modeled allocation to representative markets, not literal shipping lanes or consumption statistics.
- All data is client-side and static. There are no credentials, external APIs, accounts, or backend services.
- GitHub Pages must complete its initial deployment before the site can be opened from a phone away from this computer.
