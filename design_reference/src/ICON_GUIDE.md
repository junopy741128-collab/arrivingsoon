# 📦 아이콘 에셋 가이드

## 제공된 아이콘 목록

총 **24개**의 SVG 아이콘이 `/assets/icons/` 폴더에 생성되었습니다.

### 📍 위치 & 내비게이션
- `map-pin.svg` - 위치/도착지 마커
- `home.svg` - 홈 아이콘
- `chevron-right.svg` - 오른쪽 화살표
- `chevron-left.svg` - 왼쪽 화살표 (뒤로가기)

### 👤 사용자 & 연락처
- `user.svg` - 단일 사용자
- `users.svg` - 다중 사용자/연락처 관리

### 💰 포인트 & 결제
- `coins.svg` - 포인트

### 📱 커뮤니케이션
- `message-square.svg` - 메시지/알림
- `phone.svg` - 전화 연락처

### 🚗 운전 관련
- `car.svg` - 차량/운전

### ⏰ 시간 & 일정
- `clock.svg` - 시간
- `calendar.svg` - 날짜/일정
- `history.svg` - 알림 내역

### ⚙️ 설정 & 관리
- `settings.svg` - 설정
- `shield.svg` - 관리자 페이지
- `log-out.svg` - 로그아웃

### ✨ 기타
- `star.svg` - 즐겨찾기
- `search.svg` - 검색
- `plus.svg` - 추가
- `minus.svg` - 삭제/차감
- `x.svg` - 닫기
- `alert-circle.svg` - 경고/알림
- `more-vertical.svg` - 더보기 메뉴
- `grid.svg` - 그리드 레이아웃

---

## 🎨 사용 방법

### 1. HTML에서 직접 사용
```html
<img src="/assets/icons/map-pin.svg" alt="위치" width="24" height="24" />
```

### 2. CSS 배경 이미지
```css
.icon-map-pin {
  background-image: url('/assets/icons/map-pin.svg');
  width: 24px;
  height: 24px;
}
```

### 3. React/JSX에서 import
```jsx
import MapPinIcon from '/assets/icons/map-pin.svg';

function Component() {
  return <img src={MapPinIcon} alt="위치" />;
}
```

### 4. 인라인 SVG (직접 코드 복사)
```jsx
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="..."/>
</svg>
```

---

## 🎯 스타일링 가이드

### 색상 변경
SVG의 `stroke="currentColor"` 속성 덕분에 텍스트 색상으로 제어 가능합니다.

**CSS:**
```css
.icon {
  color: #00ff88; /* 아이콘 색상 변경 */
}
```

**HTML:**
```html
<img src="/assets/icons/star.svg" style="color: #00ff88;" />
```

### 크기 조정
```css
/* 방법 1: width/height 직접 지정 */
.icon-small { width: 16px; height: 16px; }
.icon-medium { width: 24px; height: 24px; }
.icon-large { width: 32px; height: 32px; }

/* 방법 2: font-size로 제어 (인라인 SVG) */
svg { font-size: 1.5rem; }
```

### Stroke 굵기 변경
```html
<svg stroke-width="2">  <!-- 기본 -->
<svg stroke-width="1.5"> <!-- 얇게 -->
<svg stroke-width="3">   <!-- 굵게 -->
```

---

## 📐 아이콘 스펙

- **기본 사이즈:** 24x24px
- **Viewbox:** 0 0 24 24
- **Stroke Width:** 2px
- **Fill:** none (선 기반 아이콘)
- **Stroke:** currentColor (부모 요소의 색상 상속)
- **Line Cap:** round
- **Line Join:** round

---

## 🔄 커스텀 아이콘 추가 방법

1. SVG 파일을 `/assets/icons/` 폴더에 추가
2. 파일명은 kebab-case 사용 (예: `custom-icon.svg`)
3. SVG 속성 확인:
   ```xml
   <svg xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2">
   ```

---

## 📦 다운로드 & 배포

### 개발팀 전달 시:
1. `/assets/icons/` 폴더 전체를 압축
2. 이 가이드 문서(`ICON_GUIDE.md`)와 함께 전달
3. 또는 디자인 스펙 문서(`DESIGN_SPEC.md`) 참고

### 출처:
모든 아이콘은 [Lucide Icons](https://lucide.dev) 라이브러리 기반으로 생성되었습니다.
- 라이선스: MIT License (상업적 사용 가능)
- 버전: v0.545.0

---

## 🎨 앱에서 사용된 아이콘 매핑

| 화면 | 아이콘 | 파일명 |
|------|--------|--------|
| **홈 화면** | | |
| 위치 입력 | MapPin | `map-pin.svg` |
| 즐겨찾기 | Star | `star.svg` |
| 포인트 카드 | Coins | `coins.svg` |
| 차량 정보 | Car | `car.svg` |
| 메시지 | MessageSquare | `message-square.svg` |
| **알림 목록** | | |
| 시간 | Clock | `clock.svg` |
| 날짜 | Calendar | `calendar.svg` |
| 내역 | History | `history.svg` |
| **연락처** | | |
| 연락처 그룹 | Users | `users.svg` |
| 전화번호 | Phone | `phone.svg` |
| 검색 | Search | `search.svg` |
| 추가 | Plus | `plus.svg` |
| **설정/마이페이지** | | |
| 설정 | Settings | `settings.svg` |
| 관리자 | Shield | `shield.svg` |
| 로그아웃 | LogOut | `log-out.svg` |
| 사용자 | User | `user.svg` |
| **공통 UI** | | |
| 화살표 (다음) | ChevronRight | `chevron-right.svg` |
| 화살표 (뒤로) | ChevronLeft | `chevron-left.svg` |
| 닫기 | X | `x.svg` |
| 경고 | AlertCircle | `alert-circle.svg` |
| 메뉴 | MoreVertical | `more-vertical.svg` |

---

## 💡 사용 팁

1. **색상 일관성**: 앱 전체에서 `#00ff88` (강조색), `#ffffff` (기본), `#9ca3af` (보조) 색상 사용
2. **크기 일관성**: 작은 아이콘 16px, 기본 24px, 큰 아이콘 32px
3. **접근성**: `alt` 텍스트 필수 추가
4. **성능**: 자주 사용되는 아이콘은 SVG 스프라이트 고려

---

**문의:** junopy@naver.com
