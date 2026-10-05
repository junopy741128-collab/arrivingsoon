// supabase/functions/list-solapi-templates/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "node:crypto"

serve(async (req: Request) => {
    // CORS 설정
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 환경변수 가져오기
        const apiKey = Deno.env.get('SOLAPI_API_KEY')
        const apiSecret = Deno.env.get('SOLAPI_SECRET_KEY') || Deno.env.get('SOLAPI_API_SECRET')
        const pfId = Deno.env.get('SOLAPI_PF_ID')

        if (!apiKey || !apiSecret || !pfId) {
            throw new Error('필수 환경변수가 누락되었습니다 (SOLAPI_API_KEY, SECRET_KEY, PF_ID)')
        }

        // Solapi 인증 서명 만들기
        const date = new Date().toISOString()
        const salt = crypto.randomUUID().replace(/-/g, '')
        const signature = createHmac('sha256', apiSecret)
            .update(date + salt)
            .digest('hex')

        const authHeader = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`

        // 솔라피 템플릿 목록 조회
        const res = await fetch(`https://api.solapi.com/kakao/v1/templates?pfId=${pfId}&limit=100`, {
            headers: {
                'Authorization': authHeader
            }
        })

        const data = await res.json()
        
        if (!res.ok) {
            console.error('[조회실패]', JSON.stringify(data));
            return new Response(JSON.stringify({ success: false, data }), { status: res.status, headers: corsHeaders })
        }

        // [진단 로그] 모든 템플릿의 상세 정보 출력 (강조형 확인용)
        console.log(`=== [솔라피 템플릿 상세 조회 결과] ===`);
        if (data.templateList && Array.isArray(data.templateList)) {
            data.templateList.forEach((tpl: any) => {
                console.log(`[TEMPLATE DEBUG]: ${JSON.stringify(tpl)}`);
                console.log(`-----------------------------------`);
            });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            count: data.templateList?.length || 0,
            templates: data.templateList // [V_FIX] 모든 필드(title 포함) 그대로 반환
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[조회오류]', errorMessage);
        return new Response(JSON.stringify({ success: false, error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
