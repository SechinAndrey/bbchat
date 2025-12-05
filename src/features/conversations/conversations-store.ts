import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import conversationsService from "./conversations-service";
import type {
  ConversationParams,
  MessageParams,
} from "./conversations-service";
import type { EntityType, ContragentType } from "@src/shared/types/common";
import { CONTRAGENT_TO_ENTITY_MAP } from "@src/shared/types/common";
import type {
  ApiResponseMeta,
  ApiCommunicationEntity,
  ApiCommunicationEntityFull,
  ApiCommunicationLead,
  ApiMessageItem,
  UpdateLeadRequest,
} from "@src/api/types";
import type { SynchronizeResponse } from "@src/shared/services/lead-actions-service";
import type { IConversation } from "@src/shared/types/types";
import { adaptApiCommunicationToIConversation } from "@src/api/communication-adapters";
import useStore from "@src/shared/store/store";
import { useEventBus } from "@vueuse/core";
import { usePusher } from "@src/shared/composables/usePusher";
import contactsService from "@src/api/contacts-service";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useGlobalDataStore } from "@src/shared/store/global-data-store";

export interface TempMessage {
  clientMessageUid: string;
  message: string;
  fileUrl?: string;
  messengerId: number;
  status: "sending" | "sent" | "error";
  timestamp: Date;
  contragentType: ContragentType;
  contragentId: number;
  phone: string;
  contactId: number;
  replyMessage?: ApiMessageItem | null;
  error?: string;
}

