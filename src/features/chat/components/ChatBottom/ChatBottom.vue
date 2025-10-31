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
import { useMessenger } from "@src/features/chat/composables/useMessengerSelection";
import { useMediaQuery } from "@vueuse/core";

const store = useStore();
const { sendMessage } = useMessageSending();
const { messengerId, messengerOptions, currentMessenger, activeContact } =
  useMessenger();

const isMobile = computed(() => useMediaQuery("(max-width: 767px)").value);

// the content of the message.
const value: Ref<string> = ref("");

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

const contactName = computed(() => {
  return activeContact.value?.fio || "";
});

const placeholderText = computed(() => {
  if (isMobile.value) {
    return contactName.value;
  }
  return `${currentMessenger.value?.label || "Повідомлення"}: ${contactName.value}`;
});

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
      class="h-auto p-5 pb-[1.125rem] flex items-end border-t border-app-border"
      :class="recording ? ['justify-between'] : []"
    >
      <Select
        v-model="messengerId"
        :options="messengerOptions"
        display-mode="icon-only"
        size="sm"
        class="mr-5 -mb-[0.125rem]"
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
          class="placeholder-truncate pr-7"
          variant="filled"
          :rows="1"
          extendable
          :max-rows="5"
          :placeholder="placeholderText"
          @keydown.enter.exact.prevent="handleSendMessage"
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
              <XCircleIcon v-if="showPicker" class="w-5 h-5" />
              <FaceSmileIcon v-else class="w-5 h-5" />
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
            <PaperClipIcon class="w-6 h-6" />
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
            <PaperAirplaneIcon class="w-6 h-6" />
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

.placeholder-truncate::placeholder {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
