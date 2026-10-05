import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import type { Screen } from '../App';
import { type Theme, themes } from '../utils/theme';
import { supabase } from '../lib/supabaseClient';

interface EmailSignupProps {
  onNavigate: (screen: Screen) => void;
  currentTheme: Theme;
}

export function EmailSignup({ onNavigate, currentTheme }: EmailSignupProps) {
  const colors = themes[currentTheme];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (!isAgreed) {
      alert('이용약관 및 개인정보 처리방침에 동의해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      console.log('Signup successful:', data);
      alert('회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.');
      onNavigate('emailLogin');
    } catch (error) {
      console.error('Signup error:', error);
      alert(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header */}
      <header className="flex items-center px-4 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={() => onNavigate('emailLogin')} className="p-2">
          <ArrowLeft className="w-6 h-6" style={{ color: colors.text }} />
        </button>
        <h1 className="flex-1 text-center">회원가입</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto pb-32">
        <div className="flex-1 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl">계정 만들기</h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              곧 도착해요와 함께 시작하세요
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              이름
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textSecondary }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 outline-none transition-colors"
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                onFocus={(e) => e.target.style.borderColor = colors.accent}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textSecondary }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 outline-none transition-colors"
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                onFocus={(e) => e.target.style.borderColor = colors.accent}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textSecondary }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력하세요"
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 outline-none transition-colors"
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                onFocus={(e) => e.target.style.borderColor = colors.accent}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              비밀번호 확인
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textSecondary }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 outline-none transition-colors"
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                onFocus={(e) => e.target.style.borderColor = colors.accent}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer"
            style={{ 
              backgroundColor: isAgreed ? colors.accent + '10' : colors.cardBg,
              borderColor: isAgreed ? colors.accent : colors.border
            }}
            onClick={() => setIsAgreed(!isAgreed)}
          >
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded cursor-pointer"
              style={{ accentColor: colors.accent }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
              <span style={{ color: colors.text }}>[필수]</span> 이용약관 및 개인정보 처리방침에 동의합니다.
              <div className="mt-1 flex gap-2">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); window.open('/terms_of_service.html', '_blank'); }} 
                  className="underline" 
                  style={{ color: colors.accent }}
                >
                  약관 보기
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); window.open('/privacy_policy.html', '_blank'); }} 
                  className="underline" 
                  style={{ color: colors.accent }}
                >
                  방침 보기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4 pb-8 pt-6">
          <Button
            onClick={handleSignup}
            className="w-full h-14 rounded-xl transition-colors active:scale-95"
            style={{
              backgroundColor: colors.accent,
              color: colors.accentText,
            }}
          >
            {isLoading ? '가입 중...' : '가입하기'}
          </Button>

          <div className="text-center">
            <span className="text-sm" style={{ color: colors.textSecondary }}>
              이미 계정이 있으신가요?{' '}
            </span>
            <button
              onClick={() => onNavigate('emailLogin')}
              className="text-sm hover:underline"
              style={{ color: colors.accent }}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}