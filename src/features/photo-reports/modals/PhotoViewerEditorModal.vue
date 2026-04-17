<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from "vue";
import { useEventListener } from "@vueuse/core";
import {
  XMarkIcon,
  PencilIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from "@heroicons/vue/24/outline";
import Button from "@src/ui/inputs/Button.vue";
import RangeSlider from "@src/ui/inputs/RangeSlider.vue";
import { usePhotoEditor } from "../composables/usePhotoEditor";
import type { EditorMode } from "../composables/usePhotoEditor";
import IconParkOutlineMosaic from "~icons/icon-park-outline/mosaic";
import IcSharpBlurOn from "~icons/ic/sharp-blur-on";

const props = defineProps<{
  open: boolean;
  imageUrl: string;
  editable?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  saved: [blob: Blob];
}>();

// ─── Mode ─────────────────────────────────────────────────────────────────

type ViewMode = "view" | "edit";
const mode = ref<ViewMode>("view");
const isSaving = ref(false);
const imageLoaded = ref(false);

// ─── Zoom ─────────────────────────────────────────────────────────────────

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const zoomLevel = ref(1);
const BRUSH_SIZE_MIN = 5;
const BRUSH_SIZE_MAX = 100;
const EDITOR_VIEWPORT_PADDING = 16;
const EDITOR_HEADER_HEIGHT = 56;
const EDITOR_TOOLBAR_HEIGHT = 72;

const brushSizePercentage = computed(() => {
  const normalized =
    (editor.brushSize.value - BRUSH_SIZE_MIN) /
    (BRUSH_SIZE_MAX - BRUSH_SIZE_MIN);

  return Math.round(normalized * 100);
});

const blurButtonVariant = computed(() =>
  editor.currentMode.value === "blur" ? "primary" : "ghost",
);

const mosaicButtonVariant = computed(() =>
  editor.currentMode.value === "mosaic" ? "secondary" : "ghost",
);

const circleShapeButtonVariant = computed(() =>
  editor.brushShape.value === "circle" ? "secondary" : "ghost",
);

const squareShapeButtonVariant = computed(() =>
  editor.brushShape.value === "square" ? "secondary" : "ghost",
);

function zoomIn() {
  zoomLevel.value = Math.min(
    ZOOM_MAX,
    +(zoomLevel.value + ZOOM_STEP).toFixed(2),
  );
}
function zoomOut() {
  zoomLevel.value = Math.max(
    ZOOM_MIN,
    +(zoomLevel.value - ZOOM_STEP).toFixed(2),
  );
}
function resetZoom() {
  zoomLevel.value = 1;
}

// ─── Editor ───────────────────────────────────────────────────────────────

const editor = usePhotoEditor();
const canvasEl = ref<HTMLCanvasElement | null>(null);

// ─── Open / close ─────────────────────────────────────────────────────────

function handleClose() {
  if (mode.value === "edit") {
    _leaveEditMode();
    mode.value = "view";
    return;
  }
  emit("close");
}

function handleOverlayClick() {
  if (mode.value === "view") emit("close");
}

// ─── Edit mode ────────────────────────────────────────────────────────────

async function enterEditMode() {
  mode.value = "edit";
  zoomLevel.value = 1;
  await nextTick();
  if (!canvasEl.value) return;
  try {
    await editor.initCanvas(canvasEl.value, props.imageUrl, {
      maxWidth: window.innerWidth * 0.96,
      maxHeight:
        window.innerHeight -
        EDITOR_HEADER_HEIGHT -
        EDITOR_TOOLBAR_HEIGHT -
        EDITOR_VIEWPORT_PADDING,
    });
    editor.setMode("blur");
    editor.setZoom(1);
  } catch (e) {
    console.error("PhotoEditor init error:", e);
    mode.value = "view";
  }
}

function _leaveEditMode() {
  editor.dispose();
  isSaving.value = false;
  zoomLevel.value = 1;
}

async function handleSave() {
  if (!editor.isReady.value) return;
  isSaving.value = true;
  try {
    const blob = await editor.getResultBlob();
    _leaveEditMode();
    emit("saved", blob);
  } catch (e) {
    console.error("PhotoEditor save error:", e);
    isSaving.value = false;
  }
}

function handleCancel() {
  _leaveEditMode();
  mode.value = "view";
}

function selectMode(m: EditorMode) {
  editor.setMode(m);
}

function handleBrushSizeChange(value: string | number) {
  const numericValue = Number(value);
  const nextBrushSize =
    BRUSH_SIZE_MIN + ((BRUSH_SIZE_MAX - BRUSH_SIZE_MIN) * numericValue) / 100;

  editor.setBrushSize(Math.round(nextBrushSize));
}

function handleImageLoad(event: Event) {
  if (event.target instanceof HTMLImageElement) {
    imageLoaded.value = true;
  }
}

// ─── Keyboard ─────────────────────────────────────────────────────────────

function handleKeydown(e: KeyboardEvent) {
  if (!props.open) return;
  if (e.key === "Escape") {
    e.preventDefault();
    handleClose();
  }
  if (mode.value === "edit") {
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && editor.canUndo.value) {
      e.preventDefault();
      editor.undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "=") {
      e.preventDefault();
      zoomIn();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "-") {
      e.preventDefault();
      zoomOut();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "0") {
      e.preventDefault();
      resetZoom();
    }
  }
}

useEventListener(document, "keydown", handleKeydown);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      mode.value = "view";
      zoomLevel.value = 1;
      imageLoaded.value = false;
    } else {
      _leaveEditMode();
    }
  },
);

watch(
  () => props.imageUrl,
  () => {
    imageLoaded.value = false;
  },
);

