# Accessibility Device Walkthroughs

This document is the release/QE evidence home for app-level screen-reader checks.

## Platform Declaration Review

- `app.json` already declares camera, photo-library, and Face ID usage strings for iOS.
- No app-specific `UIAccessibilityReduceTransparency` behavior is currently implemented; add the declaration only if a reduce-transparency branch is introduced.
- Android has no custom accessibility service, so no accessibility-service declaration is applicable.
- Launch-time accessibility detection should stay opt-in and only be added when it changes UI behavior.

## VoiceOver Walkthroughs

1. Dashboard: open app, review summary stats, alerts, recent activity, and quick actions.
2. Invoices: search, change date/status filters, pull to refresh, open invoice detail, open More actions.
3. Create invoice: choose customer, add inventory line item, review payment, submit, verify success announcement.
4. Inventory: search, change category chips, sort, refresh, load more, open a tile set.
5. Settings: open item categories, add/edit/delete a category, verify focus returns to a known control.

## TalkBack Walkthroughs

1. Dashboard: traverse summary stats, alerts, recent activity, and quick actions.
2. Invoices: search, change filters, pull to refresh, open invoice detail, open More actions.
3. Create invoice: complete customer, line-item, payment, and submit flow.
4. Inventory: traverse category chips, sort sheet, import/export menu, list cards, refresh/load-more.
5. Settings: delete an item category and verify announcement plus focus recovery.

## Quarterly Evidence

For each release train, capture:

- Device, OS version, screen reader, and app build.
- Date, tester, and walkthrough result.
- Blocking issues with route/screen name, reproduction notes, and issue link.
- Follow-up verification date after fixes land.
