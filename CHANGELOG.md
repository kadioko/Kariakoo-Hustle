# Changelog

## Unreleased

Save schema: **v13** (auto-migrates).

### Added
- **Cash runway guidance** on the day-result screen: players can see cash after today, the next
  day's operating cost, and how many days their current cash can sustain the biashara.
- **Focused tomorrow-plan restocking**: when the advisor recommends a winning product, its action
  now opens that product directly in the Market instead of making the player search for it.
- **Supplier relationships**: repeat orders grow trust with the supplier network, unlocking up to
  6% off quoted buy prices and a modest haggling advantage. Premium quality builds trust faster;
  hard haggling deliberately slows it down.
- **Unified live market quotes**: the Market, Smart Picks, daily advisor, and checkout now all
  use the exact same city, saturation, and supplier-trust price calculation.

### Fixed
- **Story goal progress** now respects reputation requirements, so the Inspector chapter cannot
  appear complete until both its day and reputation requirements are met.
- The selling-result mascot animation now stops cleanly when leaving the screen.

### Updated
- Expo runtime, dev-client, splash-screen, and Metro runtime patch dependencies are aligned with
  the current Expo SDK 57-compatible releases.
- Test coverage now includes cash-runway boundaries, story reputation gating, and focused
  tomorrow-plan restocking, supplier-trust pricing, progression, migration behavior, and
  live-quote consistency.

## v1.3.0 — "Tanzania Nzima" (world systems update)

Save schema: **v9** (auto-migrates).

### Added
- **Trade routes** (`src/game/cities.ts`, TravelScreen): Dar es Salaam, Arusha (L4), Mwanza (L6),
  Zanzibar (L8). Regional buy-price specialties, city demand factors, travel costs, travel
  takes a day, and 6–10% risk of losing stock on the road.
- **Dynamic supply & demand** (`src/game/marketImpact.ts`): your purchases saturate a product's
  market — buy prices rise up to +15%, sell rates drop up to −25%, decaying 30% nightly.
  Saturation warnings on market cards and in the buy modal.
- **Negotiation mini-game** (`src/game/negotiation.ts`): haggle on orders of 10+ units, up to
  3 rounds, asks of −5/10/15%. Reputation improves odds; pushing too hard offends the supplier
  and locks the price. Counter-offers meet you halfway.
- **Story campaign** (`src/game/story.ts`): 8 chapters with characters (Mama, Mzee Salim,
  Inspekta Mushi, Kaka Bofu, Bi. Zuhura). Narrative card with goal progress on the dashboard,
  rewards paid through the day cycle, chapter-complete toasts. Story persists across prestige.
- **Property ownership** (`src/game/property.ts`, PropertyScreen): buy your Kariakoo spot
  (rent-free), Ilala warehouse (+25 capacity), rental shop and Kariakoo building (passive
  daily income, shown in the P&L). Property value counts toward net worth.
- **Living rivals** (`src/data/rivalEvents.ts`): Kaka Bofu undercuts you when you're ahead,
  Mzee Juma tries to poach your workers, Dada Neema offers alliances, and Bofu's counterfeit
  bust sends his customers your way. Rival events roll before street events each day.
- **Financial literacy — Business School** (`src/data/lessons.ts`, LessonsScreen): 9 bilingual
  lessons (margin, cash flow, stock turnover, debt, diversification, reputation, haggling,
  assets, compounding), unlocked by gameplay, +15 XP per first read.
- **Juice**: result-screen hero spring-pop on profit / shake on loss.
- `ROADMAP.md`: art asset specs, sound plan, Supabase tournament/cloud-save schema,
  EAS/Play Store launch path, education-partnership angle.
- Tests: `tests/worldSystems.test.ts` covering all of the above.

## v1.2.0 — "Mtaji wa Ukoo" (depth update)

Save schema: **v8** (auto-migrates).

### Added
- **Prestige**: at 10M net worth, restart with +10% sales per legacy level and growing starting
  capital. Achievements, best streak, name, and settings carry over.
- **Seasons**: four rotating weekly seasons boosting 2–3 product categories by 25%, with
  dashboard banner and market pills.
- **Rival leaderboard**: three deterministic NPC traders raced on the dashboard.
- **Bulk discounts**: 20+ units −5%, 50+ units −10%.
- **Worker tenure**: +0.5% sales per 10 days employed per worker (cap +5%).
- **Save export/import**: share the save as text, paste to restore (Settings → Save Backup).
- **Level-up celebrations** and a 7-day profit bar chart in Reports.

### Changed
- Extracted the entire day cycle from React into pure `runDay()` (`src/game/dayCycle.ts`)
  with injectable randomness — the core loop is now fully unit-testable.

## v1.1.0 — "Soko Live" (economy update)

Save schema: **v7** (auto-migrates).

### Added
- **Daily price fluctuation**: deterministic per-day buy/sell prices with trend arrows and
  deal/expensive indicators across Market and Inventory.
- **Bank & loans**: three tiers gated by level, reputation cuts interest up to 40%,
  max 2 active loans, early payoff with 3% discount and +1 reputation.
- **Profit streaks**: consecutive profitable days earn 2%/day bonus (cap 10%).
- **Late-game content**: 6 new products (levels 7–10), 4 events, 6 achievements.
- **Haptics**: vibration setting now works (day results, achievements, purchases, loans).
- Bankruptcy rescue: advisor points broke players to the bank.
- Test suite: economy, prices, bank, streaks, progression, save normalization.

### Fixed
- Corrupt saves with NaN/Infinity values are sanitized on load.
- Test script now runs cross-platform (`tsx --test tests`).
