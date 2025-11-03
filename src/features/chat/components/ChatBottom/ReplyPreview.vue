<script setup lang="ts">
import type { ApiMessageItem } from "@src/api/types";
import { computed } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import Button from "@src/ui/inputs/Button.vue";
import MediaPreviewCompact from "@src/features/chat/components/ChatMiddle/Message/MediaPreviewCompact.vue";
import { useMessageData } from "@src/features/chat/composables/useMessageData";

const props = defineProps<{
  message: ApiMessageItem;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { media, senderName, getMessageText } = useMessageData(
  computed(() => props.message),
);

const messageText = getMessageText(200);

const isSelf = computed(() => {
  return props.message.user_id;
});
</script>

<template>
  <div
    class="flex items-start gap-3 px-4 py-3 bg-app-bg-secondary border-l-4 border-primary w-full"
  >
    <MediaPreviewCompact v-if="media" :media="media" />

    <div class="flex-1 min-w-0">
      <div class="text-xs font-medium text-primary">
        {{ isSelf ? "Ви:" : senderName }}
      </div>
      <div class="text-sm text-app-text w-full">{{ messageText }}</div>
    </div>

    <Button
      variant="ghost"
      size="xs"
      icon-only
      :ring="false"
      @click="emit('close')"
    >
      <template #icon>
        <XMarkIcon class="w-5 h-5" />
      </template>
    </Button>
  </div>
</template>
