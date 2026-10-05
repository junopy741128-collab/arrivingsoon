import { ArrowLeft, Check } from 'lucide-react';
import type { Screen } from '../App';
import { type Theme, themes, themeNames } from '../utils/theme';

interface ThemeSelectorProps {
  onNavigate: (screen: Screen) => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSelector({ onNavigate, currentTheme, onThemeChange }: ThemeSelectorProps) {
  const colors = themes[currentTheme];
  const themeOptions: Theme[] = ['dark', 'white', 'green', 'yellow'];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header */}
      <header className="flex items-center px-4 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={() => onNavigate('mypage')} className="p-2">
          <ArrowLeft className="w-6 h-6" style={{ color: colors.text }} />
        </button>
        <h1 className="flex-1 text-center">화면 테마 설정</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-3">
          {themeOptions.map((theme) => {
            const themeColors = themes[theme];
            const isSelected = currentTheme === theme;

            return (
              <button
                key={theme}
                onClick={() => onThemeChange(theme)}
                className="w-full p-4 rounded-2xl border-2 transition-all"
                style={{
                  backgroundColor: themeColors.cardBg,
                  borderColor: isSelected ? themeColors.accent : themeColors.border,
                  color: themeColors.text,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl border-2 flex items-center justify-center"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.border,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: themeColors.accent }}
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{themeNames[theme]}</div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                        {theme === 'dark' && '기본 다크 모드'}
                        {theme === 'white' && '밝은 라이트 모드'}
                        {theme === 'green' && '자연스러운 그린'}
                        {theme === 'yellow' && '따뜻한 옐로우'}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: themeColors.accent }}
                    >
                      <Check className="w-5 h-5" style={{ color: themeColors.accentText }} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h3 className="mb-4" style={{ color: colors.textSecondary }}>미리보기</h3>
          <div
            className="p-6 rounded-2xl border-2"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.accent }}
                >
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors.accentText }} />
                </div>
                <div className="flex-1">
                  <div style={{ color: colors.text }}>샘플 알림</div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>5분 후 도착 예정</div>
                </div>
              </div>
              <button
                className="w-full py-3 rounded-xl transition-colors"
                style={{ backgroundColor: colors.accent, color: colors.accentText }}
              >
                버튼 예시
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
