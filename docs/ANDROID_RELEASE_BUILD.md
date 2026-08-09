# Android Release Build Guide

This is the canonical technical procedure for creating Android test builds and
Google Play App Bundles for Kariakoo Hustle.

## Release Identity

These values must remain consistent:

- Android package: `com.kadioko.kariakoohustle`
- Expo owner: `kadioko`
- EAS project ID: `6a893276-61f9-4f8a-8e4b-2cb24a5e1df3`
- Production output: Android App Bundle (`.aab`)

Never change the Android package after publishing. Google Play treats a different
package as a different application.

## Build Profiles

The profiles are defined in `eas.json`:

| Profile | Output | Use |
| --- | --- | --- |
| `development` | APK with Expo dev client | Physical-device development and native AdMob testing |
| `preview` | APK | Installable QA build for testers |
| `production` | AAB | Google Play Internal, Closed, Open, or Production tracks |

Expo Go is not sufficient for final testing because the project includes the
native Google Mobile Ads module.

## One-Time Setup

Install dependencies and authenticate the EAS account:

```powershell
npm ci
npx eas-cli@latest login
npx eas-cli@latest whoami
```

The expected EAS account is `kadioko`. EAS stores the Android upload keystore
remotely; never commit `.jks` or other private key files.

## 1. Choose The Version

Every Play Console upload needs a new Android `versionCode`, even when replacing
a rejected or broken build. The value must be higher than every version code
previously uploaded to this Play Console app.

Update all release versions before building:

1. Run `npm version <new-version> --no-git-tag-version` to update `package.json`
   and `package-lock.json`.
2. Set `expo.version` in `app.json` to the same public version.
3. Increment `expo.android.versionCode` in `app.json`.

Example for version `1.4.1` and Android build `5`:

```powershell
npm version 1.4.1 --no-git-tag-version
```

Then update `app.json`:

```json
{
  "expo": {
    "version": "1.4.1",
    "android": {
      "package": "com.kadioko.kariakoohustle",
      "versionCode": 5
    }
  }
}
```

The app's visible version comes from `package.json`, so keeping these values in
sync prevents the Settings screen and Play Console from reporting different
versions.

## 2. Write Release Notes

Create `docs/RELEASE_NOTES_<version>.md` before building. Include:

- Google Play Kiswahili notes, up to 500 characters.
- Google Play English notes, up to 500 characters.
- A fuller internal summary.
- A focused tester checklist for changed systems.

Release notes must describe only behavior included in that build.

## 3. Run Release Validation

Run every command from the repository root:

```powershell
npm ci
npx expo install --check
npm run typecheck
npm test
npx expo-doctor
npx expo config --type public
```

Confirm the resolved Expo configuration shows:

- The intended public version and Android version code.
- Package `com.kadioko.kariakoohustle`.
- The production AdMob Android App ID.
- The correct EAS project ID and owner.

Do not build with failed TypeScript, unit tests, Expo Doctor checks, or dependency
alignment checks.

## 4. Test A Native Android Build

For development with Metro:

```powershell
npx eas-cli@latest build --profile development --platform android
npx expo start --dev-client
```

For a standalone tester APK:

```powershell
npx eas-cli@latest build --profile preview --platform android
```

Install the APK on a physical Android phone and complete
`docs/QA_CHECKLIST.md`. At minimum, test:

- Fresh install and first-session language selection.
- Buying stock, selling, reports, events, upgrades, workers, and locations.
- Save, force-close, reopen, and corrupted-save fallback.
- Kiswahili and English on a small screen.
- Offline play and failed ad initialization.
- Google test rewarded ads when ad testing is enabled.

## 5. Build The Production AAB

Use a non-interactive waiting build so the terminal returns the final build
record:

```powershell
npx eas-cli@latest build `
  --platform android `
  --profile production `
  --non-interactive `
  --wait `
  --json
