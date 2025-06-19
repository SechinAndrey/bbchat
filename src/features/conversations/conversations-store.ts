import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { conversationsService } from "./conversations-service";
import {
  adaptApiCommunicationLeadToIConversation,
  adaptApiCommunicationClientToIConversation,
} from "@src/api/communication-adapters";
import type { IConversation } from "@src/shared/types/types";
import type {
  ApiCommunicationResponse,
  ApiCommunicationLead,
  ApiCommunicationClient,
} from "@src/api/types";

export const useConversationsStore = defineStore("conversations", () => {
  // State
  const conversations = ref<IConversation[]>([]);
  const leads = ref<ApiCommunicationLead[]>([]);
  const clients = ref<ApiCommunicationClient[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Computed
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);
  const totalConversations = computed(() => conversations.value.length);
  const unreadCount = computed(() =>
    conversations.value.reduce((sum, conv) => sum + (conv.unread || 0), 0),
  );

  // Actions
  /**
   * Fetch all conversations from API and save to store
   */
  async function fetchConversations(): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const response: ApiCommunicationResponse =
        await conversationsService.getCommunications();

      // Save raw API data
      leads.value = response.leads || [];
      clients.value = response.clients || [];

      // adapt leads to IConversation format
      const adaptedLeads: IConversation[] = leads.value.map((lead) =>
        adaptApiCommunicationLeadToIConversation(lead),
      );
      // adapt clients to IConversation format
      const adaptedClients: IConversation[] = clients.value.map((client) =>
        adaptApiCommunicationClientToIConversation(client),
      );

      conversations.value = [...adaptedLeads, ...adaptedClients];

      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch conversations";
      console.error("Error fetching conversations:", err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Send message to conversation
   * @param contragentId - Lead or client ID
   * @param contragentType - Type: "lead" or "client"
   * @param message - Message text
   */
  async function sendMessage(
    contragentId: number,
    contragentType: "lead" | "client",
    message: string,
  ): Promise<boolean> {
    try {
      const success = await conversationsService.sendMessage({
        contragent_id: contragentId,
        contragent_type: contragentType,
        message,
      });

      if (success) {
        // Refresh conversations after sending message
        await fetchConversations();
      }

      return success;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to send message";
      console.error("Error sending message:", err);
      return false;
    }
  }

  /**
   * Update draft message for conversation
   * @param contragentId - Lead or client ID
   * @param contragentType - Type: "lead" or "client"
   * @param draftMessage - Draft message text
   */
  async function updateDraftMessage(
    contragentId: number,
    contragentType: "lead" | "client",
    draftMessage: string,
  ): Promise<boolean> {
    try {
      await conversationsService.updateDraftMessage(
        contragentId,
        contragentType,
        draftMessage,
      );

      // Update local state
      const targetList =
        contragentType === "lead" ? leads.value : clients.value;
      const item = targetList.find((item) => item.id === contragentId);
      if (item) {
        item.draftMessage = draftMessage;
      }

      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update draft message";
      console.error("Error updating draft message:", err);
      return false;
    }
  }

  /**
   * Pin message in conversation
   * @param messageId - Message ID
   */
  async function pinMessage(messageId: number): Promise<boolean> {
    try {
      await conversationsService.pinMessage(messageId);
      // Refresh conversations to get updated pinned message
      await fetchConversations();
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to pin message";
      console.error("Error pinning message:", err);
      return false;
    }
  }

  /**
   * Unpin message in conversation
   * @param messageId - Message ID
   */
  async function unpinMessage(messageId: number): Promise<boolean> {
    try {
      await conversationsService.unpinMessage(messageId);
      // Refresh conversations to get updated pinned message
      await fetchConversations();
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to unpin message";
      console.error("Error unpinning message:", err);
      return false;
    }
  }

  /**
   * Get conversation by ID
   * @param id - Conversation ID
   */
  function getConversationById(id: number): IConversation | undefined {
    return conversations.value.find((conv) => conv.id === id);
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    error.value = null;
  }

  /**
   * Reset store state
   */
  function reset(): void {
    conversations.value = [];
    leads.value = [];
    clients.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    conversations,
    leads,
    clients,
    loading,
    error,

    // Computed
    isLoading,
    hasError,
    totalConversations,
    unreadCount,

    // Actions
    fetchConversations,
    sendMessage,
    updateDraftMessage,
    pinMessage,
    unpinMessage,
    getConversationById,
    clearError,
    reset,
  };
});

export default useConversationsStore;
