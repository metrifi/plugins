---
name: exp-research
description: "Phase one of a MetriFi GEO experiment: turn a topic into a demand-grounded campaign with its baseline gathering. Sizes the experiment to the GEO responses the team's plan has left this period. Proposes prompts the way a real consumer asks an AI assistant (never with a brand name), measures actual search demand, triages keep or drop on measured volume alone, records every verdict, drops included, then creates the prompts that survived and attaches them; the platform gathers the baseline. Use when someone wants to start an experiment or size a topic: 'start an experiment for this team on HELOCs', 'research this topic', 'stand up a campaign', 'what prompts should we track', 'is this topic worth an experiment', 'keyword research for a campaign'. Offers a dry run when the topic is unvalidated. NOT for standing up a brand-new team or its first broad baseline campaign (campaign-setup), NOT for scoring responses or writing the article (exp-build), NOT for where an experiment stands (exp-status), NOT website work."
---

# exp-research: from a topic to a demand-grounded campaign

The first phase of an experiment. It ends with the kept prompts attached to a targeted experiment,
the platform's runner gathering the baseline toward the experiment's response target, and a first
read of where that stands, not with an analysis.

**This skill measures a topic. `campaign-setup` measures an institution.** If the team is new, or
has no campaign yet, or has only deep single-topic campaigns and no broad baseline, that skill runs
first: it picks the market, confirms the institution is registered so anything gets scored at all,
and builds a wide first campaign across the products (rule 23). A topic campaign built before a
baseline exists is a guess about where the opportunity is. Say so once, name the skill, and let the
operator choose.

Read `references/methodology-rules.md` (rules 1 to 4, 6, 7, 8, 21, 22, 23) and
`references/workflow-overview.md` before the first write. Rules 1 to 3 are the whole triage;
skipping them is how a campaign ends up tracking prompts nobody searches. Rule 21 decides how big
the experiment gets to be, and it is the first call you make.

## What you need before you start

- **The team slug.** `list-teams` if you do not have it.
- **The topic, stated specifically**, with its geography. "HELOCs" is not a topic. "Homeowners in
  these counties comparing a HELOC against a cash-out refinance" is.
- **The audience and the segments worth splitting it across** (first-time buyers against
  refinancers, one metro against another). Two to four is usually right.
- **The institution and its domain**, so you know which organization is the owned one and never put
  its name in a prompt.

If the topic or the geography is vague, ask once and wait. Everything downstream inherits that
scope, and a campaign created against the wrong scope muddies the client's own visibility data.

## Dry run: triage without committing

Offer a dry run when the topic is unvalidated, when someone wants the demand table before deciding,
or when they ask for one. A dry run **creates no prompts and runs nothing**, so nothing enters the
tracked set and no responses are generated.

One honest caveat: demand measurement is recorded against a campaign, so even a dry run needs a
campaign row to scope the research to. Prefer an existing campaign that covers adjacent ground. If
the team has none, say out loud that the campaign is the single thing a dry run creates, and that it
stays empty until someone approves the triage. Then stop after the triage table and let the person
decide whether to commit.

## 1. Size the experiment to the plan

**`get-team-usage(team_id)` is the first call in this skill**, before candidates, before keywords,
before a campaign exists. It reports the GEO responses used, the limit, the responses remaining, and
the billing period they reset in. Running a prompt spends that budget, whether you call a run tool
or the platform's runner does it for a targeted experiment; nothing else in this phase does (keyword
research is not metered).

**Two numbers set the size of an experiment** (rule 21): how many prompts it tracks, and its
`target_responses`, the usable responses the platform gathers per window before it scores the
experiment. The default target is 40 per window, the number the report's test needs to call a 0 to
20 percent lift, and `create-experiment` accepts 8 to 400. The platform's runner gathers the
baseline toward that target before the article goes live and the measurement toward it after, so an
experiment at the default target costs about 80 responses over its life (baseline plus
measurement), whatever the prompt count. Prompt count decides how the responses spread across the
questions, not how many there are.

Size the experiment to what is left (rule 21):

