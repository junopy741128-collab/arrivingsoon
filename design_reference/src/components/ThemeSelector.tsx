import { ArrowLeft, Check } from 'lucide-react';
import type { Screen } from '../App';
import { type Theme, themes, themeNames } from '../utils/theme';
import React from 'react';

interface ThemeSelectorProps {
  onNavigate: (screen: Screen) => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSelector({ onNavigate, currentTheme, onThemeChange }: ThemeSelectorProps) {
  const colors = themes[currentTheme];
  
  // 테마 옵션 정의
  const themeOptions = [
    {
      id: 'dark' as Theme,
      name: '다크 모드',
      description: '기본 다크 테마',
      gradient: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
      previewBg: '#0f2920',
      accentColor: '#00ff88',
    },
    {
      id: 'dark' as Theme,
      name: '민트 그라데이션',
      description: '시원한 민트 느낌',
      gradient: 'linear-gradient(135deg, #00ffc6 0%, #00b8a9 100%)',
      previewBg: '#0a2f2a',
      accentColor: '#00ffc6',
    },
    {
      id: 'dark' as Theme,
      name: '블루 그라데이션',
      description: '깔끔한 블루 톤',
      gradient: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
      previewBg: '#0a1f2f',
      accentColor: '#00d4ff',
    },
    {
      id: 'dark' as Theme,
      name: '퍼플 그라데이션',
      description: '세련된 퍼플 톤',
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
      previewBg: '#1a1a2e',
      accentColor: '#a78bfa',
    },
  ];

  const [selectedTheme, setSelectedTheme] = React.useState(0);

  const handleThemeSelect = (index: number) => {
    setSelectedTheme(index);
    onThemeChange(themeOptions[index].id);
  };

  const currentThemeOption = themeOptions[selectedTheme];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header */}
      <header className="flex items-center px-4 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={() => onNavigate('settings')} className="p-2">
          <ArrowLeft className="w-6 h-6" style={{ color: colors.text }} />
        </button>
        <h1 className="flex-1 text-center">화면 테마 설정</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {themeOptions.map((theme, index) => {
            const isSelected = selectedTheme === index;

            return (
              <button
                key={index}
                onClick={() => handleThemeSelect(index)}
                className="w-full p-6 rounded-2xl border-2 transition-all"
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: isSelected ? colors.accent : colors.border,
                  color: colors.text,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Gradient Preview */}
                    <div 
                      className="w-16 h-16 rounded-xl border-2"
                      style={{
                        background: theme.gradient,
                        borderColor: colors.border,
                      }}
                    />
                    <div className="text-left">
                      <div className="font-medium text-lg">{theme.name}</div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        {theme.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.accent }}
                    >
                      <Check className="w-5 h-5" style={{ color: colors.accentText }} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg" style={{ color: colors.textSecondary }}>미리보기</h3>
          <div 
            className="p-6 rounded-2xl border-2"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.accent}20` }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <circle cx="12" cy="16" r="1" fill={colors.accent} />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-lg mb-1" style={{ color: colors.text }}>샘플 알림</div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>5분 후 도착 예정</div>
                </div>
              </div>
              
              {/* Gradient Button */}
              <button 
                className="w-full py-4 rounded-full transition-all relative overflow-hidden group"
                style={{
                  background: currentThemeOption.gradient,
                  color: currentThemeOption.previewBg,
                  fontWeight: '600',
                  fontSize: '16px',
                }}
              >
                <span className="relative z-10">그라데이션 버튼</span>
                <div 
                  className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ mixBlendMode: 'overlay' }}
                />
              </button>
              
              {/* Outline Button */}
              <button 
                className="w-full py-4 rounded-full transition-colors"
                style={{ 
                  border: `2px solid ${colors.border}`,
                  backgroundColor: 'transparent',
                  color: colors.text,
                  fontWeight: '500',
                }}
              >
                아웃라인 버튼
              </button>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg" style={{ color: colors.textSecondary }}>컬러 팔레트</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div 
                className="w-full aspect-square rounded-xl mb-2"
                style={{ 
                  background: currentThemeOption.gradient,
                }}
              />
              <p className="text-xs" style={{ color: colors.textSecondary }}>그라데이션</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full aspect-square rounded-xl mb-2"
                style={{ backgroundColor: currentThemeOption.accentColor }}
              />
              <p className="text-xs" style={{ color: colors.textSecondary }}>강조색</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full aspect-square rounded-xl mb-2 border-2"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
              />
              <p className="text-xs" style={{ color: colors.textSecondary }}>배경색</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}