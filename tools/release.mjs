#!/usr/bin/env node
// One-command release for the MetriFi plugin. Kills the two recurring footguns:
//   1. Skill drift — the Codex plugin's skills are regenerated from the Claude
//      plugin's skills every release, so they can never diverge.
//   2. Forgotten version bump — the version is bumped automatically, in both
//      plugin manifests, so installed clients actually receive the update
//      (Claude Code only pulls a new version when this field changes).
//
// Usage:
//   node tools/release.mjs --notes "what changed"          # patch bump (default)
//   node tools/release.mjs --minor --notes "..."           # minor bump
//   node tools/release.mjs --set 2.0.0 --notes "..."       # explicit version
//   node tools/release.mjs --notes "..." --dry-run         # show, don't write/commit
//   node tools/release.mjs --notes "..." --no-push         # commit + tag, don't push
import { readFileSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => {
    const i = args.indexOf(f);
    return i >= 0 ? args[i + 1] : undefined;
};
const DRY = has('--dry-run');
const NOTES = val('--notes') || '(describe changes)';

const CLAUDE_MANIFEST = 'plugins/claude/metrifi/.claude-plugin/plugin.json';
const CODEX_MANIFEST = 'plugins/codex/metrifi/.codex-plugin/plugin.json';
const CLAUDE_SKILLS = 'plugins/claude/metrifi/skills';
const CODEX_SKILLS = 'plugins/codex/metrifi/skills';
const rd = (p) => readFileSync(join(ROOT, p), 'utf8');
const wj = (p, o) => writeFileSync(join(ROOT, p), JSON.stringify(o, null, 2) + '\n');

// 1. Regenerate Codex skills from Claude skills (Claude is the single source).
console.log('• syncing Codex skills from Claude skills');
if (!DRY) {
    rmSync(join(ROOT, CODEX_SKILLS), { recursive: true, force: true });
    cpSync(join(ROOT, CLAUDE_SKILLS), join(ROOT, CODEX_SKILLS), { recursive: true });
}

// 2. Compute the next version.
const cur = JSON.parse(rd(CLAUDE_MANIFEST)).version;
let next = val('--set');
if (!next) {
    const [maj, min, pat] = cur.split('.').map(Number);
    if (has('--major')) next = `${maj + 1}.0.0`;
    else if (has('--minor')) next = `${maj}.${min + 1}.0`;
    else next = `${maj}.${min}.${pat + 1}`;
}
if (!/^\d+\.\d+\.\d+$/.test(next)) {
    console.error(`✗ bad version: ${next}`);
    process.exit(1);
}
console.log(`• version ${cur} -> ${next}`);

// 3. Write the version into both manifests.
if (!DRY) {
    for (const m of [CLAUDE_MANIFEST, CODEX_MANIFEST]) {
        const o = JSON.parse(rd(m));
        o.version = next;
        wj(m, o);
    }
}

// 4. Prepend a CHANGELOG entry (date passed via env for reproducibility; else today).
const date = process.env.RELEASE_DATE || new Date().toISOString().slice(0, 10);
const entry = `## ${next} — ${date}\n\n${NOTES.split('\n').map((l) => (l.startsWith('-') ? l : `- ${l}`)).join('\n')}\n\n`;
if (!DRY && existsSync(join(ROOT, 'CHANGELOG.md'))) {
    const cl = rd('CHANGELOG.md');
    const marker = cl.indexOf('\n## ');
    writeFileSync(
        join(ROOT, 'CHANGELOG.md'),
        marker >= 0 ? cl.slice(0, marker + 1) + entry + cl.slice(marker + 1) : cl + '\n' + entry,
    );
}

// 5. Validate the artifact.
console.log('• validating');
execSync(`node ${join(ROOT, 'tools/validate.mjs')}`, { stdio: 'inherit' });

if (DRY) {
    console.log(`\n(dry run) would release v${next} with notes: "${NOTES}"`);
    process.exit(0);
}

// 6. Commit, tag, push.
const sh = (c) => execSync(c, { cwd: ROOT, stdio: 'inherit' });
sh('git add -A');
sh(`git commit -m "Release v${next}: ${NOTES.split('\n')[0]}"`);
sh(`git tag v${next}`);
if (!has('--no-push')) {
    sh('git push');
    sh('git push --tags');
    console.log(`\n✔ released v${next} — clients on autoUpdate pull it at next launch.`);
} else {
    console.log(`\n✔ committed + tagged v${next} (not pushed).`);
}
