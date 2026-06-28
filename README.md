# FedEx Mobile Sync

FedEx CRM, FedEx SRO, Tim's Tips Android 앱과 JSON/엑셀 파일을 주고받는 Render용 서버입니다.

## 로컬 실행

```bash
cd FedExMobileSync
npm install
npm start
```

브라우저: http://localhost:3000

## Render 배포 (1분)

코드는 GitHub에 올려 두었습니다: https://github.com/ploky99-hub/fedex-mobile-sync

1. 아래 링크로 Render 로그인 후 Blueprint 배포  
   https://dashboard.render.com/blueprint/new?repo=https://github.com/ploky99-hub/fedex-mobile-sync
2. **Apply** → 서비스 URL 확인 (예: `https://fedex-mobile-sync.onrender.com`)
3. 각 앱 HTML의 `SYNC_SERVER`가 URL과 같으면 APK 재빌드 불필요. 다르면 수정 후 `./gradlew.bat assembleDebug`

로컬에서 GitHub push + 안내: `deploy-to-render.ps1`

## Render 배포 (수동)

1. GitHub에 이 폴더를 push
2. [Render](https://render.com) → New → Web Service → 저장소 연결
3. Runtime: Node, Build: `npm install`, Start: `npm start`
4. 배포 후 URL 예: `https://fedex-mobile-sync.onrender.com`

## 앱 설정

각 앱 HTML 상단의 `SYNC_SERVER`를 Render URL로 변경한 뒤 APK를 다시 빌드하세요.

- `FedExCrmMobileApp/app/src/main/assets/FedEx_CRM_Mobile.html`
- `SRO/FedExSRO-Android/app/src/main/assets/www/index.html`
- `TimsTipsMobileApp/app/src/main/assets/Tims_Tips_Mobile.html`

## API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/status` | 앱별 최신 파일 상태 |
| GET | `/api/crm/latest` | CRM 최신 JSON |
| GET | `/api/sro/latest` | SRO 최신 엑셀 |
| GET | `/api/timstips/latest` | Tim's Tips 최신 JSON |
| POST | `/api/:app/upload` | multipart `file` 업로드 |
| POST | `/api/:app/upload-json` | raw JSON body 업로드 (CRM, timstips) |

## 주의

Render 무료 플랜은 재시작·재배포 시 `uploads/` 파일이 초기화될 수 있습니다.
