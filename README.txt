ProxySG Trace v16 - Editor Version Check

UI:
- When the Editor is installed, a new '최신 버전 확인 / Check latest version' button appears.
- It fetches downloads/version.json with cache disabled.
- It compares the version recorded at install time with the repo's current version.
- Up to date:
    button -> '최신 버전'
- Older or installed version unknown:
    button -> '최신 버전 재설치'
    clicking it downloads the normal installer again.

Installer:
- Downloads downloads/version.json during installation.
- Records the repo Editor version in %LOCALAPPDATA%\Etech\ProxySGTrace\editor.version
- Sends editor_version back in the installation callback.
- Browser stores the installed Editor version for future comparison.

Supported version.json keys:
  editorVersion
  editor_version
  latestEditorVersion
  latest_editor_version
  latestVersion
  latest_version
  version
  latest
  editor.version
  release.version

Recommended version.json:
{
  "editorVersion": "1.29"
}

Important:
- Existing installations made before this version do not have a recorded Editor version.
  Their first version check will show 'installed version unknown' and recommend reinstalling once.
- After that reinstall, future comparisons work normally.

GitHub deploy:
1. Replace index.html
2. Replace downloads/Install_ProxySG_Trace_Launcher_v6.cmd
3. Keep downloads/version.json updated whenever you publish a new Editor ZIP.
4. Uninstaller can remain unchanged.
