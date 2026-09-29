@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
title ProxySG Trace Launcher v6 - Install / Repair

set "BASEURL=https://etech-symantec.github.io/trace/downloads"
set "APPDIR=%LOCALAPPDATA%\Etech\ProxySGTrace"
set "LAUNCHER=%APPDIR%\ProxySG_Trace_Launcher_v6.cmd"
set "EDITOR=%APPDIR%\ProxySG_Policy_Trace_Editor.exe"
set "ZIPTMP=%APPDIR%\ProxySG_Policy_Trace_Editor.zip.download"
set "ZIPFILE=%APPDIR%\ProxySG_Policy_Trace_Editor.zip"
set "HASHFILE=%APPDIR%\ProxySG_Policy_Trace_Editor.zip.sha256"
set "EXTRACTDIR=%TEMP%\ProxySGTraceEditor_v6_%RANDOM%%RANDOM%"
set "LOGFILE=%TEMP%\ProxySG_Trace_Launcher_v6_install.log"
> "%LOGFILE%" echo [%date% %time%] Installation started

echo.
echo ============================================================
echo   ProxySG Trace Launcher v6 - Install / Repair
echo ============================================================
echo.
echo This user-initiated installer will:
echo   1. Register proxysg-trace-v6:// for the current Windows user
echo   2. Download the Policy Trace Editor ZIP
echo   3. Download and verify the published ZIP SHA-256
echo   4. Extract and install the Editor under LocalAppData
echo.
echo It does NOT install a service, startup item, localhost listener,
echo or resident background process.
echo.

where curl.exe >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Windows curl.exe was not found.

  exit /b 1
)

where tar.exe >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Windows tar.exe was not found.

  exit /b 1
)

if not exist "%APPDIR%" mkdir "%APPDIR%" >nul 2>&1
if errorlevel 1 goto :fail

rem ------------------------------------------------------------
rem Create the one-shot launcher.
rem ------------------------------------------------------------
> "%LAUNCHER%" echo @echo off
>>"%LAUNCHER%" echo setlocal EnableExtensions DisableDelayedExpansion
>>"%LAUNCHER%" echo set "EDITOR=%%LOCALAPPDATA%%\Etech\ProxySGTrace\ProxySG_Policy_Trace_Editor.exe"
>>"%LAUNCHER%" echo if exist "%%EDITOR%%" ^(
>>"%LAUNCHER%" echo   start "" "%%EDITOR%%"
>>"%LAUNCHER%" echo   exit /b 0
>>"%LAUNCHER%" echo ^)
>>"%LAUNCHER%" echo exit /b 2

if not exist "%LAUNCHER%" goto :fail

rem ------------------------------------------------------------
rem Register v6 and refresh the legacy protocol aliases.
rem ------------------------------------------------------------
set "REGFILE=%TEMP%\proxysg_trace_v6_%RANDOM%.reg"
set "COMSPEC_ESC=%ComSpec:\=\\%"
set "LAUNCHER_ESC=%LAUNCHER:\=\\%"

> "%REGFILE%" echo Windows Registry Editor Version 5.00
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace-v6]
>>"%REGFILE%" echo @="URL:ProxySG Trace Launcher v6"
>>"%REGFILE%" echo "URL Protocol"=""
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace-v6\shell\open\command]
>>"%REGFILE%" echo @="\"%COMSPEC_ESC%\" /d /c \"\"%LAUNCHER_ESC%\" \"%%1\"\""
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace]
>>"%REGFILE%" echo @="URL:ProxySG Trace Launcher v6"
>>"%REGFILE%" echo "URL Protocol"=""
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace\shell\open\command]
>>"%REGFILE%" echo @="\"%COMSPEC_ESC%\" /d /c \"\"%LAUNCHER_ESC%\" \"%%1\"\""

reg import "%REGFILE%" >nul 2>&1
set "RC=%ERRORLEVEL%"
del /q "%REGFILE%" >nul 2>&1
if not "%RC%"=="0" goto :fail

echo.
echo [1/5] Downloading Editor ZIP...
>> "%LOGFILE%" echo [%date% %time%] Downloading Editor ZIP
curl.exe -fL --retry 2 --connect-timeout 15 ^
  "%BASEURL%/ProxySG_Policy_Trace_Editor.zip" ^
  -o "%ZIPTMP%"
