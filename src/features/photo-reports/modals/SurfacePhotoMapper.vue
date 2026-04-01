<script setup lang="ts">
import { ref, computed, nextTick, watch, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import useStore from "@src/shared/store/store";
import Button from "@src/ui/inputs/Button.vue";
import SwitchInput from "@src/ui/inputs/SwitchInput.vue";
import SurfaceCard from "./SurfaceCard.vue";
import PhotoSlotPicker from "./PhotoSlotPicker.vue";
import {
  ArrowUpTrayIcon,
  QueueListIcon,
  Squares2X2Icon,
  PlayIcon,
} from "@heroicons/vue/24/outline";
import type {
  SelectedPhoto,
  Board,
  PhotoSlotType,
  BoardSlotChange,
  SlotStatus,
} from "../types";
import { SLOT_TYPES } from "../types";

const store = useStore();
const { singleColumn } = storeToRefs(store);

const props = defineProps<{
  photos: SelectedPhoto[];
  boards: Board[];
  readonly?: boolean;
}>();

const assignmentKey = (boardId: number, slotType: PhotoSlotType) =>
  `${boardId}-${slotType}`;

// Original state from board.photos — used for diff in getChangedSlots()
const originalAssignments = ref(new Map<string, string | null>());

// assignments: Map<"boardId-slotType", { type, photo_url }>
const assignments = ref(
  new Map<string, { type: PhotoSlotType; photo_url: string }>(),
);
const selectedSlotTypes = ref(new Map<string, PhotoSlotType>());

// Photos pre-loaded from existing board slots (for view/edit modes)
const initialPhotos = ref<SelectedPhoto[]>([]);

// Locally uploaded files (from drag-drop or file picker)
const localPhotos = ref<SelectedPhoto[]>([]);

// Hidden file input refs
const slotFileInputRef = ref<HTMLInputElement | null>(null);
const globalFileInputRef = ref<HTMLInputElement | null>(null);

// Pending slot context for empty-pool click
const pendingSlotBoardId = ref<number | null>(null);
const pendingSlotType = ref<PhotoSlotType | null>(null);

// Slot-level upload statuses (set externally via setSlotStatus)
const slotStatusOverrides = ref(new Map<string, SlotStatus>());

// Converts FileList/File[] to SelectedPhoto[] with blob URLs and adds to local pool
const addFilesToPool = (files: FileList | File[]): SelectedPhoto[] => {
  const newPhotos: SelectedPhoto[] = [];
  for (const file of Array.from(files)) {
    const url = URL.createObjectURL(file);
    newPhotos.push({
      url,
      thumbnail: url,
      messageId: -(Date.now() + Math.floor(Math.random() * 1e6)),
      file,
    });
  }
  localPhotos.value = [...localPhotos.value, ...newPhotos];
  return newPhotos;
};

// Init assignments from board photos (for view/edit modes with pre-filled data)
watch(
  () => props.boards,
  (newBoards) => {
    // Revoke previous blob URLs to avoid memory leaks
    for (const p of localPhotos.value) {
      if (p.file) URL.revokeObjectURL(p.url);
    }
    localPhotos.value = [];
    slotStatusOverrides.value = new Map();
    selectedSlotTypes.value = new Map();

    const init = new Map<string, { type: PhotoSlotType; photo_url: string }>();
    const original = new Map<string, string | null>();
    const preloaded: SelectedPhoto[] = [];

    for (const board of newBoards) {
      for (const slotType of SLOT_TYPES) {
        const key = assignmentKey(board.board_id, slotType);
        const photoUrl = board.photos[slotType]?.url || null;
        original.set(key, photoUrl);

        if (photoUrl) {
          init.set(key, { type: slotType, photo_url: photoUrl });
          preloaded.push({
            url: photoUrl,
            thumbnail: photoUrl,
            messageId: -(board.board_id * 100 + SLOT_TYPES.indexOf(slotType)),
          });
        }
      }
    }

    assignments.value = init;
    originalAssignments.value = original;
    initialPhotos.value = preloaded;
  },
  { immediate: true },
);

// Track which photos are already assigned
const assignedPhotoUrls = computed(() => {
  const urls = new Set<string>();
  for (const entry of assignments.value.values()) {
    urls.add(entry.photo_url);
  }
  return urls;
});

// Photos available for assignment (not yet assigned)
// Combines props.photos (create mode) with initialPhotos (edit mode from pre-filled slots)
const allPhotos = computed(() => {
  const seen = new Set<string>();
  const result: SelectedPhoto[] = [];
  for (const p of [
    ...props.photos,
    ...initialPhotos.value,
    ...localPhotos.value,
  ]) {
    if (!seen.has(p.url)) {
      seen.add(p.url);
      result.push(p);
    }
  }
  return result;
});

const availablePhotos = computed(() =>
  allPhotos.value.filter((p) => !assignedPhotoUrls.value.has(p.url)),
);

// Continuous filling mode
const continuousFilling = ref(true);
const isSequentialMode = ref(false);
const currentSequentialIndex = ref(0);
const sequentialStartIndex = ref(0);

interface SlotReference {
  boardId: number;
  contractBoardId: number;
  photoreportId: number | null;
  slotType: PhotoSlotType;
  boardCode: string;
  boardAddress: string;
  boardPhoto: string | null;
}

// All slots flattened for sequential navigation
const allSlots = computed<SlotReference[]>(() => {
  const result: SlotReference[] = [];
  for (const board of props.boards) {
    for (const slotType of SLOT_TYPES) {
      result.push({
        boardId: board.board_id,
        contractBoardId: board.contract_board_id,
        photoreportId: board.photoreport_id,
        slotType,
        boardCode: board.board_code,
        boardAddress: board.board_address,
        boardPhoto: board.board_photo,
      });
    }
  }
  return result;
});

const isSlotEmpty = (index: number): boolean => {
  const slot = allSlots.value[index];
  if (!slot) return false;
  return !assignments.value.has(assignmentKey(slot.boardId, slot.slotType));
};

// Find next empty slot circularly from fromIndex, stopping before stopBefore
const findNextEmptySlotCircular = (
  fromIndex: number,
  stopBefore: number,
): number => {
  const len = allSlots.value.length;
  for (let step = 0; step < len; step++) {
    const i = (fromIndex + step) % len;
    if (i === stopBefore && step > 0) return -1;
    if (isSlotEmpty(i)) return i;
  }
  return -1;
};

// Linear version for "Продовжити заповнення"
const findNextEmptySlot = (fromIndex: number): number => {
  for (let i = fromIndex; i < allSlots.value.length; i++) {
    if (isSlotEmpty(i)) return i;
  }
  return -1;
};

const currentSlot = computed<SlotReference | null>(() => {
  if (!isSequentialMode.value) return null;
  if (currentSequentialIndex.value >= allSlots.value.length) return null;
  return allSlots.value[currentSequentialIndex.value];
});

const activeSlotKey = computed(() => {
  if (!currentSlot.value) return undefined;
  return `${currentSlot.value.boardId}-${currentSlot.value.slotType}`;
});

// Container ref for querying slot elements
const containerRef = ref<HTMLElement>();

const getSlotElement = (
  boardId: number,
  slotType: PhotoSlotType,
): HTMLElement | null => {
  if (!containerRef.value) return null;
  return containerRef.value.querySelector(
    `[data-slot-key="${boardId}-${slotType}"]`,
  );
};

// Picker state
const isPickerOpen = ref(false);
const pickerSurfaceName = ref("");
const pickerSurfaceCode = ref("");
const pickerSupplierCode = ref("");
const pickerSlotType = ref<PhotoSlotType>("design");
const pickerCurrentPhoto = ref<string | null>(null);
const pickerEtalonPhoto = ref<string | null>(null);
const pickerBoardId = ref(0);
const pickerSlotPosition = ref<PhotoSlotType>("design");
const showPickerNavigation = ref(false);
const pickerAnchorEl = ref<HTMLElement | null>(null);

const openPickerForSlot = (boardId: number, slotType: PhotoSlotType) => {
  const board = props.boards.find((b) => b.board_id === boardId);
  if (!board) return;

  const key = assignmentKey(boardId, slotType);
  const currentAssignment = assignments.value.get(key);

  pickerSurfaceName.value = board.board_address;
  pickerSurfaceCode.value = board.board_code;
  pickerSupplierCode.value = `#${board.board_id}`;
  pickerSlotType.value =
    selectedSlotTypes.value.get(key) || currentAssignment?.type || slotType;
  pickerCurrentPhoto.value = currentAssignment?.photo_url || null;
  pickerEtalonPhoto.value = board.board_photo;
  pickerBoardId.value = boardId;
  pickerSlotPosition.value = slotType;
  showPickerNavigation.value = isSequentialMode.value;
  pickerAnchorEl.value = getSlotElement(boardId, slotType);
  isPickerOpen.value = true;
};

const getSlotIndex = (boardId: number, slotType: PhotoSlotType): number => {
  return allSlots.value.findIndex(
    (s) => s.boardId === boardId && s.slotType === slotType,
  );
};

const handleSlotClick = (boardId: number, slotType: PhotoSlotType) => {
  const idx = getSlotIndex(boardId, slotType);
  if (idx === -1) return;

  const key = assignmentKey(boardId, slotType);
  const slotIsFilled = assignments.value.has(key);

  // No available photos in pool AND slot is empty → open OS file picker
  if (!slotIsFilled && availablePhotos.value.length === 0) {
    pendingSlotBoardId.value = boardId;
    pendingSlotType.value = slotType;
    slotFileInputRef.value?.click();
    return;
  }

  if (continuousFilling.value) {
    isSequentialMode.value = true;
    sequentialStartIndex.value = idx;
    currentSequentialIndex.value = idx;
  } else {
    isSequentialMode.value = false;
  }
  openPickerForSlot(boardId, slotType);
};

const handleSlotFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  // Save count before clearing — some browsers reset the FileList on input.value = ""
  const fileCount = files.length;
  const newPhotos = addFilesToPool(files);
  input.value = "";

  const boardId = pendingSlotBoardId.value;
  const slotType = pendingSlotType.value;
  pendingSlotBoardId.value = null;
  pendingSlotType.value = null;

  if (!boardId || !slotType) return;

  if (fileCount === 1) {
    // Single file — auto-assign to the clicked slot
    const map = new Map(assignments.value);
    map.set(assignmentKey(boardId, slotType), {
      type: slotType,
      photo_url: newPhotos[0].url,
    });
    assignments.value = map;
  } else {
    // Multiple files — open photo picker on the clicked slot (pool is now populated)
    const idx = getSlotIndex(boardId, slotType);
    if (idx !== -1) {
      if (continuousFilling.value) {
        isSequentialMode.value = true;
        sequentialStartIndex.value = idx;
        currentSequentialIndex.value = idx;
      } else {
        isSequentialMode.value = false;
      }
      nextTick(() => openPickerForSlot(boardId, slotType));
    }
  }
};

const handleGlobalUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  addFilesToPool(files);
  input.value = "";

  // Open picker on first empty slot
  nextTick(() => {
    const nextIdx = findNextEmptySlot(0);
    if (nextIdx === -1) return;
    if (continuousFilling.value) {
      isSequentialMode.value = true;
      sequentialStartIndex.value = nextIdx;
      currentSequentialIndex.value = nextIdx;
      advanceTo(nextIdx);
    } else {
      isSequentialMode.value = false;
      const slot = allSlots.value[nextIdx];
      openPickerForSlot(slot.boardId, slot.slotType);
    }
  });
};

const handlePickerUpload = (files: File[]) => {
  const newPhotos = addFilesToPool(files);

  if (files.length === 1 && isPickerOpen.value) {
    // Single file uploaded while picker is open — auto-assign to current slot
    const map = new Map(assignments.value);
    map.set(assignmentKey(pickerBoardId.value, pickerSlotPosition.value), {
      type: pickerSlotType.value,
      photo_url: newPhotos[0].url,
    });
    assignments.value = map;

    if (isSequentialMode.value) {
      moveToNextEmptySlot();
    } else {
      isPickerOpen.value = false;
    }
  }
  // Multiple files — just add to pool, they appear reactively in picker grid
};

// Called by parent modal on drag-and-drop
const onFilesDropped = (files: FileList) => {
  addFilesToPool(files);

  nextTick(() => {
    const nextIdx = findNextEmptySlot(0);
    if (nextIdx === -1) return;
    if (continuousFilling.value) {
      isSequentialMode.value = true;
      sequentialStartIndex.value = nextIdx;
      currentSequentialIndex.value = nextIdx;
      advanceTo(nextIdx);
    } else {
      isSequentialMode.value = false;
      const slot = allSlots.value[nextIdx];
      openPickerForSlot(slot.boardId, slot.slotType);
    }
  });
};

