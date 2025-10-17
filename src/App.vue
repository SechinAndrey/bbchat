<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

import useStore from "@src/shared/store/store";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { setupErrorInterceptor } from "@src/features/auth/services/error-interceptor";
import ThemeProvider from "@src/shared/theme-system/ThemeProvider.vue";

import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
import { useFCM } from "@src/shared/composables/useFCM";

// Refactoring code:
// todo reorganize component structure
// todo refactor remove getters from utils file and add them to store folder.
// todo improve the video component.
// todo add shortcuts

// future features:
// todo add video calling
// todo add stories

// Accessability:
// todo improve the way you view messages.
// todo make multi-select more accessible.
// todo make dropdown menus more accessible.
// todo make modals more accessible.
// todo make lists (i.e conversations, contacts, calls) more accessible.

// SEO.
// todo improve seo.

// Performance:
// todo add dynamic imports.
// todo add chunking.

const store = useStore();
const authStore = useAuthStore();

setupErrorInterceptor();

const appInitializing = ref(true);
const initError = ref<string | null>(null);

const isAppReady = computed(() => {
  return (
    !appInitializing.value &&
    (!authStore.isAuthenticated || store.status === "success")
  );
});

const handleReload = () => {
  window.location.reload();
};

// update localStorage with state changes
store.$subscribe((_mutation, state) => {
  localStorage.setItem("chat", JSON.stringify(state));
});

onMounted(async () => {
  try {
    appInitializing.value = true;

    authStore.init();

    if (authStore.isAuthenticated) {
      const success = await store.initializeData();
      if (!success) {
        initError.value = "Не удалось загрузить данные";
      }
      useFCM();
    }
  } catch (error) {
    console.error("Error initializing app:", error);
    initError.value = "Ошибка инициализации приложения";
  } finally {
    appInitializing.value = false;
  }
});

// the app height
const height = ref(`${window.innerHeight}px`);

// change the app height to the window hight.
const resizeWindow = () => {
  height.value = `${window.innerHeight}px`;
};

// and add the resize event when the component mounts.
onMounted(() => {
  window.addEventListener("resize", resizeWindow);
});

// remove the event when un-mounting the component.
onUnmounted(() => {
  window.removeEventListener("resize", resizeWindow);
});
</script>

<template>
  <ThemeProvider>
    <div
      class="bg-app-bg text-app-text transition-colors duration-500"
      :style="{ height: height }"
    >
      <div
        v-if="
          appInitializing ||
          (authStore.isAuthenticated && store.status === 'loading')
        "
        class="flex justify-center items-center h-full"
      >
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status">
            <div
              class="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"
            ></div>
          </div>
          <p class="text-gray-600 dark:text-gray-400">Загрузка приложения...</p>
        </div>
      </div>

      <div
        v-else-if="initError"
        class="flex justify-center items-center h-full"
      >
        <div class="text-center">
          <div class="text-danger mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p class="text-danger dark:text-danger">{{ initError }}</p>
          <button
            class="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition"
            @click="handleReload"
          >
            Попробовать снова
          </button>
        </div>
      </div>

      <router-view v-else v-slot="{ Component }">
        <FadeTransition>
          <component :is="Component" />
        </FadeTransition>
      </router-view>
    </div>
  </ThemeProvider>
</template>
