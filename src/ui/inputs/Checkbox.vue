<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/24/outline";

defineProps<{
  modelValue: boolean;
}>();
</script>

<template>
  <div class="relative flex h-5 w-5 items-center justify-center">
    <div
      class="h-5 w-5 appearance-none rounded-[.3125rem] border border-primary outline-none transition-all duration-300"
      :class="{ 'bg-primary': modelValue }"
    ></div>
    <CheckIcon
      v-if="modelValue"
      class="pointer-events-none absolute h-4 w-4 text-white"
    />
  </div>
</template>
