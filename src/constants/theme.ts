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
  caption: 14,
  title: 28,
  subtitle: 18,
} as const;

// Color palette - earthy/rural vibe inspired by the show
export const COLORS = {
  primary: '#2E7D32',       // deep green
  primaryLight: '#4CAF50',  // lighter green
  background: '#FAFAF5',    // warm off-white
  surface: '#FFFFFF',
  text: '#1B1B1B',
  textSecondary: '#5F5F5F',
  correct: '#2E7D32',
  incorrect: '#C62828',
  border: '#E0E0E0',
  accent: '#F9A825',        // warm yellow for highlights
  card: '#FFFFFF',
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
} as const;