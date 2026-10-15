# Review battery: hygiene

The first of the four pre-publish checks. It catches the mechanical problems (AI tells, typography,
markdown integrity, spelling, link and table and image handling) so the three heavier batteries
work on a clean article.

This is a **judgment** battery. Nothing here is a script and nothing here writes a file. You read
the article, you form findings, and you record the result with `record-deliverable-check`.

## What the platform already checks, so you do not have to

`build-deliverable` runs a deterministic contract before it will save a version: em dashes in
client-facing copy, anchor quotes that must resolve to an exact substring of the article, legal
enum values, and shape validation on every block. A build that violates any of those refuses and
names the reason.

Your job is everything a regular expression cannot judge: whether the prose reads like a person
wrote it, whether a word is actually misspelled or is a proper noun, whether the markdown means what
it looks like it means.

## The taxonomy

### H1. AI tells: blocker

Long dashes anywhere in body text are the loudest one, and the build already refuses on those in
client copy. Catch them in the article markdown before the build does, and catch the rest, which the
build cannot see:

- **Em dash, en dash, figure dash, horizontal bar** and their full-width cousins. Propose two or
  three replacements per instance and let the human pick, because the choice changes meaning: a
  semicolon, a comma, a colon when the dash introduces a clause, parentheses for an aside, or a
  sentence split. A numeric range becomes "5 to 10"; a day range becomes "Monday through Friday".
  Never auto-apply a replacement.
- **Hedged tricolons and stock transitions.** "It is not just X, it is Y." "In today's fast-paced
  landscape." "Whether you are a first-time buyer or a seasoned investor." These read as generated
  to the reader whose trust is the product.
- **Empty intensifiers stacked on empty nouns.** "Truly comprehensive solutions", "robust suite of
  offerings". Rule 14 is the antidote: concrete, quantitative, substantiable.

Dashes inside fenced code or inline code are skipped. Dashes inside a block quotation drop to
**minor** with a note that the quote may be verbatim from a source the author cannot rewrite.

### H2. Hyphen overuse: minor

A hyphen is fine in moderation. Overuse reads lazy and is itself a tell.

- Any sentence with three or more hyphens.
- Any paragraph where hyphens exceed two percent of the word count and the paragraph has at least
  three hyphens in body text. Strip URLs before counting: hyphens inside a URL are not typography.
- Any single token with two or more internal hyphens ("first-time-homebuyer-loan"), with a
  suggestion to break the compound.

Established financial compounds are not overuse: first-time, long-term, short-term, co-op,
not-for-profit, fixed-rate, adjustable-rate, interest-only, owner-occupied, and the like. This is
exactly where a mechanical checker produces false positives and your judgment does not.

### H3. Spelling: blocker or minor

- A high-confidence misspelling, meaning a common word one edit away with an obvious correction, is
  a **blocker** with the correction in `suggested_fix`.
- A word you cannot place, most often a proper noun, a product name, or a local place name, is a
  **minor** with "verify spelling, possibly a proper noun".

Skip code blocks, inline code, URLs, and image paths. Financial terms of art are not misspellings:
APY, APR, HELOC, NCUA, escrow, amortization, CLTV, HMDA, and the client's own product names as the
client's site spells them.

### H4. Markdown integrity: blocker or minor

**Blocker:** an unclosed fenced code block, mismatched emphasis, a table whose body rows do not
match the header's column count, a heading with no space after the hash marks, broken link syntax, a
reference link whose definition is missing.

**Minor:** a skipped heading level (H1 straight to H3, which the accessibility battery also flags),
more than one H1, mixed quote styles in one document.

### H5. Links, tables, and images: blocker or minor

The article is markdown; the client page renders it. What you are checking is that the source will
render correctly and courteously.

- **Blocker:** an image with no alt attribute. An empty alt is fine and means decorative.
- **Blocker:** a link whose target is a placeholder, a dead internal path, or a URL you invented
  rather than read off the client's site. Rule 19 is explicit: pull the real URL.
- **Minor:** a table with no header row. A raw HTML tag embedded in the markdown, which usually
  means something bypassed the renderer.

### H6. Whitespace and structure: note

Trailing whitespace, three or more consecutive blank lines, mixed bullet characters, inconsistent
list indentation. Report them, never block on them.

## Severity scale

Every battery in this set uses one scale, and it is the scale `record-deliverable-check` stores in
each finding's `severity`:

| severity | meaning | effect |
|---|---|---|
| `blocker` | must be fixed before this ships | forces `result: "fail"` |
| `major` | something required is absent, or a real problem that is not literally unpublishable | judgment: usually fix first |
| `minor` | a gray area needing a human call | fix or disposition with a reason |
| `note` | best practice, optional | never blocks |

**One blocker means `result: "fail"`.** No blockers means `result: "pass"`, even with a page of
minors, as long as every minor is dispositioned in the report.

## Report shape

Write the full report as an experiment document, then record the verdict.

1. `set-experiment-document` with `kind: "review-hygiene"`, a title the client will read as a
   dossier section label, and this body:

   - **Summary:** counts by severity, and the recommendation in one line.
   - **Findings:** grouped by severity, blockers first. Each finding carries the exact quoted
     passage, its location (section or heading), the rule ID from the taxonomy above, why it is a
     problem, and the suggested fix. For a long dash, list the two or three candidate replacements
     rather than choosing one.
   - **Dispositioned minors:** each minor you are not fixing, with the reason it stands.
   - **Sign-off:** the human reviewer line. This battery is assistive; a person signs off.

2. `record-deliverable-check` with `type: "hygiene"`, the `result`, a one-line `summary` for the
   checks tab, the `findings` array, the `verifications` array, `document_kind: "review-hygiene"` so
   the tab links to the full report, and `recorder` naming yourself as the agent.

   **This battery's verification rows are the H1 to H6 sub-checks you performed**, one row each:
   H1 AI tells, H2 typography and dashes, H3 spelling and proper nouns, H4 markdown and structure,
   H5 links and tables and images, H6 whitespace. `source` is the battery step ("battery H2") or the
   part of the article you swept. A sub-check with nothing to check is `n/a` with the reason in
   `note`. Record only the sub-checks you actually walked.

The check is pinned to the article it ran against. If the article changes afterward the check goes
stale and has to be re-run, which is the point: a revision cannot ride a green check from an older
draft.
