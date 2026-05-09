# Kariakoo Hustle Manual QA Checklist

Use this checklist before each Android demo or release candidate.

## Device Setup

- Install the latest Expo Go on a physical Android phone.
- Connect to the same network as the dev machine, or use a USB/tunnel Expo connection.
- Start the app with `npm start`, then open it on the device.
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

## Save, Load, And Migration

- Close and reopen the app after buying stock; cash and inventory should persist.
- Close and reopen after ending a day; day, reports, missions, and achievements should persist.
- Test saves from versions 1, 2, 3, 4, and 5 with `normalizeGameState`.
- Corrupt the stored save payload during development and confirm the app shows a visible fallback warning instead of a blank screen.
- Reset progress and confirm a clean new game starts.

## Visual QA

- Check Dashboard, Buy Stock, Inventory, Sell, Upgrades, Workers, Locations, Reports, Achievements, Settings, and Events on a small Android screen.
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
