#!/usr/bin/env node
// Builds the plugin ZIP uploaded to the OpenAI Plugins portal from the Codex plugin.
//
//   node tools/build-openai-package.mjs <out.zip>
//
// The Codex plugin stays the source. openai/package.json overlays what only the
// OpenAI package needs: the portal's package name, skills to leave out, the package description, and the
// extensions.com.openai review and publication details (test cases, demo URL,
// countries, release notes). Reviewer credentials never go in the package; the
// portal rejects test_credentials and they are entered in the dashboard.
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const out = process.argv[2] && resolve(process.argv[2]);
const fail = (m) => { console.error('FAIL: ' + m); process.exit(1); };
if (!out || !out.endsWith('.zip')) fail('usage: node tools/build-openai-package.mjs <out.zip>');

const overlay = JSON.parse(readFileSync(join(ROOT, 'openai/package.json'), 'utf8'));
const work = join(mkdtempSync(join(tmpdir(), 'openai-pkg-')), 'metrifi');
cpSync(join(ROOT, 'plugins/codex/metrifi'), work, { recursive: true });

for (const s of overlay.excludeSkills) {
  if (!existsSync(join(work, 'skills', s))) fail('excluded skill not found: ' + s);
  rmSync(join(work, 'skills', s), { recursive: true });
}

// The portal reads the Codex MCP config in the { mcpServers: { name: { url } } } shape.
const mcp = JSON.parse(readFileSync(join(work, '.mcp.json'), 'utf8'));
const servers = mcp.mcpServers ?? mcp;
if (Object.keys(servers).length !== 1) fail('expected exactly one MCP server');
writeFileSync(join(work, '.mcp.json'), JSON.stringify({ mcpServers: servers }, null, 2) + '\n');

const manifestPath = join(work, '.codex-plugin/plugin.json');
const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
m.name = overlay.name; // must match the portal's package name once the plugin exists
m.description = overlay.description;
m.skills = './skills/';
m.extensions = { ...(m.extensions ?? {}), ...overlay.extensions };
writeFileSync(manifestPath, JSON.stringify(m, null, 2) + '\n');

// Submission limits from developers.openai.com/plugins/deploy/submission.
const i = m.interface;
const within = (v, n, what) => { if (typeof v !== 'string' || !v.trim() || v.length > n) fail(`${what} empty or over ${n}`); };
within(m.name, 64, 'name');
within(m.description, 4000, 'description');
within(i.displayName, 30, 'displayName');
within(i.shortDescription, 30, 'shortDescription');
within(i.longDescription, 4000, 'longDescription');
within(i.developerName, 80, 'developerName');
if (!Array.isArray(i.capabilities) || i.capabilities.length > 20 || i.capabilities.some((c) => c.length > 120)) fail('capabilities');
if ([i.defaultPrompt].flat().length > 3 || [i.defaultPrompt].flat().some((p) => p.length > 128)) fail('defaultPrompt');
for (const k of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) if (!/^https:\/\//.test(i[k] ?? '')) fail(k);
for (const k of ['logo', 'composerIcon']) if (!existsSync(join(work, i[k]))) fail(k + ' file missing');
const review = m.extensions['com.openai'].review;
const { positive, negative } = review.test_cases;
if (positive.length !== 5 || negative.length !== 3) fail('need exactly 5 positive and 3 negative test cases');
for (const c of positive) for (const k of ['description', 'prompt', 'tools_triggered', 'expected_behavior']) within(c[k], 4000, 'positive case ' + k);
for (const c of negative) for (const k of ['description', 'prompt']) within(c[k], 4000, 'negative case ' + k);
if (/test_credentials|reviewer_instructions/.test(JSON.stringify(m))) fail('credentials field in manifest');

rmSync(out, { force: true });
execFileSync('zip', ['-qr', out, '.', '-x', '*.DS_Store'], { cwd: work });
rmSync(join(work, '..'), { recursive: true });
console.log(`built ${out}: v${m.version}, skills without ${overlay.excludeSkills.join(', ')}`);
