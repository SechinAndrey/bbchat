<script setup lang="ts">
import type { Ref } from "vue";

import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import { useSwipe, useMediaQuery } from "@vueuse/core";
import { computed, nextTick, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    closeModal: () => void;
    noPadding?: boolean;
    modalId?: string;
    closeOnClickOutside?: boolean;
    fullscreen?: boolean;
    disableScroll?: boolean;
  }>(),
  {
    closeOnClickOutside: true,
  },
);

const modal: Ref<HTMLElement | undefined> = ref();
const contentContainer: Ref<HTMLElement | undefined> = ref();
const handleRef: Ref<HTMLElement | undefined> = ref();
const scrollContainer: Ref<HTMLElement | undefined> = ref();
const initialFocusEl: Ref<HTMLElement | undefined> = ref();

const isMobile = computed(
  () => !props.fullscreen && useMediaQuery("(max-width: 767px)").value,
);

const { activate, deactivate } = useFocusTrap(contentContainer, {
  fallbackFocus: () => contentContainer.value || document.body,
  initialFocus: () => initialFocusEl.value || contentContainer.value!,
  preventScroll: true,
  allowOutsideClick: true,
});

const isBackdropVisible = ref(false);
const isContentVisible = ref(false);
const isAnimating = ref(false);

const swipeOffset = ref(0);
const isSwipeActive = ref(false);
const isClosing = ref(false);

const { lengthY } = useSwipe(handleRef, {
  onSwipe() {
    if (!isMobile.value || props.fullscreen) return;
    isSwipeActive.value = true;
  },
  onSwipeEnd(e, direction) {
    if (!isMobile.value || props.fullscreen) {
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
  if (isMobile.value && !props.fullscreen) {
    e.preventDefault();
  }
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
  if (
    !isMobile.value ||
    !isSwipeActive.value ||
    isClosing.value ||
    props.fullscreen
  )
    return;

  if (newLength < 0) {
    const maxOffset = contentContainer.value?.clientHeight ?? Infinity;
    swipeOffset.value = Math.min(Math.abs(newLength), maxOffset);
  }
});

const contentStyle = computed(() => {
  if (!isMobile.value || props.fullscreen) return {};
  if (isSwipeActive.value || isClosing.value) {
    return {
      transform: `translateY(${swipeOffset.value}px)`,
      transition: isClosing.value ? "transform 0.2s ease-out" : "none",
    };
  }
  return {
    transition: "transform 0.3s ease-out",
  };
});

const openWithAnimation = async () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  isBackdropVisible.value = true;

  if (props.fullscreen) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    isContentVisible.value = true;
    isAnimating.value = false;
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 50));
  isContentVisible.value = true;

  setTimeout(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = 0;
    }
  }, 100);

  setTimeout(() => {
    isAnimating.value = false;
  }, 350);
};

const closeWithAnimation = async () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  if (props.fullscreen) {
    isContentVisible.value = false;
    await new Promise((resolve) => setTimeout(resolve, 50));
    isBackdropVisible.value = false;

    setTimeout(() => {
      props.closeModal();
      isAnimating.value = false;
    }, 250);
    return;
  }

  if (isMobile.value) {
    isClosing.value = true;
    isSwipeActive.value = false;

    const target = contentContainer.value?.clientHeight ?? 400;

    swipeOffset.value = target;
  } else {
    isContentVisible.value = false;
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
  isBackdropVisible.value = false;

  setTimeout(() => {
    props.closeModal();
    isAnimating.value = false;
  }, 250);
};

const handleBackdropInteraction = (event: MouseEvent | TouchEvent) => {
  if (props.closeOnClickOutside && event.target === event.currentTarget) {
    closeWithAnimation();
  }
};

