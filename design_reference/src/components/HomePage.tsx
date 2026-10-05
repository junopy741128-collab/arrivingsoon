import { Home, Plus, History, User, Car, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import type { Screen } from '../App';
import logoImage from 'figma:asset/a6ded2d6ea9d85ee6ee0dcfb9e3e5eda489e102e.png';

interface HomePageProps {
  onNavigate: (screen: Screen) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        <div className="text-center space-y-6 max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoImage} alt="곧 도착해요 로고" className="w-20 h-20" />
          </div>
          <h1 className="text-5xl tracking-tight">곧 도착해요</h1>
          <p className="text-gray-300 leading-relaxed">
            운전 중 안전하게, '곧 도착해요'가 대신
            <br />
            알려드려요.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-32 space-y-3">
        <Button
          onClick={() => onNavigate('login')}
          className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-14 rounded-2xl border-0"
        >
          <span className="mr-2">💬</span>
          SNS 계정으로 계속하기
        </Button>
        <Button
          onClick={() => onNavigate('emailLogin')}
          variant="outline"
          className="w-full bg-transparent border-2 border-gray-700 hover:bg-gray-800 text-white h-14 rounded-2xl"
        >
          이메일로 시작하기
        </Button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f2920] border-t border-gray-800">
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto">
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center justify-center flex-1 space-y-1 active:scale-95 active:opacity-70 transition-all"
          >
            <Home className="w-6 h-6 text-[#00ff88]" />
            <span className="text-xs text-[#00ff88]">홈</span>
          </button>
          <button
            onClick={() => onNavigate('setup')}
            className="flex flex-col items-center justify-center flex-1 space-y-1 active:scale-95 active:opacity-70 transition-all"
          >
            <Plus className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">예약하기</span>
          </button>
          <button
            onClick={() => onNavigate('list')}
            className="flex flex-col items-center justify-center flex-1 space-y-1 active:scale-95 active:opacity-70 transition-all"
          >
            <History className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">내역보기</span>
          </button>
          <button
            onClick={() => onNavigate('mypage')}
            className="flex flex-col items-center justify-center flex-1 space-y-1 active:scale-95 active:opacity-70 transition-all"
          >
            <User className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">마이페이지</span>
          </button>
        </div>
      </nav>
    </div>
  );
}