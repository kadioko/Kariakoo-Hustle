# Balancing Guide

## Goals

Early game should feel generous, but not explosive. Mid-game should push the player to think about cash flow, rent, capacity, and product mix.

## Main Knobs

| File | Purpose |
| --- | --- |
| `src/game/economy.ts` | Starting cash, capacity, rent/transport/salary formulas |
| `src/game/salesSimulation.ts` | Demand sell rates and daily variance |
| `src/game/randomEvents.ts` | Event frequency and loss reduction |
| `src/game/progression.ts` | XP curve and level pace |
| `src/game/missions.ts` | Daily mission targets and rewards |
| `src/game/productInsights.ts` | Product recommendation scoring |
| `src/game/marketQuote.ts` | Live quote calculation shared by advisor, Market, and checkout |
| `src/game/supplierTrust.ts` | Supplier trust progression, price reduction, and relationship tiers |
| `src/data/products.ts` | Product price, demand, risk, unlock level |
| `src/data/events.ts` | Event probability and effect size |
| `src/data/locations.ts` | Rent, demand multiplier, capacity bonus |
| `src/data/upgrades.ts` | Upgrade cost and power |
| `src/data/workers.ts` | Salary and worker benefit |

## Economy Targets

### Day 1-3

- Player should be able to buy a small mixed basket.
- Most days should sell some stock.
- Losses should be small and teachable.
- First achievement should arrive quickly.

### Day 4-10

- Player should choose between more stock and first upgrades.
- Capacity should start to matter.
- Rent/transport should be visible but not crushing.

### Level 3+

- Workers become useful but salaries should matter.
- Bigger products should offer better profit but tie up cash.
- Riskier locations should create higher revenue and higher expenses.
- Loans should feel helpful but visible in daily expenses.

## Product Pricing Tips

Good starter products:

- Buy price under 6,000 TZS
- Sell margin between 40% and 110%
- Low or medium risk
- Medium to very high demand

When tuning starter prices, check the live quote rather than only the product base price. City
specialties, saturation, daily price movement, and supplier trust can all change what the player pays.

Good mid-game products:

- Buy price from 8,000 to 25,000 TZS
- Higher absolute profit
- Medium risk
- Unlock level 2-4

Good late-game products:

- Buy price above 25,000 TZS
- High profit but slower movement
- Medium or high risk
- Unlock level 5+

## Risk and Quality Loss

Product `risk` affects returned/faulty units during daily sales:

- `low`: tiny return chance
- `medium`: visible return chance
- `high`: meaningful return chance

Returned/faulty units reduce revenue, consume stock, and can reduce reputation. The stock manager and protection-style upgrades reduce this hit.

Use high risk for products with attractive margins or expensive imported/electronic stock. Avoid making starter products high risk unless their price is very low.

## Clearance Sales

Inventory can be cleared manually at a discount. Clearance should be worse than waiting for normal demand, but useful when:

- Capacity is full
- Cash runway is low
- The player overbought a slow product
- A high-risk product is tying up money

Clearance prices are based on product risk in `src/game/economy.ts`. Higher-risk products receive a deeper discount.

## Supplier Trust

Supplier trust should make consistent trading feel rewarding without becoming the dominant source of
profit. The current cap is a 6% quote reduction at 100 trust, with a smaller haggling bonus.

- Small, standard orders should grow trust steadily.
- Premium orders can grow trust faster because they signal a quality-focused trader.
- Budget orders and deep (10-15%) haggling should slow that growth, but never erase a player's save.
- Test a new save, a high-trust save, and a saturated product before changing these values.

Do not increase the cap casually: a large permanent supplier discount would make cash-flow, city
specialties, and bulk discounts less meaningful.

## Random Event Tips

Use event probability as a relative weight, not a guaranteed chance. The event roller first checks the no-event chance, then chooses among eligible event weights.

Early negative events should usually be:

- Small cash loss
- Small reputation loss
- Small inventory loss

Late negative events can be larger if the player has access to protection upgrades, workers, or better cash flow.

## Loan Tuning

Loans are created through event effects:

```ts
effect: {
  cash: 30000,
  loan: { principal: 30000, amountDue: 35000, termDays: 5 },
}
```

Keep early loans small:

- Principal around 30,000 to 80,000 TZS
- Interest around 10% to 25%
- Term around 4 to 8 days

If daily repayment is larger than expected early-game gross profit, the loan will feel punitive. Use the dashboard runway value to sanity-check this.

## Daily Mission Tuning

Daily missions are generated in `src/game/missions.ts` from day and level. Keep them small enough that one or two are achievable on a normal day:

- Revenue targets should be reachable with a reasonable stock basket.
- Unit targets should encourage fast-moving goods.
- Profit targets should reward good buying decisions.
- No-quality-loss missions teach players to manage risk.

Rewards should feel nice but not become the main income source. XP and reputation are safer rewards than large cash payouts.

## Report Checks

After changing balance, play at least 10 simulated days and check:

- Did the player run out of cash too easily?
- Did net worth grow too fast?
- Did rent feel meaningful?
- Did high-demand starter products move faster than luxury items?
- Did riskier products feel tempting but not mandatory?
- Did quality losses feel educational rather than random punishment?
- Did clearance feel like a cash-flow tool rather than the best default strategy?
- Did missions encourage good play without forcing one product strategy?
- Did the daily advisor, Market card, and checkout quote agree for the same product?
- Did supplier trust help a reliable trader without making premium quality or hard haggling an automatic choice?

## Save Migration

When adding new fields to `GameState`:

1. Add them to `src/types/index.ts`.
2. Add default values in `src/game/saveGame.ts`.
3. Update `normalizeGameState` so old saves keep working.
4. Type check with `npm run typecheck`.
