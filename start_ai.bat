@echo off
title TRC Enterprise AI Server
echo Starting TRC Enterprise AI Server...
echo Do not close this window! The AI needs this running to connect to Active Directory, SCCM, and Mist.
echo.
echo Syncing Intelligence Engines...
"C:\Users\wagahsan\AppData\Local\Programs\Python\Python312\python.exe" database.py
"C:\Users\wagahsan\AppData\Local\Programs\Python\Python312\python.exe" server.py
pause
