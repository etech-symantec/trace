@echo off
setlocal EnableExtensions DisableDelayedExpansion
title ProxySG Trace Launcher v6.4 - Install / Repair

set "BASEURL=https://etech-symantec.github.io/trace/downloads"
set "APPDIR=%LOCALAPPDATA%\Etech\ProxySGTrace"
set "LAUNCHER=%APPDIR%\ProxySG_Trace_Launcher_v6.cmd"
set "EDITOR=%APPDIR%\ProxySG_Policy_Trace_Editor.exe"
set "EDITORNEW=%APPDIR%\ProxySG_Policy_Trace_Editor.exe.new"
set "ZIPTMP=%APPDIR%\ProxySG_Policy_Trace_Editor.zip.download"
set "ZIPFILE=%APPDIR%\ProxySG_Policy_Trace_Editor.zip"
set "HASHFILE=%APPDIR%\ProxySG_Policy_Trace_Editor.zip.sha256"
set "VERSIONFILE=%APPDIR%\version.json"
set "VERSIONMARKER=%APPDIR%\editor.version"
set "EXTRACTDIR=%TEMP%\ProxySGTraceEditor_v64_%RANDOM%%RANDOM%"
set "LOGFILE=%TEMP%\ProxySG_Trace_Launcher_v6_install.log"

> "%LOGFILE%" echo [%date% %time%] Install v6.4 started

where curl.exe >nul 2>&1
if errorlevel 1 goto :no_curl

where tar.exe >nul 2>&1
if errorlevel 1 goto :no_tar

if not exist "%APPDIR%" mkdir "%APPDIR%" >nul 2>&1
if errorlevel 1 goto :fail

rem ------------------------------------------------------------
rem Create one-shot launcher.
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
rem Register v6 URL protocol for current user.
rem ------------------------------------------------------------
set "REGFILE=%TEMP%\proxysg_trace_v64_%RANDOM%.reg"
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

echo [1/7] Downloading Editor ZIP...
>>"%LOGFILE%" echo [%date% %time%] Downloading Editor ZIP
curl.exe -fsSL --retry 2 --connect-timeout 15 "%BASEURL%/ProxySG_Policy_Trace_Editor.zip" -o "%ZIPTMP%"
if errorlevel 1 goto :download_fail

echo [2/7] Downloading ZIP SHA-256...
>>"%LOGFILE%" echo [%date% %time%] Downloading ZIP SHA-256
curl.exe -fsSL --retry 2 --connect-timeout 15 "%BASEURL%/ProxySG_Policy_Trace_Editor.zip.sha256" -o "%HASHFILE%"
if errorlevel 1 goto :hash_download_fail

echo [3/7] Reading Editor version...
>>"%LOGFILE%" echo [%date% %time%] Reading version.json
set "EDITOR_VERSION="
if exist "%VERSIONMARKER%" del /q "%VERSIONMARKER%" >nul 2>&1
if exist "%VERSIONFILE%" del /q "%VERSIONFILE%" >nul 2>&1

curl.exe -fsSL --connect-timeout 10 "%BASEURL%/version.json?_=%RANDOM%%RANDOM%" -o "%VERSIONFILE%" >nul 2>&1
if not exist "%VERSIONFILE%" goto :version_metadata_done

rem IMPORTANT:
rem Run PowerShell as a standalone command. Do not embed it in FOR /F or a
rem parenthesized CMD block. That avoids "was unexpected at this time" errors.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='SilentlyContinue';$j=Get-Content -Raw -LiteralPath '%VERSIONFILE%'|ConvertFrom-Json;$v=@($j.editorVersion,$j.editor_version,$j.latestEditorVersion,$j.latest_editor_version,$j.latestVersion,$j.latest_version,$j.version,$j.latest,$j.editor.version,$j.release.version)|Where-Object {$_}|Select-Object -First 1;if($v){$s=([string]$v)-replace '^v','';[IO.File]::WriteAllText('%VERSIONMARKER%',$s)}" >nul 2>&1

