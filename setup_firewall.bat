@echo off
:: Batch script to open Port 8001 in Windows Firewall for TRC AI Assistant
:: MUST BE RUN AS ADMINISTRATOR

echo ====================================================
echo TRC AI Assistant - Network Setup
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
echo Opening Port 8001 (Inbound) for TRC AI Assistant...
netsh advfirewall firewall add rule name="TRC AI Assistant (Port 8001)" dir=in action=allow protocol=TCP localport=8001

if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Firewall rule added successfully.
    echo Your colleagues can now connect via your LAN IP on port 8001.
) else (
    echo.
    echo [FAILED] Could not add firewall rule.
)

echo.
pause
