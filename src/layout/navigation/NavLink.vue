<script setup lang="ts">
import type { Component } from "vue";

const props = defineProps<{
  icon: Component;
  title: string;
  notifications?: number;
  active?: boolean;
}>();
</script>

<template>
  <div class="xs:mb-0 md:mb-6">
    <button
      class="group relative focus:outline-none"
      :title="props.title"
      :aria-label="
        props.notifications
          ? props.title + ' ' + props.notifications + ' new notifications'
          : props.title
      "
    >
      <!--icon-->
      <component
        :is="props.icon"
        class="w-7 h-6 group-focus:text-primary hover:text-primary-hover active:text-primary-active active:scale-110 transition ease-out duration-200"
        :class="
          (props.active as boolean)
            ? ['text-primary', 'dark:text-primary']
            : ['text-neutral-active']
        "
      />

      <!--notification pill-->
      <div
        v-if="props.notifications"
        class="absolute right-0 top-3 w-5 h-5 flex items-center justify-center outline-none bg-primary text-white border border-white dark:border-neutral rounded-full transition duration-500"
      >
        {{ props.notifications }}
      </div>
    </button>
  </div>
</template>
