# Review battery: NCUA and lending compliance

Reviews the article against the federal framework that governs financial-institution advertising:
NCUA Part 740 (accuracy of advertising and notice of insured status), Part 707 (Truth in Savings),
Regulation Z (lending advertising), Regulation E (electronic transfers), and Regulation B with the
Fair Housing Act (fair lending).

**This battery is assistive, not authoritative.** Every report ends by handing off to a human
compliance officer. The value is taking the first pass off that person, never replacing them.

## What you need before you start

- The institution's **name**, as it writes it, for the insurance statement and the report header.
- The **charter type**, federal or state. State-chartered institutions that are federally insured
  still follow Part 740. Note the charter type in the report.
- The **field of membership** if you can get it, as a sentence describing who is eligible to join.
  Without it, treat broad eligibility claims as `minor` and ask the compliance officer to confirm.

Do not guess the institution's name from the article body; names get mangled. Ask once.

## How to read the article

Walk it paragraph by paragraph and tag each passage by category. A single sentence can land in
several, and then several rules apply to it.

- **Insurance and safety language:** deposits being safe, insured, guaranteed, protected, and any
  mention of NCUA or FDIC.
- **Deposit-account terms:** savings, checking, share certificates, money market, CDs. APY, dividend
  rate, balance requirements, fees, "free", "bonus".
- **Lending terms:** mortgages, auto, personal, credit cards, HELOCs. Rates, payments, "as low as",
  refinance offers.
- **Electronic transfer, debit, and ATM language:** Regulation E territory.
- **Membership eligibility:** who can join, geographic scope, "anyone can join", "open to all".
- **Non-deposit investment products:** annuities, mutual funds, brokered products, insurance. Their
  own disclosure regime.
- **Comparative and superlative claims:** "best", "lowest", "highest", "number one", "guaranteed".

## Part 740: accuracy of advertising and insured status

**740.4, the official advertising statement.** A federally insured institution must carry the
official statement when it advertises insured products. Three acceptable forms: the long form
("This credit union is federally insured by the National Credit Union Administration"), the short
form ("Federally insured by NCUA"), or the official NCUA sign image. It must be clear and
conspicuous, which in a long-form article means a closing line or a footer, not a buried inline
mention.

`major` when the article promotes insured deposit products and none of the three forms appears
anywhere in its own copy. Flag it as an absence rather than a rewrite: you cannot see the site chrome
the article will render inside, and the reviewer can.

**740.5, non-deposit investment products.** Content advertising securities, mutual funds, annuities,
brokerage, or insurance products must clearly disclose all three: not federally insured, not
guaranteed by the institution, may lose value. If the article promotes both insured and non-deposit
products, the distinction has to be drawn so no reader thinks the non-deposit product is insured.
`blocker` when the three statements are absent.

**740.2, misleading representations.** No statement may misrepresent the institution's services,
accounts, financial condition, or its relationship with NCUA or the federal government. Standing
blockers:

- "100% safe", "100% guaranteed", "absolutely guaranteed" applied to deposits. Insurance is to
  $250,000 and conditional, so an unqualified claim misrepresents it.
- "Backed by the federal government" used loosely. NCUA insurance is the correct framing.
- Anything implying the institution is a government agency.
- "FDIC insured" on a credit union. Credit unions are NCUA insured. Always a blocker.

## Part 707: Truth in Savings

Active whenever the article discusses deposit accounts.

**707.8, advertising.** If an advertisement states a rate of return:

1. The rate is expressed as "annual percentage yield" or "APY".
2. A dividend rate may appear too, but no more conspicuously than the APY.
3. If an APY is stated, the ad also discloses: variable or fixed and whether the APY may change;
   the time the APY is in effect ("accurate as of", or "offered through"); the minimum balance to
   obtain the APY; the minimum balance to open, if it is higher; and for time deposits, the term and
   the early-withdrawal penalty.
4. If a bonus is advertised: the time the deposit must be maintained, the minimum balance to obtain
   the bonus, and when the bonus is paid.

**707.2.** "Dividend rate" and "annual percentage yield" are defined separately and are not
interchangeable. APY incorporates compounding; the dividend rate does not. Using them loosely is a
violation.

