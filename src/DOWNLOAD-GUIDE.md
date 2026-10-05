# 📥 소스 코드 다운로드 가이드

## 🎯 Figma Make에서 소스 코드 다운받기

---

## 방법 1: Figma Make Export 기능 (가장 쉬움) ⭐

### Figma Make UI에서:

1. **왼쪽 상단 메뉴** 또는 **프로젝트 이름** 클릭
2. **"Export"** 또는 **"Download"** 버튼 찾기
3. **"Download as ZIP"** 선택
4. 다운로드 완료!

**결과:**
```
driver-alert-app.zip 파일 다운로드
↓
압축 해제하면 모든 소스 코드 포함
```

---

## 방법 2: Git을 통한 다운로드 (권장)

### GitHub에 업로드 후 Clone:

1. **Figma Make에서 GitHub 연동**
   - Settings → Integrations → GitHub
   - Repository 생성 및 Push

2. **로컬 PC에서 Clone**
   ```bash
   git clone https://github.com/your-username/driver-alert-app.git
   cd driver-alert-app
   npm install
   ```

**장점:**
- ✅ 버전 관리 가능
- ✅ 코드 백업
- ✅ 팀 협업 가능

---

## 방법 3: 수동 복사 (마지막 수단)

### 모든 파일을 하나씩 복사:

아래 파일들을 순서대로 복사하세요.

---

## 📋 다운로드할 파일 전체 목록 (92개)

### ✅ 루트 파일 (13개)

**필수 설정 파일:**
```
1. /.gitignore
2. /package.json
3. /tsconfig.json
4. /tsconfig.node.json
5. /postcss.config.js
6. /vite.config.ts
7. /capacitor.config.ts
8. /index.html
9. /manifest.json
10. /favicon.svg
11. /App.tsx
12. /Attributions.md
13. /package-capacitor.json
```

**문서 파일 (선택):**
```
14. /README.md
15. /START-HERE.md
16. /LOCAL-SETUP-GUIDE.md
17. /FILE-CHECKLIST.md
18. /CAPACITOR-QUICKSTART.md
19. /android-build-guide.md
20. /DOWNLOAD-GUIDE.md (이 파일)
```

---

### ✅ /src/ 폴더 (1개)

```
21. /src/main.tsx
```

---

### ✅ /components/ 폴더 (58개)

**메인 컴포넌트:**
```
22. /components/AppInfo.tsx
23. /components/ContactManagement.tsx
24. /components/EmailLogin.tsx
25. /components/EmailSignup.tsx
26. /components/HomePage.tsx
27. /components/MessageManagement.tsx
28. /components/NavigationActive.tsx
29. /components/NotificationList.tsx
30. /components/NotificationSetup.tsx
31. /components/ProfileEdit.tsx
32. /components/Settings.tsx
33. /components/SnsLogin.tsx
34. /components/ThemeSelector.tsx
```

**Figma 컴포넌트:**
```
35. /components/figma/ImageWithFallback.tsx
```

**UI 컴포넌트 (43개):**
```
36. /components/ui/accordion.tsx
37. /components/ui/alert-dialog.tsx
38. /components/ui/alert.tsx
39. /components/ui/aspect-ratio.tsx
40. /components/ui/avatar.tsx
41. /components/ui/badge.tsx
42. /components/ui/breadcrumb.tsx
43. /components/ui/button.tsx
44. /components/ui/calendar.tsx
45. /components/ui/card.tsx
46. /components/ui/carousel.tsx
47. /components/ui/chart.tsx
48. /components/ui/checkbox.tsx
49. /components/ui/collapsible.tsx
50. /components/ui/command.tsx
51. /components/ui/context-menu.tsx
52. /components/ui/dialog.tsx
53. /components/ui/drawer.tsx
54. /components/ui/dropdown-menu.tsx
55. /components/ui/form.tsx
56. /components/ui/hover-card.tsx
57. /components/ui/input-otp.tsx
58. /components/ui/input.tsx
59. /components/ui/label.tsx
60. /components/ui/menubar.tsx
61. /components/ui/navigation-menu.tsx
62. /components/ui/pagination.tsx
63. /components/ui/popover.tsx
64. /components/ui/progress.tsx
65. /components/ui/radio-group.tsx
66. /components/ui/resizable.tsx
67. /components/ui/scroll-area.tsx
68. /components/ui/select.tsx
69. /components/ui/separator.tsx
70. /components/ui/sheet.tsx
71. /components/ui/sidebar.tsx
72. /components/ui/skeleton.tsx
73. /components/ui/slider.tsx
74. /components/ui/sonner.tsx
75. /components/ui/switch.tsx
76. /components/ui/table.tsx
77. /components/ui/tabs.tsx
78. /components/ui/textarea.tsx
79. /components/ui/toggle-group.tsx
80. /components/ui/toggle.tsx
81. /components/ui/tooltip.tsx
82. /components/ui/use-mobile.ts
83. /components/ui/utils.ts
```

