<script lang="ts">
export const themeKey = Symbol("theme");
export type Theme = "indigo" | "board";
</script>

<script setup lang="ts">
import { computed, onMounted, provide, watch } from "vue";
import useStore from "@src/shared/store/store";
import "../theme/themes.css";

const store = useStore();

const currentTheme = computed(() => store.settings.theme || "indigo");

const setTheme = (theme: Theme) => {
  store.settings.theme = theme;
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.remove("theme-indigo", "theme-board");
  document.documentElement.classList.add(`theme-${theme}`);
};

const toggleDarkMode = () => {
  store.settings.darkMode = !store.settings.darkMode;
};

watch(
  () => currentTheme.value,
  (newTheme) => {
    applyTheme(newTheme as Theme);
  },
);

watch(
  () => store.settings.darkMode,
  (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
);

provide(themeKey, {
  currentTheme,
  setTheme,
  toggleDarkMode,
  isDarkMode: computed(() => store.settings.darkMode),
});

onMounted(() => {
  applyTheme(currentTheme.value as Theme);

  if (store.settings.darkMode) {
    document.documentElement.classList.add("dark");
  }
});
</script>

<template>
  <slot></slot>
</template>
