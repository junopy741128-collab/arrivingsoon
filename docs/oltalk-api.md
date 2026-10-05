# 올톡(Alltalk) 알림톡 API 완전 레퍼런스

> 최종 업데이트: 2026-04-29 (올톡 개발팀 공식 답변 반영)

## 📎 관련 링크

| 항목 | URL |
|------|-----|
| API 전체 문서 | https://atozsoft.notion.site/AllTalk-API-473da5e42c53418a9489c9adea45d0c5 |
| 알림톡 발송 API | https://atozsoft.notion.site/2fd6b8f3452580d09165db065ea0efc7 |
| 올톡 관리자 | https://www.alltalk.co.kr |
| API 엔드포인트 | `POST https://api.alltalk.co.kr/alimTalk/` |

---

## 🔑 인증

```http
POST https://api.alltalk.co.kr/alimTalk/
Content-Type: application/json
apikey: {OLTALK_API_KEY}
```

---

## 📐 API 동작 방식 (핵심)

### Oltalk 서버의 처리 순서

```
1. 앱 → Oltalk API 호출 (message/title에 #{VAR1} placeholder 형태로 전송)
2. Oltalk 서버가 numbers[].VAR1/VAR2/VAR3 값으로 #{VAR1} 등을 자동 치환
3. 치환된 결과를 카카오 서버로 전송
4. 카카오가 등록된 템플릿과 비교하여 일치하면 알림톡 발송
5. 불일치하면 KKO_3016 반환 → alter=true이면 SMS 대체발송
```

### ⚠️ 절대 규칙: message/title은 반드시 placeholder 형태로 전송

```json
✅ 올바른 방법
{
  "message": "#{VAR1}님이 운행중입니다.\n도착 예정 시간에 맞춰 기다려 주세요...",
  "title": " [#{VAR2}]근처",
  "numbers": [{ "hp": "01012345678", "VAR1": "홍길동", "VAR2": "신천교차로", "VAR3": "14" }]
}

❌ 잘못된 방법 (KKO_3016 발생)
{
  "message": "홍길동님이 운행중입니다...",   ← 이미 치환된 값
  "title": "[신천교차로]근처",               ← 이미 치환된 값
}
```

**이유**: Oltalk가 치환한 결과 ↔ 카카오 등록 템플릿 비교 시, 앱에서 미리 치환된 값을 또 치환하면 글자/공백 불일치 → KKO_3016

---

## 📦 Request Body 전체 구조

