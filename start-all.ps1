# FraudShield AI - Master Multi-Service Startup Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  FRAUDSHIELD AI - ENTERPRISE FRAUD DETECTION PLATFORM   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Python FastAPI ML Service
Write-Host "`n[1/3] Launching Python FastAPI Machine Learning Service on Port 8000..." -ForegroundColor Green
$pyExe = if (Test-Path "$PSScriptRoot\ml-service\fenv\Scripts\python.exe") { "$PSScriptRoot\ml-service\fenv\Scripts\python.exe" } else { "python" }
$mlProcess = Start-Process $pyExe -ArgumentList "-m uvicorn app:app --host 127.0.0.1 --port 8000" -WorkingDirectory "$PSScriptRoot\ml-service" -PassThru

# 2. Start Java Spring Boot Backend
Write-Host "[2/3] Launching Java Spring Boot Backend Service on Port 8080..." -ForegroundColor Green
$backendProcess = Start-Process powershell -ArgumentList "-Command .\mvnw.cmd spring-boot:run" -WorkingDirectory "$PSScriptRoot\backend" -PassThru

# 3. Start React Frontend
Write-Host "[3/3] Launching React Vite Frontend Application on Port 5173..." -ForegroundColor Green
$frontendProcess = Start-Process npm -ArgumentList "run dev -- --host 127.0.0.1 --port 5173" -WorkingDirectory "$PSScriptRoot\frontend" -PassThru

Write-Host "`nAll 3 Services Successfully Dispatched!" -ForegroundColor Cyan
Write-Host " - Frontend UI:        http://127.0.0.1:5173" -ForegroundColor White
Write-Host " - Spring Boot API:    http://127.0.0.1:8080" -ForegroundColor White
Write-Host " - FastAPI ML Engine:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host " - Demo Admin Login:   admin / Admin@123" -ForegroundColor Yellow
Write-Host " - Demo Analyst Login: analyst / Analyst@123" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
