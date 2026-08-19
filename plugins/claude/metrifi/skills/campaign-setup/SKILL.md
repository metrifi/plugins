---
name: campaign-setup
description: "Stand up a MetriFi GEO team's campaigns and the prompts inside them, before any experiment exists. Owns new-team onboarding: pick the most populated market the institution actually serves, confirm the client's own organization is registered so its responses get scored at all, and build the first campaign as a WIDE baseline across the products that matter (auto, home, checking, savings, CDs, retirement, personal) rather than deep on one topic. Every prompt names the geography in its own text, because the campaign's location is only used to buy keyword demand and is never sent to the LLM providers. Use when a team is new or a campaign is being created or added to: 'set up this new team', 'onboard this client in GEO', 'create a campaign', 'add prompts to this campaign', 'get a baseline for this institution', 'which market should we track', 'their prompts are not scoped to a location', 'why is everything reading zero'. NOT for scoring an experiment's opportunity (exp-build), NOT for the demand triage and experiment record on a topic campaign (exp-research), NOT website work."
---

# campaign-setup: the campaign layer, before any experiment

Campaigns and prompts come first. An experiment is a later thing layered on top of a campaign that
already exists and already has responses. This skill covers everything up to that point: the
institution's market, its registered organization, its first campaign, and the prompts inside it.

Read `references/methodology-rules.md` (rules 22 and 23 first, then 1, 2, 3, 21) and
`references/workflow-overview.md` before the first write. Rules 22 and 23 are the two this skill
exists to enforce, and both were bought by live campaigns that measured nothing.

## What this skill is for, and what it hands off

| The ask | Here or elsewhere |
|---|---|
| "Set up this new team", "onboard this client", "get me a baseline" | here, all of it |
| "Create a campaign", "add prompts to this campaign" | here |
| "Their prompts are not scoped to a city", "everything reads zero" | here, start at step 3 |
| "Start an experiment on HELOCs", "is this topic worth doing", "keyword research for a campaign" | `exp-research` |
| "The responses are in", "what should we target", "write the article" | `exp-build` |

The dividing line: **this skill measures the institution, `exp-research` measures a topic.** A team
whose first campaign does not exist yet is always this skill, even when the ask names a topic,
because a topic campaign built before a baseline is a guess about where the opportunity is.

## 1. Read the team before you write anything

Four read-only calls:

1. **`list-teams`**, then `get-team-usage(team_id)`. The usage read is the first number that
   constrains anything: running a prompt spends the plan's GEO responses, and the campaign you can
   afford is sized against what is left (rule 21). The target is 10 to 15 tracked prompts at 5
   samples each, which needs a budget of prompts times 5 times 1.5, the extra half being the
   reserve the build phase spends later out of the same pool.
2. **`list-campaigns(team_id)`.** If a campaign already exists, this may be a resumption rather
   than an onboarding. Read it with `get-campaign` before proposing anything new.
3. **`get-org-visibility(team_id, campaign_id, limit: 0)`** on any campaign that exists. This is
   how you find out whether the institution itself is registered.
4. **Research the institution.** Its products, its branch footprint, its charter or field of
   membership, and the markets it serves. Web access is whatever your host gives you; where there
   is none, ask the operator for the footprint rather than assuming it.

**If the plan cannot buy the target set, say so before you build something smaller** (rule 21).
Name the number the target needs, the number remaining, and the shortfall, then let the operator
choose to upgrade, to spend now and finish after the reset, or to wait. Sizing down quietly
produces a campaign that looks finished and is not.

## 2. The owned organization, or nothing is measured

Visibility is computed by matching an organization's terms against response text. **If the
institution is not registered as an organization on this team, every response scores zero forever**,
and that zero looks exactly like a finding. Check before you run anything.

There is no tool in this plugin that creates one. Say so plainly and once: a person adds the
institution as an organization in the MetriFi GEO app, with its name, its website, and its common
name variants as terms. Do it before the run where you can. A registration added later is not lost
work, because the platform rescans past responses when a new term appears, but until it exists say
"visibility is unmeasured on this campaign" rather than reporting a zero.

