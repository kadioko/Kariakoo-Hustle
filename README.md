# Kariakoo Hustle: Biashara Empire

> "Anza na meza moja, jenga empire yako."

Kariakoo Hustle is an Android-first Tanzanian business simulation game built with React Native, Expo, and TypeScript. The player starts with 50,000 TZS of fake capital, buys stock in Kariakoo, sells through daily turns, handles street-market events, upgrades the business, hires workers, and expands into new locations.

The MVP is offline-friendly and uses AsyncStorage only. There is no backend, no real-money reward, no betting, and no cash-out mechanic.

## Current Feature Set

| System | Status |
| --- | --- |
| Swahili-first UI with English switch | Done |
| 30 products across 10 categories (unlocks to level 10) | Done |
| Deterministic daily price fluctuation (buy dips, sell spikes) | Done |
| Dynamic supply & demand — your buying saturates the market | Done |
| Supplier negotiation mini-game (haggle on 10+ unit orders) | Done |
| Trade routes: Dar, Arusha, Mwanza, Zanzibar with regional prices & travel risk | Done |
| Rotating weekly seasons boosting product categories | Done |
| 8-chapter story campaign (Mama, Inspekta Mushi, rivals, legacy) | Done |
| Living rivals: undercuts, worker poaching, alliances + leaderboard | Done |
| Property ladder: rent-free stall, warehouse, landlord income | Done |
| Bank: 3 loan tiers, reputation-based interest, early payoff | Done |
| Profit streaks with escalating bonuses | Done |
| Prestige ("Mtaji wa Ukoo"): permanent legacy bonuses | Done |
| Business School: 9 bilingual financial literacy lessons | Done |
| 33+ random street events, including choice events | Done |
| Daily missions & weekly goals with auto rewards | Done |
| Daily P&L reports, 7-day profit chart, business advisor | Done |
| 12 upgrades · 7 workers (improve with tenure) · 10 locations | Done |
| 14 achievements with rewards | Done |
| XP, levels, reputation, debt-aware net worth | Done |
| Versioned saves (v9) with corruption-safe migration + export/import | Done |
| Haptic feedback, animated reports, level-up celebrations | Done |
| Unit tests for all game systems (`npm test`) | Done |
| Monetization placeholders, no ads implemented | Done |

See `ROADMAP.md` for what's next: art, sound, Supabase multiplayer, Play Store launch.

## Quick Start

### Requirements

- Node.js 18+
- npm
- Expo Go on Android, or an Android emulator

### Install

```bash
npm install
```

### Run on Android

```bash
npx expo start --android
```

Or start Metro and scan the QR code with Expo Go:

```bash
npx expo start
```

### Type Check & Tests

```bash
npm run tsc    # TypeScript check
npm test       # game-logic test suite (node:test via tsx)
```

## Project Structure

```text
src/
  components/       Reusable UI components (Button, Card, Toast, ProgressBar, ...)
  data/             Products, events, rival events, lessons, upgrades, workers, locations, achievements
  game/             Pure game logic — fully unit-testable, no React imports
    dayCycle.ts       runDay(): the whole business day as one pure state transition
    economy.ts        money math, expenses, capacity, net worth, bulk discounts
    salesSimulation.ts  demand model (season, city, saturation, boosts)
    marketPrices.ts   deterministic daily price swings
    marketImpact.ts   player-driven supply & demand
    cities.ts         trade routes & travel
    negotiation.ts    supplier haggling
    story.ts          campaign chapters & goals
    property.ts       ownership ladder
    rivals.ts         NPC traders + reactive events
    prestige.ts       legacy system
    bank.ts, streaks.ts, seasons.ts, missions.ts, weeklyGoals.ts, ...
  navigation/       Stack and tab navigation
  screens/          Game screens (Dashboard, Market, Sell, Travel, Property, Lessons, Bank, ...)
  state/            GameContext — thin React wiring over the pure logic
  storage/          AsyncStorage wrapper
  theme/            Colors, spacing, font sizes, shadows
  types/            Shared TypeScript types
  utils/            Formatting, i18n, haptics
tests/              node:test suites covering every game system
ROADMAP.md          Art, sound, backend/multiplayer, and launch plan
```

## How To Play

1. Start with 50,000 TZS at Kariakoo Street Table.
2. Open Soko and buy products with good demand, margin, and risk — watch the daily price arrows and haggle on big orders.
3. Tap Uza Leo to simulate one business day.
4. Review revenue, cost of goods, expenses, event effects, and advice.
5. Reinvest into stock, upgrades, workers, locations, and property; take loans when the math works.
6. Travel to Arusha, Mwanza, or Zanzibar for regional bargains; follow the story chapters.
7. Beat your rivals, reach 10M net worth, and prestige into a family legacy.

## Important Game Systems

### Cash and inventory

Cash is spent when buying stock, upgrades, workers, or locations. Inventory has a capacity limit from the base business, current location, and owned upgrades.

Slow stock can be cleared from the Inventory screen at a discount. This gives the player quick cash and frees capacity, but sacrifices some expected selling value.

### Sales simulation

Each day sells a portion of inventory based on:

