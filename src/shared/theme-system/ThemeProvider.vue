<script lang="ts">
export const themeKey = Symbol("theme");
export const THEMES = ["default"] as const;
export type Theme = (typeof THEMES)[number];
</script>

<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from "vue";
import useStore from "@src/shared/store/store";

const store = useStore();
const currentTheme = computed(() => store.settings.theme || "default");
const themeLink = ref<HTMLLinkElement | null>(null);

// Build a map of theme URLs from SCSS files (Vite compiles SCSS and returns final URLs)
const themeUrls = import.meta.glob("./*-theme.scss", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;
const getThemeUrl = (theme: Theme) => themeUrls[`./${theme}-theme.scss`];

const setTheme = (theme: Theme) => {
  store.settings.theme = theme;
};

const loadTheme = (theme: Theme) => {
  // Create or reuse a single <link> for theme stylesheet
  const url = getThemeUrl(theme);
  if (!url) return;

  if (!themeLink.value) {
    themeLink.value = document.createElement("link");
    themeLink.value.rel = "stylesheet";
    document.head.appendChild(themeLink.value);
  }
  themeLink.value.href = url;

  // Apply theme class to the html element (matches SCSS: html.theme-*)
  const themeClasses = THEMES.map((t) => `theme-${t}`);
  document.documentElement.classList.remove(...themeClasses);
  document.documentElement.classList.add(`theme-${theme}`);
};

const toggleDarkMode = () => {
  store.settings.darkMode = !store.settings.darkMode;
};

watch(
  () => currentTheme.value,
  (newTheme) => {
    loadTheme(newTheme as Theme);
  },
  { immediate: true },
);

watch(
  () => store.settings.darkMode,
  (isDark) => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  },
  { immediate: true },
);

provide(themeKey, {
  currentTheme,
  setTheme,
  toggleDarkMode,
  isDarkMode: computed(() => store.settings.darkMode),
});

onMounted(() => {
  if (store.settings.darkMode) {
    document.documentElement.classList.add("dark");
  }
});
</script>

<template>
  <slot></slot>
</template>