1. **Compute the cost first, then compare.** About 2 times the target per experiment, roughly 80 at
   the default, plus a reserve for a pivot, because a pivot attaches new prompts and the runner
   gathers a baseline pass on them out of the same quota. Compare that to the responses remaining
   and the date they reset. The baseline gathers over days and the measurement over 28 to 42 days,
   so a reset inside that span counts in the plan's favour.
2. **If the plan cannot cover the target, say so before you build anything smaller.** Name the
   number the target needs, the number remaining, the shortfall, and the fact that the plan is what
   is capping the quality. Then let the operator choose: upgrade, run at a lower target, or wait
   for the reset. **This is a decision the operator makes, not one you absorb quietly.** A lower
   target is a weaker test: the report grades the experiment on the responses its windows hold, and
   a target the plan chose reads as a finding unless the tradeoff was said out loud.
3. **Only then size down, and only to what they chose.** Lower `target_responses` on the experiment
   (before the live date; it is fixed once the experiment is live), and cut prompt count before
   anything else on the campaign side. Ten to fifteen tracked prompts still cover the space the
   build phase picks from, and the runner's first pass puts up to 5 responses on each of them,
   which is the sample the institution-citation gate (rule 5) reads.
4. **Say the tradeoff in one plain sentence.** For example, "this plan has 44 GEO responses left this
   period against the 80 an experiment at the default target needs, so unless you want to upgrade I
   will set the target to 20 per window and track 10 prompts, which is a weaker test than the
   default."

**A thin baseline is noise, and it is worth knowing how much.** On a real campaign the kids-savings
prompt read 67% visibility at 3 responses and 25% at 8. Nothing changed except the sample. That is
why the target exists: 17 of the last 25 baselines gathered by hand were too thin to call.

On a generous plan this is a read that changes nothing. On a small one it is the difference between
a smaller honest experiment and either a refusal or a blown cap, and neither of those is an option:
run the best experiment the plan allows, and make sure the operator knows what the plan is costing
them.

Carry the two numbers you chose (tracked prompts, `target_responses`) through the rest of this
skill. They set the size of the kept set in step 4 and the target on the experiment in step 5.

## 2. Frame the candidate set, and open the campaign

Decide new or existing first: `list-campaigns(team_id)`, and reuse a campaign that already covers
this topic rather than standing up a near-duplicate. `get-campaign(team_id, campaign_id)` shows its
location and keywords when the name alone is ambiguous.

**Campaign shape is a convention, not a preference, and it gates creation.** A team's FIRST
campaign is the broad flagship: the institution's core products together, so the team gets one
high-level visibility score that stays comparable over time. Every campaign after that goes narrow,
one product or service, with granular consumer prompts, and those granular prompts are what
experiments attach, never the flagship's institution-level ones. So if `list-campaigns` came back
empty, stop here: the team is missing its flagship, and standing up a product campaign as their
first breaks the convention. `campaign-setup` is the skill that builds it. Propose that, or get an
explicit go-ahead to skip it, before any campaign for this experiment exists.

**Broad means broad across PRODUCTS, in ONE market. It does not mean every geography the
institution serves.** A campaign carries a single geography (`set-campaign-location`), so one
spanning three counties cannot buy local demand for any of them, and its prompts cannot all name
the place. The flagship is scoped to the single most populated market the institution actually
serves; additional markets are additional campaigns (rule 23).

**Granular does not mean unscoped.** A narrow campaign's prompts still name the place, exactly as
the flagship's do (rule 22): "best used car loan in Sonoma County", not "best auto loan rate near
me". "Near me" scopes nothing, because the campaign's location is never sent to the providers.

Only then create the new one, with
`create-campaign(team_id, name, description, location, keywords)` and the geography in `location`,
because the demand research and the keep-drop verdicts are both recorded against a campaign. The
campaign is a container, not a commitment: no prompt exists inside it until the triage in step 4
says so.

**Then check that the client's organization is registered on this campaign.**
`get-org-visibility(team_id, campaign_id, limit: 0)` lists the organizations the campaign measures
mentions against. If the institution is not in that list, nothing is tracking it: the visibility
percentages every later phase reads come from matching an organization's terms against response
text, so an unregistered institution reads as zero visibility forever, which looks like a finding
and is actually an empty measurement.

