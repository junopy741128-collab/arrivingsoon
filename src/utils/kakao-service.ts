import { supabase } from '../lib/supabaseClient';

// [중요] 카카오 REST API 키는 이제 Supabase Edge Function (kakao-proxy)의 환경변수 KAKAO_REST_API_KEY로 관리됩니다.
// 클라이언트 코드에는 키가 노출되지 않습니다.

declare global {
    interface Window {
        kakao: any;
    }
}

export interface KakaoPoiResult {
    name: string;
    lat: number;
    lng: number;
    address: string;
    category?: string;
    id?: string;
    distance?: number;
}

export interface KakaoRouteResult {
    distance: number; // meters
    duration: number; // seconds
}

// Helper: Supabase Edge Function을 통해 Kakao API 호출 (CORS 해결)
// Helper: Supabase Edge Function을 통해 Kakao API 호출 (CORS 해결)
async function callKakaoProxy(endpoint: string, params: Record<string, any>) {
    console.log(`[KakaoProxy] Calling: ${endpoint}`, params);

    // URL & Key Construction
    const projectUrl = (supabase as any).supabaseUrl;
    const anonKey = (supabase as any).supabaseKey;
    const functionUrl = `${projectUrl}/functions/v1/kakao-proxy`;

    try {
        // 15초 타임아웃 레이스
        const fetchPromise = fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${anonKey}`
            },
            body: JSON.stringify({ endpoint, params })
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out after 15s')), 15000)
        );

        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[KakaoProxy] HTTP Error: ${response.status}`, errorText);
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            console.error('[Kakao Proxy] API Error:', data.error);
            throw new Error(data.error);
        }

        console.log(`[KakaoProxy] Success: ${endpoint}`);
        return data;
    } catch (e: any) {
        console.error('[Kakao Proxy] Exception:', e);
        throw e;
    }
}

// 1. POI Search (Keyword + Address Fallback)
export async function searchPoiKakao(keyword: string, lat?: number, lng?: number): Promise<KakaoPoiResult[]> {
    try {
        console.log(`[Kakao] Searching POI (Keyword) via Proxy: ${keyword}, Location: ${lat}, ${lng}`);

        // 1-1. 키워드 검색
        const params: any = { query: keyword };

        // [Modified] Location Bias & Sorting
        if (lat && lng) {
            params.y = lat;
            params.x = lng;
            // params.radius = 20000; // [V16] User requested to remove distance limit
            // params.sort = 'distance'; // Keep sort or let API decide? Let's remove sort too to find best match globally if radius is gone
        }

        let data = await callKakaoProxy('/v2/local/search/keyword.json', params).catch(() => null);

        if (data && data.documents && data.documents.length > 0) {
            console.log(`[Kakao] Keyword search found ${data.documents.length} results`);
            return data.documents.map((doc: any) => ({
                name: doc.place_name,
                lat: parseFloat(doc.y),
                lng: parseFloat(doc.x),
                address: doc.road_address_name || doc.address_name,
                category: doc.category_group_name,
                id: doc.id,
                distance: doc.distance ? parseFloat(doc.distance) : undefined
            }));
        }

        // 1-2. 주소 검색 Fallback
        console.log(`[Kakao] Keyword search empty, trying Address Search for: ${keyword}`);
        data = await callKakaoProxy('/v2/local/search/address.json', { query: keyword }).catch(() => null);

        if (data && data.documents && data.documents.length > 0) {
            console.log(`[Kakao] Address search found ${data.documents.length} results`);
            return data.documents.map((doc: any) => ({
                name: doc.address_name,
                lat: parseFloat(doc.y),
                lng: parseFloat(doc.x),
                address: doc.road_address?.address_name || doc.address?.address_name || doc.address_name,
                category: '주소',
                id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                distance: undefined
            }));
        }

        return [];

    } catch (error) {
        console.error('[Kakao] POI Search Exception:', error);
        return [];
    }
}

// 2. Get Route Info (Distance & Duration)
export async function getRouteInfoKakao(originLat: number, originLng: number, destLat: number, destLng: number): Promise<KakaoRouteResult | null> {
    try {
        const origin = `${originLng},${originLat}`;
        const destination = `${destLng},${destLat}`;

        console.log('[Kakao] Getting directions via Proxy...');

        // Note: Proxy handles domain switching for 'directions'
        const data = await callKakaoProxy('/v1/directions', {
            origin,
            destination,
            priority: 'RECOMMEND'
        });

        if (data && data.routes && data.routes.length > 0) {
            const summary = data.routes[0].summary;
            console.log('🔍 [KAKAO API] Distance:', summary.distance, 'Duration:', summary.duration);
            return {
                distance: summary.distance, // meters
                duration: summary.duration  // seconds
            };
        }

        return null;
    } catch (error) {
        console.error('Kakao Route Error:', error);
        return null;
    }
}

