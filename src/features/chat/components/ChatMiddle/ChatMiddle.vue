<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import type { Ref, ComputedRef } from "vue";

import { inject, onMounted, ref, watch, nextTick } from "vue";

import useStore from "@src/shared/store/store";
import MessageV2 from "@src/features/chat/components/ChatMiddle/Message/MessageV2.vue";
import SimpleMediaModal from "@src/ui/data-display/SimpleMediaModal.vue";
import { isImage } from "@src/shared/utils/media";

const store = useStore();

const container: Ref<HTMLElement | null> = ref(null);

const activeConversation =
  inject<ComputedRef<IConversation | undefined>>("activeConversation");

// Image gallery state
const isImageGalleryOpen = ref(false);
const galleryImages = ref<string[]>([]);
const startingImageIndex = ref(0);

// Collect all images from conversation messages
const collectConversationImages = () => {
  const images: string[] = [];

  if (activeConversation?.value?.messages) {
    for (const message of activeConversation.value.messages) {
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
  () => activeConversation?.value?.messages,
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
      v-if="store.status !== 'loading' && activeConversation?.messages"
      class="flex flex-col-reverse"
    >
      <div v-for="message in activeConversation.messages" :key="message.id">
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
