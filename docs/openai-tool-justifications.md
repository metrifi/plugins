# MCP tool annotation justifications (OpenAI review form)

161 tools, tools/list order. Each line is one form field.


## list-teams

- **Read Only: True** — Runs SELECTs for the teams the caller owns or has joined plus their member counts and formats them. No inserts, updates or deletes.
- **Open World: False** — Reads only MetriFi's own teams and team_user tables for the calling user. No external service is contacted.
- **Destructive: False** — Read-only listing, so no record or state is modified or removed.

## create-team

- **Read Only: False** — Inserts a team row, attaches the caller as admin, assigns each product's default plan and creates the team's tracked organization.
- **Open World: False** — Every write lands in MetriFi's own database. No email is sent and no external API is called.
- **Destructive: False** — Purely additive: it creates a new team and its organization and changes no existing team or membership.

## get-team-usage

- **Read Only: True** — Reads the team and its per-product usage and quota counters and renders them. Performs no writes.
- **Open World: False** — Reads only MetriFi's own database rows for the team the caller already belongs to.
- **Destructive: False** — Read-only report, so nothing is modified or deleted.

## whoami

- **Read Only: True** — Reads the authenticated user, their owned and joined teams, current team and pending invitations. Performs no writes.
- **Open World: False** — All of it comes from MetriFi's own users, teams and invitation tables for the caller.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## rename-team

- **Read Only: False** — Runs an UPDATE on the team's name column after checking the caller is owner or admin.
- **Open World: False** — The update stays in MetriFi's database, scoped to a team the caller manages.
- **Destructive: True** — It overwrites the existing team's name in place (the slug is kept), which changes an existing record.

## switch-team

- **Read Only: False** — Writes current_team_id on the caller's own user row.
- **Open World: False** — Only the caller's user row in MetriFi's database is touched.
- **Destructive: True** — It overwrites the caller's existing current_team_id value rather than adding a record.

## list-members

- **Read Only: True** — Reads the team's accepted members and pending invitations from the membership pivot and formats them. No writes.
- **Open World: False** — Reads only MetriFi's own team membership rows for a team the caller belongs to.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## invite-member

- **Read Only: False** — Creates or finds the invitee user, writes a pending membership pivot row, mints an invitation token and sends an email.
- **Open World: True** — It emails an invitation to an arbitrary address through MetriFi's mail transport, so the effect leaves our system.
- **Destructive: False** — Additive: it adds a pending invitation. An already accepted membership is refused, not changed; re-inviting a still pending address only refreshes that pending invite.

## revoke-invitation

- **Read Only: False** — Detaches the pending membership pivot row for that email and deletes its invitation tokens.
- **Open World: False** — Only MetriFi's own membership and invitation-token rows are touched. No mail is sent.
- **Destructive: True** — It deletes the pending invitation rows for that address, which removes existing state.

## accept-invitation

- **Read Only: False** — Updates the caller's membership pivot to accepted with a joined_at stamp, sets their current_team_id and deletes the used invitation token.
- **Open World: False** — All writes are to MetriFi's own membership, user and invitation-token rows.
- **Destructive: True** — Updates the caller's team membership, overwrites their current_team_id, and deletes the used invitation token row.

## decline-invitation

- **Read Only: False** — Detaches the caller's pending membership pivot row and deletes their invitation token for that team.
- **Open World: False** — Only MetriFi's own membership and invitation-token rows are touched.
- **Destructive: True** — It deletes the caller's pending invitation, which removes existing state.

## remove-member

- **Read Only: False** — Detaches the target user's membership pivot row from the team after an owner or admin check.
- **Open World: False** — Only MetriFi's own team membership rows are touched. The removed person is not emailed.
- **Destructive: True** — It deletes an existing membership row. The owner is refused.

## set-member-role

- **Read Only: False** — Updates the role column on an existing team membership pivot row.
- **Open World: False** — Only MetriFi's own membership rows are touched.
- **Destructive: True** — It overwrites the member's current role in place, which changes an existing record.

## transfer-team-ownership

- **Read Only: False** — Rewrites the team's owner_id and demotes the previous owner to admin on the membership pivot.
- **Open World: False** — Only MetriFi's own team and membership rows are touched.
- **Destructive: True** — It overwrites ownership on an existing team and changes the previous owner's role.

## list-super-admins

- **Read Only: True** — Reads users carrying the super_admin platform role and the Super Owner emails from committed config. No writes.
- **Open World: False** — Reads MetriFi's own users table and a config file. No external service.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## set-platform-role

- **Read Only: False** — Writes the platform_role column on the target user row to grant or revoke super_admin.
- **Open World: False** — Only MetriFi's own users table is touched.
- **Destructive: True** — It overwrites an existing user's platform role, and revoking removes access they had.

## list-all-teams

- **Read Only: True** — Runs a filtered SELECT over every team with owner, plan and member count for platform staff. No writes.
- **Open World: False** — Cross-tenant, but still only MetriFi's own teams and users tables. No external service is called.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## find-users

- **Read Only: True** — Runs a filtered SELECT over the users table for platform staff and returns matching accounts. No writes.
- **Open World: False** — Reads only MetriFi's own users table. No external directory or service is queried.
- **Destructive: False** — Read-only search, so nothing is modified or deleted.

## list-tokens

- **Read Only: True** — Reads the caller's own unrevoked Passport OAuth tokens and Sanctum personal access tokens. No writes.
- **Open World: False** — Reads MetriFi's own token storage, scoped to the calling user.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## revoke-token

