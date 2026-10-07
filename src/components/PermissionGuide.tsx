import React, { useEffect, useState } from 'react';
import { MapPin, MessageSquare, User, Bell, Battery, AlertTriangle } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions';
import { Capacitor } from '@capacitor/core';
import { TripNotification } from '../plugins/TripNotificationPlugin';

interface PermissionGuideProps {
    onComplete: () => void;
}

export function PermissionGuide({ onComplete }: PermissionGuideProps) {
    const [step, setStep] = useState<'intro' | 'requesting' | 'denied'>('intro');
    const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
    const [results, setResults] = useState<{ [key: string]: boolean }>({
        location: false,
        sms: false,
        contacts: false,
        notification: false,
        battery: false
    });

    const requestAllPermissions = async () => {
        setStep('requesting');

        try {
            // 1. Location (Essential)
            console.log('[Permission] Requesting Location...');
            try {
                const loc = await Geolocation.requestPermissions();
                if (loc.location === 'granted') {
                    setResults(prev => ({ ...prev, location: true }));
                } else {
                    console.warn('[Permission] Location denied or prompt dismissed');
                }
            } catch (e) {
                console.error('[Permission] Location Error:', e);
            }

            // 2. SMS & Contacts (Essential for functionality)
            let smsGranted = false;
            if (Capacitor.getPlatform() === 'android') {
                try {
                    console.log('[Permission] Requesting SMS...');
                    const checkSms = await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.SEND_SMS);
                    if (checkSms.hasPermission) {
                        smsGranted = true;
                    } else {
                        const sms = await AndroidPermissions.requestPermissions([
                            AndroidPermissions.PERMISSION.SEND_SMS,
                            AndroidPermissions.PERMISSION.READ_PHONE_STATE
                        ]);
                        smsGranted = sms.hasPermission;
                    }
                    setResults(prev => ({ ...prev, sms: smsGranted }));
                } catch (e) {
                    console.warn('[Permission] SMS Plugin Error:', e);
                }

                try {
                    console.log('[Permission] Requesting Contacts...');
                    await AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.READ_CONTACTS);
                    setResults(prev => ({ ...prev, contacts: true }));
                } catch (e) {
                    console.warn('[Permission] Contacts Plugin Error:', e);
                }
            }

            // 4. Notifications (Optional)
            try {
                console.log('[Permission] Requesting Notifications...');
                await LocalNotifications.requestPermissions();
                setResults(prev => ({ ...prev, notification: true }));
            } catch (e) {
                console.warn('[Permission] Notification Error:', e);
            }

            // 5. Battery
            try {
                if (Capacitor.getPlatform() === 'android') {
                    await TripNotification.requestIgnoreBatteryOptimizations();
                }
                setResults(prev => ({ ...prev, battery: true }));
            } catch (e) {
                console.warn('[Permission] Battery Optimization Error:', e);
            }

            // 안드로이드이고 SMS 권한이 없으면 제한된 설정 안내 페이지(denied) 표시
            if (Capacitor.getPlatform() === 'android' && !smsGranted) {
                setStep('denied');
                return;
            }

            onComplete();

        } catch (error) {
            console.error('[Permission] Critical Error:', error);
            setStep('denied');
        }
    };

    if (step === 'denied') {
        const handleOpenSettings = async () => {
            setHasOpenedSettings(true);
            try {
                const { NativeSettings, AndroidSettings } = await import('capacitor-native-settings');
                await NativeSettings.openAndroid({
                    option: AndroidSettings.ApplicationDetails,
                });
            } catch (error) {
                console.error('설정 열기 실패:', error);
                alert('설정 화면을 열 수 없습니다. 직접 기기 설정 앱에서 [애플리케이션] - [곧도착해요]를 찾아주세요.');
            }
        };

        return (
            <div className="fixed inset-0 z-[99999] bg-white flex flex-col p-6 overflow-y-auto">
                <div className="flex flex-col items-center text-center mt-8 mb-6">
                    <div className="w-16 h-16 bg-[#00E57D]/20 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-[#00E57D]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">SMS 권한 설정 안내</h2>
                    <p className="text-gray-600 text-sm">
                        예약 문자를 발송하기 위해 <strong className="text-gray-900">SMS 필수 권한</strong>이 필요합니다.
                    </p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 text-center">🛠 권한 설정 방법</h3>
                    
                    {!hasOpenedSettings ? (
                        <>
                            {/* CSS Mockup 1 (Restricted Settings) */}
                            <div className="w-full bg-[#f2f2f2] rounded-xl mb-4 py-4 flex flex-col relative overflow-hidden border border-gray-200 shadow-sm pointer-events-none">
                                <div className="flex items-center w-full justify-between px-4 mb-3">
                                    <div className="text-[15px] font-bold text-black tracking-tight flex items-center gap-1">
                                        <span className="text-gray-400 font-light mr-1 text-lg">&lt;</span> 애플리케이션 정..
                                    </div>
                                    <div className="text-gray-500 font-bold text-lg leading-none">⋮</div>
                                </div>
                                <div className="absolute top-2 right-2 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] px-4 py-3 flex items-center justify-center z-10 animate-bounce">
                                    <span className="text-black font-bold text-[15px] tracking-tight text-red-500">☝️ 제한된 설정 허용</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 text-center mb-2">1. 우측 상단 <strong>점 3개(⋮)</strong>를 눌러 허용해주세요.</p>
                            <p className="text-sm text-gray-700 text-center text-gray-400 mb-6">(점 3개가 안 보이면 다음으로 넘어갑니다)</p>
                            
                            {/* CSS Mockup 2 (SMS Permission) */}
                            <div className="w-full bg-[#f2f2f2] rounded-xl mb-2 py-4 px-4 flex flex-col border border-gray-200 shadow-sm pointer-events-none">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[16px] font-bold text-black tracking-tight">SMS 액세스 권한</span>
                                </div>
                                <div className="bg-white rounded-2xl w-full flex flex-col px-4 border border-gray-100">
                                    <div className="flex items-center gap-4 py-2.5">
                                        <div className="w-[18px] h-[18px] rounded-full border-[5px] border-[#1a73e8] bg-white shrink-0"></div>
                                        <span className="text-black text-[15px] font-bold text-[#1a73e8]">허용</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 text-center">2. <strong>[권한]</strong> 메뉴에서 <strong>[SMS]</strong>를 <strong>[허용]</strong>으로 바꿉니다.</p>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📱</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">권한 설정을 완료하셨나요?</h3>
                            <p className="text-gray-600 text-sm">설정에서 SMS 권한을 [허용]으로 변경하셨다면,<br/>아래 [다시 시도하기] 버튼을 눌러주세요.</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto space-y-3 pb-8">
                    {!hasOpenedSettings && (
                        <button
                            onClick={handleOpenSettings}
                            className="w-full py-4 bg-[#00E57D] hover:bg-[#00C56A] text-black rounded-xl font-bold text-lg shadow-lg transition-colors"
                        >
                            앱 설정 화면으로 이동
                        </button>
                    )}
                    
                    {(hasOpenedSettings || true) && (
                        <button
                            onClick={requestAllPermissions}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-colors ${hasOpenedSettings ? 'bg-[#00E57D] text-black' : 'bg-gray-800 text-white'}`}
                        >
                            다시 시도하기
                        </button>
                    )}
                </div>
            </div>
        );
    }
return (
        <div className="fixed inset-0 z-[99999] bg-white flex flex-col font-sans">
            {/* Header */}
            <div className="px-6 py-12 pb-6">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                    원활한<br />
                    <span className="text-[#00E57D]">도착알리미</span> 사용을 위한<br />
                    접근 권한 안내
                </h1>
                <p className="text-gray-500 text-sm">
                    아래 권한을 허용해주시면<br />
                    더 편리하게 이용하실 수 있습니다.
                </p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 space-y-8">

                {/* Mandatory Section */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">필수 접근 권한</h3>
                    <div className="space-y-6">
                        <PermissionItem
                            icon={<MapPin className="w-6 h-6 text-gray-700" />}
                            title="위치"
                            desc="현 위치 표시, 경로 안내, 도착 감지"
                        />
                        <PermissionItem
                            icon={<MessageSquare className="w-6 h-6 text-gray-700" />}
                            title="SMS"
                            desc="도착 알림 문자 자동 발송"
                        />
                        <PermissionItem
                            icon={<User className="w-6 h-6 text-gray-700" />}
                            title="연락처"
                            desc="알림 받을 연락처 선택"
                        />
                    </div>
                </div>

                {/* Optional Section */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">선택 접근 권한</h3>
                    <div className="space-y-6">
                        <PermissionItem
                            icon={<Bell className="w-6 h-6 text-gray-700" />}
                            title="알림"
                            desc="서비스 실행 상태바 표시, 도착 알림"
                        />
                        <PermissionItem
                            icon={<Battery className="w-6 h-6 text-gray-700" />}
                            title="배터리 최적화 제외 (권장)"
                            desc="백그라운드에서 끊김없는 위치 추적을 위해 시스템 팝업창에서 '허용'을 선택해주세요."
                        />
                    </div>
                </div>
            </div>

            {/* Footer Button */}
            <div className="p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-transparent">
                <button
                    onClick={requestAllPermissions}
                    className="w-full h-14 bg-[#00E57D] hover:bg-[#00C56A] active:scale-95 transition-all text-black font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    확인
                </button>
            </div>
        </div>
    );
}

function PermissionItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-500 leading-snug">{desc}</p>
            </div>
        </div>
    );
}
