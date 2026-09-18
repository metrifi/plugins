# MCP tool annotation justifications (OpenAI review form, v3 for the v1.4.16 resubmission)

165 tools, tools/list order, four hints each. Regenerated 2026-09-18 from the merged surface lock after platform #421 (trimmed descriptions), #183 (extend-trial) and #426 (hint audit: 18 tools no longer idempotent, 8 now open-world). Idempotent and open-world lines for the 64 audited tools come from the #426 audit and name the code that proves them.


## list-teams

- **Read Only: True** — Read-only: List the teams the caller owns or belongs to, with each team's slug, role and member count. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-team

- **Read Only: False** — Not read-only, it writes stored state: Create a team owned by the caller and its tracked organization.
- **Open World: False** — CreateTeamTool::handle() only inserts the team, the caller's membership, default plan rows and the owned organization with its terms, sends no mail, and nothing it writes is read by a public or client-facing route.
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
- **Open World: False** — RenameTeamTool::handle() changes teams.name, which no public route reads: PublicDeliverableController::show() serves the deliverable manifest and PublicReviewController serves review fields, neither loading the team.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — RenameTeamTool::handle() calls Team::update(['name']) on a model with no observers or listeners, so a repeat with the same name leaves the attribute clean and Eloquent issues no write.

## switch-team

- **Read Only: False** — Not read-only, it writes stored state: Set the caller's active team.
- **Open World: False** — SwitchTeamTool::handle() only changes the caller's own users.current_team_id, which affects nobody else's view.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — SwitchTeamTool::handle() only sets users.current_team_id via forceFill()->save(), so a repeat with the same team leaves the model clean and writes nothing.

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
- **Open World: False** — RevokeInvitationTool::handle() only deletes the pending pivot and invitation token rows and sends the invitee no email or notification.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — RevokeInvitationTool::handle() detaches only a still-pending team_user row and deletes matching invitation_tokens rows, so a repeat finds neither and changes nothing.

## accept-invitation

- **Read Only: False** — Not read-only, it writes stored state: Accept a pending team invitation.
- **Open World: False** — AcceptInvitationTool::handle() only updates the caller's own pivot row, current team and invitation token, and notifies neither the inviter nor anyone else.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — AcceptInvitationTool::handle() returns early with 'already a member' once the team_user pivot is accepted, so a repeat does not touch the pivot, current_team_id or invitation tokens.

## decline-invitation

- **Read Only: False** — Not read-only, it writes stored state: Decline a pending team invitation and drop the pending membership.
- **Open World: False** — DeclineInvitationTool::handle() only removes the caller's own pending pivot row and token and sends no email or notification.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — DeclineInvitationTool::handle() detaches the pivot and deletes tokens only while the invitation is still pending, so a repeat finds no pending row and writes nothing.

## remove-member

- **Read Only: False** — Not read-only, it writes stored state: Remove a member from a team.
- **Open World: False** — RemoveMemberTool::handle() only detaches the team_user row, sends the removed member no email or notification, and touches nothing a client-facing page reads.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — RemoveMemberTool::handle() detaches the team_user row, and a repeat finds no membership and returns 'Not a member of this team.' without writing, sending mail or revoking tokens.

## set-member-role

- **Read Only: False** — Not read-only, it writes stored state: Change a member's team role.
- **Open World: False** — SetMemberRoleTool::handle() only updates team_user.role, sends no email or notification, and the role is read only by internal permission checks.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — SetMemberRoleTool::handle() only rewrites team_user.role through updateExistingPivot() on a plain pivot with no events, so a repeat with the same role changes nothing but updated_at and logs or notifies nothing.

## transfer-team-ownership

- **Read Only: False** — Not read-only, it writes stored state: Hand a team to a new owner, attaching them as an accepted member if needed and leaving the outgoing owner an admin.
- **Open World: False** — Team::transferOwnershipTo() only moves teams.owner_id, upserts both users' team_user rows and clears invitation tokens, with no email to either party and nothing a client-facing page reads.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — Team::transferOwnershipTo() throws 'That user already owns this team.' before any write when owner_id already matches, so a repeat changes nothing.

## list-super-admins

- **Read Only: True** — Read-only: List MetriFi platform staff: the Super Owners set in committed config and the super_admins they have granted. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-platform-role

- **Read Only: False** — Not read-only, it writes stored state: Grant or revoke MetriFi super_admin, which is cross-tenant staff access to any team.
- **Open World: False** — SetPlatformRoleTool::handle() only writes users.platform_role, an internal staff permission, with no email, notification or audit export.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — SetPlatformRoleTool::handle() sets users.platform_role via User::setPlatformRole()->save() with no audit log or observer, so a repeat with the same grant value leaves the model clean and writes nothing.

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

## extend-trial

- **Read Only: False** — Not read-only, it writes stored state: it sets the team's plan row to trialing with a later trial end date.
- **Open World: True** — Open world: no email or outside API is involved, but every member of the team sees the new trial end date on their usage page and their access depends on it.
- **Destructive: False** — Not destructive: the new end date is always later than both the stored date and today, and plans with a paid period are refused, so no call reduces access or removes data.
- **Idempotent: False** — Not idempotent: a live trial extends from its stored end date, so a repeat call adds the days again.

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
- **Open World: False** — CreateCampaignTool::handle() only inserts a geo_campaigns row with no external call, and a new campaign is linked to no deliverable, so nothing public reads it.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new campaign row.

