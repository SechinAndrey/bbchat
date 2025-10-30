<script setup lang="ts">
import type { ApiMessageItem } from "@src/api/types";
import { computed, ref } from "vue";
import {
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/vue/24/solid";
import { CheckIcon } from "@heroicons/vue/24/outline";
import linkifyStr from "linkify-string";
import MediaPreview from "@src/features/chat/components/ChatMiddle/Message/MediaPreview.vue";
import ConversationAvatar from "@src/shared/components/ConversationAvatar.vue";
import { formatDate } from "@src/shared/utils/utils";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import CallPlayer from "@src/features/chat/components/ChatMiddle/Message/CallPlayer.vue";
import Button from "@src/ui/inputs/Button.vue";
import Robo1Icon from "@src/shared/icons/Robo1Icon.vue";
import { useLongPress } from "@src/shared/composables/useLongPress";

const props = defineProps<{
  message: ApiMessageItem;
  // self: boolean;
}>();

const emit = defineEmits<{
  openImageGallery: [imageUrl: string];
  openContextMenu: [message: ApiMessageItem, event: MouseEvent | TouchEvent];
}>();

const conversationsStore = useConversationsStore();

const isCallDetailsExpanded = ref(true);

const { onTouchStart, onTouchEnd, onTouchMove } = useLongPress({
  delay: 500,
  onLongPress: (event) => {
    emit("openContextMenu", props.message, event);
  },
});

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault();
  emit("openContextMenu", props.message, event);
};

const isSelf = computed(() => {
  return (
    props.message.user_id ||
    props.message.chaport_messages?.type_id === 2 ||
    props.message.chaport_messages?.type_id === 3
  );
});

const toggleCallDetails = () => {
  isCallDetailsExpanded.value = !isCallDetailsExpanded.value;
};

const chaport = computed(() => {
  return props.message.chaport_messages;
});

const echat = computed(() => {
  return props.message.echat_messages;
});

const echatMessage = computed(() => {
  if (typeof echat.value?.message_json === "string") {
    return JSON.parse(echat.value.message_json);
  }
  return echat.value?.message_json || {};
});

const call = computed(() => {
  return props.message.call;
});

const callTypeIcon = computed(() => {
  if (!call.value) return PhoneIcon;
  // call_type: 0 - incoming, 1 - outgoing
  return call.value.call_type === 0
    ? PhoneArrowDownLeftIcon
    : PhoneArrowUpRightIcon;
});

const callStatusText = computed(() => {
  if (!call.value) return "";
  const disposition = call.value.disposition;
  switch (disposition) {
    case "ANSWERED":
      return "Відповів";
    case "CANCEL":
      return "Скасовано";
    case "NO ANSWER":
      return "Не відповів";
    case "BUSY":
      return "Зайнято";
    default:
      return disposition;
  }
});

