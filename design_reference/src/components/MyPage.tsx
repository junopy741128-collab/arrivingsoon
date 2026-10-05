import { useState } from 'react';
import {
  User,
  Coins,
  ChevronRight,
  Settings as SettingsIcon,
  LogOut,
  Shield,
  Bell,
  Palette,
  HelpCircle,
  FileText,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BottomNav } from './BottomNav';
import type { Screen } from '../App';
import type { Theme } from '../utils/theme';

interface MyPageProps {
  onNavigate: (screen: Screen) => void;
  currentTheme: Theme;
  userName?: string;
  userEmail?: string;
  userPoints?: number;
}

export function MyPage({
  onNavigate,
  currentTheme,
  userName = "김운전",
  userEmail = "driver@example.com",
  userPoints = 5000,
}: MyPageProps) {
  const [pointHistory] = useState([
    { id: '1', type: 'earn', amount: 1000, reason: '알림 발송 완료', date: '2024-12-24 14:30' },
    { id: '2', type: 'use', amount: -500, reason: '메시지 발송', date: '2024-12-24 10:15' },
    { id: '3', type: 'earn', amount: 2000, reason: '회원가입 보너스', date: '2024-12-23 18:00' },
    { id: '4', type: 'use', amount: -300, reason: '메시지 발송', date: '2024-12-23 15:45' },
  ]);

  return (
    <div className="min-h-screen bg-[#0f2920] text-white pb-24">
      {/* Safe Area Top */}
      <div className="h-safe-top bg-[#0f2920]" />

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-800">
        <h1 className="text-2xl">마이페이지</h1>
      </div>

      <div className="px-6 pt-6">
        {/* User Profile Card */}
        <Card className="bg-gradient-to-br from-[#00ff88]/20 to-[#00dd77]/10 border-[#00ff88]/30 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#00ff88] flex items-center justify-center">
              <User className="w-8 h-8 text-[#0f2920]" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl mb-1 text-white font-medium">{userName}</h2>
              <p className="text-sm text-gray-300">{userEmail}</p>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-[#00ff88] hover:text-[#00dd77]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Points Display */}
          <div className="pt-4 border-t border-[#00ff88]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#00ff88]" />
                <span className="text-white">보유 포인트</span>
              </div>
              <span className="text-2xl text-[#00ff88] font-medium">{userPoints.toLocaleString()}P</span>
            </div>
          </div>
        </Card>

        {/* Point History Tabs */}
        <Card className="bg-[#1a3d32] border-gray-700 mb-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full bg-[#0f2920] border-b border-gray-700 rounded-none">
              <TabsTrigger value="all" className="flex-1 text-gray-300 data-[state=active]:bg-transparent data-[state=active]:text-[#00ff88] data-[state=active]:border-b-2 data-[state=active]:border-[#00ff88]">
                전체 내역
              </TabsTrigger>
              <TabsTrigger value="earn" className="flex-1 text-gray-300 data-[state=active]:bg-transparent data-[state=active]:text-[#00ff88] data-[state=active]:border-b-2 data-[state=active]:border-[#00ff88]">
                적립
              </TabsTrigger>
              <TabsTrigger value="use" className="flex-1 text-gray-300 data-[state=active]:bg-transparent data-[state=active]:text-[#00ff88] data-[state=active]:border-b-2 data-[state=active]:border-[#00ff88]">
                사용
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="p-4 mt-0">
              <div className="space-y-3">
                {pointHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      {item.type === 'earn' ? (
                        <PlusCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <MinusCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <p className="text-white mb-1">{item.reason}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                    <span
                      className={`${
                        item.type === 'earn' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="earn" className="p-4 mt-0">
              <div className="space-y-3">
                {pointHistory.filter(item => item.type === 'earn').map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <PlusCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-white mb-1">{item.reason}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                    <span className="text-green-500">
                      +{item.amount.toLocaleString()}P
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="use" className="p-4 mt-0">
              <div className="space-y-3">
                {pointHistory.filter(item => item.type === 'use').map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <MinusCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-white mb-1">{item.reason}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                    <span className="text-red-500">
                      {item.amount.toLocaleString()}P
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Settings Menu */}
        <div className="space-y-2 mb-6">
          <h3 className="text-lg px-2 mb-3 text-white">설정</h3>
          
          <button
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center justify-between p-4 bg-[#1a3d32] border border-gray-700 rounded-xl hover:bg-[#1a3d32]/80 hover:border-[#00ff88]/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#00ff88]" />
              <span className="text-white">개인정보 수정</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <button
            onClick={() => onNavigate('theme')}
            className="w-full flex items-center justify-between p-4 bg-[#1a3d32] border border-gray-700 rounded-xl hover:bg-[#1a3d32]/80 hover:border-[#00ff88]/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-[#00ff88]" />
              <span className="text-white">테마 설정</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center justify-between p-4 bg-[#1a3d32] border border-gray-700 rounded-xl hover:bg-[#1a3d32]/80 hover:border-[#00ff88]/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#00ff88]" />
              <span className="text-white">알림 설정</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <button
            className="w-full flex items-center justify-between p-4 bg-[#1a3d32] border border-gray-700 rounded-xl hover:bg-[#1a3d32]/80 hover:border-[#00ff88]/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#00ff88]" />
              <span className="text-white">도움말</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <button
            className="w-full flex items-center justify-between p-4 bg-[#1a3d32] border border-gray-700 rounded-xl hover:bg-[#1a3d32]/80 hover:border-[#00ff88]/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#00ff88]" />
              <span className="text-white">이용약관</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className="w-full flex items-center justify-between p-4 bg-red-950/30 border border-red-500/30 rounded-xl hover:bg-red-950/50 hover:border-red-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-red-400">관리자 페이지</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400/60" />
          </button>
        </div>

        {/* Logout Button */}
        <Button
          onClick={() => onNavigate('home')}
          variant="outline"
          className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 mb-6"
        >
          <LogOut className="w-5 h-5 mr-2" />
          로그아웃
        </Button>

        {/* Business Information */}
        <div className="border-t border-gray-800 pt-6 pb-8 text-center space-y-2">
          <p className="text-xs text-gray-500">상호명: 올타 | 대표자: 정종환</p>
          <p className="text-xs text-gray-500">사업자등록번호: 680-64-00735</p>
          <p className="text-xs text-gray-500">문의: junopy@naver.com</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="mypage" onNavigate={onNavigate} />
    </div>
  );
}