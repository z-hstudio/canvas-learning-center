# Known limitations

## Unsigned packages

Version 0.2.18 is an `UNSIGNED-CANARY`. The macOS package is not Apple-notarized,
and the Windows MSI does not have a trusted Microsoft code-signing identity.
Gatekeeper or SmartScreen may warn or block it.

An unsigned macOS rebuild does not have a stable Developer ID identity. During
an update, Keychain may therefore ask the user to approve access to the existing
Canvas credential again. This is not a request to share the credential with the
developer; formal signing is still required to remove this avoidable friction.

## One-time update transition

Version 0.2.10 can discover updates, but cannot download them through the old
repository address because its fixed security allowlist rejects GitHub's
repository-rename redirect. Install the current version manually from the official Release
page once. Versions from 0.2.11 onward use the stable `z-hstudio` update channel.

## Institution coverage

The current release includes school selection and real-account read-only checks
for Sydney and UTS. Other institutions can change Canvas hostnames, API access,
Access Token availability and course permissions. A configurable address is not
a promise that every Canvas school is supported.

## Platform acceptance

The 0.2.17 course-loading fixes were checked locally on macOS using authorized
live UTS data: all five selected courses and all 34 module details were visible.
Windows builds run the test suite and packaging checks in Windows CI. A clean
Windows 11 device acceptance test, visual confirmation that background tasks do
not flash windows, and a separate Intel Mac installation test remain outstanding.

## Canvas permissions

- Unpublished, restricted, or institution-blocked content cannot be downloaded.
- A partial sync is reported as partial; it is not presented as a complete copy.
- External systems such as lecture recording, Studio, or discussion platforms
  may be indexed as links rather than downloaded.

## Learning content

- Automatic knowledge items are source-backed drafts, not verified answers.
  They do not affect progress or enter review queues until the student confirms them.
- Scanned PDFs need OCR, which is not enabled in this release. Restricted,
  external-only, empty, or insufficient source material cannot generate a draft.
- A learning unit with no usable local source continues to show that its
  knowledge structure has not been generated.
- Runtime paid-model automation is not enabled in this release.
- English mode translates the built-in source-linked knowledge pack and app
  prompts. Personal notes, original files and explicitly revealed original text
  retain their original language. Custom non-English answers without a matching
  translation are labelled unavailable for English recall, not silently replaced.
- The accepted installers retain their pre-publication offline history snapshot.
  GitHub's release page is authoritative for current publication status.

## Final authority

Always use the official Canvas page to confirm deadlines, submission receipts,
course announcements, and assessment requirements.
