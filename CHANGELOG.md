# Changelog

This file is generated from the same bilingual release history shown inside
Canvas Learning Center. Do not edit it by hand.

## 0.2.18 — 2026-09-11

### Assignment ignore and unusual deadline warnings

Ignore assignments or resume their reminders. Deadlines other than local 23:59 receive a prominent exact-time warning.

#### Added

- Ignore, resume reminders and an Ignored filter, with preferences retained across syncs.
- Prominent exact-time and timezone warnings for deadlines other than 23:59 in assignments and Today actions.

#### Changed

- Ignored assignments leave desktop priorities, attention counts and future reminder events.
- Deadline warnings use the active institution profile timezone; submitted or ignored items use a muted style.

#### Security

- Ignore changes local preferences only, never Canvas submission state. Installation remains manual; registration and email notifications are not enabled.

#### Known issues

- Installers are unsigned and not notarized.
- Ignore is desktop-only: it does not sync to the WeChat companion or recall already delivered reminders.
- Clean installation and upgrade on native Windows 11 and Intel Mac devices still require acceptance testing.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.18)

## 0.2.17 — 2026-09-08

### Faster course navigation and quieter Windows background tasks

Module directories appear before material downloads finish. This update fixes stale course details, missing external material links, and background command-window creation on Windows.

#### Added

- Clear loading, in-progress sync and retry states for course directories.

#### Changed

- Index modules for every selected course before file inventory and downloads.
- Course navigation no longer waits for topic queries. Reuse PPTX parsing within source validation and prevent duplicate analysis clicks.

#### Fixed

- Late detail responses cannot reopen another course after a filter or course-tab change.
- Module-linked external learning resources and tools remain visible in teaching order.
- Windows task queries use no-console process flags and a short-lived shared status cache.

#### Security

- Canvas remains read-only. Notes, review history and source-confirmation rules are preserved. Installing updates still requires explicit user action.

#### Known issues

- Installers are unsigned and not notarized; operating-system warnings may appear.
- Complete first-run, upgrade and no-flash acceptance on an end-user Windows 11 device still needs confirmation. Institution-restricted content remains restricted.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.17)

## 0.2.16 — 2026-09-05

### Complete English learning flow

English now covers the existing knowledge pack, outlines, questions, hints and answers, not just interface labels. Locally generated learning prompts follow the display language.

#### Added

- Complete display translations for 16 existing source-linked topics, preserving their original text and references.
- English completeness tests spanning seven pages, recall, editing, feedback, sign-out and first run.

#### Changed

- English search matches translated concepts as well as originals.
- English mode uses English brand copy and a ZH language toggle. Exact original-language paths can be revealed on request.

#### Fixed

- Fixed Chinese residue in dynamic outlines, topic cards, recall, editors and the background schedule summary.
- Viewing translated fields or saving personal marks never replaces the saved original content.

#### Security

- No material is uploaded for translation. Topic keys, sources, notes and review progress are unchanged. Unknown or edited text is not assigned a stale translation; missing translations cannot be used to rate recall.

#### Known issues

- Personal notes and original course files keep their original language and can be opened explicitly. New non-English custom content still requires a translation. macOS and Windows installers are unsigned.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.16)

## 0.2.15 — 2026-09-05

### English explanations and course tabs

Assignment explanations and relative deadlines now follow the selected language. Course tabs separate short codes from single-line names.

#### Changed

- Hover or focus a course tab to see its full name.

#### Fixed

- Fixed Chinese status explanations remaining in English assignment and Today views.
- Fixed duplicated UTS numeric course codes and crowded wrapping in course tabs.

#### Security

- Sync rules, credentials and personal study data are unchanged.

#### Known issues

- macOS candidate installers are not formally signed. Windows installers and the public release have not been updated.

_Upcoming release; no public installer is available yet._

## 0.2.14 — 2026-09-05

### First sync and update layout fixes

Course selection now starts material sync automatically. Courses and assignments render independently of optional integrations, with compact bilingual update controls.

#### Added

- The home page explains pending sync and offers a direct sync action.

#### Changed

- Discovered courses appear before material downloads finish, with progress refreshed during sync.
- Update controls use shorter labels and wrapping buttons. Installation still requires confirmation.

#### Fixed

- Fixed course selection failing to start the first material sync.
- Fixed fetched assignments being hidden when course metadata was not yet available.
- Fixed optional API requests delaying study data and leaving check controls busy.

#### Security

- Canvas remains read-only, with credentials and materials scoped to the selected institution.

#### Known issues

- Institution-restricted resources remain reported as partial sync. macOS candidate installers are not formally signed.

