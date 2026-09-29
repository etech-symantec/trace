@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
title ProxySG Trace Launcher v5 - Install / Repair

set "BASEURL=https://etech-symantec.github.io/trace/downloads"
set "APPDIR=%LOCALAPPDATA%\Etech\ProxySGTrace"
set "LAUNCHER=%APPDIR%\ProxySG_Trace_Launcher_v5.cmd"
set "EDITOR=%APPDIR%\ProxySG_Policy_Trace_Editor.exe"
set "ZIPFILE=%APPDIR%\ProxySG_Policy_Trace_Editor.zip"
set "ZIPTMP=%APPDIR%\ProxySG_Policy_Trace_Editor.zip.download"
set "HASHFILE=%APPDIR%\ProxySG_Policy_Trace_Editor.zip.sha256"
set "EXTRACTDIR=%TEMP%\ProxySGTraceEditor_v5_%RANDOM%%RANDOM%"

echo.
echo ============================================================
echo   ProxySG Trace Launcher v5 - Install / Repair
echo ============================================================
echo.
echo This installer uses a ZIP distribution for the Policy Trace Editor.
echo.
echo It will:
echo   1. Register the one-shot proxysg-trace-v5:// URL protocol
echo   2. Download ProxySG_Policy_Trace_Editor.zip
echo   3. Download and verify the ZIP SHA-256
echo   4. Extract the ZIP using Windows tar.exe
echo   5. Install the Editor under LocalAppData
echo.
echo It will NOT:
echo   - install a Windows service
echo   - create a startup/background process
echo   - open a localhost listening port
echo   - auto-run the downloaded Editor
echo.
echo Press any key to continue.
pause >nul

where curl.exe >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Windows curl.exe was not found.
  pause
  exit /b 1
)

where tar.exe >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Windows tar.exe was not found.
  echo Windows 10/11 normally includes bsdtar as tar.exe.
  pause
  exit /b 1
)

if not exist "%APPDIR%" mkdir "%APPDIR%" >nul 2>&1
if errorlevel 1 goto :fail

rem ------------------------------------------------------------
rem Create one-shot launcher.
rem ------------------------------------------------------------
> "%LAUNCHER%" echo @echo off
>>"%LAUNCHER%" echo setlocal EnableExtensions DisableDelayedExpansion
>>"%LAUNCHER%" echo title ProxySG Trace Launcher v5
>>"%LAUNCHER%" echo set "EDITOR=%%LOCALAPPDATA%%\Etech\ProxySGTrace\ProxySG_Policy_Trace_Editor.exe"
>>"%LAUNCHER%" echo if exist "%%EDITOR%%" ^(
>>"%LAUNCHER%" echo   start "" "%%EDITOR%%"
>>"%LAUNCHER%" echo   exit /b 0
>>"%LAUNCHER%" echo ^)
>>"%LAUNCHER%" echo exit /b 2

if not exist "%LAUNCHER%" goto :fail

rem ------------------------------------------------------------
rem Register v5 and refresh legacy protocol names.
rem ------------------------------------------------------------
set "REGFILE=%TEMP%\proxysg_trace_launcher_v5_%RANDOM%.reg"
set "COMSPEC_ESC=%ComSpec:\=\\%"
set "LAUNCHER_ESC=%LAUNCHER:\=\\%"

> "%REGFILE%" echo Windows Registry Editor Version 5.00
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace-v5]
>>"%REGFILE%" echo @="URL:ProxySG Trace Launcher v5"
>>"%REGFILE%" echo "URL Protocol"=""
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace-v5\shell\open\command]
>>"%REGFILE%" echo @="\"%COMSPEC_ESC%\" /d /c \"\"%LAUNCHER_ESC%\" \"%%1\"\""
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace]
>>"%REGFILE%" echo @="URL:ProxySG Trace Launcher v5"
>>"%REGFILE%" echo "URL Protocol"=""
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace\shell\open\command]
>>"%REGFILE%" echo @="\"%COMSPEC_ESC%\" /d /c \"\"%LAUNCHER_ESC%\" \"%%1\"\""

reg import "%REGFILE%" >nul 2>&1
set "RC=%ERRORLEVEL%"
del /q "%REGFILE%" >nul 2>&1
if not "%RC%"=="0" goto :fail

