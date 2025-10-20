<script setup lang="ts">
import { computed } from "vue";

interface Props {
  active?: boolean;
  disabled?: boolean;
  value?: unknown;
  danger?: boolean;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  danger: false,
  value: undefined,
});

const emit = defineEmits(["click"]);

const itemClasses = computed(() => [
  "flex items-center w-full px-4 py-3 text-sm transition-all duration-200",
  "hover:bg-app-bg-secondary focus:bg-app-bg-secondary focus:outline-none",
  {
    "opacity-50 cursor-not-allowed pointer-events-none": props.disabled,

    "bg-app-bg-secondary font-medium": props.active,

    "text-danger": props.danger,

    "text-app-text": !props.danger,
  },
]);

function handleItemClick(event: MouseEvent) {
  if (props.disabled) return;

  emit("click", {
    event,
    value: props.value,
  });

  // Send custom event for Dropdown closeOnSelect functionality
  const parentEl = event.currentTarget as HTMLElement;
  parentEl.dispatchEvent(
    new CustomEvent("dropdown-item-click", {
      bubbles: true,
      detail: { value: props.value },
    }),
  );
}
</script>

<template>
  <button
    type="button"
    :class="itemClasses"
    :disabled="disabled"
    :aria-label="label"
    role="menuitem"
    @click="handleItemClick"
  >
    <slot></slot>
  </button>
</template>