- **Read Only: False** — Marks one of the caller's access tokens revoked and flips its refresh tokens to revoked.
- **Open World: False** — Only MetriFi's own OAuth token rows are updated. Nothing is sent anywhere.
- **Destructive: True** — It revokes an existing credential, so a connected client loses access until it reconnects.

## list-campaigns

- **Read Only: True** — Selects the team's GEO campaigns and formats them. No writes.
- **Open World: False** — Reads only campaign rows in MetriFi's database scoped to the caller's team.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-campaign

- **Read Only: True** — Selects one campaign belonging to the caller's team and formats it. No writes.
- **Open World: False** — Reads a single campaign row from MetriFi's database, scoped to the caller's team.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## create-campaign

- **Read Only: False** — Inserts a new campaign row for the team with the given name, description, location and keywords.
- **Open World: False** — The insert lands in MetriFi's own database. No external service is called.
- **Destructive: False** — Purely additive: it creates a campaign and changes no existing record.

## set-campaign-location

- **Read Only: False** — Writes dataforseo_location_code and dataforseo_location_name onto the campaign once a geo target is resolved.
- **Open World: True** — It calls DataForSEO's Google Ads locations API to resolve the place name or code before saving.
- **Destructive: True** — It overwrites the campaign's existing geo target, which changes which location later keyword buys measure.

## list-prompts

- **Read Only: True** — Selects the campaign's prompts with response counts and computes mention percentages from existing rows. No writes.
- **Open World: False** — Reads only prompt, response and term rows in MetriFi's database for the caller's team.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-prompt

- **Read Only: True** — Selects one prompt with its terms and in-progress responses. No writes.
- **Open World: False** — Reads MetriFi's own prompt rows, scoped to the caller's team.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## create-prompt

- **Read Only: False** — Inserts a prompt row on the named campaign and returns it with a geography warning when relevant.
- **Open World: False** — The insert lands in MetriFi's database. The prompt is not sent to any LLM here; run-prompt does that.
- **Destructive: False** — Purely additive: it creates a prompt and changes no existing record.

## list-responses

- **Read Only: True** — Selects the stored LLM responses already recorded for a prompt, optionally filtered by provider. No writes.
- **Open World: False** — Reads response rows already in MetriFi's database. No provider is called.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-response

- **Read Only: True** — Selects one stored response joined through the caller's prompts and formats it. No writes.
- **Open World: False** — Reads a stored response row from MetriFi's database. No LLM provider is contacted.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## get-org-visibility

- **Read Only: True** — Runs aggregate SQL over stored responses and term mentions to rank organizations by visibility. No writes.
- **Open World: False** — All counting happens over MetriFi's own response and term tables for the caller's campaign.
- **Destructive: False** — Read-only report, so nothing is modified or deleted.

## get-team-report

- **Read Only: True** — Calls five read-only tools (get-team-usage, list-campaigns, list-experiments, list-deliverables, get-ai-user-bot-traffic) and concatenates their output. None of them write.
- **Open World: True** — One section is get-ai-user-bot-traffic, which queries the external Supabase AI bot-traffic store, so the fan-out leaves our database.
- **Destructive: False** — Read-only report, so nothing is modified or deleted.

## run-prompt

- **Read Only: False** — Checks quota, then dispatches RunPromptJob queue jobs which call LLM providers and insert response rows.
- **Open World: True** — The queued jobs send the prompt text to external LLM providers such as OpenAI, Anthropic and Google.
- **Destructive: False** — Additive: the run appends new response rows. The prompt and earlier responses are left as they are.

## run-campaign-prompts

- **Read Only: False** — Checks quota for the whole batch, then dispatches a RunPromptJob per prompt and provider, each of which writes a response row.
- **Open World: True** — The queued jobs send every prompt in the campaign to external LLM providers.
- **Destructive: False** — Additive: it appends new response rows across the campaign and changes no existing prompt or response.

## get-experiment-insights

- **Read Only: True** — Reads cross-experiment aggregates over action types, source types and tags from the database. No writes.
- **Open World: False** — All aggregation runs over MetriFi's own experiment tables. No external service is called.
- **Destructive: False** — Read-only report, so nothing is modified or deleted.

## list-experiments

- **Read Only: True** — Selects the team's experiments with campaign and prompt counts. No writes.
- **Open World: False** — Reads only experiment rows in MetriFi's database for the caller's team.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-experiment

- **Read Only: True** — Loads one experiment with prompts, actions and parent, then computes metrics in memory. No writes.
- **Open World: False** — Reads MetriFi's own experiment and response data for the caller's team.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## create-experiment

- **Read Only: False** — Inserts an experiment row, deriving the measurement and baseline windows when they are not supplied.
- **Open World: False** — The insert lands in MetriFi's database. No external service is called.
- **Destructive: False** — Purely additive: it creates an experiment and changes no existing record.

## update-experiment

- **Read Only: False** — Updates the experiment's columns in a transaction and syncs its prompt pivot.
- **Open World: False** — All writes are to MetriFi's own experiment tables for the caller's team.
- **Destructive: True** — It overwrites existing fields, and the default prompt_ids mode is sync, which detaches prompt links not in the list.

## set-experiment-analysis

