ProxySG Trace Launcher v6
==========================

Why v5 looked like "nothing happens"
------------------------------------
The screenshots show:
1. The browser attempted proxysg-trace-v5://run (red "run" request).
   That means the v5 Windows URL protocol was not registered/usable.
2. The GitHub downloads folder contains ProxySG_Policy_Trace_Editor.zip,
   but ProxySG_Policy_Trace_Editor.zip.sha256 is missing.
   The v5 installer requires that SHA-256 file and cannot finish without it.
3. The old web code tried the custom protocol first and only downloaded the
   installer later. Browser security can block a delayed synthetic download.

v6 changes
----------
There is still only ONE main button, but it has a deterministic state:

Before installation:
  [Trace Editor 설치]
  -> directly downloads Install_ProxySG_Trace_Launcher_v6.cmd
     inside the user's click gesture.

After the user runs the CMD successfully:
  -> the installer opens the page with ?launcher=v6-installed
  -> the page records v6 installation in localStorage
  -> the same button becomes [Trace Editor 실행]

Run:
  -> direct navigation to proxysg-trace-v6://run
  -> no hidden iframe
  -> no delayed automatic installer download

Required GitHub layout
----------------------
index.html

downloads/
  Install_ProxySG_Trace_Launcher_v6.cmd
  ProxySG_Policy_Trace_Editor.zip
  ProxySG_Policy_Trace_Editor.zip.sha256

IMPORTANT
---------
The ZIP SHA file is mandatory.

To create it:
  tools/Create_Editor_Zip_SHA256.cmd "C:\path\ProxySG_Policy_Trace_Editor.zip"

Upload the resulting:
  ProxySG_Policy_Trace_Editor.zip.sha256
next to the ZIP in /downloads.

Browser limitation
------------------
Chrome/Edge do not allow a normal website to download a CMD and then execute it
automatically. The user must run the downloaded installer once.
