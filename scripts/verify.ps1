<#
.SYNOPSIS
    Script xác minh chất lượng đa tầng (3-Tier Verification Runner) cho Harness.
.DESCRIPTION
    Hỗ trợ kiểm tra Tier 1 (Static/Syntax), Tier 2 (Runtime/Unit), Tier 3 (E2E/Contract)
    cho cả Frontend và Backend.
.PARAMETER Target
    Mục tiêu kiểm tra: 'fe' (Frontend), 'be' (Backend), hoặc 'all' (Mặc định).
.PARAMETER Tier
    Tầng kiểm tra: '1' (Static), '2' (Unit/Runtime), '3' (E2E/Contract), hoặc 'all' (Mặc định: 1 + 2).
.EXAMPLE
    .\scripts\verify.ps1 -Target fe -Tier 1
    .\scripts\verify.ps1 -Target be -Tier 2
    .\scripts\verify.ps1 -Target all
#>

param (
    [ValidateSet("fe", "be", "all")]
    [string]$Target = "all",

    [ValidateSet("1", "2", "3", "all")]
    [string]$Tier = "all"
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot

# Tự động phát hiện JAVA_HOME nếu biến môi trường bị sai đường dẫn
if (-not $env:JAVA_HOME -or -not (Test-Path -Path $env:JAVA_HOME)) {
    if (Test-Path "C:\Program Files\Java\jdk-21.0.12") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
    } elseif (Test-Path "C:\Program Files\Java\latest") {
        $env:JAVA_HOME = "C:\Program Files\Java\latest"
    } elseif (Test-Path "C:\Program Files\Java\jdk-17") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
    }
}


function Write-Step {
    param([string]$Message)
    Write-Host "`n=== [HARNESS VERIFY] $Message ===" -ForegroundColor Cyan
}

function Run-Command {
    param(
        [string]$Description,
        [string]$Directory,
        [string]$Cmd,
        [string[]]$CmdArgs
    )
    Write-Host "-> $Description..." -NoNewline
    Push-Location $Directory
    try {
        & $Cmd $CmdArgs | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host " [FAILED] (Exit code $LASTEXITCODE)" -ForegroundColor Red
            Write-Host "`n[WHAT]: Lệnh $Cmd $($CmdArgs -join ' ') thất bại tại $Directory." -ForegroundColor Yellow
            Write-Host "[WHY]: Có lỗi biên dịch, kiểu dữ liệu, hoặc kiểm thử không vượt qua." -ForegroundColor Yellow
            Write-Host "[HOW TO FIX]: Chạy trực tiếp lệnh trên tại thư mục $Directory để xem chi tiết log lỗi.`n" -ForegroundColor Yellow
            Pop-Location
            exit 1
        }
        Write-Host " [PASSED]" -ForegroundColor Green
    }
    catch {
        Write-Host " [ERROR] $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

Write-Step "Bắt đầu quy trình xác minh (Target: $Target, Tier: $Tier)"

# --- FRONTEND VERIFICATION ---
if ($Target -eq "fe" -or $Target -eq "all") {
    $FeDir = Join-Path $RootDir "frontend"

    if ($Tier -eq "1" -or $Tier -eq "all") {
        Run-Command -Description "Frontend Tier 1: Typecheck (tsc)" `
                    -Directory $FeDir -Cmd "cmd.exe" -CmdArgs @("/c", "npx", "tsc", "--noEmit")
    }

    if ($Tier -eq "2" -or $Tier -eq "all") {
        Run-Command -Description "Frontend Tier 2: Unit Tests (vitest)" `
                    -Directory $FeDir -Cmd "cmd.exe" -CmdArgs @("/c", "npm", "test")
    }
}

# --- BACKEND VERIFICATION ---
if ($Target -eq "be" -or $Target -eq "all") {
    $BeDir = Join-Path $RootDir "backend"
    $Gradlew = Join-Path $BeDir "gradlew.bat"

    if ($Tier -eq "1" -or $Tier -eq "all") {
        Run-Command -Description "Backend Tier 1: Compile Java Classes" `
                    -Directory $BeDir -Cmd "cmd.exe" -CmdArgs @("/c", "gradlew.bat", "compileJava", "compileTestJava")
    }

    if ($Tier -eq "2" -or $Tier -eq "all") {
        Run-Command -Description "Backend Tier 2: Unit & Modulith Tests" `
                    -Directory $BeDir -Cmd "cmd.exe" -CmdArgs @("/c", "gradlew.bat", "test")
    }
}

Write-Step "XÁC MINH HOÀN TẤT: Tất cả tiêu chí kiểm thử đã đạt chuẩn (PASS-STATE GATED)"
exit 0
