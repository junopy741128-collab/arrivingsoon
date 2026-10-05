// src/config/storeConfig.ts

export const STORE_CONFIG = {
    TARGET: import.meta.env.VITE_STORE_TARGET || 'ONESTORE', // Default to ONESTORE
    SMS_PROVIDER: import.meta.env.VITE_SMS_PROVIDER || 'NATIVE',
    PAYMENT_PROVIDER: import.meta.env.VITE_PAYMENT_PROVIDER || 'PORTONE',
    enableDeparture: true, // [Phase 13] Default setting
};

export const isOneStore = () => STORE_CONFIG.TARGET === 'ONESTORE';
export const isGooglePlay = () => STORE_CONFIG.TARGET === 'GOOGLE';

console.log(`[StoreConfig] Target: ${STORE_CONFIG.TARGET}, SMS: ${STORE_CONFIG.SMS_PROVIDER}`);
