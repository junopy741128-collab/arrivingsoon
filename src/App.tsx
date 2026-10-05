import { supabase } from './lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Home, Plus, History, User } from 'lucide-react';
import { LogoutModal } from './components/LogoutModal';

import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Geolocation } from '@capacitor/geolocation';
import { IntroPage } from './components/IntroPage';
import { HomePage } from './components/HomePage';
import { NotificationSetup } from './components/NotificationSetup';
import { NavigationActive } from './components/NavigationActive';
import { NotificationList } from './components/NotificationList';
import { Settings } from './components/Settings';
import { ContactManagement } from './components/ContactManagement';
import { SnsLogin } from './components/SnsLogin';
import { ProfileEdit } from './components/ProfileEdit';
import { MyPage } from './components/MyPage';
import { FavoriteTrips } from './components/FavoriteTrips';
import { AdminPage } from './components/AdminPage';
import { MessageManagement } from './components/MessageManagement';
import { ThemeSelector } from './components/ThemeSelector';
import { EmailLogin } from './components/EmailLogin';
import { EmailSignup } from './components/EmailSignup';
import { LoadingScreen } from './components/LoadingScreen';
import { type Theme } from './utils/theme';
import { setAuthToken } from './utils/api';
import { handlePointTransaction } from './lib/supabaseUtils';
// [V23] Permission Guide
import { PermissionGuide } from './components/PermissionGuide';
import { AlertModal } from './components/AlertModal';

export type Contact = {
    id: string;
    name: string;
    phone: string;
    phoneNumber?: string;
    isFavorite: boolean;
    type: 'phone' | 'kakao';
    group?: string;
    groups: string[];
};

export type NavigationInfo = {
    app: string;
    departure: string;
    destination: string;
    distance: number;
    estimatedTime: number;
    startLat?: number;
    startLng?: number;
    destLat?: number;
    destLng?: number;
};

export type SetupFormData = {
    departure: string;
    destination: string;
    enableDeparture: boolean;
    enableArrival: boolean;
    recipient: string;
    departureCondition: number;
    departureMessage: string;
    arrivalCondition: number;
    arrivalMessage: string;
    navigationInfo: NavigationInfo | null;
    targetDistance?: number;
    selectedDestinationForNav: any | null;
    triggerLocations?: { lat: number, lng: number, name: string, address: string }[]; // [V36] Added support for saved waypoints
    smsMode?: 'sms_single' | 'sms_multi' | 'kakao'; // [2단계]
    recipientCount?: number; // [2단계]
    departureTitle?: string;
    waypointTitle?: string;
    arrivalTitle?: string;
    waypointMessage?: string;
    selectedCar?: string; // [차량관리]
    isWaypointSkipped?: boolean; // [User Request]
};

export type Notification = {
    id: string;
    type: 'departure' | 'arrival';
    condition: {
        type: 'time' | 'distance';
        value: number;
        unit: '분' | 'km';
    };
    message: string;
    recipient: string;
    status: 'pending' | 'sent' | 'failed';
};

export type PointHistory = {
    id: number;
    type: 'earned' | 'used';
    amount: number;
    description: string;
    date: string;
    balance: number;
};

export type Trip = {
    id: string;
    departure: string;
    destination: string;
    notifications: Notification[];
    status: 'planning' | 'waiting' | 'active' | 'completed' | 'cancelled';
    estimatedTime: number;
    estimatedDistance: number;
    recipient?: string;
    createdAt?: string;
    startLat?: number;
    startLng?: number;
    destinationLat?: number;
    destinationLng?: number;
    startTime?: number;

    targetDistance?: number;
    isFavorite?: boolean;
    alias?: string;
    enableDeparture?: boolean; // [V36] Added support for departure toggle

    triggerType?: 'time' | 'distance' | 'waypoint';
    triggerValue?: number | string;
    waypointLat?: number;
    waypointLng?: number;
    waypointName?: string;
    recipientName?: string;
    waypoints?: string;
    startPoint?: string;
    initialStatus?: 'waiting' | 'active';
    smsMode?: 'sms_single' | 'sms_multi' | 'kakao'; // [2단계] 발송 방식
    recipientCount?: number; // [2단계] 수신자 수 (카카오 과금 계산용)
    selectedCar?: string; // [차량관리] 선택된 차량 번호
    departureTitle?: string;
    departureMessage?: string;
    waypointTitle?: string;
    waypointMessage?: string;
    arrivalTitle?: string;
    arrivalMessage?: string;
    completedAt?: string; // [V37] Real Arrival Time
    arrivalTimestamp?: number; // [V37] Unix timestamp for internal use
    sentMessages?: string[]; // [V_FIX] Tracking sent tags (e.g. 출발문자, 상일ic)
};

export type UserProfile = {
    name: string;
    email: string;
    phone: string;
    points: number;
    pointHistory?: PointHistory[];
    car_number_1?: string; // [차량관리]
    car_number_2?: string;
    car_number_3?: string;
    use_car_number?: boolean; // [차량관리] 문자 발송 시 포함 여부
};

export type Screen = 'intro' | 'home' | 'setup' | 'active' | 'list' | 'settings' | 'contacts' | 'contactsManage' | 'favorites' | 'login' | 'profile' | 'messages' | 'theme' | 'emailLogin' | 'emailSignup' | 'mypage' | 'admin';


