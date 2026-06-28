# FedEx Mobile Sync -> GitHub -> Render 배포 스크립트
# 사용: PowerShell에서  D:\CODING\FedExMobileSync\deploy-to-render.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) { $gh = "gh" }

Write-Host "=== FedEx Mobile Sync Render 배포 ===" -ForegroundColor Cyan

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub 로그인이 필요합니다." -ForegroundColor Yellow
    Write-Host "브라우저에서 https://github.com/login/device 를 열고 아래 코드를 입력하세요."
    & $gh auth login -h github.com -p https -w
}

$repo = "fedex-mobile-sync"
$owner = "ploky99-hub"

git branch -M main 2>$null

& $gh repo view "$owner/$repo" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub 저장소 생성 및 push: $owner/$repo"
    & $gh repo create $repo --public --source=. --remote=origin --push
} else {
    if (-not (git remote get-url origin 2>$null)) {
        git remote add origin "https://github.com/$owner/$repo.git"
    }
    git push -u origin main
}

Write-Host ""
Write-Host "=== Render 배포 (대시보드) ===" -ForegroundColor Green
Write-Host "1. https://dashboard.render.com/blueprints"
Write-Host "2. New Blueprint Instance"
Write-Host "3. 저장소 $owner/$repo 선택"
Write-Host "4. Deploy 클릭"
Write-Host ""
Write-Host "배포 URL 확인 후 (예: https://fedex-mobile-sync.onrender.com)"
Write-Host "각 앱 HTML의 SYNC_SERVER 값을 바꾸고 APK를 다시 빌드하세요."
Write-Host ""
Write-Host "빌드된 APK: D:\CODING\BuiltAPKs\"
