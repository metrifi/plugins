---
name: site-page-inventory
description: >-
  Crawl a financial institution's existing website and produce a page-count analysis that splits every page into
  build buckets: pages worth conversion copywriting, pages that only need content migrated, and pages to drop.
  Use when scoping a new credit union or community bank site build, sizing a quote, or answering "how big is
  their site really and where does the copywriting effort actually go?" Trigger phrases include "run a crawl of
  their site", "page count analysis", "inventory their website", "how many pages does [institution] have",
  "scope this site build", "which pages need copywriting". This is stage 0 of the MetriFi website development
  process, run before generate-claude-design-system. Not for auditing a site's performance or AI visibility
  (that is the client-report skill), and not for pages on a site MetriFi already built.
metadata:
  author: metrifi
  version: '1.0'
---

# Site page inventory

Crawl an institution's existing site once, then turn the raw page list into a scoping decision.

The crawl is commodity. The value is the categorization and the junk it exposes, so do not stop at a
page count. A bare number ("117 pages") is almost useless for scoping. The useful sentence is always
some version of: *"only ~38 of these actually need copywriting, the other ~79 just move."*

## When to use this

- Scoping a new build for a credit union or community bank
- Sizing a quote, or justifying an AI-native price against a traditional one
- Deciding where copywriting hours go before stage 1 starts

Do **not** use it to audit performance, SEO, schema, or AI visibility. That is `client-report`.

If a client report is also being produced for this institution, coordinate: both crawl the same
incumbent site. Reuse one crawl rather than running two.

## Step 1: Crawl

Use the official `apify/website-content-crawler` Actor. It is free and returns URL plus page `<title>`
for every page, which is what makes categorization possible.

```json
{
  "startUrls": [{ "url": "https://example.org" }],
  "crawlerType": "cheerio",
  "useSitemaps": true,
  "proxyConfiguration": { "useApifyProxy": true },
  "respectRobotsTxtFile": true,
  "saveMarkdown": false,
  "maxCrawlPages": 500,
  "maxResults": 500
}
```

Why each setting:

- **`proxyConfiguration` is REQUIRED.** Omitting it fails the launch. This is the single most common
  mistake; it cost a wasted launch on techcu.org. It also matters for a second reason: bank sites sit
  behind a WAF that returns 403 to datacenter traffic. The proxy is why the crawl sees the site at all,
  and it is why you cannot spot-check a URL from a plain HTTP request later.
- **`useSitemaps: true`** folds the orphan-page cross-check against `/sitemap.xml` into the same run,
  so no separate sitemap pass is needed. It also surfaces pages no nav links to, which is exactly
  where dead and duplicate pages hide.
- **`crawlerType: "cheerio"`** is the fast raw-HTTP crawler. Titles and nav links are in static HTML on
  virtually every FI site, so this is both complete and quick. If the result comes back with almost no
  pages or blank titles, the site is JS-rendered: re-run with `"playwright:adaptive"`. One thin page
  (often the homepage, behind a JS hero) is not a reason to re-crawl the whole site.
- **`saveMarkdown: false`** cuts the payload hard. Only URL, title, canonical, and status are needed,
  and full page markdown makes the dataset unwieldy for no benefit.
- **`maxCrawlPages` / `maxResults`** are runaway guards. 500 covers any normal FI site. If the crawl
  actually hits the cap, say so in the output rather than quietly reporting a truncated count.
- **`respectRobotsTxtFile: true`** is the polite default when crawling someone else's site, and it
  incidentally skips search and admin paths that would be dropped anyway.

**Run it async.** A full FI site takes roughly 2 to 4 minutes, which exceeds the synchronous wait
window. Call with `waitSecs: 0` to get a run ID back immediately, then poll `get-actor-run`. Pace the
polls rather than hammering the API. A synchronous call will appear to time out while the run keeps
going on Apify's cloud, which is confusing and wastes a launch.

## Step 2: Pull the results

The run produces two datasets and you need **both**. The default dataset holds the pages; the `errors`
dataset holds every URL that failed, and that second one is where the most valuable findings are.

Fetch only the fields needed, not the whole dataset. The field names are **dotted**, and getting them
wrong silently returns rows containing only `url`:

```
get-dataset-items(datasetId,
  fields: "url,metadata.title,metadata.canonicalUrl,crawl.httpStatusCode",
  limit: 500, clean: true)
```

For the error dataset, pull `url,httpStatus,errorCode`.

Check the returned count against the run's item count. The default page of results is small, so page
through with `offset` until the full list is in hand. Reporting a count that is really just the first
page of the dataset is a silent, embarrassing error.

Note that the item count and the "crawled N pages" status line will not match, and neither is the
number you report. Crawled counts every request; the dataset stores what was kept. Filter to
`crawl.httpStatusCode == 200` and deduplicate on canonical URL, and *that* is the live page count.

## Step 3: Categorize

Sort every page into buckets. This is judgment, not a lookup table, and it shifts per institution.
Write the rules down as you go so the split can be re-run when a judgment call changes, rather than
recounted by hand.

**Copywriting** — the high-intent pages where conversion copy drives account opens and applications.
Home, product pages (checking, savings, certificates, IRAs, auto, mortgage, HELOC, personal, credit
cards, business), membership and "why join", about, rates. These get fresh A/B-informed copy.

**Setup-only / migrate** — must exist, content moves largely as-is. Calculators, disclosures, privacy,
accessibility, fee schedules, NCUA/FDIC insurance, branch and ATM locators, contact, careers, FAQ,
login help, transactional stubs.

