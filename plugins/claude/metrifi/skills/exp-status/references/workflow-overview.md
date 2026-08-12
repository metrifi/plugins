# The GEO experiment workflow: where state lives and how a run moves

A MetriFi GEO experiment takes a topic from "nobody has asked whether this is worth doing" to a
published article whose lift can be measured, with a client-facing deliverable in the middle that a
real person at the institution reviews and signs off on.

Two facts shape everything below.

**All state lives on the MetriFi platform.** Nothing is written to your machine. There is no
experiment folder, no local artifact, no file to hand to the next person. Any operator on the team,
on any machine, in any supported agent, can pick up any experiment. That is what makes this
multi-operator, and it is why "where am I" is a question with one answer instead of a folder listing.

**The platform owns state, structure, and completeness. You own judgment and web access.** The
server never re-judges your content. It enforces three things: that a send with an incomplete
required check says so loudly (a warning on send, a refusal only at publish), that the assembled
page is structurally valid, and that a check recorded against an older article counts as stale.
Everything that requires reading, thinking, or browsing is yours.

## The one orientation call

`get-experiment-workflow(team_id, experiment_id)` is how you find out where an experiment stands.
It returns the workflow status and the note the last operator left, the recent event log, the index
of working documents that exist, the keyword research, the target prompts, and the deliverable with
its outstanding blocking items and latest check results.

Call it first, every time, before doing anything to an experiment. It does not return document
bodies; fetch one with `get-experiment-document(team_id, experiment_id, kind)` when you need to read
it.

To find experiments in the first place: `whoami` tells you who you are and which teams you are on,
`list-teams` gives you the team slugs, `list-experiments(team_id)` lists that team's experiments, and
`list-deliverables(team_id)` lists the client-facing pages.

## The phase map

Six phases. Each names the skill that carries it, so you can tell your operator which one fits next.
No phase reads or writes a file.

### 1. Research: from a topic to a demand-grounded campaign

Skill: **exp-research**.

Read `get-team-usage(team_id)` first and size the experiment to the GEO responses the team has left
this period (methodology rule 21): prompt count and samples per prompt scale to the budget, the
tradeoff gets said out loud in one sentence, and the run happens at the size the plan allows rather
than being refused or overspent.

Then propose candidate prompts the way a consumer would actually ask an AI assistant, never with a
brand name in the prompt, spread across intent angles, geographies, and audience segments. Measure real
demand with `research-keywords`, leading with umbrella noun phrases (methodology rule 2). Triage
keep or drop on measured volume only (rules 1 and 3) and record every verdict, including the drops,
with `record-keyword-research`. Then create the campaign and its prompts and run them with
`run-campaign-prompts`.

Baseline responses populate asynchronously. There is no polling loop: `get-campaign-readiness`
reports the share of prompts with enough completed responses, as a fact you read, not a gate that
refuses. Pass `min_responses` matching the samples per prompt you budgeted, so the population line
measures the experiment you actually bought.

### 2. Build: from a populated campaign to a defensible draft

Skill: **exp-build**.

Read the baseline. Score each prompt on demand, on whether the model's body text ever names a
specific institution (rule 5), and on the gap in the client's own published content. Produce the
viability verdict (rule 16) and lock the biggest viable target. On a weak or avoid verdict, pivot
instead of shipping a weak target: re-select among prompts already run first, then create and run
new demand-grounded prompts and attach them with `update-experiment` using
`prompt_ids_mode: "add"` so the originals stay attached. Log every pivot with `add-experiment-event`.

Then write the strategy and the draft, all of it server side:

- `set-experiment-opportunity` for the "why this exists" block the client reads first.
- `set-experiment-document` for `build-analysis`, `evidence`, `decisions`, `tracked-prompts`,
  `brief`, and `outline`. Documents with `in_dossier: true` ship to the client; set it false for
  internal notes.
- `update-deliverable-draft` for the article markdown, the checklist, and the action items. It
  patches: send only what changed, and a half-finished draft stays writable because only what you
  send is validated. The first call creates the deliverable when you pass `experiment_id`, `slug`,
  and `title`.
- `build-deliverable` assembles the client page from that state and validates it. Pass
  `dry_run: true` to see the result without saving a version.

