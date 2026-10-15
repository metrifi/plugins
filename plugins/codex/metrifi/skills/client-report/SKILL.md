---
name: client-report
description: "Produce a measured, evidence-cited website analysis for a credit union or community bank. Audits an institution's EXISTING live site (technical SEO, schema and entity integrity, branch duplication, conversion structure, AI-search visibility from MetriFi GEO, performance when the host can measure it), grounds every recommendation in MetriFi's A/B test library including the losses, and renders it as a client-facing report, a password-gated page on reports.metrifi.com when you have access to it. Use when someone asks to 'analyze [institution]'s website', 'audit example.com', 'build the client report for [client]', 'why aren't they in AI answers', 'put together the proposal report', or hands over a financial-institution URL plus client questions. Works for MetriFi staff or an institution auditing its own site; what it cannot measure is reported as not scored. NOT for designing or building pages, which is generate-claude-design-system, generate-claude-design-page, or page-design-process."
---

# Client report

Audit a financial institution's **existing live website**, answer the questions they actually asked, and deliver the result as a client-facing report. Every number in the report is measured in this run, by a MetriFi tool or by your host's own web access; every design recommendation is cited to a real MetriFi A/B test or explicitly marked as having none. What you could not measure is reported as not scored, with what access would unlock it.

Where this sits: the three design stages build a MetriFi site. This skill looks at the site the client has **today**. It is typically what runs first, before anyone has agreed to a build, and it is what a prospect reads.

## What you need

- **A live URL for the institution** and, ideally, the specific questions the client asked (a prior audit, an email, a discovery call). The questions drive the report's structure; without them, ask what they want answered before measuring anything.
- **The MetriFi connection.** That is the only hard requirement beyond the URL. It supplies the A/B test library, the AI-search visibility data, a live-site brand read, and the `reports` site.
- **Optional, whatever your host has:** a way to read live web pages (browsing, or a fetch that returns raw HTML), and a way to run a page-performance profiler. Each one adds dimensions to the report; neither is needed to produce a valid one.

## The rules and the report shape come from one doc

Fetch the canonical process from the MetriFi knowledge base:

`get-doc("docs/client-report-process.md")`

(If that path is missing, `list-docs` returns the available paths.) Use it for four things, fresh each run: the rules every stage follows (Stage 0, H1 to H12), the scoring rubric and the partial-dimension rule (Stage 2), the report structure and tone (Stage 3), and publishing (Stage 5). Don't reconstruct those from memory or from an earlier report.

Read its evidence-collection stage (Stage 1) for **what** to measure and why, not **how**. Its scripts assume a local shell, Node, and a local Chrome with Lighthouse. Those are one way to collect, not a requirement: collect with what you have (below) and score whatever you could not collect as `NOT SCORED` under its own partial-dimension rule. Where the doc names a tool with an older `metrifi_` prefix, use the current name (`search-tests`, `get-test`, `get-proven-pattern`, `get-anti-patterns`, `get-site`, `list-site-files`, `write-files`, `get-compliance`, `get-preview-url`, `publish-site`). Where it names an external AI-visibility service, use the MetriFi GEO tools below. Its worked examples describe a real institution; never carry that institution's name, figures, or findings into a report.

## Collect the evidence

Keep a findings ledger as you go, in the conversation or in a file if your host can write one: every number with the date collected, the tool or method that produced it, and the URL it came from. **If you cannot say where a number came from, it does not go in the report.**

### Always available: MetriFi tools

