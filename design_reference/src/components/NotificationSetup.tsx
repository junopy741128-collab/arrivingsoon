import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, User, Minus, Edit2, Trash2, X, Navigation, Clock, Route, AlertCircle, Plus, Search, ChevronRight, Users, MessageSquare, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { BottomNav } from './BottomNav';
import { DestinationSearch } from './DestinationSearch';
import type { Trip, Screen, Contact, SetupFormData, NavigationInfo } from '../App';

interface NotificationSetupProps {
  onBack: () => void;
  onComplete: (trip: Trip) => void;
  onNavigate: (screen: Screen) => void;
  selectedContacts: Contact[];
  setupFormData: SetupFormData;
  setSetupFormData: (data: SetupFormData) => void;
  onRemoveContact?: (contactId: string) => void;
}

interface SavedMessage {
  id: string;
  text: string;
}

export function NotificationSetup({ onBack, onComplete, onNavigate, selectedContacts, setupFormData, setSetupFormData, onRemoveContact }: NotificationSetupProps) {
  const [departure, setDeparture] = useState(setupFormData.departure || '현재 위치');
  const [destination, setDestination] = useState(setupFormData.destination);
  const [notificationType, setNotificationType] = useState<'departure' | 'arrival'>('arrival'); // 항상 도착 알림으로 고정
  const [recipient, setRecipient] = useState(setupFormData.recipient);
  const [message, setMessage] = useState(setupFormData.message);
  const [navigationInfo, setNavigationInfo] = useState<NavigationInfo | null>(setupFormData.navigationInfo);
  const [isDestinationSearchOpen, setIsDestinationSearchOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'failed'>('idle');
  const [timingOption, setTimingOption] = useState<'10min' | '20min' | '5km'>('10min');

  // 상태 변경 시 상위 컴포넌트에 저장
  useEffect(() => {
    setSetupFormData({
      departure,
      destination,
      notificationType,
      recipient,
      conditionValue: 10, // 기본값 유지 (사용하지 않음)
      message,
      navigationInfo,
    });
  }, [departure, destination, notificationType, recipient, message, navigationInfo, setSetupFormData]);

  // 선택된 연락처를 받는 사람 필드에 표시
  useEffect(() => {
    if (selectedContacts.length > 0) {
      const contactNames = selectedContacts.map(c => c.name).join(', ');
      setRecipient(contactNames);
    }
  }, [selectedContacts]);

  // 선택된 연락처 제거 함수
  const handleRemoveContact = (contactId: string) => {
    if (onRemoveContact) {
      onRemoveContact(contactId);
    }
    // UI에서는 제거 표시
  };

  // 자주 쓰는 메시지 관리
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([
    { id: '1', text: '거의 다 왔어요!' },
    { id: '2', text: '지금 출발했습니다.' },
    { id: '3', text: '5분 후 도착 예정입니다.' },
  ]);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isAddMessageDialogOpen, setIsAddMessageDialogOpen] = useState(false);
  const [isEditMessageDialogOpen, setIsEditMessageDialogOpen] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [editingMessage, setEditingMessage] = useState<SavedMessage | null>(null);

  const handleAddMessage = () => {
    if (!newMessageText.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }
    
    const newMessage: SavedMessage = {
      id: Date.now().toString(),
      text: newMessageText,
    };
    
    setSavedMessages([...savedMessages, newMessage]);
    setNewMessageText('');
    setIsAddMessageDialogOpen(false);
  };

  const handleEditMessage = () => {
    if (!editingMessage || !editingMessage.text.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }
    
    setSavedMessages(savedMessages.map(m => 
      m.id === editingMessage.id ? editingMessage : m
    ));
    setEditingMessage(null);
    setIsEditMessageDialogOpen(false);
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm('이 메시지를 삭제하시겠습니까?')) {
      setSavedMessages(savedMessages.filter(m => m.id !== id));
    }
  };

  const handleSelectMessage = (text: string) => {
    setMessage(text);
    setIsMessageDialogOpen(false);
  };

  const openEditMessageDialog = (msg: SavedMessage) => {
    setEditingMessage({ ...msg });
    setIsEditMessageDialogOpen(true);
  };

  // 네비게이션 연동 함수
  const handleConnectNavigation = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    // 실제 환경에서는 네비게이션 앱의 API를 호출
    // 여기서는 시뮬레이션으로 구현 (50% 확률로 실패)
    setTimeout(() => {
      const randomSuccess = Math.random() > 0.3; // 70% 성공률
      
      if (randomSuccess) {
        const navApps = ['Tmap', '카카오맵', '네이버 지도'];
        const randomApp = navApps[Math.floor(Math.random() * navApps.length)];
        
        const mockNavInfo: NavigationInfo = {
          app: randomApp,
          departure: '서울특별시 강남구 테헤란로 123',
          destination: '서울특별시 송파구 올림픽로 240',
          distance: 8.5,
          estimatedTime: 15,
        };
        
        setNavigationInfo(mockNavInfo);
        setDeparture(mockNavInfo.departure);
        setDestination(mockNavInfo.destination);
        setConnectionStatus('success');
      } else {
        // 연동 실패
        setConnectionStatus('failed');
      }
      setIsConnecting(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!destination || !recipient) {
      alert('도착지와 받는 사람을 입력해주세요.');
      return;
    }

    // 선택된 타이밍에 따라 자동 메시지 생성
    const autoMessage = `{위치}를 지나고 있습니다. ${
      timingOption === '10min' ? '10분' : timingOption === '20min' ? '20분' : '5km 앞'
    } 후 도착합니다`;

    const trip: Trip = {
      id: Date.now().toString(),
      departure,
      destination,
      notifications: [
        {
          id: `${Date.now()}-0`,
          type: notificationType,
          condition: {
            type: timingOption === '5km' ? 'distance' : 'time',
            value: timingOption === '10min' ? 10 : timingOption === '20min' ? 20 : 5,
            unit: timingOption === '5km' ? 'km' : '분',
          },
          message: autoMessage,
          recipient,
          status: 'pending' as const,
        },
      ],
      status: 'planning',
      estimatedTime: 15,
      estimatedDistance: 8,
    };

    onComplete(trip);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Safe Area Top */}
      <div className="h-safe-top bg-[#0f2920]" />
      
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-gray-800">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center">알림 예약</h1>
        <div className="w-10" />
      </header>

      {/* Step Indicator */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between max-w-md mx-auto gap-2">
          {/* Step 1 */}
          <div className="flex-1">
            <div className="relative bg-[#1a3d32] rounded-xl p-3 border-2 border-[#00ff88]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#0f2920]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#00ff88] font-medium">STEP 1</span>
                  <span className="text-xs text-white truncate">도착지</span>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <svg className="w-4 h-4 text-[#00ff88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Step 2 */}
          <div className="flex-1">
            <div className="relative bg-[#1a3d32] rounded-xl p-3 border-2 border-[#00ff88]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#0f2920]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#00ff88] font-medium">STEP 2</span>
                  <span className="text-xs text-white truncate">연락처</span>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <svg className="w-4 h-4 text-[#00ff88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Step 3 */}
          <div className="flex-1">
            <div className="relative bg-[#00ff88]/10 rounded-xl p-3 border-2 border-[#00ff88]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0f2920] text-sm font-bold">3</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#00ff88] font-medium">STEP 3</span>
                  <span className="text-xs text-white truncate">알림설정</span>
                </div>
              </div>
              {/* Active indicator pulse */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff88] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-40 space-y-6">
        {/* STEP 1: 위치 정보 */}
        <div className="bg-[#1a3d32]/30 border-2 border-gray-700 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#00ff88] flex items-center justify-center text-[#0f2920] font-bold">
              1
            </div>
            <h2 className="text-xl text-white">위치 정보</h2>
          </div>

          {/* 출발지 */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">출발지</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <div className="w-full bg-[#0f2920] border-2 border-gray-700 rounded-2xl h-14 pl-12 pr-4 flex items-center text-gray-400">
                현재위치
              </div>
            </div>
          </div>

          {/* 도착지 */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">도착지</Label>
            <button
              onClick={() => setIsDestinationSearchOpen(true)}
              className="w-full relative"
            >
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00ff88]" />
              <div className={`w-full bg-[#0f2920] border-2 rounded-2xl h-14 pl-12 pr-12 flex items-center text-left ${
                destination ? 'text-white border-[#00ff88]' : 'text-gray-500 border-gray-700'
              }`}>
                {destination || '도착지를 검색하세요'}
              </div>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00ff88]" />
            </button>
          </div>
        </div>

        {/* STEP 2: 연락처 */}
        <div className="bg-[#1a3d32]/30 border-2 border-gray-700 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#00ff88] flex items-center justify-center text-[#0f2920] font-bold">
              2
            </div>
            <h2 className="text-xl text-white">받는 사람</h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-400">연락처</Label>
              <button
                onClick={() => onNavigate('contacts')}
                className="text-[#00ff88] text-sm font-medium"
              >
                연락처 선택
              </button>
            </div>

            {/* 선택된 연락처 목록 */}
            {selectedContacts.length > 0 && (
              <div className="space-y-2 mb-3">
                {selectedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between bg-[#0f2920] border border-[#00ff88]/30 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[#00ff88]" />
                      <div>
                        <div className="text-white">{contact.name}</div>
                        <div className="text-sm text-gray-400">{contact.phone}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveContact(contact.id)}
                      className="p-1 hover:bg-[#ff6b6b]/20 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400 hover:text-[#ff6b6b]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="전화번호 또는 이름"
              className="w-full bg-[#0f2920] border-2 border-gray-700 rounded-2xl h-14 px-4 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* STEP 3: 알림 조건 & 메시지 */}
        <div className="bg-gradient-to-br from-[#00ff88]/10 to-[#00dd77]/5 border-2 border-[#00ff88]/50 rounded-3xl p-6 space-y-4 shadow-lg shadow-[#00ff88]/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#00ff88] flex items-center justify-center text-[#0f2920] font-bold shadow-lg shadow-[#00ff88]/30">
              3
            </div>
            <h2 className="text-xl text-white">언제 보낼까요?</h2>
            <div className="ml-auto">
              <span className="text-xs px-3 py-1 rounded-full bg-[#00ff88] text-[#0f2920] font-semibold">
                현재 단계
              </span>
            </div>
          </div>

          {/* 알림 타이밍 옵션 */}
          <div className="space-y-3">
            {/* 도착 10분 전 (추천) */}
            <button
              onClick={() => setTimingOption('10min')}
              className={`w-full rounded-2xl p-4 transition-all text-left ${
                timingOption === '10min'
                  ? 'bg-[#00ff88]/20 border-2 border-[#00ff88] shadow-md shadow-[#00ff88]/20'
                  : 'bg-[#0f2920] border-2 border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  timingOption === '10min'
                    ? 'bg-[#00ff88] border-[#00ff88]'
                    : 'border-gray-500'
                }`}>
                  {timingOption === '10min' && (
                    <svg className="w-4 h-4 text-[#0f2920]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`flex items-center gap-2 mb-1 ${
                    timingOption === '10min' ? 'text-white' : 'text-gray-300'
                  }`}>
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">도착 10분 전</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#00ff88] text-[#0f2920] font-medium">
                      추천
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* 도착 20분 전 */}
            <button
              onClick={() => setTimingOption('20min')}
              className={`w-full rounded-2xl p-4 transition-all text-left ${
                timingOption === '20min'
                  ? 'bg-[#00ff88]/20 border-2 border-[#00ff88] shadow-md shadow-[#00ff88]/20'
                  : 'bg-[#0f2920] border-2 border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  timingOption === '20min'
                    ? 'bg-[#00ff88] border-[#00ff88]'
                    : 'border-gray-500'
                }`}>
                  {timingOption === '20min' && (
                    <svg className="w-4 h-4 text-[#0f2920]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`flex items-center gap-2 ${
                    timingOption === '20min' ? 'text-white' : 'text-gray-300'
                  }`}>
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">도착 20분 전</span>
                  </div>
                </div>
              </div>
            </button>

            {/* 도착 5km 전 */}
            <button
              onClick={() => setTimingOption('5km')}
              className={`w-full rounded-2xl p-4 transition-all text-left ${
                timingOption === '5km'
                  ? 'bg-[#00ff88]/20 border-2 border-[#00ff88] shadow-md shadow-[#00ff88]/20'
                  : 'bg-[#0f2920] border-2 border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  timingOption === '5km'
                    ? 'bg-[#00ff88] border-[#00ff88]'
                    : 'border-gray-500'
                }`}>
                  {timingOption === '5km' && (
                    <svg className="w-4 h-4 text-[#0f2920]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`flex items-center gap-2 ${
                    timingOption === '5km' ? 'text-white' : 'text-gray-300'
                  }`}>
                    <Route className="w-5 h-5" />
                    <span className="font-medium">도착 5km 전</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* 메시지 미리보기 */}
          <div className="mt-6 p-4 bg-[#0f2920]/70 border border-[#00ff88]/30 rounded-2xl">
            <div className="text-xs text-gray-400 mb-2">발송될 메시지 예시</div>
            <div className="text-sm text-gray-300 italic">
              "한남대교를 지나고 있습니다. {timingOption === '10min' ? '10' : timingOption === '20min' ? '20' : '5km 앞,'}분 후 도착합니다"
            </div>
            <div className="text-xs text-gray-500 mt-2">
              * 실제 위치와 시간은 자동으로 업데이트됩니다
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-[#0f2920] via-[#0f2920] to-transparent pt-6">
        <Button
          onClick={handleSubmit}
          className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-14 rounded-2xl border-0"
        >
          다음
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="setup" onNavigate={onNavigate} />

      {/* 메시지 선택 다이얼로그 */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="bg-[#0f2920] text-white">
          <DialogHeader>
            <DialogTitle>자주 사용하는 메시지 선택</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {savedMessages.map(msg => (
              <div key={msg.id} className="flex items-center justify-between">
                <button className="hover:text-[#00ff88]" onClick={() => handleSelectMessage(msg.text)}>
                  {msg.text}
                </button>
                <div className="flex gap-2">
                  <button className="hover:text-[#00ff88]" onClick={() => openEditMessageDialog(msg)}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="hover:text-[#00ff88]" onClick={() => handleDeleteMessage(msg.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-10 rounded-2xl border-0" onClick={() => setIsAddMessageDialogOpen(true)}>
              새로운 메시지 추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 새로운 메시지 추가 다이얼로그 */}
      <Dialog open={isAddMessageDialogOpen} onOpenChange={setIsAddMessageDialogOpen}>
        <DialogContent className="bg-[#0f2920] text-white">
          <DialogHeader>
            <DialogTitle>새로운 메시지 추가</DialogTitle>
          </DialogHeader>
          <Input
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="w-full bg-transparent border-2 border-gray-700 rounded-2xl h-14 px-4 text-white placeholder:text-gray-500"
          />
          <div className="mt-4">
            <Button className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-10 rounded-2xl border-0" onClick={handleAddMessage}>
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 메시지 수정 다이얼로그 */}
      <Dialog open={isEditMessageDialogOpen} onOpenChange={setIsEditMessageDialogOpen}>
        <DialogContent className="bg-[#0f2920] text-white">
          <DialogHeader>
            <DialogTitle>메시지 수정</DialogTitle>
          </DialogHeader>
          <Input
            value={editingMessage?.text || ''}
            onChange={(e) => setEditingMessage({ ...editingMessage!, text: e.target.value })}
            placeholder="메시지를 입력하세요"
            className="w-full bg-transparent border-2 border-gray-700 rounded-2xl h-14 px-4 text-white placeholder:text-gray-500"
          />
          <div className="mt-4">
            <Button className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-10 rounded-2xl border-0" onClick={handleEditMessage}>
              수정
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 도착지 검색 */}
      <DestinationSearch
        isOpen={isDestinationSearchOpen}
        onClose={() => setIsDestinationSearchOpen(false)}
        onSelect={(location) => {
          setDestination(location.name || location.address);
        }}
      />
    </div>
  );
}