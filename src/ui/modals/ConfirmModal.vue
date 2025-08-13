<script setup lang="ts">
import Modal from "./Modal.vue";
import Button from "@src/ui/inputs/Button.vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
const props = defineProps<{
  open: boolean;
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <Modal :open="props.open" :close-modal="handleCancel">
    <template #content>
      <div
        class="relative transform overflow-hidden rounded-lg bg-theme-surface px-6 py-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
      >
        <div>
          <p class="flex text-lg font-medium leading-6 text-theme-text mb-2">
            <ExclamationTriangleIcon class="h-6 w-6 text-danger-active mr-4" />
            {{ props.title }}
          </p>
          <p class="text-sm text-theme-t-alt">
            {{ props.text }}
          </p>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <Button size="small" class="" @button-clicked="handleCancel">
            {{ props.cancelText || "Скасувати" }}
          </Button>
          <Button size="small" class="" @button-clicked="handleConfirm">
            {{ props.confirmText || "Підтвердити" }}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
