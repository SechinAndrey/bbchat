<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    active?: boolean;
    variant?: "overlay" | "box";
    title: string;
    subtitle: string;
  }>(),
  {
    active: false,
    variant: "overlay",
  },
);

const containerClass = computed(() => {
  if (props.variant === "overlay") {
    return [
      "absolute inset-0 z-50 border-4 border-dashed border-primary",
      "bg-primary/10 backdrop-blur-sm pointer-events-none",
      "flex items-center justify-center",
    ];
  }

  return [
    "border-2 border-dashed rounded-md cursor-pointer transition-all duration-200 backdrop-blur-sm",
    props.active
      ? "border-primary bg-primary/10 shadow-sm"
      : "border-app-border bg-app-bg-secondary",
  ];
});
</script>

<template>
  <div :class="containerClass">
    <slot>
      <div :class="['text-center', { 'blur-sm': props.active }]">
        <div class="text-2xl font-bold text-primary mb-2">
          {{ title }}
        </div>
        <div class="text-sm text-app-text-secondary">
          {{ subtitle }}
        </div>
      </div>
    </slot>
  </div>
</template>
