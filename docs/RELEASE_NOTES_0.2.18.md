# Canvas Learning Center 0.2.18

Release date: 11 September 2026

## What changed

- **Ignore assignments** in Assignment Guard, find them with the Ignored filter,
  and resume reminders whenever needed. The preference survives read-only syncs.
- Ignored items leave desktop Today priorities, attention counts and future
  reminder events. Their real Canvas submission status is never changed.
- **Unusual deadline warnings** highlight deadlines other than local **23:59**
  with a red label, exact time and timezone in Assignment Guard and Today.
  For example, 09:00, 21:00 and midnight stand out from end-of-day deadlines.
- Warnings follow the active institution profile timezone, including daylight
  saving time. Submitted or ignored items remain visible with muted styling.
- Both features support English and Chinese and narrow-window layouts.

## Download and update

Choose macOS universal PKG or Windows x64 MSI, then English or Chinese as the
first-launch language. Both editions support language switching.

Existing users: open **System status → App updates**, check for updates, download
the matching installer, quit the app, and run the installer manually. Back up
important notes before upgrading. Local data and saved credentials are retained
by design; updates never install silently.

If an old app cannot check for updates, use this release's Assets section and
follow **INSTALLATION.txt**. GitHub's automatic source archives contain the
public documentation repository, not the application.

## Scope and known issues

- All four packages are **UNSIGNED-CANARY**, not formally code-signed or
  Apple-notarized. Gatekeeper and SmartScreen can warn or block installation.
- Ignore applies to this desktop app, not the WeChat companion. Already delivered
  notifications or Apple Reminders are not withdrawn.
- Optional registration and email notifications are still a proposal, not an
  enabled feature. No email service or paid cloud analysis is activated.
- School permissions still apply; restricted or unpublished resources are not
  bypassed. Knowledge drafts still require source review and confirmation.
- Windows CI builds/tests are not a substitute for clean installation, upgrade
  and visual acceptance on Windows 11 or a separate Intel Mac.

Canvas remains read-only. The installers contain no user token, personal study
database or course materials. Complete source code remains private.

Developer: ZihengHuang · Social: Manyousang Z

Feedback: canvas-center@z-hstudio.com

Not affiliated with Instructure, the University of Sydney, UTS or another
educational institution.
