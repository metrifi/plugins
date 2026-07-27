---
name: exp-review
description: "Run the four pre-publish checks on a MetriFi GEO deliverable's draft article and record each verdict, which is what lets the deliverable be sent: hygiene (AI tells, spelling, markdown integrity), NCUA and lending compliance (Part 740, Truth in Savings, Regulation Z, Regulation E, fair lending), accessibility (WCAG 2.1 AA at the content level), and fact verification against the institution's live site. Use whenever a draft is ready for its pre-publish pass, or when someone doubts one: 'review the draft', 'run the review battery', 'is this ready to ship', 'is this compliant', 'compliance check', 'NCUA review', 'fact-check the article', 'verify these claims', 'accessibility check', 'ADA check', 'proofread this', 'check it for AI tells', 'why is the send refusing', 'the checks went stale', 're-run the checks'. Performs all four checks itself, one at a time, from the batteries bundled in its own references folder; writes each full report as an experiment document (review-hygiene, review-ncua, review-ada, review-fact), records each verdict with record-deliverable-check, and writes a review-summary rollup. Assistive, never authoritative: a compliance officer at the institution signs off, and this skill proposes fixes rather than silently rewriting the article. NOT the send step, NOT for reviewing a website or a page design (those are the Site Builder skills), and NOT a substitute for the institution's own compliance review."
---

# exp-review: the four pre-publish checks

Four checks. You run all four yourself, one at a time, and record each verdict on the deliverable.
Recording is the whole point: the platform never re-judges your content, so a recorded result is the
only evidence a check happened.

Read `references/workflow-overview.md` if you have not this session. The four batteries live beside
it: `references/review-hygiene.md`, `references/review-ncua.md`, `references/review-ada.md`,
`references/review-fact.md`. `references/methodology-rules.md` carries the rules the batteries cite
(11, 13, 14, 15, 19 bite hardest here).

## Why recording matters

`send-deliverable` refuses any non-preview send whose manifest carries a non-empty article, whatever
the deliverable's status, when any of the four conventional checks (`hygiene`, `ncua-compliance`,
`accessibility`, `fact-verification`) has no recorded result, has a failing one, or was recorded
against different article prose. It refuses on the same blockers when the status is ready, scheduled,
or published, article or no article. Only a send that carries no article and is not in that ready
family goes ungated, which is the collaboration loop: asking the client questions before an article
exists, where a hygiene or an accessibility check has nothing to have read.

So a skipped check is not a quiet omission, and there is no status that lets an unchecked article
reach a client. The send that first puts prose in front of the institution is gated on exactly the
four checks, and every send after it has to carry current ones. Lowering the status does not open a
door, because the article is the trigger. The only way through is recording a real result, which
leaves an audit row, so recording a verdict you did not earn is not a shortcut but a false statement
with your name on it.

Checks are pinned to the article they ran against. **Editing the article stales the checks recorded
against it** (the platform reports the reason as `article_changed`), which is by design: a revision
cannot ride a green check from an older draft. The fact battery is the one this hurts most, because
its claims are quoted from prose that just moved, but every check is pinned the same way.

## Orient first

1. `get-experiment-workflow(team_id, experiment_id)` for where this experiment stands, the
   deliverable, its open blocking items, and which checks already have results.
2. `get-deliverable(team_id, deliverable_id)` for the article markdown you are about to review, plus
   the checklist, the action items, and the participants.
3. `list-deliverable-checks(team_id, deliverable_id)` when you need per-check detail: what the last
   round found, who recorded it, and which results have gone stale.

If checks already exist and none are stale, say so and ask what changed before re-running all four.
Re-running a green check on an unchanged article costs the client's time for nothing.

## What to collect before you start

Ask once, in one message, rather than four times mid-battery:

- **The institution's name**, as it writes it. Do not lift it from the article body; names get
  mangled there, and the compliance report header depends on it.
- **The charter type**, federal or state. State-chartered but federally insured institutions still
  follow Part 740.
- **The website root.** Do not guess it. The fact battery verifies against this domain.
- **The field of membership**, if it can be had. Without it, eligibility claims drop to `minor` with
  a question for the compliance officer instead of a verdict.

The first three usually sit in the experiment's documents already. Read before you ask.

## The loop, four times

Run the batteries in this order: **hygiene, then NCUA compliance, then accessibility, then fact
verification.** Hygiene first because the heavier batteries should work on an article whose markdown
and spelling are not fighting them. Fact verification last because it is the slowest and the most
likely to need the web.

For each battery, in order, three steps:

1. **Do the judgment work.** Open that battery's reference file and work the article against its
   taxonomy. This is reading and thinking, not pattern matching. Every finding carries the exact
   quoted passage, where it sits, the rule or regulation or criterion it violates, why it is a
   problem in plain words, and a suggested fix.
