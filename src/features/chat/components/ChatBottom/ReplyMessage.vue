<script setup lang="ts">
import type { IConversation } from "@src/core/types/types.ts";

import { inject } from "vue";

import { getConversationIndex } from "@src/core/helpers/utils.ts";
import useStore from "@src/core/store/store";

import { XCircleIcon } from "@heroicons/vue/24/outline";
import IconButton from "@src/ui/inputs/IconButton.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import MessagePreview from "@src/features/chat/components/MessagePreview.vue";

const store = useStore();

const activeConversation = <IConversation>inject("activeConversation");

// (event) removes the reply message from top of the text message textarea
const handleRemoveReplyMessage = () => {
  if (activeConversation) {
    // get the active conversation index in the state store
    let activeConversationIndex = getConversationIndex(activeConversation.id);

    if (
      store.conversations &&
      activeConversationIndex !== undefined &&
      activeConversationIndex !== null
    ) {
      // update the conversation in the state store
      store.conversations[activeConversationIndex].replyMessage = undefined;
    }
  }
};
</script>

<template>
  <SlideTransition animation="shelf-up">
    <div
      class="absolute bottom-0 w-full px-5 py-2 bg-white dark:bg-gray-800 flex items-center justify-between transition-all duration-200"
      v-if="activeConversation?.replyMessage"
    >
      <!--selected message overview-->
      <MessagePreview :message="activeConversation?.replyMessage" />

      <!--close selected Message-->
      <IconButton
        @click="handleRemoveReplyMessage"
        class="ic-btn-ghost-primary w-7 h-7"
        title="remove reply"
        aria-label="remove reply"
      >
        <XCircleIcon class="w-[1rem] h-[1rem]" />
      </IconButton>
    </div>
  </SlideTransition>
</template>
