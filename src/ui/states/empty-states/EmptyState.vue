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
  <div class="flex flex-col justify-center items-center">
    <div
      v-if="props.icon"
      class="w-10 h-10 mr-4 mb-5 flex justify-center items-center rounded-full bg-secondary transition duration-500"
    >
      <component :is="props.icon" class="w-7 h-7 text-secondary-active" />
    </div>

    <p v-if="props.title" class="heading-2 text-color mb-3">
      {{ props.title }}
    </p>

    <p v-if="props.text" class="body-2 text-color flex">{{ props.text }}</p>
  </div>
</template>
