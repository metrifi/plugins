# Changelog

Bump the plugin `version` on every release so installed clients get the update
with `/plugin marketplace update metrifi` (no reinstall). Claude Code keys
updates off this field — same version, no update.

## Unreleased: personalization skill

New `personalization` skill covering the whole loop for behavioural website
personalization on a MetriFi site: power check, personas, blocks, placement,
simulate, publish, pooled readout. **No `version` bump here** — the bump and the
marketplace publish are one `tools/release.mjs` run, per the note above.

- **`personalization` (new).** Fronts the 16 personalization tools added to the
  Sitebuilder MCP server. The skill carries the reasoning the tool descriptions
  deliberately do not: why the power check runs first (a persona qualifying 3% of
  one credit-union site needs years to resolve, pooled across the fleet it needs
  weeks), why the default holdback is 50% rather than 10% (power peaks at an even
  split, and a small control arm runs colder on the CDN in a way that inflates
  measured lift), why rarer outcomes are weaker instruments than proximal ones,
  and why the composition compliance check exists (a personalized block replaces
  the default one, taking that block's disclosure off the delivered page, and
  Reg Z applies to the advertisement as delivered).
- **The refusals are documented as features.** No lift number below the
  pre-registered sample, no per-client lift ever, multiplicity correction when
  reading several experiments together. The skill says what to do instead rather
  than leaving an agent to route around the gate.
- **Out-of-scope section names CRM personalization explicitly** and gives the
  honest alternative (resolve the segment at campaign send time and put a
  distinct prebuilt landing-page URL in the email), so nobody builds a member-data
  path that would put MetriFi in every client's GLBA vendor file.

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
