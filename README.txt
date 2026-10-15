ProxySG Trace v15.1 - State Sync 3 sec

Changes:
- Install/uninstall fallback state check interval: 1 sec -> 3 sec
- Polling duration remains about 30 seconds (10 checks)
- UI is re-rendered only when install state actually changes
- Prevents the description/help box from visibly refreshing every poll

GitHub:
Replace index.html only.
Install/Uninstall CMD files can remain unchanged.
