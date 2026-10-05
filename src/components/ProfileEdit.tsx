import { showAlert } from '../utils/globalAlert';
import { useState } from 'react';
import { ChevronLeft, User, Phone, Save, Car } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import type { Screen, UserProfile } from '../App';

interface ProfileEditProps {
  onNavigate: (screen: Screen) => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export function ProfileEdit({ onNavigate, userProfile, onUpdateProfile }: ProfileEditProps) {
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [car1, setCar1] = useState(userProfile.car_number_1 || '');
  const [car2, setCar2] = useState(userProfile.car_number_2 || '');
  const [car3, setCar3] = useState(userProfile.car_number_3 || '');
  const [useCar, setUseCar] = useState(userProfile.use_car_number || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update Supabase
      const { directSupabaseFetch } = await import('../lib/supabaseUtils');
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        await directSupabaseFetch(`profiles?id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            full_name: name,
            car_number_1: car1,
            car_number_2: car2,
            car_number_3: car3,
            use_car_number: useCar
          })
        });
      }

      // 2. Update Local State
      onUpdateProfile({ 
        ...userProfile, 
        name, 
        phone,
        car_number_1: car1,
        car_number_2: car2,
        car_number_3: car3,
        use_car_number: useCar
      });

      setIsSaving(false);
      onNavigate('mypage');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('저장에 실패했습니다.');
      setIsSaving(false);
    }
  };

  const handleProfileImageClick = () => {
    // For now, show an alert. Full file upload requires Supabase Storage configuration.
    showAlert('프로필 사진 변경 기능은 준비 중입니다.');
  };

  return (
    <div className="flex flex-col w-full h-full bg-app-primary text-text-primary overflow-hidden">
      {/* Header */}
      <header className="pt-safe px-4 h-16 flex items-center gap-4 border-b border-border bg-app-primary sticky top-0 z-10">
        <button
          onClick={() => onNavigate('mypage')} // Go back to MyPage
          className="p-2 -ml-2 text-text-muted hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">회원정보 수정</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-10">
          <button 
            onClick={handleProfileImageClick}
            className="w-24 h-24 rounded-full bg-app-secondary border-2 border-app-accent flex items-center justify-center mb-4 relative hover:opacity-80 transition-opacity focus:outline-none"
          >
            <User className="w-10 h-10 text-text-muted" />
            <div className="absolute bottom-0 right-0 p-2 bg-app-accent rounded-full text-app-primary shadow-lg hover:bg-app-accent-hover transition-colors">
              <User className="w-4 h-4" />
            </div>
          </button>
          <p className="text-sm text-text-muted">프로필 사진 변경</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">이름</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 입력"
                className="w-full bg-app-secondary border border-border rounded-xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">전화번호</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="번호 입력 (010-0000-0000)"
                className="w-full bg-app-secondary border border-border rounded-xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all"
              />
            </div>
          </div>
          {/* Email (Read Only) */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">이메일</label>
            <div className="relative opacity-60">
              <input
                type="email"
                value={userProfile.email}
                readOnly
                className="w-full bg-app-secondary border border-border rounded-xl py-3.5 px-4 text-text-disabled focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* [Fix] Hide Vehicle Management Section per user request */}
        <div className="hidden mt-10 pt-10 border-t border-border space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-app-accent" />
              <h2 className="text-lg font-bold">차량 관리</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="use-car" className="text-sm text-text-secondary cursor-pointer">문자 알림 포함</Label>
              <Switch 
                id="use-car" 
                checked={useCar} 
                onCheckedChange={setUseCar}
              />
            </div>
          </div>
          
          <p className="text-xs text-text-disabled">
            * 등록된 차량 번호가 문자 발송 시 자동으로 포함됩니다.<br/>
            (현재 일반 문자에만 적용됩니다.)
          </p>

          <div className="space-y-4">
            {[
              { val: car1, set: setCar1, label: '차량 1' },
              { val: car2, set: setCar2, label: '차량 2' },
              { val: car3, set: setCar3, label: '차량 3' }
            ].map((item, idx) => (
              <div key={idx}>
                <label className="block text-xs font-medium text-text-disabled mb-1.5 ml-1">{item.label}</label>
                <input
                  type="text"
                  value={item.val}
                  onChange={(e) => item.set(e.target.value)}
                  placeholder="예) 서울 가 1234"
                  className="w-full bg-app-secondary border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-app-accent transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-12">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 bg-app-accent hover:bg-app-accent-hover text-app-primary font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              '저장 중...'
            ) : (
              <>
                <Save className="w-5 h-5" />
                저장하기
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
