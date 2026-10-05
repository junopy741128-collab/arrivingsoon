# 💻 로컬 PC에서 Android 앱 빌드하기

## 📋 준비물 체크리스트

- [ ] **Windows PC** (또는 Mac, Linux)
- [ ] **Node.js 18+** 설치 필요
- [ ] **Android Studio** 설치 필요
- [ ] **약 2시간** (설치 포함)

---

## 🎯 1단계: 프로젝트 코드 다운로드 (5분)

### 방법 A: ZIP 파일로 다운로드 (가장 쉬움) ⭐

Figma Make에서 제공하는 방법:

1. **Figma Make에서 모든 파일/폴더를 선택**
2. **복사 (Ctrl+C)**
3. **로컬 PC에 새 폴더 생성**
   ```
   C:\Projects\driver-alert-app\
   ```
4. **붙여넣기 (Ctrl+V)**

### 방법 B: 수동으로 파일 복사

다음 파일들을 순서대로 복사하세요:

#### 필수 설정 파일
```
✅ package.json
✅ tsconfig.json
✅ tsconfig.node.json
✅ vite.config.ts
✅ capacitor.config.ts
✅ postcss.config.js
✅ index.html
✅ manifest.json
✅ favicon.svg
✅ .gitignore
```

#### 소스 코드
```
✅ /src/main.tsx
✅ /App.tsx
✅ /components/ (폴더 전체)
✅ /utils/ (폴더 전체)
✅ /styles/ (폴더 전체)
✅ /supabase/ (폴더 전체)
```

#### 문서 (선택)
```
📄 README.md
📄 CAPACITOR-QUICKSTART.md
📄 android-build-guide.md
📄 LOCAL-SETUP-GUIDE.md
📄 /resources/ (폴더 전체)
```

---

## 🔧 2단계: Node.js 설치 (10분)

### 확인
터미널에서 확인:
```bash
node --version
npm --version
```

버전이 나오면 다음 단계로! ✅

### 설치 필요시
1. https://nodejs.org 접속
2. **LTS 버전** 다운로드 (추천: v20.x)
3. 설치 (기본 설정으로 진행)
4. 재부팅
5. 다시 확인

---

## ☕ 3단계: Android Studio 설치 (30분)

### 다운로드 및 설치

1. **다운로드**
   - https://developer.android.com/studio
   - "Download Android Studio" 클릭

2. **설치**
   - 모든 체크박스 선택 유지
   - 기본 경로로 설치
   - "Android Virtual Device" 포함

3. **첫 실행 설정**
   - "Standard" 설치 선택
   - SDK 자동 다운로드 (시간 소요)
   - ☕ 커피 한 잔 하세요!

### SDK 확인

Android Studio → Tools → SDK Manager:
- ✅ Android SDK Platform (최신 버전)
- ✅ Android SDK Build-Tools
- ✅ Android SDK Command-line Tools
- ✅ Android Emulator

---

## 📦 4단계: 프로젝트 설정 (10분)

### 터미널 열기

**Windows:**
- 프로젝트 폴더 우클릭 → "터미널에서 열기"
- 또는 `Win+R` → `cmd` → `cd C:\Projects\driver-alert-app`

**Mac/Linux:**
- 터미널 열기 → `cd /path/to/driver-alert-app`

### 패키지 설치

```bash
# 1. 기본 패키지 설치 (2~3분 소요)
npm install

# 2. Capacitor CLI 설치 확인
npm install @capacitor/cli --save-dev

# 3. Capacitor 플러그인 설치
npm install @capacitor/core @capacitor/android
npm install @capacitor/app @capacitor/geolocation @capacitor/haptics
npm install @capacitor/local-notifications @capacitor/share @capacitor/splash-screen
npm install @capacitor-community/keep-awake
```

### 빌드 테스트

```bash
# 웹 빌드 (오류 확인)
npm run build
```

**성공하면:**
```
✓ built in 3.45s
```

**실패하면:**
- 오류 메시지 확인
- 누락된 패키지 설치
- `npm install` 다시 실행

---

## 🤖 5단계: Android 프로젝트 생성 (2분)

