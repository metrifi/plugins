# Methodology rules: what we learned the hard way

Each rule below comes from a specific failure or near-miss on a real experiment. Do not relax one
without an equally specific reason. The rule exists because the alternative wasted client time or
risked publishing an article that did not deliver lift.

Rules are grouped by the phase they bite in, so the numbers below are not in sequence. Rule numbers
are stable and are the way to cite a rule. Two rules (17 and 18) are retired because the MetriFi
platform now owns what they described; their numbers are kept as tombstones so older references
still resolve.

The shape is the same every time: **The trap** (what goes wrong), **The rule** (what to do
instead), **Where it came from** (the incident that bought the lesson).

---

## Campaign scoping

### Rule 1: measured search demand is the only demand proxy

**The trap:** Google's AI Mode produces a confident cited answer for nearly any answerable query.
That is a default behavior, not proof real people are asking. Treating a rich AI answer as a
demand signal optimizes content for prompts nobody searches.

**The rule:** a candidate prompt is KEPT only if at least one translated keyword phrase comes back
from `research-keywords` with measurable monthly volume in the campaign geography. What an AI
answer looks like today is competitive intelligence (who is cited, what shape the answer takes)
and it never contributes to a keep or drop verdict. Record the verdict with
`record-keyword-research` so the number and the decision travel together.

**Where it came from:** an abandoned Wisconsin credit-union experiment (experiment 102), first
triage pass. Seventeen prompts were kept on "rich AI Mode answer" as a soft signal. The corrected
pass, on strict volume, kept ten.

### Rule 2: lead with bare-noun umbrella keyword forms

