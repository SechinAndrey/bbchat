<script setup lang="ts">
import { computed } from "vue";

import type {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
} from "@src/api/types";
import { formatConversationDate, formatSeconds } from "@src/shared/utils/utils";
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
    <h3 class="text-lg font-semibold mb-4">Дзвінки</h3>
    <div class="space-y-3">
      <div v-for="call in activeConversation?.calls || []" :key="call.id">
        <div class="flex">
          <div>Дата</div>
          <div>{{ formatConversationDate(call.created_at) }}</div>
        </div>
        <div class="flex">
          <div>Номер</div>
          <div>{{ call.phone }}</div>
        </div>
        <div class="flex">
          <div>Час очікування</div>
          <div>{{ formatSeconds(call.waitsec) }}</div>
        </div>
        <div class="flex">
          <div>Час розмови</div>
          <div>{{ formatSeconds(call.billsec) }}</div>
        </div>
        <div class="flex">
          <div>ПІБ</div>
          <div>{{ activeConversation.fio || "не вказано" }}</div>
        </div>
        <div class="flex">
          <button class="text-primary">Транскрипція</button>
        </div>
      </div>
    </div>
  </div>
</template>
