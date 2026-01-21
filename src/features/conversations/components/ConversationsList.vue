<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import Conversation from "./Conversation.vue";

const props = defineProps<{
  filteredConversations?: IConversation[];
}>();
</script>

<template>
  <Conversation
    v-for="conversation in props.filteredConversations"
    :key="`${conversation.id}-${conversation.contact.id}`"
    :conversation="conversation"
    role="listitem"
  />
</template>
