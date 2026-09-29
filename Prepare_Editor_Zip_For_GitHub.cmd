@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Prepare ProxySG Editor ZIP for GitHub

if "%~1"=="" (
  echo.
  echo Drag the existing Policy Trace Editor ZIP onto this CMD file,
  echo or run:
  echo.
  echo   Prepare_Editor_Zip_For_GitHub.cmd "C:\path\ProxySG_Policy_Trace_Editor_v1.28_Windows_x64.zip"
  echo.
  pause
  exit /b 1
)

set "SRC=%~1"
set "OUTDIR=%~dp0github_upload"
set "OUTZIP=%OUTDIR%\ProxySG_Policy_Trace_Editor.zip"
set "OUTHASH=%OUTDIR%\ProxySG_Policy_Trace_Editor.zip.sha256"

if not exist "%SRC%" (
  echo [ERROR] File not found:
  echo %SRC%
  pause
  exit /b 1
)

if not exist "%OUTDIR%" mkdir "%OUTDIR%" >nul 2>&1
copy /y "%SRC%" "%OUTZIP%" >nul
if errorlevel 1 (
  echo [ERROR] Could not copy ZIP.
  pause
  exit /b 1
)

set "HASH="
for /f "tokens=* delims= " %%H in ('certutil -hashfile "%OUTZIP%" SHA256 ^| findstr /R /I "^[0-9A-F][0-9A-F]*$"') do (
  set "HASH=%%H"
)

if not defined HASH (
  echo [ERROR] SHA-256 calculation failed.
  pause
  exit /b 1
)

> "%OUTHASH%" echo %HASH%  ProxySG_Policy_Trace_Editor.zip

echo.
echo [OK] GitHub upload files created:
echo.
echo   %OUTZIP%
echo   %OUTHASH%
echo.
echo Upload both files to:
echo   trace/downloads/
echo.
pause
