import { ChevronLeft, Info, MapPin, MessageSquare, X, Trash2, MoreVertical, Calendar, User, Star } from 'lucide-react';
import { formatRecipientDisplay } from '../utils/formatters';
import type { Screen, Trip } from '../App';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

interface NotificationListProps {
  trips: Trip[];
  onNavigate: (screen: Screen) => void;
  onSelectTrip: (trip: Trip) => void;
  onCancelTrip: (tripId: string) => void;
  onToggleFavorite?: (tripId: string) => void;
  onDeleteTrip?: (tripId: string) => void;
  onClearHistory?: () => void;
  selectionMode?: boolean;
}

export function NotificationList({ trips, onNavigate, onSelectTrip, onDeleteTrip, onClearHistory, onToggleFavorite, selectionMode = false }: NotificationListProps) {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const historyTrips = trips.filter(t => t.status === 'completed' || t.status === 'cancelled');

  const [visibleCount, setVisibleCount] = useState(10);

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, tripId: string | null }>({ isOpen: false, tripId: null });
  
  const [activeMenuTripId, setActiveMenuTripId] = useState<string | null>(null);
  const [selectedDetailTrip, setSelectedDetailTrip] = useState<Trip | null>(null);
  const [favoriteConfirmState, setFavoriteConfirmState] = useState<{ isOpen: boolean, tripId: string | null, isFavorite: boolean }>({ isOpen: false, tripId: null, isFavorite: false });

  const sortedTrips = [...historyTrips].sort((a, b) => {
    return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
  });

  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return <span className="bg-[#eab308] text-black px-3 py-1 rounded-full text-xs font-bold">예약</span>;
      case 'active':
        return <span className="bg-app-accent text-app-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-app-primary rounded-full animate-pulse"></span>운행중</span>;
      case 'completed':
        return <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold">완료</span>;
      case 'cancelled':
        return <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold">취소</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-app-primary text-text-primary overflow-hidden">
      <header className="pt-safe mt-2 px-4 h-16 flex items-center gap-4 border-b border-border bg-app-primary sticky top-0 z-20">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 -ml-2 text-text-muted hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center pr-10">
          {selectionMode ? "즐겨찾기 추가 선택" : "완료 내역"}
        </h1>
        {!selectionMode && (
          <button
            onClick={() => setShowEditMenu(true)}
            className="text-sm text-app-accent font-bold hover:text-white transition-colors"
          >
            편집
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide pt-6">
        {sortedTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-text-muted gap-4 opacity-50">
            <Info className="w-12 h-12" />
            <p className="text-sm">완료된 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTrips.slice(0, visibleCount).map((trip) => (
              <div
                key={trip.id}
                onClick={() => {
                  if (selectionMode && onSelectTrip) onSelectTrip(trip);
                  else if (trip.status === 'active') {
                    onSelectTrip(trip);
                    onNavigate('active');
                  }
                }}
                className={`bg-app-secondary border border-border rounded-2xl p-5 relative transition-all group ${trip.status === 'active' ? 'ring-1 ring-app-accent cursor-pointer active:scale-[0.98]' : (selectionMode ? 'hover:border-app-accent cursor-pointer' : 'hover:border-gray-600')}`}
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-gray-500" />
                    <h3 className="font-bold text-lg leading-snug break-keep text-gray-300 truncate pr-2">{trip.destination}</h3>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 relative">
                    {getStatusBadge(trip.status)}

                    {!selectionMode && (trip.status === 'completed' || trip.status === 'cancelled') && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTripId(activeMenuTripId === trip.id ? null : trip.id);
                          }}
                          className={`p-1.5 rounded-full transition-colors ${activeMenuTripId === trip.id ? 'bg-app-accent text-app-primary' : 'bg-gray-700/50 text-gray-400 hover:text-white'}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuTripId === trip.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-30" 
                              onClick={(e) => { e.stopPropagation(); setActiveMenuTripId(null); }} 
                            />
                            <div className="absolute right-0 mt-2 w-36 bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl z-40 overflow-hidden py-1 animate-in fade-in zoom-in duration-200 origin-top-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDetailTrip(trip);
                                  setActiveMenuTripId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Info className="w-4 h-4" />
                                상세 이용 내역
                              </button>
                                {onToggleFavorite && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFavoriteConfirmState({ 
                                        isOpen: true, 
                                        tripId: trip.id, 
                                        isFavorite: !!trip.isFavorite 
                                      });
                                      setActiveMenuTripId(null);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 flex items-center gap-2 border-t border-gray-700/50 ${
                                      trip.isFavorite ? 'text-yellow-400' : 'text-gray-200'
                                    }`}
                                  >
                                    <Star className={`w-4 h-4 ${trip.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                    {trip.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                  </button>
                                )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmState({ isOpen: true, tripId: trip.id });
                                  setActiveMenuTripId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-gray-700/50"
                              >
                                <Trash2 className="w-4 h-4" />
                                삭제
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {trip.status === 'completed' && trip.sentMessages && trip.sentMessages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {trip.sentMessages.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-app-accent/10 border border-app-accent/20 rounded-md text-[10px] text-app-accent font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="h-px bg-gray-700/50 w-full mb-4" />

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-text-muted">
                    <UserIcon />
                    <span className="text-gray-300">{formatRecipientDisplay(trip.recipient)}</span>
                  </div>

                  {trip.status === 'completed' && (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      trip.smsMode === 'kakao'
                        ? 'bg-yellow-500/15 text-yellow-400'
                        : 'bg-blue-500/15 text-blue-400'
                    }`}>
                      <MessageSquare className="w-3 h-3" />
                      <span>{trip.smsMode === 'kakao' ? '카카오 전송' : '문자 전송'}</span>
                    </div>
                  )}

                  {trip.status === 'cancelled' && (
                    <span className="text-xs text-gray-600">{trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : ''}</span>
                  )}
                </div>
              </div>
            ))}

            {visibleCount < sortedTrips.length && (
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="w-full py-3 text-sm text-text-muted hover:text-white bg-app-secondary border border-border rounded-xl transition-colors"
              >
                더 보기 ({sortedTrips.length - visibleCount}개 남음)
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, tripId: null })}
        onConfirm={() => {
          if (confirmState.tripId && onDeleteTrip) {
            onDeleteTrip(confirmState.tripId);
          }
        }}
        title=""
        message={<span className="text-lg font-bold text-[#111111] dark:text-white">이 기록을 삭제하시겠습니까?</span>}
        confirmText="삭제"
        cancelText="취소"
        isDestructive={true}
      />

      <ConfirmModal
        isOpen={favoriteConfirmState.isOpen}
        onClose={() => setFavoriteConfirmState({ isOpen: false, tripId: null, isFavorite: false })}
        onConfirm={() => {
          if (favoriteConfirmState.tripId && onToggleFavorite) {
            onToggleFavorite(favoriteConfirmState.tripId);
          }
          setFavoriteConfirmState({ isOpen: false, tripId: null, isFavorite: false });
        }}
        title=""
        message={
          <span className="text-lg font-bold text-[#111111] dark:text-white">
            {favoriteConfirmState.isFavorite ? "즐겨찾기에서 해제하시겠습니까?" : "즐겨찾기에 추가하시겠습니까?"}
          </span>
        }
        confirmText="확인"
        cancelText="취소"
      />

      {showEditMenu && (
        <div className="fixed inset-0 z-[200]" onClick={() => setShowEditMenu(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-app-secondary rounded-t-3xl p-6 pb-10 border-t border-border shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
            <h3 className="text-center text-lg font-bold text-white mb-6">편집</h3>
            <div className="space-y-3">
              <button
                onClick={() => { setShowEditMenu(false); onNavigate('list'); }}
                className="w-full py-4 px-5 bg-app-primary border border-border rounded-2xl text-left text-white font-medium flex items-center gap-3 hover:border-app-accent transition-colors"
              >
                <span className="text-xl">📋</span>
                <div>
                  <div className="font-bold">내역보기</div>
                  <div className="text-xs text-gray-400">완료된 예약 내역을 확인합니다</div>
                </div>
              </button>
              <button
                onClick={() => { setShowEditMenu(false); setShowClearConfirm(true); }}
                className="w-full py-4 px-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-left text-red-400 font-medium flex items-center gap-3 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-xl">🗑️</span>
                <div>
                  <div className="font-bold">내역 초기화</div>
                  <div className="text-xs text-red-400/70">모든 완료/취소 내역을 삭제합니다</div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowEditMenu(false)}
              className="w-full mt-4 py-3 text-gray-400 text-sm font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          if (onClearHistory) onClearHistory();
          setShowClearConfirm(false);
        }}
        title=""
        message={<span className="text-lg font-bold text-[#111111] dark:text-white">모든 내역을 초기화하시겠습니까?<br /><span className='text-sm font-normal text-red-400'>이 작업은 되돌릴 수 없습니다.</span></span>}
        confirmText="전체 삭제"
        cancelText="취소"
        isDestructive={true}
      />

      {selectedDetailTrip && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDetailTrip(null)}>
          <div 
            className="w-full max-w-sm bg-[#1e293b] border border-gray-700 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">상세 이용 내역</h3>
                <button onClick={() => setSelectedDetailTrip(null)} className="p-2 -mr-2 text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">이용 일시</div>
                    <div className="text-sm text-gray-200 font-medium">
                      {(() => {
                        // completedAt = 실제 도착 시각 (1순위)
                        // createdAt = 예약 생성 시각 (폴백)
                        const raw = selectedDetailTrip.completedAt || selectedDetailTrip.createdAt;
                        if (!raw) return '-';
                        try {
                          const d = new Date(raw);
                          if (!isNaN(d.getTime())) {
                            return d.toLocaleString('ko-KR', {
                              year: 'numeric', month: '2-digit', day: '2-digit',
                              hour: '2-digit', minute: '2-digit', hour12: false
                            });
                          }
                        } catch {}
                        return raw; // 이미 포맷된 문자열이면 그대로
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">출발지</div>
                    <div className="text-sm text-gray-200 font-medium truncate">
                      {selectedDetailTrip.startPoint || selectedDetailTrip.startPointName || '알 수 없음'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">목적지</div>
                    <div className="text-sm text-gray-200 font-medium truncate">
                      {selectedDetailTrip.destination}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">수신인 ({selectedDetailTrip.recipientCount || 1}명)</div>
                    <div className="text-sm text-gray-200 font-medium font-mono">
                      {formatRecipientDisplay(selectedDetailTrip.recipient)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700/50">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> 전송 방식
                    </span>
                    <span className={`text-xs font-bold ${selectedDetailTrip.smsMode === 'kakao' ? 'text-yellow-400' : 'text-blue-400'}`}>
                      {selectedDetailTrip.smsMode === 'kakao' ? '카카오 알림톡' : '일반 문자'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-gray-500 mb-1">발송 성공 내역</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDetailTrip.sentMessages && selectedDetailTrip.sentMessages.length > 0 ? (
                        selectedDetailTrip.sentMessages.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-app-accent/20 text-app-accent border border-app-accent/30 rounded text-[10px] font-bold">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600">발송 내역 없음</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-gray-200">차감 포인트</span>
                    <span className="text-lg font-bold text-app-accent">
                      -{(() => {
                        const count = selectedDetailTrip.recipientCount || 1;
                        if (selectedDetailTrip.smsMode === 'kakao') {
                          const sentDeparture = selectedDetailTrip.sentMessages?.includes('출발문자');
                          return (sentDeparture ? 100 : 50) * count;
                        }
                        return count >= 2 ? 100 : 50;
                      })()}P
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailTrip(null)}
                className="w-full mt-8 py-3.5 bg-app-accent text-app-primary font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Icon Component
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);