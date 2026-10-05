import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import type { Screen } from '../App';
import { type Theme, themes } from '../utils/theme';

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

  const handleSignup = () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    // TODO: 실제 회원가입 로직 구현
    console.log('Signup attempt:', { name, email, password });
    onNavigate('setup');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header */}
      <header className="flex items-center px-4 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={() => onNavigate('emailLogin')} className="p-2">
          <ArrowLeft className="w-6 h-6" style={{ color: colors.text }} />
        </button>
        <h1 className="flex-1 text-center">회원가입</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
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

          {/* Terms */}
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            회원가입을 진행하면{' '}
            <button className="underline" style={{ color: colors.accent }}>
              이용약관
            </button>
            {' '}및{' '}
            <button className="underline" style={{ color: colors.accent }}>
              개인정보처리방침
            </button>
            에 동의하는 것으로 간주됩니다.
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
            가입하기
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
