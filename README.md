# RMB Dollar Converter

A tiny static web app for converting Chinese RMB to US dollars and US dollars to RMB.

It is designed to be dependency-free, easy to host on GitHub Pages, and usable offline after the first load.

## Use locally

Open `index.html` in a browser, or run a local server:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## What it does

- Converts RMB to USD or USD to RMB instantly.
- Fetches a live USD/CNY rate from `open.er-api.com`, then falls back to `frankfurter.app`.
- Keeps working with the last saved rate if you are offline.
- Lets you enter a custom CNY-per-USD rate.
- Remembers your last amount, direction, and rate choice.
- Installs as a small offline-capable web app.

## Publish to GitHub Pages

Push this folder to GitHub, then enable Pages for the repo's main branch.

No API key is required.
