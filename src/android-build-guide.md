# 🤖 Android 앱 빌드 가이드

## 📋 준비물
- ✅ Windows PC (또는 Mac, Linux)
- ✅ Node.js 설치 (https://nodejs.org)
- ✅ Android Studio 설치 (https://developer.android.com/studio)
- ✅ Google Play 개발자 계정 ($25) - 나중에 출시할 때만 필요

---

## 🚀 1단계: 프로젝트 설정

### 1-1. Capacitor 설치
```bash
# 터미널에서 프로젝트 폴더로 이동 후 실행
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npm install @capacitor/geolocation @capacitor/app @capacitor/splash-screen
```

### 1-2. Android 플랫폼 추가
```bash
npx cap add android
```

---

## 🔧 2단계: Android Studio 설정

### 2-1. Android Studio 실행
1. Android Studio 열기
2. "Open an Existing Project" 클릭
3. 프로젝트 폴더 내 `android` 폴더 선택

### 2-2. SDK 설치 (자동으로 안내됨)
- Android SDK
- Android Build Tools
- Android Emulator (테스트용)

---

## 📱 3단계: 테스트

### 3-1. 에뮬레이터에서 테스트
```bash
# 터미널에서 실행
npx cap sync
npx cap open android
```

Android Studio에서:
1. 상단 메뉴에서 "Run" → "Run 'app'"
2. 에뮬레이터 선택
3. 앱 실행 확인

### 3-2. 실제 스마트폰에서 테스트
1. **개발자 모드 활성화:**
   - 설정 → 휴대전화 정보 → 빌드 번호 7번 탭
   
2. **USB 디버깅 활성화:**
   - 설정 → 개발자 옵션 → USB 디버깅 켜기
   
3. **스마트폰 연결:**
   - USB 케이블로 PC와 연결
   - 디버깅 허용 팝업에서 "허용" 클릭
   
4. **앱 실행:**
   - Android Studio 상단에서 연결된 기기 선택
   - "Run" 버튼 클릭

---

## 📦 4단계: APK 빌드 (배포용)

### 4-1. 서명 키 생성
```bash
# Android Studio 터미널에서 실행
cd android/app
keytool -genkey -v -keystore driver-alert.keystore -alias driver-alert -keyalg RSA -keysize 2048 -validity 10000

# 정보 입력 (비밀번호, 이름, 조직 등)
# ⚠️ 비밀번호 절대 잊지 마세요!
```

### 4-2. 빌드 설정
Android Studio에서:
1. Build → Generate Signed Bundle / APK
2. APK 선택
3. 키 파일 선택 (driver-alert.keystore)
4. 비밀번호 입력
5. release 선택
6. Build 클릭

### 4-3. APK 파일 위치
```
android/app/release/app-release.apk
```

이 파일을 스마트폰에 복사해서 설치하면 테스트 가능!

---

## 🏪 5단계: Google Play 출시 (선택)

### 5-1. Google Play Console
1. https://play.google.com/console 접속
2. 개발자 계정 생성 ($25 결제)
3. "앱 만들기" 클릭

### 5-2. 앱 정보 입력
- 앱 이름: 운전기사 알림
- 카테고리: 비즈니스
- 스크린샷 업로드 (필수)
- 앱 설명 작성

### 5-3. AAB 파일 생성
Android Studio에서:
1. Build → Generate Signed Bundle / APK
2. **Android App Bundle** 선택
3. release 빌드

### 5-4. 업로드 및 심사
1. Google Play Console에서 AAB 업로드
2. 정책 동의
3. 심사 제출
4. 1~3일 후 출시!

---

## 🐛 문제 해결

### "Gradle sync failed"
```bash
# Android Studio 터미널에서
./gradlew clean
```

### "SDK location not found"
Android Studio → File → Project Structure → SDK Location 확인

### 앱이 실행 안 됨
```bash
# 터미널에서
npx cap sync android
```

### 권한 오류
`android/app/src/main/AndroidManifest.xml`에 권한이 제대로 추가되었는지 확인

---

## 📞 주요 권한 목록

현재 앱에 설정된 권한:
- ✅ **위치 정보** (GPS 네비게이션)
- ✅ **인터넷** (Google Maps API)
- ✅ **SMS 전송** (알림 발송)
- ✅ **연락처 읽기** (연락처 가져오기)
- ✅ **백그라운드 위치** (운행 중 추적)

---

## 💡 팁

### 개발 중 빠른 테스트
```bash
# 코드 수정 후
npm run build
npx cap sync
# Android Studio에서 Run
```

### 로그 확인
Android Studio → Logcat 탭에서 오류 확인

### 앱 버전 업데이트
`android/app/build.gradle` 파일에서:
```gradle
versionCode 2  // 증가
versionName "1.1"  // 변경
```

---

## ✅ 체크리스트

빌드 전:
- [ ] Node.js 설치
- [ ] Android Studio 설치
- [ ] Capacitor 패키지 설치
- [ ] Android 플랫폼 추가

테스트:
- [ ] 에뮬레이터에서 실행
- [ ] 실제 기기에서 실행
- [ ] GPS 기능 테스트
- [ ] 알림 발송 테스트
- [ ] 연락처 기능 테스트

출시:
- [ ] APK 빌드
- [ ] 서명 키 생성
- [ ] Google Play 계정
- [ ] 스크린샷 준비
- [ ] 앱 설명 작성

---

## 🎯 다음 단계

1. **지금 바로 테스트:** APK 설치 후 사용
2. **내부 테스트:** 지인들과 함께 사용
3. **피드백 수집:** 개선사항 파악
4. **Google Play 출시:** 정식 배포
5. **수익화 추가:** 나중에 구독 기능 추가

궁금한 점이 있으면 언제든 물어보세요! 🚀
