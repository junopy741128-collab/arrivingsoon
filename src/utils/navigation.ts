import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { showAlert } from './globalAlert';

export type NavigationApp = 'kakao' | 'tmap' | 'naver';

export interface NavigationAppInfo {
    id: NavigationApp;
    name: string;
    packageName: string;
    urlScheme: string;
    isInstalled: boolean;
}

export interface RouteParams {
    startLat: number;
    startLng: number;
    startName: string;
    endLat: number;
    endLng: number;
    endName: string;
}

/**
 * 네비게이션 앱 정보
 */
export const NAVIGATION_APPS: Record<NavigationApp, Omit<NavigationAppInfo, 'isInstalled'>> = {
    kakao: {
        id: 'kakao',
        name: '카카오내비',
        packageName: 'com.locnall.KimGiSa',
        urlScheme: 'kakaomap://',
    },
    tmap: {
        id: 'tmap',
        name: '티맵',
        packageName: 'com.skt.tmap.ku',
        urlScheme: 'tmap://',
    },
    naver: {
        id: 'naver',
        name: '네이버 지도',
        packageName: 'com.nhn.android.nmap',
        urlScheme: 'nmap://',
    },
};

/**
 * 앱이 설치되어 있는지 확인
 */
export async function checkAppInstalled(app: NavigationApp): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
        return false;
    }

    // Android: App.canOpenUrl is NOT supported on Android.
    // We will assume true for now, and let the launch fail if not installed.
    // Alternatively, we could use a specific plugin like 'capacitor-app-launcher' if needed,
    // but for now, assuming true is the standard workaround for basic linking.
    if (Capacitor.getPlatform() === 'android') {
        return true;
    }

    try {
        const appInfo = NAVIGATION_APPS[app];
        const canOpen = await (App as any).canOpenUrl({ url: appInfo.urlScheme });
        return canOpen.value;
    } catch (error) {
        console.error(`Failed to check ${app} installation:`, error);
        return false;
    }
}

/**
 * 설치된 네비게이션 앱 목록 가져오기
 */
export async function getInstalledNavigationApps(): Promise<NavigationAppInfo[]> {
    const apps: NavigationAppInfo[] = [];

    for (const [key, value] of Object.entries(NAVIGATION_APPS)) {
        const isInstalled = await checkAppInstalled(key as NavigationApp);
        apps.push({
            ...value,
            isInstalled,
        });
    }

    return apps;
}

/**
 * 카카오내비 URL 생성
 */
function buildKakaoNaviUrl(params: RouteParams): string {
    const { startLat, startLng, startName, endLat, endLng, endName } = params;

    // kakaomap://route?sp=위도,경도&ep=위도,경도&by=CAR
    return `kakaomap://route?sp=${startLat},${startLng}&ep=${endLat},${endLng}&by=CAR`;
}

/**
 * 티맵 URL 생성
 */
function buildTmapUrl(params: RouteParams): string {
    const { startLat, startLng, startName, endLat, endLng, endName } = params;

    // tmap://route?goalname=목적지&goalx=경도&goaly=위도&startname=출발지&startx=경도&starty=위도
    return `tmap://route?goalname=${encodeURIComponent(endName)}&goalx=${endLng}&goaly=${endLat}&startname=${encodeURIComponent(startName)}&startx=${startLng}&starty=${startLat}`;
}

/**
 * 네이버 지도 URL 생성
 */
function buildNaverMapUrl(params: RouteParams): string {
    const { startLat, startLng, startName, endLat, endLng, endName } = params;

    // nmap://route/car?slat=위도&slng=경도&sname=출발지&dlat=위도&dlng=경도&dname=목적지&appname=앱이름
    return `nmap://route/car?slat=${startLat}&slng=${startLng}&sname=${encodeURIComponent(startName)}&dlat=${endLat}&dlng=${endLng}&dname=${encodeURIComponent(endName)}&appname=곧도착해요`;
}

/**
 * 네비게이션 앱 실행
 */
export async function launchNavigationApp(app: NavigationApp, params: RouteParams): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
        showAlert('네비게이션 연동은 모바일 앱에서만 사용 가능합니다.');
        return false;
    }

    try {
        let url: string;

        switch (app) {
            case 'kakao':
                url = buildKakaoNaviUrl(params);
                break;
            case 'tmap':
                url = buildTmapUrl(params);
                break;
            case 'naver':
                url = buildNaverMapUrl(params);
                break;
            default:
                throw new Error(`Unknown navigation app: ${app}`);
        }

        console.log(`Launching ${app} with URL:`, url);

        // Try Capacitor App plugin first
        try {
            const ret = await (App as any).openUrl({ url });
            return ret.completed;
        } catch (innerError: any) {
            console.warn(`App.openUrl failed, trying fallback:`, innerError);

            // Fallback: window.location.href (works for many Android intents)
            if (Capacitor.getPlatform() === 'android') {
                window.location.href = url;
                return true;
            }
            throw innerError;
        }
    } catch (error) {
        console.error(`Failed to launch ${app}:`, error);

        // Fallback: Open Play Store if app launch fails
        const appInfo = NAVIGATION_APPS[app];
        if (confirm(`${appInfo.name}가 설치되어 있지 않거나 실행할 수 없습니다. 설치 페이지로 이동하시겠습니까?`)) {
            // Try opening Play Store
            try {
                await (App as any).openUrl({ url: `market://details?id=${appInfo.packageName}` });
            } catch (e) {
                window.location.href = `https://play.google.com/store/apps/details?id=${appInfo.packageName}`;
            }
        }

        return false;
    }
}

/**
 * 선호하는 네비게이션 앱 저장
 */
export function savePreferredNavigationApp(app: NavigationApp): void {
    localStorage.setItem('preferredNavigationApp', app);
}

/**
 * 선호하는 네비게이션 앱 가져오기
 */
export function getPreferredNavigationApp(): NavigationApp | null {
    const saved = localStorage.getItem('preferredNavigationApp');
    if (saved && (saved === 'kakao' || saved === 'tmap' || saved === 'naver')) {
        return saved;
    }
    return null;
}
