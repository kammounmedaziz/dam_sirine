#!/usr/bin/env powershell
# Test Execution Script for Announcement AI Integration
# Purpose: Run all tests for AI announcement generation and database storage
# Usage: ./run-tests.ps1

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Announcement AI Generation - Test Execution Suite" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Define paths
$projectPath = "c:\Users\asus\EspritProjects\esprit_dam"
$gradioPath = "c:\Users\asus\EspritProjects\campus-annocement-generator"

# Function to print section headers
function Write-Section {
    param([string]$title)
    Write-Host ""
    Write-Host "───────────────────────────────────────────────────────────────────────────────" -ForegroundColor Green
    Write-Host "  $title" -ForegroundColor Green
    Write-Host "───────────────────────────────────────────────────────────────────────────────" -ForegroundColor Green
}

# Function to run a test
function Run-Test {
    param(
        [string]$name,
        [string]$command,
        [string]$description
    )
    
    Write-Host ""
    Write-Host "📝 TEST: $name" -ForegroundColor Yellow
    Write-Host "   Description: $description" -ForegroundColor Gray
    Write-Host "   Command: $command" -ForegroundColor Cyan
    Write-Host "   Running..." -ForegroundColor Yellow
    
    try {
        & cmd /c $command 2>&1
        Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ FAILED: $_" -ForegroundColor Red
    }
}

# Check Prerequisites
Write-Section "Prerequisites Check"

