// -------------------------------------------------------------
// [곧도착해요] 대기자 도착 알림 문자 발송 (Solapi/CoolSMS)
// -------------------------------------------------------------
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any;


serve(async (req: Request) => {
  // 1. 앱에서 연결 요청이 오면 "OK"라고 허락해주는 부분 (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    // 2. 앱에서 보낸 데이터 받기 (대기자 번호, 대기자 이름, 도착시간)
    // receiverName: 대기자 이름 (예: 홍길동님)
    const { receiverPhone, receiverName, arrivalTime } = await req.json();

    // 3. 금고(Secrets)에서 키 꺼내오기
    const apiKey = Deno.env.get('SOLAPI_API_KEY')!;
    const apiSecret = Deno.env.get('SOLAPI_API_SECRET')!;
    const senderPhone = Deno.env.get('SENDER_PHONE')!;

    // 4. 솔라피 서명 만들기 (보안 필수 절차)
    const date = new Date().toISOString();
    const salt = crypto.randomUUID().replace(/-/g, "");
    const message = date + salt;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(apiSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
    const signature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 5. [수정됨] 대기자 맞춤형 문자 내용
    // 예: [곧도착해요] 홍길동님, 차량이 약 10분 뒤에 도착할 예정입니다. 잠시만 기다려주세요.
    const textMessage = `[곧도착해요] ${receiverName}님, 차량이 약 ${arrivalTime}분 뒤에 도착할 예정입니다. 잠시만 기다려주세요.`;

    console.log(`[발송시작] 받는사람: ${receiverPhone}, 내용: ${textMessage}`);

    // 6. 솔라피로 발송 요청
    const response = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
      },
      body: JSON.stringify({
        message: {
          to: receiverPhone,
          from: senderPhone,
          text: textMessage
        }
      })
    });

    const result = await response.json();

    // 7. 결과 반환
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    console.error("[에러]", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
    });
  }
});