export const useConversationsStore = defineStore("conversations", () => {
  const route = useRoute();
  const store = useStore();
  const authStore = useAuthStore();
  const globalDataStore = useGlobalDataStore();
  const eventBus = useEventBus("chat:messages-loaded");

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

  // UI Indicators for unread messages in filtered views (runtime state, resets on page refresh)
  const unreadByEntity = ref({
    leads: false,
    clients: false,
    suppliers: false,
  });

  const unreadByManager = ref<Record<number, boolean>>({});

  const hasAnyUnreadForManagers = computed(() =>
    Object.values(unreadByManager.value).some((v) => v),
  );

  // Temporary messages for optimistic updates
  const tempMessages = ref<TempMessage[]>([]);

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

      let response;
      let entityData;

      if (store.isWidget) {
        response = await conversationsService.getConversationsForEntity(
          store.widget.entity,
          store.widget.entityId,
          mergedParams,
        );
        entityData = response;
      } else {
        response = await conversationsService.getConversations(
          entity,
          mergedParams,
        );
        entityData = response[entity];
      }

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
          activeConversation.value.messages = response.data.reverse();
        } else {
          activeConversation.value.messages = [
            ...response.data.reverse(),
            ...activeConversation.value.messages,
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
  const changeLeadStatus = async (id: number, newStatusId: number) => {
    await conversationsService.changeLeadStatus(id, newStatusId);

    if (activeConversation.value && activeConversation.value.id === id) {
      const newStatus = globalDataStore.getKanbanStatusById(newStatusId);
      const oldStatusId = activeConversation.value.status_id || 0;
      const oldStatus = globalDataStore.getKanbanStatusById(oldStatusId);

      if (newStatus && authStore.currentUser) {
        const newStatusLogItem = {
          id: Date.now(), // Temporary ID
          lead_id: id,
          user_id: authStore.currentUser.id,
          old_status_id: oldStatusId,
          new_status_id: newStatusId,
          rejection_id: null,
          rejection_reason_id: null,
          comment: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          old_status: oldStatus || {
            id: oldStatusId,
            name: "",
            for_hunters: false,
            for_all: false,
            avaliable_statuses: "",
          },
          new_status: newStatus,
          user: {
            id: authStore.currentUser.id,
            role_id: authStore.currentUser.roleId,
            name: `${authStore.currentUser.firstName} ${authStore.currentUser.lastName}`,
            email: authStore.currentUser.email,
          },
        };

        if (!activeConversation.value.status_log) {
          activeConversation.value.status_log = [];
        }
        activeConversation.value.status_log.unshift(newStatusLogItem);
        activeConversation.value.status_id = newStatusId;
      }
    }
  };

  const findConversation = (
    entityType: EntityType,
    entityId: number,
    contactId: number,
  ) => {
    return conversations.value[entityType]?.find(
      (item) => item.id === entityId && item.contact.id === contactId,
    );
  };

  const moveConversationToTop = (
    entityType: EntityType,
    conversationId: number,
    contactId: number,
  ) => {
    const list = conversations.value[entityType];
    const index = list.findIndex(
      (item) => item.id === conversationId && item.contact.id === contactId,
    );
    if (index > 0) {
      const conversation = list.splice(index, 1)[0];
      list.unshift(conversation);
    }
  };

  const updateUnreadCount = (conversation: IConversation, increment = 1) => {
    conversation.unread = (conversation.unread || 0) + increment;
  };

  const resetUnreadCount = (
    entityType: EntityType,
    entityId: number,
    contactId: number,
  ) => {
    const conversation = findConversation(entityType, entityId, contactId);
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
   * Add new conversation to the top of the list
   * @example addNewConversation('leads', newLeadData)
   */
  const addNewConversation = (
    entityType: EntityType,
    entityData: ApiCommunicationLead,
  ): IConversation => {
    const adaptedConversation = adaptApiCommunicationToIConversation({
      ...entityData,
      entity: entityType,
    } as any);
    conversations.value[entityType].unshift(adaptedConversation);
    return adaptedConversation;
  };

  const isOutgoingMessage = (message: ApiMessageItem): boolean => {
    return !!message.user_id;
  };

  /**
   * Mark message as read by contact
   * @param messageId - ID of the message that was read
   */
  const markMessageAsReadByContact = (messageId: number) => {
    // Update in active conversation messages
    if (activeConversation.value?.messages) {
      const message = activeConversation.value.messages.find(
        (msg) => msg.id === messageId,
      );
      if (message) {
        message.viewed_by_contact = 1;
      }
    }

    // Update in conversations list
    Object.keys(conversations.value).forEach((entityType) => {
      const entity = entityType as EntityType;
      conversations.value[entity].forEach((conversation) => {
        if (conversation.messages) {
          const message = conversation.messages.find(
            (msg) => msg.id === messageId,
          );
          if (message) {
            message.viewed_by_contact = 1;
          }
        }
      });
    });
  };

  /**
   * Delete contact from entity
   * @example await deleteContact('leads', 123, 456)
   */
  const deleteContact = async (
    entity: EntityType,
    entityId: number,
    contactId: number,
  ) => {
    await contactsService.deleteContact(entity, entityId, contactId);

    // Reload conversation to update contacts list
    const updatedConversation = await fetchConversation(entity, entityId);

    if (updatedConversation && conversations.value[entity]) {
      conversations.value[entity] = conversations.value[entity].filter(
        (conv) => conv.contact.id !== contactId,
      );

      if (
        updatedConversation.contacts &&
        updatedConversation.contacts.length > 0
      ) {
        const existingContactIds = new Set(
          conversations.value[entity].map((conv) => conv.contact.id),
        );

        updatedConversation.contacts.forEach((apiContact) => {
          if (!existingContactIds.has(apiContact.id)) {
            const tempEntity = {
              ...updatedConversation,
              contacts: [apiContact],
            } as unknown as ApiCommunicationEntity;

            const newConversation =
              adaptApiCommunicationToIConversation(tempEntity);
            conversations.value[entity].unshift(newConversation);
          }
        });
      }
    }
  };

  const markMessageAsDeleted = (messageId: number) => {
    if (activeConversation.value?.messages) {
      const message = activeConversation.value.messages.find(
        (msg) => msg.id === messageId,
      );
      if (message) {
        message.deleted_at = new Date().toISOString();
      }
    }
  };

  // Actions to manage UI indicators
  const setEntityIndicator = (entity: EntityType, value: boolean) => {
    unreadByEntity.value[entity] = value;
  };

  const setManagerIndicator = (userId: number, value: boolean) => {
    unreadByManager.value[userId] = value;
  };

  const clearEntityIndicator = (entity: EntityType) => {
    unreadByEntity.value[entity] = false;
  };

  const clearManagerIndicator = (userId: number) => {
    delete unreadByManager.value[userId];
  };

  const clearAllManagerIndicators = () => {
    unreadByManager.value = {};
  };

  const addMessageToConversation = async (
    message: ApiMessageItem,
    messageUserId?: number | string,
  ) => {
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
    const actualUserId =
      messageUserId !== undefined ? messageUserId : message.user_id;

    if (!isOutgoing) {
      const currentUser = authStore.currentUser;
      if (currentUser) {
        let shouldPlaySound = false;

        if (currentUser.roleId !== 1) {
          shouldPlaySound =
            actualUserId === currentUser.id ||
            actualUserId === "user-not-selected";
        } else {
          if (filters.value.user_id === undefined) {
            shouldPlaySound = true;
          } else {
            shouldPlaySound =
              actualUserId === filters.value.user_id ||
              actualUserId === "user-not-selected";
          }
        }

        if (shouldPlaySound) {
          playNotificationSound(false);
        }
      }
    }

    const isActiveChat =
      activeConversation.value &&
      activeConversation.value.id === entityId &&
      activeConversation.value.contacts?.some((c) => c.id === contactId);

    if (isActiveChat && activeConversation.value) {
      if (!activeConversation.value.messages) {
        activeConversation.value.messages = [];
      }
      activeConversation.value.messages.push(message);

      const conversation = findConversation(entityType, entityId, contactId);
      if (conversation) {
        if (!conversation.messages) {
          conversation.messages = [];
        }
        conversation.messages.push(message);

        if (!isOutgoing) {
          updateUnreadCount(conversation);
        }
        moveConversationToTop(entityType, entityId, contactId);
      }
      return;
    }

    const conversation = findConversation(entityType, entityId, contactId);
    if (conversation) {
      if (!conversation.messages) {
        conversation.messages = [];
      }
      conversation.messages.push(message);

      if (!isOutgoing) {
        updateUnreadCount(conversation);
      } else {
        conversation.unread = 0;
      }
      moveConversationToTop(entityType, entityId, contactId);
      return;
    }

    if (!isOutgoing) {
      const currentEntity = route.params.entity as EntityType;

      if (currentEntity !== entityType) {
        return;
      }

      if (
        authStore.currentUser?.roleId === 1 &&
        filters.value.user_id !== undefined
      ) {
        if (actualUserId !== filters.value.user_id) {
          return;
        }
      }

      if (filters.value.search) {
        return;
      }

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

  const addTempMessage = (tempMessage: TempMessage) => {
    tempMessages.value.push(tempMessage);
  };

  const updateTempMessageStatus = (
    clientMessageUid: string,
    status: TempMessage["status"],
    error?: string,
  ) => {
    const message = tempMessages.value.find(
      (msg) => msg.clientMessageUid === clientMessageUid,
    );
    if (message) {
      message.status = status;
      if (error) message.error = error;
    }
  };

  const findAndRemoveTempMessage = (
    clientMessageUid: string,
  ): TempMessage | null => {
    const index = tempMessages.value.findIndex(
      (msg) => msg.clientMessageUid === clientMessageUid,
    );

    if (index !== -1) {
      const tempMessage = tempMessages.value[index];
      tempMessages.value.splice(index, 1);
      return tempMessage;
    }

    return null;
  };

  const handleNewMessage = async (
    messageId: number,
    userId?: number | string,
  ) => {
    try {
      const messageItem = await conversationsService.getMessageById(messageId);
      const isOutgoing = isOutgoingMessage(messageItem);

      const clientMessageUid =
        messageItem.client_message_uid ||
        messageItem.echat_messages?.client_message_uid ||
        messageItem.chaport_messages?.client_message_uid;

      if (isOutgoing && clientMessageUid) {
        const removedTempMessage = findAndRemoveTempMessage(clientMessageUid);
        if (removedTempMessage) {
          await addMessageToConversation(messageItem, userId);
        } else {
          console.warn(
            "⚠️ Could not find temp message with client_message_uid:",
            clientMessageUid,
            "- adding message anyway",
          );
          await addMessageToConversation(messageItem, userId);
        }
      } else {
        await addMessageToConversation(messageItem, userId);
      }
    } catch (error) {
      console.error("Error handling new message:", error);
    }
  };

  /**
   * Handle Chaport synchronization event (from API response or Pusher)
   * Can result in lead merge if phone already exists
   * @param data - Synchronize response data
   */
  const handleChaportSync = async (data: SynchronizeResponse) => {
    try {
      const { merge_info } = data;

      if (!merge_info || !activeConversation.value) {
        return;
      }

      const currentId = activeConversation.value.id;
      const currentEntity = activeConversation.value.entity;
      const isMerged = merge_info.from_lead_id === currentId;

      if (isMerged) {
        await fetch(currentEntity, { page: 1 });

        const targetEntity = CONTRAGENT_TO_ENTITY_MAP[merge_info.entity];
        if (targetEntity !== currentEntity) {
          await fetch(targetEntity, { page: 1 });
        }
      }
    } catch (error) {
      console.error("Error handling Chaport sync:", error);
    }
  };

  const getEntityIndicatorToShow = (data: {
    user_id: number | string;
    contragent_type: ContragentType | null;
  }): EntityType | null => {
    const currentUser = authStore.currentUser;
    if (!currentUser) return null;
    if (!data.contragent_type) return null;

    const currentEntity = route.params.entity as EntityType | undefined;
    const messageEntity = CONTRAGENT_TO_ENTITY_MAP[data.contragent_type];

    if (currentEntity === messageEntity) return null;

    if (currentUser.roleId !== 1) {
      if (data.user_id === currentUser.id) {
        return messageEntity;
      }
      return null;
    }

    if (
      filters.value.user_id === undefined ||
      filters.value.user_id === data.user_id
    ) {
      return messageEntity;
    }

    return null;
  };

  const getManagerIndicatorToShow = (data: {
    user_id: number | string;
    contragent_type: ContragentType | null;
  }): number | string | null => {
    const currentUser = authStore.currentUser;
    if (!currentUser) return null;
    if (currentUser.roleId !== 1) return null;

    const currentEntity = route.params.entity as EntityType | undefined;
    const messageEntity = data.contragent_type
      ? CONTRAGENT_TO_ENTITY_MAP[data.contragent_type]
      : null;

    if (
      filters.value.user_id === undefined &&
      currentEntity === messageEntity
    ) {
      return null;
    }

    if (filters.value.user_id !== undefined) {
      if (data.user_id !== filters.value.user_id) {
        return data.user_id;
      }
    }

    return null;
  };

  const { bindEvent } = usePusher();
  bindEvent(
    "e-chat-notification",
    "new-message",
    async (data: {
      id: number;
      contragent_contact_id: number | null;
      contragent_id: number | null;
      contragent_type: ContragentType | null;
      user_id: number | string;
    }) => {
      console.log("📨 Received Pusher new-message event:", data);

      const shouldProcess =
        data.user_id === authStore.currentUser?.id ||
        data.user_id === "user-not-selected" ||
        authStore.currentUser?.roleId === 1;

      if (!shouldProcess) {
        return;
      }

      await handleNewMessage(data.id, data.user_id);

      const entityIndicator = getEntityIndicatorToShow(data);
      if (entityIndicator) {
        setEntityIndicator(entityIndicator, true);
      }

      const managerIndicator = getManagerIndicatorToShow(data);
      if (managerIndicator) {
        setManagerIndicator(managerIndicator, true);
      }
    },
  );

  // Subscribe to message-read-by-contact event
  bindEvent(
    "e-chat-notification",
    "message-read-by-contact",
    async (data: { id: number | number[] }) => {
      console.log("👁️ Received Pusher message-read-by-contact event:", data);
      // Backend sends id as array (can contain multiple message IDs)
      const messageIds = Array.isArray(data.id) ? data.id : [data.id];
      messageIds.forEach((messageId) => {
        if (messageId) {
          markMessageAsReadByContact(messageId);
        }
      });
    },
  );

  // Subscribe to message-deleted event
  bindEvent(
    "e-chat-notification",
    "message-deleted",
    async (data: { id: number }) => {
      console.log("🗑️ Received Pusher message-deleted event:", data);
      if (data.id) {
        markMessageAsDeleted(data.id);
      }
    },
  );

  bindEvent(
    "e-chat-notification",
    "lead-merged-by-chaport-messages",
    async (data: SynchronizeResponse) => {
      console.log(
        "🔀 Received Pusher lead-merged-by-chaport-messages event:",
        data,
      );
      await handleChaportSync(data);
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
              if (contactId) {
                await fetchMessages(entityType, conversationId, contactId, {
                  page: 1,
                });
                eventBus.emit();
              }
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

    // UI Indicators
    unreadByEntity,
    unreadByManager,
    hasAnyUnreadForManagers,

    // Getters
    hasMore,
    hasMoreMessages,
    allConversations,
    currentConversationItem,
    findConversation,

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
    addNewConversation,
    loadMissingConversation,
    deleteContact,

    // Actions - Unread Management
    resetUnreadCount,

    // Actions - UI Indicators
    setEntityIndicator,
    setManagerIndicator,
    clearEntityIndicator,
    clearManagerIndicator,
    clearAllManagerIndicators,

    // Actions - Notifications
    playNotificationSound,

    // Actions - Message Status
    markMessageAsReadByContact,
    markMessageAsDeleted,

    // Actions - Chaport Synchronization
    handleChaportSync,

    // Actions - Temporary Messages (Optimistic Updates)
    tempMessages,
    addTempMessage,
    updateTempMessageStatus,
    findAndRemoveTempMessage,

    // Initialization
    initializeRouteWatchers,
  };
});

export default useConversationsStore;
