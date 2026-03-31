<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useDebounceFn, whenever } from "@vueuse/core";
import { useDragDropZone } from "@src/shared/composables/useDragDropZone";
import DragDropSurface from "@src/ui/components/DragDropSurface.vue";
import Modal from "@src/ui/modals/Modal.vue";
import ConfirmModal from "@src/ui/modals/ConfirmModal.vue";
import Button from "@src/ui/inputs/Button.vue";
import AutocompleteSelect from "@src/ui/inputs/AutocompleteSelect.vue";
import Checkbox from "@src/ui/inputs/Checkbox.vue";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import SurfacePhotoMapper from "./SurfacePhotoMapper.vue";
import { usePhotoReportsStore } from "../photo-reports-store";
import type { SaveProgressCallback } from "../photo-reports-store";
import { useToast } from "@src/shared/composables/useToast";
import type { SelectedPhoto, BoardSlotChange } from "../types";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import SimpleMediaModal from "@src/ui/data-display/SimpleMediaModal.vue";
import { useEventBus } from "@vueuse/core";
import {
  useSendMessageModal,
  SendMessageModal,
} from "@src/features/chat/modals/SendMessageModal";

const props = defineProps<{
  open: boolean;
  photos: SelectedPhoto[];
  mode?: "create" | "view" | "edit";
  clientId?: number;
  ym?: string;
  periodLabel?: string;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const store = usePhotoReportsStore();
const { toastSuccess, toastError } = useToast();
const sendMessageModal = useSendMessageModal();

const selectedClientId = ref<string | number>("");
const selectedYm = ref<string>("");
const selectedSupplierId = ref<string | number>("");
const sendToClient = ref(false);
const mapperRef = ref<InstanceType<typeof SurfacePhotoMapper> | null>(null);
const internalMode = ref<"create" | "view" | "edit">(props.mode ?? "create");
const showCloseConfirm = ref(false);
const failedItems = ref<BoardSlotChange[]>([]);

const {
  isDragging,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
} = useDragDropZone({
  disabled: () => internalMode.value === "view",
  onFilesDrop: (files) => mapperRef.value?.onFilesDropped(files),
});

const clientOptions = computed(() =>
  store.clients.map((c) => ({
    value: c.id,
    label: `#${c.id} ${c.name}`,
  })),
);

const periodOptions = computed(() =>
  store.periods.map((p) => ({
    value: p.ym,
    label: p.label,
  })),
);

const supplierOptions = computed(() => [
  ...new Map(
    store.allBoards
      .filter((b) => b.supplier_id != null)
      .map((b) => [
        b.supplier_id,
        {
          value: b.supplier_id as number,
          label: b.supplier_name ?? String(b.supplier_id),
        },
      ]),
  ).values(),
]);

const showMapper = computed(() => {
  if (internalMode.value !== "create") return store.boards.length > 0;
  return !!(
    selectedClientId.value &&
    selectedYm.value &&
    store.boards.length > 0
  );
});

const debouncedSearch = useDebounceFn(async (query: string) => {
  await store.searchClients(query);
}, 300);

const handleClientSearch = (query: string) => {
  debouncedSearch(query);
};

whenever(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      internalMode.value = props.mode ?? "create";
      if (internalMode.value === "create") {
        await store.searchClients("");
      } else if (props.ym && props.clientId) {
        await store.loadBoards(props.clientId, props.ym);
      }
    }
  },
);

watch(selectedClientId, async (clientId) => {
  selectedYm.value = "";
  store.boards = [];

  if (clientId) {
    await store.loadPeriods(Number(clientId));
  }
});

watch(selectedYm, async (ym) => {
  if (ym && selectedClientId.value) {
    selectedSupplierId.value = "";
    await store.loadBoards(Number(selectedClientId.value), ym);
  }
});

watch(selectedSupplierId, async (supplierId) => {
  const clientId =
    internalMode.value === "create"
      ? Number(selectedClientId.value)
      : props.clientId;
  const ym = internalMode.value === "create" ? selectedYm.value : props.ym;
  if (!clientId || !ym) return;
  await store.loadBoards(
    clientId,
    ym,
    supplierId ? Number(supplierId) : undefined,
  );
});

const createProgressCallback = (): SaveProgressCallback => {
  return (boardId, slotType, status) => {
    mapperRef.value?.setSlotStatus(boardId, slotType, status);
  };
};

