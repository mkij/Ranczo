// Font scale multipliers for accessibility
export const FONT_SCALES = {
  small: 0.85,
  normal: 1.0,
  large: 1.2,
} as const;

export type FontScale = keyof typeof FONT_SCALES;

// Base font sizes (before scaling)
export const FONT_SIZES = {
  question: 20,
  option: 17,
  body: 16,
  caption: 13,
  title: 32,
  subtitle: 18,
  label: 11,
} as const;

// Color palette - modern warm minimal
export const COLORS = {
  primary: '#2E5A2E',
  primaryLight: '#3A6B35',
  background: '#FAF8F3',
  backgroundGradientEnd: '#F3EDE4',
  surface: '#FEFDFB',
  surfaceHover: '#FFFFFF',
  text: '#2C2418',
  textSecondary: '#9A8E7F',
  textMuted: '#B0A594',
  correct: '#2E5A2E',
  incorrect: '#C62828',
  border: '#E8E2D8',
  accent: '#F5C842',
  accentDark: '#E8A920',
  card: '#FEFDFB',
  white: '#FFFFFF',
  bestScoreBg: '#E8F0E8',
  bestScoreText: '#2E5A2E',
  iconBg: '#F5F2EC',
  shadow: '#000000',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;