watch(zoomLevel, (level) => {
  if (mode.value === "edit" && editor.isReady.value) {
    editor.setZoom(level);
  }
});

onUnmounted(() => {
  _leaveEditMode();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black bg-opacity-90"
      @click="handleOverlayClick"
    >
      <Button
        variant="ghost"
        icon-only
        :ring="false"
        class="absolute top-4 right-4 z-[201]"
        :title="mode === 'edit' ? 'Скасувати редагування' : 'Закрити'"
        @click.stop="handleClose"
      >
        <template #icon>
          <XMarkIcon />
        </template>
      </Button>

      <template v-if="mode === 'view'">
        <div
          class="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
          @click.stop
        >
          <img
            :src="imageUrl"
            class="max-h-[85vh] max-w-[90vw] rounded-xl object-contain transition-opacity duration-200"
            :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
            @load="handleImageLoad"
          />
        </div>

        <div v-if="editable" class="absolute bottom-6 right-6" @click.stop>
          <Button
            variant="ghost"
            size="sm"
            :ring="false"
            @click="enterEditMode"
          >
            <template #icon>
              <PencilIcon class="w-4 h-4" />
            </template>
            Редагувати
          </Button>
        </div>
      </template>

      <template v-else>
        <div
          class="flex-1 w-full overflow-auto flex items-center justify-center pt-12 pb-20 px-2"
          @click.stop
        >
          <canvas
            ref="canvasEl"
            class="rounded-xl shadow-2xl"
            style="touch-action: none"
          />
        </div>

        <div
          class="absolute bottom-0 left-0 right-0 z-[201] border-t border-white/10 bg-black/80 backdrop-blur-[18px]"
          @click.stop
        >
          <div
            class="flex items-center justify-between gap-2 px-3 py-2 flex-wrap"
          >
            <div class="flex items-center gap-2">
              <Button
                :variant="blurButtonVariant"
                :ring="false"
                title="Блюр"
                @click="selectMode('blur')"
              >
                <template #icon>
                  <IcSharpBlurOn />
                </template>
                Блюр
              </Button>

              <Button
                :variant="mosaicButtonVariant"
                :ring="false"
                title="Мозаїка"
                @click="selectMode('mosaic')"
              >
                <template #icon>
                  <IconParkOutlineMosaic />
                </template>
                Мозаїка
              </Button>
            </div>

            <div class="hidden h-5 w-px bg-white/15 sm:block" />

            <div class="flex items-center gap-2 text-white opacity-80">
              <div class="flex items-center gap-2">
                <span class="hidden text-xs text-white opacity-50 sm:inline">
                  Розмір
                </span>
                <RangeSlider
                  class="w-20 opacity-90 sm:w-28"
                  :percentage="brushSizePercentage"
                  @value-changed="handleBrushSizeChange"
                />
                <span class="w-5 text-xs tabular-nums text-white opacity-60">
                  {{ editor.brushSize.value }}
                </span>
              </div>

              <div class="flex items-center gap-0.5">
                <Button
                  :variant="circleShapeButtonVariant"
                  size="xs"
                  icon-only
                  :ring="false"
                  title="Кругла кисть"
                  @click="editor.setBrushShape('circle')"
                >
                  <template #icon>
                    <svg
                      class="h-3.5 w-3.5"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <circle cx="8" cy="8" r="6" />
                    </svg>
                  </template>
                </Button>
                <Button
                  :variant="squareShapeButtonVariant"
                  size="xs"
                  icon-only
                  :ring="false"
                  title="Квадратна кисть"
                  @click="editor.setBrushShape('square')"
                >
                  <template #icon>
                    <svg
                      class="h-3.5 w-3.5"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <rect x="2" y="2" width="12" height="12" rx="1" />
                    </svg>
                  </template>
                </Button>
              </div>
            </div>

            <div class="hidden h-5 w-px bg-white/15 sm:block" />

            <div class="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="xs"
                icon-only
                :ring="false"
                :disabled="zoomLevel <= ZOOM_MIN"
                title="Зменшити (Ctrl+-)"
                @click="zoomOut"
              >
                <template #icon>
                  <MagnifyingGlassMinusIcon class="w-4 h-4" />
                </template>
              </Button>
              <Button
                variant="ghost"
                size="xs"
                :ring="false"
                class="w-11 tabular-nums"
                title="Скинути зум (Ctrl+0)"
                @click="resetZoom"
              >
                {{ Math.round(zoomLevel * 100) }}%
              </Button>
              <Button
                variant="ghost"
                size="xs"
                icon-only
                :ring="false"
                :disabled="zoomLevel >= ZOOM_MAX"
                title="Збільшити (Ctrl++)"
                @click="zoomIn"
              >
                <template #icon>
                  <MagnifyingGlassPlusIcon class="w-4 h-4" />
                </template>
              </Button>
            </div>

            <div class="hidden h-5 w-px bg-white/15 sm:block" />

            <div class="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                icon-only
                :ring="false"
                :disabled="!editor.canUndo.value"
                title="Відмінити дію (Ctrl+Z)"
                @click="editor.undo()"
              >
                <template #icon>
                  <ArrowUturnLeftIcon class="w-4 h-4" />
                </template>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                :ring="false"
                :disabled="isSaving"
                @click="handleCancel"
              >
                Скасувати
              </Button>

              <Button
                variant="primary"
                class="!bg-success"
                size="sm"
                :loading="isSaving"
                :disabled="isSaving"
                @click="handleSave"
              >
                <template #icon>
                  <CheckIcon class="w-4 h-4" />
                </template>
                Зберегти
              </Button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </Teleport>
</template>
