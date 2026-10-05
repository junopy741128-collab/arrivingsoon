import { ChevronLeft, Trash2, MapPin, Users, Clock, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { BottomNav } from './BottomNav';
import type { Screen } from '../App';
import { useState } from 'react';

interface NotificationListProps {
  onNavigate: (screen: Screen) => void;
  onSelectTrip?: (trip: any) => void;
  onDeleteNotification?: (id: string) => void;
}

// Mock data for demonstration
const mockNotifications = [
  {
    id: '1',
    destination: '서울시 강남구 테헤란로 123',
    recipients: '김민준 외 2인',
    scheduledTime: '약 10분 전',
    date: '2025.12.25',
    status: 'active' as const,
  },
  {
    id: '2',
    destination: '부산시 해운대구 마린시티로 456',
    recipients: '이수진',
    scheduledTime: '약 12분 전',
    date: '2025.12.24',
    status: 'active' as const,
  },
  {
    id: '3',
    destination: '경기도 성남시 분당구 판교역로 789',
    recipients: '박서연 외 1인',
    scheduledTime: '약 15분 전',
    date: '2025.12.23',
    status: 'completed' as const,
  },
  {
    id: '4',
    destination: '인천광역시 연수구 송도국제대로 123',
    recipients: '최정훈 외 3인',
    scheduledTime: '약 20분 전',
    date: '2025.12.22',
    status: 'failed' as const,
  },
];

export function NotificationList({ onNavigate, onSelectTrip, onDeleteNotification }: NotificationListProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const getStatusBadge = (status: 'active' | 'completed' | 'failed') => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-[#e6b800] text-black rounded-full text-xs tracking-wide">예약</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-xs">완료</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-[#ff6b6b] text-white rounded-full text-xs">취소</span>;
    }
  };

  const filteredNotifications = mockNotifications.filter(n => 
    activeTab === 'active' ? n.status === 'active' : n.status !== 'active'
  );

  const handleNotificationClick = (notification: any) => {
    if (isEditMode) {
      toggleSelection(notification.id);
    } else if (notification.status === 'active') {
      // 예약 대기 화면으로 이동
      if (onSelectTrip) {
        onSelectTrip(notification);
      }
      onNavigate('active');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedIds(new Set());
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`선택한 ${selectedIds.size}개의 알림을 삭제하시겠습니까?`)) {
      selectedIds.forEach(id => {
        if (onDeleteNotification) {
          onDeleteNotification(id);
        }
      });
      setSelectedIds(new Set());
      setIsEditMode(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Safe Area Top */}
      <div className="h-safe-top bg-[#0f2920]" />
      
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-gray-800">
        <Button onClick={() => onNavigate('dashboard')} className="p-2">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="flex-1 text-center">알림 내역</h1>
        <Button 
          onClick={handleEditMode}
          className={`px-4 py-2 rounded-lg ${
            isEditMode 
              ? 'bg-[#3b82f6] text-white' 
              : 'bg-transparent text-gray-400'
          }`}
        >
          {isEditMode ? '취소' : '편집'}
        </Button>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 px-6 pt-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 rounded-full text-center transition-all ${
            activeTab === 'active'
              ? 'bg-[#00ff88] text-[#0f2920] font-medium'
              : 'bg-transparent text-gray-400'
          }`}
        >
          예약 대기
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-3 rounded-full text-center transition-all ${
            activeTab === 'completed'
              ? 'bg-gray-600 text-white font-medium'
              : 'bg-transparent text-gray-400'
          }`}
        >
          완료 내역
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl p-4 cursor-pointer transition-colors relative ${
                notification.status === 'completed' || notification.status === 'failed'
                  ? 'bg-[#1a1a1a] hover:bg-[#222222] opacity-75'
                  : 'bg-[#2a2a2a] hover:bg-[#333333]'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="space-y-3">
                {/* 도착지 & 태그 */}
                <div className="flex items-center gap-3">
                  {/* 체크박스 (편집 모드일 때만 표시) */}
                  {isEditMode && (
                    <div 
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selectedIds.has(notification.id)
                          ? 'bg-[#3b82f6] border-[#3b82f6]'
                          : 'border-gray-500'
                      }`}
                    >
                      {selectedIds.has(notification.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}
                  
                  <MapPin className={`w-4 h-4 shrink-0 ${
                    notification.status === 'completed' || notification.status === 'failed'
                      ? 'text-gray-500'
                      : 'text-[#00ff88]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <span className={notification.status === 'completed' || notification.status === 'failed' ? 'text-gray-400' : 'text-white'}>
                      {notification.destination}
                    </span>
                  </div>
                  
                  {getStatusBadge(notification.status)}
                </div>
                
                {/* 구분선 */}
                <div className="border-t border-gray-700"></div>
                
                {/* 받는사람 & 알림예약 */}
                <div className="flex items-center justify-between text-sm gap-4">
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 shrink-0 ${
                      notification.status === 'completed' || notification.status === 'failed'
                        ? 'text-gray-600'
                        : 'text-[#3b82f6]'
                    }`} />
                    <span className={notification.status === 'completed' || notification.status === 'failed' ? 'text-gray-400' : 'text-white'}>
                      {notification.recipients}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 shrink-0 ${
                      notification.status === 'completed' || notification.status === 'failed'
                        ? 'text-gray-600'
                        : 'text-[#e6b800]'
                    }`} />
                    <span className={notification.status === 'completed' || notification.status === 'failed' ? 'text-gray-400' : 'text-white'}>
                      {notification.scheduledTime}
                    </span>
                  </div>
                </div>

                {/* 날짜 */}
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-500">{notification.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 삭제 버튼 (편집 모드일 때만 표시) */}
      {isEditMode && selectedIds.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-[#0f2920] via-[#0f2920] to-transparent pt-6">
          <Button
            onClick={handleDelete}
            className="w-full bg-[#ff6b6b] hover:bg-[#ff5555] text-white h-14 rounded-2xl border-0 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            선택 항목 삭제 ({selectedIds.size})
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav currentScreen="list" onNavigate={onNavigate} />
    </div>
  );
}