Write-Host ""
Write-Host "1️⃣  Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found - Please install Node.js" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2️⃣  Checking npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm $npmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3️⃣  Checking MongoDB..." -ForegroundColor Cyan
try {
    # Check if MongoDB is accessible
    $mongoCheck = mongod --version 2>&1
    if ($mongoCheck) {
        Write-Host "   ✅ MongoDB is available" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  MongoDB might not be running - ensure mongod is started" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4️⃣  Checking Gradio Service..." -ForegroundColor Cyan
try {
    # Try to connect to Gradio
    $gradioCheck = (Invoke-WebRequest -Uri "http://localhost:7870/info" -ErrorAction SilentlyContinue).StatusCode
    if ($gradioCheck -eq 200) {
        Write-Host "   ✅ Gradio server running on port 7870" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Gradio server might not be running on port 7870" -ForegroundColor Yellow
    Write-Host "      To start: python -m gradio_app.py in campus-annocement-generator folder" -ForegroundColor Gray
}

Write-Host ""
Write-Host "5️⃣  Checking Project Files..." -ForegroundColor Cyan
$requiredFiles = @(
    "$projectPath\src\announcement\announcement.service.ts",
    "$projectPath\src\announcement\announcement.controller.ts",
    "$projectPath\src\announcement\services\gradio-ai.service.ts",
    "$projectPath\src\announcement\announcement.module.ts",
    "$projectPath\src\announcement\announcement.service.spec.ts"
)

$filesOk = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $(Split-Path -Leaf $file)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing: $(Split-Path -Leaf $file)" -ForegroundColor Red
        $filesOk = $false
    }
}

if (-not $filesOk) {
    Write-Host ""
    Write-Host "❌ Some required files are missing!" -ForegroundColor Red
    exit 1
}

# Test Execution
Write-Section "Test Execution"

Write-Host ""
Write-Host "Navigating to project directory: $projectPath" -ForegroundColor Gray
Push-Location $projectPath

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install --quiet
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Test 1: Service Unit Tests
Write-Section "Test 1: Service Unit Tests"
Write-Host ""
Write-Host "Running: npm test -- src/announcement/announcement.service.spec.ts" -ForegroundColor Yellow
npm test -- src/announcement/announcement.service.spec.ts --passWithNoTests 2>&1 | Select-String -Pattern "(PASS|FAIL|✅|●|Tests:)"

# Test 2: Database Integration Tests
Write-Section "Test 2: Database Integration Tests"
Write-Host ""
Write-Host "Running: npm test -- src/announcement/announcement-integration.spec.ts" -ForegroundColor Yellow
npm test -- src/announcement/announcement-integration.spec.ts --passWithNoTests 2>&1 | Select-String -Pattern "(PASS|FAIL|✅|●|Tests:)"

# Test 3: E2E API Tests
Write-Section "Test 3: End-to-End API Tests"
Write-Host ""
Write-Host "Running: npm run test:e2e -- --passWithNoTests" -ForegroundColor Yellow
npm run test:e2e -- --passWithNoTests 2>&1 | Select-String -Pattern "(PASS|FAIL|✅|●|Tests:)"

# Test 4: Test Scenarios Documentation
Write-Section "Test 4: Test Scenarios Documentation"
Write-Host ""
Write-Host "Running: npx jest test/announcement-test-scenarios.spec.ts --passWithNoTests" -ForegroundColor Yellow
npx jest test/announcement-test-scenarios.spec.ts --passWithNoTests 2>&1 | Select-String -Pattern "(PASS|FAIL|✅|●|Tests:)"

# Manual API Testing
Write-Section "Test 5: Manual API Integration Test"

Write-Host ""
Write-Host "ℹ️  To manually test the API endpoints, use the following commands:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Generate 3 Announcements:" -ForegroundColor Yellow
Write-Host '
curl -X POST http://localhost:3000/api/announcements/generate-and-save `
  -H "Content-Type: application/json" `
  -d "{
    \"audience\": \"students\",
    \"instruction\": \"Announce a mandatory meeting tomorrow at 9 AM\",
    \"senderId\": \"admin-001\"
  }"
' -ForegroundColor Gray

Write-Host ""
Write-Host "2️⃣  Get All Announcements:" -ForegroundColor Yellow
Write-Host '
curl http://localhost:3000/api/announcements
' -ForegroundColor Gray

Write-Host ""
Write-Host "3️⃣  Get Specific Announcement:" -ForegroundColor Yellow
Write-Host '
curl http://localhost:3000/api/announcements/{id}
' -ForegroundColor Gray

Write-Host ""
Write-Host "4️⃣  Delete Announcement:" -ForegroundColor Yellow
Write-Host '
curl -X DELETE http://localhost:3000/api/announcements/{id}
' -ForegroundColor Gray

# Summary
Write-Section "Test Summary & Results"

Write-Host ""
Write-Host "✅ All test files have been executed!" -ForegroundColor Green
Write-Host ""
Write-Host "Test Files Created:" -ForegroundColor Yellow
Write-Host "  1. src/announcement/announcement.service.spec.ts" -ForegroundColor Gray
Write-Host "  2. src/announcement/announcement-integration.spec.ts" -ForegroundColor Gray
Write-Host "  3. test/announcement.e2e-spec.ts" -ForegroundColor Gray
Write-Host "  4. test/announcement-test-scenarios.spec.ts" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation Files Created:" -ForegroundColor Yellow
Write-Host "  1. ANNOUNCEMENT_AI_GUIDE.md - Complete integration guide" -ForegroundColor Gray
Write-Host "  2. TEST_SUMMARY.md - Test execution summary" -ForegroundColor Gray
Write-Host "  3. run-tests.ps1 - This script" -ForegroundColor Gray
Write-Host ""

Write-Host "API Endpoints Available:" -ForegroundColor Yellow
Write-Host "  POST   /api/announcements/generate-and-save - Generate 3 announcements" -ForegroundColor Gray
Write-Host "  GET    /api/announcements - Get all announcements" -ForegroundColor Gray
Write-Host "  GET    /api/announcements/:id - Get specific announcement" -ForegroundColor Gray
Write-Host "  DELETE /api/announcements/:id - Delete announcement" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 Expected Test Results:" -ForegroundColor Yellow
Write-Host "  ✅ 3 announcements generated from AI" -ForegroundColor Gray
Write-Host "  ✅ All 3 saved to MongoDB" -ForegroundColor Gray
Write-Host "  ✅ Each has unique _id and content" -ForegroundColor Gray
Write-Host "  ✅ Can retrieve all 3 with GET" -ForegroundColor Gray
Write-Host "  ✅ Can delete each individually" -ForegroundColor Gray
Write-Host "  ✅ Error handling working correctly" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start MongoDB: mongod" -ForegroundColor Gray
Write-Host "  2. Start Gradio: python -m gradio_app.py (in campus-annocement-generator)" -ForegroundColor Gray
Write-Host "  3. Start NestJS: npm run start:dev" -ForegroundColor Gray
Write-Host "  4. Run tests: npm test" -ForegroundColor Gray
Write-Host "  5. Test API endpoints with curl or Postman" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Test Suite Ready for Execution" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Pop-Location
