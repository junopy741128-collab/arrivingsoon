# 🚀 개발자 핸드오프 가이드
## 운전기사 자동 알림 발송 서비스

---

## 📦 전달 패키지 구성

### 1. 필수 문서
- ✅ `DESIGN_SPEC.md` - 디자인 시스템 전체 명세
- ✅ `ICON_GUIDE.md` - 아이콘 사용 가이드
- ✅ `DEVELOPER_HANDOFF.md` (본 문서) - 개발 구현 가이드
- ✅ `/assets/icons/` - 24개 SVG 아이콘 파일

### 2. 소스 파일
- `/components/` - React 컴포넌트 (17개 화면)
- `/App.tsx` - 메인 앱 진입점
- `/styles/globals.css` - 전역 스타일

### 3. 디자인 에셋
- `/assets/icons/*.svg` - 벡터 아이콘
- `figma:asset/*.png` - 로고 이미지

---

## 🎯 디자인 구현 체크리스트

### ✨ 색상 (Color)
- [ ] 배경색 `#0f2920` (어두운 녹색) 전역 적용
- [ ] 강조색 `#00ff88` (밝은 녹색) 일관성 확인
- [ ] 텍스트 계층: 흰색 → gray-300 → gray-400
- [ ] 상태 색상: 성공(green-500), 경고(yellow-500), 에러(red-500)
- [ ] 반투명 효과: `/20` (20% opacity) 사용 확인

### 📐 간격 (Spacing)
- [ ] 페이지 좌우 여백: `px-6` (24px)
- [ ] 헤더 상단: `pt-8` (32px), 하단: `pb-6` (24px)
- [ ] 카드 간격: `gap-3` (12px)
- [ ] 하단 네비게이션 공간: `pb-24` (96px)
- [ ] 터치 타겟 최소 44px 이상

### 🔤 타이포그래피 (Typography)
- [ ] 페이지 타이틀: `1.5rem` (24px) / medium
- [ ] 섹션 헤더: `1.125rem` (18px) / medium
- [ ] 본문: `1rem` (16px) / normal
- [ ] 보조 텍스트: `0.875rem` (14px) / normal
- [ ] 라벨/뱃지: `0.75rem` (12px) / medium
- [ ] **중요**: 타이포그래피는 CSS 변수 사용, Tailwind 클래스 사용 금지

### 🧱 컴포넌트 (Components)
- [ ] 카드: `rounded-2xl` (16px) + border `gray-700`
- [ ] 버튼: Primary `bg-[#00ff88]`, Secondary `bg-[#1a3d32]`
- [ ] 입력 필드: `rounded-xl` + focus시 `border-[#00ff88]`
- [ ] 뱃지: `rounded-full` + 상태별 색상
- [ ] 진행률 바: gradient `#00ff88 → #00dd77`

### 📱 모바일 대응 (Mobile)
- [ ] Safe Area 적용 (iOS notch)
- [ ] 하단 네비게이션 고정 (fixed bottom)
- [ ] 스크롤시 네비게이션 항상 보임
- [ ] 터치 피드백: `active:scale-95`
- [ ] 최소 너비 360px, 최대 428px 고려

### 🎨 인터랙션 (Interaction)
- [ ] Hover: `transition-all duration-200`
- [ ] 카드 Hover: border-accent + `translateY(-2px)`
- [ ] 버튼 Active: `opacity-90` + `scale-95`
- [ ] 페이드 인: `opacity-0 → opacity-100`

---

## 🚨 주요 구현 이슈 & 해결 방법

### 1. 색상이 올바르게 적용되지 않음
**문제:** AI가 색상을 임의로 변경하거나 일관성이 없음

**해결:**
```css
/* globals.css에 CSS 변수 정의 */
:root {
  --app-bg-primary: #0f2920;
  --app-bg-secondary: #1a3d32;
  --app-accent: #00ff88;
  --app-accent-hover: #00dd77;
}

/* Tailwind 설정 (tailwind.config.js) */
module.exports = {
  theme: {
    extend: {
      colors: {
        'app-primary': '#0f2920',
        'app-secondary': '#1a3d32',
        'app-accent': '#00ff88',
      }
    }
  }
}
```

**적용:**
```jsx
// ❌ 하드코딩 (AI가 바꿀 가능성)
<div className="bg-[#0f2920]">

// ✅ Tailwind 커스텀 클래스 사용
<div className="bg-app-primary">
```

---

### 2. 간격이 일관되지 않음
**문제:** 패딩/마진이 제각각

**해결:**
```jsx
// ✅ Spacing Token 활용
<div className="px-6 pt-8 pb-6">  {/* 24px, 32px, 24px */}

// ✅ 섹션 간격 일관성
<section className="space-y-4">  {/* 16px */}
```

---

### 3. 타이포그래피 덮어쓰기 문제
**문제:** AI가 Tailwind 폰트 클래스를 추가해서 globals.css 무시

