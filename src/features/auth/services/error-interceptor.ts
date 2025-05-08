import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth-store";
import apiClient from "@src/api/axios-instance";

// Global interceptor for API error handling
export function setupErrorInterceptor() {
  const authStore = useAuthStore();
  const router = useRouter();

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        authStore.logout();
        router.push("/access/sign-in/");
        console.error("Session expired. Please login again.");
      }
      return Promise.reject(error);
    },
  );
}
