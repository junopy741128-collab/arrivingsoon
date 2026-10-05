import { handlePointTransaction } from './lib/supabaseUtils';
import { supabase } from './lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Home, Plus, History, User } from 'lucide-react';

import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { HomePage } from './components/HomePage';
import { NotificationSetup } from './components/NotificationSetup';
// import { DrivingMode } from './pages/DrivingMode'; // Removed
import { NavigationActive } from './components/NavigationActive';
import { NotificationList } from './components/NotificationList';
import { Settings } from './components/Settings';
import { ContactManagement } from './components/ContactManagement';
import { SnsLogin } from './components/SnsLogin';
import { ProfileEdit } from './components/ProfileEdit';
import { MyPage } from './components/MyPage';
import { AdminPage } from './components/AdminPage';
import { MessageManagement } from './components/MessageManagement';
import { FavoriteTrips } from './components/FavoriteTrips';
import { ThemeSelector } from './components/ThemeSelector';
import { EmailLogin } from './components/EmailLogin';
import { EmailSignup } from './components/EmailSignup';
import { type Theme } from './utils/theme';
import { createClient } from './utils/supabase/client';
import { setAuthToken } from './utils/api';
// import { AdBanner } from './components/AdBanner'; // Removed

export type Contact = {
    id: string;
    name: string;
    phone: string;
    phoneNumber?: string; // Added for compatibility
    isFavorite: boolean;
    type: 'phone' | 'kakao';
    group?: string; // Deprecated: use groups instead
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
    destLat?: number; // Added
    destLng?: number; // Added
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
    targetDistance?: number; // Added
    selectedDestinationForNav: any | null; // PlacePrediction object
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
    status: 'planning' | 'active' | 'completed' | 'cancelled';
    estimatedTime: number;
    estimatedDistance: number;
    recipient?: string; // 수신자 이름 또는 연락처
    createdAt?: string; // 생성 시간
    startLat?: number; // 출발지 위도
    startLng?: number; // 출발지 경도
    destinationLat?: number; // 목적지 위도
    destinationLng?: number; // 목적지 경도
    startTime?: number; // 출발 시간 (Timestamp)

    targetDistance?: number; // 자동 발송 트리거 거리 (km)
    isFavorite?: boolean; // 즐겨찾기 여부
    alias?: string; // 즐겨찾기 별칭 (예: 회사, 집)

    // Advanced Trigger
    triggerType?: 'time' | 'distance' | 'waypoint';
    triggerValue?: number | string;
    waypointLat?: number;
    waypointLng?: number;
    waypointName?: string; // 경유지 이름
    recipientName?: string; // 수신자 이름
    waypoints?: string; // JSON String for Multi-Waypoints
    startPoint?: string; // For Waiting UI
    initialStatus?: 'waiting' | 'active'; // 'waiting' or 'active'
};

export type UserProfile = {
    name: string;
    email: string;
    phone: string;
    points: number;
    pointHistory?: PointHistory[];
};

export type Screen = 'home' | 'setup' | 'active' | 'list' | 'settings' | 'contacts' | 'contactsManage' | 'favorites' | 'login' | 'profile' | 'messages' | 'theme' | 'emailLogin' | 'emailSignup' | 'mypage' | 'admin';