**해결:**
```jsx
// ❌ 절대 사용 금지 (globals.css 기본 설정 무시)
<h1 className="text-2xl font-bold">

// ✅ 클래스 없이 HTML 태그만 사용
<h1>페이지 타이틀</h1>

// ✅ 예외: 특별히 다른 크기 필요시만 사용
<span className="text-xs">작은 텍스트</span>
```

---

### 4. 아이콘 크기가 제각각
**문제:** 24px, 20px, 22px... 혼재

**해결:**
```jsx
import { MapPin, Clock, User } from 'lucide-react';

// ✅ 일관된 크기 사용
<MapPin className="w-6 h-6" />  {/* 24px - 기본 */}
<Clock className="w-5 h-5" />   {/* 20px - 작은 버튼 */}
<User className="w-8 h-8" />    {/* 32px - 헤더/강조 */}
```

---

### 5. Safe Area 미적용 (iOS notch 잘림)
**문제:** iPhone X 이상에서 상단/하단 UI 잘림

**해결:**
```jsx
// ✅ Safe Area 적용
<div className="pt-safe">  {/* env(safe-area-inset-top) */}

// ✅ 하단 네비게이션
<nav className="pb-safe">  {/* env(safe-area-inset-bottom) */}
```

---

### 6. 하단 네비게이션 겹침
**문제:** 콘텐츠가 네비게이션에 가려짐

**해결:**
```jsx
// ✅ 페이지 하단에 여백 필수
<main className="pb-24">  {/* 96px - 네비게이션(80px) + 여유(16px) */}
  {/* 콘텐츠 */}
</main>

// ✅ 네비게이션은 fixed
<nav className="fixed bottom-0 left-0 right-0">
```

---

### 7. 버튼 터치 영역 부족
**문제:** 모바일에서 버튼 누르기 어려움

**해결:**
```jsx
// ❌ 터치 영역 부족
<button className="p-2">  {/* 32px - 작음 */}

// ✅ 최소 44px 확보
<button className="h-14 px-6">  {/* 56px 높이 */}
```

---

### 8. 진행률 표시가 안보임
**문제:** 진행률 바가 배경과 구분 안됨

**해결:**
```jsx
// ✅ 그라디언트 사용
<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
  <div 
    className="h-full rounded-full"
    style={{
      width: '80%',
      background: 'linear-gradient(to right, #00ff88, #00dd77)'
    }}
  />
</div>
```

---

## 📋 화면별 구현 가이드

### 🏠 홈 화면 (HomePage)
```jsx
// 주요 요소
- 로고 (80x80px) 중앙 정렬
- 제목 "곧 도착해요" (text-5xl) → 모바일은 text-3xl로 조정
- SNS 로그인 버튼 (Primary)
- 이메일 로그인 버튼 (Outline)
- 하단 네비게이션

// 주의사항
- pb-32 (128px) 여백으로 버튼이 네비게이션에 안가리게
- 로고 크기를 작게 (60x60px) 조정 가능
```

### 📊 대시보드 (Dashboard)
```jsx
// 주요 섹션
1. 헤더 - 사용자 이름 + 프로필 버튼
2. 포인트 카드 - 그라디언트 배경 + 아이콘
3. 주요 기능 버튼 (2열 그리드)
4. 진행 중 알림 리스트
5. 최근 검색 목록
6. 즐겨찾기

// 주의사항
- 각 섹션 간격: mt-6 (24px)
- 카드 내부 간격: gap-3 (12px)
```

### 🚗 진행 중 알림 (NavigationActive)
```jsx
// GPS 신호등
<div className="w-3 h-3 rounded-full bg-green-500" />

// 진행률
- 전체 진행: progress / 100
- 80% 도달시 자동 발송
- 실시간 업데이트 (10초마다)

// 주의사항
- 지도 영역: 현재 placeholder, 추후 Google Maps 연동
- 취소 버튼: destructive variant
```

### 👤 마이페이지 (MyPage)
```jsx
// 탭 구조
<Tabs defaultValue="used">
  <TabsList>사용 | 적립 | 전체</TabsList>
  <TabsContent>포인트 내역</TabsContent>
</Tabs>

// 사업자 정보 (하단 고정)
- 상호명: 올타
- 사업자등록번호: 680-64-00735
- 대표자: 정종환
- 문의: junopy@naver.com
```

---

## 🎨 AI 디자인 도구에 전달하는 법

### 방법 1: 디자인 토큰 파일 제공
```json
// design-tokens.json
{
  "colors": {
    "background": {
      "primary": "#0f2920",
      "secondary": "#1a3d32"
    },
    "accent": {
      "primary": "#00ff88",
      "hover": "#00dd77"
    }
  },
  "spacing": {
    "page-x": "24px",
    "page-y": "32px",
    "card": "16px"
  },
  "typography": {
    "heading-1": {
      "size": "24px",
      "weight": 500
    }
  }
}
```

