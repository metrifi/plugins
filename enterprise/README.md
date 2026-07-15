# Zero-touch install + auto-update (client organizations)

For a credit union or bank on a Claude Team/Enterprise plan, an administrator can
push the MetriFi plugin to everyone so it installs itself and **stays updated
automatically** — members never run a single command.

## How

Place [`managed-settings.example.json`](managed-settings.example.json) (renamed to
`managed-settings.json`) at your platform's managed-settings path:

| OS | Path |
|---|---|
| macOS | `/Library/Application Support/ClaudeCode/managed-settings.json` |
| Linux / WSL | `/etc/claude-code/managed-settings.json` |
| Windows | `C:\Program Files\ClaudeCode\managed-settings.json` |

That's it. It does two things:

- **`extraKnownMarketplaces` + `enabledPlugins`** — installs the `metrifi` plugin at
  a managed scope users can't remove.
- **`autoUpdate: true`** — Claude Code pulls new plugin versions in the background
  **at startup**. `metrifi/plugins` is public, so no `GITHUB_TOKEN` is required.

## What the member experiences

- **First launch:** the plugin is there. They complete the one-time MetriFi sign-in
  (Settings → Connectors → MetriFi → Connect).
- **Every launch after a release:** Claude Code auto-pulls the new version at startup;
  the new skills are live in that session. **No command, no reinstall.** New skills
  take effect in sessions started after the update (a running session keeps what it
  loaded — reopening picks up the update).
- **The MetriFi tools themselves** (the MCP server at `platform.metrifi.com`) are hosted by
  MetriFi and update the moment we deploy — clients get server changes live, with no
  action at all.

## claude.ai / Cowork (non-Claude-Code)

For members using claude.ai or Cowork instead of Claude Code, an owner distributes the
plugin org-wide under **Organization settings → Plugins** (connect the `metrifi/plugins`
GitHub repo; Cowork auto-syncs updates). Same "installed by default" result.
