<script setup lang="ts">
import type { Ref } from "vue";

import { onMounted, ref, watch, nextTick, computed } from "vue";
import { useInfiniteScroll } from "@vueuse/core";
import { useRoute } from "vue-router";

import useStore from "@src/shared/store/store";
import MessageV2 from "@src/features/chat/components/ChatMiddle/Message/MessageV2.vue";
import TempMessageV2 from "@src/features/chat/components/ChatMiddle/Message/TempMessageV2.vue";
import NewMessagesDivider from "@src/features/chat/components/ChatMiddle/NewMessagesDivider.vue";
import SimpleMediaModal from "@src/ui/data-display/SimpleMediaModal.vue";
import { isImage } from "@src/shared/utils/media";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import NoChatSelected from "@src/ui/states/empty-states/NoChatSelected.vue";
import type { EntityType } from "@src/shared/types/common";
import { ENTITY_TO_CONTRAGENT_MAP } from "@src/shared/types/common";
import TimelineDivider from "@src/features/chat/components/ChatMiddle/TimelineDivider.vue";

const store = useStore();
const conversationsStore = useConversationsStore();
const route = useRoute();

const container: Ref<HTMLElement | null> = ref(null);

const currentEntity = computed(() => route.params.entity as EntityType);
const currentId = computed(() => Number(route.params.id));
const currentContactId = computed(() => Number(route.params.contactId));
const isLoadingMore = ref(false);

const getMessageDate = (dateString: string): string => {
  return new Date(dateString).toDateString();
};

const shouldShowTimelineDivider = (
  currentMessage: any,
  olderMessage?: any,
): boolean => {
  if (!olderMessage) return false;

  const currentDate = getMessageDate(currentMessage.created_at);
  const olderDate = getMessageDate(olderMessage.created_at);

  return currentDate !== olderDate;
};

const shouldShowFirstMessageDivider = (messageIndex: number): boolean => {
  const messages = conversationsStore.activeConversation?.messages;
  if (!messages || messages.length === 0) return false;

  return messageIndex === messages.length - 1;
};

const currentConversation = computed(() => {
  if (!currentEntity.value || !currentId.value) return null;

  const conversations = conversationsStore.conversations[currentEntity.value];
  return (
    conversations?.find((conv: any) => conv.id === currentId.value) || null
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
  const shouldShow = messageIndex === unreadCount.value - 1;
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

        if (echatMessage.media && isImage(echatMessage.media)) {
          images.push(echatMessage.media);
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

const scrollToBottom = () => {
  nextTick(() => {
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  });
};

onMounted(() => {
  scrollToBottom();
});

watch(
  () => [
    conversationsStore.activeConversation?.messages,
    currentTempMessages.value,
  ],
  () => {
    if (!isLoadingMore.value) {
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
      v-if="
        store.status !== 'loading' &&
        (conversationsStore.activeConversation?.messages?.length ||
          currentTempMessages.length)
      "
      class="flex flex-col-reverse"
    >
      <div
        v-for="tempMessage in currentTempMessages"
        :key="tempMessage.clientMessageUid"
      >
        <TempMessageV2 :temp-message="tempMessage" />
      </div>

      <div
        v-for="(message, index) in conversationsStore.activeConversation
          ?.messages || []"
        :key="message.id"
      >
        <NewMessagesDivider v-if="shouldShowDividerAfterMessage(index)" />

        <TimelineDivider
          v-if="
            shouldShowTimelineDivider(
              message,
              conversationsStore.activeConversation?.messages?.[index + 1],
            )
          "
          :date="message.created_at"
        />

        <TimelineDivider
          v-if="shouldShowFirstMessageDivider(index)"
          :date="message.created_at"
        />

        <MessageV2 :message="message" @open-image-gallery="openImageGallery" />
      </div>
    </div>

    <NoChatSelected v-else title="Повідомлень немає" text="" />

    <SimpleMediaModal
      :open="isImageGalleryOpen"
      :image-urls="galleryImages"
      :starting-index="startingImageIndex"
      @close="closeImageGallery"
    />
  </div>
</template>
