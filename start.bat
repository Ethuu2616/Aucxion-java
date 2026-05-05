@echo off
echo ========================================
echo   AUCXION - Threat Detection System
echo ========================================
echo.
echo Starting AUCXION...
echo Backend will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:3000
echo.

REM Start backend
echo Starting backend on port 8080...
cd backend
start /B mvn spring-boot:run

REM Wait for backend to start
set /a counter=0
:wait_backend
timeout /t 2 /nobreak >nul
curl -s http://localhost:8080/api/scan/status >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend is ready!
    goto start_frontend
)
set /a counter+=1
if %counter% lss 30 goto :wait_backend

echo Backend took too long to start. Please check the logs.
goto :end

:start_frontend
echo.
echo Starting frontend on port 3000...
cd ..\frontend
start /B npm start

REM Wait for frontend to start
set /a counter=0
:wait_frontend
timeout /t 2 /nobreak >nul
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo Frontend is ready! Opening dashboard...
    start http://localhost:3000
    goto :end
)
set /a counter+=1
if %counter% lss 30 goto :wait_frontend

echo Frontend took too long to start. Please check the logs.
echo You can manually open: http://localhost:3000

:end
echo.
echo ========================================
echo   AUCXION is running!
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:3000
echo ========================================
pause
