@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
title ProxySG Trace Launcher - Install / Repair

set "BASEURL=https://etech-symantec.github.io/trace/downloads"
set "APPDIR=%LOCALAPPDATA%\Etech\ProxySGTrace"
set "LAUNCHER=%APPDIR%\ProxySG_Trace_Launcher.cmd"
set "EDITOR=%APPDIR%\ProxySG_Policy_Trace_Editor.exe"
set "EDITOR_TMP=%APPDIR%\ProxySG_Policy_Trace_Editor.exe.download"
set "HASHFILE=%APPDIR%\ProxySG_Policy_Trace_Editor.exe.sha256"

echo.
echo ============================================================
echo   ProxySG Trace Launcher - Install / Repair
echo ============================================================
echo.
echo This is a user-initiated installation.
echo.
echo It will:
echo   1. Install the one-shot URL Protocol Launcher
echo   2. Download the Policy Trace Editor from the official site
echo   3. Verify its SHA-256 checksum
echo   4. Install it under LocalAppData
echo.
echo It will NOT:
echo   - install a Windows service
echo   - create a startup/background process
echo   - open a localhost listening port
echo   - automatically run the downloaded Editor
echo.
echo Install path:
echo   %APPDIR%
echo.
echo Press any key to continue.
pause >nul

where curl.exe >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERROR] Windows curl.exe was not found.
  echo Please update Windows or download the Editor manually.
  pause
  exit /b 1
)

if not exist "%APPDIR%" mkdir "%APPDIR%" >nul 2>&1
if errorlevel 1 goto :fail

rem ------------------------------------------------------------
rem Create the transparent one-shot launcher locally.
rem ------------------------------------------------------------
> "%LAUNCHER%" echo @echo off
>>"%LAUNCHER%" echo setlocal EnableExtensions DisableDelayedExpansion
>>"%LAUNCHER%" echo title ProxySG Trace Launcher
>>"%LAUNCHER%" echo set "EDITOR=%%LOCALAPPDATA%%\Etech\ProxySGTrace\ProxySG_Policy_Trace_Editor.exe"
>>"%LAUNCHER%" echo if exist "%%EDITOR%%" ^(
>>"%LAUNCHER%" echo   start "" "%%EDITOR%%"
>>"%LAUNCHER%" echo   exit /b 0
>>"%LAUNCHER%" echo ^)
>>"%LAUNCHER%" echo start "" "https://etech-symantec.github.io/trace/?mode=direct"
>>"%LAUNCHER%" echo exit /b 2

if not exist "%LAUNCHER%" goto :fail

rem ------------------------------------------------------------
rem Register proxysg-trace:// for CURRENT USER only.
rem ------------------------------------------------------------
set "REGFILE=%TEMP%\proxysg_trace_launcher_%RANDOM%.reg"
set "COMSPEC_ESC=%ComSpec:\=\\%"
set "LAUNCHER_ESC=%LAUNCHER:\=\\%"

> "%REGFILE%" echo Windows Registry Editor Version 5.00
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace]
>>"%REGFILE%" echo @="URL:ProxySG Trace Launcher"
>>"%REGFILE%" echo "URL Protocol"=""
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace\shell\open\command]
>>"%REGFILE%" echo @="\"%COMSPEC_ESC%\" /d /c \"\"%LAUNCHER_ESC%\" \"%%1\"\""

reg import "%REGFILE%" >nul 2>&1
set "RC=%ERRORLEVEL%"
del /q "%REGFILE%" >nul 2>&1
if not "%RC%"=="0" goto :fail

rem ------------------------------------------------------------
rem Download Editor + published SHA-256 from official GitHub Pages.
rem IMPORTANT: The installer does NOT run the downloaded EXE.
rem ------------------------------------------------------------
echo.
echo [1/3] Downloading Policy Trace Editor...
curl.exe -fL --retry 2 --connect-timeout 15 ^
  "%BASEURL%/ProxySG_Policy_Trace_Editor.exe" ^
  -o "%EDITOR_TMP%"
if errorlevel 1 goto :download_fail

echo [2/3] Downloading SHA-256 checksum...
curl.exe -fL --retry 2 --connect-timeout 15 ^
  "%BASEURL%/ProxySG_Policy_Trace_Editor.exe.sha256" ^
  -o "%HASHFILE%"
if errorlevel 1 goto :download_fail

for /f "tokens=1" %%H in (%HASHFILE%) do (
  set "EXPECTED=%%H"
  goto :have_expected
)

:have_expected
if not defined EXPECTED (
  echo [ERROR] Could not read the published SHA-256 checksum.
  goto :fail_cleanup
)

set "ACTUAL="
for /f "tokens=* delims= " %%H in ('certutil -hashfile "%EDITOR_TMP%" SHA256 ^| findstr /R /I "^[0-9A-F][0-9A-F]*$"') do (
  set "ACTUAL=%%H"
)
if not defined ACTUAL (
  echo [ERROR] Could not calculate SHA-256 checksum.
  goto :fail_cleanup
)

if /I not "%EXPECTED%"=="%ACTUAL%" (
  echo.
  echo [ERROR] SHA-256 verification FAILED.
  echo Expected: %EXPECTED%
  echo Actual:   %ACTUAL%
  echo The downloaded Editor will NOT be installed or executed.
  goto :fail_cleanup
)

echo [3/3] SHA-256 verified. Installing Editor...
move /y "%EDITOR_TMP%" "%EDITOR%" >nul
if errorlevel 1 goto :fail_cleanup

echo.
echo ============================================================
echo [OK] Installation completed successfully.
echo ============================================================
echo.
echo Installed:
echo   %EDITOR%
echo.
echo Registered:
echo   proxysg-trace://run
echo.
echo The Editor was NOT automatically executed by this installer.
echo Return to the web page and click "Trace Editor Run".
echo.
pause
exit /b 0

:download_fail
echo.
echo [ERROR] Could not download the Editor or checksum from:
echo %BASEURL%
goto :fail_cleanup

:fail_cleanup
if exist "%EDITOR_TMP%" del /q "%EDITOR_TMP%" >nul 2>&1
echo.
pause
exit /b 1

:fail
echo.
echo [ERROR] Launcher installation failed.
echo.
pause
exit /b 1
