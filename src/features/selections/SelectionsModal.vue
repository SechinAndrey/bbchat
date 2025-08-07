<script setup lang="ts">
import { watch } from "vue";
import Modal from "@src/ui/modals/Modal.vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  open: boolean;
  selectionId: number | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const close = () => {
  emit("close");
};

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      // fetch selection boards
    }
  },
);
</script>

<template>
  <Modal :open="props.open" :close-modal="close" no-padding>
    <template #content>
      <div
        class="h-full w-full relative overflow-hidden bg-theme-surface transition-all"
      >
        <!-- modal header -->
        <div
          class="flex items-center justify-between p-4 border-b border-theme-border"
        >
          <h2 class="text-2xl">ID {{ selectionId }}</h2>
          <button
            class="text-theme-text hover:text-theme-text-hover"
            @click="close"
          >
            <span class="sr-only">Close</span>
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>
