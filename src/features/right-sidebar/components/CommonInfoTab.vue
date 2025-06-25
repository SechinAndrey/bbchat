<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import { inject, ref, computed } from "vue";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import useConversationsStore from "@src/features/conversations/conversations-store";
import {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
} from "@src/api/types";
// import Button from "@src/ui/inputs/Button.vue";
const authStore = useAuthStore();
const conversationsStore = useConversationsStore();

const activeConversation = computed<
  ApiCommunicationLeadFull | ApiCommunicationClientFull
>(() => {
  return conversationsStore.activeConversation;
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
      {{ activeConversation?.created_at || "Не вказано" }}
    </div>

    <div class="my-4 text-neutral-active">Канал</div>

    <div>
      {{ activeConversation?.channel?.title || "Не вказано" }}
    </div>

    <div class="my-4 text-neutral-active">Місто</div>

    <div v-for="city in activeConversation?.cities || []">
      {{ city.name_ua }}
    </div>

    <div class="my-4 text-neutral-active">Коментар</div>

    <div>
      {{ activeConversation?.comment || "Не вказано" }}
    </div>

    <hr />

    <div class="my-4 text-neutral-active">Канбан статус</div>

    <div>
      {{ activeConversation?.status_id || "Не вказано" }}
    </div>

    <hr />

    <div class="my-4 text-neutral-active">Історія статусів</div>
  </div>
</template>
