# Marketplace operations

How the MetriFi plugin reaches users once it is listed, and what to check when someone
says a change has not arrived.

This is the long-lived companion to [submission-checklist.md](submission-checklist.md).
The checklist is a one-time gate before we submit; this file is what you read a year from
now when a customer asks why a new skill is not showing up.

Every claim here carries a source. Vendor-doc quotes are marked with the doc; things we
measured ourselves are marked `[LOCAL]` with the date.

---

## 1. The three places we can be listed, and what each one is

| Directory | Where we appear | What users install | Does it auto-update? |
|-----------|-----------------|--------------------|----------------------|
| `claude-community` | Claude Code, Cowork, Claude Desktop | the plugin (skills + connector) | yes, via a CI SHA bump |
| Claude Connectors Directory | claude.ai, Claude Desktop | the MCP server alone | yes, server-side |
| OpenAI Plugins Directory | ChatGPT and Codex | the plugin (MCP app + skills) | skills manual on Codex, server-side for the MCP app |

**We are not in `claude-plugins-official` and cannot apply to be.** Anthropic runs two
public marketplaces for Claude Code:

- **`claude-plugins-official`** is curated. Per
  [Create plugins](https://code.claude.com/docs/en/plugins): "The official marketplace,
  `claude-plugins-official`, is curated separately. Anthropic decides which plugins to
  include at its discretion. There is no application process, and the submission form does
  not add plugins to the official marketplace."
- **`claude-community`** is where third-party submissions land after review. Users add it
  with `/plugin marketplace add anthropics/claude-plugins-community` and install from it as
  `@claude-community`.

If Anthropic ever does pick us up for the official marketplace, that unlocks CLI install
prompts. See [Recommend your plugin from your CLI](https://code.claude.com/docs/en/plugin-hints).

### How a listed plugin is actually discovered and installed

Three paths, and they are not equally good. Know which one a given user is on before
troubleshooting their install.

**1. [claude.com/plugins](https://claude.com/plugins), the public web directory.** Searchable
and filterable by "Works with" (Cowork, Claude Code), with one-click install. This is the
discovery surface the listing actually buys us: someone searching "credit union" or
"AI search visibility" can find MetriFi without having heard of MetriFi.

**2. Cowork's browse flow.** Customize → Plugins → **Add** → **Add marketplace** →
**Browse Anthropic sources**, which surfaces listed plugins without the user typing a repo
name. Install from there, then the connector still needs the separate steps in §7.

**3. Claude Code, which is worse than it sounds.** The community marketplace is **not**
registered automatically; only `claude-plugins-official` is. Per
[Discover and install plugins](https://code.claude.com/docs/en/discover-plugins#community-marketplace):
"Unlike the official marketplace, you add it manually." So a Claude Code user needs:

```
/plugin marketplace add anthropics/claude-plugins-community
/plugin install metrifi@claude-community
```

**Keep pointing Claude Code users at our own repo instead.** Installing from the community
marketplace is *more* typing than installing from us directly
(`/plugin marketplace add metrifi/plugins` then `/plugin install metrifi@metrifi`), and we
are invisible in a user's `/plugin` Discover tab until they have added the community
marketplace. The listing's value on Claude Code is credibility, not discovery.

**`[?]` Open question: does a listed install auto-update?** Auto-update is on by default for
"Official Anthropic marketplaces" and off by default for third-party ones
([Discover and install plugins](https://code.claude.com/docs/en/discover-plugins#configure-auto-updates)).
Whether `anthropics/claude-plugins-community` counts as official is not documented. If it
does, users who install from the listing get updates automatically and the manual
`autoUpdate` step in [`install-prompt.md`](../install-prompt.md) is unnecessary for them.
Test this once we are listed and update this section either way.

---

## 2. How an update actually reaches a user

Four hops. A change is only live for a user when all four have happened.

1. **We push to `main`** in `github.com/metrifi/plugins`, with a bumped `version` in both
   plugin manifests (`tools/release.mjs` does this).
2. **Anthropic's CI bumps our pinned SHA** in the community catalog.
   [Create plugins](https://code.claude.com/docs/en/plugins): "Approved plugins are pinned
   to a specific commit SHA in the `anthropics/claude-plugins-community` catalog, and CI
   bumps the pin automatically as you push new commits to your repository." We never
   re-submit the form for an update.
3. **The public catalog syncs.** Same page: "The public catalog syncs nightly from the
   review pipeline, so there can be a delay between approval and your plugin appearing in
   `marketplace.json`." Treat "nightly" as a ceiling, not a promise (see §4).
4. **The user's client refreshes.** Users with auto-update on get it at app launch. Users
   who installed by hand run `/plugin marketplace update`. Codex has no plugin auto-update
   at all: those users must run `codex plugin marketplace upgrade metrifi`.

### The version field is the gate

If `version` in `plugin.json` does not change, **users do not get the update**, even if the
SHA moves. From
[Plugins reference](https://code.claude.com/docs/en/plugins-reference#plugin-manifest-schema):
"Setting this pins the plugin to that version string, so users only receive updates when
you bump it." This is why every shipped change goes through `tools/release.mjs` rather than
a bare `git push`.

### What does not need any of this

The MCP server at `https://platform.metrifi.com/mcp` is hosted by us. Tool changes,
description changes and bug fixes there are live the moment we deploy the platform, on every
host, with no plugin release and no user action. Only **skills** and **manifest metadata**
travel through the marketplace pipeline.

---

## 3. Triage: "why isn't this working for me?"

Ask in this order. Most reports stop at step 2.

1. **Is it a skill change or a tool change?** Tool behaviour is server-side and instant.
   If they are describing a tool that behaves differently than expected, it is a platform
   issue, not a distribution one. Skip the rest of this list.
2. **What version do they have?** `/plugin` in Claude Code shows the installed version.
   Compare against the current tag in this repo. If theirs is older, it is a delivery
   problem: steps 3 to 5.
3. **Did we actually bump the version?** Check that the change shipped in a tagged release
   and not a bare commit. A commit without a version bump is invisible to installed users.
4. **Has the catalog picked us up?** Search our name in the
   [community catalog](https://github.com/anthropics/claude-plugins-community/blob/main/.claude-plugin/marketplace.json)
   and read the `sha` on our entry. If it does not match our latest release, we are waiting
   on Anthropic's CI, and there is nothing we can do but wait or open an issue. See §4.
5. **Have they refreshed?** Claude Code: `/plugin marketplace update`, then reinstall if the
   version still lags. Codex: `codex plugin marketplace upgrade metrifi`.

### The honest answer to give a customer

> Skills ship through Anthropic's plugin catalog, which syncs on its own schedule after we
> publish. It is usually a day; it can be longer. The MetriFi tools themselves update
> instantly, so if this is about what a tool does rather than how a skill walks you through
> it, tell us and we will look at the platform.

---

## 4. Known failure modes in Anthropic's catalog

These are real, first-hand developer reports gathered while preparing our submission
(2026-07). They are the reason step 4 above exists. Full citations and quotes are in
[submission-checklist.md](submission-checklist.md#after-approval-set-expectations-low).

| Failure | What it looks like | What we can do |
|---------|--------------------|----------------|
| **Approved but never listed** | Submission shows "Published", we never appear in `marketplace.json` | Wait, then open an issue on `claude-plugins-community`. Four reporters have been stuck 8+ weeks. |
| **Sync stalls** | Catalog total flat for days despite ongoing `bump(...)` commits | Nothing. "Nightly" has been observed as weekly, and sometimes stopped. |
| **Bump starvation** | Our pinned `sha` stays old while newer releases pile up | The bump script processes entries in file order and stops at a cap, so late entries starve. Verify our pin periodically; open an issue if it is many releases behind. |
| **Broken `url` + `path` source** | Plugin installs with **zero skills** | Only affects subdirectory plugins, which we are. See §5. Re-submitting the form does **not** fix it; open an issue. The repo auto-closes PRs from non-Anthropic contributors. |
| **Listed but not installable** | Catalog page exists, `/plugin install` says the plugin was not found | Test the install ourselves after listing rather than trusting the page. |
| **Catalog over its client limit** | Catalog measured at 2307 entries against a reported 2000 client max `[LOCAL 2026-07-23]` | Nothing. Noted so we recognise the symptom if installs start failing broadly. |

---

## 5. Our entry is a subdirectory plugin: check its shape

Our plugin does not live at the repo root. `.claude-plugin/marketplace.json` declares
`"source": "./plugins/claude/metrifi"`, which is the correct relative-path form for a plugin
inside its own marketplace repo. But **Anthropic's CI rewrites that into a git source when it
copies us into the community catalog**, and there are two shapes it can produce.

Correct:

```json
{
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/metrifi/plugins.git",
    "path": "plugins/claude/metrifi",
    "sha": "<40-char commit>"
  }
}
```

Broken:

```json
{
  "source": {
    "source": "url",
    "url": "https://github.com/metrifi/plugins.git",
    "path": "plugins/claude/metrifi"
  }
}
```

The `url` source type has no `path` field
([Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces#plugin-sources)),
so the `path` is ignored, Claude Code clones the repo root, finds no plugin manifest there,
and the plugin installs with nothing in it. In the catalog snapshot we took on 2026-07-23,
405 entries used `git-subdir` correctly and five carried the broken shape. `[LOCAL]`

**Do this once we appear in the catalog, and again after any structural change to the repo:**
find our entry in the community `marketplace.json` and confirm `"source": "git-subdir"` with
`"path": "plugins/claude/metrifi"`.

---

## 6. Where each surface gets its metadata

Worth knowing before editing anything, because the same text lives in several places and
different surfaces read different copies.

| File | Feeds |
|------|-------|
| `.claude-plugin/marketplace.json` (plugin entry) | the public listing card once Anthropic's CI copies it into the community catalog: `displayName`, `description`, `category`, `keywords`, `author`, `homepage`, `repository`, `license` |
| `plugins/claude/metrifi/.claude-plugin/plugin.json` | what Claude Code shows in `/plugin`, and the authority for component paths and the version gate |
| `.agents/plugins/marketplace.json` and `plugins/codex/metrifi/.codex-plugin/plugin.json` | the Codex equivalents, kept in step by `tools/release.mjs` |
| each `skills/*/SKILL.md` frontmatter `description` | when Claude decides to invoke a skill. On OpenAI this is hard-capped at 1,024 characters and a longer one is a hard reject (`skill_description_too_long`) |
| the MCP server's own tool names and descriptions | live from the platform, not from this repo |

`claude plugin validate ./plugins/claude/metrifi --strict` runs the same check Anthropic's
review pipeline runs. Run it before every release; `tools/validate.mjs` covers the
repo-structure rules that the CLI does not.

---

## 7. Cowork

Plugins run in Cowork as well as Claude Code, and the submission form covers both.

- Skills and connectors work in Cowork, chat on the web, and the Chat tab in Claude Desktop.
- **Installing the plugin does not install its connector.** Verified in Cowork on
  2026-08-05: installing MetriFi lands all 12 skills and shows "1 connector", but the
  connector is inert until the user opens the **Connectors** tab on the plugin's own page,
  clicks **Install** next to `metrifi`, confirms **Add** in the dialog showing
  `https://platform.metrifi.com/mcp`, and then clicks **Connect** to sign in. There is no
  Connect button anywhere earlier in the flow. `[LOCAL]` This is the most likely support
  ticket from a Cowork user: "I installed it and the MetriFi tools aren't there." The
  README and `install-prompt.md` both spell out the six steps.
- Hooks and sub-agents run **only** in Cowork and grey out in chat
  ([Use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)).
  We ship neither, so we have no surface-specific gaps.
- As of 2026-08, Cowork plugins are "currently saved locally to your machine", with org-wide
  sharing and private marketplaces described as "coming in the weeks ahead"
  ([Customize Cowork with plugins](https://claude.com/blog/cowork-plugins)). Our
  [`enterprise/`](../enterprise/) fleet-deployment path is Claude Code only until that lands.
- Cowork's audience skews less technical than Claude Code's. `tools/validate.mjs` already
  blocks any skill body from requiring a shell call, a local runtime, a host-specific
  variable, or a named browser tool, which is what keeps the skills usable there.

---

## 8. Routine checks

| When | Check |
|------|-------|
| Every release | `node tools/validate.mjs` and `claude plugin validate ./plugins/claude/metrifi --strict` both pass; version bumped in both manifests |
| First week after listing | Install from `@claude-community` on a clean machine and confirm the skills are actually present |
| First week after listing | Our catalog entry is `git-subdir` with the right `path` (§5) |
| Monthly | Our pinned `sha` in the community catalog is within a release or two of `main` |
| When a customer reports a missing feature | Run the §3 triage |
