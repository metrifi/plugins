---
name: exp-research
description: "Phase one of a MetriFi GEO experiment: turn a topic into a demand-grounded campaign and get baseline LLM responses running. Sizes the experiment to the GEO responses the team's plan has left this period rather than refusing or overspending. Proposes prompts the way a real consumer asks an AI assistant (never with a brand name in them), measures actual search demand, triages keep or drop on measured volume alone, records every verdict including the drops, then creates and runs only the prompts that survived. Use when someone wants to start an experiment or size a topic: 'start an experiment for this team on HELOCs', 'research this topic', 'stand up a campaign', 'what prompts should we track', 'is this topic worth an experiment', 'do people actually search for this', 'keyword research for a campaign'. Offers a dry run when the topic is unvalidated. NOT for scoring responses or writing the article (exp-build), NOT for where an experiment stands (exp-status), NOT website work."
---

# exp-research: from a topic to a demand-grounded campaign

The first phase of an experiment. It ends with prompts running against the LLM providers and a
readiness number, not with an analysis.

Read `references/methodology-rules.md` (rules 1 to 4, 6, 7, 8, 21) and
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
the billing period they reset in. Running a prompt spends that budget; nothing else in this phase
does (keyword research is not metered).

**The target is 10 to 15 tracked prompts at 5 samples each** (rule 21). That is the size a campaign
has to reach before its numbers are worth putting in front of a client, and it is what you compute
the budget against first.

**The reserve is a third of the whole budget, not a third added on top of the baseline.** The
baseline is therefore two thirds of it, so the budget the target needs is the baseline cost times
1.5:

| Tracked prompts | Baseline at 5 samples | Reserve (a third of the budget) | Budget the target needs |
|---|---|---|---|
| 10 | 50 | 25 | **75** |
| 12 | 60 | 30 | **90** |
| 15 | 75 | 38 | **113** |

Size the experiment to what is left (rule 21):

1. **Compute the target first, then compare.** Prompts times 5 samples for the baseline, then
   multiply by 1.5 for the build-phase reserve, which pivots and re-runs out of the same pool.
2. **If the plan cannot buy the target, say so before you build anything smaller.** Name the number
   the target needs, the number remaining, the shortfall, and the fact that the plan is what is
   capping the quality. Then let the operator choose: upgrade, spend what is there now and finish
   after the reset, or wait. **This is a decision the operator makes, not one you absorb quietly.**
   Sizing down inside the budget without telling anyone produces a campaign that looks finished and
   is not, and nobody finds out until a client reads a visibility score computed on three responses.
3. **Only then size down, and only to what they chose.** Cut prompt count before samples per prompt,
   with two samples as the hard floor. The next phase reads body text for institution mentions
   (rule 5), and a single response cannot tell a closed slot from an unlucky draw.
4. **Say the tradeoff in one plain sentence.** For example, "this plan has 44 GEO responses left this
   period against the 90 a full campaign needs, so unless you want to upgrade I will track 10
   prompts at 3 samples each instead of 12 at 5, and hold about 14 back for the build phase."

Splitting note: providers are a pool, not a multiplier. The run tools spread the requested count
across the providers they can run, so naming more providers costs nothing extra and buys no extra
sample.

**Three samples is noise, and it is worth knowing how much.** On a real campaign the kids-savings
prompt read 67% visibility at 3 responses and 25% at 8. Nothing changed except the sample. Any
figure computed on 3 responses is provisional and should be labelled that way until it is re-read.

On a generous plan this is a read that changes nothing. On a small one it is the difference between
a smaller honest experiment and either a refusal or a blown cap, and neither of those is an option:
run the best experiment the plan allows, and make sure the operator knows what the plan is costing
them.

Carry the two numbers you chose (tracked prompts, samples per prompt) through the rest of this
skill. They set the size of the kept set in step 4, the `count` in step 6, and `min_responses` in
step 7.

## 2. Frame the candidate set, and open the campaign

Decide new or existing first: `list-campaigns(team_id)`, and reuse a campaign that already covers
this topic rather than standing up a near-duplicate. `get-campaign(team_id, campaign_id)` shows its
location and keywords when the name alone is ambiguous. Create the new one now, with
`create-campaign(team_id, name, description, location, keywords)` and the geography in `location`,
because the demand research and the keep-drop verdicts are both recorded against a campaign. The
campaign is a container, not a commitment: no prompt exists inside it until the triage in step 4
says so.

