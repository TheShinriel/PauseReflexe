# Definitive Unblock Menu Implementation Plan

> **For Hermes:** Implement directly with TDD; use subagents only if this grows beyond popup/storage changes.

**Goal:** Add a popup submenu listing blocked sites and allowing definitive unblock of one site.

**Architecture:** Keep persistent blocked domains in `storage.local`, add `addedAtByDomain` metadata for date sorting, and expose `UNBLOCK_DOMAIN` through the service worker. Popup renders a `<details>` submenu; current site is pinned first when blocked, otherwise list is sorted alphabetically by default.

**Tech Stack:** JavaScript ES modules, MV3 WebExtension, Vitest.

---

## Tasks

1. Add RED tests for blocked-site list sorting:
   - current domain first when present;
   - alphabetical fallback;
   - added-date sorting support.

2. Implement pure helper `src/shared/blocked-sites.js`.

3. Extend storage:
   - store `addedAtByDomain`;
   - add `removeBlockedDomain(domain)`;
   - preserve compatibility with existing `blockedDomains`.

4. Extend background message API:
   - `UNBLOCK_DOMAIN` removes domain and rebuilds DNR rules.

5. Update popup UI:
   - add submenu/list;
   - render current blocked site first;
   - add delete buttons.

6. Verify:
   - `npm run test:run`;
   - `npm run validate:manifest`;
   - manual checklist updated.
