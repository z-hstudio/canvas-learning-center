# Canvas Learning Center 0.2.17

Release date: 8 September 2026

## What changed

- Course modules load before file inventory and material downloads, so later courses do not wait behind an earlier course's large files.
- Course navigation renders independently of knowledge queries. Loading and retry messages replace misleading empty results during sync.
- Switching the course filter or coloured course tabs discards stale detail responses.
- Module-linked external resources and tools stay visible in the correct unit and teaching order.
- Knowledge analysis avoids repeated PPTX parsing during source validation and ignores duplicate analysis clicks.
- Windows background task queries use no-console process flags and a short-lived status cache.

## Download and update

Choose the macOS universal PKG or Windows x64 MSI, then your preferred first-launch language (English or Chinese). Both editions support language switching.

Existing users can check **System status → App updates**, download the matching installer, quit the app and run the installer manually. Existing local data and the system credential store are retained. The app never installs updates silently.

If an older app cannot reach the update channel, download directly from this release's Assets section. See `INSTALLATION.txt` for the walkthrough. GitHub's automatically generated source archives are the documentation repository, not the application.

## Verification and limits

- Five current courses were checked using authorized live UTS read-only data; all 34 modules were accessible in the repaired local application.
- Two real teaching PPTX samples produced source-grounded drafts; unchanged sources correctly skipped repeated analysis. Drafts were not automatically confirmed.
- Local regression coverage includes all-course module visibility before downloads, stale responses, external resource association, English UI and preservation of progress.
- These live measurements were made on macOS, not on the reporter's Windows computer. Windows CI is a build/test environment, not a substitute for Windows 11 end-user installation and visual acceptance.

## Known issues

- All four installers are **UNSIGNED-CANARY**. They are not formally code-signed or Apple-notarized; Gatekeeper or SmartScreen can warn or block installation.
- School permissions still apply. Restricted or unpublished content is not bypassed, and some material syncs may remain partial.
- Large or difficult documents can take longer to analyse. Knowledge drafts require source review before confirmation.
- No claim of universal school compatibility or complete Windows 11 device acceptance is made.

Canvas access remains read-only. No student credential, personal data or course material is included in the installers. Source code remains private.

Developer: ZihengHuang · Social: Manyousang Z

Feedback: canvas-center@z-hstudio.com

Not affiliated with Instructure, the University of Sydney, UTS or another educational institution.
