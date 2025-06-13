import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { conversationsService } from "../services/conversations-service";
import type { IConversation } from "@src/shared/types/types";
import type { ApiUpdateCommunicationPayload } from "@src/api/types";

interface ConversationsState {
  allConversations: IConversation[];
  leadConversations: IConversation[];
  clientConversations: IConversation[];
  currentConversationDetails: IConversation | null;
  loading: {
    all: boolean;
    leads: boolean;
    clients: boolean;
    details: boolean;
    update: boolean;
  };
  error: {
    all: string | null;
    leads: string | null;
    clients: string | null;
    details: string | null;
    update: string | null;
  };
}

export const useConversationsStore = defineStore("conversations", () => {
  // State
  const state = ref<ConversationsState>({
    allConversations: [],
    leadConversations: [],
    clientConversations: [],
    currentConversationDetails: null,
    loading: {
      all: false,
      leads: false,
      clients: false,
      details: false,
      update: false,
    },
    error: {
      all: null,
      leads: null,
      clients: null,
      details: null,
      update: null,
    },
  });

  // Getters (Computed properties)
  const allConversations = computed(() => state.value.allConversations);
  const leadConversations = computed(() => state.value.leadConversations);
  const clientConversations = computed(() => state.value.clientConversations);
  const currentConversationDetails = computed(
    () => state.value.currentConversationDetails,
  );
  const isLoadingAll = computed(() => state.value.loading.all);
  const isLoadingLeads = computed(() => state.value.loading.leads);
  const isLoadingClients = computed(() => state.value.loading.clients);
  const isLoadingDetails = computed(() => state.value.loading.details);
  const isUpdating = computed(() => state.value.loading.update);

  // Actions
  async function fetchAllConversations() {
    state.value.loading.all = true;
    state.value.error.all = null;
    try {
      state.value.allConversations =
        await conversationsService.getAllConversations();
    } catch (err) {
      state.value.error.all =
        err instanceof Error
          ? err.message
          : "Failed to fetch all conversations";
    } finally {
      state.value.loading.all = false;
    }
  }

  async function fetchLeadConversations() {
    state.value.loading.leads = true;
    state.value.error.leads = null;
    try {
      state.value.leadConversations =
        await conversationsService.getLeadConversations();
    } catch (err) {
      state.value.error.leads =
        err instanceof Error
          ? err.message
          : "Failed to fetch lead conversations";
    } finally {
      state.value.loading.leads = false;
    }
  }

  async function fetchClientConversations() {
    state.value.loading.clients = true;
    state.value.error.clients = null;
    try {
      state.value.clientConversations =
        await conversationsService.getClientConversations();
    } catch (err) {
      state.value.error.clients =
        err instanceof Error
          ? err.message
          : "Failed to fetch client conversations";
    } finally {
      state.value.loading.clients = false;
    }
  }

  async function fetchConversationDetails(type: "lead" | "client", id: number) {
    state.value.loading.details = true;
    state.value.error.details = null;
    try {
      state.value.currentConversationDetails =
        await conversationsService.getConversationDetails(type, id);
    } catch (err) {
      state.value.error.details =
        err instanceof Error
          ? err.message
          : "Failed to fetch conversation details";
    } finally {
      state.value.loading.details = false;
    }
  }

  async function updateConversation(
    type: "lead" | "client",
    id: number,
    payload: ApiUpdateCommunicationPayload,
  ) {
    state.value.loading.update = true;
    state.value.error.update = null;
    try {
      await conversationsService.updateConversationStatus(type, id, payload);
      // Optionally, re-fetch the updated conversation or list
      // For example, if updating details of the current conversation:
      if (
        state.value.currentConversationDetails &&
        state.value.currentConversationDetails.id === id &&
        state.value.currentConversationDetails.type === type
      ) {
        await fetchConversationDetails(type, id);
      }
      // Or re-fetch the list it belongs to
      if (type === "lead") {
        await fetchLeadConversations();
      }
      if (type === "client") {
        await fetchClientConversations();
      }
      await fetchAllConversations(); // Always refresh all conversations list
    } catch (err) {
      state.value.error.update =
        err instanceof Error
          ? err.message
          : "Failed to update conversation status";
    } finally {
      state.value.loading.update = false;
    }
  }

  return {
    // State
    allConversations,
    leadConversations,
    clientConversations,
    currentConversationDetails,
    isLoadingAll,
    isLoadingLeads,
    isLoadingClients,
    isLoadingDetails,
    isUpdating,
    error: computed(() => state.value.error),

    // Actions
    fetchAllConversations,
    fetchLeadConversations,
    fetchClientConversations,
    fetchConversationDetails,
    updateConversation,
  };
});
