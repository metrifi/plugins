# MCP tool annotation justifications (OpenAI review form, v4 for the v1.4.17 resubmission)

Surface 1.4.17, 157 tools, lock order, four hints each. Regenerated 2026-09-30 from `resources/mcp/surface.lock.json` on platform main. Only tools without a `visibility` tag are listed, because the reviewer signs in as an ordinary user and never sees the 10 staff tools (`transfer-team-ownership` joined them on 2026-09-30, after OpenAI's automated scan failed it). Every write tool's handler was read for this version; each line says what that tool does, against the value beside it. `node tools/check-justifications.mjs <path to surface.lock.json>` checks this file against the lock.

## list-teams

- **Read Only: true** It reads the caller's team memberships and returns each team's name, slug, the caller's role and the member count. Nothing is changed.
- **Open World: false** It reads only membership rows in MetriFi's own database, and nothing leaves the platform.
- **Destructive: false** It only lists teams, so no team or membership is removed or replaced.
- **Idempotent: true** A repeat returns the same list unless the caller joins or leaves a team in between.

## create-team

- **Read Only: false** It creates a new team owned by the caller, adds the caller as its admin, starts each product's default trial plan and adds the team's own tracked organization with its name and website.
- **Open World: false** The new rows live only in MetriFi's database, and a new team starts private with no funnels or finished experiments, so nothing it adds is shown outside the team and no email goes out.
- **Destructive: false** It only adds a new team and its starting records, and no existing team, member or plan is touched.
- **Idempotent: false** A repeat with the same name makes a second, separate team with its own slug, trial and organization.

## get-team-usage

- **Read Only: true** It reads one team's plan, billing period, subscription status and quota used for GEO, CRO and Site Builder. Nothing is changed.
- **Open World: false** The usage figures come from MetriFi's own billing records for the caller's team, and nothing is shared outside it.
- **Destructive: false** It only reports usage, so no plan, quota or subscription is altered or removed.
- **Idempotent: true** A repeat returns the same figures, moving only as the team uses quota or the period resets.

## whoami

- **Read Only: true** It reads the signed-in user's name, email, platform role, current team, memberships and pending invitations. Nothing is changed.
- **Open World: false** It reads only the caller's own account and memberships in MetriFi's database, and nothing is shared with anyone.
- **Destructive: false** It only reports who the caller is, so no account or membership is removed or replaced.
- **Idempotent: true** A repeat returns the same profile until the caller's memberships or invitations change.

## rename-team

- **Read Only: false** It changes the team's display name. The slug that other tools use stays the same.
- **Open World: true** Teams that keep their funnels shared show the team name beside those funnels on other customers' comparison dashboards, so the new name reaches another customer.
- **Destructive: true** It overwrites the team's previous display name, which is not kept anywhere.
- **Idempotent: true** A repeat with the same name finds nothing to change and writes nothing.

## switch-team

- **Read Only: false** It changes which team is the caller's current team, the one MetriFi opens by default for them.
- **Open World: false** It changes a setting on the caller's own account only, and nobody else's view is affected.
- **Destructive: true** It replaces the caller's previous current-team choice.
- **Idempotent: true** A repeat with the same team leaves the setting as it already is and writes nothing.

## list-members

- **Read Only: true** It reads a team's members with their roles and user numbers, plus the invitations still pending. Nothing is changed.
- **Open World: false** It reads only the caller's own team roster in MetriFi's database, and no one is contacted.
- **Destructive: false** It only lists members, so no one is removed and no role is changed.
- **Idempotent: true** A repeat returns the same roster unless someone joins, leaves or is invited in between.

## invite-member

- **Read Only: false** It adds a pending membership with the chosen role for the email address, creates an account placeholder and a one-time sign-up link for someone new, and emails them the invitation.
- **Open World: true** It emails the invitation to the address given, a person outside the caller's account.
- **Destructive: true** The invitation email reaches a real inbox and cannot be taken back, and re-inviting a pending address overwrites the role and sent date on that invitation.
- **Idempotent: false** A repeat for the same pending address sends another invitation email, and for someone new it mints another sign-up link.

## revoke-invitation

- **Read Only: false** It removes a still-pending membership for that email from the team and deletes any unused sign-up links for it.
- **Open World: false** It changes only the team's own invitation records in MetriFi's database, and no email is sent to anyone.
- **Destructive: true** It deletes the pending invitation and its sign-up links, so the old link stops working.
- **Idempotent: true** A repeat finds no pending invitation or link left and changes nothing.

## accept-invitation

- **Read Only: false** It marks the caller's pending invitation to the team as accepted, makes that team the caller's current team and removes the used sign-up links.
- **Open World: false** It changes only the caller's own membership and account in MetriFi's database, and no one is notified.
- **Destructive: true** It replaces the caller's current team with the joined team and removes the invitation's sign-up links.
- **Idempotent: true** Once the caller is a member, a repeat reports that they already belong and writes nothing.

## decline-invitation

- **Read Only: false** It removes the caller's own pending membership in that team and deletes its sign-up links.
- **Open World: false** It changes only the caller's own invitation records in MetriFi's database, and no one is notified.
- **Destructive: true** It deletes the pending invitation, so accepting it later is no longer possible without a new invite.
- **Idempotent: true** A repeat finds no pending invitation left and changes nothing.

## remove-member

- **Read Only: false** It takes the named person off the team, so they lose access to its campaigns, funnels and sites. The owner cannot be removed.
- **Open World: false** It changes only the team's membership records in MetriFi's database, and no email or notice goes to anyone.
- **Destructive: true** It deletes the person's membership and role on the team, and they would need a new invitation to come back.
- **Idempotent: true** A repeat finds that the person is no longer a member and changes nothing.

## set-member-role

- **Read Only: false** It changes a team member's role, which decides what that person may view, edit or publish on the team.
- **Open World: false** The role is used only for permission checks inside the caller's own team, and no one is notified.
- **Destructive: true** It overwrites the member's previous role.
- **Idempotent: true** A repeat with the same role leaves the member's permissions as they already are.

## list-campaigns

- **Read Only: true** It reads the team's GEO campaigns with their names and descriptions. Nothing is changed.
- **Open World: false** It reads only the caller's team campaigns in MetriFi's database, and nothing leaves the platform.
- **Destructive: false** It only lists campaigns, so none is removed or edited.
- **Idempotent: true** A repeat returns the same list unless a campaign is added in between.

## get-campaign

- **Read Only: true** It reads one campaign's name, description, location and keywords. Nothing is changed.
- **Open World: false** It reads a single campaign that belongs to the caller's team, and nothing is shared outside it.
- **Destructive: false** It only reports the campaign and leaves it as it was.
- **Idempotent: true** A repeat returns the same campaign details until someone edits it.

## create-campaign

- **Read Only: false** It creates a new GEO campaign for the team with the given name, description, location and keywords.
- **Open World: false** The campaign is a new row in MetriFi's database that no page outside the team reads, and nothing is sent anywhere.
- **Destructive: false** It only adds a campaign and changes no existing record.
- **Idempotent: false** A repeat with the same name makes a second, separate campaign.

## set-campaign-location

- **Read Only: false** It looks up the place in DataForSEO's list of Google Ads locations and saves the matched location code and name on the campaign.
- **Open World: true** It queries DataForSEO, an outside keyword data service, to resolve the place before saving it.
- **Destructive: true** It replaces the campaign's previous geography, which changes where later keyword research measures local demand.
- **Idempotent: true** A repeat resolves the same place to the same code, so the campaign ends up exactly as after the first call, and the location list it reads is free.

## list-prompts

- **Read Only: true** It reads a campaign's prompts and, from the stored responses, the share of answers that mention the team's organization. Nothing is changed.
- **Open World: false** It reads only prompts and stored responses belonging to the caller's team, and no AI provider is contacted.
- **Destructive: false** It only lists prompts and leaves them and their responses as they were.
- **Idempotent: true** A repeat returns the same prompts, with percentages that move only when new responses arrive.

## get-prompt

- **Read Only: true** It reads one prompt's text and its response and mention counts. Nothing is changed.
- **Open World: false** It reads a single prompt belonging to the caller's team, and nothing is sent to an AI provider.
- **Destructive: false** It only reports the prompt and leaves it as it was.
- **Idempotent: true** A repeat returns the same prompt details, with counts that move only when new responses arrive.

## create-prompt

- **Read Only: false** It adds a new prompt, the question MetriFi will later put to AI assistants, to one of the team's campaigns.
- **Open World: false** It only stores the prompt in MetriFi's database, and nothing is put to any AI provider until a run tool is called.
- **Destructive: false** It only adds a prompt and changes no existing prompt or response.
- **Idempotent: false** A repeat with the same text adds a second, duplicate prompt to the campaign.

## list-responses

- **Read Only: true** It reads the stored AI answers for a prompt or campaign, with the organizations each one mentions. Nothing is changed.
- **Open World: false** It reads answers already stored in MetriFi's database for the caller's team, and no AI provider is contacted.
- **Destructive: false** It only lists responses and leaves every one as it was.
- **Idempotent: true** A repeat returns the same responses unless new runs have finished in between.

## get-response

- **Read Only: true** It reads one stored AI answer in full, with its provider, model and the organizations it mentions. Nothing is changed.
- **Open World: false** It reads an answer already stored for the caller's team, and nothing is sent to an AI provider.
- **Destructive: false** It only reports the response and leaves it as it was.
- **Idempotent: true** A repeat returns the same answer, since a stored response does not change.

## get-org-visibility

- **Read Only: true** It counts, from the campaign's stored answers, how often each organization is mentioned and ranks them, optionally within a date range. Nothing is changed.
- **Open World: false** It computes the ranking from the caller's own campaign data in MetriFi's database, and nothing leaves the platform.
- **Destructive: false** It only computes a ranking and leaves every response and organization as it was.
- **Idempotent: true** A repeat over the same range returns the same ranking unless new responses arrive.

## get-team-report

- **Read Only: true** It gathers the team's usage, campaigns, experiments and deliverables into one report, plus the AI crawler traffic recorded on the institution's website. Nothing is changed.
- **Open World: true** The traffic section is read from the outside database that stores crawler visits collected on the institution's own website, not from MetriFi's main database.
- **Destructive: false** It only assembles a report and leaves every campaign, experiment and deliverable as it was.
- **Idempotent: true** A repeat returns the same report, moving only as the team's data or its site traffic changes.

## run-prompt

- **Read Only: false** It queues one to five background runs of the prompt, and each run stores a new AI answer and counts against the team's response quota.
- **Open World: true** Each queued run puts the prompt text to an outside AI provider such as OpenAI and stores the answer it returns.
- **Destructive: false** It only adds new responses, and no existing response, prompt or campaign is changed.
- **Idempotent: false** A repeat queues another set of paid runs and uses up more of the team's monthly response quota.

## run-campaign-prompts

- **Read Only: false** It queues background runs for every prompt in the campaign, one to five per prompt, and each run stores a new AI answer and counts against the team's quota.
- **Open World: true** Each queued run puts a prompt to an outside AI provider such as OpenAI and stores the answer it returns.
- **Destructive: false** It only adds new responses, and no existing response, prompt or campaign is changed.
- **Idempotent: false** A repeat queues a whole new batch of paid runs across the campaign and uses up that much more quota.

## get-experiment-insights

- **Read Only: true** It reads anonymized benchmark figures from paying teams' finished experiments: results by action type, cited source type and content tag, with the caller's own experiments counted. Nothing is changed.
- **Open World: false** It is a read, and nothing about the caller is written, sent or made visible to any other team by calling it.
- **Destructive: false** It only computes benchmark figures and leaves every experiment as it was.
- **Idempotent: true** A repeat returns the same figures unless an experiment somewhere finishes in between.

## list-experiments

- **Read Only: true** It reads the team's experiments with their stage, dates, visibility figures and prompt counts, optionally filtered by campaign or live-date source. Nothing is changed.
- **Open World: false** It reads only the caller's team experiments in MetriFi's database, and nothing leaves the platform.
- **Destructive: false** It only lists experiments, so none is removed or edited.
- **Idempotent: true** A repeat returns the same list until an experiment is added or its stage moves.

## get-experiment

- **Read Only: true** It reads one experiment with its prompts, campaign, actions and computed baseline and measurement visibility. Nothing is changed.
- **Open World: false** It reads a single experiment belonging to the caller's team, and nothing is shared outside it.
- **Destructive: false** It only reports the experiment and leaves it as it was.
- **Idempotent: true** A repeat returns the same details, with figures that move only as new responses arrive.

## create-experiment

- **Read Only: false** It creates a new experiment for the team with its name, campaign, dates, parent experiment and response target.
- **Open World: true** The response target it records decides when the experiment counts as finished in the anonymized benchmark that other paying customers read.
- **Destructive: false** It only adds an experiment, and the campaign and parent it names are checked but not changed.
- **Idempotent: false** A repeat creates a second, separate experiment with its own response target.

## update-experiment

- **Read Only: false** It changes the experiment's name, description, campaign, prompts, dates, response target, parked state or confounded note, and setting prompts can start the first run of them.
- **Open World: true** A newly linked prompt set can start runs that query OpenAI, and the dates and response target feed the anonymized benchmark other paying customers see.
- **Destructive: true** It overwrites the fields given and replaces the linked prompt set, dropping prompts not listed.
- **Idempotent: false** A repeat that carries prompts can start another round of paid runs and add another run event once the runner's spacing window has passed.

## set-experiment-analysis

- **Read Only: false** It saves the experiment's analysis, meaning the organizations and sources cited in the answers and a summary, and stamps when the analysis was done.
- **Open World: true** The cited source types it saves are counted in the anonymized benchmark that other paying customers read.
- **Destructive: true** It overwrites any analysis already saved on the experiment.
- **Idempotent: false** A repeat stamps a new analysis time, which pushes back when the experiment is archived as stale.

## set-experiment-recommendation

- **Read Only: false** It saves the recommended action for the experiment and replaces the experiment's action list with the actions given.
- **Open World: true** The action types it saves decide how the experiment is counted in the anonymized benchmark that other paying customers read.
- **Destructive: true** It overwrites the previous recommendation and removes the earlier action entries before adding the new ones.
- **Idempotent: false** A repeat deletes and recreates the action entries, so they come back with new numbers and a number taken from the first call no longer points to anything.

## set-experiment-case-study

- **Read Only: false** It saves the experiment's case study and stamps when it was written.
- **Open World: false** The case study is shown only to the owning team inside MetriFi, and no benchmark or client page reads it.
- **Destructive: true** It overwrites any case study already saved on the experiment.
- **Idempotent: false** A repeat stamps a new written time, which pushes back when the experiment is archived as stale.

## list-action-types

- **Read Only: true** It reads MetriFi's fixed list of experiment action types with a description of each. Nothing is changed.
- **Open World: false** It reads a shared reference list in MetriFi's database, and nothing is shared or contacted.
- **Destructive: false** It only lists action types and leaves the list as it was.
- **Idempotent: true** A repeat returns the same list, which changes only when MetriFi edits it.

## get-ai-user-bot-traffic

- **Read Only: true** It reads which of the institution's web pages AI assistants such as ChatGPT fetched on a user's behalf over a date range, with visit counts. Nothing is changed.
- **Open World: true** The visits are read from the outside database that stores crawler hits collected by a plugin or worker on the institution's own website.
- **Destructive: false** It only reports traffic and leaves the traffic records and the website as they were.
- **Idempotent: true** A repeat over the same dates returns the same counts, growing only as new visits are recorded.

## list-deliverables

- **Read Only: true** It reads the team's GEO deliverables with their status, version, delivery and approval dates and archive state. Nothing is changed.
- **Open World: false** It reads only the caller's team deliverables in MetriFi's database, and nothing is sent to anyone by listing them.
- **Destructive: false** It only lists deliverables, so none is removed or edited.
- **Idempotent: true** A repeat returns the same list until a deliverable is added or moves on.

## get-deliverable

- **Read Only: true** It reads one deliverable's article, action items, checklist, participants, approval and link for the client page. Nothing is changed.
- **Open World: false** It is a read for the caller's own team, and nothing is sent, shown or shared with the client or anyone else by calling it.
- **Destructive: false** It only reports the deliverable and leaves it as it was.
- **Idempotent: true** A repeat returns the same details until someone revises the deliverable or the client acts on it.

## create-deliverable

- **Read Only: false** It creates the deliverable for a slug, or rewrites the one already at that slug, from a full manifest: article, action items, checklist and assignees, and it adds a participant for each assignee.
- **Open World: true** The manifest is what the client sees on their deliverable page, served live from a private link.
- **Destructive: true** At an existing slug it replaces the stored manifest, action items and checklist, and it un-archives an archived deliverable.
- **Idempotent: false** A repeat with the same manifest is still read as a change, so it adds another version, bumps the version number and logs another revision in the activity history.

## push-deliverable-revision

- **Read Only: false** It replaces an existing deliverable's manifest with a revised one and logs the revision with its changelog in the deliverable's history.
- **Open World: true** The revised article, items and changelog appear on the client's deliverable page as soon as it saves.
- **Destructive: true** It overwrites the previous manifest, action items and checklist, and it un-archives an archived deliverable.
- **Idempotent: false** A repeat adds another version and another revision entry in the history, even when the manifest is unchanged.

## get-deliverable-activity

- **Read Only: true** It reads the deliverable's activity history: deliveries, revisions, client answers, comments, approvals and status changes. Nothing is changed.
- **Open World: false** It reads the caller's own team history in MetriFi's database, and nothing goes back to the client by calling it.
- **Destructive: false** It only reports history and leaves every entry as it was.
- **Idempotent: true** A repeat returns the same history, longer only if new activity arrived in between.

## set-deliverable-status

- **Read Only: false** It moves the deliverable to a new status and publish plan, refusing to mark it ready or published while blocking items, approval or checks are outstanding, and logs the change.
- **Open World: true** The status and publish plan are shown on the client's deliverable page.
- **Destructive: true** It overwrites the previous status and publish plan.
- **Idempotent: false** A repeat logs another status-change entry in the activity history, even when the status is already the one given.

## set-deliverable-archived

- **Read Only: false** It archives or un-archives the deliverable, with an optional note logged in its history.
- **Open World: true** Archiving closes the client's deliverable page, so their link stops opening until the deliverable is brought back.
- **Destructive: true** Archiving takes the client's page offline and refuses further sends and shares until someone un-archives it, although nothing is deleted.
- **Idempotent: true** A repeat finds the deliverable already in the requested state and writes nothing.

## reopen-action-item

- **Read Only: false** It sets a resolved action item back to open, clearing its answer, logs the reopening, and withdraws the approval when the item was the sign-off that granted it.
- **Open World: true** The reopened item is back on the client's deliverable page as a question waiting for them.
- **Destructive: true** It discards the item's recorded answer and status, and it can withdraw the deliverable's approval to publish.
- **Idempotent: true** A repeat finds the item already open and changes nothing.

## withdraw-deliverable-approval

- **Read Only: false** It clears the deliverable's approval to publish and logs the withdrawal with the prior approval and reason.
- **Open World: true** The client's deliverable page stops showing the approval once it is withdrawn.
- **Destructive: true** It removes the recorded approval, so the deliverable cannot be published until it is approved again.
- **Idempotent: true** A repeat finds no approval left to withdraw and writes nothing.

## record-deliverable-approval

- **Read Only: false** It saves the approval date, approver and note on the deliverable and records the approver as a client participant.
- **Open World: true** The approval, with the approver's name, date and note, appears on the page the client opens from their link.
- **Destructive: true** It overwrites any approval already on record, logged as a correction of the earlier one.
- **Idempotent: false** A repeat adds another approval entry to the activity history, and with no date given it stamps the current time again.

## send-deliverable

- **Read Only: false** It emails the deliverable link to every participant, adding the client contact first if given, and records the send. Preview mode emails only the caller and records nothing.
- **Open World: true** It emails people at the client institution a link to their deliverable page.
- **Destructive: true** The emails reach real inboxes and cannot be recalled once sent, and even preview mode sends a real email.
- **Idempotent: false** A repeat sends the notification emails again and records another send.

## send-deliverable-followup

- **Read Only: false** It emails a reminder about the outstanding ask to the deliverable's client contacts and counts the nudge, up to a cap after which it refuses.
- **Open World: true** It emails the client contacts at the institution.
- **Destructive: true** The reminder email reaches the client and cannot be recalled once sent.
- **Idempotent: false** A repeat sends another reminder email and raises the reminder count until the cap is reached.

## record-deliverable-shared

- **Read Only: false** It records that the caller shared the client link themselves: it adds the client contact as a participant, stamps the first sent date if none is set, and logs the share. It sends no email.
- **Open World: true** It creates or reuses a client participant with a personal link to the deliverable page, and the share marks the deliverable as delivered to the client.
- **Destructive: true** It marks the deliverable as delivered, which no tool can undo, and that date then drives the follow-up and attention reports.
- **Idempotent: false** A repeat logs another share entry in the history, although the first sent date stays as first recorded.

## record-deliverable-publication

- **Read Only: false** It records the date and address where the article went live, sets the deliverable to published and carries the live date onto its experiment.
- **Open World: true** The published status reaches the client's deliverable page, and the live date decides when the experiment enters the benchmark other paying customers read.
- **Destructive: true** It overwrites any publication date, address and status already recorded, and the experiment's live date with them.
- **Idempotent: false** A repeat logs another status-change entry and can add a live-date disagreement event to the experiment.

## set-deliverable-tags

- **Read Only: false** It replaces the deliverable's content classification tags with the ones given, one per tag group, and logs the classification.
- **Open World: true** The anonymized benchmark that other paying customers read groups finished experiments by these tags.
- **Destructive: true** It removes every tag not in the new list.
- **Idempotent: false** A repeat logs another classification entry in the deliverable's history.

## get-experiment-workflow

- **Read Only: true** It reads the experiment's derived stage, last operator note, live date and recent workflow events. Nothing is changed.
- **Open World: false** It reads the caller's own team workflow records in MetriFi's database, and nothing leaves the platform.
- **Destructive: false** It only reports the workflow and leaves it as it was.
- **Idempotent: true** A repeat returns the same rollup until someone adds a note or event.

## set-experiment-workflow

- **Read Only: false** It saves the operator's note on the experiment and logs it as a phase-note event.
- **Open World: false** The note and its event are shown only in the owning team's workflow log, and no client page or benchmark reads them.
- **Destructive: true** It overwrites the previous workflow note.
- **Idempotent: false** A repeat logs a second phase-note event, since nothing checks for an identical earlier one.

## add-experiment-event

- **Read Only: false** It appends one event, with its kind, summary and optional details, to the experiment's workflow log.
- **Open World: false** The event is read only in the owning team's workflow log, and nothing is shared outside the team.
- **Destructive: false** It only adds an event and leaves earlier events and the experiment unchanged.
- **Idempotent: false** Without an idempotency key a repeat appends a second event, and only a repeat carrying the same key is skipped.

## get-experiment-document

- **Read Only: true** It reads one experiment document, such as the evidence or decision report, by kind and key. Nothing is changed.
- **Open World: false** It reads the caller's own team document in MetriFi's database, and nothing is shared by reading it.
- **Destructive: false** It only returns the document and leaves it as it was.
- **Idempotent: true** A repeat returns the same document until someone rewrites it.

## set-experiment-document

- **Read Only: false** It saves an experiment document by kind and key, creating it or replacing the one already stored under that kind and key.
- **Open World: false** It stays in MetriFi's database for the team, and the document reaches no client until a later build of the deliverable copies it in.
- **Destructive: true** It replaces the earlier content of a document stored under the same kind and key.
- **Idempotent: true** A repeat with the same content finds the stored document already matching and writes nothing.

## record-keyword-research

- **Read Only: false** It stores the measured search demand for the campaign's candidate keywords, with the keep or drop verdict on each, matching rows by keyword.
- **Open World: true** The kept keywords are shown to the client as the demand evidence on their deliverable page.
- **Destructive: true** It overwrites the stored figures and verdict for any keyword it has seen before.
- **Idempotent: true** A repeat with the same rows matches the stored ones and changes nothing, since the research date is set only on a new row.

## set-experiment-opportunity

- **Read Only: false** It saves the experiment's opportunity block, meaning the headline, demand, verdict and target prompts, stamps the time and logs an opportunity event.
- **Open World: false** It stays in the owning team's records, and the opportunity reaches no client until a later build of the deliverable copies it in.
- **Destructive: true** It overwrites the opportunity block already saved on the experiment.
- **Idempotent: false** A repeat logs another opportunity event and stamps a new time, which pushes back when the experiment is archived as stale.

## update-deliverable-draft

- **Read Only: false** It patches parts of the deliverable's draft, such as the article, action items or checklist, without logging a revision or announcing it.
- **Open World: true** The client's deliverable page serves the draft live, so the client sees the change at once.
- **Destructive: true** It overwrites the patched parts, replacing the item lists wholesale, and it un-archives an archived deliverable.
- **Idempotent: false** A repeat is still read as a change, so it adds another stored version and bumps the version number.

## build-deliverable

- **Read Only: false** It assembles the deliverable's client page from the experiment's article, opportunity, documents and checks, saves it as a new version and logs the build. A dry run saves nothing.
- **Open World: true** The built page is what the client sees at their deliverable link.
- **Destructive: true** It replaces the stored manifest with the newly built one, along with the status and publish plan if given.
- **Idempotent: false** A repeat adds another version and another build entry in the history.

## record-deliverable-check

- **Read Only: false** It stores one pre-publish check result, such as compliance or fact verification, with its findings, pinned to the current article version.
- **Open World: true** The check's verification notes are shown on the client's own deliverable page.
- **Destructive: false** It only adds a check record, and earlier checks stay on file as history.
- **Idempotent: false** A repeat adds a second check record and another entry in the history.

## list-deliverable-checks

- **Read Only: true** It reads the deliverable's recorded pre-publish checks and whether each still matches the current article or has gone stale. Nothing is changed.
- **Open World: false** It reads the caller's own team records in MetriFi's database, and nothing is shared by listing them.
- **Destructive: false** It only lists checks and leaves them as they were.
- **Idempotent: true** A repeat returns the same list until a check is recorded or the article changes.

## get-campaign-readiness

- **Read Only: true** It reads whether a campaign has enough completed responses to measure: the share of prompts answered in a lookback window, per-prompt counts and dates, runs in progress and the auto-run schedule. Nothing is changed.
- **Open World: false** It reads only the caller's team campaign and response records in MetriFi's database, and no outside service is called.
- **Destructive: false** It only reports readiness and leaves the campaign as it was.
- **Idempotent: true** A repeat returns the same figures until more responses complete.

## research-keywords

- **Read Only: false** It buys monthly search volume for the keywords from DataForSEO, national and local where the campaign has a location, and stores the figures on the campaign.
- **Open World: true** It calls DataForSEO, an outside paid keyword data service, for every keyword it has no fresh figure for.
- **Destructive: true** When refreshing it overwrites the stored volume for keywords already researched.
- **Idempotent: false** A repeat buys again for any keyword that came back empty the first time, and for every keyword when refresh is on.

## list-deliverables-needing-attention

- **Read Only: true** It reads the team's deliverables with client activity not yet processed or a blocking item still open, with the waiting activity, follow-up state and client link. Nothing is changed.
- **Open World: false** It reads the caller's own team deliverables in MetriFi's database, and no one is contacted.
- **Destructive: false** It only lists deliverables and leaves their activity as it was.
- **Idempotent: true** A repeat returns the same list until activity is marked processed or new activity arrives.

## mark-deliverable-activity-processed

- **Read Only: false** It moves the deliverable's processed-through marker to the given activity, so earlier client activity stops counting as waiting.
- **Open World: false** The marker is an internal bookmark for the team, and no client page or other team reads it.
- **Destructive: true** It replaces the previous marker position.
- **Idempotent: true** A repeat finds the marker already at that activity and writes nothing.

## list-funnels

- **Read Only: true** It reads the team's CRO funnels with their category, conversion value and step count. Nothing is changed.
- **Open World: false** It reads only the caller's team funnels in MetriFi's database, and no analytics service is queried.
- **Destructive: false** It only lists funnels, so none is removed or edited.
- **Idempotent: true** A repeat returns the same list unless a funnel is added or removed in between.

## get-funnel

- **Read Only: true** It reads one funnel with its steps, each step's metrics, and the funnel's stored snapshot figures. Nothing is changed.
- **Open World: false** It reads a funnel belonging to the caller's team from MetriFi's database, and no analytics service is queried.
- **Destructive: false** It only reports the funnel and leaves it and its steps as they were.
- **Idempotent: true** A repeat returns the same funnel until someone edits it or a new snapshot lands.

## create-funnel

- **Read Only: false** It creates a new, empty funnel on one of the team's Google Analytics connections, with a name, category and conversion value.
- **Open World: true** A team that shares its funnels lets other paying customers find this funnel and compare against it, and the funnel draws its numbers from Google Analytics.
- **Destructive: false** It only adds a funnel and changes no existing funnel or connection.
- **Idempotent: false** A repeat with the same name makes a second, separate funnel.

## update-funnel

- **Read Only: false** It changes the funnel's name, category or conversion value, and a new conversion value queues a fresh Google Analytics snapshot and re-analysis of dashboards built on the funnel.
- **Open World: true** The change triggers Google Analytics fetches, and dashboards in other teams that compare against a shared funnel are re-analyzed with the new numbers.
- **Destructive: true** It overwrites the funnel's previous name, category or conversion value.
- **Idempotent: false** A fractional conversion value is stored rounded, so a repeat still reads as a change and queues another snapshot and another dashboard analysis.

## delete-funnel

- **Read Only: false** It removes the funnel together with its steps from the team.
- **Open World: true** A shared funnel disappears from other paying customers' comparison dashboards and search once deleted.
- **Destructive: true** It deletes the funnel and its steps, and no tool restores them.
- **Idempotent: true** A repeat finds no funnel left and changes nothing.

## replicate-funnel

- **Read Only: false** It copies the funnel and all of its steps into a new funnel named with a Copy suffix.
- **Open World: true** The copy uses the same Google Analytics connection, and if the team shares its funnels other paying customers can find it.
- **Destructive: false** It only adds a new funnel, and the original is left unchanged.
- **Idempotent: false** A repeat makes another copy each time it runs.

## create-funnel-step

- **Read Only: false** It adds a step to the funnel with a name, position and the Google Analytics metrics that measure it.
- **Open World: true** The step's metrics are Google Analytics measures, and a shared funnel's steps are read by other paying customers' comparison dashboards.
- **Destructive: false** It only adds a step, and the funnel's other steps keep their settings.
- **Idempotent: false** A repeat adds a second step with the same settings.

## update-funnel-step

- **Read Only: false** It changes a step's name, position or metrics, and a change to position or metrics queues a fresh Google Analytics snapshot and re-analysis of dashboards built on the funnel.
- **Open World: true** The change triggers Google Analytics fetches, and other teams' dashboards that compare against a shared funnel are re-analyzed.
- **Destructive: true** It overwrites the step's previous name, position or metrics.
- **Idempotent: false** Metrics are stored in a form that never reads back identical, so a repeat still counts as a change and queues another snapshot and dashboard analysis.

## delete-funnel-step

- **Read Only: false** It removes one step from the funnel.
- **Open World: true** The step disappears from a shared funnel that other paying customers' comparison dashboards read.
- **Destructive: true** It deletes the step, and no tool restores it.
- **Idempotent: true** A repeat finds the step gone and changes nothing.

## get-funnel-report

- **Read Only: true** It pulls live step-by-step user counts and conversion rates for the funnel from Google Analytics over a date range. Nothing is changed.
- **Open World: true** The figures are fetched live from the team's Google Analytics property, an outside service.
- **Destructive: false** It only reports figures and leaves the funnel and its snapshots as they were.
- **Idempotent: true** A repeat over the same dates returns the same figures, apart from late-arriving analytics data.

## ga-page-users

- **Read Only: true** It pulls the number of users per page from the team's Google Analytics property for a date range, optionally filtered by path. Nothing is changed.
- **Open World: true** The page figures are fetched live from Google Analytics, an outside service.
- **Destructive: false** It only reports page traffic and leaves every funnel and connection as it was.
- **Idempotent: true** A repeat over the same dates returns the same counts, apart from late-arriving analytics data.

## ga-outbound-link-users

- **Read Only: true** It pulls the number of users who clicked each outbound link from the team's Google Analytics property for a date range. Nothing is changed.
- **Open World: true** The click figures are fetched live from Google Analytics, an outside service.
- **Destructive: false** It only reports link clicks and leaves every funnel and connection as it was.
- **Idempotent: true** A repeat over the same dates returns the same counts, apart from late-arriving analytics data.

## list-dashboards

- **Read Only: true** It reads the team's comparison dashboards with their names and focus funnels. Nothing is changed.
- **Open World: false** It reads only the caller's team dashboards in MetriFi's database, and nothing is shared by listing them.
- **Destructive: false** It only lists dashboards, so none is removed or edited.
- **Idempotent: true** A repeat returns the same list unless a dashboard is added or removed.

## get-dashboard

- **Read Only: true** It reads one dashboard with its funnels, including shared funnels it compares against, and its stored median and best analyses. Nothing is changed.
- **Open World: false** It reads stored dashboard data for the caller's team, and nothing about the team is written or shown to anyone else by reading it.
- **Destructive: false** It only reports the dashboard and leaves it as it was.
- **Idempotent: true** A repeat returns the same dashboard until it is re-analyzed or edited.

## create-dashboard

- **Read Only: false** It creates a new, empty comparison dashboard for the team with a name and description.
- **Open World: false** The dashboard is a new row that only the caller's team can see, and it starts with no funnels and no analysis.
- **Destructive: false** It only adds a dashboard and changes no existing record.
- **Idempotent: false** A repeat with the same name makes a second, separate dashboard.

## update-dashboard

- **Read Only: false** It changes the dashboard's name, description or notes.
- **Open World: false** These fields are shown only inside the caller's team, and no other team reads them.
- **Destructive: true** It overwrites the previous name, description or notes.
- **Idempotent: true** A repeat with the same values finds nothing to change and writes nothing.

## delete-dashboard

- **Read Only: false** It removes the dashboard from the team. The funnels it compared are left in place.
- **Open World: false** It removes only the caller's own dashboard, and no other team's view changes.
- **Destructive: true** It deletes the dashboard, and no tool restores it.
- **Idempotent: true** A repeat finds no dashboard left and changes nothing.

## set-dashboard-funnels

- **Read Only: false** It sets which funnels the dashboard compares, and in what order, replacing the current set.
- **Open World: false** It changes only which funnels appear on the caller's own dashboard, and the owners of shared funnels are not told or affected.
- **Destructive: true** It replaces the dashboard's funnel list, dropping any funnel not in the new one.
- **Idempotent: true** A repeat with the same funnels in the same order adds and removes nothing.

## analyze-dashboard

- **Read Only: false** It fetches Google Analytics figures for the dashboard's focus funnel and each compared funnel, stores a new median and best analysis, and updates the dashboard's status.
- **Open World: true** It queries Google Analytics for every funnel on the dashboard, an outside service.
- **Destructive: true** The new analysis replaces the one the dashboard shows, and its status and issue fields are overwritten.
- **Idempotent: false** A repeat fetches the figures again and stores another pair of analysis rows.

## get-analysis

- **Read Only: true** It reads one stored dashboard analysis with the step-by-step comparison between the focus funnel and the benchmark. Nothing is changed.
- **Open World: false** It reads an analysis already stored for the caller's team, and no analytics service is queried.
- **Destructive: false** It only reports the analysis and leaves it as it was.
- **Idempotent: true** A repeat returns the same analysis, since a stored analysis does not change.

## list-recommendations

- **Read Only: true** It reads the team's landing-page recommendations with their titles and generation status. Nothing is changed.
- **Open World: false** It reads only the caller's team recommendations in MetriFi's database, and nothing is shared by listing them.
- **Destructive: false** It only lists recommendations, so none is removed or edited.
- **Idempotent: true** A repeat returns the same list, with statuses moving only as generation runs.

## get-recommendation

- **Read Only: true** It reads one recommendation with its prompt, status, generated pages and their blocks. Nothing is changed.
- **Open World: false** It reads a recommendation belonging to the caller's team, and nothing is published or shared by reading it.
- **Destructive: false** It only reports the recommendation and leaves it as it was.
- **Idempotent: true** A repeat returns the same details, with the status moving only as generation runs.

## create-recommendation

- **Read Only: false** It creates a new landing-page recommendation for the team with a title, prompt and optional dashboard and funnel step. Nothing is generated yet.
- **Open World: false** It adds a row only the caller's team can see, and no page is generated or published outside MetriFi.
- **Destructive: false** It only adds a recommendation and changes no existing record.
- **Idempotent: false** A repeat makes a second, separate recommendation.

## update-recommendation

- **Read Only: false** It changes the recommendation's title, prompt or content.
- **Open World: false** These fields are shown only inside the caller's team, and nothing is pushed to a website.
- **Destructive: true** It overwrites the previous title, prompt or content.
- **Idempotent: true** A repeat with the same values finds nothing to change and writes nothing.

## delete-recommendation

- **Read Only: false** It removes the recommendation together with its generated pages and blocks.
- **Open World: false** It removes only the caller's own recommendation, and no other team or website is affected.
- **Destructive: true** It deletes the recommendation, its pages and blocks for good, with no undo.
- **Idempotent: true** A repeat finds no recommendation left and changes nothing.

## generate-recommendation

- **Read Only: false** It marks the recommendation queued and starts background generation, which captures page screenshots and has an AI model write the landing page, using one of the team's monthly recommendations.
- **Open World: true** Generation captures screenshots of the pages through an outside screenshot service and has an outside AI model write the page.
- **Destructive: false** It only starts a new generation, and the funnels and dashboards it draws on are left unchanged.
- **Idempotent: false** A repeat queues another paid generation and uses another recommendation from the team's quota.

## get-block

- **Read Only: true** It reads one generated landing-page block's HTML. Nothing is changed.
- **Open World: false** It reads a block belonging to the caller's team, and nothing is published by reading it.
- **Destructive: false** It only returns the block and leaves it as it was.
- **Idempotent: true** A repeat returns the same HTML until someone edits the block.

## ai-edit-block

- **Read Only: false** It has an AI model rewrite the block's HTML to follow the instruction and saves the result over the block.
- **Open World: true** The block and the instruction go to an outside AI provider, OpenAI, which writes the new HTML.
- **Destructive: true** It overwrites the block's HTML with the AI's version, and the previous HTML is not kept.
- **Idempotent: false** A repeat makes another paid AI call and applies the instruction to the already edited block, so the result drifts.

## list-connections

- **Read Only: true** It reads the team's Google Analytics connections with their property names and how many funnels use each. Nothing is changed.
- **Open World: false** It reads the connection records stored in MetriFi's database, and no call goes out to the analytics service.
- **Destructive: false** It only lists connections and leaves each one as it was.
- **Idempotent: true** A repeat returns the same list unless a connection is added or removed.

## list-files

- **Read Only: true** It reads the list of files the team has uploaded to its CRO workspace. Nothing is changed.
- **Open World: false** It reads only the caller's team file records in MetriFi's database, and nothing is shared by listing them.
- **Destructive: false** It only lists files and leaves every one in place.
- **Idempotent: true** A repeat returns the same list unless someone uploads a file in between.

## get-organization

- **Read Only: true** It reads the team's CRO profile and settings, including whether its funnels are kept private from other teams. Nothing is changed.
- **Open World: false** It reads the caller's own team settings in MetriFi's database, and nothing is shared by reading them.
- **Destructive: false** It only reports the profile and leaves it as it was.
- **Idempotent: true** A repeat returns the same profile until someone changes the team's settings.

## list-categories

- **Read Only: true** It reads MetriFi's list of funnel categories, such as checking or auto loans. Nothing is changed.
- **Open World: false** It reads a shared reference list in MetriFi's database, and nothing leaves the platform.
- **Destructive: false** It only lists categories and leaves them as they were.
- **Idempotent: true** A repeat returns the same list, which changes only when MetriFi edits it.

## get-core-rules

- **Read Only: true** It reads the core design and conversion rules from MetriFi's own knowledge base of A/B test results. Nothing is changed.
- **Open World: false** The rules come from the knowledge base bundled with MetriFi, and no outside service is called.
- **Destructive: false** It only returns the rules and leaves the knowledge base as it was.
- **Idempotent: true** A repeat returns the same rules until MetriFi ships a new knowledge base.

## get-doc

- **Read Only: true** It reads one document from MetriFi's knowledge base by its path. Nothing is changed.
- **Open World: false** The document is read from the knowledge base bundled with MetriFi, and no outside service is called.
- **Destructive: false** It only returns the document and leaves the knowledge base as it was.
- **Idempotent: true** A repeat returns the same document until MetriFi ships a new knowledge base.

## list-docs

- **Read Only: true** It reads the table of documents in MetriFi's knowledge base. Nothing is changed.
- **Open World: false** The listing comes from the knowledge base bundled with MetriFi, and no outside service is called.
- **Destructive: false** It only lists documents and leaves them as they were.
- **Idempotent: true** A repeat returns the same listing until MetriFi ships a new knowledge base.

## search-tests

- **Read Only: true** It searches MetriFi's library of past A/B tests by topic, page type or verdict and returns the matching tests with their results. Nothing is changed.
- **Open World: false** The search runs over the test library bundled with MetriFi, and no outside service is called.
- **Destructive: false** It only returns matches and leaves the library as it was.
- **Idempotent: true** A repeat with the same filters returns the same matches.

## get-test

- **Read Only: true** It reads one A/B test from MetriFi's library in full: hypothesis, variants, result and lessons. Nothing is changed.
- **Open World: false** The test is read from the library bundled with MetriFi, and no outside service is called.
- **Destructive: false** It only returns the test and leaves the library as it was.
- **Idempotent: true** A repeat returns the same test, which changes only with a new library release.

## list-proven-patterns

- **Read Only: true** It reads the list of proven-pattern guides, the page designs MetriFi's tests have shown to win. Nothing is changed.
- **Open World: false** The list comes from the knowledge base bundled with MetriFi, and no outside service is called.
- **Destructive: false** It only lists guides and leaves them as they were.
- **Idempotent: true** A repeat returns the same list until MetriFi ships a new knowledge base.

## get-proven-pattern

- **Read Only: true** It reads one proven-pattern guide by name, with the tests behind it. Nothing is changed.
- **Open World: false** The guide is read from the knowledge base bundled with MetriFi, and no outside service is called.
- **Destructive: false** It only returns the guide and leaves it as it was.
- **Idempotent: true** A repeat returns the same guide until MetriFi ships a new knowledge base.

## get-anti-patterns

- **Read Only: true** It reads the anti-patterns guide, the page designs MetriFi's tests have shown to lose. Nothing is changed.
- **Open World: false** The guide is read from the knowledge base bundled with MetriFi, and no outside service is called.
- **Destructive: false** It only returns the guide and leaves it as it was.
- **Idempotent: true** A repeat returns the same guide until MetriFi ships a new knowledge base.

## list-sites

- **Read Only: true** It searches GitHub for the MetriFi site repos tagged with the caller's teams and returns their slugs and last push times. Nothing is changed on GitHub or in MetriFi.
- **Open World: true** The site list comes from a live search of MetriFi's GitHub organization, an outside service, rather than from MetriFi's own database.
- **Destructive: false** It only looks up repositories and returns a list, so no repo, site or setting is removed or replaced.
- **Idempotent: true** Repeating it runs the same repository search and returns the same list unless a site was added or moved in between.

## get-site

- **Read Only: true** It reads the site's repo details and draft-versus-live commit comparison from GitHub, plus its preview deployment, draft host status and preview password from Vercel. It only asks whether the draft host exists and assigns nothing.
- **Open World: true** Its data comes from GitHub and Vercel, and it returns password-carrying links to the client's hosted preview and live site.
- **Destructive: false** It reports the site's state and review links and leaves the repo, the Vercel project and every domain as they were.
- **Idempotent: true** A repeat asks GitHub and Vercel the same questions and returns the same details, only newer if someone pushed or deployed in between.

## check-slug

- **Read Only: true** It turns the input into a slug, checks it against the format and reserved names, and asks GitHub whether a repo with that name already exists. It reserves nothing.
- **Open World: true** The availability answer depends on a live lookup against MetriFi's GitHub organization, an outside service.
- **Destructive: false** It answers yes or no with reasons, and no repo or site is claimed, removed or replaced.
- **Idempotent: true** Repeating it gives the same answer for the same slug until someone creates a repo with that name.

## create-site

- **Read Only: false** It creates a private GitHub repo from the starter template, tags it with the owning team, creates a linked Vercel project with its preview password, adds the site's review workspace in MetriFi and starts the first production build.
- **Open World: true** It creates real resources in GitHub and Vercel and puts a password-gated site on the public internet under a metrifi.dev address.
- **Destructive: false** It only brings new resources into being for a slug that is confirmed free, so no existing repo, project or review is removed or replaced.
- **Idempotent: false** A successful call stands up a new repo, Vercel project, domains and first deployment, so a repeat is not a safe retry: the same slug is then taken, and a different one creates a second site.

## move-site

- **Read Only: false** It rewrites the repo's team topic on GitHub so the site belongs to the destination team.
- **Open World: true** The move is made on the site's GitHub repository, an outside service, and it changes which customer team can see and publish the site.
- **Destructive: true** It overwrites the old team binding, so that team loses access to and publishing of the site at once until someone moves it back.
- **Idempotent: true** It sets the topic list to the same result whatever the prior team, so a repeat leaves the repo, the site list and permissions exactly as after the first call.

## delete-site

- **Read Only: false** When confirmed with the exact slug, it deletes the site's Vercel project and deployments, strips its registry topics on GitHub and deletes its review workspace in MetriFi. Without that confirmation it only returns the plan.
- **Open World: true** It tears down hosting on Vercel, which takes the client's live site offline, and edits the repo's topics on GitHub.
- **Destructive: true** The Vercel project, its hosts and the review threads, comments and activity are deleted and cannot be recovered.
- **Idempotent: true** A repeat finds no Vercel project, no registry topics and no review left, so it deletes nothing further and reports the site as already gone.

## list-site-files

- **Read Only: true** It reads one directory, or the whole file tree, of the site's repo on GitHub at the working branch or a given ref. Nothing in the repo is changed.
- **Open World: true** The file listing is read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only lists file names and leaves every file in the repo as it was.
- **Idempotent: true** Repeating it returns the same listing for the same ref unless a commit lands in between.

## read-file

- **Read Only: true** It reads one file's content and version fingerprint from the site's repo on GitHub, from the working branch or a given ref. The repo is left unchanged.
- **Open World: true** The file is fetched live from the site's repository on GitHub, an outside service.
- **Destructive: false** It returns the file and its fingerprint and leaves the repo exactly as it was.
- **Idempotent: true** A repeat returns the same content and fingerprint for the same ref until a commit changes that file.

## write-files

- **Read Only: false** It commits the given files to the site's working branch on GitHub, creating that branch off main on the first write, fetching any file given by link, and makes sure the site's stable draft preview host is assigned on Vercel.
- **Open World: true** It commits to the site's GitHub repository, which triggers a Vercel preview build of the client's site, and it can fetch bytes from outside hosts such as Google Fonts.
- **Destructive: true** It overwrites existing files with new content in the site repo. A file-version check refuses a write made against a stale copy, but a fresh overwrite replaces what was there.
- **Idempotent: false** A repeat with the same files lands another commit on the working branch and triggers another preview build, because nothing compares the new content with what is already there.

## delete-files

- **Read Only: false** It removes the given paths from the site's working branch on GitHub in one commit and makes sure the draft preview host is assigned on Vercel. Paths that do not exist are reported as not found.
- **Open World: true** It commits to the site's repository on GitHub, and that commit rebuilds the client's preview on Vercel.
- **Destructive: true** It deletes files from the site repo's working branch, so they vanish from the preview until restored from history.
- **Idempotent: true** It first checks which paths still exist, so a repeat finds them gone, reports them as not found and makes no commit.

## file-history

- **Read Only: true** It reads the commit log for one path from the site's repo on GitHub, with who drafted and published each change. Nothing in the repo is changed.
- **Open World: true** The history is read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports past commits and leaves the file and its history as they were.
- **Idempotent: true** A repeat returns the same commit log for the same path and ref until a new commit touches that path.

## get-preview-url

- **Read Only: true** It looks up the site's Vercel project, its latest working-branch deployment, whether the draft host is assigned and the preview password, then builds the shareable links. It assigns nothing on Vercel.
- **Open World: true** It reads from Vercel and returns a link that carries the site's gate password and opens the client's hosted preview or live site.
- **Destructive: false** It returns links and deployment state and leaves the Vercel project, its domains and deployments as they were.
- **Idempotent: true** A repeat returns the same links, changing only if a new deployment finished in between.

## create-asset-upload

- **Read Only: false** It stores nothing itself, but it issues a signed upload link, valid for 30 minutes, that lets whoever holds it add images to the site's staged upload storage.
- **Open World: true** The link it returns lets anyone who holds it upload images into the site's Vercel Blob storage, an outside service.
- **Destructive: false** It only issues an upload link. Existing uploads and site files are left as they were.
- **Idempotent: false** A repeat issues another, separate signed upload link with a fresh 30 minute expiry, so each call hands out one more live upload credential for the site.

## list-site-assets

- **Read Only: true** It lists the images staged for this site in Vercel Blob storage, with each one's link, size and upload time. Nothing is stored or removed.
- **Open World: true** The list is read from Vercel Blob storage, an outside service that holds the site's staged uploads.
- **Destructive: false** It only lists staged uploads and leaves every blob in place.
- **Idempotent: true** A repeat returns the same list unless someone uploads or removes an image in between.

## delete-site-asset

- **Read Only: false** It removes one staged upload from Vercel Blob storage after checking the link belongs to this site.
- **Open World: true** The removal happens in Vercel Blob storage, an outside service.
- **Destructive: true** It deletes the staged image, which is the only copy if the file was never committed into the site repo.
- **Idempotent: true** Removing an image that is already gone succeeds without effect, so a repeat leaves storage unchanged and writes nothing else.

## list-rates

- **Read Only: true** It reads the site's rates file from the repo on GitHub and returns each rate's current value and count of pending scheduled changes. The file is left unchanged.
- **Open World: true** The rates are read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports rates and leaves the rates file and the live site as they were.
- **Idempotent: true** A repeat returns the same rates for the same ref, differing only when a scheduled change has come due or a commit landed in between.

## get-rate

- **Read Only: true** It reads one rate's current value and its full effective-dated timeline from the site's rates file on GitHub. Nothing is changed.
- **Open World: true** The rate is read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports one rate and leaves its timeline as it was.
- **Idempotent: true** A repeat returns the same timeline for the same ref, with an entry moving from scheduled to active only once its time passes.

## set-rate

- **Read Only: false** It adds or updates an entry in the rate's timeline and commits the site's rates file to the working branch on GitHub.
- **Open World: true** It commits to the site's repository on GitHub, which rebuilds the client's preview on Vercel, and once published the rate appears on the client's public site.
- **Destructive: true** It overwrites the rate's fields at that effective time, merging the new values over what was there, and the old values survive only in git history.
- **Idempotent: false** A repeat lands another commit, and when no effective time is given it stamps the current time, so it adds a second timeline entry.

## list-scheduled-changes

- **Read Only: true** It reads the site's rates file on GitHub and lists every future-dated change in time order. Nothing is changed.
- **Open World: true** The pending changes are read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only lists pending changes and leaves the rates file as it was.
- **Idempotent: true** A repeat returns the same list for the same ref, shrinking only as scheduled times pass.

## cancel-scheduled-change

- **Read Only: false** It removes the pending timeline entry at that exact effective time from the site's rates file and commits the file to the working branch on GitHub.
- **Open World: true** It commits the edited rates file to the site repository on GitHub, and that commit rebuilds the client preview on Vercel without the cancelled change.
- **Destructive: true** It deletes a scheduled rate change, so it will not take effect unless it is set again.
- **Idempotent: true** A repeat finds no change at that time and is refused before any commit, so nothing more is written.

## rate-history

- **Read Only: true** It reads one rate's effective-dated timeline and the commit log of the site's rates file from GitHub. Nothing is changed.
- **Open World: true** The timeline and log are read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports history and leaves the rate and its commits as they were.
- **Idempotent: true** A repeat returns the same timeline and log for the same ref until a new commit touches the rates file.

## find-rate-usages

- **Read Only: true** It lists the site's source files on GitHub, reads the pages and components that might reference the rate, and returns the matching lines. Nothing is changed.
- **Open World: true** The search reads the site's code live from its repository on GitHub, an outside service.
- **Destructive: false** It only searches the code and leaves every file as it was.
- **Idempotent: true** A repeat returns the same matches for the same ref until someone commits a change to those files.

## activate-due-rates

- **Read Only: false** When a rate change on main has come due since the last production build, it pushes a release commit to main on GitHub, which rebuilds production on Vercel.
- **Open World: true** It commits to GitHub and rebuilds the client's public production site on Vercel.
- **Destructive: true** The rebuild replaces the live site with a build showing the newly effective rates, and the previous values stop being shown to visitors.
- **Idempotent: false** A repeat made before Vercel registers the new production build, or while that lookup fails, pushes another release commit and starts another rebuild.

## list-facts

- **Read Only: true** It reads the site's facts file from the repo on GitHub and returns every managed fact, such as routing number, phone and hours. The file is left unchanged.
- **Open World: true** The facts are read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports facts and leaves the facts file as it was.
- **Idempotent: true** A repeat returns the same facts for the same ref until a commit changes the file.

## get-fact

- **Read Only: true** It reads one managed fact's label, type and value from the site's facts file on GitHub. Nothing is changed.
- **Open World: true** The fact is read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports one fact and leaves the facts file as it was.
- **Idempotent: true** A repeat returns the same fact for the same ref until a commit changes it.

## set-fact

- **Read Only: false** It sets the fact's value, type, label and group in the site's facts file and commits the file to the working branch on GitHub.
- **Open World: true** It commits to the site's repository on GitHub, which rebuilds the client's preview on Vercel, and once published the fact appears on the client's public site.
- **Destructive: true** It overwrites the fact's previous value, which then survives only in git history.
- **Idempotent: false** A repeat with the same value lands another commit on the working branch, because nothing checks whether the file actually changed.

## get-brand

- **Read Only: true** It reads the site's brand settings, meaning colors, fonts, logo and voice, from the site's repo on GitHub at the working branch or a given ref. Nothing is changed.
- **Open World: true** The brand is read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports the brand and leaves the brand files as they were.
- **Idempotent: true** A repeat returns the same brand for the same ref until a commit changes it.

## set-brand

- **Read Only: false** It validates the brand, then commits the site's brand settings and the style sheet generated from them to the working branch on GitHub.
- **Open World: true** The commit goes to the site's GitHub repository and rebuilds the client's preview on Vercel, and once published the brand shows on the client's public site.
- **Destructive: true** It overwrites the site's existing brand settings and generated styles, which then survive only in git history.
- **Idempotent: false** A repeat with the same brand lands another commit on the working branch, because nothing checks whether the files actually changed.

## validate-brand

- **Read Only: true** It reads the site's brand from GitHub and checks it for errors and warnings, including whether the site's compliance record is resolved. Nothing is changed.
- **Open World: true** The brand and compliance record it checks are read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports problems and leaves the brand and compliance files as they were.
- **Idempotent: true** A repeat returns the same findings for the same ref until a commit changes the brand.

## extract-brand

- **Read Only: true** It fetches the given public web page and pulls out its likely brand colors, fonts, logo and name as a starting point. Nothing is stored.
- **Open World: true** It fetches a web page from the address given, an outside website, and refuses addresses on private or internal networks.
- **Destructive: false** It only returns suggestions and changes no site, brand or record.
- **Idempotent: true** A repeat fetches the page again and returns the same suggestions unless the page itself changed.

## import-brand-from-design

- **Read Only: true** It parses design token style text passed in the call, such as a color and font token sheet, into brand settings ready for set-brand. Nothing is stored.
- **Open World: false** It works only on the text passed in, and nothing is fetched from or sent to any outside service.
- **Destructive: false** It only returns converted brand settings and changes no site or record.
- **Idempotent: true** A repeat with the same token text returns the same brand settings.

## get-compliance

- **Read Only: true** It reads the site's compliance record, meaning institution, charter type, insurer, regulator and required disclosures, from the site's repo on GitHub. Nothing is changed.
- **Open World: true** The record is read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports the record and leaves it as it was.
- **Idempotent: true** A repeat returns the same record for the same ref until a commit changes it.

## set-compliance

- **Read Only: false** It commits the site's compliance record, with institution, charter, insurer, regulator and required disclosures, to the working branch on GitHub, stamping the confirmation time when a confirmer is named.
- **Open World: true** The commit goes to the site's GitHub repository and rebuilds the client's preview on Vercel, and the disclosures it sets appear on the client's public site once published.
- **Destructive: true** It overwrites the site's existing compliance record, which then survives only in git history.
- **Idempotent: false** A repeat lands another commit, and when a confirmer is named it stamps a new confirmation time, so the file differs too.

## publish-site

- **Read Only: false** It checks the compliance gate and the protected-file and deletion guards, then opens a pull request from the working branch to the live branch on GitHub and merges it, which rebuilds production.
- **Open World: true** Merging on GitHub rebuilds the client's public production site on Vercel, so the change goes live to visitors.
- **Destructive: true** It replaces the live site with the working branch's version, and undoing it takes another commit and publish.
- **Idempotent: false** A repeat after new drafting publishes those new changes as another pull request and production build, and a repeat while a pull request is still open tries the merge again.

## list-pending-changes

- **Read Only: true** It lists the sites the caller can reach whose working branch holds changes not yet published. Nothing is changed.
- **Open World: true** It compares branches live on GitHub, an outside service, for each site.
- **Destructive: false** It only lists waiting changes and leaves every branch as it was.
- **Idempotent: true** A repeat returns the same list until someone drafts or publishes a change.

## summarize-changes

- **Read Only: true** It compares the site's working branch with the live branch on GitHub and summarizes the files and commits that would go live on publish. Nothing is changed.
- **Open World: true** The comparison is read live from the site's repository on GitHub, an outside service.
- **Destructive: false** It only reports the difference and leaves both branches as they were.
- **Idempotent: true** A repeat returns the same summary until another commit lands on either branch.

## create-review

- **Read Only: false** It creates the site's client review workspace, or updates its title, pages, action items, checklist and participants, and returns the client link.
- **Open World: true** It sets up what the client sees in the review overlay on their preview site and gives each participant a personal link to it.
- **Destructive: true** On a review that already exists it overwrites the pages, items and checklist with the new spec, and reopens a round that was marked published.
- **Idempotent: true** A repeat with the same spec matches every item by its source id, so it adds no rows, reopens nothing and records no activity.

## push-review-revision

- **Read Only: false** It records a new review revision with its changelog against the current draft deploy, re-attaches open feedback to the updated pages and marks earlier approvals stale.
- **Open World: true** It fetches the site's live draft pages on Vercel to re-attach feedback, and the client sees the new revision and changelog in the overlay.
- **Destructive: true** It replaces the review's current version and marks the client's earlier approval stale.
- **Idempotent: false** A repeat records another revision and bumps the version again, even with the same changelog.

## get-review

- **Read Only: true** It reads the site's review with its status, version, pages, action items, checklist, participants and client link. Nothing is changed.
- **Open World: false** It is a read for the caller's team, and nothing is sent, shown or shared with the client by calling it.
- **Destructive: false** It only reports the review and leaves it as it was.
- **Idempotent: true** A repeat returns the same review until someone revises it or the client acts on it.

## list-reviews

- **Read Only: true** It reads the reviews on sites the caller can reach, with each one's status and version. Nothing is changed.
- **Open World: false** It reads only review records in MetriFi's database for the caller's sites, and nothing is shared by listing them.
- **Destructive: false** It only lists reviews, so none is removed or edited.
- **Idempotent: true** A repeat returns the same list until a review is added or its status moves.

## get-pending-feedback

- **Read Only: true** It reads the open feedback threads on the site's review, each with the page, the anchored element and the comments. Nothing is changed.
- **Open World: false** It reads feedback already stored in MetriFi's database, and nothing goes back to the client by reading it.
- **Destructive: false** It only reports feedback and leaves every thread open as it was.
- **Idempotent: true** A repeat returns the same threads until the client adds more or someone resolves them.

## get-feedback-item

- **Read Only: true** It reads one feedback thread in full, with its anchor, status, resolution note and every comment. Nothing is changed.
- **Open World: false** It reads a thread already stored for the caller's site, and nothing is shown to the client by reading it.
- **Destructive: false** It only reports the thread and leaves it as it was.
- **Idempotent: true** A repeat returns the same thread until someone comments on it or closes it.

## manage-review-item

- **Read Only: false** It marks action items done, reopens, unassigns, archives, unarchives or deletes them, and reopens, archives, unarchives or deletes feedback threads, logging each real change.
- **Open World: true** The client sees these changes in the review overlay, which is shared outside the caller's team.
- **Destructive: true** The delete action removes items and threads for good, and the other actions overwrite their state.
- **Idempotent: true** Each action only runs when the item is not already in that state, so a repeat is skipped with no change and no activity entry.

## assign-review-item

- **Read Only: false** It sets the assignee on the named action items and logs each assignment.
- **Open World: true** Each newly assigned item emails the assignee a link to it, and the client sees the assignment in the review overlay.
- **Destructive: true** The new assignee replaces the previous one, and a sent email cannot be recalled.
- **Idempotent: true** An item already assigned to that address is skipped, so a repeat changes nothing and sends no second email.

## resolve-feedback

- **Read Only: false** It marks the open feedback threads as resolved at the current review version, with an optional note, and logs each one.
- **Open World: true** The client sees the thread resolved, with the note, in the review overlay.
- **Destructive: true** It closes the threads and overwrites their status with the resolution.
- **Idempotent: true** Threads already closed are skipped, so a repeat saves nothing, logs nothing and notifies no one.

## dismiss-feedback

- **Read Only: false** It marks the open feedback threads as dismissed with the required reason and logs each one.
- **Open World: true** The client reads the dismissal reason in the review overlay.
- **Destructive: true** It closes the threads as dismissed and overwrites their status.
- **Idempotent: true** Threads already closed are skipped, so a repeat saves nothing, logs nothing and notifies no one.

## comment-on-feedback

- **Read Only: false** It posts a reply on a feedback thread or on an action item the team asked, signed as the MetriFi team, and logs the comment.
- **Open World: true** The client reads the reply in the review overlay on their preview site.
- **Destructive: true** The reply is visible to the client as soon as it posts and cannot be taken back.
- **Idempotent: false** A repeat posts a second, identical reply that the client also sees.

## get-review-activity

- **Read Only: true** It reads the review's activity log, such as comments, resolutions, status changes and revisions. Nothing is changed.
- **Open World: false** It reads the caller's own review history in MetriFi's database, and nothing goes back to the client by reading it.
- **Destructive: false** It only reports activity and leaves every entry as it was.
- **Idempotent: true** A repeat returns the same log, longer only if new activity arrived.

## set-review-status

- **Read Only: false** It moves the review to in review, revising, ready or published, and logs the change. Marking it published needs publish permission.
- **Open World: true** The client sees the review's status in the overlay on their preview site.
- **Destructive: true** It overwrites the review's previous status.
- **Idempotent: true** A repeat with the status it already has returns early and writes nothing.

## send-review

- **Read Only: false** It emails the review link, with a personal link per participant and a note per assigned item, to every participant, adding the named recipient first, and records the send.
- **Open World: true** It emails people at the client institution a link to review their site.
- **Destructive: true** The emails reach real inboxes and cannot be recalled once sent.
- **Idempotent: false** A repeat sends the review emails again to every participant.

## delete-review

- **Read Only: false** With the site's slug as confirmation, it deletes the review with its participants, revisions, items, checklist, threads, comments and activity. Without it, it only returns what would go.
- **Open World: true** The client's review overlay and every participant link stop working once it is deleted.
- **Destructive: true** It permanently deletes the review and all its feedback, with no way to restore it.
- **Idempotent: true** A repeat finds no review left and deletes nothing more.
