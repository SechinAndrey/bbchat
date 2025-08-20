<script setup lang="ts">
import Modal from "@src/ui/modals/Modal.vue";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/vue/24/outline";
import type { ApiSelection } from "@src/api/types";
import SelectionTable from "@src/features/selections/SelectionTable.vue";
import Button from "@src/ui/inputs/Button.vue";
import apiClient from "@src/api/axios-instance";

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

const download = async () => {
  if (!props.selection?.id) return;
  try {
    const response = await apiClient.post(
      `/selections/${props.selection.id}/export`,
    );
    const fileUrl = response.data?.link;
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", `selection_${props.selection.id}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      console.error("Download link not found in response");
    }
  } catch (error) {
    console.error("Download failed", error);
  }
};
</script>

<template>
  <Modal :open="props.open" :close-modal="close" no-padding>
    <template #content>
      <div
        class="h-full w-full relative overflow-hidden bg-app-bg transition-all z-21"
      >
        <!-- Modal header -->
        <div
          class="flex items-center justify-between p-[1.25rem] border-b border-app-border"
        >
          <h2 class="text-2xl">ID {{ props.selection?.id }}</h2>
          <button
            class="text-app-text hover:text-app-text-hover"
            @click="close"
          >
            <span class="sr-only">Закрити</span>
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <SelectionTable
          v-if="props.selection?.boards_list"
          :selection-id="props.selection.id"
          :selection-items="props.selection?.boards_list"
        />

        <div
          class="flex fixed bottom-0 left-0 right-0 z-2 bg-app-bg py-4 px-[1.25rem] shadow-up"
        >
          <Button variant="text" @click="download">
            <ArrowDownTrayIcon class="h-6 w-6 inline-block mr-1" /> Завантажити
            в .xls
          </Button>

          <Button variant="text">
            <EyeIcon class="h-6 w-6 inline-block mr-1" />Додати до спостереження
          </Button>

          <Button variant="text">
            <EyeSlashIcon class="h-6 w-6 inline-block mr-1" />Прибрати із
            спостереження
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
