<script setup lang="ts">
import type { Component } from "vue";

const props = defineProps<{
  icon: Component;
  title: string;
  notifications?: number;
  active?: boolean;
}>();

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();
</script>

<template>
  <div class="xs:mb-0 md:mb-6">
    <button
      class="relative block focus:outline-none"
      :title="props.title"
      :aria-label="
        props.notifications
          ? props.title + ' ' + props.notifications + ' нові сповіщення'
          : props.title
      "
      @click="emit('click', $event)"
    >
      <!--icon-->
      <component
        :is="props.icon"
        class="w-7 h-6 hover:text-primary-lighter text-[var(--color-sidebar-btn-text)] active:scale-110 transition ease-out duration-200"
        :class="{ 'text-primary dark:text-primary': props.active as boolean }"
      />

      <!--notification pill-->
      <div
        v-if="props.notifications"
        class="absolute right-0 top-3 w-5 h-5 flex items-center justify-center outline-none bg-primary text-white border border-white rounded-full transition duration-500"
      >
        {{ props.notifications }}
      </div>
    </button>
  </div>
</template>
