ProxySG Trace v16.1 - Installer Parser Fix

Cause of the error:
- v6.3 embedded a complex PowerShell expression inside CMD FOR /F and parentheses.
- cmd.exe parsed part of that expression itself and stopped with:
  "... was unexpected at this time."

Fix:
- Version parsing is now a standalone PowerShell command.
- No PowerShell expression is embedded inside FOR /F.
- Installation still continues even if version.json cannot be read.
- If version.json is unavailable, the installer tries to derive the version from:
  ProxySG_Policy_Trace_Editor_vX.Y.exe
- curl progress output is hidden; only actual errors are shown.
- Installer remains ASCII/no-BOM.

GitHub:
1. Replace index.html
2. Replace downloads/Install_ProxySG_Trace_Launcher_v6.cmd
3. Keep ProxySG_Policy_Trace_Editor.zip and its .sha256 unchanged.
4. Recommended downloads/version.json:
   { "editorVersion": "1.29" }
