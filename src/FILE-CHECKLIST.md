# 📋 로컬 PC로 복사할 파일 체크리스트

## ✅ 필수 설정 파일 (12개)

이 파일들이 없으면 앱이 작동하지 않습니다!

```
✅ package.json                    # npm 패키지 설정
✅ tsconfig.json                   # TypeScript 설정
✅ tsconfig.node.json              # TypeScript Node 설정
✅ vite.config.ts                  # Vite 빌드 설정
✅ capacitor.config.ts             # Capacitor Android 설정
✅ postcss.config.js               # CSS 처리 설정
✅ index.html                      # HTML 진입점
✅ manifest.json                   # PWA 설정
✅ favicon.svg                     # 파비콘
✅ .gitignore                      # Git 제외 파일
```

## ✅ 소스 코드 (필수)

### 메인 파일
```
✅ /src/main.tsx                   # React 진입점
✅ /App.tsx                        # 메인 앱 컴포넌트
```

### Components (전체 폴더)
```
✅ /components/HomePage.tsx
✅ /components/NotificationSetup.tsx
✅ /components/NavigationActive.tsx
✅ /components/NotificationList.tsx
✅ /components/Settings.tsx
✅ /components/ContactManagement.tsx
✅ /components/MessageManagement.tsx
✅ /components/ProfileEdit.tsx
✅ /components/ThemeSelector.tsx
✅ /components/EmailLogin.tsx
✅ /components/EmailSignup.tsx
✅ /components/SnsLogin.tsx
✅ /components/AppInfo.tsx
✅ /components/ui/                 # UI 컴포넌트 폴더 전체 (43개 파일)
✅ /components/figma/              # Figma 컴포넌트 폴더
```

### Utils (전체 폴더)
```
✅ /utils/theme.ts
✅ /utils/api.ts
✅ /utils/capacitor-plugins.ts    # Capacitor 헬퍼
✅ /utils/supabase/client.ts
✅ /utils/supabase/info.tsx
```

### Styles
```
✅ /styles/globals.css             # 전역 스타일
```

### Supabase (백엔드)
```
✅ /supabase/functions/server/index.tsx
✅ /supabase/functions/server/kv_store.tsx
```

## 📄 문서 (선택)

이 파일들은 참고용입니다:

```
📄 README.md                       # 프로젝트 개요
📄 CAPACITOR-QUICKSTART.md         # 빠른 시작 가이드
📄 LOCAL-SETUP-GUIDE.md            # 로컬 설정 가이드 ⭐
📄 android-build-guide.md          # Android 빌드 상세 가이드
📄 FILE-CHECKLIST.md               # 이 파일
📄 Attributions.md                 # 라이선스 정보
📄 /guidelines/Guidelines.md       # 개발 가이드라인
```

### Resources (선택)
```
📄 /resources/android-icon.md
📄 /resources/android-manifest-permissions.xml
📄 /package-capacitor.json         # Capacitor 패키지 참고용
```

---

## 🗂️ 폴더 구조 (복사 후 확인)

복사 완료 후 이런 구조여야 합니다:

```
driver-alert-app/
├── src/
│   └── main.tsx
├── components/
│   ├── HomePage.tsx
│   ├── NotificationSetup.tsx
│   ├── NavigationActive.tsx
│   ├── NotificationList.tsx
│   ├── Settings.tsx
│   ├── ContactManagement.tsx
│   ├── MessageManagement.tsx
│   ├── ProfileEdit.tsx
│   ├── ThemeSelector.tsx
│   ├── EmailLogin.tsx
│   ├── EmailSignup.tsx
│   ├── SnsLogin.tsx
│   ├── AppInfo.tsx
│   ├── ui/
│   │   └── (43개 파일)
│   └── figma/
│       └── ImageWithFallback.tsx
├── utils/
│   ├── theme.ts
│   ├── api.ts
│   ├── capacitor-plugins.ts
│   └── supabase/
│       ├── client.ts
│       └── info.tsx
├── styles/
│   └── globals.css
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx
│           └── kv_store.tsx
├── resources/
│   ├── android-icon.md
│   └── android-manifest-permissions.xml
├── App.tsx
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── capacitor.config.ts
├── postcss.config.js
├── index.html
├── manifest.json
├── favicon.svg
├── .gitignore
├── README.md
├── CAPACITOR-QUICKSTART.md
├── LOCAL-SETUP-GUIDE.md ⭐ (가장 중요!)
├── android-build-guide.md
└── FILE-CHECKLIST.md
```

---

## 🎯 빠른 확인 방법

### 1. 필수 파일 확인

로컬 PC의 프로젝트 폴더에서 터미널 열기:

**Windows:**
```cmd
dir package.json
dir App.tsx
dir /b components
dir /b utils
```

**Mac/Linux:**
```bash
ls -la package.json
ls -la App.tsx
ls components/
ls utils/
```

### 2. 파일 개수 확인

- **components/ui/**: 약 43개 파일
- **components/**: 약 58개 파일 (ui 포함)
- **전체 프로젝트**: 약 80개 파일

---

## 🚨 자주 누락되는 파일

다음 파일들을 빼먹지 마세요!

```
⚠️ /src/main.tsx                  # 없으면 앱 실행 안 됨!
⚠️ /utils/capacitor-plugins.ts    # 네이티브 기능 필수
⚠️ capacitor.config.ts            # Android 설정 필수
⚠️ vite.config.ts                 # 빌드 안 됨
⚠️ /components/ui/ (전체 폴더)    # UI 컴포넌트 필수
```

---

## ✅ 복사 완료 후 체크

1. **터미널에서 확인**
   ```bash
   npm install
   ```
   오류 없이 완료되면 ✅

2. **빌드 테스트**
   ```bash
   npm run build
   ```
   성공하면 `dist/` 폴더 생성 ✅

3. **Capacitor 확인**
   ```bash
   npx cap add android
   ```
   `android/` 폴더 생성되면 ✅

---

## 💾 파일 복사 방법

### 방법 1: 전체 프로젝트 ZIP

1. Figma Make에서 모든 파일 선택
2. 압축 (ZIP)
3. 다운로드
4. 로컬 PC에 압축 해제

### 방법 2: Git 사용

```bash
# GitHub에 업로드 후
git clone <repository-url>
cd driver-alert-app
npm install
```

### 방법 3: 수동 복사

1. 위 체크리스트 순서대로
2. 하나씩 복사/붙여넣기
3. 폴더 구조 동일하게 유지

---

## 📏 총 파일 크기

- **소스 코드**: 약 2~3MB
- **node_modules/**: 약 300~500MB (npm install 후)
- **android/**: 약 50~100MB (생성 후)

**디스크 여유 공간: 최소 1GB 필요**

---

## 🎉 복사 완료 확인

모든 파일을 복사했다면:

1. ✅ `package.json` 있음
2. ✅ `/components` 폴더 있음 (58개 파일)
3. ✅ `/utils` 폴더 있음
4. ✅ `capacitor.config.ts` 있음
5. ✅ `npm install` 성공

**👉 다음 단계: [LOCAL-SETUP-GUIDE.md](LOCAL-SETUP-GUIDE.md) 참조**

---

## 🆘 문제가 있나요?

### "npm install" 실패
→ `package.json` 파일 확인

### "npm run build" 실패
→ `/App.tsx`, `/components`, `/utils` 폴더 확인

### "npx cap add android" 실패
→ `capacitor.config.ts` 파일 확인

**모든 체크리스트 파일이 제대로 복사되었는지 재확인하세요!**
