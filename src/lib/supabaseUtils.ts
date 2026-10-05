import { supabase } from './supabaseClient';

export interface PointTransaction {
    userId: string;
    amount: number;
    type: 'used' | 'earned';
    description: string;
}

// Helper for Direct Fetch - ROBUST VERSION (With 401 Retry)
export const directSupabaseFetch = async (endpoint: string, options: RequestInit = {}) => {
    const projectUrl = (supabase as any).supabaseUrl;
    const anonKey = (supabase as any).supabaseKey;
    const url = `${projectUrl}/rest/v1/${endpoint}`;

    // Internal helper for request
    const makeRequest = async (token: string) => {
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 10000); // 10s Timeout

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': anonKey,
                    'Authorization': `Bearer ${token}`,
                    'Prefer': 'return=representation',
                    ...options.headers,
                }
            });
            clearTimeout(fetchTimeout);
            return response;
        } catch (error) {
            clearTimeout(fetchTimeout);
            throw error;
        }
    };

    let token = anonKey;
    // 1. Try Local Storage first (Fastest, Sync)
    const localToken = localStorage.getItem('supa_session_token');
    if (localToken) token = localToken;

    console.log(`[DirectFetch] ${options.method || 'GET'} ${endpoint}`);

    try {
        let response = await makeRequest(token);

        // 2. Handle 401 (Token Expired) -> Retry ONCE
        if (response.status === 401) {
            console.warn('[DirectFetch] 401 Unauthorized - Attempting Refresh...');
            try {
                // Force refresh
                const { data: { session }, error } = await supabase.auth.getSession();

                if (session?.access_token) {
                    console.log('[DirectFetch] Token Refreshed, Retrying...');
                    // Update Cache
                    localStorage.setItem('supa_session_token', session.access_token);
                    token = session.access_token;
                    // Retry
                    response = await makeRequest(token);
                } else {
                    console.error('[DirectFetch] Refresh failed:', error);
                }
            } catch (e) {
                console.error('[DirectFetch] Refresh exception:', e);
            }
        }

        if (!response.ok) {
            const text = await response.text();
            console.error(`[DirectFetch] Error ${response.status}:`, text);
            throw new Error(`Server Error (${response.status}): ${text}`);
        }

        return response.json();

    } catch (error: any) {
        console.error(`[DirectFetch] Network/Logic Error:`, error);
        throw error;
    }
};

// 1. 포인트 입출금 처리 함수
export const handlePointTransaction = async ({
    userId,
    amount,
    type,
    description
}: PointTransaction): Promise<number> => {
    // 1. Get Current Points
    const profiles = await directSupabaseFetch(`profiles?id=eq.${userId}&select=points`);
    if (!profiles || profiles.length === 0) throw new Error('프로필을 찾을 수 없습니다.');
    const currentPoints = profiles[0].points || 0;

    // 2. Check Balance
    if (type === 'used' && currentPoints < Math.abs(amount)) {
        throw new Error('포인트가 부족합니다.');
    }

    // [New] Check for Duplicate (Idempotency)
    // If description contains specialized tag (e.g. TripID), verify uniqueness
    if (description && description.includes('(Trip:')) {
        const existing = await directSupabaseFetch(`point_history?user_id=eq.${userId}&description=eq.${encodeURIComponent(description)}&limit=1`);
        if (existing && existing.length > 0) {
            console.warn(`⚠️ [Point] Duplicate transaction prevented: ${description}`);
            return currentPoints;
        }
    }

    // 3. Insert History
    await directSupabaseFetch('point_history', {
        method: 'POST',
        body: JSON.stringify({
            user_id: userId,
            amount: type === 'used' ? -Math.abs(amount) : Math.abs(amount),
            type,
            description
        })
    });

    // 4. Update Profile Balance
    const newBalance = type === 'used'
        ? currentPoints - Math.abs(amount)
        : currentPoints + Math.abs(amount);

    await directSupabaseFetch(`profiles?id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ points: newBalance })
    });

    // 5. Trim History (Keep only 40 items)
    try {
        const historyDetails = await directSupabaseFetch(`point_history?user_id=eq.${userId}&select=id&order=created_at.desc`);
        if (historyDetails && historyDetails.length > 40) {
            const idsToDelete = historyDetails.slice(40).map((h: any) => h.id);
            if (idsToDelete.length > 0) {
                await directSupabaseFetch(`point_history?id=in.(${idsToDelete.join(',')})`, {
                    method: 'DELETE'
                });
                console.log(`[PointHistory] Trimmed ${idsToDelete.length} old records for user ${userId}`);
            }
        }
    } catch (trimErr) {
        console.error('Failed to trim point history:', trimErr);
    }

    return newBalance;
};

// 2. 포인트 내역 가져오기 함수
export const getPointHistory = async (userId: string) => {
    console.log('🔵 [getPointHistory] (Direct) Fetching:', userId);

    try {
        const data = await directSupabaseFetch(`point_history?user_id=eq.${userId}&order=created_at.desc`);
        console.log('✅ [getPointHistory] Success:', data.length);
        return data || [];
    } catch (err: any) {
        console.error('⚠️ [getPointHistory] Failed:', err.message);
        return [];
    }
};

// 3. 포인트 내역 삭제 함수 (Soft Delete or Hard Delete)
export const deletePointHistory = async (historyId: number) => {
    console.log('🔵 [deletePointHistory] Deleting ID:', historyId);
    try {
        await directSupabaseFetch(`point_history?id=eq.${historyId}`, {
            method: 'DELETE'
        });
        console.log('✅ [deletePointHistory] Deleted successfully');
        return true;
    } catch (err: any) {
        console.error('❌ [deletePointHistory] Failed:', err.message);
        throw err;
    }
};