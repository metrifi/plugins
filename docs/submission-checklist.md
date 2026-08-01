# Directory submission checklist

Everything that must be true before we submit the MetriFi plugin and MCP server to
the three public directories. Sourced from the official review criteria plus
first-hand developer reports of what actually gets rejected.

There are **three separate submissions**, each with its own gate:

| # | Directory | What is listed | Where to submit |
|---|-----------|----------------|-----------------|
| A | Claude plugin directory (`claude-plugins-official` / Cowork / Desktop) | this GitHub repo | [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit) |
| B | Claude Connectors Directory (claude.ai + Desktop) | `https://platform.metrifi.com/mcp` | [claude.ai/admin-settings/directory/submissions/new](https://claude.ai/admin-settings/directory/submissions/new) |
| C | OpenAI Plugins Directory (ChatGPT **and** Codex, one listing) | plugin = MCP app + skills | [platform.openai.com/plugins](https://platform.openai.com/plugins) |

Status legend: `[ ]` not done · `[x]` verified done · `[!]` verified broken today

---

## 0. Verified findings as of 2026-07-23

These were checked against the live repo and the live server, not assumed.

- `[x]` Policy pages live and HTTP 200: [terms](https://metrifi.com/legal/terms-of-service/),
  [privacy](https://metrifi.com/legal/privacy-policy/), [cookies](https://metrifi.com/legal/cookie-policy/)
- `[x]` `claude plugin validate .` passes on the marketplace and on the Claude plugin dir
- `[x]` Repo is public (`metrifi/plugins`)
- `[x]` OAuth discovery is healthy:
  - `/.well-known/oauth-protected-resource` → 200, and also served at `/mcp` suffix
  - `/.well-known/oauth-authorization-server` → 200, `code_challenge_methods_supported: ["S256"]`,
    dynamic client registration endpoint present, public client (`token_endpoint_auth_methods: ["none"]`)
  - token endpoint accepts `application/x-www-form-urlencoded` and returns a structured
    OAuth error, not a generic 500 (this is a documented rejection cause)
- `[x]` Reviewer demo account populated: team `reviewer-test-account` with the
  `goldenpeakcu` site (brand, 4 rates, 1 scheduled rate change, 4 designed pages),
  GEO campaign 492 with 3 prompts and queued responses, CRO funnel 1978 on live GA
  data (234 → 7 → 1 users) plus comparison funnel 1979 and dashboard 1827
- `[x]` ~~No LICENSE file~~ **fixed**: `LICENSE` added, stating the existing
  proprietary terms from `NOTICE.md`
- `[x]` ~~3 of 4 skill descriptions exceeded OpenAI's 1,024-char limit~~ **fixed**:
  all four now 921–993 (were 1431 / 1273 / 1131 / 995)
- `[x]` ~~Codex manifest missing top-level `description`~~ **fixed**
- `[!]` **Codex manifest still missing `interface.logo` and `interface.composerIcon`**
  (needs a square icon asset, ≥48×48)
- `[!]` **`interface.shortDescription` is 156 characters; OpenAI's final limit is 30**
- `[?]` **Open question: does "closed-source is not accepted" bar a proprietary
  license?** Our repo is public and fully readable, which is what the rule appears
  to mean, but `NOTICE.md` and `LICENSE` explicitly say the contents are not open
  source and may not be redistributed. If a reviewer reads the rule as a licensing
  requirement rather than a visibility one, submission A is rejected. Worth asking
  Anthropic before submitting, or accepting the risk of one rejection round.
- `[!]` **Many MCP tool descriptions instruct the model how to behave**, which is an
  explicit Anthropic rejection pattern. See section D.2.

---

## A. Claude plugin directory

Automated validation and safety screening of the repo. No functional test of the MCP
server, so this one is **not blocked on the tool annotation work**.

### Eligibility
- `[x]` Public GitHub repo (closed source is rejected outright)
- `[ ]` Submitter signed in with a Console org role of Developer/Admin/Owner,
  **or** a claude.ai Team/Enterprise org with directory-management access.
  MetriFi has a claude.ai Team org, so either path works.

### Repo and manifest
- `[x]` `.claude-plugin/marketplace.json` valid, `name`/`owner`/`plugins` present
- `[x]` `plugins/claude/metrifi/.claude-plugin/plugin.json` valid with explicit `version`
- `[x]` `claude plugin validate .` and `claude plugin validate ./plugins/claude/metrifi` both pass
- `[x]` `license`, `repository`, and `keywords` added to the Claude `plugin.json`
- `[x]` `LICENSE` file at the repo root
- `[ ]` Marketplace `name` is not one of the reserved Anthropic names and does not
  imply Anthropic endorsement (`metrifi` is fine)

### Content quality
- `[x]` README documents install for Claude, Claude Code, and Codex
- `[x]` README links the privacy policy, terms, cookie policy, and a support contact
- `[x]` Skill frontmatter descriptions describe *when to use*, contain no instructions
  to call other tools, and no promotional language
- `[ ]` Plugin bundles a coherent job-to-be-done (Anthropic explicitly prefers plugins
  that bundle connector + skills + commands over single-tool plugins). We satisfy this.

### After approval
- Updates pushed to the repo are mirrored automatically; no re-submission needed.
- The public catalog syncs nightly, so there is a lag between "Published" status and
  the plugin appearing in `claude-plugins-community/marketplace.json`. At least one
  developer reported a multi-week gap here, so do not treat a delay as a rejection.

---

## B. Claude Connectors Directory

This is the one that functionally tests every tool. Highest bar, highest value for us,
since our buyers live in claude.ai rather than the CLI.

### Access
- `[x]` claude.ai Team org exists
- `[ ]` Submitting user has directory-management access (Owners have it by default)

### Tool design (the #1 rejection cause)
- `[ ]` Every tool has a `title`
- `[ ]` Every read-only tool has `readOnlyHint: true`
- `[ ]` Every mutating tool has an explicit `destructiveHint`
- `[ ]` Every tool has an explicit `openWorldHint` (needed for OpenAI too; harmless here)
- `[ ]` No tool name exceeds 64 characters
- `[ ]` No catch-all tool mixes read and write behind a `method`/`action` parameter
- `[ ]` Tool descriptions state what the tool does and when to invoke it, and nothing else
- `[ ]` No description instructs the model how to behave, tells it to avoid other tools,
  pulls behavior from an external source, or contains hidden/encoded instructions

### Functional quality
- `[ ]` Every tool returns a successful response for valid parameters
- `[ ]` Invalid input returns an actionable message, never a bare "Internal Server Error"
- `[ ]` Responses are scoped and paginated; no full-table dumps
- `[ ]` Token usage is proportional to the task (explicitly in the directory policy)
- `[ ]` No tool queries Claude's memory, chat history, conversation summaries, or user files

### Auth
- `[x]` OAuth 2.0 with PKCE S256
- `[x]` Protected Resource Metadata served
- `[x]` Dynamic client registration available
- `[x]` Token endpoint accepts form-encoded bodies
- `[ ]` `https://claude.ai/api/mcp/auth_callback` accepted as a redirect URI
- `[ ]` No credentials accepted via URL query parameters
- `[ ]` WAF/CDN does not block Anthropic egress on the discovery endpoints
      (verify from outside our network, this is a common silent failure)
- `[ ]` Streamable HTTP transport supported

### API ownership
- `[x]` Server calls MetriFi's own first-party API; domain matches the service
- `[ ]` For any third-party data we proxy (Google Analytics), confirm the ToS permits it

### Submission materials
- `[ ]` Public documentation URL live by the publish date (a help-center page is enough;
  it must let a reviewer connect and succeed within about 10 minutes)
- `[ ]` **Three example prompts** exercising different tools, with expected output
- `[ ]` Privacy policy URL (have it)
- `[ ]` Support contact
- `[ ]` Icon
- `[ ]` Server name ≤100 chars, tagline ≤55 chars, description ≤2,000 chars, 1–5 categories
- `[ ]` Permanent URL slug chosen (cannot be changed after publish)
- `[ ]` Test credentials for `reviewer@metrifi.com`, fully populated (done), reachable
      without MFA or manual provisioning
- `[ ]` Every tool exercised by us via MCP Inspector *and* as a custom connector in Claude
- `[ ]` Allowed link URIs declared if any tool uses `ui/open-link` (we return magic links;
      confirm whether that path uses `ui/open-link`). Only list origins MetriFi owns.
- `[ ]` Seven compliance attestations answered

---

## C. OpenAI Plugins Directory

One submission, appears in both ChatGPT and Codex. Most mechanical requirements of the three.

### Prerequisites
- `[ ]` Individual or business identity verified in the OpenAI Platform dashboard.
  Publishing under an unverified name is an automatic rejection.
- `[ ]` Submitting user has "Apps Management" write access in the org

### Domain verification
- `[ ]` Serve the exact challenge token at `https://platform.metrifi.com/.well-known/openai-apps-challenge`
- `[ ]` That endpoint returns **only** the token: no JSON, no list, no multiple tokens

### Manifest (`.codex-plugin/plugin.json`)
- `[x]` `description` at top level, ≤1,024 chars
- `[ ]` `interface.shortDescription` ≤30 chars at final submission **(156 today)**
- `[ ]` `interface.displayName` ≤30 chars (`MetriFi`, fine)
- `[ ]` `interface.longDescription` ≤4,000 chars
- `[ ]` `interface.developerName` ≤80 chars
- `[ ]` `interface.logo` — square, ≥48×48, ≤4096×4096, ≤5 MiB, png/jpg/webp/svg, path starts `./` **(missing)**
- `[ ]` `interface.composerIcon` — same constraints **(missing)**
- `[ ]` `interface.category` from OpenAI's 13 allowed values
- `[ ]` `interface.capabilities` ≤20 items, each ≤120 chars, single line
- `[ ]` `interface.defaultPrompt` ≤3 prompts, each ≤128 chars, unique, no `@mentions`
- `[ ]` `websiteURL`, `privacyPolicyURL`, `termsOfServiceURL`, `supportURL` — all HTTPS, ≤1,024 chars
- `[ ]` `brandColor` `#RRGGBB` with ≥2:1 contrast against white
- `[ ]` `brandColorDark` `#RRGGBB` with ≥2:1 contrast against `#212121`
- `[x]` `version` is valid semver and must be bumped for every resubmission
- `[x]` `mcpServers` declares `./.mcp.json` (an undeclared `.mcp.json` is silently ignored)

### Skills
- `[x]` **Every skill description ≤1,024 chars.** Done: all four now 921–993.
- `[x]` Each skill lives at `skills/<name>/SKILL.md` with `name` and `description` frontmatter
- `[x]` `plugin-name:skill-name` identity ≤64 chars
- `[ ]` Skill bundle ZIP ≤100 MB, ≤5,000 entries, no symlinks, no `..`, forward slashes only

### Tools
- `[ ]` Explicit `readOnlyHint`, `openWorldHint`, **and** `destructiveHint` on every tool
- `[ ]` A written **justification for each hint value** (OpenAI requires this; Anthropic does not)
- `[ ]` Successful tool scan against the production MCP server
- `[ ]` Responses stripped of debug payloads, session IDs, internal timestamps, secrets
- `[ ]` No tool reconstructs or infers the full chat log

### Testing materials
- `[ ]` **5 positive test cases**: user prompt, expected behavior, result shape, fixture data
- `[ ]` **3 negative test cases**: safe refusal or clarification
- `[ ]` Starter prompts showing realistic workflows
- `[ ]` Demo credentials that work with **no MFA, no SMS, no email confirmation, no VPN**
- `[ ]` Release notes describing function, submission type, changes, and test credentials
- `[ ]` Country/region availability selected

### Policy
- `[ ]` Not in a prohibited category (we are not)
- `[ ]` No advertising or sponsored content in responses
- `[ ]` Support contact published and monitored

---

## D. Platform work that spans B and C

### D.1 Tool annotations
Roughly 180 tools need `title` + `readOnlyHint`/`destructiveHint` + `openWorldHint`.
Do it in one shared registration helper, not 180 call sites, and add a registry test
that fails CI when a new tool lands unannotated. Handoff prompt exists for the
platform repo. Estimate 1–2 days.

### D.2 Tool description rewrite (larger than it looks)
Anthropic rejects descriptions that "tell Claude how to behave" or "interfere with
Claude calling other tools." Several MetriFi descriptions do exactly this today:

- `write-files`: "This is the ONLY way to edit a MetriFi site repo: never use a GitHub
  connector or git directly" — directly interferes with other tools
- `get-preview-url`: "Present openMagicLink to the user as a CLICKABLE link, and if you
  have any browser capability OPEN it automatically... never ask the user to log in"
- `create-site`: "confirm the slug with the user first... Relay a non-null warning verbatim"
- `list-teams`: "The user must choose a team before using other tools"
- `set-brand`: "never MetriFi's tokens on a client site"

These are good agent ergonomics and bad directory compliance. The fix is to move the
behavioral guidance into the plugin's skills and `SETUP.md`, where it belongs, and
leave each tool description as a factual statement of what the tool does. Budget an
extra 1–2 days on top of the annotation pass, and expect some real debate about
behavior regressions.

### D.3 Error messages
Audit the shared error handler so invalid input returns what was wrong and what a valid
value looks like. Reviewers call every tool with junk input.

---

## E. Order of work

1. ~~Trim the 3 over-length skill descriptions, add LICENSE, add `license`/`repository`/`keywords`
   to the Claude manifest, link policies from the README.~~ **Done 2026-07-23.**
2. **Submit A (Claude plugin directory).** Nothing else blocks it. **1 hour.**
3. Platform repo: annotations + description rewrite + error audit (D.1–D.3). **3–4 days.**
4. Exercise every tool via MCP Inspector and as a custom connector. Write the docs page
   and the 3 example prompts. **1 day.**
5. **Submit B (Connectors Directory).**
6. OpenAI: identity verification, domain challenge, logo/composerIcon, manifest rewrite,
   8 test cases, starter prompts. **3–5 days.**
7. **Submit C (OpenAI).**

## F. What no checklist can buy

Listing is achievable. "Anthropic Verified" and the curated `claude-plugins-official`
marketplace are at Anthropic's sole discretion, assessed automatically from usage, with
no application process. Do not plan around getting either.