- **Read Only: False** — Writes the analysis JSON (organizations, sources, summary) and analyzed_at onto the experiment.
- **Open World: False** — The write stays in MetriFi's database. No model is called; the caller supplies the analysis.
- **Destructive: True** — It replaces any analysis already stored on that experiment.

## set-experiment-recommendation

- **Read Only: False** — Writes the recommendation JSON and recommended_at, then deletes the experiment's action rows and recreates them from the payload.
- **Open World: False** — All writes are to MetriFi's own experiment and action tables.
- **Destructive: True** — It replaces the stored recommendation and deletes every existing action row on the experiment before inserting the new set.

## set-experiment-case-study

- **Read Only: False** — Writes the case_study JSON and case_study_generated_at onto the experiment.
- **Open World: False** — The write stays in MetriFi's database. No external service is called.
- **Destructive: True** — It replaces any case study already stored on that experiment.

## list-action-types

- **Read Only: True** — Selects the ordered action-type reference rows and formats them. No writes.
- **Open World: False** — Reads a MetriFi reference table. No external service is called.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-ai-user-bot-traffic

- **Read Only: True** — Looks up the team's owned organization domain, then reads aggregated bot-hit data. It stores nothing.
- **Open World: True** — It queries the external Supabase AI traffic service by domain for the site's bot hits.
- **Destructive: False** — Read-only report, so nothing is modified or deleted.

## get-team-health

- **Read Only: False** — Reads the cached team health board, but when none exists or it is stale it queues a refresh job that recomputes and stores the board, so a call can cause a write. Re-running has no further effect.
- **Open World: False** — The board is computed from MetriFi's own GEO and CRO tables across teams. No external service is called.
- **Destructive: False** — Only computes and caches a health board; never modifies or deletes existing team data.

## get-master-health

- **Read Only: False** — Reads the cached cross-team health board, but a missing or stale board queues a refresh that recomputes it and writes the weekly summary, so a call can cause a write.
- **Open World: False** — Everything is computed from MetriFi's own platform tables. No external service is called.
- **Destructive: False** — Only recomputes and caches health data; never modifies or deletes existing records.

## list-deliverables

- **Read Only: True** — Selects the team's deliverables with action items, checklist items and participant counts. No writes.
- **Open World: False** — Reads only deliverable rows in MetriFi's database for the caller's team.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-deliverable

- **Read Only: True** — Loads one deliverable and its experiment and renders the stored manifest content. No writes.
- **Open World: False** — Reads MetriFi's own deliverable rows for the caller's team. No email is sent.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## create-deliverable

- **Read Only: False** — Stores the manifest: it writes the deliverable row and materializes its action items, checklist items and threads.
- **Open World: False** — All writes are to MetriFi's own deliverable tables. The client is not emailed here; send-deliverable does that.
- **Destructive: True** — It stores by slug, so an existing deliverable with the same slug is updated in place (manifest, status, items rewritten) rather than duplicated.

## push-deliverable-revision

- **Read Only: False** — Applies a new manifest to an existing deliverable, bumping the version and recording revision activity.
- **Open World: False** — All writes are to MetriFi's own deliverable tables. No email goes out on this call.
- **Destructive: True** — It overwrites the deliverable's manifest, title, status and re-materializes its action and checklist items.

## get-deliverable-activity

- **Read Only: True** — Selects the deliverable's client activity ledger, optionally since a timestamp. No writes.
- **Open World: False** — Reads MetriFi's own activity rows for the caller's team.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## set-deliverable-status

- **Read Only: False** — Writes the status column (and publish_plan when given) and appends a status-changed activity row.
- **Open World: False** — All writes are to MetriFi's own deliverable tables.
- **Destructive: True** — It overwrites the deliverable's current status, which changes what the client-facing page shows and whether it can publish.

## reopen-action-item

- **Read Only: False** — Flips an answered action item back to open, records a reopened activity row and may clear the deliverable's approval.
- **Open World: False** — All writes are to MetriFi's own deliverable tables. The client is not emailed by this call.
- **Destructive: True** — It overwrites an item's answered state and can withdraw an approval the client already gave.

## withdraw-deliverable-approval

- **Read Only: False** — Clears the deliverable's approval fields and records an approval-withdrawn activity row.
- **Open World: False** — All writes are to MetriFi's own deliverable tables.
- **Destructive: True** — It removes an approval the client already granted, so the deliverable can no longer be published until re-approved.

## send-deliverable

- **Read Only: False** — Creates or updates the client participant, sends the notification emails and records send bookkeeping and activity.
- **Open World: True** — It emails the client's real address through MetriFi's mail transport, so a person outside the team receives it.
- **Destructive: False** — Additive: it adds participant and activity rows and send stamps. The deliverable's content is not changed or removed.

## send-deliverable-followup

- **Read Only: False** — Sends a nudge email to the client contacts and increments the deliverable's followup counter with an activity row.
- **Open World: True** — It emails the client contacts through MetriFi's mail transport.
- **Destructive: False** — Additive: it appends followup bookkeeping and activity. The deliverable's content is untouched.

## record-deliverable-shared

- **Read Only: False** — Records a manual share: it attaches or updates the client participant and stamps the deliverable's share and send bookkeeping.
- **Open World: False** — Nothing is sent. Only MetriFi's own deliverable and participant rows are written.
- **Destructive: True** — It overwrites share and send timestamps on the existing deliverable and can update an existing participant row.

## get-experiment-workflow

