# 개발 규칙 및 버그 패턴 레퍼런스

> 이 문서는 개발 중 발견된 중요 버그 패턴, 수정 원칙, 주의사항을 기록합니다.  
> 새로운 기능 추가 또는 수정 시 **반드시 참조**하세요.

---

## 🔴 Rule 1: useRef는 onUpdate 호출로 자동 동기화되지 않는다

### 문제 (v67 이전)
```typescript
// ❌ 잘못된 패턴
const tripRef = useRef(trip); // 초기화만, 이후 자동 업데이트 없음

// 이벤트 리스너 내부 (useEffect [] 클로저)
const currentSent = tripRef.current.sentMessages || []; // 항상 초기값!
const updatedSent = [...currentSent, tag];
onUpdate({ ...tripRef.current, sentMessages: updatedSent }); // tripRef는 여전히 구버전
```

**결과**: 
- 출발 이벤트 → `sentMessages = ['출발문자']`
- 도착 이벤트 → `tripRef.current.sentMessages = []` (여전히 초기값) → `sentMessages = ['도착문자']` ← 출발문자 사라짐!
- `processPayment`에서 `sentMessages = []` → `deduction = 0` → 포인트 미차감

### 해결 (v67~)
```typescript
// ✅ 올바른 패턴: onUpdate 호출 전에 tripRef.current를 직접 업데이트
tripRef.current = {
  ...tripRef.current,
  sentMessages: updatedSent,
  ...arrivalData
};
onUpdate(tripRef.current); // 최신값으로 호출
```

### 파일
- `src/components/NavigationActive.tsx` - `tripNotificationSent` 리스너 내 `tripRef.current` 업데이트

---

## 🔴 Rule 2: 올톡 알림톡 API - message/title은 반드시 placeholder 형태

### 문제 (v65 이전)
```typescript
// ❌ 잘못된 패턴: 직접 치환된 값을 전송
{
  "message": "정종환님이 운행중입니다...",  // 이미 치환됨 → KKO_3016
  "title": "[신천교차로]근처"               // 이미 치환됨 → KKO_3016
}
```

### 해결 (v65~)
```typescript
// ✅ 올바른 패턴: placeholder 형태로 전송, Oltalk 서버가 VAR 치환
{
  "message": "#{VAR1}님이 운행중입니다...",
  "title": " [#{VAR2}]근처",  // 앞 공백 1칸 필수! (11092 기준)
  "numbers": [{ "VAR1": "정종환", "VAR2": "신천교차로", "VAR3": "14" }]
}
```

**이유**: Oltalk 서버가 `numbers[].VAR1/VAR2/VAR3`으로 치환한 결과를 카카오에 전송.  
직접 치환된 값을 보내면 Oltalk가 재치환 시도 → 카카오 등록 템플릿과 글자/공백 불일치 → KKO_3016

### 파일
- `supabase/functions/send-kakao-alimtalk/index.ts` - `ALIMTALK_TEMPLATES` 상수
- `docs/oltalk-api.md` - 상세 스펙

---

## 🔴 Rule 3: title은 numbers[] 안이 아닌 requestBody 최상위에

### 문제 (v61 이전)
```json
// ❌ 잘못된 위치 → ERR_280
{
  "numbers": [{ "hp": "...", "title": "[신천교차로]근처" }]
}
```

### 해결 (v61~)
```json
// ✅ 올바른 위치
{
  "title": " [#{VAR2}]근처",
  "numbers": [{ "hp": "...", "VAR1": "...", "VAR2": "..." }]
}
```

### 파일
- `supabase/functions/send-kakao-alimtalk/index.ts`

---

## 🔴 Rule 4: handleCompleteTrip은 activeTrip이 아닌 latestTrip(tripRef) 우선

### 문제 (v66 이전)
```typescript
// ❌ 잘못된 패턴: activeTrip은 타이밍 문제로 구버전일 수 있음
const handleCompleteTrip = async () => {
  const completedTrip = { ...activeTrip, status: 'completed' };
  // activeTrip.sentMessages가 비어있을 수 있음!
}
```

### 해결 (v66~)
```typescript
// ✅ NavigationActive에서 tripRef.current를 직접 전달
// NavigationActive.tsx
onComplete(tripRef.current); // 최신 sentMessages, completedAt 포함

// App.tsx
const handleCompleteTrip = async (latestTrip?: Trip) => {
  const targetTrip = latestTrip || activeTrip; // 파라미터 우선
  const completedTrip = { ...targetTrip, status: 'completed' };
}
```

### 파일
- `src/components/NavigationActive.tsx` - `handleManualExit`
- `src/App.tsx` - `handleCompleteTrip`

---

## 🟡 Rule 5: 포인트 차감 로직

```typescript
// 카카오 알림톡
if (sentDeparture) {
  perPerson = 100; // 출발 + (경유/도착) → 100P/인
} else {
  perPerson = 50;  // 경유 또는 도착만 → 50P/인
}
deduction = perPerson * recipientCount;

// 일반 문자
deduction = recipientCount >= 2 ? 100 : 50;
```