---

### ✅ /utils/ 폴더 (6개)

```
84. /utils/api.ts
85. /utils/capacitor-plugins.ts
86. /utils/theme.ts
87. /utils/supabase/client.ts
88. /utils/supabase/info.tsx
```

---

### ✅ /styles/ 폴더 (1개)

```
89. /styles/globals.css
```

---

### ✅ /supabase/ 폴더 (2개)

```
90. /supabase/functions/server/index.tsx
91. /supabase/functions/server/kv_store.tsx
```

---

### ✅ /resources/ 폴더 (2개)

```
92. /resources/android-icon.md
93. /resources/android-manifest-permissions.xml
```

---

### ✅ /guidelines/ 폴더 (1개, 선택)

```
94. /guidelines/Guidelines.md
```

---

## 📦 전체 폴더 구조

```
driver-alert-app/
│
├── 📄 .gitignore
├── 📄 package.json ⭐
├── 📄 tsconfig.json
├── 📄 tsconfig.node.json
├── 📄 postcss.config.js
├── 📄 vite.config.ts ⭐
├── 📄 capacitor.config.ts ⭐
├── 📄 index.html
├── 📄 manifest.json
├── 📄 favicon.svg
├── 📄 App.tsx ⭐
├── 📄 package-capacitor.json
│
├── 📂 src/
│   └── 📄 main.tsx ⭐
│
├── 📂 components/ (58개 파일)
│   ├── 📄 AppInfo.tsx
│   ├── 📄 HomePage.tsx
│   ├── 📄 NavigationActive.tsx
│   ├── 📄 Settings.tsx
│   ├── 📄 ... (메인 컴포넌트들)
│   ├── 📂 figma/
│   │   └── 📄 ImageWithFallback.tsx
│   └── 📂 ui/ (43개 파일)
│       ├── 📄 button.tsx
│       ├── 📄 input.tsx
│       └── 📄 ... (UI 컴포넌트들)
│
├── 📂 utils/ (6개 파일)
│   ├── 📄 api.ts
│   ├── 📄 capacitor-plugins.ts ⭐
│   ├── 📄 theme.ts
│   └── 📂 supabase/
│       ├── 📄 client.ts
│       └── 📄 info.tsx
│
├── 📂 styles/
│   └── 📄 globals.css
│
├── 📂 supabase/
│   └── 📂 functions/
│       └── 📂 server/
│           ├── 📄 index.tsx
│           └── 📄 kv_store.tsx
│
├── 📂 resources/
│   ├── 📄 android-icon.md
│   └── 📄 android-manifest-permissions.xml
│
└── 📂 문서/ (선택)
    ├── 📄 README.md
    ├── 📄 START-HERE.md ⭐
    ├── 📄 LOCAL-SETUP-GUIDE.md
    ├── 📄 FILE-CHECKLIST.md
    ├── 📄 CAPACITOR-QUICKSTART.md
    ├── 📄 android-build-guide.md
    └── 📄 DOWNLOAD-GUIDE.md
```

---

## 🎯 다운로드 후 체크리스트

### ✅ 필수 파일 확인 (없으면 앱 실행 안 됨!)

```bash
# 로컬 PC의 프로젝트 폴더에서 확인
ls -la package.json          # npm 설정
ls -la App.tsx               # 메인 앱
ls -la capacitor.config.ts   # Capacitor 설정
ls -la vite.config.ts        # 빌드 설정
ls -la src/main.tsx          # React 진입점
ls -la components/           # 컴포넌트 폴더
ls -la utils/                # 유틸리티 폴더
```

### ✅ 파일 개수 확인

```bash
# 각 폴더의 파일 개수
ls components/ | wc -l        # 13개 파일
ls components/ui/ | wc -l     # 43개 파일
ls utils/ | wc -l             # 4개 파일
```

---

## 🚀 다운로드 완료 후 다음 단계

### 1️⃣ 패키지 설치

