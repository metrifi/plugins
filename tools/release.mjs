#!/usr/bin/env node
// One-command release for the MetriFi plugin. Kills the two recurring footguns:
//   1. Skill drift — in a joint release (--host all) the Codex plugin's skills are
//      replaced with a copy of the Claude plugin's skills. That copy would erase the
//      Claude-only differences tools/hosts.json lists (and the two skills only Codex
//      keeps), so --host all is refused until those lists are reconciled and empty.
//   2. Forgotten version bump — the version is bumped automatically, so installed
//      clients actually receive the update (Claude Code only pulls a new version
//      when this field changes).
//
// Two modes. While tools/hosts.json marks Codex frozen (an OpenAI review is open),
// the default is --host claude: it never writes under plugins/codex, bumps only the
// Claude manifest, stages explicit Claude paths, and refuses to run if anything under
// the frozen Codex paths is dirty. --host all is the joint release and is refused
// while Codex is frozen.
//
// Usage:
//   node tools/release.mjs --sync-only                     # references (+ Codex mirror in --host all) + validate; no version, no commit
//   node tools/release.mjs --notes "what changed"          # patch bump (default)
//   node tools/release.mjs --minor --notes "..."           # minor bump
//   node tools/release.mjs --set 2.0.0 --notes "..."       # explicit version
//   node tools/release.mjs --notes "..." --dry-run         # show, don't write/commit
//   node tools/release.mjs --notes "..." --no-push         # commit + tag, don't push
//   node tools/release.mjs --host claude|all ...           # default: claude while Codex is frozen, else all
import { readFileSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { execSync, execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { syncReferences } from './reference-sync.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => {
    const i = args.indexOf(f);
    return i >= 0 ? args[i + 1] : undefined;
};
const DRY = has('--dry-run');
const SYNC_ONLY = has('--sync-only');
const NOTES = val('--notes') || '(describe changes)';

const CLAUDE_MANIFEST = 'plugins/claude/metrifi/.claude-plugin/plugin.json';
const CODEX_MANIFEST = 'plugins/codex/metrifi/.codex-plugin/plugin.json';
const CLAUDE_SKILLS = 'plugins/claude/metrifi/skills';
const CODEX_SKILLS = 'plugins/codex/metrifi/skills';
const rd = (p) => readFileSync(join(ROOT, p), 'utf8');
const wj = (p, o) => writeFileSync(join(ROOT, p), JSON.stringify(o, null, 2) + '\n');

const hosts = JSON.parse(rd('tools/hosts.json'));
const FROZEN = hosts.codex?.frozen === true;
const HOST = val('--host') || (FROZEN ? 'claude' : 'all');
if (!['claude', 'all'].includes(HOST)) {
    console.error(`✗ --host must be claude or all (got ${HOST})`);
    process.exit(1);
}
if (HOST === 'all' && FROZEN) {
    console.error(`✗ Codex is frozen at ${hosts.codex.frozenAt?.tag} (${hosts.codex.reason}). A joint release would rewrite it; unfreeze tools/hosts.json first, after OpenAI decides.`);
    process.exit(1);
}
// Outside a freeze, validate requires matching versions, so a Claude-only bump would
// write the manifest and CHANGELOG and then fail at the validate step. Refuse up front.
if (HOST === 'claude' && !FROZEN) {
    console.error('✗ --host claude is only for while Codex is frozen; Codex is not frozen, so run a joint release (--host all).');
    process.exit(1);
}
// Claude-only mode never touches the frozen paths, and refuses to start, or to commit,
// while any of them is dirty, so a stray Codex edit can't ride along.
const claudeOnly = [...(hosts.claudeOnly?.excludedSkills || []), ...(hosts.claudeOnly?.divergentFiles || [])];
if (HOST === 'all' && claudeOnly.length) {
    console.error('✗ tools/hosts.json still lists Claude-only differences. A joint release copies Claude over Codex and would erase them, including the skills only Codex keeps. Decide for each entry whether to port it to Codex or keep it, then empty the lists, before --host all.');
    process.exit(1);
}
const FROZEN_PATHS = hosts.codex?.paths || [];
const assertCodexClean = () => {
    if (HOST !== 'claude') return;
    const r = spawnSync('git', ['status', '--porcelain', '--', ...FROZEN_PATHS], { cwd: ROOT, encoding: 'utf8' });
    if (r.status !== 0) {
        console.error(`✗ git status failed: ${(r.stderr || '').trim() || r.error?.message}`);
        process.exit(1);
    }
    if (r.stdout.trim()) {
        console.error(`✗ Claude-only release, but frozen Codex/OpenAI paths are dirty:\n${r.stdout}Revert them first (git checkout -- <path>, or remove untracked files).`);
        process.exit(1);
    }
};
console.log(`• host: ${HOST}${FROZEN ? ` (Codex frozen at ${hosts.codex.frozenAt?.tag})` : ''}`);
assertCodexClean();

// 1. Sync single-sourced reference docs into each consuming skill's references/
//    folder. Must run BEFORE the Codex mirror so the mirror carries fresh copies.
console.log('• syncing reference docs into consuming skills');
syncReferences(ROOT, { dryRun: DRY, log: (m) => console.log(m) });

// 2. Regenerate Codex skills from Claude skills (Claude is the single source).
//    Joint releases only: in Claude-only mode the Codex tree is never written.
if (HOST === 'all') {
    console.log('• syncing Codex skills from Claude skills');
    if (!DRY) {
        rmSync(join(ROOT, CODEX_SKILLS), { recursive: true, force: true });
        cpSync(join(ROOT, CLAUDE_SKILLS), join(ROOT, CODEX_SKILLS), { recursive: true });
    }
} else {
    console.log('• skipping the Codex mirror (Claude-only release)');
}

// --sync-only stops here. The steps above are deterministic file copies, so they are
// safe to run any time, on any branch. Everything below bumps the version and
// publishes to two marketplaces, which is a one-way door and is Ryan-gated.
if (SYNC_ONLY) {
    console.log('• validating');
    execSync(`node ${join(ROOT, 'tools/validate.mjs')}`, { stdio: 'inherit' });
    console.log('\n✔ synced (no version bump, nothing committed).');
    process.exit(0);
}

// 3. Compute the next version. Claude can run ahead of a frozen Codex, so start from
//    the higher of the two; the next joint release then lands above both.
const higher = (a, b) => {
    const [x, y] = [a, b].map((v) => v.split('.').map(Number));
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i] ? a : b;
    return a;
};
const cur = higher(JSON.parse(rd(CLAUDE_MANIFEST)).version, JSON.parse(rd(CODEX_MANIFEST)).version);
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

