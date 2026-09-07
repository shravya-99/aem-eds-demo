# Citi View All Credit Cards — Single Page Migration Plan

Migrate **`https://www.citi.com/credit-cards/view-all-credit-cards`** into this AEM Edge Delivery Services project as authored content (sections + blocks), scoped to **page body content only** (no navigation, header, footer, or design-token/styling extraction), using the **standard content migration flow** (Commerce plugin not enabled).

> **⚠️ Cannot start — the session is still in Plan mode.** Plan mode blocks all file writes and command execution, so the migration genuinely cannot run yet. I've retried, and the block is enforced by the harness, not something I can override from here. Plan mode is toggled in **your** interface. **Please switch off Plan mode using the plan toggle in your UI**, then send any short message (e.g. "go") — that single action is all that's needed, and I'll run every step below immediately without further questions.

## Current State (inspected read-only)

- ✅ Workspace confirmed; standard EDS scaffold present (`blocks/`, `scripts/`, `styles/`, `content/`).
- ✅ `.migration/project.json` exists (site `aem-eds-demo`, org `shravya-99`) — Step 1 will normalize it to the workflow's expected schema.
- ✅ No prior migration artifacts — **fresh run**, nothing to resume or overwrite.
- ✅ Task tracking created (7 workflow tasks).

## Approach

Scrape the source page → classify into a page template → analyze structure → map the repeating credit-card grid to a cards block variant → generate import infrastructure (parsers/transformers) → run the import → verify in local preview against the original.

## Checklist

- [ ] **0. Initialize migration plan** — write `migration-work/migration-plan.md` *(blocked by Plan mode)*
- [ ] **1. Project Setup** — normalize/create `.migration/project.json` (project type + block library URL) via project-expert
- [ ] **2. Identify Page Templates** — run classify pipeline on the URL → `tools/importer/page-templates.json`; single URL seeds one template (auto-selected)
- [ ] **3. Page Analysis** — analyze structure → `migration-work/authoring-analysis.json`; identify blocks (focus on card grid)
- [ ] **4. Block Mapping** — populate DOM selectors / block variants into `page-templates.json`
- [ ] **5. Import Infrastructure** — generate block parsers + page transformers (`tools/importer/parsers/`, `transformers/`)
- [ ] **6. Content Import** — generate import script, run import → `content/*.plain.html` + report
- [ ] **7. Preview & verify** — render in local preview, compare against original, iterate to fix gaps
- [ ] **8. Lint** — `npm run lint` and fix issues

## Out of Scope (this pass)

- Navigation / header instrumentation
- Footer migration
- Design-token extraction and block styling
- Multi-page / template-wide migration

## Considerations & Risks

- **Dynamic content:** Citi's listing may be JS-rendered / personalized; the scrape captures the rendered DOM as served. Interactive filtering migrates as static content.
- **Product grid modeling:** The repeating card items drive the block choice; mapping validated before infrastructure generation.
- **Target path:** Derived from the source URL unless you specify one.

## Decisions Locked

- ✅ Scope: page body content only
- ✅ Flow: standard content migration (Commerce plugin **not** enabled)

---
*Everything is queued and ready. **Execution requires Execute mode.** The workflow is stalled at Step 0 solely because Plan mode is on — please toggle it off in the UI and reply "go", and I'll immediately begin with Step 1 (Project Setup).*