// Remove a locally uploaded photo from pool (revokes blob URL)
const handleRemoveFromPool = (url: string) => {
  const photo = localPhotos.value.find((p) => p.url === url);
  if (photo?.file) URL.revokeObjectURL(url);
  localPhotos.value = localPhotos.value.filter((p) => p.url !== url);

  const newAssignments = new Map(assignments.value);
  let changed = false;
  for (const [key, assignment] of newAssignments) {
    if (assignment.photo_url === url) {
      newAssignments.delete(key);
      changed = true;
    }
  }
  if (changed) assignments.value = newAssignments;
};

const handlePhotoSelect = (photo: SelectedPhoto) => {
  const map = new Map(assignments.value);
  const key = assignmentKey(pickerBoardId.value, pickerSlotPosition.value);

  map.set(key, {
    type: pickerSlotType.value,
    photo_url: photo.url,
  });

  assignments.value = map;

  if (isSequentialMode.value) {
    moveToNextEmptySlot();
  } else {
    isPickerOpen.value = false;
  }
};

const handleClearSlot = () => {
  const map = new Map(assignments.value);
  const key = assignmentKey(pickerBoardId.value, pickerSlotPosition.value);
  map.delete(key);
  assignments.value = map;
  pickerCurrentPhoto.value = null;
};

