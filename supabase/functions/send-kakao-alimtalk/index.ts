// supabase/functions/send-kakao-alimtalk/index.ts
// ══════════════════════════════════════════════════════════
// [올톡(AllTalk) 알림톡 연동]
// 공식 API 문서: https://atozsoft.notion.site/AllTalk-API-473da5e42c53418a9489c9adea45d0c5
// 알림톡 발송 API: https://atozsoft.notion.site/2fd6b8f3452580d09165db065ea0efc7
// 상세 레퍼런스: /docs/oltalk-api.md
//
// ⚠️ 핵심 규칙 (어기면 에러 발생):
//   1. [ERR_280] `title` 필드는 반드시 requestBody 최상위(top-level)에 위치해야 함
//              `numbers` 배열 안에 넣으면 안 됨
//   2. [KKO_3016] `title` 값은 카카오에 등록된 템플릿 title과 정확히 일치해야 함
//              (공백 한 칸 차이도 에러 발생, SMS 대체발송으로 전환됨)
//
// 현재 등록 템플릿:
//   11091 출발:  title = "[#{VAR2}] 출발"  (공백 있음!)
//   11092 경유지: title = "[#{VAR2}]근처"
//   11093 도착:  title = "[#{VAR2}]부근"  ("도착" 아님!)
//
// 변수 매핑:
//   departure  → VAR1=발송자, VAR2=출발지(목적지), VAR3=도착지, VAR4=남은시간
//   waypoint   → VAR1=발송자, VAR2=경유지, VAR3=남은시간
//   arrival    → VAR1=발송자, VAR2=목적지, VAR3=남은시간
// ══════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    templateCode: string
    var1?: string; var2?: string; var3?: string; var4?: string
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
                template_code: payload.templateCode,
                var1: payload.var1 || null,
                var2: payload.var2 || null,
                var3: payload.var3 || null,
                var4: payload.var4 || null,
                response_raw: payload.responseRaw,
                status: payload.status,
                error_message: payload.errorMessage || null,
            })
        })
    } catch (e) {
        console.warn('[로그 저장 실패]', e)
    }
}

// ══════════════════════════════════════════════════════════
// [KKO_3016 Fix - 2026-04-29] 올톡 답변 기준
// message/title은 반드시 #{VAR1} placeholder 형태로 전송해야 함
// 직접 치환된 값을 보내면 Oltalk 서버의 치환 결과와 글자/공백 차이로 KKO_3016 발생
// Oltalk 서버가 numbers[].VAR1/VAR2/VAR3 값으로 자동 치환하여 카카오에 전송함
// ══════════════════════════════════════════════════════════
const ALIMTALK_TEMPLATES: Record<string, { message: string; title: string }> = {
    // 11092 경유지: Oltalk 공식 확인 (2026-04-29)
    waypoint: {
        message: `#{VAR1}님이 운행중입니다. \n도착 예정 시간에 맞춰 기다려 주세요.\n\n▶지금 [#{VAR2}]를 지나고 있습니다.\n▶약 [#{VAR3}]분 후 도착합니다.\n\n※ [곧 도착해요]서비스 단계별 알림입니다.`,
        title: ` [#{VAR2}]근처`,   // 앞 공백 1칸 필수! (Oltalk 공식 확인)
    },
    // 11093 도착: 템플릿 이미지 기준 (Oltalk에 정확한 본문 추가 확인 권장)
    arrival: {
        message: `차량이 목적지에 곧 도착합니다.\n\n▶[#{VAR2}]부근 입니다.\n▶약 [#{VAR3}]분 후 도착합니다.\n\n※ [곧 도착해요]서비스 단계별 알림입니다.`,
        title: `[#{VAR2}]부근`,
    },
    // 11091 출발: 템플릿 이미지 기준 (Oltalk에 정확한 본문 추가 확인 권장)
    departure: {
        message: `#{VAR1}님이 목적지로 출발하였습니다.\n도착 예정 시간에 맞춰 기다려 주세요.\n\n▶출발지: #{VAR2}\n▶도착지: #{VAR3}\n▶예상 소요시간: 약 #{VAR4}분\n\n※ [곧 도착해요] 서비스 단계별 알림입니다.`,
        title: `[#{VAR2}] 출발`,
    },
}