- **Read Only: True** — Reads the experiment's workflow status, documents and recent events into a rollup. No writes.
- **Open World: False** — Reads MetriFi's own experiment workflow tables for the caller's team.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## set-experiment-workflow

- **Read Only: False** — Writes the experiment's workflow status and appends a workflow event.
- **Open World: False** — All writes are to MetriFi's own experiment tables.
- **Destructive: True** — It overwrites the experiment's current workflow status.

## add-experiment-event

- **Read Only: False** — Inserts one event row on the experiment's ledger, keyed by an optional idempotency key.
- **Open World: False** — The insert lands in MetriFi's database. Nothing leaves the team.
- **Destructive: False** — Append-only: a repeat with the same idempotency key is a no-op and no existing row is changed.

## get-experiment-document

- **Read Only: True** — Selects one experiment document by kind and key and returns its markdown. No writes.
- **Open World: False** — Reads MetriFi's own experiment document rows for the caller's team.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## set-experiment-document

- **Read Only: False** — Upserts an experiment document row with the supplied title, markdown and dossier flags.
- **Open World: False** — The write lands in MetriFi's database. No external service is called.
- **Destructive: True** — It is keyed by kind and key, so writing an existing document overwrites its stored markdown and title.

## record-keyword-research

- **Read Only: False** — Upserts keyword-research rows on the campaign with the volumes, verdicts and reasons supplied by the caller.
- **Open World: False** — The caller supplies the numbers; no provider is called. All writes stay in MetriFi's database.
- **Destructive: True** — Rows are keyed by campaign and keyword, so re-recording a keyword overwrites its stored volume, verdict and reason.

## set-experiment-opportunity

- **Read Only: False** — Writes the opportunity JSON and opportunity_set_at on the experiment and records an event, in one transaction.
- **Open World: False** — All writes are to MetriFi's own experiment tables.
- **Destructive: True** — It replaces any opportunity already recorded on that experiment.

## update-deliverable-draft

- **Read Only: False** — Patches draft fields (article markdown, titles, publish plan, checklist, action items) into the deliverable's manifest, creating the deliverable if none exists.
- **Open World: False** — All writes are to MetriFi's own deliverable tables. No client-visible revision or email results.
- **Destructive: True** — It overwrites the patched fields on an existing draft manifest.

## build-deliverable

- **Read Only: False** — Assembles the manifest from stored state, validates it and, unless dry_run is set, saves it as the deliverable's next version.
- **Open World: False** — Assembly reads and writes only MetriFi's own deliverable and experiment tables. No email or external call.
- **Destructive: True** — On a non-dry run it applies the built manifest to the existing deliverable, overwriting its manifest, title and status, bumping current_version, and re-materialising its action and checklist items.

## record-deliverable-check

- **Read Only: False** — Inserts a deliverable check row with its findings and verifications and logs an event.
- **Open World: False** — The check result is supplied by the caller and stored in MetriFi's database. No external verifier is called.
- **Destructive: False** — Append-only: each call adds a new check row and earlier checks stay in the history.

## list-deliverable-checks

- **Read Only: True** — Reads the deliverable's recorded checks, optionally with their history, and reports staleness. No writes.
- **Open World: False** — Reads MetriFi's own check rows for the caller's team.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-campaign-readiness

- **Read Only: True** — Counts completed responses per prompt in a window to report whether the campaign has a usable baseline. No writes.
- **Open World: False** — Counts rows in MetriFi's own response tables. No provider is called.
- **Destructive: False** — Read-only report, so nothing is modified or deleted.

## research-keywords

- **Read Only: False** — Buys keyword volume and difficulty and writes the results as keyword-research rows on the campaign.
- **Open World: True** — It calls the external DataForSEO API for keyword overview and, when the campaign has a geo target, local search volume.
- **Destructive: True** — Records keyword demand as an upsert keyed by campaign and keyword, so re-running overwrites the previously stored volume, difficulty, verdict and reason for keywords already recorded.

## list-deliverables-needing-attention

- **Read Only: True** — Compares each deliverable's activity ledger against its processed watermark and returns the worklist. No writes.
- **Open World: False** — Reads MetriFi's own deliverable and activity rows for the caller's team.
- **Destructive: False** — Read-only worklist, so nothing is modified or deleted.

## mark-deliverable-activity-processed

- **Read Only: False** — Advances the deliverable's processed-activity watermark to the given activity id.
- **Open World: False** — The write stays in MetriFi's database. Nothing is sent to the client.
- **Destructive: True** — It overwrites the existing watermark, so activity below it stops appearing on the attention list.

## list-funnels

- **Read Only: True** — Selects the team's funnels with category and step counts. No writes.
- **Open World: False** — Reads only funnel rows in MetriFi's database. Google Analytics is not called here.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-funnel

- **Read Only: True** — Selects one funnel with its category and steps. No writes.
- **Open World: False** — Reads a funnel row from MetriFi's database, scoped to the caller's team. No GA call.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## create-funnel

- **Read Only: False** — Inserts a funnel row bound to the team's Google Analytics connection.
- **Open World: False** — The insert lands in MetriFi's database; the GA connection is only referenced by id, not called.
- **Destructive: False** — Purely additive: it creates a funnel and changes no existing record.

## update-funnel

- **Read Only: False** — Updates the funnel's name, category or conversion value columns.
- **Open World: False** — The write stays in MetriFi's database, scoped to the caller's team.
- **Destructive: True** — It overwrites the named fields on an existing funnel.

