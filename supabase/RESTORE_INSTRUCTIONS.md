# Supabase 프로젝트 복구 가이드

Supabase 프로젝트가 초기화되었을 때, 다음 단계를 따라 백엔드를 복구하세요.

## 1. 새 프로젝트 생성 및 연결
1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트를 생성합니다.
2. 프로젝트가 생성되면 `Project Settings > API`에서 `URL`과 `anon public key`를 복사합니다.
3. 프로젝트 루트의 `.env` 파일을 열고 값을 업데이트합니다:
   ```env
   VITE_SUPABASE_URL=새_URL
   VITE_SUPABASE_ANON_KEY=새_ANON_KEY
   ```

## 2. 데이터베이스 테이블 및 정책 생성
1. Supabase Dashboard의 **SQL Editor**로 이동합니다.
2. `supabase/schema_dump.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣습니다.
3. **Run** 버튼을 클릭하여 테이블과 권한 정책(RLS)을 생성합니다.

## 3. 인증(Authentication) 설정
1. **Authentication > Providers**로 이동합니다.
2. **Google** Provider를 활성화합니다.
   - **Client ID**와 **Client Secret**을 Google Cloud Console에서 가져와 입력합니다.
   - 필요하다면 Email Provider도 활성화되어 있는지 확인합니다 (기본값: 켜짐).
3. **Authentication > URL Configuration**으로 이동합니다.
   - **Site URL**: `http://localhost:5173` (개발용)
   - **Redirect URLs**:
     - `http://localhost:5173`
     - `com.example.ans://login-callback` (앱 딥링크용)

## 4. Edge Functions 배포 (선택 사항)
프로젝트에 Edge Function(`naver-direction`, `send-arrival-alert`, `send-sms`)이 포함되어 있습니다. 이를 사용하려면 CLI 로그인 및 배포가 필요합니다.

1. **Supabase 로그인**:
   ```bash
   npx supabase login
   ```
2. **프로젝트 연결**:
   ```bash
   npx supabase link --project-ref <새_프로젝트_ID>
   ```
   (프로젝트 ID는 `https://supabase.com/dashboard/project/<프로젝트ID>` URL에서 확인 가능)

3. **환경 변수(Secrets) 설정**:
   다음 명령어로 환경 변수를 설정합니다. (`<값>` 부분은 실제 값으로 변경하세요)
   ```bash
   npx supabase secrets set --env-file .env.local
   ```
   또는 대시보드에서 직접 설정할 수도 있습니다. 필요한 키들은 다음과 같습니다:
   * **naver-direction**:
     * `NAVER_CLIENT_ID`
     * `NAVER_CLIENT_SECRET`
   * **send-arrival-alert** / **send-sms**:
     * `SOLAPI_API_KEY`
     * `SOLAPI_API_SECRET` (또는 `SOLAPI_SECRET_KEY`)
     * `SENDER_PHONE` (또는 `SOLAPI_FROM`)

4. **함수 배포**:
   ```bash
   npx supabase functions deploy naver-direction
   npx supabase functions deploy send-arrival-alert
   npx supabase functions deploy send-sms
   ```

## 5. 완료
이제 앱을 다시 실행하여 정상적으로 작동하는지 확인합니다.
```bash
npm run dev
```