**The trap:** stacked-modifier translations of the prompt ("best mortgage lender first time home
buyer wisconsin") return zero volume even when the topic has real demand. The umbrella form ("best
mortgage lender", or "mortgage lender wisconsin") catches the searches that actually happen.

**The rule:** every prompt's keyword-translation list leads with the shortest noun-phrase umbrella
form. Geo-anchored variants go second. Stacked-modifier prompt-literal forms go last, or are left
out. When a candidate comes back all zeros in a batch, re-run it with umbrella forms before
believing the zero.

**A geo-anchored keyword is not a measurement of local demand, and never was.** Writing the county
into the phrase measures how many people type the county into a search box, which is almost nobody.
Set the campaign's geography with `set-campaign-location` and measure the umbrella form there
instead. Side by side in Sonoma County on 2026-08-19: "business loans santa rosa" returned 0/mo and
no national figure, while "small business loan" measured 140/mo in that same county.

**Where it came from:** the same campaign dropped `first time home buyer wisconsin` because four
prompt-literal phrasings all returned zero. The next batch caught the identical intent with the
umbrella form at 1,300 a month. The lesson had to be relearned twice more in a later
lender-decision campaign.

### Rule 3: triage threshold is 50 a month, or 10 a month plus a foothold, and the market it is measured in decides which

Apply this to the volumes `research-keywords` returns, then write the verdict into
`record-keyword-research` with a reason. Record the drops too: that is what stops a later pivot
from re-proposing something already rejected.

**Judge on the campaign's own market.** Where a geography is set, that means
`local_monthly_volume`, not the national figure.

- **KEEP, clear demand:** 50 or more monthly searches on at least one translated phrase. Where the
  campaign has a geography, 20 or more local also qualifies when that phrase carries 5,000 or more
  nationally, which shows the topic is real and the county is simply small.
- **KEEP, foothold defense:** 10 or more monthly searches and the owned organization is already
  cited in AI answers for that prompt.
- **RESCUE:** anything else worth tracking despite missing the threshold (a metro-cluster phrasing
  variation, a national-overflow probe, a product the institution is actively advertising). Requires
  an explicit rationale in `verdict_reason` and a re-check date.
- **DROP, the default:** zero volume, or below threshold with no rescue rationale.

**The local thresholds are provisional.** The 50/mo bar was calibrated when every volume this
platform could buy was a United States national figure. County-level buying arrived on 2026-08-18
and the bar did not move with it, which makes it far harsher than it was designed to be: applied to
a 480,000-person county, only 3 of 11 already-tracked phrases cleared 50 locally, several of them
prompts the institution was already winning in AI answers. Recalibrate as more campaigns run
locally. A bar that rejects a prompt whose baseline visibility is strong is a broken bar.

### Rule 4: the kept set is an auditable artifact, not a mental note

**The trap:** "candidate hypotheses" and "prompts this campaign will actually run" blur together,
and nobody can later reconstruct why a prompt is in the campaign.

**The rule:** every keyword measured gets a row through `record-keyword-research` (keyword,
monthly volume, difficulty, the candidate prompt it backs, keep or drop, and why). Then write the
rollup as a `tracked-prompts` document with `set-experiment-document`: prompt, top keyword phrase,
monthly volume, verdict, notes, and a footer with the total tracked prompts and the total monthly
volume across the top phrases. That document is the audit boundary, and it is the thing a client
can be shown.

### Rule 21: size the experiment to the remaining response budget

**The trap:** the sampling numbers in this methodology used to read as absolutes: about twenty
tracked prompts, at least four sampled responses per target prompt, an 80 percent population line
computed at three responses each. A team on a small plan cannot reach any of them. A Starter team
gets 50 GEO responses a month, and twenty prompts at three responses each needs 60 before a single
prompt is scored. An agent holding the absolutes as requirements either refuses to run the
experiment at all or spends the whole period's budget in week one and leaves nothing for the pivot
the build phase may need.

**The rule:** the methodology never assumes a fixed sampling volume. Read
`get-team-usage(team_id)` before proposing a candidate set, take the GEO responses remaining in the
current period, and size the experiment to that number.

**There is a target, and the plan is measured against it rather than replacing it: 10 to 15 tracked
prompts at 5 samples each.** Below 10 prompts a campaign does not cover the space the build phase
picks from, and below 5 samples the per-prompt visibility figures are noise. On a real campaign a
prompt read 67% visibility at 3 responses and 25% at 8; nothing changed but the sample. Compute what
the target costs (the baseline is prompts times samples, then times 1.5, because the reserve below
is a third of the whole budget rather than a third added on top: 12 prompts at 5 samples is a
60-response baseline and a 90-response budget), then
compare it to what the plan has.

- **When the plan cannot buy the target, tell the operator before you build something smaller.**
  Name the number needed, the number remaining, the shortfall, and the fact that the plan is what is
  capping the quality, then let them choose to upgrade, to spend now and finish after the reset, or
  to wait. Sizing down quietly inside the budget is the failure this clause exists to stop: it
  produces a campaign that looks finished, and nobody learns otherwise until a client is shown a
  visibility score computed on three responses. Absorbing the constraint is not thrift, it is a
  decision taken on someone else's behalf.
- **Reserve about a third** of what remains for the pivot, the re-runs, and the second look the
  build phase legitimately asks for. Size the baseline inside the rest.
- **The arithmetic is prompts times samples per prompt.** Providers are a pool, not a multiplier:
  the run tools spread the requested count across the providers they can actually run, so naming
  three providers does not triple the cost or the sample.
- **Cut prompt count before cutting samples per prompt**, down to a floor of two samples. Rule 5
  reads body text for institution mentions, and one response per prompt cannot tell a structurally
  closed slot from an unlucky draw.
- **State the tradeoff to the operator in one plain sentence**, in their terms: fewer tracked
  prompts than usual, or a thinner baseline behind each one, and which you chose.
- **Carry the sized number forward.** Pass `min_responses` to `get-campaign-readiness` equal to the
  samples per prompt you budgeted, or the population line measures a bar nobody paid for and reads
  as 0 percent forever.
- **Always run the best experiment the plan allows.** Never refuse the experiment over the budget,
  and never quietly exceed it. On a generous plan none of this changes anything.
- **Cover the product space, not just the brief.** The candidate set walks deposits, consumer
  lending, business banking, wealth and trust, digital and servicing, and local discovery, and
  includes at least one candidate in each category the institution actually offers. A campaign built
  only around the angle in the brief measures the angle in the brief: on a real engagement two
  campaigns were both scoped to the pitch story and consumer lending went unmeasured, which later
  turned out to carry more local demand than either of them and the best demand-to-difficulty phrase
  in the account. A category that does not fit the campaign's scope gets its own campaign, proposed
  out loud, rather than being crammed into one whose name then stops describing its contents.

**Where it came from:** Ryan's decision, 2026-07-27, after the M14 QA run: "the methodology never
assumes a fixed sampling volume", it "sizes the experiment to it", and the skill "always does the
best experiment the plan allows rather than refusing or blowing the cap". The QA team was on
Starter, 50 responses a month, which put the old absolute gates out of reach from the first call.

---

## Baseline gathering

### Rule 5: the institution-citation gate

**The trap:** an AI Mode result names specific lenders for a prompt; the model's own body text does
not. The article gets written assuming the lender slot is reachable. It is not, and the experiment
hypothesis cannot materialize.

**The rule:** before locking target prompts, verify per prompt that specific financial institutions
appear in the model's **body text**, not only in a search results panel. Sample every response the
budget bought for that prompt: four is the number to reach for where the plan allows it, and two is
the floor below which the gate cannot be read at all (rule 21). If zero of N name any specific
institution, the prompt drops from the target set regardless of demand. Record per prompt: which
institutions are named, in how many of the N responses, and whether the mention is body text or a
citation list, and say the sample size in the analysis whenever N is below four, because a
two-of-two read is a weaker verdict than a two-of-four one and the client's reviewer deserves to see
which they are looking at.

**Where it came from:** the abandoned experiment 102. Thirty-two baseline responses across four
target prompts contained zero specific lender mentions in body text. The article would have
published into a slot the model never fills. The pivot to lender-decision-shaped prompts, where the
gate passes, is what made the follow-on experiment work. The absolute four became budget-relative
after the M14 QA run (2026-07-27), where a Starter team's 50 responses a month made a fixed four
per prompt unreachable across a normal candidate set.

### Rule 6: document the single-provider caveat every time

**The trap:** a campaign run triggered for several providers has come back with responses from one
provider only, either because the team config overrides the request or because the other providers
are not enabled. Treating that baseline as multi-model coverage misrepresents the data to the human
who signs off.

**The rule:** if the response set is single-provider, say so verbatim in the experiment's `evidence`
document and in the deliverable's evidence overview. Do not silently describe the baseline as
multi-model. Recommend re-running with explicit provider verification, or fixing the team config,
before anyone leans on the result for cross-model claims.

---

## Experiment design

### Rule 7: do not pre-set the measurement start date

**The trap:** setting `started_at` when the experiment record is created starts the 28-day
measurement clock before the article is live. Baseline drift accumulates while days tick off.

**The rule:** create the experiment as `status: "draft"` with no dates. The status flips to
`published` when the article actually goes live, and that is what starts the clock. The baseline
window derives from the pre-publish period.

### Rule 8: targets are a subset of the campaign, and non-targets keep running

**The trap:** pruning prompts out of the campaign because they missed the target shortlist throws
away their visibility tracking. A prompt that fails the institution-citation gate today can pass it
later as model training data moves.

**The rule:** the campaign holds every demand-grounded prompt. The experiment attaches its
measurement scope: the locked targets plus every campaign prompt the planned article could
plausibly move. There is no required count — sweep the campaign with `list-prompts`, attach for
coverage, and name any campaign prompt you excluded and why. What matters is that at measurement
time no prompt the article lifted was left off the experiment. Prompts left unattached stay in
the campaign for monitoring; they simply do not get the article's structural attention. When a
pivot adds prompts, attach them with `prompt_ids_mode: "add"` so the originals are not detached.
A consumer question the article answers that no campaign prompt covers may become a new prompt
only through the demand gate (rules 1 to 3) and only before the article goes live, so it accrues
a baseline — a prompt created at publish time has no baseline and can never be measured. A new
prompt must then be attached (`prompt_ids_mode: "add"`) and its responses confirmed populated
before publish; created-but-unattached is still invisible. The article never justifies a prompt;
demand does.

---

## Evidence and decisions

### Rule 9: empirical patterns are observations, not prescriptions

**The trap:** the classic failure. "Top performers get mentioned alongside competitors, so we should
mention competitors on our own page." The observation is true and the inference is backwards.
Reproducing the comparison surface inside the owned page cites competitors authoritatively from the
client's own domain, which is the opposite of the goal.

**The rule:** the `evidence` document captures observations with citations. The `decisions` document
translates evidence into tactics in a Choice / Evidence / Alternatives shape, and every decision
carries at least one rejected naive translation. The "rejected because" line is mandatory. Both land
through `set-experiment-document`.

### Rule 10: decisions are complete before drafting starts

The article angle and the section structure are decisions, and they must exist in the `decisions`
document, with their rejected alternatives, before a single line of the draft is written. There is
no separate draft-review pause: the decisions and the article both travel into the deliverable's
evidence dossier, where the client's reviewers see them together. Skipping straight to prose is how
an article ends up with no defensible answer to "why did you write it this way".

### Rule 20: anchor deliverable length to cited-content length

**The trap:** clients ask "how did you decide this should be about 1,300 words, or 10,000?" and the
only answer on file is a belief that long-form ranks better. That is not defensible, and "longer is
better" backfires here: padding dilutes the concrete, substantiable hooks that actually win
citations (rule 14) and multiplies compliance-review cost for no citation benefit.

**The rule:** deliverable length is an explicit decision, backed by an observation, exactly like
every other content choice.

- **Evidence.** Identify the competitor pages the baseline actually cited for the locked target
  prompts. Read a representative sample and record each page's main-content word count, separating
  two classes: **single-institution product or rate pages** (the surface the owned page emulates)
  and **multi-institution comparison roundups** (the surface rule 12 says not to mimic). Report the
  range and rough median for each class, each measurement cited to its URL. Note any page whose body
  cannot be counted rather than guessing.
- **Decision.** State a target word-count **band** anchored to the single-institution class, sized
  to carry every decision and the winning answer shape (eligibility, a local or branch anchor, the
  concrete offer hook, how to start, a short FAQ) with no padding. Record two mandatory rejected
  alternatives: *"longer is better, write a 10,000-word pillar"* (no cited page is that long, and
  padding dilutes the hooks) and *"match the longest comparison roundup"* (that length reflects
  covering many institutions, which is the rule 12 surface we do not reproduce). A "too short" floor
  is the natural third reject.
- **Reconciliation.** The outline's per-section targets sum to the band, and the draft flags when it
  lands outside the band, with a reason.

**Where it came from:** a recurring client question on two home-equity and vehicle-refinance
deliverables. Both were about 1,300 words, and neither had a recorded reason.

---

## Drafting and review

### Rule 11: no rate numbers in the article body

**The trap:** Regulation Z trigger-term disclosure obligations attach to specific rates, APRs,
payment amounts, finance charges, or down-payment percentages tied to a specific offer. A rate quote
in the article body forces a full disclosure block into the article body.

**The rule:** rate context links to the institution's existing rates page, where the disclosures
already live. The body discusses rate-comparison methodology (APR versus note rate, points versus
credits, lock-period pricing), which is allowed: explaining how to compare rates is not advertising
rates. Program-description framing (an FHA "3.5% down" as a program parameter, not the client's
offer) is allowed, but watch the line.

### Rule 12: no competitor comparison block on the owned page

Do not put a side-by-side table of other institutions on the client's own article. Models build
comparisons out of independently cited self-positioning pages, each of which positions its own
institution. Mimicking that surface (a) cites competitors authoritatively from the client's domain,
(b) confuses members about what the client actually recommends, and (c) trips NCUA Part 740
advertising review.

### Rule 13: no "best / top-rated / trusted" superlatives without backing

About the client. Quoting a competitor's own self-claim is reportage and is fine. Making an
unsubstantiated superlative claim about the client is blocker-grade under NCUA Part 740, and it is
poor citation bait besides.

### Rule 14: cite-attractive content is concrete, quantitative, and substantiable

Claims that won citations in real baselines: a competitor's "number one mortgage lender by HMDA loan
count" (quoted verbatim in six of fourteen prompts), another's "lowest closing cost commitment", and
the client's own existing "servicing is not transferred to other lenders".

The pattern: a specific quantitative or factual claim a model can quote verbatim. Adjectives without
backing rarely get cited.

### Rule 15: the fact-check pass doubles as content discovery

A fact-check found that the client's existing first-time-homebuyer page already published most of
the self-positioning content the draft was about to ask the client to supply. Those claims went
straight into the article with no client round trip. Fact verification is not only verification, it
is discovery of already-published content the client never surfaced.

### Rule 19: draft to the verified site, and treat action items as a last resort

**The trap:** one deliverable shipped ten client action items, of which about eight were
self-resolvable. The fact-check had already verified an intro-rate special and a published
"up to 100% combined loan-to-value" program on the live site, and the draft still asked humans to
confirm both. A rates-page URL the fact-checker had already read was left as a placeholder. The
draft enumerated counties the site never publishes, and characterized the published
"up to 100% CLTV" as "high", manufacturing a substantiation question out of a site-published fact.

The rule has two halves.

**Drafting.** The client's live website is presumed compliant for its own published wording. Draft
claims in the site's words, never a vaguer or a stronger paraphrase. Pull published facts (page
URLs, branch addresses and phone numbers, application channels, eligibility wording, product
features) from the site yourself instead of writing a placeholder. A claim the site cannot support
ships in its softened, site-supported form now; the stronger version is an opt-in upgrade, never a
hole in the draft. Reserve a client placeholder for facts only the client can know: years served,
volumes, named officers, charter or field-of-membership scope beyond published wording.