## set-campaign-location

- **Read Only: False** — Not read-only, it writes stored state: Set the geography a campaign's keyword demand is measured in, so research-keywords returns local volume alongside national.
- **Open World: True** — Resolves the place name against DataForSEO's location API, an external service.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — SetCampaignLocationTool::handle() reads DataForSEO's free Google Ads locations list and forceFills the same dataforseo_location_code and dataforseo_location_name onto the campaign, so a repeat leaves the model clean and Eloquent issues no update (Campaign has no observers or model hooks).

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
- **Open World: False** — CreatePromptTool::handle() only inserts a geo_prompts row and does not run it against any LLM provider, and no public route reads prompts.
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

- **Read Only: True** — Read-only: One consolidated snapshot of a single team: quota usage, campaigns, experiments, client deliverables and AI bot traffic, in place of calling those five tools separately. It changes no stored state.
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
- **Open World: False** — CreateExperimentTool::handle() only inserts a geo_experiments row with no deliverable attached and no external call, so no client page can reach it.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new experiment row.

## update-experiment

- **Read Only: False** — Not read-only, it writes stored state: Update an experiment's fields, dates and attached prompts.
- **Open World: True** — PublicDeliverableController::clientKeywords() reads the linked experiment's campaign_id live to pick the keyword rows and market shown on the client page, so changing campaign_id through update-experiment changes what the client sees.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — UpdateExperimentTool::handle() writes the given fields with update() and syncs prompts with sync()/syncWithoutDetaching(), both no-ops when the values already match, and LiveDateService::set() returns early without writing an event when the live date and its source are unchanged, so a repeat changes nothing.

## set-experiment-analysis

- **Read Only: False** — Not read-only, it writes stored state: Write an experiment's analysis of the LLM responses for its target prompts: which organizations appear, which sources are cited, and why.
- **Open World: False** — SetExperimentAnalysisTool writes geo_experiments.analysis, which no public route reads and which DeliverableBuildService only checks for presence to raise a warning, so it never reaches a client.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — SetExperimentAnalysisTool::handle() restamps geo_experiments.analyzed_at with now() on every call, and StaleExperimentFinder::lastTouchFor() counts analyzed_at as a last-touched signal, so each repeat pushes back when geo:delete-stale archives the experiment.

## set-experiment-recommendation

- **Read Only: False** — Not read-only, it writes stored state: Write an experiment's strategic recommendation and its prioritized tactical actions, replacing any existing ones.
- **Open World: False** — SetExperimentRecommendationTool writes geo_experiments.recommendation and geo_actions rows, which no public route reads and which DeliverableBuildService only checks for existence, so they stay inside the team's own views.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — SetExperimentRecommendationTool::handle() deletes every geo_actions row for the experiment and inserts fresh ones on every call, so a repeat replaces the action rows with new ids and any id taken from the first call no longer resolves.

## set-experiment-case-study

- **Read Only: False** — Not read-only, it writes stored state: Write an experiment's case study: problem, strategy, results and takeaways as a narrative.
- **Open World: False** — SetExperimentCaseStudyTool writes geo_experiments.case_study, which is served only to signed-in team members through ExperimentController behind the web and auth middleware and is never copied into a deliverable manifest or read by a public route.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — SetExperimentCaseStudyTool::handle() restamps geo_experiments.case_study_generated_at with now() on every call, and StaleExperimentFinder::lastTouchFor() counts that stamp as a last-touched signal, so each repeat pushes back when geo:delete-stale archives the experiment.

## list-action-types

- **Read Only: True** — Read-only: List the action types that categorize experiment recommendation steps. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-ai-user-bot-traffic

- **Read Only: True** — Read-only: Report visits to the team's website from end-user-driven AI bots such as ChatGPT-User, Claude-User and Perplexity-User, with per-bot totals and top page paths. It changes no stored state.
- **Open World: True** — Reads bot-traffic rollups from the external Supabase analytics store.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-team-health

- **Read Only: True** — Read-only: Cross-team triage queue: which teams need attention, which are healthy, which are dormant, in priority order with a verdict, reason and next action each. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-master-health

- **Read Only: True** — Read-only: The whole-platform GEO executive board plus an AI weekly summary: cross-team visibility and AI-traffic movement with measured lift for experiments that concluded in the window, shipping velocity against the prior window, and top clients ranked by a composite score. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## refresh-team-health

- **Read Only: False** — Not read-only, it writes stored state: Rebuild the get-team-health board for one window, off-thread.
- **Open World: True** — The RefreshTeamHealthJob that refresh-team-health dispatches calls Supabase through SupabaseService in TeamHealthService::compute(), an external API under this repo's open-world rule.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — TeamHealthService::requestRefresh() only debounces while a rebuild is in flight, so any repeat after the job finishes dispatches another RefreshTeamHealthJob that re-queries Supabase for every team and overwrites the cached board.

## refresh-master-health

