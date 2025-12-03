#!/usr/bin/env powershell
# Diagnostic Script - Check all prerequisites

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Prerequisite Diagnostic - Testing Integration Setup" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Check MongoDB
Write-Host "1️⃣  MongoDB Status:" -ForegroundColor Green
try {
    $mongoTest = [System.Net.Sockets.TcpClient]::new()
    $mongoTest.Connect("localhost", 27017)
    if ($mongoTest.Connected) {
        Write-Host "   ✅ MongoDB is running on port 27017" -ForegroundColor Green
    }
    $mongoTest.Close()
} catch {
    Write-Host "   ❌ MongoDB is NOT running" -ForegroundColor Red
    Write-Host "   ⚠️  Please start MongoDB: mongod" -ForegroundColor Yellow
}
Write-Host ""

# 2. Check Gradio AI
Write-Host "2️⃣  Gradio AI Service Status:" -ForegroundColor Green
try {
    $gradioTest = [System.Net.Sockets.TcpClient]::new()
    $gradioTest.Connect("localhost", 7870)
    if ($gradioTest.Connected) {
        Write-Host "   ✅ Gradio service is listening on port 7870" -ForegroundColor Green
        Write-Host "   📍 URL: http://localhost:7870" -ForegroundColor Gray
    }
    $gradioTest.Close()
} catch {
    Write-Host "   ❌ Gradio service is NOT running on port 7870" -ForegroundColor Red
    Write-Host "   ⚠️  Start it with:" -ForegroundColor Yellow
    Write-Host "      cd c:\Users\asus\EspritProjects\campus-annocement-generator" -ForegroundColor Gray
    Write-Host "      .\.venv\Scripts\activate" -ForegroundColor Gray
    Write-Host "      python main.py" -ForegroundColor Gray
}
Write-Host ""

# 3. Check NestJS Backend
Write-Host "3️⃣  NestJS Backend Status:" -ForegroundColor Green
try {
    $nestTest = [System.Net.Sockets.TcpClient]::new()
    $nestTest.Connect("localhost", 3000)
    if ($nestTest.Connected) {
        Write-Host "   ✅ NestJS is listening on port 3000" -ForegroundColor Green
        Write-Host "   📍 URL: http://localhost:3000" -ForegroundColor Gray
    }
    $nestTest.Close()
} catch {
    Write-Host "   ❌ NestJS backend is NOT running on port 3000" -ForegroundColor Red
    Write-Host "   ⚠️  Start it with:" -ForegroundColor Yellow
    Write-Host "      cd c:\Users\asus\EspritProjects\esprit_dam" -ForegroundColor Gray
    Write-Host "      npm run start:dev" -ForegroundColor Gray
}
Write-Host ""

# 4. Check Node.js
Write-Host "4️⃣  Node.js & npm:" -ForegroundColor Green
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "   ✅ Node.js $nodeVersion installed" -ForegroundColor Green
    Write-Host "   ✅ npm $npmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js or npm not found" -ForegroundColor Red
}
Write-Host ""

# 5. Check .env file
Write-Host "5️⃣  Configuration Files:" -ForegroundColor Green
if (Test-Path "c:\Users\asus\EspritProjects\esprit_dam\.env") {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content "c:\Users\asus\EspritProjects\esprit_dam\.env"
    Write-Host "   Content:" -ForegroundColor Gray
    $envContent | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  When all services are running, execute: test-integration.ps1" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
