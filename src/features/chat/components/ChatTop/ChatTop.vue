<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";

import { inject, ref } from "vue";
import PinnedMessage from "@src/features/chat/components/ChatTop/PinnedMessage.vue";
import ConversationInfoSection from "./ConversationInfoSection.vue";
import SelectSection from "./SelectSection.vue";

const props = defineProps<{
  selectMode: boolean;
  selectAll: boolean;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
  handleCloseSelect: () => void;
}>();

const activeConversation = <IConversation>inject("activeConversation");

const openSearch = ref(false);

const openInfo = ref(false);

// (event) open search modal
const handleOpenSearch = () => {
  openSearch.value = true;
};

// (event) open info modal
const handleOpenInfo = () => {
  openInfo.value = true;
};
</script>

<template>
  <div class="w-full">
    <!--Top section-->
    <div class="w-full min-h-[5.25rem] px-5 py-6">
      <SelectSection
        v-if="props.selectMode"
        :select-mode="props.selectMode"
        :select-all="props.selectAll"
        :handle-close-select="props.handleCloseSelect"
        :handle-select-all="props.handleSelectAll"
        :handle-deselect-all="props.handleDeselectAll"
      />
      <ConversationInfoSection
        v-else
        :handle-open-info="handleOpenInfo"
        :handle-open-search="handleOpenSearch"
      />
    </div>

    <!--Pinned Message-->
    <div
      class="relative transition-[padding] duration-200"
      :class="{
        'pb-[3.75rem]':
          activeConversation?.pinnedMessage &&
          !activeConversation?.pinnedMessageHidden,
      }"
    >
      <PinnedMessage :active-conversation="activeConversation" />
    </div>
  </div>
</template>