## delete-funnel

- **Read Only: False** — Deletes the funnel row from the database.
- **Open World: False** — Only MetriFi's own funnel rows are touched. Nothing in Google Analytics changes.
- **Destructive: True** — It permanently removes an existing funnel and the steps that hang off it.

## replicate-funnel

- **Read Only: False** — Inserts a copy of the funnel and a copy of each of its steps.
- **Open World: False** — All inserts land in MetriFi's database. No external service is called.
- **Destructive: False** — Purely additive: the original funnel and its steps are left untouched.

## create-funnel-step

- **Read Only: False** — Inserts a step row on the funnel with its metrics and order.
- **Open World: False** — The insert lands in MetriFi's database. Google Analytics is queried only when a report is run.
- **Destructive: False** — Purely additive: it adds a step and changes no existing step.

## update-funnel-step

- **Read Only: False** — Updates the step's name, order, metrics or metrics expression.
- **Open World: False** — The write stays in MetriFi's database, scoped to the caller's team.
- **Destructive: True** — It overwrites the named fields on an existing step, which changes what the funnel measures.

## delete-funnel-step

- **Read Only: False** — Deletes the step row from the funnel.
- **Open World: False** — Only MetriFi's own step rows are touched.
- **Destructive: True** — It permanently removes an existing step from the funnel.

## get-funnel-report

- **Read Only: True** — Reads the funnel and its steps, then requests the report from Google Analytics and formats it. Nothing is stored.
- **Open World: True** — It calls the Google Analytics Data API with the team's connection credentials.
- **Destructive: False** — Read-only report, so nothing is modified or deleted.

## ga-page-users

- **Read Only: True** — Requests a page-users report from Google Analytics and formats it. Nothing is stored.
- **Open World: True** — It calls the Google Analytics Data API using the team's GA connection.
- **Destructive: False** — Read-only report, so nothing is modified or deleted.

## ga-outbound-link-users

- **Read Only: True** — Requests an outbound-link-users report from Google Analytics and formats it. Nothing is stored.
- **Open World: True** — It calls the Google Analytics Data API using the team's GA connection.
- **Destructive: False** — Read-only report, so nothing is modified or deleted.

## list-dashboards

- **Read Only: True** — Selects the team's dashboards and formats them. No writes.
- **Open World: False** — Reads only dashboard rows in MetriFi's database.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-dashboard

- **Read Only: True** — Selects one dashboard with its median and max analyses. No writes.
- **Open World: False** — Reads MetriFi's own dashboard and analysis rows. No GA call.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## create-dashboard

- **Read Only: False** — Inserts a dashboard row owned by the caller and their team.
- **Open World: False** — The insert lands in MetriFi's database.
- **Destructive: False** — Purely additive: it creates a dashboard and changes no existing record.

## update-dashboard

- **Read Only: False** — Updates the dashboard's name, description or notes columns.
- **Open World: False** — The write stays in MetriFi's database.
- **Destructive: True** — It overwrites the named fields on an existing dashboard.

## delete-dashboard

- **Read Only: False** — Deletes the dashboard row from the database.
- **Open World: False** — Only MetriFi's own dashboard rows are touched.
- **Destructive: True** — It permanently removes an existing dashboard and its stored analyses.

## set-dashboard-funnels

- **Read Only: False** — Syncs the dashboard-to-funnel pivot with the given ordered list and touches the dashboard.
- **Open World: False** — All writes are to MetriFi's own pivot rows, and every funnel id is checked for team visibility first.
- **Destructive: True** — It is a sync, so funnels attached before but absent from the list are detached.

## analyze-dashboard

- **Read Only: False** — Runs the comparison analysis inline: it pulls funnel reports from Google Analytics and writes analysis rows and status fields on the dashboard.
- **Open World: True** — It calls the Google Analytics Data API for each funnel on the dashboard.
- **Destructive: True** — It overwrites the dashboard's stored analyses and clears and rewrites its issue and warning fields.

## get-analysis

- **Read Only: True** — Selects one stored analysis for a dashboard the caller's team owns. No writes.
- **Open World: False** — Reads MetriFi's own analysis rows. No GA call is made.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## list-recommendations

- **Read Only: True** — Selects the team's recommendations and formats them. No writes.
- **Open World: False** — Reads only recommendation rows in MetriFi's database.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-recommendation

- **Read Only: True** — Selects one recommendation with its latest generated page. No writes.
- **Open World: False** — Reads MetriFi's own recommendation and page rows.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## create-recommendation

- **Read Only: False** — Inserts a recommendation row, optionally linked to a dashboard the team owns.
- **Open World: False** — The insert lands in MetriFi's database. No model is called at this point.
- **Destructive: False** — Purely additive: it creates a recommendation and changes no existing record.

## update-recommendation

- **Read Only: False** — Updates the recommendation's title, prompt or content columns.
- **Open World: False** — The write stays in MetriFi's database.
- **Destructive: True** — It overwrites the named fields on an existing recommendation.

## delete-recommendation

- **Read Only: False** — Deletes the recommendation row.
- **Open World: False** — Only MetriFi's own rows are touched.
- **Destructive: True** — It permanently removes the recommendation and cascades to its generated pages and blocks.

## generate-recommendation

