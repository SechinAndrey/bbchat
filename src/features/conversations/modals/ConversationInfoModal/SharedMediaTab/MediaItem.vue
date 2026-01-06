<script setup lang="ts">
import type { IAttachment } from "@src/shared/types/types";
import { truncateFileName } from "@src/shared/utils/media";

import {
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps<{
  attachment: IAttachment;
  date: string;
}>();
</script>

<template>
  <button
    class="w-full p-5 flex hover:bg-primary-hover/10 active:bg-primary-hover/20 dark:hover:bg-gray-600 dark:focus:bg-gray-600 outline-none transition-all duration-300"
  >
    <!--icon-->
    <div
      class="w-8 h-8 mr-4 flex justify-center items-center rounded-full bg-gray-50 dark:bg-gray-500"
    >
      <PhotoIcon
        v-if="props.attachment.type === 'image'"
        class="h-5 w-5 text-gray-500 dark:text-white dark:text-opacity-70"
      />
      <DocumentIcon
        v-else-if="props.attachment.type === 'file'"
        class="h-5 w-5 text-gray-500 dark:text-white dark:text-opacity-70"
      />
      <VideoCameraIcon
        v-else-if="props.attachment.type === 'video'"
        class="h-5 w-5 text-gray-500 dark:text-white dark:text-opacity-70"
      />
    </div>

    <!--name, date and size-->
    <div class="grow">
      <div class="flex items-center justify-between mb-3">
        <p class="truncate" :title="props.attachment.name">
          {{ truncateFileName(props.attachment.name) }}
        </p>

        <p class="">
          {{ props.date }}
        </p>
      </div>

      <div class="flex justify-start">
        <p
          class="font-normal text-sm text-black opacity-60 leading-4 tracking-[.01rem]"
        >
          {{ props.attachment.size }}
        </p>
      </div>
    </div>
  </button>
</template>
