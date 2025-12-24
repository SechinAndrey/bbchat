<script setup lang="ts">
import type { Ref } from "vue";
import useStore from "@src/shared/store/store";
import { ref, computed, nextTick } from "vue";
import { useEventBus } from "@vueuse/core";
import type { ApiMessageItem } from "@src/api/types";

import {
  FaceSmileIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
  BookmarkIcon,
} from "@heroicons/vue/24/outline";
import AttachmentsModal from "@src/features/media/modals/AttachmentsModal/AttachmentsModal.vue";
import Button from "@src/ui/inputs/Button.vue";
import ScaleTransition from "@src/ui/transitions/ScaleTransition.vue";
import EmojiPicker from "@src/ui/inputs/EmojiPicker/EmojiPicker.vue";
import Textarea from "@src/ui/inputs/Textarea.vue";
import Select from "@src/ui/inputs/Select.vue";
import ReplyPreview from "@src/features/chat/components/ChatBottom/ReplyPreview.vue";
import EditPreview from "@src/features/chat/components/ChatBottom/EditPreview.vue";
import { useMessageSending } from "@src/features/chat/composables/useMessageSending";
import { useMessenger } from "@src/features/chat/composables/useMessengerSelection";
import { useMediaQuery } from "@vueuse/core";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import { TemplateSelectorModal } from "@src/features/chat/message-templates";
import { useMessagesTemplatesStore } from "@src/features/chat/message-templates";
import type { MessageTemplate } from "@src/features/chat/message-templates";
import { onMounted } from "vue";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import { useToast } from "@src/shared/composables/useToast";

const store = useStore();
const { sendMessage } = useMessageSending();
const { messengerId, messengerOptions, currentMessenger, activeContact } =
  useMessenger();
const templatesStore = useMessagesTemplatesStore();
const conversationsStore = useConversationsStore();
const { toastError, toastSuccess } = useToast();

const isMobile = computed(() => useMediaQuery("(max-width: 767px)").value);

const telegramReplyBus = useEventBus<ApiMessageItem>("reply-message");
const viberReplyBus = useEventBus<string>("viber-reply-message");
const editMessageBus = useEventBus<ApiMessageItem>("edit-message");
const telegramReplyingToMessage = ref<ApiMessageItem | null>(null);
const editingMessage = ref<ApiMessageItem | null>(null);

telegramReplyBus.on((message) => {
  value.value = "";
  telegramReplyingToMessage.value = message;
  messengerId.value = 1;
  nextTick(() => {
    if (textareaRef.value && textareaRef.value.$el) {
      const textarea = textareaRef.value.$el as HTMLTextAreaElement;
      textarea.focus();
    }
  });
});

viberReplyBus.on((messageText) => {
  telegramReplyingToMessage.value = null;
  value.value = `"${messageText}"\n\n`;
  nextTick(() => {
    if (textareaRef.value && textareaRef.value.$el) {
      const textarea = textareaRef.value.$el as HTMLTextAreaElement;
      textarea.focus();
      const cursorPosition = value.value.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
      messengerId.value = 2;
    }
  });
});

editMessageBus.on((message) => {
  telegramReplyingToMessage.value = null;
  editingMessage.value = message;

  const messageText =
    message.echat_messages?.message || message.chaport_messages?.message || "";
  value.value = messageText;

  messengerId.value = message.echat_messages?.dialog?.messenger_id || 1;

  nextTick(() => {
    if (textareaRef.value && textareaRef.value.$el) {
      const textarea = textareaRef.value.$el as HTMLTextAreaElement;
      textarea.focus();
      const cursorPosition = value.value.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
});

// the content of the message.
const value: Ref<string> = ref("");

// determines whether the app is recording or not.
const recording = ref(false);

// open emoji picker.
const showPicker = ref(false);

// open modal used to send multiple attachments attachments.
const openAttachmentsModal = ref(false);

const showTemplateSelector = ref(false);

const textareaRef = ref();

onMounted(() => {
  if (templatesStore.templates.length === 0) {
    templatesStore.fetchTemplates();
  }
});

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

const clearTelegramReply = () => {
  telegramReplyingToMessage.value = null;
};

const clearEdit = () => {
  editingMessage.value = null;
  value.value = "";
};

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
  const replyId = telegramReplyingToMessage.value?.id || null;
  const editId = editingMessage.value?.id || null;

  value.value = "";
  clearTelegramReply();

  if (editId) {
    try {
      await conversationsStore.editMessage(editId, messageText);
      toastSuccess("Повідомлення відредаговано");
      clearEdit();
    } catch (error) {
      console.error("Failed to edit message:", error);
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Помилка редагування повідомлення";
      toastError(errorMessage);
      value.value = messageText;
    }
    return;
  }

  try {
    await sendMessage({
      message: messageText,
      messengerId: messengerId.value,
      replyMessageId: replyId,
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

const handleTemplateSelect = (template: MessageTemplate) => {
  value.value = template.text;
  showTemplateSelector.value = false;
  nextTick(() => {
    if (textareaRef.value && textareaRef.value.$el) {
      const textarea = textareaRef.value.$el as HTMLTextAreaElement;
      textarea.focus();
      const cursorPosition = value.value.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
};
</script>

<template>
  <div class="w-full relative">
    <SlideTransition animation="slide-down">
      <EditPreview
        v-if="editingMessage"
        :message="editingMessage"
        class="absolute bottom-[100%] z-[2]"
        @close="clearEdit"
      />
    </SlideTransition>

    <SlideTransition animation="slide-down">
      <ReplyPreview
        v-if="telegramReplyingToMessage && !editingMessage"
        :message="telegramReplyingToMessage"
        class="absolute bottom-[100%] z-[1]"
        @close="clearTelegramReply"
      />
    </SlideTransition>

    <div
      v-if="store.status !== 'loading'"
      class="h-auto p-5 pb-[1.125rem] flex items-end border-t border-app-border z-[2] relative bg-app-bg"
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
          class="placeholder-truncate pr-[4.5rem]"
          variant="filled"
          :rows="1"
          extendable
          :max-rows="5"
          :placeholder="placeholderText"
          @keydown.enter.exact.prevent="handleSendMessage"
        />

        <div class="absolute bottom-0 right-7">
          <Button
            variant="ghost"
            size="xs"
            :ring="false"
            icon-only
            title="Вибрати шаблон"
            @click="showTemplateSelector = true"
          >
            <template #icon>
              <BookmarkIcon class="w-5 h-5" />
            </template>
          </Button>
        </div>

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

    <TemplateSelectorModal
      :templates="templatesStore.templates"
      :open="showTemplateSelector"
      @select="handleTemplateSelect"
      @close="showTemplateSelector = false"
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
