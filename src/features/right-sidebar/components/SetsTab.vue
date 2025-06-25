<script setup lang="ts">
import { computed } from "vue";
import useConversationsStore from "@src/features/conversations/conversations-store";
const conversationsStore = useConversationsStore();

const activeConversation = computed<
  ApiCommunicationLeadFull | ApiCommunicationClientFull
>(() => {
  return conversationsStore.activeConversation;
});
</script>

<template>
  <div class="p-4">
    <h3 class="text-lg font-semibold mb-4">Підбірки</h3>
    <div class="space-y-3">
      <p class="text-gray-600">Вміст вкладки підбірок</p>
    </div>
  </div>
</template>
