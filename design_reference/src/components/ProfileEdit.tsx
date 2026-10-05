import { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Screen } from '../App';

interface ProfileEditProps {
  onNavigate: (screen: Screen) => void;
}

export function ProfileEdit({ onNavigate }: ProfileEditProps) {
  const [name, setName] = useState('홍길동');
  const [phone, setPhone] = useState('010-1234-5678');
  const [email, setEmail] = useState('hong@example.com');
  const [company, setCompany] = useState('운송회사');

  const handleSave = () => {
    // 저장 로직 (실제로는 백엔드 API 호출)
    alert('프로필이 저장되었습니다.');
    onNavigate('settings');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-gray-800">
        <button onClick={() => onNavigate('settings')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center">프로필 정보 수정</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-[#1a4d3d] rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-[#00ff88]" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#00ff88] rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-[#0f2920]" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-3">프로필 사진 변경</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-400">이름</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#1a3d32] border-2 border-gray-700 text-white h-14 rounded-2xl pl-12 focus:border-[#00ff88] focus:ring-0"
                placeholder="이름을 입력하세요"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-400">전화번호</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#1a3d32] border-2 border-gray-700 text-white h-14 rounded-2xl pl-12 focus:border-[#00ff88] focus:ring-0"
                placeholder="전화번호를 입력하세요"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-400">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1a3d32] border-2 border-gray-700 text-white h-14 rounded-2xl pl-12 focus:border-[#00ff88] focus:ring-0"
                placeholder="이메일을 입력하세요"
              />
            </div>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-gray-400">소속 (선택)</Label>
            <div className="relative">
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-[#1a3d32] border-2 border-gray-700 text-white h-14 rounded-2xl px-4 focus:border-[#00ff88] focus:ring-0"
                placeholder="회사명 또는 소속을 입력하세요"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f2920] border-t border-gray-800 px-6 py-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button
            onClick={() => onNavigate('settings')}
            variant="outline"
            className="flex-1 bg-transparent border-2 border-gray-700 hover:bg-gray-800 text-white h-14 rounded-2xl"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-14 rounded-2xl border-0"
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
