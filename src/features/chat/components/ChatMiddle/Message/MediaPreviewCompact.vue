<script setup lang="ts">
import { MusicalNoteIcon, DocumentIcon } from "@heroicons/vue/24/outline";
import {
  isImage,
  isVideo,
  isAudio,
  isTgsSticker,
} from "@src/shared/utils/media";
import TgsSticker from "./TgsSticker.vue";

const props = defineProps<{
  media: string;
}>();
</script>

<template>
  <div
    class="w-9 h-10 flex-shrink-0 flex items-center justify-center overflow-hidden"
  >
    <!-- Telegram Sticker -->
    <TgsSticker
      v-if="isTgsSticker(props.media)"
      :sticker-url="props.media"
      class="w-full h-full"
    />

    <!-- Image -->
    <img
      v-else-if="isImage(props.media)"
      :src="props.media"
      class="w-full h-full rounded object-cover"
      alt="медіа"
    />

    <video
      v-else-if="isVideo(props.media)"
      :src="props.media"
      class="w-full h-full rounded object-cover"
      preload="metadata"
    />

    <div
      v-else-if="isAudio(props.media)"
      class="w-full h-full rounded bg-app-bg flex items-center justify-center"
    >
      <MusicalNoteIcon class="w-6 h-6 text-primary" />
    </div>

    <div
      v-else
      class="w-full h-full rounded bg-app-bg flex items-center justify-center"
    >
      <DocumentIcon class="w-6 h-6 text-primary" />
    </div>
  </div>
</template>
