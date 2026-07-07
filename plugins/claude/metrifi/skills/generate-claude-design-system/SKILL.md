---
name: generate-claude-design-system
description: "Create a client's design system in Claude Design — Claude Code drives Claude Design to generate the colors, typography, and component styles from the institution's brand — then land it as the site's brand tokens through the MetriFi Site Builder. This is STAGE 1, the prerequisite to everything else: run it first for a new client, before any page is designed. When it finishes it lands the tokens, records the institution's compliance identity, and pauses for your approval, then offers to make the prototype page. Requires the local Claude Design engine (@pro-vi/designer). Use when standing up a brand-new client: 'create the design system for [client]', 'generate a Claude Design system', 'stand up this credit union's design system from their website', or when handed a new institution URL to begin a build. NOT for editing existing brand tokens or swapping a color on a site that already has a design system — that's a direct Site Builder brand edit, not this heavyweight Claude-Design-driven skill. Works for credit unions and community banks. Next stage: generate-claude-design-page (the prototype). For building ordinary pages once a system + prototype exist, that's page-design-process (no Claude Design)."
---

# Generate a Claude Design system (stage 1 of 3)

Claude Code drives Claude Design to produce a client's **design system**, then lands it as the site's brand tokens through the MetriFi Site Builder. The three stages:

1. **generate-claude-design-system** ← you are here. Establish the system. Uses Claude Design.
2. **generate-claude-design-page** — build the approved prototype page. Uses Claude Design.
3. **page-design-process** — build every other page from the approved system + prototype. No Claude Design.

Do not skip ahead: a page designed before the system exists inherits whatever design system happens to be attached to the Claude Design project.

## The process lives in one place

Fetch the canonical stage-1 process from the MetriFi knowledge store and follow it end to end:

`metrifi_get_doc("docs/generate-claude-design-system.md")`

(Through the gateway the tool is `sitebuilder__metrifi_get_doc`.) That doc is the single source of truth — preflight, brand-input resolution, driving Claude Design, landing tokens with `metrifi_set_brand`, compliance identity, and the approval gate. Don't reconstruct the steps from memory; read it fresh each run.

## Guardrails (hold regardless)

- Requires the MetriFi connection and, for this stage, the local `@pro-vi/designer` engine (the doc covers setup). If the engine can't come up, say so and stop — never hand-fake a design system.
- The design system reflects the CLIENT's brand; a client site never consumes MetriFi's own brand package.
- Never invent legal/disclosure text; compliance facts are resolved and recorded, wording is client-approved or a tracked placeholder.
- STOP at the approval gate: show the preview, then offer stage 2 (the prototype). Never publish anything without explicit human approval.
