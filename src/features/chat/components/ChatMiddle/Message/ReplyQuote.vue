<script setup lang="ts">
import { computed } from "vue";
import type { ApiMessageItem, ApiReplyMessageItem } from "@src/api/types";
import MediaPreviewCompact from "@src/features/chat/components/ChatMiddle/Message/MediaPreviewCompact.vue";
import { useMessageData } from "@src/features/chat/composables/useMessageData";

const props = defineProps<{
  message: ApiMessageItem | ApiReplyMessageItem;
}>();

const emit = defineEmits<{
  click: [];
}>();

const { media, senderName, getMessageText } = useMessageData(
  computed(() => props.message),
);

const messageText = getMessageText(100);
const isSelf = computed(() => {
  return props.message.user_id;
});
</script>

<template>
  <div
    class="mb-2 p-2 bg-app-bg/50 border-l-2 border-primary cursor-pointer hover:bg-app-bg/70 transition-colors"
    @click="emit('click')"
  >
    <div class="flex items-start gap-2">
      <MediaPreviewCompact v-if="media" :media="media" class="flex-shrink-0" />

      <div class="flex-1 min-w-0">
        <div class="text-xs text-primary font-medium truncate">
          {{ isSelf ? "Ви:" : senderName }}
        </div>
        <div class="text-xs text-app-text-secondary truncate">
          {{ messageText }}
        </div>
      </div>
    </div>
  </div>
</template>
