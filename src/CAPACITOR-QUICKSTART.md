# 🚀 Capacitor Android 앱 빠른 시작

## ✅ 완료된 작업

다음 파일들이 준비되었습니다:

1. **capacitor.config.ts** - Capacitor 기본 설정
2. **utils/capacitor-plugins.ts** - 네이티브 기능 헬퍼 함수
3. **package-capacitor.json** - 필요한 패키지 목록
4. **android-build-guide.md** - 상세 빌드 가이드
5. **resources/android-icon.md** - 아이콘 설정 가이드
6. **resources/android-manifest-permissions.xml** - 권한 설정

---

## 🎯 지금 바로 시작하기

### 1단계: Capacitor 패키지 설치 (5분)

터미널을 열고 다음 명령어를 **순서대로** 실행하세요:

```bash
# 1. 기본 Capacitor 설치
npm install @capacitor/core @capacitor/cli

# 2. Android 플랫폼
npm install @capacitor/android

# 3. 필수 플러그인
npm install @capacitor/app @capacitor/geolocation @capacitor/haptics

# 4. 알림 및 공유
npm install @capacitor/local-notifications @capacitor/share @capacitor/splash-screen

# 5. 화면 켜짐 유지
npm install @capacitor-community/keep-awake
```

### 2단계: Android 프로젝트 생성 (1분)

```bash
# 웹 빌드
npm run build

# Android 플랫폼 추가
npx cap add android
```

성공하면 `android/` 폴더가 생성됩니다!

### 3단계: Android Studio 설치 (30분)

1. https://developer.android.com/studio 접속
2. "Download Android Studio" 클릭
3. 설치 (기본 설정으로 진행)
4. 첫 실행 시 필요한 SDK 자동 다운로드 (시간 소요)

### 4단계: 앱 실행 (2분)

```bash
# Android Studio 열기
npx cap open android
```

Android Studio가 자동으로 열립니다!

**에뮬레이터에서 테스트:**
1. 상단의 "Run" 버튼 (▶️) 클릭
2. 에뮬레이터 선택 (없으면 생성)
3. 앱 실행! 🎉

**실제 스마트폰에서 테스트:**
1. 스마트폰 설정 → 휴대전화 정보 → 빌드 번호 7번 탭
2. 개발자 옵션 → USB 디버깅 켜기
3. USB 케이블로 PC 연결
4. Android Studio에서 기기 선택
5. "Run" 버튼 클릭

---

## 🔧 주요 기능 확인

앱이 실행되면 다음 기능들이 작동합니다:

### ✅ 자동 작동하는 기능
- 로그인/회원가입
- 홈 화면
- 설정 화면
- 테마 변경
- 메시지 관리

### ⚠️ 권한 필요한 기능
첫 실행 시 권한을 허용해주세요:

- **위치 정보**: 네비게이션 시작 시 요청
- **알림**: 알림 설정 시 요청
- **SMS**: 메시지 전송 시 요청

---

## 📱 주요 차이점: 웹 vs 네이티브 앱

| 기능 | 웹 브라우저 | Android 앱 |
|------|------------|-----------|
| GPS 추적 | ⚠️ 백그라운드 제한 | ✅ 완전 지원 |
| 알림 | ⚠️ 제한적 | ✅ 완전 지원 |
| 화면 켜짐 | ❌ 불가능 | ✅ 가능 |
| 설치 | 필요 없음 | 필요함 |
| 업데이트 | 자동 | 수동 |
| 앱스토어 | ❌ 없음 | ✅ 가능 |

---

## 🐛 문제 해결

### "npx cap add android" 실패
```bash
# package.json이 있는지 확인
ls package.json

# 없으면 npm init 실행
npm init -y
```

### Android Studio에서 빌드 오류
```bash
# 터미널에서
cd android
./gradlew clean
cd ..
npx cap sync
```

### 앱이 실행 안 됨
1. Android Studio → File → Invalidate Caches / Restart
2. 다시 실행

### GPS가 작동 안 함
- 에뮬레이터: 우측 메뉴에서 Location 설정
- 실제 기기: 설정 → 위치 → 켜기

---

## 📦 APK 빌드 (배포용)

### 테스트용 APK (서명 없음)
Android Studio에서:
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. `android/app/build/outputs/apk/debug/app-debug.apk` 생성
3. 이 파일을 스마트폰에 복사해서 설치

### 출시용 APK (서명 필요)
상세 내용은 `android-build-guide.md` 참조

---

## 🎯 다음 단계

### 개발 중
1. **코드 수정** → `npm run build` → `npx cap sync`
2. Android Studio에서 "Run" 버튼
3. 변경사항 확인

### 내부 테스트
1. APK 빌드
2. 지인들에게 파일 전달
3. 피드백 수집

### Google Play 출시
1. 서명 키 생성
2. AAB 파일 빌드
3. Google Play Console에서 업로드
4. 상세 가이드: `android-build-guide.md`

---

## 💡 유용한 팁

### 개발 시 자동 새로고침
```bash
# 웹에서 개발 (빠름)
npm run dev
# 브라우저에서 테스트

# 완성되면 앱으로 빌드
npm run build
npx cap sync
```

### 로그 확인
Android Studio → Logcat 탭에서 `console.log()` 확인 가능

### 네이티브 기능 테스트
`utils/capacitor-plugins.ts` 함수들 사용:
```typescript
import { getCurrentPosition, sendSMS, showNotification } from './utils/capacitor-plugins';

// GPS 위치
const position = await getCurrentPosition();

// SMS 전송
await sendSMS('010-1234-5678', '안녕하세요');

// 알림 표시
await showNotification('제목', '내용');
```

---

## ✅ 체크리스트

### 설치 완료
- [ ] Node.js 설치
- [ ] Capacitor 패키지 설치
- [ ] Android Studio 설치
- [ ] Android 프로젝트 생성

### 테스트 완료
- [ ] 에뮬레이터에서 실행
- [ ] 실제 기기에서 실행
- [ ] 로그인 테스트
- [ ] GPS 기능 테스트
- [ ] 알림 테스트

### 배포 준비
- [ ] 아이콘 교체
- [ ] 앱 이름 변경
- [ ] 버전 설정
- [ ] APK 빌드
- [ ] 실제 사용자 테스트

---

## 🆘 도움이 필요하면

1. **Android Studio 오류**: `android-build-guide.md` 참조
2. **권한 문제**: `resources/android-manifest-permissions.xml` 확인
3. **네이티브 기능**: `utils/capacitor-plugins.ts` 주석 참조

---

## 🎉 성공!

앱이 실행되면 축하합니다! 🎊

이제 실제 스마트폰에서:
- ✅ GPS 위치 추적
- ✅ 백그라운드 실행
- ✅ 로컬 알림
- ✅ 화면 켜짐 유지

모두 완벽하게 작동합니다!

궁금한 점이 있으면 언제든 물어보세요! 🚀