**The word "free".** An account may be advertised as free or no-cost only when there is no
maintenance or activity fee, no minimum-balance fee, and no fee at the lowest tier of service. Any
recurring fee, even one disclosed elsewhere in the article, makes it a blocker. The subtle case:
"free checking" plus "$5 monthly fee waived with direct deposit" is still a blocker, because the fee
exists and the account is conditionally free. Acceptable substitutes: "no minimum balance", "no
monthly fee with direct deposit" stated as the conditional it is, "no overdraft fees" if true.

Standing blockers: a stated rate with no APY label; "free" with any fee; a bonus with no maintenance
condition; a dividend rate more prominent than the APY; a stale or missing "accurate as of" date.

## Regulation Z: lending advertising

Active whenever the article discusses any loan product.

**Trigger terms** (1026.24(d) closed-end, 1026.16(b) open-end): the amount or percentage of a down
payment; the amount of any payment; the number of payments or the period of repayment; the amount of
any finance charge. If any appears, the ad must clearly and conspicuously state the down payment,
the terms of repayment, the annual percentage rate using the term "APR", and whether the rate may
increase after consummation.

**APR rules.** If an APR is mentioned it uses "annual percentage rate" or "APR". A simple interest
rate may appear too, but the APR must be at least as conspicuous. "As low as" is permitted only when
the rate is one a meaningful number of borrowers actually get, and the ad makes clear it is subject
to credit qualification.

**Closed-end specifics (1026.24).** Mortgage advertising with a payment example has to compare the
APR with the simple rate and meet the clear-and-conspicuous requirements. "No fees" or "no closing
costs" must be true on a net basis. Product comparisons must be balanced: no "save $200 a month"
without the tradeoff, which is usually a longer term.

**Open-end specifics (1026.16).** For cards, a stated rate must be the rate that actually applies to
purchases, or each tier if there are several. HELOC introductory rates require the period and the
rate that applies afterward.

Standing blockers: a rate with no APR disclosure; "refinance and save $200 a month"; "$299 a month
for 60 months"; "as low as" with no credit-qualification language; a card "0% APR" with no duration
or post-promotional rate.

Rule 11 is the practical answer to all of this: keep rate numbers out of the article body entirely
and link to the institution's rates page, where the disclosures already live.

## Regulation E: electronic transfers

Active for debit cards, ATM access, mobile banking, bill pay, person-to-person transfers, and
electronically initiated wires. The marketing-relevant rule is the prohibition on misleading
statements about electronic fund transfer services. Copy must not imply free or unlimited transfers
when per-transaction, foreign-ATM, or expedited fees apply; must not imply error-resolution rights
beyond the actual ones; and must not misrepresent liability for unauthorized transfers.

Typically `minor` rather than blocker: an unqualified "free ATM access" claim, surfaced so the
compliance officer can confirm the network really is fee-free everywhere.

## Regulation B and the Fair Housing Act

Active whenever the article discusses credit, loans, or eligibility.

Prohibited bases under ECOA: race, color, religion, national origin, sex, marital status, age
(where the applicant has capacity), receipt of public assistance income, and exercise of
consumer-protection rights. The Fair Housing Act adds familial status and handicap in housing.

**Equal Housing Lender.** Mortgage and home-loan advertising carries the Equal Housing Lender or
Equal Housing Opportunity statement. Flag its absence as `major` when the article promotes home
loans.

**Eligibility statements** must not exclude protected classes and must read neutrally. "You can join
if you live, work, worship, or attend school in the county" is fine. Value-laden framing is not.

`minor` patterns: second-chance credit products described in ways that imply judgments about
borrowers; comparative advertising that leans on demographic language.

## Field of membership

Institutions operate inside a defined field of membership. Marketing must describe eligibility
accurately.

- "Anyone in the state can join" is correct only if the field genuinely covers the state. For a
  county-bound community charter it is a misrepresentation: `blocker` if you have the field of
  membership and it does not match, `minor` if it was never supplied.
- "Open to all" and "anyone can join" are almost always inaccurate. Flag them.
- Hedged phrasing ("see if you qualify") is typically fine.

When the field of membership was not supplied, the finding is a question for the compliance officer:
"Confirm the field of membership covers the geographic area or affiliation asserted in this passage
as written."

## Severity scale

The same scale as every battery, and the values `record-deliverable-check` stores:

