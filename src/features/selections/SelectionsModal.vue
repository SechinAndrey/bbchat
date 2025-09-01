<script setup lang="ts">
import { ref } from "vue";
import Modal from "@src/ui/modals/Modal.vue";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import type { ApiSelection } from "@src/api/types";
import SelectionTable from "@src/features/selections/SelectionTable.vue";
import Button from "@src/ui/inputs/Button.vue";
import apiClient from "@src/api/axios-instance";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import Checkbox from "@src/ui/inputs/Checkbox.vue";
import { Dropdown } from "@src/ui/navigation/DropdownV3";
import useGlobalDataStore from "@src/shared/store/global-data-store";
import FollowBoardsModal from "@src/features/selections/FollowBoardsModal.vue";
import { useSelectionsStore } from "@src/features/selections/selection-store";
import {
  selectionsService,
  type UnfollowParams,
} from "@src/features/selections/selections-service";
import type { EntityType } from "@src/shared/types/common";

const props = defineProps<{
  open: boolean;
  selection: ApiSelection | null;
  entityId: number;
  entityType: EntityType;
}>();

const emit = defineEmits<{
  close: [];
}>();

const close = () => {
  emit("close");
};

const globalStore = useGlobalDataStore();
const selectionsStore = useSelectionsStore();

const selectedColumns = ref<string[]>([]);

const isLoading = ref(false);
const dropdownRef = ref<InstanceType<typeof Dropdown> | null>(null);

const download = async () => {
  if (!props.selection?.id) return;
  isLoading.value = true;
  try {
    const response = await apiClient.post(
      `/selections/${props.selection.id}/export`,
      { columns: selectedColumns.value, boards: selectedBoardIds.value },
    );
    const fileUrl = response.data?.link;

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
    dropdownRef.value?.closeDropdown();
  } catch (error) {
    console.error("Download failed", error);
  } finally {
    isLoading.value = false;
  }
};

const selectedBoardIds = ref<number[]>([]);
const selectionTableRef = ref<InstanceType<typeof SelectionTable> | null>(null);
const isFollowBoardsModalOpen = ref(false);
const isUnfollowLoading = ref(false);
const isDeleteLoading = ref(false);

const unfollowBoards = async () => {
  if (!props.selection?.id || isUnfollowLoading.value) return;

  try {
    isUnfollowLoading.value = true;

    const params: UnfollowParams = {
      id: props.entityId,
      type: props.entityType,
      selection_id: props.selection.id,
      boards_ids: selectedBoardIds.value,
    };

    await selectionsService.unfollowBoards(params);

    selectionsStore.updateBoardsWatchStatus(
      props.selection.id,
      selectedBoardIds.value
    );
    selectedBoardIds.value = [];
  } catch (error) {
    console.error("Error unfollowing boards:", error);
  } finally {
    isUnfollowLoading.value = false;
  }
};

const deleteBoards = async () => {
  if (
    !props.selection?.id ||
    isDeleteLoading.value ||
    !selectedBoardIds.value.length ||
    !selectionTableRef.value
  )
    return;

  try {
    isDeleteLoading.value = true;
    const selectionItemIds = selectionTableRef.value.selectedSelectionItemIds;

    await selectionsService.deleteBoardsFromSelection(props.selection.id, {
      items: selectionItemIds,
    });

    selectionsStore.removeBoardsFromSelection(
      props.selection.id,
      selectionItemIds,
    );
    selectedBoardIds.value = [];
  } catch (error) {
    console.error("Error deleting boards:", error);
  } finally {
    isDeleteLoading.value = false;
  }
};
</script>

<template>
  <Modal :open="props.open" :close-modal="close" no-padding fullscreen>
    <template #content>
      <div
        class="h-full w-full relative overflow-hidden bg-app-bg transition-all z-21"
      >
        <!-- Modal header -->
        <div
          class="flex items-center justify-between p-[1.25rem] border-b border-app-border"
        >
          <h2 class="text-2xl">ID {{ props.selection?.id }}</h2>
          <button
            class="text-app-text hover:text-app-text-hover"
            @click="close"
          >
            <span class="sr-only">Закрити</span>
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <SelectionTable
          v-if="props.selection?.boards_list"
          ref="selectionTableRef"
          v-model="selectedBoardIds"
          :selection-id="props.selection.id"
          :selection-items="props.selection?.boards_list"
        />

        <div
          class="flex fixed bottom-0 left-0 right-0 z-2 bg-app-bg py-4 px-[1.25rem] shadow-up"
        >
          <Dropdown ref="dropdownRef" position="top" trigger="click">
            <template #activator>
              <Button variant="text">
                <ArrowDownTrayIcon class="w-5 inline-block mr-1" /> Завантажити
                в .xls
              </Button>
            </template>

            <div
              class="flex flex-col max-h-[18.75rem] overflow-auto scrollbar-thin"
            >
              <Checkbox
                v-for="col in globalStore.exportCols"
                :key="col.alias"
                v-model="selectedColumns"
                :value="col.alias"
                :label="col.name"
                class="py-4 px-4 hover:bg-app-bg-secondary-lighter"
              />

              <Button class="mx-4 mb-4" :loading="isLoading" @click="download">
                <ArrowDownTrayIcon class="w-5 inline-block mr-1" /> Завантажити
                в .xls
              </Button>
            </div>
          </Dropdown>

          <FollowBoardsModal
            v-model="isFollowBoardsModalOpen"
            :selected-board-ids="selectedBoardIds"
            :selection-id="props.selection?.id || 0"
            :entity-id="props.entityId"
            :entity-type="props.entityType"
            @followed="selectedBoardIds = []"
          />

          <SlideTransition animation="slide-down">
            <span v-if="selectedBoardIds.length">
              <Button variant="text" @click="isFollowBoardsModalOpen = true">
                <EyeIcon class="w-5 inline-block mr-1" />Додати до спостереження
              </Button>

              <Button
                variant="text"
                :loading="isUnfollowLoading"
                :disabled="isUnfollowLoading"
                @click="unfollowBoards"
              >
                <EyeSlashIcon class="w-5 inline-block mr-1" />Прибрати із
                спостереження
              </Button>

              <Button
                variant="text"
                :loading="isDeleteLoading"
                :disabled="isDeleteLoading"
                @click="deleteBoards"
              >
                <TrashIcon class="w-5 inline-block mr-1" />Видалити
              </Button>
            </span>
          </SlideTransition>
        </div>
      </div>
    </template>
  </Modal>
</template>
