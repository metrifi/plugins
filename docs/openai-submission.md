# OpenAI submission operations

How the MetriFi plugin gets into the OpenAI Plugins Directory (ChatGPT and Codex), what
invalidates a review while it is running, and what to do the next time we are rejected.

This is the OpenAI counterpart to [marketplace-operations.md](marketplace-operations.md),
which covers the Anthropic side. The one-time gate with every line item and citation is
[submission-checklist.md](submission-checklist.md) section C; this file is the part you
need six months from now when you are the one pressing Submit.

Source tags resolve in the [source registry](submission-checklist.md#source-registry) of
the checklist. `[LOCAL]` means we measured it ourselves on the stated date.

---

## 1. What OpenAI reviews and the two ways to fail

OpenAI reviews two different things, and they are judged against each other.

**The definitions.** Your `tools/list`: every tool name, title, description, input schema,
annotations, security schemes, `_meta` fields, and the server's own `instructions`. This is
snapshotted at submission. [OA-REV] calls it "a versioned API contract for the plugin."

**The behaviour.** What a tool actually does when the reviewer calls it against the live
server, and what it returns.

You fail when those two disagree, or when the behaviour breaks a content rule. Both of our
2026-09-17 rejection reasons were one of those two shapes.

### The four hints

Every tool must carry `readOnlyHint`, `destructiveHint`, `openWorldHint` and
`idempotentHint` as explicit booleans, plus a written justification for each value
([OA-SUB], error code `justification_required`). [OA-REF] marks only the first three as
required and `idempotentHint` as optional. **Ignore that.** The rejection email is explicit:
"Please confirm annotations are explicitly set to true or false (not null) for every tool."
A missing key reads as null, and null fails. This is exactly how we were rejected: 105 of
161 tools emitted no `idempotentHint`, because laravel/mcp only serialises it when the
`#[IsIdempotent]` attribute is present. `[LOCAL 2026-09-17]`

OpenAI's operational definitions, from [OA-REV], are stricter than the MCP spec's:

- `readOnlyHint: true` only if the tool "strictly fetches/looks up/lists/retrieves data and
  does not modify anything." Triggering a job, sending an email or enqueuing a task counts
  as a write even if it reads like a query.
- `destructiveHint: true` if the tool "can cause irreversible outcomes... even in only
  select modes, through default parameters, or through indirect side effects."
- `openWorldHint: true` if it "can write to or change publicly visible internet state";
  `false` "only if it operates entirely within closed or private systems (including
  internal writes)."

[OA-REV] also warns that prose loses to the server: "if your server advertises
`readOnlyHint: false`, describing the tool as 'functionally read-only' in the justification
doesn't make the tool read-only."

### The open-world rule we now use

**If the client page can show it, it is open-world.** That is the lesson from the rejection.
The three tools OpenAI named on appeal (`comment-on-feedback`, `resolve-feedback`,
`dismiss-feedback`) advertised `openWorldHint: false` while their own justifications said
the write is "shown in the client overlay" and "the client sees the reason." The reviewer
read the justification, read the annotation, and failed us on the contradiction.

The rule matches OpenAI engineering's definition, casey-chow 2026-05-14 [C-OA-ANNO]:
open-world "hints to the model that it has effects that are visible to someone other than
the current user." OpenAI Support gave a different and broader definition the same week
("anything outside the local sandbox") [C-OA-REJ2]. **Use the engineering one**; it matches
the published [OA-REV] wording. The fix pass flipped 18 tools to open-world true.

### Personal identifiers

The second rejection reason, verbatim: "A public plugin call returned caller-linked OAuth
token identifier data that was not required for the user's request." The culprit was
`list-tokens`, which returned Passport OAuth token ids as "(ID: ...)". `whoami` returned
the numeric user id, and `set-review-status` returned the deliverable share token.

[OA-REV]'s rule: "remove any unnecessary PII, telemetry/internal identifiers (for example,
session, trace, or request IDs; timestamps; internal account IDs; or logs) and any auth
secrets." [OA-GUI] adds: "Exclude diagnostic data, session IDs, timestamps, or logging
metadata."

