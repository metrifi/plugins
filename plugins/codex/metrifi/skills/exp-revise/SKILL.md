---
name: exp-revise
description: "Pick up what a client did to a MetriFi GEO deliverable and turn it into a revision: read the team worklist of deliverables with unprocessed client activity, read the activity itself, apply their answers as methodology inputs rather than literal edit commands, re-verify anything they merely confirmed, push the revised article, re-run and re-record every pre-publish check the edit staled, and mark the activity processed as the last step so a run that dies leaves the work correctly still listed. Use whenever a client has responded or a live deliverable needs another round: 'the client answered', 'apply the client answers', 'revise the deliverable', 'push a revision', 'they left comments', 'the compliance officer replied', 'they confirmed the checklist', 'they approved it', 'they asked to opt out', 'anything waiting on me', 'what needs attention', 'run the revise loop', 'check for client responses'. Safe to run on a cadence and safe to re-run after a crash: a run that finds nothing says so in one line and stops, and re-running re-reads the same unprocessed window rather than trusting a half-advanced log. A client confirming something is never a verification, an answer that does not survive the methodology is returned with a plain-language explanation instead of being forced in, and an opt-out request halts publication rather than being revised around. NOT the first send of a deliverable, NOT the client's sign-off, and NOT for revising a website page (that is the Site Builder skills)."
---

# exp-revise: apply what the client said

The post-delivery loop. A client answered, commented, confirmed, approved, or asked to opt out, and
somebody has to decide what that means for the article. That decision is methodology work, which is
why it is yours and not a script's.

Read `references/workflow-overview.md` if you have not this session, and
`references/methodology-rules.md` for the rules that govern what a client answer may and may not do
(15 and 19 do most of the work here). The four review batteries ship beside them, because a revision
that changes the article stales the checks recorded against it and you re-run them here:
`references/review-hygiene.md`, `references/review-ncua.md`, `references/review-ada.md`,
`references/review-fact.md`.

## The order is the contract

**Read the activity, act on it, mark it processed last.** The mark is what takes a deliverable off
the worklist, so it goes after the work, never before and never alongside. A run that crashes halfway
leaves the activity unprocessed and the deliverable correctly still listed, and the next run re-reads
the same window and re-decides. That is what makes this safe to re-run and safe to schedule.

Process one deliverable all the way through, mark included, before starting the next one. A worklist
of four that dies on the second should leave the first one done and marked, not four half-handled.

## 1. The worklist

`list-deliverables-needing-attention(team_id)` is the whole starting point. It returns every
deliverable where a client did something nobody has dealt with yet, plus every deliverable still
carrying an outstanding blocking item, with the unprocessed activity broken down by kind and how long
it has been waiting, the blocking items, the followup state, the client link, and the linked
experiment.

**An empty list is a clean, complete result.** Say "nothing is waiting on you" in one line and stop.
Do not go looking for work in `list-deliverables` to justify the run. This skill gets invoked on a
cadence, and most runs should end here.

A deliverable listed only for an **outstanding blocking item, with no new activity**, is not a
revision. The client has not answered yet. That is a nudge candidate (one personal followup, capped
at three, then escalate to a human), or it is simply patience. Say which and move on.

Some of those have **never been sent at all**: a blocking item is enough to list a deliverable, and
the worklist prints a client link either way. A link existing is not a send having happened. Check
before you assume the client has seen anything, and do not pass that link to anyone on a deliverable
whose first send has not gone out.

## 2. The unprocessed window

`get-deliverable-activity(team_id, deliverable_id)`. Rows come back oldest first, each printed with
its activity id (`#123`), so you can work them in order and keep the ids as you go. You need them in
section 9 if it turns out you can only handle part of the window.

**Do not pass the worklist's "waiting since" timestamp as `since`.** That filter is exclusive, so the
oldest unprocessed row is exactly the one it drops. Either omit `since` and read the ledger, or pass
a timestamp comfortably before the one the worklist reported. Either way, reconcile what you got
against the worklist's per-kind counts before you act: if the worklist says two answers and a thread
and you are looking at one answer, you are reading the wrong window.