serve(async (req: Request) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const { recipient, message, type, title, var1, var2, var3, var4 } = body

        console.log(`[올톡/수신] type=${type}, recipient=${recipient}`)
        console.log(`[올톡/변수] title=${title}, VAR1=${var1}, VAR2=${var2}, VAR3=${var3}, VAR4=${var4}`)

        // 올톡 환경변수
        const apiKey    = Deno.env.get('OLTALK_API_KEY')
        const serviceNo = Deno.env.get('OLTALK_SERVICE_NO')
        const groupId   = Deno.env.get('OLTALK_GROUP_ID')

        // 타입별 템플릿 코드
        let templateCode = ''
        if (type === 'waypoint') {
            templateCode = Deno.env.get('OLTALK_TEMPLATE_WAYPOINT') || ''
        } else if (type === 'arrival') {
            templateCode = Deno.env.get('OLTALK_TEMPLATE_ARRIVAL') || ''
        } else {
            templateCode = Deno.env.get('OLTALK_TEMPLATE_DEPARTURE') || ''
        }

        if (!apiKey || !serviceNo || !groupId || !templateCode) {
            const missing = [
                !apiKey && 'OLTALK_API_KEY',
                !serviceNo && 'OLTALK_SERVICE_NO',
                !groupId && 'OLTALK_GROUP_ID',
                !templateCode && `OLTALK_TEMPLATE_${(type || 'departure').toUpperCase()}`,
            ].filter(Boolean).join(', ')
            console.error(`[오류] 누락된 환경변수: ${missing}`)

            // 환경변수 오류 로그
            await saveLog({
                type: type || 'unknown',
                channel: 'error',
                recipient: recipient || '',
                templateCode: templateCode,
                var1, var2, var3, var4,
                responseRaw: { missing },
                status: 'ENV_MISSING',
                errorMessage: `환경변수 누락: ${missing}`,
            })

            throw new Error(`환경변수 누락: ${missing}`)
        }

        // 수신자 목록 파싱
        const recipientList = recipient.split(',').map((r: string) => r.trim()).filter(Boolean)
        const results = []
        const numbersArr = []

        for (const [index, target] of recipientList.entries()) {
            const cleanNumber = target.replace(/[^0-9]/g, '')
            if (cleanNumber.length < 10) {
                console.warn(`[번호오류] ${target}`)
                results.push({ target, success: false, reason: 'Invalid phone number' })
                continue
            }

            // 올톡 변수 매핑 (#{VAR1}~#{VAR4})
            const numberEntry: Record<string, string | number> = {
                key: `r_${index}`,
                hp: cleanNumber,
                VAR1: var1 || '',
                VAR2: var2 || '',
                VAR3: var3 || '',
            }
            if (var4) numberEntry['VAR4'] = var4
            // [Fix ERR_280] title은 numbers 안이 아니라 requestBody 최상위에 위치해야 함 → 여기서 제거

            numbersArr.push(numberEntry)
        }

        if (numbersArr.length === 0) {
            return new Response(JSON.stringify({ success: false, error: '유효한 수신번호 없음', results }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
            })
        }

        // [Fix KKO_3016] 올톡 답변(2026-04-29) 기준:
        // message와 title은 placeholder 형태(#{VAR1})로 전송 → Oltalk 서버가 치환 후 카카오에 전송
        // 직접 치환된 값 전송 시 카카오 템플릿과 불일치 → KKO_3016 발생
        const tmpl = ALIMTALK_TEMPLATES[type as string]

        const requestBody: Record<string, unknown> = {
            service: Number(serviceNo),
            // 알림톡 본문: 등록된 템플릿 placeholder 형태 사용 (Oltalk가 VAR 치환)
            // alter=true 시 알림톡 실패하면 이 message를 SMS로 대체발송
            message: tmpl ? tmpl.message : (message || ''),
            numbers: numbersArr,
            template: templateCode,
            groupId: groupId,
            alter: false, // [변경] 알림톡 실패 시 일반 문자 대체발송 방지 (사용자 요청)
        }
        // title도 placeholder 형태로 전송 (Oltalk가 VAR2 치환)
        if (tmpl) {
            requestBody['title'] = tmpl.title
        }

        console.log(`[올톡/요청] template=${templateCode}, numbers=${numbersArr.length}명, title=${tmpl?.title || '(없음)'}`)
        console.log(`[올톡/요청 바디]:`, JSON.stringify(requestBody))

        const res = await fetch('https://api.alltalk.co.kr/alimTalk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify(requestBody)
        })

        const data = await res.json()
        console.log(`[올톡/응답 전체]:`, JSON.stringify(data))

        // 응답 처리
        if (data.status === 'success' || data.code === 200 || res.ok) {
            const valueList = data.value || []
            for (let i = 0; i < valueList.length; i++) {
                const v = valueList[i] as { uid?: number; status?: string }
                const hp = numbersArr[i]?.hp || 'unknown'
                const isAlimtalkOk = v.status === 'OK'
                const isSmsReplace = v.status?.startsWith('KKO_') || v.status === 'REPLACE_SMS'

                // 채널 판단
                let channel = 'alimtalk'
                if (isAlimtalkOk) {
                    channel = 'alimtalk'
                    console.log(`[올톡 알림톡 성공] ${maskPhone(hp)}: uid=${v.uid}`)
                } else if (isSmsReplace) {
                    channel = 'sms'
                    console.log(`[올톡 SMS 대체] ${maskPhone(hp)}: status=${v.status}`)
                } else {
                    channel = v.status || 'unknown'
                    console.warn(`[올톡 기타] ${maskPhone(hp)}: status=${v.status}`)
                }

                // DB 로그 저장
                await saveLog({
                    type,
                    channel,
                    recipient: hp,
                    templateCode,
                    var1, var2, var3, var4,
                    responseRaw: { value: v, full_response: data },
                    status: v.status || 'unknown',
                    errorMessage: isAlimtalkOk ? undefined : `카카오 오류: ${v.status}`,
                })

                results.push({ target: hp, success: true, channel, status: v.status, uid: v.uid })
            }

            // value 배열이 없어도 성공으로 처리
            if (valueList.length === 0 && numbersArr.length > 0) {
                for (const n of numbersArr) {
                    await saveLog({
                        type,
                        channel: 'unknown',
                        recipient: n.hp as string,
                        templateCode,
                        var1, var2, var3, var4,
                        responseRaw: data,
                        status: 'NO_VALUE_ARRAY',
                    })
                    results.push({ target: n.hp, success: true })
                }
            }
        } else {
            const errMsg = data.message || JSON.stringify(data)
            console.error(`[올톡 API 오류] ${errMsg}`)
            await saveLog({
                type,
                channel: 'error',
                recipient: numbersArr[0]?.hp as string || recipient,
                templateCode,
                var1, var2, var3, var4,
                responseRaw: data,
                status: 'API_ERROR',
                errorMessage: errMsg,
            })
            results.push({ success: false, reason: errMsg })
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('[올톡/오류]', errorMessage)
        return new Response(JSON.stringify({ success: false, error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
        })
    }
})
