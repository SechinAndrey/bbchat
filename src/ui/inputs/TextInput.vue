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
  <div class="relative" :class="{ 'w-full': block }">
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
  </div>
</template>

<style scoped>
.input {
  @apply w-full transition-all duration-200 ease-in-out
         focus:outline-none focus:ring-2 focus:ring-offset-2;
  border-radius: var(--btn-border-radius);
  color: var(--color-input-text);
  --tw-ring-color: var(--color-input-focus);
  --tw-ring-offset-color: var(--color-input-focus-offset);
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

.input-block {
  @apply w-full;
}
</style>
