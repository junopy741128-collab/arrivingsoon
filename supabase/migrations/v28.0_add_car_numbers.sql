-- v28.0: 마이페이지 차량 번호 등록 및 포인트 불러오기 에러 해결을 위한 컬럼 추가
-- 
-- 원인: App.tsx에서 profiles 테이블의 car_number_1, car_number_2, car_number_3, use_car_number 컬럼을 
--       함께 조회(select)하려고 하지만 데이터베이스에 해당 컬럼들이 없어서 쿼리 전체가 실패하고 
--       결과적으로 포인트가 0으로 표시되는 현상 발생.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS car_number_1 TEXT,
ADD COLUMN IF NOT EXISTS car_number_2 TEXT,
ADD COLUMN IF NOT EXISTS car_number_3 TEXT,
ADD COLUMN IF NOT EXISTS use_car_number BOOLEAN DEFAULT FALSE;

-- 기존 profiles 테이블이 이미 있는 경우에도 위 쿼리를 실행하면 컬럼이 추가됩니다.
-- Supabase SQL Editor에서 이 코드를 실행해 주세요.
