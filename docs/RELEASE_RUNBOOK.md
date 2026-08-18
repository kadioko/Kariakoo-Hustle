# Android Release Runbook

This runbook covers the product and Play Console path from local repo to release.
Use `docs/ANDROID_RELEASE_BUILD.md` as the canonical technical build procedure,
including versioning, validation, EAS commands, artifact downloads, signing
verification, and the current AdMob compatibility pin.

## Current Build Setup

`eas.json` includes:

- `development`: APK with Expo dev client
- `preview`: internal APK
- `production`: Android App Bundle (`.aab`) for Play Store

## Pre-Build Checks

Run:

```bash
npm install
npx expo install --check
npm run typecheck
npm test
npx expo-doctor
```

Expected current status:

- Expo dependencies are aligned.
- TypeScript passes.
- Unit tests pass.

## Development Build

Use this first because AdMob requires a native development build. Expo Go is not enough.

```bash
npx eas-cli build --profile development --platform android
```

After installing the development APK on a phone:

```bash
npx expo start --dev-client
```

Test:

- First-session language choice
- Buy stock
- Confirm the daily market brief opens its recommended product and the quote matches checkout
- Build supplier trust with repeat orders, then verify the quote reduction remains modest
- End day
- Save/reopen
- Rewards & Themes screen
- Offline mode
- Small-screen text clipping
- Supplier relationship, live quote, and cash-runway readability

## Preview Build

Use this for testers before Play upload:

```bash
npx eas-cli build --profile preview --platform android
```

## Production AAB

Only build the production AAB after physical Android QA passes.

```bash
npx eas-cli@latest build --profile production --platform android --non-interactive --wait
```

The output should be an `.aab` suitable for Play Console. Follow the download and
certificate-verification steps in `docs/ANDROID_RELEASE_BUILD.md` before upload.

## Submission

After the AAB is available:

1. Create or open the app in Play Console.
2. Upload the AAB to Internal testing or Closed testing.
3. Complete Store Listing using `docs/PLAY_STORE_LISTING.md`.
4. Complete App Content forms using `docs/PLAY_CONSOLE_CHECKLIST.md`.
5. Add the hosted privacy policy URL.
6. Add support email.
7. Invite testers.
8. Run closed testing for 14 continuous days if required by the account.

## Release Blockers

Do not submit to production if:

- The app crashes on launch.
- Save/load fails after app close and reopen.
- The first-session language screen is skipped.
- Fake TZS is not clearly game currency.
- Ads are enabled without consent/privacy review.
- Play Console forms are incomplete.
- Privacy policy URL is missing.
- Screenshots are missing or show clipped text.

## Important Notes

- `ADS_ENABLED`, `INTERSTITIALS_ENABLED`, and `PREMIUM_ENABLED` should stay `false` for the smoothest first review.
- Because AdMob SDK is integrated, Play Console should still declare that the app contains ads.
- iOS builds should not be attempted until an iOS AdMob App ID is added or the AdMob plugin is gated away from iOS.
