ProxySG Trace v5.1 protocol hotfix

Issue:
- v5 used a hidden iframe to open proxysg-trace-v5://run.
- Chrome/Edge can treat a custom URL scheme loaded in an iframe as a failed request
  (ERR_UNKNOWN_URL_SCHEME), which matches the red 'run' entries seen in DevTools.

Fix:
- Call the custom protocol directly from an <a href="proxysg-trace-v5://run"> click.
- The click occurs within the user's button gesture, which is more compatible with
  external-protocol handling in Chromium browsers.
- Installer fallback remains: if the browser does not leave/focus-shift within ~2.2 s,
  Install_ProxySG_Trace_Launcher_v5.cmd is downloaded.
- Installer URL is cache-busted.

Deploy:
1. Replace GitHub Pages index.html with this package's index.html.
2. Keep these downloads:
   downloads/Install_ProxySG_Trace_Launcher_v5.cmd
   downloads/ProxySG_Policy_Trace_Editor.zip
   downloads/ProxySG_Policy_Trace_Editor.zip.sha256
3. Ctrl+F5 once after deployment.
