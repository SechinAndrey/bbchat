<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import type {
  ApiCommunicationCallInfo,
  ApiChaportMessage,
} from "@src/api/types";
import type { Ref } from "vue";
import { computed, ref } from "vue";

import useStore from "@src/shared/store/store";
import {
  getConversationIndex,
  getName,
  shorten,
  formatConversationDate,
} from "@src/shared/utils/utils";
import router from "@src/router";
import route from "@src/router";
import {
  ArchiveBoxArrowDownIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import Dropdown from "@src/ui/navigation/Dropdown/Dropdown.vue";
import ConversationAvatar from "@src/shared/components/ConversationAvatar.vue";

const props = defineProps<{
  conversation: IConversation;
}>();

const store = useStore();

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

// (event) closes the context menu
const handleCloseContextMenu = () => {
  showContextMenu.value = false;
};

// (event) select this conversation.
const handleSelectConversation = () => {
  showContextMenu.value = false;
  const id = Number(props.conversation.id);
  router.push({ path: `/chat/${props.conversation.entity}/${id}/` });
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
    return JSON.parse(echat.value.message_json);
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
  const currentConversationId = route.currentRoute.value.params.id;
  return currentConversationId === props.conversation.id.toString();
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

const lastMessageText = computed(() => {
  if (call.value?.billsec) {
    return `Дзвінок ${call.value.billsec}c`;
  } else if (chaport.value?.message) {
    return chaport.value?.message;
  } else if (echatMessage.value?.message) {
    return echatMessage.value.message;
  } else if (echatMessage.value?.media) {
    return "Медіа повідомлення";
  }
  return "";
});
</script>

<template>
  <div class="select-none">
    <button
      :aria-label="'Комунікація з ' + getName(props.conversation)"
      tabindex="0"
      class="w-full h-[5.75rem] px-5 py-6 mb-3 flex focus:outline-none transition duration-500 ease-out"
      :class="{
        'bg-app-bg': isActive,
      }"
      @contextmenu.prevent="handleShowContextMenu"
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
        />
      </div>

      <div class="w-full flex flex-col">
        <div class="w-full">
          <!--conversation name-->
          <div class="flex items-start">
            <div class="grow mb-2 text-start">
              <p class="">
                {{ getName(props.conversation) }}
              </p>
            </div>

            <!--last message date-->
            <p
              class="whitespace-nowrap text-[0.5625rem] text-app-text-secondary"
            >
              {{ lastMessageDate }}
            </p>
          </div>
        </div>

        <div class="text-[0.5625rem] text-left text-app-text-secondary">
          {{ props.conversation.contacts?.at(0)?.firstName }}
        </div>

        <div class="flex justify-between">
          <div>
            <!--draft Message-->
            <!-- <p
              v-if="
                props.conversation.draftMessage &&
                props.conversation.id !== getActiveConversationId()
              "
              class=" flex justify-start items-center text-danger"
            >
              draft: {{ shorten(props.conversation.draftMessage) }}
            </p> -->

            <!--recording name-->
            <!-- <p
              v-else-if="
                lastMessage &&
                lastMessage.type === 'recording' &&
                lastMessage.content
              "
              class="  flex justify-start items-center"
            >
              <MicrophoneIcon
                class="w-4 h-4 mr-2 text-black opacity-60 dark:text-white dark:opacity-70"
                :class="{ 'text-primary': props.conversation.unread }"
              />
              <span :class="{ 'text-primary': props.conversation.unread }">
                Recording
                {{ (lastMessage.content as IRecording).duration }}
              </span>
            </p> -->

            <!--attachments title-->
            <!-- <p
              v-else-if="lastMessage && hasAttachments(lastMessage)"
              class="  flex justify-start items-center"
              :class="{ 'text-primary': props.conversation.unread }"
            >
              <span :class="{ 'text-primary': props.conversation.unread }">
                {{ (lastMessage?.attachments as IAttachment[])[0].name }}
              </span>
            </p> -->

            <!--last message content -->
            <!-- <p
              v-else-if="lastMessage"
              class="  flex justify-start items-center"
              :class="{ 'text-primary': props.conversation.unread }"
            >
              <span :class="{ 'text-primary': props.conversation.unread }">
                {{ shorten(lastMessage) }}
              </span>
            </p> -->

            <p
              v-if="lastMessageText"
              class="flex justify-start items-center"
              :class="{ 'text-primary': props.conversation.unread }"
            >
              <span :class="{ 'text-primary': props.conversation.unread }">
                {{ shorten(lastMessageText) }}
              </span>
            </p>
          </div>

          <div v-if="props.conversation.unread">
            <div
              class="w-[1.125rem] h-[1.125rem] flex justify-center items-center rounded-[50%] bg-primary"
            >
              <p class="text-white">
                {{ props.conversation.unread }}
              </p>
            </div>
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
