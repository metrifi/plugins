---
name: exp-sweep
description: "The daily cross-client sweep over every MetriFi GEO top customer: read the whole cohort in one call, decide which teams have work in motion and which have gone quiet, then move every team as far down the experiment pipeline as it can go without a person, stopping only at gates that genuinely belong to a human. Hands each team to the phase skill that owns the work (exp-revise when a client responded, exp-build when baseline responses landed, exp-review when checks are missing or stale, exp-research when nothing is running) and never re-implements a phase. Use whenever someone wants the whole book of business moved at once: 'run the daily sweep', 'sweep all clients', 'what is waiting on me across every client', 'move everything forward', 'which clients have nothing running', 'daily rollup', 'what is ready to send', 'check every team'. Safe to run on a schedule and to re-run. It never sends to a client and never crosses a human gate. NOT a per-experiment status check (exp-status), NOT a phase itself."
---

# exp-sweep: move every client forward, once a day

The sweep node. Every other experiment skill does one kind of work on one experiment; this one
looks at everything, decides what should happen, and hands each piece to the skill that owns it.

Read `references/workflow-overview.md` if you have not this session. It defines the phases, the
tools, and the three human gates, and this skill assumes all of it.

The goal is a specific one, and it shapes every rule below: **when your operator logs in, they
should be looking at validated, built, checked deliverables waiting on a send decision, not at
experiments waiting to be executed.** So this sweep is not conservative about doing work. It is
conservative about exactly four things, and those are the gates in section 5.

## Three boundaries

**It never re-implements a phase.** When a team needs research, building, reviewing, or revising,
the phase skill does that work with its own rules, its own reference batteries, and its own
methodology. The sweep decides *which* skill and *for which team*, and then gets out of the way.
A sweep that starts scoring responses or drafting prose inside its own report is a sweep that has
stopped being trustworthy as a sweep, and it will quietly diverge from the phase skill it
duplicated.

**It never sends anything to a client.** No real send, ever, whatever the deliverable's state and
however obviously ready it looks. Sending is a one-way door into a real person's inbox and it needs
a human saying so in conversation. A deliverable that is genuinely ready is reported as ready and
left alone. This holds even when the sweep is running unattended at 6am, which is precisely when it
matters.

**It never crosses a human gate.** No approving a draft, no recording a check nobody ran, no
resolving an opt-out request, no marking client activity processed on work it did not do.

## 1. Arguments

- **Nothing**: the full sweep across the whole cohort, dispatching everything it can.
- **`--dry-run`**: read and classify exactly as normal, dispatch nothing and write nothing.
  Every intended action is prefixed `WOULD DISPATCH:` / `WOULD START:`. Run this first against a
  real cohort before ever putting the sweep on a schedule.
- **`--team <slug>`**: one team, its full chain, no sweep. Useful for retrying a team that hit a
  transient failure.
- **`--no-new`**: sweep and move existing work, but start no new experiments. The lane-6b escape
  hatch for a period when quota is tight or a client relationship is in flux.

**Dispatch is the default here, and that is deliberately the opposite of a devops triage sweep.**
The point of this skill is autonomy, so reporting a queue and waiting would defeat it. `--dry-run`
is the brake.

## 2. Step 0: read the cohort

```
list-all-teams(top_customer: true, limit: 500)
```

That is the cohort: every team carrying the manual `is_top_customer` flag, returned **as slugs**,
which is what every later call needs. It is one cheap directory query.

**Do not use `get-team-health` for this.** It covers the same cohort, but it builds a full
visibility and AI-traffic board with per-team external calls to do it, takes around fifteen seconds,
and then returns team **names** rather than slugs, so you would have to resolve every one of them
against the directory anyway. Reach for it only when the sweep genuinely needs the health verdicts,
and never just to find out who the top customers are.

Two more things to know:

- **It is platform-staff only.** If the call is refused, you are not signed in as staff. Say that
  in one line and stop. Do not fall back to `list-teams` and sweep your own memberships instead:
  that is a different, smaller, quietly wrong cohort, and a sweep that silently changes what it
  covers is worse than one that refuses.
- **`get-master-health`'s `top_clients` is not the cohort either.** It is a performance leaderboard
  ranked by a composite of visibility movement, traffic movement, and deploy rate. Different thing,
  similar name.

Then, per team in the cohort, two reads that fill in the picture:

```
list-deliverables-needing-attention(team_id)
list-experiments(team_id)
```

