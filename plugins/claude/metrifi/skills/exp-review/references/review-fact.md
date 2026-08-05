# Review battery: fact verification

Finds every verifiable factual claim in the article and verifies each one against the institution's
live website or an authoritative external source. Anything that cannot be verified is marked
needs-human-verification rather than waved through.

Articles have shipped with "13 branches" when there were 12, with products the institution does not
offer, and with membership eligibility more generous than the charter allows. Those errors damage
trust with the client's own members and create real regulatory exposure under advertising and fair
lending rules.

The design is **live, not dossier based**. There is no frozen facts file. Every verification reaches
the source at review time, so the battery stays correct as the institution's site changes.

The bias is **conservative**. The default for any ambiguity is needs-human-verification. Flagging a
correct claim is mildly annoying. Greenlighting a wrong one is the failure this battery exists to
prevent.

## What you need before you start

- The **institution name**, to disambiguate while verifying.
- The **website root**. Do not guess it. Ask once if it was not supplied.
- Optionally the **NCUA charter number**, useful for verifying counts against call-report data.

## Web access

Use whatever web and browsing capability your host gives you. A real browser tool is better than a
plain fetch, because institution sites are increasingly client-rendered and a fetch returns markup
with no content in it. If you have one, prefer it.

If you have no live web access at all, the battery still runs: extract and classify every claim, and
mark all of them needs-human-verification with "no live source access in this session" as the
reason. Say it plainly in the report. What you must never do is infer a claim is true because the
article sounds confident.

Be a courteous visitor. Pause a second or two between page loads, visit only the pages a specific
claim needs, and do not crawl. These are small sites.

## Step 1: extract the claims

Read the article, then walk it paragraph by paragraph and pull out everything a reader could look up
and prove or disprove. Be aggressive: a claim you skip is a claim that ships.

Counts as a claim: specific numbers ("12 branches", "$1.2B in assets", "founded in 1953"); named
products and services; membership and eligibility statements; rates and APYs; hours and addresses;
named people and their titles; external statistics with or without a citation; comparative and
superlative claims; regulatory and legal claims; and any direct quotation attributed to a person.

Does not count: opinions and mission statements ("we believe in service"); unfalsifiable generalities
("a friendly team"); author-voice transitions ("in this article we will cover").

For each claim, capture the verbatim article text, the section it sits in, and a first type
assignment.

## Step 2: classify by type

Nine types. If a claim fits two, pick the one with the stricter evidence bar. A rates page listing an
APY on a 12-month certificate is both a rate (type 5) and a product (type 3); treat it as type 5,
because the rate is the part that goes stale.

### Type 1: counts and numbers about the institution

"12 branches", "$1.2B in assets", "over 80,000 members", "more than 200 employees".

**Verify against** the About, Our Story, Press, or Newsroom pages. For asset and member counts the
authoritative source is the institution's NCUA call report, which is a quarterly snapshot and can
lag the article by a quarter.

**Bar:** a direct text match, or a close numeric equivalent when the article hedges ("over 80,000"
matches a source saying "more than 81,000").

**Defaults to needs-human-verification when:** the source page is undated and the claim is about a
current count; the units differ (article says members, source says accounts); the article cites a
source you cannot reach.

### Type 2: branch locations and hours

**Verify against** the Locations or Find a Branch page, drilling into a branch detail page for hours.

**Bar:** every city named in the article must appear on the locations page, and a city that does not
appear is contradicted. Counts must match exactly. Hours must match verbatim or to the minute; 5:00
PM and 5 PM are the same, 5:30 PM and 5 PM are not.

**Defaults to needs-human-verification when:** the locations page is a map widget you cannot read as
text; hours are seasonal and the article implies year round.

### Type 3: products and services offered

The highest-stakes type. This is where hallucinated products come from.

**Verify against** the institution's own product pages, reached through its own navigation.

**Bar:** strict. The product must be named, or unambiguously described, on a page that is a
reasonable home for it.

**Special rule:** if the product is not on the site anywhere after a reasonable search (home page,
product index, top navigation, site search), the status is **contradicted**, not
needs-human-verification. Absence on the institution's own site is itself evidence. Record what you
searched in the source-quote field: "Searched /loans, /mortgages, /personal: no mention of VA loans."

