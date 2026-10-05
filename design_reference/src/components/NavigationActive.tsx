import { useState, useEffect } from 'react';
import { MapPin, Flag, Bell, Minus, Plus, Navigation2, Clock, MessageSquare, Users, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { BottomNav } from './BottomNav';
import type { Trip, Screen } from '../App';

interface NavigationActiveProps {
  trip: Trip;
  onUpdate: (trip: Trip) => void;
  onCancel: () => void;
  onNavigate: (screen: Screen) => void;
}

export function NavigationActive({ trip, onUpdate, onCancel, onNavigate }: NavigationActiveProps) {
  const [currentTime, setCurrentTime] = useState(trip.estimatedTime || 15);
  const [currentDistance, setCurrentDistance] = useState(trip.estimatedDistance || 8);
  const [status, setStatus] = useState<'connecting' | 'active'>('connecting');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTime, setEditedTime] = useState(trip.estimatedTime || 15);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelCompleteDialogOpen, setIsCancelCompleteDialogOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('위치 정보 대기 중...');
  const [messagePreview, setMessagePreview] = useState('');
  const [isMessageSentDialogOpen, setIsMessageSentDialogOpen] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'good' | 'poor'>('good'); // GPS 상태

  // 진행률 계산
  const initialDistance = trip.estimatedDistance || 8;
  const progress = Math.min(100, Math.max(0, ((initialDistance - currentDistance) / initialDistance) * 100));
  const isNearDestination = currentDistance <= 12; // 12km 이내

  // 문자 발송 예정 시점 계산 (진행률 80%)
  const notificationTriggerProgress = 80;

  useEffect(() => {
    // Simulate navigation connection
    const connectTimeout = setTimeout(() => {
      setStatus('active');
      const updatedTrip = { ...trip, status: 'active' as const, startTime: new Date() };
      onUpdate(updatedTrip);
    }, 2000);

    return () => clearTimeout(connectTimeout);
  }, []);

  useEffect(() => {
    if (status !== 'active') return;

    // Simulate navigation progress
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = Math.max(0, prev - 0.1);
        return newTime;
      });
      
      setCurrentDistance(prev => {
        const newDistance = Math.max(0, prev - 0.05);
        
        // 진행률이 80%에 도달했을 때 문자 발송
        const currentProgress = Math.min(100, Math.max(0, ((initialDistance - newDistance) / initialDistance) * 100));
        
        // 문자 발송 체크 (80% 도달 시)
        trip.notifications.forEach(notification => {
          if (
            notification.status === 'pending' &&
            currentProgress >= 80 &&
            progress < 80
          ) {
            // Trigger notification
            const updatedNotification = { ...notification, status: 'sent' as const, sentAt: new Date() };
            const updatedTrip = {
              ...trip,
              status: 'completed' as const,
              notifications: trip.notifications.map(n => 
                n.id === notification.id ? updatedNotification : n
              ),
            };
            onUpdate(updatedTrip);
            
            // 발송 완료 팝업 표시
            setIsMessageSentDialogOpen(true);
            
            // 2초 후 홈으로 이동
            setTimeout(() => {
              setIsMessageSentDialogOpen(false);
              onNavigate('dashboard');
            }, 2000);
          }
        });
        
        return newDistance;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, trip, progress, initialDistance, onUpdate, onNavigate]);

  const handleManualSend = () => {
    const pendingNotification = trip.notifications.find(n => n.status === 'pending');
    if (pendingNotification) {
      const updatedNotification = { ...pendingNotification, status: 'sent' as const, sentAt: new Date() };
      const updatedTrip = {
        ...trip,
        status: 'completed' as const,
        notifications: trip.notifications.map(n => 
          n.id === pendingNotification.id ? updatedNotification : n
        ),
      };
      onUpdate(updatedTrip);
      
      // 발송 완료 팝업 표시
      setIsMessageSentDialogOpen(true);
      
      // 2초 후 홈으로 이동
      setTimeout(() => {
        setIsMessageSentDialogOpen(false);
        onNavigate('dashboard');
      }, 2000);
    }
  };

  const handleCancelTrip = () => {
    onCancel();
    setIsCancelDialogOpen(false);
    setIsCancelCompleteDialogOpen(true);
  };

  const handleCancelComplete = () => {
    setIsCancelCompleteDialogOpen(false);
    onNavigate('dashboard');
  };

  // 위치 정보 시뮬레이션 - 12km 이내일 때만 실시간 위치 표시
  useEffect(() => {
    if (status === 'active' && isNearDestination) {
      const locations = [
        '강남대로',
        '테헤란로',
        '선릉역',
        '삼성역',
        '상일IC',
        '한남대교',
        '청담사거리',
        '천호이마트',
        '고덕이케아',
      ];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const actions = ['를 지나가고 있습니다', ' 근처입니다', ' 부근입니다'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setCurrentLocation(`${randomLocation}${randomAction}`);
      
      const notification = trip.notifications[0];
      if (notification) {
        setMessagePreview(`${randomLocation}${randomAction}. ${Math.floor(currentTime)}분 후 도착합니다.`);
      }
    } else if (status === 'active') {
      setCurrentLocation('GPS 정상 작동 중');
      setGpsStatus('good');
      setMessagePreview('');
    }
  }, [currentDistance, status, trip.notifications, currentTime, isNearDestination]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Safe Area Top */}
      <div className="h-safe-top bg-[#0f2920]" />
      
      {/* Header */}
      <header className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Pulse rings */}
            <div className={`absolute inset-0 rounded-full ${gpsStatus === 'good' ? 'bg-[#00ff88]' : 'bg-red-500'} opacity-75 animate-ping`} />
            <div className={`absolute inset-0 rounded-full ${gpsStatus === 'good' ? 'bg-[#00ff88]' : 'bg-red-500'} opacity-50 animate-pulse`} />
            {/* Traffic Light Icon */}
            <div className="relative w-10 h-10 bg-[#1a3d32] rounded-full flex items-center justify-center">
              <div className={`w-5 h-5 rounded-full ${gpsStatus === 'good' ? 'bg-[#00ff88]' : 'bg-red-500'}`} />
            </div>
          </div>
          <span className={gpsStatus === 'good' ? 'text-[#00ff88]' : 'text-red-500'}>
            {status === 'connecting' ? '네비게이션 연동 중' : 'GPS 정상 작동 중'}
          </span>
        </div>
      </header>

      {/* Location Info */}
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1a3d32] rounded-2xl flex items-center justify-center">
            <Flag className="w-6 h-6 text-gray-400" />
          </div>
          <span className="text-gray-300">{trip.departure}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00ff88] rounded-2xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#0f2920]" />
          </div>
          <span className="text-white">{trip.destination}</span>
        </div>

        {/* Visual Progress Bar */}
        {status === 'active' && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">운행 진행률</span>
              <span className="text-[#00ff88] font-semibold">{Math.floor(progress)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-3 bg-[#1a3d32] rounded-full overflow-visible">
              {/* Progress Fill */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
              
              {/* Notification Trigger Marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
                style={{ left: `${notificationTriggerProgress}%` }}
              >
                {/* Marker Label - 위로 이동 */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-yellow-400 text-[#0f2920] px-2 py-1 rounded text-xs font-semibold">
                  문자 발송
                </div>
                
                {/* Marker Line */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-yellow-400" />
                
                {/* Marker Icon */}
                <div className="relative w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Bell className="w-3.5 h-3.5 text-[#0f2920]" />
                </div>
              </div>
            </div>

            {/* Location Status */}
            <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-[#1a3d32] rounded-xl">
              {/* Traffic Light Icon */}
              <div className={`w-3 h-3 rounded-full ${gpsStatus === 'good' ? 'bg-[#00ff88]' : 'bg-red-500'} ${gpsStatus === 'good' ? 'animate-pulse' : ''}`} />
              <span className={`text-sm font-medium ${gpsStatus === 'good' ? 'text-[#00ff88]' : 'text-red-500'}`}>
                {isNearDestination ? currentLocation : 'GPS 정상 작동 중'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Current Status */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="text-center">
          <div className="text-[#00ff88] tracking-tight" style={{ fontSize: '120px', lineHeight: 1, fontWeight: 700 }}>
            {Math.floor(currentTime)}분
          </div>
          <div className="text-white mt-4" style={{ fontSize: '40px', fontWeight: 600 }}>
            {currentDistance.toFixed(0)}km
          </div>
          <p className="text-gray-400 mt-6">
            위치 정보와 함께 문자가 자동 발송됩니다.
          </p>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="px-6 pb-6">
        <div className="space-y-3">
          <div className="text-gray-400 text-sm mb-3">예약 내용</div>
          {trip.notifications.map((notification) => (
            <div 
              key={notification.id}
              className="bg-[#1a3d32] rounded-2xl p-4"
            >
              <div className="space-y-3">
                {/* 도착지 & 태그 */}
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#00ff88] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-white">{trip.destination}</span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full shrink-0 ${
                    notification.status === 'sent' ? 'bg-[#00ff88] text-black' :
                    notification.status === 'failed' ? 'bg-[#ff6b6b] text-white' :
                    'bg-[#e6b800] text-black'
                  }`}>
                    {notification.status === 'sent' ? '완료' : 
                     notification.status === 'failed' ? '취소' : 
                     '예약'}
                  </span>
                </div>
                
                {/* 구분선 */}
                <div className="border-t border-gray-700"></div>
                
                {/* 받는사람 & 알림예약 */}
                <div className="flex items-center justify-between text-sm gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#3b82f6] shrink-0" />
                    <span className="text-white">{notification.recipient}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#e6b800] shrink-0" />
                    <span className="text-white">약 {notification.condition.value}분 전</span>
                  </div>
                </div>

                {/* 날짜 */}
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-500">2025.12.25</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-28 space-y-3">
        <Button
          onClick={handleManualSend}
          className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-14 rounded-2xl border-0"
          disabled={trip.notifications.every(n => n.status === 'sent')}
        >
          수동 발송
        </Button>
        <Button
          onClick={() => setIsCancelDialogOpen(true)}
          className="w-full bg-[#3d2626] hover:bg-[#4d3030] text-[#ff6b6b] h-14 rounded-2xl border-0"
        >
          예약 취소
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="active" onNavigate={onNavigate} />

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="bg-[#0f2920] border-2 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-center">예약 취소</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300 text-center">
              예약을 취소하시겠습니까?<br />
              설정된 알림이 모두 삭제됩니다.
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setIsCancelDialogOpen(false)}
              className="flex-1 bg-[#1a3d32] hover:bg-[#234a3d] text-white h-12 rounded-2xl border-0"
            >
              돌아가기
            </Button>
            <Button
              onClick={handleCancelTrip}
              className="flex-1 bg-[#3d2626] hover:bg-[#4d3030] text-[#ff6b6b] h-12 rounded-2xl border-0"
            >
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Complete Dialog */}
      <Dialog open={isCancelCompleteDialogOpen} onOpenChange={setIsCancelCompleteDialogOpen}>
        <DialogContent className="bg-[#0f2920] border-2 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-center">취소 완료</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300 text-center">
              예약이 취소되었습니다.
            </p>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleCancelComplete}
              className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-12 rounded-2xl border-0"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Sent Dialog */}
      <Dialog open={isMessageSentDialogOpen} onOpenChange={setIsMessageSentDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-[#00ff88]/20 to-[#00dd77]/10 border-2 border-[#00ff88] text-white">
          <DialogHeader className="sr-only">
            <DialogTitle>문자 발송 완료</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#00ff88] opacity-30 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-[#00ff88] rounded-full flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-[#0f2920]" />
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl text-[#00ff88] mb-3">문자 발송 완료</h2>
            
            {/* Message */}
            <p className="text-white text-center mb-2">
              문자가 성공적으로 발송되었습니다
            </p>
            <p className="text-gray-400 text-sm text-center">
              서비스가 완료되었습니다
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}