- **Read Only: False** — Not read-only, it writes stored state: Rebuild the get-master-health board, the team board and the weekly AI summary for one window, off-thread.
- **Open World: True** — The RefreshMasterHealthJob that refresh-master-health dispatches calls Supabase for traffic and an LLM provider in MasterHealthService::generateSummary(), both external APIs under this repo's open-world rule.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — MasterHealthService::requestRefresh() only debounces while a rebuild is in flight, so any repeat after the job finishes dispatches another RefreshMasterHealthJob that re-queries Supabase and makes a new paid LLM call for the weekly summary.

## list-deliverables

- **Read Only: True** — Read-only: List a team's client-facing deliverables with deliverable_id, slug, title, status, version, action-item and participant counts, whether it has been sent, and the client_url, never the raw magic-link token. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-deliverable

- **Read Only: True** — Read-only: Get one deliverable's full content: article markdown, publish plan, ready-to-publish checklist, action items with status, participants, and the client_url for the client review page. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-deliverable

- **Read Only: False** — Not read-only, it writes stored state: Create a client-facing deliverable from a manifest, or apply the manifest as a revision when one already exists for this team and slug.
- **Open World: True** — Materializes the client review page and its magic links, which the institution's client opens.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — DeliverableIngestService::applyManifest() re-saves the manifest into a MySQL JSON column that stores object keys reordered, so the array cast's strict comparison sees an identical resubmitted manifest as changed, HasVersions::createVersionFromChanges() writes a new geo_deliverable_versions row and bumps current_version, and a revision_pushed activity row is appended.

## push-deliverable-revision

- **Read Only: False** — Not read-only, it writes stored state: Replace a deliverable's manifest with a new revision.
- **Open World: True** — The revised article and action items are what the institution's client reads on the client page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call creates another manifest version.

## get-deliverable-activity

- **Read Only: True** — Read-only: Read a deliverable's activity ledger: client views, answers, comments, threads, attestations and opt-out requests, plus revision pushes and status changes, each attributed to a participant. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-deliverable-status

- **Read Only: False** — Not read-only, it writes stored state: Set a deliverable's status to needs-input, ready or published, optionally with the publish plan.
- **Open World: True** — The status is served to the institution's client on the public deliverable page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call writes a status-changed ledger row and, for published, re-runs the live-date propagation, even when the status is unchanged.

## set-deliverable-archived

- **Read Only: False** — Not read-only, it writes stored state: Mark a deliverable as history rather than live client work, or bring it back.
- **Open World: True** — Archiving closes the public client page (the client link 404s); unarchiving reopens it.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — SetDeliverableArchivedTool::handle() compares the requested archived flag with isArchived() and returns 'No change' without saving or recording an activity row when they already match, so a repeat writes nothing.

## reopen-action-item

- **Read Only: False** — Not read-only, it writes stored state: Reopen one action item on a deliverable, returning it to open and clearing its live answer, so the deliverable stops reporting ready_to_publish.
- **Open World: True** — The reopened item returns to the institution's client on the public deliverable page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — ReopenActionItemTool::handle() returns 'already open, nothing to do' when the item's status is already open, before DeliverableActionItem::reopen() or the reopened activity row, so a repeat writes nothing.

## withdraw-deliverable-approval

- **Read Only: False** — Not read-only, it writes stored state: Take back a deliverable's approval to publish, closing the published gate again.
- **Open World: True** — The approval banner the institution's client sees on the deliverable page changes.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — WithdrawDeliverableApprovalTool::handle() returns 'not approved, nothing to withdraw' when approved_at is already null, before Deliverable::withdrawApproval() or the approval_withdrawn activity row, so a repeat writes nothing.

## send-deliverable

- **Read Only: False** — Not read-only, it writes stored state: Email the deliverable's notification to its participants and mark sent_at.
- **Open World: True** — Emails the deliverable notification to client participants outside MetriFi.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call sends the emails again and re-stamps sent_at.

## send-deliverable-followup

- **Read Only: False** — Not read-only, it writes stored state: Email one followup nudge to the deliverable's client contact and advance the cadence counter.
- **Open World: True** — Emails a followup nudge to the client contact outside MetriFi.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call sends another nudge and advances the cadence counter.

## record-deliverable-shared

- **Read Only: False** — Not read-only, it writes stored state: Record that the deliverable's link was handed to the client outside the platform.
- **Open World: True** — Stamps sent_at and provisions the client participant, both of which the public deliverable page serves to the institution's client.
- **Destructive: True** — Destructive in the narrow sense that it overwrites the deliverable's sent_at stamp and starts the followup cadence; nothing is deleted.
- **Idempotent: False** — Each call appends another share entry to the activity ledger.

## record-deliverable-publication

- **Read Only: False** — Not read-only, it writes stored state: Record that this deliverable's article is live, with the real date and URL, for articles published outside the platform, however long ago.
- **Open World: True** — Sets status to published, which the institution's client reads on the deliverable page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — A second call is treated as a correction: it writes another ledger row and re-propagates the live date.

## set-deliverable-tags

