# MetriFi plugin

One install connects your AI tool to MetriFi — the Site Builder tools (design,
edit, preview, and publish your website the MetriFi way), GEO (AI-search
visibility), and CRO analytics, plus the MetriFi site-design skills. You sign
in with your MetriFi account the first time; no tokens to paste. Full
instructions are right here.

> **Not technical? The easiest way to install is to paste a prompt** into your AI
> agent and let it install itself, no terminal. See [`install-prompt.md`](install-prompt.md).

## Claude (Cowork / claude.ai / Claude Desktop) — no terminal

Installing the plugin and connecting it to your MetriFi account are two separate
steps. The skills work after step 4; the MetriFi tools need step 6.

1. **Customize** → **Plugins** → **Add** → **Add marketplace** → **Add from a
   repository**
2. Paste `metrifi/plugins` and click **Sync**
3. Click **MetriFi** in the list
4. Click **Install**. You should see 12 skills and 1 connector.
5. On the MetriFi plugin page, open the **Connectors** tab, click **Install**
   next to `metrifi`, and confirm **Add** in the dialog that shows
   `https://platform.metrifi.com/mcp`
6. Click **Connect**, sign in with your MetriFi account, and authorize Claude

Then start a new chat and ask **"Who am I on MetriFi?"** to confirm it worked.

## Claude Code

```
/plugin marketplace add metrifi/plugins
/plugin install metrifi@metrifi
```

## Codex

```
codex plugin marketplace add metrifi/plugins
codex plugin add metrifi@metrifi
codex mcp login metrifi
```

## What's inside

- Account tools: whoami (answers "Who am I on MetriFi?"), team and member
  management (invite, roles, switching), and connection-token management
- The MetriFi connector (`https://platform.metrifi.com/mcp`; OAuth with your MetriFi sign-in)
- Skills: `generate-claude-design-system` → `generate-claude-design-page` →
  `page-design-process` (the three-stage MetriFi site-design workflow; the full
  methodology is fetched from MetriFi at runtime, behind your sign-in)
- GEO experiment skills: `start` (orient, then point you at the right skill),
  `exp-status` (a read-only rollup of where every experiment and deliverable
  stands), `campaign-setup` (a new institution to a baseline campaign: its
  market, its registered organization, and a first campaign wide across the
  products), `exp-research` (a topic to a demand-grounded campaign with baseline
  runs going), `exp-build` (a populated campaign to a scored opportunity and a
  drafted client deliverable), `exp-review` (the four pre-publish checks:
  hygiene, NCUA compliance, accessibility, fact verification), `exp-deliver`
  (build the client page, preview the email to yourself, send only on your
  explicit OK), and `exp-revise` (apply what the client answered, push a
  revision, re-run the checks the edit staled)

**After connecting, check it's working:** ask your AI agent **"Who am I on
MetriFi?"** — it returns your MetriFi account, which confirms the connection for
any signed-in user (it doesn't require you to have a site yet).

**No MetriFi account yet?** When the sign-in window opens you can **create a new
MetriFi team** (if your organization doesn't have one yet), or ask an **admin on
your existing MetriFi team to invite you** first.

## Staying up to date

**On Claude, updates are automatic.** The paste-in install prompt (and
[`install-prompt.md`](install-prompt.md)) turns on auto-update for you, so new
skills and fixes arrive on their own at app launch — you never run an update
command. If you installed by hand and want the same, set `"autoUpdate": true`
on the `metrifi` entry under `extraKnownMarketplaces` in `~/.claude/settings.json`
(or toggle it in `/plugin` → Marketplaces → metrifi → Enable auto-update).

**On Codex, updates are manual for now** (Codex has no plugin auto-update yet):
run `codex plugin marketplace upgrade metrifi` to pull the latest skills. The
hosted MCP server always updates on its own, on both apps.

> **IT / fleet deployments:** to push the plugin and auto-update to every member
> of an org via a managed setting, see [`enterprise/`](enterprise/). Most users
> don't need this — the install prompt above already handles auto-update per person.

## Releasing (MetriFi maintainers)

One command, so the Codex skills can't drift from the Claude skills and the version
can't be forgotten (Claude Code only ships an update when the version changes):

```
node tools/release.mjs --notes "what changed"     # patch bump; --minor / --set X.Y.Z
```

It syncs the single-sourced reference docs into each consuming skill, regenerates the
Codex skills from the Claude skills (Claude is the single source), bumps both manifests,
updates the CHANGELOG, validates, and commits + tags + pushes.

Both sync steps are deterministic file copies, so they can be run on their own, on any
branch, with no version bump and nothing committed:

```
node tools/release.mjs --sync-only
```

### Shared reference docs

A skill reaches its bundled files by **relative path**, because the plugin-root variable
is only documented for skills on one of the two hosts. So a reference doc several skills
need has to physically exist inside each of their `references/` folders. It is authored
once in `plugins/claude/metrifi/reference-src/` and copied by the map in
`tools/reference-sync.mjs`. Add a doc there, list its consumers in that map, then run
`--sync-only`.

CI (`tools/validate.mjs`) guards structure, Claude/Codex parity, reference drift (a
hand-edited copy fails the build), and the cross-host body rules: no skill may name a
local runtime, a shell call, a host-specific variable, or a specific browser tool as a
requirement.

### Distribution and directory listings

[`docs/marketplace-operations.md`](docs/marketplace-operations.md) is the operational
reference: how an update actually reaches a user, why a shipped change can take a day or
more to arrive, and how to triage "this isn't working for me."
[`docs/submission-checklist.md`](docs/submission-checklist.md) is the one-time gate for
getting listed in the Claude and OpenAI directories.

## Legal

- [Terms of Service](https://metrifi.com/legal/terms-of-service/)
- [Privacy Policy](https://metrifi.com/legal/privacy-policy/)
- [Cookie Policy](https://metrifi.com/legal/cookie-policy/)
- [License](LICENSE) — the source is public so you can review what the plugin
  does before installing; the contents remain proprietary to MetriFi.
- [Security policy](SECURITY.md) — how to report a vulnerability, what's in
  scope, and our safe harbor for good-faith research.

Support: [help@metrifi.com](mailto:help@metrifi.com) · Security reports:
[help@metrifi.com](mailto:help@metrifi.com) with `SECURITY` in the subject.

---
See [NOTICE.md](NOTICE.md). Proprietary release artifact; not an open-source project
and not accepting external contributions. Authored content lives under
`plugins/claude/metrifi/skills/` (the skills) and
`plugins/claude/metrifi/reference-src/` (the shared reference docs); every synced copy
and the whole Codex tree are generated by the release script.