Then `get-deliverable(team_id, deliverable_id)` for the current article markdown, the checklist, the
action items with their statuses, and the participants. You are about to compare what the client said
against what the article currently says, so read both.

## 3. Triage what they did

| What came in | What it means here |
|---|---|
| **Opt-out requested** | A halt gate. Publication stops immediately. Report it and hand it to a human. Do not revise around it, and do not mark it processed until a person has actually dealt with it. |
| **Answered** an action item | A methodology input. Section 4. |
| **Confirmed** a checklist item | Not a verification. Section 5. |
| **Commented** or opened a thread | Read it for intent. It may be a question to answer in conversation, a correction that becomes an article change, or a preference that does not survive the rules. |
| **Attested** | The client's own attestation. Record that it happened. Never write one that did not. |
| **Approved** | Report it. Approval is not permission to publish on its own: publishing also needs no outstanding blocking items and cleared pre-publish checks, and a client can approve while a requested change is still pending. |
| **Approval withdrawn**, **reopened** | Something changed their mind. Find out what before touching the article. |

Views are not tasks and never land a deliverable on the worklist. Revision pushes, status changes,
sends, and followups are your own side of the ledger: read them for context, never as work. They are
also how you find out what the last operator already did, which is worth knowing before you redo it.

## 4. Answers are methodology inputs, not edit commands

The single most important rule in this skill. A client answer is **an input to the methodology**, run
through the rules like any other evidence. It is not a literal "change X to Y".

- **Rule 19, the drafting half.** The institution's live website is presumed compliant for its own
  published wording. Draft the client's answer in the site's words, never a vaguer or a stronger
  paraphrase. If their answer is broader than what the site supports, the site-supported version
  ships now and the stronger claim is an opt-in upgrade, not a hole in the draft.
- **Rule 15.** Their answer often already exists on their own site, published, in better wording than
  the round trip produced. Check there before you write anything, and before you ever ask again.
- **Rule 11.** A rate number they supplied does not go in the article body. Link the rates page.
- **Rules 12, 13, 14.** No competitor comparison block on the owned page, no unbacked superlative
  about the client, and the concrete substantiable version of a claim beats the enthusiastic one,
  however the answer was phrased.

**When an answer does not survive the rules, return the item.** Set that action item's `status` to
`returned` through `update-deliverable-draft`, with a plain-language explanation of why: what the
rule protects against, and what will ship instead. Do not force it in, and do not silently drop it.
A returned item with a clear reason is a good client interaction; a quietly ignored answer is not.

Mechanical note: `action_items` and `checklist` on `update-deliverable-draft` each **replace the
whole list**. Read the current one from `get-deliverable` and send it back complete with your changes
applied, or you will delete the items you did not mention.

## 5. A confirmation is not a verification

A client ticking "yes, that is right" is a signal that they read it. It is not evidence. Re-verify
every confirmed item against the real source: the live site for their own products, people, branches,
and eligibility; the named authority for anything about the world outside the institution.
`references/review-fact.md` has the type-by-type bar and the conservative default, which is
needs-human-verification whenever you notice yourself wanting to give the article the benefit of the
doubt.

This is not distrust of the client. It is that the person confirming is usually not the person who
would know, and articles have shipped with a branch count the client confirmed and the site
contradicted.

## 6. Revise

`update-deliverable-draft` patches: send only what changed. The full `article_markdown` when the
prose moved, the full `action_items` list with the statuses updated, the full `checklist` when its
rows changed. Only what you send is validated, so a half-finished revision stays writable and no
client-visible revision is recorded yet.

Then `build-deliverable` with a one-line `changelog` written for the client, since that line lands in
their activity ledger. Use `dry_run: true` first when the edit was large; a refusal then costs
nothing. The contract still applies: anchor quotes must resolve to an exact substring of the article,
enums must be legal, and no em dashes in client-facing copy.

## 7. Re-run what the edit staled

Every check is pinned to the article it ran against, so an article edit stales the checks recorded
against it (the platform reports the reason as `article_changed`). A revision cannot ride a green
check from an older draft, by design.

`list-deliverable-checks(team_id, deliverable_id)` names which results are stale, missing, or
failing. For each one, do the same three steps the review phase does, one battery at a time:

