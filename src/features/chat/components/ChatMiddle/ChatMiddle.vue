<script setup lang="ts">
import type { Ref } from "vue";

import { onMounted, ref, watch, nextTick } from "vue";

import useStore from "@src/shared/store/store";
import MessageV2 from "@src/features/chat/components/ChatMiddle/Message/MessageV2.vue";
import SimpleMediaModal from "@src/ui/data-display/SimpleMediaModal.vue";
import { isImage } from "@src/shared/utils/media";
import { useConversationsStore } from "@src/features/conversations/conversations-store";

const store = useStore();
const conversationsStore = useConversationsStore();

const container: Ref<HTMLElement | null> = ref(null);

// Image gallery state
const isImageGalleryOpen = ref(false);
const galleryImages = ref<string[]>([]);
const startingImageIndex = ref(0);

// Collect all images from conversation messages
const collectConversationImages = () => {
  const images: string[] = [];

  if (conversationsStore.activeConversationInfo) {
    for (const message of conversationsStore.activeConversationInfo.messages) {
      // Type assertion to handle mixed message types
      const messageWithEchat = message as any;

      // Check echat messages for media
      if (messageWithEchat.echat_messages) {
        const echatMessage =
          typeof messageWithEchat.echat_messages.message_json === "string"
            ? JSON.parse(messageWithEchat.echat_messages.message_json)
            : messageWithEchat.echat_messages.message_json || {};

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
    scrollToBottom();
  },
  { deep: true },
);
</script>

<template>
  <div
    ref="container"
    class="grow px-5 py-5 flex flex-col overflow-y-scroll scrollbar-hidden"
  >
    <div
      v-if="
        store.status !== 'loading' &&
        conversationsStore.activeConversationInfo?.messages
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

    <SimpleMediaModal
      :open="isImageGalleryOpen"
      :image-urls="galleryImages"
      :starting-index="startingImageIndex"
      @close="closeImageGallery"
    />
  </div>
</template>
