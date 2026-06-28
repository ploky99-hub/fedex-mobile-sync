@echo off
setlocal
cd /d "%~dp0"

set GH=C:\Program Files\GitHub CLI\gh.exe
if not exist "%GH%" set GH=gh

echo === FedEx Mobile Sync - Render 배포 ===
echo.

"%GH%" auth status >nul 2>&1
if errorlevel 1 (
  echo GitHub 로그인이 필요합니다. 브라우저 창이 열립니다...
  "%GH%" auth login -h github.com -p https -w
  if errorlevel 1 exit /b 1
)

set REPO=fedex-mobile-sync
echo GitHub 저장소 확인/생성: %REPO%
"%GH%" repo view ploky99-hub/%REPO% >nul 2>&1
if errorlevel 1 (
  "%GH%" repo create %REPO% --public --source=. --remote=origin --push
) else (
  git remote remove origin 2>nul
  git remote add origin https://github.com/ploky99-hub/%REPO%.git
  git push -u origin main 2>nul || git push -u origin master
)

echo.
echo === Render 연결 ===
echo Render 계정: gangnamspare@gmail.com
echo GitHub 저장소: ploky99-hub/%REPO% ^(public^)
echo.
echo 1. gangnamspare@gmail.com 으로 https://dashboard.render.com 로그인
echo 2. https://dashboard.render.com/blueprint/new?repo=https://github.com/ploky99-hub/%REPO%
echo 3. GitHub 연결 후 Blueprint Apply / Deploy
echo 4. 서비스 이름 fedex-mobile-sync 유지
echo.
echo 배포 URL 확인 후 각 앱 HTML의 SYNC_SERVER 값을 업데이트하고 APK를 다시 빌드하세요.
echo.
pause
