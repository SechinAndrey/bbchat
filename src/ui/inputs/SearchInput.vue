<script setup lang="ts">
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import IconButton from "@src/ui/inputs/IconButton.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";

const model = defineModel<string>();

defineProps<{
  variant?: string;
  class?: string;
}>();
</script>

<template>
  <LabeledTextInput v-model="model" placeholder="Пошук.." input-class="px-7">
    <template #startAdornment>
      <MagnifyingGlassIcon
        class="w-5 h-5 mx-[8px] translate-y-[75%] text-gray-400 dark:text-white dark:opacity-70"
      />
    </template>
    <template #endAdornment>
      <IconButton
        v-if="model"
        title="clear text"
        aria-label="clear text"
        class="ic-btn-ghost-gray m-[.5rem] p-2"
        @click="model = ''"
      >
        <XCircleIcon class="w-5 h-5" />
      </IconButton>
    </template>
  </LabeledTextInput>
</template>
