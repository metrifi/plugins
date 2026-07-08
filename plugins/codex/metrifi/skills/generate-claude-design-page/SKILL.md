---
name: generate-claude-design-page
description: "Make a website page IN Claude Design — Claude Code drives Claude Design to generate the page against the client's established design system — then build it in the site repo. STAGE 2 (website dev stage 2 of the Website Development Process), used narrowly, for exactly two cases: (a) creating the client's PROTOTYPE page (the visual model every later page follows), or (b) a deliberate one-off page that intentionally breaks the established system. Do NOT use it for an ordinary follow-on page once an approved prototype already exists — that is page-design-process (stage 3, no Claude Design). The routing signal is STATE, not wording: if no approved prototype exists yet for this client, creating it is this skill; if one already exists, a bare 'design the [X] page' means stage 3. Triggers: 'make the prototype page', 'design the first/prototype page for [client]', 'we need a prototype', 'design a one-off page that breaks the system'. Requires the design system to exist first (run generate-claude-design-system if it doesn't) and the local Claude Design engine (@pro-vi/designer). Works for credit unions and community banks."
---

# Generate a Claude Design page (stage 2 of 3)

Claude Code drives Claude Design to generate a **page** on the client's established design system, then builds it in the site repo. Stage map:

1. **generate-claude-design-system** — establish the system first. Uses Claude Design.
2. **generate-claude-design-page** ← you are here. The prototype, or a deliberate one-off. Uses Claude Design.
3. **page-design-process** — every other page, in code. No Claude Design.

**Use this narrowly.** Once an approved prototype exists, ordinary pages are stage 3. If there's no design system yet, run stage 1 first — this stage inherits the system, it does not create one.

## Prerequisites

- **An approved design system must already exist** for this client (from stage 1, generate-claude-design-system). This stage builds a page *on* that system — it does not create one. Check with `metrifi_get_brand`; if there's no resolved brand yet, or the site is brand-new, run stage 1 first.
- The local Claude Design engine (`@pro-vi/designer`) — the process doc covers setup; see also the plugin README.

## The process lives in one place

Fetch the canonical stage-2 process from the MetriFi knowledge store and follow it end to end:

`metrifi_get_doc("docs/generate-claude-design-page.md")`

(Through the gateway the tool is `sitebuilder__metrifi_get_doc`.) That doc is the single source of truth — preflight, fetching the conversion rubric with test citations, driving Claude Design, the acceptance check, handoff, building in code per the Page Design Process conventions, QA, and the approval gate. Read it fresh each run.

## Guardrails (hold regardless)

- Design decisions cite the A/B evidence (`metrifi_get_proven_pattern`, `metrifi_get_anti_patterns`, test IDs); if the data is silent, say so — never invent citations.
- Every rate renders through the managed rate components; never type a rate number into a page.
- Requires the local `@pro-vi/designer` engine; if it can't come up, say so and stop — never fake a generated design.
- STOP at the approval gate with the preview URL. Never publish without explicit human approval.
