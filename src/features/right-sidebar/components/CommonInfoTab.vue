<script setup lang="ts">
import { computed, inject, ref, type Ref } from "vue";
import {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
} from "@src/api/types";
import Button from "@src/ui/inputs/Button.vue";
import { formatConversationDate } from "@src/shared/utils/utils";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { PhoneIcon, EnvelopeIcon, UserIcon } from "@heroicons/vue/24/outline";
import KanbanSelect from "@src/shared/components/KanbanSelect.vue";
import AddContactModal from "@src/features/contacts/AddContactModal.vue";

const contactId = inject<Ref<number> | undefined>("contactId");
const entity = inject<Ref<"leads" | "clients">>("entity");

const conversationsStore = useConversationsStore();
const isAddContactModalOpen = ref(false);

const activeConversationInfo = computed<
  ApiCommunicationLeadFull | ApiCommunicationClientFull | null
>(() => {
  return conversationsStore.activeConversationInfo;
});

const entityType = computed(() => {
  return activeConversationInfo.value?.entity === "clients" ? "client" : "lead";
});

const entityId = computed(() => {
  return activeConversationInfo.value?.id || 0;
});

const openAddContactModal = () => {
  isAddContactModalOpen.value = true;
};

const closeAddContactModal = () => {
  isAddContactModalOpen.value = false;
};

const handleContactAdded = () => {
  closeAddContactModal();
};
</script>

<template>
  <div class="py-4 pb-6">
    <div class="mb-4 text-app-text-secondary text-[0.813rem]">Контакти</div>

    <div
      v-for="contact in activeConversationInfo?.contacts"
      :key="contact.id"
      class="last:mb-0 border-b border-t border-dashed border-app-border py-3"
      :class="{
        'border-primary current-contact': contactId && contact.id === contactId,
      }"
    >
      <div class="flex items-center gap-2 mb-2">
        <UserIcon class="w-5 h-5 text-primary flex-shrink-0" />
        <span class="text-[0.875rem] truncate">{{
          contact.fio || "Не вказано"
        }}</span>
      </div>

      <div class="flex items-center gap-2 mb-2">
        <PhoneIcon class="w-5 h-5 text-primary" />
        <a
          class="text-[0.875rem] hover:underline underline-offset-4"
          :href="`tel:${contact.phone}`"
        >
          {{ contact.phone || "Не вказаний" }}
        </a>
      </div>

      <div class="flex items-center gap-2 mb-2">
        <EnvelopeIcon class="w-5 h-5 text-primary flex-shrink-0" />
        <a
          class="text-[0.875rem] hover:underline underline-offset-4 truncate"
          :href="`mailto:${activeConversationInfo?.email}`"
        >
          {{ activeConversationInfo?.email || "Не вказана" }}
        </a>
      </div>
    </div>

    <Button variant="text" class="mt-3" @click="openAddContactModal">
      + Додати
    </Button>

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

    <hr v-if="entity === 'leads'" class="my-5 border-app-border" />

    <div
      v-if="entity === 'leads'"
      class="my-4 text-app-text-secondary text-[0.813rem]"
    >
      Kanban статус
    </div>

    <div v-if="entity === 'leads'">
      <KanbanSelect />
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

    <AddContactModal
      :open="isAddContactModalOpen"
      :close-modal="closeAddContactModal"
      :entity-type="entityType"
      :entity-id="entityId"
      @contact-added="handleContactAdded"
    />
  </div>
</template>

<style scoped lang="scss">
.current-contact {
  // before triangle
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: -0.938rem;
    top: 0.625rem;
    border: 0.5rem solid transparent;
    border-left-color: #8e99f3;
  }
}
</style>
