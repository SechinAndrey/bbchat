<script setup lang="ts">
import { MusicalNoteIcon, DocumentIcon } from "@heroicons/vue/24/outline";
import { isImage, isVideo, isAudio } from "@src/shared/utils/media";

const props = defineProps<{
  media: string;
}>();
</script>

<template>
  <div class="w-9 h-10 flex-shrink-0 flex items-center justify-center">
    <img
      v-if="isImage(props.media)"
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
