import { inject } from "vue";
import { themeKey } from "./ThemeProvider.vue";
import type { Theme } from "./ThemeProvider.vue";

export function useTheme() {
  const theme = inject(themeKey);

  if (!theme) {
    throw new Error(
      "useTheme() должен использоваться в дочернем компоненте ThemeProvider",
    );
  }

  return theme as {
    currentTheme: { value: Theme };
    setTheme: (theme: Theme) => void;
    toggleDarkMode: () => void;
    isDarkMode: { value: boolean };
  };
}
