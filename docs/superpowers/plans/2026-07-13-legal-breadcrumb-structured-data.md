# Legal Breadcrumb Structured Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the docs site from emitting empty breadcrumb structured data and prevent recurrence during builds.

**Architecture:** Legal documents that are not part of `mainSidebar` will stop forcing that sidebar. A standalone Node.js validator will inspect Docusaurus build output and make the existing `build` script fail on invalid empty breadcrumb JSON-LD.

**Tech Stack:** Docusaurus 3.10, TypeScript frontmatter, Node.js 20, npm.

## Global Constraints

- Preserve all existing legal page URLs and content.
- Do not disable breadcrumb structured data globally.
- Fail builds only for malformed JSON-LD or a `BreadcrumbList` with a missing or empty `itemListElement`.

---

### Task 1: Add the structured-data build guard

**Files:**
- Create: `scripts/check-structured-data.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: generated HTML under `build/`.
- Produces: exit code 0 for valid output and exit code 1 with affected paths for invalid output.

- [ ] Create a Node.js validator that recursively reads `build/**/*.html`, parses JSON-LD scripts, and reports empty `BreadcrumbList.itemListElement` arrays.
- [ ] Run `npx docusaurus build && npm run check:structured-data` against the existing content and verify it fails for all five legal pages.
- [ ] Wire `npm run check:structured-data` into `npm run build` after the Docusaurus build.

### Task 2: Correct orphaned legal-page metadata

**Files:**
- Modify: `docs/legal.md`
- Modify: `docs/privacy.md`
- Modify: `docs/terms.md`
- Modify: `docs/security.md`
- Modify: `docs/cookies.md`

**Interfaces:**
- Consumes: Docusaurus document frontmatter.
- Produces: standalone legal pages without invalid sidebar-derived breadcrumb markup.

- [ ] Remove only `displayed_sidebar: mainSidebar` from the five documents.
- [ ] Run `npm run build` and verify the structured-data guard passes.
- [ ] Run `npm run typecheck` and verify TypeScript passes.
- [ ] Inspect the five generated HTML files and verify none contains an empty breadcrumb object.

### Task 3: Delivery

**Files:**
- Review all files changed by Tasks 1 and 2.

**Interfaces:**
- Consumes: verified branch diff.
- Produces: a focused GitHub pull request ready for the normal `main` deployment workflow.

- [ ] Review `git diff --check` and the complete branch diff.
- [ ] Commit with a conventional bug-fix message.
- [ ] Push the branch and open a pull request with verification evidence.
