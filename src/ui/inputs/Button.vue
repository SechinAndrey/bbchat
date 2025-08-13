<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

// Button configuration
const BUTTON_SIZES = {
  xs: {
    padding: "px-2 py-2",
    text: "text-xs",
    lineHeight: "leading-4",
    icon: "w-5 h-5",
    gap: "gap-1",
    height: "h-6",
  },
  sm: {
    padding: "px-4 py-[0.625rem]",
    text: "text-[0.813rem]",
    lineHeight: "leading-[0.9rem]",
    icon: "w-4 h-4",
    gap: "gap-2",
    height: "h-[2rem]",
  },
  md: {
    padding: "px-5 py-3",
    text: "text-[0.875rem]",
    lineHeight: "leading-[1.125rem]",
    icon: "w-5 h-5",
    gap: "gap-2",
    height: "h-[2.25rem]",
  },
  lg: {
    padding: "px-6 py-4",
    text: "text-lg",
    lineHeight: "leading-[1.5rem]",
    icon: "w-6 h-6",
    gap: "gap-3",
    height: "h-[2.75rem]",
  },
} as const;

const BUTTON_VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  text: "btn-text",
} as const;

type ButtonSize = keyof typeof BUTTON_SIZES;
type ButtonVariant = keyof typeof BUTTON_VARIANTS;

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    disabled?: boolean;
    link?: boolean;
    to?: string;
    size?: ButtonSize;
    variant?: ButtonVariant;
    iconOnly?: boolean;
    block?: boolean;
    loadingText?: string;
    ring?: boolean;
  }>(),
  {
    loading: false,
    disabled: false,
    link: false,
    size: "sm",
    variant: "primary",
    iconOnly: false,
    block: false,
    loadingText: "Завантаження...",
    ring: true,
  },
);

defineEmits<{
  click: [event: MouseEvent];
}>();

// Computed classes
const buttonClasses = computed(() => {
  const sizeConfig = BUTTON_SIZES[props.size] || BUTTON_SIZES.md;
  const variantClass =
    BUTTON_VARIANTS[props.variant] || BUTTON_VARIANTS.primary;

  return [
    "btn",
    variantClass,
    sizeConfig.text,
    sizeConfig.height,
    sizeConfig.lineHeight,
    props.iconOnly ? "btn-icon" : sizeConfig.padding,
    {
      "btn-loading": props.loading,
      "btn-disabled": props.disabled,
      "btn-block": props.block,
      [sizeConfig.gap]: !props.iconOnly,
    },
    props.ring ? "focus:ring-2 focus:ring-offset-2" : "",
  ];
});

const iconClasses = computed(() => {
  const sizeConfig = BUTTON_SIZES[props.size] || BUTTON_SIZES.md;
  return [sizeConfig.icon, { "animate-spin": props.loading }];
});

const componentType = computed(() => {
  if (props.link) {
    return props.to ? RouterLink : "a";
  }
  return "button";
});

const componentProps = computed(() => {
  if (props.link && props.to) {
    return { to: props.to };
  }
  if (props.link) {
    return { href: "#" };
  }
  return {
    type: "button",
    disabled: props.disabled || props.loading,
  };
});
</script>

<template>
  <component
    :is="componentType"
    v-bind="componentProps"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <!-- Loading icon -->
    <svg
      v-if="loading"
      :class="iconClasses"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 01412H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Icon slot for icon-only buttons or buttons with icons -->
    <slot v-if="!loading" name="icon" :class="iconClasses" />

    <!-- Content -->
    <template v-if="!loading && !iconOnly">
      <slot>Кнопка</slot>
    </template>

    <!-- Loading text for screen readers -->
    <span v-if="loading"> {{ loadingText }} </span>
  </component>
</template>

<style scoped>
/* Base button styles */
.btn {
  @apply inline-flex items-center justify-center font-medium 
         transition-all duration-200 ease-in-out cursor-pointer
         disabled:cursor-not-allowed;
  border-radius: var(--btn-border-radius);
}

/* Button variants */
.btn-primary {
  background-color: var(--color-btn-primary-bg);
  color: var(--color-btn-primary-text);
  --tw-ring-color: var(--color-btn-primary-focus);
}

.btn-primary:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-primary-bg-hover);
}

.btn-primary:active:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-primary-bg-active);
}

.btn-secondary {
  background-color: var(--color-btn-secondary-bg);
  color: var(--color-btn-secondary-text);
  --tw-ring-color: var(--color-btn-secondary-focus);
}

.btn-secondary:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-secondary-bg-hover);
}

.btn-secondary:active:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-secondary-bg-active);
}

.btn-outline {
  background-color: var(--color-btn-outline-bg);
  color: var(--color-btn-outline-text);
  border: 1px solid var(--color-btn-outline-border);
  --tw-ring-color: var(--color-btn-outline-focus);
}

.btn-outline:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-outline-bg-hover);
}

.btn-outline:active:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-outline-bg-active);
}

.btn-ghost {
  background-color: var(--color-btn-ghost-bg);
  color: var(--color-btn-ghost-text);
  --tw-ring-color: var(--color-btn-ghost-focus);
}

.btn-ghost:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-ghost-bg-hover);
}

.btn-ghost:active:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-ghost-bg-active);
}

.btn-text {
  background-color: var(--color-btn-text-bg);
  color: var(--color-btn-text-text);
  --tw-ring-color: var(--color-btn-text-focus);
  @apply underline-offset-4;
}

.btn-text:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-text-bg-hover);
  @apply underline;
}

.btn-text:active:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-btn-text-bg-active);
}

/* Button states */
.btn-disabled {
  background-color: var(--color-btn-disabled-bg) !important;
  color: var(--color-btn-disabled-text) !important;
  border-color: var(--color-btn-disabled-bg) !important;
  @apply opacity-60;
}

.btn-loading {
  @apply opacity-80;
}

/* Button modifiers */
.btn-icon {
  @apply aspect-square p-2;
}

.btn-block {
  @apply w-full;
}
</style>
