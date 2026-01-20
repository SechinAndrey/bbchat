<script setup lang="ts">
import { ref, computed } from "vue";
import Modal from "@src/ui/modals/Modal.vue";
import { useToast } from "@src/shared/composables/useToast";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ShoppingCartIcon,
  LinkIcon,
} from "@heroicons/vue/24/outline";
import type { ApiSelection } from "@src/api/types";
import SelectionTable from "@src/features/selections/SelectionTable.vue";
import Button from "@src/ui/inputs/Button.vue";
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
import { copyToClipboard } from "@src/shared/utils";

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

const currentSelection = computed(() => {
  if (!props.selection?.id) return props.selection;
  return (
    selectionsStore.selections.find((s) => s.id === props.selection!.id) ||
    props.selection
  );
});

const selectedColumns = ref<string[]>([]);

const isLoading = ref(false);
const dropdownRef = ref<InstanceType<typeof Dropdown> | null>(null);
const dropdownMobileRef = ref<InstanceType<typeof Dropdown> | null>(null);

const download = async () => {
  if (!props.selection?.id) return;
  isLoading.value = true;
  try {
    const response = await selectionsService.downloadSelection(
      props.selection.id,
      { columns: selectedColumns.value, boards: selectedBoardIds.value },
    );

    const fileUrl = response?.link;

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
const isAddFromCartLoading = ref(false);
const isGetLinkLoading = ref(false);

const { toastSuccess, toastError } = useToast();

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
      selectedBoardIds.value,
    );
    selectedBoardIds.value = [];
  } catch (error) {
    console.error("Error unfollowing boards:", error);
  } finally {
    isUnfollowLoading.value = false;
  }
};

const addFromCart = async () => {
  if (!props.selection?.id || isAddFromCartLoading.value) return;

  try {
    isAddFromCartLoading.value = true;
    await selectionsStore.addFromCart(props.selection.id);
    toastSuccess("Площини з корзини успішно додано до підбірки");
  } catch (err) {
    console.error("Error adding boards from cart:", err);
    toastError("Не вдалося додати площини з корзини");
  } finally {
    isAddFromCartLoading.value = false;
  }
};

