# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Navigation

The xScaler logo links to `https://xscalerlabs.com` in the same tab, including
the mobile navigation menu. Configure this through `themeConfig.navbar.logo`
in `docusaurus.config.ts`; documentation links remain on the docs site.

## Brand theme

`src/css/custom.css` maps the marketing site's neutral palette to Docusaurus,
DocSearch and the OpenAPI explorer. Use its shared `--xs-*` and `--ifm-*` roles
in component styles rather than introducing independent colours.

- Default to charcoal (`#171717`) regardless of OS preference. Keep the explicit
  light-mode switch and Docusaurus's persisted reader preference.
- Use Plus Jakarta Sans for headings/wordmarks, IBM Plex Sans for prose and
  controls, and IBM Plex Mono for code.
- Keep action fill/hover/ink separate from text-link colour. Orange actions use
  dark ink, and both reading modes need accessible text and control contrast.
- Code wells stay dark in both modes, paired with the dark Prism palette.
  OpenAPI forms follow the reading mode; they are not code surfaces.
- Mobile drawers are opaque. Wide article tables and code scroll within their
  containers rather than widening the document.
- Preserve semantic status/syntax colours and third-party integration logos.

The favicon and social card are standalone SVG assets. Social-card lettering is
outlined from SIL OFL-licensed Plus Jakarta Sans and IBM Plex Sans, so rendering
does not depend on installed fonts or network access. Font sources and visible
text are recorded in the SVG metadata; regenerate outlines when changing copy.

Before release, serve a production build and inspect the homepage, article,
catalogue and API explorer on desktop/mobile in both modes. Exercise theme
persistence, keyboard focus, search results/empty/network-failure states, code
copying and horizontal scrolling. Check the built standalone assets as well.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Public documentation boundary

`docs/superpowers/` contains internal implementation sources. Docusaurus excludes
that directory during content discovery, so it must not produce public routes,
bundles or sitemap entries. Do not move internal plans into the customer docs
corpus or rely on removing sidebar links to make them private.

The public `/search` utility remains crawlable with `noindex, follow` and is
excluded from the sitemap. `static/robots.txt` advertises the canonical docs
sitemap. Signal-specific documentation keeps separate canonical URLs, with
distinct titles and descriptions and short sidebar labels.

`npm run build` checks structured data and public indexability after rendering.
Run `npm run test:indexability` for the publishing-boundary regression cases.
Before deployment, serve the build and verify that internal routes return real
404s, `/search` remains available with noindex, and customer documentation remains
indexable. After deployment, submit the cleaned sitemap to the existing
`sc-domain:xscalerlabs.com` Search Console property and monitor recrawls.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