```

The successful result must show:

- `status`: `FINISHED`
- `buildProfile`: `production`
- `distribution`: `STORE`
- The intended `appVersion` and `appBuildVersion`
- A URL ending in `.aab`

Build history can be inspected with:

```powershell
npx eas-cli@latest build:list --platform android --limit 5
```

## 6. Download And Verify The AAB

Store local artifacts under `builds/<version>/`. AAB and APK files are ignored by
Git, while release-note Markdown files can be committed.

```powershell
$version = "1.4.1"
$versionCode = 5
$buildId = "PASTE_EAS_BUILD_ID"
$directory = Join-Path $PWD "builds\$version"
$aab = Join-Path $directory "Kariakoo-Hustle-$version-build-$versionCode.aab"

New-Item -ItemType Directory -Path $directory -Force | Out-Null
$build = npx eas-cli@latest build:view $buildId --json | ConvertFrom-Json
Invoke-WebRequest -Uri $build.artifacts.applicationArchiveUrl -OutFile $aab
Copy-Item "docs\RELEASE_NOTES_$version.md" $directory
```

Verify the artifact:

```powershell
Get-Item $aab | Select-Object FullName, Length, LastWriteTime
Get-FileHash $aab -Algorithm SHA256
keytool -printcert -jarfile $aab
```

For the current EAS upload credential, the expected certificate SHA-1 is:

```text
8F:F0:83:A5:BE:9A:02:19:41:AE:72:E4:9C:FC:5E:72:E1:A6:E6:B9
```

Before uploading, compare it with Play Console under **Setup > App integrity >
Upload key certificate**. If Play expects another fingerprint, do not create
repeated builds with random keystores. Resolve the upload-key reset or EAS
credential configuration first.

## 7. Upload To Google Play

1. Open the intended Play Console track, normally Closed testing first.
2. Create a new release and upload the verified `.aab`.
3. Paste the matching Kiswahili and English release notes.
4. Resolve blocking Play Console errors; review warnings separately.
5. Save, review, and roll out the release to the selected testers.
6. Install the Play-delivered build from the tester link and run a smoke test.

The missing deobfuscation-file message is only a warning while R8/minification
is not enabled. If minification is enabled later, preserve and upload the mapping
file generated for that exact build.

## AdMob Compatibility

Expo SDK 57 currently uses a Kotlin toolchain compatible with
`react-native-google-mobile-ads` `16.3.4`, which uses Google Mobile Ads Android
SDK `25.0.0`. Version `16.4.0` pulls Google Mobile Ads `25.4.0`, whose Kotlin 2.3
metadata does not compile with the current Expo SDK 57 Kotlin 2.1 toolchain.

Keep `react-native-google-mobile-ads` pinned to `16.3.4` until a dependency or
Expo upgrade is proven by a successful native release build. After any AdMob or
Expo upgrade, run a development build and a production AAB build before changing
the pin.

Because the AdMob SDK is included, declare that the app contains ads in Play
Console even when optional rewarded placements are temporarily disabled. Use
test ad units during QA and complete consent/privacy requirements before enabling
production ads.

## Release Blockers

Do not submit a build when any of these are true:

- Package name, version, or version code is wrong.
- EAS used an upload certificate Play Console does not accept.
- The app crashes, loses save data, or cannot complete the first session.
- Primary controls or text are clipped on a small Android screen.
- Real ads are enabled without privacy, consent, and Data safety review.
- The privacy policy, store listing, screenshots, or Play declarations are stale.
- The release notes describe changes that are not in the AAB.

## Related Documents

- `docs/RELEASE_RUNBOOK.md`: product and submission checklist.
- `docs/QA_CHECKLIST.md`: physical Android testing checklist.
- `docs/PLAY_CONSOLE_CHECKLIST.md`: Play Console submission fields.
- `docs/PLAY_CONSOLE_ANSWERS.md`: prepared policy answers.
- `docs/ADMOB_SETUP.md`: advertising configuration and safety.
- `docs/PLAY_STORE_LISTING.md`: listing copy and asset requirements.
