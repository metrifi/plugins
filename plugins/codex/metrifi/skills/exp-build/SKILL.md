---
name: exp-build
description: "Phase two of a MetriFi GEO experiment: take a campaign whose baseline responses are in and turn it into a defensible client deliverable. Reads the responses, scores every prompt on measured demand, on whether models name any specific financial institution in their body text, and on the gap in the client's own published content, then opens with the Viability Verdict (STRONG, VIABLE, WEAK, or AVOID at a stated confidence) and locks the biggest viable target. On WEAK or AVOID it pivots rather than shipping a weak target: new demand-grounded prompts attached with update-experiment using prompt_ids_mode add, so the originals stay attached and keep tracking. Then it writes the opportunity block the client reads first, the evidence and decisions and build-analysis documents with their rejected alternatives, drafts the article against the institution's verified live site, and assembles the client page with build-deliverable. Use it once responses have populated: 'analyze the baseline', 'the responses are in', 'score the opportunity', 'which prompt should we target', 'is this campaign worth publishing against', 'write the article', 'draft the deliverable', 'build the client page', 'we need to pivot this experiment', 'lock the target'. It ends with a draft that has had no compliance, accessibility, fact, or hygiene check and names the skill that runs them. It never sends anything to a client and never surfaces the client page URL. NOT for creating a campaign or measuring demand (that is exp-research), NOT for the four pre-publish checks (that is exp-review), NOT for sending or for applying client answers (those are exp-deliver and exp-revise), and NOT for website page design (those are the Site Builder skills)."
---

# exp-build: from a populated campaign to a defensible draft

This phase decides whether the experiment is worth running at all, and only then writes anything the
client will read. Getting that order backwards is how a weak target ships.

Read `references/methodology-rules.md` and `references/workflow-overview.md` before you write. Rules
5, 9, 10, 11 to 14, 16, 19, and 20 all bite inside this phase.

## Orient first

`get-experiment-workflow(team_id, experiment_id)` when an experiment already exists: it returns the
status, the last operator's note, the event log, which documents exist, the keyword research, the
target prompts, and the deliverable with its blocking items and checks. That is your resume point.

No experiment yet? `list-experiments(team_id)` and `list-campaigns(team_id)`, then reuse a draft
experiment that clearly belongs to this campaign and topic. A draft for a **different** topic can
legitimately sit on the same campaign, so leave it alone. Create one only when neither matches
(the recipe is in step 3).

## 1. Is the campaign populated enough to score?

`get-campaign-readiness(team_id, campaign_id)` before anything else. It reports the share of prompts
with enough completed responses, the per-prompt counts, and any jobs still running.

**There is no polling loop.** Read the number once. Below the 80 percent line, say so plainly, name
the prompts still waiting, and stop: scoring a half-populated campaign reads empty slots as closed
ones and can trigger a pivot on nothing. Everything here is safe to re-run once the responses land.

**Read the window before you believe a zero.** Readiness counts completed responses inside a
lookback window, 28 days and three responses per prompt by default. A campaign whose baseline was
run months ago reports 0 percent populated while `list-prompts` shows responses on every prompt.
Widen it with `window_days` to see what actually exists. If the baseline is real but old, say its
age in the analysis, since a stale baseline measures a model that has since moved; if it is thin,
running the prompts again is the fix.

The one other exception is a deliberate partial read the person asked for. Then say in the analysis
exactly which prompts had no data, and treat them as pending rather than as failures.

## 2. Analyze the baseline, read-only

Nothing in this step writes.

1. `list-prompts(team_id, campaign_id)` for per-prompt visibility and response counts.
2. `get-org-visibility(team_id, campaign_id, limit: 0)` for the full competitive ranking. Filter
   program administrators and government lenders out of the competitor set: they are not the
   institution's competitors and they inflate the ranking.
3. `list-responses(team_id, prompt_id)` then `get-response(team_id, response_id)` to read bodies.
   **Sample at least four responses per candidate target prompt** (rule 5).

Per prompt, record four things:

- **The institution-citation gate** (rule 5): in how many sampled responses does the **body text**
  name any specific bank or credit union, as opposed to a sources panel? Zero of N is a structurally
  closed slot, and the prompt drops from the target set no matter how much demand it has. Note which
  institutions are named, in how many responses, and whether the mention is body text or a citation.
- **Whether the client is already named**, which separates foothold defense from acquisition.
- **The source types cited:** government or program administrator, personal-finance media, an
  institution's own site, an aggregator.
- **The answer shape:** a ranked list, an institution roster, or a rate list (all citation friendly)
  against a generic explainer or a government-source-dominated answer (citation hostile).

Then score each prompt: measured demand, times slot openness (institution-naming responses over
responses sampled), times the client's own gap (room to grow), times winnability. A prompt at zero
visibility where strong competitors **are** named is a prime opportunity. A prompt at zero where
**no** institution is named is not an opportunity at all.

## 3. The Viability Verdict, then lock or pivot

Open the analysis with the verdict block, verbatim in this shape (rule 16):

