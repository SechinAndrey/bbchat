<script setup lang="ts">
const props = defineProps<{
  active: boolean;
  name: string;
}>();
</script>

<template>
  <button
    class="p-3 flex-1 rounded-sm outline-none focus:outline-none transition-all duration-200"
    :class="
      props.active
        ? ['bg-primary', 'text-white']
        : ['text-theme-text', 'opacity-60']
    "
  >
    <p class="body-5">{{ props.name }}</p>
  </button>
</template>
