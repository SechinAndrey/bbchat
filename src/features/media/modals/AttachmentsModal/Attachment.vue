<script setup lang="ts">
import type { IAttachment } from "@src/shared/types/types";

import {
  ArrowPathRoundedSquareIcon,
  DocumentIcon,
  PhotoIcon,
  TrashIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
} from "@heroicons/vue/24/outline";
import Button from "@src/ui/inputs/Button.vue";

const props = defineProps<{
  attachment: IAttachment;
}>();

const emit = defineEmits<{
  (e: "remove", id: number): void;
  (e: "replace", id: number): void;
}>();
</script>

<template>
  <div href="#" class="flex transition-all duration-300 text-sm">
    <!--icon-->
    <div
      class="w-8 h-8 mr-4 rounded-full flex justify-center items-center bg-app-bg-secondary flex-shrink-0"
    >
      <PhotoIcon
        v-if="attachment.type === 'image'"
        class="stroke-1 h-5 w-5 text-app-text"
      />
      <VideoCameraIcon
        v-else-if="attachment.type === 'video'"
        class="stroke-1 h-5 w-5 text-app-text"
      />
      <DocumentIcon
        v-else-if="attachment.type === 'file'"
        class="stroke-1 h-5 w-5 text-app-text"
      />
      <MusicalNoteIcon v-else class="stroke-1 h-5 w-5 text-app-text" />
    </div>

    <!--name, date and size-->
    <div class="grow min-w-0 mr-2">
      <div class="flex items-center justify-between mb-2">
        <p class="truncate" tabindex="0">
          {{ attachment.name }}
        </p>
      </div>

      <div class="flex justify-start">
        <p class="text-app-text-secondary" tabindex="0">
          {{ attachment.size }}
        </p>
      </div>
    </div>

    <!--action buttons-->
    <div class="flex items-center flex-shrink-0">
      <Button
        class="mr-2"
        :ring="false"
        icon-only
        variant="ghost"
        size="xs"
        title="Замінити"
        @click="emit('replace', attachment.id)"
      >
        <template #icon>
          <ArrowPathRoundedSquareIcon class="w-6 h-6" />
        </template>
      </Button>
      <Button
        :ring="false"
        icon-only
        variant="ghost"
        size="xs"
        title="Видалити"
        @click="emit('remove', attachment.id)"
      >
        <template #icon>
          <TrashIcon class="w-6 h-6" />
        </template>
      </Button>
    </div>
  </div>
</template>
