import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Health check endpoint
app.get("/make-server-9296dadf/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-9296dadf/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "이메일, 비밀번호, 이름은 필수입니다." }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user data in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}:profile`, {
      name,
      email,
      phone: '',
      createdAt: new Date().toISOString(),
    });
    await kv.set(`user:${userId}:contacts`, []);
    await kv.set(`user:${userId}:trips`, []);
    await kv.set(`user:${userId}:messages`, []);

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
      }
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "회원가입 중 오류가 발생했습니다." }, 500);
  }
});

// Get user profile
app.get("/make-server-9296dadf/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "인증이 필요합니다." }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
    }

    const profile = await kv.get(`user:${user.id}:profile`);
    if (!profile) {
      return c.json({ error: "프로필을 찾을 수 없습니다." }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log(`Profile fetch error: ${error}`);
    return c.json({ error: "프로필 조회 중 오류가 발생했습니다." }, 500);
  }
});

// Update user profile
app.put("/make-server-9296dadf/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "인증이 필요합니다." }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
    }

    const { name, phone } = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}:profile`);

    const updatedProfile = {
      ...currentProfile,
      name: name || currentProfile.name,
      phone: phone !== undefined ? phone : currentProfile.phone,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}:profile`, updatedProfile);

    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log(`Profile update error: ${error}`);
    return c.json({ error: "프로필 수정 중 오류가 발생했습니다." }, 500);
  }
});

// Get contacts
app.get("/make-server-9296dadf/contacts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "인증이 필요합니다." }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
    }

    const contacts = await kv.get(`user:${user.id}:contacts`) || [];
    return c.json({ contacts });
  } catch (error) {
    console.log(`Contacts fetch error: ${error}`);
    return c.json({ error: "연락처 조회 중 오류가 발생했습니다." }, 500);
  }
});

// Save contacts
app.post("/make-server-9296dadf/contacts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "인증이 필요합니다." }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
    }

    const { contacts } = await c.req.json();
    await kv.set(`user:${user.id}:contacts`, contacts);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Contacts save error: ${error}`);
    return c.json({ error: "연락처 저장 중 오류가 발생했습니다." }, 500);
  }
});

// Get trips
app.get("/make-server-9296dadf/trips", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "인증이 필요합니다." }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
    }

    const trips = await kv.get(`user:${user.id}:trips`) || [];
    return c.json({ trips });
  } catch (error) {
    console.log(`Trips fetch error: ${error}`);
    return c.json({ error: "알림 내역 조회 중 오류가 발생했습니다." }, 500);
  }
});

// Save trips
app.post("/make-server-9296dadf/trips", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "인증이 필요합니다." }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
    }

    const { trips } = await c.req.json();
    await kv.set(`user:${user.id}:trips`, trips);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Trips save error: ${error}`);
    return c.json({ error: "알림 내역 저장 중 오류가 발생했습니다." }, 500);
  }
});

// Get message templates
app.get("/make-server-9296dadf/messages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "인증이 필요합니다." }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
    }

    const messages = await kv.get(`user:${user.id}:messages`) || [];
    return c.json({ messages });
  } catch (error) {
    console.log(`Messages fetch error: ${error}`);
    return c.json({ error: "메시지 템플릿 조회 중 오류가 발생했습니다." }, 500);
  }
});

