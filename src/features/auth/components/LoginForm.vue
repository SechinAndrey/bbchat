<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { MoonIcon, SunIcon } from "@heroicons/vue/24/solid";

import Button from "@src/ui/inputs/Button.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import PasswordInput from "@src/ui/inputs/PasswordInput.vue";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import LogoIcon from "@src/shared/icons/logoIcon.vue";
import useTheme from "@src/shared/theme-system/useTheme";
const { toggleDarkMode, isDarkMode } = useTheme();

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const loginError = ref("");

const handleLogin = async () => {
  if (!email.value || !password.value) {
    loginError.value = "Please fill in all fields";
    return;
  }

  isLoading.value = true;
  loginError.value = "";

  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value,
    });

    if (success) {
      router.push("/chat/");
    } else {
      loginError.value =
        authStore.error || "Login failed. Please check your credentials.";
    }
  } catch (error) {
    if (error instanceof Error) {
      loginError.value = error.message;
    } else {
      loginError.value = "Unknown error";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
  >
    <div
      class="absolute inset-0 opacity-60"
      style="
        background: linear-gradient(
          135deg,
          var(--color-auth-gradient-start) 0%,
          var(--color-auth-gradient-end) 100%
        );
      "
    />

    <!-- Main content -->
    <div class="relative z-10 w-full max-w-md mx-auto p-6">
      <!-- Login card -->
      <div
        class="bg-app-bg-secondary rounded-2xl border border-app-border p-8 backdrop-blur-sm"
        :class="isDarkMode ? '' : 'shadow-lg'"
      >
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center border border-app-border w-20 h-20 rounded-2xl mb-6"
          >
            <LogoIcon />
          </div>

          <h1 class="text-2xl font-semibold text-app-text mb-2">
            Billboards Комунікації
          </h1>
          <p class="text-app-text-secondary text-sm">
            Усі канали зв'язку в одному місці
          </p>
        </div>

        <!-- Error message -->
        <div
          v-if="loginError"
          class="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-start gap-3"
        >
          <svg
            class="w-5 h-5 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ loginError }}</span>
        </div>

        <!-- Form -->
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-5">
            <LabeledTextInput
              v-model="email"
              label="Електронна пошта"
              placeholder="your@email.com"
              size="md"
              type="email"
              autocomplete="email"
              :disabled="isLoading"
            />
            <PasswordInput
              v-model="password"
              size="md"
              label="Пароль"
              placeholder="Введіть ваш пароль"
              autocomplete="current-password"
              :disabled="isLoading"
            />
          </div>

          <!-- Login button -->
          <Button
            type="submit"
            class="w-full"
            size="lg"
            :loading="isLoading"
            :disabled="!email || !password"
          >
            <template v-if="!isLoading"> Увійти </template>
          </Button>
        </form>

        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-app-border/50">
          <p class="text-center text-xs text-app-text-secondary">
            *Використовуйте свій основний акаунт Billboards для входу
          </p>
        </div>
      </div>
    </div>

    <!-- Theme toggle -->
    <Button
      icon-only
      title="Перемкнути тему"
      variant="ghost"
      size="md"
      class="fixed top-6 right-6 z-50"
      @click="toggleDarkMode"
    >
      <template #icon>
        <component :is="isDarkMode ? SunIcon : MoonIcon" class="w-5 h-5" />
      </template>
    </Button>
  </div>
</template>
