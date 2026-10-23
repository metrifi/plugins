# MetriFi

MetriFi connects Claude to the MetriFi platform, where credit unions and community banks
build and improve their websites. One sign-in with your MetriFi account turns on three
products and the skills that know how to use them:

- **Site Builder**: read and manage a site's brand tokens, build and edit pages, manage
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

## Try it

Three read-only prompts, one per product, once you are signed in. They use Golden Peak
Credit Union, the fictional demo institution on MetriFi's demo account; on your own team,
name your institution, campaign, or funnel instead.

1. **"Show me the Golden Peak Credit Union site and its current rates."** Site Builder:
   returns the site with its preview state, links to its live and draft sites, and each rate
   with its effective date.
2. **"What's the AI visibility for Golden Peak's Denver auto loans campaign, and which prompts
   are tracked?"** GEO: returns the campaign's tracked consumer prompts and a ranking of how
   often AI answers name each institution. Golden Peak is fictional, so it shows 0% while
   real Denver-area competitors show their share.
3. **"Show me the funnel report for the main funnel over the last 28 days."** CRO: returns
   each funnel step's user count from the connected Google Analytics property and the
   conversion rate between steps.

## What's inside

- **One MCP connector**, `metrifi`, at `https://platform.metrifi.com/mcp`.
- **11 skills**:
  - `start`: orientation, and which skill fits the job.
  - `client-report`: a measured audit of an institution's existing website.
  - `page-design-process`: designs and builds new pages on a site whose design system and
    prototype page are already approved.
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
- **Process documents from the same connector.** `client-report` and `page-design-process`
  follow MetriFi's own process documents, which they load with the connector's `get-doc`
  and `get-core-rules` tools when they run. That is first-party MetriFi content, served by
  `platform.metrifi.com` behind your sign-in, the same server as every other tool. No skill
  loads its instructions from anywhere else.
- **Local scripts the `client-report` process asks for.** The process document
  `client-report` loads tells Claude to run audit scripts for its first stage, which assume a
  local shell, Node, and a local Chrome with Lighthouse. Claude runs them only where your
  host allows running commands, under your host's own permission prompts; the plugin ships
  no scripts itself. Where the host can't run them, the skill reports those checks as not
  scored.
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

## Troubleshooting

- **MetriFi tools don't appear, or every tool call fails to authorize.** The connector is
  installed separately from the skills. In Cowork or claude.ai, open the plugin's
  **Connectors** tab and select **Connect**. In Claude Code, run `/mcp`, choose `metrifi`,
  and sign in. Then ask "Who am I on MetriFi?".
- **"Who am I on MetriFi?" shows no team.** Your account isn't on a MetriFi team yet. Ask an
  admin on your institution's team to invite you, or create a team when the sign-in window
  offers it.
- **A tool is refused for permissions.** Your role on the team decides what you can change.
  Ask a team owner or admin for the role you need.
- **A skill is missing or behaves like an older version.** Update the marketplace
  (`/plugin marketplace update metrifi` in Claude Code), then start a new session.
- **A skill says it can't read a web page or check a rendered page.** Your Claude host has
  no browsing for it. The skill reports those items as not scored or as needing your
  check, rather than guessing.
- **Anything else:** email [help@metrifi.com](mailto:help@metrifi.com).

## Privacy, terms, and support

- [Privacy Policy](https://metrifi.com/legal/privacy-policy/)
- [Terms of Service](https://metrifi.com/legal/terms-of-service/)
- [Security policy](https://github.com/metrifi/plugins/blob/main/SECURITY.md)
- Support: [help@metrifi.com](mailto:help@metrifi.com)

## License

Proprietary and source-available; see [LICENSE](LICENSE). The source is public so you can
review what the plugin does before installing it.
