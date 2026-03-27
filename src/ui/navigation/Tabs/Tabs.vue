<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    gap?: number;
  }>(),
  {
    gap: 1,
  },
);
</script>

<template>
  <div
    :class="`flex content-stretch gap-${props.gap} p-2 rounded-sm bg-app-bg`"
  >
    <slot></slot>
  </div>
</template>
