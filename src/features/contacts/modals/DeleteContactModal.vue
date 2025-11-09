<script setup lang="ts">
import ConfirmModal from "@src/ui/modals/ConfirmModal.vue";
import type { ApiContact } from "@src/api/types";
import {
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  BriefcaseIcon,
} from "@heroicons/vue/24/outline";
import TgLineIcon from "@src/shared/icons/TgLineIcon.vue";

const props = defineProps<{
  open: boolean;
  contact: ApiContact | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <ConfirmModal
    :open="props.open"
    :show-icon="true"
    :title="`Видалити контакт? #${props.contact?.id}`"
    confirm-text="Видалити"
    cancel-text="Скасувати"
    :is-loading="props.isLoading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <template #body>
      <p class="text-sm text-app-text-secondary mb-4">
        Ви впевнені, що хочете видалити цей контакт? Ця дія незворотна.
      </p>

      <div
        v-if="props.contact"
        class="bg-app-bg-secondary rounded-lg p-4 space-y-3 text-app-text"
      >
        <div class="flex items-center gap-2">
          <UserIcon class="w-5 h-5 text-primary flex-shrink-0" />
          <span class="text-sm truncate">{{
            props.contact.fio || "Не вказано"
          }}</span>
        </div>

        <div v-if="props.contact.post_name" class="flex items-center gap-2">
          <BriefcaseIcon class="w-5 h-5 text-primary flex-shrink-0" />
          <span class="text-sm truncate">{{
            props.contact.post_name || "Не вказано"
          }}</span>
        </div>

        <div class="flex items-center gap-2">
          <PhoneIcon class="w-5 h-5 text-primary flex-shrink-0" />
          <span class="text-sm">{{
            props.contact.phone || "Не вказаний"
          }}</span>
        </div>

        <div class="flex items-center gap-2">
          <EnvelopeIcon class="w-5 h-5 text-primary flex-shrink-0" />
          <span class="text-sm truncate">{{
            props.contact.email || "Не вказана"
          }}</span>
        </div>

        <div class="flex items-center gap-2">
          <TgLineIcon class="w-5 h-5 text-primary flex-shrink-0" />
          <span class="text-sm truncate">{{
            props.contact.tg_name || "Не вказаний"
          }}</span>
        </div>
      </div>
    </template>
  </ConfirmModal>
</template>
