<template>
  <div
    :class="[
      'p-3 rounded-[0.23rem]',
      'md:bg-[var(--color-sidebar-btn-bg)]',
      'hover:text-primary-lighter active:text-primary active:scale-110',
      'transition ease-out duration-200 cursor-pointer',
      active ? 'text-primary' : 'text-[var(--color-sidebar-btn-text)]',
    ]"
  >
    <slot></slot>
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
  },
};
</script>
