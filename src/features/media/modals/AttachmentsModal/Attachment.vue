<script setup lang="ts">
import type { IAttachment } from "@src/shared/types/types";

import {
  ArrowPathRoundedSquareIcon,
  DocumentIcon,
  PhotoIcon,
  TrashIcon,
  VideoCameraIcon,
} from "@heroicons/vue/24/outline";
import Button from "@src/ui/inputs/Button.vue";

const props = defineProps<{
  attachment: IAttachment;
}>();

const emit = defineEmits<{
  (e: "remove", id: number): void;
}>();
</script>

<template>
  <div href="#" class="flex px-5 py-4 transition-all duration-300 text-sm">
    <!--icon-->
    <div
      class="w-8 h-8 mr-4 rounded-full flex justify-center items-center bg-app-bg-secondary"
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
    </div>

    <!--name, date and size-->
    <div class="grow">
      <div class="flex items-center justify-between mb-2">
        <p class="" tabindex="0">
          {{ attachment.name }}
        </p>
      </div>

      <div class="flex justify-start">
        <p class="" tabindex="0">
          {{ attachment.size }}
        </p>
      </div>
    </div>

    <!--action buttons-->
    <div class="flex items-center">
      <Button
        class="mr-2"
        :ring="false"
        icon-only
        variant="ghost"
        size="xs"
        title="Замінити"
      >
        <template #icon>
          <ArrowPathRoundedSquareIcon />
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
          <TrashIcon />
        </template>
      </Button>
    </div>
  </div>
</template>
