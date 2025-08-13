<script setup lang="ts">
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import IconButton from "@src/ui/inputs/IconButton.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import { computed } from "vue";

const model = defineModel<string>();

const props = defineProps<{
  variant?: string;
  class?: string;
  inputClass?: string;
  size?: "small" | "medium";
}>();

const iconClasses = computed(() => {
  const baseClasses =
    "w-5 h-5 mx-[8px] text-gray-400 dark:text-white dark:opacity-70";
  const translateY =
    props.size === "small" ? "translate-y-[50%]" : "translate-y-[75%]";
  return `${baseClasses} ${translateY}`;
});

const clearButtonClasses = computed(() => {
  const baseClasses = " p-2";
  const margin = props.size === "small" ? "m-[.25rem]" : "m-[.5rem]";
  return `${baseClasses} ${margin}`;
});
</script>

<template>
  <LabeledTextInput
    v-model="model"
    placeholder="Пошук.."
    :input-class="['px-7', props.inputClass].join(' ')"
    :size="props.size || 'medium'"
  >
    <template #startAdornment>
      <MagnifyingGlassIcon :class="iconClasses" />
    </template>
    <template #endAdornment>
      <IconButton
        v-if="model"
        title="clear text"
        aria-label="clear text"
        :class="clearButtonClasses"
        @click="model = ''"
      >
        <XCircleIcon class="w-5 h-5" />
      </IconButton>
    </template>
  </LabeledTextInput>
</template>
