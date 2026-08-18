# Kariakoo Hustle: Biashara Empire Roadmap

This roadmap turns the current prototype into a stronger Android-first MVP, then a release-ready Tanzanian business simulation game. The goal is to keep the game lightweight, offline-friendly, Swahili-first, and fun while adding enough depth for players to return.

## Current Status

The project is already a playable Expo/React Native prototype with the core biashara loop:

- Buy stock with fake TZS.
- Sell through an end-day simulation.
- Handle random events and choice events.
- Manage cash, rent, transport, loans, stock capacity, quality risk, and clearance sales.
- Unlock products, workers, upgrades, achievements, and locations.
- Save locally with AsyncStorage.
- Switch between Swahili and English.
- Track reports, net worth, reputation, and progression.

## Product Vision

Kariakoo Hustle should become the go-to casual business simulation for Tanzanian and East African players: local, funny, educational, simple to start, but deep enough to teach real cash-flow instincts.

The experience should feel like:

- Swahili-first and proudly local.
- Realistic enough to teach business habits.
- Light enough to run well on affordable Android phones.
- Offline-friendly and low-data.
- Fair, with no gambling, betting, cash-out, or pay-to-win systems.

## Roadmap Priorities

| Priority | Theme | Why It Matters |
| --- | --- | --- |
| P0 | Stability and Android readiness | The MVP must run smoothly before adding more systems. |
| P1 | Game loop depth | Players need meaningful reasons to return and make decisions. |
| P1 | UI/UX polish | The game should feel like a real mobile game, not a form app. |
| P2 | Content expansion | More products, events, and locations create replay value. |
| P2 | Analytics and balance tools | The economy needs tuning based on actual play sessions. |
| P3 | Monetization readiness | Add fair optional monetization only after the game is fun. |

## Milestone 1: MVP Hardening

Goal: Make the current prototype stable, understandable, and testable on Android.

### Completed Foundation

- First-session language selection, bilingual UI, small-screen safe-area handling, and a scrollable More screen are implemented.
- A manual QA checklist, 113 pure-logic unit tests, Android identity assets, corrupt-save fallback, version/build display, and save migrations through schema v13 are in place.
- Cash runway, break-even, purchase reserve, daily reports, and contextual next actions make the financial loop legible.

### Remaining Validation

- Test the full first-session flow on at least one small physical Android phone in both gesture and three-button navigation modes.
- Verify Kiswahili and English on every screen after new content is introduced.
- Confirm save persistence and v1-v13 migration with real historical save payloads on a development build.
- Record and fix any device-only emoji, keyboard, text-wrap, or safe-area issues.

### Acceptance Criteria

- A new player can start, buy stock, end days, unlock content, reset, and switch language without errors.
- TypeScript passes.
- The app runs on an Android development or preview build.
- The save system survives app close/reopen.

## Milestone 2: Core Game Loop Upgrade

Goal: Make every day feel like a choice, not just a button press.

### Completed Foundation

- Daily missions, weekly goals, location category boosts, rotating seasons, stock aging, clearance, supplier quality, loan payoff, and contextual advice are implemented.
- Supplier trust adds a small long-term relationship incentive without making the economy pay-to-win.
- Smart Picks, the daily market brief, product cards, and checkout share one live quote calculation.

### Next Depth Work

- Add more weekly-goal variants and location-specific missions after observing real player behavior.
- Explore category-specific stock aging only if it creates clear, teachable decisions.
- Add a loan-runway warning at the point of taking a loan, with no forced restriction.
- Continue reducing decision fatigue through direct links from advice to the relevant product or screen.

### Acceptance Criteria

- Players have at least three meaningful contextual choices after every report. Implemented.
- Risky products feel tempting but not mandatory.
- Clearance sales are useful, but not the optimal default strategy.
- Missions create return motivation without feeling like chores.

## Milestone 3: Content Expansion

Goal: Give the prototype enough content for a longer play session.

### Left To Work On

- Expand products from 25 to 60+.
- Expand random events from 29 to 60+.
- Add more choice events with genuine tradeoffs.
- Add product category packs:
  - Phone accessories
  - Clothes and fashion
  - Cosmetics
  - Electronics
  - Food and drinks
  - Spare parts
  - School supplies
  - Home items
  - Imported goods
- Add more achievements, including:
  - First loan repaid
  - First clearance sale
  - 7-day survival
  - Zero-loss day
  - First 5 million TZS net worth
  - All Dar locations unlocked
- Add more location flavor and local market descriptions.
- Add late-game branches with branch managers and passive branch summaries.

### Acceptance Criteria

- A player can play for at least 45-60 minutes before content feels repetitive.
- Each product category has a clear gameplay identity.
- Each location changes player strategy.

## Milestone 4: UI/UX Polish

Goal: Make the app feel premium, local, and easy for casual users.

### Left To Work On

- Add proper icon set instead of relying mainly on emoji placeholders.
- Add consistent visual language for:
  - Profit
  - Loss
  - Risk
  - Demand
  - Debt
  - Reputation
  - Missions
- Add smoother screen transitions and button feedback.
- Add empty-state illustrations or lightweight local market graphics.
- Add better product cards for locked/unlocked states.
- Improve the end-day animation with clearer stages.
- Add sound placeholders or simple local-inspired UI sounds.
- Improve accessibility:
  - Larger tap targets
  - Better contrast
  - Dynamic text safety
  - Screen-reader labels for core actions