rem ------------------------------------------------------------
rem Download ZIP and published SHA-256.
rem ------------------------------------------------------------
echo.
echo [1/5] Downloading Policy Trace Editor ZIP...
curl.exe -fL --retry 2 --connect-timeout 15 ^
  "%BASEURL%/ProxySG_Policy_Trace_Editor.zip" ^
  -o "%ZIPTMP%"
if errorlevel 1 goto :download_fail

echo [2/5] Downloading ZIP SHA-256...
curl.exe -fL --retry 2 --connect-timeout 15 ^
  "%BASEURL%/ProxySG_Policy_Trace_Editor.zip.sha256" ^
  -o "%HASHFILE%"
if errorlevel 1 goto :download_fail

for /f "tokens=1" %%H in (%HASHFILE%) do (
  set "EXPECTED=%%H"
  goto :have_expected
)

:have_expected
if not defined EXPECTED (
  echo [ERROR] Could not read the published ZIP SHA-256.
  goto :fail_cleanup
)

set "ACTUAL="
for /f "tokens=* delims= " %%H in ('certutil -hashfile "%ZIPTMP%" SHA256 ^| findstr /R /I "^[0-9A-F][0-9A-F]*$"') do (
  set "ACTUAL=%%H"
)
if not defined ACTUAL (
  echo [ERROR] Could not calculate ZIP SHA-256.
  goto :fail_cleanup
)

if /I not "%EXPECTED%"=="%ACTUAL%" (
  echo.
  echo [ERROR] ZIP SHA-256 verification FAILED.
  echo Expected: %EXPECTED%
  echo Actual:   %ACTUAL%
  echo Nothing will be extracted or installed.
  goto :fail_cleanup
)

echo [3/5] SHA-256 verified.
move /y "%ZIPTMP%" "%ZIPFILE%" >nul
if errorlevel 1 goto :fail_cleanup

rem ------------------------------------------------------------
rem Extract ZIP to a temporary folder.
rem ------------------------------------------------------------
echo [4/5] Extracting Editor ZIP...
if exist "%EXTRACTDIR%" rmdir /s /q "%EXTRACTDIR%" >nul 2>&1
mkdir "%EXTRACTDIR%" >nul 2>&1
if errorlevel 1 goto :fail_cleanup

tar.exe -xf "%ZIPFILE%" -C "%EXTRACTDIR%"
if errorlevel 1 (
  echo [ERROR] ZIP extraction failed.
  goto :fail_cleanup
)

rem Find the Editor EXE recursively. This supports both:
rem   ProxySG_Policy_Trace_Editor.exe
rem and versioned names such as:
rem   ProxySG_Policy_Trace_Editor_v1.28.exe
set "FOUND_EDITOR="
for /r "%EXTRACTDIR%" %%F in (ProxySG_Policy_Trace_Editor*.exe) do (
  if not defined FOUND_EDITOR set "FOUND_EDITOR=%%F"
)

if not defined FOUND_EDITOR (
  echo [ERROR] No ProxySG_Policy_Trace_Editor*.exe was found inside the ZIP.
  goto :fail_cleanup
)

echo [5/5] Installing Editor...
copy /y "%FOUND_EDITOR%" "%EDITOR%" >nul
if errorlevel 1 goto :fail_cleanup

rem Cleanup temporary extraction only. Keep ZIP + SHA for audit/reinstall.
if exist "%EXTRACTDIR%" rmdir /s /q "%EXTRACTDIR%" >nul 2>&1

echo.
echo ============================================================
echo [OK] v5 ZIP installation completed successfully.
echo ============================================================
echo.
echo Protocol:
echo   proxysg-trace-v5://run
echo.
echo Editor:
echo   %EDITOR%
echo.
echo Verified ZIP:
echo   %ZIPFILE%
echo.
echo The Editor was NOT automatically executed by this installer.
echo Return to the web page and click "Trace Editor Run".
echo.
pause
exit /b 0

:download_fail
echo.
echo [ERROR] Could not download:
echo   %BASEURL%/ProxySG_Policy_Trace_Editor.zip
echo or:
echo   %BASEURL%/ProxySG_Policy_Trace_Editor.zip.sha256
goto :fail_cleanup

:fail_cleanup
if exist "%ZIPTMP%" del /q "%ZIPTMP%" >nul 2>&1
if exist "%EXTRACTDIR%" rmdir /s /q "%EXTRACTDIR%" >nul 2>&1
echo.
pause
exit /b 1

:fail
echo.
echo [ERROR] Launcher v5 installation failed.
echo.
pause
exit /b 1