### Android 플랫폼 추가

```bash
# Android 프로젝트 생성
npx cap add android
```

**성공하면:**
```
✔ Adding native android project in android in 1.23s
✔ Syncing Gradle
✔ android platform added!
```

**`android/` 폴더가 생성됩니다!** ✅

---

## 🏗️ 6단계: Android Studio에서 프로젝트 열기 (2분)

### 프로젝트 열기

```bash
# Android Studio 자동 실행
npx cap open android
```

또는 수동으로:
1. Android Studio 실행
2. "Open an Existing Project" 클릭
3. `프로젝트폴더/android` 선택

### Gradle Sync 대기

- 첫 실행 시 Gradle 파일 다운로드
- 하단에 진행 상태 표시
- 완료될 때까지 대기 (1~3분)

---

## 📱 7단계: 에뮬레이터에서 실행 (5분)

### 에뮬레이터 생성

1. Android Studio 상단 → **Device Manager** 아이콘 클릭
2. **Create Device** 클릭
3. **Pixel 6** 선택 (또는 원하는 기기)
4. **System Image** 선택 (Android 13 추천)
   - 다운로드 필요 시 "Download" 클릭
5. **Finish** 클릭

### 앱 실행

1. 상단에서 생성한 에뮬레이터 선택
2. **Run** 버튼 (▶️) 클릭
3. 에뮬레이터 부팅 대기 (첫 실행 시 2~3분)
4. 앱 자동 설치 및 실행!

**🎉 성공!** 에뮬레이터에서 앱이 실행됩니다!

---

## 📲 8단계: 실제 스마트폰에서 실행 (5분)

### 스마트폰 준비

1. **개발자 모드 활성화**
   - 설정 → 휴대전화 정보
   - 빌드 번호를 **7번 연속 탭**
   - "개발자가 되었습니다!" 메시지 확인

2. **USB 디버깅 활성화**
   - 설정 → 개발자 옵션
   - "USB 디버깅" 켜기

3. **PC 연결**
   - USB 케이블로 PC와 연결
   - 스마트폰에서 "USB 디버깅 허용" 팝업 → **"허용"** 클릭

### Android Studio에서 실행

1. 상단 기기 선택 드롭다운 클릭
2. 연결된 스마트폰 선택 (예: "Samsung Galaxy S21")
3. **Run** 버튼 (▶️) 클릭
4. 앱 자동 설치 및 실행!

**🎉 성공!** 실제 스마트폰에서 앱이 실행됩니다!

---

## 📦 9단계: APK 파일 생성 (5분)

### 디버그 APK (테스트용)

Android Studio에서:

1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. 빌드 완료 대기 (1~3분)
3. 완료 알림에서 **"locate"** 클릭

**APK 파일 위치:**
```
프로젝트폴더/android/app/build/outputs/apk/debug/app-debug.apk
```

### APK 파일 사용

이 파일을:
- ✅ 스마트폰에 복사해서 직접 설치
- ✅ 카카오톡/이메일로 전송
- ✅ 지인들과 공유

**설치 방법:**
1. APK 파일을 스마트폰에 복사
2. 파일 매니저에서 APK 파일 탭
3. "알 수 없는 출처" 허용
4. 설치 진행

---

## 🔐 10단계: 출시용 APK (선택)

### 서명 키 생성

```bash
# Android Studio 터미널에서
cd android/app
keytool -genkey -v -keystore driver-alert.keystore -alias driver-alert -keyalg RSA -keysize 2048 -validity 10000
```

정보 입력:
- 비밀번호: **절대 잊지 마세요!**
- 이름, 조직, 도시 등 입력

### 서명된 APK 빌드

Android Studio에서:

1. **Build** → **Generate Signed Bundle / APK**
2. **APK** 선택
3. **Next** 클릭
4. **Create new...** 클릭
5. 위에서 생성한 keystore 파일 선택
6. 비밀번호 입력
7. **release** 선택
8. **Finish** 클릭

**출시용 APK 위치:**
```
android/app/release/app-release.apk
```

---

## 🐛 문제 해결

### "npm install" 실패

