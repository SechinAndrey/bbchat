<script setup lang="ts">
import { ref, computed } from "vue";
import { useIframeMessaging } from "@src/shared/composables/useIframeMessaging";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { authService } from "@src/features/auth/services/auth-service";
import { useRouter } from "vue-router";
import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import LogoIcon from "@src/shared/icons/logoIcon.vue";
import SpinnerDots from "@src/ui/states/loading-states/SpinnerDots.vue";

type AuthStatus = "waiting" | "authenticating" | "success" | "error";

const authStatus = ref<AuthStatus>("waiting");
const errorMessage = ref("");

const { on } = useIframeMessaging({
  allowedOrigin: import.meta.env.VITE_IFRAME_PARENT,
});
const authStore = useAuthStore();
const router = useRouter();

const statusText = computed(() => {
  switch (authStatus.value) {
    case "waiting":
      return "З'єднання з чатом";
    case "authenticating":
      return "Авторизація";
    case "success":
      return "Успішно авторизовано!";
    case "error":
      return errorMessage.value || "Помилка авторизації";
    default:
      return "";
  }
});

const statusColor = computed(() => {
  switch (authStatus.value) {
    case "waiting":
      return "text-app-text";
    case "authenticating":
      return "text-app-text";
    case "success":
      return "text-success";
    case "error":
      return "text-danger";
    default:
      return "text-app-text";
  }
});

on("bb-widget:auth-by-token", async (data) => {
  console.log("Received token-auth message:", data);

  const savedVerificationToken = authService.getVerificationToken();
  const isAuthenticated = authStore.isAuthenticated;

  if (isAuthenticated && savedVerificationToken === data.token) {
    authStatus.value = "success";
    router.push({ path: `/widget/${data.entity}/${data.entityId}` });
    return;
  }
  authStatus.value = "authenticating";

  try {
    await authStore.loginWithToken(data.token, true);
    authStatus.value = "success";
    router.push({ path: `/widget/${data.entity}/${data.entityId}` });
  } catch (error) {
    authStatus.value = "error";
    errorMessage.value = "Не вдалося авторизуватися";
    console.error("Authentication error:", error);
  }
});
</script>

<template>
  <div
    class="w-full h-full flex flex-col items-center justify-center bg-app-bg relative overflow-hidden"
  >
    <!-- Animated gradient background -->
    <div class="absolute inset-0 opacity-3 dark:opacity-5"></div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center">
      <!-- Logo -->
      <div class="mb-6">
        <div
          class="w-16 h-16 flex items-center justify-center rounded-lg shadow-md"
        >
          <LogoIcon />
        </div>
      </div>

      <!-- Status -->
      <div class="text-center mb-6">
        <p class="text-lg font-medium mb-3" :class="statusColor">
          {{ statusText }}
        </p>

        <!-- Loading spinner -->
        <div
          v-if="authStatus === 'authenticating' || authStatus === 'waiting'"
          class="flex justify-center"
        >
          <div class="w-6 h-6">
            <SpinnerDots class="text-primary" />
          </div>
        </div>

        <!-- Success icon -->
        <div v-else-if="authStatus === 'success'" class="flex justify-center">
          <CheckIcon class="w-6 h-6 text-success" />
        </div>

        <!-- Error icon -->
        <div v-else-if="authStatus === 'error'" class="flex justify-center">
          <XMarkIcon class="w-6 h-6 text-danger" />
        </div>
      </div>
    </div>

    <!-- Brand -->
    <p class="fixed bottom-7 text-sm text-app-text-secondary font-light">
      Billboards Комунікації
    </p>
  </div>
</template>
