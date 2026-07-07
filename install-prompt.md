# The one-paste install prompts

The simplest way to install the MetriFi plugin, especially if you're not
technical: copy the prompt for your app, paste it into that AI agent, and it
installs the plugin itself and walks you through the sign-in. You never touch a
terminal.

These are the canonical prompts. The live copy-buttons at
**https://mcp.metrifi.com** serve the same text — keep the two in sync when
editing.

---

## Claude (Claude Code, in the Claude Desktop app)

Open the Claude Code panel in Claude Desktop (or the Claude Code CLI), paste
this, and send it:

```text
You are setting up the MetriFi plugin on my computer for me. I am not technical — do everything yourself by running the commands, explain each step in plain language, and don't ask me to open a terminal. If a step needs my permission, ask and wait. Do this in order and tell me what happened:

1. Install the plugin:
   - Run: claude plugin marketplace add metrifi/plugins
   - Run: claude plugin install metrifi@metrifi --scope user
   If a command isn't found, tell me my Claude Code may need updating, and stop.

2. Activate it: run /reload-plugins (or tell me to fully quit and reopen Claude).

3. Tell me the one thing only I can do: open Settings -> Connectors, find "MetriFi", click Connect, and sign in with my MetriFi account. The plugin's skills load right away, but nothing works until I do this sign-in. If I don't have a MetriFi account yet: when the sign-in window opens I can create a new MetriFi team right there if my organization doesn't have one yet — otherwise ask an admin on my existing MetriFi team to invite me first.

4. Wrap up: confirm the plugin is installed and enabled, remind me to do the Settings -> Connectors sign-in, then tell me that once I'm signed in I can confirm the connection by asking "Who am I on MetriFi?" — that works even before any sites are set up.
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

2. Sign in to MetriFi: run codex mcp login metrifi — this opens my browser to sign in with my MetriFi account. Tell me to finish the sign-in. If I don't have a MetriFi account yet: when the sign-in opens I can create a new MetriFi team if my organization doesn't have one yet — otherwise ask an admin on my existing MetriFi team to invite me first.

3. Wrap up: confirm the plugin is installed and the "metrifi" server shows connected, then tell me that once I'm signed in I can confirm the connection by asking "Who am I on MetriFi?" — that works even before any sites are set up.
```
