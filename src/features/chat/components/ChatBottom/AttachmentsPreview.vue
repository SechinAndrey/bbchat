<script setup lang="ts">
import type { QueuedFile } from "@src/features/chat/composables/useMessageSending";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import Button from "@src/ui/inputs/Button.vue";
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  MusicalNoteIcon,
} from "@heroicons/vue/24/outline";
import { truncateFileName } from "@src/shared/utils/media";

defineProps<{
  files: QueuedFile[];
}>();

const emit = defineEmits<{
  remove: [id: number];
  clear: [];
}>();

const getFileIcon = (type: string) => {
  switch (type) {
    case "image":
      return PhotoIcon;
    case "video":
      return VideoCameraIcon;
    case "audio":
      return MusicalNoteIcon;
    default:
      return DocumentIcon;
  }
};
</script>

<template>
  <div
    class="flex items-start gap-3 px-4 py-3 bg-app-bg-secondary border-l-4 border-success w-full"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs font-medium text-success">
          Прикріплено файлів: {{ files.length }}
        </div>
        <Button
          variant="ghost"
          size="xs"
          :ring="false"
          class="text-xs"
          @click="emit('clear')"
        >
          Очистити все
        </Button>
      </div>

      <div class="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
        <div
          v-for="file in files"
          :key="file.id"
          class="flex items-center gap-2 text-sm"
        >
          <div
            class="w-6 h-6 rounded flex justify-center items-center bg-app-bg flex-shrink-0"
          >
            <component
              :is="getFileIcon(file.type)"
              class="w-4 h-4 text-app-text"
            />
          </div>

          <div class="flex-1 min-w-0 truncate text-app-text" :title="file.name">
            {{ truncateFileName(file.name) }}
          </div>

          <div class="text-xs text-app-text-secondary flex-shrink-0">
            {{ file.size }}
          </div>

          <Button
            variant="ghost"
            size="xs"
            icon-only
            :ring="false"
            @click="emit('remove', file.id)"
          >
            <template #icon>
              <XMarkIcon class="w-4 h-4" />
            </template>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