**Competitors are a different matter: the platform extracts them from the responses on its own.**
Do not tell an operator to register a competitor set by hand, and do not report "no competitive
ranking is available" without calling `get-org-visibility` first. A real campaign's handoff note
carried that claim for a day while the platform had already extracted 30 competitors and ranked the
client first among them. Read the tool, then say what it says. Two things to watch when you do:
generic nouns ("Bank", "Credit Union", "Online Lender") and non-competitors (FDIC, NCUA,
NerdWallet, Visa) are filtered on the way in now, but campaigns created before that filter existed
still carry them, and one of them can outrank every real competitor. If one appears in a ranking
you are about to report, exclude it, say that you did, and tell the operator the campaign has stale
entries so a person can clear them. There is no tool in this plugin that creates one, so say so
plainly and once: a person adds the institution as an organization on this campaign, with its name
and website and its common name variants as terms, in the MetriFi GEO app. Do it before the run
where you can. A registration added later is not lost work, because the platform rescans past
responses when a new term appears, but until it exists say "visibility is unmeasured on this
campaign" rather than reporting a zero.

Then generate a **wide** candidate set, 24 to 36 prompts, spread across:

- **Intent angles:** informational, comparative, transactional, locational.
- **The segments and geography variants** you scoped above.
- **The product and service space, not just the angle you were briefed on.** Walk the categories
  deliberately and write at least one candidate in each that the institution actually offers:
  deposits and rates; consumer lending (mortgage, refinance, home equity and HELOC, auto, personal,
  debt consolidation); business banking and commercial lending; wealth, trust and retirement;
  digital and servicing (online and mobile banking, fees, opening an account); and local discovery
  ("banks near me", "best local banks in X", bank versus credit union).

Breadth is deliberate, and the category sweep is the part that gets skipped. A campaign built only
around the angle in the brief measures the angle in the brief. On a real engagement both campaigns
were scoped to the pitch story, deposits and business banking, and consumer lending went unmeasured
until a later pass found it carried more local demand than either, including the best
demand-to-difficulty phrase in the whole account. The build phase picks the biggest opportunity out
of this set and pivots among these prompts, so cover the space rather than writing six phrasings of
one question.

**A category that does not fit the campaign's scope belongs in its own campaign, not crammed into
this one.** Say so and propose it rather than diluting a campaign whose name then stops describing
its contents.

Three hard rules on the prompt text itself:

- **Name the campaign's geography in the prompt text** (rule 22). "in Sonoma County", never
  "locally" or "near me". The campaign's location is a demand-measurement setting and is **never
  sent to the LLM providers**, so the prompt text is the only thing that scopes the answer to the
  client's market. An unscoped prompt gets a national answer that a community institution is not
  in, and measures a zero it could never have escaped. `create-prompt` warns when the place is
  missing; that is a defect to fix, not a note to acknowledge. Do not read rule 2's anti-geo
  keyword clause as applying here: it is about keywords, and it points the other way.
- **Write it the way a consumer asks an AI assistant**, in their words, not in marketing language.
- **Never put a brand name in a prompt**, the client's or a competitor's. The entire measurement is
  which brands a model names on its own. A prompt naming the institution measures nothing.

## 3. Measure demand

