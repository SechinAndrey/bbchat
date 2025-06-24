import { defineStore } from "pinia";
import { ref, computed } from "vue";
import conversationsService from "./conversations-service";
import type { GetCommunicationsParams } from "./conversations-service";
import type { ApiResponseMeta } from "@src/api/types";
import type { IConversation } from "@src/shared/types/types";
import {
  adaptApiCommunicationLeadToIConversation,
  adaptApiCommunicationClientToIConversation,
} from "@src/api/communication-adapters";

export const useConversationsStore = defineStore("conversations", () => {
  // State
  const leads = ref<IConversation[]>([]);
  const clients = ref<IConversation[]>([]);
  const leadsMeta = ref<ApiResponseMeta | null>(null);
  const clientsMeta = ref<ApiResponseMeta | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Filter state
  const filters = ref<GetCommunicationsParams>({
    page: 1,
    search: "",
    user_id: undefined,
  });

  // Loading states for specific requests
  const isLoadingLeads = ref(false);
  const isLoadingClients = ref(false);
  const leadsError = ref<string | null>(null);
  const clientsError = ref<string | null>(null);

  // Getters
  const hasMoreLeads = computed(() => {
    if (!leadsMeta.value) return false;
    return leadsMeta.value.current_page < leadsMeta.value.last_page;
  });

  const hasMoreClients = computed(() => {
    if (!clientsMeta.value) return false;
    return clientsMeta.value.current_page < clientsMeta.value.last_page;
  });

  const hasMore = computed(() => hasMoreLeads.value || hasMoreClients.value);

  const allCommunications = computed(() => {
    return [...leads.value, ...clients.value];
  });

  // Actions
  const fetchCommunications = async (params?: GetCommunicationsParams) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Merge provided params with stored filters
      const mergedParams = { ...filters.value, ...params };

      // Update filters with merged params
      if (params) {
        filters.value = mergedParams;
      }

      const response =
        await conversationsService.getCommunications(mergedParams);

      // If loading first page or resetting, replace the data
      if (mergedParams.page === 1) {
        leads.value = response.leads.data.map(
          adaptApiCommunicationLeadToIConversation,
        );
        clients.value = response.clients.data.map(
          adaptApiCommunicationClientToIConversation,
        );
      } else {
        // Otherwise append to existing data for "load more" functionality
        leads.value = [
          ...leads.value,
          ...response.leads.data.map(adaptApiCommunicationLeadToIConversation),
        ];
        clients.value = [
          ...clients.value,
          ...response.clients.data.map(
            adaptApiCommunicationClientToIConversation,
          ),
        ];
      }

      // Store pagination metadata
      leadsMeta.value = response.leads.meta;
      clientsMeta.value = response.clients.meta;

      return response;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Unknown error occurred";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch only leads
  const fetchLeads = async (params?: GetCommunicationsParams) => {
    try {
      isLoadingLeads.value = true;
      leadsError.value = null;

      // Merge provided params with stored filters
      const mergedParams = { ...filters.value, ...params };

      // Update filters with merged params
      if (params) {
        filters.value = mergedParams;
      }

      const response =
        await conversationsService.getCommunicationsLeads(mergedParams);

      // If loading first page or resetting, replace the data
      if (mergedParams.page === 1) {
        leads.value = response.leads.data.map(
          adaptApiCommunicationLeadToIConversation,
        );
      } else {
        // Otherwise append to existing data for "load more" functionality
        leads.value = [
          ...leads.value,
          ...response.leads.data.map(adaptApiCommunicationLeadToIConversation),
        ];
      }

      // Store pagination metadata
      leadsMeta.value = response.leads.meta;

      return response;
    } catch (err) {
      leadsError.value =
        err instanceof Error ? err.message : "Unknown error occurred";
      throw err;
    } finally {
      isLoadingLeads.value = false;
    }
  };

  // Fetch only clients
  const fetchClients = async (params?: GetCommunicationsParams) => {
    try {
      isLoadingClients.value = true;
      clientsError.value = null;

      // Merge provided params with stored filters
      const mergedParams = { ...filters.value, ...params };

      // Update filters with merged params
      if (params) {
        filters.value = mergedParams;
      }

      const response =
        await conversationsService.getCommunicationsClients(mergedParams);

      // If loading first page or resetting, replace the data
      if (mergedParams.page === 1) {
        clients.value = response.clients.data.map(
          adaptApiCommunicationClientToIConversation,
        );
      } else {
        // Otherwise append to existing data for "load more" functionality
        clients.value = [
          ...clients.value,
          ...response.clients.data.map(
            adaptApiCommunicationClientToIConversation,
          ),
        ];
      }

      // Store pagination metadata
      clientsMeta.value = response.clients.meta;

      return response;
    } catch (err) {
      clientsError.value =
        err instanceof Error ? err.message : "Unknown error occurred";
      throw err;
    } finally {
      isLoadingClients.value = false;
    }
  };

  const loadMoreCommunications = async () => {
    if (!hasMore.value || isLoading.value) return;

    // Increment page number for "load more" functionality
    const nextPage = filters.value.page ? filters.value.page + 1 : 2;

    return fetchCommunications({
      ...filters.value,
      page: nextPage,
    });
  };

  // Load more leads
  const loadMoreLeads = async () => {
    if (!hasMoreLeads.value || isLoadingLeads.value) return;

    // Increment page number for "load more" functionality
    const nextPage = filters.value.page ? filters.value.page + 1 : 2;

    return fetchLeads({
      ...filters.value,
      page: nextPage,
    });
  };

  // Load more clients
  const loadMoreClients = async () => {
    if (!hasMoreClients.value || isLoadingClients.value) return;

    // Increment page number for "load more" functionality
    const nextPage = filters.value.page ? filters.value.page + 1 : 2;

    return fetchClients({
      ...filters.value,
      page: nextPage,
    });
  };

  const setSearchFilter = (search: string) => {
    // Reset to page 1 when changing search
    filters.value = {
      ...filters.value,
      search,
      page: 1,
    };

    return fetchCommunications(filters.value);
  };

  // Search filter for leads only
  const setLeadsSearchFilter = (search: string) => {
    // Reset to page 1 when changing search
    filters.value = {
      ...filters.value,
      search,
      page: 1,
    };

    return fetchLeads(filters.value);
  };

  // Search filter for clients only
  const setClientsSearchFilter = (search: string) => {
    // Reset to page 1 when changing search
    filters.value = {
      ...filters.value,
      search,
      page: 1,
    };

    return fetchClients(filters.value);
  };

  const setUserFilter = (userId?: number) => {
    // Reset to page 1 when changing user filter
    filters.value = {
      ...filters.value,
      user_id: userId,
      page: 1,
    };

    return fetchCommunications(filters.value);
  };

  // User filter for leads only
  const setLeadsUserFilter = (userId?: number) => {
    // Reset to page 1 when changing user filter
    filters.value = {
      ...filters.value,
      user_id: userId,
      page: 1,
    };

    return fetchLeads(filters.value);
  };

  // User filter for clients only
  const setClientsUserFilter = (userId?: number) => {
    // Reset to page 1 when changing user filter
    filters.value = {
      ...filters.value,
      user_id: userId,
      page: 1,
    };

    return fetchClients(filters.value);
  };

  // Helper function to reset filters to default values
  const getDefaultFilters = (): GetCommunicationsParams => {
    return {
      page: 1,
      search: "",
      user_id: undefined,
    };
  };

  const resetFilters = () => {
    filters.value = getDefaultFilters();
    return fetchCommunications(filters.value);
  };

  // Reset filters for leads only
  const resetLeadsFilters = () => {
    filters.value = getDefaultFilters();
    return fetchLeads(filters.value);
  };

  // Reset filters for clients only
  const resetClientsFilters = () => {
    filters.value = getDefaultFilters();
    return fetchClients(filters.value);
  };

  return {
    // State
    leads,
    clients,
    leadsMeta,
    clientsMeta,
    isLoading,
    isLoadingLeads,
    isLoadingClients,
    error,
    leadsError,
    clientsError,
    filters,

    // Getters
    hasMoreLeads,
    hasMoreClients,
    hasMore,
    allCommunications,

    // Actions
    fetchCommunications,
    loadMoreCommunications,
    setSearchFilter,
    setUserFilter,
    resetFilters,
    // New actions for leads and clients
    fetchLeads,
    fetchClients,
    loadMoreLeads,
    loadMoreClients,
    setLeadsSearchFilter,
    setClientsSearchFilter,
    setLeadsUserFilter,
    setClientsUserFilter,
    resetLeadsFilters,
    resetClientsFilters,
  };
});

export default useConversationsStore;
