@echo off
:: stop_background_service.bat - Stops and unregisters TRC AI Assistant background task
:: MUST BE RUN AS ADMINISTRATOR

echo ====================================================
echo TRC AI Assistant - Stopping Background Service
echo ====================================================
echo.

net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with Administrator privileges.
) else (
    echo [ERROR] This script must be run as Administrator!
    echo Please right-click and 'Run as Administrator'.
    pause
    exit /b 1
)

echo.
echo Stopping scheduled task...
schtasks /end /tn "TRC_AI_Assistant"

echo.
echo Deleting scheduled task...
schtasks /delete /tn "TRC_AI_Assistant" /f

if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Background task stopped and unregistered.
) else (
    echo.
    echo [FAILED] Could not remove scheduled task.
)

echo.
pause