const formatDuration = (seconds: number) => {
  if (seconds === 0) return "0 сек";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes} хв ${remainingSeconds} сек`;
  }
  return `${remainingSeconds} сек`;
};

const formatMessageText = (text: string) => {
  if (!text) return "";

  return linkifyStr(text, {
    className: isSelf.value
      ? "text-black opacity-50"
      : "text-primary dark:text-primary",
    format: {
      url: (value) => (value.length > 50 ? value.slice(0, 50) + `…` : value),
    },
    target: "_blank",
  });
};
</script>

<template>
  <div
    class="flex items-start gap-4 py-3 px-4"
    :class="{ 'justify-end': isSelf }"
    @contextmenu="handleContextMenu"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @touchmove="onTouchMove"
  >
    <ConversationAvatar
      v-if="!isSelf && conversationsStore.activeConversation"
      :conversation="conversationsStore.activeConversation"
      is-active
    />

    <!-- Message body -->
    <div class="flex gap-3 items-end">
      <!-- Message content -->
      <div
        class="relative bg-app-bg-secondary rounded-2xl rounded-tl-sm min-h-[2.313rem] min-w-10 px-4 py-3 max-w-md transition-all duration-300"
        :class="{
          'w-[225px]': call && !isCallDetailsExpanded,
          'w-[260px]': call && isCallDetailsExpanded,
        }"
      >
        <!-- 1 - чапорт -->
        <div
          v-if="chaport"
          class="text-[0.8125rem] leading-relaxed relative pr-6"
        >
          <div
            class="whitespace-pre-line"
            v-html="formatMessageText(chaport.message)"
          ></div>
        </div>

        <!-- 2 - мессенджер -->
        <!-- message_telegram_id - telegram | viber -->
        <div
          v-if="echat"
          class="text-[0.8125rem] leading-relaxed relative pr-6"
        >
          <div
            v-if="echat.message"
            class="whitespace-pre-line"
            v-html="formatMessageText(echat.message)"
          ></div>
          <!--media preview-->
          <MediaPreview
            v-if="echatMessage.media || echatMessage.file"
            :media="echatMessage.media || echatMessage.file"
            :attachment-id="props.message.id"
            @open-image-gallery="
              (imageUrl) => {
                emit('openImageGallery', imageUrl);
              }
            "
          />
        </div>

        <!-- 3 - звонок -->
        <div v-if="call" class="text-[0.8125rem] leading-relaxed">
          <div class="flex items-center gap-2 mb-2">
            <component :is="callTypeIcon" class="w-4 h-4 text-blue-500" />
            <span class="font-medium">
              {{
                call.call_type === 0 ? "Вхідний дзвінок" : "Вихідний дзвінок"
              }}
            </span>
            <Button
              class="ml-auto"
              variant="ghost"
              size="xs"
              icon-only
              @click="toggleCallDetails"
            >
              <template #icon>
                <component
                  :is="isCallDetailsExpanded ? ChevronUpIcon : ChevronDownIcon"
                  class="w-5 h-5"
                />
              </template>
            </Button>
          </div>
          <Transition name="call-details-fade">
            <div
              v-show="isCallDetailsExpanded"
              class="text-text-secondary overflow-hidden"
            >
              <div class="flex justify-between gap-10">
                <span>Номер:</span>
                <span>{{ call.phone }}</span>
              </div>
              <div class="flex justify-between gap-10">
                <span>Статус:</span>
                <span>{{ callStatusText }}</span>
              </div>
              <div class="flex justify-between gap-10">
                <span>Тривалість:</span>
                <span>{{ formatDuration(call.billsec) }}</span>
              </div>
              <div class="flex justify-between gap-10">
                <span>Час очікування:</span>
                <span>{{ formatDuration(call.waitsec) }}</span>
              </div>
              <CallPlayer
                v-if="call.binotel_id"
                :binotel-id="call.binotel_id"
                class="m-2 mt-3"
              />
            </div>
          </Transition>
        </div>

        <img
          v-if="chaport"
          src="/imgs/chaport.png"
          alt="Chaport"
          class="absolute bottom-3 right-3 w-4 h-4"
        />

        <img
          v-if="echat"
          :src="
            echat.dialog.messenger_id == 1
              ? '/imgs/telegram.png'
              : '/imgs/viber.png'
          "
          :alt="echat.dialog.messenger_id == 1 ? 'Telegram' : 'Viber'"
          class="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-cover bg-center"
        />

        <div
          v-if="isSelf"
          class="absolute text-xs bottom-0 -right-[0.2rem] text-success"
        >
          <CheckIcon class="w-4 h-4" />
          <CheckIcon class="w-4 h-4 absolute top-0 left-[0.188rem]" />
        </div>
      </div>
      <!-- Time -->

      <div class="text-[0.625rem] font-light text-text-secondary flex-col">
        <Robo1Icon
          v-if="chaport?.type_id === 3"
          class="text-app-text opacity-70 w-5 h-5 mb-1"
        />
        {{
          formatDate(message.created_at, {
            hour: "numeric",
            minute: "numeric",
          })
        }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation for call details expand/collapse */
.call-details-fade-enter-active,
.call-details-fade-leave-active {
  transition:
    height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s,
    margin 0.3s;
}
.call-details-fade-enter-from,
.call-details-fade-leave-to {
  height: 0;
  opacity: 0;
  margin-top: 0;
}
.call-details-fade-enter-to,
.call-details-fade-leave-from {
  height: auto;
  opacity: 1;
  margin-top: 0.25rem;
}
</style>