2. **Write the full report** with `set-experiment-document`, using the kind and the body shape that
   battery specifies: `review-hygiene`, `review-ncua`, `review-ada`, `review-fact`. Give it a title
   that reads as a dossier section label, because that is what the client sees.
3. **Record the verdict** with `record-deliverable-check`: `type` (`hygiene`, `ncua-compliance`,
   `accessibility`, `fact-verification`), `result` (`pass`, `fail`, `n/a`), a one-line `summary` for
   the checks tab, the `findings` array with a `severity` on each, `document_kind` pointing at the
   report you just wrote, and `recorder` naming yourself as the agent.

Finish each battery completely, report and record, before starting the next one. Do not batch the
recording to the end: a run that dies after three batteries should leave three recorded results, not
zero. Do not delegate a battery elsewhere and do not run them concurrently. One at a time, by you.

**One blocker means `result: "fail"`.** No blockers means `pass`, even with a page of minors, as long
as every minor is dispositioned with a reason in the report.

## Your reports are client-facing copy

The review documents ship in the client's dossier at build time, so they go through the same contract
as the article: **no em dashes**, or the next `build-deliverable` refuses and names the document.
Write the reports in commas, colons, parentheses, and separate sentences. Set `in_dossier: false`
only for a report you have a specific reason to keep internal, and say why in the rollup.

## The rollup

After all four, write one `set-experiment-document` with `kind: "review-summary"`:

- **The verdict**, in one line: ship, ship after fixes, or do not ship.
- **Counts by severity across all four batteries**, and the four results.
- **Every blocker**, gathered in one list, each naming its battery and its fix. This is the list a
  human works through.
- **What is deferred**, which is always at least the accessibility battery's page-level items.
- **What needs a human**, separated into what the compliance officer decides and what only the
  institution can answer.
- **Time-sensitive claims** the fact battery flagged for re-verification at publish time.

Then leave the handoff readable: `set-experiment-workflow(team_id, experiment_id, status, note)` with
a note a colleague can act on, and `add-experiment-event` for the round itself. Always pass
`idempotency_key` with a stable value per round, such as `review-round-2`, so a resumed run cannot
double-log: a key that already exists means this round was already logged, and the call returns that
event instead of appending a second one.

## Disposition: what happens to each finding

- **Blocker.** A genuine stop. Report it and stop; do not route around it. The article gets fixed and
  the affected checks get re-run.
- **Major.** Usually a required element that is absent, most often the insurance statement or the
  Equal Housing line. The honest default is to fix it before advancing.
- **Minor.** A human call. Either fix it or disposition it with the reason it stands, in the report.
- **Note.** Never blocks. Includes every deferred page-level accessibility item.
- **Contradicted fact.** Corrected, never dispositioned.

## Before any finding becomes a client action item

Rule 19's gate, in order. A finding only reaches the client after failing all three:

1. **Website wording.** Can it be resolved by rewriting to what the institution's site already
   publishes, or by deleting an unsupported qualifier?
2. **Self-verify.** Can you verify it yourself against the live site or the authoritative source?
3. **Fact-check reconciliation.** Did the fact battery already verify it? Never ask a human to
   confirm what a review already confirmed, and never write an item that duplicates a checklist row.

The target is zero action items. Rule 15 is the reason this works so often: the fact pass doubles as
content discovery, and the institution's own site usually already publishes what the draft was about
to ask for.

## Fixing what you found

This skill does not quietly rewrite the article. Propose the fixes, walk the blockers with your
human, and apply the agreed edits through `update-deliverable-draft` (patch only what changed).

Then re-run and re-record every check the edit staled. `list-deliverable-checks` tells you which. In
practice a prose edit stales all four, and a fix confined to one section still stales the fact check
if it touched a quoted claim. Re-running is cheaper than a send that refuses.

## Web access

Fact verification wants live pages. Use whatever web or browsing capability your host gives you; a
real browser generally reads client-rendered institution sites better than a plain fetch, and where
there is a choice, prefer it.

Where there is no live web access at all, the battery still runs: extract and classify every claim
and mark each one needs-human-verification with "no live source access in this session" as the
reason, stated plainly in the report. What you never do is decide a claim is true because the article
sounds sure of itself.

Be a courteous visitor: a pause between page loads, only the pages a specific claim needs, no
crawling. These are small sites.

## Judgment calls

- **A clean article is not a suspicious result**, but four `pass` results with empty findings arrays
  usually means the batteries were skimmed. The fact battery in particular almost always has a rate
  or a quotation to flag.
- **Do not re-judge what the platform already enforces.** `build-deliverable` checks em dashes in
  client copy, anchor-quote resolution, enum legality, and block shape. Your job is everything a
  regular expression cannot judge.
- **`n/a` is legitimate and rare.** An article with no deposit or lending content can carry an `n/a`
  compliance result, but say why in the summary, and reread before you conclude it.
- **Assistive, not authoritative.** Every compliance report ends by handing off to a person at the
  institution. You never sign off, and you never write a sign-off that did not happen.
