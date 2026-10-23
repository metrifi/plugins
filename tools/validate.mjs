#!/usr/bin/env node
// Structural validation for the MetriFi plugin release artifact. Runs without the
// Claude Code CLI so it works in CI. Checks: manifests parse and carry a version;
// the Claude and Codex versions agree (while Codex is frozen, Claude may run ahead
// but never behind); the Codex skills mirror the Claude skills byte for byte except
// for the Claude-only differences listed in tools/hosts.json, and every listed
// difference still exists; while Codex is frozen, nothing under its frozen paths has
// changed since the freeze commit; each skill's synced reference docs match their
// single source in reference-src/; and no skill body carries anything that only works
// on one host or on one machine.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { planReferenceSync, listSkillReferenceFiles, REFERENCE_SRC, REFERENCE_MAP } from './reference-sync.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const errors = [];
const j = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
let hosts;
try {
    hosts = j('tools/hosts.json');
} catch (e) {
    console.error(`✗ validation failed:\n  - tools/hosts.json: ${e.message}`);
    process.exit(1);
}
// The Codex freeze is pinned here, not only in tools/hosts.json, so editing hosts.json
// (setting frozen: false, moving the tag, dropping a path) can't switch the gate off;
// hosts.json must agree with this pin or validation fails. Lifting the freeze after
// OpenAI decides is a deliberate change to this file: set CODEX_FREEZE to null and set
// codex.frozen to false in hosts.json in the same commit.
const CODEX_FREEZE = {
    tag: 'v1.4.18',
    commit: '6ef4817f604aa558c95f473dc70f730cb0af510e',
    paths: ['plugins/codex', 'openai', '.agents', 'docs/openai-tool-justifications.md'],
};
const FROZEN = CODEX_FREEZE !== null;

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
const semver = (v) => v.split('.').map(Number);
const cmp = (a, b) => {
    const [x, y] = [semver(a), semver(b)];
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
    return 0;
};
if (cv && xv && /^\d+\.\d+\.\d+$/.test(xv)) {
    if (FROZEN && cmp(cv, xv) < 0) errors.push(`version: claude ${cv} is behind frozen codex ${xv}; Claude may run ahead of Codex, never behind`);
    if (!FROZEN && cv !== xv) errors.push(`version mismatch: claude ${cv} vs codex ${xv} — run tools/release.mjs`);
} else if (xv !== undefined) {
    errors.push(`${codexManifest}: version must be x.y.z (got ${xv})`);
}

// 3. Codex skills mirror Claude skills exactly, except the Claude-only differences
//    tools/hosts.json lists. An unlisted difference fails, and so does a listed one
//    that no longer differs, so the allowlist can never outlive the drift it explains.
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
    const excluded = (hosts.claudeOnly?.excludedSkills || []).map((e) => e.skill);
    const divergent = new Set((hosts.claudeOnly?.divergentFiles || []).flatMap((e) => e.paths));
    const skillOf = (k) => k.split('/')[0];
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
        if (excluded.includes(skillOf(k))) continue;
        if (a[k] === undefined) errors.push(`codex has extra skill file: ${k}`);
        else if (b[k] === undefined) errors.push(`codex missing skill file: ${k} — run tools/release.mjs`);
        else if (a[k] !== b[k] && !divergent.has(k)) errors.push(`skill drift in ${k}: codex differs from claude and tools/hosts.json does not list it`);
    }
    for (const skill of excluded) {
        const inClaude = Object.keys(a).some((k) => skillOf(k) === skill);
        const inCodex = Object.keys(b).some((k) => skillOf(k) === skill);
        if (inClaude) errors.push(`stale allowlist entry: ${skill} is listed as excluded from Claude in tools/hosts.json but ${claudeSkills}/${skill} exists`);
        if (!inCodex) errors.push(`stale allowlist entry: ${skill} is listed as excluded from Claude in tools/hosts.json but is not in ${codexSkills}`);
    }
    for (const k of divergent) {
        if (a[k] === undefined || b[k] === undefined) errors.push(`stale allowlist entry: ${k} in tools/hosts.json is missing from ${a[k] === undefined ? 'claude' : 'codex'}`);
        else if (a[k] === b[k]) errors.push(`stale allowlist entry: ${k} in tools/hosts.json no longer differs between claude and codex; remove it`);
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

// 6. Codex freeze gate. While OpenAI reviews a Codex package, nothing under the frozen
//    paths may change. The pinned tag must resolve to the pinned commit, and every
//    git call must exit 0: a missing tag, a moved tag, a shallow clone without the
//    commit, or any git error fails here instead of passing silently. The gate runs on
//    CODEX_FREEZE above; tools/hosts.json only has to agree with it.
if (FROZEN) {
    const { tag, commit, paths } = CODEX_FREEZE;
    const h = hosts.codex || {};
    const samePaths = Array.isArray(h.paths) && h.paths.length === paths.length && paths.every((p) => h.paths.includes(p));
    if (h.frozen !== true || h.frozenAt?.tag !== tag || h.frozenAt?.commit !== commit || !samePaths) {
        errors.push(`freeze gate: tools/hosts.json codex block disagrees with the pin in tools/validate.mjs (frozen: true, ${tag}, ${commit}, paths ${paths.join(', ')}). Lifting the freeze is a change to validate.mjs, not to hosts.json`);
    }
    const git = (...a) => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' });
    const why = (r) => (r.error ? r.error.message : (r.stderr || '').trim() || `exit ${r.status}`);
    const t = git('rev-parse', '--verify', '--quiet', `refs/tags/${tag}^{commit}`);
    if (t.status !== 0) {
        errors.push(`freeze gate: tag ${tag} is missing (${why(t)}). Fetch tags (git fetch --tags origin) and run again`);
    } else if (t.stdout.trim() !== commit) {
        errors.push(`freeze gate: tag ${tag} resolves to ${t.stdout.trim()}, not the pinned ${commit}. The tag moved; do not repoint it`);
    } else {
        const d = git('diff', '--name-only', commit, '--', ...paths);
        if (d.status !== 0) errors.push(`freeze gate: git diff against ${tag} failed (${why(d)})`);
        else if (d.stdout.trim()) {
            errors.push(`freeze gate: Codex is frozen at ${tag} (${hosts.codex?.reason || 'OpenAI review open'}) but these changed:\n` + d.stdout.trim().split('\n').map((f) => '      ' + f).join('\n'));
        }
        const u = git('ls-files', '--others', '--exclude-standard', '--', ...paths);
        if (u.status !== 0) errors.push(`freeze gate: git ls-files failed (${why(u)})`);
        else if (u.stdout.trim()) {
            errors.push(`freeze gate: untracked files under frozen paths:\n` + u.stdout.trim().split('\n').map((f) => '      ' + f).join('\n'));
        }
    }
}

if (errors.length) {
    console.error('✗ validation failed:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
}
console.log(
    FROZEN
        ? `✔ validation passed (claude v${cv}, codex v${xv} frozen at ${CODEX_FREEZE.tag} and unchanged; Claude-only differences match tools/hosts.json)`
        : `✔ validation passed (metrifi plugin v${cv}, claude + codex in sync)`,
);
