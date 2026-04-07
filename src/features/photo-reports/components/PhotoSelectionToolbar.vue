<script setup lang="ts">
import { inject } from "vue";
import Button from "@src/ui/inputs/Button.vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { CameraIcon } from "@heroicons/vue/24/solid";
import {
  photoSelectionKey,
  type PhotoSelectionContext,
} from "@src/features/photo-reports/composables/usePhotoSelection";

const photoSelection = inject<PhotoSelectionContext>(photoSelectionKey)!;

const emit = defineEmits<{
  openAssignModal: [];
}>();
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-3 bg-app-bg-secondary border-l-4 border-primary"
  >
    <CameraIcon class="w-5 h-5 text-primary flex-shrink-0" />

    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium text-app-text">
        Обрано: {{ photoSelection.selectedCount.value }} фото
      </div>
    </div>

    <Button
      size="xs"
      variant="primary"
      :disabled="photoSelection.selectedCount.value === 0"
      @click="emit('openAssignModal')"
    >
      Присвоїти фотозвіт
    </Button>

    <Button
      variant="ghost"
      size="xs"
      icon-only
      :ring="false"
      @click="photoSelection.exitSelectionMode()"
    >
      <template #icon>
        <XMarkIcon class="w-5 h-5" />
      </template>
    </Button>
  </div>
</template>