**Competitors are the opposite: the platform extracts them from the responses on its own.** Do not
ask anyone to register a competitor set by hand, and do not report "no competitive ranking is
available" without calling `get-org-visibility` first.

## 3. Pick the geography, and pick one

**The first campaign is scoped to the single most populated area the institution actually serves**
(rule 23). Not its headquarters town, and not its whole charter footprint.

Work it out rather than guessing:

- **Where the branches are.** A branch list is the strongest evidence of a market actually served.
- **The charter or field of membership.** A credit union's field of membership and a bank's
  charter language name the counties or the employer groups it may serve.
- **Population.** Rank the candidates by population and take the top one. A first campaign scoped
  to a small home town measures a market too thin to move.

Then say which one you picked, what the alternatives were, and why, in two or three lines. That is
a judgment the operator may want to overrule, and it sets the scope of everything downstream.

**One campaign, one geography.** A campaign spanning three counties cannot buy demand for any of
them and cannot have its prompts name the place. Additional markets are additional campaigns,
proposed out loud rather than crammed into this one.

Set it on the campaign as soon as the campaign exists:
`set-campaign-location(team_id, campaign_id, query)` resolves a plain place name and stores it. An
ambiguous query writes nothing and returns candidates; pick the row whose `type` matches what you
meant, usually `County` or `City`, and call again with its `location_code`.

## 4. The first campaign is wide, not deep

The first campaign is **one geography across the products**, not one product deep (rule 23). It is
the baseline every later number is read against.

Cover the top 80 percent of what this institution actually offers, at roughly one prompt per
product line. For a consumer bank or credit union that is:

- auto loans
- home loans (purchase and refinance)
- checking accounts
- savings accounts
- CDs and share certificates
- retirement and IRAs
- personal loans

Add whatever else is genuinely core for this institution, and drop what it does not offer. A
business-heavy bank earns a business-banking prompt in the baseline; a credit union with no wealth
arm does not earn a retirement one. **Walk the list against what the institution actually sells
rather than pasting it in.**

Then create it: `create-campaign(team_id, name, description, location, keywords)`. Name it for the
market and the scope, not for a topic: "Sonoma County Consumer Banking Baseline" rather than
"HELOC Campaign". The campaign is a container, not a commitment; no prompt exists inside it until
step 6.

**Depth comes second, and it comes from this baseline.** Once the baseline has responses, the
product that is both weak and in demand is the one that earns a deep topic campaign, and that is
`exp-research`. Say that out loud when you hand off, so the ordering is visible.

## 5. Write prompts that name the place

Two hard rules, and the first one is the one that gets skipped.

**Every prompt names the geography in its own text** (rule 22). "Where can I get the best auto loan
rate in Sonoma County?" measures something. "Where can I get the best auto loan rate locally?"
measures a national market the institution is not in.

This is not obvious from the data model, which is why it keeps happening: the campaign's location
is a **demand-measurement setting**. It tells `research-keywords` which market to buy volume in. It
is **never sent to the LLM providers** when a prompt runs. The model sees the prompt text and
nothing else. `create-prompt` warns when the place is missing; that warning is a defect to fix, not
a note to acknowledge.

What counts:

| Scoping | Verdict |
|---|---|
| "in Sonoma County", "in Santa Rosa", "in the North Bay" | good |
| "in California" | weak. A state is a big market and a community institution is rarely in a state-wide answer. Use it only where the product genuinely is state-level, and expect a thin result |
| "locally", "near me", "in my area", "do local banks offer" | not scoped at all. This is the defect |

**Never put a brand name in a prompt**, the client's or a competitor's. The whole measurement is
which brands a model names on its own; a prompt naming the institution measures nothing.

Beyond those two, write the way a consumer actually asks an AI assistant, in their words, and
spread the set across intent angles: comparison ("bank or credit union for an auto loan in X"),
transactional ("who has the best CD rates in X"), scenario ("I am buying my first home in X"), and
local discovery ("best local banks in X").

## 6. Measure demand, then create only what survives

