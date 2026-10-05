# 운전기사 자동 알림 발송 서비스 - 디자인 스펙

## 📋 목차
1. [색상 시스템](#색상-시스템)
2. [타이포그래피](#타이포그래피)
3. [간격 및 여백](#간격-및-여백)
4. [컴포넌트 스타일](#컴포넌트-스타일)
5. [레이아웃 구조](#레이아웃-구조)
6. [아이콘 및 에셋](#아이콘-및-에셋)

---

## 🎨 색상 시스템

### 기본 배경색
```css
--app-bg-primary: #0f2920      /* 메인 배경 (어두운 녹색) */
--app-bg-secondary: #1a3d32    /* 카드/섹션 배경 */
--app-bg-tertiary: #234a3d     /* Hover 상태 배경 */
```

### 강조색 (Accent)
```css
--app-accent-primary: #00ff88   /* 주요 강조색 (밝은 녹색) */
--app-accent-hover: #00dd77     /* Hover 상태 */
--app-accent-light: #00ff88/20  /* 투명도 20% */
```

### 텍스트 색상
```css
--text-primary: #ffffff         /* 기본 텍스트 */
--text-secondary: #d1d5db       /* 보조 텍스트 (gray-300) */
--text-muted: #9ca3af          /* 비활성/설명 텍스트 (gray-400) */
--text-disabled: #6b7280       /* 비활성화 (gray-500) */
```

### 상태 색상
```css
/* 성공/활성 */
--status-success: #22c55e      /* green-500 */
--status-success-bg: #22c55e/20

/* 경고 */
--status-warning: #eab308      /* yellow-500 */
--status-warning-bg: #fbbf24/20

/* 에러/위험 */
--status-error: #ef4444        /* red-500 */
--status-error-bg: #ef4444/20
--status-error-border: #ef4444/30

/* 정보 */
--status-info: #3b82f6         /* blue-500 */
--status-info-bg: #3b82f6/20
```

### 경계선 (Border)
```css
--border-default: #374151      /* gray-700 */
--border-light: #4b5563        /* gray-600 */
--border-accent: #00ff88/30
--border-error: #ef4444/50
```

### 그라디언트
```css
/* 포인트 카드 배경 */
background: linear-gradient(135deg, #00ff88/20, #00dd77/10);

/* 버튼 강조 */
background: linear-gradient(to right, #00ff88, #00dd77);
```

---

## 📝 타이포그래피

### 폰트 사이즈
```css
/* Heading */
--text-2xl: 1.5rem    /* 24px - 페이지 타이틀, 사용자 이름 */
--text-xl: 1.25rem    /* 20px - 섹션 헤더 */
--text-lg: 1.125rem   /* 18px - 카드 타이틀 */

/* Body */
--text-base: 1rem     /* 16px - 기본 텍스트, 버튼 */
--text-sm: 0.875rem   /* 14px - 보조 텍스트 */
--text-xs: 0.75rem    /* 12px - 라벨, 뱃지 */
```

### 폰트 굵기
```css
--font-weight-medium: 500   /* 제목, 버튼, 라벨 */
--font-weight-normal: 400   /* 본문, 입력 필드 */
```

### 행간 (Line Height)
```css
line-height: 1.5    /* 모든 텍스트 요소 공통 */
```

---

## 📐 간격 및 여백

### Spacing Scale (Tailwind 기준)
```css
/* 컴포넌트 내부 여백 */
p-2: 0.5rem   /* 8px */
p-3: 0.75rem  /* 12px */
p-4: 1rem     /* 16px */
p-5: 1.25rem  /* 20px */
p-6: 1.5rem   /* 24px */

/* 컴포넌트 간 간격 */
gap-2: 0.5rem   /* 8px - 아이콘+텍스트 */
gap-3: 0.75rem  /* 12px - 카드 내부 요소 */
gap-4: 1rem     /* 16px - 섹션 간 */
```

### 주요 여백 패턴
```css
/* 페이지 좌우 여백 */
px-6: 1.5rem (24px)

/* 헤더 상단 여백 */
pt-8: 2rem (32px)

/* 헤더 하단 여백 */
pb-6: 1.5rem (24px)

/* 하단 네비게이션 공간 */
pb-24: 6rem (96px)

/* 섹션 상단 여백 */
mt-6: 1.5rem (24px)
mt-8: 2rem (32px)

/* 카드 내부 여백 */
p-4: 1rem (16px)
p-5: 1.25rem (20px)
```

---

## 🧱 컴포넌트 스타일

### 카드 (Card)
```css
/* 기본 카드 */
background: #1a3d32
border: 1px solid #374151 (gray-700)
border-radius: 1rem (16px)
padding: 1rem (16px)

/* Hover 효과 */
border-color: #00ff88/50
transition: all 0.2s
```

### 버튼 (Button)

**주요 버튼 (Primary)**
```css
background: #00ff88
color: #0f2920
padding: 0.75rem 1.5rem
border-radius: 0.75rem (12px)
font-weight: 500

/* Hover */
background: #00dd77
```

**보조 버튼 (Secondary)**
```css
background: #1a3d32
color: #ffffff
border: 1px solid #374151
```

**경고 버튼 (Destructive)**
```css
background: #991b1b (red-800)
color: #ffffff

/* Hover */
background: #7f1d1d (red-900)
```

### 입력 필드 (Input)
```css
background: #1a3d32
border: 1px solid #374151
border-radius: 0.75rem (12px)
padding: 0.75rem 1rem
color: #ffffff

/* Placeholder */
color: #9ca3af (gray-400)

/* Focus */
border-color: #00ff88
outline: 2px solid #00ff88/20
```

### 상태 뱃지 (Badge)
```css
/* 예약 상태 */
background: #3b82f6/20 (blue-500/20)
color: #3b82f6
padding: 0.25rem 0.75rem
border-radius: 9999px
font-size: 0.75rem

/* 완료 상태 */
background: #22c55e/20 (green-500/20)
color: #22c55e

/* 취소 상태 */
background: #6b7280/20 (gray-500/20)
color: #9ca3af
```

### GPS 신호등
```css
/* 정상 (녹색) */
background: #22c55e (green-500)
width: 0.75rem (12px)
height: 0.75rem (12px)
border-radius: 9999px

/* 불량 (빨간색) */
background: #ef4444 (red-500)
```

### 진행률 바 (Progress Bar)
```css
/* 배경 */
background: #374151 (gray-700)
height: 0.5rem (8px)
border-radius: 9999px

/* 진행 상태 */
background: linear-gradient(to right, #00ff88, #00dd77)
border-radius: 9999px
```

---

## 📱 레이아웃 구조

### 전체 화면
```css
min-height: 100vh
background: #0f2920
```

### Safe Area (모바일 대응)
```css
/* 상단 Safe Area */
--safe-area-inset-top: env(safe-area-inset-top)

/* 하단 Safe Area */
--safe-area-inset-bottom: env(safe-area-inset-bottom)

/* 사용 예시 */
.h-safe-top { height: var(--safe-area-inset-top); }
.pb-safe { padding-bottom: var(--safe-area-inset-bottom); }
```

### 하단 네비게이션 (Bottom Nav)
```css
position: fixed
bottom: 0
width: 100%
height: 80px
background: #1a3d32
border-top: 1px solid #374151
padding-bottom: env(safe-area-inset-bottom)

/* 네비게이션 아이템 */
gap: 0.5rem (8px)
icon-size: 1.5rem (24px)

/* 활성 상태 */
color: #00ff88

/* 비활성 상태 */
color: #9ca3af (gray-400)
```

### 헤더
```css
padding: 2rem 1.5rem 1.5rem (32px 24px 24px)

/* 타이틀 */
font-size: 1.5rem (24px)
font-weight: 500

/* 서브텍스트 */
font-size: 0.875rem (14px)
color: #9ca3af (gray-400)
```

### 섹션 간격
```css
/* 섹션 제목 */
margin-bottom: 1rem (16px)
font-size: 1.125rem (18px)

/* 섹션 간 간격 */
margin-top: 2rem (32px)
```

---

## 🎯 아이콘 및 에셋

### 아이콘 라이브러리
```
lucide-react (v0.545.0)
```

### 주요 아이콘 목록
```jsx
import {
  MapPin,        // 위치/도착지
  Star,          // 즐겨찾기
  Coins,         // 포인트
  Car,           // 차량/운전
  MessageSquare, // 메시지
  Users,         // 연락처
  Clock,         // 시간
  Calendar,      // 날짜
  History,       // 알림내역
  Settings,      // 설정
  LogOut,        // 로그아웃
  Shield,        // 관리자
  ChevronRight,  // 화살표 (오른쪽)
  Plus,          // 추가
  Minus,         // 차감
  Search,        // 검색
  X,             // 닫기
  Phone,         // 전화
  AlertCircle,   // 경고
} from 'lucide-react';
```

### 아이콘 사이즈
```css
/* 기본 */
w-5 h-5: 1.25rem (20px)

/* 큰 아이콘 (헤더, 강조) */
w-6 h-6: 1.5rem (24px)
w-8 h-8: 2rem (32px)

/* 작은 아이콘 (버튼 내부) */
w-4 h-4: 1rem (16px)
```

### 로고
```
파일: figma:asset/a6ded2d6ea9d85ee6ee0dcfb9e3e5eda489e102e.png
위치: 헤더 (40x40px)
용도: 브랜드 아이덴티티
```

---

## 🔄 인터랙션 & 애니메이션

### Transition
```css
/* 기본 트랜지션 */
transition: all 0.2s ease-in-out

/* 색상 변경만 */
transition: colors 0.2s

/* Opacity 페이드 */
transition: opacity 0.2s
```

### Hover 효과
```css
/* 카드 */
border-color: #00ff88/50
transform: translateY(-2px)

/* 버튼 */
background: #00dd77
opacity: 0.9

/* 링크/텍스트 */
text-decoration: underline
color: #00dd77
```

---

## 📱 반응형 가이드

### 모바일 우선 (Mobile First)
- 기본 디자인은 모바일 기준 (360px~428px)
- 태블릿/데스크탑은 현재 미지원 (향후 확장 가능)

### 터치 타겟
```css
/* 최소 터치 영역 */
min-height: 44px
min-width: 44px
```

### 스크롤
```css
/* 페이지 하단 여백 (네비게이션 겹침 방지) */
padding-bottom: 6rem (96px)
```

---

## 🎨 테마 전환 준비

### 현재 상태
- **다크 모드 Only** (단일 테마)

### 향후 라이트 모드 추가 시
```css
/* CSS 변수로 관리 */
:root {
  /* 라이트 모드 */
  --app-bg-primary: #f5f5f5;
  --app-bg-secondary: #ffffff;
  --app-accent: #00cc66;
}

.dark {
  /* 다크 모드 */
  --app-bg-primary: #0f2920;
  --app-bg-secondary: #1a3d32;
  --app-accent: #00ff88;
}
```

---

## 📌 주요 화면별 레이아웃

### 1. 홈 (Dashboard)
```
[Safe Area Top]
[Header: 사용자 이름 + 프로필 버튼]
[포인트 카드]
[주요 기능 버튼 (새 알림, 연락처 관리)]
[진행 중 알림 목록]
[최근 검색 목록]
[즐겨찾기]
[Safe Area Bottom + Navigation]
```

### 2. 알림 예약 (Step 1-3)
```
[Header: 단계 표시 + 뒤로가기]
[Progress Bar]
[입력 영역]
[다음/완료 버튼 (하단 고정)]
```

### 3. 진행 중 알림 (NavigationActive)
```
[Header: GPS 상태 + 정보]
[지도 영역 (Placeholder)]
[진행률 + 남은 시간/거리]
[도착지 정보]
[메시지 미리보기]
[취소 버튼]
```

### 4. 마이페이지
```
[Header: 사용자 정보]
[포인트 상세 탭 (사용/적립/전체)]
[설정 메뉴]
[로그아웃]
[사업자 정보 (하단)]
[Navigation]
```

---

## 📦 개발 전달 사항

### 색상 하드코딩 → CSS 변수 전환 필요
현재 많은 컴포넌트에서 색상이 하드코딩되어 있습니다:
- `bg-[#0f2920]` → `bg-app-primary`
- `bg-[#1a3d32]` → `bg-app-secondary`
- `text-[#00ff88]` → `text-app-accent`

### 사용 라이브러리
```json
{
  "lucide-react": "^0.545.0",
  "@radix-ui/react-dialog": "^1.1.6",
  "@radix-ui/react-tabs": "^1.1.3",
  "react-hook-form": "7.55.0",
  "tailwindcss": "^4.0"
}
```

### 주의사항
1. **Safe Area 필수 적용** - iOS notch 대응
2. **고정 하단 네비게이션** - 모든 페이지에서 일관성 유지
3. **터치 타겟 최소 44px** - 모바일 사용성
4. **GPS 신호 상태 표시** - 실시간 피드백 중요

---

## 📞 문의

**사업자 정보**
- 상호명: 올타
- 사업자등록번호: 680-64-00735
- 대표자: 정종환
- 문의: junopy@naver.com
