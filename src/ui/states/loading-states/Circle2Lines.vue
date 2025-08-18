<template>
  <div class="w-full flex px-5 py-6 mb-3">
    <div class="mr-4">
      <div class="w-7 h-7 rounded-full animate-pulse skeleton-bg"></div>
    </div>

    <div class="grow">
      <div class="w-12 h-3 rounded-full mb-4 animate-pulse skeleton-bg"></div>
      <div
        class="xs:w-full md:w-13 h-3 rounded-full animate-pulse skeleton-bg"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-bg {
  background-color: var(--color-skeleton);
}
</style>
