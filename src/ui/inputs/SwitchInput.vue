<script setup lang="ts">
import { ref, computed } from "vue";

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    size?: "sm" | "md" | "xl";
  }>(),
  {
    disabled: false,
    size: "md",
  },
);

const sizeClass = computed(() => `bb-switch--${props.size}`);

const model = defineModel<boolean>({ default: false });
const isPressed = ref(false);

const toggle = () => {
  model.value = !model.value;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggle();
  }
};

const handleMouseDown = () => {
  isPressed.value = true;
};

const handleMouseUp = () => {
  toggle();
  isPressed.value = false;
};

const handleMouseLeave = () => {
  isPressed.value = false;
};
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :disabled="disabled"
    class="bb-switch"
    :class="[
      sizeClass,
      model ? 'bb-switch--on' : 'bb-switch--off',
      isPressed && !disabled ? 'bb-switch--pressed' : '',
      disabled ? 'bb-switch--disabled' : '',
    ]"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @keydown="handleKeydown"
  >
    <span class="bb-switch__track">
      <span class="bb-switch__thumb" />
    </span>
  </button>
</template>

<style scoped>
.bb-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.bb-switch--sm {
  width: 2.25rem;
  height: 1.25rem;
}

.bb-switch--md {
  width: 2.75rem;
  height: 1.5rem;
}

.bb-switch--xl {
  width: 3.5rem;
  height: 2rem;
}

.bb-switch:focus-visible {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: 0.125rem;
}

.bb-switch--sm:focus-visible {
  border-radius: 0.625rem;
}

.bb-switch--md:focus-visible {
  border-radius: 0.75rem;
}

.bb-switch--xl:focus-visible {
  border-radius: 1rem;
}

.bb-switch--disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.bb-switch__track {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  transition: background-color 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bb-switch--sm .bb-switch__track {
  border-radius: 0.625rem;
}

.bb-switch--md .bb-switch__track {
  border-radius: 0.75rem;
}

.bb-switch--xl .bb-switch__track {
  border-radius: 1rem;
}

.bb-switch--off .bb-switch__track {
  background-color: var(--color-switch-track-off);
}

.bb-switch--on .bb-switch__track {
  background-color: var(--color-switch-track-on);
}

.bb-switch__thumb {
  position: absolute;
  background-color: var(--color-switch-thumb-off);
  box-shadow:
    0 0.125rem 0.25rem rgba(0, 0, 0, 0.15),
    0 0.0625rem 0.0625rem rgba(0, 0, 0, 0.16);
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, width;
}

.bb-switch--on .bb-switch__thumb {
  background-color: var(--color-switch-thumb-on);
}

/* sm size thumb */
.bb-switch--sm .bb-switch__thumb {
  top: 0.125rem;
  left: 0.125rem;
  width: 1rem;
  height: 1rem;
  border-radius: 0.5rem;
}

.bb-switch--sm.bb-switch--on .bb-switch__thumb {
  transform: translateX(1rem) scale(1.05);
}

.bb-switch--sm.bb-switch--pressed:not(.bb-switch--disabled) .bb-switch__thumb {
  width: 1.25rem;
}

.bb-switch--sm.bb-switch--pressed.bb-switch--on:not(.bb-switch--disabled)
  .bb-switch__thumb {
  transform: translateX(0.75rem);
}

/* md size thumb */
.bb-switch--md .bb-switch__thumb {
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.625rem;
}

.bb-switch--md.bb-switch--on .bb-switch__thumb {
  transform: translateX(1.25rem) scale(1.05);
}

.bb-switch--md.bb-switch--pressed:not(.bb-switch--disabled) .bb-switch__thumb {
  width: 1.5rem;
}

.bb-switch--md.bb-switch--pressed.bb-switch--on:not(.bb-switch--disabled)
  .bb-switch__thumb {
  transform: translateX(1rem);
}

/* xl size thumb */
.bb-switch--xl .bb-switch__thumb {
  top: 0.125rem;
  left: 0.125rem;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.875rem;
}

.bb-switch--xl.bb-switch--on .bb-switch__thumb {
  transform: translateX(1.5rem) scale(1.05);
}

.bb-switch--xl.bb-switch--pressed:not(.bb-switch--disabled) .bb-switch__thumb {
  width: 2rem;
}

.bb-switch--xl.bb-switch--pressed.bb-switch--on:not(.bb-switch--disabled)
  .bb-switch__thumb {
  transform: translateX(1.25rem);
}

.bb-switch:active:not(.bb-switch--disabled) .bb-switch__track {
  transform: scale(0.98);
}

@media (hover: hover) {
  .bb-switch:hover:not(.bb-switch--disabled) .bb-switch__thumb {
    box-shadow:
      0 0.25rem 0.75rem rgba(0, 0, 0, 0.18),
      0 0.125rem 0.25rem rgba(0, 0, 0, 0.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bb-switch__track,
  .bb-switch__thumb {
    transition-duration: 0.01ms !important;
  }
}
</style>
