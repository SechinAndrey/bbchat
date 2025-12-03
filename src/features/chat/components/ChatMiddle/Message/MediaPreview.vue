<script setup lang="ts">
import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import VideoPlayer from "@src/ui/data-display/VideoPlayer.vue";
import TgsSticker from "./TgsSticker.vue";
import {
  isImage,
  isVideo,
  isAudio,
  isTgsSticker,
  getFileName,
} from "@src/shared/utils/media";

const props = defineProps<{
  media: string;
  attachmentId?: number;
}>();

const emit = defineEmits<{
  openImageGallery: [imageUrl: string];
}>();

const openCarousel = () => {
  // Only emit for images, not for videos
  if (props.attachmentId && isImage(props.media)) {
    emit("openImageGallery", props.media);
  }
};
</script>

<template>
  <div class="mt-2">
    <!-- Telegram Sticker (.tgs) -->
    <TgsSticker
      v-if="isTgsSticker(props.media)"
      :sticker-url="props.media"
      class="!w-32 !h-32"
    />

    <!-- Image -->
    <img
      v-else-if="isImage(props.media)"
      :src="props.media"
      class="rounded-lg max-w-full cursor-pointer max-h-[50vh]"
      alt="медіа контент"
      @click="openCarousel"
    />

    <!-- Video -->
    <div v-else-if="isVideo(props.media)" class="w-full">
      <VideoPlayer
        :id="`video-${Date.now()}`"
        :url="props.media"
        :name="getFileName(props.media)"
        :thumbnail="props.media"
        class="w-full rounded-lg max-w-full aspect-video"
      />
    </div>

    <!-- Audio -->
    <div v-else-if="isAudio(props.media)" class="flex items-center gap-4">
      <audio :src="props.media" controls class="w-full">
        Your browser does not support the audio element.
      </audio>
    </div>

    <!-- Other Files -->
    <a v-else :href="props.media" target="_blank" download class="block">
      <div class="flex gap-4">
        <div
          class="min-w-8 max-w-8 max-h-8 min-h-8 flex justify-center rounded-full outline-none items-center bg-app-bg"
        >
          <ArrowDownTrayIcon class="h-5 w-5 text-primary" />
        </div>

        <div class="break-words text-app-text w-[calc(100%-40px)]">
          {{ getFileName(props.media) }}
        </div>
      </div>
    </a>
  </div>
</template>
