import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { getPOINameByCoord } from '../utils/kakao-service';
import { showAlert } from '../utils/globalAlert';
import flagMarker from '../assets/pin_red_v18.png';

interface LocationSelectModalProps {
    isOpen: boolean;
    initialLocation: { lat: number; lng: number } | null;
    onClose: () => void;
    onConfirm: (location: { lat: number; lng: number; name: string }) => void;
    routePath?: { lat: number; lng: number }[]; // [V20] Route Path Prop
}

export function LocationSelectModal({ isOpen, initialLocation, onClose, onConfirm, routePath }: LocationSelectModalProps) {
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationName, setLocationName] = useState<string>('위치 확인 중...');
    const [isLoading, setIsLoading] = useState(false);

    // [V27] Use Ref for Container instead of ID
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const overlayRef = useRef<any>(null);
    const polylineRef = useRef<any>(null); // [V20] Polyline Ref

    // Zoom State
    // const [zoomLevel, setZoomLevel] = useState(3); // Unused

    useEffect(() => {
        if (!isOpen) return;
        if (!initialLocation) return;

        const loadKakaoMapScript = () => {
            return new Promise<void>((resolve, reject) => {
                if ((window as any).kakao?.maps) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                const apiKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
                script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
                script.async = true;
                script.onload = () => {
                    (window as any).kakao.maps.load(() => {
                        resolve();
                    });
                };
                script.onerror = (err) => {
                    console.error('Kakao Map Script Load Error', err);
                    reject(err);
                };
                document.head.appendChild(script);
            });
        };

        const initMap = async () => {
            try {
                await loadKakaoMapScript();

                if (!containerRef.current) {
                    // Retry container finding (React rendering timing)
                    setTimeout(initMap, 100);
                    return;
                }

                // If map already exists, clean up potential old instance if ref exists but we are re-initing
                if (mapRef.current) {
                    // mapRef.current = null; // Do not nullify here, might cause flash? 
                    // Actually, if container is same, we should reuse. 
                    // unique map instance per modal open is safer.
                    // But if we reuse, we need to setCenter.
                }

                // Let's reuse if exists
                if (mapRef.current) {
                    const moveLatLon = new (window as any).kakao.maps.LatLng(initialLocation.lat, initialLocation.lng);
                    mapRef.current.setCenter(moveLatLon);

                    // Force Layout Update
                    setTimeout(() => {
                        mapRef.current.relayout();
                    }, 100);

                    setCurrentLocation(initialLocation);
                    updateLocationName(initialLocation.lat, initialLocation.lng);
                    return;
                }

                const options = {
                    center: new (window as any).kakao.maps.LatLng(initialLocation.lat, initialLocation.lng),
                    level: 3 // Zoom level 3 is good for street level
                };

                const map = new (window as any).kakao.maps.Map(containerRef.current, options);
                mapRef.current = map;

                // Event Listeners
                (window as any).kakao.maps.event.addListener(map, 'dragend', () => {
                    const center = map.getCenter();
                    const newLocation = { lat: center.getLat(), lng: center.getLng() };
                    setCurrentLocation(newLocation);
                });

                (window as any).kakao.maps.event.addListener(map, 'idle', () => {
                    const center = map.getCenter();
                    updateLocationName(center.getLat(), center.getLng());
                });

                // Initial Setup
                setCurrentLocation(initialLocation);
                updateLocationName(initialLocation.lat, initialLocation.lng);

                // Relayout triggers
                [100, 300, 500].forEach(delay => {
                    setTimeout(() => {
                        if (mapRef.current) {
                            mapRef.current.relayout();
                            const center = new (window as any).kakao.maps.LatLng(initialLocation.lat, initialLocation.lng);
                            mapRef.current.setCenter(center);
                        }
                    }, delay);
                });

                // Draw Route if exists
                if (routePath && routePath.length > 0) {
                    if (polylineRef.current) polylineRef.current.setMap(null);

                    const simplifiedPath = routePath.filter((_, index) => index === 0 || index === routePath.length - 1 || index % 5 === 0);
                    const linePath = simplifiedPath.map(p => new (window as any).kakao.maps.LatLng(p.lat, p.lng));

                    const polyline = new (window as any).kakao.maps.Polyline({
                        path: linePath,
                        strokeWeight: 6,
                        strokeColor: '#00E57D',
                        strokeOpacity: 0.8,
                        strokeStyle: 'solid'
                    });

                    polyline.setMap(mapRef.current);
                    polylineRef.current = polyline;
                }

            } catch (error: any) {
                console.error('[LocationSelectModal] Map init failed:', error);
                showAlert('지도 로딩에 실패했습니다.\n네트워크 상태를 확인해주세요.');
            }
        };

        // [V25] Force delay for WebView layout settlement
        setTimeout(() => {
            initMap();
        }, 300);

        return () => {
            // [V27] Cleanup Map Instance
            if (mapRef.current) {
                mapRef.current = null;
            }
        };
    }, [isOpen, initialLocation]);


    useEffect(() => {
        if (!mapRef.current || !currentLocation) return;

        if (overlayRef.current) {
            overlayRef.current.setMap(null);
        }

        const content = `
            <div style="
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                margin-bottom: 50px;
            ">
                ${locationName}
            </div>
        `;

        const position = new (window as any).kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
        const overlay = new (window as any).kakao.maps.CustomOverlay({
            position: position,
            content: content,
            yAnchor: 1,
        });

        overlay.setMap(mapRef.current);
        overlayRef.current = overlay;

        return () => {
            if (overlayRef.current) {
                overlayRef.current.setMap(null);
            }
        };
    }, [currentLocation, locationName]);

    const updateLocationName = async (lat: number, lng: number) => {
        setIsLoading(true);
        try {
            const name = await getPOINameByCoord(lat, lng);
            setLocationName(name);
        } catch (error) {
            console.error('[LocationSelectModal] Failed to get location name:', error);
            setLocationName('주소 조회 실패');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        if (!currentLocation) return;
        onConfirm({
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            name: locationName,
        });
    };

    const handleZoomIn = () => {
        if (mapRef.current) {
            const level = mapRef.current.getLevel();
            mapRef.current.setLevel(level - 1, { animate: true });
            // setZoomLevel(level - 1);
        }
    };

    const handleZoomOut = () => {
        if (mapRef.current) {
            const level = mapRef.current.getLevel();
            mapRef.current.setLevel(level + 1, { animate: true });
            // setZoomLevel(level + 1);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        // FIXED 최상위 컨테이너 - React Portal로 body에 직접 렌더링 (Stacking Context 탈출)
        <div className="fixed inset-0 z-[99999] bg-gray-900 flex flex-col font-sans">

            {/* [V21] Loading State if initialLocation is null */}
            {!initialLocation && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-50 bg-gray-900/50">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#00E57D]" />
                    <span className="text-lg font-bold">위치 정보를 불러오는 중입니다...</span>
                </div>
            )}

            {/* 1. 지도 (가장 먼저 선언 = 가장 밑에 깔림) */}
            {/* [V27] Use Ref for Container */}
            <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full"></div>

            {/* 2. 상단 닫기 버튼 (FIXED로 공중에 띄움) */}
            <button
                onClick={onClose}
                className="fixed top-4 right-4 z-[9999] bg-white/90 hover:bg-white p-3 rounded-full shadow-2xl transition-colors"
            >
                <X className="w-6 h-6 text-gray-800" />
            </button>

            {/* 3. 중앙 고정 핀 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none pb-12">
                <img src={flagMarker} alt="Target" className="w-16 h-16 drop-shadow-2xl" />
            </div>

            {/* 4. 로딩 인디케이터 */}
            {isLoading && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">위치 확인 중...</span>
                </div>
            )}

            {/* 6. Zoom Controls (New) - Top Right below close button */}
            <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2">
                <button
                    onClick={handleZoomIn}
                    className="w-10 h-10 bg-white/90 hover:bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-800 font-bold border border-gray-200"
                >
                    +
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-10 h-10 bg-white/90 hover:bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-800 font-bold border border-gray-200"
                >
                    -
                </button>
            </div>

            {/* 5. 하단 패널 (FIXED로 공중에 띄움 - z-[99999]로 극한 상향! - Footer(80px) 위로 올림) */}
            <div className="fixed bottom-0 left-0 right-0 z-[99999] p-4 pb-8 bg-transparent" style={{ zIndex: 99999 }}>
                <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-2xl mb-4">
                    {/* 위치 이름 */}
                    <h3 className="text-xl font-bold text-white mb-1">
                        {locationName}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                        지도를 움직여 핀을 맞춰주세요
                    </p>

                    {/* 확인 버튼 */}
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || !currentLocation}
                        className="w-full h-14 bg-[#00E57D] hover:bg-[#00C56A] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold text-lg rounded-xl shadow-lg active:scale-95 transition-all"
                    >
                        이 위치로 설정완료
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