const handleSave = async () => {
  if (!mapperRef.value) return;
  if (internalMode.value === "view") return;

  const changedSlots = mapperRef.value.getChangedSlots();

  if (changedSlots.length === 0) {
    toastError("Нічого не змінено");
    return;
  }

  const effectiveClientId =
    internalMode.value === "create"
      ? Number(selectedClientId.value)
      : props.clientId;

  try {
    const { failedItems: failed } = await store.processSaveQueue(
      changedSlots,
      undefined,
      createProgressCallback(),
    );

    failedItems.value = failed;

    if (failed.length > 0) {
      toastError(`${failed.length} фото не вдалося зберегти`);
      return;
    }

    if (sendToClient.value) {
      const ym =
        internalMode.value === "create" ? selectedYm.value : props.ym ?? "";
      let messageTemplate: string | undefined;
      try {
        const templateResponse = await store.getMessageTemplate(
          effectiveClientId!,
          ym,
        );
        messageTemplate = templateResponse.message;
      } catch {
      }
      sendMessageModal.open({
        entityType: "client",
        entityId: effectiveClientId,
        messageTemplate,
      });
      return;
    }

    toastSuccess("Фотозвіт збережено");
    emit("saved");
    setTimeout(() => forceClose(), 2200);
  } catch (error) {
    console.error("Error saving photo report:", error);
    toastError("Помилка, щось пішло не так");
  }
};

const handleRetryAll = async () => {
  if (failedItems.value.length === 0) return;

  try {
    const { failedItems: failed } = await store.processSaveQueue(
      failedItems.value,
      undefined,
      createProgressCallback(),
    );

    failedItems.value = failed;

    if (failed.length === 0) {
      toastSuccess("Фотозвіт збережено");
      emit("saved");
      forceClose();
    } else {
      toastError(`${failed.length} фото не вдалося зберегти`);
    }
  } catch (error) {
    console.error("Error retrying photo report:", error);
    toastError("Помилка, щось пішло не так");
  }
};

const handleBadgeRetry = async (photoUrl: string) => {
  const item = failedItems.value.find((i) => i.photo_url === photoUrl);
  if (!item) return;

  try {
    const { failedItems: failed } = await store.processSaveQueue(
      [item],
      undefined,
      createProgressCallback(),
    );

    failedItems.value = [
      ...failedItems.value.filter((i) => i.photo_url !== photoUrl),
      ...failed,
    ];
  } catch (error) {
    console.error("Error retrying single slot:", error);
  }
};

const close = () => {
  if (store.isSaving) {
    showCloseConfirm.value = true;
    return;
  }
  forceClose();
};

const handleCloseConfirm = () => {
  showCloseConfirm.value = false;
  forceClose();
};

const forceClose = () => {
  selectedClientId.value = "";
  selectedYm.value = "";
  selectedSupplierId.value = "";
  sendToClient.value = false;
  failedItems.value = [];
  store.reset();
  emit("close");
};

// imgs preview

const showMediaModal = ref(false);

const openImgsModalEvent = useEventBus<string>("photoreport:open-imgs-modal");

const imgs = ref<string[]>([]);

openImgsModalEvent.on((photoUrl: string) => {
  imgs.value = [photoUrl];
  showMediaModal.value = true;
});
</script>

