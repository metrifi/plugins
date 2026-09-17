# MCP tool annotation justifications (OpenAI review form, v2 for the resubmission)

164 tools, tools/list order, four hints each. Regenerated 2026-09-17 after the rejection: every tool now carries an explicit idempotentHint and the open-world rule is "the client can see it".


## list-teams

- **Read Only: True** — Read-only: List the teams the caller owns or belongs to, with each team's slug, role and member count. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-team

- **Read Only: False** — Not read-only, it writes stored state: Create a team owned by the caller and its tracked organization.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call creates a new team and organization, so a repeat call creates a second one.

## get-team-usage

- **Read Only: True** — Read-only: Report one team's quota usage, plan, billing period and subscription status for every MetriFi product. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## whoami

- **Read Only: True** — Read-only: Report the authenticated user: name, email, platform role, current team, team memberships with roles, and pending invitations. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## rename-team

- **Read Only: False** — Not read-only, it writes stored state: Change a team's display name.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## switch-team

- **Read Only: False** — Not read-only, it writes stored state: Set the caller's active team.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-members

- **Read Only: True** — Read-only: List a team's members with roles and numeric user ids, plus its pending invitations. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## invite-member

- **Read Only: False** — Not read-only, it writes stored state: Invite an email address to a team and send the invitation email.
- **Open World: True** — Sends an invitation email to an address outside the caller's own account.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — A repeat call sends the invitation email again.

## revoke-invitation

- **Read Only: False** — Not read-only, it writes stored state: Revoke a pending invitation by email, removing the pending membership and any outstanding sign-up link.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## accept-invitation

- **Read Only: False** — Not read-only, it writes stored state: Accept a pending team invitation.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## decline-invitation

- **Read Only: False** — Not read-only, it writes stored state: Decline a pending team invitation and drop the pending membership.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## remove-member

- **Read Only: False** — Not read-only, it writes stored state: Remove a member from a team.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## set-member-role

- **Read Only: False** — Not read-only, it writes stored state: Change a member's team role.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## transfer-team-ownership

- **Read Only: False** — Not read-only, it writes stored state: Hand a team to a new owner, attaching them as an accepted member if needed and leaving the outgoing owner an admin.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-super-admins

- **Read Only: True** — Read-only: List MetriFi platform staff: the Super Owners set in committed config and the super_admins they have granted. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-platform-role

- **Read Only: False** — Not read-only, it writes stored state: Grant or revoke MetriFi super_admin, which is cross-tenant staff access to any team.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-all-teams

- **Read Only: True** — Read-only: List every team on MetriFi with slug, name, plan, owner, member count and top-customer flag. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## find-users

- **Read Only: True** — Read-only: Search every MetriFi user across all teams and return user_id, name, email, platform role and verification status. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-campaigns

- **Read Only: True** — Read-only: List a team's GEO campaigns with their names and descriptions. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-campaign

- **Read Only: True** — Read-only: Get one campaign's name, description, location and keywords. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-campaign

- **Read Only: False** — Not read-only, it writes stored state: Create a GEO campaign, which groups prompts, organizations and responses for visibility tracking.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new campaign row.

## set-campaign-location

- **Read Only: False** — Not read-only, it writes stored state: Set the geography a campaign's keyword demand is measured in, so research-keywords returns local volume alongside national.
- **Open World: True** — Resolves the place name against DataForSEO's location API, an external service.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-prompts

- **Read Only: True** — Read-only: List a campaign's prompts with the percentage of LLM responses in which the team's organization appears. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-prompt

- **Read Only: True** — Read-only: Get one prompt's content text, associated terms and any in-progress response jobs. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-prompt

- **Read Only: False** — Not read-only, it writes stored state: Create a prompt in a campaign: the question sent to LLM providers to measure which brands get mentioned.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new prompt row.

## list-responses

- **Read Only: True** — Read-only: List the LLM responses recorded for one prompt: provider, model, content and status. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-response