**Delete or duplicate** — should not carry to the new site. See step 4.

**Blog / news** — split this out as a fourth bucket whenever the archive is large enough to distort
the split (techcu.org had 40 of 117 pages in blog alone; fvsbank.com had 75 of 232). Treat it as bulk
migration with a prune pass, never per-page copywriting. Folding a blog archive into "setup-only"
hides the real shape.

State your judgment calls explicitly rather than burying them. Insurance, investment planning, and
education savings are the usual genuinely ambiguous ones: product pages at some institutions,
secondary content at others. Ask, or flag the assumption.

## Step 4: Hunt the junk

This is the part a sitemap-only or guess-based pass misses, and it is most of why the crawl earns its
keep. On hondafcu.org it caught 12 pages that would otherwise have been migrated by mistake.

- **The error dataset first.** Separate genuine dead pages still linked from live navigation from
  malformed links, because they are different findings for different people. fvsbank.com had 29 failed
  URLs: 9 real dead pages (a whole retired `/personal/*` tree still linked from the nav) and 20 link
  bugs. Both belong in the report; only the first affects the page count.
- **Malformed link patterns worth grepping for.** `mailto=` instead of `mailto:`, `tel+1` instead of
  `tel:`, protocol-less hrefs treated as relative paths, and — the one that looks bizarre until you
  see it twice — disclosure footnote *text* rendered as a link href, producing 200-character URLs made
  of rate legalese. These indicate a CMS template bug, not a content problem.
- **Soft 404s.** Pages returning HTTP 200 while canonicalizing to `/pagenotfound` or similar. Compare
  `canonicalUrl` against `url`; mismatches pointing at a not-found route are the tell.
- **Canonicals pointing at URLs the crawl never reached.** A page that canonicalizes to a partial or a
  hub nothing links to is leaking its ranking signal to a URL that may not exist. Say "the crawl never
  reached it" rather than "it is broken" unless you can verify it — behind a WAF you usually cannot.
- **Duplicate clusters, not just duplicate pairs.** This is usually the single biggest finding, and
  looking only for pairs will miss it. Group URLs by the *concept* they cover and count how many exist
  per concept. Sites that migrated from a flat root structure to a sectioned one accumulate three,
  four, or five live URLs for one product (eccu.net had five for high-yield checking). Report it as
  "N URLs collapsing to M concepts", because that is the number that changes the build estimate.
- **Two parallel information architectures.** The deeper version of the above: an old flat tree and a
  new sectioned tree both live, each with its own copy of the same product set. Look for a section
  that duplicates another section wholesale, not just individual pages.
- **Cross-path duplicates.** The same page living under two parents (Honda's `digital-wallets` sat
  under both `/checking-savings/` and `/loans-and-credit-cards/`).
- **Corrupted canonical tags.** Check whether `canonicalUrl` contains `%3C`, `script`, or `gtm`. Some
  CMS templates inject analytics markup straight into the `<link rel="canonical">` href, producing a
  canonical URL hundreds of characters long that points nowhere.
- **www versus non-www canonical split.** Pages served from `www.` whose canonical points at the bare
  domain (or vice versa) split ranking signal across two hostnames.
- **CMS artifact suffixes.** `-2`, `-(1)`, and `-copy` URLs. A `-2` on a *product* page usually means
  the original still exists somewhere; a `-2` on a blog post is a duplicated post.
- **Taxonomy and pagination archives.** Category, tag, and author archives plus their `/page/2/`,
  `/page/3/` children multiply fast and are pure delete. A large `uncategorized` archive is its own
  finding: the blog has no working taxonomy.
- **Posts published with no slug.** Permalinks ending in a bare post ID (`/2026/02/04/105726/`) mean
  the post shipped without anyone setting a title slug.
- **Test and staging pages left live**, **year-stamped stale content** ("America Saves Week 2022"),
  and **empty stubs** with default meta.
- **Generic default titles.** Many pages sharing one boilerplate `<title>` is not junk, but it is a
  real finding: they never set custom titles, which is free SEO upside for the rebuild. Conversely, if
  titles are all custom, say so — it means the migration inherits real metadata.

## Step 5: Deliver

Match the deliverable to why the inventory was run. Do not default to a spreadsheet.

- **Sales or scoping conversation** → the headline split in prose, plus the bucket lists grouped by
  product family. Lead with the copywriting count, because that is the number that sizes the quote.
- **Build handoff** → a spreadsheet via the `xlsx` skill. Two tabs (Summary, Page Inventory),
  color-coded by category, sorted, filterable.
- **CRM record** → a note on the deal with headline counts, the categorized inventory, and a method
  line noting the count is distinct pages rather than template variants.

Always include the caveat that the copywriting count reflects distinct pages, not template variants.
Several product pages usually collapse into shared layouts at build time, which only strengthens the
efficiency argument.

Report two numbers, not one: the raw live page count and the count after duplicate collapsing. The gap
between them is the argument for the rebuild.

## Where this fits

Stage 0 of the MetriFi website development process, ahead of `generate-claude-design-system` (stage 1),
`generate-claude-design-page` (stage 2), and `page-design-process` (stage 3). Stage 0 is scoping: it
runs before the engagement is priced, and it is the only stage that touches the incumbent site.

The inventory is not persisted to the platform. If a downstream stage ever needs to read it instead of
a human reading a spreadsheet, that is the point to add a `record-page-inventory` MCP tool, mirroring
the existing `research-keywords` / `record-keyword-research` pair. Until something reads it, keep it
here.
