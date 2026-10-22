# Anthropic resubmission notes

How to resubmit the MetriFi Claude plugin to Anthropic's plugin directory through the claude.ai
developer portal, after the 2026-08-05 Console submission was rejected without a scan. Checked
against the repo and Anthropic's published docs on **2026-10-19**. Background and the full
requirements research are in [submission-checklist.md](submission-checklist.md#a-claude-plugin-directory);
what happens after listing is in [marketplace-operations.md](marketplace-operations.md).

**Nothing in the plugin folder had to change.** `main` at `78d3ecf` (v1.4.18) already passes
every check below. The README and LICENSE the portal requires landed in the plugin folder on
2026-10-09 (`b1c67b6`). This document is the only addition.

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

1. **Merge this branch to `main`.** It changes no file in the plugin folder, so validation
   gives the same result before and after. Merging first keeps these notes on `main` and
   means the commit the portal validates is the one we intend to keep.
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
7. **Data handling.** Answer the four questions. Drafts are in
   [Data handling answers](#data-handling-answers-drafts-for-ryan); they need your decision.
8. **Compliance.** Confirm the contact email and select all four acknowledgements.
9. **Review and submit.** Confirm the plugin path is `plugins/claude/metrifi`, keep
   **GitHub push webhook**, select **Submit for review**, then **Set up push updates**.
10. **Record it.** Add the submission date, status and portal URL to section A of
    [submission-checklist.md](submission-checklist.md#a-claude-plugin-directory) in a docs PR.

The organization can create up to 10 submissions in 24 hours, drafts and withdrawn submissions
included, so a few validate and retry rounds are fine.

## Validate results

Run on 2026-10-19 against `78d3ecf` with Claude Code 2.1.302. Same result before and after this
branch, since it changes no file the checks read.

| Command | Result |
|---|---|
| `claude plugin validate plugins/claude/metrifi` | `✔ Validation passed`, no warnings, no errors |
| `claude plugin validate .` (marketplace) | `✔ Validation passed`, no warnings, no errors |
| `node tools/validate.mjs` | `✔ validation passed (metrifi plugin v1.4.18, claude + codex in sync)` |

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
| Repo under 50 MiB archived, under 10,000 files | Validation stops | About 2 MiB, 110 files |
| `name` lowercase, digits, hyphens, not reserved, not taken | Blocks | `metrifi`. No entry named or mentioning MetriFi in `claude-community` (2,283 entries) or `claude-plugins-official` (315), fetched 2026-10-19 |
| `displayName` and `author.name` in one writing system | Blocks | `MetriFi`, ASCII |
| `description`, `author`, `version` set | Warning | All set |
| README of 40+ words in the plugin folder, outside code blocks | Blocks | 563 words |
| `LICENSE` in the plugin folder or `license` in `plugin.json` | Blocks | Both |
| Every non-image file under 256 KiB | Policy hold | Largest is 36,983 bytes |
| 512 files or fewer | Policy hold | 46 |
| Only text, standard images and fonts | Policy hold | 46 text files, no binaries |
| `.mcp.json` valid; remote server has `type` and an `https://` URL | Blocks | One `http` server at `https://platform.metrifi.com/mcp` |
| No credentials in files; no credential read from the user's environment | Blocks / hold | None. The connector uses OAuth sign-in |
| No launchers (`npx`, `uvx`) or lockfile installs | Blocks / hold | None |
| No hooks, or a valid `hooks/hooks.json` | Blocks | No hooks |
| Valid YAML frontmatter, `description` a single text value | Blocks | All 13 skills parse with PyYAML; each description is a string |
| README describes everything the plugin runs, sends or fetches | Security scan rejects | Yes, section "What the plugin connects to, sends, and fetches". Every host named in the folder (`platform.metrifi.com`, `reports.metrifi.com`, `metrifi.com`, `claude.ai/design`, `github.com`) is disclosed there |

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

- **Runtime methodology.** Several skills load MetriFi's process documents through the MetriFi
  connector when they run. That is first-party content behind the user's own sign-in and the
  README says so, but a reviewer may read it as instructions pulled from an external source.
- **Proprietary license.** `LicenseRef-Proprietary`. The portal requires a license to exist,
  not an open one; listed plugins include "All rights reserved" and BSL-licensed repos (see
  [submission-checklist.md](submission-checklist.md#a-claude-plugin-directory)).
- **Optional third-party engine.** Two skills need the local `@pro-vi/designer` package, which
  the plugin does not install or run. It is disclosed in the README.
- **Sends email and publishes sites.** Some MetriFi tools email clients or publish a website.
  The README discloses this and says the skills act only on the user's approval.

## Data handling answers (drafts for Ryan)

The portal asks four questions. These drafts follow what the README already discloses. They are
statements about MetriFi's data practices, so confirm each against the
[privacy policy](https://metrifi.com/legal/privacy-policy/) before answering.

| Question | Draft answer |
|---|---|
| Does the plugin read or store personal data? | The plugin stores nothing itself. Through the MetriFi connector it reads the signed-in user's MetriFi account (name, email, teams, role) and MetriFi data for their team, including member contact details on deliverables and invitations and aggregate Google Analytics counts. Storage is on the MetriFi platform under its privacy policy. |
| Does it send data to services other than its declared connectors? | No. All reads and writes go through the declared `metrifi` connector. Some skills read public web pages with the host's own fetch tools, and two optional skills drive claude.ai/design through a local engine the user installs. |
| How long does it keep data? | The plugin keeps none. MetriFi retains account and platform data as its privacy policy describes. |
| Is it intended for people under 18? | No. It is for staff of credit unions, banks and MetriFi. |

## What this does not touch

The OpenAI review of v1.4.18 is open, and [openai-submission.md](openai-submission.md) lists
what must hold until its decision. This resubmission changes none of it:

- No version bump. The Claude and Codex manifests stay at `1.4.18`. A bump would rewrite the
  Codex manifest too, and is not needed because no plugin file changed.
- No change to skills, the Codex folder, `openai/`, `docs/openai-tool-justifications.md`, the
  MCP server URL, or its sign-in.
- Nothing on the platform side: the surface lock, Forge environment, reviewer account and
  demo data are untouched.

Once the directory follows `main`, every later merge that changes the plugin folder becomes a
new version it scans. That is how updates are meant to ship, and it has no effect on OpenAI,
which serves the skills ZIP uploaded to its portal.

## What could not be verified

- The portal's **Validate** report itself. It needs a signed-in Owner, so the table above is a
  manual walk of the published checks, not the portal's output.
- Whether the rejected Console submission still shows **Withdraw**. Step 2 covers both cases.
- Length limits on the listing's name or description. The docs publish none for plugin bundles.
  `plugin.json` `description` is 659 characters.
- The exact wording of the four compliance acknowledgements and the data-handling questions,
  beyond the summary in [Submit your plugin](https://claude.com/docs/plugins/submit).
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