```bash
# 캐시 삭제 후 재시도
npm cache clean --force
npm install
```

### "npx cap add android" 실패

```bash
# Capacitor 재설치
npm install @capacitor/cli @capacitor/core --force
npm run build
npx cap add android
```

### Gradle Sync 실패

Android Studio에서:
1. **File** → **Invalidate Caches / Restart**
2. 재시작 후 다시 시도

또는 터미널에서:
```bash
cd android
./gradlew clean
cd ..
npx cap sync
```

### 에뮬레이터가 느림

- 최소 8GB RAM 필요
- BIOS에서 가상화(VT-x/AMD-V) 활성화
- Hyper-V 비활성화 (Windows)

### 실제 기기가 인식 안 됨

- USB 디버깅 확인
- USB 케이블 교체 (충전 전용 케이블 안 됨)
- 삼성 스마트폰: USB 설정에서 "MTP" 또는 "파일 전송" 선택

### 앱이 실행 안 됨

```bash
# 동기화
npx cap sync android

# Android Studio에서 Clean Project
# Build → Clean Project
# Build → Rebuild Project
```

---

## ✅ 완료 체크리스트

### 설치
- [ ] Node.js 설치 완료
- [ ] Android Studio 설치 완료
- [ ] 프로젝트 코드 다운로드 완료
- [ ] npm install 완료

### Android 프로젝트
- [ ] npx cap add android 완료
- [ ] android/ 폴더 생성 확인

### 테스트
- [ ] 에뮬레이터에서 실행 성공
- [ ] 실제 스마트폰에서 실행 성공
- [ ] 로그인 기능 테스트
- [ ] GPS 위치 추적 테스트
- [ ] 알림 발송 테스트

### APK 빌드
- [ ] 디버그 APK 생성
- [ ] APK 파일 스마트폰에 설치
- [ ] 서명 키 생성 (출시용)
- [ ] 출시용 APK 생성 (선택)

---

## 🎯 다음 단계

### 내부 테스트
1. APK 파일을 지인들에게 공유
2. 다양한 스마트폰에서 테스트
3. 피드백 수집

### Google Play 출시
1. Google Play Console 계정 생성 ($25)
2. AAB 파일 빌드
3. 앱 정보 입력
4. 심사 제출

상세 가이드: `android-build-guide.md` 참조

---

## 📊 예상 소요 시간

| 단계 | 소요 시간 |
|------|-----------|
| Node.js 설치 | 10분 |
| Android Studio 설치 | 30분 |
| 프로젝트 설정 | 10분 |
| Android 프로젝트 생성 | 2분 |
| 에뮬레이터 실행 | 5분 |
| 실제 기기 실행 | 5분 |
| APK 빌드 | 5분 |
| **총계** | **약 70분** |

---

## 💡 팁

### 개발 중 빠른 테스트
```bash
# 1. 코드 수정
# 2. 웹 빌드
npm run build

# 3. 동기화
npx cap sync

# 4. Android Studio에서 Run 버튼만 클릭
```

### 로그 확인
Android Studio → **Logcat** 탭:
- `console.log()` 출력 확인
- 오류 메시지 확인
- 필터: "chromium" 또는 "WebView"

### 웹에서 먼저 개발
```bash
# 웹 개발 서버 (빠름)
npm run dev

# 브라우저에서 테스트
# http://localhost:3000
```

완성되면 Android 앱으로 빌드!

---

## 🆘 도움 요청

막히는 부분이 있으면:

1. **오류 메시지 확인**: 정확한 오류 내용 파악
2. **Google 검색**: 오류 메시지로 검색
3. **StackOverflow**: "android studio [오류내용]" 검색
4. **공식 문서**: https://capacitorjs.com/docs

---

## 🎉 축하합니다!

로컬 PC에서 Android 앱을 성공적으로 빌드했습니다! 🚀

이제:
- ✅ 에뮬레이터에서 테스트 가능
- ✅ 실제 스마트폰에서 실행 가능
- ✅ APK 파일 배포 가능
- ✅ Google Play 출시 준비 완료

**Happy Coding! 💻📱**
