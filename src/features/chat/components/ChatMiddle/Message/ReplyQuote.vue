<script setup lang="ts">
import { computed } from "vue";
import type { ApiMessageItem, ApiReplyMessageItem } from "@src/api/types";
import MediaPreviewCompact from "@src/features/chat/components/ChatMiddle/Message/MediaPreviewCompact.vue";
import { useMessageData } from "@src/features/chat/composables/useMessageData";

const props = defineProps<{
  message: ApiMessageItem | ApiReplyMessageItem;
  replyToText?: string;
}>();

const emit = defineEmits<{
  click: [string | undefined];
}>();

const { media, senderName, getMessageText } = useMessageData(
  computed(() => props.message),
);

const messageText = getMessageText(200);
const isSelf = computed(() => {
  return props.message.user_id;
});
const isDeleted = computed(() => {
  return !!props.message.deleted_at;
});
</script>

<template>
  <div
    class="mb-2 p-2 bg-app-bg/50 border-l-2 border-primary cursor-pointer hover:bg-app-bg/70 transition-colors"
    :class="{ 'opacity-70': isDeleted }"
    @click="emit('click', replyToText)"
  >
    <div class="flex items-start gap-2">
      <MediaPreviewCompact
        v-if="media"
        :media="media"
        class="flex-shrink-0"
        :class="{ 'opacity-50': isDeleted }"
      />

      <div class="flex-1 min-w-0">
        <div class="text-xs text-primary font-medium truncate">
          {{ isSelf ? "Ви:" : senderName }}
        </div>
        <div
          class="text-xs text-app-text-secondary truncate"
          :class="{ 'line-through': isDeleted }"
        >
          {{ replyToText || messageText }}
        </div>
        <span
          v-if="isDeleted"
          class="text-[0.65rem] italic text-app-text-secondary/70 block mt-0.5"
        >
          (видалено)
        </span>
        <span
          v-if="replyToText && !isDeleted"
          class="absolute top-4 right-0 text-[2rem] leading-3 text-app-text-secondary select-none"
          >&rdquo;</span
        >
      </div>
    </div>
  </div>
</template>
