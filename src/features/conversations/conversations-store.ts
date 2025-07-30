import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import conversationsService from "./conversations-service";
import type { GetCommunicationsParams } from "./conversations-service";
import type { EntityType } from "@src/shared/types/common";
import type {
  ApiResponseMeta,
  ApiCommunicationClientFull,
  ApiCommunicationLeadFull,
  ApiMessageItem,
} from "@src/api/types";
import type { IConversation } from "@src/shared/types/types";
import { adaptApiCommunicationToIConversation } from "@src/api/communication-adapters";
import { usePusher } from "@src/shared/composables/usePusher";

export const useConversationsStore = defineStore("conversations", () => {
  // State
  const leads = ref<IConversation[]>([]);
  const clients = ref<IConversation[]>([]);
  const leadsMeta = ref<ApiResponseMeta | null>(null);
  const clientsMeta = ref<ApiResponseMeta | null>(null);
  const isLoading = ref(false);

  const error = ref<string | null>(null);
  const activeConversationInfo = ref<
    ApiCommunicationLeadFull | ApiCommunicationClientFull | null
  >(null);
  const isFetchingActiveConversationInfo = ref(false);

  const route = useRoute();

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
  const isFetchingMessages = ref(false);
  const isLoadingMoreMessages = ref(false);
  const messagesError = ref<string | null>(null);
  const messagesMeta = ref<ApiResponseMeta | null>(null);

  const messagesFilters = ref<{ page?: number; search?: string }>({
    page: 1,
    search: "",
  });

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

  const hasMoreMessages = computed(() => {
    if (!messagesMeta.value) return false;
    return messagesMeta.value.current_page < messagesMeta.value.last_page;
  });

  const allCommunications = computed(() => {
    return [...leads.value, ...clients.value];
  });

  // Actions
  const fetchConversationById = async (entity: EntityType, id: number) => {
    isFetchingActiveConversationInfo.value = true;
    activeConversationInfo.value = null;
    try {
      const conversation =
        await conversationsService.getCommunicationEntityById<
          ApiCommunicationLeadFull | ApiCommunicationClientFull
        >(entity, id);
      conversation.messages = [];
      activeConversationInfo.value = conversation;
      return conversation;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Unknown error occurred";
      throw err;
    } finally {
      isFetchingActiveConversationInfo.value = false;
    }
  };

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
          adaptApiCommunicationToIConversation,
        );
        clients.value = response.clients.data.map(
          adaptApiCommunicationToIConversation,
        );
      } else {
        // Otherwise append to existing data for "load more" functionality
        leads.value = [
          ...leads.value,
          ...response.leads.data.map(adaptApiCommunicationToIConversation),
        ];
        clients.value = [
          ...clients.value,
          ...response.clients.data.map(adaptApiCommunicationToIConversation),
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
          adaptApiCommunicationToIConversation,
        );
      } else {
        // Otherwise append to existing data for "load more" functionality
        leads.value = [
          ...leads.value,
          ...response.leads.data.map(adaptApiCommunicationToIConversation),
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
          adaptApiCommunicationToIConversation,
        );
      } else {
        // Otherwise append to existing data for "load more" functionality
        clients.value = [
          ...clients.value,
          ...response.clients.data.map(adaptApiCommunicationToIConversation),
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

  // Unified method for fetching messages (initial and pagination)
  const fetchMessages = async (
    entity: EntityType,
    id: number,
    params?: { page?: number; search?: string },
    loadingRef = isFetchingMessages,
  ) => {
    if (loadingRef.value) return;

    try {
      loadingRef.value = true;
      messagesError.value = null;
      const mergedParams = { ...messagesFilters.value, ...params };
      if (params) messagesFilters.value = mergedParams;

      const response = await conversationsService.getCommunicationMessages(
        entity,
        id,
        mergedParams,
      );

      if (activeConversationInfo.value) {
        if (!mergedParams.page || mergedParams.page === 1) {
          activeConversationInfo.value.messages = response.data;
        } else {
          activeConversationInfo.value.messages = [
            ...activeConversationInfo.value.messages,
            ...response.data,
          ];
        }
      }

      messagesMeta.value = {
        current_page: response.current_page,
        from: response.from,
        last_page: response.last_page,
        path: response.path,
        per_page: response.per_page,
        to: response.to,
        total: response.total,
      };

      return response;
    } catch (err) {
      console.error("❌ Error in fetchMessages:", err);
      messagesError.value =
        err instanceof Error ? err.message : "Unknown error occurred";
      throw err;
    } finally {
      loadingRef.value = false;
    }
  };

  // Wrapper for initial fetch
  const fetchCommunicationMessages = async (
    entity: EntityType,
    id: number,
    params?: { page?: number; search?: string },
  ) => fetchMessages(entity, id, params, isFetchingMessages);

  // Wrapper for loading more messages
  const loadMoreMessages = async (entity: EntityType, id: number) => {
    if (!hasMoreMessages.value || isLoadingMoreMessages.value) return;
    const nextPage = messagesMeta.value
      ? messagesMeta.value.current_page + 1
      : 2;
    return fetchMessages(
      entity,
      id,
      { ...messagesFilters.value, page: nextPage },
      isLoadingMoreMessages,
    );
  };

  const resetMessagesPagination = () => {
    messagesMeta.value = null;
    messagesFilters.value = {
      page: 1,
      search: "",
    };
  };

  const setMessagesSearchFilter = async (
    entity: EntityType,
    id: number,
    search: string,
  ) => {
    messagesFilters.value = {
      page: 1,
      search,
    };

    return fetchCommunicationMessages(entity, id, messagesFilters.value);
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

  const addMessageToConversation = (message: ApiMessageItem) => {
    const conversationId = message.client_id || message.lead_id;

    if (
      activeConversationInfo.value &&
      activeConversationInfo.value.id === conversationId
    ) {
      if (!activeConversationInfo.value.messages) {
        activeConversationInfo.value.messages = [];
      }
      activeConversationInfo.value.messages.unshift(message);
    } else {
      //  todo:
      //  * find conversation in list
      //  * or fetch it if not loaded
      //  * lift conversation to top of list
      //  * add message to conversation, update new message count
    }
  };

  // Initialize Pusher
  const { bindEvent } = usePusher();
  bindEvent("e-chat-notification", "new-message", (data) => {
    addMessageToConversation(data);
  });

  const initializeRouteWatchers = () => {
    watch(
      () => route.params,
      async (newParams, oldParams) => {
        if (
          newParams.id !== oldParams?.id ||
          newParams.entity !== oldParams?.entity
        ) {
          const { id, entity } = newParams;

          if (id && entity) {
            const entityType = entity as EntityType;
            const conversationId = Number(id);

            try {
              await fetchConversationById(entityType, conversationId);
              messagesMeta.value = null;
              await fetchCommunicationMessages(entityType, conversationId, {
                page: 1,
              });
            } catch (err) {
              console.error("❌ Error fetching conversation from route:", err);
            }
          } else {
            activeConversationInfo.value = null;
            messagesMeta.value = null;
          }
        }
      },
      { immediate: true },
    );
  };

  const updateConversation = async (
    entity: EntityType,
    id: number,
    data: Partial<ApiCommunicationLeadFull | ApiCommunicationClientFull>,
  ) => {
    await conversationsService.updateConversation(entity, id, data);
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
    isFetchingMessages,
    isLoadingMoreMessages,
    messagesError,
    messagesMeta,
    messagesFilters,
    filters,
    activeConversationInfo,
    isFetchingActiveConversationInfo,

    // Getters
    hasMoreLeads,
    hasMoreClients,
    hasMore,
    hasMoreMessages,
    allCommunications,

    // Actions
    fetchCommunications,
    loadMoreCommunications,
    setSearchFilter,
    setUserFilter,
    resetFilters,
    fetchConversationById,
    fetchCommunicationMessages,
    loadMoreMessages,
    resetMessagesPagination,
    setMessagesSearchFilter,
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
    updateConversation,

    initializeRouteWatchers,
  };
});

export default useConversationsStore;