```json
{
  "service": 2600111981,
  "groupId": "G1000000198",
  "template": "11092",
  "title": " [#{VAR2}]근처",
  "message": "#{VAR1}님이 운행중입니다. \n도착 예정 시간에 맞춰 기다려 주세요.\n\n▶지금 [#{VAR2}]를 지나고 있습니다.\n▶약 [#{VAR3}]분 후 도착합니다.\n\n※ [곧 도착해요]서비스 단계별 알림입니다.",
  "numbers": [
    {
      "hp": "01012345678",
      "VAR1": "홍길동",
      "VAR2": "신천교차로",
      "VAR3": "14"
    }
  ],
  "alter": true
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `service` | number | ✅ | 발신 서비스 번호 (`OLTALK_SERVICE_NO`) |
| `groupId` | string | ✅ | 그룹 ID (`OLTALK_GROUP_ID`) |
| `template` | string | ✅ | 템플릿 코드 (11091/11092/11093) |
| `title` | string | ✅ | 강조 표기형 제목 - **top-level에 위치, placeholder 형태** |
| `message` | string | ✅ | 알림톡 본문 - **등록된 템플릿 본문 그대로 (placeholder 형태)** |
| `numbers` | array | ✅ | 수신자 목록 |
| `numbers[].hp` | string | ✅ | 수신 휴대폰 번호 (숫자만) |
| `numbers[].VAR1~N` | string | ✅ | 치환 변수값 |
| `alter` | boolean | - | `true`이면 알림톡 실패 시 SMS 대체발송 |

---

## 📋 등록된 템플릿 목록

### 11091 - 출발_문자

| 항목 | 내용 |
|------|------|
| 템플릿 코드 | `11091` |
| title (placeholder) | `[#{VAR2}] 출발` |
| VAR 매핑 | VAR1=발송자이름, VAR2=출발지, VAR3=도착지, VAR4=예상소요시간(분) |
| 확인 상태 | ⚠️ 이미지 기준 (Oltalk 공식 확인 필요) |

**message 본문 (placeholder 형태):**
```
#{VAR1}님이 목적지로 출발하였습니다.
도착 예정 시간에 맞춰 기다려 주세요.

▶출발지: #{VAR2}
▶도착지: #{VAR3}
▶예상 소요시간: 약 #{VAR4}분

※ [곧 도착해요] 서비스 단계별 알림입니다.
```

---

### 11092 - 경유지_문자 ✅ Oltalk 공식 확인 (2026-04-29)

| 항목 | 내용 |
|------|------|
| 템플릿 코드 | `11092` |
| title (placeholder) | ` [#{VAR2}]근처` (**앞 공백 1칸 필수!**) |
| templateAdditionalTitle | `곧 도착합니다.` |
| VAR 매핑 | VAR1=발송자이름, VAR2=경유지명, VAR3=남은시간(분) |
| 확인 상태 | ✅ Oltalk 개발팀 공식 확인 |

**message 본문 (Oltalk 공식 확인 내용):**
```
#{VAR1}님이 운행중입니다. 
도착 예정 시간에 맞춰 기다려 주세요.

▶지금 [#{VAR2}]를 지나고 있습니다.
▶약 [#{VAR3}]분 후 도착합니다.

※ [곧 도착해요]서비스 단계별 알림입니다.
```

> ⚠️ 주의: `#{VAR1}님이 운행중입니다. ` 뒤에 **공백 1칸** 있음

---

### 11093 - 도착_문자

| 항목 | 내용 |
|------|------|
| 템플릿 코드 | `11093` |
| title (placeholder) | `[#{VAR2}]부근` (**"도착" 아님!**) |
| VAR 매핑 | VAR1=발송자이름, VAR2=목적지명, VAR3=남은시간(분) |
| 확인 상태 | ⚠️ 이미지 기준 (Oltalk 공식 확인 필요) |

**message 본문 (placeholder 형태):**
```
차량이 목적지에 곧 도착합니다.

▶[#{VAR2}]부근 입니다.
▶약 [#{VAR3}]분 후 도착합니다.

※ [곧 도착해요]서비스 단계별 알림입니다.
```

---

## 🚨 에러 코드

| 코드 | 의미 | 원인 | 해결 방법 |
|------|------|------|----------|
| `ERR_280` | title 필드 누락/위치 오류 | `title`이 `numbers[]` 안에 있거나 없음 | `title`을 requestBody 최상위(top-level)로 이동 |
| `KKO_3016` | 메시지 내용이 템플릿과 불일치 | `message`/`title`을 이미 치환된 값으로 전송 | placeholder 형태(`#{VAR1}`)로 전송 |
| `KKO_3014` | 템플릿 코드 오류 | 존재하지 않는 템플릿 코드 | 올톡 관리자에서 코드 확인 |
| `KKO_3021` | 발신프로필 오류 | 채널 설정 문제 | 올톡 관리자 채널 설정 확인 |

---

## 🔁 발송 흐름

```
[Android 앱]
  └─ TripNotificationService.java (백그라운드)
       └─ sendKakaoAlimtalkNative()
            └─ POST /send-kakao-alimtalk
                 └─ Edge Function (Supabase)
                      └─ ALIMTALK_TEMPLATES[type] 에서 placeholder 형태 본문 선택
                           └─ POST api.alltalk.co.kr/alimTalk/
                                ├─ 성공 → 카카오 알림톡 수신 ✅
                                └─ KKO_3016 → SMS 대체발송 (alter=true)
```

---

## 🌐 Supabase 환경변수

| 키 | 값 예시 | 설명 |
|----|---------|------|
| `OLTALK_API_KEY` | `829c21e...` | API 인증키 (헤더에 포함) |
| `OLTALK_SERVICE_NO` | `2600111981` | 발신 서비스 번호 |
| `OLTALK_GROUP_ID` | `G1000000198` | 그룹 ID |
| `OLTALK_TEMPLATE_DEPARTURE` | `11091` | 출발 템플릿 코드 |
| `OLTALK_TEMPLATE_WAYPOINT` | `11092` | 경유지 템플릿 코드 |
| `OLTALK_TEMPLATE_ARRIVAL` | `11093` | 도착 템플릿 코드 |

---

## 📂 관련 소스 파일

| 파일 | 역할 |
|------|------|
| `supabase/functions/send-kakao-alimtalk/index.ts` | Edge Function - 올톡 API 호출 |
| `android/.../TripNotificationService.java` | 네이티브 백그라운드 서비스 |
| `src/plugins/TripNotificationPlugin.ts` | Capacitor 브릿지 (JS 인터페이스) |
| `src/App.tsx` | `ALIMTALK_TEMPLATES`, `KAKAO_TITLES` 정의 |

---

## 📅 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-29 | **KKO_3016 근본 해결**: `message`/`title` placeholder 형태로 변경, Edge Function에 `ALIMTALK_TEMPLATES` 정의 |
| 2026-04-29 | Oltalk 개발팀 공식 답변 수령: 11092 정확한 본문 확인 |
| 2026-04-27 | `KAKAO_TITLES` 수정: `title` 값을 등록 템플릿과 일치시킴 |
| 2026-04-27 | **ERR_280 해결**: `title` 필드를 `numbers[]` 안에서 top-level로 이동 |
| 2026-04-26 | Broadcast Intent에 `title`, `var1~var4` 추가, `kakaoSentNative` 플래그로 중복 발송 방지 |

---

## ✅ 체크리스트 (알림톡 발송 문제 발생 시)

- [ ] `message` 필드가 placeholder 형태(`#{VAR1}`)인가? (치환된 값이면 KKO_3016)
- [ ] `title` 필드가 placeholder 형태인가? 앞 공백 포함 여부 확인
- [ ] `title`이 `numbers[]` 안이 아닌 requestBody 최상위에 있는가? (아니면 ERR_280)
- [ ] `numbers[].hp`에 숫자만 포함된 전화번호가 있는가?
- [ ] `service`, `groupId`, `template`, `apikey` 헤더 모두 있는가?
- [ ] Supabase Edge Function 로그에서 `[올톡/요청 바디]` 확인
- [ ] 올톡 관리자에서 템플릿 승인 상태 확인