const handleTypeChange = (
  boardId: number,
  slotType: PhotoSlotType,
  newType: PhotoSlotType,
) => {
  const key = assignmentKey(boardId, slotType);

  const selectedMap = new Map(selectedSlotTypes.value);
  selectedMap.set(key, newType);
  selectedSlotTypes.value = selectedMap;

  if (
    pickerBoardId.value === boardId &&
    pickerSlotPosition.value === slotType
  ) {
    pickerSlotType.value = newType;
  }

  const current = assignments.value.get(key);
  if (!current) return;

  const map = new Map(assignments.value);
  map.set(key, { ...current, type: newType });
  assignments.value = map;
};

const handleSurfaceClearSlot = (boardId: number, slotType: PhotoSlotType) => {
  const key = assignmentKey(boardId, slotType);
  if (!assignments.value.has(key)) return;

  const map = new Map(assignments.value);
  map.delete(key);
  assignments.value = map;
};

const advanceTo = (nextIdx: number) => {
  currentSequentialIndex.value = nextIdx;
  const slot = allSlots.value[nextIdx];
  nextTick(() => {
    getSlotElement(slot.boardId, slot.slotType)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
    openPickerForSlot(slot.boardId, slot.slotType);
  });
};

const finishSequential = () => {
  isSequentialMode.value = false;
  isPickerOpen.value = false;
};

const moveToNextEmptySlot = () => {
  const next = (currentSequentialIndex.value + 1) % allSlots.value.length;
  const nextIdx = findNextEmptySlotCircular(next, sequentialStartIndex.value);
  if (nextIdx === -1) {
    finishSequential();
    return;
  }
  advanceTo(nextIdx);
};

const handleSkip = () => {
  const next = (currentSequentialIndex.value + 1) % allSlots.value.length;
  const nextIdx = findNextEmptySlotCircular(next, sequentialStartIndex.value);
  if (nextIdx === -1) {
    finishSequential();
    return;
  }
  advanceTo(nextIdx);
};

const handleBack = () => {
  handleClearSlot();

  const len = allSlots.value.length;
  for (let step = 1; step < len; step++) {
    const i = (currentSequentialIndex.value - step + len) % len;
    if (i === sequentialStartIndex.value && step > 1) break;
    currentSequentialIndex.value = i;
    const slot = allSlots.value[i];
    openPickerForSlot(slot.boardId, slot.slotType);
    return;
  }

  isPickerOpen.value = false;
};

const handleCancelSequential = () => {
  finishSequential();
};

const startSequentialFill = () => {
  const nextIdx = findNextEmptySlot(0);
  if (nextIdx === -1) return;

  if (continuousFilling.value) {
    isSequentialMode.value = true;
    sequentialStartIndex.value = nextIdx;
    currentSequentialIndex.value = nextIdx;
    advanceTo(nextIdx);
  } else {
    isSequentialMode.value = false;
    const slot = allSlots.value[nextIdx];
    openPickerForSlot(slot.boardId, slot.slotType);
  }
};

