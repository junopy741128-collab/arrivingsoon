# 🤖 AI 디자인 도구 프롬프트 템플릿

Google Gravity AI, Gemini, ChatGPT 등 AI 디자인 도구에 정확한 디자인을 전달하기 위한 프롬프트 템플릿입니다.

---

## 📋 기본 프롬프트 (모든 AI에 먼저 전달)

```
당신은 React + Tailwind CSS 전문 프론트엔드 개발자입니다.
다음 디자인 시스템을 **절대적으로** 준수하여 코드를 작성해주세요.

[중요 규칙]
1. 아래 명시된 색상, 간격, 폰트 값을 절대 변경하지 마세요
2. Tailwind의 기본 클래스만 사용하고, 임의의 값([])은 최소화하세요
3. 모든 값은 globals.css의 CSS 변수를 사용합니다
4. 타이포그래피는 HTML 태그만 사용하고, Tailwind 폰트 클래스는 사용하지 마세요

[디자인 시스템]
- 배경색: #0f2920 (어두운 녹색) - 절대 변경 금지
- 강조색: #00ff88 (밝은 녹색) - 절대 변경 금지
- 카드 배경: #1a3d32
- 텍스트: white (기본), gray-300 (보조), gray-400 (비활성)
- 버튼 높이: 56px (h-14)
- 카드 radius: 16px (rounded-2xl)
- 페이지 여백: px-6 (좌우 24px)
- 하단 네비게이션 높이: 80px
```

---

## 🎨 컴포넌트별 상세 프롬프트

### 1. 카드 컴포넌트
```
다음 스타일로 카드 컴포넌트를 만들어주세요:

[카드 스타일]
- 배경: bg-[#1a3d32]
- 경계선: border border-gray-700
- 모서리: rounded-2xl (16px)
- 내부 여백: p-4 (16px)
- Hover 효과: border-[#00ff88]/50 + transition-all duration-200

[예시 코드]
<div className="bg-[#1a3d32] border border-gray-700 rounded-2xl p-4 hover:border-[#00ff88]/50 transition-all duration-200">
  {/* 카드 내용 */}
</div>
```

### 2. 버튼 컴포넌트
```
다음 3가지 버튼 스타일을 구현해주세요:

[Primary 버튼]
- 배경: bg-[#00ff88]
- 텍스트: text-[#0f2920]
- 높이: h-14 (56px)
- 모서리: rounded-xl (12px)
- Hover: bg-[#00dd77]

[Secondary 버튼]
- 배경: bg-[#1a3d32]
- 텍스트: text-white
- 경계선: border border-gray-700
- 높이: h-14
- Hover: bg-[#234a3d]

[Destructive 버튼]
- 배경: bg-red-800
- 텍스트: text-white
- 높이: h-14
- Hover: bg-red-900

[공통]
- 최소 너비: min-w-[44px]
- 패딩: px-6
- 폰트: medium (500)
- 전환: transition-all duration-200
```

### 3. 입력 필드
```
다음 스타일로 입력 필드를 만들어주세요:

[Input 스타일]
- 배경: bg-[#1a3d32]
- 경계선: border border-gray-700
- 모서리: rounded-xl (12px)
- 패딩: px-4 py-3
- 텍스트: text-white
- Placeholder: placeholder:text-gray-400

[Focus 상태]
- 경계선: border-[#00ff88]
- 외곽선: ring-2 ring-[#00ff88]/20

[예시]
<input 
  className="w-full bg-[#1a3d32] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20 transition-all" 
  placeholder="입력하세요"
/>
```

### 4. 하단 네비게이션
```
다음 구조로 하단 네비게이션을 만들어주세요:

[레이아웃]
- 위치: fixed bottom-0 left-0 right-0
- 배경: bg-[#1a3d32]
- 경계선: border-t border-gray-700
- 높이: h-20 (80px)
- Safe Area: pb-safe

[네비게이션 아이템]
- 구조: flex flex-col items-center justify-center
- 아이콘: w-6 h-6
- 텍스트: text-xs
- 활성 상태: text-[#00ff88]
- 비활성 상태: text-gray-400
- 간격: space-y-1

[필수 아이템]
1. 홈 (Home)
2. 예약하기 (Plus)
3. 내역보기 (History)
4. 마이페이지 (User)
```

### 5. 진행률 바
```
다음 스타일로 진행률 바를 만들어주세요:

[배경]
- bg-gray-700
- h-2 (8px)
- rounded-full
- overflow-hidden

[진행 바]
- 그라디언트: linear-gradient(to right, #00ff88, #00dd77)
- rounded-full
- 높이: 100%
- 동적 너비: style={{ width: `${progress}%` }}

[예시]
<div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
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

## 🚨 AI가 자주 실수하는 부분 (반드시 강조)

### 실수 1: 색상 임의 변경
```
❌ AI가 이렇게 할 수 있음:
bg-green-600 (Tailwind 기본 녹색)
bg-emerald-500

