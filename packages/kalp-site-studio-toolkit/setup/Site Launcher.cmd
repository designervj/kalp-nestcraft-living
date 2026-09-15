@echo off
setlocal
echo Kalp Developer Toolkit - Site Launcher
echo This starts one website. It does not start Kalp OS services.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0SiteLauncher.ps1" %*
set "launcher_exit=%ERRORLEVEL%"
if not "%launcher_exit%"=="0" echo Site Launcher exited with code %launcher_exit%.
pause
exit /b %launcher_exit%