- **Read Only: False** — Checks quota, sets the recommendation's status to queued and dispatches the generation pipeline, which writes pages and blocks.
- **Open World: True** — The pipeline screenshots the target page and calls external AI models to analyze it and write the landing page.
- **Destructive: False** — The pipeline adds new pages and blocks rather than replacing existing ones; the only field it overwrites is the recommendation's own status.

## get-block

- **Read Only: True** — Selects one generated block and returns its HTML. No writes.
- **Open World: False** — Reads MetriFi's own block rows for the caller's team.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## ai-edit-block

- **Read Only: False** — Sends the block HTML and the instruction to a model and writes the returned HTML back to the block row.
- **Open World: True** — It calls an external LLM (the BlockEditorAgent) with the block markup and the caller's message.
- **Destructive: True** — It overwrites the block's existing html column with the model output; the previous markup is not kept.

## list-connections

- **Read Only: True** — Selects the team's Google Analytics connections with funnel counts. No writes.
- **Open World: False** — Reads connection rows from MetriFi's database. Google Analytics itself is not contacted.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## list-files

- **Read Only: True** — Selects the team's uploaded CRO file rows and formats them. No writes.
- **Open World: False** — Reads MetriFi's own file rows for the caller's team.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-organization

- **Read Only: True** — Reads the team and its CRO settings row and formats them. No writes.
- **Open World: False** — Reads MetriFi's own team and settings rows.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## list-categories

- **Read Only: True** — Selects the shared funnel category reference rows with their children. No writes.
- **Open World: False** — Reads a MetriFi reference table. No external service is called.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-core-rules

- **Read Only: True** — Reads the bundled authoring-rules files shipped in the app and returns them. No writes.
- **Open World: False** — The knowledge base lives in this repository under resources/knowledge, so nothing is fetched over the network.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## get-doc

- **Read Only: True** — Reads one methodology document from the bundled knowledge base by path. No writes.
- **Open World: False** — The document is read from local files shipped with the app. No external fetch.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## list-docs

- **Read Only: True** — Lists the paths in the bundled knowledge base. No writes.
- **Open World: False** — The listing comes from local files shipped with the app.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## search-tests

- **Read Only: True** — Filters the bundled A/B test corpus by the given criteria and returns matches. No writes.
- **Open World: False** — The corpus is local JSON shipped with the app. No external service is queried.
- **Destructive: False** — Read-only search, so nothing is modified or deleted.

## get-test

- **Read Only: True** — Reads one A/B test record from the bundled corpus by id. No writes.
- **Open World: False** — The record is read from local files shipped with the app.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## list-proven-patterns

- **Read Only: True** — Lists the proven-pattern guides in the bundled knowledge base. No writes.
- **Open World: False** — The guides are local files shipped with the app.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-proven-pattern

- **Read Only: True** — Reads one proven-pattern guide by name from the bundled knowledge base. No writes.
- **Open World: False** — The guide is read from local files shipped with the app.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## get-anti-patterns

- **Read Only: True** — Reads the anti-patterns guide, optionally narrowed to a page type. No writes.
- **Open World: False** — The guide is a local file shipped with the app.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## list-sites

- **Read Only: True** — Searches for the site repositories owned by the caller's teams and returns slugs and metadata. No writes.
- **Open World: True** — The list comes from the GitHub search API over the MetriFi site organization.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-site

- **Read Only: False** — Reads the site record and its preview state, but if the site's own draft host is not yet assigned on Vercel it assigns it (POST to the Vercel domains API, 409 ignored). That is the only write, and repeating the call has no further effect.
- **Open World: True** — It calls both the GitHub API and the Vercel API for that site.
- **Destructive: False** — Never modifies or deletes site content, files, or settings; the only side effect is assigning the site's own draft hostname once.

## check-slug

- **Read Only: True** — Normalizes the slug and asks GitHub whether a repository with that name already exists. Nothing is created.
- **Open World: True** — It queries the GitHub API for the MetriFi site organization.
- **Destructive: False** — Availability check only, so nothing is modified or deleted.

## create-site

- **Read Only: False** — Creates a GitHub repository from the starter template, tags it with the owning team topic and provisions the Vercel project and hosts.
- **Open World: True** — It writes to GitHub and Vercel, both outside MetriFi.
- **Destructive: False** — Purely additive: a new repository and project are created and no existing site is changed.

## move-site

- **Read Only: False** — Rewrites the repository's metrifi-team topic on GitHub to re-tenant the site.
- **Open World: True** — It reads and writes repository topics through the GitHub API.
- **Destructive: True** — It replaces the existing team topic, so the site changes owner. Content, Vercel project and domains are untouched.

## delete-site

- **Read Only: False** — Without confirm it returns the deletion plan. With the exact slug as confirm it deletes the Vercel project and the GitHub repository and the site's review workspace.
- **Open World: True** — It deletes resources at Vercel and GitHub, both outside MetriFi.
- **Destructive: True** — It permanently destroys the repository with all history, the Vercel project and hosts, and the review rows. It cannot be undone.

## list-site-files

- **Read Only: True** — Lists the repository tree or one directory at the given ref. No commits are made.
- **Open World: True** — The listing is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## read-file

- **Read Only: True** — Fetches one file's contents and blob sha at the given ref. No commits are made.
- **Open World: True** — The file is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## write-files

- **Read Only: False** — Commits the given file contents to the site's draft branch on GitHub, optionally fetching bytes from a supplied URL first.
- **Open World: True** — It commits to GitHub, may fetch a caller-supplied URL for the bytes, and the commit triggers a Vercel preview build.
- **Destructive: True** — Writing a path that already exists replaces that file's contents in the repository.