- **Read Only: False** — Not read-only, it writes stored state: Classify the article a deliverable shipped: Content Length, Content Location and Content Intention.
- **Open World: False** — SetDeliverableTagsTool writes the deliverable's tag pivot and a classified activity row, and PublicDeliverableController::show reads neither tags nor classified activities (its history only uses answered, attested and reopened rows).
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Replaces the whole tag set with the values passed, so a repeat call is a no-op.

## get-experiment-workflow

- **Read Only: True** — Read-only: Get where an experiment stands: workflow status and note, recent events, document index, keyword research, target prompts, and the newest live deliverable with its blocking items and latest checks. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-experiment-workflow

- **Read Only: False** — Not read-only, it writes stored state: Record a free-text hand-off note on an experiment and append one event to its log.
- **Open World: False** — SetExperimentWorkflowTool writes geo_experiments.workflow_note and a geo_experiment_events row, and neither PublicDeliverableController::show nor any other public route reads either, so only signed-in team members see them.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — ExperimentWorkflowService::setWorkflow() saves the note and then calls recordEvent() with no idempotency key, which inserts a new geo_experiment_events row on every call, so a repeat appends a second phase_note event.

## add-experiment-event

- **Read Only: False** — Not read-only, it writes stored state: Append one line to an experiment's workflow log.
- **Open World: False** — AddExperimentEventTool appends a geo_experiment_events row, which only the team's get-experiment-workflow and SPA read and no public route serves.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Append-only, so a repeat call adds a second event unless idempotency_key is passed.

## get-experiment-document

- **Read Only: True** — Read-only: Read one working document attached to an experiment, with its full markdown. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-experiment-document

- **Read Only: False** — Not read-only, it writes stored state: Store a working document on an experiment.
- **Open World: False** — SetExperimentDocumentTool writes geo_experiment_documents, which PublicDeliverableController::show never reads; in_dossier documents reach the client only when a later build-deliverable call copies them into the manifest snapshot in DeliverableBuildService.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — ExperimentWorkflowService::setDocument() upserts one geo_experiment_documents row with firstOrNew on (experiment, kind, key) and a clean model is not re-saved, so a repeat creates no second row and writes nothing.

## record-keyword-research

- **Read Only: False** — Not read-only, it writes stored state: Record the keyword demand behind a campaign's prompts and the keep or drop verdict on each candidate.
- **Open World: True** — Kept keyword rows are served to the institution's client as the demand evidence on the deliverable page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — ExperimentWorkflowService::recordKeywordResearch() upserts each row with firstOrNew on (campaign, keyword), writes only the keys supplied and stamps researched_at only on a new row, so a repeat with the same rows changes nothing.

## set-experiment-opportunity

- **Read Only: False** — Not read-only, it writes stored state: Write an experiment's opportunity block: headline, demand, verdict and target prompts.
- **Open World: False** — SetExperimentOpportunityTool writes geo_experiments.opportunity, which PublicDeliverableController::show never reads; it reaches the client only when a later build-deliverable call copies it into the stored manifest in DeliverableBuildService.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — SetExperimentOpportunityTool::handle() calls ExperimentWorkflowService::recordEvent() with no idempotency key after saving the block, which inserts a new opportunity_set geo_experiment_events row on every call, so a repeat appends a second event.

## update-deliverable-draft

- **Read Only: False** — Not read-only, it writes stored state: Patch a deliverable while drafting: send only the changed parts and the server applies them to the stored manifest.
- **Open World: True** — Patches the stored manifest, which the public deliverable page serves to the institution's client directly.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — DeliverableDraftService::apply() replaces checklist and actionItems wholesale in the caller's key order and saves through DeliverableIngestService::applyManifest(), and because MySQL's JSON column stores keys reordered, a repeat is seen as a change and HasVersions writes a new geo_deliverable_versions row and bumps current_version.

## build-deliverable

- **Read Only: False** — Not read-only, it writes stored state: Assemble the client page from server state and save one version: the draft manifest plus the experiment's opportunity block and dossier documents.
- **Open World: True** — Assembles and saves the client page the institution's client opens.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call saves another version of the client page.

## record-deliverable-check

- **Read Only: False** — Not read-only, it writes stored state: Record the result of a check performed on a deliverable, with its findings.
- **Open World: True** — Recorded check verdicts are served to the institution's client on the deliverable page.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Append-only: each call records another check result.

## list-deliverable-checks

- **Read Only: True** — Read-only: List the checks recorded on a deliverable: result, summary, findings, who recorded it, and whether it has gone stale because the manifest version or article changed. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-campaign-readiness

- **Read Only: True** — Read-only: Report whether a campaign has enough completed responses to measure: the share of prompts populated in a lookback window, per-prompt counts and latest response dates, in-progress jobs, and the auto-run schedule. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## research-keywords

- **Read Only: False** — Not read-only, it writes stored state: Buy search demand (monthly volume, difficulty, intent) for a batch of keywords from DataForSEO and record it against a campaign.
- **Open World: True** — Buys search-demand data from DataForSEO, a paid external API.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — ResearchKeywordsTool::handle() buys from DataForSEO's paid keyword_overview and search_volume endpoints for every keyword that is uncached, which on a repeat still includes every keyword when refresh is true and every keyword that came back with no data (those are never stored), so a repeat can spend again.

## list-deliverables-needing-attention

