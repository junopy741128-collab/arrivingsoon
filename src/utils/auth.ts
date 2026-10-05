import { supabase } from '../lib/supabaseClient';

export const signInWithKakao = async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: 'com.soon.arrival://login-callback',
                queryParams: {
                    access_type: 'offline', // refresh_token을 위해
                    prompt: 'consent',
                }
            }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Kakao Login Error:', error);
        throw error;
    }
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('supa_session_token'); // Clear our custom cache
};