## delete-files

- **Read Only: False** — Commits deletions for the named paths on the site's draft branch.
- **Open World: True** — The deletion commit goes to GitHub and triggers a Vercel preview build.
- **Destructive: True** — It removes existing files from the draft branch. Paths that do not exist are reported, not deleted.

## file-history

- **Read Only: True** — Reads the commit list for one path at a ref and formats authorship from the commit trailers. No writes.
- **Open World: True** — The history is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only history, so nothing is modified or deleted.

## get-preview-url

- **Read Only: False** — Returns the site's draft preview URL, assigning the site's own draft host on Vercel first if it is not yet assigned (POST to the Vercel domains API, 409 ignored). Repeating the call has no further effect.
- **Open World: True** — It calls the Vercel API for the project, its deployment and its domains.
- **Destructive: False** — Never modifies or deletes site content; the only side effect is assigning the site's own draft hostname once.

## create-asset-upload

- **Read Only: False** — Mints a signed, time-limited upload URL for the site. The call itself stores no asset and writes no row; the upload happens later at that URL.
- **Open World: True** — The URL is for uploading into the external blob store where site assets live.
- **Destructive: False** — It creates a credential and modifies no existing asset or file.

## list-site-assets

- **Read Only: True** — Lists the blobs already staged for the site. No uploads or deletions.
- **Open World: True** — The listing is fetched from the external blob storage service.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## delete-site-asset

- **Read Only: False** — Deletes one staged asset from the site's blob storage by URL.
- **Open World: True** — The delete is issued against the external blob storage service.
- **Destructive: True** — It permanently removes an existing uploaded asset.

## list-rates

- **Read Only: True** — Reads src/data/rates.json from the site's repository at the given ref and lists the rates. No commits.
- **Open World: True** — The file is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-rate

- **Read Only: True** — Reads one rate entry out of src/data/rates.json at the given ref. No commits.
- **Open World: True** — The file is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## set-rate

- **Read Only: False** — Rewrites the rate's entry in src/data/rates.json and commits it to the draft branch.
- **Open World: True** — The commit is written to the site's GitHub repository and triggers a preview build.
- **Destructive: True** — It overwrites the rate's current value, or adds a dated timeline entry that will supersede it, on an existing record.

## list-scheduled-changes

- **Read Only: True** — Reads the future-dated entries in src/data/rates.json and lists them. No commits.
- **Open World: True** — The file is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## cancel-scheduled-change

- **Read Only: False** — Removes the future-dated entry from src/data/rates.json and commits the file.
- **Open World: True** — The commit is written to the site's GitHub repository.
- **Destructive: True** — It deletes a scheduled change that was already recorded, so that rate will not take effect.

## rate-history

- **Read Only: True** — Reads the commit history of src/data/rates.json for one rate id and reconstructs its changes. No commits.
- **Open World: True** — The history is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only history, so nothing is modified or deleted.

## find-rate-usages

- **Read Only: True** — Scans the repository's source files at a ref for references to the rate id and reports them. No commits.
- **Open World: True** — The files are fetched from the site's GitHub repository.
- **Destructive: False** — Read-only scan, so nothing is modified or deleted.

## activate-due-rates

- **Read Only: False** — Finds rate timeline entries whose effective date has passed and pushes a release commit so production rebuilds with them.
- **Open World: True** — It queries Vercel for the last production deploy and pushes a commit to GitHub, which triggers a production deployment.
- **Destructive: True** — Commits the release of scheduled rate changes to the site's production branch, which triggers a production deploy and changes what the public site serves.

## list-facts

- **Read Only: True** — Reads src/data/facts.json from the site's repository and lists the institution facts. No commits.
- **Open World: True** — The file is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-fact

- **Read Only: True** — Reads one entry out of src/data/facts.json at the given ref. No commits.
- **Open World: True** — The file is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## set-fact

- **Read Only: False** — Writes the fact's entry into src/data/facts.json and commits the file to the draft branch.
- **Open World: True** — The commit is written to the site's GitHub repository and triggers a preview build.
- **Destructive: True** — Writing an id that already exists overwrites that fact's stored value and label.

## get-brand

- **Read Only: True** — Reads src/data/brand.json from the site's repository and returns the brand tokens. No commits.
- **Open World: True** — The file is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## set-brand

- **Read Only: False** — Writes the brand block into src/data/brand.json and commits it to the draft branch.
- **Open World: True** — The commit is written to the site's GitHub repository and triggers a preview build.
- **Destructive: True** — It replaces the site's existing brand tokens, which changes colors and type across every page.

## validate-brand

- **Read Only: True** — Reads brand.json at the given ref and checks it against the schema and contrast rules, returning findings. No commits.
- **Open World: True** — The file is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only check, so nothing is modified or deleted.

## extract-brand

- **Read Only: True** — Fetches the given page and scrapes colors, fonts, logo and title out of the HTML. Nothing is stored; set-brand does that.
- **Open World: True** — It fetches an arbitrary public URL supplied by the caller.
- **Destructive: False** — It only reads a page and returns what it found.

## import-brand-from-design

- **Read Only: True** — Parses the CSS custom properties passed in and returns a brand block. Nothing is read from or written to a site.
- **Open World: False** — A pure in-process transform of the caller's own input. No network call and no database access.
- **Destructive: False** — It returns a value and changes nothing.