- **Read Only: True** — Read-only: Get the full untruncated text of one LLM response. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-org-visibility

- **Read Only: True** — Read-only: Rank organizations by visibility in one campaign: mention count, visibility percentage and rank against competitors. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-team-report

- **Read Only: True** — Read-only: One consolidated snapshot of a single team: quota usage, campaigns, experiments, client deliverables and AI bot traffic, in place of calling those. It changes no stored state.
- **Open World: True** — Includes AI bot traffic read from the external Supabase analytics store.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## run-prompt

- **Read Only: False** — Not read-only, it writes stored state: Queue one prompt against the LLM providers this platform runs (openai only today) and consume team quota.
- **Open World: True** — Queues the prompt against an external LLM provider (OpenAI) and consumes team quota.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call queues another provider run and consumes more quota.

## run-campaign-prompts

- **Read Only: False** — Not read-only, it writes stored state: Queue every prompt in a campaign against the LLM providers this platform runs (openai only today) and consume team quota per prompt.
- **Open World: True** — Queues every prompt in the campaign against an external LLM provider (OpenAI).
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call queues another run per prompt and consumes more quota.

## get-experiment-insights

- **Read Only: True** — Read-only: Report which action types, tags and citation sources correlate with visibility gains, aggregated across all finished experiments on the platform. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-experiments

- **Read Only: True** — Read-only: List a team's experiments: workflow status, outcome, visibility, dates, live-date source. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-experiment

- **Read Only: True** — Read-only: Get one experiment in full: metrics, analysis, recommendation, actions and case study. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-experiment

- **Read Only: False** — Not read-only, it writes stored state: Create an experiment, which groups prompts and deliverables to measure whether work actually raised brand visibility.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new experiment row.

## update-experiment

- **Read Only: False** — Not read-only, it writes stored state: Update an experiment's fields, dates and attached prompts.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## set-experiment-analysis

- **Read Only: False** — Not read-only, it writes stored state: Write an experiment's analysis of the LLM responses for its target prompts: which organizations appear, which sources are cited, and why.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## set-experiment-recommendation

- **Read Only: False** — Not read-only, it writes stored state: Write an experiment's strategic recommendation and its prioritized tactical actions, replacing any existing ones.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## set-experiment-case-study

- **Read Only: False** — Not read-only, it writes stored state: Write an experiment's case study: problem, strategy, results and takeaways as a narrative.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-action-types

- **Read Only: True** — Read-only: List the action types that categorize experiment recommendation steps. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-ai-user-bot-traffic

- **Read Only: True** — Read-only: Report visits to the team's website from end-user-driven AI bots such as ChatGPT-User, Claude-User and Perplexity-User, with per-bot totals and top. It changes no stored state.
- **Open World: True** — Reads bot-traffic rollups from the external Supabase analytics store.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-team-health

- **Read Only: True** — Read-only: Cross-team triage queue: which teams need attention, which are healthy, which are dormant, in priority order with a verdict, reason and next action. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-master-health

- **Read Only: True** — Read-only: The whole-platform GEO executive board, in three sections plus an AI weekly summary: cross-team visibility and AI-traffic movement with measured lift. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## refresh-team-health

- **Read Only: False** — Not read-only, it writes stored state: Rebuild the get-team-health board for one window, off-thread.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## refresh-master-health

- **Read Only: False** — Not read-only, it writes stored state: Rebuild the get-master-health board for one window, off-thread.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-deliverables

- **Read Only: True** — Read-only: List a team's client-facing deliverables with deliverable_id, slug, title, status, version, action-item counts, participant count, whether it has. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-deliverable

- **Read Only: True** — Read-only: Get one deliverable's full content: article markdown, publish plan, ready-to-publish checklist, action items with status, participants, and the. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-deliverable

- **Read Only: False** — Not read-only, it writes stored state: Create a client-facing deliverable from a manifest, or apply the manifest as a revision when one already exists for this team and slug.
- **Open World: True** — Materializes the client review page and its magic links, which the institution's client opens.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## push-deliverable-revision