**포인트 저장 경로**: Supabase `point_history` 테이블 (로컬 state X)  
**내역 조회**: `getPointHistory()` → `point_history?user_id=eq.{userId}`

### 파일
- `src/components/NavigationActive.tsx` - `processPayment()`
- `src/App.tsx` - `deductPoints()`
- `src/lib/supabaseUtils.ts` - `handlePointTransaction()`

---

## 🟡 Rule 6: 도착 일시 표시 우선순위

```
completedAt (실제 도착 시각)  ← 1순위
createdAt (예약 생성 시각)    ← 폴백
```

- `TripCompletionModal.tsx` - `completedAtStr` prop 우선
- `NotificationList.tsx` 상세 내역 - `completedAt || createdAt`

---

## 🟡 Rule 7: 이용 일시 = 도착 일시 (completedAt)

상세 이용 내역의 "이용 일시"는 예약 생성 시간(`createdAt`)이 아닌 **실제 도착 시각**(`completedAt`)을 표시해야 한다.

---

## 📋 버전별 주요 수정 이력

| 버전 | 날짜 | 수정 내용 |
|---|---|---|
| v75 | 2026-05-03 | **Rule 12**: 알림 발송 로그(`notification_logs`) 추가 (발송 채널/상태/오류 기록) |
| v75 | 2026-05-03 | **Rule 13**: `NavigationActive.tsx` 리스너 통합 (중복 리스너 제거) |
| v71 | 2026-05-02 | **Rule 8**: `isPaymentProcessedRef` 분리 → processPayment 조기 리턴 버그 해결, 포인트 정상 차감 |
| v71 | 2026-05-02 | **Rule 9**: 예약 전 포인트 잔액 사전 검증 추가 |
| v71 | 2026-05-02 | **Rule 10**: 전화번호 형식 검증 (0으로 시작 10~11자리) |
| v71 | 2026-05-02 | **Rule 11**: 이용약관/FAQ → Capacitor Browser 대신 iframe 인앱 모달 사용 |
| v70 | 2026-05-02 | 이용약관/FAQ Supabase Storage 업로드 (public-docs 버킷) |
| v69 | 2026-05-02 | 즐겨찾기 UX: 완료 내역 ⋮ 메뉴에서 직접 추가/해제 가능 |
| v68 | 2026-05-02 | 예상 비용 표시 정확화: 출발 ON → 100P/인, OFF → 50P/인 |
| v67 | 2026-05-01 | **Rule 1**: `tripRef.current` 직접 업데이트 → sentMessages 누적 정확, 포인트 정상 차감 |
| v66 | 2026-05-01 | **Rule 4**: `handleCompleteTrip(latestTrip)` - 완료 시 최신 trip 데이터 전달 |
| v66 | 2026-05-01 | **Rule 6,7**: 이용 일시 → completedAt 표시 |
| v65 | 2026-04-29 | **Rule 2**: ALIMTALK_TEMPLATES placeholder 형태로 변경 → KKO_3016 해결 |
| v64 | 2026-04-27 | KAKAO_TITLES 템플릿 등록 문구 일치 → KKO_3016 수정 |
| v62 | 2026-04-26 | `kakaoSentNative` 플래그로 중복 발송 방지 |
| v61 | 2026-04-25 | **Rule 3**: title을 top-level로 이동 → ERR_280 해결 |

---

## 🔴 Rule 8: processPayment는 isFinishedRef가 아닌 별도 ref로 중복 방지

### 문제 (v71 이전)
```typescript
// ❌ 잘못된 패턴
const processPayment = async (isCancelled: boolean = false) => {
  if (isFinishedRef.current && !isCancelled) return; // 항상 조기 리턴!
  // handleTripCompletion()에서 isFinishedRef = true 세팅 후 모달 표시
  // → 사용자가 "확인" 클릭 → handleManualExit → processPayment(false) 호출
  // → isFinishedRef.current = true, isCancelled = false → 즉시 리턴 → 차감 0
};
```

**결과**: 운행 완료 후 포인트 차감이 전혀 이루어지지 않음. DB에 내역 없음.

### 해결 (v71~)
```typescript
// ✅ 올바른 패턴: 결제 전용 ref 별도 선언
const isPaymentProcessedRef = useRef(false); // isFinishedRef와 독립

const processPayment = async (isCancelled: boolean = false) => {
  if (isPaymentProcessedRef.current) {
    console.log('💰 [결제] 이미 처리 완료 - 중복 실행 무시');
    return;
  }
  isPaymentProcessedRef.current = true; // 결제 완료 플래그
  // ... 차감 로직
};
```

### 핵심 원칙
> `isFinishedRef` = 운행 완료 모달 표시 여부 (UI 상태)  
> `isPaymentProcessedRef` = 결제 처리 완료 여부 (비즈니스 로직)  
> 두 역할을 **절대 하나의 ref로 혼용하지 말 것**

### 파일
- `src/components/NavigationActive.tsx` - `isPaymentProcessedRef`, `processPayment()`

---

## 🔴 Rule 9: 예약 전 포인트 잔액 사전 검증

