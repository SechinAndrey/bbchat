<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/solid";

const props = defineProps<{
  open: boolean;
  imageUrls: string[];
  startingIndex?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const currentIndex = ref(0);
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.startingIndex !== undefined) {
      currentIndex.value = props.startingIndex;
    }
  },
);

const currentImageUrl = computed(() => {
  return props.imageUrls[currentIndex.value] || "";
});

const goToPrevious = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const goToNext = () => {
  if (currentIndex.value < props.imageUrls.length - 1) {
    currentIndex.value++;
  }
};

const canGoPrevious = computed(() => currentIndex.value > 0);
const canGoNext = computed(
  () => currentIndex.value < props.imageUrls.length - 1,
);

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    emit("close");
  } else if (event.key === "ArrowLeft") {
    goToPrevious();
  } else if (event.key === "ArrowRight") {
    goToNext();
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeydown);
    } else {
      document.removeEventListener("keydown", handleKeydown);
    }
  },
);
</script>

<template>
  <!-- Modal Overlay -->
  <div
    v-if="open && imageUrls.length > 0"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
    @click="emit('close')"
  >
    <!-- Close Button -->
    <button
      class="absolute top-4 right-4 z-60 p-2 text-white hover:text-gray-300 transition-colors"
      aria-label="Закрити"
      @click="emit('close')"
    >
      <XMarkIcon class="h-6 w-6" />
    </button>

    <!-- Navigation Buttons -->
    <button
      v-if="canGoPrevious"
      class="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 p-3 text-white hover:text-gray-300 hover:bg-black hover:bg-opacity-50 rounded-full transition-all"
      aria-label="Попереднє зображення"
      @click.stop="goToPrevious"
    >
      <ChevronLeftIcon class="h-8 w-8" />
    </button>

    <button
      v-if="canGoNext"
      class="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 p-3 text-white hover:text-gray-300 hover:bg-black hover:bg-opacity-50 rounded-full transition-all"
      aria-label="Наступне зображення"
      @click.stop="goToNext"
    >
      <ChevronRightIcon class="h-8 w-8" />
    </button>

    <!-- Image Content -->
    <div
      class="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
      @click.stop
    >
      <img
        :src="currentImageUrl"
        alt="Зображення"
        class="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
        style="opacity: 0; transition: opacity 0.3s ease"
        @load="($event.target as HTMLImageElement).style.opacity = '1'"
      />
    </div>

    <!-- Image Counter -->
    <div
      v-if="imageUrls.length > 1"
      class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm"
    >
      {{ currentIndex + 1 }} / {{ imageUrls.length }}
    </div>
  </div>
</template>
