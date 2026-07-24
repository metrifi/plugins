#!/usr/bin/env node
// Structural validation for the MetriFi plugin release artifact. Runs without the
// Claude Code CLI so it works in CI. Checks: manifests parse and carry a version;
// the Claude and Codex plugins declare the same version; the Codex skills are a
// byte-for-byte mirror of the Claude skills (they must never drift); each skill's
// synced reference docs match their single source in reference-src/; and no skill
// body carries anything that only works on one host or on one machine.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { planReferenceSync, listSkillReferenceFiles, REFERENCE_SRC, REFERENCE_MAP } from './reference-sync.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const errors = [];
const j = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

// 1. Marketplaces parse and reference the metrifi plugin.
for (const mp of ['.claude-plugin/marketplace.json', '.agents/plugins/marketplace.json']) {
    try {
        const m = j(mp);
        if (!m.name || !m.owner || !Array.isArray(m.plugins)) errors.push(`${mp}: missing name/owner/plugins`);
        if (!m.plugins?.some((p) => p.name === 'metrifi')) errors.push(`${mp}: no 'metrifi' plugin entry`);
    } catch (e) {
        errors.push(`${mp}: ${e.message}`);
    }
}

// 2. Both plugin manifests parse, name === 'metrifi', and versions match.
const claudeManifest = 'plugins/claude/metrifi/.claude-plugin/plugin.json';
const codexManifest = 'plugins/codex/metrifi/.codex-plugin/plugin.json';
let cv, xv;
try {
    const c = j(claudeManifest);
    cv = c.version;
    if (c.name !== 'metrifi') errors.push(`${claudeManifest}: name must be 'metrifi'`);
    if (!/^\d+\.\d+\.\d+$/.test(cv || '')) errors.push(`${claudeManifest}: version must be x.y.z (got ${cv})`);
} catch (e) {
    errors.push(`${claudeManifest}: ${e.message}`);
}
try {
    xv = j(codexManifest).version;
} catch (e) {
    errors.push(`${codexManifest}: ${e.message}`);
}
if (cv && xv && cv !== xv) errors.push(`version mismatch: claude ${cv} vs codex ${xv} — run tools/release.mjs`);

// 3. Codex skills must mirror Claude skills exactly (no drift).
const claudeSkills = 'plugins/claude/metrifi/skills';
const codexSkills = 'plugins/codex/metrifi/skills';
const listSkillFiles = (dir) => {
    const out = {};
    const walk = (d, rel) => {
        for (const name of readdirSync(join(ROOT, d))) {
            const abs = join(d, name);
            if (statSync(join(ROOT, abs)).isDirectory()) walk(abs, join(rel, name));
            else out[join(rel, name)] = readFileSync(join(ROOT, abs), 'utf8');
        }
    };
    walk(dir, '');
    return out;
};
try {
    const a = listSkillFiles(claudeSkills);
    const b = listSkillFiles(codexSkills);
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
        if (a[k] === undefined) errors.push(`codex has extra skill file: ${k}`);
        else if (b[k] === undefined) errors.push(`codex missing skill file: ${k} — run tools/release.mjs`);
        else if (a[k] !== b[k]) errors.push(`skill drift in ${k}: codex differs from claude — run tools/release.mjs`);
    }
    // Every skill has frontmatter with name + description.
    for (const [k, body] of Object.entries(a)) {
        if (!k.endsWith('SKILL.md')) continue;
        if (!/^---[\s\S]*?\bname:\s*\S+[\s\S]*?\bdescription:\s*\S[\s\S]*?---/.test(body)) {
            errors.push(`${claudeSkills}/${k}: missing name/description frontmatter`);
        }
    }
} catch (e) {
    errors.push(`skills: ${e.message}`);
}

// 4. Synced reference docs must match their single source (drift gate).
//    Reference docs are authored once in reference-src/ and copied into each
//    consuming skill by tools/reference-sync.mjs, because a skill can only reach its
//    own folder by relative path. An edited copy is drift, exactly like Codex drift.
try {
    const plan = planReferenceSync(ROOT);
    const expected = new Map(plan.map((p) => [p.dest, p]));
    for (const { src, dest, file, skill } of plan) {
        if (!existsSync(join(ROOT, dest))) {
            errors.push(`reference not synced: ${dest} is missing — run tools/release.mjs --sync-only`);
        } else if (readFileSync(join(ROOT, src), 'utf8') !== readFileSync(join(ROOT, dest), 'utf8')) {
            errors.push(`reference drift in ${dest}: differs from ${REFERENCE_SRC}/${file} (single source for ${skill}) — run tools/release.mjs --sync-only`);
        }
    }
    // A skill carrying a reference the map does not account for is stale or hand-authored.
    for (const { skill, file, path } of listSkillReferenceFiles(ROOT)) {
        if (expected.has(path)) continue;
        if (file in REFERENCE_MAP) {
            errors.push(`stale synced reference: ${path} — '${skill}' is not a consumer of ${file} in tools/reference-sync.mjs`);
        } else if (!existsSync(join(ROOT, REFERENCE_SRC, file))) {
            errors.push(`unmapped reference: ${path} — add ${file} to ${REFERENCE_SRC} and to the map in tools/reference-sync.mjs`);
        }
    }
} catch (e) {
    errors.push(`references: ${e.message}`);
}

// 5. Cross-host body gate. The Codex tree is a byte-exact copy of the Claude tree,
//    and customers install the plugin with nothing else on their machine. So a skill
//    body may not depend on a local runtime, on a shell, on a host-specific variable,
//    or on a browser tool being present. Applies to every shipped file under skills/,
//    reference docs included.
const FORBIDDEN = [
    { re: /\bpython\d*\b/i, why: 'no local runtimes: the platform owns every mechanic that used a script' },
    { re: /\bcurl\b/i, why: 'no shell calls: everything goes through MCP tools' },
    { re: /\bartisan\b/i, why: 'no server-side commands leak into a customer-facing skill' },
    { re: /Workflow\(/, why: 'dynamic workflows do not exist on both hosts' },
    { re: /\$\{CLAUDE_PLUGIN_ROOT\}/, why: 'the plugin-root variable is undocumented for skills on Codex; use relative paths' },
];
// A named browser tool may be encouraged, never required. Flag only requirement language.
const BROWSER_TOOLS = /\b(playwright|puppeteer|selenium|browser_navigate|browser_snapshot|browser_evaluate|webfetch|claude in chrome|chrome devtools mcp)\b/i;
const REQUIREMENT = /\b(require[sd]?|required|must|need(s|ed)?|mandatory|prerequisite)\b/i;
try {
    for (const [rel, body] of Object.entries(listSkillFiles(claudeSkills))) {
        const path = `${claudeSkills}/${rel}`;
        body.split('\n').forEach((line, i) => {
            const at = `${path}:${i + 1}`;
            for (const { re, why } of FORBIDDEN) {
                if (re.test(line)) errors.push(`forbidden in skill body ${at}: /${re.source}/ — ${why}`);
            }
            if (BROWSER_TOOLS.test(line) && REQUIREMENT.test(line)) {
                errors.push(`forbidden in skill body ${at}: a named browser tool stated as a requirement — encourage one, degrade to needs-human-verification when there is none`);
            }
        });
    }
} catch (e) {
    errors.push(`skill bodies: ${e.message}`);
}

if (errors.length) {
    console.error('✗ validation failed:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
}
console.log(`✔ validation passed (metrifi plugin v${cv}, claude + codex in sync)`);