- **A/B evidence (the report's differentiator).** For each recommendation: `search-tests` with at least three phrasings, then `list-proven-patterns` and `get-proven-pattern` for the page type, and `get-anti-patterns`. Pull each candidate citation with `get-test` for its four fields (test ID, what was tested, measured lift, confidence). Log each query and its result count; a zero-result search alone does not prove a gap.
- **The live site's brand signals.** `extract-brand(url)` fetches the public site and returns its favicon, theme-color, og:image, and font hints. That covers the Open Graph image and favicon checks even with no other web access.
- **AI-search visibility, from MetriFi GEO.** Only if the institution already has a MetriFi team with a GEO campaign for its market:
  - `list-teams`, then `list-campaigns` and `get-campaign` (the campaign's location and keywords are the market the numbers speak for).
  - `get-org-visibility`: organizations ranked by visibility percentage and mention count in that campaign, the client against its competitors.
  - `list-prompts`: each prompt's share of LLM responses naming the client. The 0% prompts are content gaps; the 100% prompts are what is working.
  - `list-responses` and `get-response`: the responses themselves. Use them for the doc's split-entity check (the client's former or legal name ranked as a separate competitor) and to compute a union, never a sum, before printing any unification ceiling.
  - `get-ai-user-bot-traffic`: visits from user-driven AI agents (ChatGPT-User, Claude-User, Perplexity-User) and the pages they hit. It needs AI Traffic tracking on the team; it measures AI agents reaching the site, which is the only first-hand evidence on crawler access this audit can have (rule H9).
  - `get-experiment-insights`: which kinds of change correlate with visibility gains across finished MetriFi experiments. Cite it as correlation across experiments, never as a forecast for this client. If the call is refused, leave it out.

  If there is no team or campaign for the institution, AI visibility is `NOT SCORED`, and the deeper-analysis row says a tracked GEO campaign for the market is what would measure it. Do not create a campaign or run prompts inside the audit: that spends the team's quota and nobody asked for it. If the operator wants one, that is the `exp-research` skill, started by them.
- **Analytics, only if connected.** If `list-connections` shows a Google Analytics property on the team, `ga-page-users` gives real page paths and users, and `ga-outbound-link-users` gives clicks off-site, which is the off-origin conversion trace the doc asks for. Without a connection, conversion findings are structural only, and the report says so.

### When your host can read web pages

Use it for the public-web passes in the doc: title and meta, Open Graph, headings, JSON-LD and whether what it references resolves, robots.txt and sitemaps, duplicate URL clusters, branch-page duplication, and the conversion structure of product pages. Pace requests and do not hammer the client's site.

Two limits to record honestly:

- **Served HTML versus rendered DOM.** Several sub-measures depend on the difference. If your host returns only one of the two (a browser shows the rendered page; a fetch shows the served HTML), score what that view supports and mark the sub-measures needing the other as not captured.
- **Refusals are facts about your tooling.** A 403 or bot challenge to your host is not evidence that AI crawlers are blocked (rule H9).

With no way to read pages at all, those dimensions are `NOT SCORED`. You may ask the operator for a saved copy of the pages; never fill them in from general knowledge.

### Optional: performance and accessibility

Run a performance profile (Lighthouse or equivalent, several runs per page, mobile) only if your host can run one against the live site. Do not substitute a hosted, quota-limited API. When it cannot, Performance is `NOT SCORED`, and Accessibility is scored only if the partial-dimension rule allows it from the sub-measures you did capture (alt coverage, headings). Say which in the report: "Performance was not measured in this run; it needs a page-performance profiler run against the live site." That note goes in the report itself, not only in your working notes.

## Guardrails (hold regardless)

- **Never score what you did not measure.** No estimated Lighthouse numbers, no "typical" TTFB, no invented traffic or conversion rates. If a figure came from a tool, name the tool and the run; if it came from nowhere, it does not go in the report. Anything you could not measure gets stated plainly as a limitation with what access would be needed, not quietly omitted or filled in.
- **Never invent test IDs.** Every A/B citation resolves to a real test in the library with its real lift and confidence. If the library is silent on a recommendation (performance, mobile-specific behavior, carousels, and page length all have zero coverage today), say so in the report and frame the point as engineering hygiene, design principle, or hypothesis, with **no MetriFi percentage attached**. Fabricating or borrowing a lift figure for an uncovered claim is the single worst failure mode here.
- **Publish the losses.** Losses, likely losses, and sub-80%-confidence nulls that bear on a recommendation go in the client-facing version, not just the internal notes. Where the strongest evidence for a page is a loss, lead with that. Where a proposed redesign resembles a test that failed, name the test. The report's credibility is the product.
- **Never approximate AI visibility.** No visibility percentage from your own chatbot prompting and no competitor ranking you did not pull from `get-org-visibility`.
- **Distinguish measurement from inference, in the report's own words.** Label every inference as one.
- **Publish is human-gated.** Build on the draft, share the gated draft URL, and never `publish-site` on the `reports` site without the user's explicit approval. The client sees it only when a human says so.
- **The report is password-gated, per client.** Each client's report gets its own password entry; no shared credential, no public URL, no client able to read another client's report. Deliver the URL and the password together, and never put the password in a URL parameter in anything you publish.
- **Client-facing tone.** Objective, specific, and unhedged about what is broken, without contempt for the incumbent vendor or the client's staff. Findings are about the site, not about people.

## Delivering it

- **With write access to the `reports` site** (`get-site("reports")` succeeds): follow the doc's Stage 5 with `list-site-files`, `read-file`, `write-files`, `get-compliance`, and `get-preview-url`, then stop for approval before `publish-site`.
- **Without it:** hand the report over in the conversation (or as a file, if your host can write one) and say which sections were omitted for lack of access and what would unlock each. A smaller, fully sourced report is the correct outcome; a complete-looking report containing unmeasured numbers is not.

Detect access, do not assume it. A tool that is missing or refused is a normal outcome: note it and continue.

## When NOT to use this

- Designing or building pages on a MetriFi-built site → generate-claude-design-system, generate-claude-design-page, page-design-process.
- Copy or layout edits to a report that already exists → a direct Site Builder edit on the `reports` site, not this skill.
- Tracking or improving AI-search visibility with no website audit → the GEO experiment skills (`start`).
- A backlink, paid-media, or analytics audit when the tools for those are not connected. Say what is needed and stop; do not substitute inference for data.
