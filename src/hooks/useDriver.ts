import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Driver {
    id: string;
    name: string;
    vehicle_number: string;
    phone_number: string;
}

export function useDriver() {
    const [driver, setDriver] = useState<Driver | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDriver() {
            try {
                setLoading(true);
                // 현재 로그인한 사용자 세션 가져오기
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (!session?.user) {
                    // 로그인하지 않은 경우 처리 (또는 테스트용 더미 데이터 로직 추가 가능)
                    console.log("No active session found.");
                    setLoading(false);
                    return;
                }

                // drivers 테이블에서 사용자 ID로 정보 조회
                const { data, error: driverError } = await supabase
                    .from('drivers')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (driverError) throw driverError;

                setDriver(data);
            } catch (err: any) {
                console.error('Error fetching driver:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchDriver();
    }, []);

    return { driver, loading, error };
}
