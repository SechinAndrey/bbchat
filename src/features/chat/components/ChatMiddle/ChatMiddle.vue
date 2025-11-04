<script setup lang="ts">
import type { Ref } from "vue";

import { onMounted, ref, watch, nextTick, computed } from "vue";
import {
  useInfiniteScroll,
  useResizeObserver,
  useEventBus,
} from "@vueuse/core";
import { useRoute } from "vue-router";

import MessageV2 from "@src/features/chat/components/ChatMiddle/Message/MessageV2.vue";
import TempMessageV2 from "@src/features/chat/components/ChatMiddle/Message/TempMessageV2.vue";
import NewMessagesDivider from "@src/features/chat/components/ChatMiddle/NewMessagesDivider.vue";
import SimpleMediaModal from "@src/ui/data-display/SimpleMediaModal.vue";
import { isImage } from "@src/shared/utils/media";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import EmptyState from "@src/ui/states/empty-states/EmptyState.vue";
import LoadingState from "@src/ui/states/loading-states/LoadingState.vue";
import type { EntityType } from "@src/shared/types/common";
import { ENTITY_TO_CONTRAGENT_MAP } from "@src/shared/types/common";
import TimelineDivider from "@src/features/chat/components/ChatMiddle/TimelineDivider.vue";
import type { ApiMessageItem } from "@src/api/types";
import type { IConversation } from "@src/shared/types/types";
import {
  ChatBubbleLeftRightIcon,
  ClipboardDocumentIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/vue/24/outline";
import { useContextMenu } from "@src/shared/composables/useContextMenu";
import { ContextMenu } from "@src/ui/navigation/ContextMenu";
import { DropdownItem } from "@src/ui/navigation/DropdownV3";
import { useToast } from "@src/shared/composables/useToast";

const conversationsStore = useConversationsStore();
const route = useRoute();
const { toastError } = useToast();

const replyMessageBus = useEventBus<ApiMessageItem>("reply-message");

const container: Ref<HTMLElement | null> = ref(null);

const {
  isOpen: isContextMenuOpen,
  position: contextMenuPosition,
  selectedItem: selectedMessage,
  open: openContextMenu,
  close: closeContextMenu,
} = useContextMenu<ApiMessageItem>();

const currentEntity = computed(() => route.params.entity as EntityType);
const currentId = computed(() => Number(route.params.id));
const currentContactId = computed(() => Number(route.params.contactId));
const isLoadingMore = ref(false);
const messagesContainer: Ref<HTMLElement | null> = ref(null);
const shouldAutoScroll = ref(true);

const getMessageDate = (dateString: string): string => {
  return new Date(dateString).toDateString();
};

const shouldShowTimelineDivider = (
  currentMessage: ApiMessageItem,
  previousMessage?: ApiMessageItem,
): boolean => {
  if (!previousMessage) return false;

  const currentDate = getMessageDate(currentMessage.created_at);
  const previousDate = getMessageDate(previousMessage.created_at);

  return currentDate !== previousDate;
};

const shouldShowFirstMessageDivider = (messageIndex: number): boolean => {
  const messages = conversationsStore.activeConversation?.messages;
  if (!messages || messages.length === 0) return false;

  return messageIndex === 0;
};

const currentConversation = computed((): IConversation | null => {
  if (!currentEntity.value || !currentId.value || !currentContactId.value)
    return null;

  const conversations = conversationsStore.conversations[currentEntity.value];
  return (
    conversations?.find(
      (conv: IConversation) =>
        conv.id === currentId.value &&
        conv.contact.id === currentContactId.value,
    ) || null
  );
});

const unreadCount = computed(() => {
  return currentConversation.value?.unread || 0;
});

// Separate computed for better performance
const currentContragentType = computed(() =>
  currentEntity.value ? ENTITY_TO_CONTRAGENT_MAP[currentEntity.value] : null,
);

const currentPhone = computed(
  () => conversationsStore.activeConversation?.phone,
);

const currentTempMessages = computed(() => {
  if (
    !currentEntity.value ||
    !currentId.value ||
    !currentPhone.value ||
    !currentContragentType.value
  ) {
    return [];
  }

  return conversationsStore.tempMessages.filter(
    (msg) =>
      msg.contragentType === currentContragentType.value &&
      msg.contragentId === currentId.value &&
      msg.phone === currentPhone.value,
  );
});

const shouldShowDividerAfterMessage = (messageIndex: number) => {
  const messages = conversationsStore.activeConversation?.messages;
  if (!messages || unreadCount.value === 0) return false;
  const firstUnreadIndex = messages.length - unreadCount.value;
  const shouldShow = messageIndex === firstUnreadIndex - 1;
  return shouldShow;
};

useInfiniteScroll(
  container,
  async () => {
    if (
      conversationsStore.isLoadingMoreMessages ||
      !conversationsStore.hasMoreMessages ||
      !currentEntity.value ||
      !currentId.value
    ) {
      return;
    }

    try {
      isLoadingMore.value = true;

      // Save current scroll position before loading more messages
      const scrollElement = container.value;
      const previousScrollHeight = scrollElement?.scrollHeight || 0;
      const previousScrollTop = scrollElement?.scrollTop || 0;

      await conversationsStore.loadMoreMessages(
        currentEntity.value,
        currentId.value,
        currentContactId.value,
      );

      // Restore scroll position after new messages are loaded
      await nextTick();
      if (scrollElement) {
        const newScrollHeight = scrollElement.scrollHeight;
        const heightDifference = newScrollHeight - previousScrollHeight;
        scrollElement.scrollTop = previousScrollTop + heightDifference;
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      isLoadingMore.value = false;
    }
  },
  {
    distance: 300,
    direction: "top",
    throttle: 500,
  },
);

// Image gallery state
const isImageGalleryOpen = ref(false);
const galleryImages = ref<string[]>([]);
const startingImageIndex = ref(0);

// Collect all images from conversation messages
const collectConversationImages = () => {
  const images: string[] = [];

  if (conversationsStore.activeConversation) {
    for (const message of conversationsStore.activeConversation.messages) {
      // Check echat messages for media
      if (message.echat_messages) {
        const echatMessage =
          typeof message.echat_messages.message_json === "string"
            ? JSON.parse(message.echat_messages.message_json)
            : message.echat_messages.message_json || {};

        const img = echatMessage.media || echatMessage.file;

        if (img && isImage(img)) {
          images.push(img);
        }
      }
    }
  }

  return images;
};

const openImageGallery = (clickedImageUrl: string) => {
  const allImages = collectConversationImages();
  const imageIndex = allImages.findIndex((img) => img === clickedImageUrl);

  galleryImages.value = allImages;
  startingImageIndex.value = imageIndex >= 0 ? imageIndex : 0;
  isImageGalleryOpen.value = true;
};

const closeImageGallery = () => {
  isImageGalleryOpen.value = false;
  galleryImages.value = [];
  startingImageIndex.value = 0;
};

const handleOpenContextMenu = (
  message: ApiMessageItem,
  event: MouseEvent | TouchEvent,
) => {
  openContextMenu(event, message);
};

const getMessageText = (message: ApiMessageItem): string => {
  if (message.echat_messages?.message) {
    return message.echat_messages.message;
  }
  if (message.chaport_messages?.message) {
    return message.chaport_messages.message;
  }
  return "";
};

const handleCopyMessage = async () => {
  if (!selectedMessage.value) return;

  const text = getMessageText(selectedMessage.value);

  if (!text) {
    toastError("Немає тексту для копіювання");
    closeContextMenu();
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Failed to copy text:", error);
    toastError("Помилка копіювання");
  }

  closeContextMenu();
};

const handleReplyMessage = () => {
  if (!selectedMessage.value) return;
  replyMessageBus.emit(selectedMessage.value);

  closeContextMenu();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  });
};

