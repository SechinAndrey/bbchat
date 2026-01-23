<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import type {
  ApiCommunicationCallInfo,
  ApiChaportMessage,
} from "@src/api/types";
import type { Ref } from "vue";
import { computed, ref } from "vue";
import { convertViberEmoticons } from "@src/shared/utils/viberEmoticons";

import useStore from "@src/shared/store/store";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import useTheme from "@src/shared/theme-system/useTheme";
import {
  getConversationIndex,
  getName,
  shorten,
  formatConversationDate,
  getUserColor,
} from "@src/shared/utils";
import router from "@src/router";
import route from "@src/router";
import {
  ArchiveBoxArrowDownIcon,
  InformationCircleIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";
import {
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentIcon,
  PhoneIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  FaceSmileIcon,
} from "@heroicons/vue/24/solid";
import Dropdown from "@src/ui/navigation/Dropdown/Dropdown.vue";
import ConversationAvatar from "@src/shared/components/ConversationAvatar.vue";
import { parseReplyQuoteText } from "@src/features/chat/utils/replyQuoteParser";
import { getMediaType, isTgsSticker } from "@src/shared/utils/media";

const props = defineProps<{
  conversation: IConversation;
}>();

const store = useStore();
const authStore = useAuthStore();
const { isDarkMode } = useTheme();

const showContextMenu = ref(false);

const contextMenuCoordinations: Ref<{ x: number; y: number } | undefined> =
  ref();

// open context menu.
const handleShowContextMenu = (event: MouseEvent) => {
  showContextMenu.value = true;
  contextMenuCoordinations.value = {
    x:
      window.innerWidth - 205 <= event.pageX
        ? window.innerWidth - 220
        : event.pageX,
    y:
      window.innerHeight - 125 <= event.pageY
        ? window.innerHeight - 200
        : event.pageY,
  };
};

const contact = computed(() => {
  return props.conversation.contact;
});

// (event) closes the context menu
const handleCloseContextMenu = () => {
  showContextMenu.value = false;
};

// (event) select this conversation.
const handleSelectConversation = () => {
  showContextMenu.value = false;
  const id = Number(props.conversation.id);
  let url = store.isWidget ? "/widget" : "/chat";
  url += `/${props.conversation.entity}/${id}/contact/${contact.value?.id}`;
  router.push({
    path: url,
  });
};

// last message in conversation to display
const lastMessage = computed(
  () => props.conversation.messages[props.conversation.messages.length - 1],
);

const chaport = computed<ApiChaportMessage | null>(() => {
  return lastMessage.value?.chaport_messages || null;
});

const echat = computed(() => {
  return lastMessage.value?.echat_messages || null;
});

const echatMessage = computed(() => {
  if (typeof echat.value?.message_json === "string") {
    try {
      const parsed = JSON.parse(echat.value.message_json);
      return parsed;
    } catch {
      return {};
    }
  }
  return echat.value?.message_json || {};
});

const call = computed<ApiCommunicationCallInfo | null>(() => {
  return lastMessage.value?.call || null;
});

// (event) remove the unread indicator when opening the conversation
const handleRemoveUnread = () => {
  let index = getConversationIndex(props.conversation.id);
  if (index !== undefined) {
    store.conversations[index].unread = 0;
  }
};

const isActive = computed(() => {
  const currentConversationId = route.currentRoute.value.params.contactId;
  return contact.value?.id.toString() === currentConversationId;
});

const lastMessageDate = computed(() => {
  if (call.value?.created_at) {
    return formatConversationDate(call.value.created_at);
  } else if (chaport.value?.created_at) {
    return formatConversationDate(chaport.value.created_at);
  } else if (echat.value?.created_at) {
    return formatConversationDate(echat.value.created_at);
  }
  return "";
});

const getMediaIcon = (url: string) => {
  if (isTgsSticker(url)) {
    return FaceSmileIcon;
  }

  const type = getMediaType(url);
  switch (type) {
    case "image":
      return PhotoIcon;
    case "video":
      return VideoCameraIcon;
    case "audio":
      return MusicalNoteIcon;
    case "file":
      return DocumentIcon;
    default:
      return DocumentIcon;
  }
};

const getMediaLabel = (url: string): string => {
  if (isTgsSticker(url)) {
    return "Стікер";
  }

  const type = getMediaType(url);
  switch (type) {
    case "image":
      return "Зображення";
    case "video":
      return "Відео";
    case "audio":
      return "Аудіо";
    case "file":
      return "Файл";
    default:
      return "Медіа";
  }
};

const mediaUrl = computed(() => {
  return (
    echatMessage.value?.media ||
    echatMessage.value?.file ||
    chaport.value?.file ||
    null
  );
});

const mediaIcon = computed(() => {
  if (mediaUrl.value) {
    return getMediaIcon(mediaUrl.value);
  }
  return null;
});

const lastMessageText = computed(() => {
  if (call.value?.billsec) {
    return `Дзвінок ${call.value.billsec}c`;
  } else if (chaport.value?.message) {
    return chaport.value?.message;
  } else if (echat.value?.message) {
    // Only convert for Viber messages
    if (echat.value?.dialog?.messenger_id == 2) {
      return convertViberEmoticons(echat.value.message);
    }
    return echat.value.message;
  } else if (echatMessage.value?.message) {
    // Only convert for Viber messages
    if (echat.value?.dialog?.messenger_id == 2) {
      return convertViberEmoticons(echatMessage.value.message);
    }
    return echatMessage.value.message;
  } else if (mediaUrl.value) {
    return getMediaLabel(mediaUrl.value);
  }
  return "";
});

const parsedReplyQuote = computed(() => {
  return parseReplyQuoteText(lastMessageText.value);
});

const callTypeIcon = computed(() => {
  if (!call.value) return PhoneIcon;
  // call_type: 0 - incoming, 1 - outgoing
  return call.value.call_type === 0
    ? PhoneArrowDownLeftIcon
    : PhoneArrowUpRightIcon;
});

const lastMessageDirection = computed(() => {
  if (call.value) {
    return call.value.call_type === 0 ? "in" : "out";
  } else if (chaport.value) {
    return chaport.value?.type_id === 1 ? "in" : "out";
  } else if (echat.value) {
    return echat.value?.direction === 0 ? "in" : "out";
  }
  return undefined;
});

const displayName = computed(() => {
  if (lastMessageDirection.value === "in") {
    return props.conversation.contact?.firstName + ":";
  } else if (lastMessageDirection.value === "out") {
    return "Ви: ";
  } else {
    return props.conversation.contact?.firstName;
  }
});

const city = computed(() => {
  return props.conversation.city;
});

// Message status logic (same as MessageV2.vue)
const isSelfMessage = computed(() => {
  if (!lastMessage.value) return false;
  return (
    lastMessage.value.user_id ||
    lastMessage.value.chaport_messages?.type_id === 2 ||
    lastMessage.value.chaport_messages?.type_id === 3
  );
});

const isReadByContact = computed(() => {
  if (!lastMessage.value) return false;
  return lastMessage.value.viewed_by_contact === 1;
});

const statusColor = computed(() => {
  if (!isSelfMessage.value) return "";
  return isReadByContact.value ? "text-success" : "text-app-text-secondary";
});

const showDoubleCheck = computed(() => {
  return isSelfMessage.value;
});

const userNameColor = computed(() => {
  if (!props.conversation?.userId) return "text-gray-400";
  return getUserColor(props.conversation.userId, isDarkMode.value);
});
</script>

<template>
  <div class="select-none" :data-contact-id="contact?.id">
    <!-- @contextmenu.prevent="handleShowContextMenu" -->
    <button
      :aria-label="'Комунікація з ' + getName(props.conversation)"
      tabindex="0"
      class="w-full h-[5.75rem] px-5 py-4 mb-3 flex focus:outline-none transition duration-500 ease-out"
      :class="{
        'bg-app-bg': isActive,
      }"
      @click="
        () => {
          handleRemoveUnread();
          handleSelectConversation();
        }
      "
    >
      <!--profile image-->
      <div class="mr-4">
        <ConversationAvatar
          :conversation="props.conversation"
          :is-active="isActive"
          :avatar-url="props.conversation?.contact?.avatar"
        />
      </div>

      <div class="w-full flex flex-col min-w-0">
        <div class="w-full flex items-start gap-2 mb-2 min-w-0">
          <!--conversation name-->
          <div
            :title="getName(props.conversation)"
            class="line-clamp-1 text-ellipsis overflow-hidden min-w-0 flex-1 text-left"
          >
            {{ getName(props.conversation) }}
          </div>
          <!--user name and city (admin only) in two rows-->
          <div
            v-if="
              authStore.currentUser?.roleId === 1 &&
              (props.conversation.userName || city)
            "
            class="flex flex-col items-end gap-0.5 flex-shrink-0"
          >
            <div
              v-if="props.conversation.userName"
              :class="userNameColor"
              class="text-[0.5625rem] font-medium whitespace-nowrap"
            >
              {{ props.conversation.userName }}
            </div>
            <div
              v-if="city"
              class="text-[0.5625rem] text-app-text-secondary whitespace-nowrap"
            >
              {{ city }}
            </div>
          </div>
          <!--city only (for non-admin)-->
          <div
            v-else-if="city"
            class="text-[0.5625rem] text-app-text-secondary whitespace-nowrap flex-shrink-0"
          >
            {{ city }}
          </div>
        </div>

        <div
          class="text-[0.5625rem] text-left text-app-text-secondary flex justify-between"
        >
          {{ displayName }}
          <span
            class="whitespace-nowrap text-[0.5625rem] text-app-text-secondary"
          >
            {{ lastMessageDate }}
          </span>
        </div>

        <div class="flex justify-between mt-2 min-w-0">
          <div class="min-w-0 flex-1">
            <p
              v-if="lastMessageText"
              class="flex justify-start items-center text-[0.688rem] relative pr-2 min-w-0"
              :class="{ 'text-primary': props.conversation.unread }"
            >
              <component
                :is="callTypeIcon"
                v-if="call"
                class="w-4 h-4 text-blue-500 mr-2"
              />
              <component
                :is="mediaIcon"
                v-else-if="mediaIcon"
                class="w-5 h-5 text-app-text-secondary mr-2"
              />
              <img
                v-else-if="echat?.dialog?.messenger_id"
                :src="
                  echat.dialog.messenger_id == 1
                    ? '/imgs/telegram.png'
                    : '/imgs/viber.png'
                "
                :alt="echat.dialog.messenger_id == 1 ? 'Telegram' : 'Viber'"
                class="w-4 h-4 rounded-full bg-cover bg-center mr-2"
              />
              <img
                v-else-if="chaport"
                src="/imgs/chaport.png"
                alt="Chaport"
                class="w-4 h-4 mr-2"
              />

              <span
                :class="{
                  'text-primary': props.conversation.unread,
                  'truncate block max-w-full': true,
                }"
              >
                {{
                  shorten(parsedReplyQuote?.replyMessageText || lastMessageText)
                }}
              </span>

              <!-- Status indicator for outgoing messages -->
              <span
                v-if="isSelfMessage"
                class="ml-1 flex items-center gap-0"
                :class="statusColor"
              >
                <CheckIcon class="w-3 h-3" />
                <CheckIcon v-if="showDoubleCheck" class="w-3 h-3 -ml-1.5" />
              </span>
            </p>

            <p
              v-else
              class="flex justify-start items-center text-[0.688rem] italic"
            >
              Почніть розмову
            </p>
          </div>
          <div
            v-if="props.conversation.unread"
            class="text-white bg-primary flex items-center justify-center text-xs font-medium min-w-[1.25rem] h-5 px-1.5 rounded-full"
          >
            {{ props.conversation.unread }}
          </div>
        </div>
      </div>
    </button>

    <!--custom context menu-->
    <Dropdown
      :close-dropdown="() => (showContextMenu = false)"
      :show="showContextMenu"
      :handle-close="handleCloseContextMenu"
      :handle-click-outside="handleCloseContextMenu"
      :coordinates="{
        left: contextMenuCoordinations?.x + 'px',
        top: contextMenuCoordinations?.y + 'px',
      }"
      :position="['top-0']"
    >
      <button
        class=""
        aria-label="Show conversation information"
        role="menuitem"
        @click="handleCloseContextMenu"
      >
        <InformationCircleIcon class="h-5 w-5 mr-3" />
        Conversation info
      </button>

      <button
        class=""
        aria-label="Add conversation to archive"
        role="menuitem"
        @click="handleCloseContextMenu"
      >
        <ArchiveBoxArrowDownIcon class="h-5 w-5 mr-3" />
        Archive conversation
      </button>

      <button
        class=""
        aria-label="Delete the conversation"
        role="menuitem"
        @click="handleCloseContextMenu"
      >
        <TrashIcon class="h-5 w-5 mr-3" />
        Delete conversation
      </button>
    </Dropdown>
  </div>
</template>