Translate every candidate into keyword phrases **ordered by rule 2**: the shortest bare-noun
umbrella form first ("best mortgage lender"), the geo-anchored form second ("mortgage lender
wisconsin"), the stacked-modifier prompt-literal form last or not at all. **This ordering governs
keywords only. The prompt itself still names the place** (rule 22); the two artifacts are measured
by different endpoints and the rules genuinely point in opposite directions. Stacked modifiers return
zero volume for topics that plainly have demand, and that zero has cost real experiments twice.

Then `research-keywords(team_id, campaign_id, keywords, experiment_id?)` with the whole translated
list in one call, up to 700 keywords. It returns monthly volume, difficulty, and search intent, and
it records facts only: it never writes a keep or drop verdict, so it cannot overwrite your triage.

- Anything measured in the last 30 days comes from the platform's own table. `refresh: true` forces
  a live lookup.
- **If a whole batch comes back at zero, do not believe it yet.** Re-check the phrasing against
  rule 2 first, then call again with `refresh: true`. Believing a bad batch drops real demand.

What a model's answer looks like today is competitive intelligence, not demand. Note who gets cited
if it is useful later, and keep it out of the verdict entirely (rule 1).

**Set the campaign's geography before you measure anything.**
`set-campaign-location(team_id, campaign_id, query)` resolves a plain place name ("Sonoma County")
and stores it on the campaign. With it set, `research-keywords` buys the demand twice and stores
both numbers: `monthly_volume` is the United States national figure and `local_monthly_volume` is
the same phrase measured in the campaign's own market. Without it you get the national number only,
which is a number no community institution should ever be handed as its market.

An ambiguous query writes nothing and returns the candidates. Pick the row whose `type` matches what
you meant, usually `County` or `City`, and call again with its `location_code`. `get-campaign` prints
a "Demand measured in:" line so you can confirm what you set.

- **Lead every client-facing table with the local number**, and present the national one as the
  ceiling on the topic rather than the size of the market. An unlabeled national volume shown to a
  community bank overstates its market by two or three orders of magnitude and is the kind of number
  a client repeats to their board.
- **Do not use geo-anchored keyword phrasing as a local-demand proxy. That workaround is obsolete
  and it was always wrong.** Writing the county into the keyword ("business loans santa rosa") does
  not measure local demand, it measures how many people type the county into the search box, which
  is almost nobody. Measured side by side in Sonoma County on 2026-08-19: "business loans santa
  rosa" returned 0/mo and no national figure at all, while the umbrella phrase "small business loan"
  measured 140/mo in that same county. Measure the umbrella form (rule 2) at the campaign's
  geography instead.
- **Difficulty and search intent are national-only.** The endpoint that reports them cannot go below
  a country, and the endpoint that reports local volume returns neither. So a row can carry a real
  local volume and no difficulty. That is expected, not a failure.
- **A row measured at a different geography is re-bought automatically**, but a row measured with no
  geography at all still reads as cache-fresh. When you set a location on a campaign that already
  has keyword rows, pass `refresh: true` on the next `research-keywords` call or the old national
  numbers stay.

## 4. Triage

Apply rule 3 to the measured volumes. **Which number you judge on depends on whether the campaign
has a geography**, and the thresholds are not the same, because a county is a small fraction of a
country and the original bar was set against national figures.

**Campaign with a geography set** (judge on `local_monthly_volume`):

| Verdict | When |
|---|---|
| **KEEP, clear demand** | 50 or more local monthly searches on at least one translated phrase, **or** 20 or more local with 5,000 or more national on that same phrase, which shows the topic is real and the county is simply small |
| **KEEP, foothold defense** | 10 or more local monthly searches and the owned organization is already cited in AI answers for that prompt |
| **RESCUE** | worth tracking despite missing the threshold, with an explicit rationale and a re-check date |
| **DROP** | the default: zero local volume, or below threshold with no rescue rationale |

**Campaign with no geography** (national figures only, the original bar): 50 or more monthly
searches for clear demand, 10 or more plus an existing citation for foothold defense.

**The local thresholds above are provisional and should be recalibrated as more campaigns run
locally.** They exist because the 50/mo bar was calibrated on national volumes and applying it
unchanged to county volumes rejects almost everything: on a 480,000-person county, only 3 of 11
already-tracked phrases cleared 50 locally, including several the institution was already winning
in AI answers. If you find the bar rejecting prompts whose baseline visibility is strong, that is
evidence the bar is wrong, not evidence the prompt is.

Then **de-duplicate**. The candidate set was generated wide on purpose, so several prompts are
near-paraphrases mapping to the same umbrella phrase and the same intent. Collapse each cluster to
its strongest representative and drop the rest with the reason "paraphrase of" plus the survivor.
Preserve the diversity across intent angle, geography, and segment: that breadth is what the build
phase pivots across.

**The budget from step 1 caps the kept set, not the demand table.** Fifteen to twenty tracked
prompts is a healthy campaign where the plan pays for it. Where it does not, keep the number you
sized: rank the survivors by measured demand and by how much of the intent space each one covers,
keep down to the sized count, and record the rest as dropped with the reason "over the response
budget for this period, re-check when the quota resets" plus its volume. That is a real verdict with
a real reason, and it is what lets a later run pick these up instead of re-deriving them.

Report two demand totals and label them:

- **Unique demand**, counting each distinct top phrase once. This is the honest client-facing number.
  Lead with it.
- **Raw sum** of per-prompt top-phrase volume, which double-counts phrases several prompts share.
  Report it second, labeled as such.

**Record every verdict, drops included**, with `record-keyword-research(team_id, campaign_id, rows)`:
the keyword, the monthly volume, the difficulty, the candidate prompt it backs, keep or drop, and
`verdict_reason`. It upserts on campaign plus keyword, so refreshing a volume later does not blank
the verdict. Recording the drops is what stops a later pivot re-proposing something you already
rejected. **On a dry run, stop here.**

## 5. Commit the experiment and the prompts

1. **The experiment record, as a draft.** `create-experiment(team_id, name, campaign_id, description,
   status: "draft", target_responses?)`. Every new experiment carries a response target, 40 per
   window unless you pass one; pass a lower number only when the operator chose it in step 1. Create
   it before the prompts, so the workflow state, the event log, and the handoff note have a home
   from the first phase and any operator can pick this up. **Pass no dates**
   (rule 7): `create-experiment` has no start-date argument, because an experiment is never born
   live. The live date arrives when the article does, from the publication record. If a draft
   experiment for this topic already exists on the campaign, reuse it rather than creating a
   second.
2. **The prompts.** `create-prompt(team_id, campaign_id, content)` for each kept candidate, and only
   for kept candidates. The recorded keep set is the audit boundary: a prompt that is not in it is
   never created. `list-prompts(team_id, campaign_id)` first when reusing a campaign, and skip any
   whose text already exists.
3. **Close the loop on the research rows.** Re-call `record-keyword-research` for the kept rows with
   `prompt_id` filled in, so each keyword points at the prompt it became.
4. **The rollup document** (rule 4). `set-experiment-document(team_id, experiment_id, kind:
   "tracked-prompts", title, markdown)`: a table of prompt, top keyword phrase, monthly volume,
   verdict, and notes, with the geography in the caption and a footer carrying the unique demand
   total, the distinct-phrase count, and the raw sum. That document is what a client can be shown.
   Write the per-prompt detail as a `keyword-research` document when the reasoning is worth keeping.
5. **Attach the kept prompts to the experiment.** `update-experiment(team_id, experiment_id,
   prompt_ids: [the kept ids], prompt_ids_mode: "add")`. On a targeted experiment that is not live,
   this is what starts the baseline: the platform's runner dispatches its first pass the moment the
   prompts are attached, up to 5 responses per prompt, then tops the baseline up once a day until
   the window holds the target or the article goes live. Nothing else needs to be called.

## 6. Get the baseline running

**On a targeted experiment, do not run the prompts by hand.** Attaching them in step 5 already
dispatched the runner's first baseline pass, and a `run-campaign-prompts` or `run-prompt` call on
top of it spends the same quota twice. Responses the runner gathers are tagged with the experiment:
the experiment's own score and `get-campaign-readiness` count them, and the campaign and
organization visibility ratios leave them out so a heavily run experiment cannot tilt the campaign's
numbers. A manual run is untagged and is campaign data.

Two things to say about the runner's responses whenever you describe the baseline:

- **Which provider they came from** (rule 6). The runner picks the provider; `list-responses` shows
  it. A baseline that came back from one provider is a single-provider baseline in every document
  you write about it.
- **Trials get the target and the depth warning but no automatic runs.** On a trial team the runner
  stays off, and the manual run below is the only way to gather a baseline. Say so.

**The manual run stays the right tool in two cases:** a campaign being monitored without an
experiment (the `campaign-setup` path), and an experiment created before targets existed, which
`get-experiment` shows with no run mode line. There, `count` is the samples per prompt the plan
can afford, never below two, because the institution-citation gate in the next phase reads body
text and one response per prompt is not enough to work with.

- **A campaign with no prior baseline:** `run-campaign-prompts(team_id, campaign_id, providers,
  count)`.
- **A campaign that already has responses:** `run-prompt(team_id, prompt_id, providers, count)` for
  each prompt you just created. Running the whole campaign again re-runs prompts that already have a
  clean baseline and muddies their history.

**Providers are a pool, not a multiplier.** The requested count is spread across the providers the
platform can actually run, so naming more of them neither multiplies the cost nor deepens the
sample. The run tools name any provider they cannot run and skip it, and refuse outright when every
provider named is unsupported. Report what they name: a baseline that came back from one provider is
a single-provider baseline in every document you write about it (rule 6).

If a run tool refuses, report its exact reason and stop there. A quota refusal names the responses
needed against the responses remaining, which means the sizing in step 1 was off; re-size to what it
reports rather than retrying the same call. The same goes for the runner: a `Runner skipped for
quota` line on `get-experiment` means the plan ran out before a pass, and the fix is the operator's
(quota, or a smaller target), not a manual run around it. The campaign, the experiment, and the prompts already
exist, so running again once the reason is resolved picks up exactly where you left off. Nothing
needs to be recreated.

Log it: `add-experiment-event(team_id, experiment_id, kind: "prompts-created", summary)` with the
count, the campaign, and the unique demand total, and `actor_label` naming yourself as the agent.

## 7. Read where the baseline stands, then hand off

Responses populate asynchronously, over minutes to hours. **There is no polling loop.** Read each
of these once, report what it says, and stop.

**`get-experiment(team_id, experiment_id)` is the read that matters on a targeted experiment.** It
prints:

- `**Run mode:**` `baseline`, `monitoring`, or `off`. Derived on every read, never stored.
  `baseline` means the article is not live and the runner is filling the baseline window;
  `monitoring` means the live date is set and the runner is pacing the measurement toward the
  target by day 28, then against the 42-day cap; `off` means the experiment is parked, closed, or
  untargeted. No mode line at all means an experiment created before targets existed, which keeps
  the old 28-day arithmetic.
- `**Responses against target:** baseline N of T, measurement N of T`, with `+P pending` for
  placeholders still resolving. The baseline number is the one this phase hands off on. "Baseline
  15 of 40" is a baseline in progress, not a baseline that is done.
- `**Runner skipped for quota:**` when the team's monthly quota ran out before a pass. That line is
  an action for the operator, more quota or a smaller target, not something to work around with
  manual runs.

`get-campaign-readiness(team_id, campaign_id)` still answers a different question: did the prompts
populate at all. It reports the share of prompts with completed responses inside a lookback window
(28 days and three responses per prompt by default; `window_days` widens it, `min_responses` sets
the bar), the per-prompt counts and latest response dates, and any jobs still running. It does not
say whether the baseline is deep enough; only `get-experiment` does. On a manual run, pass
`min_responses` equal to the samples per prompt you budgeted, or a two-sample baseline reads as 0
percent populated forever, and say which number you read it at.

Then:

- `set-experiment-workflow(team_id, experiment_id, note)` with a note the next operator can act on:
  what was created, the target, where the baseline stands against it, and what the next step is.
  There is no status argument; the experiment's stage is derived from its dates.
- Tell your operator that **exp-build** is what analyzes the responses and scores the opportunity,
  and that it is worth starting once readiness shows the prompts populated, which the runner's first
  pass reaches on its own. The baseline keeps filling toward the target in the background until the
  article goes live; the live date is what waits for "baseline T of T", not the analysis. Name it and
  let them choose. Do not start it yourself, and do not analyze the responses here.

## Judgment calls

- **A rich AI answer is never demand** (rule 1). It is a default behavior of the model, not evidence
  anyone asked.
- **Do not prune the campaign to the target set.** Every demand-grounded prompt stays in the
  campaign for monitoring; the experiment's targets are a subset chosen later (rule 8).
- **If the responses come back from one provider only**, say so verbatim wherever you describe the
  baseline (rule 6). Do not call a single-provider baseline multi-model coverage.
- **An ask that sounds like a new campaign is often a resumption.** Check `list-campaigns` and
  `list-experiments` for the team and topic before creating anything.
- **A team with no campaign at all is an onboarding, not an experiment.** Hand it to
  `campaign-setup` and say why: the baseline is what tells you which topic is worth an experiment.
- **Web access is whatever your host gives you.** A real browser tool reads client-rendered pages
  that a plain fetch cannot, and where there is no browsing at all, say a claim is unverified rather
  than assuming it. Nothing in this phase depends on browsing.
