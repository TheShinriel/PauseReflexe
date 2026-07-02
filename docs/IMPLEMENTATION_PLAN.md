# Site Blocker MVP Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task if scope grows.

**Goal:** Build a first loadable Chrome/Firefox MV3 extension that blocks user-chosen domains with soft temporary bypass.

**Architecture:** MV3 WebExtension using `declarativeNetRequest` for redirects, `storage.local` for persistent blocked domains, `storage.session` when available for pause/bypass state, and simple extension pages for popup/blocked UX. Core rule/domain logic is isolated in testable ES modules.

**Tech Stack:** JavaScript ES modules, Manifest V3, WebExtensions APIs, Vitest for logic tests.

---

## Task 1: Project scaffold

**Objective:** Create package metadata, ignore file, source/test folders, and extension manifest.

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `src/manifest.json`
- Create: `src/background/service-worker.js`
- Create: `src/shared/browser-api.js`

**Verification:** `npm install` succeeds and manifest is valid JSON.

## Task 2: Domain helper tests first

**Objective:** Define expected behavior for URL-to-domain normalization and DNR rule generation.

**Files:**
- Create: `tests/domain.test.js`
- Create: `tests/rules.test.js`

**Verification:** Run `npm test -- --run`; expected RED before implementation.

## Task 3: Core helper implementation

**Objective:** Implement minimal domain normalization and rule generation.

**Files:**
- Create: `src/shared/domain.js`
- Create: `src/shared/rules.js`

**Verification:** Run `npm test -- --run`; expected GREEN.

## Task 4: Storage and background rule orchestration

**Objective:** Persist blocked domains, rebuild DNR rules, support pause and temporary allow state.

**Files:**
- Create: `src/shared/storage.js`
- Modify: `src/background/service-worker.js`

**Verification:** Unit-test pure helpers where possible; manual load extension afterward.

## Task 5: Popup MVP

**Objective:** Let user block current site and pause/resume all blockages.

**Files:**
- Create: `src/popup/popup.html`
- Create: `src/popup/popup.js`
- Create: `src/popup/popup.css`

**Verification:** Load extension, visit a site, popup shows normalized domain and block button.

## Task 6: Blocked page MVP

**Objective:** Show soft block page and slider-based temporary unblock.

**Files:**
- Create: `src/blocked/blocked.html`
- Create: `src/blocked/blocked.js`
- Create: `src/blocked/blocked.css`

**Verification:** Blocked domain redirects to page; slider unlocks for selected duration and reloads original URL.

## Task 7: Reminder content script

**Objective:** Display a non-blocking reminder after 10 minutes on temporarily allowed domains.

**Files:**
- Create: `src/content/reminder.js`
- Modify: `src/manifest.json`

**Verification:** For dev, allow shorter test delay constant if needed; production constant remains 10 minutes.

## Task 8: Browser smoke-test notes

**Objective:** Document local test procedure for Mac Chrome now and Windows Chrome/Firefox later.

**Files:**
- Create: `docs/MANUAL_TESTS.md`

**Verification:** Checklist covers install, block, bypass, pause, reminder, and cross-browser notes.
