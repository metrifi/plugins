---
name: personalization
description: "Build, verify, and measure website personalization on a MetriFi site: define behavioural personas (visited a page, clicked an element, arrived from a campaign, located in an area), swap content blocks into page slots for those personas, and A/B test whether personalizing actually helps. Use when someone asks to 'personalize the home page', 'show returning auto-loan visitors different content', 'set up a persona', 'add a placement', 'test whether personalization works', 'why is my personalization not firing', or 'read the personalization results'. Covers the whole loop: power check first, then personas and blocks, then a placement bound to a pre-registered experiment, then simulate to verify, then publish, then a pooled readout. Works for credit unions and community banks. NOT for A/B testing an ordinary page (that is a standard experiment), and NOT for CRM- or member-data-driven personalization (the platform deliberately holds no member data)."
---

# Personalization

Personalization on a MetriFi site means: recognize what a visitor did earlier, and show them something better because of it. A visitor who read the auto loan page on Tuesday sees an auto-loan hero when they come back to the home page on Friday.

The mechanism is **not** per-visitor rendering. Vercel middleware reads a cookie, resolves one persona, and rewrites the request to a page that was **already built** with that persona's content in it. The URL stays `/`. The response is a normal CDN cache hit. Nothing is rendered on demand, so this costs a few dollars a month across the whole 25-site fleet and does not slow the site down.

## The thing that makes this MetriFi and not a widget

**Personalization is measured by default.** When a placement runs in `measured` mode, matched visitors are randomly split: half get the personalized block, half get the ordinary default block everyone else sees. The difference between those two halves is the value of personalizing. Without that split you can report 40,000 personalized impressions and still have no idea whether any of it helped.

This matters more than it sounds, because personalization can lose. MetriFi's own A/B library says only 45% of tests reach significance and plenty go the wrong way. A personalization program with no control arm is a program that never finds out.

## Read this before you build anything

**Run `estimate-personalization-power` first.** It is one call and it frequently changes the plan.

Personalization splits traffic that is already thin. A persona qualifying 3% of a 250,000-pageview credit-union site produces about 3,000 exposed visitors a month, and detecting a realistic +20% on a low single-digit baseline needs tens of thousands per arm. On one site that is **years**, and GA4 deletes the event data long before it arrives.

The fix is almost always **pooling**: run the *same* placement on many sites under one experiment key. 15 months becomes 2 weeks. The tool returns `sitesNeededToResolveWithinHorizon`, which is the actionable number.

Two counterintuitive facts that come up constantly:

- **Rarer outcomes are weaker, not stronger.** Powering on funded loans instead of apply-clicks needs roughly 7x the sample for the same relative lift. Power on a proximal metric; treat the funded loan as a directional guardrail.
- **Hold back 50%, not 10%.** Power peaks at an even split; 90/10 needs about 2.5x the exposures for the same answer. There is also a physical reason here: the two arms are separate prebuilt files with independent CDN warmth, so a small control arm runs systematically colder and biases measured lift *upward*.

If the power check says no and pooling is not available, say so plainly and offer `mode: "always-on"` (ship it, claim no lift) rather than running a measured experiment that can never conclude.

## The workflow

### 1. Check feasibility

```
estimate-personalization-power
  baseline_rate: 0.031          # from GA4, on the metric you will test
  target_lift: 0.20
  monthly_qualified_per_site: 3000
  site_count: 25
```

### 2. Install the runtime (once per site)

```
enable-personalization  site: acme-cu  ga_measurement_id: G-XXXXXXX
```

Without `ga_measurement_id` the site still personalizes but reports no exposures, so no experiment can ever be read.

**Re-run this after the site launches.** While a site is preview-gated the middleware matcher must stay broad; once public it narrows to document requests. Leaving the gated matcher on a live site multiplies middleware invocations by roughly 40.

This installs mechanism only. It also returns the page-body refactor step, which is required: Astro pages are routes, not reusable modules, so a personalizable page must be split into `src/page-bodies/<name>.astro` with a thin route shim, and the variant route imports the same body. That is what stops a variant drifting from the canonical page.

### 3. Define the persona

```
set-persona
  site: acme-cu
  id: auto-loan-visitor
  label: "Auto loan researcher"
  priority: 10
  triggers: [{"type":"page","path":"/auto-loans/","mode":"prefix"}]
```

Trigger types: `page`, `click` (matches `[data-mf-signal="..."]`), `utm`, `geo`.

- `page`, `click`, `utm` persist as a short code in the visitor's cookie.
- `geo` is read live from request headers every time and never stored. It costs nothing and replaces a paid reverse-IP lookup.
- The freshness window is capped at 7 days. WebKit deletes script-written cookies after 7 days without interaction, and click triggers require a script-written cookie, so a longer window would be advertised but not delivered on a large share of real traffic. Do not promise a client 30 days.

