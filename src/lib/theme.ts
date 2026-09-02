import { DEFAULT_THEME, THEMES } from "@/constants";
import type { ThemeId } from "@/types";

const THEME_STORAGE_KEY = "verdarium.theme";

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    THEMES.some((theme) => theme.id === value)
  );
}

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  try {
    const storedTheme =
      window.localStorage.getItem(THEME_STORAGE_KEY);

    return isThemeId(storedTheme)
      ? storedTheme
      : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme: ThemeId): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      theme,
    );
  } catch {
    // Theme persistence is optional.
    // The active theme can still be applied for this session.
  }
}

export function setTheme(theme: ThemeId): void {
  applyTheme(theme);
  saveTheme(theme);
}

export function initializeTheme(): ThemeId {
  const theme = getStoredTheme();

  applyTheme(theme);

  return theme;
}