if errorlevel 1 goto :download_fail

echo [2/5] Downloading Editor ZIP SHA-256...
>> "%LOGFILE%" echo [%date% %time%] Downloading SHA-256
curl.exe -fL --retry 2 --connect-timeout 15 ^
  "%BASEURL%/ProxySG_Policy_Trace_Editor.zip.sha256" ^
  -o "%HASHFILE%"
if errorlevel 1 (
  echo.
  echo [ERROR] ProxySG_Policy_Trace_Editor.zip.sha256 is missing or cannot be downloaded.
  echo Upload that file to the GitHub downloads folder.
  goto :fail_cleanup
)

for /f "tokens=1" %%H in (%HASHFILE%) do (
  set "EXPECTED=%%H"
  goto :have_expected
)

:have_expected
if not defined EXPECTED (
  echo [ERROR] The published SHA-256 file is empty or invalid.
  goto :fail_cleanup
)

set "ACTUAL="
for /f "tokens=* delims= " %%H in ('certutil -hashfile "%ZIPTMP%" SHA256 ^| findstr /R /I "^[0-9A-F][0-9A-F]*$"') do set "ACTUAL=%%H"

if not defined ACTUAL (
  echo [ERROR] Could not calculate the ZIP SHA-256.
  goto :fail_cleanup
)

if /I not "%EXPECTED%"=="%ACTUAL%" (
  echo.
  echo [ERROR] ZIP SHA-256 verification FAILED.
  echo Expected: %EXPECTED%
  echo Actual:   %ACTUAL%
  goto :fail_cleanup
)

echo [3/5] SHA-256 verified.
>> "%LOGFILE%" echo [%date% %time%] SHA-256 verified
move /y "%ZIPTMP%" "%ZIPFILE%" >nul
if errorlevel 1 goto :fail_cleanup

echo [4/5] Extracting Editor ZIP...
>> "%LOGFILE%" echo [%date% %time%] Extracting Editor ZIP
if exist "%EXTRACTDIR%" rmdir /s /q "%EXTRACTDIR%" >nul 2>&1
mkdir "%EXTRACTDIR%" >nul 2>&1
tar.exe -xf "%ZIPFILE%" -C "%EXTRACTDIR%"
if errorlevel 1 goto :fail_cleanup

set "FOUND_EDITOR="
for /r "%EXTRACTDIR%" %%F in (ProxySG_Policy_Trace_Editor*.exe) do (
  if not defined FOUND_EDITOR set "FOUND_EDITOR=%%F"
)

if not defined FOUND_EDITOR (
  echo [ERROR] No ProxySG_Policy_Trace_Editor*.exe was found inside the ZIP.
  goto :fail_cleanup
)

echo [5/5] Installing Editor...
>> "%LOGFILE%" echo [%date% %time%] Installing Editor
copy /y "%FOUND_EDITOR%" "%EDITOR%" >nul
if errorlevel 1 goto :fail_cleanup

if exist "%EXTRACTDIR%" rmdir /s /q "%EXTRACTDIR%" >nul 2>&1

echo.
echo ============================================================
echo [OK] Installation completed successfully.
>> "%LOGFILE%" echo [%date% %time%] Installation completed successfully
echo ============================================================
echo.
echo Installed Editor:
echo   %EDITOR%
echo.
echo Opening the Trace page to confirm the v6 installation...
start "" "https://etech-symantec.github.io/trace/?mode=direct&launcher=v6-installed"
echo.
echo Installation completed. This window will close automatically.
timeout /t 2 /nobreak >nul
exit /b 0

:download_fail
>> "%LOGFILE%" echo [%date% %time%] ERROR: download failed
echo.
echo [ERROR] Could not download ProxySG_Policy_Trace_Editor.zip
echo from:
echo   %BASEURL%
goto :fail_cleanup

:fail_cleanup
>> "%LOGFILE%" echo [%date% %time%] ERROR: install failed
if exist "%ZIPTMP%" del /q "%ZIPTMP%" >nul 2>&1
if exist "%EXTRACTDIR%" rmdir /s /q "%EXTRACTDIR%" >nul 2>&1
echo.

exit /b 1

:fail
>> "%LOGFILE%" echo [%date% %time%] ERROR: launcher installation failed
echo.
echo [ERROR] Launcher v6 installation failed.
echo.

exit /b 1
