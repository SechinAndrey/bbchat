import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { authService } from "../services/auth-service";
import { adaptUser } from "@src/api/adapters";
import type { IUser } from "@src/shared/types/types";

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
