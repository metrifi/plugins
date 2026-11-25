# NCUA Part 740 regression cases (exp-review NCUA battery)

Regression cases for `reference-src/review-ncua.md` after NCUA's Part 740 final rule (91 FR 73430,
FR Doc 2026-23288, published November 16, 2026, effective December 16, 2026), which removes 740.5,
the official advertising statement, and leaves 740.4 (official sign) and 740.2 (accuracy)
unchanged. No correction to the rule was published as of November 24, 2026.

The skills have no automated behavior tests, so these are run by hand or by an agent: give a fresh
session the reference file, the `exp-review` SKILL.md, and the inputs below without the expected
column, then compare. Dry run only: no MetriFi tools, no platform writes. `harmon-cu` is a synthetic
team and Harmon Credit Union a synthetic, federally chartered, NCUA-insured institution (field of
membership: Salt Lake County, Utah).

## Fixtures

Each fixture is the full rendered page, site chrome included.

- **A, marketing-only savings page.** An article promoting a share savings account (no rates; links
  to the rates page). Header and footer carry no insurance statement and no official sign. "Join"
  links to a separate application page.
- **B, account-opening screen.** "Open your share savings account", step 1 of an application form
  with an opening deposit field. Footer reads "Federally insured by NCUA".
  B1: no official sign image anywhere. B2: B1 plus the official NCUA sign image above Continue.
- **C, misleading insurance claim.** "Your savings at Harmon Credit Union are 100% guaranteed by the
  federal government, no matter how much you deposit." The page also carries "Federally insured by
  NCUA."

## Cases and expected outcomes

| Run | Input | Intended publication | Expected Part 740 outcome |
|---|---|---|---|
| 1a | A | 2026-12-15 | `major`, 12 CFR 740.5, statement absent. 740.5 row `fail`. |
| 1b | A | 2026-12-16 | No federal finding. 740.5 row `n/a`, note names the date and the removal. |
| 2a | B1 | 2026-12-20 | `major`, 12 CFR 740.4(a): footer wording does not substitute for the sign. 740.4 row `fail`. |
| 2b | B2 | 2026-12-20 | No finding. 740.4 row `pass`. The sign's own wording does not trip the 740.2 blocker. |
| 3 | A, plus a written institution policy requiring "Federally insured by NCUA" | 2026-12-16 | `major` cited to the institution policy, not 12 CFR. 740.5 row `n/a`. |
| 4a | C | 2026-12-15 | `blocker`, 12 CFR 740.2. `result: fail`. 740.5 row `pass`. |
| 4b | C | 2026-12-16 | Same 740.2 `blocker`. `result: fail`. 740.5 row `n/a`. |
| 5 | Run 1b's check is recorded and current. Copy is unchanged; the publication date moves to 2026-12-14 | n/a | Re-run the NCUA battery: the platform does not stale it, and 740.5 now applies (adds the 1a `major`). |

Also hold, on every run: no finding or row cites 740.5 for the non-deposit disclosure, and the
report header records the intended publication date.

## Last run

2026-11-24, against this branch's reference file, by a fresh agent given only the reference, the
SKILL.md and the inputs. All eight runs matched the expected column. That run's one gap (the official
sign's wording could read as the "backed by the federal government" blocker) is fixed by the
carve-out in 740.2 and is now case 2b.
