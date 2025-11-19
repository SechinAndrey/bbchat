<script setup lang="ts">
import type { ApiMessageItem } from "@src/api/types";
import { computed, ref } from "vue";
import {
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
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
import ReplyQuote from "@src/features/chat/components/ChatMiddle/Message/ReplyQuote.vue";
import { useMessageData } from "@src/features/chat/composables/useMessageData";
import { parseReplyQuoteText } from "@src/features/chat/utils/replyQuoteParser";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import useTheme from "@src/shared/theme-system/useTheme";
import { convertViberEmoticons } from "@src/shared/utils/viberEmoticons";

const props = defineProps<{
  message: ApiMessageItem;
  // self: boolean;
}>();

const emit = defineEmits<{
  openImageGallery: [imageUrl: string];
  openContextMenu: [message: ApiMessageItem, event: MouseEvent | TouchEvent];
  scrollToMessage: [messageId: number];
}>();

const conversationsStore = useConversationsStore();
const authStore = useAuthStore();
const { isDarkMode } = useTheme();

const { echat, echatMessage, getMessageText } = useMessageData(
  computed(() => props.message),
);

const parsedReplyQuote = computed(() => {
  return parseReplyQuoteText(getMessageText(200).value);
});

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

const isReadByContact = computed(() => {
  return props.message.viewed_by_contact === 1;
});

const statusColor = computed(() => {
  if (!isSelf.value) return "";
  return isReadByContact.value ? "text-success" : "text-app-text-secondary";
});

const showDoubleCheck = computed(() => {
  return isSelf.value;
});

const toggleCallDetails = () => {
  isCallDetailsExpanded.value = !isCallDetailsExpanded.value;
};

const chaport = computed(() => {
  return props.message.chaport_messages;
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

const formatMessageText = (text: string, convertEmoticons = false) => {
  if (!text) return "";

  const processedText = convertEmoticons ? convertViberEmoticons(text) : text;

  return linkifyStr(processedText, {
    className: isSelf.value
      ? "text-black opacity-50"
      : "text-primary dark:text-primary",
    format: {
      url: (value) => (value.length > 50 ? value.slice(0, 50) + `…` : value),
    },
    target: "_blank",
  });
};

const replyToText = computed(() => {
  return props.message.echat_messages?.reply_to_text || "";
});

const isDeleted = computed(() => {
  return !!props.message.deleted_at;
});

const isAuthorCurrentUser = computed(() => {
  return props.message.user_id === authStore.currentUser?.id;
});

const authorName = computed(() => {
  if (!props.message.user) return "";
  return props.message.user.name || "";
});

const authorTextColor = computed(() => {
  if (!props.message.user_id) return "text-gray-400";

  const colorsLight = [
    "text-blue-600",
    "text-green-600",
    "text-purple-600",
    "text-pink-600",
    "text-indigo-600",
    "text-teal-600",
    "text-orange-600",
    "text-cyan-600",
    "text-red-600",
    "text-amber-600",
    "text-lime-600",
    "text-emerald-600",
    "text-sky-600",
    "text-violet-600",
    "text-fuchsia-600",
    "text-rose-600",
  ];

  const colorsDark = [
    "text-blue-400",
    "text-green-400",
    "text-purple-400",
    "text-pink-400",
    "text-indigo-400",
    "text-teal-400",
    "text-orange-400",
    "text-cyan-400",
    "text-red-400",
    "text-amber-400",
    "text-lime-400",
    "text-emerald-400",
    "text-sky-400",
    "text-violet-400",
    "text-fuchsia-400",
    "text-rose-400",
  ];

  const colors = isDarkMode.value ? colorsDark : colorsLight;

  return colors[props.message.user_id % colors.length];
});
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
      :avatar-url="echat?.avatar"
      is-active
    />

    <!-- Message body -->
    <div class="flex flex-col gap-1 items-end">
      <!-- Message content -->
      <div
        class="relative bg-app-bg-secondary rounded-2xl rounded-tl-sm min-h-[2.313rem] min-w-10 px-4 py-3 pb-6 max-w-md transition-all duration-300"
        :class="{
          'w-[225px]': call && !isCallDetailsExpanded,
          'w-[260px]': call && isCallDetailsExpanded,
          'opacity-60': isDeleted,
        }"
      >
        <div
          v-if="isSelf && !isAuthorCurrentUser && authorName"
          :class="authorTextColor"
          class="text-[0.688rem] font-semibold mb-1 pb-1"
        >
          {{ authorName }}
        </div>

        <!-- Deleted message indicator -->
        <div
          v-if="isDeleted"
          class="flex items-center gap-1.5 text-app-text-secondary text-xs italic mb-2 pb-2 border-b border-app-border"
        >
          <TrashIcon class="w-3.5 h-3.5" />
          <span>Видалено</span>
        </div>

        <!-- 1 - чапорт -->
        <div
          v-if="chaport"
          class="text-[0.8125rem] leading-relaxed relative pr-6 break-all"
        >
          <div
            class="whitespace-pre-line"
            v-html="formatMessageText(chaport.message)"
          ></div>

          <MediaPreview
            v-if="chaport?.file"
            :media="chaport?.file"
            :attachment-id="props.message.id"
            @open-image-gallery="
              (imageUrl) => {
                emit('openImageGallery', imageUrl);
              }
            "
          />
        </div>

        <!-- 2 - мессенджер -->
        <!-- message_telegram_id - telegram | viber -->
        <div
          v-if="echat"
          class="text-[0.8125rem] leading-relaxed relative pr-6 break-all"
        >
          <!-- Reply Message -->
          <ReplyQuote
            v-if="props.message.reply_to"
            :reply-to-text="replyToText"
            :message="props.message.reply_to"
            @click="emit('scrollToMessage', props.message.reply_to.id)"
          />

          <div
            v-if="
              parsedReplyQuote?.originalMessageText &&
              parsedReplyQuote?.replyMessageText
            "
            class="mb-2 p-2 bg-app-bg/50 border-l-2 border-primary"
          >
            <div class="flex items-start gap-2">
              <div class="flex-1 min-w-0">
                <div class="text-xs text-app-text-secondary truncate">
                  {{ parsedReplyQuote?.originalMessageText }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="echat.message">
            <div
              class="whitespace-pre-line"
              v-html="
                formatMessageText(
                  parsedReplyQuote?.replyMessageText || echat.message || '',
                  echat.dialog.messenger_id === 2,
                )
              "
            ></div>
          </div>
          <!--media preview-->
          <MediaPreview
            v-if="echatMessage.media || echatMessage.file || chaport?.file"
            :media="echatMessage.media || echatMessage.file || chaport?.file"
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
          class="absolute bottom-3 right-3 min-w-4 min-h-4 max-w-4 max-h-4 rounded-full bg-cover bg-center"
        />

        <!-- Status indicator for self messages -->
        <div
          v-if="isSelf"
          class="absolute text-xs bottom-0 -right-[0.2rem]"
          :class="statusColor"
        >
          <CheckIcon class="w-4 h-4" />
          <CheckIcon
            v-if="showDoubleCheck"
            class="w-4 h-4 absolute top-0 left-[0.188rem]"
          />
        </div>

        <!-- Time inside message bubble -->
        <div
          class="absolute bottom-[0.32rem] right-6 flex items-center gap-1 text-[0.625rem] font-light text-app-text-secondary"
        >
          <Robo1Icon
            v-if="chaport?.type_id === 3"
            class="text-app-text opacity-70 w-3.5 h-3.5"
          />
          <span class="bg-app-bg-secondary/80 px-1 rounded">
            {{
              formatDate(message.created_at, {
                hour: "numeric",
                minute: "numeric",
              })
            }}
          </span>
        </div>
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
