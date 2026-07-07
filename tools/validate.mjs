#!/usr/bin/env node
// Structural validation for the MetriFi plugin release artifact. Runs without the
// Claude Code CLI so it works in CI. Checks: manifests parse and carry a version;
// the Claude and Codex plugins declare the same version; and the Codex skills are a
// byte-for-byte mirror of the Claude skills (they must never drift).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

if (errors.length) {
    console.error('✗ validation failed:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
}
console.log(`✔ validation passed (metrifi plugin v${cv}, claude + codex in sync)`);
