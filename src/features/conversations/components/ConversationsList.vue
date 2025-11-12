<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import Conversation from "./Conversation.vue";

const props = defineProps<{
  filteredConversations?: IConversation[];
}>();
</script>

<template>
  <div
    class="pr-[0.125rem] scrollbar-thin overflow-auto max-h-[calc(100vh-13.75rem)] md:max-h-[calc(100vh-11.75rem)]"
  >
    <Conversation
      v-for="conversation in props.filteredConversations"
      :key="conversation.id"
      :conversation="conversation"
      role="listitem"
    />
  </div>
</template>
