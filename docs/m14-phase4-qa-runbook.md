# M14 Phase 4: cross-host QA runbook

For Ryan and Kaili, run on real machines. Two operators, two hosts, one QA team on prod.

Everything here is executed by hand by a person. No agent runs `tools/release.mjs`, and nothing in
this runbook touches a client team, a client inbox, or a client URL.

Read alongside: the plugin install paths in [`../README.md`](../README.md) and the paste-in prompts in
[`../install-prompt.md`](../install-prompt.md). The plan this closes out is
`plans/m14-plugin-experiment-skills.md` in the metrifi-platform repo (Phase 4 plus the workstream
smoke list); its Phase 4 status block is where section 5's table gets pasted.

Budget: about 90 minutes per host for the full script, plus 20 minutes for the operator swap. Two
sittings is fine, because all state lives on the platform and either operator can resume.

## 1. Scope and pass criteria

**What is being tested:** a full experiment (research, build, review, deliver) driven only by the
seven GEO skills in the MetriFi plugin, from a fresh profile that has the MetriFi plugin and nothing
else, on both hosts.

Phase 4 passes when all six hold:

1. **Claude Code leg:** research, build, review, and deliver all complete against the QA team, and
   the deliver step's send goes to the operator's own inbox.
2. **Codex leg:** the same install path works (`codex plugin marketplace add`, `codex plugin add`,
   `codex mcp login metrifi`), and at minimum `start`, `exp-status`, and one write skill run. Any
   Codex behavior that differs from Claude Code is recorded in section 5, not worked around.
3. **Fresh profile, plugin only:** no `pip`, no `npx`, no `brew`, no dotfile edits, no local repo
   checkout, no API key pasted anywhere. The only credential is the MetriFi sign-in.
4. **No local artifacts:** after the full run, the working directory and home directory carry no
   experiment folder, manifest, report file, or cursor file. All workflow state is readable from
   `get-experiment-workflow` alone.
5. **Operator swap:** operator A creates the experiment on machine A, operator B picks it up on a
   different machine with zero file handoff. The only thing passed between them is the team name, in
   chat or out loud.
6. **The send gate is real:** one deliberately refused send, refused by name for a missing check, then
   allowed after the check is recorded.

A step that needs the operator to do something the skill did not tell them to do is a deviation, even
if the outcome was right. Record it.

## 2. Setup per host

Do this on a profile that has never had the plugin. On Claude Code that means a fresh
`~/.claude/plugins` state (or a clean user account); on Codex a profile with no `metrifi` plugin
installed. If you are reusing a machine, uninstall first and delete the MetriFi plugin cache folders
named in [`../install-prompt.md`](../install-prompt.md) step 1.

### Claude Code

```
claude plugin marketplace add metrifi/plugins
claude plugin install metrifi@metrifi --scope user
```

Then sign in once: Settings -> Connectors -> **MetriFi** -> Connect, and complete the MetriFi
sign-in in the browser. In Claude Desktop the panel path is the same; in the CLI, `/plugin` shows the
same marketplace and plugin state.

Verify, in this order:

