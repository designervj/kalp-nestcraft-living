@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0SiteLauncher.ps1" %*
set "setup_exit=%ERRORLEVEL%"
if not "%setup_exit%"=="0" (
  echo.
  echo Setup did not complete. Review the message above.
)
if /I not "%~1"=="-NonInteractive" pause
exit /b %setup_exit%
