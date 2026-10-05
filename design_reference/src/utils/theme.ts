export type Theme = 'dark' | 'white' | 'green' | 'yellow';

export interface ThemeColors {
  background: string;
  cardBg: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  hoverBg: string;
  activeBg: string;
}

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    background: '#0f2920',
    cardBg: '#1a3d32',
    border: '#374151',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    accent: '#00ff88',
    accentText: '#0f2920',
    hoverBg: '#1a3d32',
    activeBg: '#235a47',
  },
  white: {
    background: '#ffffff',
    cardBg: '#f3f4f6',
    border: '#d1d5db',
    text: '#111827',
    textSecondary: '#6b7280',
    accent: '#00c96e',
    accentText: '#ffffff',
    hoverBg: '#f9fafb',
    activeBg: '#e5e7eb',
  },
  green: {
    background: '#1a4d2e',
    cardBg: '#235a3a',
    border: '#2d6a4f',
    text: '#ffffff',
    textSecondary: '#a7c4bc',
    accent: '#4ade80',
    accentText: '#1a4d2e',
    hoverBg: '#2d6a4f',
    activeBg: '#40916c',
  },
  yellow: {
    background: '#713f12',
    cardBg: '#92400e',
    border: '#a16207',
    text: '#ffffff',
    textSecondary: '#fde68a',
    accent: '#fbbf24',
    accentText: '#713f12',
    hoverBg: '#92400e',
    activeBg: '#b45309',
  },
};

export const themeNames: Record<Theme, string> = {
  dark: '다크',
  white: '화이트',
  green: '그린',
  yellow: '옐로우',
};
