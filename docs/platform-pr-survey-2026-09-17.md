# Open platform PRs and the MCP surface, surveyed 2026-09-17

Read-only survey of `metrifi/metrifi-platform` open PRs the day #416 merged, to decide what
ships before the OpenAI resubmission and what waits. The rule behind every call is in
[openai-submission.md](openai-submission.md) section 2: a handler fix deploys freely, anything
that changes a tool's name, description, schema, hints or the server instructions needs a new
reviewed version. Totals: 23 open. 8 change the tool surface, 2 are handler-only MCP changes,
1 touches OAuth, 12 are unrelated.

`McpDirectoryComplianceTest` (added by #416) fails any tool missing one of the four hints.
Four open PRs add 23 tools between them and none sets all four.

## A. Tool surface changes

| PR | Tools and change | CI | Mergeable | Hold label | Call |
|---|---|---|---|---|---|
| [#365](https://github.com/metrifi/metrifi-platform/pull/365) | `create-review`: `team_id` schema description | green | conflicting | no | rebase on #416, ship before resubmit (tenancy fix, one line) |
| [#273](https://github.com/metrifi/metrifi-platform/pull/273) | `set-experiment-workflow`: description rewritten; also edits the `build-experiment` prompt | green | conflicting | no | rebase, ship before resubmit |
| [#261](https://github.com/metrifi/metrifi-platform/pull/261) | `list-deliverables-needing-attention`, `list-deliverables`: `team_id` optional, adds `limit`/`offset`/`waiting_on` | green | conflicting | yes | after the decision |
| [#215](https://github.com/metrifi/metrifi-platform/pull/215) | `publish-site`: new `acknowledge_deletions` boolean | red | conflicting | yes | hold |
| [#183](https://github.com/metrifi/metrifi-platform/pull/183) | adds `extend-trial` (only `IsReadOnly(false)`) | green pre-#416 | conflicting | yes | hold; needs three hints |
| [#151](https://github.com/metrifi/metrifi-platform/pull/151) | adds `connect-form-provider`, `disconnect-form-provider`, `list-form-connections` plus a public `/connections/{provider}/callback` route | green pre-#416 | conflicting | yes | hold; hints missing on all three |
| [#148](https://github.com/metrifi/metrifi-platform/pull/148) | adds `check-forms`, `get-form-guidance` (only `IsReadOnly`) | green pre-#416 | conflicting | yes | hold; needs three hints each |
| [#53](https://github.com/metrifi/metrifi-platform/pull/53) | adds 17 personalization tools, zero annotations | red | conflicting | yes | hold; 164 to ~181 tools, guaranteed re-review |

## B. Handler-only MCP changes

| PR | Change | CI | Mergeable | Call |
|---|---|---|---|---|
| [#366](https://github.com/metrifi/metrifi-platform/pull/366) | `update-experiment` reads prompts without `TeamScope` so the cross-team check fires | green | conflicting | rebase, ship before resubmit |
| [#314](https://github.com/metrifi/metrifi-platform/pull/314) | `create-review`, `get-review`, `get-pending-feedback` output adds `raisedBy`/`createdAt` | green | mergeable | ship first |

## C. OAuth

[#309](https://github.com/metrifi/metrifi-platform/pull/309) adds `RequireMfa` middleware on the
`web` group and deliberately does not allowlist `oauth/*`. That puts an MFA challenge inside the
ChatGPT connect flow. Hold until after the decision, and walk the connect flow end to end before
it ever lands.

## D. Unrelated

#417, #415, #402, #395, #392, #380, #375, #363, #294, #291, #280, #274.

## Ship order

1. #314 (mergeable now)
2. #366 (rebase)
3. #365 (rebase; #416 rewrote `CreateReviewTool.php`)
4. #273 (rebase)

After 3 and 4 land, regenerate the surface snapshot so the submitted descriptions match
production. 1 and 2 alone would let us resubmit with unchanged definitions.

## Rebase traps

- Every MCP PR except #314 conflicts with #416, which touched about 120 tool files. Each rebase
  must add the four hints to any new tool.
- #183 and #151 edit the `PlatformServer` instructions string that advertised `list-tokens` and
  `revoke-token`. #416 deleted those tools. Drop the clause; do not re-merge it.
