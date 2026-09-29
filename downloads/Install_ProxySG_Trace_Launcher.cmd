@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
title ProxySG Trace Launcher - Install / Repair

echo.
echo ============================================================
echo   ProxySG Trace Launcher - Install / Repair
echo ============================================================
echo.
echo This installer:
echo   - installs only for the current Windows user
echo   - does not install a service or background process
echo   - does not open a localhost port
echo   - does not download or execute another EXE
echo   - registers the proxysg-trace:// URL protocol only
echo.
echo Press any key to continue.
pause >nul

set "APPDIR=%LOCALAPPDATA%\Etech\ProxySGTrace"
set "TARGET=%APPDIR%\ProxySG_Trace_Launcher.cmd"

if not exist "%APPDIR%" mkdir "%APPDIR%" >nul 2>&1
if errorlevel 1 goto :fail

> "%TARGET%" echo @echo off
>>"%TARGET%" echo setlocal EnableExtensions DisableDelayedExpansion
>>"%TARGET%" echo title ProxySG Trace Launcher
>>"%TARGET%" echo set "APPDIR=%%LOCALAPPDATA%%\Etech\ProxySGTrace"
>>"%TARGET%" echo set "EDITOR="
>>"%TARGET%" echo if exist "%%APPDIR%%\ProxySG_Policy_Trace_Editor.exe" ^(
>>"%TARGET%" echo   set "EDITOR=%%APPDIR%%\ProxySG_Policy_Trace_Editor.exe"
>>"%TARGET%" echo   goto :run_editor
>>"%TARGET%" echo ^)
>>"%TARGET%" echo if exist "%%~dp0ProxySG_Policy_Trace_Editor.exe" ^(
>>"%TARGET%" echo   set "EDITOR=%%~dp0ProxySG_Policy_Trace_Editor.exe"
>>"%TARGET%" echo   goto :run_editor
>>"%TARGET%" echo ^)
>>"%TARGET%" echo for /f "delims=" %%%%F in ^('dir /b /a-d /o-d "%%USERPROFILE%%\Downloads\ProxySG_Policy_Trace_Editor*.exe" 2^^^>nul'^) do ^(
>>"%TARGET%" echo   set "EDITOR=%%USERPROFILE%%\Downloads\%%%%F"
>>"%TARGET%" echo   goto :run_editor
>>"%TARGET%" echo ^)
>>"%TARGET%" echo for /f "delims=" %%%%F in ^('dir /b /a-d /o-d "%%USERPROFILE%%\Desktop\ProxySG_Policy_Trace_Editor*.exe" 2^^^>nul'^) do ^(
>>"%TARGET%" echo   set "EDITOR=%%USERPROFILE%%\Desktop\%%%%F"
>>"%TARGET%" echo   goto :run_editor
>>"%TARGET%" echo ^)
>>"%TARGET%" echo start "" "https://etech-symantec.github.io/trace/?mode=direct"
>>"%TARGET%" echo exit /b 2
>>"%TARGET%" echo :run_editor
>>"%TARGET%" echo start "" "%%EDITOR%%"
>>"%TARGET%" echo exit /b 0

if not exist "%TARGET%" goto :fail

set "REGFILE=%TEMP%\proxysg_trace_launcher_%RANDOM%.reg"
set "COMSPEC_ESC=%ComSpec:\=\\%"
set "TARGET_ESC=%TARGET:\=\\%"

> "%REGFILE%" echo Windows Registry Editor Version 5.00
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace]
>>"%REGFILE%" echo @="URL:ProxySG Trace Launcher"
>>"%REGFILE%" echo "URL Protocol"=""
>>"%REGFILE%" echo.
>>"%REGFILE%" echo [HKEY_CURRENT_USER\Software\Classes\proxysg-trace\shell\open\command]
>>"%REGFILE%" echo @="\"%COMSPEC_ESC%\" /d /c \"\"%TARGET_ESC%\" \"%%1\"\""

reg import "%REGFILE%" >nul 2>&1
set "RC=%ERRORLEVEL%"
del /q "%REGFILE%" >nul 2>&1

if not "%RC%"=="0" goto :fail

echo.
echo [OK] Launcher installation completed.
echo.
echo You can now return to the web page and click the same
echo "Trace Editor Run" button again.
echo.
pause
exit /b 0

:fail
echo.
echo [ERROR] Launcher installation failed.
echo.
pause
exit /b 1
