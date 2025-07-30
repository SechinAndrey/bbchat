<script setup lang="ts">
import type { Ref } from "vue";
import useStore from "@src/shared/store/store";
import { ref, inject, computed } from "vue";

import {
  FaceSmileIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";
import AttachmentsModal from "@src/features/media/modals/AttachmentsModal/AttachmentsModal.vue";
import IconButton from "@src/ui/inputs/IconButton.vue";
import ScaleTransition from "@src/ui/transitions/ScaleTransition.vue";
import EmojiPicker from "@src/ui/inputs/EmojiPicker/EmojiPicker.vue";
import Textarea from "@src/ui/inputs/Textarea.vue";
import conversationsService from "@src/features/conversations/conversations-service";
import useConversationsStore from "@src/features/conversations/conversations-store";
import Select from "@src/ui/inputs/Select.vue";

const store = useStore();
const conversationsStore = useConversationsStore();

const entity = inject("entity") as "leads" | "clients";
const id = inject("id") as number;
const contragent_type = computed(() => {
  return entity === "leads" ? "lead" : "client";
});

// the content of the message.
const value: Ref<string> = ref("");

const messengerId: Ref<number> = ref(1);

const messengerOptions = ref([
  { value: 1, label: "Telegram", image: "/imgs/telegram.png" },
  { value: 2, label: "Viber", image: "/imgs/viber.png" },
]);

// determines whether the app is recording or not.
const recording = ref(false);

// open emoji picker.
const showPicker = ref(false);

// open modal used to send multiple attachments attachments.
const openAttachmentsModal = ref(false);

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

async function sendMessage() {
  if (!value.value.trim()) {
    return;
  }
  await conversationsService.sendMessage({
    phone: conversationsStore.activeConversationInfo?.phone || "",
    message: value.value,
    file_url: "",
    messenger_id: messengerId.value,
    contragent_type: contragent_type.value,
    contragent_id: id,
  });
  value.value = "";
}
</script>

<template>
  <div class="w-full">
    <div
      v-if="store.status !== 'loading'"
      class="h-auto min-h-[5.25rem] p-5 flex items-end"
      :class="recording ? ['justify-between'] : []"
    >
      <div class="min-h-[2.75rem]">
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
      </div>

      <!--message textarea-->
      <div v-if="!recording" class="grow md:mr-5 xs:mr-4 self-end">
        <div class="relative flex items-center">
          <Textarea
            v-model="value"
            class="max-h-[5rem] pr-[3.125rem] resize-none scrollbar-hidden"
            textarea-class="bg-theme-conversations"
            auto-resize
            cols="30"
            :rows="1"
            placeholder="Напишіть своє повідомлення тут"
            aria-label="Напишіть своє повідомлення тут"
            @keydown.ctrl.enter.prevent="sendMessage"
          />

          <!--emojis-->
          <div class="absolute bottom-[.3rem] right-0">
            <!--emoji button-->
            <IconButton
              title="toggle emoji picker"
              aria-label="toggle emoji picker"
              class="ic-btn-ghost-primary toggle-picker-button w-7 h-7 md:mr-5 xs:mr-4"
              @click="showPicker = !showPicker"
            >
              <XCircleIcon v-if="showPicker" class="w-[1.25rem] h-[1.25rem]" />
              <FaceSmileIcon v-else class="w-[1.25rem] h-[1.25rem]" />
            </IconButton>

            <!--emoji picker-->
            <ScaleTransition>
              <div
                v-show="showPicker"
                v-click-outside="handleClickOutside"
                class="absolute z-10 bottom-[3.4375rem] md:right-0 xs:right-[-5rem] mt-2"
              >
                <div role="none">
                  <EmojiPicker :show="showPicker" />
                </div>
              </div>
            </ScaleTransition>
          </div>
        </div>
      </div>
      <div class="min-h-[2.75rem] flex items-center">
        <!--select attachments button-->
        <IconButton
          v-if="!recording"
          class="ic-btn-ghost-primary w-7 h-7 md:mr-5 xs:mr-4"
          title="open select attachments modal"
          aria-label="open select attachments modal"
          @click="openAttachmentsModal = true"
        >
          <PaperClipIcon class="w-[1.25rem] h-[1.25rem]" />
        </IconButton>

        <!--send message button-->
        <IconButton
          v-if="!recording"
          class="ic-btn-contained-primary w-7 h-7 active:scale-110"
          title="send message"
          aria-label="send message"
          @click="sendMessage"
        >
          <PaperAirplaneIcon class="w-[1.0625rem] h-[1.0625rem]" />
        </IconButton>
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
