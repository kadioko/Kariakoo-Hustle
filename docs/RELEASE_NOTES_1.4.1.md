# Kariakoo Hustle 1.4.1 Release Notes

Android version code: `5`

Release date: 2026-08-09

## Google Play - Kiswahili

Tumeboresha matumizi kwenye simu ndogo. Sasa ukurasa wa Zaidi unasogea vizuri ili Mipangilio ionekane, na menu ya chini pamoja na vitufe muhimu vinakaa juu ya Home/Back bar ya Android. Pia tumelinda vitufe vya Main Menu na mwanzo wa mchezo dhidi ya kuzibwa na system navigation.

## Google Play - English

Improved support for small Android phones. The More screen now scrolls so Settings stays reachable, while bottom tabs and important controls remain above Android gesture and three-button navigation bars. Main Menu and onboarding actions now also respect each device's safe area.

## Full Release Summary

- Made the More screen vertically scrollable so every menu item remains reachable.
- Added dynamic Android bottom-inset handling to the main tab bar.
- Kept Main Menu and onboarding controls above gesture and three-button navigation bars.
- Added safe bottom spacing without wasting space on devices that need smaller insets.
- Expanded Android QA coverage for both system-navigation modes.

## Tester Focus

- Open More on a small phone, scroll to the bottom, and open Settings.
- In Settings, scroll to About and confirm the version line is reachable.
- Test the bottom tabs with gesture navigation enabled.
- Switch the phone to three-button navigation and confirm Home, Back, and Recent do not cover app controls.
- Complete language selection and onboarding in both navigation modes.
