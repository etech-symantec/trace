@echo off
setlocal EnableExtensions DisableDelayedExpansion
title ProxySG Trace Editor - Uninstall v6.2

set "APPDIR=%LOCALAPPDATA%\Etech\ProxySGTrace"
set "LOGFILE=%TEMP%\ProxySG_Trace_Uninstall_v6.log"

> "%LOGFILE%" echo [%date% %time%] Uninstall v6.2 started
>>"%LOGFILE%" echo [%date% %time%] APPDIR=%APPDIR%

echo [1/5] Closing ProxySG Trace Editor and related launcher processes...

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$app=[IO.Path]::GetFullPath($env:LOCALAPPDATA+'\Etech\ProxySGTrace');" ^
  "Get-Process -ErrorAction SilentlyContinue | ForEach-Object {" ^
  "  try {" ^
  "    $p=$_.Path;" ^
  "    if(($_.ProcessName -like 'ProxySG_Policy_Trace_Editor*') -or ($p -and [IO.Path]::GetFullPath($p).StartsWith($app,[StringComparison]::OrdinalIgnoreCase))) {" ^
  "      Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue" ^
  "    }" ^
  "  } catch {}" ^
  "}" >nul 2>&1

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$needle='\Etech\ProxySGTrace\';" ^
  "Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {" ^
  "  ($_.Name -ieq 'cmd.exe' -or $_.Name -ieq 'powershell.exe') -and $_.CommandLine -and $_.CommandLine -like ('*'+$needle+'*')" ^
  "} | ForEach-Object {" ^
  "  try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch {}" ^
  "}" >nul 2>&1

echo [2/5] Removing URL Protocol registrations...
reg delete "HKCU\Software\Classes\proxysg-trace-v6" /f >nul 2>&1
reg delete "HKCU\Software\Classes\proxysg-trace" /f >nul 2>&1

echo [3/5] Waiting for file handles to be released...
for /L %%N in (1,1,12) do (
  timeout /t 1 /nobreak >nul

  if exist "%APPDIR%\ProxySG_Policy_Trace_Editor.exe" del /f /q "%APPDIR%\ProxySG_Policy_Trace_Editor.exe" >nul 2>&1
  if exist "%APPDIR%\ProxySG_Trace_Launcher_v6.cmd" del /f /q "%APPDIR%\ProxySG_Trace_Launcher_v6.cmd" >nul 2>&1
  if exist "%APPDIR%\ProxySG_Policy_Trace_Editor.zip" del /f /q "%APPDIR%\ProxySG_Policy_Trace_Editor.zip" >nul 2>&1
  if exist "%APPDIR%\ProxySG_Policy_Trace_Editor.zip.sha256" del /f /q "%APPDIR%\ProxySG_Policy_Trace_Editor.zip.sha256" >nul 2>&1

  if exist "%APPDIR%" rmdir /s /q "%APPDIR%" >nul 2>&1
  if not exist "%APPDIR%" goto :removed
)

echo [4/5] Checking files that are still locked...
>>"%LOGFILE%" echo [%date% %time%] ERROR Could not remove application directory after retries
>>"%LOGFILE%" echo [%date% %time%] Remaining files:
if exist "%APPDIR%" (
  for /f "delims=" %%F in ('dir /a /s /b "%APPDIR%" 2^>nul') do >>"%LOGFILE%" echo %%F
)

echo.
echo [ERROR] Some local files are still in use and could not be removed.
echo [ERROR] Details were written to:
echo         %LOGFILE%
echo.
echo Close any remaining ProxySG Trace Editor / command windows and run this file again.
exit /b 1

:removed
echo [4/5] Local application files removed.
>>"%LOGFILE%" echo [%date% %time%] Local application directory removed

echo [5/5] Finishing...
>>"%LOGFILE%" echo [%date% %time%] Uninstall completed successfully

start "" "https://etech-symantec.github.io/trace/?mode=direct&launcher=v6-uninstalled"

timeout /t 2 /nobreak >nul
exit /b 0
