# Changelog

Bump the plugin `version` on every release so installed clients get the update
with `/plugin marketplace update metrifi` (no reinstall). Claude Code keys
updates off this field — same version, no update.

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
  read-only rollup; it prefers `list-deliverables-needing-attention` and degrades to
  `list-deliverables` plus `get-deliverable-activity`, since that tool ships with platform
  M13. Both consume `workflow-overview.md` from their own `references/` folder.
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
