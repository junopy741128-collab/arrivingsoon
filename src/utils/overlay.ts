import { registerPlugin } from '@capacitor/core';

export interface OverlayPlugin {
    show(): Promise<void>;
    hide(): Promise<void>;
    checkPermission(): Promise<{ granted: boolean }>;
    requestPermission(): Promise<void>;
}

const Overlay = registerPlugin<OverlayPlugin>('Overlay');

export default Overlay;
