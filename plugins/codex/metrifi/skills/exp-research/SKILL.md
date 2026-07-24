---
name: exp-research
description: "Phase one of a MetriFi GEO experiment: turn a topic into a demand-grounded campaign and get baseline LLM responses running. Proposes candidate prompts the way a real consumer asks an AI assistant (never with a brand name in them), opens or reuses the campaign the research is scoped to, measures actual search demand with research-keywords, triages keep or drop on measured volume alone, records every verdict including the drops with record-keyword-research, creates only the prompts that survived, runs them, and then reads get-campaign-readiness as a fact instead of polling. Use it whenever someone wants to start an experiment or size a topic: 'start an experiment for this team on HELOCs', 'research this topic', 'stand up a campaign', 'what prompts should we track for this credit union', 'is this topic worth an experiment', 'do people actually search for this', 'set up prompts for auto refinance', 'keyword research for a campaign', 'we need more prompts on this campaign'. Offers a dry run (triage only: no prompts created, nothing run) when the topic is unvalidated or the person wants the demand table before committing anything. Ends by reporting readiness and naming the skill that analyzes the responses; it never analyzes them itself. NOT for scoring responses, locking a target, or writing the article (that is exp-build), NOT for checking where an experiment already stands (that is exp-status), and NOT for building or auditing a website (those are the Site Builder skills and the client report skill)."
---

# exp-research: from a topic to a demand-grounded campaign

The first phase of an experiment. It ends with prompts running against the LLM providers and a
readiness number, not with an analysis.

Read `references/methodology-rules.md` (rules 1 to 4, 6, 7, 8) and `references/workflow-overview.md`
before the first write. Rules 1 to 3 are the whole triage; skipping them is how a campaign ends up
tracking prompts nobody searches.

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

## 1. Frame the candidate set, and open the campaign

Decide new or existing first: `list-campaigns(team_id)`, and reuse a campaign that already covers
this topic rather than standing up a near-duplicate. `get-campaign(team_id, campaign_id)` shows its
location and keywords when the name alone is ambiguous. Create the new one now, with
`create-campaign(team_id, name, description, location, keywords)` and the geography in `location`,
because the demand research and the keep-drop verdicts are both recorded against a campaign. The
campaign is a container, not a commitment: no prompt exists inside it until the triage in step 3
says so.

Then generate a **wide** candidate set, 24 to 36 prompts, spread across:

- **Intent angles:** informational, comparative, transactional, locational.
- **The segments and geography variants** you scoped above.

Breadth is deliberate. The build phase picks the biggest opportunity out of this set and pivots
among these prompts, so cover the space rather than writing six phrasings of one question.

Two hard rules on the prompt text itself:

- **Write it the way a consumer asks an AI assistant**, in their words, not in marketing language.
- **Never put a brand name in a prompt**, the client's or a competitor's. The entire measurement is
  which brands a model names on its own. A prompt naming the institution measures nothing.

## 2. Measure demand

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

## 3. Triage

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
phase pivots across. Fifteen to twenty tracked prompts is a healthy campaign.

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

## 4. Commit the experiment and the prompts

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

## 5. Run the prompts

- **A campaign with no prior baseline:** `run-campaign-prompts(team_id, campaign_id, providers,
  count)`. Ask for several providers and more than one response per prompt: the
  institution-citation gate in the next phase samples at least four responses per prompt, so one
  response each is not enough to work with.
- **A campaign that already has responses:** `run-prompt(team_id, prompt_id, providers, count)` for
  each prompt you just created. Running the whole campaign again re-runs prompts that already have a
  clean baseline and muddies their history.

If a run tool refuses, report its exact reason and stop there. The campaign, the experiment, and the
prompts already exist, so running again once the reason is resolved picks up exactly where you left
off. Nothing needs to be recreated.

Log it: `add-experiment-event(team_id, experiment_id, kind: "prompts-created", summary)` with the
count, the campaign, and the unique demand total, and `actor_label` naming yourself as the agent.

## 6. Read readiness, then hand off

Responses populate asynchronously, over minutes to hours. **There is no polling loop.**
`get-campaign-readiness(team_id, campaign_id)` reports the share of prompts with enough completed
responses, the per-prompt counts and latest response dates, any in-progress jobs, and the auto-run
schedule. It is a fact you read, not a gate that refuses.

It counts responses inside a lookback window, 28 days and three responses per prompt by default, so
a campaign you reused reads as empty when its baseline predates the window. `window_days` widens it
when you want to see what already exists.

Read it once, report it plainly, and stop. Then:

- `set-experiment-workflow(team_id, experiment_id, status: "in-progress", note)` with a note the
  next operator can act on: what was created, what is running, and what the next step is.
- Tell your operator that **exp-build** is what analyzes the responses and scores the opportunity,
  and that it is worth starting once readiness is at or above the 80 percent line. Name it and let
  them choose. Do not start it yourself, and do not analyze the responses here.

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
