export const THEME_COLORS = {
  dark: "#0a0a0a",
  light: "#f8fafc",
} as const;

export type ThemeName = keyof typeof THEME_COLORS;

export const DEFAULT_THEME: ThemeName = "dark";
export const THEME_STORAGE_KEY = "gymPartnerTheme:v1";