1. Start a **new conversation** (the plugin's tools and skills load per conversation).
2. Run `/plugin` and confirm `metrifi` is listed as installed and enabled.
3. Ask: `Who am I on MetriFi?` A `whoami` result means the connector is authorized. An authorization
   error here means the Connect step did not finish.
4. Ask: `Which MetriFi GEO experiment skills do you have?` Expect all seven by name: `start`,
   `exp-status`, `exp-research`, `exp-build`, `exp-review`, `exp-deliver`, `exp-revise`.
5. Invoke one explicitly (`use the start skill`) and confirm it reads its own
   `references/workflow-overview.md` rather than asking you for a file.

### Codex

```
codex plugin marketplace add metrifi/plugins
codex plugin add metrifi@metrifi
codex mcp login metrifi
```

The login opens a browser to the MetriFi sign-in and waits only a couple of minutes, so approve it
right away. Codex has no plugin auto-update yet; `codex plugin marketplace upgrade metrifi` is the
manual refresh.

Verify, in this order:

1. Start a **new conversation** in Codex (this is what makes the `metrifi` server show connected).
2. Ask: `Who am I on MetriFi?` and expect the same `whoami` result as the Claude leg.
3. Mention a skill by name to invoke it explicitly: `$start`. Codex matches implicitly on the
   description too, so also try a plain ask (`where do my GEO experiments stand?`) and note which
   skill it picks. Wrong-skill routing is a finding worth recording, because the descriptions are the
   routing layer on this host.
4. Confirm all seven are visible. The plugin list subcommand varies by Codex version, so if
   `codex plugin list` is not available on your build, verify behaviorally instead: invoke `$start`,
   `$exp-status`, and one `$exp-*` write skill and confirm each loads.

## 3. QA safety rails, non-negotiable

These are not suggestions. Any one of them broken ends the run and gets reported before continuing.

1. **A dedicated QA team, created fresh for this.** Run `create-team` with a name that cannot be
   mistaken for a client, for example `M14 QA (test data, do not use)`. Never run this script against
   Listerhill or any other real client team. Confirm the team slug you got back before the first
   write, and re-confirm it on the second host.
2. **Never pass `client_email`.** Not on a preview, not on a real send, not once. Passing it captures
   a client participant on the record and opens the followup path. The QA run has no client.
3. **Sends stay inside the operator's own inbox.** Set every action item's `assignee_email` to the
   operator's own address, so the only participant on the deliverable is the operator and even an
   unexpected successful send lands on the operator. Use `preview: true` for every rehearsal, and
   treat the one real send in section 4 as real anyway: name the recipient out loud first.
4. **Never surface a client URL.** The magic link stays out of chat, out of notes, out of this
   runbook's results, and out of the deviations table. After the QA send it is fine to read it back
   from `get-deliverable` on the operator's own screen.
5. **DataForSEO spend stays under a couple of dollars.** `research-keywords` bills per keyword looked
   up live. So: one batch per host, 40 to 60 keywords, and **never** `refresh: true` in a loop. The
   30-day cache is the point: the second host should reuse the first host's numbers, which costs
   nothing. If a batch returns all zeros, check the phrasing against methodology rule 2 before you
   spend a single refresh, and take at most one refresh per host.
6. **Two hosts, one experiment.** Do not create a second QA experiment for the Codex leg unless the
   script says to. Reusing the Claude leg's experiment is what proves the state model.
7. **`send-deliverable-followup` is out of scope.** It nudges a client contact, and there is no client
   here. Do not call it.

## 4. The script

Run steps 1 through 6 on Claude Code first, then the Codex leg (step 7), then the swap (step 8). At
each step, "pass" is what an operator can see without opening a file.

### Step 1: orient (`start`)

Invoke `start`. Pass: it calls `whoami` and `list-teams`, reports the QA team, reports nothing in
flight, names the three human gates, and asks the three scoping questions before writing anything.
Fail: it creates a campaign or a prompt before you answered all three.

### Step 2: research (`exp-research`)

Give it a concrete topic with geography, for example "homeowners in north Alabama comparing a HELOC
against a cash-out refinance". Ask for the **dry run** first.

Pass: the dry run creates the campaign and nothing else, reports a demand table with keep and drop
verdicts, and stops. Then, on your go, it creates a draft experiment with **no dates**, creates only
the kept prompts, records every verdict including the drops, runs the prompts, and reports
`get-campaign-readiness` once with no polling loop. Fail: a prompt containing a brand name, a prompt
created for a dropped candidate, a poll loop, or a `started_at` on the experiment.

Responses populate over minutes to hours. This is the natural break between sittings.

### Step 3: build (`exp-build`)

Once readiness is at or above the 80 percent line, invoke `exp-build`.

Pass: it reads readiness first and refuses to score a half-populated campaign; it samples at least
four responses per candidate prompt; it opens with the Viability Verdict block; it locks a target or
pivots by the ladder (and returns a re-campaign pivot to you rather than executing it); it writes
`build-analysis`, `evidence`, and `decisions` with the rejected alternatives; it drafts the article
with no rate numbers in the body and no em dashes; `build-deliverable --dry_run` passes the contract;
and it does **not** hand you the client URL. Fail: any of those inverted, especially a URL in chat or
a real build before a dry run.

Set every action item's `assignee_email` to your own address here (rail 3).

### Step 4: the deliberately refused send

Do this before running the review skill, on purpose.

1. Ask `exp-deliver` to build with `status: "ready"` while the four checks are still missing.
2. Ask it to send for real. Say yes when it asks.
3. **Pass:** `send-deliverable` refuses and the refusal names the missing checks (`hygiene`,
   `ncua-compliance`, `accessibility`, `fact-verification`). The skill reports the refusal as the way
   through and does **not** lower the status, does not record a check nobody ran, and does not call
   the preview a send. Fail: it works around the gate in any way, or it treats the refusal as an error
   to retry unchanged.

Because the only participant is you (rail 3) and `client_email` is never passed (rail 2), a send that
unexpectedly succeeds here still lands only in your own inbox. That is the safety net, not the test.

### Step 5: review (`exp-review`)

Invoke `exp-review`. Pass: it asks for the institution name, charter type, website root, and field of
membership **once, in one message**; it runs the four batteries in order (hygiene, NCUA,
accessibility, fact) one at a time; each battery writes its report document and records its verdict
before the next starts; findings quote exact passages; it writes the `review-summary` rollup; and it
records `add-experiment-event` with a stable `idempotency_key`. Fail: batched recording at the end,
four `pass` results with empty findings arrays, or a rewritten article it did not walk with you.

Deliberate check: interrupt after two batteries and re-invoke. Pass: two recorded results survive and
the run resumes rather than starting over.

### Step 6: deliver (`exp-deliver`)

Pass, in order:

1. `build-deliverable` with `dry_run: true`, then for real with a one-line `changelog`, and it reads
   the warnings back to you in plain language.
2. `send-deliverable(preview: true)` with no `client_email`, and **the preview email actually arrives
   in your inbox**. Read it.
3. It names who receives the real send and asks for an explicit OK. It does not proceed on "sounds
   good" about something else.
4. The real send goes, refused-then-allowed now that the checks are recorded, and it lands in your own
   inbox because you are the only participant.
5. It logs the send with `add-experiment-event` and a stable `idempotency_key`, and writes a handoff
   note through `set-experiment-workflow`.

Fail: any send without the preview first, any `client_email`, or the client URL surfaced before the
send.

**Then check rail 4 of the pass criteria:** search your home directory and working directory for
anything the run wrote. There should be nothing.

### Step 7: the Codex leg

Same QA team, same experiment. Minimum coverage: `$start`, `$exp-status`, and one write skill. The
write skill that costs nothing extra is `exp-review` re-run on a staled check, or `exp-revise` if the
Claude leg left client activity; otherwise use `exp-build` to rewrite one document with
`set-experiment-document`.

Pass: identical answers to the Claude leg for the read-only skills (same experiment, same status, same
checks), the bundled `references/` files load by relative path, and no skill asks you to install
anything. Record every behavioral difference in section 5, including cosmetic ones like a skill being
matched implicitly on a different phrase.

### Step 8: the operator swap

1. Operator A finishes step 3 (build) on machine A and tells operator B only the QA team name.
2. Operator B, on a different machine, on either host, invokes `exp-status`.
3. **Pass:** B gets the experiment, its status, A's handoff note verbatim, the deliverable, which
   checks are missing or stale, and what is waiting on a human, with zero files handed over. B then
   runs `exp-review` (or `exp-deliver`) to completion.
4. Fail: B has to ask A for an id that `list-experiments` would have given, or B's rollup disagrees
   with A's screen.

Run the swap in both directions if time allows. One direction is the pass bar.

## 5. What to record

One row per deviation, per host. Paste the finished table into the M14 plan's Phase 4 status block
(`plans/m14-plugin-experiment-skills.md` in metrifi-platform). No client URLs, no client emails, no
magic links in this table.

| Host | Step | Expected | Actual | Severity | Skill or tool |
|---|---|---|---|---|---|
| Claude Code | 2 research | dry run creates campaign only | | blocker / minor / note | exp-research |
| Codex | 7 read-only | same rollup as Claude leg | | | exp-status |

Severity: **blocker** stops the release, **minor** ships with a follow-up issue, **note** is a copy or
routing observation worth keeping. Also record, in prose under the table:

- The four setup facts per host: host version, install commands that worked, whether all seven skills
  were visible, and whether sign-in worked first try.
- Total DataForSEO keywords looked up per host, and any refresh you spent.
- Anything a skill asked the operator to do that it should have done itself.
- Anything that needed a local file, a runtime, or a paste to work around. This is the criterion the
  whole workstream turns on, so write it plainly if it happened.

## 6. Go/no-go for the two one-way doors

Both doors are Ryan's, and both come after QA passes. Neither is ever executed by an agent.

### Door 1: `tools/release.mjs` publish

**Ryan runs this by hand. No agent, ever, for any reason.** It bumps both manifests, syncs, validates,
commits, tags, and pushes to both marketplaces, which puts the skills on every installed client at
their next update.

Go requires all of:

- [ ] All six pass criteria in section 1 met, on both hosts.
- [ ] Zero blocker-severity deviations open in section 5.
- [ ] `node tools/release.mjs --sync-only` then `node tools/validate.mjs` both green on the branch
      being released, with nothing to commit afterwards.
- [ ] CI green on `main` after the last punch-list PR merged.
- [ ] The QA team is understood as test data (nobody has to clean it up first, but nobody mistakes it
      for a client either).
- [ ] Release notes written: `--notes` names M14, the seven skills, and the reference set.
- [ ] Ryan has decided the version bump (patch, minor, or explicit `--set X.Y.Z`).

### Door 2: archiving `paraloom-plugin`

Go requires door 1 done and published, plus:

- [ ] The published plugin verified from a fresh profile on at least one host, after the publish.
- [ ] The pointer README written: it names the `metrifi` plugin, the install path, and
      `plans/m14-plugin-experiment-skills.md` as the reason.
- [ ] Nothing still points customers or staff at `paraloom-plugin` as the interim path.
- [ ] **Ryan's explicit go, in writing.** Until then `paraloom-plugin` stays the documented interim
      path.

Until both doors close, the QA team stays on prod as the record of what was tested.