### 방법 2: CSS 변수 파일 제공
```css
/* design-system.css */
:root {
  /* Colors */
  --app-bg-primary: #0f2920;
  --app-bg-secondary: #1a3d32;
  --app-accent: #00ff88;
  
  /* Spacing */
  --space-page-x: 24px;
  --space-page-y: 32px;
  
  /* Typography */
  --text-heading-1: 1.5rem;
}
```

### 방법 3: Figma/Sketch 파일 export
- Styles → Export → CSS/JSON
- AI 도구에 업로드

### 방법 4: 상세 프롬프트 작성
```
"다음 디자인 시스템을 정확히 따라주세요:

1. 배경색은 반드시 #0f2920 (어두운 녹색)
2. 강조색은 반드시 #00ff88 (밝은 녹색)
3. 버튼 높이는 56px (h-14)
4. 카드 border-radius는 16px
5. 페이지 좌우 여백은 24px
6. 하단 네비게이션 높이는 80px

이 값들은 절대 변경하지 마세요."
```

---

## 🔍 품질 검증 방법

### 1. 색상 검증
```bash
# 코드에서 색상 하드코딩 찾기
grep -r "bg-\[#" src/
grep -r "text-\[#" src/

# 결과가 일관되게 #0f2920, #00ff88만 나오는지 확인
```

### 2. 간격 검증
```bash
# 비일관적인 패딩 찾기
grep -r "px-\[" src/  # 커스텀 패딩 사용 체크
grep -r "py-\[" src/

# Tailwind 기본 값 (px-6, py-4 등) 사용하는지 확인
```

### 3. 타이포그래피 검증
```bash
# 폰트 클래스 사용 찾기
grep -r "text-\[" src/
grep -r "font-\[" src/

# 최소한으로 사용되는지 확인
```

### 4. 반응형 검증
- Chrome DevTools → Device Toolbar
- 테스트 사이즈: 360px, 375px, 390px, 412px, 428px
- 가로 스크롤 없는지 확인

### 5. Safe Area 검증
- iOS Simulator (iPhone 14 Pro 이상)
- notch 영역에 UI 안가리는지 확인

---

## 📱 권장 뷰포트 사이즈

```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
```

### 테스트 기준
| 디바이스 | 너비 | 높이 | 비고 |
|---------|------|------|------|
| iPhone SE | 375px | 667px | 최소 지원 |
| iPhone 12/13/14 | 390px | 844px | 표준 |
| iPhone 14 Pro Max | 430px | 932px | 최대 |
| Galaxy S22 | 360px | 800px | 안드로이드 소형 |
| Galaxy S23 | 412px | 915px | 안드로이드 중형 |

---

## ✅ 최종 체크리스트

### 디자인 일관성
- [ ] 배경색 `#0f2920` 모든 화면 적용
- [ ] 강조색 `#00ff88` 일관되게 사용
- [ ] 카드 스타일 동일 (border-radius, padding)
- [ ] 버튼 높이 56px 이상
- [ ] 간격 체계 일관성 (6, 8, 12, 16, 24, 32px)

### 모바일 최적화
- [ ] Safe Area 적용 (iOS)
- [ ] 하단 네비게이션 고정
- [ ] 터치 타겟 44px 이상
- [ ] 가로 스크롤 없음
- [ ] 360px 너비에서 정상 작동

### 접근성
- [ ] 텍스트 대비율 4.5:1 이상
- [ ] 터치 간격 8px 이상
- [ ] 포커스 표시 (키보드 네비게이션)
- [ ] 에러 메시지 명확

### 성능
- [ ] 이미지 최적화 (WebP)
- [ ] 아이콘 SVG 사용
- [ ] 불필요한 리렌더링 방지
- [ ] Lazy loading 적용

---

## 🛠️ 개발 환경 설정

```bash
# 1. 프로젝트 클론
git clone [repository-url]
cd project

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 빌드
npm run build

# 5. 린팅
npm run lint
```

---

## 📞 문의 및 지원

### 디자인 문의
- 📧 junopy@naver.com
- 📱 사업자 정보: 올타 (680-64-00735)

### 기술 지원
- 디자인 스펙: `DESIGN_SPEC.md` 참고
- 아이콘 가이드: `ICON_GUIDE.md` 참고
- 컴포넌트 코드: `/components/` 폴더

---

## 🔖 버전 관리

| 날짜 | 버전 | 변경사항 |
|------|------|---------|
| 2024-12-26 | v1.0 | 초기 핸드오프 가이드 작성 |

---

**⚡ 빠른 시작:**
1. `DESIGN_SPEC.md` 읽기 (5분)
2. `design-tokens.json` AI에 업로드 (1분)
3. 체크리스트 따라 검증 (10분)

**성공적인 구현을 위해 이 문서를 개발팀 전체와 공유해주세요!** 🚀