- **Read Only: True** — Read-only: List the team's deliverables with unprocessed client activity or an outstanding blocking item, each with the waiting activity by kind and age, the blocking items, followup state, client link and linked experiment. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## mark-deliverable-activity-processed

- **Read Only: False** — Not read-only, it writes stored state: Move a deliverable's processed watermark, which is what takes it off list-deliverables-needing-attention.
- **Open World: False** — MarkDeliverableActivityProcessedTool only moves geo_deliverables.activity_processed_through_id, an internal watermark that PublicDeliverableController::show does not return.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — DeliverableAttentionService::markProcessed() compares the target activity id with the stored watermark and skips the save when they match, so a repeat reports 'Nothing changed' and writes nothing.

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
- **Open World: True** — A funnel created by a team that shares anonymously is read live by other customers' teams, because FunnelSearchController::search() returns every is_private=false funnel's name, conversion_value, snapshots and organization title and domain through FunnelPublicResource, and Dashboard::funnels() puts it in their comparison dashboards.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new funnel row.

## update-funnel

- **Read Only: False** — Not read-only, it writes stored state: Update a CRO funnel's name, category_id or conversion_value.
- **Open World: True** — A conversion_value change queues a snapshot and dashboard re-analysis against Google Analytics.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — UpdateFunnelTool::handle() accepts any numeric conversion_value but cro_funnels.conversion_value is an INT column, so a fractional value such as 12.5 is stored as 13 and every repeat reads back as a change, firing the Funnel::booted() updated hook that queues another FunnelSnapshotAction Google Analytics fetch and another AnalyzeDashboardAction chain that inserts new cro_analyses rows.

## delete-funnel

- **Read Only: False** — Not read-only, it writes stored state: Delete a CRO funnel and its steps.
- **Open World: True** — Deleting a funnel from a team that shares anonymously removes it from other customers' teams, since FunnelSearchController::search() lists is_private=false funnels across all teams and Dashboard::funnels() drops the trashed funnel from the peer dashboards other teams built on it.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — DeleteFunnelTool::handle() soft-deletes the funnel (Funnel uses SoftDeletes with CascadeSoftDeletes on steps and messages and has no deleting hook), and a repeat call's Funnel::findOrFail() skips trashed rows and returns 'Funnel not found in this team.' without writing.

## replicate-funnel

- **Read Only: False** — Not read-only, it writes stored state: Deep-copy a CRO funnel and all its steps into a new funnel named "<name> (Copy)".
- **Open World: True** — ReplicateFunnelTool::handle() creates a new funnel with the source's name, conversion_value and snapshots, and for a team that shares anonymously that copy is listed live to other customers' teams by FunnelSearchController::search() through FunnelPublicResource.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call creates another copy of the funnel.

## create-funnel-step

- **Read Only: False** — Not read-only, it writes stored state: Add a step to a CRO funnel, defined by the Google Analytics conditions that count a user as reaching it.
- **Open World: True** — A step added to a funnel of a team that shares anonymously changes what other customers' teams see, because FunnelSearchController::search() returns the funnel's steps_count through FunnelPublicResource and Dashboard::funnels() feeds its steps into their comparison dashboards.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call appends another step.

## update-funnel-step

- **Read Only: False** — Not read-only, it writes stored state: Update a funnel step's name, order, metrics or metrics_expression.
- **Open World: True** — An order, metrics or expression change queues a snapshot and dashboard re-analysis against Google Analytics.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — UpdateFunnelStepTool::handle() writes metrics through FunnelStepMetricsCast::set(), which json_encodes them without spaces while the MySQL json column hands back its own normalized text, so every repeat with metrics reads as dirty and FunnelStep::booted() queues another FunnelSnapshotAction Google Analytics fetch and another dashboard re-analysis that inserts new cro_analyses rows.

## delete-funnel-step

- **Read Only: False** — Not read-only, it writes stored state: Delete one step from a CRO funnel.
- **Open World: True** — Deleting a step from a funnel of a team that shares anonymously changes what other customers' teams see, because FunnelSearchController::search() returns the funnel's steps_count through FunnelPublicResource and Dashboard::funnels() feeds its steps into their comparison dashboards.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — DeleteFunnelStepTool::handle() soft-deletes the step (FunnelStep uses SoftDeletes and only hooks updated, so no snapshot or re-analysis runs), and a repeat call's $funnel->steps()->findOrFail() skips the trashed step and returns 'Funnel or step not found in this team.' without writing.

## get-funnel-report

- **Read Only: True** — Read-only: Live Google Analytics funnel report: user counts and step-to-step conversion for each step of one funnel over a date range. It changes no stored state.
- **Open World: True** — Queries the team's Google Analytics property live.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## ga-page-users

- **Read Only: True** — Read-only: Live Google Analytics pages report for a team: page path, hostname, page title and users over a date range. It changes no stored state.
- **Open World: True** — Queries the team's Google Analytics property live.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## ga-outbound-link-users

- **Read Only: True** — Read-only: Live Google Analytics outbound-link report for a team: link URL, source page path and users over a date range. It changes no stored state.
- **Open World: True** — Queries the team's Google Analytics property live.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-dashboards

