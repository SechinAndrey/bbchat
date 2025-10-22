<script setup lang="ts">
import Modal from "./Modal.vue";
import Button from "@src/ui/inputs/Button.vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
const props = defineProps<{
  open: boolean;
  showIcon?: boolean;
  title?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
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
      <div class="w-full max-w-md bg-app-bg rounded-lg p-6 shadow-xl">
        <!-- Header with Icon -->
        <div class="flex items-center gap-3 mb-4">
          <div v-if="props.showIcon" class="flex-shrink-0">
            <slot name="icon">
              <ExclamationTriangleIcon class="h-6 w-6 text-danger" />
            </slot>
          </div>
          <h2 class="text-lg text-app-text">
            <slot name="header">
              {{ props.title }}
            </slot>
          </h2>
        </div>

        <!-- Description -->
        <p class="text-left text-sm text-app-text-secondary mb-6">
          <slot name="body">
            {{ props.text }}
          </slot>
        </p>

        <!-- Action buttons -->
        <div class="flex justify-end gap-3">
          <Button variant="text" @click="handleCancel">
            {{ props.cancelText || "Скасувати" }}
          </Button>
          <Button
            variant="danger"
            :loading="props.isLoading"
            @click="handleConfirm"
          >
            {{ props.confirmText || "Підтвердити" }}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
