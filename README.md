# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Navigation

The xScaler logo links to `https://xscalerlabs.com` in the same tab, including
the mobile navigation menu. Configure this through `themeConfig.navbar.logo`
in `docusaurus.config.ts`; documentation links remain on the docs site.

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
