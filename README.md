# Kariakoo Hustle: Biashara Empire

> "Anza na meza moja, jenga empire yako."

Kariakoo Hustle is an Android-first Tanzanian business simulation game built with React Native, Expo, and TypeScript. The player starts with 50,000 TZS of fake capital, buys stock in Kariakoo, sells through daily turns, handles street-market events, upgrades the business, hires workers, and expands into new locations.

The MVP is offline-friendly and uses AsyncStorage only. There is no backend, no real-money reward, no betting, and no cash-out mechanic.

## Current Feature Set

| System | Status |
| --- | --- |
| Swahili-first UI with English switch | Done |
| 25 products across 10 categories | Done |
| Demand, risk, margin, and market insight scoring | Done |
| Product risk can cause returns and quality losses | Done |
| Inventory clearance sales for slow stock | Done |
| Daily missions with auto rewards | Done |
| Daily sales simulation | Done |
| 29 random events, including choice events | Done |
| Daily profit/loss reports with expense breakdowns | Done |
| Loans, daily repayments, runway, and debt-aware net worth | Done |
| Dashboard next-move guidance | Done |
| 12 upgrades | Done |
| 7 worker types | Done |
| 10 locations | Done |
| 8 achievements with rewards | Done |
| XP, levels, reputation, and net worth | Done |
| AsyncStorage save/load/reset with save migration | Done |
| Share text placeholder | Done |
| Monetization placeholders, no ads implemented | Done |

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

### Type Check

```bash
npm run tsc
```

## Project Structure

```text
src/
  components/       Reusable UI components
  data/             Products, events, upgrades, workers, locations, achievements
  game/             Economy, sales, events, missions, progression, save defaults, product insights
  navigation/       Stack and tab navigation
  screens/          Game screens
  state/            GameContext and actions
  storage/          AsyncStorage wrapper
  theme/            Colors, spacing, font sizes, shadows
  types/            Shared TypeScript types
  utils/            Formatting and i18n helpers
docs/
  GAME_DESIGN.md    Product/design notes and upgrade roadmap
  BALANCING.md      Economy tuning guide
  ROADMAP.md        Production roadmap and remaining work
```

## How To Play

1. Start with 50,000 TZS at Kariakoo Street Table.
2. Open Soko and buy products with good demand, margin, and risk.
3. Tap Uza Leo to simulate one business day.
4. Review revenue, cost of goods, expenses, event effects, and advice.
5. Reinvest into more stock, upgrades, workers, and locations.
6. Build reputation and net worth until the business becomes an empire.

## Important Game Systems

### Cash and inventory

Cash is spent when buying stock, upgrades, workers, or locations. Inventory has a capacity limit from the base business, current location, and owned upgrades.

Slow stock can be cleared from the Inventory screen at a discount. This gives the player quick cash and frees capacity, but sacrifices some expected selling value.

### Sales simulation

Each day sells a portion of inventory based on:

- Product demand
- Product risk through returned/faulty units
- Current location demand multiplier
- Reputation
- Upgrade boosts
- Worker boosts
- Random daily variance

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

The app saves locally through AsyncStorage. Saves include:

- Cash, day, level, XP, reputation
- Inventory
- Upgrades, workers, locations
- Achievements
- Reports and lifetime totals
- Clearance revenue and discount loss
- Active daily missions and completed mission ids
- Active loans and repayment terms
- Settings and language
- Save version metadata

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
