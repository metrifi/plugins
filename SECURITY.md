# Security policy

MetriFi welcomes reports of security vulnerabilities in this plugin and in the MetriFi
services it connects to. We investigate every report we receive.

## Reporting a vulnerability

Email **help@metrifi.com** with `SECURITY` in the subject line.

Please include as much of the following as you have:

- What the issue is and why you believe it is a security problem
- The affected component: this repository, the MetriFi MCP server at
  `https://platform.metrifi.com/mcp`, or the MetriFi platform itself
- Steps to reproduce, including any request or response payloads
- What an attacker could achieve
- Your name or handle, if you would like credit

Do not open a public GitHub issue for a suspected vulnerability. Do not include real
member data, live credentials, or personally identifiable information in your report.

## What to expect

- We acknowledge reports within **3 business days**.
- We give you an assessment and a plan within **10 business days** of acknowledgement.
- We tell you when a fix ships, and we credit reporters who want credit.

If you do not hear back within 3 business days, call **(801) 214-8127** and reference
your email, in case it was filtered.

## Scope

**In scope**

- This repository (`metrifi/plugins`): the plugin manifests, skills, and the MCP server
  configuration it ships
- The MetriFi MCP server at `https://platform.metrifi.com/mcp`, including its OAuth
  endpoints under `https://platform.metrifi.com/oauth/` and its discovery documents
  under `/.well-known/`
- The MetriFi platform at `https://platform.metrifi.com`
- Sites MetriFi builds and hosts on behalf of clients, where the issue stems from
  MetriFi's own code or configuration

**Out of scope**

- Findings that require a compromised device, a compromised MetriFi account, or a
  privileged insider
- Denial of service, volumetric testing, or load testing of any kind
- Social engineering of MetriFi staff or MetriFi clients
- Reports from automated scanners with no demonstrated exploitability
- Missing security headers or weak TLS configuration with no working attack
- Vulnerabilities in third-party services we integrate with, such as GitHub, Vercel,
  Google Analytics, or Cloudflare. Report those to the service owner.

## Testing rules

Test only against your own MetriFi account, team, and sites. Never access, modify, or
retain data belonging to another MetriFi client. If you encounter client data during
testing, stop, do not save it, and tell us what you saw so we can assess exposure.

Do not run tests that degrade service for other users.

## Safe harbor

If you make a good-faith effort to follow this policy, we will not pursue legal action
against you for your research, and we will not ask a third party to. We will make it
known that your actions were authorized under this policy if a third party raises a
concern.

Good faith means: you stay within the scope above, you follow the testing rules, you
report promptly, and you give us reasonable time to fix an issue before disclosing it
publicly. We ask for **90 days** from your report before public disclosure, and we will
tell you if we need longer and why.

## About the plugin's security model

The plugin in this repository carries **no credentials of any kind**. It contains skill
definitions and a pointer to the MetriFi MCP server. Every tool call is authenticated
and authorized server-side against the caller's own MetriFi account, using OAuth 2.0
with PKCE. Installing the plugin grants no access by itself.

## Contact

BloomCU LLC (doing business as MetriFi)
138 E 12300 S Unit 634
Draper, UT 84020
United States

help@metrifi.com · (801) 214-8127

See also the [Terms of Service](https://metrifi.com/legal/terms-of-service/) and
[Privacy Policy](https://metrifi.com/legal/privacy-policy/).