### 원칙
```typescript
// NotificationSetup.tsx - handleStartReservation() 초입에서 반드시 검증
const expectedCost = smsMode === 'kakao'
  ? recipientCount * (enableDeparture ? 100 : 50)
  : (recipientCount > 1 ? 100 : 50);

const currentPoints = userProfile?.points ?? 0;
if (currentPoints < expectedCost) {
  setAlertState({ open: true, message: `포인트가 부족합니다.\n\n현재 보유: ${currentPoints}P\n예상 차감: ${expectedCost}P` });
  setIsLoading(false);
  return; // 예약 차단
}
```

**이유**: 포인트 부족 상태에서 예약이 진행되면 발송은 되지만 차감/내역 없이 사용된 것처럼 처리됨.  
예약 시점에 차단해야 사용자 혼란을 방지할 수 있음.

### 예상 비용 계산 공식
```
알림톡: recipientCount × (출발알림 ON ? 100 : 50)
일반문자 1인: 50P
일반문자 2인 이상: 100P
```

### 파일
- `src/components/NotificationSetup.tsx` - `handleStartReservation()`

---

## 🟡 Rule 10: 전화번호 형식 검증 시점과 범위

### 원칙
수신자를 직접 입력(쉼표 구분)했을 때, **숫자로만 구성된 입력에 한해** 형식 검증.  
이름이 포함된 형식(`홍길동 (010-1234-5678)`)은 검증 제외.

```typescript
const phoneRegex = /^0\d{9,10}$/; // 0으로 시작, 총 10~11자리
const invalidManual = manualRecipients.filter(r => {
  const cleanNum = r.replace(/[-\s]/g, ''); // 하이픈·공백 제거
  return /^\d+$/.test(cleanNum) && !phoneRegex.test(cleanNum);
});
if (invalidManual.length > 0) {
  // 경고 후 예약 차단
}
```

### 검증하지 않는 경우
- `selectedContacts`에서 선택된 연락처 (이미 저장된 번호)
- `이름 (010-xxxx-xxxx)` 형식 (연락처 선택 시 자동 생성)

### 파일
- `src/components/NotificationSetup.tsx` - `handleStartReservation()` 내 setTimeout

---

## 🟡 Rule 11: 인앱 문서(이용약관/FAQ) 표시 방법

### ❌ 하지 말 것
```typescript
// Capacitor Browser.open()은 HTML을 raw text로 렌더링하는 경우 있음
await Browser.open({ url: 'https://storage.supabase.co/.../terms.html' });
// → <!DOCTYPE html>... 외계어로 표시됨
```

### ✅ 올바른 방법: 앱 내부 iframe 모달
```tsx
// Capacitor 앱에서 public/ 폴더 파일은 http://localhost/ 로 접근 가능
const [docViewer, setDocViewer] = useState({ open: false, title: '', src: '' });

// 모달 내부
<iframe src="/terms_of_service.html" className="flex-1 w-full border-none" />
```

**이유**: Capacitor WebView는 `public/` 폴더를 `http://localhost`로 서빙함.  
iframe의 `src="/terms_of_service.html"`은 `http://localhost/terms_of_service.html`로 해석되어 정상 렌더링됨.

### 파일
- `src/components/MyPage.tsx` - `docViewer` state, iframe 모달
- `public/terms_of_service.html`, `public/privacy_policy.html`, `public/faq.html`

---

## 🔴 Rule 12: 모든 알림 발송 내역은 notification_logs 테이블에 기록

### 원칙
사용자가 포인트 차감 내역에 의문을 가질 때를 대비하여, Edge Function에서 발송 시도 시 반드시 `notification_logs` 테이블에 기록을 남겨야 한다.

```typescript
// Edge Function 내 saveLog 예시
async function saveLog(payload: {
    type: string, channel: string, recipient: string, 
    status: string, responseRaw: any
}) {
    // 수신번호는 반드시 마스킹 처리하여 저장 (개인정보 보호)
    const masked = payload.recipient.slice(0, 3) + '****' + payload.recipient.slice(-4);
    await supabase.from('notification_logs').insert({ ...payload, recipient: masked });
}
```

### 필수 기록 항목
- `type`: departure / waypoint / arrival
- `channel`: alimtalk / sms / error (대체 발송 여부 확인 가능해야 함)
- `status`: OK / FAIL / REPLACE_SMS 등
- `response_raw`: API 응답 전문 (디버깅용)

### 파일
- `supabase/functions/send-kakao-alimtalk/index.ts`
- `supabase/functions/send-sms/index.ts`
- `supabase/migrations/20260502161046_create_notification_logs.sql`

---

## 🔴 Rule 13: NavigationActive.tsx 리스너 중복 금지

### 문제 (v75 이전)
`setupListener`와 `startBackgroundService` 두 곳에서 각각 `tripNotificationSent` 리스너를 등록하고 있어, 메시지 발송 시 `onUpdate`가 중복 호출되거나 `sentMessages` 상태가 꼬이는 현상이 발생할 수 있음.

### 해결 (v75~)
하나의 통합된 리스너에서 모든 발송 상태를 관리한다.

### 파일
- `src/components/NavigationActive.tsx` - `tripNotificationSent` 리스너 통합 완료
