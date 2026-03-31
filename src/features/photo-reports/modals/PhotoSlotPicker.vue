<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import {
  useMediaQuery,
  useElementBounding,
  useSwipe,
  useWindowSize,
} from "@vueuse/core";
import PhotoSlotPickerContent from "./PhotoSlotPickerContent.vue";
import type { SelectedPhoto } from "../types";
import type { PhotoSlotType } from "../types";

const props = defineProps<{
  open: boolean;
  surfaceName: string;
  surfaceCode: string;
  supplierCode: string;
  slotType: PhotoSlotType;
  availablePhotos: SelectedPhoto[];
  currentPhotoUrl?: string | null;
  etalonPhoto?: string | null;
  showNavigation?: boolean;
  anchorEl?: HTMLElement | null;
  supplierWarning?: string | null;
}>();

const emit = defineEmits<{
  close: [];
  select: [photo: SelectedPhoto];
  clear: [];
  skip: [];
  back: [];
  cancel: [];
  upload: [files: File[]];
  removePhoto: [url: string];
}>();

const photoFileInputRef = ref<HTMLInputElement | null>(null);

const triggerUpload = () => photoFileInputRef.value?.click();

const handlePickerFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  emit("upload", Array.from(input.files));
  input.value = "";
};

const isMobile = useMediaQuery("(max-width: 767px)");

const desktopGridCols = computed(() => {
  const count = props.availablePhotos.length;
  if (count > 24) return "grid-cols-5";
  if (count > 12) return "grid-cols-4";
  return "grid-cols-3";
});

const popoverWidthPx = computed(() => {
  const count = props.availablePhotos.length;
  if (count > 24) return 560;
  if (count > 12) return 448;
  return 352;
});

const anchorRef = computed(() => props.anchorEl ?? undefined);
const { top, left, bottom, width } = useElementBounding(anchorRef);
const popoverRef = ref<HTMLElement>();
const { width: windowWidth, height: windowHeight } = useWindowSize();

const spaceBelow = computed(() => windowHeight.value - bottom.value - 28);
const spaceAbove = computed(() => top.value - 28);

const showAbove = computed(() => {
  if (!props.anchorEl) return false;
  return spaceAbove.value > spaceBelow.value;
});

const popoverStyle = computed(() => {
  if (!props.anchorEl) return {};
  const pw = popoverWidthPx.value;
  let leftPos = left.value;
  if (leftPos + pw > windowWidth.value - 16) {
    leftPos = windowWidth.value - pw - 16;
  }
  if (leftPos < 16) leftPos = 16;

  const style: Record<string, string> = {
    left: `${leftPos}px`,
    width: `${pw}px`,
  };
  if (showAbove.value) {
    style.bottom = `${windowHeight.value - top.value + 12}px`;
    style.maxHeight = `${Math.max(180, spaceAbove.value)}px`;
  } else {
    style.top = `${bottom.value + 12}px`;
    style.maxHeight = `${Math.max(180, spaceBelow.value)}px`;
  }
  return style;
});

const arrowStyle = computed(() => {
  if (!props.anchorEl) return {};
  const anchorCenter = left.value + width.value / 2;
  const pw = popoverWidthPx.value;
  let popoverLeft = left.value;
  if (popoverLeft + pw > windowWidth.value - 16) {
    popoverLeft = windowWidth.value - pw - 16;
  }
  if (popoverLeft < 16) popoverLeft = 16;
  const arrowLeft = anchorCenter - popoverLeft;
  return {
    left: `${Math.max(16, Math.min(arrowLeft, pw - 16))}px`,
  };
});

const handleSelect = (photo: SelectedPhoto) => {
  emit("select", photo);
};

const sheetContentRef = ref<HTMLElement>();
const handleRef = ref<HTMLElement>();
const isBackdropVisible = ref(false);
const isContentVisible = ref(false);
const isAnimating = ref(false);
const isSwipeActive = ref(false);
const isClosing = ref(false);
const swipeOffset = ref(0);

const { lengthY } = useSwipe(handleRef, {
  onSwipe() {
    if (!isMobile.value) return;
    isSwipeActive.value = true;
  },
  onSwipeEnd(_e, direction) {
    if (!isMobile.value) {
      isSwipeActive.value = false;
      swipeOffset.value = 0;
      return;
    }
    if (direction === "down" && Math.abs(lengthY.value) > 100) {
      closeWithAnimation();
    } else {
      isSwipeActive.value = false;
      swipeOffset.value = 0;
    }
  },
});

const preventScroll = (e: TouchEvent) => {
  if (isMobile.value) e.preventDefault();
};

watch(handleRef, (newHandle, oldHandle) => {
  if (oldHandle) {
    oldHandle.removeEventListener("touchstart", preventScroll);
    oldHandle.removeEventListener("touchmove", preventScroll);
  }
  if (newHandle) {
    newHandle.addEventListener("touchstart", preventScroll, { passive: false });
    newHandle.addEventListener("touchmove", preventScroll, { passive: false });
  }
});

onUnmounted(() => {
  if (handleRef.value) {
    handleRef.value.removeEventListener("touchstart", preventScroll);
    handleRef.value.removeEventListener("touchmove", preventScroll);
  }
});

watch(lengthY, (newLength) => {
  if (!isMobile.value || !isSwipeActive.value || isClosing.value) return;
  if (newLength < 0) {
    const maxOffset = sheetContentRef.value?.clientHeight ?? Infinity;
    swipeOffset.value = Math.min(Math.abs(newLength), maxOffset);
  }
});