**Exactly one persona resolves per request**, highest priority first, then id. This keeps prebuilt pages linear in the number of personas rather than exponential in slots.

### 4. Register the block

```
set-personalization-block
  site: acme-cu
  id: hero-auto-loan
  component: src/components/personalization/HeroAutoLoan.astro
  rates: ["auto-loan-apr"]
  disclosures: ["auto-apr-disclosure"]
```

Write the component itself with `write-files`. Declare `rates` and `disclosures` **accurately**: the publish gate checks the composed page. A block that states an APR *replaces* the default block, taking that block's disclosure off the delivered page, and Regulation Z applies to the advertisement as delivered. Every per-component check passes and the page is still wrong. This is the single most likely way to ship a compliance problem here.

### 5. Pre-register the experiment

```
create-personalization-experiment
  key: home-hero-auto-intent-v1
  name: "Auto-intent home hero"
  primary_metric: auto_loan_apply_click
  baseline_rate: 0.031
  target_lift: 0.20
  monthly_qualified_per_site: 3000
  site_count: 25
```

The key seeds arm assignment, so it is **immutable once running** — changing it re-randomizes every visitor and resets the sample to zero. It is also the pooling anchor: the same key on many sites is what makes the result readable.

### 6. Bind the placement

```
set-placement
  site: acme-cu
  id: home-hero
  page: "/"
  slot: hero
  mode: measured
  experiment_key: home-hero-auto-intent-v1
  variants: {"auto-loan-visitor": "hero-auto-loan"}
```

One page+slot may have only one running placement. Two randomizations over the same markup make both results unreadable.

### 7. Verify before publishing — always

```
simulate-personalization
  site: acme-cu
  journey: [{"path":"/auto-loans/","daysAgo":2}]
  path: "/"
  visitor_id: "test-visitor-1"
```

This runs the same resolver that ships to the edge, pinned by a cross-language parity test, so it is the answer rather than an approximation. Vary `visitor_id` to see both arms. Omit it to see a brand-new visitor.

Then `check-personalization`, then `publish-site`, then `set-personalization-experiment-status status: running`.

### 8. Read the results

```
get-personalization-results
  key: home-hero-auto-intent-v1
  observations: [{"site":"acme-cu","arm":"treatment","exposures":4210,"conversions":168}, ...]
```

Get the counts from GA4 by counting **distinct users** on the `mf_exposure` event (split by the event-scoped `mf_arm` and `mf_experiment` parameters) and on your conversion event for the same users. Count users on both, never sessions on one and users on the other.

## What the tools will refuse to do, and why you should not work around it

- **No lift number below the pre-registered sample.** Not a hedged one either, because a hedged number gets quoted without its hedge the moment it reaches a slide. One in twenty readouts at small n crosses p<0.05 by chance, and a fabricated lift in a MetriFi client report damages the one thing this company sells.
- **No per-client lift, ever.** Per-site output is direction only. Report pooled results as "across N institutions and M sessions".
- **Multiplicity correction when reading several experiments.** Pass them together via `family`. A 6-placement by 5-persona grid is 30 comparisons; reading them one at a time and reporting the winner pushes the true false-positive rate past 20%.
- **A running measured placement needs a passing power check.** If it fails, the honest options are: pool across more sites, widen the persona, pick a metric with a higher baseline, accept a larger target effect, or ship as `always-on` with no lift claim.

## Troubleshooting

**"My personalization is not firing."** Run `simulate-personalization` and read `resolutionTrace` — it says per trigger why each did or did not hit. The usual causes, in order: the signal is outside the 7-day window; there is no `visitor_id` yet (a brand-new visitor is excluded from both arms on their very first request, which is also why a geo-only persona cannot fire until the second pageview); the visitor is in the control arm and is *supposed* to see the default; or `enabled` is false.

**"The variant 404s."** The variant route must live at `src/pages/mfv/`, never under an underscore-prefixed directory. Astro's router skips underscore-prefixed names including directories, so `src/pages/_p/` builds zero pages and every rewrite 404s — and only for visitors who matched, so aggregate uptime looks perfect.

**"Results look too good."** Check the arms' cache-miss rates. A lopsided holdback makes the control artifact colder, and that TTFB penalty lands on control only, inflating measured lift in one direction.

**Rolling back.** `enable-personalization enabled: false` serves everyone the canonical page while preserving the whole config, reversible with one publish. Prefer it over deleting placements, which discards the arm history that makes the experiment readable.

## Out of scope

CRM- and member-data-driven personalization is deliberately not built. The platform holds no member data and takes no member identifiers, which is what keeps MetriFi out of every client's GLBA vendor file. If someone asks for it, the honest answer is that the credit union already knows who the member is at campaign send time, so the segment should be an address (a distinct prebuilt landing page URL in the campaign) rather than an assertion carried on the website.