- **Read Only: False** — Not read-only, it writes stored state: Replace a deliverable's manifest with a new revision.
- **Open World: True** — The revised article and action items are what the institution's client reads on the client page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call creates another manifest version.

## get-deliverable-activity

- **Read Only: True** — Read-only: Read a deliverable's activity ledger: client views, answers, comments, threads, attestations and opt-out requests, plus revision pushes and status. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-deliverable-status

- **Read Only: False** — Not read-only, it writes stored state: Set a deliverable's lifecycle status to needs-input, ready or published, optionally setting the publish plan too.
- **Open World: True** — The status is served to the institution's client on the public deliverable page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## set-deliverable-archived

- **Read Only: False** — Not read-only, it writes stored state: Mark a deliverable as history rather than live client work, or bring it back.
- **Open World: True** — Archiving closes the public client page (the client link 404s); unarchiving reopens it.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Sets the archived flag to the value passed; re-sending the same value changes nothing.

## set-deliverable-archived

- **Read Only: False** — Writes `archived_at` on the deliverable (a timestamp to archive, null to bring it back) and appends an archived activity row carrying the caller's note.
- **Open World: False** — All writes are to MetriFi's own deliverable and deliverable-activity tables. No email is sent and no external service is contacted.
- **Destructive: True** — Archiving closes the deliverable's public client page, so a link a client already holds starts returning 404, and it drops the row out of the default list and off the attention gate. Nothing is deleted and the same tool with `archived=false` reverses it.

## reopen-action-item

- **Read Only: False** — Not read-only, it writes stored state: Reopen one action item on a deliverable, returning it to open and clearing its live answer, so the deliverable stops reporting ready_to_publish.
- **Open World: True** — The reopened item returns to the institution's client on the public deliverable page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## withdraw-deliverable-approval

- **Read Only: False** — Not read-only, it writes stored state: Take back a deliverable's approval to publish, closing the published gate again.
- **Open World: True** — The approval banner the institution's client sees on the deliverable page changes.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## send-deliverable

- **Read Only: False** — Not read-only, it writes stored state: Email the deliverable's notification to its participants and mark sent_at.
- **Open World: True** — Emails the deliverable notification to client participants outside MetriFi.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call sends the emails again and re-stamps sent_at.

## send-deliverable-followup

- **Read Only: False** — Not read-only, it writes stored state: Email one followup nudge to the client contact on a deliverable and advance the cadence counter.
- **Open World: True** — Emails a followup nudge to the client contact outside MetriFi.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call sends another nudge and advances the cadence counter.

## record-deliverable-shared

- **Read Only: False** — Not read-only, it writes stored state: Record that the deliverable's link was handed to the client outside the platform.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call appends another share entry to the activity ledger.

## record-deliverable-publication

- **Read Only: False** — Not read-only, it writes stored state: Record that this deliverable's article is live: the real historical date and the URL.
- **Open World: True** — Sets status to published, which the institution's client reads on the deliverable page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## set-deliverable-tags

- **Read Only: False** — Not read-only, it writes stored state: Classify the article a deliverable shipped: Content Length, Content Location and Content Intention.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Replaces the whole tag set with the values passed, so a repeat call is a no-op.

## record-deliverable-publication

- **Read Only: False** — Writes the deliverable's published date, published URL and status, appends an activity row, and sets the experiment's live date when the experiment carries none.
- **Open World: False** — Nothing is sent and the recorded URL is never fetched. Only MetriFi's own deliverable, activity and experiment rows are written.
- **Destructive: True** — It overwrites the published date, URL and status on the existing deliverable; a second call is a deliberate correction of the first.

## set-deliverable-tags

- **Read Only: False** — Replaces the deliverable's content-tag rows (Content Length, Content Location, Content Intention) and appends a classified activity row.
- **Open World: False** — Nothing is sent and the published URL is never fetched. Only MetriFi's own deliverable-tag and activity rows are written.
- **Destructive: True** — It replaces the whole classification rather than patching it, so any tag not passed on this call is removed.

