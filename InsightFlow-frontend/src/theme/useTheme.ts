/**
 * useTheme — Centralized dynamic token hook (premium iOS design system)
 */
import { useUserStore } from '../store/userStore';
import { APP_DEFAULTS } from '../constants/mockData';

function getContrastYIQ(hexcolor: string) {
  if (!hexcolor || typeof hexcolor !== 'string') return '#FFFFFF';
  let hex = hexcolor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((x) => x + x).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#FFFFFF';
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0E1015' : '#FFFFFF';
}

export function withAlpha(hex: string, opacity: number): string {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${opacity})`;
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((c) => c + c).join('');
  }
  if (normalized.length !== 6) return `rgba(0,0,0,${opacity})`;
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${opacity})`;
  return `rgba(${r},${g},${b},${opacity})`;
}

export const Accents = {
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  purple: '#BF5AF2',
};

export function useTheme() {
  const isDarkMode = useUserStore((state) => state.isDarkMode);
  const user = useUserStore((state) => state.user);

  // Brand colors — store se lo, fallback defaults
  const brandPrimary = user?.primaryColor || '#6C63FF';
  const brandSecondary = user?.secondaryColor || '#E8F0FC';

  const accent = brandPrimary;
  const accentSecondary = brandSecondary;

  const T = {
    bg: isDarkMode ? '#000000' : '#FAFAFA',
    surface: isDarkMode ? '#0A0A0A' : '#FFFFFF',
    card: isDarkMode ? '#111111' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#0A0A0A',
    textSecondary: isDarkMode ? '#888888' : '#666666',
    textMuted: isDarkMode ? '#444444' : '#BBBBBB',
    btnPrimary: isDarkMode ? '#FFFFFF' : '#0A0A0A',
    btnPrimaryText: isDarkMode ? '#000000' : '#FFFFFF',
    btnSecondary: isDarkMode ? '#1A1A1A' : '#F0F0F0',
    btnSecondaryText: isDarkMode ? '#FFFFFF' : '#0A0A0A',
    accent,
    accentSecondary,
    border: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    divider: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    glass: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1 as const,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      borderRadius: 20 as const,
    },
    glassCard: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)',
      borderWidth: 1 as const,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
      borderRadius: 28 as const,
    },
    glassInput: {
      backgroundColor: isDarkMode ? '#0A0A0A' : '#FAFAFA',
      borderWidth: 1 as const,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      borderRadius: 14 as const,
    },
    shadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.4 : 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    shadowStrong: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkMode ? 0.6 : 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
    isDarkMode,
    radius: { sm: 8, md: 12, lg: 16, xl: 20, full: 999 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    withAlpha,
    ...Accents,
  };

  const primary = T.accent;
  const primaryText = getContrastYIQ(primary);
  const onAccent = T.btnPrimaryText;

  const cardCompound = {
    backgroundColor: T.card,
    borderRadius: T.radius.xl,
    borderWidth: 1 as const,
    borderColor: T.border,
  };

  return {
    ...T,
    primary,
    primaryText,
    onAccent,
    textSub: T.textSecondary,
    textTertiary: T.textMuted,
    surfaceHigh: T.surface,
    surfaceCard: T.card,
    borderMid: T.border,
    cardBg: T.card,
    cardStyle: cardCompound,
    cardLg: { ...cardCompound, borderRadius: T.radius.xl + 12 },
    cardSm: { ...cardCompound, borderRadius: T.radius.md },
    glowBorder: {
      borderWidth: 1 as const,
      borderColor: withAlpha(primary, 0.27),
    },
    pillBg: withAlpha(primary, 0.09),
    pillBg2: withAlpha(primary, 0.16),
    brandLogoUrl: user?.logo_url || '',
  };
}

export type Theme = ReturnType<typeof useTheme>;
