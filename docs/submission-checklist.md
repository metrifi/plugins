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
| A | Claude plugin directory (surfaced in Claude Code as `claude-plugins-official`, plus Cowork and Desktop) | this GitHub repo | [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit) | [AN-PLUG] |
| B | Claude Connectors Directory (claude.ai + Desktop) | `https://platform.metrifi.com/mcp` | [claude.ai/admin-settings/directory/submissions/new](https://claude.ai/admin-settings/directory/submissions/new) | [AN-SUB] |
| C | OpenAI Plugins Directory (ChatGPT **and** Codex, one listing) | plugin = MCP app + skills | [platform.openai.com/plugins](https://platform.openai.com/plugins) | [OA-SUBP] |

Submissions A and B are genuinely separate systems. [AN-PLUG] states the plugin directory
"is a separate and complementary directory from the Connectors Directory, which is specific
to MCP connectors."

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
- `[!]` **The server sits behind Cloudflare** (`server: cloudflare` on every response, verified).
  [AN-AUTH] publishes Anthropic's egress range and warns the failure is silent: "Discovery
  requests to the authorization server come from the same IP range as requests to your MCP
  server, so a WAF in front of your identity provider can break the flow even when your MCP
  server is reachable." **Action: allowlist `160.79.104.0/21` in Cloudflare and confirm no rate
  limiting or bot-fight rule applies to it.** `[AN-AUTH]` `[LOCAL]`
- `[!]` **We use DCR, and Anthropic recommends against it at directory scale.** Our metadata
  advertises a `registration_endpoint` and `"token_endpoint_auth_methods_supported":["none"]`.
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
- `[x]` README links privacy policy, terms, cookie policy, and a support contact.
  [AN-POL] requires "verified contact information and support channels." `[LOCAL]`
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

### After approval
- Updates are automatic. [AN-PLUG]: "After your plugin is published, updates pushed to your
  GitHub repo are picked up automatically—CI mirrors changes to the public marketplace and runs
  automated screening on each update. You do not need to re-submit the form for updates."
- Expect a publication lag. [CC-PLUG]: "The public catalog syncs nightly from the review
  pipeline, so there can be a delay between approval and your plugin appearing in
  `marketplace.json`." One developer reported a much longer gap: [C-GH14] (first-hand) reports a
  plugin showing "Published" status as of 2026-04-24 that had still not appeared in the
  repository's `marketplace.json` or on claude.com/plugins. **Do not read a delay as a rejection.**
- Approved plugins are pinned. [CC-PLUG]: "Approved plugins are pinned to a specific commit SHA
  in the `anthropics/claude-plugins-community` catalog, and CI bumps the pin automatically as
  you push new commits to your repository."

---

## B. Claude Connectors Directory

The submission that functionally tests every tool. Highest bar, and the highest value for us
because our buyers are in claude.ai rather than the CLI.

### Access
- `[x]` claude.ai Team org exists `[LOCAL]`
- `[ ]` Submitting user has directory-management access. [AN-SUB]: "By default, only organization
  Owners and Primary owners can submit and manage directory listings... Team plans don't have
  custom roles, so on Team this stays with Owners."

### Tool design
Reported as the single largest rejection cause by a developer who went through the process.
[C-DEV] (first-hand) calls tool annotations "the #1 reason for rejection."

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
- `[!]` **WAF/CDN must not block `160.79.104.0/21`.** [AN-AUTH]: "Anthropic's outbound traffic to
  your server originates from `160.79.104.0/21`." We are behind Cloudflare, so this is a live
  risk, not a hypothetical. Verify from outside our network; it fails silently. `[AN-AUTH]` `[LOCAL]`
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

- `[!]` **A security vulnerability reporting channel is required, and we do not have one
  documented.** [AN-TERMS]: "You further agree to implement and maintain a mechanism for
  receiving reports of security vulnerabilities from Anthropic and from third parties and to
  investigate such reports with a reasonable standard of care." **Action: publish a
  `security@metrifi.com` address or a SECURITY.md, and reference it in the listing.**
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
- Listing metadata is editable without review; the display name is not. [AN-MANAGE]: "**Display
  name**: editable, but changing the name of a published server affects existing users and
  requires re-review."
- Watch the disconnect rate. [AN-MANAGE] grades listings "**Healthy** | The 30-day disconnect
  rate is at or below 5%" and "**Degraded** | The 30-day disconnect rate is above 5%".
- Permanent URL: `https://claude.ai/directory/connectors/SLUG` `[AN-AFTER]`
- Delisting: email `mcp-review@anthropic.com` `[AN-AFTER]`

### Review and labelling
- Timeline is not published. [AN-SUB]: "Review times vary with queue volume. The submission
  portal is always open." [C-DEV] (first-hand) reports Anthropic citing roughly two weeks and
  his own submission sitting "about a month" with no response, which he was told is "within the
  normal range."
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

One submission, listed in both ChatGPT and Codex. [OA-SUBP]: approved plugins appear in the
"Plugins Directory available in both ChatGPT and Codex." [OA-APP] confirms the merge: "Apps are
now submitted and published as plugins." Most mechanically strict of the three, and the error
catalogue is public, which makes this the easiest one to pre-validate.

### Prerequisites
- `[ ]` Verified identity. [OA-REV]: "Before submitting a plugin with MCP, complete identity
  verification in the OpenAI Platform Dashboard for the name you plan to publish under in the
  directory... This is enforced during review. Publishing under an unverified individual or
  business name will result in rejection."
- `[ ]` `api.apps.write` permission. [OA-REV]: "To create plugin drafts with MCP and submit them
  for review, you need the `api.apps.write` permission."
- `[!]` **Check the OpenAI project's data residency.** [OA-REV]: "For now, projects with EU data
  residency cannot submit plugins with MCP servers for review. Use a project with global data
  residency." **Verify before doing any other OpenAI work; this is a hard block.**
- `[ ]` Server is publicly reachable. [OA-REV]: "Your MCP server is hosted on a publicly
  accessible domain" and "You are not using a local or testing endpoint."
- `[ ]` Only one version in flight. [OA-REV]: "For each MCP server integration, only one version
  may be published at a time and only one version may be in review at a time."

### Domain verification
- `[ ]` Host the challenge token at `https://platform.metrifi.com/.well-known/openai-apps-challenge`
  `[OA-SUB]` `[OA-ERR: domain_verification_required]`
- `[ ]` Return **only** the token. [OA-SUB]: "The challenge endpoint must return only that
  plugin's verification token—do not return JSON, a list of tokens, or multiple tokens from the
  same URL."

### Authentication
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

- `[x]` Top-level `description`, ≤1,024 chars (`plugin_description_missing`, `_too_long`) `[LOCAL]`
- `[ ]` `interface.shortDescription` ≤30 final / 240 validation (`plugin_short_description_too_long`) **`[!]` 156 today**
- `[x]` `interface.displayName` ≤30 final / 80 validation (`plugin_display_name_too_long`) — `MetriFi` is 7 `[LOCAL]`
- `[ ]` `interface.longDescription` ≤4,000 (`plugin_long_description_too_long`)
- `[ ]` `interface.developerName` ≤80 final / 120 validation (`plugin_developer_name_too_long`)
- `[ ]` `interface.logo` — required, square (`plugin_logo_path_missing`) **`[!]` missing**
- `[ ]` `interface.composerIcon` — required, square (`plugin_composer_icon_path_missing`) **`[!]` missing**
- `[ ]` Image rules: ≥48×48 (`raster_image_dimensions_too_small`), ≤4096×4096
  (`_too_large`), ≤5 MiB (`image_file_too_large`), format `.png/.jpg/.jpeg/.webp/.svg`
  (`image_file_format_unsupported`), extension must match real format
  (`raster_image_extension_content_mismatch`), path must start `./`
  (`branding_asset_path_missing_root_prefix`). SVGs need a square numeric `viewBox`
  (`svg_dimensions_not_square`, `svg_dimensions_not_numeric`).
- `[ ]` `interface.category` from the 13 allowed values (`plugin_category_unknown`)
- `[ ]` `interface.capabilities` ≤20 items, each ≤120 chars, single line
  (`plugin_capabilities_too_many`, `plugin_capability_too_long`)
- `[ ]` `interface.defaultPrompt` ≤3 prompts (`plugin_default_prompt_too_many`), each ≤128 chars
  final (`_too_long`), unique after normalization (`_duplicate`), no app `@mention`
  (`plugin_default_prompt_mention`)
- `[ ]` `websiteURL`, `privacyPolicyURL`, `termsOfServiceURL`, `supportURL` — HTTPS, ≤1,024 chars
  (`plugin_*_url_format`, `_too_long`). We have all four URLs. `[LOCAL]`
- `[ ]` `brandColor` `#RRGGBB` with ≥2:1 contrast vs white (`plugin_brand_color_contrast`)
- `[ ]` `brandColorDark` `#RRGGBB` with ≥2:1 contrast vs `#212121` (`plugin_brand_color_dark_contrast`)
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
- `[ ]` Explicit `readOnlyHint`, `openWorldHint`, **and** `destructiveHint` on every tool
  (`annotations_required`) `[OA-ERR]` `[OA-SUB]`
- `[ ]` **A written justification for each hint value** (`justification_required`). Required by
  OpenAI, not by Anthropic. `[OA-ERR]` [OA-SUB]: "Explicit readOnlyHint, openWorldHint, and
  destructiveHint values and a justification for each value on every MCP tool."
- `[ ]` Successful tool scan against the production server (`scan_required`). [OA-SUB] adds
  "Re-scan after server changes before submitting new versions." `[OA-ERR]`
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
- `[ ]` Demo credentials that just work. [OA-SUB]: credentials must work "without MFA, SMS, email
  confirmation, or private-network access." [OA-APP] is blunter: "Apps requiring any additional
  steps for login—such as requiring new account sign-up or 2FA through an inaccessible
  account—will be rejected."
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

### Review flow
[OA-SUB]: submitting "starts review, doesn't auto-publish"; OpenAI reviews; the **developer**
then publishes the approved plugin from the portal. [OA-SUBP] on timing: "Review timelines may
vary as OpenAI builds and scales the review process." [OA-REV] closes the door on chasing it:
"Please do not contact support to request expedited review, as these requests cannot be
accommodated."

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
- Directory placement is not guaranteed. [OA-REV]: "Plugins appear on the directory's main pages
  only if OpenAI selects them for enhanced distribution."
- Press embargo. [OA-REV]: "Before issuing any press releases or public announcements regarding
  the launch of your plugin, please first reach out to press@openai.com"

---

## D. Platform work spanning B and C

### D.1 Tool annotations
Roughly 180 tools need `title` + `readOnlyHint`/`destructiveHint` + `openWorldHint`, driven by
[AN-REV], [AN-POL], [OA-ERR: annotations_required], and [OA-SUB]. Do it in one shared
registration helper and add a registry test that fails CI when an unannotated tool lands.
Handoff prompt exists for the platform repo. **Estimate 1–2 days.**

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
2. **Submit A (Claude plugin directory).** Nothing else blocks it. **1 hour.**
3. Platform repo: D.1 annotations, D.2 description rewrite, D.3 error audit. **3–4 days.**
4. Exercise every tool via MCP Inspector and as a custom connector; write the public docs page
   and the three example prompts. **1 day.** `[AN-REV]` `[AN-POL]`
5. **Submit B (Connectors Directory).**
6. OpenAI: identity verification, domain challenge, logo + composerIcon, manifest listing fields,
   8 test cases, starter prompts. **3–5 days.**
7. **Submit C (OpenAI).**

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
| ID | Source | Kind | Date |
|----|--------|------|------|
| `[C-DEV]` | [dev.to — "How to Submit Your MCP Server to Anthropic's Connector Directory (From Someone Who Did It)"](https://dev.to/qrflows/how-to-submit-your-mcp-server-to-anthropics-connector-directory-from-someone-who-did-it-143m) | **first-hand** submitter account | 2026 |
| `[C-SUN]` | [sunpeak.ai — "Claude Connector Directory Submission: Requirements, Annotations, and How to Pass Review"](https://sunpeak.ai/blogs/claude-connector-directory-submission/) | **second-hand** vendor blog restating and expanding the docs | May 2026 |
| `[C-GH14]` | [github.com/anthropics/claude-plugins-community issue #14](https://github.com/anthropics/claude-plugins-community/issues/14) | **first-hand** post-approval sync problem | Apr 2026 |

Second-hand sources are used above only for operational gotchas (WAF egress, JSON-only token
endpoints, payload size) that the official docs do not cover. Where they restate official
requirements, the official source is cited instead.

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