## get-experiment-workflow

- **Read Only: True** — Read-only: Get where an experiment stands: workflow status and note, recent event log, working-document index, keyword research, target prompts, and the. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-experiment-workflow

- **Read Only: False** — Not read-only, it writes stored state: Record a free-text hand-off note on an experiment and append one event to its log.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## add-experiment-event

- **Read Only: False** — Not read-only, it writes stored state: Append one line to an experiment's workflow log.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Append-only, so a repeat call adds a second event unless idempotency_key is passed.

## get-experiment-document

- **Read Only: True** — Read-only: Read one working document attached to an experiment, with its full markdown. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-experiment-document

- **Read Only: False** — Not read-only, it writes stored state: Store a working document on an experiment.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## record-keyword-research

- **Read Only: False** — Not read-only, it writes stored state: Record the keyword demand behind a campaign's prompts and the keep or drop verdict on each candidate.
- **Open World: True** — Kept keyword rows are served to the institution's client as the demand evidence on the deliverable page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## set-experiment-opportunity

- **Read Only: False** — Not read-only, it writes stored state: Write an experiment's opportunity block: headline, demand, verdict and target prompts.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## update-deliverable-draft

- **Read Only: False** — Not read-only, it writes stored state: Patch a deliverable while drafting: send only the changed parts and the server applies them to the stored manifest.
- **Open World: True** — Patches the stored manifest, which the public deliverable page serves to the institution's client directly.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## build-deliverable

- **Read Only: False** — Not read-only, it writes stored state: Assemble the client page from server state and save one version: the draft manifest plus the experiment's opportunity block and dossier documents.
- **Open World: True** — Assembles and saves the client page the institution's client opens.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call saves another version of the client page.

## record-deliverable-check

- **Read Only: False** — Not read-only, it writes stored state: Record the result of a check performed on a deliverable (hygiene, NCUA compliance, accessibility, fact verification) with its findings.
- **Open World: True** — Recorded check verdicts are served to the institution's client on the deliverable page.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Append-only: each call records another check result.

## list-deliverable-checks

- **Read Only: True** — Read-only: List the checks recorded on a deliverable: result, summary, findings, who recorded it, and whether it has gone stale because the manifest version or. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-campaign-readiness

- **Read Only: True** — Read-only: Report whether a campaign has enough completed responses to measure: the share of prompts populated in a lookback window, per-prompt counts and. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## research-keywords

- **Read Only: False** — Not read-only, it writes stored state: Buy real search demand for a batch of keywords (monthly volume, difficulty, intent) from DataForSEO and record it against a campaign.
- **Open World: True** — Buys search-demand data from DataForSEO, a paid external API.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-deliverables-needing-attention

- **Read Only: True** — Read-only: List the team's deliverables with unprocessed client activity or an outstanding blocking item. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## mark-deliverable-activity-processed

- **Read Only: False** — Not read-only, it writes stored state: Move a deliverable's processed watermark, which is what takes it off list-deliverables-needing-attention.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-funnels

- **Read Only: True** — Read-only: List a team's CRO funnels with their 28-day snapshot summaries: users, conversion rate and assets. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-funnel

- **Read Only: True** — Read-only: Get one CRO funnel with its steps, each step's Google Analytics metric definition, and its 28 and 90-day snapshots. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-funnel

- **Read Only: False** — Not read-only, it writes stored state: Create a CRO funnel, which measures a user flow through the site against Google Analytics.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new funnel row.

## update-funnel

- **Read Only: False** — Not read-only, it writes stored state: Update a CRO funnel's name, category_id or conversion_value.
- **Open World: True** — A conversion_value change queues a snapshot and dashboard re-analysis against Google Analytics.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## delete-funnel

- **Read Only: False** — Not read-only, it writes stored state: Delete a CRO funnel and its steps.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## replicate-funnel

