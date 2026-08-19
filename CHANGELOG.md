# Changelog

Bump the plugin `version` on every release so installed clients get the update
with `/plugin marketplace update metrifi` (no reinstall). Claude Code keys
updates off this field — same version, no update.

## 1.4.9 — 2026-08-19

- Experiment prompt attachment is defined by coverage, not a target quota. exp-build's target-lock step now instructs a full campaign sweep (list-prompts) and attaches every prompt the planned article could plausibly move, with excluded prompts named and justified; the 'typically six to ten' phrasing is gone from the skill and Rule 8 so the count falls out of the sweep instead of reading as a quota. A consumer question the article answers that no campaign prompt covers may become a new prompt only through the existing demand gate (rules 1 to 3) and only before the article goes live so it accrues a baseline; the article never justifies a prompt, demand does. Motivated by the Experiment Report coverage audit: 22 of 42 historical top-customer experiments attached a single prompt, and sibling-prompt effects (e.g. Brightstar) were invisible to them.

## 1.4.8 — 2026-08-19

- **The campaign-shape convention is written down where campaigns and experiments get created.** A team's FIRST GEO campaign must be broad (the whole institution, every geography it serves, its core products) so the team gets one high-level visibility score that stays comparable over time; every later campaign goes narrow, one product with granular consumer prompts, and experiments attach those granular prompts, never the flagship's institution-level ones. The convention existed only in conversation, so agents kept standing up product campaigns as a team's first and judging experiments on broad prompts. Now exp-research flags a campaign-less team before creating anything and proposes the flagship first, exp-build's target-lock step forbids attaching flagship prompts and says to attach every granular prompt the article could plausibly move (single-prompt experiments miss effects on sibling prompts), and start's scoping questions catch it at intake. The platform's MCP tool descriptions (create-campaign, create-prompt, create-experiment, the build-campaign and build-experiment prompt templates, and the GEO server instructions) carry the same rule in a matching metrifi-platform PR, so the guidance reaches agents on both surfaces.

## 1.4.6 — 2026-08-12

- **exp-review records what it actually verified, not only what it found** (implements Phase 3 of metrifi-platform `plans/m16-deliverable-verification-transparency.md`). `findings` carries problems only, so a battery that walked 24 fact checks and found two issues recorded as "two findings" and the client's page showed a day of work as one green badge. Each battery's record step now also passes `verifications`, one row per criterion actually walked with the source it was checked against and a `note` carrying the reason on an `n/a` row (the client page prints both under the item, so an `n/a` with no note reads as a blank), and each reference file defines its own rows: hygiene is the H1 to H6 sub-checks, NCUA is each regulation area walked (740.2/.4/.5, 707.8, Reg Z triggers, Reg E, Reg B, field of membership), ADA is each WCAG criterion evaluated against the article content, and fact is one row per extracted claim with the URL it was checked against. The guardrail sits where the recording happens: an item you did not perform is never recorded, not as `n/a` and not as `pass`, because the client is told these checks happened under our name. ADA's deferred page-level items stay `note` findings and are explicitly not verification rows: nobody has evaluated them, and a row here would say we did. Needs the platform column (geo_0053) deployed; on an older platform the argument is simply ignored.

## 1.4.5 — 2026-08-12