// Available photos for picker (include current slot's photo if exists)
const pickerAvailablePhotos = computed(() => {
  const available = availablePhotos.value;
  if (pickerCurrentPhoto.value) {
    const currentPhoto = allPhotos.value.find(
      (p) => p.url === pickerCurrentPhoto.value,
    );
    if (currentPhoto && !available.find((p) => p.url === currentPhoto.url)) {
      return [currentPhoto, ...available];
    }
  }
  return available;
});

// Warning shown when the open slot's board supplier differs from the photo pool supplier
const supplierWarning = computed((): string | null => {
  if (!isPickerOpen.value) return null;
  const board = props.boards.find((b) => b.board_id === pickerBoardId.value);
  if (!board?.supplier_id) return null;

  const mismatchedPhoto = pickerAvailablePhotos.value.find(
    (p) => p.supplier_id != null && p.supplier_id !== board.supplier_id,
  );
  if (!mismatchedPhoto) return null;

  const suplierFromSpan = `<span class="font-semibold text-secondary">${mismatchedPhoto.supplier_name}</span>`;
  const suplierToSpan = `<span class="font-semibold text-info">${board.supplier_name}</span>`;

  return `Зверніть увагу в пул додано фото від підрядника ${suplierFromSpan} а обрана дошка від ${suplierToSpan}?`;
});

// Build diff: only changed/deleted slots
const getChangedSlots = (): BoardSlotChange[] => {
  const changes: BoardSlotChange[] = [];

  for (const board of props.boards) {
    for (const slotType of SLOT_TYPES) {
      const key = assignmentKey(board.board_id, slotType);
      const originalUrl = originalAssignments.value.get(key) || null;
      const current = assignments.value.get(key);

      if (current) {
        // Slot has an assignment — check if it changed (photo or type)
        if (current.photo_url !== originalUrl || current.type !== slotType) {
          const localPhoto = localPhotos.value.find(
            (p) => p.url === current.photo_url,
          );
          changes.push({
            board_id: board.board_id,
            contract_board_id: board.contract_board_id,
            photoreport_id: board.photoreport_id,
            slotType: current.type,
            value: localPhoto?.file || current.photo_url,
            photo_url: current.photo_url,
          });
        }
      } else if (originalUrl) {
        // Assignment removed but original existed → delete
        // photo_url is kept so the store can call onProgress() for this slot
        changes.push({
          board_id: board.board_id,
          contract_board_id: board.contract_board_id,
          photoreport_id: board.photoreport_id,
          slotType,
          value: "",
          photo_url: originalUrl,
        });
      }
    }
  }

  return changes;
};

const setSlotStatus = (
  boardId: number,
  slotType: PhotoSlotType,
  status: SlotStatus,
) => {
  const map = new Map(slotStatusOverrides.value);
  map.set(assignmentKey(boardId, slotType), status);
  slotStatusOverrides.value = map;
};

const clearSlotStatus = (boardId: number, slotType: PhotoSlotType) => {
  const map = new Map(slotStatusOverrides.value);
  map.delete(assignmentKey(boardId, slotType));
  slotStatusOverrides.value = map;
};

const hasEmptySlots = computed(() => findNextEmptySlot(0) !== -1);

const hasChanges = computed(() => getChangedSlots().length > 0);

/** Slot-level statuses: external overrides take priority, then modified detection */
const slotStatusMap = computed((): Map<string, SlotStatus> => {
  const map = new Map<string, SlotStatus>();
  for (const board of props.boards) {
    for (const slotType of SLOT_TYPES) {
      const key = assignmentKey(board.board_id, slotType);

      const override = slotStatusOverrides.value.get(key);
      if (override) {
        map.set(key, override);
        continue;
      }

      const assignment = assignments.value.get(key);
      const originalUrl = originalAssignments.value.get(key) ?? null;

      if (!assignment) {
        if (originalUrl) map.set(key, "modified");
        continue;
      }

      if (
        assignment.photo_url !== originalUrl ||
        assignment.type !== slotType
      ) {
        map.set(key, "modified");
      }
    }
  }
  return map;
});

