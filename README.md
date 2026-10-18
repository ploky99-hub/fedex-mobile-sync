# FedEx Mobile Sync

FedEx CRM, FedEx SRO, Tim's Tips Android 앱과 JSON/엑셀 파일을 주고받는 Render용 서버입니다.

## 계정 구분

| 용도 | 계정 |
|------|------|
| **GitHub** (코드 저장) | `ploky99-hub` |
| **Render** (서버 호스팅) | `gangnamspare@gmail.com` |

GitHub와 Render는 **서로 다른 계정**이어도 됩니다. 저장소가 public이면 Render에서 Blueprint로 바로 배포할 수 있습니다.

## 로컬 실행

```bash
cd FedExMobileSync
npm install
npm start
```

브라우저: http://localhost:3000

## Render 배포 (1분)

코드는 GitHub에 올려 두었습니다: https://github.com/ploky99-hub/fedex-mobile-sync

1. **`gangnamspare@gmail.com`으로 Render 로그인** (Google 로그인 가능)
2. 아래 링크로 Blueprint 배포  
   https://dashboard.render.com/blueprint/new?repo=https://github.com/ploky99-hub/fedex-mobile-sync
3. GitHub 연결 시 `ploky99-hub/fedex-mobile-sync` public 저장소 접근 허용
4. **Apply** → 서비스 이름 `fedex-mobile-sync` 유지 → URL 확인  
   (예: `https://fedex-mobile-sync.onrender.com`)
5. URL이 앱의 `SYNC_SERVER`와 같으면 APK 재빌드 불필요. 다르면 HTML 수정 후 `./gradlew.bat assembleDebug`

로컬에서 GitHub push + 안내: `deploy-to-render.ps1`

## Render 배포 (수동)

1. **`gangnamspare@gmail.com`으로** [Render](https://render.com) 로그인
2. GitHub 연결 후 저장소 `ploky99-hub/fedex-mobile-sync` 선택
3. Runtime: Node, Build: `npm install`, Start: `npm start`  
   (또는 `render.yaml` Blueprint 사용)
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
| GET | `/api/crm/latest` | CRM 최신 파일 다운로드 (attachment) |
| GET | `/api/crm/latest-json` | CRM 최신 JSON (모바일 앱·PC CRM 복원용) |
| GET | `/api/sro/latest` | SRO 최신 엑셀 |
| GET | `/api/timstips/latest` | Tim's Tips 최신 JSON |
| POST | `/api/:app/upload` | multipart `file` 업로드 |
| POST | `/api/:app/upload-json` | raw JSON body 업로드 (CRM, timstips) |

## Render 무료 cold start (Not Found)

Render **무료** Web Service는 **약 15분** 동안 요청이 없으면 **슬립(종료)** 합니다.

- 첫 접속 시 서버를 **깨우는 데 30~60초** 걸릴 수 있음
- 깨우는 중 Render 앞단에서 **`Not Found`** 가 잠깐 보일 수 있음 (앱/서버 버그 아님)
- 서버·앱·관리 페이지에 **자동 재시도**를 넣어 두었음

**덜 끊기게 하려면:** [cron-job.org](https://cron-job.org) 등에서 10~14분마다  
`https://fedex-mobile-sync.onrender.com/api/health` 를 GET 호출 (무료 ping)

## 주의

Render 무료 플랜은 재시작·재배포 시 `uploads/` 파일이 초기화될 수 있습니다.