- **Read Only: True** — Read-only: List a team's CRO dashboards with their issue, warning and analysis state. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-dashboard

- **Read Only: True** — Read-only: Get one CRO dashboard: attached funnels in order (the first is the subject funnel, the rest comparisons), per-funnel disabled steps and issues, and the latest median and max analyses. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-dashboard

- **Read Only: False** — Not read-only, it writes stored state: Create a CRO dashboard, which compares one subject funnel against comparison funnels of the same shape.
- **Open World: False** — CreateDashboardTool::handle() inserts a cro_dashboards row for the caller's team only, Dashboard carries TeamScope via BelongsToTeam, and no public, client or cross-team route in routes/cro.php serves dashboards, so nobody outside the team sees it.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new dashboard row.

## update-dashboard

- **Read Only: False** — Not read-only, it writes stored state: Update a CRO dashboard's name, description or notes.
- **Open World: False** — UpdateDashboardTool::handle() only changes the calling team's own dashboard name, description and notes, which are served solely through team.member routes in routes/cro.php and never to another team or a public page.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — UpdateDashboardTool::handle() sets plain name, description and notes columns, Dashboard has no observers or update hooks beyond DashboardIsOrderable's reorder (which only runs when the request carries an order this tool never sends), so a repeat with the same values is not dirty and writes nothing.

## delete-dashboard

- **Read Only: False** — Not read-only, it writes stored state: Delete a CRO dashboard.
- **Open World: False** — DeleteDashboardTool::handle() soft-deletes the calling team's own dashboard, which no other team or public route can read, and it leaves the funnels (the only peer-shared records) untouched.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — DeleteDashboardTool::handle() soft-deletes the dashboard (Dashboard uses SoftDeletes and has no deleting hook), and a repeat call's Dashboard::findOrFail() skips the trashed row and returns 'Dashboard not found in this team.' without writing.

## set-dashboard-funnels

- **Read Only: False** — Not read-only, it writes stored state: Replace which funnels a CRO dashboard compares, in order.
- **Open World: False** — SetDashboardFunnelsTool::handle() only rewrites the cro_dashboard_funnel pivot of the calling team's own dashboard, which reads peer funnels but changes nothing another team sees and triggers no Google Analytics call.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — SetDashboardFunnelsTool::handle() calls allFunnels()->sync() with the same funnel IDs and orders, which attaches and detaches nothing on a repeat (the plain pivot has no model events) and triggers no analysis, so only the pivot and dashboard updated_at timestamps move.

## analyze-dashboard

- **Read Only: False** — Not read-only, it writes stored state: Run a dashboard analysis now against live Google Analytics: compares the subject funnel to its comparison funnels over the last 28 days, writes fresh median and max analyses, flags issues, and recomputes the organization's total assets.
- **Open World: True** — Runs the analysis against live Google Analytics before writing results.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call creates new analysis rows and re-queries Google Analytics.

## get-analysis

- **Read Only: True** — Read-only: Get one stored dashboard analysis: subject funnel conversion against the comparison funnels, the biggest-opportunity step, and the potential asset change. It changes no stored state.
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
- **Open World: False** — CreateRecommendationTool::handle() inserts a cro_recommendations row scoped to the caller's team with no AI call and no publish, and recommendations reach WordPress only through the separate wordpress/pages route, so nobody outside the team sees it.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call inserts a new recommendation row.

## update-recommendation

- **Read Only: False** — Not read-only, it writes stored state: Update a CRO recommendation's title, prompt or written content.
- **Open World: False** — UpdateRecommendationTool::handle() changes only the calling team's own recommendation title, prompt and content, which are served solely through team.member routes and reach WordPress only through a later separate wordpress/pages push.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — UpdateRecommendationTool::handle() sets the plain title, prompt and content columns, and Recommendation only hooks deleting (no history rows, versions or notifications), so a repeat with the same values is not dirty and writes nothing.

## delete-recommendation

- **Read Only: False** — Not read-only, it writes stored state: Hard-delete a CRO recommendation with its generated pages and blocks.
- **Open World: False** — DeleteRecommendationTool::handle() hard-deletes the calling team's own recommendation, pages and blocks from the database only, and does not unpublish or touch any WordPress page an earlier push created.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — DeleteRecommendationTool::handle() hard-deletes the recommendation and its pages and blocks through the Recommendation and Page deleting hooks, and a repeat call's Recommendation::findOrFail() finds no row and returns 'Recommendation not found in this team.' without writing.

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

- **Read Only: True** — Read-only: Return the always-on MetriFi rules bundle: page design process, styling, organisms, placeholders, navigation defaults, rate management and anti-patterns. It changes no stored state.
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

- **Read Only: True** — Read-only: The cross-product anti-patterns guide: the test-backed losing moves such as stripping content, tab navigation, urgency-only headlines, hero rate grids and competing CTAs. It changes no stored state.
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

- **Read Only: False** — Not read-only, it writes stored state: Re-tenant a site to a different team by updating its metrifi-team-<id> repo topic, so it moves in list-sites and its publish and access permissions re-scope.
- **Open World: True** — Rewrites the repository's team topic through the GitHub API.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — SiteService::moveSite() replaces the repo's metrifi-team topic with the target team's and PUTs the topic set, and a repeat PUTs the identical set, so the repo, list-sites and permissions end up exactly as after the first call.

