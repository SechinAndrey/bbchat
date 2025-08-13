<script setup lang="ts">
import { computed } from "vue";
import {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
} from "@src/api/types";
import Button from "@src/ui/inputs/Button.vue";
import { formatConversationDate } from "@src/shared/utils/utils";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { PhoneIcon, EnvelopeIcon } from "@heroicons/vue/24/outline";
import CanbanSelect from "@src/shared/components/CanbanSelect.vue";

const conversationsStore = useConversationsStore();

const activeConversationInfo = computed<
  ApiCommunicationLeadFull | ApiCommunicationClientFull | null
>(() => {
  return conversationsStore.activeConversationInfo;
});
</script>

<template>
  <div class="py-4">
    <div class="mb-4 text-app-text-secondary text-[0.813rem]">Контакти</div>

    <div class="flex items-center gap-2 mb-2">
      <PhoneIcon class="w-5 h-5 text-primary" />
      <a class="text-[0.875rem]" :href="`tel:${activeConversationInfo?.phone}`">
        {{ activeConversationInfo?.phone || "Не вказаний" }}
      </a>
    </div>

    <div class="flex items-center gap-2 mb-2">
      <EnvelopeIcon class="w-5 h-5 text-primary" />
      <a
        class="text-[0.875rem]"
        :href="`mailto:${activeConversationInfo?.email}`"
      >
        {{ activeConversationInfo?.email || "Не вказана" }}
      </a>
    </div>

    <Button variant="text"> + Додати </Button>

    <div class="my-4 text-app-text-secondary text-[0.813rem]">Створено</div>

    <div class="text-[0.875rem]">
      {{
        formatConversationDate(activeConversationInfo?.created_at) ||
        "Не вказано"
      }}
    </div>

    <div class="my-4 text-app-text-secondary text-[0.813rem]">Канал</div>

    <div class="text-[0.875rem]">
      {{ activeConversationInfo?.channel || "Не вказано" }}
    </div>

    <div class="my-4 text-app-text-secondary text-[0.813rem]">Місто</div>
    <div v-if="activeConversationInfo?.cities.length" class="text-[0.875rem]">
      <div v-for="city in activeConversationInfo?.cities || []" :key="city.id">
        {{ city.name_ua }}
      </div>
    </div>
    <div v-else class="text-[0.875rem]">Не вказано</div>

    <div class="my-4 text-app-text-secondary text-[0.813rem]">Коментар</div>

    <div class="text-[0.875rem]">
      {{ activeConversationInfo?.comment || "Не вказано" }}
    </div>

    <hr class="my-5 border-app-border" />

    <div class="my-4 text-app-text-secondary text-[0.813rem]">
      Kanban статус
    </div>

    <div>
      <CanbanSelect />
    </div>

    <hr
      v-if="activeConversationInfo?.status_log?.length"
      class="my-5 border-app-border"
    />

    <div
      v-if="activeConversationInfo?.status_log?.length"
      class="my-4 text-app-text-secondary text-[0.813rem]"
    >
      Історія статусів
    </div>

    <div
      v-for="status in activeConversationInfo?.status_log || []"
      :key="status.id"
      class="mb-4 text-[0.813rem]"
    >
      <div class="flex gap-4 mb-4">
        <div class="text-app-text-secondary">
          {{ formatConversationDate(status.created_at) }}
        </div>
        <div class="flex-1 min-w-full">
          <div>{{ status.new_status.name }}</div>
          <div class="text-app-text-secondary">{{ status.user?.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
