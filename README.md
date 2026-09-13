# Coffee Atlas

An interactive, dependency-free atlas of coffee origins and trade. Open `index.html` directly in a modern browser. All styles, scripts, sample data, and public-domain map geometry are embedded in that file. No server, build step, account, or network connection is needed for the app itself.

## Explore

- Switch between Production, Cost, Composition, and Flows.
- Filter whole origins by Arabica-led, Robusta-led, or mixed growing systems.
- Select a country on the map or in the origin comparison table.
- Trace exports and explore five stages from growing to consumption.
- Zoom around the selected origin, then drag with a mouse or one finger to pan within the map boundaries. Click or tap an origin to select it. At default zoom, phones retain native horizontal map scrolling; use the origin picker or comparison table as alternatives.
- Open Data & methodology for definitions and limitations.

## Data

Coffee figures are **synthetic examples**, not verified current statistics. The sample covers 34 producing countries across the Americas, Caribbean, Africa, Asia, and Oceania. Summary metrics refer to this sample only. The annual scenario totals 10.3895 million tonnes.

Filters select whole origins: Arabica-led means at least 80% Arabica; Robusta-led means at least 80% Robusta; mixed systems means neither bean reaches 80%. These categories are disjoint. Production, costs, yield, composition, and exports always describe whole origins. The paired summary composition is volume-weighted across the origins in view. Mint and amber segments encode Arabica and Robusta consistently in production and composition needles; cyan cost needles use a separate scale.

Production needle height uses a square-root scale to keep small origins visible; exact values remain available in the table and country panel. Composition needles have equal total heights, while cost needle heights use a linear scale. Flow destinations are a simplified allocation to four markets, not real shipping lanes or a measure of final consumption. Eleven dependency-free tests cover the full 272 valid layer/filter/origin combinations, composition semantics, and map panning.

Geography: [Natural Earth 1:110m countries](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/), public domain. Country geometry is embedded and has no external runtime dependency.

## Hosting

The live app is [Coffee Atlas](https://stryxzilla.github.io/coffee/). This repository can be served unchanged by GitHub Pages or any static HTTPS host. GitHub Pages uses **main → / (root)**. HTTPS hosting allows access from a phone away from the local computer.

No secrets, environment variables, npm install, backend, or build command are needed. The only application file required by the host is `index.html`; `.nojekyll` disables Jekyll processing.

## Verification

See `VERIFICATION.md` for actual checks and remaining limits. This is a polished prototype, not a source of production-grade commodity data.
