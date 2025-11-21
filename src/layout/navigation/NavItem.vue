<template>
  <div
    :class="[
      'p-3 rounded-[0.23rem] relative',
      'bg-[var(--color-sidebar-btn-bg)]',
      'hover:text-primary-lighter active:text-primary active:scale-110',
      'transition ease-out duration-200 cursor-pointer',
      active ? 'text-primary' : 'text-[var(--color-sidebar-btn-text)]',
    ]"
  >
    <slot></slot>
    <span
      v-if="showIndicator"
      class="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"
    ></span>
  </div>
</template>

<script>
export default {
  name: "NavItem",
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    showIndicator: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
