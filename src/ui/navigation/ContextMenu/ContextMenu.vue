<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import type { ContextMenuPosition } from "@src/shared/composables/useContextMenu";

interface Props {
  show?: boolean;
  position?: ContextMenuPosition;
  width?: number;
  maxHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  position: () => ({ x: 0, y: 0 }),
  width: 200,
  maxHeight: 400,
});

const emit = defineEmits<{
  close: [];
  "update:show": [value: boolean];
}>();

const menuRef = ref<HTMLElement | null>(null);

const menuStyles = computed(() => {
  if (!props.position) return {};

  return {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`,
    width: `${props.width}px`,
    maxHeight: props.maxHeight ? `${props.maxHeight}px` : undefined,
  };
});

const close = () => {
  emit("update:show", false);
  emit("close");
};

const handleClickOutside = (event: MouseEvent) => {
  if (!props.show) return;

  const target = event.target as Node;
  if (menuRef.value && !menuRef.value.contains(target)) {
    close();
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.show) {
    close();
  }
};

const handleScroll = () => {
  if (props.show) {
    close();
  }
};

watch(
  () => props.show,
  (isShown) => {
    if (isShown) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("contextmenu", handleClickOutside);
      }, 0);
    } else {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    }
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
  window.addEventListener("scroll", handleScroll, true);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("contextmenu", handleClickOutside);
  window.removeEventListener("scroll", handleScroll, true);
});
</script>

<template>
  <Transition name="overlay">
    <div v-if="show" class="fixed inset-0 z-[60]" aria-hidden="true" />
  </Transition>

  <Transition name="context-menu">
    <div
      v-if="show"
      ref="menuRef"
      :style="menuStyles"
      class="fixed z-[100] overflow-hidden rounded-sm bg-app-bg dark:bg-gray-800 shadow-lg border border-app-border focus:outline-none"
      role="menu"
      aria-orientation="vertical"
      tabindex="-1"
    >
      <div role="none" class="flex flex-col gap-2 overflow-y-auto max-h-full">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.15s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.context-menu-enter-active {
  transition: all 0.15s ease-out;
}

.context-menu-leave-active {
  transition: all 0.1s ease-in;
}

.context-menu-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}

.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
