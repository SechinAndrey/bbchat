import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import conversationsService from "./conversations-service";
import type { GetCommunicationsParams } from "./conversations-service";
import type { EntityType } from "@src/shared/types/common";
import type {
  ApiResponseMeta,
  ApiCommunicationEntityFull,
  ApiMessageItem,
  UpdateLeadRequest,
} from "@src/api/types";
import type { IConversation } from "@src/shared/types/types";
import { adaptApiCommunicationToIConversation } from "@src/api/communication-adapters";
import { usePusher } from "@src/shared/composables/usePusher";

export const useConversationsStore = defineStore("conversations", () => {
  // State
  const leads = ref<IConversation[]>([]);
  const clients = ref<IConversation[]>([]);
  const suppliers = ref<IConversation[]>([]);
  const leadsMeta = ref<ApiResponseMeta | null>(null);
  const clientsMeta = ref<ApiResponseMeta | null>(null);
  const suppliersMeta = ref<ApiResponseMeta | null>(null);
  const isLoading = ref(false);

  const error = ref<string | null>(null);
  const activeConversationInfo = ref<ApiCommunicationEntityFull | null>(null);
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
  const isLoadingSuppliers = ref(false);
  const leadsError = ref<string | null>(null);
  const clientsError = ref<string | null>(null);
  const suppliersError = ref<string | null>(null);
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

  const hasMoreSuppliers = computed(() => {
    if (!suppliersMeta.value) return false;
    return suppliersMeta.value.current_page < suppliersMeta.value.last_page;
  });

  const ENTITY_STORE_CONFIG = {
    leads: {
      dataRef: leads,
      metaRef: leadsMeta,
      loadingRef: isLoadingLeads,
      errorRef: leadsError,
      hasMoreRef: hasMoreLeads,
      serviceMethod: "getLeadsContactsConversations" as const,
    },
    clients: {
      dataRef: clients,
      metaRef: clientsMeta,
      loadingRef: isLoadingClients,
      errorRef: clientsError,
      hasMoreRef: hasMoreClients,
      serviceMethod: "getClientsContactsConversations" as const,
    },
    suppliers: {
      dataRef: suppliers,
      metaRef: suppliersMeta,
      loadingRef: isLoadingSuppliers,
      errorRef: suppliersError,
      hasMoreRef: hasMoreSuppliers,
      serviceMethod: "getSuppliersContactsConversations" as const,
    },
  };

  const hasMore = computed(
    () => hasMoreLeads.value || hasMoreClients.value || hasMoreSuppliers.value,
  );

  const hasMoreMessages = computed(() => {
    if (!messagesMeta.value) return false;
    return messagesMeta.value.current_page < messagesMeta.value.last_page;
  });

  const allCommunications = computed(() => {
    return [...leads.value, ...clients.value, ...suppliers.value];
  });

  // Current conversation item based on route params
  const currentConversationsItem = computed(() => {
    const { entity, id, contactId } = route.params;

    if (!entity || !id || !contactId) return null;

    const entityType = entity as EntityType;
    const conversationId = Number(id);
    const contactIdNum = Number(contactId);

    const config = ENTITY_STORE_CONFIG[entityType];
    if (!config) return null;

    const conversation = config.dataRef.value.find(
      (item) => item.id === conversationId,
    );

    if (!conversation) return null;

    const contact = conversation.contacts?.find(
      (contact) => contact.id === contactIdNum,
    );

    return contact ? { conversation, contact, entity: entityType } : null;
  });

  const fetchEntityCommunications = async (
    entity: EntityType,
    params?: GetCommunicationsParams,
  ) => {
    const config = ENTITY_STORE_CONFIG[entity];

    try {
      config.loadingRef.value = true;
      config.errorRef.value = null;

      const mergedParams = { ...filters.value, ...params };
      if (params) {
        filters.value = mergedParams;
      }

      const response =
        await conversationsService[config.serviceMethod](mergedParams);
      const entityData = response[entity];

      if (!entityData) {
        throw new Error(`No data found for entity: ${entity}`);
      }

      if (mergedParams.page === 1) {
        config.dataRef.value = entityData.data.map(
          adaptApiCommunicationToIConversation,
        );
      } else {
        config.dataRef.value = [
          ...config.dataRef.value,
          ...entityData.data.map(adaptApiCommunicationToIConversation),
        ];
      }

      config.metaRef.value = entityData.meta;
      return response;
    } catch (err) {
      config.errorRef.value =
        err instanceof Error ? err.message : "Unknown error occurred";
      throw err;
    } finally {
      config.loadingRef.value = false;
    }
  };

  const loadMoreEntity = async (entity: EntityType) => {
    const config = ENTITY_STORE_CONFIG[entity];

    if (!config.hasMoreRef.value || config.loadingRef.value) return;

    const nextPage = filters.value.page ? filters.value.page + 1 : 2;
    return fetchEntityCommunications(entity, {
      ...filters.value,
      page: nextPage,
    });
  };

  // Actions
  const fetchConversationById = async (entity: EntityType, id: number) => {
    isFetchingActiveConversationInfo.value = true;
    activeConversationInfo.value = null;
    try {
      const conversation =
        await conversationsService.getCommunicationEntityById<ApiCommunicationEntityFull>(
          entity,
          id,
        );
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
        suppliers.value = response.suppliers.data.map(
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
        suppliers.value = [
          ...suppliers.value,
          ...response.suppliers.data.map(adaptApiCommunicationToIConversation),
        ];
      }

      // Store pagination metadata
      leadsMeta.value = response.leads.meta;
      clientsMeta.value = response.clients.meta;
      suppliersMeta.value = response.suppliers.meta;

      return response;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Unknown error occurred";
      throw err;
    } finally {
      isLoading.value = false;
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

  const fetchMessages = async (
    entity: EntityType,
    id: number,
    contactId: number,
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
        contactId,
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
    contactId: number,
    params?: { page?: number; search?: string },
  ) => fetchMessages(entity, id, contactId, params, isFetchingMessages);

  // Wrapper for loading more messages
  const loadMoreMessages = async (
    entity: EntityType,
    id: number,
    contactId: number,
  ) => {
    if (!hasMoreMessages.value || isLoadingMoreMessages.value) return;
    const nextPage = messagesMeta.value
      ? messagesMeta.value.current_page + 1
      : 2;
    return fetchMessages(
      entity,
      id,
      contactId,
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
    contactId: number,
    search: string,
  ) => {
    messagesFilters.value = {
      page: 1,
      search,
    };

    return fetchCommunicationMessages(
      entity,
      id,
      contactId,
      messagesFilters.value,
    );
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

  const setEntitySearchFilter = (entity: EntityType, search: string) => {
    // Reset to page 1 when changing search
    filters.value = {
      ...filters.value,
      search,
      page: 1,
    };

    return fetchEntityCommunications(entity, filters.value);
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

  const setEntityUserFilter = (entity: EntityType, userId?: number) => {
    // Reset to page 1 when changing user filter
    filters.value = {
      ...filters.value,
      user_id: userId,
      page: 1,
    };

    return fetchEntityCommunications(entity, filters.value);
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

  const resetEntityFilters = (entity: EntityType) => {
    filters.value = getDefaultFilters();
    return fetchEntityCommunications(entity, filters.value);
  };

  const findConversationInLists = (
    entityType: EntityType,
    entityId: number,
  ): { conversation: IConversation; listRef: typeof leads } | null => {
    const config = ENTITY_STORE_CONFIG[entityType];
    if (!config) return null;

    const conversation = config.dataRef.value.find(
      (item) => item.id === entityId,
    );

    return conversation ? { conversation, listRef: config.dataRef } : null;
  };

  const moveConversationToTop = (
    listRef: typeof leads,
    conversationId: number,
  ) => {
    const index = listRef.value.findIndex((item) => item.id === conversationId);
    if (index > 0) {
      const conversation = listRef.value.splice(index, 1)[0];
      listRef.value.unshift(conversation);
    }
  };

  const updateUnreadCount = (conversation: IConversation, increment = 1) => {
    conversation.unread = (conversation.unread || 0) + increment;
  };

  const loadMissingConversation = async (
    entityType: EntityType,
    entityId: number,
    contactId: number,
  ): Promise<IConversation | null> => {
    try {
      const conversationInfo =
        await conversationsService.getCommunicationContactInfo(
          entityType,
          entityId,
          contactId,
        );

      const adaptedConversation = adaptApiCommunicationToIConversation({
        ...conversationInfo,
        entity: entityType,
      } as any);

      const config = ENTITY_STORE_CONFIG[entityType];
      if (config) {
        config.dataRef.value.unshift(adaptedConversation);
        return adaptedConversation;
      }

      return null;
    } catch (error) {
      console.error("Error loading missing conversation:", error);
      return null;
    }
  };

  const addMessageToConversation = async (message: ApiMessageItem) => {
    const entityId =
      message.client_id || message.lead_id || message.supplier_id;
    const contactId =
      message.client_contact_id ||
      message.lead_contact_id ||
      message.supplier_contact_id;

    if (!entityId || !contactId) {
      console.warn("Message missing entity or contact ID:", message);
      return;
    }

    let entityType: EntityType;
    if (message.client_id) entityType = "clients";
    else if (message.lead_id) entityType = "leads";
    else if (message.supplier_id) entityType = "suppliers";
    else {
      console.warn("Unknown entity type for message:", message);
      return;
    }

    // 1. if current chat is open
    if (
      activeConversationInfo.value &&
      activeConversationInfo.value.id === entityId
    ) {
      if (!activeConversationInfo.value.messages) {
        activeConversationInfo.value.messages = [];
      }
      activeConversationInfo.value.messages.unshift(message);

      const found = findConversationInLists(entityType, entityId);
      if (found) {
        updateUnreadCount(found.conversation);
        moveConversationToTop(found.listRef, entityId);
      }
      return;
    }

    // 2. if chat is in the list
    const found = findConversationInLists(entityType, entityId);
    if (found) {
      updateUnreadCount(found.conversation);
      moveConversationToTop(found.listRef, entityId);
      return;
    }

    // 3. load missing conversation
    const loadedConversation = await loadMissingConversation(
      entityType,
      entityId,
      contactId,
    );

    if (loadedConversation) {
      updateUnreadCount(loadedConversation);
      console.log(
        `Loaded missing conversation for ${entityType}:${entityId}`,
        loadedConversation,
      );
    }
  };

  const resetUnreadCount = (entityType: EntityType, entityId: number) => {
    const found = findConversationInLists(entityType, entityId);
    if (found) {
      found.conversation.unread = 0;
    }
  };

  const { bindEvent } = usePusher();
  bindEvent(
    "e-chat-notification",
    "new-message",
    async (data: {
      id: number;
      contragent_contact_id: number | null;
      contragent_id: number | null;
      contragent_type: EntityType | null;
    }) => {
      try {
        const communicationItem =
          await conversationsService.getCommunicationItemById(data.id);
        console.log("Fetched communication item:", communicationItem);

        await addMessageToConversation(communicationItem);
      } catch (error) {
        console.error(
          "Error fetching communication item from Pusher event:",
          error,
        );
      }
    },
  );

  const initializeRouteWatchers = () => {
    watch(
      () => route.params,
      async (newParams, oldParams) => {
        if (
          newParams.id !== oldParams?.id ||
          newParams.entity !== oldParams?.entity ||
          newParams.contactId !== oldParams?.contactId
        ) {
          const { id, entity } = newParams;

          if (id && entity) {
            const entityType = entity as EntityType;
            const conversationId = Number(id);
            const contactId = Number(newParams.contactId);

            try {
              await fetchConversationById(entityType, conversationId);
              messagesMeta.value = null;
              await fetchCommunicationMessages(
                entityType,
                conversationId,
                contactId,
                {
                  page: 1,
                },
              );
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
    data: Partial<ApiCommunicationEntityFull>,
  ) => {
    await conversationsService.updateConversation(entity, id, data);
  };

  const changeStatus = async (id: number, status: number) => {
    await conversationsService.changeStatus(id, status);
  };

  const updateLead = async (id: number, leadData: UpdateLeadRequest) => {
    return await conversationsService.updateLead(id, leadData);
  };

  return {
    // State
    leads,
    clients,
    suppliers,
    leadsMeta,
    clientsMeta,
    suppliersMeta,
    isLoading,
    isLoadingLeads,
    isLoadingClients,
    isLoadingSuppliers,
    error,
    leadsError,
    clientsError,
    suppliersError,
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
    hasMoreSuppliers,
    hasMore,
    hasMoreMessages,
    allCommunications,
    currentConversationsItem,

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
    fetchEntityCommunications,
    loadMoreEntity,
    setEntitySearchFilter,
    setEntityUserFilter,
    resetEntityFilters,
    updateConversation,
    changeStatus,
    updateLead,
    resetUnreadCount,

    initializeRouteWatchers,
  };
});

export default useConversationsStore;
