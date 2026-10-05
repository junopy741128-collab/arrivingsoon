import { STORE_CONFIG } from '../config/storeConfig';
import { SmsService } from '../services/SmsService';

export interface NotificationRequest {
    recipient: string;
    message: string;
    type?: 'sms' | 'push'; // Extensible
}

export interface NotificationResponse {
    success: boolean;
    error?: string;
}

export const notificationService = {
    /**
     * Sends a notification (SMS) based on the configured provider.
     */
    sendNotification: async (request: NotificationRequest): Promise<NotificationResponse> => {
        const provider = STORE_CONFIG.SMS_PROVIDER;

        console.log(`[NotificationService] Sending via ${provider}...`);

        if (provider === 'NATIVE') {
            // Use existing Native SMS Logic (OneStore)
            return await SmsService.sendSms({
                recipient: request.recipient,
                message: request.message
            });
        }
        else if (provider === 'SOLAPI') {
            // Use Solapi API (Google Play / Web)
            // TODO: Implement actual HTTP call to Solapi (or via Supabase Edge Function)
            console.warn('[NotificationService] SOLAPI provider selected but not implemented. mocking success.');

            // Placeholder: Mock success for now
            return { success: true };
        }
        else {
            return { success: false, error: `Unknown SMS Provider: ${provider}` };
        }
    }
};
