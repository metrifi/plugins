#!/usr/bin/env node
// Checks the per-tool annotation justifications we submit to OpenAI against the platform's
// MCP surface lock. OpenAI reads each justification against the hint value and the tool's
// behaviour, so a sentence that contradicts its own value is a rejection.
//
// Usage:
//   node tools/check-justifications.mjs <surface.lock.json> [--doc <md>] [--json <file>] [--partial]
//
// With no --doc or --json it checks docs/openai-tool-justifications.md. --json checks an array of
// {name,title,readOnly:{value,justification},destructive,idempotent,openWorld} instead.
// --partial allows a subset of tools (for drafting); unknown tools still fail.
//
// Fails when: the tool set differs from the lock's tools without a visibility tag; a value
// differs from the lock; a justification is empty, over 500 characters, or carries an em dash,
// a file path, `::` or a code identifier; or the text contradicts the value (see RULES).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const flag = (f) => {
    const i = args.indexOf(f);
    return i === -1 ? null : args[i + 1];
};
const lockPath = args[0];
if (!lockPath || lockPath.startsWith('--')) {
    console.error('usage: node tools/check-justifications.mjs <surface.lock.json> [--doc <md>] [--json <file>] [--partial]');
    process.exit(2);
}
const partial = args.includes('--partial');

const HINTS = [
    { key: 'readOnly', lock: 'readOnlyHint', label: 'Read Only' },
    { key: 'openWorld', lock: 'openWorldHint', label: 'Open World' },
    { key: 'destructive', lock: 'destructiveHint', label: 'Destructive' },
    { key: 'idempotent', lock: 'idempotentHint', label: 'Idempotent' },
];

const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
const lockTools = lock.tools.filter((t) => !t.visibility);

function loadJson(path) {
    return JSON.parse(readFileSync(path, 'utf8'));
}

function loadDoc(path) {
    const text = readFileSync(path, 'utf8');
    const out = [];
    let cur = null;
    for (const line of text.split('\n')) {
        const h = line.match(/^## (\S+)\s*$/);
        if (h) {
            cur = { name: h[1] };
            out.push(cur);
            continue;
        }
        const m = line.match(/^- \*\*(Read Only|Open World|Destructive|Idempotent): (true|false)\*\* (.*)$/);
        if (m && cur) {
            const hint = HINTS.find((x) => x.label === m[1]);
            if (cur[hint.key]) cur.duplicate = hint.label;
            cur[hint.key] = { value: m[2] === 'true', justification: m[3].trim() };
        }
    }
    return out;
}

const jsonPath = flag('--json');
const docPath = flag('--doc') ?? join(ROOT, 'docs/openai-tool-justifications.md');
const entries = jsonPath ? loadJson(jsonPath) : loadDoc(docPath);
const source = jsonPath ?? docPath;

const errors = [];
const err = (name, msg) => errors.push(`${name}: ${msg}`);

// Tool set and order.
const lockNames = lockTools.map((t) => t.name);
const names = entries.map((e) => e.name);
for (const n of names) if (!lockNames.includes(n)) err(n, 'not a non-staff tool in the lock');
if (new Set(names).size !== names.length) errors.push('duplicate tool sections');
if (!partial) {
    for (const n of lockNames) if (!names.includes(n)) err(n, 'missing');
    if (names.join() !== lockNames.join() && names.length === lockNames.length) errors.push('tools are not in lock order');
}

// Words that negate a keyword when they appear in the same sentence.
const NEGATION = /\b(no|not|nothing|never|none|neither|nor|without|cannot|nobody|no one)\b|n't\b/i;

const RULES = [
    {
        key: 'openWorld',
        when: false,
        what: 'says it reaches outside the team',
        re: /\b(client|clients|client's|email|emails|emailed|recipients?|public|publicly|external|another customer|other customers?|GitHub|Vercel|Google|OpenAI|DataForSEO)\b/i,
    },
    { key: 'destructive', when: false, what: 'says it sends, deletes or overwrites', re: /\b(sends?|sent|emails|emailed|deletes?|deleted|overwrites?|overwritten)\b/i },
    { key: 'idempotent', when: true, what: 'says a repeat does more', re: /\b(each|every) call\b|\bagain creates?\b|\bcreates?\b[^.]*\bagain\b/i },
    { key: 'readOnly', when: true, what: 'says it writes', re: /\b(writes?|wrote|creates?|created|updates?|updated|deletes?|deleted|sends?|sent|saves?|saved)\b/i },
];

// Proper nouns that look like code identifiers but are names.
const NAME_ALLOW = new Set(['MetriFi', 'GitHub', 'OpenAI', 'DataForSEO', 'ChatGPT', 'LinkedIn', 'YouTube', 'WordPress', 'PageSpeed', 'JavaScript', 'TypeScript', 'ClaudeBot', 'GPTBot', 'OAI-SearchBot', 'PerplexityBot']);

const sentences = (t) => t.split(/(?<=[.!?])\s+/).filter(Boolean);

for (const e of entries) {
    const lt = lockTools.find((t) => t.name === e.name);
    if (!lt) continue;
    if (e.duplicate) err(e.name, `${e.duplicate} appears twice`);
    if (jsonPath && e.title !== lt.title) err(e.name, `title "${e.title}" differs from lock "${lt.title}"`);
    for (const h of HINTS) {
        const j = e[h.key];
        if (!j) {
            err(e.name, `${h.label} missing`);
            continue;
        }
        if (j.value !== lt[h.lock]) err(e.name, `${h.label} is ${j.value}, lock says ${lt[h.lock]}`);
        const t = (j.justification ?? '').trim();
        if (!t) {
            err(e.name, `${h.label} justification empty`);
            continue;
        }
        if (t.length > 500) err(e.name, `${h.label} justification is ${t.length} chars (max 500)`);
        if (t.includes('—')) err(e.name, `${h.label} contains an em dash`);
        if (t.includes('::')) err(e.name, `${h.label} contains "::"`);
        if (/\b(app|routes|config|resources|tests|database|src|docs|plugins)\/\S+/.test(t) || /\b[\w-]+\.(php|json|mjs|js|ts|tsx|css|md|astro|html|ya?ml)\b/i.test(t))
            err(e.name, `${h.label} contains a file path`);
        if (/\w\(\)/.test(t) || /\b[a-z]+_[a-z0-9_]+\b/.test(t)) err(e.name, `${h.label} contains a code identifier`);
        for (const w of t.match(/\b[A-Za-z]*[a-z][A-Z][A-Za-z-]*\b/g) ?? []) if (!NAME_ALLOW.has(w)) err(e.name, `${h.label} contains identifier-like "${w}"`);
        for (const r of RULES) {
            if (r.key !== h.key || j.value !== r.when) continue;
            for (const s of sentences(t)) {
                const m = s.match(r.re);
                if (m && !NEGATION.test(s)) err(e.name, `${h.label} is ${r.when} but ${r.what} ("${m[0]}"): ${s}`);
            }
        }
    }
}

if (errors.length) {
    console.error(`FAIL ${source}: ${errors.length} problem(s)`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
}
console.log(`OK ${source}: ${entries.length} tools, ${entries.length * 4} justifications match surface ${lock.surfaceVersion}${partial ? ' (partial)' : ''}`);
