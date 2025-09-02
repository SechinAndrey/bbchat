<script setup lang="ts">
import { inject, ref, type Ref } from "vue";
import { useSelectionsStore } from "@src/features/selections/selection-store";
import { formatConversationDate } from "@src/shared/utils/utils";
import ConfirmModal from "@src/ui/modals/ConfirmModal.vue";
import type { EntityType } from "@src/shared/types/common";
import type { ApiSelection } from "@src/api/types";

// components
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import EmptyState from "@src/ui/states/empty-states/EmptyState.vue";
import { RectangleStackIcon, TrashIcon } from "@heroicons/vue/24/outline";
import SelectionsModal from "@src/features/selections/SelectionsModal.vue";

const selectionsStore = useSelectionsStore();
const entity = inject<Ref<EntityType>>("entity", ref("leads" as EntityType));
const id = inject<Ref<number>>("id", ref(0));

// Modal state
const showDeleteModal = ref(false);
const selectedSelection = ref<ApiSelection | null>(null);

const openDeleteModal = (selection: ApiSelection) => {
  selectedSelection.value = selection;
  showDeleteModal.value = true;
};

const handleDeleteConfirm = () => {
  if (selectedSelection.value) {
    selectionsStore.deleteSelection(selectedSelection.value.id);
  }
  showDeleteModal.value = false;
  selectedSelection.value = null;
};

const handleDeleteCancel = () => {
  showDeleteModal.value = false;
  selectedSelection.value = null;
};

const isSelectionsModalOpen = ref(false);
const openSelectionModal = (selection: ApiSelection) => {
  selectedSelection.value = selection;
  isSelectionsModalOpen.value = true;
};
const closeSelectionModal = () => {
  isSelectionsModalOpen.value = false;
  selectedSelection.value = null;
};

// Get selections
if (entity.value && id.value) {
  selectionsStore.fetchSelections(entity.value, id.value);
}
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
            class="absolute right-1 p-2 hover:bg-secondary-lighter rounded-[4px] text-secondary"
            @click="openDeleteModal(selection)"
          >
            <TrashIcon class="h-5 w-5"></TrashIcon>
          </button>
          <div class="flex">
            <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
              ID
            </div>
            <button
              class="text-[0.813rem] underline text-primary"
              @click="openSelectionModal(selection)"
            >
              {{ selection.id }}
            </button>
          </div>
          <div class="flex">
            <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
              Тип
            </div>
            <div class="text-[0.813rem]">{{ selection.type.name }}</div>
          </div>
          <div class="flex">
            <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
              Дата створення
            </div>
            <div class="text-[0.813rem]">
              {{ formatConversationDate(selection.created_at) }}
            </div>
          </div>
          <div class="flex">
            <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
              Менеджер
            </div>
            <div class="text-[0.813rem]">
              {{ selection?.manager?.name || "<Невідомо>" }}
            </div>
          </div>
          <div class="flex">
            <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
              Кількість площин
            </div>
            <div class="text-[0.813rem]">
              {{ selection?.boards_count || "<Невідомо>" }}
            </div>
          </div>

          <hr class="my-4 border-app-border" />
        </div>
      </div>

      <EmptyState
        v-else
        :icon="RectangleStackIcon"
        title="Добірок немає"
        class="py-5 rounded"
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
      :selection="selectedSelection"
      :entity-id="id"
      :entity-type="entity"
      @close="closeSelectionModal"
    />
  </div>
</template>