| severity | meaning |
|---|---|
| `blocker` | a clear violation as written; cannot publish without a rewrite |
| `major` | something required is absent from the article entirely, most often the insurance statement or the Equal Housing line |
| `minor` | a gray area; the compliance officer decides, and every one carries a specific question for them |
| `note` | best practice, used sparingly so it does not drown the real issues |

When you cannot choose between blocker and minor, ask: would the compliance officer reject this on
sight, or would they have to think about it? Rejected on sight is a blocker. Has to think is a minor.
When you cannot choose between minor and note, ask: is this a compliance question or a writing
improvement? A writing improvement is a note, or nothing at all.

**One blocker means `result: "fail"`.** A `major` with no blockers is a judgment call, and the
honest default is to fix it first, because a missing required disclosure is not a style preference.

Cite the specific regulation on every finding: "12 CFR 740.4", "12 CFR 707.8(c)", "12 CFR
1026.24(d)". Vague citations make the report useless to the officer reading it.

## Suggested rewrites

Every blocker and every major carries a rewrite or a specific instruction. Prefer these standard
phrasings; they are what a compliance officer expects to see.

- **Insurance statement, short form:** "Federally insured by NCUA."
- **Insurance statement, long form:** "This credit union is federally insured by the National Credit
  Union Administration."
- **Non-deposit disclosure:** "Not federally insured. Not guaranteed by [institution]. May lose
  value."
- **APY block, savings or money market:** "APY accurate as of [date]. Minimum balance to obtain APY:
  $[X]. APY may change after the account is opened. Fees may reduce earnings on the account."
- **APY block, share certificate:** "APY accurate as of [date]. Minimum balance to open and obtain
  APY: $[X]. Term: [N] months. A penalty may be imposed for early withdrawal."
- **Bonus disclosure:** "Bonus paid after [N] days from account opening. Minimum balance of $[X]
  required. Account must remain open and in good standing through the bonus payment date."
- **Lending trigger term, closed-end:** "Example: $[amount] financed at [X]% APR for [N] months.
  Monthly payment $[X]. [Down payment.] Rate subject to credit qualification. Other rates and terms
  available."
- **"As low as" qualifier:** "Rate shown is our best rate, available to qualified borrowers. Your
  rate may be higher based on creditworthiness, term, and other factors."
- **Equal Housing Lender:** "Equal Housing Lender." Use the logo where space permits.
- **"Free checking" with a fee:** replace with the feature that is actually free, for example
  "checking with no minimum balance".

When a rewrite needs a number the article does not supply, say so instead of inventing one:
"Compliance officer to supply: minimum balance to obtain APY, time requirement." Never fabricate
figures.

## Report shape

1. `set-experiment-document` with `kind: "review-ncua"`, a client-readable title, and this body:

   - **Header:** institution name, charter type, and the date of the review.
   - **Summary:** counts by severity and the recommendation, which is one of: "Do not publish
     without addressing the blockers"; "Address the missing items, then advance to compliance
     officer review"; "Safe to advance to compliance officer review"; "No major issues found; the
     compliance officer should still sign off before publish."
   - **The standing callout:** this is an assistive review, and a licensed compliance officer at the
     institution must sign off before publication.
   - **Findings:** grouped by severity, blockers first. Each carries the quoted passage, the
     regulation citation, why it is a problem in plain words, and the suggested rewrite.
   - **Compliance officer sign-off:** the checklist, every time, even on a clean article.

2. `record-deliverable-check` with `type: "ncua-compliance"`, the `result`, a one-line `summary`,
   the `findings` array with a regulation citation inside each `issue`, the `verifications` array,
   `document_kind: "review-ncua"`, and `recorder` naming yourself.

   **This battery's verification rows are the regulation areas you walked**, one row each: 740.2
   accuracy, 740.4 the official advertising statement, 740.5 insured status of non-deposit products,
   707.8 Truth in Savings advertising, the Regulation Z trigger terms, Regulation E, Regulation B
   and the Equal Housing line, and field of membership. `item` names the citation and what you
   looked for; `source` is the passage or section you read it against. An area the article never
   touches is `n/a` with the reason in `note`, which is itself a real answer. Record only the areas
   you actually walked.

## What this battery does not do

- It does not verify factual accuracy. Whether the article's branch count is right belongs to the
  fact battery.
- It does not assess accessibility.
- It does not rewrite the article. Suggested rewrites are passage level; the author owns the prose.
- It does not replace the compliance officer. The sign-off section ships every time.
