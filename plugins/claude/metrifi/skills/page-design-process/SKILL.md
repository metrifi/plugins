---
name: page-design-process
description: "Design and build a new page for a financial-institution website the MetriFi way — grounded in MetriFi's A/B test data, using Claude Code only (no Claude Design). This is STAGE 3 (website dev stage 3 of the Website Development Process), the workhorse and the default way pages get built: used after the site's design system and a prototype page already exist and are approved, so new pages inherit the prototype's visual system and the project's design tokens. Use when someone asks for an additional page on a site whose design system and prototype already exist — 'design the HELOC page', 'PDP for savings' (PDP = Page Design Process), 'add a youth-checking page', 'design another product page'. If no design system or prototype exists yet (e.g. a brand-new client, or the very first/prototype page), this is the WRONG stage — use generate-claude-design-system then generate-claude-design-page. Works for credit unions and community banks, and is safe for an institution editing its own site."
---

# Page Design Process (stage 3 of 3)

Design and build a new page **in code with Claude Code**, grounded in MetriFi's A/B test data. No Claude Design. Where this sits:

1. **generate-claude-design-system** — establish the client's design system. Uses Claude Design.
2. **generate-claude-design-page** — build the approved prototype page. Uses Claude Design.
3. **page-design-process** ← you are here. Build every other page, extrapolating from the approved system + prototype. Claude Code only.

This is the default, highest-volume way pages get built. Claude Design's job was to establish the system and one prototype; from there, Claude Code extrapolates each new page from that prototype without calling Claude Design again.

## Prerequisites

- **A `design-system`** (the site's brand tokens) and a **`prototype-page`** (the visual/structural model) exist and are approved. If they don't, this is the wrong stage: use generate-claude-design-system, then generate-claude-design-page, first. Confirm the project variables (`docs/page-design-process.md` §"Project variables"); if either isn't set, ask.

## The process lives in one place

The full, canonical Page Design Process — order of operations, use-case analysis, applying A/B insights, the written recommendation, designing in code against the prototype + design system, the rationale doc, the QA pass, and the lifecycle wrap-up — is the Site Builder's own methodology doc. **Read and follow it end to end:**

`metrifi_get_doc("docs/page-design-process.md")`

That doc is the single source of truth for the steps; this skill is the discoverable entry point that frames *when* to use it (stage 3, prerequisites above) and the guardrails below. Don't restate or fork the process here — follow the doc.

## Guardrails (these hold regardless)

- **Cite the evidence.** Read the matching guide in `docs/ab-test-data/proven-patterns/` for the page type plus the anti-patterns guide, and cite specific test IDs for design claims. If the data is silent on a decision, say so; never fabricate A/B citations or dress intuition up as data.
- **Inherit, don't reinvent.** New pages use the project's `design-system` and follow the `prototype-page`'s visual language. Import global organisms and project templates; never inline chrome or fork a template.
- **Rates are managed.** Never type a rate number into a page — every rate renders through the managed rate components. See `docs/rate-management.md`.
- **Compliance is a gate.** The site's compliance record must be resolved and its required disclosure elements present (client-approved text or a tracked placeholder); the server refuses to publish while `COMPLIANCE_UNRESOLVED`. See the Compliance section of `docs/page-qa.md`.
- **QA before done.** The page passes the `docs/page-qa.md` gate against the live preview and the lifecycle wrap-up (PDP steps 10–11). Those docs own the checklist; don't restate it here.
- **Publish is human-gated.** Preview with `metrifi_get_preview_url`; never `metrifi_publish_site` without the user's explicit approval.

## When NOT to use this

- No design system / prototype yet → generate-claude-design-system then generate-claude-design-page.
- A page that intentionally breaks the established system enough to warrant fresh visual exploration → generate-claude-design-page (a deliberate one-off).
- A human wants to taste design variants interactively → designer-loop.