> **Experiment Viability Verdict: STRONG / VIABLE / WEAK / AVOID, confidence HIGH / MEDIUM / LOW**

Backed by the four pillars: the institution slot (open or closed, with the count), source diversity,
competitor presence, and answer shape. The campaign verdict reflects the best available target: if
any prompt is VIABLE or STRONG, the campaign is at least VIABLE.

**STRONG or VIABLE:** lock the target, typically six to ten prompts, and attach them with
`update-experiment(team_id, experiment_id, prompt_ids, prompt_ids_mode: "replace")`. Non-target
prompts stay in the campaign and keep tracking (rule 8).

**WEAK or AVOID: pivot. Never ship a weak target.** Pivots run in tiers, cheapest first:

| Tier | What it is | Who executes it |
|---|---|---|
| Re-select | a different prompt from the ones already run | you, inside the ranking, at no cost |
| Re-angle | an untried intent angle in the same market | you |
| Re-scope | a materially different geography or segment | you |
| Re-campaign | an adjacent market, a sibling campaign | **the human, never you** |

**AVOID at HIGH confidence halts the experiment.** That is a do-not-publish signal. Report it, say
what evidence produced it, and stop rather than pivoting your way around it.

Executing a re-angle or re-scope pivot:

1. **Ground the candidates in demand first** (rules 1 to 3): translate to umbrella noun phrases,
   `research-keywords`, drop anything without measurable volume, and record every verdict with
   `record-keyword-research`. A pivot that creates zero-demand prompts repeats the mistake that
   caused the pivot.
2. `list-prompts` and drop candidates duplicating an existing prompt's intent.
3. `create-prompt` for the survivors, then `run-prompt` for each new prompt id. Do not re-run the
   whole campaign: the existing prompts already have a clean baseline.
4. `update-experiment(..., prompt_ids: [the new ids], prompt_ids_mode: "add")`. The **add** mode is
   the point: replace would detach the originals, and a prompt whose slot is closed today can open
   later as model training data moves.
5. Read `get-campaign-readiness` again before re-scoring. Same rule as step 1: read the fact, do not
   poll, and stop if the new prompts have not populated. This is safe to resume.
6. Log it: `add-experiment-event(team_id, experiment_id, kind: "pivot-executed", summary)` naming the
   round, the tier, the plan, and the new prompt ids. Pass `idempotency_key` with a stable value per
   pivot, such as `pivot-2-executed`, so a resumed run cannot double-log. If the tool rejects that
   argument, the platform milestone carrying it has not shipped yet: drop it, and read the event log
   for an existing line for this pivot before writing one.

**Two executed pivots per experiment is the ceiling.** A third means the market read itself was
wrong, which is a human call, not another round. At the ceiling, report the closest opportunities
you found, the pivot you would recommend next, and stop.

## 4. The experiment record

Create it early, as a draft, so the workflow state has a home before the writing starts:
`create-experiment(team_id, name, campaign_id, description, status: "draft")`. **Pass no dates**
(rule 7): `started_at` starts the 28-day measurement clock, and that clock starts when the article
goes live. Then `update-experiment` to attach the locked target prompt ids.

Write the hypothesis into the analysis in this form: if we publish a page that does X, the concrete
substantiable hook from the evidence, visibility on the target prompts rises from its current level
toward Y within the measurement window, because the responses show Z is missing.

## 5. Evidence and decisions, before any prose

Decisions are complete before drafting starts (rule 10). There is no separate draft-review pause:
the decisions and the article travel into the dossier together, where the client's reviewers see
both.

All three land through `set-experiment-document(team_id, experiment_id, kind, title, markdown,
summary)`, which upserts on kind, so re-running a step overwrites in place.

- **`build-analysis`** (in the dossier): the verdict block, the opportunity ranking table, the locked
  target or the pivot history, and a short "biggest opportunity, and why" paragraph written for a
  marketing manager at the institution.
- **`evidence`** (in the dossier): every empirical input as an observation **with a citation**, never
  as a prescription. Response patterns, cited sources, the concrete competitor hooks that won
  citations. Two things belong here that are easy to forget:
  - **The single-provider caveat** (rule 6), verbatim, if the responses came from one provider.
  - **The length anchor** (rule 20): identify the competitor pages the baseline actually cited for
    the locked targets, read a representative sample, and record each page's main-content word
    count with its URL, separating single-institution product or rate pages from multi-institution
    comparison roundups. Report the range and rough median for each class. If a page cannot be
    counted, say so instead of guessing.
- **`decisions`** (in the dossier): each choice in a Choice, Evidence, Alternatives-rejected shape,
  and **the rejected line is mandatory**. Empirical patterns are observations, not prescriptions
  (rule 9): the canonical rejection is "models cite top performers in comparison contexts, so we
  should compare competitors on the client's own page", which cites competitors authoritatively from
  the client's domain and trips advertising review (rule 12). Encode the rest as decisions too: rates
  link out to the rates page rather than appearing in the body (rule 11), no unbacked superlatives
  about the client (rule 13), concrete quantitative substantiable hooks (rule 14), and a
  **deliverable length band** anchored to the measured single-institution page lengths, rejecting
  both "longer is better, write a 10,000 word pillar" and "match the longest comparison roundup"
  (rule 20).