**`list-experiments` alone cannot tell you whether a team is in motion.** It returns no workflow
status and no last-event date, so treat it as an index: it names the team's experiments newest
first, and the newest one is the only candidate worth opening. Open exactly that one with
`get-experiment-workflow(team_id, experiment_id)`. One call per team, not one per experiment.

Say the cohort size in the report's first line. A cohort smaller than you expected means a client
nobody flagged as a top customer, and that client is invisible to this sweep by design.

## 3. In motion, defined mechanically

The whole sweep turns on this, so it is a definition and not a judgment call.

**Judge it on artifacts, not on bookkeeping.** `workflow_status` and the event log are written only
when an operator or a run remembers to write them, and in practice most experiments carry
`workflow_status: not set` with zero events **even when substantial work exists**: nine completed
working documents and a deliverable already in the client's hands will still show an empty event
log. A rule keyed on status and events therefore reports thriving work as abandoned, and the
consequence is the worst mistake this sweep can make: opening a second experiment for a client who
already has a live deliverable in front of them.

So work down these in order, and stop at the first that answers:

1. **A deliverable exists with unprocessed client activity or an open blocking item** → in motion.
   Something is genuinely in flight with the client.
2. **A deliverable exists and has been sent, with nothing outstanding** → in motion, at rest. The
   round finished. Nothing to do, and it is not a reason to start something new today.
3. **Working documents exist but no deliverable has been sent** → in motion, mid-build. Resume it.
4. **Neither documents nor a deliverable, but prompts are attached** → an **experiment shell**: a
   campaign someone stood up and never carried forward. Not in motion, but see lane 6a: it is a
   resume, not a restart.
5. **Only now** fall back to `workflow_status` and the event log, which are reliable when populated.
   A status of `in-progress` with a note explaining what it waits on is the strongest signal on the
   board, because a human wrote it deliberately.

**A team is in motion when at least one of its experiments is.**

Two traps, both of which cost real client trust when you get them backwards:

- **Parked is not stalled.** A deliverable waiting 10 days on a client contact is in motion.
  Starting a second experiment for that team because the first "looks quiet" gives the client two
  open asks and makes both easier to ignore. That deliverable's nudge belongs to `exp-revise`,
  which caps followups at three and then escalates to a person.
- **Stalled is not failed.** An experiment that stopped mid-phase is a resume. Read whatever the
  last run left, in the workflow note if there is one and in the documents if there is not, before
  assuming anything.

## 4. The five lanes

Classify each team into exactly one lane, and take the first that matches, top to bottom. The
order is the point: **existing work always beats new work.**

| # | The team's state | Lane | Skill |
|---|---|---|---|
| 1 | A deliverable has unprocessed client activity | Client responded | **exp-revise** |
| 2 | A deliverable has an open blocking item and no new activity | Client has gone quiet | **exp-revise** (nudge path) |
| 3 | Baseline responses have populated and no draft exists yet | Analyze and build | **exp-build** |
| 4 | A draft exists and a check is missing, stale, or failing | Run the checks | **exp-review** |
| 5 | Checks green, deliverable assembled, never sent | **Waiting on your operator** | report only |
| 6a | An experiment shell exists but was never carried forward | Resume it | **exp-build**, or **exp-research** if it has no usable prompts |
| 6b | No experiment at all, or every one finished | Start something | **exp-research** |

Lane 5 is not a dispatch. It is the pile this whole skill exists to produce: report it, name the
recipient it would go to, and stop. `exp-deliver` runs when a human starts it.

**Lane 2 is not a lesser version of lane 1, and it is usually the largest lane on the board.** A
deliverable sitting on an unanswered attestation with no followup ever sent is the single most
common state a real cohort is in, and it is worth more than any new experiment: the work is already
built and one nudge unblocks it. `exp-revise` owns the decision of whether a given one is a nudge or
simply patience.

**Check lane 2 rows for an unrecorded manual share, because it is often the real reason nothing has
been chased.** A deliverable still marked "not yet" sent while the client has been viewing or
answering it is one somebody shared by hand, outside the platform. It has no captured client
contact, so it cannot be nudged at all, and it will sit at zero followups forever no matter how many
times the sweep looks at it. Flag those explicitly in the report; `exp-revise` records the share
and unfreezes the cadence.

**Lane 6a is the one to get right.** A team whose only experiment is a shell (prompts attached, no
documents, no deliverable) is not a team with nothing. Someone already picked that topic and stood
up the campaign, and the responses may well be sitting there unread. Resume it. Starting a fresh
experiment alongside it abandons work someone already paid for and splits the client's visibility
data across two campaigns on the same ground.

