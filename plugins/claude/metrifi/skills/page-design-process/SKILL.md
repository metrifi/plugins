---
name: page-design-process
description: "Design and build a new page for a financial-institution website the MetriFi way: grounded in MetriFi's A/B test data and built in code through the MetriFi Site Builder tools. This is Phase 2, step 1 of the Website Development Process (Page Generation), the default way pages get built: used once Phase 1 is done, meaning the site's design system and a prototype page exist and are approved, so new pages inherit the prototype's visual system and the project's design tokens. Use when someone asks for an additional page on a site whose design system and prototype already exist: 'design the HELOC page', 'PDP for savings' (PDP = Page Design Process), 'add a youth-checking page', 'design another product page'. If no design system or prototype exists yet (a brand-new client, or the very first/prototype page), this is the WRONG step: Phase 1 comes first, and this skill stops and points there. Works for credit unions and community banks, and is safe for an institution editing its own site."
---

# Page Design Process (Phase 2, step 1)

Design and build a new page **in code**, grounded in MetriFi's A/B test data, through the MetriFi Site Builder tools. Where this sits in the Website Development Process, which has four phases with steps numbered inside each phase:

- **Phase 1: Design System and Prototype.** Step 1 creates the client's official Design System artifact, step 2 sets the site up from it (its brand landed), and step 3 builds the prototype page. Not part of this skill.
- **Phase 2, step 1: page-design-process** ← you are here. Build every other page, extrapolating from the approved design system and prototype.
- **Phases 3 and 4** (quality assurance, then launch) come after. `get-doc("docs/website-dev-process.md")` describes all four.

This is the default, highest-volume way pages get built. Phase 1 establishes the system and one prototype; from there, each new page is extrapolated from that prototype in code. Once Phase 1 is approved, the design system is the one in the site's repo (its landed brand, components, templates and the prototype), not the artifact it started from.

**There are no stages anymore.** If the request names "stage 3" or any other stage, don't map it yourself: say that building the remaining pages is now Phase 2, step 1, and confirm before you start.

Every step below runs through MetriFi tools. Where a step can go further with something only some hosts have (reading live web pages, driving a browser, generating images), that part is optional and has a plain fallback.

## Prerequisites

