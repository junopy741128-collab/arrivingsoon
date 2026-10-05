import { Plus, History, ChevronRight, MapPin, Star, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Screen, Trip, UserProfile } from '../App';

interface HomePageProps {
  onNavigate: (screen: Screen) => void;
  activeTrips?: Trip[];
  onSelectTrip?: (trip: Trip) => void;
  userProfile?: UserProfile;
  recentTrips?: Trip[];
  favoriteTrips?: Trip[];
  onStartTrip?: (trip: Trip) => void;
  onEnterSelectionMode?: () => void; // [V36] Added for Favorites Refactor
}

function formatTimeAgo(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // seconds
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export function HomePage({ onNavigate, activeTrips, onSelectTrip, userProfile, recentTrips = [], favoriteTrips = [], onStartTrip, onEnterSelectionMode }: HomePageProps) {
  const [completedTrips, setCompletedTrips] = useState<Record<string, boolean>>({});

  // [Fix] Poll native status periodically to detect arrival
  useEffect(() => {
    const checkNativeStatuses = async () => {
      if (!activeTrips || activeTrips.length === 0) return;
      try {
        const { TripNotification } = await import('../plugins/TripNotificationPlugin');
        // @ts-ignore
        const state = await TripNotification.checkCurrentStatus();
        if (state && (state.status === 'completed' || state.distanceMeters === 0)) {
          // We only have one active trip typically due to the design
          const matchingTrip = activeTrips[0];
          if (matchingTrip) {
            setCompletedTrips(prev => ({ ...prev, [matchingTrip.id]: true }));
            localStorage.setItem(`trip_completed_${matchingTrip.id}`, 'true');
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkNativeStatuses();
    // Poll every 5 seconds while on home screen to catch arrival
    const interval = setInterval(checkNativeStatuses, 5000);
    return () => clearInterval(interval);
  }, [activeTrips]);

  return (
    <div className="flex flex-col w-full h-full bg-app-primary text-text-primary overflow-hidden">
      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto pb-32 pt-safe px-6 scrollbar-hide">

        {/* --- Header --- */}
        <header className="pt-8 pb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-medium leading-tight text-white">
              {userProfile ? userProfile.name : '김운전'}님<br />
              <span className="text-text-muted text-sm font-normal">안전운전 하세요!</span>
            </h1>
          </div>
          <button
            onClick={() => onNavigate('mypage')}
            className="text-app-accent text-sm font-medium hover:text-app-accent-hover transition-colors"
          >
            프로필
          </button>
        </header>

        {/* --- Points Banner --- */}
        <div
          onClick={() => onNavigate('mypage')}
          className="w-full bg-gradient-to-br from-[#1a4d3d] to-app-secondary border border-[#2a6d5d] rounded-2xl p-5 mb-8 shadow-lg relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
        >
          {/* Using arbitrary values here for the specific gradient look requested in spec visuals if variables don't cover specific gradients yet, but colors map to tokens */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-app-accent opacity-5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 text-text-muted text-sm">
              보유 포인트
            </div>
            <ChevronRight className="w-5 h-5 text-text-disabled" />
          </div>
          <div className="mt-1 text-3xl font-bold text-app-accent tracking-tight">
            {userProfile?.points?.toLocaleString() || 0}P
          </div>
        </div>
        {/* --- Active Trips List --- */}
        {activeTrips && activeTrips.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-app-accent animate-pulse">
              <Clock className="w-5 h-5" />
              <span className="font-bold text-lg">
                진행 중인 알림 ({activeTrips.length})
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {activeTrips.map(trip => {
                // Determine real status
                const isCompleted = trip.status === 'completed';
                const isRealCompleted = completedTrips[trip.id] || localStorage.getItem(`trip_completed_${trip.id}`) === 'true';
                const isArrived = isCompleted || isRealCompleted;

                return (
                  <div
                    key={trip.id}
                    onClick={async () => {
                      if (onSelectTrip) onSelectTrip(trip);

                      try {
                        const { TripNotification } = await import('../plugins/TripNotificationPlugin');
                        // @ts-ignore
                        const res = await TripNotification.isServiceRunning();
                        if (res && res.running) {
                          console.log("🚀 Smart Resume: Service is ACTIVE. Skipping re-init.");
                          onNavigate('active');
                          // @ts-ignore
                          TripNotification.updateNotification({ tripData: { command: "sync" } });
                        } else {
                          // Wait, check if it's actually completed
                          const currentState = await TripNotification.checkCurrentStatus();
                          if (currentState && currentState.status === 'completed') {
                            localStorage.setItem(`trip_completed_${trip.id}`, 'true');
                          }
                          onNavigate('active');
                        }
                      } catch (e) {
                        console.error("Smart Resume Check Failed", e);
                        onNavigate('active');
                      }
                    }}
                    className={`bg-app-secondary border rounded-2xl p-4 shadow-lg active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden ${
                      isArrived ? 'border-blue-500/40' : 'border-app-accent/30'
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-2 bg-app-accent/10 rounded-bl-xl">
                      <div className={`w-2 h-2 rounded-full ${
                        isArrived ? 'bg-blue-400' : 'bg-app-accent animate-ping'
                      }`}></div>
                    </div>
                    <div className="flex justify-between items-start mb-2 pr-6">
                      <div className="flex items-center gap-2 max-w-[80%]">
                        <MapPin className={`w-5 h-5 shrink-0 ${isArrived ? 'text-blue-400' : 'text-app-accent'}`} />
                        <span className="font-bold text-lg truncate text-white">{trip.destination}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-text-muted truncate flex-1">
                        {trip.recipient || '수신자 미지정'}
                      </div>
                      {/* Dynamic Tag based on Real Status */}
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isArrived
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-app-accent text-app-primary'
                      }`}>
                        {isArrived ? '도착' : '운행중'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* --- Recent History (Real Data) --- */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-center gap-2 text-app-accent">
              <History className="w-5 h-5" />
              <span className="font-bold text-lg">최근 기록</span>
            </div>
            {/* Clear button could be handled via prop if needed, removing for now or keep generic */}
          </div>

          {recentTrips.length > 0 ? (
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-6 px-6 scrollbar-hide snap-x">
              {recentTrips.map(trip => (
                <div
                  key={trip.id}
                  className="flex-none w-[200px] snap-center bg-app-secondary border border-border rounded-2xl p-4 active:bg-app-tertiary transition-colors cursor-pointer"
                  onClick={() => {
                    // Optional: Rebook logic or View Detail
                    // For now we just go to list? Or simple rebook?
                    // User requested "Apply actual content". 
                    // Let's assume clicking might check details in List view or just be display.
                    // Ideally onNavigate('list') and specific tab?
                    onNavigate('list');
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <MapPin className="w-5 h-5 text-text-disabled" />
                    <span className="text-xs text-text-disabled">{formatTimeAgo(trip.createdAt || '')}</span>
                  </div>
                  <h3 className="font-bold text-base text-white truncate mb-1">{trip.destination}</h3>
                  <p className="text-xs text-text-muted truncate">{trip.departure}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-app-secondary/50 rounded-2xl p-6 text-center text-text-muted text-sm border border-border border-dashed">
              최근 운행 기록이 없습니다.
            </div>
          )}
        </div>

        {/* --- Favorites --- */}
        <div className="mb-24">
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-center gap-2 text-app-accent">
              <MapPin className="w-5 h-5 font-bold" />
              <span className="font-bold text-lg">즐겨찾기</span>
            </div>
            <button onClick={() => onNavigate('favorites')} className="text-xs text-text-muted hover:text-white transition-colors">관리</button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {favoriteTrips && favoriteTrips.length > 0 ? (
              favoriteTrips.slice(0, 3).map(fav => (
                <div
                  key={fav.id}
                  onClick={() => {
                    if (onStartTrip) {
                      onStartTrip(fav);
                    } else {
                      onNavigate('setup');
                    }
                  }}
                  className="aspect-square bg-app-secondary border border-border rounded-2xl flex flex-col items-center justify-center gap-2 active:bg-app-tertiary transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-app-primary flex items-center justify-center text-xl">
                    <Star className="w-5 h-5 text-app-accent fill-app-accent" />
                  </div>
                  <span className="text-xs font-bold text-text-primary text-center truncate w-full px-1">{fav.alias || fav.destination.split(' ')[0]}</span>
                </div>
              ))
            ) : null}
            {/* Add Button */}
            <div
              onClick={() => {
                if (onEnterSelectionMode) onEnterSelectionMode(); // [V36] Enter Selection Mode
                else onNavigate('list'); // Fallback
              }}
              className="aspect-square border border-dashed border-border-light rounded-2xl flex flex-col items-center justify-center gap-2 active:bg-app-secondary transition-colors cursor-pointer"
            >
              <Plus className="w-6 h-6 text-text-disabled" />
              <span className="text-xs font-medium text-text-disabled">추가</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Floating Action Button --- */}
      <div className="fixed bottom-[90px] left-6 right-6 z-20 pb-safe">
        <button
          onClick={() => onNavigate('setup')}
          className="w-full h-14 bg-gradient-to-r from-app-accent to-app-accent-hover text-app-primary font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(0,255,136,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
          새 알림 예약하기
        </button>
      </div>

    </div>
  );
}