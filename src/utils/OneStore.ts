import { registerPlugin } from '@capacitor/core';

export interface OneStorePlugin {
    echo(options: { value: string }): Promise<{ value: string }>;
    init(): Promise<void>;
    purchase(options: {
        productId: string;
        productName?: string;
        developerPayload?: string;
    }): Promise<{
        orderId: string;
        purchaseToken: string;
        packageName: string;
        productId: string;
        purchaseTime: number;
        securityToken: string;
        signature: string;
        originalJson: string;
    }>;
}

const OneStore = registerPlugin<OneStorePlugin>('OneStore');

export default OneStore;
