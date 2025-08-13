<script setup lang="ts">
import { computed } from "vue";

const modelValue = defineModel<string>();

// Textarea configuration
const TEXTAREA_SIZES = {
  sm: {
    padding: "px-3 py-2",
    text: "text-sm",
  },
  md: {
    padding: "px-4 py-2",
    text: "text-base",
  },
  lg: {
    padding: "px-5 py-3",
    text: "text-lg",
  },
} as const;

const TEXTAREA_VARIANTS = {
  default: "textarea-default",
  filled: "textarea-filled",
  bordered: "textarea-bordered",
} as const;

type TextareaSize = keyof typeof TEXTAREA_SIZES;
type TextareaVariant = keyof typeof TEXTAREA_VARIANTS;

const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    placeholder?: string;
    autoResize?: boolean;
    rows?: number;
    size?: TextareaSize;
    variant?: TextareaVariant;
    block?: boolean;
    disabled?: boolean;
  }>(),
  {
    rows: 3,
    size: "sm",
    variant: "default",
    block: false,
    disabled: false,
  },
);

const textareaClasses = computed(() => {
  const sizeConfig = TEXTAREA_SIZES[props.size] || TEXTAREA_SIZES.md;
  const variantClass = TEXTAREA_VARIANTS[props.variant];

  return [
    "textarea",
    variantClass,
    sizeConfig.padding,
    sizeConfig.text,
    {
      "textarea-block": props.block,
      "textarea-disabled": props.disabled,
    },
  ];
});
</script>

<template>
  <textarea
    :id="props.id"
    v-model="modelValue"
    :name="props.name"
    :class="textareaClasses"
    :placeholder="props.placeholder"
    :rows="props.rows"
    :disabled="props.disabled"
  />
</template>

<style scoped>
.textarea {
  @apply w-full transition-all duration-200 ease-in-out
         focus:outline-none focus:ring-2 focus:ring-offset-2;
  border-radius: var(--btn-border-radius);
  color: var(--color-input-text);
  --tw-ring-color: var(--color-input-focus);
}

.textarea::placeholder {
  color: var(--color-input-placeholder);
}

.textarea-default {
  background-color: var(--color-input-bg);
  border: 1px solid transparent;
}

.textarea-default:focus {
  border-color: var(--color-primary);
}

.textarea-filled {
  background-color: var(--color-input-bg-alt);
  border: 1px solid transparent;
}

.textarea-filled:focus {
  border-color: var(--color-primary);
}

.textarea-bordered {
  background-color: transparent;
  border: 1px solid var(--color-input-border);
}

.textarea-bordered:focus {
  border-color: var(--color-primary);
}

.textarea-disabled {
  @apply cursor-not-allowed opacity-60;
  background-color: var(--color-btn-disabled-bg) !important;
  border-color: var(--color-btn-disabled-bg) !important;
  color: var(--color-btn-disabled-text) !important;
}

.textarea-block {
  @apply w-full;
}
</style>
