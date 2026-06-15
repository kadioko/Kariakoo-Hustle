# AdMob Setup Notes

Kariakoo Hustle now has a native-ready AdMob foundation, but real ads are still disabled in gameplay until the core loop is tested and balanced.

## Current IDs

- Android AdMob App ID: `ca-app-pub-1484098434630929~6907155869`
- Rewarded ad unit ID: `ca-app-pub-1484098434630929/6500837461`
- Interstitial ad unit ID: `ca-app-pub-1484098434630929/3874674129`

The app uses test ad unit IDs automatically in development builds. Production IDs are stored in `src/data/monetization.ts`.

## Current Flags

- `ADS_ENABLED = false`
- `INTERSTITIALS_ENABLED = false`
- `PREMIUM_ENABLED = false`

With ads disabled, `src/services/adService.ts` returns fake rewarded success so QA can test reward handlers without loading real ads.

## Rewarded Ad Priority

Ship order:

1. Market Insider Tip
2. Recover From Bad Trade
3. Speed Up Delivery
4. Double Daily Profit

Double Daily Profit should ship last because it can inflate the economy if the cap is too generous.

## Reward Rules

- Market Insider Tip gives information only. It does not add cash.
- Recover From Bad Trade restores only part of the loss.
- Speed Up Delivery is convenience only.
- Double Daily Profit is capped and only works after a profitable daily report.
- Each reward is claimable once for its relevant day/report.

## Interstitial Policy

Interstitials stay disabled at first.

If enabled later, only show them:

- After a daily report
- When returning to a menu

Never show interstitials during:

- Buying stock
- Hiring workers
- Unlocking locations
- Loan decisions
- Random event choices

## Android Dev Build Steps

Expo Go cannot run native AdMob modules. Use a development build.

```bash
npx eas build --profile development --platform android
npx expo start --dev-client
```

Before release:

- Add a privacy policy.
- Mark "app contains ads" in Google Play Console.
- Configure any required Google consent flow.
- Test on a real Android phone.

## Phone QA

- Rewarded ad loads.
- Reward fires only after the ad is earned.
- Closing the ad early gives no reward.
- App does not crash if AdMob fails to initialize.
- App still works offline when ads cannot load.
- Interstitials do not appear during business decisions.
