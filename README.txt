ProxySG Trace WebLauncher v5 Fixed
================================

Why the button disappeared
--------------------------
The page depended on an external launcher-widget.js file.
If the deployed filename/script src did not match, or GitHub Pages/browser cache
served an older script, #proxysg-launcher-slot remained empty.

Fix
---
- launcher-widget-v5.js is now embedded directly inside index.html.
- The Trace Editor button therefore renders without a separate JS request.
- A fallback warning appears if the launcher slot is still empty.
- English language button initialization timing is also fixed.
- Direct-connection security text is updated for the v5 ZIP-based launcher design.

Deploy
------
1. Replace the GitHub Pages index.html with this package's index.html.
2. Upload downloads/Install_ProxySG_Trace_Launcher_v5.cmd.
3. Upload:
   downloads/ProxySG_Policy_Trace_Editor.zip
   downloads/ProxySG_Policy_Trace_Editor.zip.sha256
4. launcher-widget-v5.js is included for reference only; index.html no longer requires it.

After deployment use Ctrl+F5 once to bypass old page cache.
