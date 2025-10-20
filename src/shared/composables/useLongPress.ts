import { ref, onUnmounted } from "vue";

export interface UseLongPressOptions {
  delay?: number;

  onLongPress?: (event: TouchEvent) => void;

  onTap?: (event: TouchEvent) => void;

  moveThreshold?: number;
}

export interface UseLongPressReturn {
  onTouchStart: (event: TouchEvent) => void;

  onTouchEnd: (event: TouchEvent) => void;

  onTouchMove: (event: TouchEvent) => void;

  isLongPressing: Readonly<ReturnType<typeof ref<boolean>>>;
}

/**
 * Composable for detecting long press gestures on touch devices.
 *
 * @example
 * ```vue
 * <script setup>
 * const { onTouchStart, onTouchEnd, onTouchMove } = useLongPress({
 *   delay: 500,
 *   onLongPress: (event) => {
 *     console.log('Long press detected!', event);
 *   }
 * });
 * </script>
 *
 * <template>
 *   <div
 *     @touchstart="onTouchStart"
 *     @touchend="onTouchEnd"
 *     @touchmove="onTouchMove"
 *   >
 *     Long press me
 *   </div>
 * </template>
 * ```
 */
export function useLongPress(
  options: UseLongPressOptions = {},
): UseLongPressReturn {
  const { delay = 500, onLongPress, onTap, moveThreshold = 10 } = options;

  const isLongPressing = ref(false);
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;
  let hasMoved = false;

  const reset = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    isLongPressing.value = false;
    hasMoved = false;
    startX = 0;
    startY = 0;
  };

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    hasMoved = false;

    longPressTimer = setTimeout(() => {
      if (!hasMoved) {
        isLongPressing.value = true;
        if (onLongPress) {
          onLongPress(event);
        }
      }
    }, delay);
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!longPressTimer) return;

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);

    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      hasMoved = true;
      reset();
    }
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (isLongPressing.value) {
      reset();
      return;
    }

    if (longPressTimer && !hasMoved && onTap) {
      onTap(event);
    }

    reset();
  };

  onUnmounted(() => {
    reset();
  });

  return {
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    isLongPressing,
  };
}