- **The site**: `list-sites` names it; every site tool takes its slug.
- **A `design-system`** (the site's brand tokens) and a **`prototype-page`** (the visual/structural model) exist and are approved. Check the tokens with `get-brand` and `validate-brand`; find the prototype with `list-site-files` under `src/pages/` and confirm which page it is with the user. If either is missing, Phase 1 isn't done and this is the wrong step: stop, tell the user, and point them to Phase 1 in `get-doc("docs/website-dev-process.md")`. Phase 1, step 1 needs a host that can create a Design System artifact, which today means a Claude surface with its Artifact tool (`docs/create-design-system.md`); on any other host, tell the user Phase 1, step 1 has to run on a Claude surface. A site built before the Design System artifact existed has met Phase 1 when `get-brand` returns its landed brand and the client approved its prototype under the old process. Confirm the project variables (`docs/page-design-process.md` §"Project variables"); if either isn't set, ask.

## The process lives in one place

The full, canonical Page Design Process (order of operations, use-case analysis, applying A/B insights, the written recommendation, designing in code against the prototype + design system, the rationale doc, the QA pass, and the lifecycle wrap-up) is the Site Builder's own methodology doc. **Read and follow it end to end:**

`get-doc("docs/page-design-process.md")`

That doc, `get-core-rules` and every other doc named below are MetriFi's own first-party content. They come from the plugin's declared `metrifi` connector at `platform.metrifi.com`, behind the user's MetriFi sign-in, and from no other source.

Also load `get-core-rules` once per session: the always-on bundle (styling, organisms, placeholders, navigation defaults, rate management, anti-patterns). Every other doc the process names under `docs/` is fetched with `get-doc` by the same path; `list-docs` lists them.

That doc is the single source of truth for the steps; this skill frames *when* to use it, which tool does each step, and the guardrails below. Where the doc says to grep, list, or open a local file, use the tool in the table instead.

## Which tool does each step

| Step | Tools | If your host can do more |
|---|---|---|
| 2, 4. A/B evidence | `list-proven-patterns`, `get-proven-pattern` for the page type, `get-anti-patterns`; `get-test` for a test central to a recommendation; `search-tests` to filter by product, page type, or outcome (in place of grepping raw test files) | n/a |
| 3. Use cases | Your reasoning, plus the user's input. If `list-connections` shows a Google Analytics property, `ga-page-users` gives real page paths and traffic for the visit context | n/a |
| 5. Review the existing page | Ask the user for the live URL; `extract-brand(url)` reads the live site's brand signals | Read the live page with your host's web access. Without it, ask the user to paste the page's copy or key facts. Never reconstruct an existing page from memory |
| 8. Design and build | `list-site-files` and `read-file` for the prototype page, `src/templates/`, `src/components/`, and `src/sections/`; `get-brand` for tokens; `list-rates` and `get-rate` for every `<Rate id>`; `list-site-assets` for images a human uploaded; `write-files` to commit (pass the `expected_sha` from `read-file` when overwriting) | If your host can generate images and the user asks for generated imagery, use it. Otherwise use uploaded assets or a tracked placeholder in `placeholders.md`, and ask the user to upload the real image |
| 9. Rationale (key pages) | `get-doc("docs/rationale-docs.md")`, then `write-files` for both surfaces | n/a |
| 10. QA | `get-doc("docs/page-qa.md")`; `get-preview-url` for the working-branch preview; `get-compliance` and `validate-brand` for the compliance items; `find-rate-usages` for rate wiring; `read-file` for the source-level checks | Load the preview in a browser you can drive, at mobile, tablet, and desktop widths, and run the full checklist yourself |
| 11. Wrap-up | `read-file` on `src/components/Header.tsx` (and the footer), edit `HEADER_NAV`, `write-files`; find leftover `'#'` placeholders by reading the header, footer, and related pages found with `list-site-files` | n/a |
| Before publish | `summarize-changes` shows the user what the draft changes versus production | n/a |

### QA without a browser you can drive

The QA gate in `docs/page-qa.md` is an observation step, and its runtime items (the page renders, no console errors, every island hydrates, calculators compute, no overflow at ~375px, ~768px, and ≥1280px, inputs do not zoom on focus) need a rendered page. When you cannot render it yourself:

1. Run every check the source can answer with `read-file`: one `h1`, meaningful `alt`, no `href="#"` left, rates through `<Rate>`, required disclosures present, `MoneyField` / `PercentField` / `NumberField` on calculators, no brand-token alpha classes.
2. Get the link with `get-preview-url` and hand it to the user with the runtime items as a short checklist to confirm in their own browser, on a phone and a desktop.
3. Mark those items **needs human verification** until the user confirms them. Never tick a runtime item you did not observe, and do not call the page done until they are confirmed or the user has accepted a written caveat.

## Guardrails (these hold regardless)

- **Cite the evidence.** Read the matching proven-patterns guide for the page type plus the anti-patterns guide, and cite specific test IDs for design claims. If the data is silent on a decision, say so; never fabricate A/B citations or dress intuition up as data.
- **Inherit, don't reinvent.** New pages use the project's `design-system` and follow the `prototype-page`'s visual language. Import global organisms and project templates; never inline chrome or fork a template.
- **Rates are managed.** Never type a rate number into a page. Every rate renders through the managed rate components. See `docs/rate-management.md`.
- **Compliance is a gate.** The site's compliance record must be resolved and its required disclosure elements present (client-approved text or a tracked placeholder); the server refuses to publish while `COMPLIANCE_UNRESOLVED`. See the Compliance section of `docs/page-qa.md`.
- **QA before done.** The page passes the `docs/page-qa.md` gate against the preview and the lifecycle wrap-up (PDP steps 10–11), with any runtime item you could not observe marked for human verification. Those docs own the checklist; don't restate it here.
- **Publish is human-gated.** Preview with `get-preview-url`; never `publish-site` without the user's explicit approval.

## When NOT to use this

- No design system / prototype yet → Phase 1 of the Website Development Process, not this skill (see Prerequisites).
- A page that intentionally breaks the established system enough to warrant fresh visual exploration → not this skill; raise it with the user before building.