- **Read Only: False** — Not read-only, it writes stored state: Deep-copy a CRO funnel and all its steps into a new funnel named "<name> (Copy)".
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call creates another copy of the funnel.

## create-funnel-step

- **Read Only: False** — Not read-only, it writes stored state: Add a step to a CRO funnel, defined by the Google Analytics conditions that count a user as reaching it.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call appends another step.

## update-funnel-step

- **Read Only: False** — Not read-only, it writes stored state: Update a funnel step's name, order, metrics or metrics_expression.
- **Open World: True** — An order, metrics or expression change queues a snapshot and dashboard re-analysis against Google Analytics.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## delete-funnel-step

- **Read Only: False** — Not read-only, it writes stored state: Delete one step from a CRO funnel.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## get-funnel-report

- **Read Only: True** — Read-only: Live Google Analytics funnel report: user counts and step-to-step conversion for each step of one funnel over a date range, defaulting to the last 28. It changes no stored state.
- **Open World: True** — Queries the team's Google Analytics property live.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## ga-page-users

- **Read Only: True** — Read-only: Live Google Analytics pages report for a team: page path, hostname, page title and users over a date range, defaulting to the last 28 days. It changes no stored state.
- **Open World: True** — Queries the team's Google Analytics property live.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## ga-outbound-link-users

- **Read Only: True** — Read-only: Live Google Analytics outbound-link report for a team: link URL, source page path and users over a date range, defaulting to the last 28 days. It changes no stored state.
- **Open World: True** — Queries the team's Google Analytics property live.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-dashboards

- **Read Only: True** — Read-only: List a team's CRO dashboards with their issue, warning and analysis state. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-dashboard

- **Read Only: True** — Read-only: Get one CRO dashboard: attached funnels in order (the first is the subject funnel, the rest comparisons), per-funnel disabled steps and issues, and. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-dashboard

- **Read Only: False** — Not read-only, it writes stored state: Create a CRO dashboard, which compares one subject funnel against comparison funnels of the same shape.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new dashboard row.

## update-dashboard

- **Read Only: False** — Not read-only, it writes stored state: Update a CRO dashboard's name, description or notes.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## delete-dashboard

- **Read Only: False** — Not read-only, it writes stored state: Delete a CRO dashboard.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## set-dashboard-funnels

- **Read Only: False** — Not read-only, it writes stored state: Replace which funnels a CRO dashboard compares, in order.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## analyze-dashboard

- **Read Only: False** — Not read-only, it writes stored state: Run a dashboard analysis now against live Google Analytics: compares the subject funnel to its comparison funnels over the last 28 days, writes fresh.
- **Open World: True** — Runs the analysis against live Google Analytics before writing results.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call creates new analysis rows and re-queries Google Analytics.

## get-analysis

- **Read Only: True** — Read-only: Get one stored dashboard analysis: subject funnel conversion against the comparison funnels, the biggest-opportunity step, and the potential asset. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-recommendations

- **Read Only: True** — Read-only: List a team's CRO recommendations with their generation status. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-recommendation

- **Read Only: True** — Read-only: Get one CRO recommendation in full: generation status, prompt, content outline, and the latest generated page with its blocks and per-block statuses. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-recommendation

- **Read Only: False** — Not read-only, it writes stored state: Create a CRO recommendation: an improvement idea for a funnel step that generate-recommendation can turn into an AI-built landing page.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new recommendation row.

## update-recommendation

- **Read Only: False** — Not read-only, it writes stored state: Update a CRO recommendation's title, prompt or written content.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## delete-recommendation

- **Read Only: False** — Not read-only, it writes stored state: Hard-delete a CRO recommendation with its generated pages and blocks.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## generate-recommendation

- **Read Only: False** — Not read-only, it writes stored state: Queue the AI landing-page pipeline for a CRO recommendation (screenshots, analysis, content outline, HTML blocks).
- **Open World: True** — Queues a pipeline that takes external screenshots and calls an LLM provider, spending AI credits.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call queues another generation run and consumes recommendations quota.