## delete-site

- **Read Only: False** — Not read-only, it writes stored state: Take a MetriFi site off the platform: its Vercel project, deployments and hosts, its review workspace, and its registry entry (it leaves list-sites).
- **Open World: True** — Deletes the Vercel project, its deployments and hosts through Vercel's API.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — SiteService::deleteSite() deletes the Vercel project, strips the registry topics and deletes the review, and a repeat finds no Vercel project, gets 'no_topics' from deregisterSiteRepo() without a PUT, and deletes zero review rows, so it changes nothing.

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

- **Read Only: False** — Not read-only, it writes stored state: Create or overwrite one or more files in a single commit on the working branch, created off main on the first write.
- **Open World: True** — Commits to the site's github repository through the github api, and assigns the Vercel draft host after the commit lands.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call lands another commit on the working branch.

## delete-files

- **Read Only: False** — Not read-only, it writes stored state: Delete one or more files from a site repo in a single commit on the working branch.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — DeleteFilesTool::handle() filters the requested paths against the branch tree and returns without committing when none exist, so a repeat reports them as not_found and makes no commit.

## file-history

- **Read Only: True** — Read-only: The commit log for any path in a site repo, newest first, with who each change is attributed to. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api's commit log.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-preview-url

- **Read Only: True** — Read-only: Get the one-click link to view a site. It changes no stored state.
- **Open World: True** — Asks Vercel which hosts and deployments exist for the site.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## create-asset-upload

- **Read Only: False** — Not read-only, it writes stored state: Get a short-lived URL for uploading image files to this site, since image bytes cannot pass through a tool argument.
- **Open World: True** — Mints an upload URL against Vercel Blob storage.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — CreateAssetUploadTool::handle() mints a fresh URL::temporarySignedRoute upload URL with a new 30 minute expiry on every call, so each repeat issues an additional live upload credential for the site.

## list-site-assets

- **Read Only: True** — Read-only: List the images a human uploaded for this site. It changes no stored state.
- **Open World: True** — Lists objects in Vercel Blob storage.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## delete-site-asset

- **Read Only: False** — Not read-only, it writes stored state: Delete a staged upload from blob storage after its bytes have been committed into the site repo.
- **Open World: True** — Deletes an object from Vercel Blob storage.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — SiteAssets::deleteFor() sends one blob delete for the URL, and a repeat deletes a blob that is already gone, which leaves storage unchanged and writes nothing else.

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

- **Read Only: False** — Not read-only, it writes stored state: Create or update a rate in the site's central store on the working branch.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — RateService::setRate() always calls RepoIo::commitFiles(), which has no unchanged-content check and makes a new git commit on the working branch every call, and when effective_at is omitted it stamps the current time so a repeat also appends a second timeline entry to rates.json.

## list-scheduled-changes

- **Read Only: True** — Read-only: List every pending future-dated rate change across the site, sorted by effective time. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## cancel-scheduled-change

- **Read Only: False** — Not read-only, it writes stored state: Remove a pending future rate change before it takes effect, identified by its exact effective_at.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — RateService::cancelScheduledChange() removes the timeline entry at that exact effective_at and commits, and a repeat finds no entry at that time and throws "No scheduled change" before commitFiles runs, so nothing is written.

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

- **Read Only: False** — Not read-only, it writes stored state: Run the scheduled-rate scan for one site: if a change on main has come due since the last production build, trigger a production rebuild so it goes live.
- **Open World: True** — Triggers a production rebuild on Vercel when a scheduled change has come due.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — RateService::activateDueForSite() pushes an empty release commit to main, which rebuilds production, whenever a past rate entry is newer than the latest Vercel production deployment, and a repeat made before Vercel registers that rebuild, or while the Vercel lookup fails and lastDeploy falls back to 0, pushes another commit and another rebuild.

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
- **Idempotent: False** — FactService::setFact() rewrites facts.json through RepoIo::commitFiles(), which never compares the new tree with the parent, so every repeat with the same value lands another git commit on the working branch.

## get-brand

- **Read Only: True** — Read-only: Read the site's brand record from src/data/brand.json: raw palette, shadcn semantic token mapping, fonts, radius, assets and voice. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-brand

- **Read Only: False** — Not read-only, it writes stored state: Write the site's brand record and regenerate its CSS in one commit on the working branch: src/data/brand.json plus src/styles/brand.generated.css.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — BrandService::setBrand() writes brand.json and brand.generated.css through RepoIo::commitFiles() with no check against the current files, so every repeat with the same brand lands another git commit on the working branch.

## validate-brand

- **Read Only: True** — Read-only: Lint the site's brand record against the canonical token contract and report readiness flags: LOGO_MISSING, LOGO_DARK_VARIANT_NEEDED, FAVICON_MISSING, FONT_FILE_MISSING, FONT_LICENSE_VERIFY, PALETTE_UNRESOLVED and COMPLIANCE_UNRESOLVED, the last of which gates publishing. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## extract-brand

