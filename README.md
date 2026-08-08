# CAFA-Template

The c.a.f.a atelier 央艺 site. A static export — HTML, CSS and JS on a CDN, with
no server runtime of its own.

The content is not in this repository. It lives in a Cloudflare D1 database
behind [CAFA-Admin](https://github.com/Adventnl/CAFA-Admin), where the studio
edits it, and the photographs live in an R2 bucket. Neither is reached at
runtime: `scripts/fetch-content.mjs` pulls the published content once, before
`next build`, and writes it to `src/content/bundle.generated.json`. Everything
downstream of that file is as static as it ever was.

```
CAFA-Admin ──published revision──> prebuild ──> bundle.generated.json
                                                       │
                                            next build ▼  →  out/  →  CDN
```

That distinction is the architecture. Reading the content in the browser
instead would put three serial round trips ahead of the largest image on the
page and leave intrinsic dimensions unavailable until after first paint, which
breaks the LCP and CLS budgets in `CLAUDE.md` §7 structurally. Read
[CLAUDE.md](CLAUDE.md) before changing anything; it is a constitution rather
than a style guide.

## Building

A build needs to know where to read the content from:

```sh
npm install
CONTENT_API=https://<admin-host>/api/content/published npm run build
```

With `CONTENT_API` unset, the build reuses whatever bundle is already on disk —
so a local checkout can work offline once it has fetched once — and fails with
instructions if there is nothing to fall back on. A build that was *told* where
to look and could not reach it fails rather than quietly shipping yesterday's
content.

The preview build points `CONTENT_API` at `/api/content/draft` instead and sends
`PREVIEW_TOKEN`, which is how "View draft" in the admin shows unpublished work.

```sh
npm run dev        # fetch content, then next dev
npm run content    # just re-fetch the content
npm run build      # prebuild fetch → next build → 404 + build-info
npm run lint
```

`out/build-info.json` records the revision the build came from. The admin reads
it back from the deployed origin to answer "is it live yet" without needing any
Cloudflare API credentials.

## Documentation

| | |
|---|---|
| [CLAUDE.md](CLAUDE.md) | The rules. Layering, hardcoding, budgets, motion, a11y. |
| [docs/Architecture.md](docs/Architecture.md) | How it is put together and why. |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Colour, type, space, grid, motion tokens. |
| [docs/MOTION.md](docs/MOTION.md) | The motion system in full. |
