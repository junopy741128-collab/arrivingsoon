import { supabase } from '../lib/supabaseClient';

/**
 * Kakao Local API - Search Result
 */
export interface KakaoSearchResult {
    name: string;
    address: string;
    roadAddress: string;
    lat: number;
    lng: number;
    category?: string;
    phone?: string;
    placeUrl?: string;
}

/**
 * Kakao Geocoding Result
 */
export interface KakaoGeocodeResult {
    lat: number;
    lng: number;
    address: string;
    roadAddress?: string;
}

/**
 * Kakao Route Result (실제 도로 경로 기반)
 */
export interface KakaoRouteResult {
    distance: number; // meters (실제 경로 거리)
    duration: number; // seconds (예상 소요 시간)
    taxiFare?: number; // 택시 요금
    tollFare?: number; // 통행료
}

// Helper: Call Supabase Proxy (from kakao-service.ts)
async function callKakaoProxy(endpoint: string, params: Record<string, any>) {
    try {
        const { data, error } = await supabase.functions.invoke('kakao-proxy', {
            body: { endpoint, params }
        });

        if (error) {
            console.error('[Kakao Proxy] Supabase Invoke Error:', error);
            throw error;
        }

        if (data.error) {
            console.error('[Kakao Proxy] API Error:', data.error);
            throw new Error(data.error);
        }

        return data;
    } catch (e: any) {
        console.error('[Kakao Proxy] Exception:', e);
        throw e;
    }
}

/**
 * Search for places using Kakao Local API (키워드 검색)
 */
export async function searchAddress(query: string, lat?: number, lng?: number): Promise<KakaoSearchResult[]> {
    try {
        const params: any = {
            query: query,
            size: '15'
        };

        if (lat && lng) {
            params.x = lng.toString();
            params.y = lat.toString();
            params.sort = 'distance';
        }

        const data = await callKakaoProxy('/v2/local/search/keyword.json', params);

        if (data && data.documents && data.documents.length > 0) {
            return data.documents.map((doc: any) => ({
                name: doc.place_name,
                address: doc.address_name,
                roadAddress: doc.road_address_name || doc.address_name,
                lat: parseFloat(doc.y),
                lng: parseFloat(doc.x),
                category: doc.category_name,
                phone: doc.phone,
                placeUrl: doc.place_url
            }));
        }

        return [];
    } catch (error) {
        console.error('Kakao search error:', error);
        return [];
    }
}

/**
 * Geocode address to coordinates (주소 → 좌표)
 */
export async function geocodeAddress(address: string): Promise<KakaoGeocodeResult | null> {
    try {
        const data = await callKakaoProxy('/v2/local/search/address.json', { query: address });

        if (data && data.documents && data.documents.length > 0) {
            const doc = data.documents[0];
            return {
                lat: parseFloat(doc.y),
                lng: parseFloat(doc.x),
                address: doc.address_name,
                roadAddress: doc.road_address?.address_name
            };
        }

        return null;
    } catch (error) {
        console.error('Kakao geocoding error:', error);
        return null;
    }
}

/**
 * Reverse geocode coordinates to address (좌표 → 주소)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        const data = await callKakaoProxy('/v2/local/geo/coord2address.json', {
            x: lng,
            y: lat
        });

        if (data && data.documents && data.documents.length > 0) {
            const doc = data.documents[0];
            // 도로명 주소 우선, 없으면 지번 주소
            return doc.road_address?.address_name || doc.address?.address_name || null;
        }

        return null;
    } catch (error) {
        console.error('Kakao reverse geocoding error:', error);
        return null;
    }
}

/**
 * Get route information using Kakao Mobility Directions API
 * 실제 도로 경로 기반 거리 및 시간 계산
 */
export async function getRouteInfo(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
): Promise<KakaoRouteResult | null> {
    try {
        // Proxy handles the domain switch internally for '/v1/directions'
        const data = await callKakaoProxy('/v1/directions', {
            origin: `${startLng},${startLat}`,
            destination: `${endLng},${endLat}`,
            priority: 'RECOMMEND',
            car_fuel: 'GASOLINE',
            car_hipass: false,
            alternatives: false,
            road_details: false
        });

        if (data && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const summary = route.summary;

            return {
                distance: summary.distance, // meters
                duration: summary.duration, // seconds
                taxiFare: summary.fare?.taxi,
                tollFare: summary.fare?.toll
            };
        }

        console.error('Kakao Directions API: No routes found');
        return null;
    } catch (error: any) {
        console.error('Kakao Directions API error:', error);
        return null;
    }
}

/**
 * Calculate distance between two points using Kakao route
 * 실제 도로 경로 거리 반환 (km)
 */
export async function calculateRouteDistance(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
): Promise<number | null> {
    const routeInfo = await getRouteInfo(startLat, startLng, endLat, endLng);

    if (routeInfo) {
        // meters to kilometers
        return routeInfo.distance / 1000;
    }

    return null;
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
}

/**
 * Format duration for display
 */
export function formatDuration(durationSeconds: number): string {
    const minutes = Math.ceil(durationSeconds / 60);

    if (minutes < 60) {
        return `${minutes}분`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours}시간`;
    }

    return `${hours}시간 ${remainingMinutes}분`;
}