## get-block

- **Read Only: True** — Read-only: Get one landing-page block: HTML, outline, status and version count. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## ai-edit-block

- **Read Only: False** — Not read-only, it writes stored state: Rewrite one landing-page block's HTML from a natural-language edit instruction.
- **Open World: True** — Calls an LLM provider to rewrite the block, spending AI credits.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call runs the model again and keeps another version of the block HTML.

## list-connections

- **Read Only: True** — Read-only: List a team's CRO data connections (Google Analytics properties, WordPress sites) with names, services and GA property uids, never credentials. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-files

- **Read Only: True** — Read-only: List a team's uploaded CRO files, the images used as context for landing-page generation. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-organization

- **Read Only: True** — Read-only: Get a team's CRO organization settings: domain, funnel privacy, return-on-assets multiplier, onboarding state and recommendations quota. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-categories

- **Read Only: True** — Read-only: List the global CRO funnel-category taxonomy, shared across all teams so it takes no team_id. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-core-rules

- **Read Only: True** — Read-only: Return the always-on MetriFi rules bundle: page design process, styling, organisms, placeholders, navigation defaults, rate management and. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-doc

- **Read Only: True** — Read-only: Fetch one on-demand reference doc from the MetriFi knowledge base by path. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-docs

- **Read Only: True** — Read-only: List the markdown doc paths available in the MetriFi knowledge base. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## search-tests

- **Read Only: True** — Read-only: Search MetriFi's A/B test results across credit-union and bank pages. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-test

- **Read Only: True** — Read-only: Get the full record for one A/B test by ID: structured summary, raw detail and the long-form write-up when one exists. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-proven-patterns

- **Read Only: True** — Read-only: List the proven-pattern guides, one per page-type category, with the A/B test IDs each synthesizes. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-proven-pattern

- **Read Only: True** — Read-only: Get one proven-pattern guide by number, slug or product family, with its markdown and the A/B test IDs it cites. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-anti-patterns

- **Read Only: True** — Read-only: The cross-product anti-patterns guide: the test-backed losing moves such as stripping content, tab navigation, urgency-only headlines, hero rate. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-sites

- **Read Only: True** — Read-only: List the caller's MetriFi-managed sites, scoped to their team. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api topics to find the caller's sites.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-site

- **Read Only: True** — Read-only: One site's details and its review links. It changes no stored state.
- **Open World: True** — Reads the site's GitHub repository and Vercel project through their APIs.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## check-slug

- **Read Only: True** — Read-only: Check whether a slug or domain is available for a new site. It changes no stored state.
- **Open World: True** — Checks slug availability against GitHub and Vercel.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-site

- **Read Only: False** — Not read-only, it writes stored state: Create a MetriFi site: a GitHub repo from the Astro starter template plus a linked Vercel project.
- **Open World: True** — Creates a real GitHub repository and a linked Vercel project through their APIs.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call creates another GitHub repository and Vercel project.

## move-site

- **Read Only: False** — Not read-only, it writes stored state: Re-tenant a site to a different team by updating its metrifi-team-<id> repo topic, so it moves in list-sites and its publish and access permissions.
- **Open World: True** — Rewrites the repository's team topic through the GitHub API.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## delete-site

- **Read Only: False** — Not read-only, it writes stored state: Take a MetriFi site off the platform: its Vercel project, deployments and hosts, its review workspace, and its registry entry (it leaves list-sites).
- **Open World: True** — Deletes the Vercel project, its deployments and hosts through Vercel's API.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-site-files

- **Read Only: True** — Read-only: List files in a site repo, one directory level by default. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## read-file

- **Read Only: True** — Read-only: Read a file from a site repo. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## write-files

- **Read Only: False** — Not read-only, it writes stored state: Create or overwrite one or more files in a single commit on the working branch, which is created off main on the first write.
- **Open World: True** — Commits to the site's github repository through the github api, and assigns the Vercel draft host after the commit lands.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call lands another commit on the working branch.

