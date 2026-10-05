import { supabase } from '../lib/supabaseClient';



export interface NaverRouteResult {
    distance: number; // meters
    duration: number; // milliseconds
    path?: [number, number][]; // [lng, lat] array
}

// Naver Directions 5 API (Driving) - Supabase Edge Function을 통해 호출
export async function getRouteInfoNaver(originLat: number, originLng: number, destLat: number, destLng: number): Promise<NaverRouteResult | null> {
    // 키 체크 로직 제거: Supabase Edge Function에서 서버 측 키를 사용하므로 클라이언트에는 키가 없어도 됩니다.

    try {
        const start = `${originLng},${originLat}`;
        const goal = `${destLng},${destLat}`;

        console.log(`[Naver] Calling via Supabase Edge Function: start=${start}, goal=${goal}`);

        // Supabase Edge Function을 통해 Naver API 호출 (CORS 에러 방지)
        const { data, error } = await supabase.functions.invoke('naver-direction', {
            body: { start, goal }
        });

        if (error) {
            console.error(`[Naver] Supabase Function Error:`, error);
            return null;
        }

        if (!data) {
            console.error('[Naver] No data returned from Supabase function');
            return null;
        }

        // 에러 응답 체크
        if (data.error || data.code === -1) {
            console.error('[Naver] API Error:', data.error || 'Unknown error');
            return null;
        }

        // 정상 응답 처리
        if (data.code === 0 && data.route && data.route.traoptimal && data.route.traoptimal.length > 0) {
            const summary = data.route.traoptimal[0].summary;
            console.log(`[Naver] Route Found: ${summary.distance}m, ${summary.duration}ms`);

            return {
                distance: summary.distance, // meters
                duration: summary.duration, // milliseconds
                path: data.route.traoptimal[0].path // coordinates
            };
        } else {
            console.warn('[Naver] No route found or API error', data);
            return null;
        }

    } catch (error) {
        console.error('[Naver] Exception:', error);
        return null;
    }
}
