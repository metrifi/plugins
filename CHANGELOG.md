# Changelog

Bump the plugin `version` on every release so installed clients get the update
with `/plugin marketplace update metrifi` (no reinstall). Claude Code keys
updates off this field — same version, no update.

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
