ProxySG Operations & Analysis Tools v18

Changes
-------
- Sysinfo / ISG / MIB tabs no longer navigate away from the Trace site.
- Clicking each tab shows the corresponding web application directly below the tab row.
- Each external web app is lazy-loaded only when its tab is selected for the first time.
- Embedded pages keep their state when switching between tabs.
- Query modes are supported:
    default or ?mode=direct -> ProxySG Direct Connection
    ?mode=file              -> Trace File Analysis
    ?mode=sysinfo           -> Sysinfo Analysis
    ?mode=isg               -> ISG Analysis
    ?mode=mib               -> MIB Analysis
- Optional 'Open in new window' button is provided in each embedded tool toolbar.
- Korean / English labels are included.

Embedded pages
--------------
https://etech-symantec.github.io/sysinfo/
https://etech-symantec.github.io/isg/
https://etech-symantec.github.io/mib/

Deploy
------
Replace index.html only.
Existing installer/uninstaller/editor files remain unchanged.
