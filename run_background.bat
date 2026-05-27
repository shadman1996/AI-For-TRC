@echo off
:: run_background.bat - Runs TRC AI Assistant in the background
cd /d "c:\Users\wagahsan\OneDrive - Minnesota State\Desktop\Shadman Ahsan\TRC-AI-Assistant"
echo [%date% %time%] Starting database sync... >> background_server.log
"C:\Users\wagahsan\AppData\Local\Programs\Python\Python312\python.exe" database.py >> background_server.log 2>&1
echo [%date% %time%] Starting server... >> background_server.log
"C:\Users\wagahsan\AppData\Local\Programs\Python\Python312\python.exe" server.py >> background_server.log 2>&1