1. Work the article against that battery's reference file: `review-hygiene.md`, `review-ncua.md`,
   `review-ada.md`, `review-fact.md`.
2. Write the full report with `set-experiment-document`, kind `review-hygiene`, `review-ncua`,
   `review-ada`, or `review-fact`. It ships in the client's dossier, so write it without em dashes or
   the next build refuses.
3. Record the verdict with `record-deliverable-check`: the `type` (`hygiene`, `ncua-compliance`,
   `accessibility`, `fact-verification`), the `result`, a one-line `summary`, the `findings` array,
   `document_kind` pointing at the report, and `recorder` naming yourself.

Finish and record each battery before starting the next. In practice a prose edit stales all four,
and even a one-section fix stales the fact check if it touched a quoted claim.

A surviving blocker is a genuine stop. Report it and do not send.

If several rounds have piled up, refresh the `review-summary` document too, so the rollup a human
reads matches the article that exists now.

## 8. Send the revision

Same gate as any other send, and it applies in full here. A later send announces a revision rather
than re-introducing the deliverable, but it is still an email to a real person and still a one-way
door.

1. **The checks first.** `send-deliverable` refuses while the status is ready, scheduled, or
   published and any conventional check is missing, failing, or stale. The refusal names each one.
   Follow it: re-run the check. Never lower the status to dodge the gate, and never record a result
   nobody earned.
2. **Preview to yourself.** `send-deliverable(..., preview: true)` delivers every email to you, the
   signed-in operator, and records nothing. Read it in your inbox: what changed, what it asks for,
   and whether it reads like a revision to someone who already replied once.
3. **Ask, then send.** Name who receives it and what it says, state that it is the real send, and
   wait for your human operator's explicit OK in this conversation. An OK on the first send is not an
   OK on this one. Pass `client_email` with `client_name` if the client contact is not already
   captured; without one the deliverable can never be followed up on.
4. **The client URL stays private until the send.** Do not paste the magic link into the conversation
   ahead of it.

If your operator would rather run the send as its own step, say so and let them start the deliver
skill themselves. Never start another skill on their behalf.

## 9. Mark processed, last

`mark-deliverable-activity-processed(team_id, deliverable_id)`. Omitting `through_activity_id` marks
everything on the ledger, which is the normal case: you read the whole unprocessed window and dealt
with it. Re-marking is a harmless no-op, the watermark never moves backwards, and nothing is logged
to the experiment, because this is bookkeeping and not a milestone.

**Pass `through_activity_id` when you handled only part of the window.** The ledger prints each row's
activity id, so you have the ids from section 2: pass the id of the newest row you **fully** handled,
and everything after it stays unprocessed for the next run.

Either way the mark is still the last thing you do. And never mark past a row that still needs a
person: if an opt-out request, a withdrawn approval, or a surviving blocker sits in the window, mark
up to the row before it and say plainly what is left, or leave the deliverable unmarked entirely.
Leaving a deliverable listed costs the next run one read. Marking work nobody did hides it for good,
and the worklist is only useful while it tells the truth.

Then leave the handoff readable:
`set-experiment-workflow(team_id, experiment_id, status, note)` with a note the next operator can act
on, and `add-experiment-event` for the round. Always pass `idempotency_key` with a stable value per
round, such as `revision-round-2`, so a resumed run cannot double-log: a key that already exists
means this round was already logged, and the call returns that event instead of appending a second
one.

## What to report

Short, and in this order: what the client did, what you applied and why, what you returned and why,
which checks you re-ran and their results, whether a revision went out, and what is now waiting on
whom. If nothing needed doing, one line is the whole report.

## Judgment calls

- **Do not batch across deliverables.** One at a time, finished and marked.
- **A client asking for something the rules forbid is not a fight.** Return the item, explain what
  ships instead in their own terms, and say what would let the stronger version ship.
- **Silence is data.** A deliverable sitting with open blocking items and no answers is a followup
  question, not a revision, and after three unanswered nudges it belongs to a human.
- **Never fabricate an approval, an attestation, or a sign-off**, and never record a client
  confirmation as a verification you performed.
