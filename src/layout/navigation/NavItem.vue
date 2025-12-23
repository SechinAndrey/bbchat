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
      v-if="unreadCount && unreadCount > 0"
      :class="[
        'absolute -top-1 -right-1',
        'min-w-[1.125rem] h-[1.125rem] px-1',
        'bg-secondary text-white',
        'rounded-full',
        'flex items-center justify-center',
        'text-[0.625rem] font-semibold leading-none',
      ]"
    >
      {{ unreadCount > 99 ? "99+" : unreadCount }}
    </span>
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
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
};
</script>