const handleEscKey = () => {
  closeWithAnimation();
};

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      openWithAnimation();
      await nextTick();

      const focusableElements = contentContainer.value?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements && focusableElements.length > 0) {
        setTimeout(() => {
          activate();
        }, 400);
      }
    } else {
      deactivate();

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
  <div
    role="dialog"
    class="relative z-[99]"
    :aria-hidden="!props.open"
    aria-labelledby="modal-title"
    aria-modal="true"
  >
    <!--modal with overlay-->
    <Transition name="backdrop-fade">
      <div
        v-show="isBackdropVisible"
        id="close-modal"
        ref="modal"
        :class="[
          'fixed inset-0 z-[99] h-full flex text-center modal-backdrop',
          props.fullscreen
            ? 'bg-black bg-opacity-20'
            : 'bg-black bg-opacity-60',
          isMobile
            ? 'items-end justify-center overflow-hidden'
            : 'items-center justify-center sm:items-center overflow-hidden',
          { 'p-4 sm:p-0': !props.noPadding && !isMobile && !props.fullscreen },
        ]"
        @mousedown="handleBackdropInteraction"
        @touch="handleBackdropInteraction"
        @keydown.esc.stop.prevent="handleEscKey"
      >
        <!--content container-->
        <Transition
          :name="isMobile ? 'modal-slide-mobile' : 'modal-slide-desktop'"
        >
          <div
            v-show="isContentVisible"
            ref="contentContainer"
            :class="[
              'relative bg-app-bg z-[99]',
              props.fullscreen
                ? 'w-full h-full'
                : isMobile
                  ? 'w-full max-h-[90vh] rounded-t-lg shadow-xl'
                  : 'rounded-[8px] max-h-[90vh] shadow-2xl border-0 outline-none',
            ]"
            :style="contentStyle"
            @click.stop
          >
            <!-- iOS-style handle for mobile (not in fullscreen) -->
            <div
              v-if="isMobile && !props.fullscreen"
              ref="handleRef"
              class="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
              style="touch-action: none"
            >
              <div
                class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"
              ></div>
            </div>

            <div
              v-if="!props.fullscreen && !props.disableScroll"
              :class="['flex flex-col', { 'pb-safe': isMobile }]"
              :style="{
                maxHeight: isMobile ? 'calc(90vh - 3rem)' : 'calc(90vh - 2rem)',
                minHeight: '0',
              }"
            >
              <div
                ref="scrollContainer"
                class="flex-1 overflow-y-auto overscroll-contain modal-content-scroll"
              >
                <span ref="initialFocusEl" tabindex="-1"></span>

                <div
                  v-if="$slots.header || $slots.body || $slots.footer"
                  class="p-6"
                >
                  <div v-if="$slots.header" class="text-center mb-6">
                    <slot name="header"></slot>
                  </div>

                  <div v-if="$slots.body" class="mb-6">
                    <slot name="body"></slot>
                  </div>

                  <div v-if="$slots.footer" class="flex gap-3">
                    <slot name="footer"></slot>
                  </div>
                </div>

                <slot v-else name="content"></slot>
              </div>
            </div>

            <div v-else :class="props.fullscreen ? 'w-full h-full' : ''">
              <span ref="initialFocusEl" tabindex="-1"></span>

              <div
                v-if="$slots.header || $slots.body || $slots.footer"
                class="p-6"
              >
                <div v-if="$slots.header" class="text-center mb-6">
                  <slot name="header"></slot>
                </div>

                <div v-if="$slots.body" class="mb-6">
                  <slot name="body"></slot>
                </div>

                <div v-if="$slots.footer" class="flex gap-3">
                  <slot name="footer"></slot>
                </div>
              </div>

              <slot v-else name="content"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Backdrop animations */
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

/* Mobile modal animations */
.modal-slide-mobile-enter-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-slide-mobile-leave-active {
  transition: transform 0.2s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.modal-slide-mobile-enter-from {
  transform: translateY(100%);
}

.modal-slide-mobile-leave-to {
  transform: translateY(100%);
}

/* Desktop modal animations */
.modal-slide-desktop-enter-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-slide-desktop-leave-active {
  transition: transform 0.2s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.modal-slide-desktop-enter-from {
  transform: translateY(100%);
}

.modal-slide-desktop-leave-to {
  transform: translateY(100%);
}

/* Custom scrollbar styling for desktop */
.modal-content-scroll {
  /* Hide scrollbar on mobile (webkit) */
  -webkit-overflow-scrolling: touch;
}

/* Desktop scrollbar styling */
@media (min-width: 768px) {
  .modal-content-scroll {
    /* Webkit browsers */
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }

  .modal-content-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .modal-content-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .modal-content-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
    transition: background-color 0.2s ease;
  }

  .modal-content-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.8);
  }
}

/* Mobile scrollbar - keep native */
@media (max-width: 767px) {
  .modal-content-scroll::-webkit-scrollbar {
    display: none;
  }
}
</style>
