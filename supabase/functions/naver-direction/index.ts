// Supabase Edge Function: Naver Direction API Proxy
// CORS 에러 방지를 위해 Naver API를 프록시합니다

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. 앱에서 보낸 출발지(start), 도착지(goal) 정보를 받습니다
        const { start, goal } = await req.json()

        if (!start || !goal) {
            throw new Error('start and goal parameters are required')
        }

        // 2. Naver API 키 (Supabase 환경변수에서 가져옴)
        const CLIENT_ID = Deno.env.get('NAVER_CLIENT_ID')
        const CLIENT_SECRET = Deno.env.get('NAVER_CLIENT_SECRET')

        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new Error('Naver API credentials not configured')
        }

        // 3. Naver 서버로 대신 요청을 보냅니다
        const naverUrl = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${start}&goal=${goal}&option=traoptimal`

        console.log(`[Naver Proxy] Requesting: ${naverUrl}`)

        const response = await fetch(naverUrl, {
            method: 'GET',
            headers: {
                'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
                'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`[Naver Proxy] Error: ${response.status} - ${errorText}`)
            throw new Error(`Naver API error: ${response.status}`)
        }

        const data = await response.json()
        console.log(`[Naver Proxy] Success: ${JSON.stringify(data).substring(0, 100)}...`)

        // 4. 결과를 앱으로 다시 돌려줍니다
        return new Response(
            JSON.stringify(data),
            {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            },
        )
    } catch (error) {
        console.error('[Naver Proxy] Exception:', error)
        return new Response(
            JSON.stringify({
                error: error.message || 'Unknown error',
                code: -1
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            },
        )
    }
})