const getLink = async () => {
  if (!props.selection?.id || isGetLinkLoading.value) return;

  try {
    isGetLinkLoading.value = true;
    const response = await selectionsService.getLink(
      props.selection.id,
      selectedBoardIds.value.length > 0
        ? selectedBoardIds.value
        : props.selection.boards_list?.map((b) => b.id) || [],
    );

    if (response?.link) {
      await copyToClipboard(response.link);
      toastSuccess("Посилання скопійовано в буфер обміну");
    }
  } catch (err) {
    console.error("Error getting link:", err);
    toastError("Не вдалося отримати посилання");
  } finally {
    isGetLinkLoading.value = false;
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
        class="h-full w-full relative overflow-hidden bg-app-bg transition-all text-app-text"
      >
        <!-- Modal header -->
        <div
          class="flex items-center justify-between p-[1.25rem] border-b border-app-border"
        >
          <h2 class="text-2xl">ID {{ currentSelection?.id }}</h2>
          <Button variant="ghost" icon-only @click="close">
            <template #icon>
              <XMarkIcon class="h-6 w-6" />
            </template>
          </Button>
        </div>

        <SelectionTable
          v-if="currentSelection?.boards_list"
          ref="selectionTableRef"
          v-model="selectedBoardIds"
          :selection-id="currentSelection.id"
          :selection-items="currentSelection?.boards_list"
        />

        <!-- controls -->
        <div class="fixed bottom-0 left-0 right-0 z-2 bg-app-bg shadow-up">
          <!-- Mobile Layout -->
          <div class="selection-modal_mobile-actions">
            <div class="px-4 py-3 border-b border-app-border">
              <Dropdown ref="dropdownMobileRef" position="top" trigger="click">
                <template #activator>
                  <Button variant="text" block>
                    <ArrowDownTrayIcon class="w-5 inline-block mr-1" />
                    Завантажити в .xls
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

                  <Button
                    class="mx-4 mb-4"
                    :loading="isLoading"
                    @click="download"
                  >
                    <ArrowDownTrayIcon class="w-5 inline-block mr-1" />
                    Завантажити в .xls
                  </Button>
                </div>
              </Dropdown>

              <Button
                variant="text"
                block
                :loading="isAddFromCartLoading"
                :disabled="isAddFromCartLoading"
                @click="addFromCart"
              >
                <ShoppingCartIcon class="w-5 inline-block mr-1" />Додати із
                корзини
              </Button>
            </div>

            <!-- Selection Actions - Only when boards selected -->
            <SlideTransition animation="slide-down">
              <div v-if="selectedBoardIds.length" class="px-4 py-3 space-y-2">
                <div class="text-sm text-app-text-secondary mb-3">
                  Обрано: {{ selectedBoardIds.length }} дошок
                </div>

                <Button
                  variant="text"
                  block
                  :loading="isGetLinkLoading"
                  :disabled="isGetLinkLoading"
                  @click="getLink"
                >
                  <LinkIcon class="w-5 inline-block mr-1" />Отримати посилання
                </Button>

                <div class="grid grid-cols-1 gap-2">
                  <Button
                    variant="text"
                    block
                    @click="isFollowBoardsModalOpen = true"
                  >
                    <EyeIcon class="w-5 inline-block mr-1" />Додати до
                    спостереження
                  </Button>

                  <Button
                    variant="text"
                    block
                    :loading="isUnfollowLoading"
                    :disabled="isUnfollowLoading"
                    @click="unfollowBoards"
                  >
                    <EyeSlashIcon class="w-5 inline-block mr-1" />Прибрати із
                    спостереження
                  </Button>

                  <Button
                    variant="text"
                    block
                    :loading="isDeleteLoading"
                    :disabled="isDeleteLoading"
                    @click="deleteBoards"
                  >
                    <TrashIcon class="w-5 inline-block mr-1" />Видалити
                  </Button>
                </div>
              </div>
            </SlideTransition>
          </div>

          <!-- Desktop Layout -->
          <div
            class="items-center justify-between py-4 px-[1.25rem] selection-modal_desktop-actions"
          >
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-4">
                <Dropdown ref="dropdownRef" position="top" trigger="click">
                  <template #activator>
                    <Button variant="text">
                      <ArrowDownTrayIcon class="w-5 inline-block mr-1" />
                      <span class="whitespace-nowrap">Завантажити в .xls</span>
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

                    <Button
                      class="mx-4 mb-4"
                      :loading="isLoading"
                      @click="download"
                    >
                      <ArrowDownTrayIcon class="w-5 inline-block mr-1" />
                      Завантажити в .xls
                    </Button>
                  </div>
                </Dropdown>

                <Button
                  variant="text"
                  :loading="isAddFromCartLoading"
                  :disabled="isAddFromCartLoading"
                  @click="addFromCart"
                >
                  <ShoppingCartIcon class="w-5 inline-block mr-1" />
                  <span class="whitespace-nowrap">Додати із корзини</span>
                </Button>
              </div>

              <SlideTransition animation="slide-down">
                <div
                  v-if="selectedBoardIds.length"
                  class="flex items-center gap-4"
                >
                  <Button
                    variant="text"
                    :loading="isGetLinkLoading"
                    :disabled="isGetLinkLoading"
                    @click="getLink"
                  >
                    <LinkIcon class="w-5 inline-block mr-1" />
                    <span class="whitespace-nowrap">Отримати посилання</span>
                  </Button>

                  <Button
                    variant="text"
                    @click="isFollowBoardsModalOpen = true"
                  >
                    <EyeIcon class="w-5 inline-block mr-1" />
                    <span class="whitespace-nowrap">
                      Додати доспостереження
                    </span>
                  </Button>

                  <Button
                    variant="text"
                    :loading="isUnfollowLoading"
                    :disabled="isUnfollowLoading"
                    @click="unfollowBoards"
                  >
                    <EyeSlashIcon class="w-5 inline-block mr-1" />
                    <span class="whitespace-nowrap">
                      Прибрати із спостереження
                    </span>
                  </Button>

                  <Button
                    variant="text"
                    :loading="isDeleteLoading"
                    :disabled="isDeleteLoading"
                    @click="deleteBoards"
                  >
                    <TrashIcon class="w-5 inline-block mr-1" />
                    <span class="whitespace-nowrap">Видалити</span>
                  </Button>
                </div>
              </SlideTransition>
            </div>

            <!-- Selection Counter for Desktop -->
            <SlideTransition animation="slide-left">
              <div
                v-if="selectedBoardIds.length"
                class="text-sm text-app-text-secondary whitespace-nowrap ml-6"
              >
                Обрано:
                <span class="font-medium text-app-text">{{
                  selectedBoardIds.length
                }}</span>
                дошок
              </div>
            </SlideTransition>
          </div>

          <FollowBoardsModal
            v-model="isFollowBoardsModalOpen"
            :selected-board-ids="selectedBoardIds"
            :selection-id="currentSelection?.id || 0"
            :entity-id="props.entityId"
            :entity-type="props.entityType"
            @followed="selectedBoardIds = []"
          />
        </div>
      </div>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.selection-modal_mobile-actions {
  @media (min-width: 1244px) {
    display: none;
  }
}

.selection-modal_desktop-actions {
  display: flex;
  @media (max-width: 1243px) {
    display: none;
  }
}
</style>