### Acceptance Criteria

- The game looks intentional on small Android screens.
- Important numbers are scannable within two seconds.
- Players always know what to do next.

## Milestone 5: Balance and Economy Testing

Goal: Tune the game so progress feels rewarding but not too fast.

### Left To Work On

- Build a simulation script that runs 30-100 fake days with simple strategies.
- Compare strategies:
  - Fast turnover
  - High margin
  - Low risk
  - Aggressive loans
  - Upgrade-first
  - Location-first
- Tune sell rates by product demand.
- Tune return rates by product risk.
- Tune rent, salary, storage, transport, and loan payments.
- Tune XP and level progression.
- Tune mission rewards so they do not inflate the economy.
- Tune achievement rewards.
- Verify that supplier trust's 6% quote cap remains helpful but not dominant.
- Confirm live Market, advisor, and checkout quotes remain aligned after every pricing change.
- Define target pacing:
  - First upgrade by day 2-4
  - First worker by day 5-8
  - First location expansion by day 10-18
  - First 1 million TZS net worth by a reasonable mid-game window

### Acceptance Criteria

- A careful player progresses steadily.
- A risky player can win faster but experiences real setbacks.
- Early losses teach decisions without destroying the save.

## Milestone 6: Android Release Preparation

Goal: Prepare for a closed test or public beta.

### Completed Foundation

- EAS development, preview APK, and production AAB profiles are configured.
- The Android package, app icon, adaptive icon, splash, feature graphic, screenshots, privacy-policy draft, Play listing copy, and release documentation are present.

### Left To Work On

- Add crash reporting plan.
- Add basic analytics plan that respects privacy.
- Test install size and cold start time.
- Test offline behavior with airplane mode.
- Test save persistence across app updates.
- Host the privacy policy on a stable public URL and verify the final Play Console fields against the submitted binary.

### Acceptance Criteria

- A tester can install an APK/AAB and play offline.
- App identity is production-ready.
- Store listing copy is ready for review.

## Milestone 7: Fair Monetization Readiness

Goal: Prepare optional monetization without hurting trust.

### Completed Foundation

- Placeholder UI for rewarded ads exists but is disabled until the game is fun.
- Fair rewarded ad options are defined:
  - Double an eligible daily profit bonus with a cap
  - Get a market insider tip
  - Speed up delivery or selling presentation
  - Recover part of a bad trade
- Interstitial policy is defined: very few, safe moments only, never during important business decisions.
- Premium roadmap is defined for no-ads and paid expansion packs, both disabled until ads/content systems exist.
- Cosmetic shop themes are defined:
  - Kariakoo Classic
  - Modern Duka
  - Wholesale Boss
  - Zanzibar Branch
- Remove Ads is intentionally not a purchase option because ads are not implemented.
- AdMob package, Android App ID, rewarded unit ID, and mostly-disabled interstitial unit ID are configured for a future dev-client build.
- Reward handlers exist for market tips, bad-trade recovery, speed delivery, and capped daily profit bonus.

### Left To Work On

- Validate with players that the core loop is fun before enabling any ad SDK.
- Test AdMob on a real Android development build.
- Host the prepared privacy policy, complete Play Console ads declaration, and add consent flow before enabling real ads.
- Ship Market Insider Tip first, then bad-trade recovery, then speed delivery, then capped daily profit bonus.
- Add real cosmetic theme switching only after the base UI is stable.
- Design paid expansion packs around new cities, products, and story events rather than progression boosts.
- Keep avoiding pay-to-win boosts that break business learning.

### Acceptance Criteria

- Monetization is optional.
- Non-paying players can progress fairly.
- No real-money rewards, betting, or cash-out mechanics exist.

## Technical Debt

These items should be addressed before the codebase grows too much:

- Maintain coverage for pure game logic and add regression tests whenever pricing, sales, events, or migration behavior changes.
- Split large screens into smaller components where needed.
- Centralize repeated card/stat patterns.
- Clean up any text encoding artifacts in source files.
- Consider replacing emoji placeholders with a local icon/asset strategy.
- Add linting and formatting scripts.
- Add CI for `npm run typecheck`.
- Add typed navigation for all stack and tab routes.

## Open Product Questions

- Should the game be purely day-based, or should idle/offline earnings exist later?
- Should branches generate passive income, or only unlock higher demand and capacity?
- Should loans be event-only, or should players be able to request loans manually?
- Should product quality be visible before buying, or discovered through selling?
- Should English be a full equal translation, or remain a support language behind Swahili?
- Should the game include a tutorial character or keep onboarding minimal?

## Suggested Next Sprint

The next best sprint is **Physical Android QA + Balance Telemetry Plan**:

1. Install a preview build on at least one small Android phone and complete `docs/QA_CHECKLIST.md`.
2. Run representative 30-100 day economy simulations before retuning rewards, costs, or price multipliers.
3. Define a privacy-respecting analytics/crash-reporting plan before a broader closed test.
4. Expand content only after testers confirm that the current market, quality, cash-flow, and supplier-trust decisions are easy to understand.

This protects the existing depth while turning real tester behavior into the next set of product decisions.