const App: React.FC = () => {
    // [v46] Admin email constant
    const ADMIN_EMAIL = 'junopy741128@gmail.com';

    const [currentScreen, setCurrentScreen] = useState<Screen>('home');
    const [currentTheme, setCurrentTheme] = useState<Theme>('dark');
    const [trips, setTrips] = useState<Trip[]>(() => {
        const savedTrips = localStorage.getItem('trips');
        return savedTrips ? JSON.parse(savedTrips) : [];
    });
    const [activeTrip, setActiveTrip] = useState<Trip | null>(() => {
        // Restore active trip from trips list on boot
        const savedTrips = localStorage.getItem('trips');
        if (savedTrips) {
            const parsed: Trip[] = JSON.parse(savedTrips);
            return parsed.find(t => t.status === 'planning' || t.status === 'active') || null;
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
        // Default contacts if none saved
        return [
            { id: '1', name: '김민준', phone: '010-1234-5678', phoneNumber: '01012345678', isFavorite: true, type: 'phone', groups: ['친구'] },
            { id: '2', name: '이수진', phone: '010-2345-6789', phoneNumber: '01023456789', isFavorite: true, type: 'phone', groups: ['가족'] },
            { id: '3', name: '박서연', phone: '010-3456-7890', phoneNumber: '01034567890', isFavorite: false, type: 'phone', groups: ['직장'] },
            { id: '4', name: '최정훈', phone: '010-4567-8901', phoneNumber: '01045678901', isFavorite: false, type: 'phone', groups: ['친구'] },
            { id: '5', name: '정예은', phone: '010-5678-9012', phoneNumber: '01056789012', isFavorite: false, type: 'phone', groups: ['기타'] },
        ];
    });
    const [setupFormData, setSetupFormData] = useState<SetupFormData>({
        departure: '',
        destination: '',
        enableDeparture: false,
        enableArrival: true,
        recipient: '',
        departureCondition: 0,
        departureMessage: '출발했습니다.',
        arrivalCondition: 5,
        arrivalMessage: '[알림] 현재 {currentLocation} 근처입니다. {destination}까지 약 {time}분 남았습니다.',
        navigationInfo: null,
        selectedDestinationForNav: null,
    });

    // Update activeTrip if trips change (e.g. status update)
    useEffect(() => {
        const current = trips.find(t => t.status === 'planning' || t.status === 'active');
        if (current && (!activeTrip || activeTrip.id !== current.id)) {
            setActiveTrip(current);
        } else if (!current && activeTrip) {
            setActiveTrip(null);
        }
    }, [trips]);

    // Save trips to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('trips', JSON.stringify(trips));
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
            pointHistory: [],
        };
    });
    useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    // [Supabase] 로그인 상태 확인 - 이메일이 없으면 로그인 화면으로
    useEffect(() => {
        if (!userProfile.email || userProfile.email === '') {
            setCurrentScreen('login');
        }

        // [New] Request Permissions on Startup
        const reqPerms = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    const { LocalNotifications } = await import('@capacitor/local-notifications');
                    await LocalNotifications.requestPermissions();
                    console.log("🔔 [App] Requested Notification Permissions");
                } catch (e) { console.error(e); }
            }
        };
        reqPerms();
    }, []);

    // [Supabase] 인증 상태 리스너 - 로그인 시 userProfile 업데이트
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔵 [Auth State] Event:', event);
            console.log('🔵 [Auth State] Session:', session ? 'exists' : 'null');

            if (event === 'SIGNED_IN' && session?.user) {
                console.log('✅ [Auth State] SIGNED_IN 이벤트 감지');
                console.log('🔵 [Auth State] User email:', session.user.email);
                console.log('🔵 [Auth State] user_metadata:', session.user.user_metadata);

                // [최종 수정] user_metadata에서 즉시 이름 추출
                const googleName = session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    session.user.email?.split('@')[0] ||
                    '사용자';

                console.log(`🔥 [App.tsx] 감지된 이름: ${googleName}`);

                // [수정] Supabase에서 포인트 로딩 (Direct Fetch)
                let userPoints = 0;
                try {
                    // Import dynamically if needed or assume updated import at top
                    const { directSupabaseFetch } = await import('./lib/supabaseUtils');
                    const profiles = await directSupabaseFetch(`profiles?id=eq.${session.user.id}&select=points`);

                    if (profiles && profiles.length > 0) {
                        userPoints = profiles[0].points || 0;
                        console.log(`💰 [App.tsx] Supabase에서 포인트 로딩: ${userPoints}P`);
                    } else {
                        console.warn('⚠️ [App.tsx] 포인트 로딩 실패 (프로필 없음), 기본값 0 사용');
                    }
                } catch (err) {
                    console.error('❌ [App.tsx] 포인트 로딩 오류:', err);
                }

                // [중요] DB 거치지 않고 즉시 상태 업데이트
                const newProfile = {
                    name: googleName,
                    email: session.user.email || '',
                    phone: '',
                    points: userPoints, // ← Supabase에서 로딩한 값 사용
                    pointHistory: [],
                };

                console.log('🔥 [App.tsx] 프로필 강제 업데이트:', newProfile);

                // localStorage 초기화
                localStorage.removeItem('userProfile');

                // 상태 업데이트
                setUserProfile(newProfile);

                // localStorage 저장
                localStorage.setItem('userProfile', JSON.stringify(newProfile));

                // [추가] userId 저장 (MyPage에서 getSession() 없이 사용)
                localStorage.setItem('userId', session.user.id);
                // [추가] Direct Fetch용 토큰 저장 (getSession() 행잉 방지)
                localStorage.setItem('supa_session_token', session.access_token);
                console.log('✅ [App.tsx] userId 및 토큰 저장 완료');

                console.log('✅ [App.tsx] 프로필 업데이트 완료');
                console.log(`✅ [App.tsx] 최종 이름: ${newProfile.name}`);

                // 홈 화면 이동
                setCurrentScreen('home');

                // [백그라운드] Profile DB 자동 생성 (UI 블로킹 없음)
                setTimeout(async () => {
                    try {
                        const { directSupabaseFetch } = await import('./lib/supabaseUtils');

                        // Check if profile exists
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
                        console.error('❌ [Background] Profile 생성 에러:', error);
                    }
                }, 100);

            } else if (event === 'SIGNED_OUT') {
                console.log('🔵 [Auth State] SIGNED_OUT 이벤트');
                localStorage.removeItem('userProfile');
                setUserProfile({
                    name: '게스트',
                    email: '',
                    phone: '',
                    points: 0,
                    pointHistory: [],
                });
                setCurrentScreen('login');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }, [userProfile]);
    // [추가] 앱 켜질 때 '운행 중'이었는지 확인
    useEffect(() => {
        if (localStorage.getItem('trip_active') === 'true') {
            setCurrentScreen('active'); // 대기 화면으로 바로 이동
        }
    }, []);
    // Point Deduction Logic [Updated]
    const deductPoints = async (amount: number) => {
        // 1. Update UI Optimistically
        setUserProfile(prev => {
            const newPoints = Math.max(0, (prev.points || 0) - amount);
            return { ...prev, points: newPoints };
        });

        // 2. Sync with Backend
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                const { handlePointTransaction } = await import('./lib/supabaseUtils');
                const newBalance = await handlePointTransaction({
                    userId: userId,
                    amount: amount,
                    type: 'used',
                    description: 'SMS 알림 발송 차감'
                });
                // Sync exact balance from server
                setUserProfile(prev => ({ ...prev, points: newBalance }));
            }
        } catch (e) {
            console.error("Failed to sync point deduction:", e);
            // Revert or warn? For now just log.
        }
    };

    const handleCreateTrip = async (trip: Trip) => {
        try {
            // ✅ STEP 1: Check if service is ACTUALLY running (not just activeTrip state)
            const { TripNotification } = await import('./plugins/TripNotificationPlugin');

            // @ts-ignore
            const serviceStatus = await TripNotification.isServiceRunning();
            const isReallyRunning = serviceStatus && serviceStatus.running;

            // ✅ STEP 2: 운행 중이면 차단 (Queue 로직 제거)
            if (activeTrip || isReallyRunning) {
                console.log('🚨 운행 중 감지 - 예약 차단');
                alert('🚨 이미 운행 중인 예약이 있습니다.\n\n운행을 완료하거나 취소한 후 다시 예약해주세요.');
                return; // 예약 차단
            }

            // ✅ STEP 3: No active trip - Start new service immediately
            console.log('🚀 대기 없음, 즉시 출발!');

            // ✅ STEP 3-1: 잔액 조회 (Non-blocking - 백그라운드 실행)
            console.log('🔵 [예약] 1단계: 잔액 조회 시작 (백그라운드)...');

            let userId = 'unknown';
            let shouldDeductPoints = false; // 기본값: 포인트 차감 안 함

            // 백그라운드에서 잔액 조회 (await 없음!)
            (async () => {

                try {
                    console.log('🔵 [백그라운드] 사용자 정보 조회 중...');
                    const { data: { user } } = await supabase.auth.getUser();

                    if (!user) {
                        console.warn('⚠️ [백그라운드] 로그인 정보 없음 - 포인트 차감 건너뜀');
                        return;
                    }

                    userId = user.id;
                    console.log('🔵 [백그라운드] 사용자 ID:', userId);

                    // 프로필 조회
                    const { data: profile, error: fetchError } = await supabase
                        .from('profiles')
                        .select('points')
                        .eq('id', userId)
                        .single();

                    if (fetchError || !profile) {
                        console.warn('⚠️ [백그라운드] 프로필 조회 실패 - 포인트 차감 건너뜀');
                        return;
                    }

                    const currentPoints = profile?.points || 0;
                    console.log(`🔵 [백그라운드] 현재 잔액: ${currentPoints}P`);

                    if (currentPoints >= 100) {
                        shouldDeductPoints = true;
                        console.log('✅ [백그라운드] 잔액 충분 - 나중에 포인트 차감 예정');
                    } else {
                        console.warn(`⚠️ [백그라운드] 포인트 부족 (${currentPoints}P) - 포인트 차감 건너뜀`);
                    }

                } catch (e: any) {
                    console.error('❌ [백그라운드] 잔액 조회 실패:', e.message);
                    console.warn('⚠️ [백그라운드] 에러 발생 - 포인트 차감 건너뜀');
                }
            })();

            // ⚠️ 중요: 잔액 조회를 기다리지 않고 즉시 다음 단계로!
            console.log('✅ [예약] 1단계 완료: 잔액 조회는 백그라운드에서 진행 중');


            // ✅ STEP 3-2: Native Service 시작
            console.log('🔵 [예약] 2단계: 서비스 실행 시작...');

            // Prepare Data for Native (Stringify complex objects)
            const pluginData = {
                ...trip,
                notifications: JSON.stringify(trip.notifications),
                timeRemaining: trip.estimatedTime,
                distance: trip.estimatedDistance,
                waypoints: trip.waypoints,
                destLat: trip.destinationLat,
                destLng: trip.destinationLng,
                initialStatus: trip.initialStatus || 'waiting',
            };

            console.log('🔍 [APP→PLUGIN] trip.estimatedDistance:', trip.estimatedDistance, 'Final distance:', pluginData.distance);

            try {
                // Start Native Service
                // @ts-ignore
                await TripNotification.startNotification({ tripData: pluginData });
                console.log('✅ [예약] 2단계 완료: Native Service 시작 성공');

            } catch (serviceError: any) {
                console.error('❌ [예약] 서비스 시작 실패:', serviceError);
                alert('서비스 시작 실패: ' + (serviceError.message || JSON.stringify(serviceError)));
                return; // 서비스 실패 시 포인트 차감 없이 종료
            }

            // ✅ STEP 3-3: 화면 전환 강제 실행 (블로킹 완전 제거)
            console.log('🔵 [예약] 3단계: 완료 처리 (강제 실행)...');

            const newActiveTrip = { ...trip, status: 'active' as const };
            setTrips(prev => [...prev, newActiveTrip]);
            setActiveTrip(newActiveTrip);
            localStorage.setItem('trip_active', 'true');

            // 폼 초기화
            setSetupFormData({
                departure: '',
                destination: '',
                enableDeparture: false,
                enableArrival: true,
                recipient: '',
                departureCondition: 0,
                departureMessage: '출발했습니다.',
                arrivalCondition: 5,
                arrivalMessage: '[알림] 현재 {currentLocation} 근처입니다. {destination}까지 약 {time}분 남았습니다.',
                navigationInfo: null,
                selectedDestinationForNav: null,
            });

            // ⏱️ 성공 오버레이 표시 후 즉시 화면 전환
            console.log('⏱️ [예약] 2초 후 운행 화면으로 강제 전환');
            setTimeout(() => {
                console.log('✅ [예약] 운행 화면으로 강제 전환 실행');
                setCurrentScreen('active');
            }, 2000);

            // 포인트 차감은 완전히 백그라운드에서 처리 (화면 전환과 무관)
            if (shouldDeductPoints) {
                (async () => {
                    try {
                        console.log('🔵 [백그라운드] 포인트 차감 시작...');
                        const newBalance = await handlePointTransaction({
                            userId: userId,
                            amount: 50,
                            type: 'used',
                            description: `${trip.destination} 예약`
                        });
                        console.log(`✅ [백그라운드] 포인트 차감 성공! 잔액: ${newBalance}P`);
                        setUserProfile(prev => ({ ...prev, points: newBalance }));
                    } catch (error: any) {
                        console.error('❌ [백그라운드] 포인트 차감 실패:', error);
                    }
                })();
            }

            console.log('✅ [예약] 전체 프로세스 완료!');

        } catch (error) {
            console.error('Failed to start trip service:', error);
            alert('서비스 시작 실패: ' + JSON.stringify(error));
        }
    };

    const handleUpdateTrip = (updatedTrip: Trip) => {
        const newTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
        setTrips(newTrips);
        if (activeTrip?.id === updatedTrip.id) {
            setActiveTrip(updatedTrip);
        }
    };

    const handleCancelTrip = async () => {
        if (activeTrip) {
            const updatedTrip = { ...activeTrip, status: 'cancelled' as const };
            handleUpdateTrip(updatedTrip);

            // Stop Background Service (Zombie Fix)
            try {
                const { TripNotification } = await import('./plugins/TripNotificationPlugin');
                await TripNotification.stopNotification();
                // ✅ Wait for cleanup to complete
                await new Promise(resolve => setTimeout(resolve, 500));
                console.log("Service stopped and cleaned up");
            } catch (err) {
                console.error("Failed to stop service:", err);
            }

            setActiveTrip(null);
            setCurrentScreen('home');

            // 폼 초기화
            setSetupFormData({
                departure: '',
                destination: '',
                enableDeparture: false,
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

    // [Supabase] 로그아웃 핸들러 (강제 실행 버전)
    const handleLogout = async () => {
        const confirmed = window.confirm('로그아웃 하시겠습니까?');
        if (!confirmed) return;

        console.log('🔵 [Logout] 로그아웃 시작');

        // 강제 로그아웃 타이머 (3초 후 무조건 실행)
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
            // 에러 발생해도 강제 로그아웃
            performForceLogout();
        }
    };

    // 강제 로그아웃 실행 함수
    const performForceLogout = () => {
        console.log('🔵 [Logout] 강제 로그아웃 실행');

        // userProfile 초기화
        setUserProfile({
            name: '게스트',
            email: '',
            phone: '',
            points: 0,
            pointHistory: [],
        });

        // 로컬 스토리지 완전 초기화
        localStorage.removeItem('trip_active');
        localStorage.clear();

        console.log('✅ [Logout] 로그아웃 완료');
        setCurrentScreen('login');
    };

    const handleSelectContacts = (_contacts: Contact[]) => {
    };


    const handleToggleFavoriteTrip = (tripId: string) => {
        setTrips(trips.map(t => t.id === tripId ? { ...t, isFavorite: !t.isFavorite } : t));
    };

    const handleDeleteTrip = (tripId: string) => {
        setTrips(trips.filter(t => t.id !== tripId));
    };

    const handleRebookTrip = (trip: Trip) => {
        // Clone logic: New ID, Created At, Status=planning
        const { id, startTime, startLat, startLng, notifications, ...rest } = trip;

        // Reset notifications to pending
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
            // Retain nav info but reset tracking data
            startLat: trip.startLat,
            startLng: trip.startLng,
        };

        // Add new trip
        setTrips((prev) => [...prev, newTrip]);
        // Navigate to List (Pending Tab)
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
            enableDeparture: false,
        });
        setSelectedContacts([]);
        setCurrentScreen('setup');
    };

    // Check for OAuth session on mount
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token) {
                setAuthToken(session.access_token);
                console.log('OAuth 로그인 성공 - 초기 세션 확인');
                // If we are on home/login screen, move to setup
                if (currentScreen === 'home' || currentScreen === 'login') {
                    setCurrentScreen('setup');
                }
            }
        };

        checkSession();

        // Request Battery Optimization Ignore (Android)
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

        // Initialize StatusBar
        if (Capacitor.isNativePlatform()) {
            StatusBar.show().catch(() => console.log('StatusBar show failed'));
            StatusBar.setStyle({ style: Style.Dark }).catch(() => console.log('StatusBar setStyle failed'));
            StatusBar.setOverlaysWebView({ overlay: false }).catch(() => console.log('StatusBar overlay failed'));
        }
    }, []);

    // Back Button Handling (Android)
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const backButtonListener = CapApp.addListener('backButton', () => {
            // Define navigation hierarchy
            const navigationStack: Record<Screen, Screen | null> = {
                'home': null, // Exit app on home screen
                'setup': 'home',
                'active': 'home',
                'list': 'home',
                'settings': 'home',
                'contacts': 'setup', // Go back to setup when in contact selection
                'contactsManage': 'settings', // Go back to settings when in contact management
                'favorites': 'settings', // Go back to settings
                'login': 'home',
                'profile': 'settings',
                'messages': 'settings',
                'theme': 'settings',
                'emailLogin': 'login',
                'emailSignup': 'login',
                'mypage': 'home',
                'admin': 'settings',
            };

            const previousScreen = navigationStack[currentScreen];

            if (previousScreen === null) {
                // On home screen, exit app
                CapApp.exitApp();
            } else if (previousScreen) {
                // Navigate to previous screen
                setCurrentScreen(previousScreen);
            }
        });

        return () => {
            backButtonListener.then(handle => handle.remove());
        };
    }, [currentScreen]);

    // Listen for auth changes
    useEffect(() => {
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.access_token) {
                setAuthToken(session.access_token);
                if (currentScreen === 'login' || currentScreen === 'emailLogin' || currentScreen === 'emailSignup') {
                    setCurrentScreen('setup'); // Redirect to Setup instead of Home
                    console.log('Auth state changed, navigating to setup');
                }
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Listen for hash changes (for Notification Click)
    useEffect(() => {
        const handleHashChange = () => {
            console.log('🔵 [Hash Change] New Hash:', window.location.hash);
            if (window.location.hash === '#/navigation-active') {
                console.log('✅ [Hash Nav] Navigating to Active Screen');
                setCurrentScreen('active');
                // Clear hash to allow re-trigger
                window.history.replaceState(null, '', window.location.pathname);
            }
        };

        // Check initial hash
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // [Optimized] Deep Link Handler - 임시 프로필 주입으로 '로그인 중' 화면 건너뛰기
    useEffect(() => {
        if (Capacitor.getPlatform() === 'web') return;

        CapApp.addListener('appUrlOpen', async (data: any) => {
            console.log('🔵 [Deep Link] App opened with URL:', data.url);

            // URL에 토큰이 있는지 확인
            if (data.url && (data.url.includes('access_token') || data.url.includes('login-callback'))) {
                try {
                    const url = data.url;

                    // [New] 에러 파라미터 체크 (서버 설정 오류 등)
                    if (url.includes('error=')) {
                        const params = new URLSearchParams(url.split('?')[1]); // ? 뒤의 파라미터나 # 뒤의 파라미터 확인 필요
                        const errorDesc = params.get('error_description') || params.get('error_code') || '알 수 없는 오류';
                        console.error('❌ [Deep Link] 로그인 에러 감지:', errorDesc);
                        alert(`로그인 실패\n\n서버 설정 오류가 감지되었습니다.\n내용: ${decodeURIComponent(errorDesc)}\n\n(카카오 Client Secret 설정을 확인해주세요)`);
                        return;
                    }

                    const hashIndex = url.indexOf('#');
                    if (hashIndex !== -1) {
                        const params = new URLSearchParams(url.substring(hashIndex + 1));
                        const access_token = params.get('access_token');
                        const refresh_token = params.get('refresh_token');

                        if (access_token && refresh_token) {
                            // ... (Existing Logic)
                            console.log('⚡️ [Deep Link] 토큰 포착! 즉시 진입 시도...');

                            // 1. 토큰에서 사용자 정보 즉시 추출
                            const { data: { user } } = await supabase.auth.getUser(access_token);

                            if (user) {
                                // ... (Existing Logic)
                                console.log('✅ [Deep Link] 사용자 정보 추출 성공!');
                                localStorage.setItem('userId', user.id);

                                setUserProfile({
                                    name: user.user_metadata?.full_name || user.user_metadata?.name || '정종환',
                                    email: user.email || '',
                                    phone: '',
                                    points: 0,
                                    pointHistory: []
                                });

                                // Point Fetch Logic
                                import('./lib/supabaseUtils').then(async ({ directSupabaseFetch }) => {
                                    try {
                                        const profiles = await directSupabaseFetch(`profiles?id=eq.${user.id}&select=points`);
                                        if (profiles?.[0]) {
                                            setUserProfile(prev => ({ ...prev, points: profiles[0].points }));
                                        }
                                    } catch (e) { console.error(e); }
                                });

                                setCurrentScreen('home');
                                await supabase.auth.setSession({ access_token, refresh_token });
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ [Deep Link] 핸들링 오류:', error);
                    alert('로그인 처리 중 오류 발생');
                    setCurrentScreen('home');
                }
            }
        });
    }, []);

    // ✅ CRITICAL FIX: Listen for Service State Updates (Active/Waiting)
    useEffect(() => {
        console.log("DEBUG_v18: [App.tsx] Setting up service listeners...");

        const setupServiceListener = async () => {
            if (!Capacitor.isNativePlatform()) return; // [Fix] Web에서는 실행 안 함

            const { TripNotification } = await import('./plugins/TripNotificationPlugin');
            console.log("DEBUG_v18: [App.tsx] TripNotification plugin imported");

            // ✅ Listener 1: Trip State Updates (active/completed)
            // @ts-ignore
            const stateListener = await TripNotification.addListener('tripStateUpdate', async (data: { status: string }) => {
                console.log("DEBUG_v18: [App.tsx→JS] tripStateUpdate received:", data);
                console.log("⚡ [App.tsx] Service State Update Received:", data);

                // Update activeTrip status when service signals state change
                if (data.status === 'active' && activeTrip) {
                    console.log("DEBUG_v18: [App.tsx] Updating activeTrip to ACTIVE");
                    console.log("✅ [App.tsx] Updating activeTrip to ACTIVE");
                    const updatedTrip = { ...activeTrip, status: 'active' as const };
                    setActiveTrip(updatedTrip);
                    handleUpdateTrip(updatedTrip);
                } else if (data.status === 'completed' && activeTrip) {
                    console.log("DEBUG_v18: [App.tsx] Trip completed, clearing activeTrip");
                    console.log("🏁 [App.tsx] Trip Completed - Clearing activeTrip");
                    // [추가] 포인트 적립 및 초기화
                    localStorage.removeItem('trip_active'); // 운행 종료 표시

                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const newBalance = await handlePointTransaction({
                            userId: user.id,
                            amount: 50, // 50포인트 적립
                            type: 'earned',
                            description: "운행 완료 보상"
                        });
                        setUserProfile(prev => ({ ...prev, points: newBalance }));
                        alert("도착 완료! 50포인트가 적립되었습니다. 🎁");
                    }
                    setActiveTrip(null);
                    setCurrentScreen('home');
                } else {
                    console.log("DEBUG_v18: [App.tsx] Status update ignored (status=" + data.status + ", activeTrip=" + (activeTrip ? "exists" : "null") + ")");
                }
            });
            console.log("DEBUG_v18: [App.tsx] tripStateUpdate listener registered");

            // ✅ Listener 2: SMS Notification Sent (User Feedback)
            // @ts-ignore
            const notificationListener = await TripNotification.addListener('tripNotificationSent', (data: { message: string; recipient: string }) => {
                console.log("DEBUG_v18: [App.tsx→JS] tripNotificationSent received:", data);
                console.log("📨 [App.tsx] SMS Sent:", data);

                // [v39 FIX] Removed alert() - this was the persistent dialog!
                // Show user feedback
                const msg = data.message || '알림 문자가 발송되었습니다.';
                // alert(`[문자 전송 완료]\n${msg}`); // ← REMOVED!
                console.log(`[문자 전송 완료] ${msg}`); // Log only
            });
            console.log("DEBUG_v18: [App.tsx] tripNotificationSent listener registered");

            console.log("DEBUG_v18: [App.tsx] ✅ All listeners registered successfully");

            return () => {
                console.log("DEBUG_v18: [App.tsx] Cleaning up listeners");
                stateListener?.remove();
                notificationListener?.remove();
            };
        };

        setupServiceListener();
    }, []);

    const handleLoadTrip = (trip: Trip) => {
        // Load existing trip data back into setup form for editing/activation
        console.log("Loading trip into setup:", trip);
        setSetupFormData({
            departure: '',
            destination: trip.destination || '',
            recipient: trip.recipient || '',
            departureCondition: 0,
            departureMessage: '출발했습니다.',
            arrivalCondition: 5,
            arrivalMessage: '[알림] 현재 {currentLocation} 근처입니다. {destination}까지 약 {time}분 남았습니다.',
            navigationInfo: {
                distance: trip.estimatedDistance || 0,
                estimatedTime: trip.estimatedTime || 0,
                startLat: trip.startLat || 0,
                startLng: trip.startLng || 0,
                destLat: trip.destinationLat || 0,
                destLng: trip.destinationLng || 0,
                app: 'TMAP', // Default or unknown
                departure: '',
                destination: trip.destination || ''
            },
            selectedDestinationForNav: null,
            enableArrival: true,
            enableDeparture: false,
        });
        setCurrentScreen('setup');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'home':
                return (
                    <HomePage
                        onNavigate={(screen) => {
                            if (screen === 'setup') handleResetAndNavigateSetup();
                            else setCurrentScreen(screen);
                        }}
                        onSelectTrip={setActiveTrip}
                        // ✅ CRITICAL FIX: Only pass ACTIVE trips to Home. Queued ('planning') trips hidden.
                        activeTrips={trips.filter(t => t.status === 'active')}
                        userProfile={userProfile}
                        recentTrips={recentTrips}
                        favoriteTrips={trips.filter(t => t.isFavorite)}
                    />
                );
            case 'setup':
                return (
                    <NotificationSetup
                        onBack={() => setCurrentScreen('home')}
                        onComplete={handleCreateTrip}
                        onNavigate={setCurrentScreen}
                        selectedContacts={selectedContacts}
                        setSelectedContacts={setSelectedContacts}
                        setupFormData={setupFormData}
                        setSetupFormData={setSetupFormData}
                        hasActiveTrip={!!activeTrip} // ✅ PASS PROP
                    />
                );
            case 'active':
                return activeTrip ? (
                    <NavigationActive
                        trip={activeTrip}
                        onUpdate={handleUpdateTrip}
                        onCancel={handleCancelTrip}
                        onNavigate={setCurrentScreen}
                        userPoints={userProfile.points || 0}
                        deductPoints={deductPoints}
                    />
                ) : (
                    <HomePage onNavigate={setCurrentScreen} />
                );
            case 'list':
                return (
                    <NotificationList
                        trips={trips}
                        onNavigate={setCurrentScreen}
                        onSelectTrip={setActiveTrip}
                        onLoadTrip={handleLoadTrip} // ✅ Pass Load Handler
                        onCancelTrip={(tripId) => {
                            const trip = trips.find(t => t.id === tripId);
                            if (trip) {
                                if (trip.status === 'planning') {
                                    handleUpdateTrip({ ...trip, status: 'cancelled' });
                                } else {
                                    handleDeleteTrip(tripId);
                                }
                            }
                        }}
                        onToggleFavorite={handleToggleFavoriteTrip}
                    />
                );
            case 'settings':
                // Note: The user manually changed profile nav to 'profile-edit', but App handles it as 'profile'.
                // We will add a fallback case for 'profile-edit' just in case below.
                return <Settings onNavigate={setCurrentScreen} currentTheme={currentTheme} />;
            case 'contacts':
                return (
                    <ContactManagement
                        onNavigate={setCurrentScreen}
                        onSelectContacts={handleSelectContacts}
                        selectionMode={true}
                        contacts={contacts}
                        setContacts={setContacts}
                        mode="select"
                        onContactSelect={(contact) => {
                            // Handle single contact selection
                            handleSelectContacts([contact]);
                        }}
                        fromScreen="setup"
                        initialSelectedContacts={selectedContacts}
                    />
                );
            case 'favorites':
                return (
                    <FavoriteTrips
                        trips={trips}
                        onNavigate={setCurrentScreen}
                        onRebook={handleRebookTrip}
                        onToggleFavorite={handleToggleFavoriteTrip}
                        onUpdateTrip={handleUpdateTrip}
                    />
                );
            case 'contactsManage':
                return (
                    <ContactManagement
                        onNavigate={setCurrentScreen}
                        selectionMode={false}
                        contacts={contacts}
                        setContacts={setContacts}
                    />
                );
            case 'login':
                return (
                    <SnsLogin
                        onBack={() => setCurrentScreen('home')}
                        onComplete={() => setCurrentScreen('setup')}
                        onNavigate={setCurrentScreen}
                    />
                );

            // Fallback for user modification to 'profile-edit'
            case 'profile':
            // @ts-ignore
            case 'profile-edit':
                return (
                    <ProfileEdit
                        onNavigate={setCurrentScreen}
                        userProfile={userProfile}
                        onUpdateProfile={setUserProfile}
                    />
                );
            case 'messages':
                return (
                    <MessageManagement
                        onNavigate={setCurrentScreen}
                    />
                );
            case 'theme':
                return (
                    <ThemeSelector
                        onNavigate={setCurrentScreen}
                        currentTheme={currentTheme}
                        onThemeChange={setCurrentTheme}
                    />
                );
            case 'emailLogin':
                return (
                    <EmailLogin
                        onNavigate={setCurrentScreen}
                        currentTheme={currentTheme}
                    />
                );
            case 'emailSignup':
                return (
                    <EmailSignup
                        onNavigate={setCurrentScreen}
                        currentTheme={currentTheme}
                    />
                );
            case 'mypage':
                return (
                    <MyPage
                        onNavigate={setCurrentScreen}
                        userProfile={userProfile}
                        isAdmin={userProfile?.email === ADMIN_EMAIL}
                        onLogout={handleLogout}
                    />
                );
            case 'admin':
                return <AdminPage onNavigate={setCurrentScreen} />;
            default:
                return <HomePage onNavigate={setCurrentScreen} activeTrips={trips.filter(t => t.status === 'active' || t.status === 'planning')} onSelectTrip={setActiveTrip} userProfile={userProfile} recentTrips={recentTrips} favoriteTrips={trips.filter(t => t.isFavorite)} />;
        }
    };

    const isNavVisible = ['home', 'setup', 'list', 'settings', 'active', 'mypage'].includes(currentScreen);

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f2920' }}>
            {/* Top Safe Area Spacer */}
            <div style={{ height: 'env(safe-area-inset-top)', width: '100%', flexShrink: 0, backgroundColor: '#0f2920' }} />

            {/* Main Content Area */}
            <div
                style={{
                    flex: 1,
                    width: '100%',
                    minHeight: 0,
                    position: 'relative',
                    // Only apply padding for screens with bottom navigation, exclude home screen for proper centering
                    paddingBottom: isNavVisible && currentScreen !== 'home' ? '5rem' : '0'
                }}
            >
                <div style={{
                    width: '100%',
                    height: '100%'
                }}>
                    {renderScreen()}
                </div>
            </div>

            {/* Persistent Bottom Navigation */}
            {isNavVisible && (
                <nav
                    className="fixed bottom-0 left-0 right-0 z-[200] bg-app-secondary border-t border-border"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    <div className="flex items-center justify-around h-20 max-w-lg mx-auto">
                        <button
                            onClick={() => setCurrentScreen('home')}
                            className="flex flex-col items-center justify-center flex-1 space-y-1 active:scale-95 active:opacity-70 transition-all"
                        >
                            <Home className={`w-6 h-6 ${currentScreen === 'home' ? 'text-app-accent' : 'text-text-disabled'}`} />
                            <span className={`text-xs ${currentScreen === 'home' ? 'text-app-accent' : 'text-text-disabled'}`}>홈</span>
                        </button>
                        <button
                            onClick={() => setCurrentScreen('setup')}
                            className="flex flex-col items-center justify-center flex-1 space-y-1 active:scale-95 active:opacity-70 transition-all"
                        >
                            <Plus className={`w-6 h-6 ${currentScreen === 'setup' ? 'text-app-accent' : 'text-text-disabled'}`} />
                            <span className={`text-xs ${currentScreen === 'setup' ? 'text-app-accent' : 'text-text-disabled'}`}>예약하기</span>
                        </button>
                        <button
                            onClick={() => setCurrentScreen('list')}
                            className="flex flex-col items-center justify-center flex-1 space-y-1 active:scale-95 active:opacity-70 transition-all"
                        >
                            <History className={`w-6 h-6 ${currentScreen === 'list' ? 'text-app-accent' : 'text-text-disabled'}`} />
                            <span className={`text-xs ${currentScreen === 'list' ? 'text-app-accent' : 'text-text-disabled'}`}>내역보기</span>
                        </button>
                        <button
                            onClick={() => setCurrentScreen('mypage')}
                            className="flex flex-col items-center justify-center flex-1 space-y-1 active:scale-95 active:opacity-70 transition-all"
                        >
                            <User className={`w-6 h-6 ${currentScreen === 'mypage' ? 'text-app-accent' : 'text-text-disabled'}`} />
                            <span className={`text-xs ${currentScreen === 'mypage' ? 'text-app-accent' : 'text-text-disabled'}`}>마이페이지</span>
                        </button>
                    </div>
                </nav>
            )}
            {/* [추가] 관리자 버튼 (대표님만 보임) */}
            {userProfile?.email === "junopy741128@gmail.com" && (
                <button
                    onClick={() => setCurrentScreen('admin')}
                    className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full z-50 shadow-lg font-bold"
                >
                    ADMIN
                </button>
            )}
        </div>
    );
};

export default App;