- **The client URL is always disclosed, and the send gate is a warning** (matches metrifi-platform#186). The platform no longer withholds `client_url` until the first send, and `send-deliverable` no longer refuses on incomplete pre-publish checks: the send goes out and the response names each missing, failing, or stale check as a warning (publish still refuses). Every skill that taught the old behavior is updated, descriptions included: routing metadata an agent reads before it opens a skill is the version that reaches the decision, so exp-deliver's and exp-review's descriptions moved with their bodies. exp-deliver now hands the URL over the moment the operator asks, then offers the record as a follow-up: "send" emails it from the platform, "shared" records a manual share with `record-deliverable-shared`, whose `client_email` is now optional. The manual-share tell in exp-revise and exp-sweep moves from "link reads withheld" to `sent: not yet`, and exp-revise's activity note is corrected: a manual share records `sent` with `method: manual`, not a `shared` kind. Found live: asked for the link to Honda FCU deliverable 274, the agent followed the skill text and said no link could exist before a send.

## 1.4.4 — 2026-08-06

- Codex listing copy for the OpenAI plugin directory: interface.shortDescription cut from 156 to 28 characters to clear OpenAI's 30-character final limit, and interface.longDescription added, mirroring the description submitted to Anthropic so both directory listings say the same thing. interface.developerName is deliberately still unset pending OpenAI business verification.

## 1.4.3 — 2026-08-05

- Correct the Claude install instructions: installing the plugin does not install its connector. Verified in Cowork that the plugin lands 12 skills but the MetriFi tools stay inert until the user opens the Connectors tab on the plugin page, installs the metrifi connector, confirms the dialog, and clicks Connect. There is no Connect button earlier in the flow, so the previous README steps left users installed but not connected. README now gives the six real steps, install-prompt.md names both the Cowork and desktop/web connector locations, and docs/marketplace-operations.md records the finding.

## 1.4.2 — 2026-08-05

- Marketplace listing metadata and operations doc: the marketplace entries gain displayName, author, homepage, repository and license so the public listing card is complete, and both plugin/marketplace descriptions now name the GEO experiment skills; adds docs/marketplace-operations.md covering how an update reaches a user, the nightly catalog sync, SHA pinning, the git-subdir source check and customer triage; corrects the submission checklist, which had submission A landing in claude-plugins-official rather than claude-community.

## 1.4.1 — 2026-08-05

- Directory submission readiness: all twelve skill descriptions trimmed under OpenAI's 1,024-character limit (skill_description_too_long is a hard reject); adds LICENSE and SECURITY.md, the latter satisfying Anthropic's Software Directory Terms requirement for a vulnerability reporting channel; fills in repository, license and keywords on the Claude manifest and description on the Codex manifest; adds docs/submission-checklist.md.

## 1.4.0 — 2026-08-03

- **New skill `exp-sweep`**, the daily cross-client sweep over every top-customer team. Every other experiment skill takes a single team_id, so nothing ever looked across clients. It reads the cohort in one `list-all-teams(top_customer: true)` call, classifies each team into one of six lanes, and hands the team to the phase skill that owns the work. Dispatched teams run their chain as far as it goes rather than stopping at a phase boundary, stopping only at four real gates: baseline responses not populated, ready to send, waiting on a client, or a halt. It never re-implements a phase, never sends to a client, and never crosses a human gate.
- **Four bugs its first dry run found, against the real 15-team cohort.** In-motion is now judged on artifacts (deliverable state, then documents) rather than workflow_status and events, which are only written when someone remembers to: four of seven experiments read had "not set" with zero events, including one with nine completed documents and a deliverable already with the client, so the old rule would have opened a second experiment for a client already holding a live deliverable. list-experiments is now an index (it carries no status or last-event date), the cohort read no longer spends a get-team-health board to get names it then has to resolve to slugs, and a team whose only experiment is an empty shell is resumed rather than restarted.
- **Nudges outrank new experiments.** On the real cohort, zero teams qualified for a new experiment while nine deliverables sat waiting on clients with no followup ever sent. Chasing built work that one answer unblocks now runs first and uncapped; starting new experiments is the lowest-priority lane, where firing zero times is correct.
- **`exp-revise` records manual shares.** A deliverable whose client link reads "withheld" while the client is viewing and answering it was shared by hand, so it has no captured client contact and can never be nudged. That is the actual reason those nine were never chased. It records the share with `record-deliverable-shared`, back-dated where the first view establishes it, and records only what it can evidence.
- **`exp-revise` reads the scoped staleness reason.** It re-read the whole article against all four batteries on every revision. Staleness now names the sections that moved, so it works those in the context of the full article, and still treats a structural change or an unpinned check as a whole-article job.
- **Use `deferred`, never `n/a`, when handing a check to the institution's compliance officer.** `n/a` satisfies the send gate and `deferred` blocks it. Found in production: an NCUA check recorded as n/a meaning "the compliance officer still owes us this" left an unreviewed article one call from a real send.

### Detail: `exp-sweep`, the daily cross-client sweep (shipped in 1.4.0)

- **New skill `exp-sweep`.** The sweep node over the whole top-customer cohort, and the piece the
  experiment workflow was missing: every existing skill takes a single `team_id`, so nothing looked
  across clients. It reads the cohort in one `list-all-teams(top_customer: true)` call, classifies
  each team into one of six lanes, and hands the team to the phase skill that owns the work. It
  never re-implements a phase, never sends anything to a client, and never crosses a human gate.
  **Needs the `top_customer` filter shipped on the platform side** (metrifi-platform, 2026-08-03);
  before it, isolating the cohort meant `get-team-health`, which spends a full visibility and
  AI-traffic board and then returns team names rather than the slugs every other tool takes.
- **The chain contract, which is what makes overnight operation worth anything.** A dispatched team
  runs its chain as far as it goes rather than stopping at a phase boundary, so `exp-build` finishing
  flows straight into `exp-review` in the same session. Exactly four gates end a chain: baseline
  responses not populated yet, a deliverable ready for the operator's send decision, a client who has
  not answered, and a halt (opt-out, withdrawn approval, or a surviving check finding). The intended
  end state is a login that shows built, checked deliverables waiting on a send, not experiments
  waiting to be executed.
- **"In motion" is judged on artifacts, not on bookkeeping**, and the first dry run is what forced
  that. Four of seven experiments read on the real cohort carried `workflow_status: not set` with an
  empty event log, including one with nine completed working documents and a deliverable sent to the
  client three weeks earlier. Status and events are written only when an operator or a run remembers
  to write them, so the original rule (status plus a recent event) would have declared thriving work
  abandoned and opened a second experiment for a client already holding a live deliverable. The rule
  now walks deliverable state first, then documents, and reaches `workflow_status` only when neither
  exists. Parked is still not stalled (a deliverable waiting 10 days on a client is in motion, and
  its nudge belongs to `exp-revise`), and stalled is still not failed (a stall is a resume).
- **Nudges outrank new experiments, which is the reverse of the first draft.** On the real 15-team
  cohort, zero teams qualified for a new experiment while nine deliverables sat waiting on client
  attestations with no followup ever sent. Chasing already-built work that one answer would unblock
  is worth more than any kickoff, so lanes 1 and 2 (client responded, client went quiet) are
  uncapped and run first, and starting new experiments is explicitly the lowest-priority lane where
  firing zero times is the correct outcome rather than an idle sweep.
- **Autonomous topic selection, with a hard precondition.** `exp-research` asks once and waits when
  the topic or geography is vague, which would stall an unattended run on step one, so `exp-sweep`
  hands over a complete brief instead of a bare topic. Topics come off a signal ladder: never repeat
  a topic already targeted, then `get-org-visibility` per existing campaign for the measured gap
  where the client ranks below competitors, then the institution's own live site for a genuinely cold
  team. If all four brief fields cannot be filled from platform state and the live site, the team is
  reported as needing a topic decision rather than dispatched: a guessed geography muddies that
  client's visibility history permanently.
- **Dispatch is the default, inverted from a devops triage sweep**, because autonomy is the point.
  `--dry-run` is the brake, `--no-new` suppresses lane 5, `--team <slug>` runs one chain. Caps: 3 new
  experiments and 8 teams per sweep, one agent per team (two would race on
  `update-deliverable-draft`, which replaces whole lists rather than merging them), one retry per
  phase failure, and every cap that bites gets a line in the report.
- **Two lookalike traps written into the skill.** `get-master-health`'s `top_clients` is a
  performance leaderboard ranked by a composite of visibility movement, traffic movement and deploy
  rate, not the cohort. And team health's own "dormant" verdict scores prompts run inside a window,
  which is not this skill's "not in motion": a team can be dormant there while a deliverable of
  theirs is in active client review.
- **A team whose only experiment is an empty shell gets resumed, not restarted.** The first draft
  contradicted itself here, routing a team with a stalled experiment to `exp-research` to start
  something new while its own prose said a stall is a resume. Split into lane 6a (prompts attached,
  no documents, no deliverable: someone already picked the topic and stood up the campaign, and the
  responses may be sitting there unread) and lane 6b (genuinely nothing). Starting fresh alongside a
  shell abandons work already paid for and splits the client's visibility data across two campaigns
  covering the same ground.
- **One honest gap, recorded rather than papered over.** A team the sweep decided *not* to start an
  experiment for has no object to hang a note on, so that decision is re-derived from scratch each
  run. That is acceptable because every reason for not starting is itself re-derived from current
  state. Creating an empty experiment to hold the note is explicitly ruled out: it would be a lie in
  the client's own history.
- `start` routes to it, and `workflow-overview.md` is mapped to it in `tools/reference-sync.mjs`.

## 1.3.0 — 2026-07-27

- GEO experiment workflow: seven skills (start, exp-research, exp-build, exp-review, exp-deliver, exp-revise, exp-status) running the full experiment lifecycle against platform.metrifi.com, with quota-adaptive experiment sizing and the pre-publish check gate.

## Unreleased (M14 Phase 4): QA follow-up, quota-adaptive sizing + the re-scoped send gate

The skills and the runbook realigned to the platform fixes from the M14 QA run (platform PRs #55 to
#59) and to Ryan's quota decision of 2026-07-27. **No `version` bump here either:** the bump and the
marketplace publish are still one `tools/release.mjs` run at the end of M14, which Ryan runs.

- **Quota-adaptive experiment sizing (Ryan, 2026-07-27).** The methodology no longer assumes a fixed
  sampling volume. New **methodology rule 21**: read `get-team-usage` before proposing a candidate
  set, reserve about a third of the remaining GEO responses for the pivot, split the rest into
  prompts times samples per prompt, cut prompt count before samples (floor of two), state the
  tradeoff in one plain sentence, and pass `min_responses` to `get-campaign-readiness` matching the
  sizing. Always the best experiment the plan allows, never a refusal and never an overrun. **Rule 5
  is now budget-relative** (four samples where the plan allows, two as the floor, and the sample size
  stated whenever it is below four) with the M14 QA origin recorded. `exp-research` gains step 1,
  "size the experiment to the plan", and carries the sized numbers into the kept set, the run `count`,
  and readiness; `exp-build` reads readiness at the sized `min_responses`, samples what the budget
  bought, and re-checks the budget before a pivot run. On a generous plan none of this changes
  anything.
- **The send gate is scoped to the article, not the status.** The platform now refuses any non-preview
  send whose manifest carries an article until the four checks are current, whatever the status, and
  still refuses a ready, scheduled, or published send on the same blockers. `exp-deliver`,
  `exp-revise`, `exp-review`, `exp-status`, `start`, and `workflow-overview.md` all say that now
  instead of the old ready-family-only wording. `exp-review`'s framing gets stronger and says so
  plainly: there is no status that lets an unchecked article reach a client, and the only way through
  is a recorded result, which leaves an audit row.
- **The client link is withheld by the platform, not by agent discipline.** Every "do not surface the
  URL" instruction became "the platform withholds the link until the send; never try to reconstruct
  it", with the withheld line read as deliberate rather than as a missing field (`exp-build`,
  `exp-deliver`, `exp-revise`, `start`, `workflow-overview.md`). `exp-revise` no longer claims the
  worklist prints a link for an unsent deliverable, because it does not.
- **`exp-deliver` gains the no-client-contact path.** For an internal or QA send: pass no
  `client_email` or `client_name` (either one captures a client participant, permanently), preview to
  yourself, and state before asking for the OK that the real send reaches only the participants
  already on the record, naming them. The gate still applies.
- **`exp-research` gains two QA findings.** It checks `get-org-visibility` for the client
  organization on the campaign and says plainly that a person registers it in the MetriFi GEO app if
  it is missing, since no tool in this plugin creates one and an unregistered institution reads as
  zero visibility forever. And it labels DataForSEO volumes as national United States numbers, leads
  the client-facing table with the geo-anchored phrase as the honest local-demand signal, and never
  quotes a national umbrella volume to a client unlabeled. It also states that providers are a pool
  rather than a multiplier, and that the run tools name unsupported providers and refuse an
  all-unsupported request.
- **Runbook rewritten around the changes.** The Starter QA team's 50 responses a month is now a
  feature of the test (rail 8: verify the skill visibly scales down, do not raise the plan), the CLI
  sign-in path is documented alongside the desktop Connectors panel (`/mcp`, the MetriFi server's
  `authenticate` tool, its OAuth URL), a new section 3a names the default subject institution and the
  three rules that keep it safe, step 2 gains the sizing, organization-registration, national-volume
  and provider-honesty checks, step 4 is rewritten around the article-triggered refusal with no
  `set-deliverable-status` workaround, and step 6 covers the no-client-contact send.

## Unreleased (M14 Phase 4): punch list + cross-host QA runbook

Copy fixes against the platform as deployed (M11 to M13 live, including migration `geo_0045` and
platform PR #49), plus the runbook that gates the release. **No `version` bump here either:** the bump
and the marketplace publish are one `tools/release.mjs` run at the end of M14, which Ryan runs.

- **`start`: the wrong-scope warning no longer talks about quota.** The real cost of creating a
  campaign against the wrong scope is that the research lands in the wrong client's workspace and
  pollutes the visibility data they read. That is what it now says.
- **`idempotency_key` is unconditional in all four skills that log workflow events** (`exp-build`,
  `exp-review`, `exp-deliver`, `exp-revise`). The argument is live on prod, so the rejected-key
  fallback prose is gone: always pass a stable key per step, and a repeat call under an existing key
  returns the event already logged instead of appending a second one.
- **`exp-revise` partial marking now works.** The activity ledger prints each row's activity id
  (`#123`), so the skill reads the ids as it works the window and passes `through_activity_id` for the
  newest row it **fully** handled, marks everything only when it handled everything, and never marks
  past a row that still needs a person. The mark is still the last step.
- **`exp-status` no longer carries the pre-M13 degrade path** for
  `list-deliverables-needing-attention`. The tool is live, so the body starts there and the frontmatter
  lists it among the reads. Nothing in a customer-facing skill names an internal platform milestone
  now.
- **New `docs/m14-phase4-qa-runbook.md`.** The cross-host QA script Ryan and Kaili execute: pass
  criteria, per-host setup and skill-visibility checks for Claude Code and Codex, the QA safety rails
  (a dedicated QA team, never `client_email`, preview-only sends to the operator's own inbox, no client
  URL, DataForSEO spend capped), the step-by-step script including one deliberately refused send and
  the operator-swap test, the deviations table to paste into the plan's Phase 4 status block, and the
  go/no-go checklists for the two one-way doors (the `release.mjs` publish, which only Ryan runs, and
  archiving `paraloom-plugin`).
- **Two Phase 3 notes below were corrected in place**, because the section has not shipped yet and
  would otherwise publish two claims that stopped being true when M13 deployed: the activity ledger
  does print activity ids, and `add-experiment-event` does accept `idempotency_key`.

## Unreleased (M14 Phase 3): `exp-review`, `exp-deliver`, `exp-revise`

The review, send, and revise phases of the GEO experiment workflow (platform plan
`m14-plugin-experiment-skills`). **No `version` bump here on purpose:** the bump and the
marketplace publish happen in one `tools/release.mjs` run at the end of M14, not per phase.

- **New skill `exp-review`.** Runs all four pre-publish checks itself, one at a time, from the
  four batteries in its own `references/` folder: no fan-out to sub-skills, which is what the
  old plugin did and what Codex does not document. Each battery writes its full report with
  `set-experiment-document` (`review-hygiene`, `review-ncua`, `review-ada`, `review-fact`) and
  records its verdict with `record-deliverable-check`, then a `review-summary` rollup gathers
  the blockers, the deferred items, and what needs a human. The body states why recording is
  load-bearing: a ready-status send refuses until all four checks have a current non-failing
  result, so skipping one is structurally visible, and an article edit stales the checks pinned
  to it (`article_changed`). It also carries rule 19's three-test gate before any finding is
  allowed to become a client action item.
- **New skill `exp-deliver`.** `build-deliverable` (dry run first, then read the summary and
  every warning aloud), `send-deliverable` with `preview: true` to the operator's own inbox,
  then the real send only after the human's explicit OK in the conversation, with the recipient
  named first. `client_email` plus `client_name` capture the client participant, without which
  the deliverable can never be followed up on. The client magic link is never surfaced before
  the send. Server refusals (missing/failing/stale check, contract failure, guarded `published`)
  are documented as instructions to follow rather than obstacles to route around, and picking a
  status to dodge the check gate is called out by name.
- **New skill `exp-revise`.** `list-deliverables-needing-attention` for the worklist,
  `get-deliverable-activity` for the unprocessed window, client answers applied as methodology
  inputs (rules 15 and 19) rather than literal edit commands, answers that fail the rules
  `returned` with a plain-language explanation, confirmations re-verified against the real
  source, the revision pushed via `update-deliverable-draft` plus `build-deliverable`, every
  staled check re-run and re-recorded, the send held to the same gate discipline (described in
  full, since no skill may invoke another), and `mark-deliverable-activity-processed` as the
  LAST step so a crashed run leaves the deliverable correctly still listed. A run that finds
  nothing reports one line and stops, which is what makes it safe on a cadence. Two behaviors
  found while sanity-reading prod and written into the body: `get-deliverable-activity`'s `since`
  filter is exclusive, so passing the worklist's "waiting since" timestamp drops the oldest
  unprocessed row (read the ledger instead and reconcile against the worklist's per-kind counts),
  and the ledger prints each row's activity id, so partial marking passes `through_activity_id` for
  the newest fully handled row and never marks past a row that still needs a person.
- **Reference sync map extended** in `tools/reference-sync.mjs`: `workflow-overview.md` now goes
  to all three new skills, and `methodology-rules.md` plus the four `review-*.md` batteries go
  to both `exp-review` and `exp-revise`. `exp-revise` gets the batteries because it re-runs the
  checks its own article edit staled and cannot call another skill to do that for it.
- **All three skills pass `add-experiment-event`'s `idempotency_key`**, matching what Phase 2 does in
  `exp-build`: a stable key per round, so a resumed run cannot double-log.

## Unreleased — M14 Phase 2: `exp-research` + `exp-build`

The two write phases of the GEO experiment workflow (platform plan `m14-plugin-experiment-skills`).
**No `version` bump here either:** one `tools/release.mjs` run publishes all of M14 at the end.

- **New skill `exp-research`.** Topic to demand-grounded campaign: a wide candidate set spread
  across intent angles, segments, and geographies (never a brand name in a prompt), demand measured
  with `research-keywords` on umbrella noun phrases (rule 2), keep/drop triage on measured volume
  alone (rules 1 and 3) with every verdict including the drops recorded through
  `record-keyword-research`, then the campaign, a draft experiment record, only the surviving
  prompts, the run, and `get-campaign-readiness` read as a fact with no poll loop. Dry-run mode
  stops after triage and creates no prompts and runs nothing.
- **New skill `exp-build`.** Populated campaign to a defensible draft: readiness first, then a
  read-only baseline analysis carrying the institution-citation gate (rule 5), the Viability Verdict
  block (rule 16), a pivot ladder whose executable tiers are re-select, re-angle, and re-scope
  (re-campaign and AVOID-at-HIGH go back to the human), pivots attached with `update-experiment`
  `prompt_ids_mode: "add"` and logged through `add-experiment-event` with a stable idempotency key,
  a ceiling of two executed pivots, then `set-experiment-opportunity`, the `build-analysis`,
  `evidence`, and `decisions` documents through `set-experiment-document`, the article through
  `update-deliverable-draft`, and `build-deliverable` with `dry_run` first.
- **Both skills consume `methodology-rules.md` and `workflow-overview.md`** from their own
  `references/` folders; `tools/reference-sync.mjs` gained the four map entries.
- **Two behaviors recorded from prod reads.** `get-campaign-readiness` counts responses inside a
  lookback window, so a campaign with an older baseline reports 0 percent populated while
  `list-prompts` shows responses on every prompt: both skills say to check `window_days` before
  believing a zero. And `add-experiment-event` accepts a stable `idempotency_key`, so `exp-build`
  passes one per pivot and a resumed run cannot double-log.

## Unreleased — M14 Phase 1: reference set, sync pipeline, `start` + `exp-status`

First slice of the GEO experiment workflow (platform plan `m14-plugin-experiment-skills`).
**No `version` bump here on purpose:** the bump and the marketplace publish happen in one
`tools/release.mjs` run at the end of M14, not per phase.

- **New `plugins/claude/metrifi/reference-src/`** — reference docs authored once and synced
  into each consuming skill. `methodology-rules.md` (the 20 numbered rules, ported and
  edited to server-state reality: rules 1 to 4 now read `research-keywords` and
  `record-keyword-research` output, rules 17 and 18 retired as tombstones because the
  platform owns hygiene linting and keyword caching), the four review batteries
  (`review-hygiene`, `review-ncua`, `review-ada`, `review-fact`) with their taxonomies,
  a single shared severity scale, and the report shape each one records through
  `record-deliverable-check`, and `workflow-overview.md` (the phase map, rewritten around
  platform state: nothing touches the filesystem).
- **New skills `start` and `exp-status`.** `start` orients (whoami, list-teams,
  get-experiment-workflow), carries the identity rule, the three scoping questions, and
  the three human gates, then tells the user which skill fits next. `exp-status` is a
  read-only rollup; it starts from `list-deliverables-needing-attention` and fills in the detail
  with `list-deliverables` plus `get-deliverable-activity`. Both consume `workflow-overview.md`
  from their own `references/` folder.
- **`tools/reference-sync.mjs` (new)** holds the source-to-consumer map and the copy.
  `tools/release.mjs` runs it before the Codex mirror and gained `--sync-only`, which runs
  both deterministic sync steps plus validation and stops short of any version bump,
  commit, tag, or push.
- **`tools/validate.mjs` gained two gates.** A drift gate: a synced reference that differs
  from its source, is missing, or sits in a skill the map does not list, fails the build.
  A cross-host body gate: no file shipped under `skills/` may contain `python`, `curl`,
  `artisan`, `Workflow(`, `${CLAUDE_PLUGIN_ROOT}`, or a named browser tool stated as a
  requirement (encouraging one is fine).

## 1.2.0 — 2026-07-21

- Platform cutover: plugin now connects to platform.metrifi.com/mcp (Site Builder, GEO, CRO); mcp.metrifi.com retired

## Unreleased (docs only, no version bump)

- Directory-submission prep. Adds `docs/submission-checklist.md`, the verified
  gate list for the three public directories (Claude plugin directory, Claude
  Connectors Directory, OpenAI Plugins Directory). Fixes what that audit found
  in this repo:
  - All four skill descriptions trimmed under OpenAI's 1,024-character limit
    (`skill_description_too_long` is a hard reject). Was 1431 / 1273 / 1131 for
    `client-report`, `generate-claude-design-system`, `generate-claude-design-page`.
    Trigger phrases and stage-routing signals are preserved; only redundancy was cut.
  - Adds a `LICENSE` file stating the existing proprietary terms, so reviewers
    find a license where they look for one. Terms are unchanged from `NOTICE.md`.
  - Claude `plugin.json` gains `repository`, `license`, and `keywords`.
  - Codex `plugin.json` gains the top-level `description` OpenAI requires
    (`plugin_description_missing`).
  - README gains a Legal section linking the terms, privacy, and cookie policies
    plus a support contact.
- `install-prompt.md`: both prompts now instruct the installing agent to close
  with a distinct "## What you need to do" checklist instead of burying the
  required next steps in a wrap-up paragraph, and to put the "Who am I on
  MetriFi?" test phrase in its own copyable code block. Formalizes "try a new
  conversation first, then quit and restart the app if that doesn't work" as
  the activation step for both providers. The Codex prompt's sign-in step (2)
  is also brought back in sync with the hand-synced counterpart in
  `bloomcu/metrifi-mcp-gateway-laravel`, which had drifted ahead.
- `install-prompt.md`: the Claude one-paste prompt gained a pre-install step that
  clears any stale `~/.claude/plugins/cache/metrifi` and `metrifi-internal` build
  cache before install, so a reinstall is served fresh. Steps renumbered; the
  Codex prompt is unchanged. The header now names the hand-synced counterpart in
  `bloomcu/metrifi-mcp-gateway-laravel` (`CLAUDE_PROMPT` / `CODEX_PROMPT` in
  `resources/js/Home.tsx`, served at `mcp.metrifi.com/install/{claude,codex}`).
- **No `version` bump on purpose:** these are repo-facing docs, not part of the
  shipped skill bundle, so there is nothing for `/plugin marketplace update` to
  deliver to installed clients.

## 1.0.1

- Skills: added a **Prerequisites** section to `generate-claude-design-system`
  (brand assets — soft; a brand-new institution with no website is allowed) and
  `generate-claude-design-page` (an approved design system from stage 1).
- Added `install-prompt.md` (the paste-once install prompts) and clarified the
  README: the connection test is **"Who am I on MetriFi?"** (works for any
  signed-in user, no site required), and the no-account guidance covers creating
  a new team or asking an admin to invite you.

## 1.0.0

- Initial public release. One self-contained `metrifi` plugin per ecosystem
  (Claude and Codex): the MetriFi gateway connector plus the three-stage
  site-design skills. Skills are thin pointers; the full methodology is fetched
  from MetriFi at runtime, behind your sign-in.
