<template>
  <div
    class="xs:w-6 xs:h-6 md:w-auto md:h-auto md:bg-cbg-10 md:p-3 rounded-[0.23rem] group-focus:text-primary hover:text-primary-hover active:text-primary-active active:scale-110 transition ease-out duration-200"
    :class="
      active
        ? 'text-primary-hover'
        : [
            'xs:text-neutral-active',
            `md:${textColor}`,
            `xs:dark:text-neutral-active`,
            `md:dark:${textColor}`,
          ]
    "
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
    textColor: {
      type: String,
      default: "text-white",
    },
  },
};
</script>
