/*
 * [상용화 버전] NotificationSetup.tsx - Step 3 심플 버전
 * 
 * 핵심 변경:
 * - 1개 필수 + 1개 선택 (50P) 구조
 * - 지도 기반 위치 선택 (고정 핀 + POI 이름 우선)
 * - searchMode로 Step 1 도착지 vs Step 3 Waypoint 구분
 * - 지도 모달 팝업으로 줌 충돌 방지
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, User, Check, Search, X, Loader2, Plus, Car } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Trip, Screen, Contact, SetupFormData, NavigationInfo } from '../App';
import { getCurrentPosition } from '../utils/capacitor-plugins';
import { searchPoiKakao, getRouteInfoKakao, reverseGeocodeKakao } from '../utils/kakao-service';
import { DestinationSearch } from './DestinationSearch';
import { LocationSelectModal } from './LocationSelectModal';
import { AlertModal } from './AlertModal'; // [Phase 15]
import { PriceTableModal } from './PriceTableModal';

interface NotificationSetupProps {
  onBack: () => void;
  onComplete: (trip: Trip) => void;
  onNavigate: (screen: Screen) => void;
  selectedContacts: Contact[];
  setSelectedContacts: (contacts: Contact[]) => void;
  setupFormData: SetupFormData;
  setSetupFormData: (data: SetupFormData) => void;
  hasActiveTrip?: boolean;
  contacts?: Contact[]; // [V27] Added contacts prop
  userProfile?: any; // [차량관리] 프로필 추가
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
  lat?: number;
  lng?: number;
  distance?: number;
}

interface TriggerLocation {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

// --- UI Components ---
const StepperItem = ({ step, label, activeStep, scrollToStep }: { step: number, label: string, activeStep: number, scrollToStep: (s: number) => void }) => {
  const isActive = activeStep === step;
  const isCompleted = step < activeStep;
  return (
    <div
      onClick={() => scrollToStep(step)}
      className={`flex items-center justify-center h-10 px-4 rounded-full border-2 text-sm font-bold transition-all cursor-pointer z-10 
        ${isActive
          ? 'bg-app-accent border-app-accent text-app-primary scale-105 shadow-lg shadow-app-accent/20'
          : isCompleted
            ? 'bg-app-secondary border-app-accent text-app-accent'
            : 'bg-app-secondary border-gray-700 text-gray-500'}`}
    >
      {isCompleted ? <Check className="w-4 h-4" /> : <span>{step}</span>}
      {isActive && <span className="ml-2 transition-all">{label}</span>}
    </div>
  );
};

const SectionCard = ({ step, title, myRef, activeStep, children }: any) => (
  <div ref={myRef} className={`scroll-mt-48 bg-app-secondary border rounded-2xl p-6 transition-all duration-300 ${activeStep === step ? 'border-app-accent ring-1 ring-app-accent/20' : 'border-border'}`}>
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors ${activeStep >= step ? 'bg-app-accent text-app-primary' : 'bg-gray-700 text-gray-400'}`}>
        {step}
      </div>
      <h2 className={`text-xl font-medium ${activeStep >= step ? 'text-white' : 'text-gray-500'}`}>{title}</h2>
    </div>
    <div>
      {children}
    </div>
  </div>
);

export function NotificationSetup({ onBack, onComplete, onNavigate, selectedContacts, setSelectedContacts, setupFormData, setSetupFormData, contacts = [], userProfile }: NotificationSetupProps) {
  // --- State: Active Step ---
  // [V15] Smart Step Initialization: Restore step based on data
  const [activeStep, setActiveStep] = useState(() => {
    if (setupFormData.destination && (selectedContacts.length > 0 || setupFormData.recipient)) return 3; // Info ready -> Step 3
    if (setupFormData.destination) return 2; // Destination ready -> Step 2
    return 1; // Start
  });
  const [selectedCar, setSelectedCar] = useState<string | null>(setupFormData.selectedCar || null); // [차량관리] 선택된 차량

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // --- State: Data ---
  // [Fix] 토스트 제거됨 - setToastMessage는 위치 설정 핸들러에서 사용하므로 유지
  const [, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // [Phase 21 Fix] State Synchronization
  // Ensure local state always reflects the prop (setupFormData) when it changes from outside (e.g. Reset, Load Trip).
  const [enableDeparture, setEnableDeparture] = useState<boolean>(() => {
    // 1순위: prop (setupFormData) - Load Trip 등 명시적 호출 시 사용
    if (setupFormData.enableDeparture !== undefined) return setupFormData.enableDeparture;
    // 2순위: localStorage - 사용자 선호도
    const saved = localStorage.getItem('preferred_enable_departure');
    if (saved !== null) return JSON.parse(saved);
    return true;
  });
  const [isWaypointSkipped, setIsWaypointSkipped] = useState(setupFormData.isWaypointSkipped || false);
  const [showDepartureConfirmModal, setShowDepartureConfirmModal] = useState(false);
  const [pendingDepartureValue, setPendingDepartureValue] = useState<boolean | null>(null);

  useEffect(() => {
    // setupFormData.enableDeparture가 바뀔 때만 동기화 (예: 다른 트립 로드 시)
    if (setupFormData.enableDeparture !== undefined) {
      setEnableDeparture(setupFormData.enableDeparture);
    }
  }, [setupFormData.enableDeparture]);

  const [departure] = useState(setupFormData.departure || '현재 위치');
  const [destination, setDestination] = useState(setupFormData.destination);
  const [selectedDestinationForNav, setSelectedDestinationForNav] = useState<PlacePrediction | null>(setupFormData.selectedDestinationForNav || null);
  const [recipient, setRecipient] = useState(setupFormData.recipient || '');

  // --- State: Trigger Locations (1 Mandatory + 1 Optional) ---
  const [triggerLocations, setTriggerLocations] = useState<TriggerLocation[]>(setupFormData.triggerLocations || []); // [V36] Pre-fill from Quick Reserve logic

  // --- State: UI ---
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'destination' | 'waypoint'>('destination'); // Step 1 vs Step 3 구분
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false); // [NEW] Modal State
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [routePath, setRoutePath] = useState<{ lat: number, lng: number }[]>([]); // [V20] Route Path State

  // [2단계] 발송 방식 State - 안내 전용에서 선택 가능으로 전환
  const [smsMode, setSmsMode] = useState<'sms_single' | 'sms_multi' | 'kakao'>(() => {
    const saved = localStorage.getItem('preferred_sms_mode');
    if (saved && ['sms_single', 'sms_multi', 'kakao'].includes(saved)) {
      return saved as 'sms_single' | 'sms_multi' | 'kakao';
    }
    return 'sms_single'; // [V28 Default] 일반 문자를 기본값으로 변경
  });

  // smsMode 변경 시 로컬스토리지 저장
  useEffect(() => {
    localStorage.setItem('preferred_sms_mode', smsMode);
  }, [smsMode]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  // [Fix] 안내 UI로 전환 - setter 미사용
  const [dontShowPlanModal] = useState(() => {
    return localStorage.getItem('sms_mode_confirmed') === 'true';
  });
  const [recipientCount, setRecipientCount] = useState(1);

  // Update recipient count whenever contacts or manual input changes
  useEffect(() => {
    const manualCount = recipient.split(',').filter(r => r.trim().length > 0).length;
    const count = Math.max(1, manualCount + selectedContacts.length);
    setRecipientCount(count);

    // [v_fix] 문자 모드일 때 인원수에 따라 싱글/멀티 자동 전환
    if (smsMode !== 'kakao') {
      setSmsMode(count > 1 ? 'sms_multi' : 'sms_single');
    }
  }, [recipient, selectedContacts, smsMode]);

  // [Phase 15] Alert Modal State
  const [alertState, setAlertState] = useState<{ open: boolean, message: string }>({ open: false, message: '' });

  // [V20] Fetch Route Path when Modal Opens or Destination Set
  useEffect(() => {
    const fetchRoute = async () => {
      if (selectedDestinationForNav && selectedDestinationForNav.lat && selectedDestinationForNav.lng) {
        try {
          const pos = await getCurrentPosition();
          if (pos) {
            // Dynamic import to avoid circular dependency issues if any, or just cleaner
            const { getRoutePathKakao } = await import('../utils/kakao-service');
            const path = await getRoutePathKakao(pos.latitude, pos.longitude, selectedDestinationForNav.lat!, selectedDestinationForNav.lng!);
            setRoutePath(path);
          }
        } catch (e) {
          console.error('Failed to fetch route path', e);
        }
      }
    };

    if (setupFormData.destination) {
      fetchRoute();
    }
  }, [setupFormData.destination, selectedDestinationForNav]);

  // --- Map Modal Handler ---
  const handleConfirmLocation = (location: { lat: number; lng: number; name: string }) => {
    if (triggerLocations.length >= 1) {
      setAlertState({ open: true, message: '알림 위치는 1개만 설정할 수 있습니다.' });
      setShowMapModal(false);
      return;
    }

    const newLocation = {
      lat: location.lat,
      lng: location.lng,
      name: location.name,
      address: location.name,
    };

    setTriggerLocations([...triggerLocations, newLocation]);
    setIsWaypointSkipped(false); // [User Request] 위치 설정 시 건너뛰기 해제
    setShowMapModal(false);
    // [Fix] 토스트 제거 - 지도에서 위치 설정 후 불필요한 토스트 없애기
  };

  // --- Scroll Detection Logic ---
  const handleScroll = () => {
    if (!containerRef.current || !step1Ref.current || !step2Ref.current || !step3Ref.current) return;

    const containerTop = containerRef.current.scrollTop + 150;
    const step2Top = step2Ref.current.offsetTop;
    const step3Top = step3Ref.current.offsetTop;

    if (containerTop >= step3Top - 50) {
      if (activeStep !== 3) setActiveStep(3);
    } else if (containerTop >= step2Top - 50) {
      if (activeStep !== 2) setActiveStep(2);
    } else {
      if (activeStep !== 1) setActiveStep(1);
    }
  };

  // --- Sync Effects ---
  useEffect(() => {
    setSetupFormData({
      ...setupFormData,
      departure,
      destination,
      recipient,
      departureCondition: 0,
      departureMessage: smsMode === 'kakao'
        ? `#{발송자}님이 등록하신 도착 알림 서비스가 시작되었습니다.\n\n‧출발지: #{출발지}\n‧도착지: #{도착지}\n‧예상 소요시간: 약 #{남은시간}분\n\n(수신자님의 차량 도착 알림 서비스 신청에 따른 단계별 알림입니다.)`
        : '{출발지}에서 출발했습니다. 약 {남은시간}분 후 도착 예정입니다.',
      arrivalCondition: 5,
      arrivalMessage: smsMode === 'kakao'
        ? `#{발송자}님이 등록하신 도착 알림입니다.\n\n‧차량이 #{도착지} 부근 입니다. \n‧약 #{남은시간}분 이내 도착합니다. \n\n(수신자님의 차량 도착 알림 서비스 신청에 따른 단계별 알림입니다.)`
        : '{도착지} 근처입니다. 곧 도착 예정입니다.',
      navigationInfo: null,
      selectedDestinationForNav,
      triggerLocations,
      enableDeparture, // [Fix] Sync Local State to Parent
      smsMode,         // [2단계]
      recipientCount,  // [2단계]
      selectedCar: selectedCar || undefined, // [차량관리]
      isWaypointSkipped, // [User Request]
    });
  }, [departure, destination, recipient, selectedDestinationForNav, triggerLocations, enableDeparture, smsMode, recipientCount, selectedCar, isWaypointSkipped]); // Add enableDeparture dependency

  // --- Logic ---
  const prepareNavigationInfo = async (prediction: PlacePrediction): Promise<NavigationInfo | null> => {
    try {
      const position = await getCurrentPosition();
      if (!position) throw new Error('위치 정보를 가져올 수 없습니다.');
      const currentLat = position.latitude;
      const currentLng = position.longitude;

      const departureAddress = await reverseGeocodeKakao(currentLat, currentLng) || '현재 위치';

      let destLat = prediction.lat;
      let destLng = prediction.lng;

      if (!destLat || !destLng) {
        const results = await searchPoiKakao(prediction.description);
        if (results && results.length > 0) {
          destLat = results[0].lat;
          destLng = results[0].lng;
        } else {
          throw new Error('도착지 좌표를 가져올 수 없습니다.');
        }
      }

      let distance = 0;
      let durationMinutes = 0;

      // [100% Kakao] 카카오 경로 API 단독 호출
      const kakaoRoute = await getRouteInfoKakao(currentLat, currentLng, destLat, destLng);

      if (kakaoRoute) {
        distance = kakaoRoute.distance;
        durationMinutes = Math.round(kakaoRoute.duration / 60);
      } else {
        // [User Request] 경로 실패 시 예약 차단 대신 옵션 제공
        console.warn('[Route] Kakao API Failed. Suggesting skip waypoint.');
        throw new Error('ROUTE_FAILED'); 
      }

      const placeName = prediction.structured_formatting?.main_text || prediction.description || '';
      const formattedPlaceName = placeName.replace('대한민국 ', '').trim();

      return {
        app: 'GPS 추적',
        departure: departureAddress,
        destination: formattedPlaceName,
        distance: distance,
        estimatedTime: durationMinutes,
        startLat: currentLat,
        startLng: currentLng,
        destLat: destLat,
        destLng: destLng,
      };
    } catch (error: any) {
      if (error.message === 'ROUTE_FAILED') {
        throw error; // Re-throw to handle in handleStartReservation
      }
      console.error("GPS Setup Error", error);
      setAlertState({ open: true, message: `준비 실패: ${error.message || '알 수 없는 오류'}` });
      return null;
    }
  };

  const scrollToStep = (step: number) => {
    setActiveStep(step);
    if (step === 1) step1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (step === 2) step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (step === 3) step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleStartReservation = async () => {
    setIsLoading(true);

    // Validation: Destination
    if (!selectedDestinationForNav) {
      setIsLoading(false);
      setAlertState({ open: true, message: '도착지가 선택되지 않았습니다.' });
      return;
    }

    // Validation: Recipient
    const hasRecipient = recipient.trim().length > 0 || selectedContacts.length > 0;
    if (!hasRecipient) {
      setIsLoading(false);
      setAlertState({ open: true, message: '받는 사람(연락처)을 입력해야 합니다.' });
      scrollToStep(2);
      return;
    }

    // Validation: Trigger Location (MANDATORY unless skipped)
    if (triggerLocations.length === 0 && !isWaypointSkipped) {
      setIsLoading(false);
      setAlertState({ open: true, message: '⚠️ 알림을 보낼 위치를 선택해야 합니다!\n\nStep 3에서 지도를 움직여 위치를 선택하거나\n[경유지 선택 안함]을 체크해주세요.' });
      scrollToStep(3);
      return;
    }

    // Validation: Coordinates
    if (!selectedDestinationForNav.lat || !selectedDestinationForNav.lng) {
      setIsLoading(false);
      setAlertState({ open: true, message: '도착지 좌표 정보가 올바르지 않습니다.\n다시 검색하여 선택해주세요.' });
      return;
    }

    // [Fix] 포인트 잔액 확인 - 예약 전 미리 차단
    const expectedCost = smsMode === 'kakao'
      ? recipientCount * (enableDeparture ? 100 : 50)
      : (recipientCount > 1 ? 100 : 50);
    const currentPoints = userProfile?.points ?? 0;
    if (currentPoints < expectedCost) {
      setIsLoading(false);
      setAlertState({
        open: true,
        message: `포인트가 부족합니다.\n\n현재 보유: ${currentPoints}P\n예상 차감: ${expectedCost}P\n\n마이페이지에서 포인트를 충전해주세요.`
      });
      return;
    }

    // 0. Prepare Info first
    let navInfo: NavigationInfo | null = null;
    try {
      navInfo = await prepareNavigationInfo(selectedDestinationForNav);
    } catch (error: any) {
      if (error.message === 'ROUTE_FAILED') {
        setIsLoading(false);
        setAlertState({
          open: true,
          message: '경로 정보를 가져올 수 없어\n"경유지" 알림 설정은 불가능합니다.\n도착 시 알림만 예약하시겠습니까?',
          onConfirm: async () => {
            setAlertState({ open: false });
            setIsLoading(true);
            // Fallback Info creation
            const pos = await getCurrentPosition();
            const fallbackInfo: NavigationInfo = {
              app: 'GPS 추적',
              departure: '현재 위치',
              destination: (selectedDestinationForNav.structured_formatting?.main_text || selectedDestinationForNav.description || '').replace('대한민국 ', '').trim(),
              distance: 0,
              estimatedTime: 0,
              startLat: pos?.latitude || 0,
              startLng: pos?.longitude || 0,
              destLat: selectedDestinationForNav.lat || 0,
              destLng: selectedDestinationForNav.lng || 0,
              enableArrival: true,
              enableDeparture: (() => {
                  const saved = localStorage.getItem('preferred_enable_departure');
                  return saved !== null ? JSON.parse(saved) : true;
              })(),
            };
            finalizeReservation(fallbackInfo);
          }
        });
        return;
      }
      
      // [Fix] 다른 에러(위치 가져오기 실패 등) 발생 시 무시하지 않고 경고창 표시
      setIsLoading(false);
      setAlertState({
        open: true,
        message: `예약 처리 중 오류가 발생했습니다.\n\n사유: ${error.message || '위치 정보를 가져올 수 없습니다.'}\n\nGPS(위치)가 켜져 있는지 확인해 주세요.`
      });
      return;
    }

    if (!navInfo) {
      setIsLoading(false);
      return;
    }

    finalizeReservation(navInfo);
  };

  const finalizeReservation = (navInfo: NavigationInfo) => {
    // Combine manual input and selected contacts
    const manualRecipients = recipient.split(',').map(r => r.trim()).filter(Boolean);
      const contactRecipients = selectedContacts.map(c => {
        const phone = c.phoneNumber || c.phone;
        return phone ? `${c.name} (${phone})` : null;
      }).filter(Boolean);

      // [Fix 8-3] 전화번호 형식 검증 (010으로 시작하는 10~11자리 숫자)
      const phoneRegex = /^0\d{9,10}$/;
      const invalidManual = manualRecipients.filter(r => {
        // "이름 (010-xxxx-xxxx)" 형식이 아닌 순수 번호 입력만 검증
        const cleanNum = r.replace(/[-\s]/g, '');
        // 숫자만으로 구성된 경우에만 형식 검사 (이름이 포함된 경우 제외)
        return /^\d+$/.test(cleanNum) && !phoneRegex.test(cleanNum);
      });

      if (invalidManual.length > 0) {
        setShowSuccessOverlay(false);
        setIsLoading(false);
        setAlertState({
          open: true,
          message: `올바르지 않은 전화번호가 있습니다.\n\n${invalidManual.join(', ')}\n\n전화번호는 010으로 시작하는 10~11자리 숫자여야 합니다.\n수신자를 다시 확인해주세요.`
        });
        return;
      }

      const finalRecipientString = [...new Set([...manualRecipients, ...contactRecipients])].join(',');
      const finalRecipientCount = [...new Set([...manualRecipients, ...contactRecipients])].length || 1;


      const trip: Trip = {
        id: Date.now().toString(),
        departure: navInfo.departure,
        destination: navInfo.destination,
        notifications: [{
          id: Date.now().toString() + '_arr',
          type: 'arrival',
          condition: { type: 'distance', value: 0.3, unit: 'km' },
          message: smsMode === 'kakao' ? setupFormData.arrivalMessage : `{도착지} 근처입니다. 곧 도착 예정입니다.`,
          recipient: finalRecipientString,
          status: 'pending'
        }],
        status: 'planning',
        estimatedTime: navInfo.estimatedTime,
        estimatedDistance: navInfo.distance,
        recipient: finalRecipientString,
        createdAt: new Date().toISOString(),
        startLat: navInfo.startLat,
        startLng: navInfo.startLng,
        destinationLat: navInfo.destLat,
        destinationLng: navInfo.destLng,
        initialStatus: 'waiting',
        startPoint: navInfo.departure,
        enableDeparture: setupFormData.enableDeparture,
        triggerType: 'waypoint',
        triggerValue: String(triggerLocations.length),
        waypoints: JSON.stringify(triggerLocations.map(loc => ({
          lat: loc.lat,
          lng: loc.lng,
          name: loc.name,
        }))),
        smsMode: smsMode,
        recipientCount: finalRecipientCount,
        selectedCar: selectedCar || undefined,
        // [Aligo] New template fields
        departureTitle: setupFormData.departureTitle,
        departureMessage: setupFormData.departureMessage,
        waypointTitle: setupFormData.waypointTitle,
        waypointMessage: setupFormData.waypointMessage,
        arrivalTitle: setupFormData.arrivalTitle,
        arrivalMessage: setupFormData.arrivalMessage,
      };

    setTimeout(() => {
      setIsLoading(false);
      onComplete(trip);
    }, 2000);
  };



  // Remove toastMessage state if not used elsewhere (it was local)
  // const [toastMessage, setToastMessage] = useState<string | null>(null); 
  // keeping it just in case, but reusing the variable name or deleting it is cleaner.
  // actually, let's just delete the toastMessage state line if I can find it, 
  // but for replace_file_content I'll just ignore it or update the handleDestinationSelect function.

  const handleDestinationSelect = (result: any) => {
    if (searchMode === 'destination') {
      // Step 1: 도착지 설정 (Existing Logic)
      const prediction: PlacePrediction = {
        description: result.address,
        place_id: result.id || `loc-${Math.random().toString(36).substr(2, 9)}`,
        structured_formatting: { main_text: result.name || result.address, secondary_text: result.address },
        lat: parseFloat(result.lat || result.y || 0),
        lng: parseFloat(result.lng || result.x || 0),
        distance: result.distance
      };

      setSelectedDestinationForNav(prediction);
      setDestination(result.name || result.address);
      setIsSearching(false);

      setTimeout(() => {
        setActiveStep(2);
        step2Ref.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else if (searchMode === 'waypoint') {
      // Step 3: Waypoint 추가
      if (triggerLocations.length >= 1) {
        setAlertState({ open: true, message: '알림 위치는 1개만 설정할 수 있습니다.' });
        setIsSearching(false);
        return;
      }

      const newLocation: TriggerLocation = {
        lat: parseFloat(result.lat || result.y || 0),
        lng: parseFloat(result.lng || result.x || 0),
        name: result.name || result.address,
        address: result.address,
      };

      setTriggerLocations([...triggerLocations, newLocation]);
      setIsWaypointSkipped(false); // [User Request]
      setIsSearching(false);

      // [V27] Simplified Toast Feedback
    }
  };

  return (
    <div className="flex flex-col h-full bg-app-primary text-text-primary relative">

      {/* [Phase 15] Alert Modal */}
      <AlertModal
        isOpen={alertState.open}
        onClose={() => setAlertState({ ...alertState, open: false })}
        message={alertState.message}
      />

      {/* Search Overlay */}
      {isSearching && (
        <div className="absolute inset-0 z-50 bg-app-primary">
          <DestinationSearch
            onBack={() => setIsSearching(false)}
            onSelect={handleDestinationSelect}
            initialQuery={searchMode === 'destination' ? destination : ''}
          />
        </div>
      )}

      {/* Success Overlay (Reservation Check) */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-app-primary text-white animate-in fade-in duration-300">
          {/* ... existing success overlay code ... */}
          <div className="w-20 h-20 rounded-full bg-app-accent flex items-center justify-center mb-6 animate-bounce">
            <Check className="w-10 h-10 text-app-primary stroke-[3]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">예약 완료!</h2>
          <p className="text-text-muted text-center">
            성공적으로 예약되었습니다.<br />
            잠시 후 목록으로 이동합니다.
          </p>
        </div>
      )}

      {/* [V27] Custom Toast Removed intentionally per user request */}
      {/* Fixed Sticky Header + Stepper Container */}
      <div className="sticky top-0 z-30 bg-app-primary/95 backdrop-blur-sm shadow-sm border-b border-border">
        {/* Header */}
        <header className="pt-safe mt-2 px-4 h-16 flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 text-text-muted hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">알림 예약</h1>
          <div className="w-10"></div>
        </header>

        {/* Top Stepper */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between relative max-w-sm mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 -translate-y-1/2" />
            <div className="absolute top-1/2 left-0 h-0.5 bg-app-accent -translate-y-1/2 transition-all duration-300" style={{ width: `${((activeStep - 1) / 2) * 100}%` }} />
            <StepperItem step={1} label="도착지" activeStep={activeStep} scrollToStep={scrollToStep} />
            <StepperItem step={2} label="연락처" activeStep={activeStep} scrollToStep={scrollToStep} />
            <StepperItem step={3} label="위치" activeStep={activeStep} scrollToStep={scrollToStep} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pb-32 scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="px-6 py-8 space-y-6 pb-32">

          {/* Step 1: Destination */}
          <SectionCard step={1} title="어디로 갈까요?" myRef={step1Ref} activeStep={activeStep}>
            <div className="space-y-4">
              <Label className="text-xs text-text-muted ml-1">출발지</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500" />
                <Input value={departure} readOnly className="pl-10 h-14 bg-app-primary border-border text-gray-300 rounded-xl" />
              </div>
              <Label className="text-xs text-app-accent ml-1 font-bold">도착지 *</Label>
              <div onClick={() => { setSearchMode('destination'); setIsSearching(true); }} className="relative cursor-pointer">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-accent" />
                <div className={`w-full h-14 flex items-center pl-12 pr-4 rounded-xl border-2 transition-all ${destination ? 'bg-app-primary border-app-accent text-white' : 'bg-app-primary border-app-accent/30 text-gray-500'}`}>
                  {destination || '도착지 검색'}
                  <Search className="ml-auto w-5 h-5" />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Step 2: Contact */}
          <SectionCard step={2} title="누구에게 보낼까요?" myRef={step2Ref} activeStep={activeStep}>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label className="text-xs text-text-muted">연락처 *</Label>
                <button onClick={() => onNavigate('contacts')} className="text-xs text-app-accent font-bold flex gap-1"><User className="w-3 h-3" /> 가져오기</button>
              </div>
              <div className="relative z-10">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="이름 또는 전화번호 직접 입력"
                  className="pl-12 pr-10 h-14 bg-app-primary border-2 border-app-accent/30 text-white rounded-xl focus:border-app-accent focus:ring-0"
                />

                {/* [V27] Contact Autocomplete Suggestions */}
                {recipient.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {contacts
                      .filter(c => c.name.includes(recipient) || (c.phoneNumber && c.phoneNumber.includes(recipient)) || (c.phone && c.phone.includes(recipient)))
                      .map(c => (
                        <button
                          key={c.id}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-700 border-b border-gray-700 last:border-0 transition-colors"
                          onClick={() => {
                            if (!selectedContacts.find(sc => sc.id === c.id)) {
                              setSelectedContacts([...selectedContacts, c]);
                            }
                            setRecipient('');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-300">
                              {c.name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-bold text-white">{c.name}</div>
                              <div className="text-xs text-gray-400">{c.phoneNumber || c.phone}</div>
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-app-accent" />
                        </button>
                      ))}
                    {/* Divider logic if no results? */}
                  </div>
                )}
                {recipient && (
                  <button
                    onClick={() => setRecipient('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {selectedContacts.length > 0 && (
                <div className="space-y-2 mt-2">
                  {selectedContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-app-primary border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{contact.name}</div>
                          <div className="text-xs text-gray-400">{contact.phoneNumber || contact.phone}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newContacts = selectedContacts.filter(c => c.id !== contact.id);
                          setSelectedContacts(newContacts);
                        }}
                        className="p-2 text-gray-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* [v_fix] 발송 방식 선택 토글 */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-xs text-text-muted">발송 방식 선택 *</Label>
                <button
                  onClick={() => setShowPriceModal(true)}
                  className="text-[11px] font-bold text-app-accent flex items-center gap-1 border border-app-accent/30 px-2 py-0.5 rounded-md active:bg-app-accent/10 transition-colors"
                >
                  가격표 확인
                </button>
              </div>
              <div className="flex bg-app-primary border border-border p-1.5 rounded-2xl relative gap-1.5">
                {/* 1. 일반 문자 */}
                <button
                  onClick={() => setSmsMode(recipientCount > 1 ? 'sms_multi' : 'sms_single')}
                  className={`flex-1 min-h-[72px] rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-3 px-2
                    ${smsMode !== 'kakao' ? 'bg-app-secondary text-app-accent shadow-lg ring-1 ring-app-accent/20' : 'text-gray-500 bg-black/20'}`}
                >
                  <span className="text-2xl">📱</span>
                  <span className="text-sm font-bold">일반 문자</span>
                </button>

                {/* 2. 카카오 알림톡 */}
                <button
                  onClick={() => setSmsMode('kakao')}
                  className={`flex-1 min-h-[72px] rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-3 px-2
                    ${smsMode === 'kakao' ? 'bg-[#FEE500] text-black shadow-lg' : 'text-gray-500 bg-black/20'}`}
                >
                  <span className="text-2xl">💬</span>
                  <span className="text-sm font-bold leading-tight text-center">
                    카카오<br />알림톡
                  </span>
                </button>
              </div>

              {/* 예상 소모 포인트 표시 */}
              <div className="bg-black/20 p-3 rounded-xl flex justify-between items-center border border-white/5">
                <span className="text-xs text-gray-400">최종 예상 비용</span>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-white">
                    {smsMode === 'sms_single'
                      ? '50P'
                      : smsMode === 'sms_multi'
                        ? '100P'
                        // [Fix] 알림톡: 출발알림 ON이면 100P/인, OFF이면 50P/인
                        : `${recipientCount * (enableDeparture ? 100 : 50)}P`}
                  </span>
                  {smsMode === 'kakao' && (
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      {enableDeparture ? '출발+도착 알림' : '도착 알림'} × {recipientCount}명
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Step 3: Trigger Location Selection */}
          <SectionCard step={3} title="어디서 알림을 보낼까요?" myRef={step3Ref} activeStep={activeStep}>
            <div className="space-y-4">

              {/* Buttons Row */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* 1. Address Search */}
                <button
                  onClick={() => { setSearchMode('waypoint'); setIsSearching(true); }}
                  className="h-24 bg-app-primary border border-border rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-800 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-app-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">주소 검색</span>
                </button>

                {/* 2. Map Select */}
                <button
                  onClick={() => setShowMapModal(true)}
                  className="h-24 bg-app-primary border border-border rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-800 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-app-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-app-accent" />
                  </div>
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">지도에서 선택</span>
                </button>
              </div>

              {/* 3. Skip Waypoint Button (User Request - Solid Premium Style) */}
              <button
                onClick={() => {
                  setTriggerLocations([]); // Clear if any
                  setIsWaypointSkipped(true);
                  setAlertState({
                    open: true,
                    message: '경유지 없이 목적지 도착 시에만\n알림을 전송하도록 설정하시겠습니까?',
                    onConfirm: () => setAlertState({ open: false })
                  });
                }}
                className={`w-full h-14 border rounded-2xl flex items-center justify-between px-4 transition-all duration-300 active:scale-[0.98] shadow-sm font-bold
                  ${isWaypointSkipped 
                    ? 'bg-app-accent/15 border-app-accent text-app-accent shadow-[0_4px_20px_rgba(0,255,132,0.15)] ring-1 ring-app-accent/30' 
                    : 'bg-gray-800/40 hover:bg-gray-800 border-border/80 text-gray-400 hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
                    ${isWaypointSkipped ? 'border-app-accent bg-app-accent' : 'border-gray-500 bg-transparent'}`}>
                    {isWaypointSkipped && <div className="w-2 h-2 rounded-full bg-app-primary" />}
                  </div>
                  <span className="text-sm">경유지 선택 안함 (건너뛰기)</span>
                </div>
                {isWaypointSkipped ? (
                  <Check className="w-5 h-5 text-app-accent animate-in zoom-in duration-300" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                )}
              </button>


              {/* Selected Locations Display */}
              {triggerLocations.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-app-accent font-bold pl-1">설정된 알림 위치 ({triggerLocations.length}/1)</p>
                  {triggerLocations.map((loc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-app-primary border border-app-accent rounded-xl shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-app-accent text-app-primary flex items-center justify-center shadow-sm">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs text-app-accent font-bold mb-0.5">알림 위치</div>
                          <div className="text-sm font-bold text-white">{loc.name}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setTriggerLocations(triggerLocations.filter((_, i) => i !== index))}
                        className="p-2 -mr-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}


              {/* Info Box */}
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-300">
                  {triggerLocations.length === 0
                    ? '📍 지도를 움직여 알림을 보낼 위치를 선택한 후 [설정] 버튼을 눌러주세요.'
                    : triggerLocations.length === 1
                      ? `✅ "${triggerLocations[0].name}" 반경 300m 진입 시 메시지가 발송됩니다.` // [V27] 300m
                      : `✅ 총 ${triggerLocations.length}곳에서 알림이 발송됩니다.`
                  }
                </p>
              </div>

              {/* [Restored] Departure Toggle - Improved Design */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 flex items-center justify-between gap-3 border border-white/10 mt-6 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-app-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex-1 min-w-0 pr-1">
                  <h4 className="text-white text-sm font-bold mb-1 flex items-center gap-1.5 whitespace-nowrap">
                    운행 출발 시 알림 전송
                    {enableDeparture && <span className="w-1.5 h-1.5 rounded-full bg-app-accent animate-pulse flex-shrink-0" />}
                  </h4>
                  <p className="text-[11px] text-text-muted leading-relaxed break-keep">
                    운행 시작이 감지되면 수신자에게 실시간 출발 안내가 전송됩니다.
                  </p>
                </div>
                <div
                  onClick={() => {
                    setPendingDepartureValue(!enableDeparture);
                    setShowDepartureConfirmModal(true);
                  }}
                  className={`w-14 h-7 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300 relative shadow-inner flex-shrink-0
                    ${enableDeparture ? 'bg-app-accent' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 transform z-20
                    ${enableDeparture ? 'translate-x-7 scale-110' : 'translate-x-0 scale-90'}`} 
                  />
                  {!enableDeparture && (
                    <span className="absolute right-1.5 text-[9px] font-black text-gray-400 select-none">OFF</span>
                  )}
                  {enableDeparture && (
                    <span className="absolute left-1.5 text-[9px] font-black text-app-primary select-none">ON</span>
                  )}
                  {/* Glow effect for ON state */}
                  {enableDeparture && (
                    <div className="absolute inset-0 bg-app-accent/30 animate-pulse blur-sm rounded-full" />
                  )}
                </div>
              </div>

            </div>
          </SectionCard>
        </div>
      </div>

      {/* [Fix] 토스트 완전 제거 */}


      {/* Map Modal */}
      <LocationSelectModal
        isOpen={showMapModal}
        initialLocation={selectedDestinationForNav ? { lat: selectedDestinationForNav.lat!, lng: selectedDestinationForNav.lng! } : null}
        onClose={() => setShowMapModal(false)}
        onConfirm={handleConfirmLocation}
        routePath={routePath}
      />

      <PriceTableModal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
      />

      {/* Departure Confirmation Modal */}
      {showDepartureConfirmModal && pendingDepartureValue !== null && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDepartureConfirmModal(false)}
        >
          <div
            className="w-full max-w-md bg-app-secondary rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
            <div className="text-center mb-6">
              <div className="text-3xl mb-3">{pendingDepartureValue ? '🔔' : '🔕'}</div>
              <h3 className="text-white text-lg font-bold mb-2">
                {pendingDepartureValue
                  ? '이후로 계속 출발 안내를 보낼까요?'
                  : '이후로 계속 출발 안내를 보내지 말까요?'}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {pendingDepartureValue
                  ? '운행 시작이 감지되면 수신자에게 자동으로 출발 안내가 전송됩니다.'
                  : '출발 안내 없이 도착 알림만 전송됩니다.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDepartureConfirmModal(false)}
                className="flex-1 h-14 rounded-2xl bg-gray-700 text-white font-bold text-base hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setEnableDeparture(pendingDepartureValue);
                  localStorage.setItem('preferred_enable_departure', JSON.stringify(pendingDepartureValue)); // [User Request] 지속성 유지
                  setShowDepartureConfirmModal(false);
                  setPendingDepartureValue(null);
                }}
                className={`flex-1 h-14 rounded-2xl font-bold text-base transition-colors ${pendingDepartureValue ? 'bg-app-accent text-app-primary hover:brightness-110' : 'bg-status-error text-white hover:brightness-110'}`}
              >
                {pendingDepartureValue ? '네, 보낼게요' : '네, 안 보낼게요'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Button - bottom-24 = 6rem = exact height of tab bar (h-16 + pb-8 box-content) */}
      <div className="fixed bottom-24 left-0 right-0 px-5 pt-3 pb-3 bg-app-primary border-t border-border z-[100]">
        <Button
          onClick={handleStartReservation}
          disabled={isLoading || (triggerLocations.length === 0 && !isWaypointSkipped)}
          className={`w-full h-16 text-xl font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50
            ${isWaypointSkipped && triggerLocations.length === 0 
              ? 'bg-gradient-to-r from-status-info to-[#00b8ff] text-white shadow-status-info/20' 
              : 'bg-gradient-to-r from-app-accent to-[#00cc6a] text-app-primary shadow-app-accent/20'}`}
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" />생성 중...</>
          ) : isWaypointSkipped ? (
            '예약 완료하기 (건너뛰기)'
          ) : (
            `예약 완료하기 (${triggerLocations.length}곳)`
          )}
        </Button>
      </div>
    </div >
  );
}
