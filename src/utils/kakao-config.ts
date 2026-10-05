// Kakao API Configuration
export const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
export const KAKAO_JAVASCRIPT_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

// Kakao API Endpoints (Direct usage deprecated due to CORS)
// Use Supabase Proxy 'kakao-proxy' instead.
export const KAKAO_LOCAL_API_URL = 'https://dapi.kakao.com/v2/local'; // Kept for reference, but check usages!
export const KAKAO_DIRECTIONS_API_URL = 'https://apis-navi.kakaomobility.com/v1/directions';

// Validate API keys
if (!KAKAO_REST_API_KEY) {
    console.error('VITE_KAKAO_REST_API_KEY is not defined in .env file');
}

if (!KAKAO_JAVASCRIPT_KEY) {
    console.error('VITE_KAKAO_JAVASCRIPT_KEY is not defined in .env file');
}
