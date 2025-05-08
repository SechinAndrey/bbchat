import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "../services/auth-service";

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const token = ref<string | null>(authService.getToken());
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Computed properties
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true;
    error.value = null;

    try {
      const newToken = await authService.login(credentials);
      token.value = newToken;
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

  function logout() {
    authService.logout();
    token.value = null;
  }

  function init() {
    if (token.value) {
      authService.setupAuthInterceptor();
    }
  }

  return {
    token,
    loading,
    error,

    isAuthenticated,

    login,
    logout,
    init,
  };
});