### 3. Review: four checks, recorded

Skill: **exp-review**.

Four batteries: hygiene, NCUA compliance, accessibility, and fact verification. Each one is
performed by the agent, not by a script, using the reference battery that ships with the review
skill. Each produces a full report as an experiment document (`review-hygiene`, `review-ncua`,
`review-ada`, `review-fact`) and a recorded verdict through `record-deliverable-check`.

Recording is what makes skipping visible, and no status gets an unchecked article past it silently.
The server never refuses a send: any non-preview send whose manifest carries a non-empty article
(or whose status is in the ready family) goes out and, when any of the four conventional checks has
no recorded result, has a failing one, or was recorded against different article prose, the
response appends a warning naming each incomplete check with its own reason and
`record-deliverable-check` as the way to clear it. A send carrying no article warns about nothing
unless its status is in that ready family, which is the collaboration loop: asking the client
questions before an article exists. Treat a warning as work to do now: run the check, record the
result, revise if it fails. Publish (`set-deliverable-status published`) still refuses on the same
blockers.

Checks are pinned to the article they ran against, so editing the article stales them by design. A
revision cannot ride a green check from an older draft.

### 4. Deliver: preview, then the human's explicit go

Skill: **exp-deliver**.

`build-deliverable` saves the version. `send-deliverable` with `preview: true` delivers every email
to you, the signed-in operator, recording nothing: no send timestamp, no participant, no activity
entry, and no check warning. Use it to read the email in your own inbox.

The real send happens only after your human operator says so in conversation, in this session, after
you have told them exactly who it goes to. Do not treat an earlier approval on a different
deliverable as approval for this one.

The client link (`client_url`) is always disclosed: every deliverable read prints it, sent or not.
When your operator asks for it, give it immediately, then offer the record as a follow-up: they say
"send" and you email it from the platform (`send-deliverable`), or they say "shared" because they
handed it over themselves and you record it (`record-deliverable-shared`, which stamps `sent_at`
and emails nobody; `client_email` is optional). Only the raw token never prints as its own line.

### 5. Revise: apply what the client said

Skill: **exp-revise**.

`get-deliverable-activity(team_id, deliverable_id, since)` is the polling endpoint: views, answers,
comments, threads, attestations, opt-out requests, revision pushes, and status changes, oldest
first.

Three rules govern what you do with it. A client answer is an **input to the methodology**, never a
literal edit command: run it through the rules, and if it does not survive them, return that item
with a plain-language explanation instead of forcing it in. A client **confirming** a checklist item
is not a verification: re-verify it against the real source. And if the article changed, the checks
it staled have to be re-run and re-recorded before anything sends.

### 6. Status: the read-only rollup

Skill: **exp-status**.

One pass over the team's active experiments and deliverables, reporting where each one stands and
what is waiting on a human. It never writes.

## The human gates

Three, and only three. Everything else runs without a pause.

1. **Client sign-off.** A designated person at the institution signs off on the deliverable before
   the article publishes. You assist. You never sign off, and you never fabricate a sign-off.
2. **The send gate.** The client notification email goes out only on your human operator's explicit
   OK in this conversation. Preview is the safe rehearsal; the real send is a one-way door.
3. **The halt gates.** A pivot that would move to an adjacent market is returned to the human, never
   executed. An avoid verdict at high confidence halts the experiment. A client's opt-out request
   halts publication immediately.

A blocker finding that survives review is a genuine blocker, not a routine touchpoint: report it and
stop rather than working around it.

## Recording the handoff

Two calls make an experiment picked up cleanly by whoever is next:

- `set-experiment-workflow(team_id, experiment_id, status, note)` sets the status label
  (in-progress, ready-for-approval, approved, published) and, more usefully, the free-text note for
  whoever opens this next. No ordering is enforced. Write the note as a sentence a colleague can act
  on: what is done, what is next, what is waiting on whom.
- `add-experiment-event(team_id, experiment_id, kind, summary)` appends one line to the log, append
  only. Log the things a person would want to find months later: prompts created, a pivot executed
  and why, a document rewritten, a handoff.

Both take an `actor_label`, so record yourself as the agent when you are the one acting.