const scrollToMessage = (messageId: number) => {
  nextTick(() => {
    const messageElement = document.querySelector(
      `[data-message-id="${messageId}"]`,
    );
    if (messageElement && container.value) {
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      messageElement.classList.add("highlight-message");
      setTimeout(() => {
        messageElement.classList.remove("highlight-message");
      }, 2000);
    }
  });
};

const checkIfShouldAutoScroll = () => {
  if (!container.value) return;

  const scrollElement = container.value;
  const isNearBottom =
    scrollElement.scrollHeight -
      scrollElement.scrollTop -
      scrollElement.clientHeight <
    150;

  shouldAutoScroll.value = isNearBottom;
};

// Track resize of messages container to handle image loading
useResizeObserver(messagesContainer, () => {
  if (!isLoadingMore.value && shouldAutoScroll.value) {
    scrollToBottom();
  }
});

onMounted(() => {
  scrollToBottom();
  container.value?.addEventListener("scroll", checkIfShouldAutoScroll);
});

watch(
  () => [
    conversationsStore.activeConversation?.messages,
    currentTempMessages.value,
  ],
  () => {
    if (!isLoadingMore.value) {
      shouldAutoScroll.value = true;
      scrollToBottom();
    }
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div
    ref="container"
    class="grow px-5 py-5 flex flex-col overflow-y-scroll scrollbar-hidden"
  >
    <Spinner
      v-if="conversationsStore.isLoadingMoreMessages"
      class="flex justify-center py-4"
    />

    <div
      ref="messagesContainer"
      class="flex flex-col transition-opacity duration-300"
      :class="
        conversationsStore.isLoadingMessages &&
        conversationsStore.activeConversation?.messages?.length
          ? 'opacity-50'
          : 'opacity-100'
      "
    >
      <div
        v-for="(message, index) in conversationsStore.activeConversation
          ?.messages"
        :key="message.id"
        :data-message-id="message.id"
      >
        <TimelineDivider
          v-if="shouldShowFirstMessageDivider(index)"
          :date="message.created_at"
        />

        <TimelineDivider
          v-if="
            shouldShowTimelineDivider(
              message,
              conversationsStore.activeConversation?.messages?.[index - 1],
            )
          "
          :date="message.created_at"
        />

        <MessageV2
          :message="message"
          @open-image-gallery="openImageGallery"
          @open-context-menu="handleOpenContextMenu"
          @scroll-to-message="scrollToMessage"
        />

        <NewMessagesDivider v-if="shouldShowDividerAfterMessage(index)" />
      </div>

      <div
        v-for="tempMessage in currentTempMessages"
        :key="tempMessage.clientMessageUid"
      >
        <TempMessageV2 :temp-message="tempMessage" />
      </div>
    </div>

    <div
      v-if="
        !conversationsStore.activeConversation?.messages?.length &&
        !currentTempMessages.length &&
        !conversationsStore.isLoadingMessages &&
        !conversationsStore.isLoadingConversation
      "
      class="flex items-center justify-center h-full"
    >
      <EmptyState :icon="ChatBubbleLeftRightIcon" title="Повідомлень немає" />
    </div>

    <div
      v-if="
        conversationsStore.isLoadingMessages &&
        conversationsStore.activeConversation &&
        !conversationsStore.activeConversation.messages?.length
      "
      class="flex items-center justify-center h-full"
    >
      <LoadingState
        :icon="ChatBubbleLeftRightIcon"
        title="Завантаження повідомлень..."
        :loading="true"
      />
    </div>

    <SimpleMediaModal
      :open="isImageGalleryOpen"
      :image-urls="galleryImages"
      :starting-index="startingImageIndex"
      @close="closeImageGallery"
    />

    <!-- Context Menu для повідомлень -->
    <ContextMenu
      v-model:show="isContextMenuOpen"
      :position="contextMenuPosition"
      @close="closeContextMenu"
    >
      <DropdownItem label="Копіювати" @click="handleCopyMessage">
        <ClipboardDocumentIcon class="w-5 h-5 mr-3" />
        Копіювати
      </DropdownItem>

      <DropdownItem
        v-if="selectedMessage?.echat_messages?.dialog?.messenger_id === 1"
        label="Відповісти"
        @click="handleReplyMessage"
      >
        <ArrowUturnLeftIcon class="w-5 h-5 mr-3" />
        Відповісти
      </DropdownItem>
    </ContextMenu>
  </div>
</template>

<style scoped>
.highlight-message {
  animation: highlight 2s ease-in-out;
}

@keyframes highlight {
  0% {
    background-color: transparent;
  }
  10% {
    background-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
  100% {
    background-color: transparent;
  }
}
</style>
