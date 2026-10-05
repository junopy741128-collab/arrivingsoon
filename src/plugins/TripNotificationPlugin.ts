import { registerPlugin } from '@capacitor/core';

export interface TripNotificationPlugin {
    startNotification(options: { tripData: TripData }): Promise<void>;
    updateNotification(options: { tripData: TripData }): Promise<void>;
    stopNotification(): Promise<void>;
    checkTripStatus(): Promise<{ isActive: boolean }>;
    checkCurrentStatus(): Promise<any>;
    isServiceRunning(): Promise<{ running: boolean }>;
    requestIgnoreBatteryOptimizations(): Promise<void>;
    addListener(eventName: 'tripLocationUpdate', listenerFunc: (data: { lat: number, lng: number, distKm: number, timeMin: number }) => void): Promise<any> & any;
    addListener(eventName: 'tripStateUpdate', listenerFunc: (data: { status: string }) => void): Promise<any> & any;
    addListener(eventName: 'tripNotificationSent', listenerFunc: (data: { message: string, recipient: string }) => void): Promise<any> & any;
    getLogs(): Promise<{ logs: string }>;
    clearLogs(): Promise<void>;
}

export interface TripData {
    id?: string;
    destination: string;
    timeRemaining: number;
    distance: number;
    recipient?: string;
    apiKey?: string;
    destLat?: number;
    destLng?: number;
    startLat?: number;
    startLng?: number;
    startPoint?: string;
    targetDistance?: number;
    initialStatus?: string; // 'waiting' or 'active'
    notifications?: string; // JSON String of Notification[]

    // New Trigger Fields
    triggerType?: 'time' | 'distance' | 'waypoint';
    triggerValue?: number | string;
    waypointLat?: number;
    waypointLng?: number;
    waypoints?: string; // JSON String of Waypoint[] [{lat, lng, name}, ...] for Multi-trigger

    // [Phase 13] Settings
    enableDeparture?: boolean;

    // [2단계] 발송 방식 및 발송자 이름
    smsMode?: 'sms_single' | 'sms_multi' | 'kakao';
    senderName?: string;

    // Template messages
    departureMessage?: string;
    waypointMessage?: string;
    arrivalMessage?: string;
    // [V_FIX] Supabase Credentials for native sending
    supabaseUrl?: string;
    supabaseAnonKey?: string;
}

const TripNotification = registerPlugin<TripNotificationPlugin>('TripNotification');

export { TripNotification };