**Defaults to needs-human-verification when:** the article's product name is generic enough to match
several offerings ambiguously. Describe the ambiguity and let the human decide.

### Type 4: membership eligibility

**Verify against** the Membership, Become a Member, or Eligibility page. Capture the
field-of-membership statement verbatim, including unusual qualifiers like "worship in".

**Bar:** the source must support the article's claim in scope. Article broader than source is
**contradicted**: "anyone in the state" is a broader claim than "anyone in these two counties".
Article narrower than source is verified, with a note that it could legally be more inclusive.

**Special rule:** false generosity here is a fair-lending and advertising-rules problem, not a typo.
Always quote the exact eligibility statement.

**Defaults to needs-human-verification when:** the source describes multi-prong eligibility (live,
work, worship, attend school, plus employer groups, family, association membership) and the article
summarizes one prong without disclaiming the others.

### Type 5: rates and APYs

**Verify against** the rates page or a product pricing page.

**Bar:** exact match on the rate, the term, and the product. A 13-month term is not a 12-month term;
4.40% is not 4.50%.

**Special rule:** rates change constantly. Even an exact match is verified **as of** a timestamp, and
every rate claim goes on the re-verify-at-publish list. Rule 11 is the structural fix: rate numbers
do not belong in the article body at all.

**Defaults to needs-human-verification when:** the article hedges ("starting at") and the source does
not; the rate is conditional and the article omits the condition.

### Type 6: leadership and named people

**Verify against** the Leadership or Our Team page.

**Bar:** name spelling and title match. A slight title variance is fine with a note.

**Special rule:** a direct quotation attributed to a person is **always** needs-human-verification,
even if the same quote appears in a press release. The only authority on whether a person said
something is that person.

**Defaults to needs-human-verification when:** the person is not on the team page, or the page looks
recently reshuffled.

### Type 7: external statistics

Industry, market, or economic numbers about the world outside the institution.

**Verify against** the authoritative source for the topic: the NCUA for credit-union industry
statistics, the Federal Reserve's economic data for mortgage-rate series, the FDIC for bank data,
the Bureau of Labor Statistics for labor and price data, the state financial-institutions regulator
for state-level statistics, and a named housing-data publisher for home prices, chosen to match
whatever the article cited.

**Bar:** if the article cites a source, go to that source and confirm the number. If it gives a
number with no citation, find an authoritative source; within about one percent is verified with a
note naming the source, and a larger gap is contradicted.

**Defaults to needs-human-verification when:** no authoritative source exists for the topic; the
cited source is paywalled; the article says "according to recent reports" with nothing specific.

### Type 8: comparative and superlative claims

"The largest in the county", "the best rates in the region", "more members than any other bank in
the area".

**Bar:** verifying "largest in X" would mean comparing the metric across every entity in the
comparison set. That is outside the battery's scope.

**Special rule:** **always** needs-human-verification, and the reason states what evidence would be
needed. "Verifying 'largest in the county' would require comparing total assets across every
institution chartered in or serving the county, using the latest call-report quarter." Recommend
softening the claim, or supplying the comparison data. Rule 13 usually means it should just come out.

### Type 9: regulatory and legal claims

"Federally insured up to $250,000", "as required by the Fair Credit Reporting Act".

**Verify against** the regulator: the NCUA for share insurance and Truth in Savings, the consumer
financial protection regulator for Regulation E and general consumer-finance law.

**Bar:** match the regulator's published statement and quote it.

**Defaults to needs-human-verification when:** the article states a regulatory consequence you have
no authoritative footing to confirm. Route that to the compliance battery rather than fact checking
it.

### Quick decision tree

1. A direct quotation from a named person? Type 6, needs-human-verification, always.
2. A comparative or superlative? Type 8, needs-human-verification.
3. A number tied to a product on the institution's site? Type 5.
4. About who the institution is (size, age, locations, leadership, eligibility)? Type 1, 2, 4, or 6.
5. About what the institution does or offers? Type 3, strict.
6. A fact about the world outside the institution? Type 7.
7. About a law, a regulator, or insurance? Type 9.

## Step 3: verify

For each claim that needs a source:

1. Go to the planned page. If it fails to load or returns nothing, mark the claim
   needs-human-verification with the error as the reason. Do not silently skip it.
2. Read the page. If the readable text is thin, the content is probably rendered by script; get the
   full rendered text if your tools can, and wait for it to appear before reading.
