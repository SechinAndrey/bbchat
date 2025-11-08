<script setup lang="ts">
import { computed } from "vue";

const model = defineModel<string>();

// Input configuration
const INPUT_SIZES = {
  sm: {
    height: "h-[2rem]",
    padding: "px-3",
    text: "text-sm",
    icon: "w-5 h-5",
    iconPadding: "pl-7 pr-7",
    iconContainerPadding: "px-3",
  },
  md: {
    height: "h-[2.25rem]",
    padding: "px-4",
    text: "text-base",
    icon: "w-6 h-6",
    iconPadding: "pl-9 pr-9",
    iconContainerPadding: "px-4",
  },
  lg: {
    height: "h-[2.75rem]",
    padding: "px-5",
    text: "text-lg",
    icon: "w-7 h-7",
    iconPadding: "pl-10 pr-10",
    iconContainerPadding: "px-5",
  },
} as const;

const INPUT_VARIANTS = {
  default: "input-default",
  filled: "input-filled",
  bordered: "input-bordered",
} as const;

type InputSize = keyof typeof INPUT_SIZES;
type InputVariant = keyof typeof INPUT_VARIANTS;

const props = withDefaults(
  defineProps<{
    id?: string;
    type?: string;
    name?: string;
    placeholder?: string;
    size?: InputSize;
    variant?: InputVariant;
    block?: boolean;
    disabled?: boolean;
    inputClass?: string;
    error?: string;
  }>(),
  {
    type: "text",
    size: "sm",
    variant: "default",
    block: false,
    disabled: false,
  },
);

const slots = defineSlots<{
  iconLeft?(_: { class: string[] }): any;
  iconRight?(_: { class: string[] }): any;
}>();

const sizeConfig = computed(() => INPUT_SIZES[props.size] || INPUT_SIZES.md);

const inputClasses = computed(() => {
  const variantClass = INPUT_VARIANTS[props.variant];

  return [
    "input",
    props.inputClass,
    variantClass,
    sizeConfig.value.height,
    sizeConfig.value.text,
    slots.iconLeft && slots.iconRight
      ? sizeConfig.value.iconPadding
      : slots.iconLeft
        ? `pl-9 ${sizeConfig.value.padding}`
        : slots.iconRight
          ? `${sizeConfig.value.padding} pr-9`
          : sizeConfig.value.padding,
    {
      "input-block": props.block,
      "input-disabled": props.disabled,
      "input-error": props.error,
    },
  ];
});

const iconClasses = computed(() => [sizeConfig.value.icon]);

const iconLeftContainerClasses = computed(() => [
  "absolute",
  "inset-y-0",
  "left-0",
  "flex",
  "items-center",
  sizeConfig.value.iconContainerPadding.split(" ")[0],
]);

const iconRightContainerClasses = computed(() => [
  "absolute",
  "inset-y-0",
  "right-0",
  "flex",
  "items-center",
  sizeConfig.value.iconContainerPadding.split(" ")[1] ||
    sizeConfig.value.iconContainerPadding.split(" ")[0],
]);
</script>

<template>
  <div :class="{ 'w-full': block, 'pb-4': true }">
    <div class="relative">
      <span v-if="$slots.iconLeft" :class="iconLeftContainerClasses">
        <slot name="iconLeft" :class="iconClasses" />
      </span>
      <input
        :id="props.id"
        v-model="model"
        :type="props.type"
        :name="props.name"
        :class="inputClasses"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
      />
      <span v-if="$slots.iconRight" :class="iconRightContainerClasses">
        <slot name="iconRight" :class="iconClasses" />
      </span>

      <!-- Error icon -->
      <span
        v-if="props.error && !$slots.iconRight"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
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

    <!-- Error message -->
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
.input {
  @apply w-full transition-all duration-200 ease-in-out
         focus:outline-none focus:ring-2 focus:ring-offset-2;
  border-radius: var(--btn-border-radius);
  color: var(--color-input-text);
  --tw-ring-color: var(--color-input-focus);
  --tw-ring-offset-color: var(--color-focus-offset);
}

.input::placeholder {
  color: var(--color-input-placeholder);
}

.input-default {
  background-color: var(--color-input-bg);
  border: 1px solid transparent;
}

.input-default:focus {
  border-color: var(--color-primary);
}

.input-filled {
  background-color: var(--color-input-bg-alt);
  border: 1px solid transparent;
}

.input-filled:focus {
  border-color: var(--color-primary);
}

.input-bordered {
  background-color: transparent;
  border: 1px solid var(--color-input-border);
}

.input-bordered:focus {
  border-color: var(--color-primary);
}

.input-disabled {
  @apply cursor-not-allowed opacity-60;
  background-color: var(--color-btn-disabled-bg) !important;
  border-color: var(--color-btn-disabled-bg) !important;
  color: var(--color-btn-disabled-text) !important;
}

.input-error {
  border-color: var(--color-state-danger) !important;
  --tw-ring-color: var(--color-state-danger);
}

.input-block {
  @apply w-full;
}

/* date input */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

[data-theme="dark"] input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
}
</style>
