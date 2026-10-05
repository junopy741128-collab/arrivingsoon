// supabase/functions/send-sms/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "node:crypto"

// ── 수신번호 마스킹 ──────────────────────────────────────────────────
function maskPhone(phone: string): string {
    if (phone.length >= 10) {
        return phone.slice(0, 3) + '****' + phone.slice(-4)
    }
    return '***'
}

// ── Supabase DB에 로그 저장 ──────────────────────────────────────────
async function saveLog(payload: {
    type: string
    channel: string
    recipient: string
    templateCode?: string
    responseRaw: unknown
    status: string
    errorMessage?: string
}) {
    const supabaseUrl  = Deno.env.get('SUPABASE_URL')
    const serviceRole  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRole) return

    try {
        await fetch(`${supabaseUrl}/rest/v1/notification_logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceRole,
                'Authorization': `Bearer ${serviceRole}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                type: payload.type,
                channel: payload.channel,
                recipient: maskPhone(payload.recipient),
                template_code: payload.templateCode || 'SOLAPI_SMS',
                response_raw: payload.responseRaw,
                status: payload.status,
                error_message: payload.errorMessage || null,
            })
        })
    } catch (e) {
        console.warn('[로그 저장 실패]', e)
    }
}


serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const { phone, type } = body


        // 환경변수 가져오기 (유연한 네이밍 지원)
        const apiKey = Deno.env.get('SOLAPI_API_KEY')
        const apiSecret = Deno.env.get('SOLAPI_SECRET_KEY') || Deno.env.get('SOLAPI_API_SECRET')
        const fromNumber = Deno.env.get('SOLAPI_FROM') || Deno.env.get('SENDER_PHONE')

        if (!apiKey || !apiSecret || !fromNumber) {
            throw new Error('Supabase Secrets 설정이 누락되었습니다 (API Key, Secret, 또는 발신번호).')
        }

        const date = new Date().toISOString()
        const salt = crypto.randomUUID().replace(/-/g, '')
        const signature = createHmac('sha256', apiSecret)
            .update(date + salt)
            .digest('hex')

        const authHeader = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`

        console.log(`[SMS 전송 시도] To: ${phone}, From: ${fromNumber}`);

        const res = await fetch('https://api.solapi.com/messages/v4/send', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: {
                    to: phone,
                    from: fromNumber,
                    text: `[곧 도착해요] 기사님이 약 5~10분 뒤 도착 예정입니다.`
                }
            })
        })

        const data = await res.json()

        if (!res.ok) {
            console.error("[Solapi SMS 실패]:", JSON.stringify(data))
            throw new Error(data.errorMessage || `Solapi Error: ${res.statusText}`)
        }

        console.log(`[Solapi SMS 성공]:`, data.status);

        // 로그 저장
        await saveLog({
            type: type || 'arrival',
            channel: 'sms',
            recipient: phone,
            responseRaw: data,
            status: 'OK',
        })


        return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error("[Internal SMS Error]:", error.message);
        
        // 오류 로그 저장 (가능한 경우)
        try {
            const body = await req.clone().json().catch(() => ({}));
            await saveLog({
                type: body.type || 'unknown',
                channel: 'error',
                recipient: body.phone || 'unknown',
                responseRaw: { error: error.message },
                status: 'FAIL',
                errorMessage: error.message,
            })
        } catch (e) {}

        return new Response(JSON.stringify({ error: error.message }), {

            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
