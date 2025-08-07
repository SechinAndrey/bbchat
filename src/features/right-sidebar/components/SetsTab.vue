<script setup lang="ts">
import { inject, ref } from "vue";
import { useSelectionsStore } from "@src/features/selections/selection-store";
import { formatConversationDate } from "@src/shared/utils/utils";
import ConfirmModal from "@src/ui/modals/ConfirmModal.vue";
import type { EntityType } from "@src/shared/types/common";

// components
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import EmptyState from "@src/ui/states/empty-states/EmptyState.vue";
import { RectangleStackIcon, TrashIcon } from "@heroicons/vue/24/outline";
import SelectionsModal from "@src/features/selections/SelectionsModal.vue";

const selectionsStore = useSelectionsStore();
const entity = inject("entity") as EntityType;
const id = inject("id") as number;

// Modal state
const showDeleteModal = ref(false);
const selectedSelectionId = ref<number | null>(null);

const openDeleteModal = (selectionId: number) => {
  selectedSelectionId.value = selectionId;
  showDeleteModal.value = true;
};

const handleDeleteConfirm = () => {
  if (selectedSelectionId.value) {
    selectionsStore.deleteSelection(selectedSelectionId.value);
  }
  showDeleteModal.value = false;
  selectedSelectionId.value = null;
};

const handleDeleteCancel = () => {
  showDeleteModal.value = false;
  selectedSelectionId.value = null;
};

selectionsStore.fetchSelections(entity, id);

const isSelectionsModalOpen = ref(false);
const openSelectionModal = (selectionId: number) => {
  selectedSelectionId.value = selectionId;
  isSelectionsModalOpen.value = true;
};
const closeSelectionModal = () => {
  isSelectionsModalOpen.value = false;
  selectedSelectionId.value = null;
};
</script>

<template>
  <div class="p-4 h-[99%]">
    <div v-if="selectionsStore.isLoading" class="flex justify-center pt-10">
      <Spinner />
    </div>
    <div v-else class="max-h-[96%] overflow-auto pb-6 scrollbar-thin pr-2">
      <div v-if="selectionsStore.selections.length > 0" class="space-y-3">
        <div
          v-for="selection in selectionsStore.selections"
          :key="selection.id"
          class="relative"
        >
          <button
            class="absolute right-1 p-2 hover:bg-secondary rounded-[4px] text-secondary-active"
            @click="openDeleteModal(selection.id)"
          >
            <TrashIcon class="h-5 w-5"></TrashIcon>
          </button>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">ID</div>
            <button
              class="text-[0.813rem] underline"
              @click="openSelectionModal(selection.id)"
            >
              {{ selection.id }}
            </button>
          </div>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">Тип</div>
            <div class="text-[0.813rem]">{{ selection.type.name }}</div>
          </div>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
              Дата створення
            </div>
            <div class="text-[0.813rem]">
              {{ formatConversationDate(selection.created_at) }}
            </div>
          </div>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
              Менеджер
            </div>
            <div class="text-[0.813rem]">
              {{ selection?.manager?.name || "<Невідомо>" }}
            </div>
          </div>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
              Кількість площин
            </div>
            <div class="text-[0.813rem]">
              {{ selection?.boards_count || "<Невідомо>" }}
            </div>
          </div>

          <hr class="my-4" />
        </div>
      </div>

      <EmptyState
        v-else
        :icon="RectangleStackIcon"
        title="Пібірок немає"
        class="bg-theme-bg py-5 rounded"
      />
    </div>

    <ConfirmModal
      :open="showDeleteModal"
      title="Видалити підбірку?"
      text="Ви впевнені, що хочете видалити цю підбірку? Цю дію неможливо скасувати."
      confirm-text="Видалити"
      cancel-text="Скасувати"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
    <SelectionsModal
      :open="isSelectionsModalOpen"
      :selection-id="selectedSelectionId"
      @close="closeSelectionModal"
    />
  </div>
</template>
