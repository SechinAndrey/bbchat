<script setup lang="ts">
import type { Component } from "vue";

const props = withDefaults(
  defineProps<{
    icon?: Component;
    title?: string;
    text?: string;
  }>(),
  {
    title: "",
    text: "",
  },
);
</script>

<template>
  <div
    class="flex flex-col justify-center items-center bg-app-bg p-6 rounded text-center"
  >
    <div
      v-if="props.icon"
      class="w-10 h-10 mr-4 mb-5 flex justify-center items-center rounded-full bg-secondary-lighter transition duration-500"
    >
      <component :is="props.icon" class="w-7 h-7 text-secondary" />
    </div>

    <p v-if="props.title" class="mb-3">
      {{ props.title }}
    </p>

    <p v-if="props.text" class="flex text-app-text-secondary">
      {{ props.text }}
    </p>
  </div>
</template>
