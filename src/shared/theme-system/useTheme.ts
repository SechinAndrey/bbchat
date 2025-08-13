import { inject, type ComputedRef } from "vue";
import { themeKey, type Theme } from "./ThemeProvider.vue";

interface ThemeContext {
  currentTheme: ComputedRef<string>;
  setTheme: (theme: Theme) => void;
  loadTheme: (theme: Theme) => Promise<void>;
  toggleDarkMode: () => void;
  availableThemes: readonly Theme[];
  isDarkMode: { value: boolean };
}

export default function useTheme(): ThemeContext {
  const themeContext = inject<ThemeContext>(themeKey);

  if (!themeContext) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return themeContext;
}
