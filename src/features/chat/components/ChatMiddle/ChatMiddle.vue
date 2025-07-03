<script setup lang="ts">
import type { IConversation, IMessage } from "@src/shared/types/types";
import type { Ref } from "vue";

import { inject, onMounted, ref, watch, nextTick } from "vue";

import useStore from "@src/shared/store/store";
import MessageV2 from "@src/features/chat/components/ChatMiddle/Message/MessageV2.vue";
import TimelineDivider from "@src/features/chat/components/ChatMiddle/TimelineDivider.vue";
import SimpleMediaModal from "@src/ui/data-display/SimpleMediaModal.vue";
import { isImage } from "@src/shared/utils/media";

const props = defineProps<{
  handleSelectMessage: (messageId: number) => void;
  handleDeselectMessage: (messageId: number) => void;
  selectedMessages: number[];
}>();

const store = useStore();

const container: Ref<HTMLElement | null> = ref(null);

const activeConversation = <IConversation>inject("activeConversation");

// Image gallery state
const isImageGalleryOpen = ref(false);
const galleryImages = ref<string[]>([]);
const startingImageIndex = ref(0);

// Collect all images from conversation messages
const collectConversationImages = () => {
  const images: string[] = [];

  if (activeConversation?.messages) {
    for (const message of activeConversation.messages) {
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

// checks whether the previous message was sent by the same user.
const isFollowUp = (index: number, previousIndex: number): boolean => {
  return true; // This function is currently not implemented, returning true for now.
  // if (previousIndex < 0) {
  //   return false;
  // } else {
  //   let previousSender = activeConversation.messages[previousIndex].sender.id;
  //   let currentSender = activeConversation.messages[index].sender.id;
  //   return previousSender === currentSender;
  // }
};

// checks wether the new message has been sent in a new day or not.
const renderDivider = (index: number, previousIndex: number): boolean => {
  if (index === 3) {
    return true;
  } else {
    return false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  });
};

// scroll messages to bottom.
onMounted(() => {
  scrollToBottom();
});

watch(
  () => activeConversation.messages,
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
    <div v-if="store.status !== 'loading'" class="flex flex-col">
      <div v-for="(message, index) in activeConversation.messages" :key="index">
        <TimelineDivider v-if="renderDivider(index, index - 1)" />

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