## delete-files

- **Read Only: False** — Not read-only, it writes stored state: Delete one or more files from a site repo in a single commit on the working branch.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## file-history

- **Read Only: True** — Read-only: The commit log for any path in a site repo, newest first, with who the change is attributed to. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api's commit log.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-preview-url

- **Read Only: True** — Read-only: Get the one-click link to view a site. It changes no stored state.
- **Open World: True** — Asks Vercel which hosts and deployments exist for the site.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-asset-upload

- **Read Only: False** — Not read-only, it writes stored state: Get a short-lived URL for uploading image files to this site, the way photos on disk get in since image bytes cannot pass through a tool argument.
- **Open World: True** — Mints an upload URL against Vercel Blob storage.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-site-assets

- **Read Only: True** — Read-only: List the images a human uploaded for this site. It changes no stored state.
- **Open World: True** — Lists objects in Vercel Blob storage.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## delete-site-asset

- **Read Only: False** — Not read-only, it writes stored state: Delete a staged upload from blob storage after its bytes have been committed into the site repo.
- **Open World: True** — Deletes an object from Vercel Blob storage.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-rates

- **Read Only: True** — Read-only: List every rate in the site's store at src/data/rates.json with its current effective value and the count of pending scheduled changes. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-rate

- **Read Only: True** — Read-only: Get one rate's current effective value and its full effective-dated timeline. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-rate

- **Read Only: False** — Not read-only, it writes stored state: Create or update a rate in the site's central store, writing to the working branch.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-scheduled-changes

- **Read Only: True** — Read-only: List every pending future-dated rate change across the site, sorted by effective time. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## cancel-scheduled-change

- **Read Only: False** — Not read-only, it writes stored state: Remove a pending future rate change before it takes effect, identified by its exact effective_at.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## rate-history

- **Read Only: True** — Read-only: One rate's value over time from its effective-dated timeline, including any scheduled future change, plus the git commit log for rates.json. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api's commit log.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## find-rate-usages

- **Read Only: True** — Read-only: Find every page, section and component referencing a rate id, by scanning src/ for <Rate> usages and the id token. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## activate-due-rates

- **Read Only: False** — Not read-only, it writes stored state: Run the scheduled-rate scan for one site: if a change on main has come due since the last production build, trigger a production rebuild so it goes.
- **Open World: True** — Triggers a production rebuild on Vercel when a scheduled change has come due.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## list-facts

- **Read Only: True** — Read-only: List every managed fact in the site's store at src/data/facts.json: routing number, NMLS id, phone, hours, product terms and similar. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-fact

- **Read Only: True** — Read-only: Get one managed fact's label, type and current value by its stable id, e.g. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-fact

- **Read Only: False** — Not read-only, it writes stored state: Create or update a managed fact in the site's central store, writing to the working branch.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## get-brand

- **Read Only: True** — Read-only: Read the site's brand record from src/data/brand.json: raw palette, shadcn semantic token mapping, fonts, radius, assets and voice. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-brand

- **Read Only: False** — Not read-only, it writes stored state: Write the site's brand record and regenerate its CSS in one commit on the working branch: src/data/brand.json plus src/styles/brand.generated.css.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## validate-brand

- **Read Only: True** — Read-only: Lint the site's brand record against the canonical token contract and report readiness flags: LOGO_MISSING, LOGO_DARK_VARIANT_NEEDED,. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## extract-brand

- **Read Only: True** — Read-only: Scaffold a proposed brand from a live website: favicon, theme-color, og:image and font hints. It changes no stored state.
- **Open World: True** — Fetches the institution's live public website over HTTP.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## import-brand-from-design

- **Read Only: True** — Read-only: Normalize a token CSS block into a proposed brand record: parses the :root color custom properties as the palette and maps common names onto the. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-compliance

- **Read Only: True** — Read-only: Read the site's compliance record from src/data/compliance.json: charter type, insurer, regulator, and the disclosure elements every published page. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-compliance

