import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import axios from "axios";
import { authService } from "../services/auth-service";
import { adaptUser } from "@src/api/adapters";
import type { IUser } from "@src/shared/types/types";

import { useEventBus } from "@vueuse/core";
const loginEvent = useEventBus("auth:login");
const logoutEvent = useEventBus("auth:logout");

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const token = ref<string | null>(authService.getToken());
  const fcmToken = ref<string>("");
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const currentUser = ref<IUser | null>(null);
  const userLoading = ref<boolean>(false);
  const userError = ref<string | null>(null);

  // Computed properties
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true;
    error.value = null;

    try {
      const newToken = await authService.login(credentials);
      token.value = newToken;

      await fetchCurrentUser();

      loginEvent.emit();

      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const { status, data } = err.response;

        if (status === 422 && data.errors) {
          const firstErrorField = Object.keys(data.errors)[0];
          const firstErrorMessage = data.errors[firstErrorField]?.[0];

          if (firstErrorMessage?.includes("credentials are incorrect")) {
            error.value = "Невірний email або пароль.";
          } else if (firstErrorMessage?.includes("email")) {
            error.value = "Некоректна електронна пошта.";
          } else {
            error.value = firstErrorMessage || "Помилка валідації даних.";
          }
        } else if (status === 401) {
          error.value = "Невірний email або пароль.";
        } else if (status === 429) {
          error.value = "Забагато спроб входу. Спробуйте пізніше.";
        } else if (status >= 500) {
          error.value = "Помилка сервера. Спробуйте пізніше.";
        } else {
          error.value = data.message || "Не вдалося увійти.";
        }
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Сталася помилка під час входу.";
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function loginWithToken(loginToken: string) {
    loading.value = true;
    error.value = null;

    try {
      const newToken = await authService.loginWithToken(loginToken);
      token.value = newToken;

      await fetchCurrentUser();

      return true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "An error occurred during authentication";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function postFirebaseMessagingToken() {
    if (!currentUser.value?.id || !fcmToken.value) return;

    authService.postFirebaseMessagingToken(
      currentUser.value.id,
      fcmToken.value || "",
    );
  }

  async function fetchCurrentUser() {
    if (!token.value) return null;

    userLoading.value = true;
    userError.value = null;

    try {
      const apiUserData = await authService.getCurrentUser();
      if (!apiUserData) {
        userError.value = "User not found";
        return null;
      }
      const userData = adaptUser(apiUserData);
      currentUser.value = userData;

      return userData;
    } catch (err) {
      userError.value =
        err instanceof Error ? err.message : "Error fetching user data";
      return null;
    } finally {
      userLoading.value = false;
    }
  }

  function logout() {
    authService.logout();
    token.value = null;
    currentUser.value = null;
    logoutEvent.emit();
  }

  function init() {
    if (token.value) {
      authService.setupAuthInterceptor();
      fetchCurrentUser();
    }
  }

  watch(
    currentUser,
    (newVal) => {
      if (newVal) {
        postFirebaseMessagingToken();
      }
    },
    { immediate: true },
  );

  watch(
    fcmToken,
    (newVal) => {
      if (newVal) {
        postFirebaseMessagingToken();
      }
    },
    { immediate: true },
  );

  return {
    token,
    fcmToken,
    loading,
    error,
    currentUser,
    userLoading,
    userError,

    isAuthenticated,

    login,
    loginWithToken,
    postFirebaseMessagingToken,
    logout,
    init,
    fetchCurrentUser,
  };
});