const App: React.FC = () => {
    // [v46] Admin email constant
    const ADMIN_EMAIL = 'junopy741128@gmail.com';

    // [V23] Permission State
    const [showPermissionGuide, setShowPermissionGuide] = useState(false);
    const [alertState, setAlertState] = useState({ open: false, message: '' });
    // [V26] Logout Modal State
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // [Fix] 전역 alert() 대체: globalAlert.ts의 showAlert()와 연결
    useEffect(() => {
        const handler = (e: Event) => {
            const { message } = (e as CustomEvent).detail;
            setAlertState({ open: true, message });
        };
        window.addEventListener('app:show-alert', handler);
        return () => window.removeEventListener('app:show-alert', handler);
    }, []);

    const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
        // [V37] Intelligent Initial Screen Logic
        const profileStr = localStorage.getItem('userProfile');
        try {
            const profile = profileStr ? JSON.parse(profileStr) : null;
            if (!profile || !profile.email) {
                console.log('👤 [App.tsx] No profile found, defaulting to intro');
                return 'intro';
            }
        } catch (e) {
            console.log('👤 [App.tsx] Profile parse fail, defaulting to intro');
            return 'intro';
        }

        const saved = localStorage.getItem('currentScreen');
        console.log('💾 [App.tsx] 초기 Screen 로드:', saved || 'home');
        return (saved as Screen) || 'home';
    });
    const [currentTheme, setCurrentTheme] = useState<Theme>('dark');
    const [isLoading, setIsLoading] = useState(true); // [V14] UI Loading State
    const [isLoadingData, setIsLoadingData] = useState(true); // [V46] Data Loading State (for Restart Recovery)
    const [isFavoritesSelectionMode, setIsFavoritesSelectionMode] = useState(false); // [V36] Favorites Selection Mode

    // [V46] Data Initialization - Prevent Premature Redirects
    useEffect(() => {
        const initializeApp = async () => {
            // Simulate or await actual data restoration if needed
            // currently localStorage is sync, but we want to ensure everything is settled
            // before allowing redirects.
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsLoadingData(false);
            console.log('✅ [App.tsx] Data Initialization Complete');
        };
        initializeApp();
    }, []);

    // [V23] Check Permissions on Mount
    useEffect(() => {
        const checkPermissions = async () => {
            if (Capacitor.getPlatform() !== 'android') return;
            try {
                const loc = await Geolocation.checkPermissions();
                if (loc.location !== 'granted') {
                    console.log('[App] Location permission missing, showing guide');
                    setShowPermissionGuide(true);
                }
            } catch (e) {
                console.error('[App] Permission check failed', e);
            }
        };
        checkPermissions();
    }, []);

    // [수정] 딥링크 처리 (구글 로그인 등 OAuth 리다이렉트 대응)
    useEffect(() => {
        const handleUrl = async (urlStr: string) => {
            console.log('🔗 [App] URL Processing:', urlStr);

            if (urlStr.includes('login-callback') || urlStr.includes('access_token') || urlStr.includes('refresh_token')) {
                try {
                    console.log('🔵 [Deep Link] OAuth URL 감지됨, 토큰 추출 시도...');
                    const url = new URL(urlStr);
                    // Use substring(1) for hash to avoid '#' character
                    const hashParams = new URLSearchParams(url.hash ? url.hash.substring(1) : '');
                    const queryParams = new URLSearchParams(url.search);

                    const access_token = hashParams.get('access_token') || queryParams.get('access_token');
                    const refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token');

                    if (access_token && refresh_token) {
                        console.log('✅ [Deep Link] 토큰 포착! 세션 설정 및 Failsafe 가동...');

                        // 1. Supabase 세션 설정
                        const { data: { session }, error } = await supabase.auth.setSession({
                            access_token,
                            refresh_token
                        });

                        if (error) {
                            console.warn("⚠️ [App] setSession 실패, Failsafe 시도:", error.message);
                            // 2. 비상 대책: 토큰 유효성 직접 확인
                            const { data: { user } } = await supabase.auth.getUser(access_token);
                            if (user) {
                                console.log('✅ [Failsafe] 토큰 유효함. 강제 로그인 처리.');
                                setCurrentScreen('home');
                            }
                        } else if (session) {
                            console.log("✅ [App] Deep Link를 통한 세션 복구 및 홈으로 이동");
                            setCurrentScreen('home'); // 강제 이동으로 확실하게 처리
                        }
                    } else {
                        console.warn("⚠️ [Deep Link] URL에서 유효한 토큰을 찾을 수 없습니다.");
                    }
                } catch (e: any) {
                    console.error("❌ [App] URL Handling Error:", e?.message || e);
                }
            }
        };

        // 1. 앱이 실행 중일 때 들어오는 딥링크 처리
        const urlListener = CapApp.addListener('appUrlOpen', async (data) => {
            console.log('🔗 [App] appUrlOpen triggered');
            handleUrl(data.url);
        });

        // 2. 앱이 꺼져 있다가 딥링크로 켜지는 경우 (Cold Start) 처리
        CapApp.getLaunchUrl().then((launchUrl) => {
            if (launchUrl?.url) {
                console.log('🔗 [App] Launch URL detected (Cold Start)');
                handleUrl(launchUrl.url);
            }
        });

        return () => {
            urlListener.then(l => l.remove());
        };
    }, []);

    const handlePermissionComplete = () => {
        setShowPermissionGuide(false);
    };

    // [V14] Safety Timeout for Loading Screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500); // Force disable loading after 2.5s
        return () => clearTimeout(timer);
    }, []);

    // [Persistence] Save currentScreen
    // [Fix] 'active' 화면은 절대 저장하지 않음 → 앱 재시작 시 항상 홈 화면에서 시작
    useEffect(() => {
        console.log('🔄 [App.tsx] CurrentScreen 변경됨:', currentScreen);
        if (currentScreen && currentScreen !== 'active') {
            localStorage.setItem('currentScreen', currentScreen);
        } else if (currentScreen === 'active') {
            // 운행 화면은 저장하지 않고 home으로 대체 저장
            localStorage.setItem('currentScreen', 'home');
        }
    }, [currentScreen]);

    const [trips, setTrips] = useState<Trip[]>(() => {
        const savedTrips = localStorage.getItem('trips');
        return savedTrips ? JSON.parse(savedTrips) : [];
    });
    const [activeTrip, setActiveTrip] = useState<Trip | null>(() => {
        // Restore active trip from trips list on boot
        const savedTrips = localStorage.getItem('trips');
        if (savedTrips) {
            const parsed: Trip[] = JSON.parse(savedTrips);
            return parsed.find(t => t.status === 'planning' || t.status === 'waiting' || t.status === 'active') || null;
        }
        return null;
    });

    // Recent Completed Trips (for Home History)
    const recentTrips = trips
        .filter(t => t.status === 'completed' || t.status === 'cancelled')
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5); // Limit to 5

    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [contacts, setContacts] = useState<Contact[]>(() => {
        const savedContacts = localStorage.getItem('contacts');
        if (savedContacts) {
            return JSON.parse(savedContacts);
        }
        return [];
    });
    // [V29] setupFormData Persistence
    const [setupFormData, setSetupFormData] = useState<SetupFormData>(() => {
        const saved = localStorage.getItem('setupFormData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // [Fix] enableDeparture 사용자 설정값 유지 (강제 true 제거)
                // parsed.enableDeparture 가 명시적으로 false 로 저장된 경우 그대로 사용
                if (parsed.enableDeparture === undefined) {
                    parsed.enableDeparture = true; // 값이 없을 때만 기본값 적용
                }
                return parsed;
            } catch (e) {
                console.error('Failed to parse setupFormData', e);
            }
        }
        return {
            departure: '',
            destination: '',
            enableDeparture: true, // 최초 사용 시 기본값 ON
            enableArrival: true,
            recipient: '',
            departureCondition: 0,
            departureTitle: '[#{출발지}]출발',
            departureMessage: '#{발송자}님이 목적지로 출발하였습니다. 도착 예정시간에 맞춰 기다려 주세요.\n\n▶출발지:#{출발지}\n▶도착지:#{도착지}\n▶예상 소모시간:약 #{남은시간}분\n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.',
            waypointTitle: '[#{경유지}]근처',
            waypointMessage: '#{발송자}님이 운행중입니다. 도착 예정시간에 맞춰 기다려 주세요.\n\n▶지금 [#{경유지}]를 지나고 있습니다.\n▶약 [#{남은시간}]분 후 도착합니다.\n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.',
            arrivalCondition: 5,
            arrivalTitle: '[#{도착지}]도착',
            arrivalMessage: '#{발송자}님이 목적지에 도착하였습니다.\n\n▶[#{도착지}]부근입니다. \n▶약 [#{남은시간}]분 후 도착합니다. \n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.',
            navigationInfo: null,
            selectedDestinationForNav: null,
        };
    });


    // Save setupFormData whenever it changes
    useEffect(() => {
        localStorage.setItem('setupFormData', JSON.stringify(setupFormData));
    }, [setupFormData]);

    // Update activeTrip if trips change (e.g. status update)
    useEffect(() => {
        // [Fix] completed/cancelled 상태는 activeTrip으로 복원하지 않음
        // handleCompleteTrip 직후 trips 변경으로 인해 completed 상태 trip이 active로 되돌아가는 버그 방지
        const current = trips.find(t => t.status === 'planning' || t.status === 'waiting' || t.status === 'active');
        if (current && (!activeTrip || activeTrip.id !== current.id)) {
            setActiveTrip(current);
        } else if (!current && activeTrip && activeTrip.status !== 'completed' && activeTrip.status !== 'cancelled') {
            // activeTrip이 completed/cancelled 로 전환된 경우에는 null로 유지 (이미 handleCompleteTrip/handleCancelTrip에서 처리)
            setActiveTrip(null);
        }
        // activeTrip이 이미 null이거나 completed인 경우는 건드리지 않음
    }, [trips]);

    // [v_fix] Proactive Sync for Background Trip Completion
    // 앱이 실행되거나 홈 화면에 머물 때 백그라운드에서 완료된 운행이 있는지 확인하여
    // JS 상태가 '운행 중'으로 꼬여서 새 예약이 안 되는 현상 방지
    useEffect(() => {
        if (!isLoadingData && activeTrip && currentScreen !== 'active' && currentScreen !== 'intro') {
            const syncBackgroundCompletion = async () => {
                try {
                    const { TripNotification } = await import('./plugins/TripNotificationPlugin');
                    // @ts-ignore
                    const state = await TripNotification.checkCurrentStatus();
                    if (state && state.status === 'completed') {
                        console.log('🏁 [App] Background Completion Detected. Redirecting to active screen for completion modal.');
                        setCurrentScreen('active');
                    }
                } catch (e) {
                    console.error('[App] Background Sync Failed:', e);
                }
            };
            syncBackgroundCompletion();
        }
    }, [isLoadingData, activeTrip, currentScreen]);


    // Save trips to localStorage whenever they change
    useEffect(() => {
        const stringifiedTrips = trips.map(t => ({
            ...t,
            // [Fix] waypoints가 이미 string이면 재직렬화하지 않음
            // 매 저장 시마다 JSON.stringify(string) 반복 → 이중/삼중 인코딩 방지
            waypoints: typeof t.waypoints === 'string'
                ? t.waypoints
                : JSON.stringify(t.waypoints || [])
        }));
        localStorage.setItem('trips', JSON.stringify(stringifiedTrips));
    }, [trips]);

    // Save contacts to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }, [contacts]);

    // User Profile State
    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : {
            name: '게스트',
            email: '',
            phone: '',
            points: 0,
            car_number_1: '',
            car_number_2: '',
            car_number_3: '',
            use_car_number: false,
            pointHistory: [],
        };
    });
    useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    // [V37] Aligo Template Migration (Force Aggressive Sync)
    useEffect(() => {
        if (isLoadingData) return;

        const MIGRATION_VERSION = 'v20260410_sync_v2';
        const lastMigration = localStorage.getItem('last_template_migration');
        const savedSetupStr = localStorage.getItem('setupFormData');

        // [V37] Check if update is needed (Version mismatch OR content still contains old keywords)
        const needsUpdate = lastMigration !== MIGRATION_VERSION ||
            (savedSetupStr && (savedSetupStr.includes('솔라피') || savedSetupStr.includes('#{사용자}')));

        if (needsUpdate) {
            console.log('🔄 [App] Aligo Template Migration Triggered (Aggressive)...');

            if (savedSetupStr) {
                try {
                    const setup = JSON.parse(savedSetupStr);
                    console.log('📦 Updating setupFormData to Aligo defaults (Force Sync)');
                    const updatedSetup = {
                        ...setup,
                        departureTitle: '[#{출발지}]출발',
                        departureMessage: '#{발송자}님이 목적지로 출발하였습니다. 도착 예정시간에 맞춰 기다려 주세요.\n\n▶출발지:#{출발지}\n▶도착지:#{도착지}\n▶예상 소모시간:약 #{남은시간}분\n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.',
                        waypointTitle: '[#{경유지}]근처',
                        waypointMessage: '#{발송자}님이 운행중입니다. 도착 예정시간에 맞춰 기다려 주세요.\n\n▶지금 [#{경유지}]를 지나고 있습니다.\n▶약 [#{남은시간}]분 후 도착합니다.\n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.',
                        arrivalTitle: '[#{도착지}]도착',
                        arrivalMessage: '#{발송자}님이 목적지에 도착하였습니다.\n\n▶[#{도착지}]부근입니다. \n▶약 [#{남은시간}]분 후 도착합니다. \n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.',
                    };
                    localStorage.setItem('setupFormData', JSON.stringify(updatedSetup));
                    setSetupFormData(updatedSetup);
                } catch (e) { console.error('Migration failed', e); }
            }

            localStorage.setItem('last_template_migration', MIGRATION_VERSION);
            console.log('✅ [App] Migration Complete');
        }
    }, [isLoadingData]);

    // [Supabase] 인증 상태 리스너 - 로그인 시 userProfile 업데이트
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔵 [Auth State] Event:', event);

            // [V28 Fix] INITIAL_SESSION 및 TOKEN_REFRESHED 시에도 프로필을 로드하도록 수정
            const isLoggedIn = (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED');

            if (isLoggedIn && session?.user) {
                console.log(`✅ [Auth State] ${event} 이벤트 감지 - 프로필 로딩 시작`);

                const googleName = session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    session.user.email?.split('@')[0] ||
                    '사용자';

                // [중요] 토큰을 먼저 저장해야 이후 fetch가 권한 에러 없이 작동함
                localStorage.setItem('userId', session.user.id);
                localStorage.setItem('supa_session_token', session.access_token);
                setAuthToken(session.access_token); // [V28] API Helper와 동기화

                // [수정] Supabase에서 포인트 및 차량 정보 로딩 (Direct Fetch)
                let userPoints = 0;
                let car1 = '';
                let car2 = '';
                let car3 = '';
                let useCar = false;

                try {
                    const { directSupabaseFetch } = await import('./lib/supabaseUtils');
                    // [V28] 차량 번호 컬럼 포함하여 조회
                    const profiles = await directSupabaseFetch(`profiles?id=eq.${session.user.id}&select=points,car_number_1,car_number_2,car_number_3,use_car_number`);

                    if (profiles && profiles.length > 0) {
                        const p = profiles[0];
                        userPoints = p.points || 0;
                        car1 = p.car_number_1 || '';
                        car2 = p.car_number_2 || '';
                        car3 = p.car_number_3 || '';
                        useCar = p.use_car_number || false;
                        console.log(`💰 [App.tsx] Supabase 데이터 로딩 성공 (포인트: ${userPoints}P)`);
                    } else {
                        console.warn('⚠️ [App.tsx] 프로필 없음, 기본값 사용');
                    }
                } catch (err) {
                    console.error('❌ [App.tsx] Supabase 데이터 로딩 오류 (쿼리 실패 가능성 있음):', err);
                    // 에러가 나더라도 UI가 멈추지 않게 기본값 유지
                }

                // [중요] DB 거치지 않고 즉시 상태 업데이트
                const newProfile: UserProfile = {
                    name: googleName,
                    email: session.user.email || '',
                    phone: '',
                    points: userPoints,
                    car_number_1: car1,
                    car_number_2: car2,
                    car_number_3: car3,
                    use_car_number: useCar,
                    pointHistory: [],
                };

                localStorage.removeItem('userProfile');
                setUserProfile(newProfile);
                localStorage.setItem('userProfile', JSON.stringify(newProfile));
                localStorage.setItem('userId', session.user.id);
                localStorage.setItem('supa_session_token', session.access_token);
                setAuthToken(session.access_token); // [V28] API Helper와 동기화

                // 이미 홈 화면 등이 아니면 홈으로 이동 (Intro에서 로그인 성공 시)
                if (currentScreen === 'intro' || currentScreen === 'login' || currentScreen === 'emailLogin') {
                    setCurrentScreen('home');
                }

                // [백그라운드] Profile DB 자동 생성/검증
                setTimeout(async () => {
                    try {
                        const { directSupabaseFetch } = await import('./lib/supabaseUtils');
                        const profiles = await directSupabaseFetch(`profiles?id=eq.${session.user.id}&select=id`);

                        if (!profiles || profiles.length === 0) {
                            console.log('🔵 [Background] Profile 자동 생성 시작...');
                            await directSupabaseFetch('profiles', {
                                method: 'POST',
                                body: JSON.stringify({
                                    id: session.user.id,
                                    full_name: googleName,
                                    email: session.user.email,
                                    points: 0
                                })
                            });
                            console.log('✅ [Background] Profile 자동 생성 완료');
                        }
                    } catch (error) {
                        console.error('❌ [Background] Profile 생성/검증 에러:', error);
                    }
                }, 100);

            } else if (event === 'SIGNED_OUT') {
                console.log('🔵 [Auth State] SIGNED_OUT 이벤트');
                performForceLogout(); // Use the unified cleanup logic
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    // [Fix] 앱 재시작 시 항상 홈 화면으로 시작.
    // 운행 중인 예약은 홈 화면의 카드를 통해 접근.
    // 이전의 'trip_active → active 화면 강제 전환' 로직 제거.
    useEffect(() => {
        // trip_active 플래그가 있더라도 화면을 강제 전환하지 않음.
        // 홈 화면의 activeTrips 카드가 운행 중 상태를 표시하므로 충분함.
        if (localStorage.getItem('trip_active') === 'true') {
            console.log('🏠 [App] trip_active 감지. 홈 화면에서 카드로 접근 유도.');
            // 화면 전환 안 함 - 홈에서 카드 클릭으로 접근
        }
    }, []);

    const deductPoints = async (amount: number, description: string = 'SMS 알림 발송 차감') => {
        console.log(`💰 [Deduction] Point Deduction Started: ${amount}P for ${description}`);
        setUserProfile(prev => {
            const newPoints = Math.max(0, (prev.points || 0) - amount);
            return { ...prev, points: newPoints };
        });

        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                const newBalance = await handlePointTransaction({
                    userId: userId,
                    amount: amount,
                    type: 'used',
                    description: description
                });
                console.log(`💰 [Deduction] Sync success. New balance: ${newBalance}P`);
                setUserProfile(prev => ({ ...prev, points: newBalance }));
            }
        } catch (e) {
            console.error("❌ [Deduction] Sync failed:", e);
        }
    };

    const handleCreateTrip = async (trip: Trip) => {
        try {
            const { TripNotification } = await import('./plugins/TripNotificationPlugin');

            // [Phase 1: Sync & Block Check]
            let isNativeRunning = false;
            try {
                // @ts-ignore
                const serviceStatus = await TripNotification.isServiceRunning();
                isNativeRunning = serviceStatus && serviceStatus.running;

                // Native 서비스가 실행 중이라도 실제 상태가 completed이면 차단 안 함
                if (isNativeRunning) {
                    // @ts-ignore
                    const currentState = await TripNotification.checkCurrentStatus();
                    if (currentState && currentState.status === 'completed') {
                        console.log('[handleCreateTrip] Native 서비스 completed 상태 - 새 예약 허용');
                        isNativeRunning = false;
                        // [Fix] 잔류 trip 상태 정리 (React state + Storage)
                        setActiveTrip(null);
                        localStorage.removeItem('trip_active');
                        try { await TripNotification.stopNotification(); } catch (e) { }
                    }
                }
            } catch (e) {
                console.warn('[handleCreateTrip] 서비스 상태 확인 실패:', e);
            }

            // [CRITICAL FIX] activeTrip 중 실제 '진행 중' 상태만 차단
            // Native 서비스가 실행 중이 아니라면, storage에 잔류 상태가 있더라도 무시하고 청소 후 진행
            const isCurrentlyActiveInStorage = localStorage.getItem('trip_active') !== null;

            if (!isNativeRunning && isCurrentlyActiveInStorage) {
                console.log('🧹 [handleCreateTrip] 서비스는 죽어있으나 storage 잔류 감지 - 자동 청소');
                localStorage.removeItem('trip_active');
                setActiveTrip(null);
            }

            if (isNativeRunning) {
                // [V37] Check if we are UPDATING the current active trip
                const isModificationOfCurrent = activeTrip && activeTrip.id === trip.id;

                if (isModificationOfCurrent) {
                    console.log('🔄 [handleCreateTrip] Updating current active trip - Stopping previous service first');
                    try {
                        const { TripNotification: TN } = await import('./plugins/TripNotificationPlugin');
                        await TN.stopNotification();
                        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for native stop
                    } catch (e) { console.warn('Failed to stop service during update', e); }
                } else {
                    console.log('🚨 운행 중 감지 - 예약 차단 (Native Service Running)');
                    setAlertState({ open: true, message: '🚨 이미 운행 중인 예약이 있습니다.\n\n운행을 완료하거나 취소한 후 다시 예약해주세요.' });
                    return;
                }
            }

            console.log('🚀 대기 없음, 즉시 출발!');
            console.log('🔵 [예약] 1단계: 잔액 조회 시작...');

            let userId = 'unknown';

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    userId = user.id;
                    const { data: profile, error: fetchError } = await supabase
                        .from('profiles')
                        .select('points')
                        .eq('id', userId)
                        .single();

                    if (!fetchError && profile) {
                        const currentPoints = profile.points || 0;
                        // ✅ [Rule 9 Fix] 50P 미만 시 예약 원천 차단
                        if (currentPoints < 50) {
                            console.warn(`🚨 [예약 차단] 포인트 부족 (${currentPoints}P)`);
                            setAlertState({
                                open: true,
                                message: `🚨 포인트가 부족합니다.\n\n현재 잔액: ${currentPoints}P\n최소 50P 이상 보유 시 예약이 가능합니다.`
                            });
                            return; // 진행 중단
                        }
                    }
                }
            } catch (e: any) {
                console.error('❌ [조회] 잔고 확인 중 오류:', e.message);
            }

            // [FIX] SMS/카카오 템플릿 완전 분리
            // - SMS: 사용자가 '설정 > 문자 템플릿 관리'에서 수정한 sms_templates 사용
            // - 카카오: Solapi 승인 템플릿과 100% 일치해야 함
            const SMS_DEFAULT = {
                departure: '{출발지}에서 출발했습니다. 약 {남은시간}분 후 도착 예정입니다.',
                waypoint: '{경유지}를 지나고 있습니다. 약 {남은시간}분 후 도착 예정입니다.',
                arrival: '{도착지} 근처입니다. 곧 도착 예정입니다.'
            };

            const KAKAO_TEMPLATES = {
                departure: `[#{출발지}]출발\n\n#{발송자}님이 등록하신 [곧 도착해요]서비스가 시작되었습니다. \n\n▶출발지:#{출발지}\n▶도착지:#{도착지}\n▶예상 소요시간:약 #{남은시간}분\n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.`,
                waypoint: `[#{경유지}]통과\n\n#{발송자}님이 운행 중입니다. \n\n▶현재위치:#{경유지} 부근\n▶남은시간:약 #{남은시간}분\n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.`,
                arrival: `[#{도착지}]도착예정\n\n#{발송자}님이 등록하신 도착 알림입니다. \n\n▶도착지:#{도착지} 부근\n▶남은시간:약 #{남은시간}분 이내\n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.`
            };

            const KAKAO_TITLES = {
                // [Fix KKO_3016] 올톡 등록 템플릿 title과 정확히 일치해야 함 (#{VAR2}는 Oltalk가 치환)
                // 11091 출발: title = [#{VAR2}] 출발 (공백 있음)
                departure: `[#{VAR2}] 출발`,
                // 11092 경유지: title = [#{VAR2}]근처
                waypoint: `[#{VAR2}]근처`,
                // 11093 도착: title = [#{VAR2}]부근 (도착 아님!)
                arrival: `[#{VAR2}]부근`,
            };

            let templates = SMS_DEFAULT;
            let titles = { departure: '', waypoint: '', arrival: '' }; // 기본값 빈값 (문자는 제목 없음)

            if (trip.smsMode === 'kakao') {
                // 카카오: 승인받은 정식 템플릿 및 강조제목 강제 사용
                templates = KAKAO_TEMPLATES;
                titles = KAKAO_TITLES;
            } else {
                // SMS: 사용자 수정 가능한 sms_templates 우선 로드
                const savedSms = localStorage.getItem('sms_templates') || localStorage.getItem('message_templates');
                if (savedSms) {
                    try {
                        const t = JSON.parse(savedSms);
                        templates = {
                            departure: t.departure || SMS_DEFAULT.departure,
                            waypoint: t.waypoint || SMS_DEFAULT.waypoint,
                            arrival: t.arrival || SMS_DEFAULT.arrival
                        };
                    } catch { /* 파싱 실패 시 기본값 유지 */ }
                }
            }

            // [차량관리] 차량번호 프리픽스 추가 로직 (SMS 전용)
            const carPrefix = (trip.smsMode !== 'kakao' && trip.selectedCar)
                ? `차량번호 : ${trip.selectedCar}\n` : '';

            const pluginData = {
                ...trip,
                notifications: JSON.stringify(trip.notifications),
                timeRemaining: trip.estimatedTime,
                distance: trip.estimatedDistance,
                waypoints: JSON.stringify(trip.waypoints || []),
                destLat: trip.destinationLat,
                destLng: trip.destinationLng,
                initialStatus: trip.initialStatus || 'waiting',
                senderName: userProfile.name || '게스트',
                smsMode: trip.smsMode || 'sms_single',
                departureMessage: carPrefix + templates.departure,
                waypointMessage: carPrefix + templates.waypoint,
                arrivalMessage: carPrefix + templates.arrival, // [Fix] missing addition
                departureTitle: titles.departure,
                waypointTitle: titles.waypoint,
                arrivalTitle: titles.arrival,
                supabaseUrl: (import.meta as any).env.VITE_SUPABASE_URL,
                supabaseAnonKey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY,
            };
            console.log('🔗 [V_FIX] Passing credentials to Native:', pluginData.supabaseUrl,
                pluginData.supabaseAnonKey?.substring(0, 10) + '...');

            try {
                // @ts-ignore
                await TripNotification.startNotification({ tripData: pluginData });
                console.log('✅ [예약] 2단계 완료: Native Service 시작 성공');

            } catch (serviceError: any) {
                console.error('❌ [예약] 서비스 시작 실패:', serviceError);
                setAlertState({ open: true, message: '서비스 시작 실패: ' + (serviceError.message || JSON.stringify(serviceError)) });
                return;
            }

            console.log('🔵 [예약] 3단계: 완료 처리 (대기 모드로 시작)...');

            const newActiveTrip = { ...trip, status: 'waiting' as const, sentMessages: [] };
            setTrips(prev => [...prev, newActiveTrip]);
            setActiveTrip(newActiveTrip);
            localStorage.setItem('trip_active', 'true');

            console.log('⏱️ [예약] 2초 후 운행 화면으로 강제 전환');
            setTimeout(() => {
                console.log('✅ [예약] 운행 화면으로 강제 전환 실행');
                setCurrentScreen('active');
                
                // [Fix] 화면 전환 후 폼을 초기화하여 이전 화면에서 UI가 깜빡이는 현상 방지
                setSetupFormData({
                    departure: '',
                    destination: '',
                    enableDeparture: true,
                    enableArrival: true,
                    recipient: '',
                    departureCondition: 0,
                    departureMessage: '출발했습니다.',
                    arrivalCondition: 5,
                    arrivalMessage: '[알림] 현재 {currentLocation} 근처입니다. {destination}까지 약 {time}분 남았습니다.',
                    navigationInfo: null,
                    selectedDestinationForNav: null,
                });
            }, 2000);

            // [V27] REMOVED: Pre-payment Logic. Moved to Post-payment in NavigationActive.tsx
            // if (shouldDeductPoints) { ... }

        } catch (error) {
            console.error('Failed to start trip service:', error);
            setAlertState({ open: true, message: '서비스 시작 실패: ' + JSON.stringify(error) });
        }
    };

    const handleUpdateTrip = (updatedTrip: Trip) => {
        setTrips(prev => {
            const updated = prev.map(t => t.id === updatedTrip.id ? updatedTrip : t);

            // [History limit] 20건 유지 로직
            const historyTrips = updated.filter(t => t.status === 'completed' || t.status === 'cancelled');
            if (historyTrips.length > 20) {
                // 시간순 정렬 (오름차순이거나 기준에 따라, 최신순 유지)
                const sortedHistory = [...historyTrips].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                const idsToKeep = new Set(sortedHistory.slice(0, 20).map(t => t.id));
                return updated.filter(t => (t.status !== 'completed' && t.status !== 'cancelled') || idsToKeep.has(t.id));
            }
            return updated;
        });
        if (activeTrip?.id === updatedTrip.id) {
            setActiveTrip(updatedTrip);
        }
    };

    const handleCancelTrip = async () => {
        if (activeTrip) {
            const tripId = activeTrip.id;
            const updatedTrip = { ...activeTrip, status: 'cancelled' as const };
            handleUpdateTrip(updatedTrip);

            // [Fix] 서비스 중지 및 알림 제거
            try {
                const { TripNotification } = await import('./plugins/TripNotificationPlugin');
                await TripNotification.stopNotification();
                await new Promise(resolve => setTimeout(resolve, 300));
                console.log("✅ [Cancel] Service stopped and notification cleared");
            } catch (err) {
                console.error("❌ [Cancel] Failed to stop service:", err);
            }

            // [Fix] localStorage 완전 정리 (모든 관련 키 삭제)
            localStorage.removeItem(`trip_completed_${tripId}`);
            localStorage.removeItem(`sms_sent_${tripId}`);
            // SharedPreferences 미러링 키 정리
            localStorage.removeItem('trip_completed');
            localStorage.removeItem('trip_active');

            setActiveTrip(null);
            setCurrentScreen('home');

            // 폼 데이터 초기화
            setSetupFormData({
                departure: '',
                destination: '',
                enableDeparture: true,
                enableArrival: true,
                recipient: '',
                departureCondition: 0,
                departureMessage: '출발했습니다.',
                arrivalCondition: 5,
                arrivalMessage: '[알림] 현재 {currentLocation} 근처입니다. {destination}까지 약 {time}분 남았습니다.',
                navigationInfo: null,
                selectedDestinationForNav: null,
            });
        }
    };


    // [Fix] Handle Trip Completion (Success)
    // NavigationActive에서 최신 trip 데이터(sentMessages, completedAt 포함)를 직접 전달받음
    // activeTrip state는 타이밍 문제로 구 버전일 수 있으므로 파라미터 우선 사용
    const handleCompleteTrip = async (latestTrip?: Trip) => {
        const targetTrip = latestTrip || activeTrip;
        if (targetTrip) {
            console.log("✅ [App] Trip Completed. sentMessages:", targetTrip.sentMessages, "completedAt:", targetTrip.completedAt);

            const completedTrip = { ...targetTrip, status: 'completed' as const };
            setTrips(prev => {
                const updated = prev.map(t => t.id === completedTrip.id ? completedTrip : t);
                if (!updated.find(t => t.id === completedTrip.id)) {
                    updated.push(completedTrip);
                }
                return updated;
            });

            localStorage.setItem(`trip_completed_${targetTrip.id}`, 'true');

            setActiveTrip(null);
            localStorage.removeItem('trip_active');
            localStorage.removeItem('trip_completed');

            setSetupFormData(prev => ({ ...prev, navigationInfo: null }));
            setCurrentScreen('home');
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        setShowLogoutModal(false);

        const forceLogoutTimer = setTimeout(() => {
            console.warn('⚠️ [Logout] Supabase 응답 없음 - 강제 로그아웃 실행');
            performForceLogout();
        }, 3000);

        try {
            await supabase.auth.signOut();
            clearTimeout(forceLogoutTimer);
            console.log('✅ [Logout] Supabase 로그아웃 성공');
            performForceLogout();
        } catch (error) {
            clearTimeout(forceLogoutTimer);
            console.error('❌ [Logout] Supabase 로그아웃 실패:', error);
            performForceLogout();
        }
    };

    const performForceLogout = () => {
        setUserProfile({
            name: '게스트',
            email: '',
            phone: '',
            points: 0,
            pointHistory: [],
        });

        // [Persistence Fix] Only clear session-specific data
        // DO NOT clear: 'contacts', 'trips', 'kakao_recent_searches', 'setupFormData'
        localStorage.removeItem('trip_active');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userId');
        localStorage.removeItem('supa_session_token');
        localStorage.removeItem('setupFormData'); // Reset setup form on logout for safety

        // localStorage.clear(); // ❌ This was deleting contacts and history

        setCurrentScreen('login');
    };

    const handleSelectContacts = (contacts: Contact[]) => {
        setSelectedContacts(contacts);
        setCurrentScreen('setup');
    };

    const handleToggleFavoriteTrip = (tripId: string) => {
        setTrips(prev => prev.map(t =>
            t.id === tripId ? { ...t, isFavorite: !t.isFavorite } : t
        ));
    };



    const handleDeleteTrip = (tripId: string) => {
        setTrips(trips.filter(t => t.id !== tripId));
    };

    const handleClearHistory = () => {
        setTrips(prev => prev.filter(t => t.status !== 'completed' && t.status !== 'cancelled'));
    };

    const handleEditActiveTrip = async (trip: Trip) => {
        await handleCancelTrip();
        setTimeout(() => {
            handleLoadTripToSetup(trip, true);
        }, 500);
    };

    const handleRebookTrip = (trip: Trip) => {
        const { id, startTime, startLat, startLng, notifications, ...rest } = trip;
        const resetNotifications = notifications.map(n => ({
            ...n,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            status: 'pending' as const
        }));

        const newTrip: Trip = {
            ...rest,
            id: Date.now().toString(),
            status: 'planning',
            createdAt: new Date().toISOString(),
            notifications: resetNotifications,
            startLat: trip.startLat,
            startLng: trip.startLng,
            sentMessages: [], // [V_FIX] Reset history for rebooked trip
        };

        setTrips((prev) => [...prev, newTrip]);
        setCurrentScreen('list');
    };

    // [New] Load Trip to Setup (Edit before Start)
    const handleLoadTripToSetup = (trip: Trip, bypassGuard: boolean = false) => {
        // [V36] Active Trip Guard
        // Check if there is already an active trip running
        const isTripActive = localStorage.getItem('trip_active') === 'true' || activeTrip !== null;

        if (!bypassGuard && isTripActive) {
            setAlertState({ open: true, message: "운행 중에는 새로운 예약을 불러올 수 없습니다.\n현재 운행을 종료하거나 취소한 후 다시 시도해주세요." });
            return;
        }

        // [V36] Parse Waypoints (Trigger Locations)
        let parsedTriggerLocations: { lat: number, lng: number, name: string, address: string }[] = [];
        try {
            if (trip.waypoints) {
                const parsed = JSON.parse(trip.waypoints);
                // Ensure match TriggerLocation type (add address if missing)
                parsedTriggerLocations = parsed.map((loc: any) => ({
                    lat: loc.lat,
                    lng: loc.lng,
                    name: loc.name,
                    address: loc.address || ''
                }));
            }
        } catch (e) {
            console.warn("Failed to parse waypoints for setup:", e);
        }

        setSetupFormData({
            departure: '', // [Fix] Always clear start point (User Request)
            destination: trip.destination,
            recipient: trip.recipient || '',
            departureCondition: 0,
            departureTitle: trip.departureTitle || '[#{출발지}]출발',
            departureMessage: trip.departureMessage || '#{발송자}님이 목적지로 출발하였습니다. 도착 예정시간에 맞춰 기다려 주세요.\n\n▶출발지:#{출발지}\n▶도착지:#{도착지}\n▶예상 소모시간:약 #{남은시간}분\n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.',
            waypointTitle: trip.waypointTitle || '[#{경유지}]근처',
            waypointMessage: trip.waypointMessage || '#{발송자}님이 운행중입니다. 도착 예정시간에 맞춰 기다려 주세요.\n\n▶지금 [#{경유지}]를 지나고 있습니다.\n▶약 [#{남은시간}]분 후 도착합니다.\n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.',
            arrivalCondition: Number(trip.triggerValue) || 5,
            arrivalTitle: trip.arrivalTitle || '[#{도착지}]도착',
            arrivalMessage: trip.arrivalMessage || '#{발송자}님이 목적지에 도착하였습니다.\n\n▶[#{도착지}]부근입니다. \n▶약 [#{남은시간}]분 후 도착합니다. \n\n※수신자님의 [곧 도착해요]서비스 신청에 따른 단계별 알림입니다.',
            navigationInfo: null,
            selectedDestinationForNav: (trip.destinationLat && trip.destinationLng)
                ? {
                    name: trip.destination,
                    x: trip.destinationLng?.toString() || '0',
                    y: trip.destinationLat?.toString() || '0',
                    lat: trip.destinationLat,
                    lng: trip.destinationLng,
                    address: trip.destination,
                    description: trip.destination, // [Fix2] 표시용 텍스트 확보
                    structured_formatting: {
                        main_text: trip.destination,
                        secondary_text: ''
                    }
                }
                : null, // [Fix2] lat/lng 없으면 null → 사용자가 직접 재선택
            enableArrival: true,
            enableDeparture: trip.enableDeparture ?? true,
            triggerLocations: parsedTriggerLocations
        });


        // Load Contacts if possible (Simple name matching or empty)
        // We don't have full contact objects here easily unless we match by phone
        setSelectedContacts([]);

        setCurrentScreen('setup');
    };

    // [V36] Enter Favorites Selection Mode
    const handleEnterFavoritesSelectionMode = () => {
        // Active Trip Guard - only block when truly running (active), not merely 'waiting'
        const isTripActive = activeTrip !== null && activeTrip.status === 'active';
        if (isTripActive) {
            setAlertState({ open: true, message: "운행 중에는 즐겨찾기를 추가할 수 없습니다." });
            return;
        }

        setIsFavoritesSelectionMode(true);
        setAlertState({ open: true, message: "완료 내역을 선택해 주세요" });
        setCurrentScreen('list');
    };

    const handleResetAndNavigateSetup = () => {
        setSetupFormData({
            departure: '',
            destination: '',
            recipient: '',
            departureCondition: 0,
            departureMessage: '출발했습니다.',
            arrivalCondition: 5,
            arrivalMessage: '[알림] 현재 {currentLocation} 근처입니다. {destination}까지 약 {time}분 남았습니다.',
            navigationInfo: null,
            selectedDestinationForNav: null,
            enableArrival: true,
            enableDeparture: (() => {
                const saved = localStorage.getItem('preferred_enable_departure');
                return saved !== null ? JSON.parse(saved) : true;
            })(),
        });
        setSelectedContacts([]);
        setCurrentScreen('setup');
    };

    useEffect(() => {
        // [V28 Fix] Redundant checkSession removed. handled by onAuthStateChange.
        // Initial token setting for non-event cases if needed (optional since handled in onAuthStateChange)

        if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
            import('./plugins/TripNotificationPlugin').then(async ({ TripNotification }) => {
                try {
                    console.log("Requesting Battery Optimization Ignore...");
                    await TripNotification.requestIgnoreBatteryOptimizations();
                } catch (e) {
                    console.error("Failed to request battery optimization ignore", e);
                }
            });
        }

        if (Capacitor.isNativePlatform()) {
            StatusBar.show().catch(() => console.log('StatusBar show failed'));
            StatusBar.setStyle({ style: Style.Dark }).catch(() => console.log('StatusBar setStyle failed'));
            StatusBar.setOverlaysWebView({ overlay: false }).catch(() => console.log('StatusBar overlay failed'));
        }
    }, []);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const backButtonListener = CapApp.addListener('backButton', () => {
            const navigationStack: Record<Screen, Screen | null> = {
                'intro': null,
                'home': null,
                'setup': 'home',
                'active': 'home',
                'list': 'home',
                'settings': 'home',
                'contacts': 'setup',
                'contactsManage': 'mypage',
                'favorites': 'mypage',
                'login': 'home',
                'profile': 'mypage',
                'messages': 'mypage',
                'theme': 'mypage',
                'emailLogin': 'login',
                'emailSignup': 'emailLogin',
                'mypage': 'home',
                'admin': 'home'
            };

            const targetScreen = navigationStack[currentScreen];
            if (targetScreen) {
                setCurrentScreen(targetScreen);
            } else {
                CapApp.exitApp();
            }
        });

        return () => {
            backButtonListener.then(handler => handler.remove());
        };
    }, [currentScreen]);

    const renderScreen = () => {
        console.log('🎨 [App.tsx] renderScreen 실행, 현재 화면:', currentScreen);

        // [Auth Guard] 로그인이 필요한 화면인데 이메일 정보가 없으면 로그인 화면으로 리다이렉트
        const protectedScreens = ['home', 'setup', 'active', 'list', 'settings', 'contacts', 'contactsManage', 'favorites', 'profile', 'messages', 'theme', 'mypage', 'admin'];
        if (protectedScreens.includes(currentScreen) && !userProfile.email) {
            console.warn(`🔒 [Auth Guard] 로그인 세션 없음 -> login 화면으로 리다이렉트 (요청: ${currentScreen})`);
            // 즉시 상태 변경 시 렌더링 루프 위험이 있으므로 setTimeout 사용
            setTimeout(() => setCurrentScreen('login'), 0);
            return <LoadingScreen />; // 전환 중 빈 화면 방지
        }

        if (currentScreen === 'login') {
            return (
                <SnsLogin
                    onBack={() => setCurrentScreen('intro')}
                    onNavigate={(screen) => setCurrentScreen(screen)}
                />
            );
        }

        switch (currentScreen) {
            case 'intro': return null;
            case 'home':
                return <HomePage
                    onNavigate={(screen) => {
                        if (screen === 'setup') handleResetAndNavigateSetup();
                        else setCurrentScreen(screen);
                    }}
                    onSelectTrip={setActiveTrip}
                    // ✅ CRITICAL FIX: 완료 마킹된 trip은 '운행중' 카드에서 제외
                    activeTrips={(
                        activeTrip &&
                            localStorage.getItem(`trip_completed_${activeTrip.id}`) !== 'true'
                            ? [activeTrip]
                            : []
                    )}
                    recentTrips={recentTrips}
                    userProfile={userProfile}
                    favoriteTrips={trips.filter(t => t.isFavorite)}
                    onStartTrip={(trip) => {
                        handleLoadTripToSetup(trip);
                    }}
                    onEnterSelectionMode={handleEnterFavoritesSelectionMode} // [V36] Pass handler
                />;
            case 'setup':
                return <NotificationSetup
                    onBack={() => setCurrentScreen('home')}
                    onComplete={handleCreateTrip}
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    selectedContacts={selectedContacts}
                    setSelectedContacts={setSelectedContacts}
                    setupFormData={setupFormData}
                    setSetupFormData={setSetupFormData}
                    contacts={contacts} // [V27] Pass contacts for autocomplete
                    userProfile={userProfile} // [차량관리] 프로필 전달
                />;
            case 'active':
                // ✅ FIX: Check if activeTrip is null before rendering
                // We should theoretically have one if we are here.
                if (!activeTrip) {
                    setCurrentScreen('home');
                    return null;
                }
                return <NavigationActive
                    trip={activeTrip}
                    onUpdate={handleUpdateTrip}
                    onCancel={handleCancelTrip}
                    onEdit={handleEditActiveTrip}
                    onComplete={handleCompleteTrip} // [New] Pass completion handler
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    userPoints={userProfile.points}
                    deductPoints={deductPoints}
                />;
            case 'list':
                return <NotificationList
                    trips={trips}
                    onToggleFavorite={handleToggleFavoriteTrip}
                    selectionMode={isFavoritesSelectionMode} // [V36] Pass selection mode
                    onSelectTrip={(trip) => {
                        if (isFavoritesSelectionMode) {
                            // [V36] Handle Selection Mode: Add to Favorite
                            handleToggleFavoriteTrip(trip.id);
                            setAlertState({ open: true, message: `'${trip.destination}' 즐겨찾기에 추가되었습니다.` });
                            setIsFavoritesSelectionMode(false);
                            setCurrentScreen('home'); // Return to Home
                        } else {
                            // Standard mode: Do nothing or handle navigation
                            // For now, allow viewing details if implemented, but blocked by requirement to use selection mode only for adding
                            console.log('Selected trip', trip);
                        }
                    }}
                    onCancelTrip={(tripId) => handleDeleteTrip(tripId)}
                    onDeleteTrip={handleDeleteTrip}
                    onClearHistory={handleClearHistory}
                    onNavigate={(screen) => {
                        if (screen === 'home' && isFavoritesSelectionMode) {
                            setIsFavoritesSelectionMode(false); // Cleanup on exit
                        }
                        setCurrentScreen(screen);
                    }}
                />;
            case 'settings':
                return <Settings
                    onNavigate={(screen) => {
                        setIsFavoritesSelectionMode(false); // Cleanup
                        setCurrentScreen(screen);
                    }}
                    currentTheme={currentTheme}
                />;
            case 'favorites':
                return <FavoriteTrips
                    trips={trips}
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    onRebook={handleRebookTrip} // Keep for generic rebook if needed
                    onStartTrip={handleLoadTripToSetup} // ✅ [New] For Quick Reserve -> Setup
                    onToggleFavorite={handleToggleFavoriteTrip}
                    onUpdateTrip={handleUpdateTrip}
                    onEnterSelectionMode={handleEnterFavoritesSelectionMode} // [V36] Pass handler
                />;
            case 'contacts':
                return <ContactManagement
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    contacts={contacts}
                    setContacts={setContacts}
                    mode="select"
                    fromScreen="setup"
                    onSelectContacts={handleSelectContacts}
                    selectionMode={true}
                    initialSelectedContacts={selectedContacts}
                />;
            case 'contactsManage':
                return <ContactManagement
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    contacts={contacts}
                    setContacts={setContacts}
                    mode="manage"
                    fromScreen="settings"
                />;

            case 'messages':
                return <MessageManagement onNavigate={(screen) => setCurrentScreen(screen)} />;
            case 'profile':
                return <ProfileEdit
                    userProfile={userProfile}
                    onUpdateProfile={(updated) => setUserProfile(updated)}
                    onNavigate={(screen) => setCurrentScreen(screen)}
                />;

            case 'theme':
                return <ThemeSelector
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    currentTheme={currentTheme}
                    onThemeChange={(theme) => setCurrentTheme(theme)}
                />;
            case 'emailLogin':
                return <EmailLogin
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    currentTheme={currentTheme}
                    onLoginSuccess={() => { }}
                />;
            case 'emailSignup':
                return <EmailSignup
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    currentTheme={currentTheme}
                />;
            case 'mypage':
                return <MyPage onNavigate={(screen) => setCurrentScreen(screen)} userProfile={userProfile} onLogout={handleLogout} />;
            case 'admin':
                // Admin Page access control
                if (userProfile.email !== ADMIN_EMAIL) {
                    setAlertState({ open: true, message: "관리자 권한이 없습니다." });
                    setCurrentScreen('home');
                    return null;
                }
                return <AdminPage onNavigate={(screen) => setCurrentScreen(screen)} />;
            default:
                return null;
        }
    };

    return (
        <div className={`app-container ${currentTheme} w-full h-full`}>
            {/* [V23] Permission Guide Overlay */}
            {showPermissionGuide && (
                <PermissionGuide onComplete={handlePermissionComplete} />
            )}

            {currentScreen === 'intro' ? (
                /* [Fix] intro 화면은 min-h-screen div 없이 단독 렌더 → 하단 공백 제거 */
                <IntroPage onNavigate={(screen) => setCurrentScreen(screen)} />
            ) : (
                <div className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark min-h-screen">
                    {renderScreen()}

                    {/* Bottom Navigation */}
                    {(currentScreen === 'home' || currentScreen === 'list' || currentScreen === 'mypage' || currentScreen === 'setup') && (
                        <div className="fixed bottom-0 left-0 right-0 h-16 pb-8 box-content bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center z-50">
                            <button
                                onClick={() => setCurrentScreen('home')}
                                className={`flex flex-col items-center justify-center w-full h-full ${currentScreen === 'home' ? 'text-app-accent' : 'text-gray-400'}`}
                            >
                                <Home className="w-6 h-6 mb-1" />
                                <span className="text-[10px]">홈</span>
                            </button>
                            <button
                                onClick={() => handleResetAndNavigateSetup()}
                                className={`flex flex-col items-center justify-center w-full h-full ${currentScreen === 'setup' ? 'text-app-accent' : 'text-gray-400'}`}
                            >
                                <Plus className="w-6 h-6 mb-1" />
                                <span className="text-[10px]">예약하기</span>
                            </button>
                            <button
                                onClick={() => setCurrentScreen('list')}
                                className={`flex flex-col items-center justify-center w-full h-full ${currentScreen === 'list' ? 'text-app-accent' : 'text-gray-400'}`}
                            >
                                <History className="w-6 h-6 mb-1" />
                                <span className="text-[10px]">내역보기</span>
                            </button>
                            <button
                                onClick={() => setCurrentScreen('mypage')}
                                className={`flex flex-col items-center justify-center w-full h-full ${currentScreen === 'mypage' ? 'text-app-accent' : 'text-gray-400'}`}
                            >
                                <User className="w-6 h-6 mb-1" />
                                <span className="text-[10px]">마이페이지</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Loading Screen Overlay */}
            {isLoading && <LoadingScreen />}

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />

            <AlertModal
                isOpen={alertState.open}
                onClose={() => setAlertState({ ...alertState, open: false })}
                message={alertState.message}
            />
        </div>
    );
};

export default App;
