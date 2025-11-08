<script setup lang="ts">
import { computed } from "vue";
import {
  CheckIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/vue/24/outline";
import type { TempMessage } from "@src/features/conversations/conversations-store";
import { formatDate } from "@src/shared/utils/utils";
import ReplyQuote from "@src/features/chat/components/ChatMiddle/Message/ReplyQuote.vue";

const props = defineProps<{
  tempMessage: TempMessage;
}>();

const statusIcon = computed(() => {
  switch (props.tempMessage.status) {
    case "sending":
      return CheckIcon;
    case "sent":
      return CheckIcon;
    case "error":
      return XMarkIcon;
    default:
      return CheckIcon;
  }
});

// For temp messages: sending = 1 gray check, sent = 2 gray checks
const showDoubleCheck = computed(() => {
  return props.tempMessage.status === "sent";
});

const statusColor = computed(() => {
  switch (props.tempMessage.status) {
    case "sending":
      return "text-app-text-secondary"; // gray - sending
    case "sent":
      return "text-app-text-secondary"; // gray - sent (not yet read)
    case "error":
      return "text-danger"; // red - error
    default:
      return "text-app-text-secondary";
  }
});

const messengerIcon = computed(() => {
  switch (props.tempMessage.messengerId) {
    case 1:
      return "/imgs/telegram.png";
    case 2:
      return "/imgs/viber.png";
    case 3:
      return "/imgs/chaport.png";
    default:
      return "/imgs/default-messenger.png";
  }
});

const messengerName = computed(() => {
  switch (props.tempMessage.messengerId) {
    case 1:
      return "Telegram";
    case 2:
      return "Viber";
    case 3:
      return "Chaport";
    default:
      return "Unknown Messenger";
  }
});

const hasFile = computed(() => {
  return !!props.tempMessage.fileUrl;
});
</script>

<template>
  <div class="flex items-start gap-4 py-3 px-4 justify-end">
    <!-- Message body -->
    <div class="flex gap-3 items-end">
      <!-- Message content -->
      <div
        class="relative bg-app-bg-secondary rounded-2xl rounded-tl-sm min-h-[2.313rem] min-w-10 px-4 py-3 max-w-md"
      >
        <!-- Reply Quote -->
        <ReplyQuote
          v-if="tempMessage.replyMessage"
          :message="tempMessage.replyMessage"
          @click="() => {}"
        />

        <!-- File attachment (if exists) -->
        <div v-if="hasFile" class="mb-2">
          <!-- Loading state for file upload -->
          <div
            class="flex items-center gap-3 p-3 bg-app-bg/50 rounded-lg border border-app-border"
          >
            <ArrowUpTrayIcon class="w-5 h-5 text-app-text-secondary" />
            <div class="flex-1 min-w-0">
              <div class="text-xs text-app-text-secondary truncate">
                Завантаження файлу...
              </div>
            </div>
            <div
              class="w-4 h-4 border-2 border-app-text-secondary border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        </div>

        <!-- Message text -->
        <div
          v-if="tempMessage.message"
          class="text-[0.8125rem] leading-relaxed relative pr-6"
        >
          <div class="whitespace-pre-line">{{ tempMessage.message }}</div>

          <!-- Messenger icon -->
          <img
            :src="messengerIcon"
            :alt="messengerName"
            class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-cover bg-center"
          />
        </div>

        <!-- Messenger icon (when only file, no text) -->
        <div v-else-if="hasFile" class="flex justify-end">
          <img
            :src="messengerIcon"
            :alt="messengerName"
            class="w-4 h-4 rounded-full bg-cover bg-center"
          />
        </div>

        <!-- Status indicator -->
        <div
          class="absolute text-xs bottom-0 -right-[0.2rem]"
          :class="statusColor"
        >
          <component :is="statusIcon" class="w-4 h-4" />
          <component
            :is="statusIcon"
            v-if="showDoubleCheck"
            class="w-4 h-4 absolute top-0 left-[0.188rem]"
          />
        </div>
      </div>

      <div class="flex items-end gap-1">
        <div class="text-[0.625rem] font-light text-text-secondary">
          {{
            formatDate(tempMessage.timestamp, {
              hour: "numeric",
              minute: "numeric",
            })
          }}
        </div>
      </div>
    </div>
  </div>
</template>
