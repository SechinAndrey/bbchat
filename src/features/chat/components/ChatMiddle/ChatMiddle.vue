<script setup lang="ts">
import type { IConversation, IMessage } from "@src/shared/types/types";
import type { Ref } from "vue";

import { inject, onMounted, ref, watch, nextTick } from "vue";

import useStore from "@src/shared/store/store";
import MessageV2 from "@src/features/chat/components/ChatMiddle/Message/MessageV2.vue";
import TimelineDivider from "@src/features/chat/components/ChatMiddle/TimelineDivider.vue";

const props = defineProps<{
  handleSelectMessage: (messageId: number) => void;
  handleDeselectMessage: (messageId: number) => void;
  selectedMessages: number[];
}>();

const store = useStore();

const container: Ref<HTMLElement | null> = ref(null);

const activeConversation = <IConversation>inject("activeConversation");

// checks whether the previous message was sent by the same user.
const isFollowUp = (index: number, previousIndex: number): boolean => {
  return true; // This function is currently not implemented, returning true for now.
  // if (previousIndex < 0) {
  //   return false;
  // } else {
  //   let previousSender = activeConversation.messages[previousIndex].sender.id;
  //   let currentSender = activeConversation.messages[index].sender.id;
  //   return previousSender === currentSender;
  // }
};

// checks wether the new message has been sent in a new day or not.
const renderDivider = (index: number, previousIndex: number): boolean => {
  if (index === 3) {
    return true;
  } else {
    return false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  });
};

// scroll messages to bottom.
onMounted(() => {
  scrollToBottom();
});

watch(
  () => activeConversation.messages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);
</script>

<template>
  <div
    ref="container"
    class="grow px-5 py-5 flex flex-col overflow-y-scroll scrollbar-hidden"
  >
    <div v-if="store.status !== 'loading'" class="flex flex-col">
      <div v-for="(message, index) in activeConversation.messages" :key="index">
        <TimelineDivider v-if="renderDivider(index, index - 1)" />

        <MessageV2 :message="message" />
      </div>
    </div>
  </div>
</template>
