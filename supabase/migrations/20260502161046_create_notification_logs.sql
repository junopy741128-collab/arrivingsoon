-- 알림톡/SMS 발송 로그 테이블
create table if not exists public.notification_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  type text not null,                        -- 'departure' | 'waypoint' | 'arrival'
  channel text not null default 'unknown',   -- 'alimtalk' | 'sms' | 'error'
  recipient text,                            -- 수신번호 (마스킹)
  template_code text,                        -- 올톡 템플릿 코드
  var1 text, var2 text, var3 text, var4 text,
  response_raw jsonb,                        -- 올톡 API 전체 응답
  status text,                               -- 'OK' | 'FAIL' | 'REPLACE_SMS' 등
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 인덱스
create index if not exists notification_logs_created_at_idx
  on public.notification_logs(created_at desc);

create index if not exists notification_logs_user_id_idx
  on public.notification_logs(user_id);

-- RLS: 관리자만 전체 조회 가능 (service_role), 본인 로그는 본인만
alter table public.notification_logs enable row level security;

-- 기존 정책 삭제 후 재생성 (중복 방지)
drop policy if exists "Users can view own notification logs" on public.notification_logs;

-- 사용자 본인 로그 조회
create policy "Users can view own notification logs"
  on public.notification_logs for select
  using (auth.uid() = user_id);
