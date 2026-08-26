# Directory submission checklist

Everything that must be true before we submit the MetriFi plugin and MCP server to
the three public directories.

**Every item carries a source tag.** Tags resolve in the [Source registry](#source-registry)
at the bottom. Nothing in this document is asserted without a citation: items marked
`[LOCAL]` were verified against this repo or the live server on the stated date, items
tagged with a doc ID come from official vendor documentation, and items tagged `[C-*]`
come from non-official developer reports and are labelled first-hand or second-hand.
Where a requirement is surprising or expensive, the source's own words are quoted.

There are **three separate submissions**, each with its own gate:

| # | Directory | What is listed | Where to submit | Source |
|---|-----------|----------------|-----------------|--------|
| A | Claude plugin directory (lands in the `claude-community` marketplace, used by Claude Code, Cowork and Desktop) | this GitHub repo | [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit) | [AN-PLUG] [CC-PLUG] |
| B | Claude Connectors Directory (claude.ai + Desktop) | `https://platform.metrifi.com/mcp` | [claude.ai/admin-settings/directory/submissions/new](https://claude.ai/admin-settings/directory/submissions/new) | [AN-SUB] |
| C | OpenAI Plugins Directory (ChatGPT **and** Codex, one listing) | plugin = MCP app + skills | [platform.openai.com/plugins](https://platform.openai.com/plugins) | [OA-SUBP] |

Submissions A and B are genuinely separate systems. [AN-PLUG] states the plugin directory
"is a separate and complementary directory from the Connectors Directory, which is specific
to MCP connectors."

**Submission A cannot put us in `claude-plugins-official`.** Anthropic runs two public
marketplaces and only one of them takes submissions. [CC-PLUG]: "The official marketplace,
`claude-plugins-official`, is curated separately. Anthropic decides which plugins to include
at its discretion. There is no application process, and the submission form does not add
plugins to the official marketplace." Third-party submissions land in `claude-community`
([`anthropics/claude-plugins-community`](https://github.com/anthropics/claude-plugins-community)),
which users add with `/plugin marketplace add anthropics/claude-plugins-community` and install
from as `@claude-community`. An earlier revision of this document had this backwards.

Once we are listed, the day-to-day facts about living in that catalog (sync cadence, SHA
pinning, what to tell a user whose new feature has not arrived) are in
[marketplace-operations.md](marketplace-operations.md).

Status legend: `[ ]` not done · `[x]` verified done · `[!]` verified broken · `[?]` open question

---

## 0. Verified findings

Checked against the live repo and the live server on **2026-07-23**, not assumed. `[LOCAL]`

- `[x]` Policy pages live, HTTP 200: [terms](https://metrifi.com/legal/terms-of-service/),
  [privacy](https://metrifi.com/legal/privacy-policy/), [cookies](https://metrifi.com/legal/cookie-policy/)
- `[x]` `claude plugin validate .` and `claude plugin validate ./plugins/claude/metrifi` both pass
  (Claude Code v2.1.216)
- `[x]` Repo is public (`metrifi/plugins`)
- `[x]` OAuth discovery healthy, verified by direct HTTP probe:
  - `/.well-known/oauth-protected-resource` → 200, also served at the `/mcp` suffix path
  - `/.well-known/oauth-authorization-server` → 200 with `"code_challenge_methods_supported":["S256"]`,
    a `registration_endpoint` (dynamic client registration), and
    `"token_endpoint_auth_methods_supported":["none"]` (public client + PKCE)
  - `POST /oauth/token` with `Content-Type: application/x-www-form-urlencoded` returns
    `{"error":"invalid_client","error_description":"Client authentication failed"}`, a
    structured OAuth error rather than a generic 500
  - These four are the most-cited connector rejection causes in [C-SUN] and [C-DEV]; we already pass them.
- `[x]` **401 handshake correct.** `POST /mcp` unauthenticated returns
  `HTTP/2 401` with `www-authenticate: Bearer realm="mcp",
  resource_metadata="https://platform.metrifi.com/.well-known/oauth-protected-resource/mcp"`.
  [AN-AUTH] requires exactly this: "**Always return a `401` with a `WWW-Authenticate` header**...
  The `401` status is required — Claude does not honor a `WWW-Authenticate` header on a `200`
  response." `[LOCAL]`
- `[x]` **PRM `resource` field matches exactly.** Ours is `https://platform.metrifi.com/mcp`;
  the plugin's `.mcp.json` uses the identical URL. [AN-AUTH]: "The protected resource metadata
  document's `resource` field must match your MCP server URL exactly as the user enters it in
  Claude, including any path component." `[LOCAL]`
- `[x]` **Cloudflare hardened for directory traffic, 2026-07-23.** Two WAF custom rules deployed
  on the `metrifi.com` zone, in this order:
  1. `MCP and OAuth are non-browser` — skips Browser Integrity Check, managed rules, Super Bot
     Fight Mode, Security Level, User Agent Blocking, and Zone Lockdown for
     `/.well-known/*`, `/mcp*`, `/oauth/token`, and `/oauth/register`. Rate limiting deliberately
     left enabled.
  2. `Anthropic directory egress` — skips everything including rate limiting for `160.79.104.0/21`.
  **Why rule 1 is scoped to paths rather than Anthropic's IPs:** Browser Integrity Check is on by
  default and was verified blocking a POST to `/mcp` from `216.60.31.33` (AT&T Enterprises, a
  consumer ISP) with user agent `Python-urllib/3.12`. Claude Code, Codex CLI, and MCP Inspector
  all connect from the **end user's machine** with non-browser HTTP clients, so an IP-scoped rule
  would have protected claude.ai while leaving every CLI user exposed. Verified after deploy:
  the same `Python-urllib` user agent now reaches the application with no `cf-mitigated` header.
  `[LOCAL]` `[AN-AUTH]`
- `[x]` **`/mcp` returns 401 unconditionally.** Fixed in `metrifi-platform` and verified live on
  production 2026-08-05: `POST /mcp` returns `401` with `{"message":"Unauthenticated."}` both with
  and without an `Accept` header, carrying
  `WWW-Authenticate: Bearer realm="mcp", resource_metadata=".../.well-known/oauth-protected-resource/mcp"`.
  `GET /mcp` still redirects browsers (now to `/connect`), which is intended. Previously the
  no-`Accept` case redirected `302` to the login page, which [AN-AUTH] would have failed: "The
  `401` status is required — Claude does not honor a `WWW-Authenticate` header on a `200`
  response." `[LOCAL]` `[AN-AUTH]`
- `[x]` **The server sits behind Cloudflare** (`server: cloudflare` on every response, verified).
  [AN-AUTH] publishes Anthropic's egress range and warns the failure is silent: "Discovery
  requests to the authorization server come from the same IP range as requests to your MCP
  server, so a WAF in front of your identity provider can break the flow even when your MCP
  server is reachable." **Addressed 2026-07-23 by the two WAF rules above.** `[AN-AUTH]` `[LOCAL]`
- `[!]` **We use DCR, and Anthropic recommends against it at directory scale.** Our metadata
  advertises a `registration_endpoint` and `"token_endpoint_auth_methods_supported":["none"]`.
  **Correction 2026-08-05: this is not a one-line change, and doing it as one would cause an
  outage.** The authorization server is Laravel Passport, where `client_id` is a UUID row in
  `oauth_clients`. CIMD makes `client_id` a **URL** that the authorization server must fetch,
  validate, and treat as the registration. Advertising
  `client_id_metadata_document_supported: true` without implementing that would make Claude
  choose CIMD, send a URL as `client_id`, and Passport would reject it as an unknown client,
  breaking sign-in for every user. Real scope: intercept `/oauth/authorize` and `/oauth/token`
  for URL-shaped client ids, fetch and cache the document with SSRF protection, validate
  `redirect_uris` against it, and bridge it into Passport's client lookup. **Half a day to two
  days, not a boolean.** `[LOCAL]`
  **Cheaper alternatives, in order:**
  1. **Do nothing before launch.** DCR is supported out of the box and passes review. The only
     cost is row accumulation.
  2. **Prune unused registered clients on a schedule.** Solves the actual problem (junk rows)
     for a fraction of the effort.
  3. **`oauth_anthropic_creds`** — [AN-AUTH] describes handing Anthropic a `client_id` and
     `client_secret` they hold: "This gives you a stable, registered OAuth client without
     requiring DCR or CIMD on your end, while keeping the user-consent step." Requires emailing
     `mcp-review@anthropic.com`, which [C-RD4] and [C-RD1] both report going unanswered, so treat
     the timeline as unknown.
  4. Full CIMD, as scoped above.
  [AN-AUTH]: "For servers expecting high traffic from the directory, prefer **CIMD or
  `oauth_anthropic_creds` over DCR**. DCR causes Claude to register a new client on every fresh
  connection, which can result in very large numbers of registered clients on your authorization
  server." Switching is cheap for us: [AN-AUTH] says Claude picks CIMD when the metadata
  advertises **both** `"client_id_metadata_document_supported": true` and `"none"` in
  `token_endpoint_auth_methods_supported`. **We already advertise the second; we would only need
  to add the first.** Not a rejection cause, a scaling one. `[AN-AUTH]` `[LOCAL]`
- `[x]` Reviewer demo account populated: team `reviewer-test-account` with the `goldenpeakcu`
  site (brand, 4 rates, 1 scheduled rate change, 4 designed pages), GEO campaign 492 with
  3 prompts and queued responses, CRO funnel 1978 on live GA data (234 → 7 → 1 users),
  comparison funnel 1979, dashboard 1827
- `[x]` **Fixed 2026-07-23:** all four skill descriptions now 921–993 characters, under
  OpenAI's 1,024 limit. Were 1431 / 1273 / 1131 / 995. `[OA-ERR]` `[LOCAL]`
- `[x]` **Fixed 2026-07-23:** `LICENSE` added; Claude `plugin.json` gained `repository`,
  `license`, `keywords`; Codex `plugin.json` gained the required top-level `description`;
  README gained a Legal section and support contact. `[LOCAL]`
- `[!]` **Codex manifest still missing `interface.logo` and `interface.composerIcon`.**
  Both are required and must be square. `[OA-ERR]`
- `[!]` **`interface.shortDescription` is 156 characters; the final-submission limit is 30.** `[OA-ERR]`
- `[!]` **Many MCP tool descriptions instruct the model how to behave**, an explicit
  rejection pattern. See [D.2](#d2-tool-description-rewrite-larger-than-it-looks). `[AN-REV]` `[AN-POL]`
- `[?]` **Does "closed-source is not accepted" bar a proprietary license?** [AN-REV] says
  "**Plugins** must link a public GitHub repo; closed-source is not accepted." Our repo is
  public and fully readable, which is what that sentence appears to mean, but `NOTICE.md`
  and `LICENSE` say the contents are not open source and may not be redistributed. If a
  reviewer reads the rule as a licensing requirement rather than a visibility one, A is
  rejected. Decide: submit and accept one rejection round, or ask `mcp-review@anthropic.com` first.

---

## A. Claude plugin directory

> **`[x]` SUBMITTED 2026-08-05.** Status: "Submitted", pending review. Submitted from the
> Console form at `platform.claude.com/plugins/submit` by an admin of the MetriFi Console
> organization. Repo was at `v1.4.3` (`b7aa19d`).
>
> Exact values submitted, so a resubmission or a dispute can reproduce them:
>
> | Field | Value |
> |-------|-------|
> | Link to plugin | `https://github.com/metrifi/plugins` |
> | Path within repository | `plugins/claude/metrifi` |
> | Plugin homepage | `https://metrifi.com` |
> | Plugin name | `metrifi` (free as of 2026-08-05: 0 matches in a 2,298-entry catalog) |
> | Supported platforms | Claude Code **and** Claude Cowork |
> | License type | `LicenseRef-Proprietary` (blank would have defaulted to Apache 2.0) |
> | Privacy policy URL | `https://metrifi.com/legal/privacy-policy/` |
> | Contact email | `help@metrifi.com` |
>
> Cowork was tested before checking its box: plugin installs, 12 skills load, the connector
> authorizes, and `whoami` returns live account data. That test is what surfaced the
> two-step connector install now documented in
> [marketplace-operations.md](marketplace-operations.md#7-cowork).
>
> **What happens next is in [marketplace-operations.md](marketplace-operations.md), not
> here.** Approval is not listing; the post-listing checks (`git-subdir` source shape, a
> clean-machine install, SHA pin freshness) live there.

Automated screening of the repo. [AN-PLUG]: "Anthropic performs basic automated review on
submissions before adding them to the directory." No functional test of the MCP server, so
**A is not blocked on the tool annotation work**.

### Eligibility
- `[x]` Public GitHub repo. [AN-PLUG]: "The repo must be public—closed-source plugins are not accepted."
- `[ ]` Submitter has the right role. [AN-PLUG]: claude.ai "requires a Team or Enterprise
  organization and directory management access"; Console "requires a Developer, Admin, or
  Owner role on a Console organization." MetriFi has a claude.ai Team org, so either path works. `[LOCAL]`

### Repo and manifest
- `[x]` `.claude-plugin/marketplace.json` valid with `name` / `owner` / `plugins` `[CC-MKT]` `[LOCAL]`
- `[x]` `plugin.json` carries an explicit `version`. [CC-PLUG]: "If set, users only receive
  updates when you bump this field. If omitted and your plugin is distributed via git, the
  commit SHA is used and every commit counts as a new version."
- `[x]` `claude plugin validate` passes. [AN-PLUG]: "Before submitting, run `claude plugin validate`
  to check formatting and structure." [CC-PLUG] adds: "The review pipeline runs the same check
  on every submission, along with automated safety screening." `[LOCAL]`
- `[x]` `license`, `repository`, `keywords` present in `plugin.json` (all in the documented schema) `[CC-REF]` `[LOCAL]`
- `[x]` `LICENSE` file at repo root `[LOCAL]`
- `[x]` Marketplace `name` is not reserved. [CC-MKT] lists the reserved names
  (`claude-code-marketplace`, `claude-plugins-official`, `anthropic-plugins`, etc.) and states
  "Names that impersonate official marketplaces, such as `official-claude-plugins` or
  `anthropic-plugins-v2`, are also blocked." `metrifi` is clear. `[LOCAL]`

### Content quality
- `[x]` README documents install for Claude, Claude Code, and Codex `[LOCAL]`
- `[x]` README links privacy policy, terms, cookie policy, `SECURITY.md`, and a support contact.
  [AN-POL] requires "verified contact information and support channels." `[LOCAL]`
- `[x]` `SECURITY.md` published, satisfying [AN-TERMS]'s vulnerability-reporting requirement,
  which binds plugins as well as connectors. `[LOCAL]`
- `[x]` Skill descriptions say when to use the skill and carry no instructions to call other
  tools and no promotional language `[AN-POL]` `[LOCAL]`
- `[x]` Plugin bundles a coherent job. [AN-PLUG]: "The best plugins bundle related capabilities
  together into a coherent package that solves a specific job function or workflow end-to-end.
  Rather than exposing a single tool, a good plugin combines skills, connectors, slash commands,
  and sub-agents." We ship a connector plus four skills.
- `[ ]` Consider a `SETUP.md`. [AN-PLUG]: "Plugins can include a `SETUP.md` skill to guide Claude
  through configuring and connecting any MCP servers bundled in the plugin."
- `[ ]` Prefer connectors already in the Connectors Directory. [AN-PLUG]: "we strongly encourage
  using connectors that already exist in the Connectors Directory or come from well-known
  developers. This will increase the likelihood of verification and will reduce the number of
  warnings shown to users." **This is an argument for doing submission B before or alongside A.**

### After approval: set expectations low

The official description and the field reports diverge sharply here. Approval is not the same as
being listed, and several developers have been stuck between the two for months.

- The official claim. [CC-PLUG]: "The public catalog syncs nightly from the review pipeline, so
  there can be a delay between approval and your plugin appearing in `marketplace.json`."
  [AN-PLUG]: "updates pushed to your GitHub repo are picked up automatically—CI mirrors changes
  to the public marketplace... You do not need to re-submit the form for updates."
- **The field reality.** Four independent first-hand reports of approved-but-unlisted:
  - [C-GH14] ameya85, 2026-04-27: "My plugin was submitted via platform.claude.com/plugins/submit
    and shows \"Published\" status since April 24, 2026. It does not appear in: This repo's
    marketplace.json / claude.com/plugins". Still open.
  - [C-GH14] aman-immersa, 2026-05-29: "Our plugin was submitted and approved more than 8 weeks
    ago and the PR merged - but still does not show up in https://claude.com/plugins."
  - [C-GH14] chitkwanlin, 2026-06-27, on the nightly claim: "In reality, it seems more like
    weekly?" and later "there have been no syncs since."
  - [C-GH605] nicodiansk, 2026-06-30: "The catalog total has been flat at 2202 entries for the
    past several days even though the repo keeps receiving `bump(...)` commits — consistent with
    new-plugin additions being paused".
- **The catalog is over the documented client limit.** [C-GH1058] ettoreperri, 2026-07-14:
  "anthropics/claude-plugins-community: marketplace.json lists 2248 plugins (max 2000)". I
  fetched the live catalog on 2026-07-23 and counted **2307 entries**, so it has kept growing
  past the reported cap. `[LOCAL]`
- `[!]` **Our plugin lives in a subdirectory, and the source type the pipeline picks matters.**
  Our `marketplace.json` declares `"source": "./plugins/claude/metrifi"`. In the live catalog,
  subdirectory plugins are represented as `git-subdir` (405 entries) and repo-root plugins as
  `url` (1898). Five entries carry the broken `url` + `path` shape. [C-GH1185] Eigenwise,
  2026-07-17, reports what that costs: his plugin "installs with zero agents/skills: source uses
  `url` type with a `path` field" and, critically, "Submission through the form does NOT fix
  this". He also found the repo will not take a community fix: "I opened #4200 with this exact
  change, but it was auto-closed since the repo only accepts PRs from Anthropic team members."
  **Action: after we appear in the catalog, confirm our entry is `git-subdir` with
  `path: plugins/claude/metrifi`. If it is `url` + `path`, the plugin installs empty and we must
  open an issue rather than a PR.** `[LOCAL]` `[C-GH1185]`
- **Listing can exist while install fails.** [C-GH40] ayn-builds, 2026-05-26: "My plugin is live
  here: https://claude.com/plugins/migration-to-aws but when I try installing it I see the
  following error: `The plugin installation failed — \"migration-to-aws\" wasn't found in the
  claude-plugins-official marketplace.`" Still open. **Test the install yourself after listing.**
- **Pinned SHAs can go stale ("bump starvation").** [CC-PLUG] says "CI bumps the pin automatically
  as you push new commits". [C-GH995] ryanjmichie-git, 2026-07-12, found a limit: "bump.sh
  iterates entries in file order and stops at max-bumps (default 30) ... daily churn among early
  entries exhausts the cap before discovery reaches later ones (forgeproof is at index 836 of
  2248). This affects every entry in the latter part of the file, not just ours." [C-GH1588]
  talkstream, 2026-07-30, on the consequence: "Users installing `ru-text@claude-community` today
  get a build from before the plugin's AI-text-cleanup rules existed — which is the capability
  the listing description advertises." **Action: after listing, periodically verify the pinned
  `sha` in the catalog matches our latest release.**
- **The README's submission link was dead.** [C-GH22] dspv, 2026-05-05: the URL "resolves to a
  **non-existent domain** (`DNS_PROBE_FINISHED_NXDOMAIN`)". Use `platform.claude.com/plugins/submit`.

---

## B. Claude Connectors Directory

The submission that functionally tests every tool. Highest bar, and the highest value for us
because our buyers are in claude.ai rather than the CLI.

### Access
- `[x]` claude.ai Team org exists `[LOCAL]`. This is the gate that stops most solo developers:
  [C-RD4] (first-hand, 2026-07-24): "I'm on Pro with no organization, so there's no Organization
  settings for me to open." [C-RD1] (first-hand, approved) on the cost: "the submission portal is
  only available to Team/Enterprise orgs — for a solo dev that means a minimum of 2 seats,
  ~€52/month." **We already clear this.**
- `[ ]` Submitting user has directory-management access. [AN-SUB]: "By default, only organization
  Owners and Primary owners can submit and manage directory listings... Team plans don't have
  custom roles, so on Team this stays with Owners."
- `[?]` **Unknown whether a published listing survives the Team plan lapsing.** [C-RD1]
  (first-hand): "that exact question was #1 in my pre-submission email to the review team — whether
  a published listing survives the plan lapsing — and it's the one question that never got an
  answer (the ticket is still open). So: officially unknown". Not a blocker for us, but budget for
  keeping the Team seat indefinitely.

### The portal live-checks your server before it lets you submit

This is the most useful single fact about submission B, and it is not in the docs. [C-RD1]
(first-hand, approved 2026-07-30) describes the current portal: "It connects to your server live:
counts tools/resources and checks auth support before it even lets you submit." And specifically
on annotations: "Missing annotations.title on tools gets flagged immediately. I added titles and
redeployed mid-submission — the re-check passed. The automated checks seem to care most about
read-only hints and honest descriptions."

[AN-SUB] corroborates the mechanism: tools "sync automatically from the connected server... If
any tools are flagged for missing titles or annotations, fix them on your server before
submitting."

**Consequence for our plan: the annotation work (D.1) is not a review risk, it is a hard gate on
even opening the submission.** But it also means we get a free pre-flight: we can start a draft
submission, let the portal tell us which tools it flags, fix, and re-check, without burning a
review cycle.

### Tool design
Reported as the single largest rejection cause by a developer who went through the process.
[C-DEV] (first-hand) calls tool annotations "the #1 reason for rejection." Note that [C-DEV] also
states "Missing annotations reportedly cause around 30% of all directory rejections" with no
source given; **do not repeat that number, it is unsourced.**

- `[ ]` Every tool has a `title` `[AN-SUB]` `[AN-REV]` `[AN-POL]`
- `[ ]` Every read-only tool has `readOnlyHint: true` `[AN-REV]`
- `[ ]` Every mutating tool has an explicit `destructiveHint` `[AN-REV]`
- `[ ]` Every tool has an explicit `openWorldHint` (not required by Anthropic, required by
  OpenAI, so set it once) `[OA-ERR]`
- `[ ]` No tool name exceeds 64 characters. [AN-REV]: "Tool names must be 64 characters or fewer."
- `[ ]` No catch-all tool mixes read and write. [AN-REV]: "A single tool that accepts both safe
  HTTP methods (GET, HEAD, OPTIONS) and unsafe methods (POST, PUT, PATCH, DELETE) is rejected.
  Do not ship a catch-all `api_request` tool with a `method` parameter." It adds that documenting
  the difference in prose does not help: "Documenting safe versus unsafe operations within one
  tool's description does not satisfy this requirement—the operations must be in separate tools."
- `[ ]` Any tool taking freeform endpoints/queries names or links the target API. [AN-REV]:
  "its description must include a link to or explicit name of the target API."
- `[ ]` Descriptions are narrow and accurate. [AN-REV]: "Each tool description should state
  precisely what the tool does and when to invoke it. The description must match the tool's
  actual behavior."
- `[ ]` No description matches a prompt-injection pattern. [AN-REV] rejects descriptions that
  "Instruct Claude to call external software or tools the user didn't request", "Interfere with
  Claude calling other tools", "Direct Claude to pull behavioral instructions from external
  sources", "Contain hidden, obfuscated, or encoded instructions", or "Tell Claude to behave in
  ways unrelated to the tool's function, attempt to override system instructions, or promote
  products and services." Its summary line: "Describe what the tool does. Do not tell Claude
  how to behave." **See [D.2] — we currently violate this.**

### Functional quality
- `[ ]` Every tool returns success for valid parameters. [AN-REV]: "Every tool must return a
  successful response when called with valid parameters. Generic errors ('Internal Server Error',
  'Bad Request' with no detail) fail review."
- `[ ]` Invalid input returns an actionable message. [AN-REV]: "Validate inputs and return
  actionable error messages rather than silently accepting invalid data."
- `[ ]` Responses are scoped and paginated. [AN-REV]: "Keep responses reasonably sized for the
  task. Do not return a full database dump when a summary was requested." [C-SUN] (second-hand)
  lists "Returns huge unfiltered payloads instead of scoped, paginated results" as a rejection point.
- `[ ]` Token usage is proportional. [AN-POL] requires tokens "roughly commensurate with the
  complexity or impact of the task."
- `[ ]` No tool touches Claude's own context. [AN-REV]: "Do not query Claude's memory, chat
  history, conversation summaries, or user files." [AN-POL] repeats this.
- `[ ]` No conversation data collected beyond function. [AN-REV]: "Do not collect conversation
  data beyond what the tool needs for its function."

### Authentication
- `[x]` OAuth 2.0. [AN-SUB]: "Use OAuth 2.0 for authenticated services." [AN-POL]: "secure OAuth
  2.0 with certificates from recognized authorities." `[LOCAL]`
- `[x]` PKCE S256 `[LOCAL]`; [C-DEV] (first-hand): "PKCE with `S256` is mandatory"
- `[x]` Protected Resource Metadata served `[LOCAL]`; [C-DEV] (first-hand) reports adding
  `/.well-known/oauth-protected-resource` *after* submitting and notes "Missing the metadata
  endpoint prevents OAuth discovery and breaks authentication entirely."
- `[x]` Dynamic client registration available `[LOCAL]`. [AN-SUB] lists the accepted modes:
  "OAuth (with dynamic client registration, client ID metadata documents, or a static client ID
  held by Anthropic)."
- `[x]` Token endpoint accepts form-encoded bodies `[LOCAL]`. [C-SUN] (second-hand) lists
  "Token endpoints rejecting `application/x-www-form-urlencoded` in favor of JSON-only" as a
  rejection cause.
- `[ ]` `https://claude.ai/api/mcp/auth_callback` registered as a redirect URI. **Now confirmed
  official** — [AN-AUTH]: "For the hosted Claude surfaces (Claude.ai web, Desktop, mobile, and
  Cowork), register the following redirect URI: `https://claude.ai/api/mcp/auth_callback`".
  Independently reported by [C-DEV] (first-hand).
- `[ ]` Claude Code loopback redirects accepted **port-agnostically**. [AN-AUTH]: "Claude Code
  declares `http://localhost/callback` and `http://127.0.0.1/callback` in its Client ID Metadata
  Document, so your authorization server must accept both with the port component ignored."
- `[x]` No credentials in URL query parameters. [AN-AUTH]: tokens in the connector URL "are
  **not recommended**... The MCP authorization specification explicitly prohibits access tokens
  in the URI query string." We use OAuth. `[LOCAL]`
- `[!]` **WAF/CDN must not block or rate-limit `160.79.104.0/21`.** [AN-AUTH]: "Anthropic's
  outbound traffic to your server originates from `160.79.104.0/21`." We are behind Cloudflare,
  so this is a live risk, not a hypothetical. Two independent first-hand reports show both
  failure modes:
  - **Rate limiting**, measured on a connector that was already listed. [C-GH709] ctr00-BU,
    2026-07-26: "| Anthropic egress | **HTTP 429**, 3 of 3 attempts across ~13 minutes | / | My
    residential browser | **HTTP 200**, valid RFC 8414 metadata |", reasoning that "Since every
    Claude.ai user's connect attempt leaves from `160.79.104.0/21`, a shared anonymous bucket on
    that host is at least plausible." [C-RD1] (first-hand, approved) says the same from the other
    side: "All claude.ai clients come from a shared pool of Anthropic egress IPs: an aggressive
    per-IP rate limit will throttle real users."
  - **Silent drop.** [C-GH623] gunter1020, 2026-07-15, with request logging at sample rate 1.0
    across seven days: "**Zero requests from Anthropic's published outbound range
    `160.79.104.0/21`**" despite Anthropic's proxy reporting 502.
  **Done 2026-07-23.** Two WAF custom rules deployed; see the Cloudflare entry in
  [section 0](#0-verified-findings) for the exact expressions and why rule 1 is scoped to paths
  rather than to Anthropic's IP range. A shared-IP rate limit looks fine in single-machine testing
  and throttles every real user, which is why rule 2 exempts the range from rate limiting
  specifically. `[LOCAL]`
- `[ ]` **Do not stage or submit from a tunnel hostname.** [C-GH699] daltonch, 2026-07-25, and
  [C-GH700] FabSchn0815, same date, both report failures on `ts.net` and `trycloudflare.com`
  hosts, with the hypothesis that it is "a policy applied to tunnel-provider hostnames (`ts.net`
  and `trycloudflare.com` are Public Suffix List entries". Unconfirmed, but cheap to avoid.
- `[?]` **Check the authorize endpoint returns 302, not 307.** [C-GH250] peachbluetech, 2026-05-01,
  with a confirmed fix: "`claude.ai` web's custom-connector OAuth handshake silently fails with
  the generic `\"Method Not Allowed\"` error toast when the server's authorization response uses
  HTTP **307 Temporary Redirect** instead of **302 Found**", and "MCP Inspector, Claude Desktop,
  Cursor, and Anthropic API `mcp_connector` all accept 307 fine — only claude.ai's web custom
  connector validates the status code." **This is a Next.js default and a plausible Laravel
  `redirect()` outcome.** I could not verify ours: `/oauth/authorize` returns 401 without a
  session. Test with a logged-in session before submitting. `[LOCAL]`
- `[ ]` Endpoint latency inside Anthropic's budget. [AN-AUTH]: "Claude waits up to **10 seconds**
  for a response from your OAuth discovery, registration, and token endpoints, and up to **30
  seconds** for refresh token requests." Also: "check that any reverse proxy, API gateway, or WAF
  in front of the endpoint isn't holding the response."
- `[ ]` Token refresh behaves. [AN-AUTH]: "Return RFC 6749-compliant error codes (`invalid_grant`,
  not `invalid_request` or a custom code) when a refresh token is no longer valid" and "Rotate
  refresh tokens for public-client connections... If you rotate, return the new refresh token in
  the same response that invalidates the old one."
- `[ ]` `/register` parses JSON while `/token` parses form-encoded. [AN-AUTH]: "Dynamic client
  registration (`/register`) uses `application/json` per RFC 7591 section 3.1, so don't assume the
  same parser works for both." We verified `/token` accepts form-encoded; `/register` is untested. `[LOCAL]`
- `[x]` No machine-to-machine grant. [AN-AUTH]: "A pure machine-to-machine `client_credentials`
  grant—where a server-to-server token is issued with no user in the loop—is **not supported**.
  Every connection requires user consent." Our flow is user-consented. `[LOCAL]`
- `[ ]` Streamable HTTP transport. [AN-POL]: "Should support Streamable HTTP transport."
  [AN-SUB] accepts "streamable HTTP or SSE."
- `[x]` **No domain-ownership proof needed here.** [AN-DIR]: "No domain-ownership proof (DNS or
  `.well-known`) is required—that requirement applies only to the open MCP Registry, not the
  Anthropic Directory." Contrast with OpenAI, which does require it. See [G](#g-cross-vendor-contradictions).

### API ownership
- `[x]` Server calls MetriFi's own API and the domain matches. [AN-REV]: "Your server must call
  your own first-party APIs, or APIs you legitimately proxy. The MCP server domain should match
  your service." `[LOCAL]`
- `[ ]` Confirm the Google Analytics data we surface is legitimately proxied under its ToS `[AN-REV]`

### Not accepted
- `[x]` We do not transfer money or generate AI media. [AN-REV] excludes connectors that
  "Transfer money, cryptocurrency, or other financial assets" or "Generate images, video, or
  audio via AI models (design tools that produce diagrams, charts, or UI mockups are allowed)."
  Note the parenthetical: our design work is explicitly in the allowed category.
- `[x]` No advertising. [AN-POL] prohibits "Advertisement serving, sponsored content, or
  promotional vehicles."

### Submission materials
- `[ ]` Public documentation URL live by publish date. [AN-REV]: "**Public documentation** is
  required by your publish date—a blog post or help-center article is sufficient. You can share
  docs privately with Anthropic during review." [C-SUN] (second-hand) sets the bar as
  "Reviewers should test within 10 minutes."
- `[ ]` **Three working example prompts.** [AN-POL] requires developers "provide three working
  prompt examples demonstrating core features." [C-DEV] (first-hand) independently advises "At
  least 3 example prompts exercising different tools" plus "Expected output samples."
- `[ ]` Privacy policy URL. [AN-SUB] warns: "Missing or incomplete privacy policies result in
  immediate rejection." Content must cover "Data collection practices / Usage and storage /
  Third-party sharing / Data retention / Contact information." `[LOCAL: policies exist]`
- `[ ]` Support contact `[AN-SUB]` `[AN-POL]`
- `[ ]` Icon `[AN-SUB]`
- `[ ]` Listing copy within limits. [AN-SUB]: "server name (100 characters max), tagline (55
  characters max), description (2,000 characters max), one to five categories, documentation
  URL, privacy policy URL, support contact, icon, and the URL slug for your listing page."
- `[ ]` Slug chosen carefully. [AN-SUB]: "The slug is permanent once published."
- `[ ]` Test credentials, fully populated. [AN-REV]: "**Test credentials** are required and must
  be a fully populated account." [C-DEV] (first-hand) names an empty test account as one of his
  own pre-submission mistakes: reviewers "couldn't verify tool functionality."
  `[LOCAL: reviewer-test-account done]`
- `[ ]` Every tool exercised by us first. [AN-REV]: "For MCP servers, exercise every tool through
  the MCP Inspector and as a custom connector in Claude." [AN-SUB] makes this an attestation in
  the portal: "You also confirm you've run every tool yourself, either via MCP Inspector or as a
  custom connector in Claude."
- `[ ]` Allowed link URIs declared if any tool uses `ui/open-link`. [AN-SUB]: "Every origin and
  scheme you list **must be owned by you** (the submitting organization)... Entries you don't own
  will be removed during review." Confirm whether our magic-link return path uses `ui/open-link`.
- `[ ]` Seven compliance attestations. [AN-SUB]: "Seven policy acknowledgments covering the
  directory guidelines, first-party API usage, financial transactions, AI media generation,
  prompt injection, conversation data collection, and public documentation. All seven are required."
- `[ ]` Screenshots **only if** we submit as an MCP App. [AN-SUB] specs: PNG, ≥1000px wide, 3–5
  images, "**do not include the prompt** in the image", paired prompt text supplied separately,
  "Video/GIF: not accepted."

### Legal obligations you accept by submitting
From [AN-TERMS], which binds plugins as well as connectors: "By submitting your MCP server, Skill
folder, plugin, app, or other software... for inclusion in any Anthropic directory".

- `[x]` **Security vulnerability reporting channel published 2026-07-23.** [AN-TERMS]: "You
  further agree to implement and maintain a mechanism for receiving reports of security
  vulnerabilities from Anthropic and from third parties and to investigate such reports with a
  reasonable standard of care." `SECURITY.md` at the repo root covers reporting address, scope
  and out-of-scope, testing rules, safe harbor, a 90-day disclosure window, and acknowledgement
  within 3 business days. Linked from the README. Reports go to `help@metrifi.com`, the address
  published in the Termly-hosted Terms of Service. **This requirement binds plugins, not just
  connectors**, so it applies to submission A as well. `[LOCAL]`
- `[ ]` Listing metadata kept current. [AN-TERMS] warrants "any information you give us will be
  accurate and up-to-date." Stale listing copy is a terms violation, not just untidy.
- `[ ]` Privacy policy covers third parties too. [AN-TERMS]: "provide all applicable third-party
  privacy policies, and ensure all such policies clearly and accurately describe to users what
  user information you and third parties collect". We surface Google Analytics data; confirm the
  privacy policy covers that.
- `[x]` We grant Anthropic a branding licence. [AN-TERMS]: "grant Anthropic non-exclusive,
  royalty-free, worldwide licenses to reproduce, display, and distribute any descriptions of the
  Software and Software documentation provided by you... and to display your name, trademarks,
  logos, and other branding materials". Informational, no action.
- `[ ]` No implied partnership. [AN-TERMS]: "You will not make any statement regarding the
  Anthropic Services which suggests partnership with, sponsorship by, or endorsement by Anthropic
  without Anthropic's prior written approval". Check marketing copy before launch.
- Listing is revocable. [AN-TERMS]: "Anthropic has no obligation to include your Software in any
  Directory and may remove or refuse to display any Software... at any time for any reason...
  without liability to you."

### After publishing
- **Tool changes need no resubmission.** [AN-AFTER]: "To add, change, or remove tools, deploy the
  change to your server—no resubmission to Anthropic is required, and there is no scheduled
  re-review. Claude picks up the new tool surface on the next connection." **This is the opposite
  of OpenAI's rule — see [G](#g-cross-vendor-contradictions).**
- `[!]` **But existing users do not see new tools until they refresh.** [C-RD1] (first-hand):
  "claude.ai caches the tool SET at connect time. A new tool, a changed schema, or updated widget
  HTML won't reach existing users until they manually hit \"Refresh tools list\" in the connector
  settings. Only descriptions and response contents update live. Conclusion: finalize your
  toolset BEFORE distribution." Not in the docs, and it sits directly against [AN-AFTER]'s
  "Claude picks up the new tool surface on the next connection." **Treat the tool set as
  effectively frozen at launch for existing connections.**
- **Approval appears to change client-side permission defaults.** [C-RD1] (first-hand, checked
  after being challenged): "connecting the approved connector fresh from the directory, all tools
  defaulted to \"always allow\" — zero permission prompts, and the permissions UI groups tools by
  their read-only/interactive annotations. Custom connectors default to ask-mode instead." Single
  source, but if true it is a real user-experience argument for listing. Note the counter from
  [MCP-SPEC]: annotations are hints and "Clients should never make tool use decisions based on
  ToolAnnotations received from untrusted servers" — directory listing is plausibly what makes a
  server trusted.
- **Expect ongoing automated probing.** [C-RD1] (first-hand): "Since submission, Anthropic egress
  IPs hit my server daily with initialize + tools/list - every day, short sessions, zero tool
  calls. That looks a lot like ongoing automated monitoring". Budget for it; do not alert on it.
- Listing metadata is editable without review; the display name is not. [AN-MANAGE]: "**Display
  name**: editable, but changing the name of a published server affects existing users and
  requires re-review."
- Watch the disconnect rate. [AN-MANAGE] grades listings "**Healthy** | The 30-day disconnect
  rate is at or below 5%" and "**Degraded** | The 30-day disconnect rate is above 5%".
- Permanent URL: `https://claude.ai/directory/connectors/SLUG` `[AN-AFTER]`
- Delisting: email `mcp-review@anthropic.com` `[AN-AFTER]`

### Portal bugs worth knowing before you hit an error
- **"Slug already exists" is misleading; the real conflict is the display name.** [C-GH600]
  hjhlarsen, 2026-07, hit "A submission with this slug already exists. Pick a different slug on
  the Listing step" and found changing the slug did nothing. wchest posted the fix: "The API error
  response indicated \"A server with that name already exists.\" So, I added a space after the
  submission name and it submitted." Independently confirmed in the same thread: "adding a space
  to the name solved the issue." **If we hit this, change the name, not the slug.**
- **The URL validator rejects some valid HTTPS URLs.** [C-GH368] masbouj, 2026-05-27, with eight
  "same problem" confirmations through 2026-06-13: the field rejected
  `https://prod.metabase.eu-west-3.xxxx.xxxx/api/mcp`. Affects deep subdomains and newer TLDs.
  `platform.metrifi.com/mcp` is a simple shape, so we are probably fine.

### Review and labelling
- Timeline is not published. [AN-SUB]: "Review times vary with queue volume. The submission
  portal is always open."
- **Timelines split hard around the June 2026 cutover** from a Google Form to the in-app portal.
  Weight the portal-era account most.
  - **Portal era, the one complete account:** [C-RD1] (first-hand): "Timeline: submitted July 10
    via the admin portal, approved July 30 as a Community connector — 20 days, zero pings from my
    side. There's no published SLA."
  - **Form era, and it went badly.** [C-BLOG] Josh Symonds, 2026-07-31, submitted 2026-03-22:
    "After more than four months, multiple customer-support requests, and two explicit assurances
    that my application was waiting in Anthropic's review process, the company informed me through
    an automated email that the process had failed, the old queue was being discarded, and I
    should begin again." For contrast he notes "OpenAI approved it on April 28: 29 days from
    submission to acceptance."
  - Corroborating form-era silence: [C-RD3] (submitted 2026-05-21, no response after 7 weeks),
    [C-RD5] ("heard literally nothing for like 5 months"), [C-GH723] (6 weeks, form plus email,
    nothing), [C-DEV] ("about a month", told that is "within the normal range").
- `[?]` **The escalation address may not answer.** [AN-SUB] names `mcp-review@anthropic.com`.
  [C-RD4] (first-hand, 2026-07-24): "Emailed mcp-review@anthropic.com on 8 July, followed up on
  the 19th, no answer yet." [C-RD1], who was approved, says his own pre-submission question to
  the review team "never got an answer (the ticket is still open)." **Plan as though there is no
  responsive escalation path.**
- `[?]` **Status tracking may not work as documented.** [AN-SUB]: "track your submission's status
  and read reviewer feedback in the submissions dashboard." [C-RD2] (first-hand, form era): "I
  haven't found a way to check status, it's basically just waiting." The dashboard is new, and
  [C-RD1] using the portal did not report a problem, so this may be resolved.
- Ranking is usage-based. [AN-DIR]: "Ranking is usage-based, similar to other app stores."
- **Publishing to the open MCP Registry does nothing for this directory.** [AN-VSCUSTOM]: "The
  Anthropic Directory is independent of the open MCP Registry and the
  `modelcontextprotocol/servers` GitHub repository. Publishing to those does **not** surface your
  server in Claude." Worth knowing so nobody burns a week on it.
- Escalation to Verified is automatic and not applied for. [AN-REV]: "Anthropic may then escalate
  listings flagged as highly useful to Claude users to verified review... This escalation is
  assessed automatically, and you do not need to take any action."
- Escalations contact: `mcp-review@anthropic.com` `[AN-SUB]`

---

## C. OpenAI Plugins Directory

> **`[x]` SUBMITTED 2026-08-26.** Status: "MetriFi submitted for review. We'll notify you when a
> decision is made." Draft `asdk_app_6a8e607211fc8191b04a36d63dad17cb`, version
> `asdk_app_v_6a8e6072929481919c7be62e0ca9a266`, project `MetriFi` (global), developer identity
> `MetriFi`. Plugin at **v1.4.13**; platform at `main` after #229, #230, #231.
>
> Final pre-submission review ran as a seven-gate ledger (four runnable checks against the live
> server, listing URLs, manifest limits and skill descriptions, with a negative control; three
> manual gates evidenced by a Playwright dump of the draft, Ryan's unattached negative-prompt runs,
> and the identity/residency facts). 7 met, 0 abandoned.
>
> What review will find that we know about: `get-site` and `get-preview-url` are annotated as
> writes (they assign a Vercel draft domain), so ChatGPT asks for confirmation before calling them;
> `manage-review-item` bundles `assign` and `delete` behind one `action` enum. Both are noted as
> follow-ups in platform #229 and #231. If rejected for the developer name, switch
> `interface.developerName` and the form's Plugin Author to `BloomCU LLC`, bump the version, and
> resubmit; a resubmission always needs a higher version.
>
> Post-approval: the MCP server origin is locked to `https://platform.metrifi.com/mcp`; skills
> ship to Codex users only when the version bumps; ChatGPT pulls the published bundle.


One submission, listed in both ChatGPT and Codex. [OA-SUBP]: approved plugins appear in the
"Plugins Directory available in both ChatGPT and Codex." [OA-APP] confirms the merge: "Apps are
now submitted and published as plugins." Most mechanically strict of the three, and the error
catalogue is public, which makes this the easiest one to pre-validate.

### `[!]` Measure the tool-surface token budget before anything else

**This may be a hard blocker, and it is undocumented.** [C-OA-SCAN] isaac-b reports hitting
`Tool scan failed: Internal service error` and, after roughly two months, getting these limits
from OpenAI support (2026-05-01):

> "Each individual tool definition must be under 5,000 tokens. This includes the tool name,
> description, and input schema. All tools combined (including name, description, and input
> schema) must be less than 16000 tokens."

His own empirical finding differs from what support told him: "Our full MCP is ~54k tokens,
resulting in the 500 error. We truncated the tool/list, and found that the tool scan worked when
the MCP definition was below ~32k tokens." So the real enforced ceiling is somewhere between 16k
and 32k tokens. **Neither number appears in any documentation I could fetch.** Treat as
credible-but-unverified, and measure before doing any other OpenAI work.

**Measured 2026-07-23** against `metrifi/metrifi-platform` at `app/**/Mcp/Tools/*.php`: `[LOCAL]`

| Metric | Value |
|---|---|
| Tools | 156 |
| Name characters | 2,478 |
| Description characters | 47,033 |
| Schema source characters | 71,811 |
| Combined | 121,322 chars ≈ **30,330 tokens** |
| Largest single tool | `set-experiment-case-study`, ~1,027 tokens |
| Tools over the 5,000-token per-tool limit | **0** |

**Verdict: borderline, not obviously fatal.** We are roughly 14k over the support-stated 16k
total, but just under the ~32k threshold [C-OA-SCAN] found empirically. The per-tool limit is not
close to being a problem. An earlier estimate in this document put us at 30k–60k and called it
likely fatal; the measurement says the low end of that range, so treat this as a real risk to
manage rather than a wall.

Two caveats on the number: the schema figure counts PHP builder source, not the emitted JSON
Schema, which will differ in both directions; and chars÷4 is a rough token ratio. A precise
figure needs an authenticated `tools/list` counted with a real tokenizer.

- `[x]` **Confirm with a real tokenizer** against an authenticated `tools/list` before betting on it.
  Done 2026-08-25 in [metrifi-platform#229](https://github.com/metrifi/metrifi-platform/pull/229),
  tiktoken `o200k_base` over the real HTTP `tools/list`: **37,950 tokens before, 30,192 after**
  the description cut. Largest single tool 1,157 → 939 (`push-deliverable-revision`). `[LOCAL]`
- `[!]` **16,000 is not reachable without cutting input schemas.** With every description deleted,
  schema structure, names, titles and the three mandatory annotation keys still cost ~16,400
  tokens (schema structure alone 9,063). 30,192 sits under the ~32,000 cutoff [C-OA-SCAN] measured
  empirically, and above the 16,000 support quoted. If the scanner fails, the only lever left is
  the manifest and review-spec input schemas (a `ref` upload path already exists for the
  manifest). Arithmetic in the PR body and `docs/mcp-authoring.md` in the platform repo. `[LOCAL]`
- `[ ]` Bring the surface down. In order of preference:
  1. **Cut description length.** Descriptions are 47k of the 121k characters, and the [D.2]
     rewrite removes behavioral instructions from them anyway. A 50% description cut lands the
     total near 16k. **These two tasks should be done as one pass.**
  2. Split the MCP surface, submitting a narrower product-scoped server to OpenAI than the full
     platform server we give Anthropic.
  3. Collapse near-duplicate tools.
- Corroborating symptom to watch for: [C-OA-FORM] ShoaibYounus, 2026-06-08, with 236 tools, could
  not submit at all: "The form confirms 'Imported 236 tool justifications. Skipped 0. Missing 0.
  Mismatched 0' and every visible field is populated, but Submit for Review fires the generic
  'This is a required field' toast with no field-level indication." He notes "our MCP server
  exposes 236 tools (large surface compared to most submissions)." We are in the same size class.

### Prerequisites
- `[x]` Verified identity. **Business verification completed 2026-08-25 under the name
  `MetriFi`.** Expect a lag of a few days before submission accepts it [C-OA-VERIF].
  [OA-REV]: "Before submitting a plugin with MCP, complete identity
  verification in the OpenAI Platform Dashboard for the name you plan to publish under in the
  directory... This is enforced during review. Publishing under an unverified individual or
  business name will result in rejection."
  **Exact path**, from [OA-SUB]: sign in to `platform.openai.com`, select the publishing
  organization, open
  [organization settings](https://platform.openai.com/settings/organization/general), complete
  **business verification** (not individual, since we publish under a company name), then
  "Return to the plugin submission form and select the verified identity in the **Developer
  Identity** field."
- `[ ]` `api.apps.write` permission. [OA-REV]: "To create plugin drafts with MCP and submit them
  for review, you need the `api.apps.write` permission."
- `[!]` **Developer name must match the verified legal name character for character**, and the
  verification state lags. Rejection wording, [C-OA-REJ1]: "The developer name you entered does
  not match your verified individual or business name." OpenAI Support's rule, [C-OA-REJ4]: "Even
  small differences like abbreviations or branding vs legal name can trigger that rejection." Two
  further traps:
  - The verified name may not be visible to you. [C-OA-REJ4] ManuelDario: "I tried to find it, but
    there's no option to see my verified name."
  - **"Verified" appears days before submission actually works.** [C-OA-VERIF] techsign, after
    being blocked: "After a few days, it worked. I think the settings section marks as 'confirmed'
    a few days too early. The actual confirmation seems to take a few days." Corroborated by
    EdgarM the same week. **Do the verification early and expect to wait, do not schedule it as
    the last step.**
- `[x]` Give the organization and project real names, not "Default". Project is `MetriFi`
  as of 2026-08-25. `[LOCAL]` Buried in the workaround that
  cleared a multi-week scanner outage, [C-OA-SCANFIX] Walo_Fenton: "Went to
  /settings/organization/general and gave a name to my Organization (had Default)".
- `[x]` **Check the OpenAI project's data residency.** Done 2026-08-25: created a dedicated
  project named `MetriFi`, region **global**. Publish from this project, not from a
  Paraloom project. `[LOCAL]` [OA-REV]: "For now, projects with EU data
  residency cannot submit plugins with MCP servers for review. Use a project with global data
  residency." **Verify before doing any other OpenAI work; this is a hard block.**
  **Where to look:** `https://platform.openai.com/settings/organization/projects`, open the
  project you will publish from, then **General**. Residency is per-project, chosen from a
  region dropdown **at project creation only**, and is gated behind approved advanced data
  controls, so a project nobody deliberately regionalised is global. [OA-RESID] It cannot be
  changed afterwards: "existing Projects cannot be updated to have European data residency
  after creation." If a project is regionalised, the only fix is publishing from a new one.
- `[ ]` Server is publicly reachable. [OA-REV]: "Your MCP server is hosted on a publicly
  accessible domain" and "You are not using a local or testing endpoint."
- `[ ]` Only one version in flight. [OA-REV]: "For each MCP server integration, only one version
  may be published at a time and only one version may be in review at a time."

### Domain verification
- `[x]` Host the challenge token at `https://platform.metrifi.com/.well-known/openai-apps-challenge`
  — [metrifi-platform#230](https://github.com/metrifi/metrifi-platform/pull/230), token in
  `config/services.php` (public by design). Same PR corrects eight tool annotations the
  justification pass found understated; the 483 justifications themselves are in
  [openai-tool-justifications.md](openai-tool-justifications.md) and get filled into the form by
  Playwright once the corrected annotations are deployed and rescanned. `[LOCAL]`
  `[OA-SUB]` `[OA-ERR: domain_verification_required]`
- `[ ]` Return **only** the token. [OA-SUB]: "The challenge endpoint must return only that
  plugin's verification token—do not return JSON, a list of tokens, or multiple tokens from the
  same URL."
- `[x]` **It must be at the domain ROOT, and this will never change.** Our MCP server is at
  `platform.metrifi.com/mcp`, so the challenge goes at the root of that host, not under `/mcp`.
  [C-OA-SUBPATH] NatKSS documented the behavior: "The verifier always strips the path and checks
  the root domain, regardless of the MCP URL or challenge base URL configured in the submission
  form." OpenAI confirmed it is deliberate (casey-chow, OpenAI, 2026-04-15): "we don't support
  non-root .well-known locations when performing domain verification. This is not something we
  plan on supporting, given that doing so would run against RFC-8615". **We control the root of
  `platform.metrifi.com`, so we are fine. Worth knowing that a subpath-only deployment could
  never be listed.** `[LOCAL]`
- `[!]` **Do not put mTLS or a WAF rule in front of the challenge endpoint.** [C-OA-MTLS] E_D,
  2026-07-16: "the mTLS that we configured in our domain, using OpenAI's root and intermediate
  certificates, rejects the domain verification request made to
  '/.well-known/openai-apps-challenge'. When we removed the mTLS it worked fine". Also
  [C-OA-DV] DevidMxm, 2026-05-05, whose challenge was correct but the verifier stopped sending
  requests entirely. **The verifier's user agent is `OpenAI-Domain-Verification`, so allowlist it
  in Cloudflare** alongside Anthropic's egress range.

### Authentication
- `[x]` **Draft exists, MCP scanned, domain verified, 483 justifications filled.** 2026-08-25/26:
  OpenAI draft `asdk_app_6a8e607211fc8191b04a36d63dad17cb`, project `MetriFi`. Tool scan passed on
  the 30,192-token surface. Domain verified against the live challenge route. All 161 × 3
  justifications filled by Playwright from `openai-tool-justifications.md` and confirmed to persist
  after reload. **Open:** the eight annotation corrections did not make the #230 squash; they are
  [metrifi-platform#231](https://github.com/metrifi/metrifi-platform/pull/231). After it merges and
  deploys, click **Scan Tools** again so the form shows the corrected values for get-team-health,
  get-master-health, get-site, get-preview-url (read-only → write), build-deliverable,
  research-keywords, accept-invitation, activate-due-rates (→ destructive). The justification text
  already describes the corrected values. `[LOCAL]`
- `[x]` **Prompts, Testing, Skills sections filled 2026-08-26 (overnight, via Playwright).** Three
  starter prompts; five positive test cases (account lookup, site and rates, scheduled rate change,
  GEO campaign visibility, CRO funnel report) and three negative ones (unrelated question, no
  implicit publish, foreign team is refused); all 13 skills uploaded as one ZIP of
  `plugins/codex/metrifi/skills` and accepted into scanning ("may take up to 2 hours"). All of it
  confirmed to persist after reload. `[LOCAL]`
- `[x]` **Skill descriptions re-checked against the 1,024 limit at the moment of upload.** Four had
  grown past it since 1.4.4 (`campaign-setup` 1242, `exp-deliver` 1226, `exp-research` 1081, `start`
  1025; the plugin now has 13 skills). Trimmed in **v1.4.12**. Two releases before it, 1.4.10 and
  1.4.11, went out as version-bump-only because the release script ran after a failed length check;
  their changelog entries say so. Lesson, now a rule: **measure every skill description right before
  any OpenAI upload, since `main` moves between sessions.** `[LOCAL]`
- `[ ]` **Left for Ryan, in order:** (1) Testing → *Test credentials*: `reviewer@metrifi.com` plus
  its password, in the `username: / password:` format the field shows; OpenAI requires no 2FA and
  immediate access. (2) Merge platform #231, wait for deploy, then MCP → **Scan Tools** so the eight
  corrected annotations show. (3) Global: confirm "Allow all countries". (4) Submit: release notes
  (suggested: "Initial release: MetriFi platform connector with Site Builder, GEO and CRO tools, and
  13 MetriFi skills."), the seven policy checkboxes, "No" on mature content. (5) Skills must show
  scanned, not Scanning. Then **Submit for Review**.
- `[ ]` Register ChatGPT's redirect URI. [OA-AUTH]: "ChatGPT completes the OAuth flow by
  redirecting to `https://chatgpt.com/connector/oauth/{callback_id}` and the URL will be shown in
  the app management page. Add that production redirect URI to your authorization server's
  allowlist so the authorization code can be returned successfully." **The `callback_id` is
  assigned by OpenAI, so this can only be done after the draft exists in the portal.**
- `[x]` OAuth 2.1 per the MCP authorization spec, with protected resource metadata, authorization
  server metadata, `resource` echoed through the flow, and published token endpoint auth methods.
  [OA-AUTH] lists all four. We verified the first two and the auth methods. `[LOCAL]`

### Manifest (`.codex-plugin/plugin.json`)
All limits from [OA-ERR], the official error catalogue. Where a field has two limits, the
smaller applies at final submission and the larger at draft validation.

Measured 2026-08-05 with `python3 -c "import json; ..."` against the live manifest. `[LOCAL]`

- `[x]` Top-level `description`, ≤1,024 chars (`plugin_description_missing`, `_too_long`) — 427 `[LOCAL]`
- `[x]` Top-level `name` ≤64 (7), `version` ≤64 (5), `author.name` ≤120 (7) `[LOCAL]`
- `[x]` `interface.shortDescription` ≤30 final / 240 validation (`plugin_short_description_too_long`)
  — now `"Build & optimize your website"`, 29 chars. Changed 2026-08-26 to stop naming the
  industry: OpenAI's Submit tab makes the developer certify compliance with "all laws and
  regulations applicable to the industry", and every installer already knows MetriFi, so the
  listing exists for recognition, not targeting. The long description and capabilities lost their
  credit-union, bank and NCUA mentions for the same reason. Was 156, which passes draft validation but
  fails final submission. Cut on 2026-08-05: a 156-character "short" description was poor UX in
  the Codex plugin list anyway, so there was no reason to carry the bad value until submission
  day. `[LOCAL]`
- `[x]` `interface.displayName` ≤30 final / 80 validation (`plugin_display_name_too_long`) — `MetriFi` is 7 `[LOCAL]`
- `[x]` `interface.longDescription` ≤4,000 (`plugin_long_description_too_long`) — 1,146 chars,
  mirrors the copy submitted to Anthropic for submission A so the two listings agree `[LOCAL]`
- `[x]` `interface.developerName` ≤80 final / 120 validation (`plugin_developer_name_too_long`)
  — set to `MetriFi` on 2026-08-25, the exact string entered during OpenAI business
  verification that day. This is the publisher line ("MetriFi **by ...**"), separate from
  `displayName`, and it must match the verified identity character for character. Residual
  risk: our entity is **BloomCU LLC doing business as MetriFi**, and OpenAI support names
  branding-vs-legal-name as a rejection trigger [C-OA-REJ4]. If review rejects with "The
  developer name you entered does not match your verified individual or business name"
  [C-OA-REJ1], change this field to `BloomCU LLC` and resubmit with a version bump. `[LOCAL]`
- `[x]` `interface.brandColor` / `brandColorDark` — six-digit hex (`plugin_brand_color_format`).
  `#884DFF` (favicon violet, 4.61:1 on white) and `#A074FF` (`--violet` from
  `bloomcu/metrifi-brand` tokens.css, 4.94:1 on `#212121`). Both clear the 2:1 rule. `[LOCAL]`
- `[x]` `interface.logo` — `./assets/logo.png`, 1024×1024 8-bit RGBA, rasterised from the favicon
  SVG in `bloomcu/metrifi-brand` (`magick -density 400`). The portal's upload fields ask for PNG
  (directory icon ≥256², composer icon ≥48²), so PNG is used in the manifest too. The wordmark
  `logo.svg` in the brand repo is 207×32 and cannot be used: OpenAI requires square. `[LOCAL]`
- `[x]` `interface.composerIcon` — `./assets/composer-icon.png`, 256×256, same mark. No monochrome
  rule is published; revisit if review asks. `[LOCAL]`
- `[x]` **Demo recording URL.** `https://youtu.be/oPHlwMgO7Nk`, Unlisted, 3:04, recorded 2026-08-25
  in ChatGPT Developer Mode as `reviewer@metrifi.com`: sign-in, whoami, Golden Peak site and rates,
  a scheduled rate change, preview link, GEO campaign visibility, CRO funnel report. Verified
  reachable without login (oEmbed 200, `isUnlisted:true`). The portal blocks progress past the
  first screen without this URL, so it is a prerequisite for creating the draft, not a last step. The portal's first screen asks for a video "demonstrating your
  plugin's functionality using Developer Mode. We use this video to validate your plugin's test
  cases and functionality. It will not be shared externally, and screen recordings are
  acceptable." Not in any doc we fetched; surfaced only by opening the form (2026-08-25). Record
  after the tool-surface PR lands so the video shows the final tool set. Roughly 30 minutes:
  install the plugin in ChatGPT Developer Mode, sign in, then run the three starter prompts.
  Host it somewhere that returns 200 to a non-browser (not behind the Cloudflare challenge on
  `support.metrifi.com`). `[LOCAL]`
- `[x]` Image rules: ≥48×48 (`raster_image_dimensions_too_small`), ≤4096×4096
  (`_too_large`), ≤5 MiB (`image_file_too_large`), format `.png/.jpg/.jpeg/.webp/.svg`
  (`image_file_format_unsupported`), extension must match real format
  (`raster_image_extension_content_mismatch`), path must start `./`
  (`branding_asset_path_missing_root_prefix`). SVGs need a square numeric `viewBox`
  (`svg_dimensions_not_square`, `svg_dimensions_not_numeric`).
- `[x]` `interface.category` from the 13 allowed values (`plugin_category_unknown`) — `Business & Operations`.
  The full list: Productivity, Creativity, Developer Tools, Business & Operations, Data &
  Analytics, Communication, Education & Research, Security, Finance, Healthcare, Travel,
  Entertainment, Other. [OA-ERR] `[LOCAL]`
- `[x]` `interface.capabilities` ≤20 items — 11 items, longest 87 chars `[LOCAL]`, each ≤120 chars, single line
  (`plugin_capabilities_too_many`, `plugin_capability_too_long`)
- `[x]` `interface.defaultPrompt` ≤3 prompts — 3, longest 67 chars, none names the app [OA-ERR] `[LOCAL]` (`plugin_default_prompt_too_many`), each ≤128 chars
  final (`_too_long`), unique after normalization (`_duplicate`), no app `@mention`
  (`plugin_default_prompt_mention`)
- `[x]` `websiteURL`, `privacyPolicyURL`, `termsOfServiceURL`, `supportURL` — HTTPS, ≤1,024 chars.
  All four set under `interface` (where [OA-ERR] places them). `supportURL` is
  `https://metrifi.com/talk-with-us/` (200 to any client). **Not** `https://support.metrifi.com`:
  it redirects to `/hc/en-us`, which sits behind a Cloudflare challenge (`cf-mitigated: challenge`)
  and returns 403 to anything that is not a real browser, so an automated URL check during review
  would fail. Verified 2026-08-25. `[LOCAL]`
  (`plugin_*_url_format`, `_too_long`). We have all four URLs. `[LOCAL]`
- `[x]` `brandColor` `#RRGGBB` with ≥2:1 contrast vs white — 4.61:1 (`plugin_brand_color_contrast`)
- `[x]` `brandColorDark` `#RRGGBB` with ≥2:1 contrast vs `#212121` — 4.94:1 (`plugin_brand_color_dark_contrast`)
- `[x]` `version` valid semver (`plugin_version_not_semver`) and **bumped on every resubmission**
  (`plugin_version_unchanged`) `[LOCAL]`
- `[x]` `mcpServers` declares `./.mcp.json`. [OA-ERR] warns that an undeclared one is silently
  dropped: `undeclared_mcp_manifest_ignored`. `[LOCAL]`
- `[x]` `name` ≤64 chars, starts with letter/digit, only letters/digits/`_`/`-`
  (`plugin_name_too_long`, `plugin_name_format`); must not change across updates
  (`plugin_name_mismatch`) `[LOCAL]`

### Skills
- `[x]` **Every skill description ≤1,024 chars** (`skill_description_too_long`). All four now
  921–993. `[OA-ERR]` `[LOCAL]`
- `[x]` Each skill at `skills/<name>/SKILL.md` with `name` and `description` frontmatter
  (`skill_manifest_missing`, `skill_name_missing`, `skill_description_missing`,
  `skill_frontmatter_missing`) `[OA-ERR]` `[LOCAL]`
- `[x]` `plugin-name:skill-name` ≤64 chars (`skill_identity_too_long`); names unique
  (`skill_identity_duplicate`) `[OA-ERR]` `[LOCAL]`
- `[x]` Skill body non-empty (`skill_body_empty`) `[LOCAL]`
- `[ ]` Bundle ZIP ≤100 MB (`archive_too_large`), ≤5,000 entries (`archive_too_many_entries`),
  ≤512 MiB uncompressed (`archive_uncompressed_too_large`), no symlinks
  (`archive_member_type_unsupported`), no `..` (`archive_member_path_has_parent_segment`),
  forward slashes only (`archive_member_path_has_backslash`), ≤20 path segments
  (`archive_member_path_too_deep`) `[OA-ERR]`
- Note on surfaces and loading. [OA-BSKILL]: "Standalone skills are available in the ChatGPT
  desktop app, Codex CLI, and IDE extension. Skills bundled in plugins are also available through
  supported plugin surfaces, including ChatGPT Work on the web." On loading: "ChatGPT and Codex
  start with each skill's name and description, then load the full `SKILL.md` instructions when
  they decide to use that skill", and "This list uses at most 2% of the model's context window,
  or 8,000 characters when the context window is unknown." That progressive disclosure is why
  [D.2] cannot simply move all tool guidance into skills, and it is a second reason to keep skill
  descriptions short beyond the 1,024-character hard limit.

### Tools
- `[x]` Explicit `readOnlyHint`, `openWorldHint`, **and** `destructiveHint` on every tool — all
  161 tools, plus a title each, in [metrifi-platform#229](https://github.com/metrifi/metrifi-platform/pull/229)
  (CI green, awaiting merge). A registry-walking test keeps the next tool compliant. Follow-up
  named in the PR: `manage-review-item` puts `assign` and `delete` behind one `action` enum, the
  only catch-all tool; annotated destructive so nothing is understated, splitting it is a
  behaviour change. `[LOCAL]`
  (`annotations_required`) `[OA-ERR]` `[OA-SUB]`
- `[ ]` **A written justification for each hint value** (`justification_required`). Required by
  OpenAI, not by Anthropic. `[OA-ERR]` [OA-SUB]: "Explicit readOnlyHint, openWorldHint, and
  destructiveHint values and a justification for each value on every MCP tool."
- `[ ]` Successful tool scan against the production server (`scan_required`). [OA-SUB] adds
  "Re-scan after server changes before submitting new versions." `[OA-ERR]`
- `[?]` **The scanner may hang on OAuth-protected servers, and we are OAuth-protected.**
  [C-OA-OAUTH] AldiPower, 2026-02-19: "I can clearly see in our server logs that OpenAI has
  obtained a valid access token from us. So far so good. The problem is that I then land again on
  the MCP Server submission page and the tools are not scanned". [C-OA-SPLIT] Dan425953,
  2026-07-23, diagnosed it and published the structural fix: "the apps-manage 'Authorize MCP'
  scanner and per-user runtime OAuth fight each other... The fix is to split discovery from auth
  — 'anonymous discovery, auth at call time': Make the MCP server answer initialize, tools/list,
  and ping unauthenticated, so the apps-manage scanner enumerates all tools with no OAuth popup
  at all... Keep every tools/call returning an in-band auth challenge." **Our server currently
  401s on `initialize` (verified). If the scan hangs, this is the fix, and it is a real
  architectural decision, not a config toggle.** `[LOCAL]`
- **Working in ChatGPT Developer Mode proves nothing about the review scanner.** [C-OA-DEVMODE]
  NatKSS, 2026-05-06: "Works perfectly when connected via chatgpt.com → Developer Mode → Create
  App... Fails in the App Review submission form at Step 2 ('MCP Server') when clicking Scan
  Tools, with: MCP details save failed: OAuth discovery returned unsupported OAuth config type."
  Another developer reproduced the same error against Atlassian's, Linear's, and Datadog's
  production MCP servers. That instance was an OpenAI-side migration bug, since fixed, but the
  lesson stands: test in the submission form, not just Developer Mode.
- `[ ]` Responses stripped of internals. [OA-GUI]: "Return only data directly relevant to
  requests" and "Exclude diagnostic data, session IDs, timestamps, or logging metadata."
  [OA-SUB]: "Remove personal data, secrets, debug payloads, and undisclosed fields from responses."
- `[ ]` No reconstruction of the chat log. [OA-GUI]: "Your MCP server must not pull, reconstruct,
  or infer the full chat log."
- `[ ]` Tool names unique and verb-shaped. [OA-GUI]: "Tool names must be unique within your MCP
  server" and advises human-readable verbs such as `get_order_status`.
- `[ ]` Descriptions do not disparage or manipulate. [OA-GUI]: "Descriptions must not favor or
  disparage other plugins or services" and "Plugins must not include descriptions...that
  manipulate how the model selects."
- `[ ]` Minimal inputs. [OA-GUI]: "Request minimum information necessary"; avoid "'just in case'
  fields"; do not request precise location.

### Testing materials
- `[ ]` **5 positive test cases**. [OA-SUBP]: "Five positive test cases and three negative test
  cases with clear expected behavior." [OA-SUB] specifies each carries "user prompt, expected
  behavior, result shape, and fixture data."
- `[ ]` **3 negative test cases** showing safe refusals or clarifications `[OA-SUB]`
- `[ ]` Starter prompts showing "realistic user workflows" `[OA-SUB]`
- `[!]` **Test every case on ChatGPT mobile, in a fresh session, on the first message.** The
  rejection email wording, [C-OA-REJ5] AEj, 2026-04-29: "Ensure the same test cases pass
  consistently on both ChatGPT web and mobile." Two teams were rejected for a mobile failure
  neither could reproduce. [C-OA-MOBILE] Goo_park, 2026-05-15, found the cause: "Mobile client:
  the first prompt after opening the app often returns a text-only response with no widget. If we
  send the exact same prompt again, the widget renders normally", and asks the right question:
  "does the OpenAI review team test apps with a fresh mobile session each time? If so, that could
  consistently trigger this issue during review."
- `[ ]` Demo credentials that just work. [OA-SUB]: credentials must work "without MFA, SMS, email
  confirmation, or private-network access." [OA-APP] is blunter: "Apps requiring any additional
  steps for login—such as requiring new account sign-up or 2FA through an inaccessible
  account—will be rejected." **A working bypass is not enough if it is non-obvious**:
  [C-OA-LOGIN] Domantas_Vanagas, 2026-05-14, set up an email that skips their magic-link flow,
  "Tested it, everything works. Got a rejection that they can't log in…" Our
  `reviewer@metrifi.com` account is a plain password login, which is the right shape. `[LOCAL]`
- `[ ]` Keep responses free of extraneous content. Rejection wording, [C-OA-REJ6] Ido_Avnir,
  2026-07-15, who was rejected twice ("First rejection: missing test-user credentials... Second
  rejection: feedback on how our tools are described"). [OA-REV]'s matching text: "Ensure that the
  returned textual output closely adheres to the user's request, and does not offer extraneous
  information that is irrelevant to the request, including personal identifiers."
- `[ ]` Release notes "summarizing plugin function, submission type, changes, and test credential
  details" `[OA-SUB]`
- `[ ]` Country/region availability, limited to where "publisher, product, support, and legal
  terms are operational" `[OA-SUB]`

### Policy
- `[x]` Not in a prohibited category. [OA-GUI] prohibits adult content, gambling, drugs,
  counterfeits, malware/spyware, tobacco, weapons, "Fraudulent financial services, fake IDs,
  credit manipulation", government impersonation, and "Cryptocurrency speculation or NFT consumer
  deception." We are none of these.
- `[x]` No restricted data. [OA-GUI] bars collecting PCI payment data, protected health
  information, government identifiers, and "Access credentials and authentication secrets."
- `[ ]` No advertising. [OA-GUI]: "Must not serve ads or exist primarily as advertising vehicle."
- `[ ]` Not a trial or demo. [OA-APP]: "Trial or demo versions are rejected."
- `[ ]` Support contact published and monitored. [OA-GUI]: "You must provide customer support
  contact details."
- `[ ]` Age appropriateness. [OA-GUI]: "Suitable for ages 13–17"; cannot target under-13s.
- `[ ]` Third-party API authorization. [OA-GUI]: "Secure proper authorization before API
  integration"; cannot "function as unofficial connectors." Relevant to the Google Analytics data
  we surface.

### OpenAI's published rejection reasons
[OA-REV] lists these verbatim as section headers, which makes them the most precise pre-flight
test we have for submission C:

1. "**We're unable to connect to your MCP server using the MCP URL and/or test credentials we
   were given.**" Fix: "our review team must be able to log into a demo account with no further
   configuration required" and the account must not "feature MFA (including requiring SMS codes,
   login through systems that require SMS, email or other verification schemes)."
2. "**One or more of your test cases did not produce correct results.**" Fix: "Ensure that the
   returned textual output closely adheres to the user's request, and does not offer extraneous
   information that is irrelevant to the request, including personal identifiers."
3. "**Your plugin returns user-related data types that are not disclosed in your privacy
   policy.**" Fix: "remove any unnecessary PII, telemetry/internal identifiers (for example,
   session, trace, or request IDs; timestamps; internal account IDs; or logs) and any auth
   secrets." **Our tool responses currently include internal integer IDs (team ids, funnel ids,
   campaign ids, commit SHAs). Audit which of those are necessary to the user's request.** `[LOCAL]`
4. "**Tool hint annotations do not appear to match the tool's behavior.**"

### OpenAI's annotation definitions (stricter than the MCP spec)
[OA-REV] gives operational definitions that differ from the spec's, and warns that prose cannot
override what the server advertises: "Your submission justifications should explain why those
server-provided annotation values match each tool's behavior. They don't override the
annotations. For example, if your server advertises `readOnlyHint: false`, describing the tool
as 'functionally read-only' in the justification doesn't make the tool read-only."

- `readOnlyHint`: "Set to `true` if it strictly fetches/looks up/lists/retrieves data and does not
  modify anything. Set to `false` if the tool can create/update/delete anything, trigger actions
  (send emails/messages, run jobs, enqueue tasks, write logs, start workflows), or otherwise
  change state." **Note: this catches `run-prompt`, `run-campaign-prompts`, `send-deliverable`,
  and `send-review`, which trigger actions even though they read like queries.** `[LOCAL]`
- `destructiveHint`: "Set the destructive annotation to `true` if the tool can cause irreversible
  outcomes... even in only select modes, through default parameters, or through indirect side
  effects." **`create-site` provisions a GitHub repo and Vercel project, so it qualifies despite
  being a create.** `[LOCAL]`
- `openWorldHint`: "Set to `true` if it can write to or change publicly visible internet state...
  Set to `false` only if it operates entirely within closed or private systems (including internal
  writes) and cannot change the state of the publicly visible internet." **`publish-site` changes
  publicly visible internet state, so it is `true`.** `[LOCAL]`

[OA-REF] additionally marks `readOnlyHint`, `destructiveHint`, and `openWorldHint` as **Required**
fields, with `idempotentHint` optional.

`[?]` **OpenAI staff give two conflicting definitions of `openWorldHint`.** Use the engineering
one. casey-chow (OpenAI engineering), 2026-05-14, [C-OA-ANNO]: "The idea behind openWorld is that
it hints to the model that it has effects that are visible to someone other than the current
user, so for example, sending a Slack message would be open-world for a Slack MCP, but updating a
user's daily digest would not be." OpenAI Support the same day, [C-OA-REJ2]: "use that when the
tool connects to anything outside the local sandbox, like an external API, network resource, or
third-party system." Those give opposite answers for most read-only third-party integrations, and
the developer who followed Support's version set everything to `true` and said "I assume that's
the problem, but I didn't understand it." **Write our justifications against the
effects-visible-to-others definition, since it matches [OA-REV]'s published wording.**

`[!]` **Annotations must never be null.** Verbatim from a rejection email, [C-OA-REJ1] Hyunje_kim,
2026-04-20: "One or more of your tool's annotations do not appear to match the tool's behavior.
Please confirm annotations are explicitly set to true or false (not null) for every tool. Include
a clear justification for why the hint is set that way based on the tool's actual behavior." His
own diagnosis is a pattern we share: a tool that "generates a session on our backend (POSTs to
create...) was declared readOnlyHint: true, which doesn't match the write behavior."

Rejections on annotations do not name the offending tool. [C-OA-REJ3] Jonathan_Labs, 2026-04-18,
on his fourth rejection: "If you've flagged an improper tool annotation - tell me which one. Now I
need to 'guess' again what OpenAI is referring to during this rejection. For context, this is the
4th time this app has been rejected, and each time I need to wait 1 to 2 weeks to hear back."
[C-OA-REJ4] ManuelDario hit five rejections on the same two reasons: "I can't understand which
tool have the problem". **With ~180 tools, a guess-and-wait loop is unaffordable. Get the
annotations right the first time.**

### Review flow and realistic timelines
[OA-SUB]: submitting "starts review, doesn't auto-publish"; OpenAI reviews; the **developer**
then publishes the approved plugin from the portal. [OA-SUBP]: "Review timelines may vary as
OpenAI builds and scales the review process." [OA-REV]: "Please do not contact support to request
expedited review, as these requests cannot be accommodated." OpenAI Support, [C-OA-SLA],
2026-06-30, states it plainly: **"App-review timelines vary, and we don't publish an SLA or offer
expedited review."**

First-hand accounts, newest first. **Do not trust third-party blogs claiming "one to two weeks";
no first-hand account supports it.**

| Reported | Outcome | Source |
|---|---|---|
| Jun 11 → still pending at 6+ weeks (Jul 24) | pending | [C-OA-T6] Tushar_Dhar |
| Jul 9 → Jul 10 | **approved in 1 day** (fastest found) | [C-OA-T7] Serhii_xTiles |
| Jul 17 → still stuck (Jul 29) | pending | [C-OA-T7] Serhii_xTiles, after resubmitting as a Plugin |
| "60 days to 120 days in my experience" | mixed | [C-OA-T4] Jonathan_Labs |
| 5 weeks → rejected; +3 weeks on resubmit → silent | rejected | [C-OA-T2] Aiterna-Technologies |
| Dec 2025 → Mar 2 2026 | rejected, ~3 months | [C-OA-T1] hunter_h |
| Update to an approved app | 8–10 days | [C-OA-T5] hunter_h, achieving100ms |

**The most actionable pattern: the review itself is fast, the queue-to-decision gap is what takes
weeks.** [C-OA-T2] Aiterna-Technologies: "based on what we see in our database, the app used and
tested within 1–2 days after submission. However, during the following 5–6 weeks, there doesn't
seem to be any further testing activity." Corroborated by [C-OA-T1] hunter_h ("the person that
looks at the app does so like many days before I get an email") and Sai_Harish. **Consequence: a
rejection costs a full queue cycle, not a fast re-test. Front-load correctness.**

### When rejection feedback does not arrive
The documented appeal path has failed for several developers. Plan for it.

- Rejection emails have arrived blank. [C-OA-BLANK] ablestyle: "the rejection email contains no
  reason for rejection. It says, 'Please see the details below:' but then there is just whitespace".
- Rejections have arrived with no email at all. [C-OA-NOEMAIL] _millie.on, 2026-07-15: "the status
  of my app simply changed to 'Rejected' without any further details or feedback", and support
  "told me that they don't have access to the review notes and they simply advised me to just fix
  and resubmit."
- Status has flipped to Rejected and back with no notification. [C-OA-FLIP] olivier_millier,
  2026-07-23.
- Appeal addresses have bounced. [C-OA-BOUNCE] ManuelDario: "Your message to
  openai-review@openai.com has been blocked." casey-chow (OpenAI) later: "Going forward, any
  rejection email will have a webform instead."
- **When escalating, give the `asdk_app_...` ID, not the support case number.** casey-chow
  (OpenAI), 2026-07-23, [C-OA-NOEMAIL]: "Case ID is actually more of a historical artifact than
  anything for us because the review system is built on top of our trust and safety system haha,
  unfortunately it's hard to correlate from that".

### Post-publish contract (much stricter than Anthropic's)
- [OA-REV]: "Treat the metadata exposed by your MCP server as a versioned API contract for the
  plugin." Changes to the tool list, names, titles, descriptions, schemas, annotations, security
  schemes, `_meta` fields, **or the MCP server `instructions`** require: "Deploy the change,
  create or update a draft version, scan the endpoint, submit the version for review, and publish
  it after approval."
- `[!]` **The MCP server origin is permanent.** [OA-REV]: "The MCP server origin (`scheme`,
  `hostname`, or `port`) can't change between versions. To use a different origin, submit a new
  plugin with the new MCP server origin." We migrated from `mcp.metrifi.com` to
  `platform.metrifi.com` in v1.2.0. **Decide deliberately that `platform.metrifi.com` is the
  forever hostname before submitting C.** `[LOCAL]`
- **Tool metadata is a reviewed snapshot; changing a description costs a full review cycle.**
  [C-OA-CACHE] jbrodriguez, 2026-07-22, after approval: "we made a small change to one tool
  description, however this change is not being reflected on chatgpt (web or desktop)... it seems
  to be caching the tool/list call at the version/submission level." OpenAI Support confirmed it
  is by design: "published tool metadata is stored as a reviewed snapshot, so reconnecting or
  reinstalling won't refresh a changed tool description."
- **You can deploy safely between submissions.** casey-chow (OpenAI), [C-OA-VERSION], 2026-04-30:
  "Your MCP server tool schema is snapshotted at the time of submission, but is not served until
  publication. That's to say, your tools/list response is locked at time of submission, but all
  actual tool calls still make their way to your live server." And 2026-06-01: "If you're just
  changing tool descriptions, make the changes in prod and submit the new version. We continue
  serving the old tool descriptions until the new version is released." **This resolves the
  apparent conflict with Anthropic's live-update model: we can keep deploying, OpenAI just serves
  the last approved metadata.**
- Recommended versioning practice, casey-chow (OpenAI), [C-OA-VERSION]: "I see teams adopt a
  versionless policy–new endpoints tools can be added, but old ones not removed for some time
  (usually 2-3 submission versions back) to allow for transition. The URL does not change across
  versions in this scheme."
- Directory placement is not guaranteed. [OA-REV]: "Plugins appear on the directory's main pages
  only if OpenAI selects them for enhanced distribution." Approval is also not publication:
  [C-OA-LIST] Tushar_Dhar, 2026-04-08, approved and searchable, asked how to get onto the listing
  page and was told placement "is based on things like strong real-world utility and user
  satisfaction."
- Press embargo. [OA-REV]: "Before issuing any press releases or public announcements regarding
  the launch of your plugin, please first reach out to press@openai.com"

---

## D. Platform work spanning B and C

### D.1 Tool annotations
**Smaller than first estimated.** Measured 2026-07-23 in `metrifi/metrifi-platform`: `[LOCAL]`

- 156 tools total
- **95 already carry a `Laravel\Mcp\Server\Tools\Annotations` attribute**: 79 `#[IsReadOnly]`,
  8 `#[IsDestructive]`, 8 `#[IsIdempotent]`
- **61 tools carry no annotation at all**
- **`IsOpenWorld` is used zero times**, and OpenAI requires `openWorldHint` on every tool
  ([OA-ERR: annotations_required], [OA-REF] marks it Required)

So the work is: annotate the 61 bare tools, add an open-world attribute to all 156, verify the
95 existing classifications against OpenAI's stricter definitions (which reclassify any tool that
"triggers actions"), and add `title` everywhere. The attribute mechanism already exists, so this
is filling gaps rather than building a system. Add a registry test that fails CI when an
unannotated tool lands. **Revised estimate: 1 day, not 1–2.**

Note that [AN-SUB]'s portal does this check for us before we can submit: tools "sync
automatically from the connected server, grouped by whether their annotations declare them
read-only or write... If any tools are flagged for missing titles or annotations, fix them on
your server before submitting."

### D.2 Tool description rewrite (larger than it looks)
[AN-REV] rejects descriptions that "Interfere with Claude calling other tools" or "Tell Claude to
behave in ways unrelated to the tool's function", summarized as "Describe what the tool does. Do
not tell Claude how to behave." [AN-POL] repeats it: instructional software "Cannot coerce Claude
into calling external resources unless user-requested" and "Cannot interfere with other tools
unless user-intended."

Descriptions currently live on the MetriFi server that appear to violate this, quoted from the
tool definitions as loaded in this session `[LOCAL]`:

- `write-files`: "This is the ONLY way to edit a MetriFi site repo: never use a GitHub connector
  or git directly."
- `get-preview-url`: "Present openMagicLink to the user as a CLICKABLE link, and if you have any
  browser capability (e.g. an internal/embedded browser) OPEN it automatically... and never ask
  the user to log in."
- `create-site`: "confirm the slug with the user first... Relay a non-null `warning` verbatim."
- `list-teams`: "The user must choose a team before using other tools."
- `set-brand`: "NOTE: set the client's OWN brand here — never MetriFi's tokens on a client site."

The fix is to restate each as a **fact about the tool** rather than an instruction to the model,
and to let `destructiveHint` produce the confirmation behavior that prose was hand-rolling.
Guidance that cannot become a fact belongs in the server's `instructions` field or in a skill.

Caveat on moving guidance to skills: connector-only users (submission B, no plugin installed)
receive no skills at all, and [OA-BSKILL] confirms skill bodies load only "when they decide to use
that skill", so guidance in a `SKILL.md` is absent at the moment a model reaches for the wrong
tool. **Estimate 1–2 days on top of D.1, plus half a day of behavioral testing.**

### D.3 Error messages
Audit the shared error handler against [AN-REV]'s "Generic errors ('Internal Server Error', 'Bad
Request' with no detail) fail review" and "return actionable error messages." Reviewers call
every tool with invalid input.

---

## E. Order of work

1. ~~Trim over-length skill descriptions, add LICENSE, add `license`/`repository`/`keywords`,
   link policies from README.~~ **Done 2026-07-23.** `[LOCAL]`
2. **Submit A (Claude plugin directory) now, but reset expectations.** It costs an hour and
   nothing blocks it, so there is no reason to wait. But the field evidence in
   [After approval](#after-approval-set-expectations-low) says approval and listing are different
   events, separated by weeks to months, and the catalog has been stalled or over capacity for
   stretches of 2026. **Submit it as a queue ticket, not as the thing that gets MetriFi live.**
3. **Check the two infra blockers in parallel, they are cheap and gate everything else.**
   - Cloudflare: allowlist `160.79.104.0/21` and exempt it from per-IP rate limiting.
   - OpenAI project data residency (EU blocks submission C entirely).
   **Half a day for both.**
4. Platform repo: D.1 annotations, D.2 description rewrite, D.3 error audit. **3–4 days.**
   Remember the portal live-checks annotations before allowing submission, so this gates B.
5. Open a **draft** submission B early to use the portal's live server check as free pre-flight
   ([C-RD1]), fix whatever it flags, then complete it. Also verify the 302-not-307 authorize
   redirect and add a security vulnerability contact.
6. Exercise every tool via MCP Inspector and as a custom connector; write the public docs page
   and the three example prompts. **1 day.** `[AN-REV]` `[AN-POL]`
7. **Submit B (Connectors Directory).** Portal-era evidence is 20 days to approval ([C-RD1]).
8. **Measure the OpenAI tool-surface token budget before committing to submission C at all.**
   With ~180 tools this may force splitting the server or a deep description cut, which would
   change the scope of C entirely. **Half a day to measure, unknown to fix.**
9. OpenAI: identity verification (start early, it lags), domain challenge at the root,
   logo + composerIcon, manifest listing fields, 8 test cases tested on **mobile**, starter
   prompts. **3–5 days.**
10. **Submit C (OpenAI).** Timelines range from 1 day to 120 days with no SLA; the median
    first-hand report is roughly a month, and a rejection costs a full queue cycle rather than a
    fast re-test.

**Why B may matter more than A.** [AN-PLUG] says using connectors "that already exist in the
Connectors Directory... will increase the likelihood of verification and will reduce the number of
warnings shown to users." Our plugin bundles our own connector, so a listed connector improves the
plugin listing. Combined with the plugin catalog's sync problems and the connector portal's
working 20-day turnaround, **B is the submission that actually puts MetriFi in front of buyers.**

## G. Cross-vendor contradictions

Three places where satisfying one vendor does not satisfy the other. Encode these as decisions,
not as tasks.

**1. Annotation defaults are unsafe, and the two vendors define the hints differently.**
[MCP-SPEC] sets `destructiveHint` **"Default: true"** and `openWorldHint` **"Default: true"**, so
an unannotated tool is treated as destructive and open-world. It also warns the values are only
hints: "all properties in ToolAnnotations are **hints**. They are not guaranteed to provide a
faithful description of tool behavior." [OA-REF] marks three of them Required. [OA-REV]'s
definitions are stricter than the spec's (any state change, including sending a message or
enqueuing a job, forces `readOnlyHint: false`). **Set all four explicitly on every tool, and
classify against OpenAI's stricter definition so one annotation set satisfies both.**

**2. Tool changes: opposite rules.** [AN-AFTER]: "To add, change, or remove tools, deploy the
change to your server—no resubmission to Anthropic is required, and there is no scheduled
re-review." [OA-REV]: any change to tool names, descriptions, schemas, annotations, or the server
`instructions` requires re-deploy, re-scan, re-submit, re-approve, re-publish. **Operational
consequence: our habit of iterating tool descriptions freely is fine for Anthropic and expensive
for OpenAI. Batch OpenAI-visible changes into deliberate releases.**

**3. Permanence, in different places.** Anthropic locks the listing **slug** forever
([AN-AFTER]: "Your directory slug is fixed after publication"). OpenAI locks the MCP server
**origin** forever ([OA-REV], quoted above). Anthropic requires no domain-ownership proof
([AN-DIR]); OpenAI requires a `.well-known` challenge ([OA-SUB]). **Pick the production hostname
and the slug before the first submission on either side.**

## F. What no checklist can buy

Listing is achievable; placement is not. [AN-PLUG]: "There are no guarantees that any community
plugin will become Anthropic Verified." [CC-PLUG] on the curated marketplace: "Anthropic decides
which plugins to include at its discretion. There is no application process, and the submission
form does not add plugins to the official marketplace." [AN-REV] says Verified escalation "is
assessed automatically, and you do not need to take any action."

No developer found in this research has documented a Community → Verified upgrade. [C-RD1]
(first-hand, approved as Community): "There is no public process for upgrading. Has anyone here
gone Community → Verified? Genuinely curious how." He also claims, from his own testing and
explicitly asking for counter-evidence, that the tier affects discovery: "the in-chat connector
auto-suggestions... only surface **verified** connectors. Community tier gets directory search and
the browse shelves — but not the auto-suggestion panel." **Single-source and unreplicated.** It
would sit against [AN-VER]'s framing that the label "is a quality signal shown to users; it does
not change how your connector runs once connected" — though that sentence is about runtime, not
discovery, so both can be true.

Plan for Community tier. Treat Verified as upside you cannot schedule.

Also on placement, on the OpenAI side: [OA-REV] "Plugins appear on the directory's main pages only
if OpenAI selects them for enhanced distribution."

---

## Source registry

### Official — Anthropic
| ID | URL | Read |
|----|-----|------|
| `[AN-SUB]` | https://claude.com/docs/connectors/building/submission | full |
| `[AN-REV]` | https://claude.com/docs/connectors/building/review-criteria | full |
| `[AN-VER]` | https://claude.com/docs/connectors/verification | full |
| `[AN-PLUG]` | https://claude.com/docs/plugins/submit | full |
| `[AN-POL]` | https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy | full |
| `[CC-PLUG]` | https://code.claude.com/docs/en/plugins | full |
| `[CC-MKT]` | https://code.claude.com/docs/en/plugin-marketplaces | full |
| `[CC-DISC]` | https://code.claude.com/docs/en/discover-plugins | full |
| `[CC-REF]` | https://code.claude.com/docs/en/plugins-reference | manifest schema section |
| `[AN-TERMS]` | https://support.claude.com/en/articles/13145338-anthropic-software-directory-terms | full |
| `[AN-AUTH]` | https://claude.com/docs/connectors/building/authentication | full |
| `[AN-TEST]` | https://claude.com/docs/connectors/building/testing | full |
| `[AN-MANAGE]` | https://claude.com/docs/connectors/building/managing-your-listing | full |
| `[AN-AFTER]` | https://claude.com/docs/connectors/building/after-publishing | full |
| `[AN-VSCUSTOM]` | https://claude.com/docs/connectors/building/directory-vs-custom | full |
| `[AN-DIR]` | https://claude.com/docs/connectors/directory | full |

Dead end, do not cite: the [Connectors Directory FAQ](https://support.claude.com/en/articles/11596036-anthropic-connectors-directory-faq)
is now a stub whose entire body is "The Connectors Directory FAQ has moved to the Claude developer
docs." Last modified 2026-05-07. It contains no timeline, update, or removal content.

### Official — MCP specification
| ID | URL | Read |
|----|-----|------|
| `[MCP-SPEC]` | https://modelcontextprotocol.io/specification/2025-11-25/schema (`ToolAnnotations`) and `/server/tools` | annotation semantics and defaults |

### Official — OpenAI
| ID | URL | Read |
|----|-----|------|
| `[OA-SUB]` | https://developers.openai.com/plugins/deploy/submission | full |
| `[OA-ERR]` | https://developers.openai.com/plugins/deploy/submission-errors | full (error catalogue) |
| `[OA-GUI]` | https://developers.openai.com/plugins/app-guidelines | full |
| `[OA-APP]` | https://developers.openai.com/apps-sdk/app-submission-guidelines | full |
| `[OA-SUBP]` | https://learn.chatgpt.com/docs/submit-plugins | full |
| `[OA-SKILL]` | https://learn.chatgpt.com/docs/skills-and-plugins | full (skill vs plugin definitions) |
| `[OA-BSKILL]` | https://learn.chatgpt.com/docs/build-skills | full (loading model, context budget, surfaces) |
| `[OA-REV]` | https://developers.openai.com/plugins/deploy/app-review | full — **densest rejection-risk page on either vendor's site** |
| `[OA-RESID]` | https://help.openai.com/en/articles/10503543-data-residency-for-the-openai-api | per-project region set at creation only; located via search summary 2026-08-05, article itself returns 403 to unauthenticated fetch |
| `[OA-REF]` | https://developers.openai.com/plugins/reference | annotations table, CSP/frame domains |
| `[OA-SEC]` | https://developers.openai.com/plugins/guides/security-privacy | prompt injection, iframe CSP |
| `[OA-MCP]` | https://developers.openai.com/plugins/build/mcp-server | tool definition checklist, MCP skill import limits |
| `[OA-PKG]` | https://developers.openai.com/plugins/build/plugins | manifest layout, `interface` fields |
| `[OA-AUTH]` | https://developers.openai.com/plugins/build/auth | ChatGPT redirect URI |
| `[OA-META]` | https://developers.openai.com/plugins/guides/optimize-metadata | naming and description formulas |

Working index: `developers.openai.com/plugins/llms.txt`. Every page has a `.md` twin.
`learn.chatgpt.com/llms.txt` and `developers.openai.com/sitemap.xml` both 404.

Note: `developers.openai.com/codex/*` 308-redirects to `learn.chatgpt.com/docs/*`, including
`/codex/skills` → `/docs/build-skills`.

### Non-official developer reports

All first-hand unless marked. **No source below reports a stated rejection reason from Anthropic.**
A research pass across Reddit, GitHub, and blogs found accounts of silence, lost submissions,
portal bugs, and one detailed approval, but nobody saying "Anthropic rejected me because X." That
absence is itself a finding: the failure mode people actually hit is the queue, not the criteria.

| ID | Source | Kind | Date |
|----|--------|------|------|
| `[C-RD1]` | [r/mcp — "Anthropic approved my MCP server into the Claude directory"](https://old.reddit.com/r/mcp/comments/1vana5k/anthropic_approved_my_mcp_server_into_the_claude/) (u/Capable_Advisor5282) | **first-hand, approved via the current portal.** The single most useful source here | 2026-07-30 |
| `[C-BLOG]` | [joshsymonds.com — "Anthropic hates developers"](https://joshsymonds.com/blog/anthropic-hates-developers/) (Josh Symonds, Savecraft) | **first-hand**, four months then told to restart | 2026-07-31 |
| `[C-DEV]` | [dev.to — "How to Submit Your MCP Server to Anthropic's Connector Directory (From Someone Who Did It)"](https://dev.to/qrflows/how-to-submit-your-mcp-server-to-anthropics-connector-directory-from-someone-who-did-it-143m) | **first-hand** submitter; parts restate the docs | 2026-06-03 |
| `[C-RD2]` | [r/mcp thread, u/ElectronicTonicWater](https://old.reddit.com/r/mcp/comments/1urs17q/submitted_my_mcp_to_anthropic_around_7_weeks_ago/) | first-hand, status visibility | 2026-07-09 |
| `[C-RD3]` | [r/mcp, u/ValuablePace4109 (HookLayer)](https://old.reddit.com/r/mcp/comments/1urs17q/submitted_my_mcp_to_anthropic_around_7_weeks_ago/) | first-hand, 7 weeks silent | 2026-07-09 |
| `[C-RD4]` | [r/mcp — "Solo dev can't reach the in-app directory"](https://old.reddit.com/r/mcp/comments/1v5owzt/solo_dev_cant_reach_the_inapp_directory/) (u/Think-Ad986) | first-hand, Team gate + unanswered escalation | 2026-07-24 |
| `[C-RD5]` | [r/mcp — "Built an MCP app, turns out you can't even submit"](https://old.reddit.com/r/mcp/comments/1ui7366/built_an_mcp_app_turns_out_you_cant_even_submit/) (u/BaseMac) | first-hand, 5 months silent | 2026-06-29 |
| `[C-GH14]` | [claude-plugins-community #14](https://github.com/anthropics/claude-plugins-community/issues/14) | first-hand, approved-but-unlisted (multiple reporters) | 2026-04-27+ |
| `[C-GH40]` | [claude-plugins-community #40](https://github.com/anthropics/claude-plugins-community/issues/40) | first-hand, listed but not installable | 2026-05-26 |
| `[C-GH22]` | [claude-plugins-community #22](https://github.com/anthropics/claude-plugins-community/issues/22) | first-hand, dead submission URL | 2026-05-05 |
| `[C-GH605]` | [claude-plugins-community #605](https://github.com/anthropics/claude-plugins-community/issues/605) | first-hand, catalog additions paused | 2026-06-30 |
| `[C-GH995]` | [claude-plugins-community #995](https://github.com/anthropics/claude-plugins-community/issues/995) | first-hand, SHA bump starvation | 2026-07-12 |
| `[C-GH1058]` | [claude-plugins-community #1058](https://github.com/anthropics/claude-plugins-community/issues/1058) | first-hand, catalog over client max | 2026-07-14 |
| `[C-GH1185]` | [claude-plugins-community #1185](https://github.com/anthropics/claude-plugins-community/issues/1185) and [claude-plugins-official #4201](https://github.com/anthropics/claude-plugins-official/issues/4201) | first-hand, `url`+`path` source installs empty | 2026-07-17 |
| `[C-GH1588]` | [claude-plugins-community #1588](https://github.com/anthropics/claude-plugins-community/issues/1588) | first-hand, stale pinned build | 2026-07-30 |
| `[C-GH250]` | [claude-ai-mcp #250](https://github.com/anthropics/claude-ai-mcp/issues/250) | first-hand, 307 vs 302 OAuth failure **with confirmed fix** | 2026-05-01 |
| `[C-GH368]` | [claude-ai-mcp #368](https://github.com/anthropics/claude-ai-mcp/issues/368) | first-hand, URL validator rejects valid HTTPS | 2026-05-27 |
| `[C-GH600]` | [claude-ai-mcp #600](https://github.com/anthropics/claude-ai-mcp/issues/600) | first-hand, slug/name portal bug **with workaround** | 2026-07 |
| `[C-GH623]` | [claude-ai-mcp #623](https://github.com/anthropics/claude-ai-mcp/issues/623) | first-hand, zero inbound traffic from Anthropic egress | 2026-07-15 |
| `[C-GH699]` | [claude-ai-mcp #699](https://github.com/anthropics/claude-ai-mcp/issues/699) | first-hand, tunnel-hostname failure | 2026-07-25 |
| `[C-GH700]` | [claude-ai-mcp #700](https://github.com/anthropics/claude-ai-mcp/issues/700) | first-hand, same on `ts.net` | 2026-07-25 |
| `[C-GH709]` | [claude-ai-mcp #709](https://github.com/anthropics/claude-ai-mcp/issues/709) | first-hand, **HTTP 429 measured from Anthropic egress** | 2026-07-26 |
| `[C-GH723]` | [claude-ai-mcp #723](https://github.com/anthropics/claude-ai-mcp/issues/723) | first-hand, 6 weeks no response | 2026-07-29 |
| `[C-SUN]` | [sunpeak.ai blog](https://sunpeak.ai/blogs/claude-connector-directory-submission/) | **second-hand** vendor blog | 2026-05-22 |

**OpenAI side.** All from the OpenAI Developer Community forum. Note that `casey-chow`,
`mstoiber`, and `OpenAI_Support` are OpenAI staff, not independent developers; their statements
are labelled as such inline.

| ID | Thread | Kind | Date |
|----|--------|------|------|
| `[C-OA-SCAN]` | [Tool scan failed: internal service error](https://community.openai.com/t/openai-app-submission-tool-scan-failed-internal-service-error/1376398) | **first-hand, the undocumented 5k/16k token limits** | 2026-03→05 |
| `[C-OA-SUBPATH]` | [Domain verification does not support subpath-hosted MCP servers](https://community.openai.com/t/chatgpt-app-submissions-domain-verification-step-does-not-support-subpath-hosted-mcp-servers/1379021) | first-hand + OpenAI confirmation it is intended | 2026-04-15 |
| `[C-OA-MTLS]` | [openai-apps-challenge does not support mTLS](https://community.openai.com/t/well-known-openai-apps-challenge-call-during-app-submission-does-not-support-mtls/1387218) | first-hand | 2026-07-16 |
| `[C-OA-DV]` | [Domain verification fails](https://community.openai.com/t/chatgpt-app-submission-domain-verification-fails/1380339) | first-hand, verifier UA name | 2026-05-05 |
| `[C-OA-SPLIT]` | [Submission blocked: OAuth code issued but /token never called](https://community.openai.com/t/apps-sdk-submission-blocked-mcp-oauth-code-issued-but-chatgpt-never-calls-token-authorize-mcp-modal-hangs/1385089) | **first-hand, anonymous-discovery workaround** | 2026-07-23 |
| `[C-OA-OAUTH]` `[C-OA-SCANFIX]` | [MCP app submission scan tool not working](https://community.openai.com/t/mcp-app-submission-scan-tool-not-working/1374513) | first-hand outage + step-by-step workaround | 2026-02→03 |
| `[C-OA-DEVMODE]` | [Works in Developer Mode but fails in App Review](https://community.openai.com/t/oauth-mcp-server-works-in-chatgpt-developer-mode-create-app-but-fails-in-app-review-form-what-does-unsupported-oauth-config-type-really-mean/1380378) | first-hand, reproduced on 3 major servers | 2026-05-06 |
| `[C-OA-ANNO]` `[C-OA-REJ1]` | [Rejection feedback: annotations and developer name](https://community.openai.com/t/clarification-needed-on-rejection-feedback-tool-annotations-and-developer-name-mismatch/1379402) | **first-hand rejection email text** + OpenAI's openWorldHint definition | 2026-04-20 |
| `[C-OA-REJ2]` `[C-OA-REJ4]` | [Understanding the rejecting conditions](https://community.openai.com/t/understanding-the-rejecting-conditions-on-a-chatgpt-app-clarification-needed-on-rejection-feedback/1380927) | first-hand, 5 rejections; conflicting Support definition | 2026-05-14 |
| `[C-OA-REJ3]` `[C-OA-REJ5]` | [App submission flow improvements roundup](https://community.openai.com/t/app-submission-flow-improvements-roundup/1379047) | first-hand rejections (CSP, annotations, test cases) | 2026-04 |
| `[C-OA-REJ6]` | [Xpoz submission rejected twice](https://community.openai.com/t/app-review-xpoz-submission-rejected-twice-seeking-guidance-on-tool-descriptions/1386944) | first-hand, most recent rejection account | 2026-07-15 |
| `[C-OA-MOBILE]` | [Mobile widget failure rejection](https://community.openai.com/t/request-for-assistance-in-checking-current-app-status-help-centers-ai-response-is-not-helping/1380951) | first-hand, cold-start mobile race | 2026-05-15 |
| `[C-OA-LOGIN]` | [ChatGPT apps with auth login credentials](https://community.openai.com/t/chatgpt-apps-with-auth-login-credentials/1380896) | first-hand, working bypass still rejected | 2026-05-14 |
| `[C-OA-VERIF]` | [Completed verification not recognized by app review](https://community.openai.com/t/completed-verification-is-not-recognized-by-app-review/1381417) | first-hand, verification lag | 2026-05→06 |
| `[C-OA-FORM]` | [Unable to submit: "This is a required field"](https://community.openai.com/t/unable-to-submit-mcp-connector-for-review-this-is-a-required-field-but-all-fields-are-completed/1383050) | first-hand, 236-tool surface | 2026-06-08 |
| `[C-OA-BLANK]` | [App rejected, no reason given](https://community.openai.com/t/app-rejected-no-reason-given/1378971) | first-hand, blank rejection email | 2026-04-14 |
| `[C-OA-NOEMAIL]` | [App rejected after a month with no explanation](https://community.openai.com/t/app-rejected-after-a-month-with-no-explanation-where-can-i-find-the-reason/1386788) | first-hand, no email at all | 2026-07-14 |
| `[C-OA-FLIP]` | [Status reverted to Review](https://community.openai.com/t/app-rejected-with-no-reason-shown-status-reverted-to-review/1387930) | first-hand | 2026-07-23 |
| `[C-OA-BOUNCE]` | see `[C-OA-REJ4]` | first-hand, appeal address bounced | 2026-05-14 |
| `[C-OA-CACHE]` | [How to surface MCP server updates for an existing plugin](https://community.openai.com/t/how-to-surface-mcp-server-updates-for-an-existing-plugin/1387824) | **first-hand, approved**, metadata snapshot | 2026-07-22 |
| `[C-OA-VERSION]` | [MCP server URL and versioning during update submission](https://community.openai.com/t/clarification-on-mcp-server-url-and-versioning-during-chatgpt-app-update-submission/1379705) | OpenAI staff guidance on deploying between submissions | 2026-04→06 |
| `[C-OA-LIST]` | [Showing app on the listing page](https://community.openai.com/t/showing-app-on-the-listing-page/1378720) | **first-hand, approved**, placement is separate | 2026-04-08 |
| `[C-OA-SLA]` | [How long does app review typically take](https://community.openai.com/t/how-long-does-app-review-typically-take/1378373) | OpenAI Support: no SLA; also the screenshot-guidance dispute | 2026-06-30 |
| `[C-OA-T1]`…`[C-OA-T7]` | [I submitted an app, how long should review take](https://community.openai.com/t/i-submitted-an-app-how-long-should-the-review-process-take/1369797), [App review process timelines](https://community.openai.com/t/app-review-process-timelines-for-chatgpt-app-store/1378947), [Stuck in review 6 weeks](https://community.openai.com/t/chatgpt-app-review-pending-for-6-weeks-is-this-normal/1388077), [xTiles stuck since July 17](https://community.openai.com/t/xtiles-plugin-stuck-in-review-since-july-17/1388331) | first-hand timelines | 2026-03→07 |

**Era caveat.** The unified Plugins Directory is too new for a large body of first-hand reports.
Most OpenAI evidence above comes from its immediate predecessor, the ChatGPT Apps SDK submission
flow (Dec 2025 onward), which uses the same portal, pipeline, and rejection emails. The 2023
"ChatGPT plugins store" is a different retired system and was excluded entirely.

**Gap, stated rather than guessed:** no first-hand account of a **skills-only** plugin going
through OpenAI review was found. Two developers asked publicly and got no reply
([this](https://community.openai.com/t/how-can-third-party-community-plugins-be-published-to-the-codex-marketplace/1377928),
2026-03-27, and [this](https://community.openai.com/t/should-each-breaking-major-version-use-a-separate-plugin-identity/1388515),
2026-07-31). A circulating claim that bundled skills get a scan "which can take up to 2 hours"
traces to an OpenAI help article that returned HTTP 403 and **could not be verified**.

**Excluded for lack of first-hand content:** Reddit (r/OpenAI, r/ChatGPTPro, r/ChatGPTCoding
produced nothing verifiable), Hacker News (the launch thread is business-model speculation),
`openai/plugins` on GitHub (zero issues), and the vendor blogs alpic.ai and sunpeak.ai's OpenAI
post (both restate the docs with no rejection text, timelines, or named cases).

Second-hand sources are used only for operational gotchas the official docs do not cover. Where
they restate official requirements, the official source is cited instead.

**Claims deliberately excluded** for lack of support: [C-DEV]'s "Missing annotations reportedly
cause around 30% of all directory rejections" (no source given, nothing found supporting it), and
[C-DEV]'s "must be Streamable HTTP, SSE is no longer accepted" (contradicted by [AN-SUB], which
accepts "streamable HTTP or SSE"). An r/ClaudeWorkflows post covering the same connector as
[C-RD1] is a bot-generated summary ("This post was generated automatically from the workflow
library database") and is not an independent data point.

### Local verification
`[LOCAL]` — direct checks against this repository and `https://platform.metrifi.com` performed
2026-07-23. Reproduce the OAuth probes with:

```bash
curl -s https://platform.metrifi.com/.well-known/oauth-protected-resource
curl -s https://platform.metrifi.com/.well-known/oauth-authorization-server
curl -s -i -X POST https://platform.metrifi.com/mcp -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'   # expect 401 + WWW-Authenticate
```

### Provenance note

Sources marked "full" were fetched and read. `[AN-SUB]`, `[AN-REV]`, `[AN-VER]`, `[AN-PLUG]`,
`[AN-POL]`, `[AN-AUTH]`, `[AN-AFTER]`, `[CC-*]`, `[OA-SUB]`, `[OA-ERR]`, `[OA-GUI]`, `[OA-APP]`,
`[OA-SUBP]`, `[OA-SKILL]`, `[OA-BSKILL]`, and `[OA-REV]` were fetched directly in the session
that wrote this document, and their quotes are transcribed from those fetches.

`[AN-TERMS]`, `[AN-TEST]`, `[AN-MANAGE]`, `[AN-VSCUSTOM]`, `[AN-DIR]`, `[MCP-SPEC]`, `[OA-REF]`,
`[OA-SEC]`, `[OA-MCP]`, `[OA-PKG]`, `[OA-AUTH]`, and `[OA-META]` were located and quoted by a
research subagent instructed to supply verbatim quotes with URLs and to omit anything it could
not quote. The three highest-stakes of those (`[AN-AUTH]`, `[AN-AFTER]`, `[OA-REV]`) were then
re-fetched and confirmed independently. The remainder have **not** been independently
re-verified; treat their quotes as accurate but confirm before acting on anything expensive.
