# MetriFi plugin

One install connects your AI tool to MetriFi — the Site Builder tools (design,
edit, preview, and publish your website the MetriFi way) plus the MetriFi
site-design skills. You sign in with your MetriFi account the first time; no
tokens to paste. Full instructions with screenshots: **https://mcp.metrifi.com**

## Claude (claude.ai / Claude Desktop) — no terminal

Customize → **Plugins** → **Add from a repository** → paste
`bloomcu/metrifi-plugins` → Install **metrifi** → click **Connect** and sign in
with your MetriFi account.

## Claude Code

```
/plugin marketplace add bloomcu/metrifi-plugins
/plugin install metrifi@metrifi
```

## Codex

```
codex plugin marketplace add bloomcu/metrifi-plugins
codex plugin add metrifi@metrifi
codex mcp login metrifi
```

## What's inside

- The MetriFi connector (`https://mcp.metrifi.com/mcp`, OAuth via id.metrifi.com)
- Skills: `generate-claude-design-system` → `generate-claude-design-page` →
  `page-design-process` (the three-stage MetriFi site-design workflow; the full
  methodology is fetched from MetriFi at runtime, behind your sign-in)

No MetriFi account yet? Ask your MetriFi contact for an invite.

---
See [NOTICE.md](NOTICE.md). This repository is a release artifact; it is not a
development repo and does not accept contributions.