const handleSlotDone = (boardId: number, slotType: PhotoSlotType) => {
  const key = assignmentKey(boardId, slotType);
  const assignment = assignments.value.get(key);
  const newOriginals = new Map(originalAssignments.value);

  if (assignment) {
    clearSlotStatus(boardId, slotType);
    newOriginals.set(key, assignment.photo_url);
  } else {
    clearSlotStatus(boardId, slotType);
    newOriginals.set(key, null);
  }

  originalAssignments.value = newOriginals;
};

onBeforeUnmount(() => {
  for (const p of localPhotos.value) {
    if (p.file) URL.revokeObjectURL(p.url);
  }
  localPhotos.value = [];
  slotStatusOverrides.value = new Map();
  assignments.value = new Map();
  selectedSlotTypes.value = new Map();
});

const emit = defineEmits<{
  "badge-retry": [photoUrl: string];
}>();

defineExpose({
  getChangedSlots,
  hasChanges,
  localPhotos,
  onFilesDropped,
  setSlotStatus,
  clearSlotStatus,
});
</script>

<template>
  <div ref="containerRef" class="relative">
    <!-- Hidden file inputs -->
    <input
      ref="slotFileInputRef"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="handleSlotFileInput"
    />
    <input
      ref="globalFileInputRef"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="handleGlobalUpload"
    />

    <div
      v-if="!readonly"
      class="mb-3 flex items-center justify-between flex-wrap gap-y-2 gap-x-3"
    >
      <div class="text-xs text-app-text-secondary">
        Нерозподілених фото: {{ availablePhotos.length }}
      </div>
      <div class="flex items-center w-full sm:w-auto justify-between gap-3">
        <label class="flex items-center gap-1.5 cursor-pointer select-none">
          <SwitchInput v-model="continuousFilling" size="sm" />
          <span class="text-xs text-app-text-secondary whitespace-nowrap">
            Неперервне заповнення
          </span>
        </label>
        <div class="flex items-center gap-2">
          <Button
            v-if="hasEmptySlots && availablePhotos.length > 0"
            variant="outline"
            size="xs"
            title="Продовжити заповнення"
            @click="startSequentialFill"
          >
            <template #icon>
              <PlayIcon class="w-4 h-4 sm:hidden" />
            </template>
            <span class="hidden sm:inline">Продовжити заповнення</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            icon-only
            :ring="false"
            :title="singleColumn ? 'Дві колонки' : 'Одна колонка'"
            @click="singleColumn = !singleColumn"
          >
            <template #icon>
              <QueueListIcon v-if="!singleColumn" class="w-4 h-4" />
              <Squares2X2Icon v-else class="w-4 h-4" />
            </template>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            icon-only
            :ring="false"
            title="Завантажити фото"
            @click="globalFileInputRef?.click()"
          >
            <template #icon>
              <ArrowUpTrayIcon class="w-4 h-4" />
            </template>
          </Button>
        </div>
      </div>
    </div>

    <div
      :class="[
        'flex flex-col gap-5 pr-1',
        !singleColumn && 'xl:grid xl:grid-cols-2 xl:gap-4',
      ]"
    >
      <SurfaceCard
        v-for="board in boards"
        :key="board.board_id"
        :board="board"
        :assignments="assignments"
        :selected-slot-types="selectedSlotTypes"
        :active-slot-key="activeSlotKey"
        :readonly="readonly"
        :slot-statuses="slotStatusMap"
        @slot-click="handleSlotClick"
        @type-change="handleTypeChange"
        @clear-slot="handleSurfaceClearSlot"
        @badge-retry="(url: string) => emit('badge-retry', url)"
        @slot-done="handleSlotDone"
      />
    </div>

    <PhotoSlotPicker
      v-if="!readonly"
      :open="isPickerOpen"
      :surface-name="pickerSurfaceName"
      :surface-code="pickerSurfaceCode"
      :supplier-code="pickerSupplierCode"
      :slot-type="pickerSlotType"
      :available-photos="pickerAvailablePhotos"
      :current-photo-url="pickerCurrentPhoto"
      :etalon-photo="pickerEtalonPhoto"
      :show-navigation="showPickerNavigation"
      :anchor-el="pickerAnchorEl"
      :supplier-warning="supplierWarning"
      @close="finishSequential"
      @select="handlePhotoSelect"
      @clear="handleClearSlot"
      @skip="handleSkip"
      @back="handleBack"
      @cancel="handleCancelSequential"
      @upload="handlePickerUpload"
      @remove-photo="handleRemoveFromPool"
    />
  </div>
</template>