3. Narrow to the relevant section by searching the captured text.
4. Capture the **exact source quote**. Same words, same order, same capitalization, punctuation
   preserved. Trim only outer whitespace and mark elision in the middle. Never paraphrase: if the
   source says "more than 80,000" and the article says "over 80,000", the quote is "more than
   80,000", with a note that the wording differs. A table row is acceptable verbatim when the
   structure is needed to read it.
5. Capture the canonical URL and the timestamp of the visit.

If the page loads but the text is not there, do not conclude the claim is false off one page. Try the
obvious neighbor: the article says VA loans and the loans index does not list them, so try the
mortgage page, then the site's own search. After a reasonable look, roughly three pages, the call
depends on type: for products, absence is contradicted; for everything else, it is
needs-human-verification with a note on what you searched.

Stay on the institution's own domain for internal claims (types 1 through 6): the institution's site
is the authority on its own products, people, and eligibility. Go off domain only for external
statistics and regulatory claims, straight to the named authority.

## Step 4: status and time sensitivity

- **verified:** the source contains text that directly supports the claim, and you captured the URL
  and the exact quote.
- **contradicted:** the source contains text that contradicts the claim, or, for a type-3 product
  claim, the institution's site does not list the product anywhere it reasonably would.
- **needs-human-verification:** everything else. Ambiguous matches, format mismatches you cannot
  reconcile, load failures, quotations, comparatives, internal data not published anywhere, and any
  claim where you noticed yourself wanting to give the article the benefit of the doubt.

Then sweep specifically for time-sensitive content:

- **Rates and APYs:** even a verified rate is verified as of a timestamp, and the recommendation must
  say to re-verify every rate claim at publish time.
- **Hours and addresses:** note that these move with holidays and seasons; re-verify within a week of
  publish.
- **Asset and member counts:** call reports lag by a quarter; treat a match as verified as of the
  timestamp, and recommend confirming with the client if the article runs more than three months out.
- **Leadership:** a name is fine to call verified with a note that titles may have changed. A quote
  is never verified.

## Severity scale

Findings recorded on the check use the same four-level scale as every battery:

| status found | severity | why |
|---|---|---|
| contradicted | `blocker` | the article states something the source disproves |
| needs-human-verification on a load-bearing claim | `major` | the article cannot ship until a human resolves it |
| needs-human-verification on a soft or hedged claim | `minor` | resolve it or soften the claim |
| verified but time sensitive | `note` | goes on the re-verify-at-publish list |

**One blocker means `result: "fail"`.** Contradicted claims get corrected, not dispositioned.

Rule 19 governs what happens to the survivors: before any of these becomes a client action item, try
rewriting to the site's published wording, try verifying it yourself, and check whether this report
already verified it. Most of them dissolve at one of those three steps.

## Report shape

1. `set-experiment-document` with `kind: "review-fact"`, a client-readable title, and this body:

   - **Header:** institution, primary source domain, review timestamp.
   - **Summary:** counts of verified, contradicted, and needs-human-verification, plus the
     recommendation, which is one of: "Do not publish, N contradicted claims must be corrected";
     "Safe to advance after human review of N flagged items"; "No issues", which is rare, because
     there is almost always a rate or a quote to flag.
   - **Contradicted claims:** one block each, with the verbatim article claim, the type, the source
     URL, the verbatim source quote with its timestamp, a one-line explanation, and the suggested
     fix.
   - **Needs human verification:** one block each, with the claim, the type, why it could not be
     verified, and exactly what evidence would settle it.
   - **Verified claims:** a table of claim, type, source URL, source quote, and timestamp.
   - **Re-verify before publish:** the time-sensitive list pulled out of the verified set.
   - **Reviewer sign-off.**

2. `record-deliverable-check` with `type: "fact-verification"`, the `result`, a one-line `summary`,
   the `findings` array, `document_kind: "review-fact"`, and `recorder` naming yourself.

## What this battery does not do

- It does not verify quotations attributed to people. Ever.
- It does not infer correctness from the article. The site is the source of truth, and "12 versus 13
  branches" is a contradiction, not a rounding difference.
- It does not use general web search to verify internal claims. Products, eligibility, and branches
  are verified on the institution's own domain, where absence is evidence.
- It does not rewrite the article. It produces the report; the author decides what changes.
