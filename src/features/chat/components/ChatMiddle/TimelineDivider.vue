<script setup lang="ts">
import { computed } from "vue";
import { formatMessageDate } from "@src/shared/utils/utils";

interface Props {
  date: string | Date;
}

const props = defineProps<Props>();

const formattedDate = computed(() => formatMessageDate(props.date));
</script>

<template>
  <div class="relative flex items-center justify-center my-3 px-4">
    <div
      class="absolute inset-x-4 h-px border-t border-dashed border-app-divider"
    ></div>
    <div
      class="relative flex items-center gap-2 px-3 py-1 bg-app-bg border border-app-border rounded-lg"
    >
      <span class="font-medium text-app-text-secondary text-[0.75rem]">
        {{ formattedDate }}
      </span>
    </div>
  </div>
</template>
