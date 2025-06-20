import { defineStore } from "pinia";
import { ref, computed } from "vue";
import globalDataService from "@src/shared/services/global-data-service";
import type { ApiGlobalDataResponse, ApiGlobalDataUser } from "@src/api/types";

export const useGlobalDataStore = defineStore("globalData", () => {
  const globalData = ref<ApiGlobalDataResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const allUsers = computed<ApiGlobalDataUser[]>(() => {
    if (!globalData.value) return [];
    return [...globalData.value.users, ...globalData.value.usersForClients];
  });

  const fetchGlobalData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await globalDataService.getGlobalData();
      globalData.value = data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
    } finally {
      isLoading.value = false;
    }
  };

  return {
    globalData,
    allUsers,
    isLoading,
    error,

    fetchGlobalData,
  };
});
