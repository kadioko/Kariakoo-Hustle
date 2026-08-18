# Kariakoo Hustle — Launch Roadmap

The gameplay layer is built. This file covers the four remaining workstreams that need
assets, packages, or accounts: art, sound, backend/multiplayer, and shipping.

---

## 1. Real art over emoji

**Goal:** replace emoji with flat illustrations for products, characters, cities, and properties.

**Current state:** app icon, adaptive icon, splash, Play feature graphic, and initial store screenshots
already exist in `assets/`. Product and world illustrations are the remaining visual-content work.

**Asset list (priority order):**
| Set | Count | Used in |
|---|---|---|
| Products | 30 | MarketScreen, InventoryScreen, reports |
| Story characters (Mama, Mzee Salim, Inspekta Mushi, Bi. Zuhura) | 4 | Story card |
| Rivals (Mzee Juma, Dada Neema, Kaka Bofu) | 3 | Leaderboard, rival events |
| Cities (Dar, Arusha, Mwanza, Zanzibar) | 4 | TravelScreen headers |
| Properties | 4 | PropertyScreen |
| App icon + splash | 2 | Store listing |

**Specs:** 512×512 PNG with transparency, flat/vector style, warm palette matching
`src/theme` (primary `#0E7C5A`, accent `#F5A524`). Keep one consistent style across all sets.

**Process:** generate candidates with an image model (consistent style prompt), curate,
then have a designer pass for the icon/splash. Store under `assets/art/<set>/<id>.png`
matching data ids (e.g. `assets/art/products/phone_case.png`) so wiring is mechanical:
add an `image` field next to each `emoji` field and render `<Image>` with emoji fallback.

## 2. Sound & music

**Current state:** the app is on Expo SDK 57. Choose a compatible Expo audio package and validate a
development build before adding sound; audio is a polish task, not a launch blocker.

**Sound list:** cash register (sale), coin clink (buy), whoosh (travel), page turn (lessons),
drum hit (level up), celebration (chapter/prestige), ambient market loop (dashboard),
bongo flava-inspired menu loop (~60s, royalty-free or commissioned).

**Wiring:** mirror `src/utils/haptics.ts` with `src/utils/sound.ts` — a `play(settings, kind)`
helper gated by `settings.sound` (the toggle already exists and persists). Call sites are the
same places `buzz()` is already called.

## 3. Backend: leaderboards, tournaments, cloud saves (Supabase)

**Free tier is enough to start.**

**Schema:**
```sql
players   (id uuid pk, device_id text unique, name text, created_at timestamptz)
saves     (player_id fk, payload jsonb, save_version int, updated_at timestamptz)
runs      (id, player_id fk, week text, net_worth bigint, day int, updated_at)
friends   (player_id fk, friend_code text unique)
```

**Weekly tournament:** everyone plays the same seeded market — the price system is already
deterministic (`dayPriceFor(product, day)`), so seed the hash with a week id
(`hashSeed(day, productId, salt + weekNumber)`) and all players see identical prices.
Submit `netWorth` at day end to `runs`; leaderboard = top runs for the current week.

**Client steps:** `npm i @supabase/supabase-js`, anonymous device auth, debounced save upload
(reuse `exportSave()` JSON as the payload), pull-to-refresh leaderboard screen.
Keep offline-first: the local save remains the source of truth; cloud is a mirror.

## 4. Ship it

1. **Physical Android QA** — build a preview APK with EAS, test the full bilingual first session,
   pricing flow, save migration, offline mode, and small-screen navigation using `docs/QA_CHECKLIST.md`.
2. **Release readiness** — keep the Expo 57 dependency set aligned, increment app/version code only
   for a deliberate release, and follow `docs/ANDROID_RELEASE_BUILD.md` for signing and AAB checks.
3. **Store prep** — Play Console account ($25 one-time), listing in Swahili + English,
   screenshots from the app (Dashboard, Market, Story, Travel), content rating questionnaire
   (no real gambling/money — it's simulated trade).
4. **Analytics** — PostHog or Amplitude free tier; track: day_completed, market_quote_viewed,
   supplier_trust_tier, prestige, chapter_completed,
   lesson_read, retention. These five answer most balancing questions.
5. **OTA updates** — `eas update` for JS-only fixes without store review.
6. **Soft launch:** Tanzania + Kenya first; the Swahili-first content is the differentiator.

## 5. Education angle (the moat)

The lessons system (`src/data/lessons.ts`) is the seed. To grow it:
- Map each lesson to a curriculum concept (entrepreneurship syllabi in TZ secondary schools).
- Add a "teacher mode" export: class code, students' lesson completion as CSV.
- Approach NGOs running financial literacy programs (e.g. youth entrepreneurship orgs in Dar)
  with a pilot: the game is free, offline-capable, and in Swahili — rare combination.

---

*Everything above this file's scope — trade routes, unified live market quotes, supplier trust,
negotiation, story, property, living rivals, lessons, prestige, seasons, bank, and streaks — is
implemented and covered by the pure-logic test suite in `tests/`.*