if not exist "%VERSIONMARKER%" goto :version_metadata_done
set /p EDITOR_VERSION=<"%VERSIONMARKER%"

:version_metadata_done
if defined EDITOR_VERSION >>"%LOGFILE%" echo [%date% %time%] Repo Editor version %EDITOR_VERSION%
if not defined EDITOR_VERSION >>"%LOGFILE%" echo [%date% %time%] Repo Editor version unavailable

echo [4/7] Verifying SHA-256...
set "EXPECTED="
for /f "usebackq tokens=1" %%H in ("%HASHFILE%") do set "EXPECTED=%%H"
if not defined EXPECTED goto :hash_invalid

set "ACTUAL="
for /f "tokens=* delims= " %%H in ('certutil -hashfile "%ZIPTMP%" SHA256 ^| findstr /R /I "^[0-9A-F][0-9A-F]*$"') do set "ACTUAL=%%H"
if not defined ACTUAL goto :hash_calc_fail

if /I not "%EXPECTED%"=="%ACTUAL%" goto :hash_mismatch
>>"%LOGFILE%" echo [%date% %time%] ZIP SHA-256 verified

move /y "%ZIPTMP%" "%ZIPFILE%" >nul
if errorlevel 1 goto :fail_cleanup

echo [5/7] Extracting Editor ZIP...
>>"%LOGFILE%" echo [%date% %time%] Extracting Editor ZIP
if exist "%EXTRACTDIR%" rmdir /s /q "%EXTRACTDIR%" >nul 2>&1
mkdir "%EXTRACTDIR%" >nul 2>&1
if errorlevel 1 goto :fail_cleanup

tar.exe -xf "%ZIPFILE%" -C "%EXTRACTDIR%"
if errorlevel 1 goto :extract_fail

set "FOUND_EDITOR="
for /r "%EXTRACTDIR%" %%F in (ProxySG_Policy_Trace_Editor*.exe) do if not defined FOUND_EDITOR set "FOUND_EDITOR=%%F"
if not defined FOUND_EDITOR goto :editor_not_found

rem If version.json did not provide a version, derive it from a versioned EXE filename.
if defined EDITOR_VERSION goto :editor_version_ready
for %%A in ("%FOUND_EDITOR%") do set "EDITOR_FILE=%%~nA"
set "FALLBACK_VERSION=%EDITOR_FILE:ProxySG_Policy_Trace_Editor_v=%"
if /I not "%FALLBACK_VERSION%"=="%EDITOR_FILE%" set "EDITOR_VERSION=%FALLBACK_VERSION%"

:editor_version_ready
if defined EDITOR_VERSION >>"%LOGFILE%" echo [%date% %time%] Installing Editor version %EDITOR_VERSION%

echo [6/7] Closing running Editor if needed...
>>"%LOGFILE%" echo [%date% %time%] Closing running Editor
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$target=[IO.Path]::GetFullPath($env:LOCALAPPDATA+'\Etech\ProxySGTrace\ProxySG_Policy_Trace_Editor.exe');Get-Process -ErrorAction SilentlyContinue|Where-Object{try{($_.ProcessName -like 'ProxySG_Policy_Trace_Editor*') -or ($_.Path -and [IO.Path]::GetFullPath($_.Path) -eq $target)}catch{$false}}|Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1
timeout /t 1 /nobreak >nul

echo [7/7] Installing Editor...
>>"%LOGFILE%" echo [%date% %time%] Installing Editor

if exist "%EDITORNEW%" del /f /q "%EDITORNEW%" >nul 2>&1
copy /y "%FOUND_EDITOR%" "%EDITORNEW%" >nul
if errorlevel 1 goto :copy_stage_fail

set "RETRY=0"

:replace_retry
set /a RETRY+=1 >nul
if exist "%EDITOR%" del /f /q "%EDITOR%" >nul 2>&1
if exist "%EDITOR%" goto :replace_wait

move /y "%EDITORNEW%" "%EDITOR%" >nul 2>&1
if not errorlevel 1 goto :install_complete

