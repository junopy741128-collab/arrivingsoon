# 🚗 운전기사 자동 알림 서비스

운전 중 특정 시간이나 위치에 도달하면 자동으로 승객에게 알림을 발송하는 스마트 서비스입니다.

## ✨ 주요 기능

### 📱 핵심 기능
- ✅ **자동 알림 발송**: 출발 후 N분, 도착 N분 전 자동 발송
- ✅ **GPS 실시간 추적**: 네비게이션 연동으로 정확한 위치 추적
- ✅ **연락처 관리**: 자주 사용하는 연락처 저장
- ✅ **메시지 템플릿**: 자주 쓰는 메시지 저장 및 재사용
- ✅ **운행 내역**: 과거 알림 발송 내역 확인

### 🎨 사용자 경험
- 4가지 테마 (다크, 화이트, 그린, 옐로우)
- 직관적인 UI/UX
- 모바일 최적화

### 🔐 계정 시스템
- 이메일 로그인/회원가입
- Google OAuth 소셜 로그인
- 전화번호 인증 로그인
- 프로필 관리

---

## 🚀 시작하기

### 웹 버전 (즉시 사용)
- **게시 URL**: https://sheep-wrist-68690551.figma.site
- 브라우저에서 바로 사용 가능
- QR 코드로 스마트폰 접속

### Android 앱 버전 (추천) ⭐
더 나은 성능과 기능을 위해 Android 앱으로 사용하세요!

**🎯 로컬 PC에서 APK 파일 만들기:**

1. **파일 복사**: 이 프로젝트의 모든 파일을 로컬 PC로 복사
   - 상세 가이드: [FILE-CHECKLIST.md](FILE-CHECKLIST.md) ✅

2. **환경 설정**: Node.js와 Android Studio 설치
   - 상세 가이드: [LOCAL-SETUP-GUIDE.md](LOCAL-SETUP-GUIDE.md) ⭐ **여기서 시작!**

3. **APK 빌드**: Android Studio에서 실행 파일 생성
   - 상세 가이드: [android-build-guide.md](android-build-guide.md)

**총 소요 시간: 약 1~2시간** (설치 시간 포함)

---

## 💻 기술 스택

### Frontend
- **React 18** - UI 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Vite** - 빌드 도구
- **Lucide React** - 아이콘

### Mobile
- **Capacitor 6** - 네이티브 앱 변환
- **Geolocation API** - GPS 추적
- **Local Notifications** - 푸시 알림
- **Haptics** - 진동 피드백

### Backend
- **Supabase** - 데이터베이스 & 인증
- **Supabase Edge Functions** - 서버리스 API
- **Google Maps API** - 거리/시간 계산

### 외부 API
- **Google Maps Distance Matrix API** - 실시간 거리 계산
- **Google Maps Places API** - 장소 검색
- **Google Maps Geocoding API** - 주소 변환

---

## 📁 프로젝트 구조

```
/
├── App.tsx                          # 메인 앱 컴포넌트
├── components/                      # React 컴포넌트
│   ├── HomePage.tsx                 # 홈 화면
│   ├── NotificationSetup.tsx        # 알림 예약 화면
│   ├── NavigationActive.tsx         # 네비게이션 활성 화면
│   ├── NotificationList.tsx         # 내역 화면
│   ├── Settings.tsx                 # 설정 화면
│   ├── ContactManagement.tsx        # 연락처 관리
│   ├── MessageManagement.tsx        # 메시지 관리
│   ├── ProfileEdit.tsx              # 프로필 수정
│   ├── ThemeSelector.tsx            # 테마 선택
│   ├── EmailLogin.tsx               # 이메일 로그인
│   ├── EmailSignup.tsx              # 회원가입
│   ├── SnsLogin.tsx                 # 소셜 로그인
│   ├── AppInfo.tsx                  # 앱 정보 (NEW)
│   └── ui/                          # UI 컴포넌트
├── utils/                           # 유틸리티
│   ├── theme.ts                     # 테마 설정
│   ├── api.ts                       # API 헬퍼
│   ├── capacitor-plugins.ts         # Capacitor 헬퍼 (NEW)
│   └── supabase/                    # Supabase 클라이언트
├── supabase/                        # 백엔드
│   └── functions/server/            # Edge Functions
├── resources/                       # 리소스 (NEW)
│   ├── android-icon.md              # 아이콘 가이드
│   └── android-manifest-permissions.xml
├── capacitor.config.ts              # Capacitor 설정 (NEW)
├── vite.config.ts                   # Vite 설정 (NEW)
├── package-capacitor.json           # Capacitor 패키지 목록 (NEW)
├── CAPACITOR-QUICKSTART.md          # 빠른 시작 (NEW)
└── android-build-guide.md           # 빌드 가이드 (NEW)
```

---

## 🔧 환경 변수

다음 환경 변수들이 이미 설정되어 있습니다:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_MAPS_API_KEY=AIzaSyCTQoUhx9sMcyteZVbz9gHppavC9yRfxT0
```

---

## 📱 Android 앱 vs 웹

| 기능 | 웹 버전 | Android 앱 |
|------|---------|-----------|
| GPS 추적 | ⚠️ 백그라운드 제한 | ✅ 완전 지원 |
| 푸시 알림 | ⚠️ 제한적 | ✅ 완전 지원 |
| 화면 켜짐 유지 | ❌ 불가능 | ✅ 가능 |
| 백그라운드 실행 | ❌ 제한적 | ✅ 가능 |
| 진동 피드백 | ⚠️ 제한적 | ✅ 완전 지원 |
| 네이티브 공유 | ⚠️ 제한적 | ✅ 완전 지원 |
| 설치 | 불필요 | 필요 |
| 업데이트 | 자동 | 수동 |

**결론**: 테스트는 웹으로, 실제 사용은 Android 앱 추천!

---

## 🎯 로드맵

### ✅ 완료
- [x] 기본 UI/UX
- [x] 알림 예약 기능
- [x] GPS 위치 추적
- [x] Google Maps API 연동
- [x] 연락처 관리
- [x] 메시지 템플릿
- [x] 4가지 테마
- [x] 이메일 로그인
- [x] 소셜 로그인 (Google)
- [x] 전화번호 인증
- [x] Capacitor 설정
- [x] Android 앱 변환 준비

### 🚧 진행 중
- [ ] Android 앱 테스트
- [ ] APK 빌드
- [ ] 내부 테스트

### 📋 향후 계획
- [ ] iOS 버전
- [ ] 카카오톡 알림 연동
- [ ] 구독 결제 시스템
- [ ] 통계 및 리포트
- [ ] 다중 기사 관리 (B2B)
- [ ] Google Play 출시

---

## 🐛 알려진 이슈

### 웹 버전
- 백그라운드에서 GPS 추적 제한
- 연락처 불러오기 API 제한 (Chrome/Edge만)
- 카카오톡 직접 발송 불가 (공유만 가능)

### Android 앱
- 현재 테스트 중

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 🤝 기여

이슈나 개선 제안은 언제든 환영합니다!

---

## 📞 문의

궁금한 점이 있으시면 언제든 문의해주세요.

---

## 🎉 시작하기

### 웹으로 바로 테스트
👉 https://sheep-wrist-68690551.figma.site

### Android 앱으로 사용
👉 [빠른 시작 가이드](CAPACITOR-QUICKSTART.md) 참조

**Happy Driving! 🚗💨**