- **Read Only: False** — Not read-only, it writes stored state: Write the site's compliance record to src/data/compliance.json on the working branch: charter type, insurer, regulator and required disclosure ids.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## publish-site

- **Read Only: False** — Not read-only, it writes stored state: Publish the working branch to production: opens a PR to main, auto-merges by squash, and reports the production URL.
- **Open World: True** — Opens and merges a GitHub pull request and makes the result live on Vercel production.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call opens and merges a pull request and pushes a release commit.

## list-pending-changes

- **Read Only: True** — Read-only: Across the sites the caller can access, the draft changes saved but not yet published to production, and who drafted them. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api across the caller's sites.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## summarize-changes

- **Read Only: True** — Read-only: A content-level, plain-language summary of what a site's draft changes versus production, not a code diff. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api to diff draft against production.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-review

- **Read Only: False** — Not read-only, it writes stored state: Create the visual review workspace for a site.
- **Open World: True** — Creates the review workspace and the client link the institution's client opens on the draft site.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## push-review-revision

- **Read Only: False** — Not read-only, it writes stored state: Record a new revision on a site's review, after the draft deploy is live.
- **Open World: True** — Verifies the Vercel draft deployment and re-anchors what the institution's client sees in the overlay.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call bumps the review version and snapshots the spec again.

## get-review

- **Read Only: True** — Read-only: Full state of a site's review workspace: status, round and version, client approval with staleness, participants, per-page coverage, all action items. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-reviews

- **Read Only: True** — Read-only: List review workspaces on sites the caller can access, with status, round, approval and readiness. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-pending-feedback

- **Read Only: True** — Read-only: The actionable feedback queue for a site's review: open client threads with their screenshots, grouped by page, plus agent-raised action items the. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-feedback-item

- **Read Only: True** — Read-only: One feedback thread in full: element anchor, text-edit diff, the whole comment history, staleness and orphan flags, and the screenshot when one exists. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## manage-review-item

- **Read Only: False** — Not read-only, it writes stored state: Apply the client's own card controls in batch: done, reopen, assign, unassign, archive, unarchive or delete on action items (source_ids), and.
- **Open World: True** — Changes the cards the institution's client sees in the overlay, and assign emails the address a link.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## resolve-feedback

- **Read Only: False** — Not read-only, it writes stored state: Mark feedback threads resolved because the change was applied or otherwise addressed, in batch.
- **Open World: True** — The resolution note is shown to the institution's client in the review overlay.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## dismiss-feedback

- **Read Only: False** — Not read-only, it writes stored state: Close feedback threads as won't-fix, in batch.
- **Open World: True** — The required reason is shown to the institution's client in the review overlay.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## comment-on-feedback

- **Read Only: False** — Not read-only, it writes stored state: Reply to the client on a feedback thread (thread_id) or on an action item you raised (source_id), shown in the overlay as MetriFi team.
- **Open World: True** — The reply is shown to the institution's client in the review overlay as MetriFi team.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Append-only: each call posts another reply.

## get-review-activity

- **Read Only: True** — Read-only: A review's append-only activity ledger, oldest-first. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-review-status

- **Read Only: False** — Not read-only, it writes stored state: Set a review's status.
- **Open World: True** — The review status is what the institution's client sees on the client review page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.

## send-review

- **Read Only: False** — Not read-only, it writes stored state: Email the review link to every participant, optionally provisioning one new recipient first.
- **Open World: True** — Emails the review link to client participants outside MetriFi.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call emails the participants again.

## delete-review

- **Read Only: False** — Not read-only, it writes stored state: Permanently delete a site's review workspace: every thread, comment, action item, checklist item, activity, participant, revision and attestation,.
- **Open World: True** — Permanently destroys the client review workspace, including everything the institution's client submitted.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Idempotent: it sets the named fields to the values passed (or skips what is already in that state), so a repeat call lands no additional effect.
