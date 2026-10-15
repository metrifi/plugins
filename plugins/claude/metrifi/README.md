# MetriFi

MetriFi connects Claude to the MetriFi platform, where credit unions and community banks
build and improve their websites. One sign-in with your MetriFi account turns on three
products and the skills that know how to use them:

- **Site Builder**: generate a brand and design system, build and edit pages, manage
  effective-dated rates, preview, and publish.
- **GEO**: measure how visible an institution is when consumers ask AI assistants
  questions, then run an experiment from keyword research to a reviewed client deliverable.
- **CRO**: build Google Analytics funnels, compare them, and generate conversion
  recommendations from real traffic.

Requires a MetriFi account. Everything the plugin can reach is scoped to your team and
your role on it.

## Install

In Claude Code:

```
/plugin marketplace add metrifi/plugins
/plugin install metrifi@metrifi
```

In Cowork or claude.ai, add the plugin, then open its **Connectors** tab, install
`metrifi`, and select **Connect** to sign in with your MetriFi account. Ask
"Who am I on MetriFi?" to confirm the connection.

## What's inside

- **One MCP connector**, `metrifi`, at `https://platform.metrifi.com/mcp`.
- **13 skills**:
  - `start`: orientation, and which skill fits the job.
  - `client-report`: a measured audit of an institution's existing website.
  - `generate-claude-design-system`, `generate-claude-design-page`, `page-design-process`:
    the three-stage MetriFi site-design workflow.
  - `campaign-setup`, `exp-research`, `exp-build`, `exp-review`, `exp-deliver`,
    `exp-revise`, `exp-status`, `exp-sweep`: GEO experiments, from a new institution's first
    campaign to a reviewed client deliverable.
- Reference documents the skills read (`reference-src/` and each skill's `references/`).

The plugin contains no hooks, commands, agents, scripts, or executables. It runs nothing
on your machine by itself.

## What the plugin connects to, sends, and fetches

- **MetriFi only, through the connector.** Every read and write goes to
  `https://platform.metrifi.com/mcp` after you sign in with OAuth. There are no API keys or
  tokens in the plugin, and it reads no credentials from your machine. Your MetriFi team
  and role decide what you can see and change.
- **Methodology fetched at run time.** Several skills load MetriFi's process documents
  through the connector when they run, so the methodology stays current.
- **Public websites, with your host's tools.** The audit, review, and GEO skills read an
  institution's public web pages to verify facts. They use whatever browsing or fetch
  capability your Claude host already has; the plugin adds none of its own.
- **Actions that reach other people only on your say-so.** Some MetriFi tools send email
  (a client deliverable, a review invitation, a team invitation, an assignment) or publish a
  website. The skills preview these and act only after you approve in the conversation.
  `client-report` builds its report as a password-gated page on MetriFi's
  `reports.metrifi.com` site, and publishes it only with your approval.
- **Search demand and AI answers come from MetriFi.** Keyword volumes (DataForSEO) and
  responses from AI assistants are gathered by the MetriFi platform at MetriFi's cost, not
  by the plugin.

### Optional: the Claude Design engine

`generate-claude-design-system` and `generate-claude-design-page` also need the local
Claude Design engine, [`@pro-vi/designer`](https://github.com/pro-vi/designer), an MIT-licensed
third-party package that drives claude.ai/design in a browser. The plugin does not install
or start it. The MetriFi process document these skills fetch covers setup. Without the
engine, those two skills stop and say so; every other skill works without it.

## Privacy, terms, and support

- [Privacy Policy](https://metrifi.com/legal/privacy-policy/)
- [Terms of Service](https://metrifi.com/legal/terms-of-service/)
- [Security policy](https://github.com/metrifi/plugins/blob/main/SECURITY.md)
- Support: [help@metrifi.com](mailto:help@metrifi.com)

## License

Proprietary and source-available; see [LICENSE](LICENSE). The source is public so you can
review what the plugin does before installing it.