Keep the `brief` and the `outline` as documents with `in_dossier: false`. They are working notes, not
client reading. The outline's per-section word targets sum to the decided length band.

## 6. The opportunity block

`set-experiment-opportunity(team_id, experiment_id, headline, demand, verdict, target_prompts)`. This
is the first thing the client reads, and `build-deliverable` copies it into the page verbatim, so it
is client-facing copy: plain language, no em dashes. The headline names the answer being won, the
demand line carries the measured number, and each target prompt carries its id, its consumer
phrasing, and where the client stands today.

The experiment's in-product analysis and recommendation records are the same finding in the MetriFi
dashboard. When the client uses that view, write them too: `set-experiment-analysis` (its summary
opens with the same verdict block) and `set-experiment-recommendation` with one to three actions,
calling `list-action-types` first because every action type has to match one of those values. Both
replace rather than patch, so send the whole payload.

## 7. Draft the article

`update-deliverable-draft` patches: send only what changed, and a half-finished draft stays writable
because only what you send is validated. The first call creates the deliverable when you pass
`experiment_id`, `slug`, and `title`.

Write the article to the decided length band and to the outline, section by section:

- **Draft to the verified site** (rule 19). The institution's live website is presumed compliant for
  its own published wording. Use the site's words, never a vaguer or a stronger paraphrase, and pull
  published facts (page URLs, branch addresses and phone numbers, application channels, eligibility
  wording, product features) from the site yourself instead of leaving a placeholder. A claim the
  site cannot support ships in its softened, site-supported form now.
- **No rate, APR, payment, or down-payment numbers in the body** tied to the client's offer (rule 11).
  Link to the rates page, where the disclosures already live. Explaining how to compare rates is
  fine.
- **No "best", "top rated", or "trusted" claims about the client** without substantiation (rule 13).
  Quoting a competitor's own self-claim is reportage and is fine.
- **No em dashes or en dashes anywhere**, including inside link text. They are the top AI tell, and
  the platform's own contract rejects them in client copy. Use a comma, a colon, or parentheses.
  Avoid the other AI tells too ("delve into", "in conclusion", "it is worth noting").
- **Cite sources inline** as you make factual claims, so the fact-verification battery has clean
  targets later.
- Plain language a member can read. Intro and conclusion last.

Then the client-facing scaffolding, in the same tool:

- **`checklist`**: the pre-publish rows, each with an id, a group, a label, and a state.
- **`action_items`**: as few as possible, ideally zero. A finding becomes an action item only after
  failing all three tests in rule 19, in order: can it be resolved by writing what the site already
  publishes, can you verify it yourself, and did a review already verify it? Never ask a human to
  confirm what a reviewer confirmed. Each item needs an id, a type, a question of 20 words or fewer
  in plain second person, and an explicit `blocking` value. Every non-attestation item states its
  default, and an item with a safe default is not blocking. The attestation goes last.
- **`evidence_overview`**: the plain-language "why we are confident" card.

Anchors quote the article markdown exactly, so update an anchor whenever you edit the sentence it
points at.

## 8. Assemble and check the warnings

`build-deliverable(team_id, deliverable_id, dry_run: true)` first. It assembles the page from server
state, the opportunity block, and the dossier documents, then runs the full contract: anchor quotes
resolve, enums and shapes are legal, no em dashes in client copy. It refuses with the exact reason
rather than shipping a broken page.

**Read what comes back, including the warnings, and fix the cause rather than working around it.**
An anchor that will not resolve means the article moved under it. Then build for real with a
`changelog` line describing what changed.

Do not surface the client page URL to anyone. Sending is a later phase behind a human gate, and a URL
handed over early is a send that nobody approved.

## 9. Hand off

- `set-experiment-workflow(team_id, experiment_id, status: "in-progress", note)`. Write the note as a
  sentence a colleague can act on: the verdict and the locked target, what is drafted, and what is
  next.
- `add-experiment-event` for the things worth finding months later: the target locked, the documents
  written, the draft built.
- Tell your operator that the draft has had **no compliance, accessibility, fact, or hygiene check**,
  and that **exp-review** is the skill that runs all four and records the verdicts that unlock
  sending. Name it and let them choose; do not start it yourself.

## Judgment calls

- **Demand alone never justifies a target.** A closed institution slot beats any volume number
  (rule 5).
- **A pivot into an adjacent market goes back to the human**, always. So does an AVOID at high
  confidence.
- **Do not re-derive judgment the workflow already recorded.** If the decisions document settled the
  angle, build on it instead of re-litigating it.
- **Web access is whatever your host gives you.** A real browser tool reads client-rendered pages
  that a plain fetch cannot. Where there is no browsing at all, mark the claim as needing human
  verification and keep the softened wording, rather than asserting it.
- **A placeholder in the draft becomes a client action item downstream**, so the bar for writing one
  is that only the client can know it: years served, volumes, named officers, charter scope beyond
  published wording.
