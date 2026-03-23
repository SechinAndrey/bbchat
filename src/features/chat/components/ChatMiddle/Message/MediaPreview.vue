<script setup lang="ts">
import { inject } from "vue";
import { ArrowDownTrayIcon, CheckIcon } from "@heroicons/vue/24/outline";
import VideoPlayer from "@src/ui/data-display/VideoPlayer.vue";
import TgsSticker from "./TgsSticker.vue";
import {
  isImage,
  isVideo,
  isAudio,
  isTgsSticker,
  getFileName,
  truncateFileName,
} from "@src/shared/utils/media";
import {
  photoSelectionKey,
  type PhotoSelectionContext,
} from "@src/features/photo-reports/composables/usePhotoSelection";

const props = defineProps<{
  media: string;
  attachmentId?: number;
}>();

const emit = defineEmits<{
  openImageGallery: [imageUrl: string];
}>();

const photoSelection = inject<PhotoSelectionContext | null>(
  photoSelectionKey,
  null,
);

const handleImageClick = () => {
  if (
    photoSelection?.isSelectionMode.value &&
    isImage(props.media) &&
    props.attachmentId
  ) {
    photoSelection.togglePhoto(props.media, props.media, props.attachmentId);
    return;
  }

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
    <div
      v-else-if="isImage(props.media)"
      class="relative inline-block"
      :class="{
        'cursor-pointer': photoSelection?.isSelectionMode.value,
      }"
    >
      <img
        :src="props.media"
        class="rounded-md max-w-full cursor-pointer max-h-[50vh]"
        :class="{
          'ring ring-primary':
            photoSelection?.isSelectionMode.value &&
            photoSelection?.isPhotoSelected(props.media),
        }"
        alt="медіа контент"
        @click="handleImageClick"
      />

      <!-- Selection overlay -->
      <div
        v-if="photoSelection?.isSelectionMode.value"
        class="absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer"
        :class="
          photoSelection.isPhotoSelected(props.media)
            ? 'bg-primary border-primary'
            : 'bg-black/30 border-white'
        "
        @click.stop="handleImageClick"
      >
        <CheckIcon
          v-if="photoSelection.isPhotoSelected(props.media)"
          class="w-4 h-4 text-white"
        />
      </div>
    </div>

    <!-- Video -->
    <div v-else-if="isVideo(props.media)" class="w-[260px] max-w-full">
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
      <div class="flex gap-4 items-center">
        <div
          class="min-w-8 max-w-8 max-h-8 min-h-8 flex justify-center rounded-full outline-none items-center bg-app-bg flex-shrink-0"
        >
          <ArrowDownTrayIcon class="h-5 w-5 text-primary" />
        </div>

        <div
          class="text-app-text min-w-0 flex-1 truncate"
          :title="getFileName(props.media)"
        >
          {{ truncateFileName(getFileName(props.media)) }}
        </div>
      </div>
    </a>
  </div>
</template>