_Upcoming release; no public installer is available yet._

## 0.2.13 — 2026-09-05

### Multi-institution Canvas connection

Select an institution before connecting so read-only validation, course discovery, and sync stay on that Canvas origin, with version and update actions now available on first run.

#### Added

- Added first-run choices for the University of Sydney, UTS, and another institution's Canvas address.
- Added current version, update check, verified download, and manual installer actions to the connection screen.

#### Changed

- Canvas origin, credential account, course scope, and timezone now follow the verified institution instead of applying Sydney defaults to other institutions.
- Courses outside Sydney no longer inherit identity and term rules from the original four Sydney courses.
- Each institution now uses an isolated local database and material namespace so identical Canvas course IDs cannot overwrite one another.
- Institution switching now waits for active Canvas or companion sync work to finish so one run cannot write across institutions.

#### Fixed

- Fixed UTS and other institution tokens being validated against Sydney Canvas and incorrectly reported as rejected.
- Fixed failed institution switches potentially changing the active profile, replacing an existing credential, or activating the wrong database.
- Fixed legacy Sydney tokens potentially migrating into another institution's credential slot and distinguished invalid credentials from institution endpoint restrictions in diagnostics.

#### Security

- Tokens are sent only to the explicitly selected, normalized HTTPS institution origin; diagnostics retain only that hostname and safe error codes.

#### Known issues

- Each institution decides whether personal access tokens are available. An administrator-provided OAuth Developer Key is still required where they are disabled. Live UTS account authorization has not been tested with a third-party token.

_Upcoming release; no public installer is available yet._

## 0.2.12 — 2026-09-02

### Companion schema v2 and automatic knowledge structure

Upgrades the privacy-filtered companion snapshot and incrementally refreshes knowledge structure when Canvas sources change, while keeping unverified answers out of active recall and mastery.

#### Added

- Upgraded privacy-filtered companion snapshots to schema v2 with separate Canvas check, desktop upload, and automation status fields.
- Automatically extracted topic structure can be used for coverage, study state, and weak markers; active recall remains gated on answer confirmation.

#### Changed

- Learning coverage now uses included topic structure, while current mastery still counts only answer-confirmed topics.
- Knowledge extraction now runs incrementally by local source fingerprint so new slides or source changes are not skipped by older drafts.

#### Fixed

- Fixed existing knowledge drafts preventing newly synced Canvas material from refreshing topic structure.

#### Security

- Companion snapshots continue to exclude Canvas tokens, original course files, signed URLs, local paths, grades, feedback, and personal notes.

#### Known issues

- This version is not publicly released yet; installers will enter the official download channel only after end-to-end validation.

_Upcoming release; no public installer is available yet._

## 0.2.11 — 2026-08-27

### Automatic checks and optional background downloads

Automatically checks the official release channel and lets users opt into background download and verification while keeping installation fully manual.

#### Added

- Checks for a new version on launch and repeats every 24 hours while the app remains open.
- Added a persistent, opt-in Download and verify new installers automatically setting in System Status.
- Added the Manyousang Z developer startup title with pointer, keyboard, and reduced-motion skip paths.

#### Changed

- Automatic download only stores the platform- and language-matched installer after URL, size, and SHA-256 verification; it never launches it automatically.
- Updated the application name and interface identity to Canvas Learning Center without the former Sydney beta label.

#### Fixed

- Fixed installed 0.2.10 clients reporting that update checking was unavailable after the GitHub repository migration.

#### Security

- Installation mode remains manual: the user must open the system installer and confirm through macOS or Windows.

#### Known issues

- Installers are not yet formally code-signed, so macOS Gatekeeper or Windows SmartScreen may display a warning.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.11)

## 0.2.10 — 2026-08-24

### Application and GitHub release history

Adds bilingual release history inside the app and generates the GitHub changelog from the same record.

#### Added

- Added an offline release-history entry in System Status for the current and previous versions.
- Each release shows its date, change categories, known limitations, and official GitHub Release link.
- Added a standard-library generator that creates or checks the public CHANGELOG.md.

#### Changed

- Release content is maintained once in a bilingual structured source shared by the app and GitHub.
- English-default packages show English history, Chinese-default packages show Chinese history, and the history follows the in-app language switch.

#### Security

- Release history is read-only packaged data and contains no token, local path, course content, or personal study data.

#### Known issues

- Installers remain unsigned, so Gatekeeper or SmartScreen may display a warning.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.10)

## 0.2.9 — 2026-08-24

### Account control, feedback, and in-app updates

Added safe logout, reliable feedback actions, a visible version badge, and a verified in-app update flow.

