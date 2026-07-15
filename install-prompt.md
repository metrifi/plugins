# The one-paste install prompts

The simplest way to install the MetriFi plugin, especially if you're not
technical: copy the prompt for your app, paste it into that AI agent, and it
installs the plugin itself and walks you through the sign-in. You never touch a
terminal.

These are the canonical prompts — the single source. (The old hand-synced copy
served at mcp.metrifi.com/install/* retired with the MCP gateway at the July 2026
platform cutover; a platform-hosted install page is future work and should embed
these verbatim.)

---

## Claude (Claude Code, in the Claude Desktop app)

Open the Claude Code panel in Claude Desktop (or the Claude Code CLI), paste
this, and send it:

```text
You are setting up the MetriFi plugin on my computer for me. I am not technical — do everything yourself by running the commands, explain each step in plain language, and don't ask me to open a terminal. If a step needs my permission, ask and wait. Do this in order and tell me what happened:

1. Clear any leftover MetriFi files from an earlier install so this one is fresh. If these two folders exist, delete them: ~/.claude/plugins/cache/metrifi and ~/.claude/plugins/cache/metrifi-internal (on Windows they live under %USERPROFILE%\.claude\plugins\cache\ with those same two names). They hold only MetriFi's cached plugin build, nothing else, and the next step rebuilds them. If the folders aren't there, there's nothing to do. Only delete those two MetriFi folders, and leave everything else in that cache alone. This makes sure the install uses the current plugin instead of a stale cached copy from before.

2. Install the plugin:
   - Run: claude plugin marketplace add metrifi/plugins
   - Run: claude plugin install metrifi@metrifi --scope user
   If a command isn't found, tell me my Claude Code may need updating, and stop.

3. Turn on automatic updates so I never have to update this by hand: open my Claude settings file at ~/.claude/settings.json, find the "metrifi" entry under "extraKnownMarketplaces" (the marketplace step in #2 just created it), and add "autoUpdate": true to that entry. Read the file, add only that one key, and write it back without changing anything else. If for any reason you can't safely edit that file, tell me to run /plugin, open the Marketplaces tab, select "metrifi", and choose "Enable auto-update" instead. Confirm which way it got set. With this on, MetriFi ships new skills and fixes to me automatically at app launch, no commands.

4. Activate it: run /reload-plugins now, but the reliable way is a new conversation — MetriFi's tools and skills show up once I start a fresh chat with you. If they're still missing after a new conversation, fully quit and reopen the Claude app.

5. Tell me the one thing only I can do: open Settings -> Connectors, find "MetriFi", click Connect, and sign in with my MetriFi account. The plugin's skills load right away, but nothing works until I do this sign-in. If I don't have a MetriFi account yet: when the sign-in window opens I can create a new MetriFi team right there if my organization doesn't have one yet — otherwise ask an admin on my existing MetriFi team to invite me first.

6. Wrap up with a one-line status (installed, enabled, auto-update on), then a section that makes everything I still need to do impossible to miss — use a header like "## What you need to do" followed by a numbered checklist, not a paragraph:
   1. Start a new conversation with me — that's what activates MetriFi's tools. Still missing after a new conversation? Fully quit and reopen Claude.
   2. Go to Settings -> Connectors, find "MetriFi", click Connect, and sign in with your MetriFi account.
   3. Test the connection: send me the exact phrase "Who am I on MetriFi?" in a new message, formatted as its own fenced code block so I can copy it in one click — that works even before any sites are set up.
```

---

## Codex

Open Codex, paste this, and send it:

```text
You are setting up the MetriFi plugin in Codex on my computer for me. I am not technical — do everything yourself, explain each step in plain language, and don't ask me to open a separate terminal. If a step needs my permission, ask and wait. Do this in order and tell me what happened:

1. Install the plugin:
   - Run: codex plugin marketplace add metrifi/plugins
   - Run: codex plugin add metrifi@metrifi
   If a command isn't found, tell me my Codex may need updating, and stop.

2. Sign in to MetriFi: run codex mcp login metrifi — this opens my browser to a MetriFi sign-in. Tell me to approve it there, and that the sign-in page waits only a couple of minutes, so I should do it right away. If I don't have a MetriFi account yet: the sign-in page lets me create one, and I can create a new MetriFi team if my organization doesn't have one yet — otherwise ask an admin on my existing MetriFi team to invite me first. If the login command fails, tell me my Codex may need updating and point me to https://github.com/metrifi/plugins#codex for the manual steps — do not invent another way to authenticate.

3. Note about updates: Codex doesn't auto-update plugins yet, so to get the latest MetriFi skills later I run: codex plugin marketplace upgrade metrifi (the MCP server itself always updates on its own, no action needed). Remind me of this in your wrap-up.

4. Wrap up with a one-line status (installed, "metrifi" server shows connected), then a section that makes everything I still need to do impossible to miss — use a header like "## What you need to do" followed by a numbered checklist, not a paragraph:
   1. Start a new conversation in Codex — that's what makes the metrifi server show connected and its tools available. Still not connected after a new conversation? Fully quit and reopen Codex.
   2. If you haven't finished the sign-in from step 2 yet, do that now.
   3. Test the connection: send me the exact phrase "Who am I on MetriFi?" in your new conversation, formatted as its own fenced code block so I can copy it in one click — that works even before any sites are set up.
   Also remind me how to update later (step 3).
```
