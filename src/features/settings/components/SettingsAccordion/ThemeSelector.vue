<script setup lang="ts">
import useTheme from "@src/shared/theme-system/useTheme";
import { CheckIcon } from "@heroicons/vue/24/solid";

const { setTheme } = useTheme();
</script>

<template>
  <div class="theme-selector mb-7">
    <div class="mb-6">
      <h3 class="mb-2">Цветовая тема</h3>
      <p class="opacity-70">Выберите цветовую схему для интерфейса</p>
    </div>

    <div class="theme-options flex gap-3">
      <div
        class="theme-option flex-1 cursor-pointer p-3 rounded-xl border-2 transition-all duration-300 relative overflow-hidden border-primary bg-primary bg-opacity-10"
        @click="setTheme('default')"
      >
        <div class="absolute inset-0 opacity-10">
          <div class="w-full h-full gradient-indigo"></div>
        </div>

        <div class="relative z-10 flex items-center justify-center flex-col">
          <div
            class="w-8 h-8 rounded-full mb-2 border-2 border-white shadow-sm overflow-hidden"
          >
            <div class="w-full h-full gradient-indigo"></div>
          </div>

          <span class="font-medium"> Стандартна </span>

          <div
            class="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
          >
            <CheckIcon class="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-selector {
  user-select: none;
}

.theme-options {
  gap: 0.75rem;
}

.theme-option {
  min-height: 80px;
  backdrop-filter: blur(10px);
  transform: translateZ(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-option:active {
  transform: translateY(0);
}

.gradient-indigo {
  background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #6366f1 100%);
}

.gradient-board {
  background: linear-gradient(135deg, #86efac 0%, #4ade80 50%, #22c55e 100%);
}

@keyframes themeSelect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.theme-option:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-focus);
}

@media (max-width: 480px) {
  .theme-options {
    flex-direction: column;
    gap: 0.5rem;
  }

  .theme-option {
    min-height: 60px;
  }

  .theme-option > div > div:first-child {
    width: 6rem;
    height: 6rem;
  }
}

.theme-option > div {
  transition: all 0.2s ease;
}

.theme-option:hover > div {
  transform: scale(1.02);
}

.theme-option [class*="absolute"] {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
