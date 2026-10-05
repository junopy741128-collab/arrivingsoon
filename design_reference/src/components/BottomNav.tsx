import { Home, Plus, History, User } from 'lucide-react';
import type { Screen } from '../App';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard' as Screen, icon: Home, label: '홈' },
    { id: 'setup' as Screen, icon: Plus, label: '예약하기' },
    { id: 'list' as Screen, icon: History, label: '내역' },
    { id: 'mypage' as Screen, icon: User, label: '마이페이지' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0f2920] border-t border-gray-800 pb-safe">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || 
            (item.id === 'dashboard' && currentScreen === 'home');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center flex-1 space-y-1 active:scale-95 active:opacity-70 transition-all"
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-[#00ff88]' : 'text-gray-500'}`} />
              <span className={`text-xs ${isActive ? 'text-[#00ff88]' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