:replace_wait
if %RETRY% GEQ 10 goto :replace_fail
timeout /t 1 /nobreak >nul
goto :replace_retry

:install_complete
if exist "%EXTRACTDIR%" rmdir /s /q "%EXTRACTDIR%" >nul 2>&1

if defined EDITOR_VERSION goto :write_known_version
> "%VERSIONMARKER%" echo unknown
>>"%LOGFILE%" echo [%date% %time%] Installed Editor version unknown
goto :version_written

:write_known_version
> "%VERSIONMARKER%" echo %EDITOR_VERSION%
>>"%LOGFILE%" echo [%date% %time%] Installed Editor version %EDITOR_VERSION%

:version_written
>>"%LOGFILE%" echo [%date% %time%] Installation completed successfully
echo [OK] Installation completed successfully.

if defined EDITOR_VERSION goto :callback_known
start "" "https://etech-symantec.github.io/trace/?mode=direct&launcher=v6-installed&_=%RANDOM%%RANDOM%"
goto :done

:callback_known
start "" "https://etech-symantec.github.io/trace/?mode=direct&launcher=v6-installed&editor_version=%EDITOR_VERSION%&_=%RANDOM%%RANDOM%"

:done
timeout /t 2 /nobreak >nul
exit /b 0

:no_curl
>>"%LOGFILE%" echo [%date% %time%] ERROR curl.exe not found
echo [ERROR] curl.exe not found.
exit /b 10

:no_tar
>>"%LOGFILE%" echo [%date% %time%] ERROR tar.exe not found
echo [ERROR] tar.exe not found.
exit /b 11

:download_fail
>>"%LOGFILE%" echo [%date% %time%] ERROR Editor ZIP download failed
echo [ERROR] Editor ZIP download failed.
goto :fail_cleanup

:hash_download_fail
>>"%LOGFILE%" echo [%date% %time%] ERROR ZIP SHA-256 download failed
echo [ERROR] ZIP SHA-256 download failed.
goto :fail_cleanup

:hash_invalid
>>"%LOGFILE%" echo [%date% %time%] ERROR ZIP SHA-256 file invalid
echo [ERROR] ZIP SHA-256 file is invalid.
goto :fail_cleanup

:hash_calc_fail
>>"%LOGFILE%" echo [%date% %time%] ERROR SHA-256 calculation failed
echo [ERROR] ZIP SHA-256 calculation failed.
goto :fail_cleanup

:hash_mismatch
>>"%LOGFILE%" echo [%date% %time%] ERROR SHA-256 mismatch
echo [ERROR] ZIP SHA-256 mismatch.
goto :fail_cleanup

:extract_fail
>>"%LOGFILE%" echo [%date% %time%] ERROR ZIP extraction failed
echo [ERROR] Editor ZIP extraction failed.
goto :fail_cleanup

:editor_not_found
>>"%LOGFILE%" echo [%date% %time%] ERROR Editor EXE not found in ZIP
echo [ERROR] Editor EXE was not found inside the ZIP.
goto :fail_cleanup

:copy_stage_fail
>>"%LOGFILE%" echo [%date% %time%] ERROR staging copy failed
echo [ERROR] Could not stage the new Editor file.
goto :fail_cleanup

:replace_fail
>>"%LOGFILE%" echo [%date% %time%] ERROR installed Editor is still locked
echo [ERROR] Could not replace the installed Editor.
echo [ERROR] The Editor file is still locked by another process.
goto :fail_cleanup

:fail_cleanup
if exist "%ZIPTMP%" del /q "%ZIPTMP%" >nul 2>&1
if exist "%EDITORNEW%" del /q "%EDITORNEW%" >nul 2>&1
if exist "%EXTRACTDIR%" rmdir /s /q "%EXTRACTDIR%" >nul 2>&1
echo [INFO] Log: %LOGFILE%
exit /b 1

:fail
>>"%LOGFILE%" echo [%date% %time%] ERROR launcher installation failed
echo [ERROR] Launcher installation failed.
echo [INFO] Log: %LOGFILE%
exit /b 1