The baseline is a wide set by design, but a prompt nobody searches for is still not worth a
response. Run the same triage `exp-research` uses, on the same rules:

1. **Translate each candidate into keyword phrases ordered by rule 2**: the shortest bare-noun
   umbrella form first ("best mortgage lender"), the geo-anchored form second, the
   stacked-modifier prompt-literal form last or not at all. **Rule 2 is about keywords, not about
   the prompt text**, which still names the place. Confusing the two is what produced the unscoped
   prompts this skill exists to prevent.
2. **`research-keywords(team_id, campaign_id, keywords)`** with the whole list in one call. With
   the campaign's geography set it stores both `monthly_volume` (the United States national figure)
   and `local_monthly_volume` (the same phrase in the campaign's market). If a whole batch comes
   back at zero, re-check the phrasing against rule 2 and call again with `refresh: true` before
   believing it.
3. **Triage on rule 3**, judged on `local_monthly_volume` where a geography is set: 50 or more
   local monthly searches is clear demand; 20 or more local with 5,000 or more national also
   qualifies; 10 or more local plus an existing citation is foothold defense; everything else drops
   unless you write a rescue rationale.
4. **A core product that fails triage still deserves a note, not silence.** The baseline is meant
   to cover the product space, so a product line dropped for zero local demand is a finding about
   that market. Record it as a drop with its reason rather than quietly omitting the category.
5. **Record every verdict, drops included**, with `record-keyword-research(team_id, campaign_id,
   rows)`: the keyword, the volume, the difficulty, the candidate prompt it backs, keep or drop,
   and `verdict_reason`.

Then create the survivors with `create-prompt(team_id, campaign_id, content)`, one call each, and
read what each call returns. A geography warning means rewrite that prompt and create it again
rather than moving on.

## 7. Run the baseline, read readiness, hand off

`run-campaign-prompts(team_id, campaign_id, providers, count)` for a campaign with no prior
baseline, or `run-prompt(team_id, prompt_id, providers, count)` per prompt when the campaign
already has responses you do not want to muddy. `count` is the samples per prompt you sized in
step 1, never a number picked here.

**Providers are a pool, not a multiplier.** The requested count is spread across the providers the
platform can run, so naming more of them costs nothing extra and buys no extra sample. Report what
the run tools name: a baseline that came back from one provider is a single-provider baseline in
everything you write about it (rule 6).

Responses populate asynchronously, over minutes to hours. **There is no polling loop.**
`get-campaign-readiness(team_id, campaign_id)` reports the share of prompts with enough completed
responses; pass `min_responses` equal to the samples you budgeted, or the default of three reports
0 percent on a campaign that is exactly as populated as you paid for. Read it once, report it
plainly, and stop.

Then hand off in two lines: the baseline is running, `exp-research` is what takes the weakest
in-demand product from it into a topic campaign, and `exp-build` is what scores an experiment once
responses are in. Name them and let the operator choose.

## Reading the rankings honestly

`get-org-visibility(team_id, campaign_id, limit: 0)` is the competitive picture, and the platform
extracts those competitors from the responses itself.

Entities that are not competitors are filtered on the way in now: category nouns ("Bank", "Credit
Union", "Online Lender"), regulators (FDIC, NCUA), publishers (NerdWallet, Bankrate) and payment
rails (Visa, Zelle). **Campaigns created before that filter existed may still carry them.** If one
appears in a ranking you are about to report, exclude it, say that you did, and tell the operator
the campaign has stale entries so a person can clear them. Do not report a generic noun as a
competitor, and do not report a ranking position computed with one in it.

## Judgment calls

- **An ask that sounds like a new campaign is often a resumption.** Check `list-campaigns` before
  creating anything.
- **A rich AI answer is never demand** (rule 1). It is a default behavior of the model, not
  evidence that anyone asked.
- **A category that does not fit this campaign's scope gets its own campaign**, proposed out loud,
  rather than diluting one whose name then stops describing its contents.
- **If the operator wants a deep topic campaign first**, say once what the baseline would have
  given them and then build what they asked for. The ordering is a recommendation, not a gate.
