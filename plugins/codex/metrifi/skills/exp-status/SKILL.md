---
name: exp-status
description: "Read-only status rollup for MetriFi GEO experiments and client deliverables: for one experiment or across a whole team, report where each one stands, what the last operator left as a note, which of the four pre-publish checks are recorded, missing, or stale, and above all what is waiting on a human. Use whenever someone asks to check in or pick work back up: 'what needs me', 'what is waiting on me', 'where are we with this team', 'status of the HELOC experiment', 'check in on an experiment', 'what is the latest', 'how is it going', 'did the client respond', 'resume where we left off', 'what is in flight', 'give me a rollup'. Answers from platform state only (list-deliverables-needing-attention, list-deliverables, list-experiments, get-experiment-workflow, get-deliverable-activity), never from local files, so any operator on the team gets the same answer from any machine. Strictly read-only: it never creates, edits, sends, re-runs prompts, or records a check. When it finds obvious next work it names the skill that does it and stops. NOT for running a phase, NOT for site or page status (that is the Site Builder skills), and NOT a campaign analytics report."
---

# exp-status: where everything stands

A rollup, not a phase. Read `references/workflow-overview.md` if you have not this session: it is
where the phases, the tools, and the human gates are defined.

## Hard rule: read-only

This skill never writes. No creates, no edits, no sends, no prompt runs, no recorded checks, no
workflow status updates, not even a log event. If the status reveals obvious next work, name the
skill that does it and stop there. Let the person decide.

## Scope

- **A named experiment, team, or topic** ("check in on the vehicle refinance one"): resolve it with
  `list-experiments(team_id)` and `list-deliverables(team_id)`. If more than one matches, list the
  candidates and ask rather than guessing.
- **Everything** ("what needs me", "status across the board"): roll up every active experiment and
  deliverable on the team.

Start from `whoami` and `list-teams` if you do not already know the team slug.

## What to read

### 1. What needs attention

Start with `list-deliverables-needing-attention(team_id)`. It is the server-side view of deliverables
with unprocessed client activity, plus anything still carrying an outstanding blocking item, and it is
the fastest path to the only question that matters here. An empty list means nothing is waiting on
anyone; say that in one line.

Then fill in the detail on what it named:

- `list-deliverables(team_id)` gives every deliverable with its status, version, action-item counts,
  participant count, and whether it has been sent.
- For anything already sent, `get-deliverable-activity(team_id, deliverable_id)` is the activity
  ledger: views, answers, comments, threads, attestations, and opt-out requests, oldest first, each
  row carrying its activity id. A deliverable with client answers newer than its latest revision is
  one waiting on you.

### 2. Per experiment

`get-experiment-workflow(team_id, experiment_id)` returns everything this rollup needs in one call:
the workflow status and the note the last operator left, the recent event log, which working
documents exist, the keyword research, the target prompts, and the deliverable with its outstanding
blocking items and latest check results.

That is the primary read. Only go deeper when the question demands it:

- `get-experiment-document(team_id, experiment_id, kind)` for a document body, when someone asks
  what a decision actually said.
- `get-campaign-readiness(team_id, campaign_id)` when an experiment is waiting on baseline
  responses and the question is "are they in yet".
- `list-deliverable-checks(team_id, deliverable_id)` when you need the per-check detail, including
  which checks have gone stale since the article changed.

## What to report

One compact block per experiment:

- **Experiment.** Name, team, topic, and the experiment ID, in one line.
- **Where it stands.** The workflow status, plus the last operator's note verbatim if there is one.
  That note is usually the most useful line on the screen; do not paraphrase it away.
- **Deliverable.** Status, version, open action items with how many are blocking, and whether it has
  been sent.
- **Checks.** Which of hygiene, NCUA compliance, accessibility, and fact verification have a
  recorded result, which are missing, and which have gone stale because the article changed after
  they ran. A missing or stale check is why a send will refuse, so say it in those words.
- **Next step.** The single next action, and the skill that does it.
- **Waiting on a human?** The load-bearing line. Name explicitly anything blocked on your operator,
  on the client contact, or on their compliance officer: an unanswered action item, a pending
  sign-off, an unapproved send, an opt-out request. If nothing is blocked, say "nothing, this can
  proceed" and name what would happen next.

For a whole-team rollup, order it by what the person can act on: experiments needing a human first,
then the ones in flight, then anything done or dormant. Lead with a one-line count so the shape is
visible before the detail.

## Judgment calls

- **"Did the client respond?" is an activity question**, not a status question. Read the activity
  ledger; a status field will not tell you.
- **An experiment with no deliverable yet** is not stalled. Say which phase it is in and what the
  next skill is.
- **A stale check is not a failure.** It means the article moved after the check ran, by design.
  Report it as work to redo, not as a problem.
- **Do not re-derive judgment the workflow already recorded.** If a document holds the viability
  verdict, quote it. Do not re-score the opportunity from scratch inside a status report.
