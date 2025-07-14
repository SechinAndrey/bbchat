<script setup lang="ts">
import type { Ref } from "vue";

import useStore from "@src/shared/store/store";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { computed, provide, ref, watch } from "vue";

import { getActiveConversationId } from "@src/shared/utils/utils";

import NoChatSelected from "@src/ui/states/empty-states/NoChatSelected.vue";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import ChatBottom from "@src/features/chat/components/ChatBottom/ChatBottom.vue";
import ChatMiddle from "@src/features/chat/components/ChatMiddle/ChatMiddle.vue";
import ChatTop from "@src/features/chat/components/ChatTop/ChatTop.vue";
import RightSidebar from "@src/features/right-sidebar/components/RightSidebar.vue";

const props = defineProps<{
  id: number;
  entity: "leads" | "clients";
}>();

provide("entity", props.entity);
provide("id", props.id);

const store = useStore();
const conversationsStore = useConversationsStore();
conversationsStore.fetchCommunicationMessages(props.entity, props.id);

// search the selected conversation using activeConversationId.
const activeConversation = computed(() => {
  const conversationId = getActiveConversationId();
  if (!conversationId) return undefined;

  let conversation = conversationsStore?.allCommunications.find(
    (conversation) => conversation.id === conversationId,
  );

  return conversation;
});

watch(
  activeConversation,
  (newConversation) => {
    if (newConversation) {
      provide("activeConversation", newConversation);
    }
    if (store.rightSidebarOpen) {
      useConversationsStore().fetchConversationById(props.entity, props.id);
    }
  },
  { immediate: true },
);

watch(
  () => store.rightSidebarOpen,
  (isOpen) => {
    if (isOpen) {
      useConversationsStore().fetchConversationById(props.entity, props.id);
    }
  },
);

// determines whether select mode is enabled.
const selectMode = ref(false);

// determines whether all the messages are selected or not.
const selectAll = ref(false);

// holds the selected conversations.
const selectedMessages: Ref<number[]> = ref([]);

// (event) add message to select messages.
const handleSelectMessage = (messageId: number) => {
  selectedMessages.value.push(messageId);

  if (
    activeConversation.value &&
    selectedMessages.value.length === activeConversation.value.messages.length
  ) {
    selectAll.value = true;
  }

  if (!selectMode.value) {
    selectMode.value = true;
  }
};

// (event) remove message from select messages.
const handleDeselectMessage = (messageId: number) => {
  selectAll.value = false;
  selectedMessages.value = selectedMessages.value.filter(
    (item) => item !== messageId,
  );

  if (activeConversation.value && selectedMessages.value.length === 0) {
    selectMode.value = false;
  }
};

// (event) select all messages.
const handleSelectAll = () => {
  if (activeConversation.value) {
    const messages = activeConversation.value.messages.map(
      (message) => message.id,
    );
    selectedMessages.value = messages;
    selectAll.value = true;
  }
};

// (event) remove the selected messages.
const handleDeselectAll = () => {
  selectAll.value = false;
  selectedMessages.value = [];
};

// (event handle close Select)
const handleCloseSelect = () => {
  selectMode.value = false;
  selectAll.value = false;
  selectedMessages.value = [];
};
</script>

<template>
  <div class="h-full w-full flex scrollbar-hidden">
    <div class="h-full flex flex-col w-full scrollbar-hidden">
      <Spinner v-if="conversationsStore.isLoading" />

      <div
        v-else-if="getActiveConversationId() && activeConversation"
        class="h-full flex flex-col scrollbar-hidden"
      >
        <ChatTop
          :active-conversation="activeConversation"
          :select-all="selectAll"
          :select-mode="selectMode"
          :handle-select-all="handleSelectAll"
          :handle-deselect-all="handleDeselectAll"
          :handle-close-select="handleCloseSelect"
        />
        <ChatMiddle
          :active-conversation="activeConversation"
          :selected-messages="selectedMessages"
          :handle-select-message="handleSelectMessage"
          :handle-deselect-message="handleDeselectMessage"
        />
        <ChatBottom :active-conversation="activeConversation" />
      </div>

      <NoChatSelected v-else />
    </div>

    <RightSidebar
      v-if="
        getActiveConversationId() &&
        activeConversation &&
        store.rightSidebarOpen
      "
    />
  </div>
</template>