// 4. Write the version into the manifests this release ships.
if (!DRY) {
    for (const m of HOST === 'all' ? [CLAUDE_MANIFEST, CODEX_MANIFEST] : [CLAUDE_MANIFEST]) {
        const o = JSON.parse(rd(m));
        o.version = next;
        wj(m, o);
    }
}

// 5. Prepend a CHANGELOG entry (date passed via env for reproducibility; else today).
const date = process.env.RELEASE_DATE || new Date().toISOString().slice(0, 10);
const entry = `## ${next}${HOST === 'claude' ? ' (Claude only)' : ''} — ${date}\n\n${NOTES.split('\n').map((l) => (l.startsWith('-') ? l : `- ${l}`)).join('\n')}\n\n`;
if (!DRY && existsSync(join(ROOT, 'CHANGELOG.md'))) {
    const cl = rd('CHANGELOG.md');
    const marker = cl.indexOf('\n## ');
    writeFileSync(
        join(ROOT, 'CHANGELOG.md'),
        marker >= 0 ? cl.slice(0, marker + 1) + entry + cl.slice(marker + 1) : cl + '\n' + entry,
    );
}

// 6. Validate the artifact.
console.log('• validating');
execSync(`node ${join(ROOT, 'tools/validate.mjs')}`, { stdio: 'inherit' });

if (DRY) {
    console.log(`\n(dry run) would release v${next} with notes: "${NOTES}"`);
    process.exit(0);
}

// 7. Commit, tag, push. Claude-only releases stage explicit Claude paths, never -A,
//    and check the frozen paths once more right before committing.
const sh = (c) => execSync(c, { cwd: ROOT, stdio: 'inherit' });
const git = (...a) => execFileSync('git', a, { cwd: ROOT, stdio: 'inherit' });
if (HOST === 'claude') {
    assertCodexClean();
    const CLAUDE_PATHS = ['plugins/claude', '.claude-plugin/marketplace.json', 'CHANGELOG.md'];
    git('add', '--', ...CLAUDE_PATHS);
    // The pathspec makes git commit only these paths, whatever else is staged.
    git('commit', '-m', `Release v${next} (Claude only): ${NOTES.split('\n')[0]}`, '--', ...CLAUDE_PATHS);
    git('tag', `v${next}`);
} else {
    sh('git add -A');
    sh(`git commit -m "Release v${next}: ${NOTES.split('\n')[0]}"`);
    sh(`git tag v${next}`);
}
if (!has('--no-push')) {
    sh('git push');
    sh('git push --tags');
    console.log(`\n✔ released v${next} — clients on autoUpdate pull it at next launch.`);
} else {
    console.log(`\n✔ committed + tagged v${next} (not pushed).`);
}
