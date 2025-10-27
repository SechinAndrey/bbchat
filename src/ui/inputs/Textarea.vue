<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";

const modelValue = defineModel<string>();

// Textarea configuration
const TEXTAREA_SIZES = {
  sm: {
    padding: "px-3 py-2",
    text: "text-sm",
    minHeight: "min-h-[2rem]",
  },
  md: {
    padding: "px-4 py-2",
    text: "text-base",
    minHeight: "min-h-[2.25rem]",
  },
  lg: {
    padding: "px-5 py-3",
    text: "text-lg",
    minHeight: "min-h-[2.75rem]",
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
    noResize?: boolean;
    rows?: number;
    size?: TextareaSize;
    variant?: TextareaVariant;
    block?: boolean;
    disabled?: boolean;
    extendable?: boolean;
    maxRows?: number;
    error?: string;
  }>(),
  {
    placeholder: "Введіть текст...",
    noResize: false,
    rows: 3,
    size: "sm",
    variant: "default",
    block: false,
    disabled: false,
    extendable: false,
    maxRows: 6,
  },
);

const textareaRef = ref<HTMLTextAreaElement>();

const adjustHeight = () => {
  if (!props.extendable || !textareaRef.value) return;

  const textarea = textareaRef.value;
  textarea.style.height = "auto";

  const style = window.getComputedStyle(textarea);
  const lineHeight = parseInt(style.lineHeight);
  const paddingTop = parseInt(style.paddingTop);
  const paddingBottom = parseInt(style.paddingBottom);

  const maxHeight = lineHeight * props.maxRows + paddingTop + paddingBottom;
  const newHeight = Math.min(textarea.scrollHeight, maxHeight);
  textarea.style.height = `${newHeight}px`;

  textarea.style.overflowY =
    textarea.scrollHeight > maxHeight ? "auto" : "hidden";
};

watch(modelValue, () => {
  if (props.extendable) {
    nextTick(() => adjustHeight());
  }
});

const textareaClasses = computed(() => {
  const sizeConfig = TEXTAREA_SIZES[props.size] || TEXTAREA_SIZES.md;
  const variantClass = TEXTAREA_VARIANTS[props.variant];

  return [
    "textarea",
    "scrollbar-thin",
    variantClass,
    sizeConfig.padding,
    sizeConfig.text,
    sizeConfig.minHeight,
    {
      "textarea-block": props.block,
      "textarea-disabled": props.disabled,
      "resize-none": props.noResize || props.extendable,
      "textarea-extendable": props.extendable,
      "textarea-error": props.error,
    },
  ];
});

defineExpose({
  textareaRef,
});
</script>

<template>
  <div :class="{ 'w-full': props.block, 'pb-4': true }">
    <div class="relative">
      <textarea
        :id="props.id"
        ref="textareaRef"
        v-model="modelValue"
        :name="props.name"
        :class="textareaClasses"
        :placeholder="props.placeholder"
        :rows="props.rows"
        :disabled="props.disabled"
        @input="adjustHeight"
      />

      <!-- Error icon -->
      <span
        v-if="props.error"
        class="absolute top-2 right-2 pointer-events-none"
      >
        <svg
          class="h-4 w-4 text-danger"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </div>

    <!-- Error message with absolute positioning -->
    <div
      v-if="props.error"
      class="absolute left-0 mt-0.5 text-[0.6875rem] leading-tight"
      style="color: var(--color-state-danger)"
    >
      {{ props.error }}
    </div>
  </div>
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

.textarea-error {
  border-color: var(--color-state-danger) !important;
  --tw-ring-color: var(--color-state-danger);
}

.textarea-block {
  @apply w-full;
}

.textarea-extendable {
  overflow-y: hidden;
  transition: height 0.1s ease;
}
</style>
