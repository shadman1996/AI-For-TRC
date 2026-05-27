@echo off
:: register_background_service.bat - Registers TRC AI Assistant as a background system task
:: MUST BE RUN AS ADMINISTRATOR

echo ====================================================
echo TRC AI Assistant - Background Service Registration
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
echo Registering TRC AI Assistant scheduled task (running as smsu\wagahsan)...
echo.
echo NOTE: You will be prompted to enter your Windows password below so the task
echo can run in your security context when you are logged out.
echo.
schtasks /end /tn "TRC_AI_Assistant" >nul 2>&1
schtasks /create /tn "TRC_AI_Assistant" /tr "cmd.exe /c \"c:\Users\wagahsan\OneDrive - Minnesota State\Desktop\Shadman Ahsan\TRC-AI-Assistant\run_background.bat\"" /sc ONSTART /ru "smsu\wagahsan" /rl HIGHEST /f

if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Scheduled task registered successfully!
    echo Starting the background service now...
    schtasks /run /tn "TRC_AI_Assistant"
    echo.
    echo [SUCCESS] TRC AI Assistant is now running in the background as a system service.
    echo It will persist across logouts and reboot automatically!
) else (
    echo.
    echo [FAILED] Could not register scheduled task.
)

echo.
pause
