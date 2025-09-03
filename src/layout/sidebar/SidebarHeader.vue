<template>
  <div
    class="w-full md:min-h-[5rem] max-h-fit px-5 py-3 md:py-6 flex justify-between items-center"
  >
    <p tabindex="0" class="outline-none">
      <slot name="title"></slot>
    </p>

    <div>
      <slot name="actions"></slot>
    </div>
  </div>
</template>
