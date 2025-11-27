<template>
  <div
    class="w-full max-h-fit px-5 py-3 md:pt-5 md:pb-3 flex justify-between items-center"
  >
    <p tabindex="0" class="outline-none">
      <slot name="title"></slot>
    </p>

    <div>
      <slot name="actions"></slot>
    </div>
  </div>
</template>
