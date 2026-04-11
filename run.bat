@echo off
echo ============================================
echo   AUCXION - Starting Full Stack Application
echo ============================================

echo.
echo [1/3] Building backend...
cd backend
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed. Check Maven and Java 17 are installed.
    pause
    exit /b 1
)
echo Backend built successfully.

echo.
echo [2/3] Starting backend on port 8080...
start "Aucxion Backend" cmd /k "java -jar target\aucxion-backend-1.0.0.jar"
timeout /t 8 /nobreak >nul

echo.
echo [3/3] Starting frontend on port 3000...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install -q
)
start "Aucxion Frontend" cmd /k "npm start"

echo.
echo ============================================
echo   Aucxion is starting up!
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:3000
echo ============================================
pause
