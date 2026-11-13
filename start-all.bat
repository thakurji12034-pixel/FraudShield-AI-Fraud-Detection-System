@echo off
echo ==========================================================
echo   FRAUDSHIELD AI - ENTERPRISE FRAUD DETECTION PLATFORM   
echo ==========================================================

echo [1/3] Launching Python FastAPI ML Service on Port 8000...
if exist "ml-service\fenv\Scripts\python.exe" (
    start "FraudShield ML Engine (FastAPI :8000)" cmd /k "cd ml-service && fenv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000"
) else (
    start "FraudShield ML Engine (FastAPI :8000)" cmd /k "cd ml-service && python -m uvicorn app:app --host 127.0.0.1 --port 8000"
)

echo [2/3] Launching Java Spring Boot Backend on Port 8080...
start "FraudShield Backend (Spring Boot :8080)" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo [3/3] Launching React Vite Frontend on Port 5173...
start "FraudShield Frontend (Vite :5173)" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo All services launched in dedicated terminal windows!
echo  - Frontend UI:        http://127.0.0.1:5173
echo  - Spring Boot API:    http://127.0.0.1:8080
echo  - FastAPI ML Engine:  http://127.0.0.1:8000/docs
echo  - Demo Admin:         admin / Admin@123
echo  - Demo Analyst:       analyst / Analyst@123
echo ==========================================================
pause
