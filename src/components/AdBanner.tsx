import { useEffect } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export function AdBanner() {
    useEffect(() => {
        const initAdMob = async () => {
            if (!Capacitor.isNativePlatform()) return;

            try {
                await AdMob.initialize({
                    requestTrackingAuthorization: true,
                    initializeForTesting: true,
                });

                await AdMob.showBanner({
                    adId: 'ca-app-pub-3940256099942544/6300978111', // Android Test ID
                    adSize: BannerAdSize.BANNER,
                    position: BannerAdPosition.BOTTOM_CENTER,
                    margin: 0,
                    isTesting: true,
                });
            } catch (error) {
                console.error('AdMob init failed', error);
            }
        };

        initAdMob();

        return () => {
            if (Capacitor.isNativePlatform()) {
                AdMob.hideBanner().catch(console.error);
            }
        };
    }, []);

    if (!Capacitor.isNativePlatform()) {
        return (
            <div className="w-full h-[50px] bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                [광고 배너 영역 - 모바일에서만 표시됩니다]
            </div>
        );
    }

    return <div className="w-full bg-[#0f2920]" style={{ height: 'calc(50px + env(safe-area-inset-bottom))' }} />; // 배너(50px) + Safe Area
}
