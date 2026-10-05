import { registerPlugin } from '@capacitor/core';

export interface ToastPlugin {
    show(options: { text: string; duration?: 'short' | 'long' }): Promise<void>;
}

const Toast = registerPlugin<ToastPlugin>('ToastPlugin');

export { Toast };
