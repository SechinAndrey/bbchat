<script setup lang="ts">
import { inject, ref, watch, type Ref } from "vue";
import { useSelectionsStore } from "@src/features/selections/selection-store";
import { formatConversationDate } from "@src/shared/utils/utils";
import ConfirmModal from "@src/ui/modals/ConfirmModal.vue";
import type { EntityType } from "@src/shared/types/common";
import type { ApiSelection } from "@src/api/types";
import useStore from "@src/shared/store/store";

// components
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import EmptyState from "@src/ui/states/empty-states/EmptyState.vue";
import { RectangleStackIcon, TrashIcon } from "@heroicons/vue/24/outline";
import SelectionsModal from "@src/features/selections/SelectionsModal.vue";
import { set } from "zod";

const selectionsStore = useSelectionsStore();
const store = useStore();
const entity = inject<Ref<EntityType>>("entity", ref("leads" as EntityType));
const id = inject<Ref<number>>("id", ref(0));

// Modal state
const isDeleting = ref(false);
const showDeleteModal = ref(false);
const selectedSelection = ref<ApiSelection | null>(null);

const openDeleteModal = (selection: ApiSelection) => {
  selectedSelection.value = selection;
  showDeleteModal.value = true;
};

const handleDeleteConfirm = async () => {
  if (selectedSelection.value) {
    isDeleting.value = true;
    await selectionsStore.deleteSelection(selectedSelection.value.id);
    isDeleting.value = false;
  }
  showDeleteModal.value = false;
  setTimeout(() => {
    selectedSelection.value = null;
  }, 300);
};

const handleDeleteCancel = () => {
  showDeleteModal.value = false;
  setTimeout(() => {
    selectedSelection.value = null;
  }, 300);
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

watch([entity, id], ([newEntity, newId]) => {
  if (newEntity && newId && store.rightSidebarOpen) {
    setTimeout(() => {
      selectionsStore.fetchSelections(newEntity, newId);
    }, 1000);
  }
});
</script>

<template>
  <div class="pb-6">
    <div v-if="selectionsStore.isLoading" class="flex justify-center pt-10">
      <Spinner />
    </div>
    <div v-else class="space-y-3">
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
            <div class="text-[0.813rem]">
              {{ selection.type?.name || "<Невідомо>" }}
            </div>
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
        bg
        :icon="RectangleStackIcon"
        title="Добірок немає"
        class="py-5 rounded"
      />
    </div>

    <ConfirmModal
      :open="showDeleteModal"
      :title="`Видалити добірку: #${selectedSelection?.id}?`"
      confirm-text="Видалити"
      cancel-text="Скасувати"
      :is-loading="isDeleting"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    >
      <template #body>
        Ви впевнені, що хочете видалити цю добірку? <br />
        Цю дію неможливо скасувати.
      </template>
    </ConfirmModal>
  </div>

  <Teleport to="body">
    <SelectionsModal
      :open="isSelectionsModalOpen"
      :show-icon="false"
      :selection="selectedSelection"
      :entity-id="id"
      :entity-type="entity"
      @close="closeSelectionModal"
    />
  </Teleport>
</template>
