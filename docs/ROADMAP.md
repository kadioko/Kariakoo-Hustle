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

### Left To Work On

- Test the full first-session flow on a physical Android phone.
- Fix any visual overflow, clipped text, or awkward spacing on small screens.
- Verify Swahili and English copy on every screen after recent systems were added.
- Add a lightweight manual QA checklist for core flows.
- Add basic automated unit tests for pure game logic.
- Add app icon and splash assets that match the Kariakoo identity.
- Clean up mojibake/encoding artifacts in older UI emoji strings if they render incorrectly on device.
- Confirm AsyncStorage migration from save versions `1` through `5`.
- Add a visible save/load failure fallback or warning for corrupted saves.
- Add a "version/build" display in Settings tied to `package.json`.

### Acceptance Criteria

- A new player can start, buy stock, end days, unlock content, reset, and switch language without errors.
- TypeScript passes.
- The app runs on Android through Expo Go.
- The save system survives app close/reopen.

## Milestone 2: Core Game Loop Upgrade

Goal: Make every day feel like a choice, not just a button press.

### Left To Work On

- Add mission streaks for completing daily missions multiple days in a row.
- Add weekly goals, such as weekly revenue, profit, or branch expansion.
- Add product category demand modifiers by location.
- Add seasonal modifiers, such as school season, holiday season, rainy season, and tourist season.
- Add stock aging so old inventory becomes harder to sell or needs clearance.
- Add supplier quality tiers: cheap, standard, premium.
- Add product batch quality so not every unit of a product has the same risk.
- Add loan repayment summary and optional early repayment.
- Add warnings before taking a loan if runway is already low.
- Add a "business advice" panel that uses current state to recommend a practical next action.

### Acceptance Criteria

- Players have at least three meaningful choices after every report.
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
- Add haptic feedback where settings allow it.
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

### Left To Work On

- Configure EAS Build.
- Add Android package name and production app metadata.
- Add adaptive icon, splash image, and store graphics.
- Add privacy policy.
- Add app store description in Swahili and English.
- Add crash reporting plan.
- Add basic analytics plan that respects privacy.
- Test install size and cold start time.
- Test offline behavior with airplane mode.
- Test save persistence across app updates.
- Add release checklist.

### Acceptance Criteria

- A tester can install an APK/AAB and play offline.
- App identity is production-ready.
- Store listing copy is ready for review.

## Milestone 7: Fair Monetization Readiness

Goal: Prepare optional monetization without hurting trust.

### Left To Work On

- Add placeholder UI for rewarded ads but keep it disabled until the game is fun.
- Define fair rewarded ad options:
  - Double a small daily bonus
  - Recover part of a bad event
  - Speed up selling animation
  - Get a small supplier tip
- Add cosmetic shop themes:
  - Kariakoo Classic
  - Modern Duka
  - Wholesale Boss
  - Zanzibar Branch
- Add remove-ads option only if ads are implemented.
- Avoid pay-to-win boosts that break business learning.

### Acceptance Criteria

- Monetization is optional.
- Non-paying players can progress fairly.
- No real-money rewards, betting, or cash-out mechanics exist.

## Technical Debt

These items should be addressed before the codebase grows too much:

- Add tests around `salesSimulation`, `economy`, `missions`, `randomEvents`, and save migration.
- Split large screens into smaller components where needed.
- Centralize repeated card/stat patterns.
- Clean up any text encoding artifacts in source files.
- Consider replacing emoji placeholders with a local icon/asset strategy.
- Add linting and formatting scripts.
- Add CI for `npm run tsc`.
- Add a consistent changelog.
- Add typed navigation for all stack and tab routes.

## Open Product Questions

- Should the game be purely day-based, or should idle/offline earnings exist later?
- Should branches generate passive income, or only unlock higher demand and capacity?
- Should loans be event-only, or should players be able to request loans manually?
- Should product quality be visible before buying, or discovered through selling?
- Should English be a full equal translation, or remain a support language behind Swahili?
- Should the game include a tutorial character or keep onboarding minimal?

## Suggested Next Sprint

The next best sprint is **MVP Hardening + Android QA**:

1. Run on a physical Android device.
2. Fix text/spacing/rendering issues.
3. Add unit tests for economy, sales, missions, and save migration.
4. Add release assets: app icon, splash, and store-ready name.
5. Add a `CHANGELOG.md`.
6. Commit and push the current mission/roadmap changes.

This keeps the game moving toward something players can actually test, while protecting the codebase from getting messy.
