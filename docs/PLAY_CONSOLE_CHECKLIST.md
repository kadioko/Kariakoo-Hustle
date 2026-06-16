# Play Console Submission Checklist

Use this when creating the Google Play listing and release.

## App Setup

- App name: `Kariakoo Hustle`
- Default language: English or Swahili, depending on target listing strategy
- App or game: Game
- Category: Simulation
- Free or paid: Free
- Contains ads: Yes, because AdMob SDK is integrated, even if ads are disabled for the first review
- Privacy policy URL: TODO
- Support email: TODO

## Store Listing

- Short description: see `docs/PLAY_STORE_LISTING.md`
- Full description: see `docs/PLAY_STORE_LISTING.md`
- App icon: `assets/icon.png`
- Feature graphic: `assets/play-store/feature-graphic.png`
- Phone screenshots: capture from Android preview or production build

## App Content Forms

### Ads

Answer: Yes, app contains ads.

Notes:

- AdMob SDK is integrated.
- Rewarded ads are optional.
- Interstitials are disabled and should remain very rare if enabled later.

### Data Safety

For the current MVP, local gameplay data is stored on device through AsyncStorage. There is no custom backend account system.

If real ads are enabled, Google AdMob may collect/process ad-related data. Answer the Data Safety form based on the exact final build and Google AdMob's current data disclosure requirements.

### Financial Features

The app uses fake TZS only as in-game currency.

Recommended wording:

> Kariakoo Hustle is a business simulation game. TZS amounts are fictional in-game values only. The app does not offer real-money trading, cash-out, betting, gambling, loans, financial services, or investment advice.

### Gambling / Real Money Rewards

Answer: No gambling, no betting, no cash-out, no real-money rewards.

### Target Audience

Choose based on final release strategy. Recommended safer starting point:

- Teen and older audiences, unless the final store copy and content rating support a broader age range.

### Content Rating

Complete the questionnaire honestly. The expected rating should be low because the game has no violence, gambling, or real-money rewards.

## Closed Testing

If this is a new personal Play Console developer account, expect Google Play's production access requirement:

- At least 12 testers opted in
- 14 continuous days of closed testing
- Testers should actually open and play the app

Recommended test group tasks:

1. Start a new game in Swahili.
2. Buy stock and end three days.
3. Trigger or view one report.
4. Switch to English and back to Swahili.
5. Close/reopen the app and confirm save persistence.
6. Test airplane mode.
7. Report screenshots of any clipped text or crash.

## Release Recommendation

First Play review build:

- Keep `ADS_ENABLED = false`
- Keep `INTERSTITIALS_ENABLED = false`
- Keep `PREMIUM_ENABLED = false`
- Submit as a free simulation game with ads SDK declared
- Enable real ads only after closed test QA and consent/privacy work are complete
