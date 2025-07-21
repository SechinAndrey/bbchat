<script setup lang="ts">
import type { Ref } from "vue";

import { onMounted, ref, watch, nextTick, computed } from "vue";
import { useInfiniteScroll } from "@vueuse/core";
import { useRoute } from "vue-router";

import useStore from "@src/shared/store/store";
import MessageV2 from "@src/features/chat/components/ChatMiddle/Message/MessageV2.vue";
import SimpleMediaModal from "@src/ui/data-display/SimpleMediaModal.vue";
import { isImage } from "@src/shared/utils/media";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import NoChatSelected from "@src/ui/states/empty-states/NoChatSelected.vue";

const store = useStore();
const conversationsStore = useConversationsStore();
const route = useRoute();

const container: Ref<HTMLElement | null> = ref(null);

const currentEntity = computed(
  () => route.params.entity as "leads" | "clients",
);
const currentId = computed(() => Number(route.params.id));
const isLoadingMore = ref(false);

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

  if (conversationsStore.activeConversationInfo) {
    for (const message of conversationsStore.activeConversationInfo.messages) {
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
  () => conversationsStore.activeConversationInfo?.messages,
  () => {
    if (!isLoadingMore.value) {
      scrollToBottom();
    }
  },
  { deep: true },
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
        conversationsStore.activeConversationInfo?.messages &&
        conversationsStore.activeConversationInfo.messages.length
      "
      class="flex flex-col-reverse"
    >
      <div
        v-for="message in conversationsStore.activeConversationInfo.messages"
        :key="message.id"
      >
        <!-- <TimelineDivider v-if="renderDivider(index, index - 1)" /> -->

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
