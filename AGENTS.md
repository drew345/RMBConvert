# Agent Context

Last Updated: 2026-06-14

## Project

RMBConvert is a small static web app for quick RMB/USD conversion. It is intended to live on GitHub and GitHub Pages as an on-request project, not as a routine cross-device sync project.

## How To Work Here

- Keep the app dependency-free and static unless Andrew explicitly chooses otherwise.
- Prefer simple browser-compatible HTML, CSS, and JavaScript.
- Treat live exchange-rate providers as convenience sources only; the app must keep working with saved or fallback rates.

## Key Conventions

- Main UI: `index.html`
- App logic: `app.js`
- Styling: `styles.css`
- PWA shell: `manifest.webmanifest` and `sw.js`

## Key Decisions

- The GitHub repository may be public.
- The project should be clean and pushed, then left on GitHub until Andrew asks to work on it again.

## Important Commands

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Where Memory Lives

- Durable project context: `AGENTS.md`
- Session history: `SESSION_LOG.md`

## Things To Avoid

- Do not add API keys, credentials, or private exchange-rate service secrets.
- Do not turn this into a larger framework app without a clear reason.