**Campaign shape is a convention, not a preference.** A team's FIRST campaign must be broad: the
whole institution, every geography it serves, and its core products together, so the team gets one
high-level visibility score that stays comparable over time. Every campaign after that goes narrow:
one product or service, with granular consumer prompts ("best auto loan rate near me", "best used
car loan", "fast auto loan preapproval"), and those granular prompts are what experiments attach,
never the broad flagship's institution-level ones. So when `list-campaigns` comes back empty, say
so before creating anything: the team is missing its broad flagship campaign, and standing up a
product campaign as their first breaks the convention. Propose building the flagship first (or get
an explicit go-ahead to skip it), then open the product campaign for this experiment.

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
extraction also picks up generic nouns as if they were institutions ("Bank", "Credit Union",
"Online Lender", "Mortgage Broker"), which can outrank every real competitor, and it picks up
regulators and program bodies (FDIC, NCUA, CFP Board, NAPFA). Exclude both from any ranking you
report, and say that you did. There is no tool in this plugin that creates one, so say so
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

Two hard rules on the prompt text itself:

- **Write it the way a consumer asks an AI assistant**, in their words, not in marketing language.
- **Never put a brand name in a prompt**, the client's or a competitor's. The entire measurement is
  which brands a model names on its own. A prompt naming the institution measures nothing.

## 3. Measure demand

Translate every candidate into keyword phrases **ordered by rule 2**: the shortest bare-noun
umbrella form first ("best mortgage lender"), the geo-anchored form second ("mortgage lender
wisconsin"), the stacked-modifier prompt-literal form last or not at all. Stacked modifiers return
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
   status: "draft")`. Create it before the prompts, so the workflow state, the event log, and the
   handoff note have a home from the first phase and any operator can pick this up. **Pass no dates**
   (rule 7): `started_at` starts the measurement clock, and the clock starts when the article goes
   live, not today. If a draft experiment for this topic already exists on the campaign, reuse it
   rather than creating a second.
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

## 6. Run the prompts

`count` is the samples per prompt you sized in step 1, never a number picked here. The
institution-citation gate in the next phase reads body text, so one response per prompt is not
enough to work with, and two is the floor.

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
reports rather than retrying the same call. The campaign, the experiment, and the prompts already
exist, so running again once the reason is resolved picks up exactly where you left off. Nothing
needs to be recreated.

Log it: `add-experiment-event(team_id, experiment_id, kind: "prompts-created", summary)` with the
count, the campaign, and the unique demand total, and `actor_label` naming yourself as the agent.

## 7. Read readiness, then hand off

Responses populate asynchronously, over minutes to hours. **There is no polling loop.**
`get-campaign-readiness(team_id, campaign_id)` reports the share of prompts with enough completed
responses, the per-prompt counts and latest response dates, any in-progress jobs, and the auto-run
schedule. It is a fact you read, not a gate that refuses.

It counts responses inside a lookback window, 28 days and three responses per prompt by default, so
a campaign you reused reads as empty when its baseline predates the window. `window_days` widens it
when you want to see what already exists.

**Pass `min_responses` equal to the samples per prompt you budgeted in step 1.** The default of
three is a bar a two-sample baseline never clears, so leaving it alone on a tight plan reports 0
percent populated on a campaign that is exactly as populated as you paid for. Say which number you
read it at when you report the percentage.

Read it once, report it plainly, and stop. Then:

- `set-experiment-workflow(team_id, experiment_id, status: "in-progress", note)` with a note the
  next operator can act on: what was created, what is running, what the sizing was, and what the
  next step is.
- Tell your operator that **exp-build** is what analyzes the responses and scores the opportunity,
  and that it is worth starting once readiness is at or above the 80 percent line, read at the
  `min_responses` you sized for. Name it and let them choose. Do not start it yourself, and do not
  analyze the responses here.

## Judgment calls

- **A rich AI answer is never demand** (rule 1). It is a default behavior of the model, not evidence
  anyone asked.
- **Do not prune the campaign to the target set.** Every demand-grounded prompt stays in the
  campaign for monitoring; the experiment's targets are a subset chosen later (rule 8).
- **If the responses come back from one provider only**, say so verbatim wherever you describe the
  baseline (rule 6). Do not call a single-provider baseline multi-model coverage.
- **An ask that sounds like a new campaign is often a resumption.** Check `list-campaigns` and
  `list-experiments` for the team and topic before creating anything.
- **Web access is whatever your host gives you.** A real browser tool reads client-rendered pages
  that a plain fetch cannot, and where there is no browsing at all, say a claim is unverified rather
  than assuming it. Nothing in this phase depends on browsing.
