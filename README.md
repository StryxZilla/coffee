# Coffee Atlas

An interactive, dependency-free atlas of coffee origins and trade. Open `index.html` directly in a modern browser. All styles, scripts, sample data, and public-domain map geometry are embedded in that file. No server, build step, account, or network connection is needed for the app itself.

## Explore

- Switch between Production, Cost, Bean mix, and Flows.
- Filter by Arabica, Robusta, or mixed growing systems.
- Select a country on the map or in the origin comparison table.
- Trace exports and explore five stages from growing to consumption.
- Zoom around the selected origin. On phones, swipe horizontally across the map; use the comparison table for an alternative country selector.
- Open Data & methodology for definitions and limitations.

## Data

Coffee figures are **synthetic examples**, not verified current statistics. The sample covers Brazil, Vietnam, Colombia, Ethiopia, Indonesia, Honduras, India, and Uganda. Summary metrics refer to this sample only. Bean filters show the selected bean's share of production; cost, yield, export intensity, and country details are whole-origin values. Mixed systems means 20–80% Arabica. Flow destinations are a simplified allocation to four markets, not real shipping lanes or a measure of final consumption.

Geography: [Natural Earth 1:110m countries](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/), public domain. Country geometry is embedded and has no external runtime dependency.

## Hosting

This repository can be served unchanged by GitHub Pages or any static HTTPS host. For GitHub Pages, choose **Settings → Pages → Deploy from a branch → main → / (root)**. The expected project URL is `https://stryxzilla.github.io/coffee/`; confirm the deployment before sharing it. HTTPS hosting is required for convenient access from a phone away from the local computer.

No secrets, environment variables, npm install, backend, or build command are needed. The only application file required by the host is `index.html`; `.nojekyll` disables Jekyll processing.

## Verification

See `VERIFICATION.md` for actual checks and remaining limits. This is a polished prototype, not a source of production-grade commodity data.
