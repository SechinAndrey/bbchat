<script setup lang="ts">
import { ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";

const props = withDefaults(
  defineProps<{
    title?: string;
    text?: string;
  }>(),
  {
    title: "Чат не вибрано",
    text: "Виберіть розмову з меню розмов.",
  },
);
</script>

<template>
  <div class="h-full flex flex-col justify-center items-center">
    <div
      class="w-10 h-10 mr-4 mb-5 flex justify-center items-center rounded-full bg-secondary transition duration-500"
    >
      <ChatBubbleLeftRightIcon class="w-7 h-7 text-secondary-active" />
    </div>

    <p class="mb-3">{{ props.title }}</p>

    <p class="flex">{{ props.text }}</p>
  </div>
</template>