- Product demand and today's deterministic sell price
- Product risk through returned/faulty units
- Current location demand multiplier and current city demand factor
- Active season (weekly category boosts)
- Market saturation from your own recent buying
- Reputation, upgrade boosts, worker boosts (plus tenure), legacy bonus
- Random daily variance

### Prices, saturation & haggling

Buy/sell prices swing deterministically each day (`marketPrices.ts`) — the same day always
quotes the same price. Buying heavily saturates a product's market (`marketImpact.ts`):
suppliers charge up to +15% more and sales slow up to 25%, decaying 30% per night.
Orders of 10+ units unlock haggling (`negotiation.ts`) with reputation-driven odds.

### Trade routes, property & story

Travel between four cities with regional specialties (cheaper buy prices) and demand levels;
trips cost cash, take a day, and risk stock loss. Properties remove rent, add capacity, or pay
daily landlord income. The 8-chapter story (`story.ts`) tracks goals on the dashboard and pays
rewards through the day cycle. Rivals grow deterministically and fire reactive events.

Risky products can create quality losses. Returned/faulty units reduce collected revenue, still consume stock, and can hurt reputation. Workers and protection upgrades reduce that risk.

### Random events

Non-choice events apply during the day. Choice events pause for the player after the report and then apply the selected effect.

Event loss reduction from upgrades and workers can soften negative cash and inventory-loss events.

### Loans and runway

Some choice events can create a loan. Loans add cash immediately, then create daily repayment expenses until the balance is cleared.

Runway is shown on the dashboard and estimates how many days current cash can cover today-like expenses. Net worth subtracts outstanding loan balance so debt cannot inflate the business value.

### Daily missions

Each day generates two small missions based on level, such as hitting revenue, units sold, net profit, or avoiding quality losses. Missions are evaluated when the day ends and rewards are paid automatically.

### Save system

The app saves locally through AsyncStorage (schema v9). Saves include:

- Cash, day, level, XP, reputation, streaks, legacy level
- Inventory and market saturation
- Upgrades, workers (+hire days), locations, properties, current city
- Achievements, story progress, lessons read
- Reports and lifetime totals
- Active daily missions, weekly goals, and loans
- Settings and language
- Save version metadata

Saves are validated on load (NaN/corrupt values sanitized) and migrate automatically across
versions. Players can export/import saves as text from Settings → Save Backup.

New fields should be added to `createInitialState` and protected in `normalizeGameState`.

## Adding Content

### Add a product

Edit `src/data/products.ts`:

```ts
{
  id: 'new_product',
  name: 'Jina la Bidhaa',
  nameEn: 'Product Name',
  category: 'phone_accessories',
  buyPrice: 5000,
  sellPrice: 9000,
  demand: 'high',
  risk: 'low',
  unlockLevel: 2,
  description: 'Maelezo mafupi ya Kiswahili.',
  descriptionEn: 'Short English description.',
  emoji: '📦',
}
```

### Add an event

Edit `src/data/events.ts`:

```ts
{
  id: 'new_event',
  type: 'positive',
  title: 'Jina la Tukio',
  titleEn: 'Event Name',
  description: 'Maelezo ya tukio.',
  descriptionEn: 'Event description.',
  emoji: '⚡',
  probability: 0.05,
  minLevel: 1,
  effect: { cashPercent: 0.1, reputation: 1 },
}
```

For a choice event, use `type: 'choice'` and add a `choices` array with localized labels and effect text.

### Add an upgrade

Edit `src/data/upgrades.ts`:

```ts
{
  id: 'new_upgrade',
  name: 'Jina la Boresho',
  nameEn: 'Upgrade Name',
  cost: 80000,
  unlockLevel: 3,
  benefit: 'Mauzo +10%',
  benefitEn: 'Sales +10%',
  description: 'Maelezo ya Kiswahili.',
  descriptionEn: 'English description.',
  emoji: '🔧',
  effects: { salesBoostPercent: 0.1 },
}
```

### Add a location

Edit `src/data/locations.ts`:

```ts
{
  id: 'new_location',
  name: 'Jina la Eneo',
  nameEn: 'Location Name',
  unlockCost: 1000000,
  dailyRent: 15000,
  demandMultiplier: 1.6,
  capacityBonus: 30,
  risk: 'medium',
  description: 'Maelezo ya Kiswahili.',
  descriptionEn: 'English description.',
  emoji: '🏪',
}
```

### Add UI copy

Edit `src/utils/i18n.ts`:

```ts
new_key: { sw: 'Nakala ya Kiswahili', en: 'English copy' },
```

Then use:

```ts
t('new_key', language)
```

## Build Notes

This prototype is Expo-managed and Android-first. For a production APK/AAB, use EAS Build:

```bash
npm install -g eas-cli
eas login
eas build --platform android
```

## Design Guardrails

- Keep Swahili as the main voice.
- Make losses dramatic but not progress-destroying.
- Keep early game fast and encouraging.
- Make mid-game decisions harder through rent, salaries, risk, and capacity.
- Avoid real-money mechanics.
- Keep the app lightweight and offline-friendly.

Kariakoo haijalala. Pesa izunguke.
