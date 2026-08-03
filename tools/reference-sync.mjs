#!/usr/bin/env node
// Single-sourced reference docs for the MetriFi plugin skills.
//
// Why this exists: a skill reaches its bundled files by RELATIVE path, because the
// plugin-root variable only resolves on one of the two hosts we ship to. So a
// reference doc that several skills need has to physically exist inside each of
// those skills' `references/` folders. Authoring it N times guarantees drift.
//
// Instead it is authored once under `reference-src/` and copied into each consuming
// skill by the map below. release.mjs runs the copy (before it mirrors Claude ->
// Codex, so the mirror carries the fresh copies); validate.mjs fails CI when a
// copy differs from its source, or when a skill carries a copy the map does not
// account for.
//
// Adding a reference: drop the file in `reference-src/`, list its consumers here,
// then `node tools/release.mjs --sync-only`.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const REFERENCE_SRC = 'plugins/claude/metrifi/reference-src';
export const CLAUDE_SKILLS = 'plugins/claude/metrifi/skills';

// source file in reference-src/  ->  skills that get a copy in their references/
// Entries whose consuming skill does not exist yet are a hard error, not a skip:
// add the mapping in the same change that adds the skill.
export const REFERENCE_MAP = {
    'workflow-overview.md': ['start', 'exp-status', 'exp-sweep', 'exp-research', 'exp-build', 'exp-review', 'exp-deliver', 'exp-revise'],
    'methodology-rules.md': ['exp-research', 'exp-build', 'exp-review', 'exp-revise'],
    // exp-revise gets the rules and all four batteries because it re-runs and re-records every
    // check its own article edit staled, and no skill may invoke another to do that for it.
    'review-hygiene.md': ['exp-review', 'exp-revise'],
    'review-ncua.md': ['exp-review', 'exp-revise'],
    'review-ada.md': ['exp-review', 'exp-revise'],
    'review-fact.md': ['exp-review', 'exp-revise'],
};

/** Every (source, destination) pair the map implies, as repo-relative paths. */
export function planReferenceSync(root) {
    const plan = [];
    for (const [file, skills] of Object.entries(REFERENCE_MAP)) {
        const src = join(REFERENCE_SRC, file);
        if (!existsSync(join(root, src))) throw new Error(`reference-src is missing ${file} (mapped to ${skills.join(', ')})`);
        for (const skill of skills) {
            if (!existsSync(join(root, CLAUDE_SKILLS, skill))) {
                throw new Error(`${file} is mapped to skill '${skill}', which does not exist under ${CLAUDE_SKILLS}`);
            }
            plan.push({ file, skill, src, dest: join(CLAUDE_SKILLS, skill, 'references', file) });
        }
    }
    return plan;
}

/** Copy every mapped reference into its consuming skills. Deterministic; safe to re-run. */
export function syncReferences(root, { dryRun = false, log = () => {} } = {}) {
    const plan = planReferenceSync(root);
    for (const { src, dest } of plan) {
        const body = readFileSync(join(root, src), 'utf8');
        const already = existsSync(join(root, dest)) && readFileSync(join(root, dest), 'utf8') === body;
        log(`  ${already ? 'ok  ' : dryRun ? 'todo' : 'sync'} ${dest}`);
        if (!already && !dryRun) {
            mkdirSync(join(root, dest, '..'), { recursive: true });
            writeFileSync(join(root, dest), body);
        }
    }
    return plan;
}

/** Every `references/*` file physically present under the Claude skills tree. */
export function listSkillReferenceFiles(root) {
    const out = [];
    const skillsDir = join(root, CLAUDE_SKILLS);
    if (!existsSync(skillsDir)) return out;
    for (const skill of readdirSync(skillsDir)) {
        const refDir = join(skillsDir, skill, 'references');
        if (!existsSync(refDir) || !statSync(refDir).isDirectory()) continue;
        for (const file of readdirSync(refDir)) out.push({ skill, file, path: join(CLAUDE_SKILLS, skill, 'references', file) });
    }
    return out;
}