// 2-1. Get Route Path (Vertexes for Polyline)
export async function getRoutePathKakao(originLat: number, originLng: number, destLat: number, destLng: number): Promise<{ lat: number, lng: number }[]> {
    try {
        const origin = `${originLng},${originLat}`;
        const destination = `${destLng},${destLat}`;

        console.log('[Kakao] Getting route path via Proxy...');
        const data = await callKakaoProxy('/v1/directions', {
            origin,
            destination,
            priority: 'RECOMMEND'
        });

        if (data && data.routes && data.routes.length > 0) {
            const sections = data.routes[0].sections;
            const path: { lat: number, lng: number }[] = [];

            sections.forEach((section: any) => {
                section.roads.forEach((road: any) => {
                    const vertexes = road.vertexes;
                    for (let i = 0; i < vertexes.length; i += 2) {
                        path.push({
                            lng: vertexes[i],
                            lat: vertexes[i + 1]
                        });
                    }
                });
            });
            console.log(`[Kakao] Route path parsed: ${path.length} points`);
            return path;
        }
        return [];
    } catch (error) {
        console.error('Kakao Route Path Error:', error);
        return [];
    }
}

// 3. Reverse Geocoding (Coord -> Address)
export async function reverseGeocodeKakao(lat: number, lng: number): Promise<string | null> {
    try {
        const data = await callKakaoProxy('/v2/local/geo/coord2address.json', {
            x: lng,
            y: lat
        });

        if (data && data.documents && data.documents.length > 0) {
            const doc = data.documents[0];

            // 1순위: 도로명 건물명 (예: 타워팰리스, 현대아파트)
            if (doc.road_address?.building_name && doc.road_address.building_name.trim()) {
                return doc.road_address.building_name.trim();
            }
            // 2순위: 도로명 전체 주소 (신주소 우선)
            if (doc.road_address?.address_name && doc.road_address.address_name.trim()) {
                return doc.road_address.address_name.trim();
            }
            // 3순위: 지번 주소 (최후 수단)
            if (doc.address?.address_name && doc.address.address_name.trim()) {
                return doc.address.address_name.trim();
            }
        }
        return null;
    } catch (error) {
        console.error('Kakao Reverse Geo Error:', error);
        return null;
    }
}

// 3-1. 행정동 정보 추출 (Helper)
async function getRegionName(lat: number, lng: number): Promise<string | null> {
    try {
        const data = await callKakaoProxy('/v2/local/geo/coord2address.json', {
            x: lng,
            y: lat
        });

        if (data && data.documents && data.documents.length > 0) {
            const doc = data.documents[0];
            return doc.address?.region_3depth_name || null;
        }
        return null;
    } catch (error) {
        return null;
    }
}

// 3-2. POI 이름 가져오기 (행정동 -> 키워드 검색)
export async function getPOINameByCoord(lat: number, lng: number): Promise<string> {
    try {
        const regionName = await getRegionName(lat, lng);

        if (!regionName) {
            const fallback = await reverseGeocodeKakao(lat, lng);
            return fallback || '주소를 찾을 수 없습니다';
        }

        // 행정동으로 주변 검색 (반경 500m)
        const data = await callKakaoProxy('/v2/local/search/keyword.json', {
            query: regionName,
            x: lng,
            y: lat,
            radius: 500,
            sort: 'distance'
        }).catch(() => null);

        if (data && data.documents && data.documents.length > 0) {
            const place = data.documents[0];
            console.log(`📍 [Kakao] 랜드마크 발견: ${place.place_name} (거리: ${place.distance}m)`);
            return place.place_name;
        }

        const fallback = await reverseGeocodeKakao(lat, lng);
        return fallback || '주소를 찾을 수 없습니다';

    } catch (error) {
        console.error('[Kakao] getPOINameByCoord Error:', error);
        const fallback = await reverseGeocodeKakao(lat, lng);
        return fallback || '주소 조회 실패';
    }
}

// 4. Map Initialization Helper (여기는 클라이언트 SDK 사용하므로 변경 없음)
export function initializeMap(containerId: string, lat: number, lng: number) {
    if (!window.kakao || !window.kakao.maps) {
        console.error('Kakao Maps SDK not loaded');
        return null;
    }

    const container = document.getElementById(containerId);
    if (!container) return null;

    const options = {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 3
    };

    return new window.kakao.maps.Map(container, options);
}
