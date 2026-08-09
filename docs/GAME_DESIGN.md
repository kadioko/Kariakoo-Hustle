# Game Design Notes

## Product Promise

Kariakoo Hustle: Biashara Empire should feel like a local Tanzanian hustle story, not a generic idle tycoon. The player learns basic business thinking through fast, readable choices:

- What stock should I buy?
- How much cash should I keep?
- Should I chase margin or fast demand?
- Can I afford rent, salaries, and expansion?
- Is this event an opportunity or a trap?

## MVP Player Journey

1. Day 1: Buy starter products with 50,000 TZS.
2. Days 2-5: Learn demand, profit margin, and capacity.
3. Early growth: Buy first upgrade and reach 100,000 TZS cash.
4. Mid-game: Hire workers and unlock better locations.
5. Expansion: Build multiple branches and chase net worth milestones.

## Current Upgrade Highlights

- Market product insight score helps players choose stock.
- Daily reports show expense breakdowns and localized event details.
- Event inventory losses now affect unsold stock after daily sales.
- Save data has version metadata and normalization for future fields.
- Loans now create real repayment pressure instead of being free cash.
- Dashboard shows runway, active debt, and the next product/upgrade/worker/location goals.
- Product risk now creates returned/faulty units, quality losses, and reputation pressure.
- Inventory clearance lets players recover cash from slow stock at a visible discount.
- Supplier quality is a purchase decision: budget batches are cheaper but create more returns, while premium batches cost more and protect reputation.
- Daily reports trace returned units and lost sales value to the exact product, making supplier-quality decisions learnable instead of mysterious.
- Before selling, players see a break-even target based on fixed costs, property income, current prices, and the weighted margin of stock on hand.
- Market purchases show cash remaining and protect a suggested two-day operating reserve for rent, transport, salaries, and loan payments.
- Stock aging is gentle: stock has a three-day grace period, then gradually sells slower instead of disappearing or creating unfair losses.
- Daily missions create short-term goals and automatic rewards after each completed day.
- Mission streaks reward completing all daily missions consistently, with small capped bonuses at 3 and 7 days.
- First-session tutorial steps guide players through stock, selling, reports, upgrades, and the first cash milestone.
- Weekly goals add longer-term targets without introducing pay-to-win pressure.
- Business advisor warnings explain cash runway, rent pressure, risky stock, slow stock, and loss recovery.
- Reports now include day analysis: what went well, what hurt profit, worker notes, and advice for tomorrow.
- Every daily result now ends with three contextual next actions based on profit, quality, stock, cash pressure, and reinvestment opportunities.

## Next Good Upgrades

### 1. Mission streaks and weekly goals

Daily missions are simple one-day goals. A future layer can add:

- 3-day streak bonuses
- Weekly revenue goals
- Location-specific missions
- Product-category missions
- Special holiday missions

### 2. Deeper debt and loan system

The MVP has simple daily-repayment loans. A fuller system can add:

- Principal
- Interest
- Due day
- Missed-payment penalties
- Reputation effect
- Optional early repayment

### 3. Seasonal calendar

Add weekly or monthly modifiers:

- Back-to-school boosts bags and school supplies.
- Rainy days hurt foot traffic but help umbrellas/rain products.
- Holiday season boosts clothes, food, cosmetics, and gifts.

### 4. Customer segments

Different locations can favor different products:

- Kariakoo: phone accessories, clothes, imported goods
- Mwenge: food, shoes, school supplies
- Mlimani: electronics, cosmetics, fashion
- Arusha/Zanzibar: tourism-friendly products

### 5. Branch managers

Let unlocked locations generate smaller passive income if a branch manager is hired.

## Tone Guide

Use natural, friendly Swahili:

- "Boss, stock imeisha!"
- "Pesa izunguke."
- "Mzigo huu unaenda."
- "Usijaze stock yote hapa."
- "Biashara ni stamina."

Avoid overly formal or classroom-style copy unless it is inside a report/advice moment.

## Monetization Guardrails

Ads can be added later, but the game should feel premium and remain fair:

- Rewarded ad to double an eligible daily profit bonus with a cap
- Rewarded ad to get a market insider tip
- Rewarded ad to speed up delivery or selling presentation
- Rewarded ad to recover part of a bad trade
- Very few interstitials, never during important business decisions
- Cosmetic shop themes
- Remove ads option only if ads are implemented
- Paid expansion packs can add content later, but never short-cut business learning

Current placeholder themes are Kariakoo Classic, Modern Duka, Wholesale Boss, and Zanzibar Branch. These should stay cosmetic only. Do not add gambling, betting, cash-out, real-money reward mechanics, or paid boosts that replace learning cash flow.
