import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Screen } from '../App';
import { type Theme, themes } from '../utils/theme';

interface EmailLoginProps {
  onNavigate: (screen: Screen) => void;
  currentTheme: Theme;
}

export function EmailLogin({ onNavigate, currentTheme }: EmailLoginProps) {
  const colors = themes[currentTheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: 실제 로그인 로직 구현
    console.log('Login attempt:', { email, password });
    onNavigate('dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header */}
      <header className="flex items-center px-4 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={() => onNavigate('home')} className="p-2">
          <ArrowLeft className="w-6 h-6" style={{ color: colors.text }} />
        </button>
        <h1 className="flex-1 text-center">이메일 로그인</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="flex-1 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl">환영합니다</h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              이메일과 비밀번호로 로그인하세요
            </p>
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
                placeholder="비밀번호를 입력하세요"
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

          {/* Forgot Password */}
          <div className="text-right">
            <button className="text-sm hover:underline" style={{ color: colors.accent }}>
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4 pb-8">
          <Button
            onClick={handleLogin}
            className="w-full h-14 rounded-xl transition-colors active:scale-95"
            style={{
              backgroundColor: colors.accent,
              color: colors.accentText,
            }}
          >
            로그인
          </Button>

          <div className="text-center">
            <span className="text-sm" style={{ color: colors.textSecondary }}>
              계정이 없으신가요?{' '}
            </span>
            <button
              onClick={() => onNavigate('emailSignup')}
              className="text-sm hover:underline"
              style={{ color: colors.accent }}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}