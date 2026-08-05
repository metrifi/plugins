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

Size the experiment to what is left (rule 21):

1. **Reserve about a third** of the remaining responses for the build phase, which pivots and
   re-runs out of the same pool.
2. **Split the rest** into tracked prompts times samples per prompt. Providers are a pool, not a
   multiplier: the run tools spread the requested count across the providers they can run, so
   naming more providers costs nothing extra and buys no extra sample.
3. **Cut prompt count before samples per prompt**, with two samples as the floor. The next phase
   reads body text for institution mentions (rule 5), and a single response cannot tell a closed
   slot from an unlucky draw.
4. **Say the tradeoff in one plain sentence** before you create anything: what the budget bought,
   and what got thinner because of it. For example, "this plan has 44 GEO responses left this
   period, so I am tracking 10 prompts at 3 samples each instead of the usual 15 to 20, and holding
   about 14 back for the build phase."

On a generous plan this is a read that changes nothing. On a small one it is the difference between
a smaller honest experiment and either a refusal or a blown cap, and neither of those is an option:
run the best experiment the plan allows.

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

**Then check that the client's organization is registered on this campaign.**
`get-org-visibility(team_id, campaign_id, limit: 0)` lists the organizations the campaign measures
mentions against. If the institution is not in that list, nothing is tracking it: the visibility
percentages every later phase reads come from matching an organization's terms against response
text, so an unregistered institution reads as zero visibility forever, which looks like a finding
and is actually an empty measurement. There is no tool in this plugin that creates one, so say so
plainly and once: a person adds the institution as an organization on this campaign, with its name
and website and its common name variants as terms, in the MetriFi GEO app. Do it before the run
where you can. A registration added later is not lost work, because the platform rescans past
responses when a new term appears, but until it exists say "visibility is unmeasured on this
campaign" rather than reporting a zero.

Then generate a **wide** candidate set, 24 to 36 prompts, spread across:

- **Intent angles:** informational, comparative, transactional, locational.
- **The segments and geography variants** you scoped above.

Breadth is deliberate. The build phase picks the biggest opportunity out of this set and pivots
among these prompts, so cover the space rather than writing six phrasings of one question.

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

**These volumes are national United States numbers, not local ones.** The platform buys demand at
the country level, so "best mortgage lender" comes back as the whole country's monthly searches, not
the client's counties. Two consequences, and both of them show up the moment a client reads the
number:

- **The geo-anchored phrase is the honest local-demand signal.** "mortgage lender wisconsin" or
  "heloc huntsville al" is the closest measurable proxy for demand in the campaign's geography, so
  lead the client-facing table with those and treat the umbrella form as the ceiling, not the market.
- **Label every national number as national**, in the triage table, in the `tracked-prompts`
  document, and out loud whenever you quote one. An unlabeled national volume presented to a credit
  union reads as its own market, which overstates the opportunity by orders of magnitude and is the
  kind of number a client repeats to their board.

## 4. Triage

Apply rule 3 to the measured volumes:

| Verdict | When |
|---|---|
| **KEEP, clear demand** | 50 or more monthly searches on at least one translated phrase |
| **KEEP, foothold defense** | 10 or more monthly searches and the owned organization is already cited in AI answers for that prompt |
| **RESCUE** | worth tracking despite missing the threshold, with an explicit rationale and a re-check date |
| **DROP** | the default: zero volume, or below threshold with no rescue rationale |

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
