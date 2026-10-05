# 곧 도착해요 - 핵심 기능 및 규칙 문서
> 마지막 업데이트: 2026-03-26

---

## 1. 운행 생명주기 (Trip Lifecycle)

```
[예약 생성] → [대기 중(waiting)] → [출발 감지(active)] → [도착 감지] → [완료 모달] → [종료]
```

### 절대 규칙
- **모든 종료는 사용자가 완료 모달의 '확인'을 클릭했을 때만** 처리됨
- 자동 종료 절대 금지 (Native 서비스가 완료해도 JS 모달 확인 전까지 종료 아님)
- `onComplete()` 호출 → `handleManualExit()`에서만 허용

---

## 2. SmartStart (출발 자동 감지)

### 출발 감지 조건 (모두 만족해야 함)
| 조건 | 값 | 이유 |
|------|-----|------|
| 대기 모드(`isWaitingMode=true`) | - | 이미 출발한 경우 재감지 방지 |
| 서비스 시작 후 경과 시간 | > 30초 | 앱 켜자마자 오발송 방지 |
| 출발지로부터 이동 거리 | > 300m | 실제 이동 여부 확인 |
| 현재 이동 속도 | > 10 km/h | GPS 노이즈(5km/h) 차단 |

### ⚠️ 주의사항
- `startLat`, `startLng`가 0,0이면 SmartStart가 아예 동작하지 않음
  - **자동 보정(AutoFix)**: 서비스가 0,0으로 시작되면 첫 GPS 수신 위치로 자동 초기화
- SmartStart 발동 직후 **같은 GPS 사이클에서는 경유지 체크 생략** (`justActivated` 플래그)
  - 이유: 초기 `estimatedTime`이 stale하여 경유지 시간이 잘못 표시되는 버그 방지

---

## 3. 문자 발송 로직

### 발송 순서
1. **출발 문자** → SmartStart 감지 시 (`enableDeparture=true`일 때만)
2. **경유지 문자** → 경유지 300m 이내 진입 시
3. **도착 문자** → 경유지 문자가 없었을 때만 발송 (경유지 발송 시 생략)

### 도착 문자 발송 조건 (중요)
```
경유지 문자 발송 성공 → 도착 문자 생략 (중복 방지)
경유지 없음 or 실패  → 도착 문자 발송
makTripCompleted()   → 항상 호출 (완료 모달 필수)
```
> ⚠️ markTripCompleted()를 도착 문자 조건 안에 넣으면 안 됨. 경유지 발송 후 운행이 끝나지 않는 버그 발생!

### 문자 내용 (템플릿 변수)
| 변수 | 치환 내용 |
|------|----------|
| `{출발지}` | startPoint의 마지막 행정구역 (예: 청담동) |
| `{경유지}` | 경유지 이름 |
| `{도착지}` | 목적지 이름 |
| `{남은시간}` | API 기준 예상 남은 분 수 |

### ⚠️ 주요 규칙
- **출발 문자**: `enableDeparture` 토글 ON일 때만 발송
  - JS → Plugin → Intent → Service 순서로 전달됨
  - `trip.enableDeparture` 값이 `tripData`에 반드시 포함되어야 함
  - Service는 `intent.getBooleanExtra("enableDeparture", true)` 우선 사용
- **경유지 문자**: 경유지 통과 후 `reservationSmsSent = true` 처리
- **도착 문자**: `reservationSmsSent=false`일 때만 발송
- **`markTripCompleted()`**: 경유지 여부와 무관하게 **항상 호출** (완료 모달 표시)
- **중복 발송 방지**: `departureSmsSent`, `isArrivalSmsSent`, `wp.sent` 플래그로 1회만 발송

---

## 4. 도착 판정 로직

### 이중 체크 방식
```java
// API 경로 거리 OR GPS 직선 거리 중 하나라도 조건 충족 시 도착 처리
isNearByApi      = distKm < 0.5f;          // 카카오 API 경로 거리 500m 이내
isNearByStraight = straightToDestM < 200f; // GPS 직선 거리 200m 이내
```

### 이유
- 카카오 API는 **경로 거리** 반환 → 목적지 코앞에서도 150m 남았다고 나올 수 있음
- GPS 직선 200m 조건으로 보완

---

## 5. 운행 완료 처리 (`markTripCompleted`)

### Native → JS 전달 흐름
```
markTripCompleted() [Java]
  → SharedPrefs: trip_completed=true, trip_active=false
  → sendBroadcast("completed")
  → Plugin 수신 → notifyListeners("tripStateUpdate", {status:"completed"})
  → NavigationActive.tsx → handleTripCompletion() → 완료 모달 표시
  → 3초 후 서비스 자동 종료 (stopSelf)
```

### 앱 재시작 후 완료 감지
- `checkCurrentStatus()`는 **SharedPrefs의 `trip_completed`를 먼저 확인**
- `trip_completed=true`이면 JS에 `status:"completed"` 반환 → 모달 표시
- (이전 버그: 항상 "stopped" 반환 → 모달 안 보임)