Lanes 1 and 2 outrank 6 for the same reason a team never gets two open asks at once. A team already
carrying work never gets a new experiment in the same sweep, however tempting the gap looks.

## 5. The chain contract

**One agent per team, and it runs the chain as far as the chain will go.**

If your host provides a way to run background subagents, hand each team to one and let the teams
run concurrently; the sweep's own job is done once every team is handed off. If it does not, work
the teams one at a time in this session, finishing each team's chain before starting the next.
Either way the contract below is identical, and a team half-finished is worse than a team not
started, so never leave one mid-chain to go look at another.

**Do not stop at a phase boundary.** This is the rule that turns four days of one-node-per-day into
one overnight run. When `exp-build` finishes and a draft now exists, the checks are runnable, so run
`exp-review` in the same session. When the review comes back green, assemble the deliverable and
stop at lane 5. A phase ending is not a reason to stop; only a gate is.

**Four gates, and only these four, end a chain:**

| Gate | What it looks like | What happens next |
|---|---|---|
| **G1 Responses** | `get-campaign-readiness` says the baseline has not populated to the sized `min_responses` yet | Leave a workflow note saying so. Tomorrow's sweep picks it up at lane 3. |
| **G2 Ready to send** | Checks green, deliverable assembled, nothing blocking | Report it. Your operator sends with `exp-deliver`. |
| **G3 Waiting on a client** | An action item is out and unanswered, inside the followup cadence | `exp-revise` owns the nudge. Nothing else to do. |
| **G4 Halt** | An opt-out request, a withdrawn approval, or a check finding that survives a fix attempt | Stop the chain, do not revise around it, hand it to a person by name in the report. |

Anything that is not one of these four is not a gate. A phase that fails for a transient reason is
a retry, once, and then a line in the report.

**Leave the handoff readable, every time.** Before a chain ends for any reason, including a crash
you can see coming, `set-experiment-workflow(team_id, experiment_id, status, note)` with a note the
next run can act on, and `add-experiment-event` for what happened. That note is the only memory
this system has. Pass a stable `idempotency_key` on the event so a resumed run cannot double-log.

## 6. Lane 6b: choosing a topic without a human

This is the section that makes unattended operation possible, and it is the one most likely to
produce a bad outcome if it is done loosely.

`exp-research` states plainly that if the topic or the geography is vague, it asks once and waits.
At 6am there is nobody to answer, so the run would stall on the very first step. **The sweep's job
is therefore to hand it a complete brief, never a bare topic.**

### The signal ladder

Work down it, and use the first rung that produces a defensible answer.

1. **What has this team already targeted?** `list-experiments(team_id)` and
   `list-campaigns(team_id)`. Never repeat a topic that already has an experiment, finished or not.
   Repeating one splits the client's own visibility data across two campaigns measuring the same
   ground.
2. **Where is this client losing?** For each existing campaign,
   `get-org-visibility(team_id, campaign_id)` ranks every organization by mention count and
   visibility percentage. A topic with real mention volume where the client ranks below its
   competitors is the strongest signal available, because it is measured rather than assumed. Pick
   the adjacent topic that gap points at.
3. **A genuinely cold team**, with no campaign and so no visibility data: read the institution's own
   live website, which the team record carries as its domain, for its actual product lineup and its
   stated service area. Pick the product line with obvious consumer demand that the site covers
   thinly.

### The brief must be complete before you dispatch

`exp-research` needs four things, and all four have to be in the brief:

- The **team slug**.
- The **topic, stated specifically, with its geography**. "HELOCs" is not a topic. "Homeowners in
  these named counties comparing a HELOC against a cash-out refinance" is.
- The **audience and the two to four segments** worth splitting it across.
- The **institution and its domain**, so the owned organization is known and its name never lands
  inside a prompt.

**If you cannot fill all four from platform state and the institution's live site, do not
dispatch.** Report the team as needing a topic decision and move on. A brief carrying a guessed
geography produces a campaign scoped to the wrong place, and that scope is inherited by every
prompt, every response, and the client's own visibility history afterwards. Getting it wrong is not
a bad day's work; it is permanently muddied data on a top client.

### Two more preconditions on lane 6b

- **Quota.** `exp-research` reads `get-team-usage` and sizes the experiment to what the team's plan
  has left, and budgets are per team, so a busy sweep cannot drain a shared pool. But if what is
  left cannot fund the floor (two samples per prompt across a usable prompt set), do not start a
  half-experiment. Report the team as quota-blocked and say what it would take.
