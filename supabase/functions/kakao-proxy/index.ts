// Supabase Edge Function: Kakao API Proxy
// CORS 에러 방지를 위해 카카오 API 호출을 중계합니다.

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // 1. CORS Preflight 처리
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        console.log(`[Kakao Proxy] Request: ${req.method} ${url.pathname}`)

        // 2. 요청 파라미터 파싱
        const { endpoint, params, method = 'GET' } = await req.json()

        if (!endpoint) {
            throw new Error('Endpoint is required (e.g., "/v2/local/search/keyword.json")')
        }

        // 3. 카카오 API 키 확인 (Supabase 환경변수)
        // 주의: KAKAO_REST_API_KEY는 Supabase Dashboard > Settings > Edge Functions 또는 Vault에 설정되어 있어야 합니다.
        // @ts-ignore
        const KAKAO_API_KEY = Deno.env.get('KAKAO_REST_API_KEY')
        if (!KAKAO_API_KEY) {
            throw new Error('KAKAO_REST_API_KEY is not configured in Supabase Edge Functions')
        }

        // 4. 대상 URL 구성
        // endpoint 예: "/v2/local/search/keyword.json" 또는 "https://dapi.kakao.com/..."
        let targetUrl = ''
        if (endpoint.startsWith('http')) {
            targetUrl = endpoint
        } else {
            // 기본적으로 dapi.kakao.com 사용, 네비게이션용은 apis-navi.kakaomobility.com 등 분기 필요
            if (endpoint.includes('directions')) {
                // 네비게이션 API (예: https://apis-navi.kakaomobility.com/v1/directions)
                targetUrl = `https://apis-navi.kakaomobility.com${endpoint}`
            } else {
                // 로컬 API (예: https://dapi.kakao.com/v2/local/...)
                targetUrl = `https://dapi.kakao.com${endpoint}`
            }
        }

        // 쿼리 파라미터 추가
        if (params) {
            const queryParams = new URLSearchParams(params).toString()
            targetUrl += `?${queryParams}`
        }

        console.log(`[Kakao Proxy] Forwarding to: ${targetUrl}`)

        // 5. 카카오 서버로 요청 전달
        const response = await fetch(targetUrl, {
            method: method,
            headers: {
                'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`[Kakao Proxy] Upstream Error: ${response.status} - ${errorText}`)
            return new Response(
                JSON.stringify({ error: `Kakao API Error: ${response.status}`, details: errorText }),
                {
                    status: response.status,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        const data = await response.json()

        // 6. 결과 반환
        return new Response(
            JSON.stringify(data),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error: any) {
        console.error('[Kakao Proxy] Internal Error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
