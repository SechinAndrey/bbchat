<script setup lang="ts">
import Modal from "@src/ui/modals/Modal.vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import type { ApiSelection } from "@src/api/types";
import SelectionTable from "@src/features/selections/SelectionTable.vue";

const props = defineProps<{
  open: boolean;
  selection: ApiSelection | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const close = () => {
  emit("close");
};
</script>

<template>
  <Modal :open="props.open" :close-modal="close" no-padding>
    <template #content>
      <div
        class="h-full w-full relative overflow-hidden bg-app-bg transition-all"
      >
        <!-- modal header -->
        <div
          class="flex items-center justify-between p-[1.25rem] border-b border-app-border"
        >
          <h2 class="text-2xl">ID {{ props.selection?.id }}</h2>
          <button
            class="text-app-text hover:text-app-text-hover"
            @click="close"
          >
            <span class="sr-only">Close</span>
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <SelectionTable
          v-if="props.selection?.boards_list"
          :selection-items="props.selection?.boards_list"
        />
      </div>
    </template>
  </Modal>
</template>