<template>
  <Modal :open="props.open" :close-modal="close" no-padding fullscreen>
    <template #content>
      <div
        class="h-full w-full flex flex-col overflow-hidden bg-app-bg transition-all text-app-text relative"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover.prevent="handleDragOver"
        @drop.prevent="handleDrop"
      >
        <!-- Drag-and-drop overlay -->
        <DragDropSurface
          v-if="isDragging"
          variant="overlay"
          title="Перетягніть фото сюди"
          subtitle="Відпустіть, щоб додати до пулу"
        />

        <!-- Save progress bar -->
        <div
          v-if="store.saveProgress"
          class="absolute top-0 left-0 right-0 h-1 bg-app-border overflow-hidden z-10"
        >
          <div
            class="h-full bg-primary transition-all duration-200"
            :style="{
              width: `${Math.round((store.saveProgress.current / store.saveProgress.total) * 100)}%`,
            }"
          />
        </div>

        <!-- Header -->
        <div
          class="flex items-center justify-between p-[1.25rem] border-b border-app-border shrink-0"
        >
          <div class="text-center w-full">
            <h2 class="text-xl font-semibold">
              {{
                internalMode === "view"
                  ? "Перегляд фотозвіту"
                  : internalMode === "edit"
                    ? "Редагування фотозвіту"
                    : "Присвоїти фотозвіт"
              }}
            </h2>
            <p class="text-sm mt-1 text-app-text-secondary">
              {{
                internalMode !== "create" && periodLabel
                  ? periodLabel
                  : `Обрано ${photos.length} фото для розподілу по площинах`
              }}
            </p>
          </div>
          <Button variant="ghost" icon-only @click="close">
            <template #icon>
              <XMarkIcon class="h-6 w-6" />
            </template>
          </Button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-[1.25rem] scrollbar-thin">
          <div class="space-y-4">
            <div
              v-if="internalMode === 'create'"
              class="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <AutocompleteSelect
                v-model="selectedClientId"
                :options="clientOptions"
                placeholder="Виберіть клієнта"
                :disabled="store.isSaving"
                variant="bordered"
                searchable
                @search="handleClientSearch"
              />

              <AutocompleteSelect
                v-model="selectedYm"
                :options="periodOptions"
                placeholder="Виберіть період"
                :disabled="!selectedClientId || store.isSaving"
                variant="bordered"
                searchable
              />

              <AutocompleteSelect
                v-model="selectedSupplierId"
                :options="supplierOptions"
                placeholder="Підрядник"
                :disabled="
                  !selectedYm || store.isSaving || store.isLoadingBoards
                "
                variant="bordered"
              />
            </div>

            <div
              v-if="store.isLoadingBoards && !showMapper"
              class="py-8 flex justify-center"
            >
              <Spinner />
            </div>

            <div v-if="showMapper" class="relative">
              <div
                v-if="store.isLoadingBoards"
                class="absolute inset-0 z-10 flex items-center justify-center bg-app-bg/60 rounded"
              >
                <Spinner />
              </div>
              <SurfacePhotoMapper
                ref="mapperRef"
                :photos="photos"
                :boards="store.boards"
                :readonly="internalMode === 'view'"
                @badge-retry="handleBadgeRetry"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex flex-col gap-3 p-[1.25rem] border-t border-app-border bg-app-bg shrink-0"
        >
          <!-- create mode -->
          <template v-if="internalMode === 'create'">
            <div class="flex items-center justify-between">
              <Checkbox v-model="sendToClient" label="Надіслати звіт клієнту" />
              <div class="flex items-center gap-3">
                <Button variant="text" @click="close"> Скасувати </Button>
                <Button
                  v-if="failedItems.length > 0"
                  variant="outline"
                  :loading="store.isSaving"
                  @click="handleRetryAll"
                >
                  Повторити ({{ failedItems.length }})
                </Button>
                <Button
                  :disabled="
                    !showMapper || store.isSaving || !mapperRef?.hasChanges
                  "
                  :loading="store.isSaving"
                  @click="handleSave"
                >
                  {{ sendToClient ? "Надіслати" : "Зберегти" }}
                </Button>
              </div>
            </div>
          </template>

          <!-- view mode -->
          <template v-else-if="internalMode === 'view'">
            <div class="flex items-center justify-end gap-3">
              <Button variant="text" @click="close"> Закрити </Button>
              <Button
                variant="outline"
                :disabled="!showMapper"
                @click="internalMode = 'edit'"
              >
                Редагувати
              </Button>
            </div>
          </template>

          <!-- edit mode -->
          <template v-else-if="internalMode === 'edit'">
            <div class="flex items-center justify-end gap-3">
              <Button variant="text" @click="close"> Скасувати </Button>
              <Button
                v-if="failedItems.length > 0"
                variant="outline"
                :loading="store.isSaving"
                @click="handleRetryAll"
              >
                Повторити ({{ failedItems.length }})
              </Button>
              <Button
                :disabled="
                  !showMapper || store.isSaving || !mapperRef?.hasChanges
                "
                :loading="store.isSaving"
                @click="handleSave"
              >
                Зберегти
              </Button>
            </div>
          </template>
        </div>
      </div>
    </template>
  </Modal>

  <ConfirmModal
    :open="showCloseConfirm"
    title="Збереження не завершено"
    confirm-text="Закрити"
    cancel-text="Продовжити"
    @confirm="handleCloseConfirm"
    @cancel="showCloseConfirm = false"
  >
    <template #body>
      Фото ще зберігаються. Якщо закрити зараз, збереження буде перервано.
    </template>
  </ConfirmModal>

  <SimpleMediaModal
    :open="showMediaModal"
    :image-urls="imgs"
    @close="showMediaModal = false"
  />

  <SendMessageModal />
</template>
