# Kariakoo Hustle Manual QA Checklist

Use this checklist before each Android demo or release candidate.

## Device Setup

- Install the latest Kariakoo Hustle development build on a physical Android phone.
- Expo Go is not enough because the app includes native AdMob modules.
- Connect to the same network as the dev machine, or use a USB/tunnel Expo connection.
- Start Metro with `npx expo start --dev-client`, then open it from the development build.
- Test on a small-screen Android device if available, ideally 360 x 640 dp or close.

## First Session Flow

- Fresh install or reset progress.
- Splash screen appears without missing image warnings.
- New game starts with language selection before business naming.
- Select Kiswahili and confirm the name screen, tips, dashboard, and tabs use Swahili.
- Reset again, select English, and confirm the same first-session flow uses English.
- Confirm starting values: 50,000 TZS, day 1, level 1, Kariakoo Street Table, no workers.

## Core Game Loop

- Buy starter stock and verify cash decreases and inventory increases.
- Try buying more stock than cash allows and confirm a clear warning appears.
- Try buying more stock than capacity allows and confirm a clear warning appears.
- End the day and verify revenue, expenses, profit/loss, remaining stock, and advice are shown.
- Trigger or encounter a random event and verify the event copy is readable.
- If a choice event appears, choose each option across separate runs and confirm the effect applies.

## Progression

- Verify XP progress changes after selling.
- Verify daily missions appear and completed missions grant rewards.
- Buy an upgrade and confirm its cash cost, owned state, and benefit display.
- Hire a worker after unlocking one and confirm salary affects daily expenses.
- Unlock and switch to another location after enough cash is available.
- Confirm achievements unlock at the expected milestones.

## Settings

- Toggle sound and vibration, close the app, reopen, and confirm values persist.
- Switch languages from Settings and confirm visible screen copy updates.
- Edit business name and confirm it updates on Dashboard and Settings.
- Share business text and confirm the generated message includes net worth.
- Confirm Settings shows `v<package.json version> · build <save version>`.
- Tap the version/build line 7 times and confirm the secret menu opens.
- Apply `KARIOO50K`, `KARIOO2M5`, and `EMPIRE30M` on separate reset runs and confirm cash/net worth changes correctly.
- Open Rewards & Themes and confirm rewarded ad buttons are disabled.
- Confirm the four rewarded ad placeholders are: daily profit, market insider tip, speed delivery, and bad trade recovery.
- Confirm interstitial copy says ads should be very rare and only in safe moments.
- Confirm Remove Ads is not shown as a purchase option while ads are disabled.
- Confirm Premium No-Ads and Expansion Packs are marked as later/disabled roadmap items.
- Confirm cosmetic themes are visible as placeholders only and do not change gameplay balance.
- In a dev-client Android build, confirm rewarded ads use Google test ads before production ads are enabled.
- Confirm closing a rewarded ad early does not grant a reward once real ads are enabled.
- Confirm the app still works offline or with failed ad initialization.

## Save, Load, And Migration

- Close and reopen the app after buying stock; cash and inventory should persist.
- Close and reopen after ending a day; day, reports, missions, and achievements should persist.
- Test saves from versions 1, 2, 3, 4, 5, and 6 with `normalizeGameState`.
- Corrupt the stored save payload during development and confirm the app shows a visible fallback warning instead of a blank screen.
- Reset progress and confirm a clean new game starts.

## Visual QA

- Check Dashboard, Buy Stock, Inventory, Sell, Upgrades, Workers, Locations, Reports, Achievements, Settings, and Events on a small Android screen.
- Test once with gesture navigation and once with the classic three-button Back/Home/Recent navigation bar.
- Confirm the bottom tabs, Main Menu buttons, onboarding controls, modal actions, and final scroll items stay above the Android system navigation area.
- Confirm no clipped button text, overlapping stat labels, or horizontal overflow.
- Confirm long TZS values wrap or shrink gracefully.
- Confirm modal inputs are not covered by the keyboard.
- Confirm emoji/icon strings render correctly on device and no mojibake appears.

## Release Blockers

- App fails to launch on Android.
- First-session language choice is skipped.
- Save/load loses cash, inventory, day, or progress.
- Any screen has unreadable clipped primary text on a small Android phone.
- Corrupted save creates a crash or blank screen.