✅ 반드시 이렇게 해야 함:
bg-[#0f2920] (배경)
bg-[#00ff88] (강조)

[프롬프트에 추가]
"Tailwind의 green-600, emerald 등을 절대 사용하지 마세요. 
반드시 #0f2920과 #00ff88만 사용하세요."
```

### 실수 2: 폰트 클래스 남발
```
❌ AI가 이렇게 할 수 있음:
<h1 className="text-2xl font-bold">

✅ 반드시 이렇게 해야 함:
<h1>페이지 타이틀</h1>

[프롬프트에 추가]
"HTML 태그는 globals.css에서 자동으로 스타일이 적용됩니다.
text-*, font-* 클래스를 절대 추가하지 마세요."
```

### 실수 3: 간격 불일치
```
❌ AI가 이렇게 할 수 있음:
px-4 (16px)
px-5 (20px)
px-7 (28px)

✅ 반드시 이렇게 해야 함:
px-6 (24px) - 페이지 여백
p-4 (16px) - 카드 내부
gap-3 (12px) - 카드 내부 요소

[프롬프트에 추가]
"간격은 6, 8, 12, 16, 24, 32px만 사용하세요.
홀수 값(5, 7)이나 임의 값은 사용하지 마세요."
```

### 실수 4: 버튼 크기 부족
```
❌ AI가 이렇게 할 수 있음:
h-10 (40px) - 터치하기 어려움

✅ 반드시 이렇게 해야 함:
h-14 (56px) - 모바일 터치 최적

[프롬프트에 추가]
"모든 버튼은 최소 h-14 (56px) 높이를 유지하세요.
모바일 터치 영역 44px 이상 필수입니다."
```

### 실수 5: Safe Area 누락
```
❌ AI가 이렇게 할 수 있음:
<nav className="fixed bottom-0">

✅ 반드시 이렇게 해야 함:
<nav className="fixed bottom-0 pb-safe">
<main className="pb-24">

[프롬프트에 추가]
"iOS notch 대응을 위해 pb-safe 클래스를 사용하세요.
하단 네비게이션 아래 콘텐츠는 pb-24로 여백을 확보하세요."
```

---

## 📱 화면별 프롬프트

### 홈 화면
```
다음 구조로 홈 화면을 만들어주세요:

[전체 레이아웃]
- 배경: bg-[#0f2920]
- 높이: min-h-screen

[콘텐츠 영역]
- 중앙 정렬: flex flex-col items-center justify-center
- 상단 여백: pt-safe
- 하단 여백: pb-32 (네비게이션 공간 + 버튼 공간)

[로고]
- 크기: w-20 h-20 (80x80px) - 또는 모바일에서는 w-16 h-16 (64x64px)
- 위치: 중앙

[제목]
- "곧 도착해요"
- 크기: text-5xl - 또는 모바일에서는 text-3xl
- 색상: text-white
- 정렬: text-center

[설명 텍스트]
- "운전 중 안전하게, '곧 도착해요'가 대신 알려드려요."
- 크기: text-gray-300
- 줄바꿈: leading-relaxed

[버튼 영역]
- 위치: 하단 고정 (pb-32)
- 간격: space-y-3

[버튼 1: SNS 로그인]
- 스타일: Primary
- 텍스트: "💬 SNS 계정으로 계속하기"

[버튼 2: 이메일 로그인]
- 스타일: Outline (bg-transparent border-2 border-gray-700)
- 텍스트: "이메일로 시작하기"

[하단 네비게이션]
- 위에서 정의한 스타일 적용
```

### 대시보드
```
다음 구조로 대시보드를 만들어주세요:

[헤더]
- 여백: px-6 pt-8 pb-6
- 사용자 이름: text-white
- 인사말: text-gray-400

[포인트 카드]
- 배경: linear-gradient(135deg, #00ff88/20, #00dd77/10)
- 경계선: border border-[#00ff88]/30
- 내부: 아이콘(Coins) + 포인트 수 + 충전 버튼

[기능 버튼 그리드]
- 레이아웃: grid grid-cols-2 gap-3
- 버튼 1: "🚗 새 알림 예약"
- 버튼 2: "📇 연락처 관리"

[진행 중 알림 섹션]
- 제목: "진행 중인 알림"
- 카드: 도착지 + 진행률 + 남은 시간

[최근 검색]
- 제목: "최근 검색"
- 리스트: 출발지 → 도착지

[즐겨찾기]
- 제목: "즐겨찾기 ⭐"
- 카드: 즐겨찾기 장소

[하단 여백]
- pb-24 (네비게이션 공간)
```

---

## 🔄 AI 피드백 루프

### 1차 생성 후 체크리스트
```
AI가 코드를 생성하면 다음을 확인하고 피드백하세요:

[ ] 배경색이 #0f2920인가?
[ ] 강조색이 #00ff88인가?
[ ] 버튼 높이가 h-14인가?
[ ] 카드가 rounded-2xl인가?
[ ] px-6 여백이 있는가?
[ ] pb-24 하단 여백이 있는가?
[ ] Safe Area가 적용되었는가?
[ ] 폰트 클래스가 없는가?
```

### 수정 요청 프롬프트
```
다음 부분을 수정해주세요:

[수정 1: 색상]
현재: bg-green-600
변경: bg-[#0f2920]

[수정 2: 버튼 높이]
현재: h-10
변경: h-14

[수정 3: 폰트 클래스 제거]
현재: <h1 className="text-2xl font-bold">
변경: <h1>

[수정 4: Safe Area 추가]
현재: <nav className="fixed bottom-0">
변경: <nav className="fixed bottom-0 pb-safe">
```

---

## 📊 품질 검증 프롬프트

```
생성한 코드가 다음 기준을 만족하는지 확인해주세요:

[색상 검증]
- #0f2920 (배경)이 일관되게 사용되었나요?
- #00ff88 (강조)이 일관되게 사용되었나요?
- Tailwind 기본 색상(green-600 등)을 사용하지 않았나요?

[간격 검증]
- px-6 (24px) 페이지 여백이 있나요?
- p-4 (16px) 카드 패딩이 있나요?
- pb-24 (96px) 하단 여백이 있나요?

[타이포그래피 검증]
- HTML 태그만 사용했나요?
- text-*, font-* 클래스가 없나요?

[모바일 최적화 검증]
- 버튼이 h-14 이상인가요?
- Safe Area가 적용되었나요?
- 하단 네비게이션이 fixed인가요?

[접근성 검증]
- 터치 영역이 44px 이상인가요?
- 텍스트 대비가 충분한가요?

위 항목 중 충족하지 못한 부분이 있다면 수정해주세요.
```

---

## 💡 AI별 최적화 팁

### Google Gemini
```
[장점]
- 긴 프롬프트 이해 능력 우수
- 디자인 토큰 파일 업로드 가능

[전략]
1. design-tokens.json 파일 업로드
2. DESIGN_SPEC.md 전문 제공
3. "위 디자인 시스템을 절대 준수하세요" 강조
```

### ChatGPT (GPT-4)
```
[장점]
- 코드 품질 우수
- 반복 학습 능력

[전략]
1. Custom Instructions에 디자인 시스템 등록
2. 매 대화 시작시 "위 디자인 시스템 기억하나요?" 확인
3. 코드 생성 후 "디자인 시스템 준수 여부 검증" 요청
```

### Claude
```
[장점]
- 긴 컨텍스트 유지
- 파일 첨부 가능

[전략]
1. DESIGN_SPEC.md 전체 첨부
2. "이 디자인 시스템이 절대 규칙입니다" 명시
3. Projects 기능으로 디자인 시스템 저장
```

### GitHub Copilot
```
[장점]
- IDE 내 실시간 코드 생성
- 주석 기반 생성

[전략]
1. 파일 상단에 디자인 시스템 주석 추가
2. // Primary color: #00ff88
3. // Background: #0f2920
4. // Button height: h-14
```

---

## 🎯 성공 사례 프롬프트

```
[완벽한 프롬프트 예시]

당신은 React + Tailwind CSS 개발자입니다.
다음 디자인 시스템을 **절대** 변경하지 말고 정확히 따라주세요.

=== 절대 규칙 ===
1. 배경색: #0f2920 (어두운 녹색)
2. 강조색: #00ff88 (밝은 녹색)
3. 카드 배경: #1a3d32
4. 버튼 높이: h-14 (56px)
5. 페이지 여백: px-6 (24px)
6. 하단 여백: pb-24 (96px)
7. 카드 모서리: rounded-2xl (16px)

=== 금지 사항 ===
- Tailwind 기본 색상 사용 금지 (green-600, emerald-500 등)
- 폰트 클래스 사용 금지 (text-2xl, font-bold 등)
- 홀수 간격 사용 금지 (px-5, px-7 등)

=== 작업 요청 ===
다음 구조로 홈 화면을 만들어주세요:
1. 전체 배경: bg-[#0f2920]
2. 로고 (80x80px) 중앙
3. 제목 "곧 도착해요"
4. Primary 버튼 "SNS 계정으로 계속하기" (bg-[#00ff88])
5. 하단 네비게이션 (h-20, fixed bottom)

위 7가지 절대 규칙을 준수했는지 생성 후 검증해주세요.
```

---

## 📞 문의

디자인 구현 관련 문의: junopy@naver.com

**이 프롬프트를 AI에 복사하여 사용하시면 디자인 구현률이 90% 이상 향상됩니다!** 🚀