---

## 6. 포인트 차감 규칙

### 차감 시점
- **운행 완료 모달에서 사용자가 '확인' 클릭 시만** 차감 (후불제)
- 문자 발송 시 즉시 차감 ❌

### 차감 금액
| 모드 | 차감 포인트 |
|------|------------|
| `sms_single` (1인 SMS) | 50P |
| `sms_multi` (다인 SMS) | 100P |
| `kakao` (카카오 알림톡) | 50P + 수신자수 × 50P |

---

## 7. 새 예약 차단 조건

### 차단하는 경우 (실제 운행 중)
```typescript
activeTrip.status === 'waiting' || 'active' || 'planning'
```

### 차단하지 않는 경우 (완료/취소된 이전 예약)
```typescript
activeTrip.status === 'completed' || 'cancelled'
```

### Native 서비스 상태 확인
- 서비스가 실행 중이어도 `trip_completed=true`이면 → 정리 후 새 예약 허용

---

## 8. Native Service 시작 데이터 흐름

```
App.tsx handleCreateTrip()
  → TripNotification.startNotification({ tripData })
    → TripNotificationPlugin.java startNotification()
      → Intent에 포함되는 데이터:
        - destination, recipient, destLat/Lng
        - startLat/Lng (※ 0이면 AutoFix로 첫 GPS 위치 사용)
        - startPoint (출발지 이름)
        - initialStatus (waiting/active)
        - waypoints (JSON)
        - departureMessage, waypointMessage, arrivalMessage (템플릿)
        - enableDeparture (출발 알림 ON/OFF) ← JS 토글값 직접 전달
        - smsMode (sms_single/sms_multi/kakao)
```

### enableDeparture 전달 경로
```
NotificationSetup.tsx 토글 → trip.enableDeparture
  → pluginData = { ...trip }  → tripData.enableDeparture
    → Plugin: intent.putExtra("enableDeparture", boolean)
      → Service: intent.getBooleanExtra("enableDeparture", true)
        → sendDepartureSms() 내부에서 체크
```
> ⚠️ 이 경로가 끊기면 토글이 무시되고 항상 출발 문자 발송됨

---

## 9. 로그 확인 방법

```powershell
# ADB 경로
$adb = "C:\Users\NOBLAND\AppData\Local\Android\Sdk\platform-tools\adb.exe"

# Blackbox 로그 (운행 기록)
& $adb shell "run-as com.soon.arrival cat files/trip_box.log"

# 실시간 로그
& $adb logcat -s "TripNotificationService" "Blackbox" "TripPlugin" "TripCheck"
```

---

## 10. ⚠️ 수정 시 절대 건드리지 말아야 할 것

1. **`handleManualExit`의 호출 경로** - 반드시 사용자 '확인' 클릭에서만
2. **`isFinishedRef.current` 잠금** - 중복 완료 처리 방지용, 함부로 초기화 금지
3. **`markTripCompleted()` 호출 보장** - 도착 조건 충족 시 반드시 호출 (도착 문자 조건 if 문 밖에 위치)
4. **`trip_completed` SharedPrefs** - 서비스 재시작 좀비 방지용, 새 예약 시 반드시 `false`로 초기화
5. **SmartStart의 `justActivated` 플래그** - 제거 시 경유지 시간 오류 재발
6. **`enableDeparture` Intent 전달** - Plugin에서 반드시 `intent.putExtra("enableDeparture", ...)` 유지
7. **`checkCurrentStatus()` completed 반환** - SharedPrefs 확인 로직 제거 시 앱 재시작 후 완료 모달 안 뜸

---

## 11. 기본 문자 템플릿 (기본값)

| 종류 | 내용 |
|------|------|
| 출발 | `#{발송자}님이 등록하신 도착 알림 서비스가 시작되었습니다.\n\n‧출발지: #{출발지}\n‧도착지: #{도착지}\n‧예상 소요시간: 약 #{남은시간}분\n\n(수신자님의 차량 도착 알림 서비스 신청에 따른 단계별 알림입니다.)` |
| 경유지 | `‧#{발송자}님이 운행중 입니다.\n\n‧차량이 #{경유지} 근처를 지나고 있습니다.\n‧약 #{남은시간}분 후 도착합니다.\n\n(수신자님의 차량 도착 알림 서비스 신청에 따른 단계별 알림입니다.)` |
| 도착 | `#{발송자}님이 등록하신 도착 알림입니다. 약 #{남은시간}분 이내 도착합니다. (수신자님의 차량 도착 알림 서비스 신청에 따른 단계별 알림입니다.)` |

> **카카오 알림톡 필수 고지:** 다중 발송(출발/경유/도착) 시 수신자가 알림 신청에 의해 단계별로 발송됨을 인지할 수 있도록 괄호안의 고정 문구가 템플릿에 반드시 포함되어야 검수 통과 가능.

> 앱 설정 → 문자 템플릿 관리에서 변경 가능
