<script setup lang="ts">
import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import VideoPlayer from "@src/ui/data-display/VideoPlayer.vue";
import { isImage, isVideo, getFileName } from "@src/shared/utils/media";

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
    console.log("MediaPreview: Emitting openImageGallery for:", props.media);
    emit("openImageGallery", props.media);
  }
};
</script>

<template>
  <div class="mt-2">
    <img
      v-if="isImage(props.media)"
      :src="props.media"
      class="rounded-lg max-w-full cursor-pointer"
      alt="медіа контент"
      @click="openCarousel"
    />
    <div v-else-if="isVideo(props.media)" class="w-full">
      <VideoPlayer
        :id="`video-${Date.now()}`"
        :url="props.media"
        :name="getFileName(props.media)"
        :thumbnail="props.media"
        class="w-full rounded-lg max-w-full aspect-video"
      />
    </div>

    <a v-else :href="props.media" target="_blank" download class="block">
      <div class="flex gap-4">
        <div
          class="min-w-8 max-w-8 max-h-8 min-h-8 flex justify-center rounded-full outline-none items-center dark:bg-gray-800"
        >
          <ArrowDownTrayIcon class="h-5 w-5 text-secondary" />
        </div>

        <div
          class="break-words text-black opacity-50 dark:text-white dark:opacity-70 w-[calc(100%-40px)]"
        >
          {{ getFileName(props.media) }}
        </div>
      </div>
    </a>
  </div>
</template>