- **Read Only: True** — Read-only: Scaffold a proposed brand from a live website: favicon, theme-color, og:image and font hints. It changes no stored state.
- **Open World: True** — Fetches the institution's live public website over HTTP.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## import-brand-from-design

- **Read Only: True** — Read-only: Normalize a token CSS block into a proposed brand record: parses the :root color custom properties as the palette and maps common names onto the shadcn semantic contract. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-compliance

- **Read Only: True** — Read-only: Read the site's compliance record from src/data/compliance.json: charter type, insurer, regulator, and the disclosure elements every published page set must carry. It changes no stored state.
- **Open World: True** — Reads the site's github repository through the github api.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## set-compliance

- **Read Only: False** — Not read-only, it writes stored state: Write the site's compliance record (charter type, insurer, regulator, required disclosure ids) to src/data/compliance.json on the working branch.
- **Open World: True** — Commits to the site's github repository through the github api.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — ComplianceService::setCompliance() commits compliance.json through RepoIo::commitFiles() on every call with no unchanged check, and SetComplianceTool::handle() stamps confirmedAt with the current time whenever confirmed_by is given, so a repeat lands another git commit with different content.

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
- **Idempotent: True** — ReviewIngestService::store() creates the one review per site or upserts its spec by source_id, and it reopens a round only when the status is published, which the reopen sets to in_review, so a repeat with the same spec reopens nothing, creates no rows and records no activity.

## push-review-revision

- **Read Only: False** — Not read-only, it writes stored state: Record a new revision on a site's review once the draft deploy is live.
- **Open World: True** — Verifies the Vercel draft deployment and re-anchors what the institution's client sees in the overlay.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: False** — Each call bumps the review version and snapshots the spec again.

## get-review

- **Read Only: True** — Read-only: Full state of a site's review workspace: status, round and version, client approval with staleness, participants, per-page coverage, all action items with resolution and anchor flags, the internal checklist, thread counts, outstandingWork, and the clientUrl to share. It changes no stored state. The clientUrl it returns is the client review link the user asked for; only the link-handing tools return it and list-reviews never does.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## list-reviews

- **Read Only: True** — Read-only: List review workspaces on sites the caller can access, with status, round, approval and readiness. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-pending-feedback

- **Read Only: True** — Read-only: The actionable feedback queue for a site's review: open client threads with their screenshots, grouped by page, plus agent-raised action items the client has replied to. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## get-feedback-item

- **Read Only: True** — Read-only: One feedback thread in full: element anchor, text-edit diff, the whole comment history, staleness and orphan flags, and the screenshot when one exists. It changes no stored state.
- **Open World: False** — Touches only MetriFi's own database, scoped to the caller's team: no external API call, no outbound email, and nothing a client-facing page shows.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: True** — Reads only, so any number of identical calls leaves the system exactly as it was.

## manage-review-item

- **Read Only: False** — Not read-only, it writes stored state: Apply the client's own card controls in batch: done, reopen, assign, unassign, archive, unarchive or delete on action items (source_ids), and reopen, archive, unarchive or delete on edit threads (thread_ids).
- **Open World: True** — Changes the cards the institution's client sees in the overlay, and assign emails the address a link.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — ReviewItemManager applies every action as a guarded UPDATE that records activity only when a row actually changed, and assign() returns early when the item already has that assignee_email, so a repeat is skipped as already in that state with no activity row and no email.

## resolve-feedback

- **Read Only: False** — Not read-only, it writes stored state: Mark feedback threads resolved because the change was applied or otherwise addressed, in batch.
- **Open World: True** — The resolution note is shown to the institution's client in the review overlay.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — ResolveFeedbackTool::handle() only saves and records thread_resolved for threads still open, so a repeat finds them resolved and skips them without a save, activity row or notification.

## dismiss-feedback

- **Read Only: False** — Not read-only, it writes stored state: Close feedback threads as won't-fix, in batch.
- **Open World: True** — The required reason is shown to the institution's client in the review overlay.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — DismissFeedbackTool::handle() only saves and records thread_dismissed for threads still open, so a repeat finds them dismissed and skips them without a save, activity row or notification.

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
- **Idempotent: True** — SetReviewStatusTool::handle() returns early when the review already has the requested status, so a repeat neither saves nor records a status_changed activity.

## send-review

- **Read Only: False** — Not read-only, it writes stored state: Email the review link to every participant, optionally provisioning one new recipient first.
- **Open World: True** — Emails the review link to client participants outside MetriFi.
- **Destructive: False** — Not destructive: it only adds new state or returns data; nothing existing is overwritten or removed.
- **Idempotent: False** — Each call emails the participants again.

## delete-review

- **Read Only: False** — Not read-only, it writes stored state: Permanently delete a site's review workspace: every thread, comment, action item, checklist item, activity, participant, revision and attestation, including typed-name compliance sign-offs.
- **Open World: True** — Permanently destroys the client review workspace, including everything the institution's client submitted.
- **Destructive: True** — Destructive: it overwrites, closes or removes state that already exists, so a prior value or row does not survive the call.
- **Idempotent: True** — DeleteReviewTool::handle() deletes the site's review with its cascades, and a repeat finds no review, so resolveReview() throws and nothing is deleted or written.
