import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import conversationsService from "./conversations-service";
import type {
  ConversationParams,
  MessageParams,
} from "./conversations-service";
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
import { useAuthStore } from "@src/features/auth/store/auth-store";

export const useConversationsStore = defineStore("conversations", () => {
  const route = useRoute();
  const authStore = useAuthStore();

  const conversations = ref<Record<EntityType, IConversation[]>>({
    leads: [],
    clients: [],
    suppliers: [],
  });

  const meta = ref<Record<EntityType, ApiResponseMeta | null>>({
    leads: null,
    clients: null,
    suppliers: null,
  });

  const loading = ref<Record<EntityType, boolean>>({
    leads: false,
    clients: false,
    suppliers: false,
  });

  const errors = ref<Record<EntityType, string | null>>({
    leads: null,
    clients: null,
    suppliers: null,
  });

  const activeConversation = ref<ApiCommunicationEntityFull | null>(null);
  const isLoadingConversation = ref(false);
  const isLoadingMessages = ref(false);
  const isLoadingMoreMessages = ref(false);
  const messagesError = ref<string | null>(null);
  const messagesMeta = ref<ApiResponseMeta | null>(null);

  const filters = ref<ConversationParams>({
    page: 1,
    search: "",
    user_id: undefined,
  });

  const messagesFilters = ref<MessageParams>({
    page: 1,
    search: "",
  });

  const hasMore = computed(() => (entity: EntityType) => {
    const entityMeta = meta.value[entity];
    if (!entityMeta) return false;
    return entityMeta.current_page < entityMeta.last_page;
  });

  const hasMoreMessages = computed(() => {
    if (!messagesMeta.value) return false;
    return messagesMeta.value.current_page < messagesMeta.value.last_page;
  });

  const allConversations = computed(() => {
    return [
      ...conversations.value.leads,
      ...conversations.value.clients,
      ...conversations.value.suppliers,
    ];
  });

  const currentConversationItem = computed(() => {
    const { entity, id, contactId } = route.params;
    if (!entity || !id || !contactId) return null;

    const entityType = entity as EntityType;
    const conversationId = Number(id);
    const contactIdNum = Number(contactId);

    const conversation = conversations.value[entityType]?.find(
      (item) => item.id === conversationId,
    );

    if (!conversation) return null;

    const contact = conversation.contacts?.find(
      (contact) => contact.id === contactIdNum,
    );

    return contact ? { conversation, contact, entity: entityType } : null;
  });

  /**
   * Fetch conversations for specific entity
   * @example await fetch('leads', { page: 1, search: 'john' })
   */
  const fetch = async (entity: EntityType, params?: ConversationParams) => {
    try {
      loading.value[entity] = true;
      errors.value[entity] = null;

      const mergedParams = { ...filters.value, ...params };
      if (params) filters.value = mergedParams;

      const response = await conversationsService.getConversations(
        entity,
        mergedParams,
      );
      const entityData = response[entity];

      if (!entityData) {
        throw new Error(`No data found for entity: ${entity}`);
      }

      if (!mergedParams.page || mergedParams.page === 1) {
        conversations.value[entity] = entityData.data.map(
          adaptApiCommunicationToIConversation,
        );
      } else {
        conversations.value[entity] = [
          ...conversations.value[entity],
          ...entityData.data.map(adaptApiCommunicationToIConversation),
        ];
      }

      meta.value[entity] = entityData.meta;
      return response;
    } catch (err) {
      errors.value[entity] =
        err instanceof Error ? err.message : "Unknown error occurred";
      throw err;
    } finally {
      loading.value[entity] = false;
    }
  };

  /**
   * Load more conversations for entity
   * @example await loadMore('leads')
   */
  const loadMore = async (entity: EntityType) => {
    if (!hasMore.value(entity) || loading.value[entity]) return;

    const nextPage = filters.value.page ? filters.value.page + 1 : 2;
    return fetch(entity, { ...filters.value, page: nextPage });
  };

  /**
   * Search conversations
   * @example await search('leads', 'john doe')
   */
  const search = async (entity: EntityType, query: string) => {
    filters.value = { ...filters.value, search: query, page: 1 };
    return fetch(entity, filters.value);
  };

  /**
   * Filter by user
   * @example await filterByUser('leads', 123)
   */
  const filterByUser = async (entity: EntityType, userId?: number) => {
    filters.value = { ...filters.value, user_id: userId, page: 1 };
    return fetch(entity, filters.value);
  };

  /**
   * Reset filters
   * @example await resetFilters('leads')
   */
  const resetFilters = async (entity: EntityType) => {
    filters.value = { page: 1, search: "", user_id: undefined };
    return fetch(entity, filters.value);
  };

  /**
   * Fetch conversation by ID
   * @example await fetchConversation('leads', 123)
   */
  const fetchConversation = async (entity: EntityType, id: number) => {
    isLoadingConversation.value = true;
    activeConversation.value = null;

    try {
      const conversation =
        await conversationsService.getConversationById<ApiCommunicationEntityFull>(
          entity,
          id,
        );
      conversation.messages = [];
      activeConversation.value = conversation;
      return conversation;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Unknown error occurred";
      errors.value[entity] = error;
      throw err;
    } finally {
      isLoadingConversation.value = false;
    }
  };

  /**
   * Fetch messages for conversation
   * @example await fetchMessages('leads', 123, 456, { page: 1 })
   */
  const fetchMessages = async (
    entity: EntityType,
    id: number,
    contactId: number,
    params?: MessageParams,
    loadingRef = isLoadingMessages,
  ) => {
    if (loadingRef.value) return;

    try {
      loadingRef.value = true;
      messagesError.value = null;

      const mergedParams = { ...messagesFilters.value, ...params };
      if (params) messagesFilters.value = mergedParams;

      const response = await conversationsService.getMessages(
        entity,
        id,
        contactId,
        mergedParams,
      );

      if (activeConversation.value) {
        if (!mergedParams.page || mergedParams.page === 1) {
          activeConversation.value.messages = response.data;
        } else {
          activeConversation.value.messages = [
            ...activeConversation.value.messages,
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

  /**
   * Load more messages
   * @example await loadMoreMessages('leads', 123, 456)
   */
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

  /**
   * Search messages
   * @example await searchMessages('leads', 123, 456, 'hello')
   */
  const searchMessages = async (
    entity: EntityType,
    id: number,
    contactId: number,
    query: string,
  ) => {
    messagesFilters.value = { page: 1, search: query };
    return fetchMessages(entity, id, contactId, messagesFilters.value);
  };

  /**
   * Reset messages pagination
   */
  const resetMessagesPagination = () => {
    messagesMeta.value = null;
    messagesFilters.value = { page: 1, search: "" };
  };

  /**
   * Update conversation
   * @example await updateConversation('leads', 123, { status_id: 2 })
   */
  const updateConversation = async (
    entity: EntityType,
    id: number,
    data: Partial<ApiCommunicationEntityFull>,
  ) => {
    await conversationsService.updateConversation(entity, id, data);
  };

  /**
   * Update lead
   * @example await updateLead(123, { name: 'Updated Name' })
   */
  const updateLead = async (id: number, leadData: UpdateLeadRequest) => {
    return await conversationsService.updateLead(id, leadData);
  };

  /**
   * Change lead status
   * @example await changeLeadStatus(123, 2)
   */
  const changeLeadStatus = async (id: number, status: number) => {
    await conversationsService.changeLeadStatus(id, status);
  };

  const findConversation = (entityType: EntityType, entityId: number) => {
    return conversations.value[entityType]?.find(
      (item) => item.id === entityId,
    );
  };

  const moveConversationToTop = (
    entityType: EntityType,
    conversationId: number,
  ) => {
    const list = conversations.value[entityType];
    const index = list.findIndex((item) => item.id === conversationId);
    if (index > 0) {
      const conversation = list.splice(index, 1)[0];
      list.unshift(conversation);
    }
  };

  const updateUnreadCount = (conversation: IConversation, increment = 1) => {
    conversation.unread = (conversation.unread || 0) + increment;
  };

  const resetUnreadCount = (entityType: EntityType, entityId: number) => {
    const conversation = findConversation(entityType, entityId);
    if (conversation) {
      conversation.unread = 0;
    }
  };

  const loadMissingConversation = async (
    entityType: EntityType,
    entityId: number,
    contactId: number,
  ): Promise<IConversation | null> => {
    try {
      const conversationInfo =
        await conversationsService.getConversationContactInfo(
          entityType,
          entityId,
          contactId,
        );

      const adaptedConversation = adaptApiCommunicationToIConversation({
        ...conversationInfo,
        entity: entityType,
      } as any);

      conversations.value[entityType].unshift(adaptedConversation);
      return adaptedConversation;
    } catch (error) {
      console.error("Error loading missing conversation:", error);
      return null;
    }
  };

  /**
   * Check if message is sent by current user (outgoing message)
   */
  const isOutgoingMessage = (message: ApiMessageItem): boolean => {
    return message.user_id === authStore.currentUser?.id;
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

    const isOutgoing = isOutgoingMessage(message);

    // 1. If current chat is open
    if (activeConversation.value && activeConversation.value.id === entityId) {
      if (!activeConversation.value.messages) {
        activeConversation.value.messages = [];
      }
      activeConversation.value.messages.unshift(message);

      const conversation = findConversation(entityType, entityId);
      if (conversation) {
        if (!isOutgoing) {
          updateUnreadCount(conversation);
        }
        moveConversationToTop(entityType, entityId);
      }
      return;
    }

    // 2. If chat is in the list
    const conversation = findConversation(entityType, entityId);
    if (conversation) {
      if (!isOutgoing) {
        updateUnreadCount(conversation);
      } else {
        conversation.unread = 0;
      }
      moveConversationToTop(entityType, entityId);
      return;
    }

    // 3. Load missing conversation (only for incoming messages)
    if (!isOutgoing) {
      const loadedConversation = await loadMissingConversation(
        entityType,
        entityId,
        contactId,
      );
      if (loadedConversation) {
        updateUnreadCount(loadedConversation);
      }
    }
  };

  const playNotificationSound = (isOutgoing = false) => {
    try {
      const soundFile = isOutgoing
        ? "/sound/out-message.mp3"
        : "/sound/new-message.mp3";
      const audio = new Audio(soundFile);
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn("Audio play was prevented:", error);
      });
    } catch (error) {
      console.warn("Error playing notification sound:", error);
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
        const messageItem = await conversationsService.getMessageById(data.id);
        console.log("Fetched message item:", messageItem);

        const isOutgoing = isOutgoingMessage(messageItem);
        await addMessageToConversation(messageItem);
        playNotificationSound(isOutgoing);
      } catch (error) {
        console.error("Error fetching message item from Pusher event:", error);
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
              await fetchConversation(entityType, conversationId);
              messagesMeta.value = null;
              await fetchMessages(entityType, conversationId, contactId, {
                page: 1,
              });
            } catch (err) {
              console.error("❌ Error fetching conversation from route:", err);
            }
          } else {
            activeConversation.value = null;
            messagesMeta.value = null;
          }
        }
      },
      { immediate: true },
    );
  };
  return {
    // State
    conversations,
    meta,
    loading,
    errors,
    activeConversation,
    isLoadingConversation,
    isLoadingMessages,
    isLoadingMoreMessages,
    messagesError,
    messagesMeta,
    messagesFilters,
    filters,

    // Getters
    hasMore,
    hasMoreMessages,
    allConversations,
    currentConversationItem,

    // Actions - Conversations
    fetch,
    loadMore,
    search,
    filterByUser,
    resetFilters,

    // Actions - Messages
    fetchConversation,
    fetchMessages,
    loadMoreMessages,
    searchMessages,
    resetMessagesPagination,

    // Actions - Entity Management
    updateConversation,
    updateLead,
    changeLeadStatus,

    // Actions - Unread Management
    resetUnreadCount,

    // Initialization
    initializeRouteWatchers,
  };
});

export default useConversationsStore;
