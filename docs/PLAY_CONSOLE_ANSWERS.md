# Play Console App Content Answers

Use this as the screen-by-screen answer sheet for the Google Play Console "App content" setup.

Important: answer based on the exact build you submit. Current recommended first review build keeps:

- `ADS_ENABLED = false`
- `INTERSTITIALS_ENABLED = false`
- `PREMIUM_ENABLED = false`

The AdMob SDK is still integrated, so ads and data-safety answers should acknowledge the ads SDK.

## 1. Set Privacy Policy

Status: Required before production or closed testing submission.

Use the draft in:

`docs/PRIVACY_POLICY.md`

You must host it at a public HTTPS URL, then paste that URL in Play Console.

Recommended privacy policy URL field:

`https://raw.githubusercontent.com/kadioko/Kariakoo-Hustle/main/docs/PRIVACY_POLICY.md`

Good hosting options:

- GitHub Pages
- Your website
- Google Sites
- Any stable public HTTPS page

Support/privacy email:

`godfreymariki@gmail.com`

## 2. Sign In Details / App Access

Recommended answer:

- "All or some functionality is available without restricted access": No restricted sign-in.
- No username or password required.
- No demo account required.

Explanation:

Kariakoo Hustle has no account system, no backend login, and no gated paid account area. The game starts directly and stores progress locally.

## 3. Ads

Recommended answer:

- Does your app contain ads? Yes.

Reason:

The app includes Google AdMob SDK and AdMob app/ad unit IDs, even though rewarded ads are disabled in gameplay for the first review.

Notes for reviewer, if a notes field is available:

> The app includes AdMob SDK preparation for optional rewarded ads, but ads are disabled in the current gameplay build. There are no banner ads, no active interstitials, and no real-money reward mechanics.

## 4. Content Rating

Recommended category:

- Game
- Simulation

Expected questionnaire answers:

- Violence: No
- Fear / horror: No
- Sexual content: No
- Controlled substances: No
- Gambling: No
- Simulated gambling: No
- Real-money gambling: No
- Real-money rewards: No
- User-generated content: No
- Online interaction with other users: No
- Location sharing: No

Notes:

The game uses fake TZS as simulation currency only. It does not offer betting, gambling, cash-out, financial services, investment services, or real-money rewards.

## 5. Target Audience

Recommended starting answer:

- Target age: 13-15, 16-17, 18+
- Do not target children under 13.

Reason:

The app is a business simulation with ads SDK integrated and business/finance-like themes. It is safer to launch as teen-and-up unless the final product is intentionally reviewed for families compliance.

If Play asks whether the store listing could unintentionally appeal to children:

- Recommended: No, if screenshots/listing stay business-focused.

Avoid child-directed language, cartoon-child imagery, or kid-focused marketing.

## 6. Data Safety

Google requires Data Safety answers to include data handled by third-party SDKs, not only your own code.

Current app-owned data:

- Local game save data stored on device with AsyncStorage
- No account
- No custom backend
- No custom analytics
- No server-side collection by Kariakoo Hustle

Third-party SDK:

- Google AdMob SDK is integrated.

Recommended Data Safety approach:

### Data Collection

If submitting with AdMob SDK included:

- Declare data collection/sharing according to Google AdMob's current SDK disclosure guidance.
- Likely categories may include device or other IDs, app activity/ad interactions, diagnostics, approximate location, and advertising-related data depending on SDK behavior and consent settings.

Do not claim "no data collected" while AdMob SDK is present unless you have confirmed the final binary and Google SDK disclosure allow that answer.

### Data Sharing

Declare that ad-related data may be shared with Google/AdMob for:

- Advertising or marketing
- Analytics/measurement
- Fraud prevention, security, and compliance

### Security Practices

Recommended answers:

- Data is encrypted in transit: Yes for data transmitted by SDKs over HTTPS.
- Users can request data deletion: For local app data, users can reset progress or uninstall. If real ads collect ad data through Google, deletion/control follows Google account/ad settings and applicable Google policies.

### Required vs Optional

- Gameplay save data: required for app functionality, stored locally.
- Rewarded ads: optional when enabled later.

## 7. Government Apps

Recommended answer:

- No, this is not a government app.

Explanation:

Kariakoo Hustle is an entertainment/business simulation game and is not developed by or on behalf of a government entity.

## 8. Financial Features

Recommended answer:

- The app does not provide financial services.
- The app does not provide loans, credit, investment, trading, banking, money transfer, insurance, tax, or real-money financial products.

If Play asks because the game uses money terms, use this explanation:

> Kariakoo Hustle is a simulation game. TZS values are fictional in-game currency only. The app does not provide financial services, real loans, investment advice, trading, betting, gambling, cash-out, or real-money rewards.

Do not select financial-service categories unless Play requires a separate declaration for simulated educational content. If there is an "other" or notes field, paste the wording above.

## 9. Health

Recommended answer:

- No health features.

Explanation:

The app does not provide health advice, medical content, symptom checking, health tracking, health data collection, treatment claims, or wellness services.

## Final Pre-Submit Checks

- Privacy policy URL is public and opens without login.
- Support email is real and monitored.
- AAB uploaded from EAS production build.
- Screenshots are from the actual Android build.
- Feature graphic uploaded from `assets/play-store/feature-graphic.png`.
- Ads declaration says Yes because AdMob SDK is integrated.
- Financial feature notes clearly say fake TZS only.
- Data Safety does not contradict the presence of AdMob SDK.
- Closed testing requirements are planned if the account requires them.
