# Changelog

Bump the plugin `version` on every release so installed clients get the update
with `/plugin marketplace update metrifi` (no reinstall). Claude Code keys
updates off this field — same version, no update.

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