## get-compliance

- **Read Only: True** — Reads src/data/compliance.json from the site's repository and returns the institution's compliance record. No commits.
- **Open World: True** — The file is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## set-compliance

- **Read Only: False** — Writes the compliance record into src/data/compliance.json and commits it to the draft branch.
- **Open World: True** — The commit is written to the site's GitHub repository and triggers a preview build.
- **Destructive: True** — It replaces the site's existing compliance record, including charter, insurer and required disclosures.

## publish-site

- **Read Only: False** — Merges the draft branch into the production branch on GitHub after the compliance and safety gates pass.
- **Open World: True** — It pushes to GitHub and the merge triggers the Vercel production deployment, which changes the public site.
- **Destructive: True** — It replaces what production serves with the draft, and protected-path changes require an explicit acknowledgement.

## list-pending-changes

- **Read Only: True** — For each site the caller can see, compares the draft branch with production and reports unpublished commits. No commits or merges.
- **Open World: True** — Every comparison is a GitHub API call against the site repositories.
- **Destructive: False** — Read-only queue, so nothing is modified or deleted.

## summarize-changes

- **Read Only: True** — Compares draft and production on GitHub and describes the content changes (rates, disclosures, visible text). No commits.
- **Open World: True** — The comparison is fetched from the site's GitHub repository.
- **Destructive: False** — Read-only summary, so nothing is modified or deleted.

## create-review

- **Read Only: False** — Creates or refreshes the site's review workspace: review, pages, participants, action items and checklist rows.
- **Open World: True** — It fetches the deployed draft pages over HTTP so feedback can be anchored to real elements.
- **Destructive: True** — One review exists per site, so calling it on a site that already has one updates that review in place and reopens a published one as a new round.

## push-review-revision

- **Read Only: False** — Records a new revision on the review and re-anchors threads against the freshly deployed draft.
- **Open World: True** — It refetches the deployed draft pages over HTTP to re-anchor the feedback.
- **Destructive: True** — It advances the existing review's version, re-anchors or orphans stored threads and stales a client approval.

## get-review

- **Read Only: True** — Reads the review with participants, pages, threads, action items and checklist counts. No writes.
- **Open World: False** — Everything comes from MetriFi's own review tables; no site or deployment is fetched.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## list-reviews

- **Read Only: True** — Selects the reviews for the teams the caller belongs to, optionally filtered by status. No writes.
- **Open World: False** — Reads MetriFi's own review rows. Tokens and client URLs are withheld here.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## get-pending-feedback

- **Read Only: True** — Reads the review's open threads and awaiting-reply action items and returns them with their stored screenshots. No writes.
- **Open World: False** — All of it comes from MetriFi's database and locally stored screenshot files.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## get-feedback-item

- **Read Only: True** — Reads one thread with its comments and linked action item and returns its screenshot. No writes.
- **Open World: False** — Reads MetriFi's own review rows and local screenshot storage.
- **Destructive: False** — Read-only, so nothing is modified or deleted.

## manage-review-item

- **Read Only: False** — Applies the named action (done, reopen, assign, unassign, archive, unarchive, delete) to action items and threads.
- **Open World: True** — The assign action emails the named assignee, who is usually a client contact outside the team.
- **Destructive: True** — It rewrites the state of existing items, and delete permanently removes an archived item or thread.

## resolve-feedback

- **Read Only: False** — Flips the named open threads to resolved with a note, stamps resolved_at and records an activity row for each.
- **Open World: False** — All writes are to MetriFi's own review tables. No email is sent.
- **Destructive: True** — It changes the state of existing client threads; ids already closed are skipped.

## dismiss-feedback

- **Read Only: False** — Flips the named open threads to dismissed with the required client-readable reason and records activity.
- **Open World: False** — All writes are to MetriFi's own review tables. No email is sent.
- **Destructive: True** — It closes existing client threads without acting on them, and the client sees the reason in the overlay.

## comment-on-feedback

- **Read Only: False** — Inserts a comment row on the thread (or a reply on an action item) and records an activity row.
- **Open World: False** — The reply is stored in MetriFi's database and shown in the client overlay. No email is sent.
- **Destructive: False** — Append-only: the thread's status and the client's original text are left as they are.

## get-review-activity

- **Read Only: True** — Selects the review's activity ledger, optionally since a timestamp. No writes.
- **Open World: False** — Reads MetriFi's own review activity rows.
- **Destructive: False** — Read-only listing, so nothing is modified or deleted.

## set-review-status

- **Read Only: False** — Writes the review's status column and records a status-changed activity row.
- **Open World: False** — The write stays in MetriFi's database. Nothing is published or emailed.
- **Destructive: True** — It overwrites the review's existing status; setting published additionally requires publish permission.

## send-review

- **Read Only: False** — Adds or updates the recipient participant and sends the review link emails synchronously, recording the send.
- **Open World: True** — It emails real client contacts from help@metrifi.com with a link to the review overlay.
- **Destructive: False** — Additive: it adds participant and activity rows. Threads, items and site content are untouched.

## delete-review

- **Read Only: False** — Without confirm it returns the deletion plan. With the exact slug as confirm it deletes the review row.
- **Open World: False** — Only MetriFi's own review tables are touched. The site, its repository and its deployments are unaffected.
- **Destructive: True** — It permanently deletes the review and cascades to threads, comments, action items, attestations, participants and activity, including typed-name sign-offs.
