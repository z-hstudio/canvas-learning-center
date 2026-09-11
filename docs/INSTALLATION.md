# Installation and first launch

This guide is written for people who do not normally use developer tools.

## 1. Choose your download

Open the [v0.2.17 release page](https://github.com/z-hstudio/canvas-learning-center/releases/tag/v0.2.17),
expand **Assets**, and choose one file:

| Your computer | Default language | Filename |
|---|---|---|
| Mac | English | `CanvasLearningCenter-0.2.17-macOS-universal-en-UNSIGNED-CANARY.pkg` |
| Mac | Chinese | `CanvasLearningCenter-0.2.17-macOS-universal-zh-CN-UNSIGNED-CANARY.pkg` |
| Windows 11 | English | `CanvasLearningCenter-0.2.17-Windows-x64-en-UNSIGNED-CANARY.msi` |
| Windows 11 | Chinese | `CanvasLearningCenter-0.2.17-Windows-x64-zh-CN-UNSIGNED-CANARY.msi` |

The features are identical. The selected language is only the first-launch
default; use the language button inside the app whenever you want to switch.

## 2. Check the download

All files must come from this repository's **Releases** page. Compare the file's
SHA-256 with `SHA256SUMS.txt` in the same release.

### macOS checksum

1. Open **Terminal** from Applications → Utilities.
2. Type `shasum -a 256 `, including the final space.
3. Drag the downloaded `.pkg` file into Terminal and press Return.
4. Compare the result with `SHA256SUMS.txt`.

### Windows checksum

1. Open **PowerShell**.
2. Enter `Get-FileHash` followed by a space.
3. Drag the downloaded `.msi` file into PowerShell and press Enter.
4. Compare the displayed SHA256 value with `SHA256SUMS.txt`.

If the values do not match, delete the file and do not open it.

## 3A. Install on macOS 13 or later

1. Double-click the `.pkg` file.
2. Follow the installer prompts.
3. Open **Applications** and launch **Canvas Learning Center**.

The 0.2.17 package is not yet signed or notarized. Gatekeeper may refuse to open it.
Only if the file came from this official release and its checksum matches:

1. Open **System Settings → Privacy & Security**.
2. Find the message about Canvas Learning Center.
3. Choose **Open Anyway**, then confirm.

If the expected security message or checksum is different, stop and contact the
developer. No Terminal bypass command is required or recommended.

Because this release is unsigned, macOS may also ask whether Canvas Learning Center
may read its existing Canvas credential from Keychain after an update. Continue
only when the installer came from this Release and its checksum matches. The
dialog may request your Mac login password; never send that password or the
Canvas token to the developer. Formal code signing is required to give future
builds a stable identity and prevent avoidable repeated prompts.

## 3B. Install on Windows 11 x64

1. Double-click the `.msi` file.
2. Follow the installation wizard.
3. Open Canvas Learning Center from the Start menu or desktop shortcut.

The 0.2.17 package is not yet signed. Microsoft Defender SmartScreen may display a
warning. Continue only when the filename and checksum match the official
release. If you are unsure, cancel and contact the developer.

## 4. Connect your Canvas account

1. Select your institution in the app, then select **Open Canvas Settings**.
2. Sign in to your own institution's Canvas website.
3. Create an Access Token for Canvas Learning Center.
4. Return to the app and paste the token once. The token must belong to the selected school's Canvas.
5. Confirm the courses found by the app.
6. Start the first read-only sync.

Read [the complete Access Token guide](CANVAS_TOKEN.md) before creating the token.

## 5. After setup

- The token is stored in macOS Keychain or Windows Credential Manager.
- It is not written to the local study database or logs.
- The app binds its local web interface to your own computer only.
- Official Canvas pages remain the final authority for submission state and deadlines.
- The app checks whether course material is stale whenever it opens.
- After a successful material sync, the app can build local source-backed drafts
  for learning units that do not yet have confirmed knowledge points. Review and
  confirm each draft before it affects progress or review scheduling.
- To keep checks running while the main app is closed, open **System Status**,
  select **Enable proactive reminders**, and approve the operating-system prompt.

## Local material locations

The app shows these paths in the course source area and Personal Knowledge Library,
with an **Open folder** button:

- macOS application data root: `~/Library/Application Support/com.zzz.canvas-learning-center/`
- Windows application data root: `%LOCALAPPDATA%\ZZZ\CanvasLearningCenter\`

Course material and the personal knowledge library are stored in separate
subfolders under that root. Use the app's **Open folder** action to open the
exact folder without relying on a localized folder name.

## Updating

Open **System Status → App update** to check the official public manifest.
The app also checks automatically on launch and every 24 hours while the
app remains open. You may opt into automatic background download and verification
of the package for your current platform and interface language. This setting is
off by default. Installation is always manual: the app only opens the normal
macOS or Windows installer after you choose to proceed.

If you are currently running 0.2.10, download and install the current version from the
official Release page once. The old client can discover updates, but its fixed
security allowlist cannot follow GitHub's repository-rename download redirect.
From 0.2.11 onward, update downloads use the stable `z-hstudio` channel.

Local application data and the saved language choice are designed to remain in
place. Back up important personal notes before installing an update.

## If connection or sync fails

Select **Export to Downloads** on the first-run page or under **System Status**.
Attach the generated ZIP to a private email to `canvas-center@z-hstudio.com`.
The bundle contains privacy-filtered technical state, aggregate counts and error
identifiers. It excludes credentials, names, course content, notes, submissions,
grades, databases, signed URLs and local paths.

For ordinary feedback, use either in-app Feedback entry. The first click opens
a pre-addressed Gmail compose page; default-mail and copy-address fallbacks are
also available.