- **A weak topic is expected, and it is handled downstream.** Do not agonize here. `exp-build` scores
  the baseline and returns a viability verdict, and on a weak or avoid verdict it pivots: it
  re-selects among prompts already run, or creates new demand-grounded prompts and attaches them
  with `prompt_ids_mode: "add"` so the originals keep tracking. The ladder above needs to be
  defensible, not perfect.

## 7. Caps

Every cap that bites gets a line in the report saying what was held back. Silent truncation reads
as full coverage and is the one failure mode a scheduled sweep cannot recover from.

- **New experiments (lane 6b): 3 per sweep**, longest-quiet first. A cohort where eight teams went
  quiet at once is a business signal for a human, not a mandate to open eight campaigns. **This is
  the lowest-priority lane, not the headline.** On a healthy book of business it fires zero times,
  and that is the correct outcome, not an idle sweep.
- **Lanes 1 and 2 are uncapped.** Client-facing work that is already built and waiting on one
  answer is the highest-value thing the sweep touches, and there is no honest reason to hold it
  back. If the volume is genuinely large, `exp-revise`'s own three-followup cap is the brake.
- **Teams dispatched: 8 per sweep.** Priority order: lane 1, then 2, then 3 through 6.
- **One agent per team, ever.** Before dispatching, check whether that team already has a chain
  running. Two agents on one team will race on the same deliverable draft, and
  `update-deliverable-draft` replaces whole lists rather than merging them, so the loser's work
  disappears without an error.
- **One retry per phase failure**, then report it and move on.

## 8. The report

Lead with the pile your operator cares about. A sweep where nothing moved is three lines, and it
should not re-derive the board to prove it looked.

```markdown
# Sweep: <N> top clients · <M> in motion · nudged <U>, moved <D>, ready to send <R>, started <S>

**Ready to send:** <team, deliverable, who it would go to, or "nothing">
**Needs you:** <halts, topic decisions, quota blocks, or "nothing">
**Waiting on clients:** <count, and how long the oldest has waited>
**Started:** <team and topic for each new experiment, or "nothing new">

## Moved
| Team | Experiment | From | To | Stopped at |
|---|---|---|---|---|

## Waiting on a client
| Team | Deliverable | What it needs | Waiting | Followups sent |
|---|---|---|---|---|

## Held back
<every cap that bit, and what it left undone. Omit only if none did.>

## Quiet, not started
<teams not in motion that got no experiment, with the reason: cap, quota, no defensible topic>
```

The "Followups sent" column earns its place: a deliverable that has waited three weeks with zero
followups is a different problem from one that has been nudged twice, and the two need opposite
responses.

Table rules: plain language over status enums, real durations with their units ("9 days"), and the
"Stopped at" column names the gate (G1 to G4) so the reason a chain ended is never a mystery. No em
dashes anywhere, in this report or in anything that reaches a client.

## 9. Running this on a schedule

**Its memory lives on the platform, not in the session.** A scheduled run starts cold and
re-derives the whole board every time, which is why the cohort read and the workflow notes are not
optional. The workflow status and note on each experiment are what a cold run reads to find out
what yesterday's run did.

**One thing genuinely has nowhere to live, and it is worth being honest about.** A team the sweep
looked at and decided *not* to start an experiment for has no object to hang a note on, so that
decision cannot be recorded. Tomorrow's sweep re-derives it from scratch. That is acceptable
because every reason for not starting (the cap, the quota, no defensible topic) is itself re-derived
from current state and will simply come out the same way, or correctly come out differently once
the state changes. Do not invent a placeholder record to fix this. An empty experiment created only
to hold a note is a lie in the client's own history.

**Be honest about what the schedule is.** It moves work up to the gates and no further. It cannot
send, cannot approve, and cannot resolve a halt. A sweep that runs perfectly still ends with a pile
of decisions for a person, and that is the design working rather than the design falling short.

## Judgment calls

- **Existing work beats new work, always.** When a lane is ambiguous, take the lower number.
- **A stalled experiment is a resume, not a restart.** Read the workflow note first.
- **Never start a second experiment for a team with an open client ask.** Two asks halve the odds
  of either being answered.
- **A team missing from the cohort is not a team without work.** It is a team nobody flagged as a
  top customer. Say the cohort size so that stays visible instead of becoming assumed coverage.
- **When a tool refuses or warns, follow it rather than working around it.** A send warning
  naming a stale check wants the check re-run, not the warning ignored or the status lowered.
