@echo off
setlocal EnableExtensions DisableDelayedExpansion
title ProxySG Trace Editor - Uninstall

set "APPDIR=%LOCALAPPDATA%\Etech\ProxySGTrace"
set "LOGFILE=%TEMP%\ProxySG_Trace_Uninstall_v6.log"

> "%LOGFILE%" echo [%date% %time%] Uninstall started

echo [1/4] Closing ProxySG Trace Editor...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-Process -ErrorAction SilentlyContinue | Where-Object { try { ($_.ProcessName -like 'ProxySG_Policy_Trace_Editor*') -or ($_.Path -and $_.Path -like '*\Etech\ProxySGTrace\ProxySG_Policy_Trace_Editor.exe') } catch { $false } } | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1

timeout /t 1 /nobreak >nul

echo [2/4] Removing URL Protocol registrations...
reg delete "HKCU\Software\Classes\proxysg-trace-v6" /f >nul 2>&1
reg delete "HKCU\Software\Classes\proxysg-trace" /f >nul 2>&1

echo [3/4] Removing local application files...
if exist "%APPDIR%" rmdir /s /q "%APPDIR%" >nul 2>&1

if exist "%APPDIR%" (
  >> "%LOGFILE%" echo [%date% %time%] ERROR Could not remove application directory
  echo [ERROR] Some local files could not be removed.
  echo [ERROR] See: %LOGFILE%
  exit /b 1
)

echo [4/4] Finishing...
>> "%LOGFILE%" echo [%date% %time%] Uninstall completed successfully

start "" "https://etech-symantec.github.io/trace/?mode=direct&launcher=v6-uninstalled"

timeout /t 2 /nobreak >nul
exit /b 0