// Save message templates
app.post("/make-server-9296dadf/messages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "인증이 필요합니다." }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
    }

    const { messages } = await c.req.json();
    await kv.set(`user:${user.id}:messages`, messages);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Messages save error: ${error}`);
    return c.json({ error: "메시지 템플릿 저장 중 오류가 발생했습니다." }, 500);
  }
});

// Google Maps API - Places Autocomplete (주소 검색)
app.get("/make-server-9296dadf/maps/autocomplete", async (c) => {
  try {
    const input = c.req.query('input');
    
    if (!input) {
      return c.json({ error: "검색어를 입력해주세요." }, 400);
    }

    // Google Maps API 키 (환경 변수에서 가져오기)
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY') || 'AIzaSyCTQoUhx9sMcyteZVbz9gHppavC9yRfxT0';
    
    console.log('🔑 API Key 확인:', apiKey ? `존재함 (길이: ${apiKey.length})` : '❌ 없음');
    console.log('🔍 검색어:', input);

    // 레거시 Places API 사용 (Places API (New)가 아님!)
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&language=ko&components=country:kr&key=${apiKey}`;

    console.log('📡 Places API 요청 시작...');

    const response = await fetch(url);
    const data = await response.json();

    console.log('📦 응답 상태:', data.status);

    if (data.status === 'REQUEST_DENIED') {
      console.error('❌ REQUEST_DENIED 오류!');
      console.error('상세 메시지:', data.error_message);
      console.error('해결 방법:');
      console.error('1. https://console.cloud.google.com/billing → Billing 활성화');
      console.error('2. 다음 3개 API를 모두 활성화:');
      console.error('   - Places API (레거시)');
      console.error('   - Geocoding API');
      console.error('   - Distance Matrix API');
      console.error('3. https://console.cloud.google.com/apis/credentials → API 키 제한사항을 "없음"으로 설정');
      
      return c.json({ 
        error: `Google Maps API 인증 실패`, 
        details: data.error_message || 'This API key is not authorized to use this service or API.',
        status: data.status,
        solution: '⚠️ 중요: "Places API (New)"가 아닌 "Places API" (레거시)를 활성화해야 합니다.\n\n해결 방법:\n1. Google Cloud Console → API 및 서비스 → 라이브러리로 이동\n2. 다음 3개 API를 검색하여 모두 "사용 설정" 클릭:\n   ✓ Places API (레거시)\n   ✓ Geocoding API\n   ✓ Distance Matrix API\n3. Billing이 활성화되어 있는지 확인\n4. API 키 제한사항을 "없음"으로 설정\n\n현재 API 키: ' + apiKey.substring(0, 20) + '...'
      }, 500);
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`❌ Places API 오류: ${data.status} - ${data.error_message || '에러 메시지 없음'}`);
      return c.json({ 
        error: `Places API 오류: ${data.status}`, 
        details: data.error_message,
        status: data.status 
      }, 500);
    }

    console.log('✅ 검색 성공! 결과:', data.predictions?.length || 0, '개');
    return c.json({ predictions: data.predictions || [] });
  } catch (error) {
    console.error(`❌ Autocomplete error: ${error}`);
    return c.json({ error: "주소 검색 중 오류가 발생했습니다.", details: String(error) }, 500);
  }
});

// Google Maps API - Geocode (주소 -> 좌표)
app.get("/make-server-9296dadf/maps/geocode", async (c) => {
  try {
    const address = c.req.query('address');
    const latlng = c.req.query('latlng');
    
    if (!address && !latlng) {
      return c.json({ error: "주소 또는 좌표를 입력해주세요." }, 400);
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY') || 'AIzaSyCTQoUhx9sMcyteZVbz9gHppavC9yRfxT0';

    let url = `https://maps.googleapis.com/maps/api/geocode/json?language=ko&key=${apiKey}`;
    if (address) {
      url += `&address=${encodeURIComponent(address)}`;
    } else {
      url += `&latlng=${latlng}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      console.error('❌ Geocoding API REQUEST_DENIED:', data.error_message);
      return c.json({ 
        error: 'Geocoding API 인증 실패',
        details: data.error_message,
        solution: 'Google Cloud Console에서 "Geocoding API"를 활성화해주세요.'
      }, 500);
    }

    if (data.status !== 'OK') {
      console.log(`Geocode API error: ${data.status} - ${data.error_message}`);
      return c.json({ error: `Geocode API 오류: ${data.status}` }, 500);
    }

    return c.json({ results: data.results });
  } catch (error) {
    console.log(`Geocode error: ${error}`);
    return c.json({ error: "주소 변환 중 오류가 발생했습니다." }, 500);
  }
});

// Google Maps API - Distance Matrix (거리/시간 계산)
app.post("/make-server-9296dadf/maps/distance", async (c) => {
  try {
    const { origins, destinations } = await c.req.json();
    
    if (!origins || !destinations) {
      return c.json({ error: "출발지와 도착지를 입력해주세요." }, 400);
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY') || 'AIzaSyCTQoUhx9sMcyteZVbz9gHppavC9yRfxT0';

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origins
    )}&destinations=${encodeURIComponent(
      destinations
    )}&mode=driving&language=ko&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      console.error('❌ Distance Matrix API REQUEST_DENIED:', data.error_message);
      return c.json({ 
        error: 'Distance Matrix API 인증 실패',
        details: data.error_message,
        solution: 'Google Cloud Console에서 "Distance Matrix API"를 활성화해주세요.'
      }, 500);
    }

    if (data.status !== 'OK') {
      console.log(`Distance Matrix API error: ${data.status} - ${data.error_message}`);
      return c.json({ error: `Distance Matrix API 오류: ${data.status}` }, 500);
    }

    const element = data.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      return c.json({ error: "경로를 찾을 수 없습니다." }, 404);
    }

    return c.json({
      distance: {
        meters: element.distance.value,
        text: element.distance.text,
      },
      duration: {
        seconds: element.duration.value,
        text: element.duration.text,
      },
    });
  } catch (error) {
    console.log(`Distance calculation error: ${error}`);
    return c.json({ error: "거리 계산 중 오류가 발생했습니다." }, 500);
  }
});

Deno.serve(app.fetch);