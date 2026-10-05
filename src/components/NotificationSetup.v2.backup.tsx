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
import { ChevronLeft, MapPin, User, Check, Search, X, Loader2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Trip, Screen, Contact, SetupFormData, NavigationInfo } from '../App';
import { getCurrentPosition } from '../utils/capacitor-plugins';
import { searchPoiKakao, getRouteInfoKakao, getPOINameByCoord, reverseGeocodeKakao } from '../utils/kakao-service';
import { getRouteInfoNaver } from '../utils/naver-service';
import { DestinationSearch } from './DestinationSearch';

interface NotificationSetupProps {
  onBack: () => void;
  onComplete: (trip: Trip) => void;
  onNavigate: (screen: Screen) => void;
  selectedContacts: Contact[];
  setSelectedContacts: (contacts: Contact[]) => void;
  setupFormData: SetupFormData;
  setSetupFormData: (data: SetupFormData) => void;
  hasActiveTrip?: boolean;
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
  <div ref={myRef} className={`bg-app-secondary border rounded-2xl p-6 transition-all duration-300 ${activeStep === step ? 'border-app-accent ring-1 ring-app-accent/20' : 'border-border'}`}>
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

export function NotificationSetup({ onBack, onComplete, onNavigate, selectedContacts, setSelectedContacts, setupFormData, setSetupFormData }: NotificationSetupProps) {
  // --- State: Active Step ---
  const [activeStep, setActiveStep] = useState(1);

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // --- State: Data ---
  const [departure] = useState(setupFormData.departure || '현재 위치');
  const [destination, setDestination] = useState(setupFormData.destination);
  const [selectedDestinationForNav, setSelectedDestinationForNav] = useState<PlacePrediction | null>(setupFormData.selectedDestinationForNav || null);
  const [recipient, setRecipient] = useState(setupFormData.recipient || '');

  // --- State: Trigger Locations (1 Mandatory + 1 Optional) ---
  const [triggerLocations, setTriggerLocations] = useState<TriggerLocation[]>([]);
  const [currentMapCenter, setCurrentMapCenter] = useState({ lat: 0, lng: 0 });
  const [currentAddress, setCurrentAddress] = useState('위치를 선택해주세요');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // --- State: UI ---
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'destination' | 'waypoint'>('destination'); // Step 1 vs Step 3 구분
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showGuideToast, setShowGuideToast] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false); // 지도 모달 상태

  // --- Kakao Map State ---
  const [isMapReady, setIsMapReady] = useState(false);
  const mapModalRef = useRef<any>(null); // 모달 지도 인스턴스

  // --- Initialize Kakao Map (Step 3) ---
  useEffect(() => {
    if (activeStep === 3 && selectedDestinationForNav && !isMapReady) {
      console.log('🗺️ Step 3 activated, initializing map...');
      setTimeout(() => initializeMap(), 300); // 약간의 지연으로 DOM 준비 보장
    }
  }, [activeStep, selectedDestinationForNav, isMapReady]);

  const initializeMap = () => {
    if (!selectedDestinationForNav?.lat || !selectedDestinationForNav?.lng) {
      console.error('No destination coordinates');
      return;
    }

    console.log('📍 Initializing map with destination:', selectedDestinationForNav.lat, selectedDestinationForNav.lng);

    // Kakao SDK가 이미 로드되어 있는지 확인 (index.html에서 로드됨)
    if ((window as any).kakao && (window as any).kakao.maps) {
      console.log('✅ Kakao SDK already loaded');
      loadKakaoMap();
    } else {
      console.log('⏳ Waiting for Kakao SDK...');
      // SDK 로드 대기 (최대 5초)
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if ((window as any).kakao && (window as any).kakao.maps) {
          console.log('✅ Kakao SDK loaded');
          clearInterval(checkInterval);
          loadKakaoMap();
        } else if (attempts > 50) {
          console.error('❌ Kakao SDK failed to load');
          clearInterval(checkInterval);
        }
      }, 100);
    }
  };

  const loadKakaoMap = () => {
    if (!selectedDestinationForNav?.lat || !selectedDestinationForNav?.lng) return;

    (window as any).kakao.maps.load(() => {
      const container = document.getElementById('kakao-map');
      if (!container) {
        console.error('❌ Map container not found');
        return;
      }

      console.log('🗺️ Creating map...');

      const options = {
        center: new (window as any).kakao.maps.LatLng(selectedDestinationForNav.lat, selectedDestinationForNav.lng),
        level: 3,
      };

      const map = new (window as any).kakao.maps.Map(container, options);
      mapRef.current = map;
      setCurrentMapCenter({ lat: selectedDestinationForNav.lat!, lng: selectedDestinationForNav.lng! });
      setIsMapReady(true);

      console.log('✅ Map initialized successfully');

      // 지도 드래그 종료 시 Reverse Geocoding
      (window as any).kakao.maps.event.addListener(map, 'dragend', () => {
        const center = map.getCenter();
        const newLat = center.getLat();
        const newLng = center.getLng();
        console.log('🔄 Map dragged to:', newLat, newLng);
        setCurrentMapCenter({ lat: newLat, lng: newLng });
        performReverseGeocode(newLat, newLng);
      });

      // 초기 주소 가져오기
      performReverseGeocode(selectedDestinationForNav.lat!, selectedDestinationForNav.lng!);

      // 안내 토스트 표시
      setShowGuideToast(true);
      setTimeout(() => setShowGuideToast(false), 4000);
    });
  };

  const performReverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      // POI 이름 우선 가져오기
      const poiName = await getPOINameByCoord(lat, lng);
      setCurrentAddress(poiName);
      console.log('[NotificationSetup] POI/Address:', poiName);
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
      setCurrentAddress('주소 조회 실패');
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // --- Handle Location Selection ---
  const handleSetLocation = () => {
    if (triggerLocations.length >= 2) {
      alert('알림 위치는 최대 2개까지만 설정할 수 있습니다.');
      return;
    }

    const newLocation: TriggerLocation = {
      lat: currentMapCenter.lat,
      lng: currentMapCenter.lng,
      name: currentAddress,
      address: currentAddress,
    };

    setTriggerLocations([...triggerLocations, newLocation]);

    if (triggerLocations.length === 0) {
      alert(`✅ 1차 알림 위치가 설정되었습니다:\n${currentAddress}`);
    } else {
      alert(`✅ 2차 알림 위치가 설정되었습니다:\n${currentAddress}\n\n총 ${triggerLocations.length + 1}곳에서 알림을 보냅니다.`);
    }
  };

  // --- Scroll Detection Logic ---
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !step1Ref.current || !step2Ref.current || !step3Ref.current) return;

      const containerTop = containerRef.current.scrollTop + 150;
      const step1Top = step1Ref.current.offsetTop;
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

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeStep]);

  // --- Sync Effects ---
  useEffect(() => {
    setSetupFormData({
      ...setupFormData,
      departure,
      destination,
      recipient,
      selectedDestinationForNav,
      targetDistance: 10,
      enableArrival: true,
      enableDeparture: false,
    });
  }, [departure, destination, recipient, selectedDestinationForNav]);

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

      const naverRoute = await getRouteInfoNaver(currentLat, currentLng, destLat, destLng);

      if (naverRoute) {
        distance = naverRoute.distance;
        durationMinutes = Math.round(naverRoute.duration / 1000 / 60);
      } else {
        const kakaoRoute = await getRouteInfoKakao(currentLat, currentLng, destLat, destLng);
        if (kakaoRoute) {
          distance = kakaoRoute.distance;
          durationMinutes = Math.round(kakaoRoute.duration / 60);
        } else {
          throw new Error('경로 정보를 가져올 수 없습니다.');
        }
      }

      const placeName = prediction.structured_formatting?.main_text || prediction.description;
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
      console.error("GPS Setup Error", error);
      alert(`준비 실패: ${error.message || '알 수 없는 오류'}`);
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
      return alert('도착지가 선택되지 않았습니다.');
    }

    // Validation: Recipient
    const hasRecipient = recipient.trim().length > 0 || selectedContacts.length > 0;
    if (!hasRecipient) {
      setIsLoading(false);
      alert('받는 사람(연락처)을 입력해야 합니다.');
      scrollToStep(2);
      return;
    }

    // Validation: Trigger Location (MANDATORY)
    if (triggerLocations.length === 0) {
      setIsLoading(false);
      alert('⚠️ 알림을 보낼 위치를 선택해야 합니다!\n\nStep 3에서 지도를 움직여 위치를 선택한 후\n[이 위치로 설정] 버튼을 눌러주세요.');
      scrollToStep(3);
      return;
    }

    // Validation: Coordinates
    if (!selectedDestinationForNav.lat || !selectedDestinationForNav.lng) {
      setIsLoading(false);
      alert('도착지 좌표 정보가 올바르지 않습니다.\n다시 검색하여 선택해주세요.');
      return;
    }

    const navInfo = await prepareNavigationInfo(selectedDestinationForNav);

    if (!navInfo) {
      setIsLoading(false);
      return;
    }

    setShowSuccessOverlay(true);

    setTimeout(() => {
      const manualRecipients = recipient.split(',').map(r => r.trim()).filter(Boolean);
      const contactRecipients = selectedContacts.map(c => {
        const phone = c.phoneNumber || c.phone;
        return phone ? `${c.name} (${phone})` : null;
      }).filter(Boolean);

      const finalRecipientString = [...new Set([...manualRecipients, ...contactRecipients])].join(',');

      const trip: Trip = {
        id: Date.now().toString(),
        departure: navInfo.departure,
        destination: navInfo.destination,
        notifications: [{
          id: Date.now().toString() + '_arr',
          type: 'arrival',
          condition: { type: 'distance', value: 1.0, unit: 'km' },
          message: `[알림] {currentLocation} 근처입니다. {destination}까지 약 {time}분 남았습니다.`,
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
        triggerType: 'waypoint',
        triggerValue: String(triggerLocations.length),
        waypoints: JSON.stringify(triggerLocations.map(loc => ({
          lat: loc.lat,
          lng: loc.lng,
          name: loc.name
        }))),
      };

      setIsLoading(false);
      onComplete(trip);
    }, 2000);
  };

  const handleDestinationSelect = (result: any) => {
    if (searchMode === 'destination') {
      // Step 1: 도착지 설정
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
      // Step 3: Waypoint 추가 (도착지는 그대로 유지!)
      if (triggerLocations.length >= 2) {
        alert('알림 위치는 최대 2개까지만 설정할 수 있습니다.');
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
      setIsSearching(false);

      // 지도 중심을 선택한 위치로 이동
      if (mapRef.current) {
        mapRef.current.setCenter(new (window as any).kakao.maps.LatLng(newLocation.lat, newLocation.lng));
      }

      alert(`✅ ${triggerLocations.length + 1}차 알림 위치가 설정되었습니다:\n${newLocation.name}`);
    }
  };

  // --- Render Button Text Based on State ---
  const getStep3ButtonText = () => {
    if (triggerLocations.length === 0) {
      return '이 위치로 1차 알림 설정';
    } else if (triggerLocations.length === 1) {
      return '이 위치로 2차 알림 설정';
    } else {
      return '알림 위치 설정 완료 (최대 2개)';
    }
  };

  return (
    <div className="flex flex-col h-full bg-app-primary text-text-primary relative">

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

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-app-primary text-white animate-in fade-in duration-300">
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

      {/* Guide Toast */}
      {showGuideToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-app-accent text-app-primary px-6 py-3 rounded-full shadow-lg animate-in slide-in-from-top duration-300">
          <p className="text-sm font-bold">📍 지도를 움직여 알림 위치를 선택해주세요</p>
        </div>
      )}

      {/* Header */}
      <header className="pt-safe px-4 h-16 flex items-center justify-between border-b border-border bg-app-primary sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-text-muted hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">알림 예약</h1>
        <div className="w-10"></div>
      </header>

      {/* Top Stepper */}
      <div className="sticky top-16 z-20 bg-app-primary/95 backdrop-blur-sm px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between relative max-w-sm mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 -translate-y-1/2" />
          <div className="absolute top-1/2 left-0 h-0.5 bg-app-accent -translate-y-1/2 transition-all duration-300" style={{ width: `${((activeStep - 1) / 2) * 100}%` }} />
          <StepperItem step={1} label="도착지" activeStep={activeStep} scrollToStep={scrollToStep} />
          <StepperItem step={2} label="연락처" activeStep={activeStep} scrollToStep={scrollToStep} />
          <StepperItem step={3} label="위치" activeStep={activeStep} scrollToStep={scrollToStep} />
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-6 py-8 space-y-6 pb-40">

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
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="이름 또는 전화번호 직접 입력"
                  className="pl-12 pr-10 h-14 bg-app-primary border-border text-white rounded-xl focus:border-app-accent"
                />
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
          </SectionCard>

          {/* Step 3: Trigger Location Selection */}
          <SectionCard step={3} title="어디서 알림을 보낼까요?" myRef={step3Ref} activeStep={activeStep}>
            <div className="space-y-4">

              {/* Search Button */}
              <button
                onClick={() => { setSearchMode('waypoint'); setIsSearching(true); }}
                className="w-full h-12 bg-app-primary border-2 border-app-accent/30 rounded-xl flex items-center justify-center gap-2 text-app-accent font-bold hover:border-app-accent transition-all"
              >
                <Search className="w-5 h-5" />
                주소 검색
              </button>

              {/* Map Container */}
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden border-2 border-border">
                <div id="kakao-map" className="w-full h-full bg-gray-800"></div>

                {/* Fixed Center Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
                  <MapPin className="w-10 h-10 text-red-500 drop-shadow-lg" fill="currentColor" />
                </div>

                {/* Loading Overlay */}
                {isReverseGeocoding && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                {/* Map Not Ready Overlay */}
                {!isMapReady && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-app-accent animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">지도를 불러오는 중...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Address Info Panel */}
              <div className="bg-app-secondary border border-border rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">현재 핀 위치</p>
                <p className="text-white font-bold">{currentAddress}</p>
              </div>

              {/* Selected Locations Display */}
              {triggerLocations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">설정된 알림 위치</p>
                  {triggerLocations.map((loc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-app-primary border border-app-accent rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-app-accent text-app-primary flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{index === 0 ? '1차' : '2차'} 알림</div>
                          <div className="text-xs text-gray-400">{loc.name}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setTriggerLocations(triggerLocations.filter((_, i) => i !== index))}
                        className="p-2 text-gray-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Set Location Button */}
              {triggerLocations.length < 2 && (
                <Button
                  onClick={handleSetLocation}
                  disabled={!isMapReady || isReverseGeocoding}
                  className="w-full h-14 bg-app-accent hover:brightness-110 text-app-primary font-bold rounded-xl transition-all"
                >
                  {getStep3ButtonText()}
                </Button>
              )}

              {/* Add Second Location Button (Optional) */}
              {triggerLocations.length === 1 && (
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2">또는</p>
                  <button
                    onClick={() => {
                      alert('지도를 움직여 2차 알림 위치를 선택해주세요.');
                    }}
                    className="text-sm text-app-accent font-bold flex items-center gap-1 mx-auto hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    알림 위치 추가 (50P)
                  </button>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-300">
                  {triggerLocations.length === 0
                    ? '📍 지도를 움직여 알림을 보낼 위치를 선택한 후 [설정] 버튼을 눌러주세요.'
                    : triggerLocations.length === 1
                      ? `✅ 1차 알림: "${triggerLocations[0].name}" 반경 500m 진입 시 메시지가 발송됩니다.`
                      : `✅ 총 ${triggerLocations.length}곳에서 알림이 발송됩니다.`
                  }
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 right-0 p-6 bg-app-primary/95 backdrop-blur-md border-t border-border z-[100]">
        <Button
          onClick={handleStartReservation}
          disabled={isLoading || triggerLocations.length === 0}
          className="w-full h-14 bg-gradient-to-r from-app-accent to-[#00cc6a] hover:brightness-110 text-app-primary text-xl font-bold rounded-2xl shadow-lg shadow-app-accent/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />생성 중...</> : triggerLocations.length === 0 ? '알림 위치를 선택해주세요' : `예약 완료하기 (${triggerLocations.length}곳)`}
        </Button>
      </div>
    </div>
  );
}
