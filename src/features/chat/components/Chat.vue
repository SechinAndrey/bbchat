<script setup lang="ts">
import useStore from "@src/shared/store/store";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { provide, toRef } from "vue";

import type { EntityType } from "@src/shared/types/common";

import NoChatSelected from "@src/ui/states/empty-states/NoChatSelected.vue";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import ChatBottom from "@src/features/chat/components/ChatBottom/ChatBottom.vue";
import ChatMiddle from "@src/features/chat/components/ChatMiddle/ChatMiddle.vue";
import ChatTop from "@src/features/chat/components/ChatTop/ChatTop.vue";
import RightSidebar from "@src/features/right-sidebar/components/RightSidebar.vue";

const props = defineProps<{
  id: number;
  entity: EntityType;
  contactId: number;
}>();

provide("entity", toRef(props, "entity"));
provide("id", toRef(props, "id"));
provide("contactId", toRef(props, "contactId"));

const store = useStore();
const conversationsStore = useConversationsStore();
conversationsStore.initializeRouteWatchers();
</script>

<template>
  <div class="h-full w-full flex scrollbar-hidden">
    <div class="h-full flex flex-col w-full scrollbar-hidden">
      <Spinner
        v-if="
          (conversationsStore.isFetchingMessages &&
            !conversationsStore.isLoadingMoreMessages) ||
          conversationsStore.isFetchingActiveConversationInfo
        "
      />

      <div
        v-else-if="conversationsStore.activeConversationInfo"
        class="h-full flex flex-col scrollbar-hidden"
      >
        <ChatTop />
        <ChatMiddle />
        <ChatBottom />
      </div>

      <NoChatSelected v-else />
    </div>

    <RightSidebar
      v-if="conversationsStore.activeConversationInfo && store.rightSidebarOpen"
      class="xs:absolute md:static"
      @close="store.rightSidebarOpen = false"
    />
  </div>
</template>
