# Anthropic resubmission notes

How to resubmit the MetriFi Claude plugin to Anthropic's plugin directory through the claude.ai
developer portal, after the 2026-08-05 Console submission was rejected without a scan. Checked
against the repo and Anthropic's published docs on **2026-10-19**, and again on **2026-10-23**
for the Claude-only 1.4.19 readiness change (#49). Background and the full
requirements research are in [submission-checklist.md](submission-checklist.md#a-claude-plugin-directory);
what happens after listing is in [marketplace-operations.md](marketplace-operations.md).

**Submit from Claude 1.4.19 or later.** v1.4.18 passed the structural checks below, but would
likely have been held or rejected under the Directory Policy. The Claude-only 1.4.19 change
(#49) closes those gaps: it drops the two Claude Design skills, says where the process docs
come from (Policy 2F), rewords a line that read like a credential, and adds three example
prompts that run against the reviewer account's Golden Peak demo data, and a troubleshooting section to the plugin README (Policy 3C and 3E). The README and
LICENSE the portal requires landed in the plugin folder on 2026-10-09 (`b1c67b6`).

## Form values

| Step | Field | Value |
|---|---|---|
| Start | **What would you like to submit?** | **Plugin bundle** |
| Source | **Repository** | `metrifi/plugins` |
| Source | **Plugin path** | `plugins/claude/metrifi` (lowercase, exactly as in the repo) |
| Source | **Branch or tag** | `main` |
| Compliance | Contact email | `help@metrifi.com` |
| Review and submit | **How new versions reach the directory** | **GitHub push webhook** (the default) |
| Review and submit | **Auto-publish passing versions** | Leave at its default. The first version is published by a reviewer either way |

Do not paste a folder link into **Repository**. The plugin path is the field the Console form
lost last time, so type it into **Plugin path** and confirm it is still there on the
**Review and submit** step before you select **Submit for review**.

The **Listing details** step has no fields to type. It reads the name, display name and
description from `plugins/claude/metrifi/.claude-plugin/plugin.json` and shows
`plugins/claude/metrifi/README.md` as the listing's description. To change either, edit the
file, push, and select **Re-validate**.

## Step order

1. **Merge the #49 readiness PR to `main`.** The portal validates the newest commit on `main`,
   so the plugin folder must already hold the 1.4.19 changes.
2. **Withdraw the Console submission.** Sign in to the Claude Console as an admin of the MetriFi
   Console organization and open [Plugin submissions](https://platform.claude.com/plugins/submissions).
   - If it shows **Withdraw**, select it.
   - If it shows no **Withdraw** button (possible, since it is in a rejected state), email
     `directory@anthropic.com` instead and ask for the submission to be moved to the developer
     portal. Name the repository and path, and the organization it came from.
   - Until this is done, the portal can refuse **Submit for review** with **Already submitted
     by another organization**, because the Console organization and the claude.ai Team
     organization are different organizations and the first one to submit a folder holds it.
3. **Connect GitHub in the claude.ai Team org.** Sign in to claude.ai as an Owner of the MetriFi
   Team organization. The portal checks that the GitHub account connected **in this
   organization** can push to `metrifi/plugins`. A connection made in another organization
   does not carry over. Setting up the push webhook later also needs admin access to the repo
   on GitHub.
4. **Start the submission.** Open [claude.ai/directory/manage](https://claude.ai/directory/manage),
   select **Submit new**, then **Plugin bundle**.
5. **Source and Validate.** Enter the three Source values above and select **Validate**.
   Expected result: no **Blocking** findings. A **Policy hold** can still be submitted; see
   [Possible holds](#possible-holds-and-warnings). If you push anything after validating,
   select **Re-validate**: a result applies to one commit.
6. **Listing details.** Check the name reads `metrifi`, the display name `MetriFi`, and the
   description matches the README.
7. **Data handling.** Answer the four questions as in
   [Data handling answers](#data-handling-answers), once you have confirmed that wording.
8. **Compliance.** Confirm the contact email and select all four acknowledgements.
9. **Review and submit.** Confirm the plugin path is `plugins/claude/metrifi`, keep
   **GitHub push webhook**, select **Submit for review**, then **Set up push updates**.
10. **Record it.** Add the submission date, status and portal URL to section A of
    [submission-checklist.md](submission-checklist.md#a-claude-plugin-directory) in a docs PR.

The organization can create up to 10 submissions in 24 hours, drafts and withdrawn submissions
included, so a few validate and retry rounds are fine.

## Validate results

Run on 2026-10-23 against the #49 branch (Claude 1.4.19) with Claude Code 2.1.304.

| Command | Result |
|---|---|
| `claude plugin validate plugins/claude/metrifi` | `✔ Validation passed`, no warnings, no errors |
| `claude plugin validate plugins/claude/metrifi --strict` | `✔ Validation passed` |
| `claude plugin validate .` (marketplace) | `✔ Validation passed`, no warnings, no errors |
| `node tools/validate.mjs` | `✔ validation passed (claude v1.4.19, codex v1.4.18 frozen at v1.4.18 and unchanged; Claude-only differences match tools/hosts.json)` |

`claude plugin validate` only checks that files are well formed. The portal's **Validate** runs
the directory's own checks, which are listed in Anthropic's
[plugin pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist).
Each was checked by hand against the plugin folder:

| Directory check | Result if missed | Ours |
|---|---|---|
| Folder contains `.claude-plugin/plugin.json` | Blocks | Yes |
| One plugin per submission | Blocks | Yes. The Codex folder has no `.claude-plugin/` |
| No `.DS_Store`, `Thumbs.db`, `desktop.ini`, `__MACOSX` | Blocks | None tracked |
| No symlinks, submodules or LFS pointers | Blocks | None |
| Names valid on Windows and macOS; path is letters, digits, `.`, `-`, `_` | Validation stops | Yes |
| No `.gitattributes` with `export-ignore`, `export-subst` or `filter` | Validation stops | No `.gitattributes` at all |
| Repo under 50 MiB archived, under 10,000 files | Validation stops | About 2 MiB, 111 files (`git ls-files`) |
| `name` lowercase, digits, hyphens, not reserved, not taken | Blocks | `metrifi`. No entry named or mentioning MetriFi in `claude-community` (2,283 entries) or `claude-plugins-official` (315), fetched 2026-10-19 |
| `displayName` and `author.name` in one writing system | Blocks | `MetriFi`, ASCII |
| `description`, `author`, `version` set | Warning | All set |
| README of 40+ words in the plugin folder, outside code blocks | Blocks | 961 words |
| `LICENSE` in the plugin folder or `license` in `plugin.json` | Blocks | Both |
| Every non-image file under 256 KiB | Policy hold | Largest is 36,983 bytes |
| 512 files or fewer | Policy hold | 45 (`git ls-files plugins/claude/metrifi`) |
| Only text, standard images and fonts | Policy hold | 44 text files and one complete PNG, the 1024x1024 icon `assets/icon.png` |
| `.mcp.json` valid; remote server has `type` and an `https://` URL | Blocks | One `http` server at `https://platform.metrifi.com/mcp` |
| No credentials in files; no credential read from the user's environment | Blocks / hold | None. The connector uses OAuth sign-in |
| No launchers (`npx`, `uvx`) or lockfile installs | Blocks / hold | None |
| No hooks, or a valid `hooks/hooks.json` | Blocks | No hooks |
| Valid YAML frontmatter, `description` a single text value | Blocks | All 11 skills parse with PyYAML; each description is a string |
| README describes everything the plugin runs, sends or fetches | Security scan rejects | Yes, section "What the plugin connects to, sends, and fetches". Every service host named in the folder (`platform.metrifi.com`, `reports.metrifi.com`, `metrifi.com`, `github.com`) is disclosed in the README. `claude.ai` appears only as the name of a Claude app, and `example.com` (a `client-report` trigger phrase) only as a sample URL. The README also discloses the local audit scripts the fetched `client-report` process doc asks for |

Policy links return HTTP 200 (checked 2026-10-19): [privacy](https://metrifi.com/legal/privacy-policy/),
[terms](https://metrifi.com/legal/terms-of-service/), [SECURITY.md](https://github.com/metrifi/plugins/blob/main/SECURITY.md),
[platform.metrifi.com](https://platform.metrifi.com).

## Prior denial reasons

There has been one Anthropic decision on the plugin bundle: the Console submission of
2026-08-05, found rejected on 2026-10-09.

| Prior denial reason (verbatim) | Cause | How it is addressed |
|---|---|---|
| "We could not find a plugin at the folder you submitted (.). There is no usable .claude-plugin/plugin.json there, so nothing was scanned. The plugin is in 'plugins/claude/metrifi'. Resubmit with that folder and it will be scanned normally." | The Console form recorded the path as `.` (the repo root), although `plugins/claude/metrifi` was entered. The repo root holds a marketplace, not a plugin. | The new portal has its own **Plugin path** field. Enter `plugins/claude/metrifi` and confirm it on **Review and submit** (step 9). **Validate** runs against that path before submitting, so a wrong path now fails in front of you instead of in review. |
| No notice was sent: the rejection appeared only in the Console list, with no email to `ryan.harmon@metrifi.com`. | The Console form had no status tracking. | The portal shows a status per submission ([Track your submission](https://claude.com/docs/directory/submission-status)). Check it at [claude.ai/directory/manage](https://claude.ai/directory/manage) rather than waiting for email. |

Nothing was scanned last time, so the security scan and human review will be seen for the first
time on this submission. The checks they run are covered in the table above.

## Possible holds and warnings

None of these block submission. Each could put the version in **In review** with a hold.

- **Runtime methodology (Policy 2F).** `client-report` and `page-design-process` load MetriFi's
  process documents with the connector's `get-doc` and `get-core-rules` tools when they run.
  Both skills and the README now say this is first-party content from the plugin's own declared
  `metrifi` connector at `platform.metrifi.com`, and from no other source. Whether Anthropic
  accepts disclosure alone under 2F is not established. The fetched `client-report` process
  doc also tells Claude to run local scripts for its Stage 1 audit (a local shell, Node, and a
  local Chrome with Lighthouse); the README discloses this. If Anthropic holds the version on
  2F, the fallback is bundling those docs into the skills.
- **Platform docs still name the removed skills.** The connector's `get-doc` still serves
  `generate-claude-design-*.md`, and `client-report-process.md` and `website-dev-process.md`
  still route page design to those skills. Those docs live in metrifi-platform and are frozen
  with the OpenAI review, so a reviewer who reads them may see instructions this plugin no
  longer ships.
- **Proprietary license.** `LicenseRef-Proprietary`. The portal requires a license to exist,
  not an open one; listed plugins include "All rights reserved" and BSL-licensed repos (see
  [submission-checklist.md](submission-checklist.md#a-claude-plugin-directory)).
- **Sends email and publishes sites.** Some MetriFi tools email clients or publish a website.
  The README discloses this and says the skills act only on the user's approval.

## Data handling answers

The portal asks four questions ([Submit your plugin](https://claude.com/docs/plugins/submit),
step 4). The policy statements below quote only MetriFi's Security Policy, read from
`src/pages/ai-website-platform-security-policy/index.astro` in `bloomcu/ai-metrifi-com` on
2026-10-23. That page is not publicly readable yet: on 2026-10-23
`metrifi.com/ai-website-platform-security-policy/` returned 404 and the `ai.metrifi.com` copy
returned 401, so a reviewer cannot check these quotes. Use the Security Policy quotes only
once the page is published. Until then, rest each answer on the public
[privacy policy](https://metrifi.com/legal/privacy-policy/) and the README, and drop the
Security Policy quotes. That Policy states MetriFi's duties to clients under their Agreement with MetriFi;
other users are covered by the [privacy policy](https://metrifi.com/legal/privacy-policy/)
the README links. What the plugin itself does is from its README. These answers are
statements about MetriFi's data practices, so Ryan confirms them before they go in the portal.

1. **Does the plugin read or store personal data? Yes.** The plugin stores nothing; it has no
   scripts or files that keep data. Through its declared `metrifi` connector it reads the
   signed-in user's MetriFi account and their team's MetriFi records. The Security Policy
   defines that data: "Platform data means Client's team, user accounts and roles,
   connected-service credentials, analytics and campaign records, recommendations and review
   discussions." The plugin does not read connected-service credentials: none of its skills
   asks for them, and it carries no credentials and reads none from the user's machine. Sign-in uses multi-factor authentication, with "a time-limited one-time code
   sent to the account's email address" as the second factor. Analytics access is read-only
   ("Request read-only access when connecting Client's analytics"). For MetriFi clients, the
   Security Policy commits to "Store no nonpublic personal information at rest on the Products
   and Services" and to "Hold Client's Platform data in the United States."
2. **Does it send data to services other than its declared connectors? Yes, disclosed.** Every
   MetriFi read and write goes only to the declared `metrifi` connector. Disclosed in the
   README: the audit, review and GEO skills read institutions' public web pages with the Claude
   host's own browsing or fetch tools (the plugin adds none), and some MetriFi tools have the
   Platform send email or publish a website. The skills preview those actions and ask the user
   first; the Platform enforces the user's role, and the Security Policy is explicit that the
   publish instruction "is an instruction MetriFi gives the assistant, not a control MetriFi
   enforces; the enforced control is the role of the account the assistant acts for." Behind the
   connector, for MetriFi clients, the Policy commits to "Maintain a current list of the third
   parties that process Client's data or serve Client's website content, and provide it to
   Client on written request, subject to the frequency stated in Section 7.5 of the Agreement",
   to "Maintain the list of AI providers MetriFi uses and provide it to Client on written
   request, subject to the frequency stated in Section 7.5 of the Agreement", and to "Send no
   nonpublic personal information to any AI system in MetriFi's own processes."
3. **How long does it keep data?** The plugin keeps none. On the Platform, the Security Policy
   sets no fixed retention period. It says MetriFi "backs up the Platform database on an hourly
   and daily schedule to separate managed storage," keeps website history "for as long as the
   website exists on the Platform," and, "on termination of the engagement, MetriFi will revoke
   Client's Platform users, tokens and assistant connections" (the sentence goes on to remove
   MetriFi personnel from client-owned accounts).
4. **Is it intended for people under 18? No.** The Security Policy does not address age. The
   plugin is for staff of the credit unions and banks MetriFi serves, and of MetriFi; the Policy
   is written for such institutions (a site's compliance record holds "the institution's charter
   type, its deposit insurer").

## What this does not touch

The OpenAI review of v1.4.18 is open, and [openai-submission.md](openai-submission.md) lists
what must hold until its decision. The Claude-only 1.4.19 release changes none of it:

- Codex is frozen at `v1.4.18` (`6ef4817`), pinned in `tools/validate.mjs` itself, and
  `tools/hosts.json` must agree with that pin. CI (`tools/validate.mjs`)
  fails if anything under `plugins/codex`, `openai/`, `.agents/` or
  `docs/openai-tool-justifications.md` differs from that commit, and fails closed if the tag is
  missing or has moved. The Codex manifest stays at `1.4.18`; only the Claude manifest is
  `1.4.19`.
- `tools/release.mjs` releases Claude only while Codex is frozen: it never writes under
  `plugins/codex`, and refuses to run while anything there or under `openai/` is dirty.
- No MCP surface change. The MCP server URL, its sign-in, the surface lock, Forge environment,
  reviewer account and demo data are untouched.

Once the directory follows `main`, every later merge that changes the plugin folder becomes a
new version it scans. That is how updates are meant to ship, and it has no effect on OpenAI,
which serves the skills ZIP uploaded to its portal.

## What could not be verified

- The portal's **Validate** report itself. It needs a signed-in Owner, so the table above is a
  manual walk of the published checks, not the portal's output.
- Whether the rejected Console submission still shows **Withdraw**. Step 2 covers both cases.
- Length limits on the listing's name or description. The docs publish none for plugin bundles.
  `plugin.json` `description` is 650 characters.
- The exact wording of the four compliance acknowledgements and the data-handling questions,
  beyond the summary in [Submit your plugin](https://claude.com/docs/plugins/submit) (re-read
  2026-10-23).
- Whether a merged commit that touches only files outside the plugin folder counts as a new
  version. The docs say the directory "reads and scans only that folder".

## Sources

Fetched 2026-10-19:

- [Publish to the directory](https://claude.com/docs/directory/publish): who can submit,
  moving a Console submission, plugin bundle versus MCP connector
- [Submit your plugin](https://claude.com/docs/plugins/submit): the Source fields, GitHub push
  access, the form steps, statuses after submit, updates
- [Plugin pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist):
  every validation and scan check and its result
- [Plugin structure and testing](https://claude.com/docs/plugins/build): manifest fields, README
  and license, `.mcp.json`
- [Track your directory submission](https://claude.com/docs/directory/submission-status):
  statuses and the `directory@anthropic.com` contact