const sheetStyle = computed(() => {
  if (!isMobile.value) return {};
  if (isSwipeActive.value || isClosing.value) {
    return {
      transform: `translateY(${swipeOffset.value}px)`,
      transition: isClosing.value ? "transform 0.2s ease-out" : "none",
    };
  }
  return { transition: "transform 0.3s ease-out" };
});

const openWithAnimation = async () => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  isBackdropVisible.value = true;
  await new Promise((resolve) => setTimeout(resolve, 50));
  isContentVisible.value = true;
  setTimeout(() => {
    isAnimating.value = false;
  }, 350);
};

const closeWithAnimation = async () => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  isClosing.value = true;
  isSwipeActive.value = false;
  const target = sheetContentRef.value?.clientHeight ?? 400;
  swipeOffset.value = target;
  await new Promise((resolve) => setTimeout(resolve, 200));
  isBackdropVisible.value = false;
  setTimeout(() => {
    emit("close");
    isAnimating.value = false;
  }, 250);
};

const close = () => {
  if (!isMobile.value) {
    emit("close");
  } else {
    closeWithAnimation();
  }
};

const handleBackdropClick = () => {
  close();
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && isMobile.value) {
      openWithAnimation();
    } else if (!isOpen) {
      isBackdropVisible.value = false;
      isContentVisible.value = false;
      swipeOffset.value = 0;
      isSwipeActive.value = false;
      isClosing.value = false;
      isAnimating.value = false;
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <input
      ref="photoFileInputRef"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="handlePickerFileInput"
    />
  </Teleport>

  <!-- Desktop: Popover anchored to slot -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="!isMobile && open && anchorEl"
        class="fixed inset-0 z-[200]"
        @mousedown.self="handleBackdropClick"
      >
        <div
          ref="popoverRef"
          class="absolute z-[201] flex flex-col"
          :style="popoverStyle"
        >
          <div
            class="bg-app-bg rounded-lg shadow-xl border border-app-border p-4 relative flex flex-col min-h-0 flex-1 overflow-hidden"
          >
            <PhotoSlotPickerContent
              :surface-name="surfaceName"
              :surface-code="surfaceCode"
              :supplier-code="supplierCode"
              :slot-type="slotType"
              :available-photos="availablePhotos"
              :current-photo-url="currentPhotoUrl"
              :show-navigation="showNavigation"
              :grid-class="desktopGridCols"
              :supplier-warning="supplierWarning"
              show-slot-label
              @select="handleSelect"
              @clear="emit('clear')"
              @skip="emit('skip')"
              @back="emit('back')"
              @cancel="emit('cancel')"
              @close="close"
              @upload="triggerUpload"
              @remove-photo="(url) => emit('removePhoto', url)"
            />
          </div>

          <div
            class="absolute w-4 h-4 bg-app-bg border border-app-border rotate-45 z-10"
            :class="
              showAbove
                ? '-bottom-2 border-t-0 border-l-0'
                : '-top-[0.375rem] border-b-0 border-r-0'
            "
            :style="arrowStyle"
          />
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Mobile: Bottom Sheet with floating etalon -->
  <Teleport v-if="isMobile" to="body">
    <div class="relative z-[200]">
      <Transition name="backdrop-fade">
        <div
          v-show="isBackdropVisible"
          class="fixed inset-0 z-[200] flex flex-col items-center justify-end overflow-hidden bg-black/60"
          @mousedown.self="handleBackdropClick"
        >
          <Transition name="sheet-slide">
            <div
              v-show="isContentVisible"
              ref="sheetContentRef"
              class="relative z-10 w-full flex flex-col items-center"
              :style="sheetStyle"
              @click.stop
            >
              <!-- Etalon + type label above sheet -->
              <div v-if="etalonPhoto" class="mb-5 pointer-events-none">
                <div class="relative flex flex-col items-center">
                  <div
                    class="relative w-[8.5rem] h-[8.5rem] rounded-2xl border border-app-border bg-app-bg p-1"
                  >
                    <div
                      class="w-full h-full rounded-xl overflow-hidden bg-app-bg flex items-center justify-center"
                    >
                      <img
                        :src="etalonPhoto"
                        alt="Еталон"
                        class="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sheet -->
              <div
                class="w-full bg-app-bg rounded-t-2xl flex flex-col max-h-[62vh] shadow-xl"
              >
                <!-- Handle -->
                <div
                  ref="handleRef"
                  class="flex justify-center pt-3 pb-1 shrink-0 touch-none cursor-grab active:cursor-grabbing"
                  style="touch-action: none"
                >
                  <div class="w-10 h-1 bg-app-border rounded-full" />
                </div>

                <div
                  class="px-4 pt-1 pb-4 flex flex-col flex-1 min-h-0 pb-safe"
                >
                  <PhotoSlotPickerContent
                    :surface-name="surfaceName"
                    :surface-code="surfaceCode"
                    :supplier-code="supplierCode"
                    :slot-type="slotType"
                    :available-photos="availablePhotos"
                    :current-photo-url="currentPhotoUrl"
                    :show-navigation="showNavigation"
                    :supplier-warning="supplierWarning"
                    show-slot-label
                    photo-rounding="rounded-lg"
                    @select="handleSelect"
                    @clear="emit('clear')"
                    @skip="emit('skip')"
                    @back="emit('back')"
                    @cancel="emit('cancel')"
                    @close="close"
                    @upload="triggerUpload"
                    @remove-photo="(url) => emit('removePhoto', url)"
                  />
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop-fade-enter-active {
  transition: opacity 0.25s ease-out;
}

.backdrop-fade-leave-active {
  transition: opacity 0.25s ease-in;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.sheet-slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.sheet-slide-leave-active {
  transition: transform 0.2s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}
</style>
