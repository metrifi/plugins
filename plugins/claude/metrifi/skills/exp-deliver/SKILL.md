---
name: exp-deliver
description: "Build a MetriFi GEO client deliverable and get it in front of the institution's contact, behind the send gate: assemble and validate the client page with build-deliverable, read the summary and every warning it returns, preview the notification email to your own inbox first, and send for real only after your human operator says so explicitly in the conversation. Use when a reviewed draft is ready to go out or someone asks about sending one: 'ship it', 'send the deliverable', 'send it to the client', 'send it to Kaili', 'build the deliverable', 'rebuild the client page', 'get this in front of the client', 'is it ready to send', 'send the revision', 'nudge the client', 'they never responded', 'why is the send refusing', 'what is the client link'. The real send emails real people and is a one-way door, so it never happens on an implied yes, on an earlier approval for a different deliverable, or without naming the recipient first; client_email captures the client contact so the deliverable can be followed up on later. The client URL is never surfaced before the send. When the server refuses a send it names the way through (a missing, failing, or stale pre-publish check): follow the refusal rather than lowering the status or recording a check nobody ran. NOT the check-running step, NOT the client's sign-off (a person at the institution gives that), and NOT for publishing or emailing anything on a website (those are the Site Builder skills)."
---

# exp-deliver: build it, preview it, then ask

Two mechanical calls and one human gate. The gate is the skill.

Read `references/workflow-overview.md` if you have not this session: the phase map, the state model,
and the three human gates.

## The send is a one-way door

`send-deliverable` emails real people at the institution. There is no unsend, and the first send is
the one that sets the tone for the whole client relationship. So:

- The real send happens **only after your human operator says so explicitly, in this conversation,
  after you have named exactly who receives it.**
- An approval on a different deliverable is not approval for this one. An approval last week is not
  approval now. "Sounds good" on a plan is not approval of a send.
- If you are not certain the person meant "send it to the client right now", you do not have the OK.
  Ask in one line.

Everything else in this skill runs without pausing.

## Orient first

1. `get-experiment-workflow(team_id, experiment_id)` for where things stand, the deliverable, its
   open blocking items, and the latest check results.
2. `list-deliverable-checks(team_id, deliverable_id)` when any check looks missing or stale. All four
   conventional checks (`hygiene`, `ncua-compliance`, `accessibility`, `fact-verification`) need a
   recorded, non-failing result against the current article before a ready-status send will go.
3. `get-deliverable(team_id, deliverable_id)` for the article, the checklist, the action items with
   their statuses, and the participants already on the record.

If a check is missing, failing, or stale, that is review work, not send work. Say which checks and
stop. Do not send around it.

## 1. Build

