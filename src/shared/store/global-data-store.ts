import { defineStore } from "pinia";
import { ref, computed } from "vue";
import globalDataService from "@src/shared/services/global-data-service";
import type {
  ApiGlobalDataResponse,
  ApiManagerListItem,
  ApiKanbanStatus,
} from "@src/api/types";

export const useGlobalDataStore = defineStore("globalData", () => {
  const globalData = ref<ApiGlobalDataResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const allUsers = computed<ApiManagerListItem[]>(() => {
    if (!globalData.value) return [];
    // combine users and usersForClients into a single array with UNIQUE users by id
    const usersMap = new Map<string, ApiManagerListItem>();
    globalData.value.users.forEach((user) =>
      usersMap.set(user.id.toString(), user),
    );
    globalData.value.usersForClients.forEach((user) =>
      usersMap.set(user.id.toString(), user),
    );
    return Array.from(usersMap.values());
  });

  const kanbanStatuses = computed<ApiKanbanStatus[]>(() => {
    if (!globalData.value) return [];
    return globalData.value.kanbanStatuses;
  });

  const cities = computed(() => {
    if (!globalData.value) return [];
    return globalData.value.cities.map((city) => ({
      id: city.id,
      name: city.name,
    }));
  });

  const getKanbanStatusById = (id: number): ApiKanbanStatus | undefined => {
    return kanbanStatuses.value.find((status) => status.id === id);
  };

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
    kanbanStatuses,
    globalData,
    allUsers,
    isLoading,
    cities,
    error,

    fetchGlobalData,
    getKanbanStatusById,
  };
});

export default useGlobalDataStore;
