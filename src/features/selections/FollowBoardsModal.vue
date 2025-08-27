<script setup lang="ts">
import Modal from "@src/ui/modals/Modal.vue";
import Button from "@src/ui/inputs/Button.vue";
import { ref, computed } from "vue";
import { selectionsService, type FollowParams } from "./selections-service";
import type { EntityType } from "@src/shared/types/common";

const props = defineProps<{
  selectedBoardIds: number[];
  selectionId: number;
  entityId: number;
  entityType: EntityType;
}>();

const emit = defineEmits<{
  followed: [];
}>();

const open = defineModel<boolean>({ default: false });

const dateFrom = ref<string>("");
const dateTo = ref<string>("");
const isLoading = ref(false);

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

const close = () => {
  open.value = false;
};

const formatDateToMonth = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const followBoards = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;

    const params: FollowParams = {
      id: props.entityId,
      type: props.entityType,
      selection_id: props.selectionId,
      boards_ids: props.selectedBoardIds,
      month_from: dateFrom.value
        ? formatDateToMonth(dateFrom.value)
        : undefined,
      month_to: dateTo.value ? formatDateToMonth(dateTo.value) : undefined,
    };

    await selectionsService.followBoards(params);
    emit("followed");
    close();
  } catch (error) {
    console.error("Error following boards:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Modal :open="open" :close-modal="close">
    <template #header>
      <h3 id="modal-title" class="text-lg leading-6 font-medium text-app-text">
        Слідкувати за дошками
      </h3>
      <p class="mt-2 text-app-text-secondary">
        Налаштуйте період спостереження за вибраними дошками
      </p>
      <div class="mt-2 text-sm text-app-text-secondary">
        Вибрано дошок:
        <span class="font-medium">{{ selectedBoardIds.length }}</span>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <div>
          <label
            for="date-from"
            class="block text-sm font-medium text-app-text mb-2"
          >
            Дата з:
          </label>
          <input
            id="date-from"
            v-model="dateFrom"
            type="date"
            :min="minDate"
            :disabled="isLoading"
            class="w-full px-3 py-2 border border-app-border rounded-md bg-app-bg text-app-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            @keydown.prevent
          />
        </div>

        <div>
          <label
            for="date-to"
            class="block text-sm font-medium text-app-text mb-2"
          >
            Дата до:
          </label>
          <input
            id="date-to"
            v-model="dateTo"
            type="date"
            :min="minDate"
            :disabled="isLoading"
            class="w-full px-3 py-2 border border-app-border rounded-md bg-app-bg text-app-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            @keydown.prevent
          />
        </div>
      </div>
    </template>

    <template #footer>
      <Button
        class="flex-1"
        variant="secondary"
        :disabled="isLoading"
        @click="close"
      >
        Скасувати
      </Button>
      <Button
        class="flex-1"
        :disabled="isLoading"
        :loading="isLoading"
        @click="followBoards"
      >
        Додати до спостереження
      </Button>
    </template>
  </Modal>
</template>