`build-deliverable` assembles the client page from platform state (the draft manifest, the
experiment's opportunity block, and its dossier documents), runs the full contract, and saves one
version.

- **Dry run first** when anything has changed: `dry_run: true` validates and writes nothing, so a
  refusal costs you nothing. The contract covers anchor quotes resolving to an exact substring of the
  article, legal enum values, block shape, and no em dashes in client-facing copy. A refusal names
  the exact reason. Fix the cause, do not soften the page around it.
- **Then build for real** with a one-line `changelog` describing what changed in this version. That
  line shows up in the client's activity ledger, so write it for them, not for you.
- **Set `status` deliberately.** `needs-input` when the client still owes answers on open blocking
  items. `ready` when what is left is their read and their approval. `scheduled` with a
  `publish_plan` when the date and the opt-out deadline are agreed.

**Read the whole result back, warnings included.** The build returns a summary of what it assembled:
the dossier sections, the checklist, the action items, the version. Warnings are not errors, which is
exactly why they get skipped and then turn up as the thing the client noticed. Report the counts and
every warning to your human in plain language before going near the send.

**Never pick a status to dodge the gate.** A `needs-input` send is never check-gated, and that is
correct when the client genuinely owes answers. Using it to slip an unreviewed article past a gate is
the one move this whole design exists to make visible. If the honest status is `ready` and a check is
stale, re-run the check.

## 2. Preview to yourself

`send-deliverable(team_id, deliverable_id, preview: true)` delivers every email the client would get
to you, the signed-in operator, instead. It records nothing: no send timestamp, no participant, no
activity entry, and the check gate does not apply. The client gets nothing and the real first send
stays untouched.

Keep the preview a pure rehearsal: leave `client_email` and `client_name` off it, and confirm the
recipient in conversation instead.

Then actually read the email in your inbox. You are looking for what the client will see: the
subject, the ask, the deep link per open item assigned to that person, and whether the tone matches
an institution's compliance officer opening it cold. A preview you did not read is a step you
skipped.

## 3. Ask, in these words

Before the real send, tell your human, in a short block:

- **Who receives it**, by name and email address, including anyone already on the participant list.
- **Which scenario goes out**, which follows from the status: a ready-to-publish note, or a
  needs-your-input note plus a deep link per open item assigned to that person. A later send
  announces a revision instead.
- **What it asks them to do**, in one sentence.
- **What is still open**: the blocking items, the checks, anything a compliance officer will hit.
- **That this is the real send**, and that there is no unsend.

Then wait for the explicit yes.

## 4. Send

`send-deliverable(team_id, deliverable_id, client_email, client_name)`.

**Always pass `client_email` with `client_name`** on the real send. That captures the institution's
contact as the client participant, and it is what makes the deliverable followable up on later.
Without it, the deliverable can never be nudged and the quiet-client path below is closed for good.
Get the address right the first time and read it back before sending.

**Do not surface the client URL before the send.** The client link is a magic link belonging to the
person the platform sends it to. Handing it around ahead of the send lets the deliverable be opened
outside the record, and it tempts an operator into pasting it into their own email, which skips the
participant record, the activity ledger, and every followup after. After the send, the URL is fine to
share with your own operator; `get-deliverable` returns it.

## 5. Report, then hand back

- Say who it went to and when, and what the client's next move is.
- `add-experiment-event(team_id, experiment_id, kind, summary)` for the send. Pass
  `idempotency_key` with a stable value, such as `deliverable-sent-v3`, so a resumed run cannot
  double-log: a key that already exists means this send was already logged, and the call returns that
  event instead of appending a second one.
- `set-experiment-workflow(team_id, experiment_id, status, note)` with a note the next operator can
  act on: what went out, to whom, and what we are waiting for.

Then stop. The next move is the client's, and their answers come back as activity on the deliverable
for the revise phase to pick up.

## When the server refuses

The refusal message names the way through. Take it literally.

- **A missing, failing, or stale check** on a ready, scheduled, or published send. It names each one.
  The way through is to re-run that check and record the result. Not lowering the status, not
  recording a result nobody earned, not calling the preview a send.
- **A build contract failure**: an anchor quote that no longer resolves, an illegal enum, an em dash
  in client copy. The way through is the article or the manifest, and the message says which.
- **`published` refused.** That status needs the client's approval plus a genuinely publish-ready
  deliverable: no outstanding blocking items, pre-publish checks cleared. Approval alone is not
  enough, because a client can approve while a requested change is still pending. Apply the
  outstanding corrections first. Never fabricate an approval or a sign-off, ever, for any reason.

## When the client goes quiet

`send-deliverable-followup(team_id, deliverable_id)` sends **one** personal nudge to the client
contact and advances the cadence counter. It matches the official notification, names the single
outstanding ask, and carries their magic link. Pass `outstanding_ask` to override the derived line
when you can say it better in fifteen words.

It executes one send; deciding *when* to nudge is yours. A reasonable rhythm is a nudge after about a
week of silence, then another after the next week. After three nudges with no response it stops on
its own and returns an escalate result: hand that to a human rather than trying another send. Treat a
nudge as outward-facing too, and keep your operator informed before you send one.

## Judgment calls

- **A deliverable with open blocking items is not broken.** It is a `needs-input` send, and the deep
  links per item are the product working.
- **Re-sending is a revision announcement**, not a duplicate. Say that to your operator so nobody
  fears having spammed the client.
- **You are not the sign-off authority.** A designated person at the institution signs off before the
  article publishes. You prepare and you assist.
- **A client opt-out request halts publication immediately.** It is not a negotiation and not a
  problem to route around. Stop, report it, and let a human answer it.
- **If your operator asks you to send without a preview**, do the preview anyway unless they decline
  it after you offered. It costs one call and it is the only rehearsal available.
