---
name: client-report
description: "Produce a measured, evidence-cited website analysis for a credit union or community bank and land it as a password-gated page on reports.metrifi.com. This is the diagnostic/sales-side counterpart to the website build stages: it audits an institution's EXISTING live site (performance, technical SEO, schema and entity integrity, branch/location duplication, conversion structure, AI visibility), grounds every recommendation in MetriFi's A/B test library including the losses, and renders it as a client-facing report. Use when someone asks to 'analyze [institution]'s website', 'audit fvsbank.com', 'build the client report for [client]', 'answer the prospect's questions about their site', 'why is their site slow / not showing up in AI answers', 'put together the proposal report', or hands over a live financial-institution URL plus a list of questions from the client. Works whether the runner is MetriFi staff (full Paraloom + platform + reports-repo access) or the institution itself running it against its own site (degrades to the public-web + A/B-library subset). NOT for designing or building pages on a MetriFi site (that is generate-claude-design-system / generate-claude-design-page / page-design-process), NOT for editing an existing published report's copy (that is a direct Site Builder edit on the `reports` site), and NOT a substitute for a backlink or analytics audit when the tools for those are unavailable."
---

# Client report

Audit a financial institution's **existing live website**, answer the questions they actually asked, and publish the result as a password-gated page on `reports.metrifi.com`. Every number in the report is measured first-hand in this run; every design recommendation is cited to a real MetriFi A/B test or explicitly marked as having none.

Where this sits: the three design stages build a MetriFi site. This skill looks at the site the client has **today**. It is typically what runs first, before anyone has agreed to a build, and it is what a prospect reads.

## Prerequisites

- **A live URL for the institution** and, ideally, the specific questions the client asked (a prior audit, an email, a discovery call). The questions drive the report's structure; without them, ask what they want answered before measuring anything.
- **The MetriFi connection**, for the A/B test library (`metrifi_search_tests`, `metrifi_get_proven_pattern`, `metrifi_get_anti_patterns`) and for the `reports` site itself.
- **A real browser you can drive** (Puppeteer against local Chrome) and **Lighthouse installed to a local prefix**. Both are load-bearing: the client's edge will refuse plain HTTP clients, and the hosted PageSpeed API is quota-limited. The process doc covers the exact invocation.
- **Optional, staff-only:** Paraloom (AI visibility), the platform directory, CRM context, and write access to the `reports` site. Their absence changes the report's scope, not its validity. See "Running without staff access."

## The process lives in one place

Fetch the canonical process from the MetriFi knowledge store and follow it end to end:

`metrifi_get_doc("docs/client-report-process.md")`

(Through the gateway the tool is `sitebuilder__metrifi_get_doc`.) That doc is the single source of truth: scoping to the client's questions, the measurement passes and their tooling traps, the evidence pass against the A/B library, the before/after prototype, report structure and tone, and the password-gated publish. Don't reconstruct the steps from memory or from an earlier report; read it fresh each run.

## Guardrails (hold regardless)

- **Never score what you did not measure.** No estimated Lighthouse numbers, no "typical" TTFB, no invented traffic or conversion rates. If a figure came from a tool, name the tool and the run; if it came from nowhere, it does not go in the report. Anything you could not measure gets stated plainly as a limitation with what access would be needed, not quietly omitted or filled in.
- **Never invent test IDs.** Every A/B citation resolves to a real test in the library with its real lift and confidence. If the library is silent on a recommendation (performance, mobile-specific behavior, carousels, and page length all have zero coverage today), say so in the report and frame the point as engineering hygiene, design principle, or hypothesis, with **no MetriFi percentage attached**. Fabricating or borrowing a lift figure for an uncovered claim is the single worst failure mode here.
- **Publish the losses.** Losses, likely losses, and sub-80%-confidence nulls that bear on a recommendation go in the client-facing version, not just the internal notes. Where the strongest evidence for a page is a loss, lead with that. Where a proposed redesign resembles a test that failed, name the test. The report's credibility is the product.
- **Distinguish measurement from inference, in the report's own words.** A 403 to your scraper is bot-manager fingerprinting, not proof that AI crawlers are blocked; those crawl from verified IP ranges. Claims about crawler access require server logs. Apply the same discipline to every inference: label it.
- **Read the served HTML separately from the rendered DOM.** Findings that only exist in one of the two are real findings and are frequently the most valuable ones in the report. Never audit markup from the rendered DOM alone.
- **Publish is human-gated.** Build on the draft, share the gated draft URL, and never `metrifi_publish_site` on the `reports` site without the user's explicit approval. The client sees it only when a human says so.
- **The report is password-gated, per client.** Each client's report gets its own password entry; no shared credential, no public URL, no client able to read another client's report. Deliver the URL and the password together, and never put the password in a URL parameter in anything you publish.
- **Client-facing tone.** Objective, specific, and unhedged about what is broken, without contempt for the incumbent vendor or the client's staff. Findings are about the site, not about people.

## Running without staff access

The skill is meant to be run by the institution against its own site, so it must degrade cleanly rather than fail:

- **Detect, do not assume.** Attempt the staff-only reads (Paraloom, platform directory, the `reports` site). If a tool is absent or returns unauthorized, note it and continue.
- **Always available:** the full public-web measurement pass (performance, served HTML and rendered DOM, schema, duplication, conversion structure) and the A/B evidence pass. That is the majority of the report and it stands on its own.
- **Staff-only sections are dropped, not faked:** AI-visibility ranking and competitive share, cross-tenant comparisons, CRM/engagement history, and publishing to `reports.metrifi.com`. Never approximate an AI-visibility figure from general reasoning, and never present a competitor ranking you did not pull from Paraloom.
- **Without the `reports` site**, deliver the report as a local markdown file or an artifact and say which sections were omitted for lack of access and how to obtain them. Ending with a smaller, fully-sourced report is the correct outcome; ending with a complete-looking report containing unmeasured numbers is not.

## When NOT to use this

- Designing or building pages on a MetriFi-built site → generate-claude-design-system, generate-claude-design-page, page-design-process.
- Copy or layout edits to a report that already exists → a direct Site Builder edit on the `reports` site, not this skill.
- A pure AI-visibility engagement with no website audit → the Paraloom skills.
- A backlink, paid-media, or analytics audit when the tools for those are not connected. Say what is needed and stop; do not substitute inference for data.