<script setup lang="ts">
import { computed } from "vue";
import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import type { TempMessage } from "@src/features/conversations/conversations-store";
import { formatDate } from "@src/shared/utils/utils";

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

const showDoubleCheck = computed(() => {
  return props.tempMessage.status === "sent";
});

const statusColor = computed(() => {
  switch (props.tempMessage.status) {
    case "sending":
      return "text-app-text-secondary";
    case "sent":
      return "text-success";
    case "error":
      return "text-danger";
    default:
      return "text-app-text";
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
</script>

<template>
  <div class="flex items-start gap-4 py-3 px-4 justify-end">
    <!-- Message body -->
    <div class="flex gap-3 items-end">
      <!-- Message content -->
      <div
        class="bg-app-bg-secondary rounded-2xl rounded-tr-sm px-4 py-3 max-w-md relative"
      >
        <!-- Message text -->
        <div class="text-[0.8125rem] leading-relaxed relative pr-6">
          <div class="whitespace-pre-line">{{ tempMessage.message }}</div>

          <!-- Messenger icon -->
          <img
            :src="messengerIcon"
            :alt="messengerName"
            class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-cover bg-center"
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
