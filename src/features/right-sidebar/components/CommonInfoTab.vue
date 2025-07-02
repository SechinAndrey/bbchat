<script setup lang="ts">
import { computed } from "vue";
import {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
  ApiKanbanStatus,
} from "@src/api/types";
import { formatConversationDate } from "@src/shared/utils/utils";
import useConversationsStore from "@src/features/conversations/conversations-store";
import useGlobalDataStore from "@src/shared/store/global-data-store";

const conversationsStore = useConversationsStore();
const globalDataStore = useGlobalDataStore();

const activeConversation = computed<
  ApiCommunicationLeadFull | ApiCommunicationClientFull | null
>(() => {
  return conversationsStore.activeConversation;
});

const kanbanStatus = computed<ApiKanbanStatus | undefined>(() => {
  return globalDataStore.getKanbanStatusById(
    activeConversation.value?.status_id || 0,
  );
});
</script>

<template>
  <div class="py-4">
    <div class="mb-4 text-neutral-active">Контакти</div>

    <div class="flex gap-2 mb-2">
      <div>Телефон:</div>
      <div class="text-gray-500">
        {{ activeConversation?.phone || "Не вказаний" }}
      </div>
    </div>

    <div class="flex gap-2 mb-2">
      <div>Пошта:</div>
      <div class="text-gray-500">
        {{ activeConversation?.email || "Не вказана" }}
      </div>
    </div>

    <Button class="">
      <span class="text-primary">+ Додати</span>
    </Button>

    <div class="my-4 text-neutral-active">Створено</div>

    <div>
      {{
        formatConversationDate(activeConversation?.created_at) || "Не вказано"
      }}
    </div>

    <div class="my-4 text-neutral-active">Канал</div>

    <div>
      {{ activeConversation?.channel || "Не вказано" }}
    </div>

    <div class="my-4 text-neutral-active">Місто</div>

    <div v-for="city in activeConversation?.cities || []" :key="city.id">
      {{ city.name_ua }}
    </div>

    <div class="my-4 text-neutral-active">Коментар</div>

    <div>
      {{ activeConversation?.comment || "Не вказано" }}
    </div>

    <hr />

    <div class="my-4 text-neutral-active">Канбан статус</div>

    <div>
      {{ kanbanStatus?.name }}
    </div>

    <hr />

    <div class="my-4 text-neutral-active">Історія статусів</div>

    <div
      v-for="status in activeConversation?.status_log || []"
      :key="status.id"
      class="mb-4"
    >
      <div>
        {{ formatConversationDate(status.created_at) }} -
        {{ status.new_status.name }}
      </div>
      <div>
        {{ status.user?.name }}
      </div>
    </div>
  </div>
</template>
