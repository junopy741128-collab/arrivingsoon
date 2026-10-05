import { createClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'

// Vite에서는 import.meta.env를 사용해야 합니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rriadueyhvxycymxchrw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyaWFkdWV5aHZ4eWN5bXhjaHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTkxMDEsImV4cCI6MjA4NDU3NTEwMX0.tPmUfwdddvRKNQdqfIWpuEZB6ZuJYdNuxPT2bzW6w4U'

// Capacitor용 Storage Adapter
const CapacitorStorage = {
    getItem: async (key: string) => {
        const { value } = await Preferences.get({ key });
        return value;
    },
    setItem: async (key: string, value: string) => {
        await Preferences.set({ key, value });
    },
    removeItem: async (key: string) => {
        await Preferences.remove({ key });
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: CapacitorStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})