```bash
cd driver-alert-app
npm install
```

**예상 시간:** 2~3분  
**결과:** `node_modules/` 폴더 생성 (약 300~500MB)

---

### 2️⃣ 웹 빌드 테스트

```bash
npm run build
```

**성공하면:**
```
✓ built in 3.45s
dist/ 폴더 생성
```

**실패하면:**
- 누락된 파일 확인
- `package.json` 확인
- 파일 구조 확인

---

### 3️⃣ Android 프로젝트 생성

```bash
npx cap add android
```

**성공하면:**
```
✔ Adding native android project
android/ 폴더 생성
```

---

### 4️⃣ Android Studio에서 열기

```bash
npx cap open android
```

**Android Studio 자동 실행!**

---

## 💾 압축 파일로 백업 (선택)

### Windows:
```cmd
# 프로젝트 폴더 우클릭 → "압축"
# 또는
tar -czf driver-alert-app-backup.tar.gz driver-alert-app/
```

### Mac/Linux:
```bash
tar -czf driver-alert-app-backup.tar.gz driver-alert-app/
```

**백업 파일:** `driver-alert-app-backup.tar.gz` (약 5~10MB)

---

## 🔄 다시 다운로드가 필요하면

### Figma Make에서:
1. 프로젝트 페이지 재방문
2. Export 버튼 클릭
3. 새로 다운로드

### Git을 사용했다면:
```bash
git pull origin main
```

---

## 🆘 다운로드 문제 해결

### "Export 버튼을 찾을 수 없어요"

→ 브라우저 URL 복사:
```
https://figma.site/...
```
→ 코드 직접 확인 가능

---

### "파일을 하나씩 복사하기 너무 번거로워요"

→ **Git 사용 권장:**
1. GitHub 계정 생성 (무료)
2. Figma Make → GitHub 연동
3. Repository 생성
4. 로컬 PC에서 `git clone`

---

### "node_modules가 너무 커요"

→ **정상입니다!** 
- node_modules/는 로컬에서만 필요
- Git에 포함 안 됨 (.gitignore)
- npm install로 자동 생성

---

## 📊 파일 크기 정보

| 항목 | 크기 |
|------|------|
| 소스 코드 (압축 전) | 약 2~3MB |
| 소스 코드 (ZIP) | 약 1MB |
| node_modules/ | 약 300~500MB |
| android/ | 약 50~100MB |
| dist/ | 약 5~10MB |

**SSD/HDD 여유 공간: 최소 1GB 필요**

---

## ✅ 다운로드 완료 확인

모든 파일이 잘 다운로드되었는지 확인:

```bash
# 로컬 PC 터미널에서
cd driver-alert-app

# 필수 파일 확인
ls package.json         # ✅
ls App.tsx              # ✅
ls capacitor.config.ts  # ✅
ls vite.config.ts       # ✅
ls src/main.tsx         # ✅

# 폴더 확인
ls components/          # ✅ 58개 파일
ls utils/               # ✅ 6개 파일
ls styles/              # ✅ 1개 파일

# 패키지 설치 테스트
npm install             # ✅ 오류 없이 완료
npm run build           # ✅ dist/ 폴더 생성
```

**모두 성공하면 다운로드 완료!** 🎉

---

## 🎯 다음 문서

다운로드 완료 후:
1. 📖 [LOCAL-SETUP-GUIDE.md](LOCAL-SETUP-GUIDE.md) - 환경 설정
2. 🏗️ [android-build-guide.md](android-build-guide.md) - APK 빌드
3. 🚀 [START-HERE.md](START-HERE.md) - 전체 프로세스

---

## 💡 팁

### 빠른 다운로드
- **방법 1 (Export)**: 가장 쉽고 빠름 ⭐
- **방법 2 (Git)**: 버전 관리 가능
- **방법 3 (수동)**: 마지막 수단

### 안전한 백업
```bash
# 주기적으로 백업
tar -czf backup-$(date +%Y%m%d).tar.gz driver-alert-app/
```

### 팀 공유
- GitHub Private Repository (무료)
- Google Drive / Dropbox
- USB 드라이브

---

## 🎉 성공!

소스 코드 다운로드가 완료되면:
- ✅ 로컬 PC에서 개발 가능
- ✅ Android Studio에서 APK 빌드 가능
- ✅ 코드 수정 및 커스터마이징 가능
- ✅ 팀원들과 공유 가능

**Happy Coding! 💻📱**
