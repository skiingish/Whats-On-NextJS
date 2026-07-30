# Venue research gaps — venues that should have specials but couldn't be captured

Compiled 2026-07-30. Scope: pubs, taverns, clubs and bistros within ~20 km of
Belgrave VIC 3160.

Every venue below is one where there is **positive evidence of recurring weekly
specials** (reviews, aggregator snippets, the venue's own "we run weekly
specials" boilerplate) but **nothing that could be verified first-hand**, so
nothing was written to the database. The rule applied throughout: a special is
only inserted if it was read off a page that was actually rendered and seen —
never off a search-engine summary.

For what *did* make it in, see the `venues` / `events` tables (7 venues, 29
specials as of this writing).

---

## Why these are blocked

Four distinct failure modes, worth understanding separately because each needs a
different fix:

| Mode | What it looks like | Fix |
|---|---|---|
| **A. Empty CMS template** | Site exists, has a `/whats-on` page, page renders a hero image + scroll arrow and nothing else | Social media or phone |
| **B. No website** | Only Facebook and directory listings exist | Social media or phone |
| **C. Broken/parked domain** | DNS resolves but TLS fails, or domain is expired/for-sale | Social media or phone |
| **D. Image-only publishing** | Specials exist as poster graphics | Solved — see note below |

**Mode D is solved.** Poster-image specials are readable: download the image and
read it directly rather than screenshotting the page. That is how Micawber
Tavern's five specials were recovered after the page first appeared empty
(its cards lazy-load below the fold). Any venue below marked "image-based" has
already been checked this way unless stated otherwise.

---

## A. Site exists, publishes nothing (Nightcap / ALH Squarespace template)

These five run the same CMS template. Each `/whats-on` page was verified by
querying the DOM directly — all return exactly two images (a hero banner and a
scroll arrow) and no promotional content. They near-certainly run parma/steak
nights; they simply publish them to social media instead.

| Venue | Address | Site |
|---|---|---|
| Royal FTG Hotel | 1208 Burwood Hwy, Upper Ferntree Gully 3156 | royalftghotel.com.au |
| Ferntree Gully Hotel | 1130 Burwood Hwy, Ferntree Gully 3156 | ferntreegullyhotel.com.au |
| The Club Hotel | 848 Burwood Hwy, Ferntree Gully 3156 | ftgclub.com.au |
| Bayswater Hotel | Bayswater 3153 | thebayswaterhotel.com.au |
| Stamford Inn | Cnr Stud & Wellington Rds, Rowville 3178 | thestamford.com.au |
| York on Lilydale | Cnr York & Swansea Rds, Mount Evelyn 3796 | yorkonlilydale.com.au |

Also in this category, different CMS but same outcome (generic "weekly dinner
deals" copy, no specifics): **Dorset Gardens Hotel** (335 Dorset Rd, Croydon),
**Olinda Creek Hotel** (161 Main St, Lilydale), **Mount Dandenong Hotel**
(1451 Mt Dandenong Tourist Rd, Olinda), **Club Kilsyth** (Cnr Canterbury &
Colchester Rds, Bayswater North), **Wantirna Club** (350 Stud Rd, Wantirna —
standing bistro menu only), **Pig & Whistle Tavern** (1429 Mt Dandenong Tourist
Rd, Olinda — reviews mention blackboard specials and a locals' night from 5pm,
no day/price stated anywhere).

## B. No website at all

| Venue | Address | Phone | Evidence of specials |
|---|---|---|---|
| Paddy's Tavern | 34 Forest Rd, Ferntree Gully 3156 | — | Known for parmas; "affordable specials menu" |
| The Stonez Restaurant | Shop 1.1, 1091 Stud Rd, Rowville 3178 | — | Mon parma $20, Tue burger $20, Wed stone-grill steak — aggregator only |
| Knox Tavern | 1 Capital City Blvd, Wantirna South 3152 | 03 9800 3011 | Mon/Sat happy hour 12–5pm, Wed parma — aggregator only |
| Good Company: Burgers, Brew & BBQ | 25 Paul St, Mooroolbark 3138 | 03 9723 7105 | Reviewers describe a Wednesday night BBQ special, no price |
| Woodstock Cafe Bar | 23 McBride St, Cockatoo 3781 | 03 5968 8724 | Generic "specials menu" boilerplate only |
| The Golden Spoon | 23–25 McBride St, Cockatoo | — | Nothing confirmable |

## C. Broken or parked domains

All three were re-checked in a real browser (not just a fetch tool) — the domains
are dead, not merely awkward to fetch.

| Venue | Address | Problem |
|---|---|---|
| Oaktree Tavern | 367 Forest Rd, The Basin 3154 | `oaktreetavern.com.au` returns **Cloudflare Error 1001 — DNS resolution failure**. The domain is on Cloudflare but has no working DNS, so it is dead rather than merely misconfigured for TLS. Unverified leads: a Thursday musos night, "steak + glass of red $23". Phone 03 9761 0944 |
| Crave Restaurant | 238 Dorset Rd, Boronia 3155 | Domain parked / for sale. Strong aggregator evidence: Mon pizza & pasta, Tue steak, Wed parma $20, Thu burger $20, all 5–9pm |
| FT Local Kitchen and Bar | 40 Forest Rd, Ferntree Gully 3156 | `ftlocalkitchenandbar.com.au` parked, and the suspected replacement `ftkitchenbar.com` is **NXDOMAIN** — it does not exist. Lead: Wed parma & pot $20, 5–9pm. Phone 03 9758 4829 |

## D. Site works, but genuinely publishes no specials

Verified negative — recorded so nobody re-checks them:

- **The Acorn Bar & Restaurant**, 375 Forest Rd, The Basin 3154 —
  `theacorn.com.au`. Menu is six poster images; all six were downloaded and read,
  and every one is a standing menu page (Starters / Mains / Desserts), not a
  specials board. Its "Whats On!" nav link points to `/live-music`, which is
  music only. Unverified lead from aggregators: Sunday Pot & Parma $32,
  12pm–9pm, and a Wednesday steak night. Phone 03 9762 8668.
- **Boronia RSL**, 198 Dorset Rd, Boronia 3155 — bistro ("District 5") serves
  Thu & Fri 6–8pm only. The menu PDF was downloaded and its streams inflated,
  but the text is CID/font-encoded so no readable characters come out, and the
  file dates from 2019 (`/wp-content/uploads/2019/09/`) so it is likely stale
  regardless. The site also refuses screenshotting. Unverified lead: a Tuesday
  steak night at $15/200g, $20/300g.
- **Micawber Tavern** — *not* blocked; five specials recovered and inserted.
  Listed here only as a warning: this page first appeared empty because its
  cards lazy-load below the fold.

## E. Does not exist / misidentified

- **"Emerald Hotel"** — there is **no** venue by this name in Emerald VIC 3782.
  The only real venues with that name are in South Melbourne (415 Clarendon St)
  and Emerald, QLD. Do not add it.
- The actual Emerald pubs/bistros are **The Railway Dog** (5/329–331
  Belgrave-Gembrook Rd) and **Over the Road** (369–371 Belgrave-Gembrook Rd).
  Both were opened in a browser and neither is a specials venue:
  - *The Railway Dog* is a small tavern serving "local snacks and treats";
    its "What's On" link points at `/live-shows`, i.e. live music only.
  - *Over the Road* has become a **daytime café**, open 8:00am–3:30pm daily
    under the UB General Store group. The circulating "$1 wings night / burger
    night / $30 rump steak night" lead pre-dates that change and no longer
    applies — there is no evening trade to run it in.
  - **Elevation at Emerald** is permanently closed.
- No pub named "Kallista Hotel" exists. **Kallista Tea Rooms** is the only food
  venue in Kallista and is not a specials venue.
- No dedicated pub could be found based in **Montrose** or **Lysterfield**;
  both appear to be served by neighbouring suburbs' venues.

---

## Blocked sources

- **`eatdrinkcheap.com.au`** — the single richest source for this region, with
  per-venue and per-suburb pages. Returns HTTP 403 to fetching and hangs a real
  browser tab outright (anti-bot). Almost every unverified lead above traces
  back to it. Getting at this one source would likely resolve the majority of
  this document.
- **Facebook / Instagram** — where the Mode-A and Mode-B venues actually publish.
  Post content generally requires a logged-in session.

## Suggested next steps, cheapest first

1. **Social media pass.** Most Mode-A/B venues post specials as image posters;
   those are now readable via the download-and-read technique. Login may block it.
2. **Phone calls.** ~15 venues. Slow, but the only guaranteed route, and the only
   option for the no-website group.
3. **Ask venues directly.** The app already has a public submission flow
   (`events_pending`) — pointing venues at it makes them maintain their own data.

## Caveat on coverage

Venue discovery was list-driven, not exhaustive: agents were given named venues
per suburb rather than enumerating every licensed premises. Two Ferntree Gully
pubs 700 m apart (Royal FTG and Ferntree Gully Hotel) were missed on the first
pass and only surfaced when queried directly. Assume similar gaps remain,
particularly in Upwey, Tecoma, Selby, Upper Ferntree Gully, Scoresby and
Knoxfield.
