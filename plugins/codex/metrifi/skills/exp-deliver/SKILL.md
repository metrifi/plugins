---
name: exp-deliver
description: "Build a MetriFi GEO client deliverable and get it in front of the institution's contact, behind the send gate: assemble and validate the client page, read every warning it returns, preview the notification email to your own inbox first, and send for real only after your human operator says so explicitly in the conversation. Use when a reviewed draft is ready to go out: 'ship it', 'send the deliverable', 'send it to the client', 'build the deliverable', 'rebuild the client page', 'get this in front of the client', 'is it ready to send', 'send the revision', 'nudge the client', 'they never responded', 'what is the client link', 'give me the deliverable URL'. The client URL is always available: when the operator asks for it, hand it over immediately from get-deliverable, then offer to record the delivery (send-deliverable to email it, record-deliverable-shared if they shared it themselves). The real send emails real people and is a one-way door, so it never happens on an implied yes, on an earlier approval, or without naming the recipient first; incomplete pre-publish checks come back as a warning on the send, which is work to do now, not a refusal. NOT the check step (exp-review), NOT the client's sign-off."
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
   conventional checks (`hygiene`, `ncua-compliance`, `accessibility`, `fact-verification`) should
   have a recorded, non-failing result against the current article before prose reaches a client;
   the server will not refuse a send over them, but it appends a warning naming each incomplete one.
3. `get-deliverable(team_id, deliverable_id)` for the article, the checklist, the action items with
   their statuses, the participants already on the record, and the `client_url`.

If a check is missing, failing, or stale, say which checks plainly before asking for the send OK.
The decision to send anyway is the operator's to make, not yours to block and not yours to make
silently.

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

**The checks warn on send; publish still refuses.** The trigger is the article, not the label: any
real send whose manifest carries an article (or whose status is in the ready family) comes back
with a warning naming each check that is missing, failing, or stale against the current article. A
`needs-input` send with no article warns about nothing, which is the collaboration loop asking the
client questions before there is prose to check. Set the status because it is the honest
description of where the deliverable stands, and when a check is stale, re-run the check.

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

**Pass `client_email` with `client_name`** on the real send whenever there is a client contact. That
captures the institution's contact as the client participant, and it is what makes the deliverable
followable up on later. Without it, the deliverable can never be nudged and the quiet-client path
below is closed for good. Get the address right the first time and read it back before sending.

**The client link is always available; hand it over on request, then record the delivery.** Every
deliverable read prints `client_url`, sent or not. When your operator asks for the link, give it
immediately, no conditions, then follow up with one line offering the record: say "send" to email
it from the platform, or "shared" if you handed it to the customer yourself and I'll record it.
`record-deliverable-shared` stamps `sent_at` and emails nobody; pass `client_email` when they name
the contact (that is what opens followup nudges), or omit it to record the share with no contact
captured. Recording matters because it is what keeps the worklist and the followup cadence honest;
it is bookkeeping, never a precondition for the URL.

### When there is no client contact

An internal or QA send has no person at an institution on the other end. That is a legitimate send,
and it has its own shape:

- **Pass no `client_email` and no `client_name`.** Passing either one captures a client participant
  on the record and opens the followup path, which is a real relationship you did not mean to start.
  There is no way to un-capture it afterwards.
- **Preview to yourself first**, exactly as above. The preview mails only the signed-in operator, so
  on an internal deliverable it is usually the whole rehearsal you need.
- **Say what the real send will actually reach**, before you ask for the OK: with no client contact,
  it goes only to the participants already on the record, which in practice means whoever the action
  items are assigned to. Name them. If that set is only you, say that too, plainly, so nobody
  believes a client was contacted.
- **The human gate still applies.** A send with no client contact is still a real send: it still
  needs the explicit OK, and if it carries the article with incomplete checks, the warning that
  comes back is still work to report and do.

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

## Warnings and refusals

The send never refuses. What can come back, and what to do with it:

- **A check warning on the send** names each check that was missing, failing, or stale at the
  moment the client got the article, with its own reason (no result recorded, latest result is
  fail, recorded against an older article) and `record-deliverable-check` as the way to clear it.
  The send already happened, so treat the list as immediate work: run each check, record the
  result, and if one now fails, the fix goes to the client as a revision. Never clear a warning by
  recording a result nobody earned.
- **A build contract failure** still refuses: an anchor quote that no longer resolves, an illegal
  enum, an em dash in client copy. The way through is the article or the manifest, and the message
  says which.
- **`published` still refuses.** That status needs the client's approval plus a genuinely
  publish-ready deliverable: no outstanding blocking items, pre-publish checks cleared. Approval
  alone is not enough, because a client can approve while a requested change is still pending.
  Apply the outstanding corrections first. Never fabricate an approval or a sign-off, ever, for any
  reason.

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
  links per item are the product working. If that send carries the article, it carries the four
  checks too.
- **Re-sending is a revision announcement**, not a duplicate. Say that to your operator so nobody
  fears having spammed the client.
- **You are not the sign-off authority.** A designated person at the institution signs off before the
  article publishes. You prepare and you assist.
- **A client opt-out request halts publication immediately.** It is not a negotiation and not a
  problem to route around. Stop, report it, and let a human answer it.
- **If your operator asks you to send without a preview**, do the preview anyway unless they decline
  it after you offered. It costs one call and it is the only rehearsal available.