Fixed in [metrifi-platform#416](https://github.com/metrifi/metrifi-platform/pull/416)
(merged 2026-09-17): `list-tokens` and `revoke-token` removed entirely, user id dropped
from `whoami`, share token dropped from `set-review-status`, explicit `idempotentHint`
everywhere (107 tools gained one, 18 flipped open-world true, 119 tools changed in total).
Result: 164 tools, 30,961 tokens. Justifications regenerated as v2 in
[openai-tool-justifications.md](openai-tool-justifications.md).

**We still carry internal integer ids** (team ids, funnel ids, campaign ids, commit SHAs) in
many responses. They survived this round. Audit them before the next one if the rejection
repeats.

---

## 2. Versioning: when a new version is required, and when you can just deploy

The rule, from
[app-review](https://developers.openai.com/plugins/deploy/app-review#how-published-mcp-metadata-versions-work):

> "You can deploy bug fixes without a new version if your tools match their published
> definitions and behavior. For changes like adding a tool, submit a new version for review."

So:

| Change | Needs a new version? |
|---|---|
| Handler bug fix, same inputs and outputs | no, deploy it |
| Performance, logging, internal refactor | no |
| Tool description, title or schema change | yes |
| Annotation change | yes |
| Adding or removing a tool | yes |
| Changing the MCP server `instructions` | yes |
| Any skill change | yes (see §3) |

What users see in the meantime is the reviewed snapshot, not your live server. casey-chow
(OpenAI), [C-OA-VERSION], 2026-04-30: "Your MCP server tool schema is snapshotted at the
time of submission, but is not served until publication... all actual tool calls still make
their way to your live server." And 2026-06-01: "If you're just changing tool descriptions,
make the changes in prod and submit the new version. We continue serving the old tool
descriptions until the new version is released." This is also why a shipped description
change never appears in ChatGPT on its own: published metadata is a reviewed snapshot and
reconnecting does not refresh it [C-OA-CACHE].

### Three version numbers, and how they relate

1. **Plugin version** in `plugins/codex/metrifi/.codex-plugin/plugin.json` (and its Claude
   twin). Bumped only by `node tools/release.mjs`, never by hand; the script writes both
   manifests so they cannot drift. See the Releasing section of the [README](../README.md).
2. **Portal version**, the `asdk_app_v_...` draft you create in the submission form. It
   must carry the same plugin version you shipped.
3. **`MCP_PUBLISHED_SURFACE`** in the platform repo, the config value that gates which
   tools the live server registers. New tools land behind it and stay unregistered until we
   raise it, so an in-flight review never sees a tool it did not scan. Documented in the
   platform repo at `docs/mcp-surface-versioning.md`.

**Every resubmission needs a strictly higher plugin version, in both the manifest and the
portal.** An unchanged version is the error `plugin_version_unchanged` [OA-ERR]. A rejected
version is spent; you cannot resubmit the same number. **Only one version may be in review
at a time** [OA-REV].

**The MCP origin is permanent.** [OA-REV]: "The MCP server origin (`scheme`, `hostname`, or
`port`) can't change between versions. To use a different origin, submit a new plugin with
the new MCP server origin." Ours is locked to `https://platform.metrifi.com/mcp` forever.
A move to a different host means a new listing and a new review from zero.

---

## 3. What invalidates an in-flight review, and how we prevent it

During the 2026-08-26 to 2026-09-17 review, the live server gained 3 tools and 11
description changes from unrelated platform work that had nothing to do with the
submission. Under the rule in §2, every one of those needed a new version. Nobody did it
on purpose; the MCP surface is just a side effect of ordinary feature work in another repo.

Three mechanisms keep that from happening again.

**The surface lock.** The platform repo commits a `tools/list` snapshot and CI fails if a
change moves it without the snapshot being regenerated deliberately. A handler fix leaves
the snapshot untouched and deploys freely. A new tool, a renamed field or a reworded
description shows up as a failing diff, which is the point. See
`docs/mcp-surface-versioning.md` in the platform repo.

**Version-gated registration.** `MCP_PUBLISHED_SURFACE` decides which tools register on the
live server. New tools merge to `main` and sit dark until the config is raised, so they
batch into the next submission instead of leaking into a review in progress.

**The skills ZIP snapshot.** Skills are uploaded to the portal as one ZIP of
`plugins/codex/metrifi/skills` at submission time. This is the biggest difference from the
Claude side: there, Anthropic's CI re-pins our SHA and skills track the repo. On OpenAI,
what you uploaded is what ships, so **a skill change waits for the next version** exactly
like a tool change. Scanning the ZIP is asynchronous and the portal warns it "may take up
to 2 hours"; skills must read Scanned, not Scanning, before you can submit. `[LOCAL 2026-08-26]`

**The demo video.** The portal blocks progress past the first screen without a video URL,
so it is a prerequisite for creating the draft rather than a last step. It must show the
tool set you are submitting, which means **record it after the surface PR lands, not
before**. Ours is `https://youtu.be/oPHlwMgO7Nk`, Unlisted, 3:04, recorded in ChatGPT
Developer Mode as `reviewer@metrifi.com`. Host it somewhere that returns 200 to a
non-browser client; `support.metrifi.com` sits behind a Cloudflare challenge and returns
403, which an automated check during review would fail. `[LOCAL 2026-08-25]`

Also worth holding: a PR that changes tool behaviour must not merge while a review is
running, even if it is a fix. [metrifi-platform#232](https://github.com/metrifi/metrifi-platform/pull/232)
moved side effects out of four read paths so `get-site`, `get-preview-url`,
`get-team-health` and `get-master-health` become read-only again. It was correct and it was
held, because merging it would have made the live server contradict the submitted
annotations mid-review.

---

## 4. Pre-submission gates

Run all of these on the day you submit, not the week before. `main` moves.

| # | Gate | How to check |
|---|---|---|
| 1 | Manifest field limits | `python3 -c "import json;d=json.load(open('plugins/codex/metrifi/.codex-plugin/plugin.json'));i=d['interface'];print(len(d['description']),len(i['shortDescription']),len(i['displayName']),len(i['longDescription']),len(i['developerName']))"` against 1024 / **30** / 30 / 4000 / 80. The short-description and display-name limits are 30 at final submission and 240 / 80 at draft validation, so a draft that validates can still fail submission [OA-ERR] |
| 2 | Skill descriptions under 1,024 | the Python one-liner in the note below. `tools/validate.mjs` does **not** check this. Measured 2026-09-17: 13 skills, 923 to 1,020 characters, all passing, with `exp-build` at 1,020 and `exp-sweep` at 1,014 `[LOCAL]` |
| 3 | Four hints, explicit booleans, on every tool | the platform's registry-walking test; then read the scanned form back and confirm no null. `idempotentHint` is the one that goes missing |
| 4 | Justification matches the hint | read `docs/openai-tool-justifications.md` for any justification that says the client, a recipient or a public page sees the effect while `Open World: False`. That exact contradiction is what got us rejected |
| 5 | Token count of `tools/list` | tiktoken `o200k_base` over the authenticated HTTP `tools/list`. Must stay under ~32,000. We sit at 30,961 `[LOCAL 2026-09-17]` |
| 6 | Listing URLs return 200 to a non-browser | `curl -sSI -A 'curl/8' <url>` on `websiteURL`, `privacyPolicyURL`, `termsOfServiceURL`, `supportURL`, and the demo video. Cloudflare challenges are the failure mode, not 404s |
| 7 | Demo video unlisted and reachable | oEmbed returns 200 and `isUnlisted:true`; it shows the submitted tool set |
| 8 | Negative prompts run unattached | run the three negative test cases with the plugin not attached, to confirm the refusal is real rather than the model declining to call a tool it does not have |
| 9 | Codex skill pre-flight | run OpenAI's `$chatgpt-app-submission` skill in Codex. It runs annotation-completeness and annotation-accuracy checks, which are the two things that rejected us. Use it as a linter and throw away its prose; its generated justifications are weaker than ours |
| 10 | Domain challenge still serving | `curl https://platform.metrifi.com/.well-known/openai-apps-challenge` returns the token and nothing else. No JSON, no list [OA-SUB]. Must be at the host root; the verifier strips the path [C-OA-SUBPATH] |
| 11 | Test credentials work cold | sign in as `reviewer@metrifi.com` in a clean session. Plain password, no 2FA, no email confirmation, no allowlist [OA-APP] |

Skill description measurement:

```
python3 - <<'EOF'
import re, glob, os
for p in sorted(glob.glob('plugins/codex/metrifi/skills/*/SKILL.md')):
    fm = open(p).read().split('---')[1]
    d = ' '.join(re.search(r'^description:\s*(.*(?:\n[ \t]+.*)*)', fm, re.M).group(1).split())
    print(len(d), os.path.basename(os.path.dirname(p)))
EOF
```

**Why gate 2 has its own paragraph.** `skill_description_too_long` is a hard reject at
1,024 characters [OA-ERR], and we have crossed it twice as `main` moved. It was fixed on
2026-07-23, then four descriptions had grown back past it by 2026-08-26 (`campaign-setup`
1242, `exp-deliver` 1226, `exp-research` 1081, `start` 1025) and were trimmed in v1.4.12.
Measure immediately before every upload.

---

## 5. The resubmission procedure

Assume the platform fix is merged and deployed, and the surface is final.

1. **Freeze the surface.** Confirm the committed `tools/list` snapshot in the platform repo
   matches production and that `MCP_PUBLISHED_SURFACE` names the version you are about to
   submit. Nothing that changes the surface merges from here until the decision lands.
2. **Measure.** Gates 2, 5 and 6 above. Record the tool count and the token count; you will
   need both in the release notes.
3. **Regenerate the justifications.** `docs/openai-tool-justifications.md` is the source of
   truth: one section per tool in `tools/list` order, four hint lines each, generated from
   the live annotations so the prose cannot drift from what the server advertises. Every
   tool in the scan needs an entry, and a tool with no entry blocks submission.
4. **Generate `chatgpt-app-submission.json`.** The form accepts an upload that populates App
   Info, the MCP section including per-tool justifications, and Testing. Build it from the
   justification set rather than typing 656 fields. Watch the import confirmation line; it
   reports imported, skipped, missing and mismatched counts, and anything non-zero in the
   last three means the tool names in the JSON and the tool names in the scan disagree.
5. **Bump the version.** `node tools/release.mjs --notes "..."`. Strictly higher than the
   rejected one, in both manifests. Never hand-edit.
6. **Create the new portal version** in the existing plugin, from the same project
   (`MetriFi`, global residency) and the same verified developer identity. Do not create a
   new plugin; the origin and the name must stay.
7. **Scan Tools.** Every time. [OA-SUB]: "Re-scan after server changes before submitting new
   versions." A stale scan is how an annotation fix fails to reach the reviewer.
8. **Upload the skills ZIP** of `plugins/codex/metrifi/skills` and wait for Scanned.
9. **Carry over from the last submission**, all of which is re-entered rather than
   inherited: three starter prompts; five positive and three negative test cases; test
   credentials in the `username: / password:` format the field shows; United States only (we do business only in the US);
   the seven policy checkboxes; "No" on mature content; the demo video URL.
10. **Release notes** should summarise plugin function, submission type, what changed since
    the rejected version, and test credential details [OA-SUB]. Name the rejection reasons
    and the fix explicitly; it costs nothing and the reviewer is reading for exactly that.
11. **Reload the form and confirm everything persisted** before hitting Submit for Review.
    We have had fields silently fail to save.

Expect weeks, not days. Timelines are unpublished and OpenAI Support states there is no SLA
and no expedited review [C-OA-SLA]. The observed pattern is that the review itself happens
within a day or two of submission and then sits: the queue-to-decision gap is the cost, so
a rejection costs a full cycle rather than a fast re-test [C-OA-T2] [C-OA-T1].

---

## 6. If we are rejected again

**Read the notice literally and completely.** Each reason is a published category from
[OA-REV], which lists them verbatim as section headers. Match the wording to the category
before theorising. Ours mapped to categories 4 (annotations do not match behaviour) and 2
(output offers extraneous information "including personal identifiers").

**Rejections do not name the tool.** They did not for us until we appealed. Developers have
burned four and five rejection cycles guessing [C-OA-REJ3] [C-OA-REJ4]. With 164 tools,
guess-and-wait is unaffordable, so appeal for specifics before rebuilding anything.

**Export the rejected version and diff it.** This is what actually found our bug. The export
carries `resources[].provided_tool_annotations` keyed by `action_name`, which is the
reviewer's view of our annotations. Counting nulls in it took minutes and answered a
question that a week of guessing would not have.

**Appeal by replying to the rejection email.** That is the path that worked and got us the
three tool names. Do not use `openai-review@openai.com`; it has bounced [C-OA-BOUNCE], and
casey-chow (OpenAI) said rejections would carry a webform instead. **Quote the
`asdk_app_...` ID, not a support case number**: casey-chow, [C-OA-NOEMAIL], "Case ID is
actually more of a historical artifact... it's hard to correlate from that."

**Plan for no feedback at all.** Rejection emails have arrived blank [C-OA-BLANK], with no
email at all and status flipping silently [C-OA-NOEMAIL] [C-OA-FLIP], and support has said
they cannot see review notes and to just fix and resubmit.

Known fallbacks, in order of likelihood:

- **Developer name.** If the reason is "The developer name you entered does not match your
  verified individual or business name" [C-OA-REJ1], change `interface.developerName` and
  the form's Plugin Author from `MetriFi` to **`BloomCU LLC`**, our legal entity, bump the
  version and resubmit. OpenAI Support names branding-vs-legal-name as a trigger even for
  small differences [C-OA-REJ4].
- **`manage-review-item`.** Our one catch-all tool: `assign` and `delete` behind a single
  `action` enum, annotated destructive so nothing is understated. If review objects to a
  tool doing two unrelated things, split it. That is a behaviour change and needs a version.
- **Token ceiling.** If the scan fails with `Internal service error` rather than a review
  rejection, the surface is too big. The only lever left is cutting input schemas on the
  manifest and review-spec tools; a `ref` upload path already exists for the manifest.

---

## 7. What we got wrong so far

Honest list, dated, so nobody repeats them.

- **2026-08-26, two bump-only releases.** v1.4.10 and v1.4.11 shipped claiming a
  skill-description trim they did not contain, because the release script ran after a failed
  length check. The trim landed in v1.4.12 and both changelog entries were corrected to say
  "Version bump only." Two version numbers spent on nothing.
- **2026-08-26, skill descriptions regressed unnoticed.** Fixed on 2026-07-23, back over the
  1,024 limit a month later as GEO releases landed. Nothing in CI caught it, and nothing in
  CI catches it today.
- **2026-09-17, rejected on `idempotentHint`.** We read [OA-REF], which marks it optional,
  and shipped 105 of 161 tools without one. The rejection email's "not null" language is the
  authority, not the reference table.
- **2026-09-17, rejected on our own justifications.** Three tools said `openWorldHint: false`
  while their justification text said the client sees the effect. We wrote the evidence
  against ourselves and handed it in.
- **2026-09-17, rejected on `list-tokens`.** A tool that listed OAuth token identifiers had
  no business being on a public listing at all. It was removed rather than trimmed.
- **Through the review, 3 tools and 11 description changes shipped to production.** Ordinary
  platform work invalidated the snapshot under review and nobody noticed until we read the
  versioning rule properly. The surface lock exists because of this.
- **The demo video is a prerequisite, not a last step.** The portal would not open screen 2
  without a URL, so it was recorded before the tool set was final. It still shows tools we
  submitted, so it survives; a resubmission that changes what a reviewer would see needs a new
  one. Have the surface final before you start the draft.
- **2026-09-18, the release script has no `--help`.** Any unknown flag is ignored and the script
  cuts a real release with the notes "(describe changes)". It happened once, locally, and was
  reset before anything was pushed. Use `--dry-run` to look before releasing.
- **2026-09-18, the release script's `git push` fails in a worktree with no upstream.** The commit
  and tag are already made by then. Push by hand: the branch, `HEAD:main`, and the tag.
- **2026-09-18, boilerplate justifications hid wrong hints.** About 60 write tools shared one
  sentence for "idempotent: true". Reading each handler (platform #426) found 18 that make a new
  commit, version, log row or paid API call on a repeat. A justification has to say what the
  handler does on a second identical call, or it proves nothing.
- **2026-09-18, the rejected-version export contains the reviewer password in clear text.** Treat
  any `metrifi-*.json` export from the portal as a secret. Never commit one.
