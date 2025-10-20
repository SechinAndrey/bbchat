<script setup lang="ts">
import type { Ref } from "vue";
import useStore from "@src/shared/store/store";
import { ref, computed, nextTick } from "vue";

import {
  FaceSmileIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";
import AttachmentsModal from "@src/features/media/modals/AttachmentsModal/AttachmentsModal.vue";
import Button from "@src/ui/inputs/Button.vue";
import ScaleTransition from "@src/ui/transitions/ScaleTransition.vue";
import EmojiPicker from "@src/ui/inputs/EmojiPicker/EmojiPicker.vue";
import Textarea from "@src/ui/inputs/Textarea.vue";
import Select from "@src/ui/inputs/Select.vue";
import { useMessageSending } from "@src/features/chat/composables/useMessageSending";
import useConversationsStore from "@src/features/conversations/conversations-store";
import {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
  ApiCommunicationSupplierFull,
  ApiMessageItem,
} from "@src/api/types";
import { useEventBus } from "@vueuse/core";
const eventBus = useEventBus("chat:messages-loaded");

const store = useStore();
const { sendMessage } = useMessageSending();
const conversationsStore = useConversationsStore();

const activeConversation = computed<
  | ApiCommunicationLeadFull
  | ApiCommunicationClientFull
  | ApiCommunicationSupplierFull
  | null
>(() => {
  return conversationsStore.activeConversation;
});

const lastMessage = computed<ApiMessageItem | null>(() => {
  if (!activeConversation.value) return null;
  const messages = activeConversation.value.messages;
  return messages.length > 0 ? messages[messages.length - 1] : null;
});

// the content of the message.
const value: Ref<string> = ref("");
/**
 * Available messenger options for sending messages.
 *
 * [
 *   { value: 1, label: "Telegram", image: "/imgs/telegram.png" },
 *   { value: 2, label: "Viber", image: "/imgs/viber.png" },
 *   { value: 3, label: "Chaport", image: "/imgs/chaport.png" },
 * ]
 */
type MessengerOption = {
  value: number;
  label: string;
  image: string;
};

const messengerOptions = computed<MessengerOption[]>(() => {
  const options: MessengerOption[] = [];

  if (activeConversation.value?.chaport_id) {
    options.push({
      value: 3,
      label: "Chaport",
      image: "/imgs/chaport.png",
    });
  }

  if (activeConversation.value?.tg_name) {
    options.push({
      value: 1,
      label: "Telegram",
      image: "/imgs/telegram.png",
    });
  }

  if (activeConversation.value?.phone) {
    options.push(
      {
        value: 2,
        label: "Viber",
        image: "/imgs/viber.png",
      },
      { value: 1, label: "Telegram", image: "/imgs/telegram.png" },
    );
  }

  return options;
});

const messengerId: Ref<number> = ref(1);

const setMessengerId = () => {
  if (lastMessage.value?.chaport_message_id) return (messengerId.value = 3);
  if (lastMessage.value?.echat_messages?.dialog?.messenger_id)
    return (messengerId.value =
      lastMessage.value.echat_messages.dialog.messenger_id);
  return messengerOptions.value.length > 0
    ? (messengerId.value = messengerOptions.value[0].value)
    : null;
};

eventBus.on(() => {
  setMessengerId();
});

// determines whether the app is recording or not.
const recording = ref(false);

// open emoji picker.
const showPicker = ref(false);

// open modal used to send multiple attachments attachments.
const openAttachmentsModal = ref(false);

const textareaRef = ref();

const handleEmojiSelect = (emoji: string) => {
  const textareaComponent = textareaRef.value;
  if (textareaComponent && textareaComponent.$el) {
    const textarea = textareaComponent.$el as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value.value;
    value.value = text.slice(0, start) + emoji + text.slice(end);
    nextTick(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  } else {
    value.value += emoji;
  }
};

// close picker when you click outside.
const handleClickOutside = (event: Event) => {
  let target = event.target as HTMLElement;
  let parent = target.parentElement as HTMLElement;

  if (
    target &&
    !target.classList.contains("toggle-picker-button") &&
    parent &&
    !parent.classList.contains("toggle-picker-button")
  ) {
    showPicker.value = false;
  }
};

async function handleSendMessage() {
  if (!value.value.trim()) {
    return;
  }

  const messageText = value.value;
  value.value = "";

  try {
    await sendMessage(messageText, messengerId.value);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
</script>

<template>
  <div class="w-full">
    <div
      v-if="store.status !== 'loading'"
      class="h-auto min-h-[5.25rem] p-5 flex items-center"
      :class="recording ? ['justify-between'] : []"
    >
      <Select
        v-model="messengerId"
        :options="messengerOptions"
        display-mode="icon-only"
        size="sm"
        class="mr-5"
        selected-icon-class="w-8 h-8 rounded-full"
        option-icon-class="w-5 h-5 rounded-full"
      >
        <template #header> Канал для відправки </template>
      </Select>

      <!--message textarea-->

      <div
        v-if="!recording"
        class="relative flex items-center grow md:mr-5 xs:mr-4"
      >
        <Textarea
          ref="textareaRef"
          v-model="value"
          class="pr-7"
          no-resize
          variant="filled"
          :rows="1"
          placeholder="Повідомлення"
          @keydown.ctrl.enter.prevent="handleSendMessage"
        />

        <!--emojis-->
        <div class="absolute bottom-0 right-3">
          <!--emoji button-->
          <Button
            variant="ghost"
            size="xs"
            :ring="false"
            icon-only
            @click="showPicker = !showPicker"
          >
            <template #icon>
              <XCircleIcon v-if="showPicker" />
              <FaceSmileIcon v-else />
            </template>
          </Button>

          <!--emoji picker-->
          <ScaleTransition>
            <div
              v-show="showPicker"
              v-click-outside="handleClickOutside"
              class="absolute z-10 bottom-[3.4375rem] md:right-0 xs:right-[-5rem] mt-2"
            >
              <div role="none">
                <EmojiPicker
                  :show="showPicker"
                  @emoji-select="handleEmojiSelect"
                />
              </div>
            </div>
          </ScaleTransition>
        </div>
      </div>

      <div class="flex items-center">
        <!--select attachments button-->
        <Button
          v-if="!recording"
          :disabled="messengerId === 3"
          :title="
            messengerId === 3
              ? 'Вкладення недоступні для Chaport'
              : 'Додати вкладення'
          "
          variant="ghost"
          size="sm"
          icon-only
          class="md:mr-5 xs:mr-4"
          aria-label="Додати вкладення"
          @click="openAttachmentsModal = true"
        >
          <template #icon>
            <PaperClipIcon />
          </template>
        </Button>

        <!--send message button-->
        <Button
          v-if="!recording"
          variant="primary"
          size="sm"
          icon-only
          title="Відправити повідомлення"
          aria-label="Відправити повідомлення"
          @click="handleSendMessage"
        >
          <template #icon>
            <PaperAirplaneIcon />
          </template>
        </Button>
      </div>
    </div>

    <AttachmentsModal
      :messenger-id="messengerId"
      :open="openAttachmentsModal"
      :close-modal="() => (openAttachmentsModal = false)"
    />
  </div>
</template>

<style>
input[placeholder="Search emoji"] {
  background: rgba(0, 0, 0, 0);
}

.v3-emoji-picker .v3-header {
  border-bottom: 0;
}

.v3-emoji-picker .v3-footer {
  border-top: 0;
}
</style>
