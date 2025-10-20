import { ref, onMounted, onUnmounted, type Ref } from "vue";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface UseContextMenuOptions {
  edgeOffset?: number;
  menuWidth?: number;
  minSpaceBelow?: number;
}

export interface UseContextMenuReturn<T = unknown> {
  isOpen: Ref<boolean>;
  position: Ref<ContextMenuPosition>;
  selectedItem: Ref<T | null>;

  open: (event: MouseEvent | TouchEvent, item?: T) => void;
  close: () => void;
  toggle: (event: MouseEvent | TouchEvent, item?: T) => void;
}

/**
 * Composable for managing context menu state and behavior.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useContextMenu } from '@/shared/composables/useContextMenu';
 *
 * const { isOpen, position, selectedItem, open, close } = useContextMenu();
 *
 * const handleContextMenu = (event, message) => {
 *   open(event, message);
 * };
 * </script>
 *
 * <template>
 *   <div @contextmenu.prevent="handleContextMenu($event, message)">
 *     Content
 *   </div>
 *
 *   <ContextMenu
 *     v-model:show="isOpen"
 *     :position="position"
 *     @close="close"
 *   />
 * </template>
 * ```
 */
export function useContextMenu<T = unknown>(
  options: UseContextMenuOptions = {},
): UseContextMenuReturn<T> {
  const { edgeOffset = 10, menuWidth = 200, minSpaceBelow = 150 } = options;

  const isOpen = ref(false);
  const position = ref<ContextMenuPosition>({ x: 0, y: 0 });
  const selectedItem = ref<T | null>(null) as Ref<T | null>;

  const calculatePosition = (
    clientX: number,
    clientY: number,
  ): ContextMenuPosition => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let x = clientX;
    let y = clientY;

    if (x + menuWidth > windowWidth - edgeOffset) {
      x = windowWidth - menuWidth - edgeOffset;
    }

    if (x < edgeOffset) {
      x = edgeOffset;
    }

    const spaceBelow = windowHeight - clientY;

    if (spaceBelow < minSpaceBelow) {
      y = clientY - 10;
    }

    if (y < edgeOffset) {
      y = edgeOffset;
    }

    return { x, y };
  };

  const getEventCoordinates = (
    event: MouseEvent | TouchEvent,
  ): { clientX: number; clientY: number } => {
    if (event instanceof MouseEvent) {
      return {
        clientX: event.clientX,
        clientY: event.clientY,
      };
    }

    const touch = event.touches[0] || event.changedTouches[0];
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
    };
  };

  const open = (event: MouseEvent | TouchEvent, item?: T) => {
    const { clientX, clientY } = getEventCoordinates(event);
    position.value = calculatePosition(clientX, clientY);
    selectedItem.value = item || null;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;

    setTimeout(() => {
      selectedItem.value = null;
    }, 200);
  };

  const toggle = (event: MouseEvent | TouchEvent, item?: T) => {
    if (isOpen.value) {
      close();
    } else {
      open(event, item);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen.value) {
      close();
    }
  };

  onMounted(() => {
    document.addEventListener("keydown", handleEscape);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
  });

  return {
    isOpen,
    position,
    selectedItem,
    open,
    close,
    toggle,
  };
}
