import { registerPlugin } from '@capacitor/core';

export interface LocalSmsPlugin {
    checkPermission(): Promise<{ granted: boolean }>;
    requestPermission(): Promise<{ granted: boolean }>;
    sendSms(options: { phoneNumber: string; message: string }): Promise<{ success: boolean }>;
}

const LocalSms = registerPlugin<LocalSmsPlugin>('LocalSms');

export default LocalSms;
