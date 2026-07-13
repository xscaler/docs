# Legal Breadcrumb Structured Data Design

## Problem

The `/legal`, `/privacy`, `/terms`, `/security`, and `/cookies` pages force
`mainSidebar`, but they are not members of that sidebar. Docusaurus therefore
renders a home-only breadcrumb and emits an empty `BreadcrumbList`
`itemListElement`, which Google rejects for rich results.

## Design

Remove `displayed_sidebar: mainSidebar` from the five orphaned legal documents.
They remain linked from the global footer, indexable, and available at their
existing canonical URLs, but Docusaurus no longer renders invalid breadcrumb
markup for them.

Add a build-output validation script that recursively scans generated HTML,
parses every JSON-LD script, and fails when a `BreadcrumbList` has a missing or
empty `itemListElement`. Run it after every Docusaurus build so CI cannot deploy
the same invalid schema again.

## Verification

- Demonstrate the validation script fails against the current build.
- Build after removing the forced sidebar metadata.
- Confirm type checking and the complete build pass.
- Confirm all five generated pages contain no empty breadcrumb schema.
- Confirm no generated page contains an invalid empty `BreadcrumbList`.
