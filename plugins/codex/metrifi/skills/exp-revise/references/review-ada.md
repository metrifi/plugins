# Review battery: accessibility

Audits the article against WCAG 2.1 AA at the **content level** and produces a prioritized findings
list with criterion citations and concrete fixes.

**Assistive, not authoritative.** Full conformance is verified on the rendered page: contrast,
keyboard navigation, focus order, screen-reader behavior. This battery catches what is visible in
the article before it lands on a page, and it always emits a deferred list of the page-level checks
that still have to happen downstream. Emit that list even when the article is clean, because it is a
task somebody has to schedule.

If the article is very short, under roughly 150 words, run the battery anyway. The reading-level
numbers get noisy on short text, so say so in the report rather than reporting them straight.

## Content-level checks

### Heading hierarchy (1.3.1, 2.4.2)

Exactly one H1. No skipped levels: H1 straight to H3 is a `blocker`. Missing H1 is a `blocker`.
Generic headings ("Section 1", "Introduction", "More info") are `minor` under 2.4.6, because a
heading should describe its section for someone navigating by headings alone.

Bold paragraphs are not headings. If a line is acting as a heading, it has to be one.

### Link purpose (2.4.4)

Every link's anchor text should describe its destination. "Click here", "read more", "learn more",
"this link", and a bare URL as anchor text are `blocker`. The fix is always the same shape: move the
description into the anchor. "Read more" becomes "read our first-time homebuyer guide".

### Image alt text (1.1.1, 1.4.5)

An image with no alt attribute is a `blocker`. An explicitly empty alt is an intentional decorative
marker and passes, though the report notes the count so a reviewer can spot-check.

Alt text that reads like a long sentence or a quotation, roughly eight or more words ending in
punctuation, is a `minor` under 1.4.5: it usually means an image of text, which should be real text
instead.

### List and table semantics (1.3.1)

A table with no header row is a `blocker`; screen readers use the header to announce each cell's
meaning. A paragraph that looks like a list (bullet glyphs typed in, or "Item 1:", "Step 2:") but is
not a real markdown list is a `minor`.

### Use of color (1.4.1)

Information carried by color alone is invisible to color-blind readers and to screen readers.
"Click the green button", "items in red are recommended", "see the highlighted section" are
`blocker`. Color paired with another cue ("the red Delete button") is fine.

### Meaningful sequence and spatial language (1.3.2)

Reading order has to make sense linearly. "The box on the left", "see the table to the right", "as
shown below" fail once content is linearized or reflowed on a phone. `blocker`, with the fix being a
name instead of a position: "the eligibility table".

### Reading level (3.1.5)

Estimate the grade level of the prose and name the metric you used. The target is grade 9 for
general consumer content, grade 8 for retail-banking explainers, grade 10 for regulatory copy. Over
target is a `minor`, never a blocker: financial content carries unavoidable terms of art like APR,
APY, and escrow.

Do not report a number alone. Surface the three hardest sentences and say what makes each hard,
which is nearly always a structural problem: a sentence carrying three clauses, a definition folded
into a subordinate clause, or a term of art used before it is defined. That gives the writer
somewhere to start.

### Paragraph and section density (2.4.10)

A paragraph over about 100 words is a `note`. A run of content under one heading exceeding about
300 words with no sub-heading is a `note`. Both are cognitive-accessibility best practice rather
than an AA requirement.

### Consistent identification (3.2.4) and language of parts (3.1.2)

Referring to the same product three ways ("Premier Saver", "the Saver account", "our savings
product") creates real cognitive load. `note`. A phrase in another language that is not marked as
such is a `note` too; marking it is usually a page-level fix.

## Page-level checks: always deferred, always listed

These cannot be judged from the article, and the report lists them every time as findings with
severity `note` and the word "deferred" in the issue text, so they land on the rendered-page
checklist instead of being silently dropped:

- **1.4.3 Contrast.** Depends on the rendered styles.
- **2.1.1, 2.4.3, 2.4.7 Keyboard navigation, focus order, focus visible.** Depend on the rendered
  page.
- **1.3.2 Screen-reader announcement order.** Depends on the page's source order.
- **3.3.2 Form labels and error states.** Depends on the rendered forms.
- **3.1.1 Page language declaration.** Depends on the page's language attribute.

Recommend a rendered-page audit with whatever accessibility auditing tool the team already uses.

## Severity scale

The same scale as every battery:

| severity | meaning |
|---|---|
| `blocker` | a clear Level A or AA failure that is content level; fix before publication |
| `major` | an AA failure that needs a structural change rather than a line edit |
| `minor` | AA borderline, or a reading-level miss; reviewer judgment |
| `note` | best practice, plus every deferred page-level item |

**One blocker means `result: "fail"`.** Deferred items never affect the result; they are a handoff,
not a failure.

For a `minor`, give the reviewer the choice explicitly: fix it, or record a reason for the
exception. Reading-level exceptions are common and legitimate in financial content where the terms
of art are the content.

## Report shape

1. `set-experiment-document` with `kind: "review-ada"`, a client-readable title, and this body, in
   this order:

   - **Summary:** counts by severity, the reading-level estimate with its metric and target, and the
     standing banner that a rendered-page audit is still required.
   - **Findings:** grouped by severity, blockers first. Each carries the location (section or quoted
     phrase), the WCAG criterion number and name, what is wrong, and the fix.
   - **Reading level:** the estimate, and the three hardest sentences with a structural
     simplification hint for each.
   - **Deferred to the rendered page:** the list above, as a checklist for whoever owns the page.
   - **Reviewer sign-off:** including the rendered-page audit reminder.

2. `record-deliverable-check` with `type: "accessibility"`, the `result`, a one-line `summary`, the
   `findings` array with the criterion number inside each `issue`, `document_kind: "review-ada"`,
   and `recorder` naming yourself.

## How to walk the report with a human

Blockers first; each cites its criterion, and quote the criterion if the reviewer pushes back. Then
the minors, as a fix-or-document choice. Batch the notes at the end so they do not dominate. Do not
try to resolve the deferred items in the article: they belong to whoever owns the rendered page.