**The action-item gate.** A finding becomes a client action item only after failing all three tests,
in order. (a) **Website wording:** can it be resolved by rewriting to what the site already
publishes, or by deleting an unsupported qualifier? (b) **Self-verify:** can you verify it yourself
against the live site or an authoritative source? (c) **Fact-check reconciliation:** did the fact
verification report already verify it? Never ask a human to confirm what a reviewer already
confirmed, and never author an action item that duplicates a checklist row.

**Style contract for items that survive.** Question: one ask, 20 words or fewer, plain second
person, no regulation numbers. Context: two sentences at most, why it matters (compliance items name
the regulation in plain terms), then the default if nobody answers. Every non-attestation item has a
stated default, and an item with a safe default is `blocking: false`. The attestation goes last.
Target: zero action items per deliverable.

---

## Analysis writing

### Rule 16: the viability verdict opens the analysis

Every analysis summary opens with:

> **Experiment Viability Verdict: STRONG / VIABLE / WEAK / AVOID, confidence HIGH / MEDIUM / LOW**

Backed by four evidence pillars:

1. **Institution slot:** open or closed on the target prompts?
2. **Source diversity:** a broad competitive set, or one dominant organization?
3. **Competitor presence:** is the client already cited (foothold defense) or absent (acquisition)?
4. **Answer shape:** ranked list, institution list, or rate list (citation friendly), versus generic
   explainer or government-source dominated (citation hostile)?

**AVOID at HIGH confidence halts the experiment.** That is a do-not-publish signal. Pivot before the
article goes out.

---

## Retired rules

### Rule 17: retired

Was: use a project-local hygiene script instead of the general hygiene checker. The platform now
runs the deterministic hygiene contract itself inside `build-deliverable` (em dashes in client copy,
anchor-quote resolution, enum and shape validation), and the judgment half of hygiene is the review
battery in `review-hygiene.md`. Nothing to install, nothing to run locally.

### Rule 18: retired

Was: cache discipline on bulk keyword lookups, including a forced no-cache re-run when a batch came
back all zeros. `research-keywords` owns caching now: anything researched in the last 30 days is
served from the platform's own table, and `refresh: true` forces a live lookup. If a batch looks
suspiciously empty, re-check the phrasing against rule 2 first, then call again with `refresh: true`.
