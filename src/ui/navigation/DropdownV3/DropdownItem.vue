<script setup lang="ts">
import { computed } from "vue";

interface Props {
  active?: boolean;
  disabled?: boolean;
  value?: any;
  danger?: boolean;
  handleClick?: () => void;
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
  "dropdown-link",
  props.danger ? "dropdown-link-danger" : "dropdown-link-primary",
  {
    "opacity-50 cursor-not-allowed": props.disabled,
    "bg-gray-100 dark:bg-gray-600": props.active,
  },
]);

function handleClick(event: MouseEvent) {
  if (props.disabled) return;

  if (props.handleClick) {
    props.handleClick();
  }

  emit("click", {
    event,
    value: props.value,
  });

  // Send click event to parent component
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
    :class="itemClasses"
    @click="handleClick"
    role="menuitem"
    :aria-label="label"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.dropdown-item {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #4a5568;
}

.dropdown-item:hover:not(.dropdown-item-disabled) {
  background-color: #f7fafc;
}

.dropdown-item-active {
  background-color: #ebf8ff;
  color: #3182ce;
  font-weight: 500;
}

.dropdown-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  .dropdown-item {
    color: #e2e8f0;
  }

  .dropdown-item:hover:not(.dropdown-item-disabled) {
    background-color: #4a5568;
  }

  .dropdown-item-active {
    background-color: #2c5282;
    color: #90cdf4;
  }
}
</style>