#### Added

- Added Canvas logout that removes only the token from the operating-system credential store.
- Added update checks, verified downloads, and opening of the normal OS installer from the official manifest.
- Added a visible application version badge.

#### Changed

- Both feedback entries now prefer a pre-addressed Gmail compose page with default-mail and copy-address fallbacks.

#### Security

- Offline or failed update checks do not block local learning or transmit Canvas tokens or study data.

#### Known issues

- Upgrading from 0.2.8 to 0.2.9 requires one final manual install.
- Installers remain unsigned beta canaries.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.9)

## 0.2.8 — 2026-08-23

### Source-backed knowledge drafts and feedback fallbacks

Generated reviewable drafts from local teaching sources and replaced unreliable packaged-WebView mail links.

#### Added

- Added conservative PDF, HTML, PPTX, Markdown, and text extraction for reviewable knowledge drafts.
- Displayed local material locations beside unit sources.

#### Changed

- Unconfirmed drafts stay out of mastery, Today, and review queues.

#### Fixed

- Added default-mail, Gmail web, and copy-address feedback fallbacks.

#### Known issues

- Installers remain unsigned beta canaries.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.8)

## 0.2.7 — 2026-08-23

### Installer identity and current-course filtering

Aligned macOS installer version metadata and prevented old courses or long titles from breaking the dashboard.

#### Added

- Added release gates for macOS PKG and Windows MSI version identity.

#### Changed

- The dashboard now defaults to the current Canvas teaching term.

#### Fixed

- Fixed stale installer version metadata.
- Fixed long course names breaking the vertical course ribbon.

#### Known issues

- Installers remain unsigned beta canaries.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.7)

## 0.2.6 — 2026-08-23

### Material freshness and local storage locations

Separated assignment checks from material sync and added launch-time and 24-hour incremental refresh gates.

#### Added

- Added launch-time freshness checks and a 24-hour background incremental sync.
- Added visible local storage locations and allowlisted open-folder actions.

#### Changed

- Assignment status checks no longer stand in for PPT, page, and module synchronization.

#### Fixed

- Synchronized accessible Week 4 records without bypassing Canvas permissions.

#### Known issues

- Canvas-restricted content remains explicitly marked and is not bypassed.
- Installers remain unsigned beta canaries.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.6)

## 0.2.5 — 2026-08-23

### Packaged Canvas TLS fix

Made packaged desktop builds use the bundled CA store when connecting to Canvas.

#### Added

- Added a privacy-safe TLS certificate error category to diagnostics.

#### Changed

- Rebuilt Chinese-default and English-default macOS and Windows installers.

#### Fixed

- Fixed packaged macOS builds failing to verify the Canvas certificate.

#### Security

- Tokens remain in the OS credential store and Canvas access stays read-only.

#### Known issues

- Installers remain unsigned beta canaries.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.5)

## 0.2.4 — 2026-08-23

### Privacy-safe diagnostic bundles

Enabled one-click export of allowlisted, privacy-filtered technical diagnostics.

#### Added

- Added one-click diagnostic export to first-run setup and System Status.
- Connection failures now show safe error categories and diagnostic IDs.

#### Changed

- Diagnostics include only platform, Canvas host, aggregate storage, SQLite health, and structured events.

#### Fixed

- Fixed a Windows diagnostic-log lifecycle issue.

#### Security

- Diagnostic bundles exclude credentials, identity, course content, notes, submissions, grades, databases, signed URLs, and local paths.

#### Known issues

- Installers remain unsigned beta canaries.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.4)

## 0.2.3 — 2026-08-22

### Bilingual interface and locale-specific installers

Added in-app Chinese/English switching and separate Chinese-default and English-default packages.

#### Added

- Added an in-app switch between English and Chinese.
- Added Chinese-default and English-default packages for macOS and Windows.
- Added bilingual installation and download instructions.

#### Changed

- Upgrades preserve the user's selected interface language.

#### Security

- Strengthened release metadata and package-integrity checks while keeping Canvas read-only.

#### Known issues

- Installers remain unsigned beta canaries.

[View GitHub Release](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.3)

## 0.2.2 — 2026-08-21

### Installation guidance and developer identity

Added plain-text installation guidance, developer attribution, feedback email, and release metadata.

#### Added

- Added TXT installation instructions, third-party notices, checksums, and an in-app feedback entry.

#### Changed

- Standardized developer attribution as ZihengHuang and feedback email as canvas-center@z-hstudio.com.

#### Known issues

- This was an internal beta milestone without public GitHub installer assets.

_Upcoming release; no public installer is available yet._
