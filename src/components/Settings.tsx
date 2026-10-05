import { ChevronLeft, User, Palette, ChevronRight, Monitor, Phone, FileText, Star, ShieldCheck, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import type { Screen } from '../App';
import type { Theme } from '../utils/theme';
import { supabase } from '../lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  currentTheme: Theme;
}

export function Settings({ onNavigate, currentTheme }: SettingsProps) {
  const [modalState, setModalState] = useState<{ type: 'terms' | 'help' | null }>({ type: null });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('login');
  };

  const menuItems = [
    {
      label: '회원정보 수정',
      icon: User,
      action: () => onNavigate('profile'),
      value: ''
    },
    {
      label: '즐겨찾기 관리',
      icon: Star,
      action: () => onNavigate('favorites'),
      value: ''
    },
    {
      label: '화면 설정',
      icon: Palette,
      action: () => onNavigate('theme'), // Assuming 'theme' screen exists
      value: '다크 모드'
    },
    {
      label: '이용약관 및 정책',
      icon: ShieldCheck,
      action: () => setModalState({ type: 'terms' }),
      value: ''
    },
    {
      label: '도움말 및 문의',
      icon: HelpCircle,
      action: () => setModalState({ type: 'help' }),
      value: ''
    },
    {
      label: '서비스 및 버전 정보',
      icon: Monitor,
      action: () => { },
      value: 'v1.0.0'
    }
  ];

  return (
    <div className="flex flex-col w-full h-full bg-app-primary text-text-primary overflow-hidden">
      {/* Header */}
      <header className="pt-safe px-4 h-16 flex items-center gap-4 border-b border-border bg-app-primary sticky top-0 z-10">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 -ml-2 text-text-muted hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">설정</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 scrollbar-hide">

        {/* Menu Group */}
        <div className="bg-app-secondary border border-border rounded-2xl overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={item.action}
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-app-primary/50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-app-primary flex items-center justify-center text-text-muted">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-text-primary">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-sm text-text-muted">{item.value}</span>}
                <ChevronRight className="w-4 h-4 text-text-disabled" />
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="px-2 text-xs text-text-disabled space-y-1.5 opacity-60">
          <p>상호명: 올타 | 대표자: 정종환</p>
          <p>사업자등록번호: 680-64-00735</p>
          <p>문의: junopy@naver.com</p>
          <p className="mt-4">Copyright © Allta. All rights reserved.</p>
        </div>

      </div>

      <Dialog open={modalState.type !== null} onOpenChange={(open) => { if (!open) setModalState({ type: null }) }}>
        <DialogContent className="max-w-[340px] rounded-2xl bg-app-secondary border border-border text-white" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {modalState.type === 'terms' ? '이용약관' : '도움말'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4 text-sm text-text-muted leading-relaxed max-h-[60vh] overflow-y-auto">
            {modalState.type === 'terms' && (
              <>
                <h3 className="text-white font-bold mb-2">제 1 조 (목적)</h3>
                <p>본 약관은 곧 도착해요(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.</p>

                <h3 className="text-white font-bold mt-4 mb-2">제 2 조 (용어의 정의)</h3>
                <p>① "회원"이란 서비스에 가입하여 본 약관에 따라 회사가 제공하는 서비스를 받는 자를 말합니다.</p>
                <p>② "문자 알림 서비스"란 사용자가 설정한 도착지 및 경유지에 도달했을 때 지정된 수신자에게 SMS 문자를 자동으로 발송하는 기능을 말합니다.</p>

                <h3 className="text-white font-bold mt-4 mb-2">제 3 조 (서비스의 제공)</h3>
                <p>GPS 정보의 수집 및 백그라운드 처리는 알림 서비스 제공의 핵심이며, 오차 범위 내의 정확도를 보장하지는 않습니다.</p>
              </>
            )}

            {modalState.type === 'help' && (
              <>
                <h3 className="text-white font-bold mb-2">1. 도착 알림은 어떻게 설정하나요?</h3>
                <p>홈 화면의 "예약하기" 버튼을 눌러 도착지와 알림을 받을 연락처를 설정하실 수 있습니다.</p>

                <h3 className="text-white font-bold mt-4 mb-2">2. 문자 내용 수정이 가능한가요?</h3>
                <p>네, "자주 쓰는 메시지 관리" 또는 마이페이지의 "문자 템플릿 관리"에서 상황에 맞는 메시지를 직접 수정할 수 있습니다.</p>

                <h3 className="text-white font-bold mt-4 mb-2">3. 문의하기</h3>
                <p>추가적인 문의사항은 아래 이메일로 연락주시기 바랍니다.</p>
                <p className="text-[#00ff88] mt-1">junopy@naver.com</p>
              </>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setModalState({ type: null })}
              className="px-6 py-2 bg-app-accent text-app-primary font-bold rounded-xl"
            >
              확인
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}